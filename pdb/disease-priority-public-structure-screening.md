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
## Batch 002

- Scope: disease rank `11-110`
- Scanned diseases: `100`
- Unique targets: `76`
- Exact public antibody complexes found: `2`
- Representative public complexes found: `0`
- Local reused / duplicate-target rows: `32`
- Not found in this pass: `70`
- Imported files: `2`

| disease rank | disease | primary target | match status | current local status | public structure result | representative public data | structure class in current pass | suggested next step | notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 11 | Malaria | TLR9 | exact | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 12 | Cirrhosis of the liver | NR1H4 | fuzzy | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 13 | Anxiety disorders | SLC6A4 | fuzzy | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 14 | HIV/AIDS | TOP2A | exact | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 15 | Iron-deficiency anaemia | HBB | fuzzy | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 16 | Hypertensive heart disease | FTO | exact | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 17 | Congenital heart anomalies | NKX2-5 | fuzzy | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 18 | Neonatal sepsis and infections | VDR | exact | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 19 | Drug use disorders | OPRM1 | exact | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 20 | Alcohol use disorders | GABRA2 | exact | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 21 | Meningitis | NR3C1 | exact | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 22 | Schizophrenia | DRD2 | exact | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 23 | Epilepsy | SCN1A | exact | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 24 | Rheumatic heart disease | LPA | exact | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 25 | Oesophagus cancer | TP53 | exact | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 26 | Cardiomyopathy, myocarditis, endocarditis | MYH7 | fuzzy | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 27 | Opioid use disorders | OPRM1 | fuzzy | none | same as rank 19 | same target as rank 19 | reused_target | reuse_first_match | Same primary target as an earlier rank in this batch. |
| 28 | Cirrhosis due to alcohol use | PNPLA3 | fuzzy | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 29 | Mouth and oropharynx cancers | RB1 | exact | routeable | already covered by local route | existing local route preset | local_existing_route | skip_for_now | This rank already lands on a prepared local route, so no new public screening work was needed in this batch. |
| 30 | Protein-energy malnutrition | PSMC1 | exact | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 31 | Austism and Asperger syndrome | TBR1 | exact | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 32 | Cirrhosis due to hepatitis B | NR1H4 | exact | none | same as rank 12 | same target as rank 12 | reused_target | reuse_first_match | Same primary target as an earlier rank in this batch. |
| 33 | Cirrhosis due to hepatitis C | NR1H4 | exact | none | same as rank 12 | same target as rank 12 | reused_target | reuse_first_match | Same primary target as an earlier rank in this batch. |
| 34 | Brain and nervous system cancers | RB1 | fuzzy | none | same as rank 29 | same target as rank 29 | reused_target | reuse_first_match | Same primary target as an earlier rank in this batch. |
| 35 | Bipolar disorder | SCN2A | exact | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 36 | Paralytic ileus and intestinal obstruction | ERBB3 | fuzzy | routeable | already covered by local route | existing local route preset | local_existing_route | skip_for_now | This rank already lands on a prepared local route, so no new public screening work was needed in this batch. |
| 37 | Cataracts | CTDP1 | fuzzy | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 38 | Peptic ulcer disease | ATP4A | exact | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 39 | Syphilis | MMP13 | exact | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 40 | Upper respiratory infections | NR3C1 | fuzzy | none | same as rank 21 | same target as rank 21 | reused_target | reuse_first_match | Same primary target as an earlier rank in this batch. |
| 41 | Whooping cough | IGHE | exact | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 42 | Conduct disorder | DRD2 | exact | asset_only | already covered by local asset | existing local asset | local_asset_only | skip_for_now | This rank already maps to an existing local asset and was not re-imported. |
| 43 | Neural tube defects | ALX4 | fuzzy | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 44 | Sickle cell disorders and trait | HBB | exact | none | same as rank 15 | same target as rank 15 | reused_target | reuse_first_match | Same primary target as an earlier rank in this batch. |
| 45 | Encephalitis | UNC93B1 | exact | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 46 | Pancreatitis | PRSS1 | exact | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 47 | Idiopathic intellectual disability | AHDC1 | fuzzy | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 48 | Gallbladder and biliary tract cancer | TP53 | exact | none | same as rank 25 | same target as rank 25 | reused_target | reuse_first_match | Same primary target as an earlier rank in this batch. |
| 49 | Eating disorders | SLC6A3 | fuzzy | routeable | already covered by local route | existing local route preset | local_existing_route | skip_for_now | This rank already lands on a prepared local route, so no new public screening work was needed in this batch. |
| 50 | Melanoma and other skin cancers | CDKN2A | fuzzy | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 51 | Larynx cancer | TP53 | exact | routeable | already covered by local route | existing local route preset | local_existing_route | skip_for_now | This rank already lands on a prepared local route, so no new public screening work was needed in this batch. |
| 52 | Rheumatoid arthritis | TYK2 | exact | routeable | already covered by local route | existing local route preset | local_existing_route | skip_for_now | This rank already lands on a prepared local route, so no new public screening work was needed in this batch. |
| 53 | Gastritis and duodenitis | SIGLEC8 | fuzzy | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 54 | Thalassaemias | HBB | exact | none | same as rank 15 | same target as rank 15 | reused_target | reuse_first_match | Same primary target as an earlier rank in this batch. |
| 55 | Corpus uteri cancer | PTEN | exact | routeable | already covered by local route | existing local route preset | local_existing_route | skip_for_now | This rank already lands on a prepared local route, so no new public screening work was needed in this batch. |
| 56 | Rabies | needs_review | unresolved | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 57 | Otitis media | A2ML1 | exact | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 58 | Sudden infant death syndrome | SCN5A | exact | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 59 | Intestinal nematode infections | needs_review | unresolved | none | same as rank 56 | same target as rank 56 | reused_target | reuse_first_match | Same primary target as an earlier rank in this batch. |
| 60 | Iodine deficiency | TG | fuzzy | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 61 | Down syndrome | GATA1 | exact | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 62 | Acute hepatitis B | CD40LG | exact | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 63 | Amphetamine use disorders | SLC6A3 | exact | routeable | already covered by local route | existing local route preset | local_existing_route | skip_for_now | This rank already lands on a prepared local route, so no new public screening work was needed in this batch. |
| 64 | Acute hepatitis A | CD4 | exact | none | RCSB 3O2D | [RCSB 3O2D](https://www.rcsb.org/structure/3O2D), exact experimental antibody complex | target_exact_complex | import_to_local_library | human CD4 / ibalizumab Fab complex |
| 65 | Schistosomiasis | IL4R | exact | routeable | already covered by local route | existing local route preset | local_existing_route | skip_for_now | This rank already lands on a prepared local route, so no new public screening work was needed in this batch. |
| 66 | Gout | SLC22A12 | exact | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 67 | Dengue | APOA1 | fuzzy | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 68 | Malignant skin melanoma | CDKN2A | exact | none | same as rank 50 | same target as rank 50 | reused_target | reuse_first_match | Same primary target as an earlier rank in this batch. |
| 69 | Non-melanoma skin cancer | CPVL | fuzzy | routeable | already covered by local route | existing local route preset | local_existing_route | skip_for_now | This rank already lands on a prepared local route, so no new public screening work was needed in this batch. |
| 70 | Tetanus | VAMP2 | exact | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 71 | Cocaine use disorders | FOXF1 | fuzzy | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 72 | Thyroid cancer | RET | exact | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 73 | Appendicitis | HLX | exact | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 74 | lymphatic filariasis | MMP1 | fuzzy | none | already covered by local route | existing local route preset | local_existing_route | skip_for_now | This rank already lands on a prepared local route, so no new public screening work was needed in this batch. |
| 75 | Onchocerciasis | CALR | exact | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 76 | Vitamin A deficiency | ZNF385D | exact | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 77 | Cysticercosis | NR3C1 | exact | none | already covered by local route | existing local route preset | local_existing_route | skip_for_now | This rank already lands on a prepared local route, so no new public screening work was needed in this batch. |
| 78 | Multiple sclerosis | NR3C1 | exact | routeable | same as rank 21 | same target as rank 21 | reused_target | reuse_first_match | Same primary target as an earlier rank in this batch. |
| 79 | Food-borne trematodes | needs_review | unresolved | none | same as rank 56 | same target as rank 56 | reused_target | reuse_first_match | Same primary target as an earlier rank in this batch. |
| 80 | Leishmaniasis | IGHG3 | exact | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 81 | Glaucoma | MYOC | exact | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 82 | Ascariasis | needs_review | unresolved | none | same as rank 56 | same target as rank 56 | reused_target | reuse_first_match | Same primary target as an earlier rank in this batch. |
| 83 | Cannabis use disorders | NCAM1 | fuzzy | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 84 | Urolithiasis | SLC26A1 | exact | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 85 | Macular degeneration | BEST1 | exact | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 86 | Echinococcosis | IL21 | exact | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 87 | Testicular cancer | KITLG | exact | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 88 | Acute hepatitis C | IFNAR2 | exact | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 89 | Hookworm disease | needs_review | fuzzy | none | same as rank 56 | same target as rank 56 | reused_target | reuse_first_match | Same primary target as an earlier rank in this batch. |
| 90 | Yellow fever | needs_review | unresolved | none | same as rank 56 | same target as rank 56 | reused_target | reuse_first_match | Same primary target as an earlier rank in this batch. |
| 91 | Cleft lip and cleft palate | TBX22 | fuzzy | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 92 | Diphtheria | HBEGF | exact | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 93 | Acute glomerulonephritis | CFH | fuzzy | none | RCSB 7WKI | [RCSB 7WKI](https://www.rcsb.org/structure/7WKI), exact experimental antibody complex | target_exact_nanobody_complex | import_to_local_library | human complement factor H / nanobody complex |
| 94 | Trichomoniasis | MMP7 | exact | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 95 | Gential Herpes | RRM2 | exact | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 96 | Acute hepatitis E | CD40LG | exact | none | same as rank 62 | same target as rank 62 | reused_target | reuse_first_match | Same primary target as an earlier rank in this batch. |
| 97 | Chagas disease | TGFB1 | exact | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 98 | Trichuriasis | IL10 | exact | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 99 | Chlamydia | MMP7 | fuzzy | none | same as rank 94 | same target as rank 94 | reused_target | reuse_first_match | Same primary target as an earlier rank in this batch. |
| 100 | Trachoma | needs_review | unresolved | none | same as rank 56 | same target as rank 56 | reused_target | reuse_first_match | Same primary target as an earlier rank in this batch. |
| 101 | Gonorrhoea | MMP1 | exact | none | same as rank 74 | same target as rank 74 | reused_target | reuse_first_match | Same primary target as an earlier rank in this batch. |
| 102 | Trypanosomiasis | ODC1 | exact | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 103 | Leprosy | LACC1 | exact | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 104 | Cholera | needs_review | unresolved | none | same as rank 56 | same target as rank 56 | reused_target | reuse_first_match | Same primary target as an earlier rank in this batch. |
| 105 | Intestinal infection due to other Vibrio | MMP8 | exact | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 106 | Intestinal infections due to Shigella | NLRC4 | exact | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 107 | Intestinal infections due to Escherichia coli | CBR3 | exact | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 108 | Essential hypertension | AGTR1 | exact | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 109 | Hypertensive renal disease | REN | fuzzy | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |
| 110 | Angina pectoris | GUCY1A1 | exact | none | not_found_in_current_pass | - | no_exact_public_pdb_yet | record_and_skip | No exact human experimental antibody complex confirmed in this pass. |

## Source Notes Addendum

- Batch 002 screened ranks `11-110` from `pdb/disease-priority-target-longlist.md`.
- Imported exact complexes in this batch: `3O2D` for CD4 / ibalizumab Fab, and `7WKI` for CFH / nanobody.
- Rows marked `local_reused` were already covered by existing local route or asset inventory and were not re-imported.
