#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generate a complete human disease-target expansion manifest from the Open Targets
Platform public data release, compare it with the local structure catalogue, and
resolve experimental RCSB PDB structures with AlphaFold DB fallback.

Authoritative inputs:
- Open Targets public release on AWS S3
- RCSB Search API + Data API
- AlphaFold DB prediction API

The default scope is ALL direct target-disease associations for human
protein-coding targets. UniProt is retained when available for structure
resolution; targets without a UniProt mapping remain in the pair/target tables
and are explicitly marked unresolved rather than silently discarded.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import os
import re
import sys
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable

try:
    import polars as pl
    import requests
except ImportError as exc:
    raise SystemExit(
        "Missing dependency. Install with: pip install polars requests"
    ) from exc

OT_BUCKET = "s3://open-targets-public-data-releases/platform/{release}/output"
RCSB_SEARCH = "https://search.rcsb.org/rcsbsearch/v2/query"
RCSB_ENTRY = "https://data.rcsb.org/rest/v1/core/entry/{pdb_id}"
ALPHAFOLD_API = "https://alphafold.ebi.ac.uk/api/prediction/{uniprot}"
DEFAULT_RELEASE = "26.06"

_LOCK = threading.Lock()


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def clean_token(value: str) -> str:
    return re.sub(r"[^A-Za-z0-9-]", "", (value or "")).upper()


def split_tokens(value: str) -> set[str]:
    return {
        clean_token(part)
        for part in re.split(r"[/,;|、]+", value or "")
        if clean_token(part)
    }


def parse_markdown_table(text: str, heading: str) -> list[dict[str, str]]:
    pos = text.find(heading)
    if pos < 0:
        return []
    lines = text[pos + len(heading) :].splitlines()
    table_lines: list[str] = []
    started = False
    for line in lines:
        if line.startswith("|"):
            started = True
            table_lines.append(line)
        elif started:
            break
    if len(table_lines) < 3:
        return []
    headers = [x.strip() for x in table_lines[0].strip("|").split("|")]
    rows: list[dict[str, str]] = []
    for line in table_lines[2:]:
        values = [x.strip() for x in line.strip("|").split("|")]
        if len(values) >= len(headers):
            rows.append(dict(zip(headers, values[: len(headers)])))
    return rows


def parse_local_catalog(path: Path) -> dict[str, Any]:
    text = path.read_text(encoding="utf-8")
    route_rows = parse_markdown_table(text, "## 完整靶点列表")
    asset_rows = parse_markdown_table(text, "## 库资产 (Library Assets)")

    route_gene_tokens: set[str] = set()
    route_all_tokens: set[str] = set()
    for row in route_rows:
        route_gene_tokens |= split_tokens(row.get("gene", ""))
        for key in ("靶点名称 (promptLabel)", "target", "gene", "别名"):
            route_all_tokens |= split_tokens(row.get(key, ""))

    alias_to_route = {
        "TNFSF7": "CD70",
    }

    asset_only: list[dict[str, str]] = []
    asset_gene_tokens: set[str] = set()
    asset_all_tokens: set[str] = set()
    for row in asset_rows:
        if row.get("状态") != "asset_only":
            continue
        gene = clean_token(row.get("gene", ""))
        asset_gene_tokens.add(gene)
        for key in ("target", "gene", "别名"):
            asset_all_tokens |= split_tokens(row.get(key, ""))
        already = (
            gene in route_all_tokens
            or alias_to_route.get(gene, "") in route_all_tokens
        )
        asset_only.append(
            {
                "target": row.get("target", ""),
                "gene": gene,
                "aliases": row.get("别名", ""),
                "organism": row.get("物种", ""),
                "pdb_id": row.get("PDB ID", "").upper(),
                "filename": row.get("文件名", ""),
                "route_status": "ALREADY_ROUTED_ALIAS" if already else "PROMOTE_ROUTE",
                "suggested_action": (
                    "keep local; no download"
                    if already
                    else "promote existing asset_only structure into formal target route; no download"
                ),
            }
        )

    return {
        "route_rows": route_rows,
        "asset_rows": asset_rows,
        "route_gene_tokens": route_gene_tokens,
        "route_all_tokens": route_all_tokens,
        "asset_gene_tokens": asset_gene_tokens,
        "asset_all_tokens": asset_all_tokens,
        "asset_only": asset_only,
    }


