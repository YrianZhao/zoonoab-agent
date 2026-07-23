# Disease Priority Public Structure Screening

用于按 `pdb/disease-priority-target-longlist.md` 的疾病顺序做第一轮公开结构可得性筛查。

该文件是人工维护记录，不是 route-backed 结构库真源，也不会自动改动现有本地 PDB 路由。

## Rules For This Screening

- 只记录公开可核实来源，优先 `RCSB PDB` 与 `UniProt`。
- 优先记录真实实验结构；若没有真实抗原-抗体 / Fab / VHH 复合物，可暂记抗原单体、受体-配体复合物或结构域片段。
- 找不到 exact human experimental PDB 时，明确写 `not_found_in_current_pass`，并跳过，不伪造坐标来源。
- 达到每 `100` 个“已补充到本地正式库”的靶点后，再做一次抗原-抗体距离校验。本文件当前仅是公开数据筛查，尚未触发该校验门槛。

## Batch 001

- Scope: disease rank `1-10`
- Unique primary targets screened: `7`
- Experimental public data found: `6`
- No exact experimental public PDB confirmed in current pass: `1`
- Duplicate target rows reused from earlier ranks: `2`

| disease rank | disease | primary target | gene | current local status | public structure result | representative public data | structure class in current pass | suggested next step | notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Ischaemic heart disease | PCSK9 | PCSK9 | `routeable` | local already covered | existing local PCSK9 route | local_existing | skip_for_now | This rank already lands on a prepared local route, so no new public screening work was needed in this batch. |
| 2 | Stroke | Thrombin / prothrombin | F2 | `none` | `found_public_experimental` | [RCSB 3LU9](https://www.rcsb.org/structure/3LU9), [UniProt P00734](https://www.uniprot.org/uniprotkb/P00734) | `experimental_reference_complex` | candidate_for_target_registry | `3LU9` is a human thrombin / PAR1 extracellular-fragment complex, not an antibody complex. It is still a real human target-reference structure and can be considered as an `asset_only` candidate if later accepted. |
| 3 | Lower respiratory infections | Glucocorticoid receptor | NR3C1 | `none` | `found_public_experimental` | [RCSB 7KW7](https://www.rcsb.org/structure/7KW7), [UniProt P04150](https://www.uniprot.org/uniprotkb/P04150/entry) | `experimental_reference_complex` | candidate_for_target_registry | `7KW7` is a human Hsp90-Hsp70-Hop-GR cryo-EM complex. No verified public NR3C1 antibody / Fab / VHH complex was confirmed in this pass. |
| 4 | Preterm birth complications | E3 ubiquitin-protein ligase HECTD1 | HECTD1 | `none` | `found_public_experimental` | [RCSB 3DKM](https://www.rcsb.org/structure/3DKM), [UniProt Q9ULT8](https://www.uniprot.org/uniprotkb/Q9ULT8/entry) | `experimental_antigen_only` | record_and_skip | Public data exists only as a small human HECTD1 CPH domain crystal structure in this pass. This is an intracellular ligase-domain fragment, not a route-ready surface antigen. |
| 5 | Haemorrhagic stroke | Collagen alpha-1(IV) chain | COL4A1 | `none` | `found_public_experimental` | [RCSB 5NAY](https://www.rcsb.org/structure/5NAY), [UniProt P02462](https://www.uniprot.org/uniprotkb/P02462/entry) | `experimental_antigen_only` | record_and_skip | `5NAY` is an exact human COL4A1 NC1-region experimental structure, but only a fragmental collagen assembly rather than an antibody complex. |
| 6 | Chronic obstructive pulmonary disease | Epithelial sodium channel subunit beta | SCNN1B | `none` | `found_public_experimental` | [RCSB 6BQN](https://www.rcsb.org/structure/6BQN), [UniProt P51168](https://www.uniprot.org/uniprotkb/P51168/entry) | `experimental_reference_complex` | candidate_for_target_registry | `6BQN` contains human ENaC including exact human `SCNN1B`, but the associated Fab chains are mouse `10D4` determination tools rather than a validated human therapeutic antibody complex. |
| 7 | Diarrhoeal diseases | Protein Wnt-2b | WNT2B | `none` | `not_found_in_current_pass` | [UniProt Q93097](https://www.uniprot.org/uniprotkb/Q93097/entry) | `no_exact_public_pdb_yet` | record_and_skip | Current authoritative screen confirmed the target identity in UniProt, but did not confirm an exact human experimental PDB entry for WNT2B itself. Search hits surfaced other Wnt-family structures, which were not accepted as substitutes. |
| 8 | Ischaemic stroke | Thrombin / prothrombin | F2 | `none` | `duplicate_of_rank_2` | same as rank 2 | `experimental_reference_complex` | reuse_rank_2_screen | Same primary target as rank 2. No additional search was needed in this batch. |
| 9 | Tuberculosis | Glucocorticoid receptor | NR3C1 | `none` | `duplicate_of_rank_3` | same as rank 3 | `experimental_reference_complex` | reuse_rank_3_screen | Same primary target as rank 3. No additional search was needed in this batch. |
| 10 | Birth asphyxia and birth trauma | Erythropoietin receptor | EPOR | `none` | `found_public_experimental` | [RCSB 1EER](https://www.rcsb.org/structure/1EER), [UniProt P19235](https://www.uniprot.org/uniprotkb/P19235/entry) | `experimental_reference_complex` | candidate_for_target_registry | `1EER` is a human erythropoietin / EPOR extracellular complex, not an antibody complex. It is a real receptor-ligand reference and could only enter later as `asset_only` if accepted. |

## Source Notes

- `3LU9` RCSB states “Crystal structure of human thrombin mutant S195A in complex with the extracellular fragment of human PAR1”, method `X-RAY DIFFRACTION`, resolution `1.80 Å`, and maps the target to UniProt `P00734` / gene `F2`.
- `7KW7` RCSB states “Atomic cryoEM structure of Hsp90-Hsp70-Hop-GR”, method `ELECTRON MICROSCOPY`, resolution `3.57 Å`, and lists glucocorticoid receptor gene `NR3C1` on chain `F`.
- `3DKM` RCSB states “Crystal structure of the HECTD1 CPH domain”, method `X-RAY DIFFRACTION`, resolution `1.60 Å`, and maps the target to UniProt `Q9ULT8` / gene `HECTD1`.
- `5NAY` RCSB states “Crystal structures of homooligomers of collagen type IV. alpha1NC1”, method `X-RAY DIFFRACTION`, resolution `1.80 Å`, and maps the target to UniProt `P02462` / gene `COL4A1`.
- `6BQN` RCSB states “Cryo-EM structure of ENaC”, method `ELECTRON MICROSCOPY`, resolution `3.90 Å`, includes exact human `SCNN1B`, and also includes mouse `10D4 fab` chains; this is why it stays reference-only in the current pass.
- `1EER` RCSB states “CRYSTAL STRUCTURE OF HUMAN ERYTHROPOIETIN COMPLEXED TO ITS RECEPTOR AT 1.9 ANGSTROMS”, and the entry text specifies human erythropoietin complexed to the extracellular ligand-binding domains of the erythropoietin receptor.
