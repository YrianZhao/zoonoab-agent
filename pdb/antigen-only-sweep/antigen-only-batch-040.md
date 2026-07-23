# Antigen-Only Sweep Batch 040

Scope: disease ranks `761-780`

This pass only looks for real public antigen structures. Antibody partners are optional and ignored.

| disease rank | disease | antigen target | source PDB | source type | status | notes |
| --- | --- | --- | --- | --- | --- | --- |
| 761 | Chikungunya virus disease | GPR161 | 8KH4 | exact_public_antigen | downloaded | Added human GPR161 structure from RCSB PDB. |
| 762 | Postprocedural right atrial complication | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 763 | Postprocedural left atrial complication | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 764 | Postcardiotomy syndrome | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 765 | Volume depletion | MPV17 | - | not_found | skipped | No confirmed public human MPV17 PDB selected in this pass. |
| 766 | Hyperosmolality or hypernatraemia | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 767 | Disorders due to use of synthetic cannabinoids | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 768 | Disorders due to use of opioids | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 769 | Disorders affecting autonomic synaptic neurotransmission | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 770 | Autonomic dysreflexia | CHRM2 | 3UON | exact_public_antigen | downloaded | Added human CHRM2 muscarinic receptor construct from RCSB PDB; actual coordinate context includes a T4 lysozyme fusion used for crystallization. |
| 771 | Acute vascular disorders of intestine | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 772 | Chronic vascular disorders of intestine | KIT | 1T45 | exact_public_antigen | downloaded | Added human KIT kinase-domain structure from RCSB PDB. |
| 773 | Malignant neoplasms of small intestine | KIT | 1T45 | reused_target | reused | Same antigen target as rank 772. |
| 774 | Malignant neoplasms of appendix | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 775 | Thrombophilia | PROC | 6M3B | reused_target | reused | Existing human PROC antigen file already present in this folder. |
| 776 | Erythema nodosum | PTK2B | 3CC6 | exact_public_antigen | downloaded | Added human PTK2B kinase-domain structure from RCSB PDB. |
| 777 | Colorado tick fever | - | - | not_found | skipped | Longlist row has no confirmed target row to download in this pass. |
| 778 | O'nyong-nyong fever | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 779 | Oropouche virus disease | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 780 | Rift Valley fever | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |

## Batch Notes

- New downloads added in this batch: `8KH4`, `3UON`, `1T45`, `3CC6`.
- Reused targets point to antigen files already present in this folder.
- `3UON` is explicitly recorded as a human `CHRM2` construct with T4 lysozyme fusion rather than a native unfused receptor-only coordinate set.
- This batch continues from rank 761 after batch 039 finished ranks 741-760.
