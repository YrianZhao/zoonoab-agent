# Antigen-Only Sweep Batch 036

Scope: disease ranks `681-700`

This pass only looks for real public antigen structures. Antibody partners are optional and ignored.

| disease rank | disease | antigen target | source PDB | source type | status | notes |
| --- | --- | --- | --- | --- | --- | --- |
| 681 | Human immunodeficiency virus disease without mention of tuberculosis or malaria | TLR9 | 8AR3 | reused_target | reused | Existing human TLR9 antigen file already present in this folder. |
| 682 | Acute poliomyelitis | ADRA2B | 6K41 | exact_public_antigen | downloaded | Added human alpha-2B adrenergic receptor structure from RCSB PDB. |
| 683 | Western equine encephalitis | CD40LG | 1ALY | reused_target | reused | Existing human CD40LG antigen file already present in this folder. |
| 684 | Deep vein thrombosis | PROC | 6M3B | exact_public_antigen | downloaded | Added human protein C structure from RCSB PDB. |
| 685 | Venous thromboembolism | PROC | 6M3B | reused_target | reused | Same antigen target as rank 684. |
| 686 | Acquired systemic vein abnormality | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 687 | Inborn errors of amino acid or other organic acid metabolism | PAH | 1J8T | exact_public_antigen | downloaded | Added human phenylalanine hydroxylase catalytic-domain structure from RCSB PDB. |
| 688 | Inborn errors of carbohydrate metabolism | PCSK9 | 2QTW | reused_target | reused | Existing human PCSK9 antigen file already present in this folder. |
| 689 | Disorders due to use of MDMA or related drugs, including MDA | CC2D2A | - | not_found | skipped | No confirmed public human CC2D2A PDB selected in this pass. |
| 690 | Disorders due to use of dissociative drugs including ketamine and phencyclidine [PCP] | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 691 | Mitochondrial myopathies | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 692 | Periodic paralyses or disorders of muscle membrane excitability | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 693 | Peritonitis | APC | 1EMU | exact_public_antigen | downloaded | Added human APC peptide-containing structure from RCSB PDB. |
| 694 | Diverticulitis of small intestine | - | - | not_found | skipped | Longlist row has no confirmed target row to download in this pass. |
| 695 | Malignant neoplasms of floor of mouth | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 696 | Malignant neoplasms of palate | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 697 | Acquired haemophilia | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 698 | Immune reconstitution inflammatory syndrome | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 699 | Stevens-Johnson syndrome or toxic epidermal necrolysis | NR3C1 | 4P6X | reused_target | reused | Existing human NR3C1 antigen file already present in this folder. |
| 700 | Eastern equine encephalitis | CD40LG | 1ALY | reused_target | reused | Same antigen target as rank 683. |

## Batch Notes

- New downloads added in this batch: `6K41`, `6M3B`, `1J8T`, `1EMU`.
- Reused targets point to antigen files already present in this folder.
- `1EMU` contains a solved human APC SAMP repeat peptide bound to AXIN; the recorded target remains the actual APC coordinate fragment rather than a full-length APC model.
- This batch continues from rank 681 after batch 035 finished ranks 661-680.
