# Antigen-Only Sweep Batch 044

Scope: disease ranks `841-860`

This pass only looks for real public antigen structures. Antibody partners are optional and ignored.

| disease rank | disease | antigen target | source PDB | source type | status | notes |
| --- | --- | --- | --- | --- | --- | --- |
| 841 | Cerebrospinal fluid rhinorrhoea | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 842 | Parastomal hernia | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 843 | Indeterminate colitis | DEFA5 | - | not_found | skipped | No confirmed public human DEFA5 PDB selected in this pass. |
| 844 | Malignant neoplasms of liver or intrahepatic bile ducts | FGFR2 | 4WV1 | reused_target | reused | Existing human FGFR2 antigen file already present in this folder. |
| 845 | Malignant neoplasms of gallbladder | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 846 | Congenital disorders of spleen | FANCA | - | not_found | skipped | No confirmed public human FANCA PDB selected in this pass. |
| 847 | Epidermolysis bullosa acquisita | HR | - | not_found | skipped | No confirmed public human HR PDB selected in this pass. |
| 848 | Cytomegaloviral disease | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 849 | Epidemic myalgia | AFP | - | not_found | skipped | No confirmed public human AFP PDB selected in this pass. |
| 850 | Viral carditis | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 851 | Influenza due to identified seasonal influenza virus | GRIN2D | - | not_found | skipped | No confirmed public human GRIN2D PDB selected in this pass. |
| 852 | Amyloidosis | TTR | 1F41 | exact_public_antigen | downloaded | Added human transthyretin structure from RCSB PDB. |
| 853 | Postprocedural hypothyroidism | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 854 | Pyromania | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 855 | Kleptomania | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 856 | Cerebrospinal fluid otorrhoea | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 857 | Hydrocephalus | EEF2 | - | not_found | skipped | No confirmed public human EEF2 PDB selected in this pass. |
| 858 | Functional oesophageal or gastroduodenal disorders | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 859 | Irritable bowel syndrome or certain specified functional bowel disorders | GUCY2C | 8FX4 | exact_public_antigen | downloaded | Added human GUCY2C / GC-C-containing regulatory complex structure from RCSB PDB. |
| 860 | Malignant neoplasms of proximal biliary tract, cystic duct | IDH1 | 5DE1 | exact_public_antigen | downloaded | Added human IDH1 structure from RCSB PDB. |

## Batch Notes

- New downloads added in this batch: `1F41`, `8FX4`, `5DE1`.
- Reused targets point to antigen files already present in this folder.
- `8FX4` is recorded against the actual deposited human `GUCY2C` coordinate chain within a larger HSP90-CDC37 regulatory complex.
- `5DE1` is a human `IDH1` structure solved with a bound inhibitor and includes the deposited engineered mutation noted in the source entry.
- This batch continues from rank 841 after batch 043 finished ranks 821-840.
