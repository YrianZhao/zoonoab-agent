# Antigen-Only Sweep Batch 007

Scope: disease ranks `101-120`

This pass only looks for real public antigen structures. Antibody partners are optional and ignored.

| disease rank | disease | antigen target | source PDB | source type | status | notes |
| --- | --- | --- | --- | --- | --- | --- |
| 101 | Gonorrhoea | MMP1 | 3SHI | reused_target | reused | Same antigen target as rank 74. |
| 102 | Trypanosomiasis | ODC1 | - | not_found | skipped | No confirmed public human ODC1 structure found in this pass. |
| 103 | Leprosy | LACC1 | - | not_found | skipped | No confirmed public human LACC1 structure found in this pass. |
| 104 | Cholera | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 105 | Intestinal infection due to other Vibrio | MMP8 | 2OY4 | exact antigen-only | downloaded | Human MMP-8 catalytic domain. |
| 106 | Intestinal infections due to Shigella | NLRC4 | - | not_found | skipped | No confirmed public human NLRC4 structure found in this pass. |
| 107 | Intestinal infections due to Escherichia coli | CBR3 | - | not_found | skipped | No confirmed public human CBR3 structure found in this pass. |
| 108 | Essential hypertension | AGTR1 | 4YAY | exact antigen-only | downloaded | Human angiotensin II type-1 receptor chimeric structure. |
| 109 | Hypertensive renal disease | REN | - | not_found | skipped | No confirmed public human REN structure found in this pass. |
| 110 | Angina pectoris | GUCY1A1 | - | not_found | skipped | No confirmed public human GUCY1A1 structure found in this pass. |
| 111 | Hypothyroidism | TSHR | 2XWT | exact antigen-only | downloaded | Human TSH receptor extracellular domain in antibody-complex structure. |
| 112 | Nontoxic goitre | TG | - | not_found | skipped | No confirmed public human TG structure found in this pass. |
| 113 | Autism spectrum disorder | TBR1 | - | not_found | skipped | No confirmed public human TBR1 structure found in this pass. |
| 114 | Stereotyped movement disorder | HNRNPH2 | - | not_found | skipped | No confirmed public human HNRNPH2 structure found in this pass. |
| 115 | Direct infections of joint | IL6R | 1N26 | reused_target | reused | Same antigen target as rank 52. |
| 116 | Infectious spondyloarthritis | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 117 | Acute nasopharyngitis | GRIN2A | - | not_found | skipped | No confirmed public human GRIN2A structure found in this pass. |
| 118 | Chronic rhinosinusitis | TSLP | 5J11 | exact antigen-only | downloaded | Human TSLP in complex with its receptor pair. |
| 119 | Choreiform disorders | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 120 | Dystonic disorders | SLC6A3 | 9EO4 | reused_target | reused | Same antigen target as rank 49. |

## Batch Notes

- All downloaded files are kept in this folder.
- This batch continues from rank 101 after batch 006 finished ranks 81-100.
- Reused targets point back to earlier already-downloaded antigen-only files instead of duplicating coordinates.
