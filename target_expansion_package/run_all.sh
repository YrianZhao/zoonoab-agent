#!/usr/bin/env bash
set -euo pipefail

PYTHON="${PYTHON:-python3}"
RELEASE="${RELEASE:-26.06}"
WORKERS="${WORKERS:-6}"

"$PYTHON" -m pip install -r requirements.txt

# 1) Immediate, manually reviewed P0/P2 seed structures.
"$PYTHON" download_structures.py \
  --manifest immediate_download_manifest.csv \
  --outdir downloads/immediate_reviewed \
  --workers "$WORKERS"

# 2) Full human protein disease-target universe from Open Targets.
"$PYTHON" build_full_target_manifest.py \
  --local-md input_snapshot/local-targets-export.md \
  --release "$RELEASE" \
  --outdir generated/full_human_targets \
  --workers "$WORKERS" \
  --max-pdb-candidates 5

# 3) Download rank-1 experimental structures from the generated human manifest.
"$PYTHON" download_structures.py \
  --manifest generated/full_human_targets/download_manifest.csv \
  --outdir downloads/full_human_rank1 \
  --workers "$WORKERS" \
  --max-rank 1 \
  --sources RCSB

# 4) Resolve the infectious/pathogen seed separately (Open Targets is human-target centric).
"$PYTHON" resolve_external_targets.py \
  --input pathogen_antigen_seed.csv \
  --outdir generated/pathogen_antigen_seed \
  --workers "$WORKERS"

echo "Completed. Review all rows with requires_scope_review=YES before modelling."
