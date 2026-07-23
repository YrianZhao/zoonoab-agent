# Antigen-Only Sweep Batch 005

Scope: disease ranks `61-80`

This pass only looks for real public antigen structures. Antibody partners are optional and ignored.

| disease rank | disease | antigen target | source PDB | source type | status | notes |
| --- | --- | --- | --- | --- | --- | --- |
| 61 | Down syndrome | GATA1 | - | not_found | skipped | No confirmed public human GATA1 antigen structure found in this pass. |
| 62 | Acute hepatitis B | CD40LG | 1ALY | exact antigen-only | downloaded | Human CD40 ligand extracellular domain. |
| 63 | Amphetamine use disorders | SLC6A3 | 9EO4 | reused_target | reused | Same antigen target as rank 49. |
| 64 | Acute hepatitis A | CD4 | 1WIP | exact antigen-only | downloaded | Human CD4 extracellular fragment. |
| 65 | Schistosomiasis | IL4R | 1IAR | exact antigen-only | downloaded | Human IL-4 receptor alpha chain. |
| 66 | Gout | SLC22A12 | - | not_found | skipped | No confirmed public human SLC22A12 structure found in this pass. |
| 67 | Dengue | APOA1 | 1AV1 | exact antigen-only | downloaded | Human apolipoprotein A-I. |
| 68 | Malignant skin melanoma | CDKN2A | - | not_found | skipped | No confirmed public human CDKN2A antigen structure found in this pass. |
| 69 | Non-melanoma skin cancer | CTLA4 | 3OSK | exact antigen-only | downloaded | Human CTLA-4 apo homodimer. |
| 70 | Tetanus | VAMP2 | 3RK2 | exact antigen-only | downloaded | Human VAMP2 fragment in truncated SNARE complex. |
| 71 | Cocaine use disorders | FOXF1 | - | not_found | skipped | No confirmed public human FOXF1 structure found in this pass. |
| 72 | Thyroid cancer | RET | 4UX8 | exact antigen-only | downloaded | Human RET extracellular domain in ligand recognition complex. |
| 73 | Appendicitis | HLX | - | not_found | skipped | No confirmed public human HLX structure found in this pass. |
| 74 | lymphatic filariasis | MMP1 | 3SHI | exact antigen-only | downloaded | Human MMP-1 catalytic domain. |
| 75 | Onchocerciasis | CALR | - | not_found | skipped | No confirmed public human CALR structure found in this pass. |
| 76 | Vitamin A deficiency | ZNF385D | - | not_found | skipped | No confirmed public human ZNF385D structure found in this pass. |
| 77 | Cysticercosis | NR3C1 | 4P6X | reused_target | reused | Same antigen target as rank 3. |
| 78 | Multiple sclerosis | IL2RA | 1Z92 | exact antigen-only | downloaded | Human interleukin-2 receptor alpha chain. |
| 79 | Food-borne trematodes | - | - | not_found | skipped | No confirmed public antigen structure selected in this pass. |
| 80 | Leishmaniasis | IGHG3 | - | not_found | skipped | No confirmed public human IGHG3 antigen structure found in this pass. |

## Batch Notes

- All downloaded files are kept in this folder.
- This batch continues from rank 61 after batch 004 finished ranks 41-60.
- Reused targets point back to earlier already-downloaded antigen-only files instead of duplicating coordinates.
