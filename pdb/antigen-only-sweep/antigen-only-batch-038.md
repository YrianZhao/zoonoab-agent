# Antigen-Only Sweep Batch 038

Scope: disease ranks `721-740`

This pass only looks for real public antigen structures. Antibody partners are optional and ignored.

| disease rank | disease | antigen target | source PDB | source type | status | notes |
| --- | --- | --- | --- | --- | --- | --- |
| 721 | Infectious granulomas of the central nervous system | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 722 | Omsk haemorrhagic fever | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 723 | Kyasanur Forest disease | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 724 | Lymphangiectasia | CD55 | 2QZD | exact_public_antigen | downloaded | Added human CD55 / DAF SCR4 domain structure from RCSB PDB. |
| 725 | Lymphoedema | RAF1 | 3OMV | exact_public_antigen | downloaded | Added human RAF1 kinase-domain structure from RCSB PDB. |
| 726 | Cardiac transplant associated coronary allograft vasculopathy | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 727 | Lysosomal diseases | GAA | 5KZW | exact_public_antigen | downloaded | Added human lysosomal alpha-glucosidase structure from RCSB PDB. |
| 728 | Peroxisomal diseases | PEX6 | - | not_found | skipped | No confirmed public human PEX6 PDB selected in this pass. |
| 729 | Bodily distress disorder | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 730 | Body integrity dysphoria | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 731 | Ocular myopathy | MT-CO3 | - | not_found | skipped | No confirmed public human MT-CO3 PDB selected in this pass. |
| 732 | Malignant hyperthermia or hyperpyrexia | RYR1 | 6UHI | exact_public_antigen | downloaded | Added an experimentally solved chimera containing a human RYR1 segment from RCSB PDB; actual coordinate context is a Bacteroides thetaiotamicron / human RYR1 chimera. |
| 733 | Diverticulitis of large intestine | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 734 | Diverticulosis of large intestine | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 735 | Malignant neoplasms of tonsil | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 736 | Malignant neoplasms of oesophagus | TP53 | 1TUP | reused_target | reused | Existing human TP53 antigen file already present in this folder. |
| 737 | Acquired fibrinolytic defects | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 738 | Pyoderma gangrenosum | NR3C1 | 4P6X | reused_target | reused | Existing human NR3C1 antigen file already present in this folder. |
| 739 | Alkhurma haemorrhagic fever | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 740 | Ross River disease | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |

## Batch Notes

- New downloads added in this batch: `2QZD`, `3OMV`, `5KZW`, `6UHI`.
- Reused targets point to antigen files already present in this folder.
- `6UHI` is explicitly recorded as a human `RYR1` segment within an experimentally solved chimera rather than a full-length pure human `RYR1` structure.
- This batch continues from rank 721 after batch 037 finished ranks 701-720.
