# Antigen-Only Sweep Batch 013

Scope: disease ranks `221-240`

This pass only looks for real public antigen structures. Antibody partners are optional and ignored.

| disease rank | disease | antigen target | source PDB | source type | status | notes |
| --- | --- | --- | --- | --- | --- | --- |
| 221 | Acquired haemolytic anaemia, non-immune | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 222 | Systemic sclerosis | FGFR2 | 4WV1 | reused_target | reused | Same antigen target as rank 55. |
| 223 | Certain skin disorders attributable to fungal infection | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 224 | Sarcocystosis | GH1 | - | not_found | skipped | No confirmed public human GH1 structure found in this pass. |
| 225 | Blastocystosis | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 226 | Amoebiasis | IL33 | - | reused_target | reused | Already covered by the existing local IL-33 routeable assets. |
| 227 | Congenital syphilis | FGFR2 | 4WV1 | reused_target | reused | Same antigen target as rank 55. |
| 228 | Pulmonary hypertension | BMPR2 | 3G2F | exact antigen-only | downloaded | Human BMPR2 kinase domain. |
| 229 | Acquired pulmonary venous abnormality | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 230 | Chronic rheumatic pericarditis | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 231 | Hyperaldosteronism | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 232 | Hypoaldosteronism | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 233 | Cyclothymic disorder | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 234 | Dysthymic disorder | APOE | 1B68 | reused_target | reused | Same antigen target as rank 162. |
| 235 | Intervertebral disc degeneration | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 236 | Spondylolysis | NGF | existing local asset | reused_target | reused | Already covered by the existing local routeable NGF assets. |
| 237 | Chronic rhinitis, nasopharyngitis or pharyngitis | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 238 | Bronchitis | IL33 | existing local asset | reused_target | reused | Already covered by the existing local IL-33 assets. |
| 239 | Leukodystrophies | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 240 | Central demyelination of corpus callosum | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |

## Batch Notes

- All downloaded files are kept in this folder.
- This batch continues from rank 221 after batch 012 finished ranks 201-220.
- Reused targets point back to earlier already-downloaded antigen-only files or existing local antigen assets instead of duplicating coordinates.
