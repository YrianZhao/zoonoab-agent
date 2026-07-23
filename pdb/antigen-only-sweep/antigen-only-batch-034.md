# Antigen-Only Sweep Batch 034

Scope: disease ranks `641-660`

This pass only looks for real public antigen structures. Antibody partners are optional and ignored.

| disease rank | disease | antigen target | source PDB | source type | status | notes |
| --- | --- | --- | --- | --- | --- | --- |
| 641 | Q fever | CD40LG | 1ALY | reused_target | reused | Existing human CD40LG antigen file already present in this folder. |
| 642 | Campylobacteriosis | CPXM1 | - | not_found | skipped | No confirmed public human CPXM1 PDB selected in this pass. |
| 643 | Melioidosis | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 644 | Raynaud phenomenon | IRX1 | - | not_found | skipped | No confirmed public human IRX1 PDB selected in this pass. |
| 645 | Aortic aneurysm or dissection | FBN1 | 5MS9 | reused_target | reused | Existing human FBN1 antigen file already present in this folder. |
| 646 | Arterial aneurysm or dissection, excluding aorta | COL3A1 | 6FZV | exact_public_antigen | downloaded | Added human collagen alpha-1(III) chain structure from RCSB PDB. |
| 647 | Overweight or localised adiposity | GLP1R | 6LN2 | reused_local_asset | reused | Reused existing human GLP1R local asset already present elsewhere in the repository. |
| 648 | Vitamin excesses | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 649 | Enuresis | AVPR2 | 7BB6 | exact_public_antigen | downloaded | Added human vasopressin V2 receptor structure from RCSB PDB. |
| 650 | Encopresis | - | - | not_found | skipped | Longlist row has no confirmed target row to download in this pass. |
| 651 | Lambert-Eaton syndrome | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 652 | Muscular dystrophy | DMD | 1DXX | exact_public_antigen | downloaded | Added human dystrophin N-terminal actin-binding domain structure from RCSB PDB. |
| 653 | Acute pancreatitis | SPINK1 | 7QE8 | exact_public_antigen | downloaded | Added human SPINK1-containing complex from RCSB PDB. |
| 654 | Chronic pancreatitis | PRSS1 | 2RA3 | exact_public_antigen | downloaded | Added human cationic trypsin / PRSS1 structure from RCSB PDB. |
| 655 | Angiosarcoma, primary site | TOP2A | 4FM9 | reused_target | reused | Existing human TOP2A antigen file already present in this folder. |
| 656 | Kaposi sarcoma, primary site | TOP2A | 4FM9 | reused_target | reused | Same antigen target as rank 655. |
| 657 | Disseminated intravascular coagulation | F10 | 2GD4 | exact_public_antigen | downloaded | Added human coagulation factor X structure from RCSB PDB. |
| 658 | Polyclonal hypergammaglobulinaemia | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 659 | Annular erythema | KRT10 | 4ZRY | exact_public_antigen | downloaded | Added human KRT10-containing keratin heterocomplex structure from RCSB PDB. |
| 660 | Actinomycetoma | HMGB1 | 2LY4 | exact_public_antigen | downloaded | Added human HMGB1-containing structure from RCSB PDB. |

## Batch Notes

- New downloads added in this batch: `6FZV`, `7BB6`, `1DXX`, `7QE8`, `2RA3`, `2GD4`, `4ZRY`, `2LY4`.
- Reused targets point either to antigen files already present in this folder or to an existing local antigen asset elsewhere in the repository.
- This batch continues from rank 641 after batch 033 finished ranks 621-640.
