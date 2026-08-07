#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Verify cif.gz -> pdb conversion integrity by comparing atom counts.

Usage: python3 verify_pdb.py <cif_dir> <pdb_dir>
Checks: file count match, zero-size, atom count match (cif vs pdb),
chain count match, residue count match. Reports any discrepancy.
"""
import gemmi
import sys
import os
import glob
import time
from multiprocessing import Pool
from pathlib import Path


def counts_of(structure):
    """Return (models, chains, residues, atoms)."""
    models = len(structure)
    chains = sum(len(m) for m in structure)
    residues = sum(len(c) for m in structure for c in m)
    atoms = sum(len(res) for m in structure for c in m for res in c)
    return models, chains, residues, atoms


def check_one(task):
    cif_path, pdb_path = task
    name = Path(cif_path).name
    try:
        cif_st = gemmi.read_structure(cif_path)
        cif_m, cif_c, cif_r, cif_a = counts_of(cif_st)
    except Exception as exc:
        return (name, "CIF_READ_FAIL", str(exc)[:150])
    try:
        pdb_st = gemmi.read_structure(pdb_path)
        pdb_m, pdb_c, pdb_r, pdb_a = counts_of(pdb_st)
    except Exception as exc:
        return (name, "PDB_READ_FAIL", str(exc)[:150])

    issues = []
    if cif_a != pdb_a:
        issues.append(f"ATOM {cif_a}->{pdb_a}")
    if cif_r != pdb_r:
        issues.append(f"RES {cif_r}->{pdb_r}")
    if cif_c != pdb_c:
        issues.append(f"CHAIN {cif_c}->{pdb_c}")
    if cif_m != pdb_m:
        issues.append(f"MODEL {cif_m}->{pdb_m}")
    if issues:
        return (name, "MISMATCH", " | ".join(issues))
    return (name, "OK", f"atoms={cif_a} res={cif_r} chains={cif_c}")


def main():
    if len(sys.argv) < 3:
        print("Usage: python3 verify_pdb.py <cif_dir> <pdb_dir>")
        return 2
    cif_dir = sys.argv[1]
    pdb_dir = sys.argv[2]

    cif_files = sorted(glob.glob(os.path.join(cif_dir, "*.cif.gz")))
    tasks = []
    missing_pdb = []
    for cf in cif_files:
        stem = Path(cf).name[:-len(".cif.gz")]
        pf = os.path.join(pdb_dir, stem + ".pdb")
        if not os.path.exists(pf):
            missing_pdb.append(Path(cf).name)
        elif os.path.getsize(pf) == 0:
            tasks.append((cf, pf))  # will fail on read
        else:
            tasks.append((cf, pf))

    print(f"Checking {len(tasks)} pairs (cif vs pdb) ...", flush=True)
    if missing_pdb:
        print(f"WARNING: {len(missing_pdb)} pdb files missing!", flush=True)

    stats = {"OK": 0, "MISMATCH": 0, "CIF_READ_FAIL": 0, "PDB_READ_FAIL": 0}
    problems = []
    t0 = time.time()
    with Pool(12) as pool:
        for i, (name, status, info) in enumerate(
            pool.imap_unordered(check_one, tasks), 1
        ):
            stats[status] = stats.get(status, 0) + 1
            if status != "OK":
                problems.append((name, status, info))
            if i % 1000 == 0 or i == len(tasks):
                el = time.time() - t0
                print(
                    f"  [{i}/{len(tasks)}] OK={stats['OK']} "
                    f"MISMATCH={stats['MISMATCH']} "
                    f"FAIL={stats['CIF_READ_FAIL']+stats['PDB_READ_FAIL']} "
                    f"({i/el:.0f}/s)",
                    flush=True,
                )

    el = time.time() - t0
    print("=== RESULT ===", flush=True)
    print(
        f"Total={len(tasks)} OK={stats['OK']} MISMATCH={stats['MISMATCH']} "
        f"CIF_FAIL={stats['CIF_READ_FAIL']} PDB_FAIL={stats['PDB_READ_FAIL']} "
        f"MISSING={len(missing_pdb)} elapsed={el:.0f}s",
        flush=True,
    )
    if problems:
        print(f"--- {len(problems)} problems ---", flush=True)
        for name, status, info in problems[:50]:
            print(f"  [{status}] {name}: {info}", flush=True)
    else:
        print("ALL CLEAR: every pdb atom count matches its source cif.", flush=True)
    return 1 if (stats["MISMATCH"] or stats["CIF_READ_FAIL"] or stats["PDB_READ_FAIL"] or missing_pdb) else 0


if __name__ == "__main__":
    raise SystemExit(main())
