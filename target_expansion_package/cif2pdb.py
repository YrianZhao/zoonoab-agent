#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Batch mmCIF(.cif.gz) -> PDB(.pdb) converter using gemmi.

Usage: python3 cif2pdb.py <indir> <outdir> [workers]
Reads every *.cif.gz in indir, writes same-name .pdb to outdir.
Original files are never modified. Skips already-converted outputs.
"""
import gemmi
import sys
import os
import glob
import time
from multiprocessing import Pool
from pathlib import Path


def _shorten_chain_names(st):
    """Remap multi-char chain names to single-char (PDB format limit)."""
    used = {chain.name for model in st for chain in model if len(chain.name) == 1}
    pool = [c for c in
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz_"
            if c not in used]
    for model in st:
        for chain in model:
            if len(chain.name) > 1:
                chain.name = pool.pop(0) if pool else chain.name[0]


def convert_one(task):
    src, dst = task
    out = Path(dst)
    if out.exists() and out.stat().st_size > 0:
        return ("SKIPPED", src, out.stat().st_size)
    try:
        st = gemmi.read_structure(src)
        try:
            st.write_pdb(str(out))
        except RuntimeError as exc:
            if "chain name too long" in str(exc):
                _shorten_chain_names(st)
                st.write_pdb(str(out))
            else:
                raise
        return ("OK", src, out.stat().st_size)
    except Exception as exc:
        return ("FAIL", src, f"{type(exc).__name__}: {str(exc)[:200]}")


def main():
    if len(sys.argv) < 3:
        print("Usage: python3 cif2pdb.py <indir> <outdir> [workers]")
        return 2
    indir = sys.argv[1]
    outdir = sys.argv[2]
    workers = int(sys.argv[3]) if len(sys.argv) > 3 else 8
    os.makedirs(outdir, exist_ok=True)

    tasks = []
    for f in sorted(glob.glob(os.path.join(indir, "*.cif.gz"))):
        outname = Path(f).name[:-len(".cif.gz")] + ".pdb"
        tasks.append((f, os.path.join(outdir, outname)))

    print(f"Converting {len(tasks)} files -> {outdir} with {workers} workers", flush=True)
    counts = {"OK": 0, "SKIPPED": 0, "FAIL": 0}
    fails = []
    total_bytes = 0
    t0 = time.time()
    with Pool(workers) as pool:
        for i, (status, src, info) in enumerate(
            pool.imap_unordered(convert_one, tasks), 1
        ):
            counts[status] = counts.get(status, 0) + 1
            if status == "OK":
                total_bytes += info
            elif status == "FAIL":
                fails.append((Path(src).name, info))
            if i % 500 == 0 or i == len(tasks):
                el = time.time() - t0
                rate = i / el if el else 0
                print(
                    f"  [{i}/{len(tasks)}] OK={counts['OK']} "
                    f"SKIP={counts['SKIPPED']} FAIL={counts['FAIL']} "
                    f"({rate:.1f}/s) {total_bytes/1e6:.1f}MB",
                    flush=True,
                )

    el = time.time() - t0
    print("=== DONE ===", flush=True)
    print(
        f"OK={counts['OK']} SKIPPED={counts['SKIPPED']} FAIL={counts['FAIL']} "
        f"total={total_bytes/1e9:.2f}GB elapsed={el:.0f}s",
        flush=True,
    )
    if fails:
        print(f"--- {len(fails)} failures (first 30) ---", flush=True)
        for name, info in fails[:30]:
            print(f"  {name}: {info}", flush=True)
    return 1 if counts["FAIL"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
