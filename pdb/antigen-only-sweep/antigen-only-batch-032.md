# Antigen-Only Sweep Batch 032

Scope: disease ranks `601-620`

This pass only looks for real public antigen structures. Antibody partners are optional and ignored.

| disease rank | disease | antigen target | source PDB | source type | status | notes |
| --- | --- | --- | --- | --- | --- | --- |
| 601 | Legionellosis | TOP2A | 4FM9 | reused_target | reused | Existing human TOP2A antigen file already present in this folder. |
| 602 | Chlamydial conjunctivitis | SLC35A2 | - | not_found | skipped | No confirmed public human SLC35A2 PDB selected in this pass. |
| 603 | Left ventricular failure | MYBPC3 | 1PD6 | exact_public_antigen | downloaded | Added human MYBPC3 cardiac C2 domain structure from RCSB PDB. |
| 604 | High output syndromes | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 605 | Right ventricular failure | PKP2 | 3TT9 | exact_public_antigen | downloaded | Added human plakophilin-2 fragment structure from RCSB PDB. |
| 606 | Sequelae of vitamin C deficiency | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 607 | Sequelae of rickets | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 608 | Binge eating disorder | SLC6A3 | 9EO4 | reused_target | reused | Existing human DAT/SLC6A3 antigen file already present in this folder. |
| 609 | Avoidant-restrictive food intake disorder | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 610 | Postprocedural stenosis of the trachea | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 611 | Inflammatory polyneuropathy | MS4A1 | 6VJA | reused_target | reused | Reused existing local CD20/MS4A1 structure already present elsewhere in the repository. |
| 612 | Hereditary motor and sensory neuropathy | SLC25A46 | - | not_found | skipped | No confirmed public human SLC25A46 PDB selected in this pass. |
| 613 | Cholelithiasis | ABCB4 | 6S7P | exact_public_antigen | downloaded | Added human ABCB4 transporter structure from RCSB PDB. |
| 614 | Cholecystitis | ABCB4 | 6S7P | reused_target | reused | Same antigen target as rank 613. |
| 615 | Ewing sarcoma, primary site | STAG2 | 4PK7 | exact_public_antigen | downloaded | Added human STAG2-containing cohesin complex structure from RCSB PDB. |
| 616 | Fibroblastic or myofibroblastic tumour, primary site | ALK | 7MZY | exact_public_antigen | downloaded | Added human ALK extracellular ligand-binding fragment structure from RCSB PDB. |
| 617 | Haemophilia C | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 618 | Acquired lymphocytosis | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 619 | Idiopathic angioedema | SERPING1 | 5DU3 | exact_public_antigen | downloaded | Added human C1-inhibitor / SERPING1 structure from RCSB PDB. |
| 620 | Chlamydial peritonitis | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |

## Batch Notes

- New downloads added in this batch: `1PD6`, `3TT9`, `6S7P`, `4PK7`, `7MZY`, `5DU3`.
- Reused targets point either to an existing antigen-only file in this folder or to an already present local structure asset in the repository.
- This batch continues from rank 601 after batch 031 finished ranks 581-600.
