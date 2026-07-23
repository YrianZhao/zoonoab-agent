# Antigen-Only Sweep Batch 006

Scope: disease ranks `81-100`

This pass only looks for real public antigen structures. Antibody partners are optional and ignored.

| disease rank | disease | antigen target | source PDB | source type | status | notes |
| --- | --- | --- | --- | --- | --- | --- |
| 81 | Glaucoma | MYOC | 4WXQ | exact antigen-only | downloaded | Human myocilin olfactomedin domain. |
| 82 | Ascariasis | - | - | not_found | skipped | The source row had an incomplete fetch error in the longlist pass; no antigen structure was selected here. |
| 83 | Cannabis use disorders | NCAM1 | 2HAZ | exact antigen-only | downloaded | Human NCAM1 fibronectin domain. |
| 84 | Urolithiasis | SLC26A1 | - | not_found | skipped | No confirmed public human SLC26A1 structure found in this pass. |
| 85 | Macular degeneration | BEST1 | 9EGT | exact antigen-only | downloaded | Human BEST1 open-state structure. |
| 86 | Echinococcosis | IL21 | 3TGX | exact antigen-only | downloaded | Human IL-21:IL21R complex; IL-21 is present as the antigen chain. |
| 87 | Testicular cancer | KITLG | - | not_found | skipped | No confirmed public human KITLG structure found in this pass. |
| 88 | Acute hepatitis C | IFNAR2 | 1N6V | exact antigen-only | downloaded | Human type I interferon receptor beta chain ectodomain. |
| 89 | Hookworm disease | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 90 | Yellow fever | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 91 | Cleft lip and cleft palate | TBX22 | - | not_found | skipped | No confirmed public human TBX22 structure found in this pass. |
| 92 | Diphtheria | HBEGF | - | not_found | skipped | No confirmed public human HBEGF structure found in this pass. |
| 93 | Acute glomerulonephritis | CFH | 2G7I | exact antigen-only | downloaded | Human complement factor H C-terminal domains 19-20. |
| 94 | Trichomoniasis | MMP7 | - | not_found | skipped | No confirmed public human MMP7 antigen structure found in this pass. |
| 95 | Gential Herpes | RRM2 | - | not_found | skipped | No confirmed public human RRM2 structure found in this pass. |
| 96 | Acute hepatitis E | CD40LG | 1ALY | reused_target | reused | Same antigen target as rank 62. |
| 97 | Chagas disease | TGFB1 | 1KLC | exact antigen-only | downloaded | Human TGF-beta 1 solution structure. |
| 98 | Trichuriasis | IL10 | 2H24 | exact antigen-only | downloaded | Human interleukin-10. |
| 99 | Chlamydia | MMP7 | 7WXX | exact antigen-only | downloaded | Human MMP-7 structure. |
| 100 | Trachoma | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |

## Batch Notes

- All downloaded files are kept in this folder.
- This batch continues from rank 81 after batch 005 finished ranks 61-80.
- Reused targets point back to earlier already-downloaded antigen-only files instead of duplicating coordinates.
