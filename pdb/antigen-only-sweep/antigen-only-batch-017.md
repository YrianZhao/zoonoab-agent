# Antigen-Only Sweep Batch 017

Scope: disease ranks `301-320`

This pass only looks for real public antigen structures. Antibody partners are optional and ignored.

| disease rank | disease | antigen target | source PDB | source type | status | notes |
| --- | --- | --- | --- | --- | --- | --- |
| 301 | Mitral valve insufficiency | TTN | - | not_found | skipped | No confirmed public human TTN structure found in this pass. |
| 302 | Mitral valve prolapse | DCHS1 | - | not_found | skipped | No confirmed public human DCHS1 structure found in this pass. |
| 303 | Peripheral precocious puberty | LHCGR | 7FIJ | exact antigen-only | downloaded | Human luteinizing hormone/choriogonadotropin receptor cryo-EM structure. |
| 304 | Autoimmune polyendocrinopathy | AIRE | - | not_found | skipped | No confirmed public human AIRE structure found in this pass. |
| 305 | Agoraphobia | CNR1 | 5XRA | exact antigen-only | downloaded | Human CB1 receptor in agonist-bound state. |
| 306 | Specific phobia | GABRA6 | - | not_found | skipped | No confirmed public human GABRA6 structure found in this pass. |
| 307 | Inflammatory spondyloarthritis | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 308 | Ankylosis of spinal joint | B3GALT6 | - | not_found | skipped | No confirmed public human B3GALT6 structure found in this pass. |
| 309 | Tracheobronchitis | IL33 | existing local asset | reused_target | reused | Already covered by the existing local IL-33 assets. |
| 310 | Pneumonia | NR3C1 | 4P6X | reused_target | reused | Same antigen target as rank 3. |
| 311 | Status epilepticus | GABRA4 | - | not_found | skipped | No confirmed public human GABRA4 structure found in this pass. |
| 312 | Acute repetitive seizures | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 313 | Intestinal malabsorption or protein-losing enteropathy | C5 | existing local asset | reused_target | reused | Already covered by the existing local C5 assets. |
| 314 | Certain vascular disorders of small intestine | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 315 | Myeloid/lymphoid neoplasm associated with PDGFRA rearrangement | PDGFRB | - | not_found | skipped | No confirmed public human PDGFRB structure selected in this pass. |
| 316 | Myeloid neoplasm associated with PDGFRB rearrangement | PDGFRB | - | not_found | skipped | No confirmed public human PDGFRB structure selected in this pass. |
| 317 | Aplastic anaemia | FANCA | - | not_found | skipped | No confirmed public human FANCA structure found in this pass. |
| 318 | SAPHO syndrome | TNF | 1TNF | reused_target | reused | Same antigen target as rank 164. |
| 319 | Lichen simplex or lichenification | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 320 | Anogenital warts | TLR7 | 7CYN | exact antigen-only | downloaded | Human TLR7 in complex with UNC93B1. |

## Batch Notes

- All downloaded files are kept in this folder.
- This batch continues from rank 301 after batch 016 finished ranks 281-300.
- Reused targets point back to earlier already-downloaded antigen-only files or existing local antigen assets instead of duplicating coordinates.
