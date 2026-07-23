# Antigen-Only Sweep Batch 011

Scope: disease ranks `181-200`

This pass only looks for real public antigen structures. Antibody partners are optional and ignored.

| disease rank | disease | antigen target | source PDB | source type | status | notes |
| --- | --- | --- | --- | --- | --- | --- |
| 181 | Coronary artery dissection | FBN1 | 5MS9 | exact antigen-only | downloaded | Human fibrillin-1 fragment. |
| 182 | Coronary artery fistula, acquired | XPNPEP2 | - | not_found | skipped | No confirmed public human XPNPEP2 structure found in this pass. |
| 183 | Hyperparathyroidism | MEN1 | 3U84 | exact antigen-only | downloaded | Human menin structure. |
| 184 | Hyperfunction of pituitary gland | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 185 | Catatonia associated with another mental disorder | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 186 | Catatonia induced by substances or medications | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 187 | Internal derangement of knee | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 188 | Effusion of joint | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 189 | Acute laryngopharyngitis | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 190 | Acute laryngitis or tracheitis | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 191 | Progressive focal atrophies | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 192 | Lewy body disease | SNCA | - | not_found | skipped | Already covered by the existing local routeable alpha-synuclein asset, not added again here. |
| 193 | Duodenitis | SIGLEC8 | 2N7B | exact antigen-only | downloaded | Human Siglec-8 lectin domain. |
| 194 | Vascular disorders of the duodenum | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 195 | Refractory neutropaenia | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 196 | Refractory thrombocytopenia | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 197 | Acquired haemolytic anaemia, immune | IRF4 | - | not_found | skipped | No confirmed public human IRF4 structure found in this pass. |
| 198 | Idiopathic inflammatory myopathy | FCGRT / FcRn | 4N0U | exact antigen-only | downloaded | Human neonatal Fc receptor alpha chain. |
| 199 | Skin complications of BCG immunisation | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 200 | Infections due to Balantidium coli | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |

## Batch Notes

- All downloaded files are kept in this folder.
- This batch continues from rank 181 after batch 010 finished ranks 161-180.
- Reused targets point back to earlier already-downloaded antigen-only files or existing local antigen assets instead of duplicating coordinates.
