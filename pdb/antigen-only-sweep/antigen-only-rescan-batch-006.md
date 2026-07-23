# Antigen-Only Rescan Batch 006

Scope: second-pass recovery sweep over previously recorded `not_found` targets in `antigen-only-batch-001` through `antigen-only-batch-051`.

This rescan keeps the same rule set as the first pass: only real public antigen structures are accepted, and antibody partners are ignored.

| original disease rank | disease | antigen target | previous batch | previous status | recovered PDB | recovery status | notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 300 | Mitral valve stenosis | ADRB1 | antigen-only-batch-016.md | not_found | 8S2T | recovered_exact_public_antigen | Added human ADRB1 cryo-EM structure from RCSB PDB after second-pass direct target verification. |
| 324 | Mitral valve stenosis with insufficiency | ADRB1 | antigen-only-batch-018.md | not_found | 8S2T | recovered_exact_public_antigen | Reused the same verified human ADRB1 public structure recovered for rank 300. |
| 424 | Choline deficiency | PSPH | antigen-only-batch-023.md | not_found | 6HYJ | recovered_exact_public_antigen | Added human phosphoserine phosphatase structure from RCSB PDB after second-pass direct target verification. |
| 520 | Dissociative amnesia | ADK | antigen-only-batch-027.md | not_found | 2I6A | recovered_exact_public_antigen | Added human adenosine kinase structure from RCSB PDB after second-pass direct target verification. |
| 544 | Pneumothorax | FLCN | antigen-only-batch-029.md | not_found | 3V42 | recovered_exact_public_antigen | Added human folliculin C-terminal-domain structure from RCSB PDB after second-pass direct target verification. |
| 551 | Histiocytic or dendritic cell neoplasms | BRAF | antigen-only-batch-029.md | not_found | 2FB8 | recovered_exact_public_antigen | Added human BRAF kinase-domain structure from RCSB PDB after second-pass direct target verification. |
| 554 | Inducible urticaria or angioedema | SERPING1 | antigen-only-batch-029.md | not_found | 2OAY | recovered_exact_public_antigen | Added human C1 inhibitor / SERPING1 structure from RCSB PDB after second-pass direct target verification. |
| 598 | Syndromes with urticarial reactions or angioedema | SERPING1 | antigen-only-batch-031.md | not_found | 2OAY | recovered_exact_public_antigen | Reused the same verified human SERPING1 public structure recovered for rank 554. |
| 939 | Malignant neoplasms of heart or mediastinum | NF1 | antigen-only-batch-048.md | not_found | 3P7Z | recovered_exact_public_antigen | Added human neurofibromin Sec14-PH module structure from RCSB PDB after second-pass direct target verification. |

## Rescan Notes

- New downloads added in this rescan: `2FB8`, `2I6A`, `2OAY`, `3P7Z`, `3V42`, `6HYJ`, `8S2T`.
- Target verification in this pass confirmed that `8S2T` contains a human `ADRB1` receptor chain, while `2FB8`, `2OAY`, `2I6A`, `3V42`, `3P7Z`, and `6HYJ` are all human exact-target experimental structures.
- These targets were previously recorded as `not_found` during the first sequential sweep and are now recovered without changing the original batch history.
- This rescan is dated to the current local pass on July 23, 2026.
