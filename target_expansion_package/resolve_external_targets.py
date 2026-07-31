#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Resolve structures for externally curated targets (for example IEDB/UniProt
pathogen antigens) and emit a downloader-compatible manifest.

Input CSV columns:
  target_id,target_name,uniprot,organism,disease_indications,priority,
  preferred_pdb,preferred_scope,action,notes

When preferred_pdb is provided it is retained as candidate rank 1. Otherwise
the script queries RCSB by UniProt and falls back to AlphaFold DB.
"""
from __future__ import annotations

import argparse
import csv
import json
import re
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Any

from build_full_target_manifest import (
    lookup_alphafold,
    lookup_rcsb,
    sanitize_filename,
    write_csv,
)


def read_csv(path: Path) -> list[dict[str, str]]:
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def split_pdbs(value: str) -> list[str]:
    out: list[str] = []
    for token in re.split(r"[,;|\s]+", value or ""):
        pdb_id = token.strip().upper()
        if re.fullmatch(r"[0-9][A-Z0-9]{3}", pdb_id) and pdb_id not in out:
            out.append(pdb_id)
    return out


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", type=Path, required=True)
    parser.add_argument("--outdir", type=Path, default=Path("external_target_structures"))
    parser.add_argument("--max-pdb-candidates", type=int, default=5)
    parser.add_argument("--workers", type=int, default=6)
    args = parser.parse_args()
    args.outdir.mkdir(parents=True, exist_ok=True)

    source_rows = read_csv(args.input)
    cache: dict[str, Any] = {}
    accessions = sorted({
        (row.get("uniprot") or "").strip()
        for row in source_rows
        if (row.get("uniprot") or "").strip()
        and not split_pdbs(row.get("preferred_pdb") or "")
    })

    with ThreadPoolExecutor(max_workers=max(1, args.workers)) as pool:
        futures = {
            pool.submit(lookup_rcsb, accession, args.max_pdb_candidates): accession
            for accession in accessions
        }
        for future in as_completed(futures):
            accession = futures[future]
            try:
                candidates = future.result()
            except Exception as exc:
                cache[accession] = {
                    "rcsb_candidates": [],
                    "alphafold": None,
                    "error": f"{type(exc).__name__}: {exc}",
                }
                continue
            if candidates:
                cache[accession] = {"rcsb_candidates": candidates, "alphafold": None}
            else:
                try:
                    af = lookup_alphafold(accession)
                except Exception as exc:
                    af = None
                    error = f"{type(exc).__name__}: {exc}"
                else:
                    error = ""
                cache[accession] = {
                    "rcsb_candidates": [],
                    "alphafold": af,
                    "error": error,
                }

    target_rows: list[dict[str, Any]] = []
    manifest_rows: list[dict[str, Any]] = []
    unresolved: list[dict[str, Any]] = []

    for row in source_rows:
        target_id = (row.get("target_id") or "").strip()
        target_name = (row.get("target_name") or target_id).strip()
        uniprot = (row.get("uniprot") or "").strip()
        priority = (row.get("priority") or "P1").strip()
        preferred = split_pdbs(row.get("preferred_pdb") or "")
        scope = (row.get("preferred_scope") or "").strip()
        action = (row.get("action") or "").strip().upper()
        payload = cache.get(uniprot, {})
        candidates = list(payload.get("rcsb_candidates") or [])
        af = payload.get("alphafold") or {}

        # Prepend curator-provided PDB entries and deduplicate.
        curated = [
            {
                "pdb_id": pdb_id,
                "method": "CURATOR_SELECTED",
                "resolution": "",
                "release_date": "",
            }
            for pdb_id in preferred
        ]
        seen: set[str] = set()
        merged: list[dict[str, Any]] = []
        for item in curated + candidates:
            pdb_id = str(item.get("pdb_id") or "").upper()
            if pdb_id and pdb_id not in seen:
                seen.add(pdb_id)
                merged.append(item)

        status = (
            "EXPERIMENTAL_RCSB"
            if merged
            else ("PREDICTED_ALPHAFOLD" if af else "NO_STRUCTURE_FOUND")
        )
        rep = merged[0] if merged else {}
        target_rows.append(
            {
                **row,
                "structure_status": status,
                "representative_pdb": rep.get("pdb_id", ""),
                "pdb_candidates": ";".join(x.get("pdb_id", "") for x in merged),
                "representative_mmcif_url": (
                    f"https://files.rcsb.org/download/{rep.get('pdb_id')}.cif.gz"
                    if rep.get("pdb_id")
                    else ""
                ),
                "alphafold_pdb_url": af.get("pdb_url", ""),
                "alphafold_cif_url": af.get("cif_url", ""),
                "manual_scope_review_required": "YES" if merged else "",
            }
        )

        if merged:
            for rank, candidate in enumerate(merged, start=1):
                pdb_id = candidate["pdb_id"]
                enabled = (
                    "NO"
                    if action in {"NO_EXPERIMENTAL_PDB", "DOWNLOAD_EPITOPE_ONLY"}
                    and rank > 1
                    else "YES"
                )
                manifest_rows.append(
                    {
                        "candidate_rank": rank,
                        "structure_source": "RCSB",
                        "structure_id": pdb_id,
                        "download_url": f"https://files.rcsb.org/download/{pdb_id}.cif.gz",
                        "filename": (
                            f"{sanitize_filename(target_id or target_name)}"
                            f"-RCSB-{pdb_id}.cif.gz"
                        ),
                        "priority": priority,
                        "enabled_default": enabled,
                        "structure_scope": scope,
                        "review_note": (
                            "Curator-preferred entry." if pdb_id in preferred
                            else "Auto-resolved by UniProt; verify organism, chain and antigen scope."
                        ),
                        "target_id": target_id,
                        "target_name": target_name,
                        "top_indications": row.get("disease_indications", ""),
                        "requires_scope_review": "YES",
                    }
                )
        elif af:
            url = af.get("cif_url") or af.get("pdb_url") or ""
            if url:
                ext = ".cif" if af.get("cif_url") else ".pdb"
                manifest_rows.append(
                    {
                        "candidate_rank": 1,
                        "structure_source": "ALPHAFOLD",
                        "structure_id": uniprot,
                        "download_url": url,
                        "filename": (
                            f"{sanitize_filename(target_id or target_name)}"
                            f"-AF-{sanitize_filename(uniprot)}{ext}"
                        ),
                        "priority": priority,
                        "enabled_default": "NO",
                        "structure_scope": "predicted full-length model",
                        "review_note": "Prediction only; inspect pLDDT/PAE before modelling.",
                        "target_id": target_id,
                        "target_name": target_name,
                        "top_indications": row.get("disease_indications", ""),
                        "requires_scope_review": "YES",
                    }
                )
        else:
            unresolved.append({**row, "reason": payload.get("error") or "No RCSB/AlphaFold structure"})

    write_csv(args.outdir / "external_target_structures.csv", target_rows)
    write_csv(args.outdir / "external_download_manifest.csv", manifest_rows)
    write_csv(args.outdir / "external_unresolved.csv", unresolved)
    (args.outdir / "structure_cache.json").write_text(
        json.dumps(cache, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(
        json.dumps(
            {
                "targets": len(target_rows),
                "manifest_rows": len(manifest_rows),
                "unresolved": len(unresolved),
            },
            ensure_ascii=False,
            indent=2,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
