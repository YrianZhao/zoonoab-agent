# Antigen-Only Sweep Batch 010

Scope: disease ranks `161-180`

This pass only looks for real public antigen structures. Antibody partners are optional and ignored.

| disease rank | disease | antigen target | source PDB | source type | status | notes |
| --- | --- | --- | --- | --- | --- | --- |
| 161 | Acute and transient psychotic disorder | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 162 | Delusional disorder | APOE | 1B68 | exact antigen-only | downloaded | Human apolipoprotein E receptor-binding fragment. |
| 163 | Adult-onset Still disease | IL1B | 1I1B | exact antigen-only | downloaded | Recombinant human interleukin-1 beta. |
| 164 | Juvenile idiopathic arthritis | TNF | 1TNF | exact antigen-only | downloaded | Human TNF-alpha trimer. |
| 165 | Acute pharyngitis | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 166 | Acute tonsillitis | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 167 | Tic disorders | DRD2 | 6CM4 | reused_target | reused | Same antigen target as rank 22. |
| 168 | Myoclonic disorders | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 169 | Vascular disorders of the stomach | ERBB2 / HER2 | HER2-Fab-01.pdb | reused_target | reused | Same antigen target as the existing HER2 local structure library. |
| 170 | Gastric polyp | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 171 | Mastocytosis | KIT | - | not_found | skipped | No confirmed public human KIT structure selected in this pass. |
| 172 | Refractory anaemia | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 173 | Hereditary haemolytic anaemia | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 174 | Acquired immunodeficiencies | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 175 | Toxin-mediated cutaneous reactions to distant or systemic bacterial infection | IL4R | 1IAR | reused_target | reused | Same antigen target as rank 65. |
| 176 | Gastroenteritis due to Astrovirus | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 177 | Gastroenteritis due to Rotavirus | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 178 | Enteritis due to Norovirus | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 179 | Intestinal infections due to Cytomegalovirus | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 180 | Coronary artery aneurysm | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |

## Batch Notes

- All downloaded files are kept in this folder.
- This batch continues from rank 161 after batch 009 finished ranks 141-160.
- Reused targets point back to earlier already-downloaded antigen-only files or existing local antigen assets instead of duplicating coordinates.
