# Antigen-Only Sweep Batch 012

Scope: disease ranks `201-220`

This pass only looks for real public antigen structures. Antibody partners are optional and ignored.

| disease rank | disease | antigen target | source PDB | source type | status | notes |
| --- | --- | --- | --- | --- | --- | --- |
| 201 | Giardiasis | IL17A | 4HR9 | exact antigen-only | downloaded | Human interleukin-17A. |
| 202 | Cryptosporidiosis | TNF | 1TNF | reused_target | reused | Same antigen target as rank 164. |
| 203 | Cystoisosporiasis | CD4 | 1WIP | reused_target | reused | Same antigen target as rank 64. |
| 204 | Coronary vasospastic disease | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 205 | Coronary microvascular disease | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 206 | Pulmonary thromboembolism | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 207 | Cushing syndrome | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 208 | Adrenogenital disorders | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 209 | Bipolar type I disorder | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 210 | Bipolar type II disorder | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 211 | Spinal deformities | EPO | 1BUY | exact antigen-only | downloaded | Human erythropoietin NMR structure. |
| 212 | Torticollis | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 213 | Acute obstructive laryngitis or epiglottitis | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 214 | Vasomotor or allergic rhinitis | IL33 | - | reused_target | reused | Already covered by the existing local IL-33 routeable assets. |
| 215 | Isolated demyelinating syndromes of the central nervous system | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 216 | Acute disseminated encephalomyelitis | MOG | - | not_found | skipped | No confirmed public human MOG structure selected in this pass. |
| 217 | Duodenal polyp | APC | - | not_found | skipped | No confirmed public human APC structure selected in this pass. |
| 218 | Gastric ulcer | ATP4A | - | not_found | skipped | No confirmed public human ATP4A structure selected in this pass. |
| 219 | Refractory anaemia with ring sideroblasts | MT-CO1 | - | not_found | skipped | No confirmed public human MT-CO1 structure selected in this pass. |
| 220 | Refractory cytopenia with multi-lineage dysplasia | MYSM1 | - | not_found | skipped | No confirmed public human MYSM1 structure selected in this pass. |

## Batch Notes

- All downloaded files are kept in this folder.
- This batch continues from rank 201 after batch 011 finished ranks 181-200.
- Reused targets point back to earlier already-downloaded antigen-only files or existing local antigen assets instead of duplicating coordinates.
