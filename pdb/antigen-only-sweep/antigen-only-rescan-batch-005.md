# Antigen-Only Rescan Batch 005

Scope: second-pass recovery sweep over previously recorded `not_found` targets in `antigen-only-batch-001` through `antigen-only-batch-051`.

This rescan keeps the same rule set as the first pass: only real public antigen structures are accepted, and antibody partners are ignored.

| original disease rank | disease | antigen target | previous batch | previous status | recovered PDB | recovery status | notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 110 | Angina pectoris | GUCY1A1 | antigen-only-batch-007.md | not_found | 6JT0 | recovered_exact_public_antigen | Added human soluble guanylate cyclase structure containing the GUCY1A1 alpha-1 subunit from RCSB PDB after second-pass direct target verification. |
| 124 | Primary neoplasms of meninges | CHEK2 | antigen-only-batch-008.md | not_found | 3I6U | recovered_exact_public_antigen | Added human CHEK2 kinase structure from RCSB PDB after second-pass direct target verification. |
| 132 | Acute myocardial infarction | PLAT | antigen-only-batch-008.md | not_found | 5ZLZ | recovered_exact_public_antigen | Added human tissue-type plasminogen activator structure from the RCSB PDB tPA:PAI-1 complex after second-pass direct target verification. |
| 133 | Subsequent myocardial infarction | PLAT | antigen-only-batch-008.md | not_found | 5ZLZ | recovered_exact_public_antigen | Reused the same verified human PLAT / tPA public structure recovered for rank 132. |
| 333 | Acute bronchiolitis | GUCY1A1 | antigen-only-batch-018.md | not_found | 6JT0 | recovered_exact_public_antigen | Reused the same verified human GUCY1A1-containing public structure recovered for rank 110. |
| 339 | Myeloid or lymphoid neoplasms with FGFR1 abnormalities | MYD88 | antigen-only-batch-018.md | not_found | 2JS7 | recovered_exact_public_antigen | Added human MYD88 TIR-domain structure from RCSB PDB after second-pass direct target verification. |
| 442 | Glanders | MYD88 | antigen-only-batch-024.md | not_found | 2JS7 | recovered_exact_public_antigen | Reused the same verified human MYD88 public structure recovered for rank 339. |
| 531 | Eosinophilia | PRNP | antigen-only-batch-028.md | not_found | 1QLX | recovered_exact_public_antigen | Added human prion protein structure from RCSB PDB after second-pass direct target verification. |
| 903 | Inherited autonomic nervous system disorders | PRNP | antigen-only-batch-047.md | not_found | 1QLX | recovered_exact_public_antigen | Reused the same verified human PRNP public structure recovered for rank 531. |
| 945 | Sporotrichosis | IL18 | antigen-only-batch-049.md | not_found | 3WO2 | recovered_exact_public_antigen | Added human interleukin-18 crystal structure from RCSB PDB after second-pass direct target verification. |
| 948 | Sporadic Creutzfeldt-Jakob Disease | PRNP | antigen-only-batch-049.md | not_found | 1QLX | recovered_exact_public_antigen | Reused the same verified human PRNP public structure recovered for rank 531. |
| 949 | Acquired prion disease | PRNP | antigen-only-batch-049.md | not_found | 1QLX | recovered_exact_public_antigen | Reused the same verified human PRNP public structure recovered for rank 531. |
| 959 | Genetic prion diseases | PRNP | antigen-only-batch-049.md | not_found | 1QLX | recovered_exact_public_antigen | Reused the same verified human PRNP public structure recovered for rank 531. |

## Rescan Notes

- New downloads added in this rescan: `3I6U`, `5ZLZ`, `6JT0`, `2JS7`, `1QLX`, `3WO2`.
- Target verification in this pass confirmed that `6JT0` contains the human `GUCY1A1` alpha-1 subunit, `5ZLZ` contains human `PLAT`, and `3WO2` is a human `IL18` crystal structure.
- These targets were previously recorded as `not_found` during the first sequential sweep and are now recovered without changing the original batch history.
- This rescan is dated to the current local pass on July 23, 2026.
