# Antigen-Only Sweep Batch 003

Scope: disease ranks `21-40`

This pass only looks for real public antigen structures. Antibody partners are optional and ignored.

| disease rank | disease | antigen target | source PDB | source type | status | notes |
| --- | --- | --- | --- | --- | --- | --- |
| 21 | Meningitis | NR3C1 | 4P6X | reused_target | reused | Same antigen target as rank 3. |
| 22 | Schizophrenia | DRD2 | 6CM4 | exact antigen-only | downloaded | Human D2 dopamine receptor structure bound to risperidone. |
| 23 | Epilepsy | SCN1A | 7DTD | exact antigen-only | downloaded | Human Nav1.1 sodium channel target chain present in the structure. |
| 24 | Rheumatic heart disease | LPA | - | not_found | skipped | No confirmed public human LPA antigen structure found in this pass. |
| 25 | Oesophagus cancer | TP53 | 1TUP | exact antigen-only | downloaded | Human p53 DNA-binding domain complex. |
| 26 | Cardiomyopathy, myocarditis, endocarditis | MYH7 | 6PFP | exact antigen-only | downloaded | Human beta cardiac myosin fragment containing the requested target sequence. |
| 27 | Opioid use disorders | OPRM1 | 8F7Q | reused_target | reused | Same antigen target as rank 19. |
| 28 | Cirrhosis due to alcohol use | PNPLA3 | - | not_found | skipped | No confirmed public human PNPLA3 antigen structure found in this pass. |
| 29 | Mouth and oropharynx cancers | EGFR | 1IVO | exact antigen-only | downloaded | Human EGFR extracellular domains with EGF complex. |
| 30 | Protein-energy malnutrition | PSMC1 | - | not_found | skipped | No confirmed public human PSMC1 antigen structure found in this pass. |
| 31 | Austism and Asperger syndrome | TBR1 | - | not_found | skipped | No confirmed public human TBR1 structure found in this pass. |
| 32 | Cirrhosis due to hepatitis B | NR1H4 | 1OSH | reused_target | reused | Same antigen target as rank 12. |
| 33 | Cirrhosis due to hepatitis C | NR1H4 | 1OSH | reused_target | reused | Same antigen target as rank 12. |
| 34 | Brain and nervous system cancers | RB1 | 3POM | exact antigen-only | downloaded | Human retinoblastoma pocket domain. |
| 35 | Bipolar disorder | SCN2A | 2KAV | exact antigen-only | downloaded | Human Nav1.2 C-terminal EF-hand domain. |
| 36 | Paralytic ileus and intestinal obstruction | ERBB3 | 1M6B | exact antigen-only | downloaded | Human HER3 extracellular domain. |
| 37 | Cataracts | CTDP1 | - | not_found | skipped | No confirmed public human CTDP1 structure found in this pass. |
| 38 | Peptic ulcer disease | ATP4A | 5YLU | exact antigen-only | downloaded | Human gastric proton pump alpha chain. |
| 39 | Syphilis | MMP13 | 4FU4 | exact antigen-only | downloaded | Human MMP-13 inactive full form. |
| 40 | Upper respiratory infections | NR3C1 | 4P6X | reused_target | reused | Same antigen target as rank 3. |

## Batch Notes

- All downloaded files are kept in this folder.
- This batch continues from rank 21 after batch 002 finished ranks 11-20.
- When a target is reused from an earlier batch, the already-downloaded antigen file is referenced instead of downloading a second copy.
