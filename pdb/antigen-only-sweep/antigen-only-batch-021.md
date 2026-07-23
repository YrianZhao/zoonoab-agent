# Antigen-Only Sweep Batch 021

Scope: disease ranks `381-400`

This pass only looks for real public antigen structures. Antibody partners are optional and ignored.

| disease rank | disease | antigen target | source PDB | source type | status | notes |
| --- | --- | --- | --- | --- | --- | --- |
| 381 | Hypersensitivity pneumonitis due to organic dust | MUC1 | existing local asset | reused_target | reused | Already covered by the existing local MUC1 assets. |
| 382 | Pneumonitis due to solids or liquids | SLC27A4 | - | not_found | skipped | No confirmed public human SLC27A4 structure found in this pass. |
| 383 | Subarachnoid haemorrhage | EDNRA | - | not_found | skipped | No confirmed public human EDNRA structure found in this pass. |
| 384 | Nontraumatic subdural haemorrhage | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 385 | Certain vascular disorders of large intestine | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 386 | Polyp of large intestine | APC | - | not_found | skipped | No confirmed public human APC structure found in this pass. |
| 387 | Plasma cell neoplasms | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 388 | Heavy chain diseases or malignant immunoproliferative diseases | NFKB1 | - | not_found | skipped | No confirmed public human NFKB1 structure found in this pass. |
| 389 | Congenital polycythaemia | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 390 | Allergic or hypersensitivity disorders involving the eye | IL33 | existing local asset | reused_target | reused | Already covered by the existing local IL-33 assets. |
| 391 | Dermatitis or eczema of lower legs | IL12B | existing local asset | reused_target | reused | Already covered by the existing local IL-23 / IL12B assets. |
| 392 | Streptococcal pharyngitis | CRP | 1GNH | reused_target | reused | Same antigen target as rank 265. |
| 393 | Meningitis due to Streptococcus | NR3C1 | 4P6X | reused_target | reused | Same antigen target as rank 3. |
| 394 | Meningitis due to Staphylococcus | NR3C1 | 4P6X | reused_target | reused | Same antigen target as rank 3. |
| 395 | Bacterial cellulitis, erysipelas or lymphangitis | ALK | - | not_found | skipped | No confirmed public human ALK structure selected in this pass. |
| 396 | Tricuspid valve stenosis with insufficiency | NPPB | - | not_found | skipped | No confirmed public human NPPB structure found in this pass. |
| 397 | Tricuspid valvular abscess | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 398 | Tricuspid valve rupture | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 399 | Vitamin B12 deficiency | MMAA | - | not_found | skipped | No confirmed public human MMAA structure found in this pass. |
| 400 | Biotin deficiency | CD4 | 1WIP | reused_target | reused | Same antigen target as rank 64. |

## Batch Notes

- All downloaded files are kept in this folder.
- This batch continues from rank 381 after batch 020 finished ranks 361-380.
- Reused targets point back to earlier already-downloaded antigen-only files or existing local antigen assets instead of duplicating coordinates.
