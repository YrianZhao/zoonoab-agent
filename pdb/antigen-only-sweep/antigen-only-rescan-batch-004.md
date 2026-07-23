# Antigen-Only Rescan Batch 004

Scope: second-pass recovery sweep over previously recorded `not_found` targets in `antigen-only-batch-001` through `antigen-only-batch-051`.

This rescan keeps the same rule set as the first pass: only real public antigen structures are accepted, and antibody partners are ignored.

| original disease rank | disease | antigen target | previous batch | previous status | recovered PDB | recovery status | notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 143 | Ataxic disorders | ATM | antigen-only-batch-009.md | not_found | 6K9L | recovered_exact_public_antigen | Added human ATM kinase structure from RCSB PDB after second-pass direct target verification. |
| 152 | Paratyphoid fever | HLA-DRB1 | antigen-only-batch-009.md | not_found | 1PYW | recovered_exact_public_antigen | Added human HLA-DRB1-containing class II MHC structure from RCSB PDB after second-pass direct target verification. |

## Rescan Notes

- New downloads added in this rescan: `6K9L`, `1PYW`.
- Candidate checks in this pass rejected non-human structures for `HBEGF` and `NOD2`, so those original `not_found` rows remain unchanged.
- These targets were previously recorded as `not_found` during the first sequential sweep and are now recovered without changing the original batch history.
- This rescan is dated to the current local pass on July 23, 2026.
