# Antigen-Only Sweep Batch 002

Scope: disease ranks `11-20`

This pass only looks for real public antigen structures. Antibody partners are optional and ignored.

| disease rank | disease | antigen target | source PDB | source type | status | notes |
| --- | --- | --- | --- | --- | --- | --- |
| 11 | Malaria | TLR9 | 8AR3 | exact antigen-only | downloaded | Human TLR9 transmembrane and cytoplasmic juxtamembrane regions. |
| 12 | Cirrhosis of the liver | NR1H4 / FXR | 1OSH | exact antigen-only | downloaded | Human FXR ligand-binding domain. |
| 13 | Anxiety disorders | SLC6A4 / SERT | 5I75 | exact antigen-only | downloaded | Human serotonin transporter. |
| 14 | Hypertensive heart disease | TOP2A | 4FM9 | exact antigen-only | downloaded | Human topoisomerase II alpha DNA-bound domain. |
| 15 | Iron-deficiency anaemia | HBB | 4HHB | exact antigen-only | downloaded | Human hemoglobin alpha/beta tetramer. |
| 16 | Hypertensive heart disease | FTO | 4CXW | exact antigen-only | downloaded | Human FTO catalytic domain. |
| 17 | Congenital heart anomalies | NKX2-5 | 3RKQ | exact antigen-only | downloaded | Human NKX2.5 homeodomain with DNA. |
| 18 | Neonatal sepsis and infections | VDR | 3A78 | exact antigen-only | downloaded | Human vitamin D receptor ligand-binding domain. |
| 19 | Drug use disorders | OPRM1 | 8F7Q | exact antigen-only | downloaded | Human mu-opioid receptor complex; target chain is human OPRM1. |
| 20 | Alcohol use disorders | GABRA2 | - | not_found | skipped | No confirmed human GABRA2 structure found in this pass. |

## Batch Notes

- All downloaded files are kept in this folder.
- This batch continues from rank 11 after batch 001 finished ranks 1-10.
- If a later pass needs a backup OPRM1 reference, `9ODM.pdb` is available in the same folder as an extra target-containing structure, but the batch record uses human `8F7Q` as the primary hit.
