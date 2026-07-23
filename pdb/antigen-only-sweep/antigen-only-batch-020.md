# Antigen-Only Sweep Batch 020

Scope: disease ranks `361-380`

This pass only looks for real public antigen structures. Antibody partners are optional and ignored.

| disease rank | disease | antigen target | source PDB | source type | status | notes |
| --- | --- | --- | --- | --- | --- | --- |
| 361 | Motility disorders of large intestine | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 362 | Certain noninfectious colitis or proctitis | PTGS2 | 5F19 | exact antigen-only | downloaded | Human cyclooxygenase-2 acetylated structure. |
| 363 | Precursor T-lymphoblastic neoplasms | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 364 | Mature B-cell neoplasm with leukaemic behaviour | BCMA | existing local asset | reused_target | reused | Already covered by the existing local BCMA assets. |
| 365 | Congenital dyserythropoietic anaemia | SEC23B | - | not_found | skipped | No confirmed public human SEC23B structure found in this pass. |
| 366 | Allergic or hypersensitivity disorders involving the respiratory tract | IL33 | existing local asset | reused_target | reused | Already covered by the existing local IL-33 assets. |
| 367 | Dermatitis or eczema of hands or feet | IL12B | existing local asset | reused_target | reused | Already covered by the existing local IL-23 / IL12B assets. |
| 368 | Acute rheumatic fever without mention of heart involvement | IGHG3 | - | not_found | skipped | No confirmed public human IGHG3 structure found in this pass. |
| 369 | Acute rheumatic fever with heart involvement | IGHG3 | - | not_found | skipped | No confirmed public human IGHG3 structure found in this pass. |
| 370 | Rheumatic chorea | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 371 | Scarlet fever | PPP1R12C | - | not_found | skipped | No confirmed public human PPP1R12C structure found in this pass. |
| 372 | Aortic valvar prolapse | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 373 | Tricuspid valve stenosis | NPPB | - | not_found | skipped | No confirmed public human NPPB structure found in this pass. |
| 374 | Tricuspid valve insufficiency | GABRG2 | - | not_found | skipped | No confirmed public human GABRG2 structure found in this pass. |
| 375 | Vitamin B6 deficiency | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 376 | Folate deficiency | FOLR3 | - | not_found | skipped | No confirmed public human FOLR3 structure found in this pass. |
| 377 | Body dysmorphic disorder | GNB2 | - | not_found | skipped | No confirmed public human GNB2 structure found in this pass. |
| 378 | Olfactory reference disorder | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 379 | Spontaneous rupture of synovium or tendon | NR3C1 | 4P6X | reused_target | reused | Same antigen target as rank 3. |
| 380 | Bursitis | PTGS2 | 5F19 | reused_target | reused | Same antigen target as rank 362. |

## Batch Notes

- All downloaded files are kept in this folder.
- This batch continues from rank 361 after batch 019 finished ranks 341-360.
- Reused targets point back to earlier already-downloaded antigen-only files or existing local antigen assets instead of duplicating coordinates.