def scan_ot_dataset(base: str, dataset: str) -> pl.LazyFrame:
    path = f"{base}/{dataset}/*.parquet"
    candidates = [
        {"skip_signature": True, "region": "eu-west-1"},
        {"aws_skip_signature": "true", "aws_region": "eu-west-1"},
    ]
    last_exc: Exception | None = None
    for storage_options in candidates:
        try:
            frame = pl.scan_parquet(path, storage_options=storage_options)
            # Force schema discovery so credentials/options errors occur here.
            frame.collect_schema()
            return frame
        except Exception as exc:  # pragma: no cover - depends on runtime/backend
            last_exc = exc
    raise RuntimeError(f"Unable to read Open Targets dataset: {path}") from last_exc


def extract_uniprot(protein_ids: Any) -> str:
    if not protein_ids:
        return ""
    preferred: list[str] = []
    fallback: list[str] = []
    for item in protein_ids:
        if not isinstance(item, dict):
            continue
        accession = str(item.get("id") or "").strip()
        source = str(item.get("source") or "").lower()
        if not accession:
            continue
        if "uniprot" in source and ("swiss" in source or "reviewed" in source):
            preferred.append(accession)
        elif "uniprot" in source:
            fallback.append(accession)
    values = preferred or fallback
    return values[0] if values else ""


def write_csv(path: Path, rows: Iterable[dict[str, Any]], fieldnames: list[str] | None = None) -> None:
    rows = list(rows)
    if not rows and not fieldnames:
        path.write_text("", encoding="utf-8")
        return
    if fieldnames is None:
        keys: list[str] = []
        seen: set[str] = set()
        for row in rows:
            for key in row:
                if key not in seen:
                    seen.add(key)
                    keys.append(key)
        fieldnames = keys
    with path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def request_json(
    method: str,
    url: str,
    *,
    json_body: dict[str, Any] | None = None,
    timeout: float = 40.0,
    attempts: int = 5,
) -> Any:
    headers = {
        "User-Agent": "ZoonoAI-target-structure-manifest/1.0",
        "Accept": "application/json",
    }
    delay = 1.0
    for attempt in range(1, attempts + 1):
        try:
            response = requests.request(
                method,
                url,
                json=json_body,
                headers=headers,
                timeout=timeout,
            )
            if response.status_code in (204, 404):
                return None
            if response.status_code in (429, 500, 502, 503, 504):
                raise RuntimeError(f"retryable HTTP {response.status_code}")
            response.raise_for_status()
            return response.json()
        except Exception:
            if attempt >= attempts:
                raise
            time.sleep(delay)
            delay = min(delay * 2, 20.0)
    return None


def entry_metadata(pdb_id: str) -> dict[str, Any]:
    payload = request_json("GET", RCSB_ENTRY.format(pdb_id=pdb_id))
    if not payload:
        return {
            "pdb_id": pdb_id,
            "method": "",
            "resolution": None,
            "release_date": "",
        }
    resolutions = (payload.get("rcsb_entry_info") or {}).get("resolution_combined") or []
    resolution = None
    if resolutions:
        numeric = [float(x) for x in resolutions if x is not None]
        resolution = min(numeric) if numeric else None
    methods = [
        str(item.get("method") or "")
        for item in (payload.get("exptl") or [])
        if isinstance(item, dict)
    ]
    release_date = (payload.get("rcsb_accession_info") or {}).get("initial_release_date") or ""
    return {
        "pdb_id": pdb_id.upper(),
        "method": "; ".join(x for x in methods if x),
        "resolution": resolution,
        "release_date": release_date,
    }


