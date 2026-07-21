# Local Structure Expansion Candidates

This file is a human-maintained disease-first backlog for expanding the local target library.

## Structure Candidate Registry

| target | gene | aliases | organismName | organismTaxId | source database / accession | source URL | experimental method / resolution | biological assembly | antigenChains | antibodyChains | sourceAntigenChains | sourceAntibodyChains | structureClass suggestion | exact target match | real antigen-antibody complex | representative / display_pose / antigen-only | routeable | promptEligible | status | notes |
| --- | --- | --- | --- | ---: | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| MUC1 | MUC1 | Mucin-1, CD227 | Homo sapiens | 9606 | RCSB `7V7K`, UniProt `P15941` | [RCSB 7V7K](https://www.rcsb.org/structure/7V7K), [UniProt P15941](https://www.uniprot.org/uniprotkb/P15941/entry) | X-ray diffraction, 2.2 A | no additional assembly required | `C` | `A,B` | `C` | `A,B` | `target_exact_epitope_complex` | yes | yes | no; exact glycopeptide epitope complex | yes | yes | `accepted` | Imported as a routeable MUC1 glycoST VNTR epitope complex. Viewer copy must stay explicit that this is a tumor-associated glycopeptide epitope, not the full-length native mucin architecture. |
| Mesothelin | MSLN | MSLN, CAK1, SMRP | Homo sapiens | 9606 | RCSB `7UED`, UniProt `Q13421` | [RCSB 7UED](https://www.rcsb.org/structure/7UED), [UniProt Q13421](https://www.uniprot.org/uniprotkb/Q13421/entry) | X-ray diffraction, 3.0 A | no additional assembly required | `M` | `H,L` | `M` | `H,L` | `target_exact_complex` | yes | yes | no | yes | yes | `accepted` | Imported as the default Mesothelin/MSLN routeable local complex for pancreatic, ovarian, mesothelioma and solid-tumor surface-antigen requests. |
| Claudin 18.2 | CLDN18 | CLDN18.2, Claudin-18.2, Claudin 18.2 | Homo sapiens | 9606 | RCSB `9V32`, UniProt `P56856` | [RCSB 9V32](https://www.rcsb.org/structure/9V32), [UniProt P56856](https://www.uniprot.org/uniprotkb/P56856/entry) | Electron microscopy, 4.1 A | no additional assembly required | `A` | `H,L` | `A` | `H,L` | `target_exact_complex` | yes | yes | no | yes | yes | `accepted` | Imported as the default Claudin 18.2 gastric / gastroesophageal / pancreatic route. `9V2U` and `9V31` remain useful alternates for future diversity but were not needed for the first exact route. |
| B7-H3 | CD276 | CD276, B7H3, B7-H3/CD276 | Homo sapiens | 9606 | RCSB `9LY5`, UniProt `Q5ZPR3` | [RCSB 9LY5](https://www.rcsb.org/structure/9LY5), [UniProt Q5ZPR3](https://www.uniprot.org/uniprotkb/Q5ZPR3/entry) | Electron microscopy, 2.98 A | no additional assembly required | `C` | `A,B` | `C` | `A,B` | `target_exact_domain_complex` | yes | yes | no | yes | yes | `accepted` | Imported as the first exact B7-H3 route. The solved partner is the human B7-H3 IgC domain, so the display text keeps the domain scope explicit. |
| Glypican-3 | GPC3 | GPC3, Glypican-3 | Homo sapiens | 9606 | RCSB `9NTQ`, `9NTT`, UniProt `P51654` | [RCSB 9NTQ](https://www.rcsb.org/structure/9NTQ), [RCSB 9NTT](https://www.rcsb.org/structure/9NTT), [UniProt P51654](https://www.uniprot.org/uniprotkb/P51654/entry) | Electron microscopy, 4.04 A (`9NTQ`), 7.45 A (`9NTT`) | no additional assembly required | `A` | `B` | `A` | `B` | `target_exact_vhh_or_tce_complex` | yes | yes, but not Fab | no | no | no | `needs_review` | Current public structures are GPC3 bound to a single llama-derived binding domain / T-cell engager chain, not a human Fab route. Keep as backlog until the project explicitly accepts a VHH-only or single-domain route for GPC3. |
| CEACAM6 | CEACAM6 | CD66c, NCA | Homo sapiens | 9606 | RCSB `4WHC`, `4Y8A`, UniProt `P40199` | [RCSB 4WHC](https://www.rcsb.org/structure/4WHC), [RCSB 4Y8A](https://www.rcsb.org/structure/4Y8A), [UniProt P40199](https://www.uniprot.org/uniprotkb/P40199/entry) | X-ray diffraction, experimental antigen-only domains | no additional assembly required | `A` | none | `A` | none | `experimental_antigen_only` | yes | no | yes; antigen-only | no | no | `needs_review` | Current CEACAM6 entries are antigen-only N-domain structures or non-antibody viral-RBD complexes. Do not promote to routeable until a true CEACAM6/Fab or CEACAM6/VHH complex is confirmed. |

## Disease-First Coverage Map

The table below is for “what might a user ask next?” planning. `local_existing` means the target already has a route-backed local complex before this round. `new_local` means it was added in this round. `backlog` means keep it in the candidate queue until a suitable exact complex is confirmed.

| likely disease / user ask | 2 to 3 likely targets to keep ready | current local coverage |
| --- | --- | --- |
| 胰腺癌 / pancreatic cancer | `MUC1`, `Mesothelin`, `CEACAM6` | `MUC1=new_local`, `Mesothelin=new_local`, `CEACAM6=backlog` |
| 胃癌 / gastroesophageal junction cancer | `Claudin 18.2`, `HER2`, `EGFR` | `Claudin 18.2=new_local`, `HER2=local_existing`, `EGFR=local_existing` |
| 尿路上皮癌 / 肾盂癌 / bladder-renal-pelvis urothelial cancer | `TROP-2`, `HER2`, `B7-H3` | `TROP-2=local_existing`, `HER2=local_existing`, `B7-H3=new_local` |
| 卵巢癌 / mesothelioma / serosal solid tumors | `Mesothelin`, `MUC1`, `B7-H3` | `Mesothelin=new_local`, `MUC1=new_local`, `B7-H3=new_local` |
| 肝癌 / HCC | `GPC3`, `B7-H3`, `VEGF-A` | `GPC3=backlog`, `B7-H3=new_local`, `VEGF-A=local_existing` |
| 乳腺癌 | `HER2`, `TROP-2`, `EGFR` | `HER2=local_existing`, `TROP-2=local_existing`, `EGFR=local_existing` |
| 肺癌 | `EGFR`, `PD-L1`, `B7-H3` | `EGFR=local_existing`, `PD-L1=local_existing`, `B7-H3=new_local` |
| 结直肠癌 | `CEACAM6`, `EGFR`, `B7-H3` | `CEACAM6=backlog`, `EGFR=local_existing`, `B7-H3=new_local` |
| 黑色素瘤 / tumor immunotherapy | `PD-L1`, `PD-1`, `CTLA-4` | all `local_existing` |
| 类风湿 / 银屑病 / 炎症性肠病 | `TNF`, `IL-17A`, `IL-23` | all `local_existing` |
| 哮喘 / 特应性皮炎 / 2 型炎症 | `IL-33`, `TSLP`, `IL-4Rα` | all `local_existing` |
| 代谢综合征 / 肥胖 / 2 型糖尿病 | `GIPR`, `ANGPTL3`, `IL-1β` | all `local_existing` |
| 高脂血症 / 动脉粥样硬化 | `PCSK9`, `ANGPTL3`, `IL-1β` | all `local_existing` |
| 偏头痛 | `CGRP receptor`, `TNF`, `IL-1β` | `CGRP receptor=local_existing`, `TNF=local_existing`, `IL-1β=local_existing` |
| 呼吸道病毒感染 | `RSV F`, `Influenza HA/NA`, `SARS-CoV-2 RBD` | all `local_existing` |

## Next High-Value Backlog

1. `GPC3` should be revisited when a Fab-form antigen-antibody complex or a policy-approved exact VHH route becomes available; the current exact public complexes are single-domain binders rather than a Fab route.
2. `CEACAM6` should stay out of the routeable catalog until a true CEACAM6/Fab or CEACAM6/VHH complex is verified; antigen-only domains are useful references but not enough for prompt-eligible routing.
3. `MUC1` should continue to use glycopeptide/VNTR epitope wording in all visible metadata; do not let later edits drift into “full-length native mucin complex” language.
4. `renal pelvis / urothelial` asks are already better covered after this round via `TROP-2`, `HER2` and `B7-H3`, but a future `NECTIN4` exact complex would improve that disease family further if a validated Fab structure is found.
