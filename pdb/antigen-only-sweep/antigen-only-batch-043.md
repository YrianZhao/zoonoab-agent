# Antigen-Only Sweep Batch 043

Scope: disease ranks `821-840`

This pass only looks for real public antigen structures. Antibody partners are optional and ignored.

| disease rank | disease | antigen target | source PDB | source type | status | notes |
| --- | --- | --- | --- | --- | --- | --- |
| 821 | Hypokalaemia | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 822 | Disorders due to use of caffeine | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 823 | Disorders due to use of hallucinogens | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 824 | Neurological disorders due to toxicity | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 825 | Alcohol-related neurological disorders | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 826 | Epigastric hernia | EFEMP1 | - | not_found | skipped | No confirmed public human EFEMP1 PDB selected in this pass. |
| 827 | Incisional hernia | EFEMP1 | - | not_found | skipped | No confirmed public human EFEMP1 PDB selected in this pass. |
| 828 | Malignant neoplasm of pancreas | KRAS | 4OBE | exact_public_antigen | downloaded | Added GDP-bound human KRAS structure from RCSB PDB. |
| 829 | Malignant neoplasms of other or ill-defined digestive organs | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 830 | Thrombocytopenia | ANKRD26 | - | not_found | skipped | No confirmed public human ANKRD26 PDB selected in this pass. |
| 831 | Linear IgA bullous dermatosis | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 832 | Middle East respiratory syndrome | CYP3A43 | - | not_found | skipped | No confirmed public human CYP3A43 PDB selected in this pass. |
| 833 | Severe acute respiratory syndrome | ACE2 | 1R42 | reused_target | reused | Existing human ACE2 antigen file already present in this folder. |
| 834 | Mumps | FUT2 | - | not_found | skipped | No confirmed public human FUT2 PDB selected in this pass. |
| 835 | Infectious mononucleosis | TNFRSF17 | 1XU2 | exact_public_antigen | downloaded | Added human TNFRSF17 / BCMA ectodomain structure from RCSB PDB. |
| 836 | Fluid overload | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 837 | Metabolic or transporter liver disease | PNPLA3 | - | not_found | skipped | No confirmed public human PNPLA3 PDB selected in this pass. |
| 838 | Gambling disorder | GRIK1 | 4MF3 | exact_public_antigen | downloaded | Added human GRIK1 ligand-binding domain structure from RCSB PDB. |
| 839 | Gaming disorder | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 840 | Increased intracranial pressure | GABRB2 | 6X3U | exact_public_antigen | downloaded | Added human GABRB2-containing GABA_A receptor structure from RCSB PDB. |

## Batch Notes

- New downloads added in this batch: `4OBE`, `1XU2`, `4MF3`, `6X3U`.
- Reused targets point to antigen files already present in this folder.
- `1XU2` is recorded against the actual deposited human `TNFRSF17/BCMA` ectodomain coordinates within an APRIL-bound receptor complex.
- `4MF3` contains the solved human `GRIK1` extracellular ligand-binding domain fragment rather than the full-length receptor.
- `6X3U` includes human `GABRB2` beta-2 subunits within a human alpha1-beta2-gamma2 `GABA_A` receptor assembly; the recorded target remains the actual deposited `GABRB2` coordinate chains.
- This batch continues from rank 821 after batch 042 finished ranks 801-820.
