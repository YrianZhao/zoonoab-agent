# Antigen-Only Rescan Batch 003

Scope: second-pass recovery sweep over previously recorded `not_found` targets in `antigen-only-batch-001` through `antigen-only-batch-051`.

This rescan keeps the same rule set as the first pass: only real public antigen structures are accepted, and antibody partners are ignored.

| original disease rank | disease | antigen target | previous batch | previous status | recovered PDB | recovery status | notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 112 | Nontoxic goitre | TG | antigen-only-batch-007.md | not_found | 6SCJ | recovered_exact_public_antigen | Recovered against the local human thyroglobulin structure after second-pass direct target verification. |
| 130 | Gastroenteritis due to Campylobacter | IL12B | antigen-only-batch-008.md | not_found | 1F45 | recovered_exact_public_antigen | Added human IL12B-containing interleukin-12 structure from RCSB PDB after second-pass direct target verification. |
| 139 | Psoriatic arthritis | IL12B | antigen-only-batch-008.md | not_found | 1F45 | recovered_exact_public_antigen | Recovered against the same local human IL12B-containing interleukin-12 structure after second-pass direct target verification. |
| 159 | Sick-euthyroid syndrome | THRB | antigen-only-batch-009.md | not_found | 3GWS | recovered_exact_public_antigen | Added human THRB ligand-binding domain structure from RCSB PDB after second-pass direct target verification. |
| 160 | Hypoparathyroidism | GNAS | antigen-only-batch-009.md | not_found | 6AU6 | recovered_exact_public_antigen | Added human GNAS structure from RCSB PDB after second-pass direct target verification. |
| 171 | Mastocytosis | KIT | antigen-only-batch-010.md | not_found | 2E9W | recovered_exact_public_antigen | Recovered against the local human KIT ectodomain coordinates within the KIT / KITLG complex after second-pass direct target verification. |

## Rescan Notes

- New downloads added in this rescan: `1F45`, `3GWS`, `6AU6`.
- Existing local antigen files reused during this rescan: `6SCJ`, `2E9W`.
- These targets were previously recorded as `not_found` during the first sequential sweep and are now recovered without changing the original batch history.
- This rescan is dated to the current local pass on July 23, 2026.
