# Antigen-Only Sweep Batch 042

Scope: disease ranks `801-820`

This pass only looks for real public antigen structures. Antibody partners are optional and ignored.

| disease rank | disease | antigen target | source PDB | source type | status | notes |
| --- | --- | --- | --- | --- | --- | --- |
| 801 | Postprocedural pulmonary venous disorder | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 802 | Postprocedural residual or recurrent interatrial communication | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 803 | Alkalosis | STX11 | - | not_found | skipped | No confirmed public human STX11 PDB selected in this pass. |
| 804 | Mixed disorder of acid-base balance | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 805 | Disorders due to use of stimulants including amphetamines, methamphetamine or methcathinone | SLC6A3 | 9EO4 | reused_target | reused | Existing human SLC6A3 / DAT antigen file already present in this folder. |
| 806 | Disorders due to use of synthetic cathinones | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 807 | Ataxic cerebral palsy | NKX2-1 | 9U18 | exact_public_antigen | downloaded | Added human NKX2-1 homeodomain DNA-bound structure from RCSB PDB. |
| 808 | Worster-Drought syndrome | TMTC4 | - | not_found | skipped | No confirmed public human TMTC4 PDB selected in this pass. |
| 809 | Umbilical hernia | NAV3 | - | not_found | skipped | No confirmed public human NAV3 PDB selected in this pass. |
| 810 | Paraumbilical hernia | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 811 | Malignant neoplasms of rectum | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 812 | Malignant neoplasms of anus or anal canal | APC | 1EMU | reused_target | reused | Existing human APC antigen file already present in this folder. |
| 813 | Thrombocytosis | PDE3A | 7L28 | exact_public_antigen | downloaded | Added human PDE3A catalytic-domain structure from RCSB PDB. |
| 814 | Pemphigoid | IL4R | 1IAR | reused_target | reused | Existing human IL4R antigen file already present in this folder. |
| 815 | Filovirus disease | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 816 | Arenavirus disease | IMPDH1 | 1JCN | exact_public_antigen | downloaded | Added human IMPDH1 structure from RCSB PDB. |
| 817 | Hantavirus disease | CXCL10 | 1O7Y | exact_public_antigen | downloaded | Added human CXCL10 / IP-10 structure from RCSB PDB. |
| 818 | Henipavirus encephalitis | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 819 | Postprocedural ventricular abnormality | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 820 | Hyperkalaemia | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |

## Batch Notes

- New downloads added in this batch: `9U18`, `7L28`, `1JCN`, `1O7Y`.
- Reused targets point to antigen files already present in this folder.
- `9U18` contains the solved human `NKX2-1` homeodomain fragment bound to DNA and is recorded against the actual deposited human coordinate segment.
- `7L28` is recorded against the solved human `PDE3A` catalytic domain rather than a full-length membrane-associated assembly.
- `1JCN` contains a human `IMPDH1` binary complex with a small-molecule ligand and no antibody partner.
- `1O7Y` is a human `CXCL10` / IP-10 oligomeric crystal form and is recorded as the exact deposited human chemokine antigen.
- This batch continues from rank 801 after batch 041 finished ranks 781-800.
