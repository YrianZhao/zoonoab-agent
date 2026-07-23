# Antigen-Only Rescan Batch 002

Scope: second-pass recovery sweep over previously recorded `not_found` targets in `antigen-only-batch-001` through `antigen-only-batch-051`.

This rescan keeps the same rule set as the first pass: only real public antigen structures are accepted, and antibody partners are ignored.

| original disease rank | disease | antigen target | previous batch | previous status | recovered PDB | recovery status | notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 60 | Iodine deficiency | TG | antigen-only-batch-004.md | not_found | 6SCJ | recovered_exact_public_antigen | Added human thyroglobulin structure from RCSB PDB after second-pass direct target verification. |
| 87 | Testicular cancer | KITLG | antigen-only-batch-006.md | not_found | 2E9W | recovered_exact_public_antigen | Added human KITLG / stem cell factor coordinates from the RCSB PDB KIT ectodomain complex after second-pass direct target verification. |
| 109 | Hypertensive renal disease | REN | antigen-only-batch-007.md | not_found | 2REN | recovered_exact_public_antigen | Added human renin structure from RCSB PDB after second-pass direct target verification. |
| 137 | Schizoaffective disorder | HTR2A | antigen-only-batch-008.md | not_found | 6A93 | recovered_exact_public_antigen | Added human HTR2A / 5-HT2A receptor structure from RCSB PDB after second-pass direct target verification. |
| 148 | Non mast cell myeloproliferative neoplasms | JAK2 | antigen-only-batch-009.md | not_found | 6VGL | recovered_exact_public_antigen | Added human JAK2 kinase-domain structure from RCSB PDB after second-pass direct target verification. |

## Rescan Notes

- New downloads added in this rescan: `6SCJ`, `2E9W`, `2REN`, `6A93`, `6VGL`.
- These targets were previously recorded as `not_found` during the first sequential sweep and are now recovered without changing the original batch history.
- This rescan is dated to the current local pass on July 23, 2026.