def lookup_rcsb(uniprot: str, max_candidates: int) -> list[dict[str, Any]]:
    query = {
        "query": {
            "type": "terminal",
            "service": "text",
            "parameters": {
                "attribute": (
                    "rcsb_polymer_entity_container_identifiers."
                    "reference_sequence_identifiers.database_accession"
                ),
                "operator": "exact_match",
                "value": uniprot,
            },
        },
        "return_type": "entry",
        "request_options": {
            "paginate": {"start": 0, "rows": max(20, max_candidates * 4)},
            "results_content_type": ["experimental"],
        },
    }
    payload = request_json("POST", RCSB_SEARCH, json_body=query)
    if not payload:
        return []
    ids: list[str] = []
    for item in payload.get("result_set") or []:
        pdb_id = str(item.get("identifier") or "").split("_", 1)[0].upper()
        if pdb_id and pdb_id not in ids:
            ids.append(pdb_id)
    candidates: list[dict[str, Any]] = []
    for pdb_id in ids[: max(20, max_candidates * 4)]:
        try:
            candidates.append(entry_metadata(pdb_id))
        except Exception:
            candidates.append(
                {"pdb_id": pdb_id, "method": "", "resolution": None, "release_date": ""}
            )

    method_rank = {
        "X-RAY DIFFRACTION": 0,
        "ELECTRON MICROSCOPY": 1,
        "SOLID-STATE NMR": 2,
        "SOLUTION NMR": 3,
    }

    def rank(item: dict[str, Any]) -> tuple[float, float, str]:
        method = str(item.get("method") or "").upper()
        m_rank = min(
            (rank for name, rank in method_rank.items() if name in method),
            default=9,
        )
        resolution = item.get("resolution")
        r_value = float(resolution) if resolution is not None else 99.0
        # High-resolution domains can outrank full-length structures. We keep
        # several candidates and explicitly require downstream scope review.
        return (m_rank, r_value, str(item.get("release_date") or ""))

    candidates.sort(key=rank)
    return candidates[:max_candidates]


def lookup_alphafold(uniprot: str) -> dict[str, Any] | None:
    payload = request_json("GET", ALPHAFOLD_API.format(uniprot=uniprot))
    if not payload:
        return None
    records = payload if isinstance(payload, list) else [payload]
    if not records:
        return None
    record = records[0]
    return {
        "pdb_url": record.get("pdbUrl") or "",
        "cif_url": record.get("cifUrl") or "",
        "pae_url": record.get("paeDocUrl") or record.get("paeImageUrl") or "",
        "model_version": record.get("latestVersion") or record.get("modelVersion") or "",
        "sequence_start": record.get("sequenceStart") or record.get("uniprotStart") or "",
        "sequence_end": record.get("sequenceEnd") or record.get("uniprotEnd") or "",
    }


def resolve_structure(uniprot: str, max_candidates: int) -> dict[str, Any]:
    if not uniprot:
        return {
            "status": "UNRESOLVED_ID",
            "rcsb_candidates": [],
            "alphafold": None,
        }
    try:
        candidates = lookup_rcsb(uniprot, max_candidates=max_candidates)
    except Exception as exc:
        candidates = []
        rcsb_error = f"{type(exc).__name__}: {exc}"
    else:
        rcsb_error = ""
    if candidates:
        return {
            "status": "EXPERIMENTAL_RCSB",
            "rcsb_candidates": candidates,
            "alphafold": None,
            "rcsb_error": rcsb_error,
        }
    try:
        alphafold = lookup_alphafold(uniprot)
    except Exception as exc:
        alphafold = None
        af_error = f"{type(exc).__name__}: {exc}"
    else:
        af_error = ""
    return {
        "status": "PREDICTED_ALPHAFOLD" if alphafold else "NO_STRUCTURE_FOUND",
        "rcsb_candidates": [],
        "alphafold": alphafold,
        "rcsb_error": rcsb_error,
        "alphafold_error": af_error,
    }


