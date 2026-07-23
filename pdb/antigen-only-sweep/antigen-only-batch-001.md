# Antigen-Only Sweep Batch 001

Scope: disease ranks `1-10`

This pass only looks for real public antigen structures. Antibody partners are optional and ignored.

| disease rank | disease | antigen target | source PDB | source type | status | notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Ischaemic heart disease | PCSK9 | 2QTW | exact antigen-only | downloaded | Full-length human PCSK9 crystal structure. |
| 2 | Stroke | F2 / thrombin | 3U69 | exact antigen-only | downloaded | Human thrombin free form. |
| 3 | Lower respiratory infections | NR3C1 | 4P6X | exact antigen-only | downloaded | Human glucocorticoid receptor ligand-binding domain. |
| 4 | Preterm birth complications | HECTD1 | 3DKM | exact antigen-only | downloaded | Human HECTD1 CPH domain. |
| 5 | Haemorrhagic stroke | COL4A1 | 5NAY | exact antigen-only | downloaded | Human COL4A1 NC1-region oligomer. |
| 6 | Chronic obstructive pulmonary disease | SCNN1B | 9BLR | exact antigen-only | downloaded | Human ENaC trimer includes the exact SCNN1B antigen chain. |
| 7 | Diarrhoeal diseases | WNT2B | - | not_found | skipped | No confirmed exact public WNT2B structure found in this pass. |
| 8 | Ischaemic stroke | F2 / thrombin | 3U69 | reused_target | reused | Same antigen target as rank 2. |
| 9 | Tuberculosis | NR3C1 | 4P6X | reused_target | reused | Same antigen target as rank 3. |
| 10 | Birth asphyxia and birth trauma | EPOR | 1ERN | exact antigen-only | downloaded | Human EPOR extracellular domain in the unliganded form. |

## Batch Notes

- All downloaded files are kept in this folder.
- The sweep starts from rank 1 and can continue with the next rank range in a later batch.

