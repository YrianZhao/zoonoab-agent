# Antigen-Only Sweep Batch 004

Scope: disease ranks `41-60`

This pass only looks for real public antigen structures. Antibody partners are optional and ignored.

| disease rank | disease | antigen target | source PDB | source type | status | notes |
| --- | --- | --- | --- | --- | --- | --- |
| 41 | Whooping cough | IGHE | - | not_found | skipped | No confirmed public human IGHE antigen structure found in this pass. |
| 42 | Conduct disorder | DRD4 | 5WIU | exact antigen-only | downloaded | Human D4 dopamine receptor structure. |
| 43 | Neural tube defects | ALX4 | - | not_found | skipped | No confirmed public human ALX4 structure found in this pass. |
| 44 | Sickle cell disorders and trait | HBB | 4HHB | reused_target | reused | Same antigen target as rank 15. |
| 45 | Encephalitis | UNC93B1 | - | not_found | skipped | No confirmed public human UNC93B1 structure found in this pass. |
| 46 | Pancreatitis | PRSS1 | - | not_found | skipped | No confirmed public human PRSS1 structure found in this pass. |
| 47 | Idiopathic intellectual disability | AHDC1 | - | not_found | skipped | No confirmed public human AHDC1 structure found in this pass. |
| 48 | Gallbladder and biliary tract cancer | TP53 | 1TUP | reused_target | reused | Same antigen target as rank 25. |
| 49 | Eating disorders | SLC6A3 | 9EO4 | exact antigen-only | downloaded | Human dopamine transporter, target chain B. |
| 50 | Melanoma and other skin cancers | CDKN2A | - | not_found | skipped | No confirmed public human CDKN2A antigen structure found in this pass. |
| 51 | Larynx cancer | EGFR | 1IVO | reused_target | reused | Same antigen target as rank 29. |
| 52 | Rheumatoid arthritis | IL6R | 1N26 | exact antigen-only | downloaded | Human IL-6 receptor alpha chain extracellular domain. |
| 53 | Gastritis and duodenitis | SIGLEC8 | - | not_found | skipped | No confirmed public human SIGLEC8 structure found in this pass. |
| 54 | Thalassaemias | HBB | 4HHB | reused_target | reused | Same antigen target as rank 15. |
| 55 | Corpus uteri cancer | FGFR2 | 4WV1 | exact antigen-only | downloaded | Human FGFR2 D2 domain. |
| 56 | Rabies | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 57 | Otitis media | A2ML1 | - | not_found | skipped | No confirmed public human A2ML1 structure found in this pass. |
| 58 | Sudden infant death syndrome | SCN5A | 9P24 | exact antigen-only | downloaded | Human Nav1.5 sodium channel structure. |
| 59 | Intestinal nematode infections | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 60 | Iodine deficiency | TG | - | not_found | skipped | No confirmed public human TG structure found in this pass. |

## Batch Notes

- All downloaded files are kept in this folder.
- This batch continues from rank 41 after batch 003 finished ranks 21-40.
- Reused targets point back to earlier already-downloaded antigen-only files instead of duplicating coordinates.
