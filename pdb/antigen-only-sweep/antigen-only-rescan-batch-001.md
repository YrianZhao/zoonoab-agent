# Antigen-Only Rescan Batch 001

Scope: second-pass recovery sweep over previously recorded `not_found` targets in `antigen-only-batch-001` through `antigen-only-batch-051`.

This rescan keeps the same rule set as the first pass: only real public antigen structures are accepted, and antibody partners are ignored.

| original disease rank | disease | antigen target | previous batch | previous status | recovered PDB | recovery status | notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 46 | Pancreatitis | PRSS1 | antigen-only-batch-004.md | not_found | 7QE8 | recovered_exact_public_antigen | Recovered against an already present local human PRSS1 / trypsin-1 structure after second-pass direct target verification. |
| 75 | Onchocerciasis | CALR | antigen-only-batch-005.md | not_found | 3POW | recovered_exact_public_antigen | Added human CALR globular-domain structure from RCSB PDB after second-pass direct target verification. |
| 94 | Trichomoniasis | MMP7 | antigen-only-batch-006.md | not_found | 7WXX | recovered_exact_public_antigen | Recovered against an already present local human MMP7 / matrilysin structure after second-pass direct target verification. |
| 102 | Trypanosomiasis | ODC1 | antigen-only-batch-007.md | not_found | 4ZGY | recovered_exact_public_antigen | Added human ODC1 structure from RCSB PDB after second-pass direct target verification. |

## Rescan Notes

- New downloads added in this rescan: `3POW`, `4ZGY`.
- Existing local antigen files reused during this rescan: `7QE8`, `7WXX`.
- These targets were previously recorded as `not_found` during the first sequential sweep and are now recovered without changing the original batch history.
- This rescan is dated to the current local pass on July 23, 2026.
