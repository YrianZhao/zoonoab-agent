# Antigen-Only Sweep Batch 008

Scope: disease ranks `121-140`

This pass only looks for real public antigen structures. Antibody partners are optional and ignored.

| disease rank | disease | antigen target | source PDB | source type | status | notes |
| --- | --- | --- | --- | --- | --- | --- |
| 121 | Oesophagitis | ATP4A | 5YLU | reused_target | reused | Same antigen target as rank 38. |
| 122 | Oesophageal ulcer | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 123 | Primary neoplasms of brain | NTRK2 | 5MO9 | exact antigen-only | downloaded | Human TrkB receptor ligand-binding domain in antibody-complex structure. |
| 124 | Primary neoplasms of meninges | CHEK2 | - | not_found | skipped | No confirmed public human CHEK2 structure found in this pass. |
| 125 | Megaloblastic anaemia due to vitamin B12 deficiency | SLC46A1 | - | not_found | skipped | No confirmed public human SLC46A1 structure found in this pass. |
| 126 | Primary immunodeficiencies due to disorders of innate immunity | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 127 | Necrolytic acral erythema | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 128 | Intestinal infections due to Clostridioides difficile | NR3C1 | 4P6X | reused_target | reused | Same antigen target as rank 3. |
| 129 | Intestinal infections due to Yersinia enterocolitica | NR3C1 | 4P6X | reused_target | reused | Same antigen target as rank 3. |
| 130 | Gastroenteritis due to Campylobacter | IL12B | - | not_found | skipped | No new antigen-only download required in this pass. |
| 131 | Typhoid fever | DBNL | - | not_found | skipped | No confirmed public human DBNL structure found in this pass. |
| 132 | Acute myocardial infarction | PLAT | - | not_found | skipped | No confirmed public human PLAT structure selected in this pass. |
| 133 | Subsequent myocardial infarction | PLAT | - | not_found | skipped | No confirmed public human PLAT structure selected in this pass. |
| 134 | Coronary thrombosis not resulting in myocardial infarction | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 135 | Thyrotoxicosis | CTLA4 | 3OSK | reused_target | reused | Same antigen target as rank 69. |
| 136 | Thyroiditis | CTLA4 | 3OSK | reused_target | reused | Same antigen target as rank 69. |
| 137 | Schizoaffective disorder | HTR2A | - | not_found | skipped | No confirmed public human HTR2A structure found in this pass. |
| 138 | Schizotypal disorder | ADRA2C | - | not_found | skipped | No confirmed public human ADRA2C structure found in this pass. |
| 139 | Psoriatic arthritis | IL12B | - | not_found | skipped | No new antigen-only download required in this pass. |
| 140 | Polymyalgia rheumatica | NR3C1 | 4P6X | reused_target | reused | Same antigen target as rank 3. |

## Batch Notes

- All downloaded files are kept in this folder.
- This batch continues from rank 121 after batch 007 finished ranks 101-120.
- Reused targets point back to earlier already-downloaded antigen-only files instead of duplicating coordinates.