def sanitize_filename(text: str) -> str:
    value = re.sub(r"[^A-Za-z0-9._-]+", "_", text.strip())
    return value.strip("._") or "target"


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--local-md", type=Path, required=True)
    parser.add_argument("--release", default=DEFAULT_RELEASE)
    parser.add_argument("--outdir", type=Path, default=Path("target_manifest_full"))
    parser.add_argument("--min-score", type=float, default=0.0)
    parser.add_argument("--top-diseases", type=int, default=25)
    parser.add_argument("--max-pdb-candidates", type=int, default=5)
    parser.add_argument("--workers", type=int, default=6)
    parser.add_argument("--skip-structure-resolution", action="store_true")
    parser.add_argument("--max-targets", type=int, default=0, help="Testing only; 0 means all")
    parser.add_argument("--write-pair-csv", action="store_true", help="May be very large")
    args = parser.parse_args()

    args.outdir.mkdir(parents=True, exist_ok=True)
    local = parse_local_catalog(args.local_md)
    write_csv(args.outdir / "local_asset_route_actions.csv", local["asset_only"])

    base = OT_BUCKET.format(release=args.release)
    print(f"[1/5] Reading Open Targets {args.release} from {base}", flush=True)

    target_scan = scan_ot_dataset(base, "target")
    disease_scan = scan_ot_dataset(base, "disease")
    association_scan = scan_ot_dataset(base, "association_overall_direct")

    target_columns = set(target_scan.collect_schema().names())
    required_target = {"id", "approvedSymbol", "approvedName", "biotype"}
    missing_target = required_target - target_columns
    if missing_target:
        raise RuntimeError(f"Open Targets target schema missing columns: {sorted(missing_target)}")
    target_select = ["id", "approvedSymbol", "approvedName", "biotype"]
    if "proteinIds" in target_columns:
        target_select.append("proteinIds")
    target_df = target_scan.select(target_select).collect()

    target_meta_rows: list[dict[str, Any]] = []
    for row in target_df.to_dicts():
        symbol = clean_token(str(row.get("approvedSymbol") or ""))
        uniprot = extract_uniprot(row.get("proteinIds"))
        biotype = str(row.get("biotype") or "")
        if biotype != "protein_coding":
            continue
        if symbol in local["route_all_tokens"]:
            local_status = "ROUTED_LOCAL"
        elif symbol in local["asset_all_tokens"]:
            local_status = "ASSET_ONLY_LOCAL"
        else:
            local_status = "MISSING"
        target_meta_rows.append(
            {
                "target_id": row.get("id"),
                "approved_symbol": symbol,
                "approved_name": row.get("approvedName") or "",
                "biotype": biotype,
                "uniprot": uniprot,
                "local_status": local_status,
            }
        )
    target_meta_df = pl.DataFrame(target_meta_rows)

    disease_columns = set(disease_scan.collect_schema().names())
    if not {"id", "name"}.issubset(disease_columns):
        raise RuntimeError("Open Targets disease schema must include id and name")
    disease_df = disease_scan.select(
        pl.col("id").alias("disease_id"),
        pl.col("name").alias("disease_name"),
    ).collect()

    assoc_columns = set(association_scan.collect_schema().names())
    if not {"targetId", "diseaseId", "score"}.issubset(assoc_columns):
        raise RuntimeError(
            "Open Targets association_overall_direct schema must include "
            "targetId, diseaseId and score"
        )

    pairs = (
        association_scan.select(
            pl.col("targetId").alias("target_id"),
            pl.col("diseaseId").alias("disease_id"),
            pl.col("score").cast(pl.Float64).alias("association_score"),
        )
        .filter(pl.col("association_score") > args.min_score)
        .join(target_meta_df.lazy(), on="target_id", how="inner")
        .join(disease_df.lazy(), on="disease_id", how="left")
    )

    print("[2/5] Writing all target-disease pairs (Parquet)", flush=True)
    all_pairs_path = args.outdir / "association_pairs_all_protein_targets.parquet"
    missing_pairs_path = args.outdir / "association_pairs_missing_targets.parquet"
    pairs.sink_parquet(all_pairs_path)
    pairs.filter(pl.col("local_status") == "MISSING").sink_parquet(missing_pairs_path)
    if args.write_pair_csv:
        pairs.sink_csv(args.outdir / "association_pairs_all_protein_targets.csv")

    print("[3/5] Aggregating target-level disease summaries", flush=True)
    ranked = pairs.sort(
        ["target_id", "association_score"],
        descending=[False, True],
    )
    summary_lf = ranked.group_by(
        [
            "target_id",
            "approved_symbol",
            "approved_name",
            "biotype",
            "uniprot",
            "local_status",
        ],
        maintain_order=True,
    ).agg(
        pl.len().alias("disease_count"),
        pl.max("association_score").alias("max_association_score"),
        pl.col("disease_name").head(args.top_diseases).alias("top_disease_names"),
        pl.col("disease_id").head(args.top_diseases).alias("top_disease_ids"),
        pl.col("association_score").head(args.top_diseases).alias("top_disease_scores"),
    )
    summary_df = summary_lf.collect(engine="streaming")
    summary_rows = summary_df.to_dicts()

    for row in summary_rows:
        names = row.pop("top_disease_names") or []
        ids = row.pop("top_disease_ids") or []
        scores = row.pop("top_disease_scores") or []
        row["top_indications"] = " | ".join(
            f"{name} [{did}; {float(score):.4f}]"
            for name, did, score in zip(names, ids, scores)
        )

    missing_rows = [row for row in summary_rows if row["local_status"] == "MISSING"]
    if args.max_targets:
        missing_rows = missing_rows[: args.max_targets]

    cache_path = args.outdir / "structure_cache.json"
    if cache_path.exists():
        try:
            cache = json.loads(cache_path.read_text(encoding="utf-8"))
        except Exception:
            cache = {}
    else:
        cache = {}

    if args.skip_structure_resolution:
        for row in missing_rows:
            row["structure_status"] = "NOT_RUN"
            row["structure_payload"] = {}
    else:
        print(
            f"[4/5] Resolving structures for {len(missing_rows):,} missing targets "
            f"with {args.workers} workers",
            flush=True,
        )
        to_resolve = {
            row["uniprot"]
            for row in missing_rows
            if row.get("uniprot") and row["uniprot"] not in cache
        }
        completed = 0
        with ThreadPoolExecutor(max_workers=max(1, args.workers)) as executor:
            futures = {
                executor.submit(resolve_structure, accession, args.max_pdb_candidates): accession
                for accession in sorted(to_resolve)
            }
            for future in as_completed(futures):
                accession = futures[future]
                try:
                    cache[accession] = future.result()
                except Exception as exc:
                    cache[accession] = {
                        "status": "LOOKUP_ERROR",
                        "rcsb_candidates": [],
                        "alphafold": None,
                        "error": f"{type(exc).__name__}: {exc}",
                    }
                completed += 1
                if completed % 50 == 0 or completed == len(futures):
                    with _LOCK:
                        cache_path.write_text(
                            json.dumps(cache, ensure_ascii=False, indent=2),
                            encoding="utf-8",
                        )
                    print(f"  resolved {completed:,}/{len(futures):,}", flush=True)

        for row in missing_rows:
            accession = row.get("uniprot") or ""
            payload = cache.get(accession) if accession else None
            if not payload:
                payload = {
                    "status": "UNRESOLVED_ID",
                    "rcsb_candidates": [],
                    "alphafold": None,
                }
            row["structure_status"] = payload.get("status", "")
            row["structure_payload"] = payload

    summary_by_id = {row["target_id"]: row for row in summary_rows}
    for row in missing_rows:
        summary_by_id[row["target_id"]] = row
    final_summary = list(summary_by_id.values())

    target_csv_rows: list[dict[str, Any]] = []
    download_rows: list[dict[str, Any]] = []
    unresolved_rows: list[dict[str, Any]] = []

    for row in final_summary:
        payload = row.pop("structure_payload", {}) or {}
        candidates = payload.get("rcsb_candidates") or []
        af = payload.get("alphafold") or {}
        representative = candidates[0] if candidates else {}
        candidate_ids = ";".join(str(x.get("pdb_id") or "") for x in candidates)
        target_csv_row = dict(row)
        target_csv_row.update(
            {
                "structure_status": row.get("structure_status")
                or ("LOCAL" if row.get("local_status") != "MISSING" else "NOT_RUN"),
                "representative_pdb": representative.get("pdb_id", ""),
                "representative_method": representative.get("method", ""),
                "representative_resolution": representative.get("resolution", ""),
                "pdb_candidates": candidate_ids,
                "representative_mmcif_url": (
                    f"https://files.rcsb.org/download/{representative.get('pdb_id')}.cif.gz"
                    if representative.get("pdb_id")
                    else ""
                ),
                "representative_rcsb_page": (
                    f"https://www.rcsb.org/structure/{representative.get('pdb_id')}"
                    if representative.get("pdb_id")
                    else ""
                ),
                "alphafold_pdb_url": af.get("pdb_url", ""),
                "alphafold_cif_url": af.get("cif_url", ""),
                "structure_review_note": (
                    "RCSB ranking is resolution/method based; manually verify chain, "
                    "coverage, construct, mutation and biological assembly before modelling."
                    if candidates
                    else (
                        "Prediction only; retain pLDDT/PAE and do not label as experimental."
                        if af
                        else "No structure found automatically."
                    )
                ),
            }
        )
        target_csv_rows.append(target_csv_row)

        if row.get("local_status") != "MISSING":
            continue
        if candidates:
            for rank, candidate in enumerate(candidates, start=1):
                pdb_id = candidate.get("pdb_id") or ""
                filename = (
                    f"HUMAN-{sanitize_filename(row.get('approved_symbol') or row['target_id'])}"
                    f"-RCSB-{pdb_id}.cif.gz"
                )
                download_rows.append(
                    {
                        "target_id": row["target_id"],
                        "approved_symbol": row.get("approved_symbol", ""),
                        "uniprot": row.get("uniprot", ""),
                        "candidate_rank": rank,
                        "structure_source": "RCSB",
                        "structure_id": pdb_id,
                        "method": candidate.get("method", ""),
                        "resolution": candidate.get("resolution", ""),
                        "download_url": f"https://files.rcsb.org/download/{pdb_id}.cif.gz",
                        "filename": filename,
                        "top_indications": row.get("top_indications", ""),
                        "requires_scope_review": "YES",
                        "enabled_default": "YES" if rank == 1 else "NO",
                    }
                )
        elif af:
            url = af.get("cif_url") or af.get("pdb_url") or ""
            extension = ".cif" if af.get("cif_url") else ".pdb"
            filename = (
                f"HUMAN-{sanitize_filename(row.get('approved_symbol') or row['target_id'])}"
                f"-ALPHAFOLD-{sanitize_filename(row.get('uniprot') or 'unknown')}{extension}"
            )
            download_rows.append(
                {
                    "target_id": row["target_id"],
                    "approved_symbol": row.get("approved_symbol", ""),
                    "uniprot": row.get("uniprot", ""),
                    "candidate_rank": 1,
                    "structure_source": "AlphaFold",
                    "structure_id": row.get("uniprot", ""),
                    "method": "PREDICTED",
                    "resolution": "",
                    "download_url": url,
                    "filename": filename,
                    "top_indications": row.get("top_indications", ""),
                    "requires_scope_review": "YES",
                    "enabled_default": "YES",
                }
            )
        else:
            unresolved_rows.append(target_csv_row)

    write_csv(args.outdir / "target_expansion_full.csv", target_csv_rows)
    write_csv(args.outdir / "download_manifest.csv", download_rows)
    write_csv(args.outdir / "unresolved_targets.csv", unresolved_rows)

    metadata = {
        "generated_at": utc_now(),
        "open_targets_release": args.release,
        "scope": (
            "All direct Open Targets target-disease associations above min_score "
            "for human protein-coding targets; UniProt used where available"
        ),
        "min_score": args.min_score,
        "top_diseases_per_target": args.top_diseases,
        "max_pdb_candidates": args.max_pdb_candidates,
        "local_route_count": len(local["route_rows"]),
        "local_asset_count": len(local["asset_rows"]),
        "target_summary_count": len(target_csv_rows),
        "missing_target_count": sum(
            1 for row in target_csv_rows if row.get("local_status") == "MISSING"
        ),
        "download_manifest_rows": len(download_rows),
        "unresolved_count": len(unresolved_rows),
        "files": {
            "all_pairs": str(all_pairs_path),
            "missing_pairs": str(missing_pairs_path),
            "target_summary": "target_expansion_full.csv",
            "downloads": "download_manifest.csv",
            "promotions": "local_asset_route_actions.csv",
            "unresolved": "unresolved_targets.csv",
        },
    }
    (args.outdir / "run_metadata.json").write_text(
        json.dumps(metadata, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print("[5/5] Done", flush=True)
    print(json.dumps(metadata, ensure_ascii=False, indent=2), flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
