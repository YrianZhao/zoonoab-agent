# Antigen-Only Sweep Batch 014

Scope: disease ranks `241-260`

This pass only looks for real public antigen structures. Antibody partners are optional and ignored.

| disease rank | disease | antigen target | source PDB | source type | status | notes |
| --- | --- | --- | --- | --- | --- | --- |
| 241 | Anastomotic ulcer | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 242 | Duodenal ulcer | ATP4A | 5YLU | reused_target | reused | Same antigen target as rank 38. |
| 243 | Refractory anaemia with excess of blasts | DDX41 | - | not_found | skipped | No confirmed public human DDX41 structure found in this pass. |
| 244 | Myelodysplastic syndrome with isolated del(5q) | EEF1D | - | not_found | skipped | No confirmed public human EEF1D structure found in this pass. |
| 245 | Sickle cell disorders or other haemoglobinopathies | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 246 | Overlap or undifferentiated nonorgan specific systemic autoimmune disease | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 247 | Atopic eczema | IL13 | existing local asset | reused_target | reused | Already covered by the existing local IL-13 routeable assets. |
| 248 | Early syphilis | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 249 | Late syphilis | MMP13 | 4FU4 | reused_target | reused | Same antigen target as rank 39. |
| 250 | Gonococcal genitourinary infection | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 251 | Gonococcal pelviperitonitis | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 252 | Constrictive pericarditis | NPPB | - | not_found | skipped | No confirmed public human NPPB structure found in this pass. |
| 253 | Cardiac tamponade | NR3C1 | 4P6X | reused_target | reused | Same antigen target as rank 3. |
| 254 | Haemopericardium | TNNI3 | 1J1E | exact antigen-only | downloaded | Human cardiac troponin domain including the TNNI3 chain. |
| 255 | Adrenocortical insufficiency | CYP21A2 | - | not_found | skipped | No confirmed public human CYP21A2 structure found in this pass. |
| 256 | Adrenomedullary hyperfunction | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 257 | Mixed depressive and anxiety disorder | IL1B | 1I1B | reused_target | reused | Same antigen target as rank 163. |
| 258 | Symptomatic and course presentations for mood episodes in mood disorders | F9 | - | not_found | skipped | Only non-human factor IX structures were confirmed in this pass. |
| 259 | Spinal stenosis | NGF | existing local asset | reused_target | reused | Already covered by the existing local NGF assets. |
| 260 | Spinal endplate defects | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |

## Batch Notes

- All downloaded files are kept in this folder.
- This batch continues from rank 241 after batch 013 finished ranks 221-240.
- Reused targets point back to earlier already-downloaded antigen-only files or existing local antigen assets instead of duplicating coordinates.
