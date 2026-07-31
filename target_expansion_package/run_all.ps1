$ErrorActionPreference = "Stop"
$Python = if ($env:PYTHON) { $env:PYTHON } else { "python" }
$Release = if ($env:RELEASE) { $env:RELEASE } else { "26.06" }
$Workers = if ($env:WORKERS) { $env:WORKERS } else { "6" }

& $Python -m pip install -r requirements.txt

& $Python download_structures.py `
  --manifest immediate_download_manifest.csv `
  --outdir downloads/immediate_reviewed `
  --workers $Workers

& $Python build_full_target_manifest.py `
  --local-md input_snapshot/local-targets-export.md `
  --release $Release `
  --outdir generated/full_human_targets `
  --workers $Workers `
  --max-pdb-candidates 5

& $Python download_structures.py `
  --manifest generated/full_human_targets/download_manifest.csv `
  --outdir downloads/full_human_rank1 `
  --workers $Workers `
  --max-rank 1 `
  --sources RCSB

& $Python resolve_external_targets.py `
  --input pathogen_antigen_seed.csv `
  --outdir generated/pathogen_antigen_seed `
  --workers $Workers

Write-Host "Completed. Review all rows with requires_scope_review=YES before modelling."
