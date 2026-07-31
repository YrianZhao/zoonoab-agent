# 本地靶点信息导出

> 导出时间: 2026-07-30T10:02:06.983Z
> 数据来源: `pdb/local-structure-catalog.json` (生成于 2026-07-30T04:19:42.348Z)
> 本导出不修改任何项目文件

## 概览

| 指标 | 数值 |
|------|------|
| 路线预设总数 | 272 |
| 可提示靶点数 (promptEligible) | 271 |
| 去重后唯一靶点数 | 269 |
| 库资产 (libraryAssets) 数 | 273 |
| 提示词清单字符长度 | 3083 |

### 按抗体格式分类

| 格式 | 靶点数 |
|------|--------|
| Fab | 226 |
| VHH | 43 |

### 按物种分类

| 物种 | 靶点数 |
|------|--------|
| HOMO SAPIENS | 139 |
| Homo sapiens | 100 |
| Influenza A virus | 3 |
| HOMO SAPIENS, ENTEROBACTERIA PHAGE T4 | 3 |
| Porcine reproductive and respiratory syndrome virus | 2 |
| MUS MUSCULUS | 2 |
| HOMO SAPIENS, ESCHERICHIA COLI | 2 |
| Respiratory syncytial virus | 1 |
| Severe acute respiratory syndrome coronavirus 2 | 1 |
| Canis lupus familiaris | 1 |
| Human adenovirus 57 | 1 |
| Human herpesvirus 1 | 1 |
| Porcine circovirus 2 | 1 |
| Porcine epidemic diarrhea virus | 1 |
| Classical swine fever virus | 1 |
| Feline panleukopenia virus | 1 |
| Dengue virus | 1 |
| Zika virus | 1 |
| Rabies virus | 1 |
| Human cytomegalovirus | 1 |
| ESCHERICHIA COLI, HOMO SAPIENS | 1 |
| HOMO SAPIENS, DESULFOVIBRIO VULGARIS (STRAIN HILDENBOROUGH / ATCC 29579 / DSM 644 / NCIMB 8303) | 1 |
| SUS SCROFA | 1 |
| BACTEROIDES THETAIOTAOMICRON (STRAIN ATCC 29148 / DSM 2079 / NCTC 10582 / E50 / VPI-5482), HOMO SAPIENS | 1 |
| CRICETULUS GRISEUS | 1 |

## 发给大模型的靶点清单 (STRUCTURE_SUPPORT_TARGETS_FOR_PROMPT)

以下字符串每次会作为系统提示词的一部分发送给大模型，提示模型优先从这些靶点中选择：

> IL-33/IL33、TSLP、PD-L1/CD274、PD-1/PDCD1、CTLA-4/CTLA4、CD20/MS4A1、CD19、CD3/CD3E/CD3G、CD4、C5、CFH、IL-6R/IL6R、IL-4Rα/IL4R、CD25/IL2RA、CD38、TIGIT、CD47、LAG-3/LAG3、TROP-2/TACSTD2、Tissue Factor/F3、BCMA/TNFRSF17、IgE/IGH、CGRP receptor/CALCRL/RAMP1、HER2/ERBB2、EGFR、VEGF-A/VEGFA、TNF、IL-17A/IL17A、IL-23/IL23A/IL12B、RSV F/F、SARS-CoV-2 RBD/S、Influenza HA/HA、Influenza NA/NA、PCSK9、ANGPTL3、IL-1B/IL1B、GIPR、Amyloid-beta/APP、Tau/MAPT、TREM2、DAT/SLC6A3、TSHR、alpha-synuclein/SNCA、AQP4、Canine NGF/NGF、PF4/CXCL4、Adenovirus hexon/L3、Influenza M2/M2、PRRSV GP4/GP4、PRRSV NSP10/NSP10、HSV gD/gD、PCV2 capsid/CAP、PEDV spike/S、CSFV NS5B/NS5B、Feline panleukopenia VP2/VP2、Connexin-26/GJB2、DLL3、FOLR1、ROR1、CD30/TNFRSF8、FLT3、CD70、PTK7、PSMA/FOLH1、CD74、TIM-3/HAVCR2、GITR/TNFRSF18、OX40/TNFRSF4、4-1BB/TNFRSF9、CD40/TNFRSF5、CD27/TNFRSF7、DR5/TNFRSF10B、CLDN6、CDH6、PRLR、SSTR2、GUCY2C、IL-31/IL31、IL-17RA/IL17RA、GM-CSF/CSF2、IL-36α/IL36A、BAFF-R/TNFRSF13C、GLP-1R/GLP1R、FGF21、LGR5、BACE1、Leptin receptor/LEPR、Dengue E/DENV-E、Zika NS1/ZIKV-NS1、Rabies G/RABV-G、CMV gB/HCMV-UL55、CD22/Siglec-2、Mesothelin/MSLN、Claudin 18.2/CLDN18、MET/c-MET、HER3/ERBB3、B7-H3/CD276、B7-H6/NCR3LG1、MUC1、Nectin-4/NECTIN4、FGFR2/KGFR、FGFR3、GPRC5D、CEACAM5/CEA、STEAP1、CAIX/CA9、IL-5/IL5、IL-13/IL13、CD123/IL3RA、BAFF/TNFSF13B、FcRn/FCGRT、NGF、CD33/Siglec-3、GPC2/Glypican-2、Integrin α4β7/ITGA4-ITGB7、IL-6/IL6、Myostatin/GDF8、TrkB/NTRK2、CD40LG/CD40LG、ARSA/ARSA、APOA1/APOA1、APOE/APOE、EPO/EPO、DMD/DMD、APC/APC、EPOR/EPOR、TTR/TTR、IL12B/IL12B、IFNG/IFNG、FKBP1A/FKBP1A、CRP/CRP、IL1B/IL1B、IL4R/IL4R、TNNI3/TNNI3、PAH/PAH、IMPDH1/IMPDH1、TGFB1/TGFB1、ERBB3/ERBB3、IL6R/IL6R、IFNAR2/IFNAR2、CXCL10/CXCL10、NR1H4 / FXR/NR1H4、MYBPC3/MYBPC3、HLA-DRB1/HLA-DRB1、PRNP/PRNP、ACE2/ACE2、KIT/KIT、TP53/TP53、RARB/RARB、TNFRSF17/TNFRSF17、HPRT1/HPRT1、IL2RA/IL2RA、ALDH2/ALDH2、KITLG/KITLG、PDHX/PDHX、BRAF/BRAF、F10/F10、IL10/IL10、NCAM1/NCAM1、ADK/ADK、MYD88/MYD88、SCN2A/SCN2A、HMGB1/HMGB1、SIGLEC8/SIGLEC8、SERPING1/SERPING1、MMP8/MMP8、SERPINA1/SERPINA1、CD55/CD55、PRSS1/PRSS1、REN/REN、VDR/VDR、PTK2B/PTK2B、HECTD1/HECTD1、JAK1/JAK1、BMPR2/BMPR2、DST/DST、THRB/THRB、CHEK2/CHEK2、ADA2/ADA2、ADRB2/ADRB2、RAF1/RAF1、CTLA4/CTLA4、NF1/NF1、RB1/RB1、CALR/CALR、VAMP2/VAMP2、NKX2-5/NKX2-5、MMP1/MMP1、IL21/IL21、PKP2/PKP2、F2 / thrombin/F2、MEN1/MEN1、CHRM2/CHRM2、FLCN/FLCN、IL18/IL18、GABRB3/GABRB3、FTO/FTO、FGFR1/FGFR1、TOP2A/TOP2A、MMP13/MMP13、HBB/HBB、IL17A/IL17A、OAS1/OAS1、GRIK1/GRIK1、FCGRT / FcRn/FCGRT、KRAS/KRAS、NR3C1/NR3C1、STAG2/STAG2、AXL/AXL、RET/RET、MYOC/MYOC、AGTR1/AGTR1、ODC1/ODC1、KRT10/KRT10、IDH1/IDH1、PTGS2/PTGS2、SLC6A4 / SERT/SLC6A4、GAA/GAA、NTRK2/NTRK2、FBN1/FBN1、COL4A1/COL4A1、DRD4/DRD4、CNR1/CNR1、ATP4A/ATP4A、DICER1/DICER1、PLAT/PLAT、HTR2A/HTR2A、GNAS/GNAS、DRD2/DRD2、NTRK1/NTRK1、COL3A1/COL3A1、SUCLG1/SUCLG1、PSPH/PSPH、GUCY1A1/GUCY1A1、ADRA2B/ADRA2B、ATM/ATM、CACNA1G/CACNA1G、PROC/PROC、CFTR/CFTR、KLKB1/KLKB1、MYH7/MYH7、ABCB4/ABCB4、TG/TG、RYR1/RYR1、JAK2/JAK2、GABRB2/GABRB2、AVPR2/AVPR2、TLR7/TLR7、SCN1A/SCN1A、LHCGR/LHCGR、PDE3A/PDE3A、ALK/ALK、SPINK1/SPINK1、MMP7/MMP7、ATP2C1/ATP2C1、TLR9/TLR9、GREM1/GREM1、OPRM1/OPRM1、GUCY2C/GUCY2C、GPR161/GPR161、ADRB1/ADRB1、CTNNB1/CTNNB1、SCNN1B/SCNN1B、BEST1/BEST1、SLC6A3/SLC6A3、CHRNA1/CHRNA1、GNAI1/GNAI1、SCN5A/SCN5A、NKX2-1/NKX2-1

共 269 个靶点标签。

## 完整靶点列表

| # | 靶点名称 (promptLabel) | target | gene | 别名 | 物种 | 抗体格式 | PDB文件数 | 结构来源 |
|---|------------------------|--------|------|------|------|----------|----------|----------|
| 1 | IL-33/IL33 | IL-33 | IL33 | IL33 | Homo sapiens | Fab | 15 | 9X0J |
| 2 | TSLP | TSLP | TSLP | TSLP | Homo sapiens | Fab | 10 | 5J13 |
| 3 | PD-L1/CD274 | PD-L1 | CD274 | CD274, B7-H1, PDL1 | Homo sapiens | Fab | 10 | 5X8L |
| 4 | PD-1/PDCD1 | PD-1 | PDCD1 | PDCD1, PD1 | Homo sapiens | Fab | 10 | 5WT9 |
| 5 | CTLA-4/CTLA4 | CTLA-4 | CTLA4 | CTLA4, CD152 | Homo sapiens | Fab | 10 | 6RP8 |
| 6 | CD20/MS4A1 | CD20 | MS4A1 | MS4A1 | Homo sapiens | Fab | 10 | 6VJA |
| 7 | CD19 | CD19 | CD19 | CD19 | Homo sapiens | Fab | 10 | 6AL5 |
| 8 | CD3/CD3E/CD3G | CD3 | CD3E/CD3G | CD3E, CD3 epsilon | Homo sapiens | Fab | 10 | 1SY6 |
| 9 | CD4 | CD4 | CD4 |  | Homo sapiens | Fab | 1 | 3O2D |
| 10 | C5 | C5 | C5 | Complement C5 | Homo sapiens | Fab | 10 | 5I5K |
| 11 | CFH | CFH | CFH |  | Homo sapiens | VHH | 1 | 7WKI |
| 12 | IL-6R/IL6R | IL-6R | IL6R | IL6R, CD126, IL-6Rα | Homo sapiens | Fab | 10 | 8J6F |
| 13 | IL-4Rα/IL4R | IL-4Rα | IL4R | IL4R, IL4RA, CD124 | Homo sapiens | Fab | 10 | 6WGL |
| 14 | CD25/IL2RA | CD25 | IL2RA | IL2RA | Homo sapiens | Fab | 10 | 3NFP |
| 15 | CD38 | CD38 | CD38 | CD38 | Homo sapiens | Fab | 10 | 7DUO |
| 16 | TIGIT | TIGIT | TIGIT | TIGIT | Homo sapiens | Fab | 10 | 8VTD |
| 17 | CD47 | CD47 | CD47 | CD47 | Homo sapiens | Fab | 10 | 8ZCA |
| 18 | LAG-3/LAG3 | LAG-3 | LAG3 | LAG3 | Homo sapiens | Fab | 10 | 8SO3 |
| 19 | TROP-2/TACSTD2 | TROP-2 | TACSTD2 | TACSTD2 | Homo sapiens | Fab | 10 | 9PI9 |
| 20 | Tissue Factor/F3 | Tissue Factor | F3 | F3, CD142, Thromboplastin, Coagulation factor III | Homo sapiens | Fab | 1 | 1UJ3 |
| 21 | BCMA/TNFRSF17 | BCMA | TNFRSF17 | TNFRSF17, CD269 | Homo sapiens | Fab | 10 | 9MQO |
| 22 | IgE/IGH | IgE | IGH | Immunoglobulin E | Homo sapiens | Fab | 10 | 5G64 |
| 23 | CGRP receptor/CALCRL/RAMP1 | CGRP receptor | CALCRL/RAMP1 | CGRPR, CALCRL, RAMP1 | Homo sapiens | Fab | 10 | 6UMG |
| 24 | HER2/ERBB2 | HER2 | ERBB2 | ERBB2, HER-2 | Homo sapiens | Fab | 10 | 1N8Z |
| 25 | EGFR | EGFR | EGFR | ERBB1 | Homo sapiens | Fab | 10 | 1YY9 |
| 26 | VEGF-A/VEGFA | VEGF-A | VEGFA | VEGFA, VEGF | Homo sapiens | Fab | 10 | 1BJ1 |
| 27 | TNF | TNF | TNF | TNF-alpha, TNFα | Homo sapiens | Fab | 10 | 5WUX |
| 28 | IL-17A/IL17A | IL-17A | IL17A | IL17A | Homo sapiens | Fab | 10 | 2VXS |
| 29 | IL-23/IL23A/IL12B | IL-23 | IL23A/IL12B | IL23, IL23A | Homo sapiens | Fab | 10 | 3D85 |
| 30 | RSV F/F | RSV F | F | Respiratory syncytial virus F, RSV fusion protein | Respiratory syncytial virus | Fab | 10 | 5W23 |
| 31 | SARS-CoV-2 RBD/S | SARS-CoV-2 RBD | S | SARS-CoV-2 receptor-binding domain, SC2 RBD, RBD | Severe acute respiratory syndrome coronavirus 2 | Fab | 10 | 6XDG |
| 32 | Influenza HA/HA | Influenza HA | HA | Influenza hemagglutinin, Flu HA, 血凝素 | Influenza A virus | Fab | 10 | 3GBM |
| 33 | Influenza NA/NA | Influenza NA | NA | Influenza neuraminidase, Flu NA, 神经氨酸酶 | Influenza A virus | Fab | 10 | 1NCD |
| 34 | PCSK9 | PCSK9 | PCSK9 | PCSK9 | Homo sapiens | Fab | 10 | 3SQO |
| 35 | ANGPTL3 | ANGPTL3 | ANGPTL3 | ANGPTL3 | Homo sapiens | Fab | 10 | 6EUA |
| 36 | IL-1B/IL1B | IL-1B | IL1B | IL1B, IL-1β, IL-1 beta | Homo sapiens | Fab | 10 | 5BVP |
| 37 | GIPR | GIPR | GIPR | GIP receptor | Homo sapiens | Fab | 10 | 4HJ0 |
| 38 | Amyloid-beta/APP | Amyloid-beta | APP | Aβ, Abeta, Amyloid beta, Amyloid-beta | Homo sapiens | Fab | 1 | 4OJF |
| 39 | Tau/MAPT | Tau | MAPT | MAPT, PHF-Tau, Tau protein | Homo sapiens | Fab | 1 | 6PXR |
| 40 | TREM2 | TREM2 | TREM2 | Triggering receptor expressed on myeloid cells 2 | Homo sapiens | Fab | 1 | 9PWN |
| 41 | DAT/SLC6A3 | DAT | SLC6A3 | SLC6A3, DAT1, dopamine transporter | Homo sapiens | Fab | 10 | 9EO4 |
| 42 | TSHR | TSHR | TSHR | Thyrotropin receptor, Thyroid-stimulating hormone receptor, 促甲状腺激素受体 | Homo sapiens | Fab | 1 | 7T9M |
| 43 | alpha-synuclein/SNCA | alpha-synuclein | SNCA | SNCA, α-synuclein, Alpha synuclein, 突触核蛋白 | Homo sapiens | Fab | 1 | 8OG0 |
| 44 | AQP4 | AQP4 | AQP4 | AQP-4, Aquaporin-4, 水通道蛋白4 | Homo sapiens | Fab | 1 | 8V91 |
| 45 | Canine NGF/NGF | Canine NGF | NGF | dog NGF, dog nerve growth factor, 犬源 NGF, 犬 NGF | Canis lupus familiaris | Fab | 10 | 4EDW |
| 46 | PF4/CXCL4 | PF4 | CXCL4 | CXCL4, platelet factor 4 | Homo sapiens | Fab | 10 | 1F9Q |
| 47 | Adenovirus hexon/L3 | Adenovirus hexon | L3 | human adenovirus hexon, adenovirus hexon, HAdV hexon | Human adenovirus 57 | Fab | 10 | 10DP |
| 48 | Influenza M2/M2 | Influenza M2 | M2 | M2e, matrix protein 2, influenza matrix protein 2 | Influenza A virus | Fab | 10 | 4N8C |
| 49 | PRRSV GP4/GP4 | PRRSV GP4 | GP4 | PRRSV-2 GP4, GP4, porcine reproductive and respiratory syndrome virus GP4 | Porcine reproductive and respiratory syndrome virus | Fab | 10 | 29TJ |
| 50 | PRRSV NSP10/NSP10 | PRRSV NSP10 | NSP10 | PRRSV nsp10, NSP10, porcine reproductive and respiratory syndrome virus NSP10 | Porcine reproductive and respiratory syndrome virus | Fab | 10 | 6JDS |
| 51 | HSV gD/gD | HSV gD | gD | gD, glycoprotein D, HSV glycoprotein D | Human herpesvirus 1 | Fab | 10 | 2C36 |
| 52 | PCV2 capsid/CAP | PCV2 capsid | CAP | PCV2, porcine circovirus 2 capsid, CAP, ORF2 | Porcine circovirus 2 | Fab | 10 | 3R0R |
| 53 | PEDV spike/S | PEDV spike | S | PEDV S, spike glycoprotein, porcine epidemic diarrhea virus spike | Porcine epidemic diarrhea virus | Fab | 10 | 6VV5 |
| 54 | CSFV NS5B/NS5B | CSFV NS5B | NS5B | classical swine fever virus NS5B, NS5B | Classical swine fever virus | Fab | 10 | 7EKJ |
| 55 | Feline panleukopenia VP2/VP2 | Feline panleukopenia VP2 | VP2 | FPV VP2, feline panleukopenia virus VP2, parvovirus VP2 | Feline panleukopenia virus | Fab | 10 | 1FPV |
| 56 | Connexin-26/GJB2 | Connexin-26 | GJB2 | GJB2, CX26, connexin-26 | Homo sapiens | Fab | 10 | 2ZW3 |
| 57 | DLL3 | DLL3 | DLL3 | DLL3, Delta-like ligand 3 | Homo sapiens | Fab | 5 | 6H9Y |
| 58 | FOLR1 | FOLR1 | FOLR1 | FOLR1, FOL-alpha, folate receptor alpha | Homo sapiens | Fab | 5 | 4LRH |
| 59 | ROR1 | ROR1 | ROR1 | ROR1, receptor tyrosine kinase-like orphan receptor 1 | Homo sapiens | Fab | 5 | 6A5F |
| 60 | CD30/TNFRSF8 | CD30 | TNFRSF8 | TNFRSF8, CD30 antigen | Homo sapiens | VHH | 5 | 5XBN |
| 61 | FLT3 | FLT3 | FLT3 | FLT3, FLK2, CD135 | Homo sapiens | Fab | 5 | 1RJQ |
| 62 | CD70 | CD70 | CD70 | CD70, CD27 ligand, TNFSF7 | Homo sapiens | Fab | 5 | 4F77 |
| 63 | PTK7 | PTK7 | PTK7 | PTK7, protein tyrosine kinase 7 | Homo sapiens | Fab | 5 | 6AY3 |
| 64 | PSMA/FOLH1 | PSMA | FOLH1 | FOLH1, GCPII, glutamate carboxypeptidase II | Homo sapiens | Fab | 5 | 2X6G |
| 65 | CD74 | CD74 | CD74 | CD74, HLA class II histocompatibility antigen gamma chain | Homo sapiens | Fab | 5 | 2WRH |
| 66 | TIM-3/HAVCR2 | TIM-3 | HAVCR2 | HAVCR2, T-cell immunoglobulin and mucin domain-containing protein 3 | Homo sapiens | Fab | 5 | 5F71 |
| 67 | GITR/TNFRSF18 | GITR | TNFRSF18 | TNFRSF18, CD357 | Homo sapiens | Fab | 5 | 5WHD |
| 68 | OX40/TNFRSF4 | OX40 | TNFRSF4 | TNFRSF4, CD134 | Homo sapiens | VHH | 5 | 5I8J |
| 69 | 4-1BB/TNFRSF9 | 4-1BB | TNFRSF9 | TNFRSF9, CD137 | Homo sapiens | Fab | 5 | 4ZGP |
| 70 | CD40/TNFRSF5 | CD40 | TNFRSF5 | TNFRSF5, CD40 antigen | Homo sapiens | Fab | 5 | 5L01 |
| 71 | CD27/TNFRSF7 | CD27 | TNFRSF7 | TNFRSF7, T14 | Homo sapiens | Fab | 5 | 5NLE |
| 72 | DR5/TNFRSF10B | DR5 | TNFRSF10B | TNFRSF10B, TRAIL receptor 2, CD262 | Homo sapiens | VHH | 5 | 5C85 |
| 73 | CLDN6 | CLDN6 | CLDN6 | CLDN6, Claudin-6 | Homo sapiens | Fab | 5 | 6XG7 |
| 74 | CDH6 | CDH6 | CDH6 | CDH6, K-cadherin | Homo sapiens | VHH | 5 | 5C4H |
| 75 | PRLR | PRLR | PRLR | PRLR, prolactin receptor | Homo sapiens | Fab | 5 | 3D48 |
| 76 | SSTR2 | SSTR2 | SSTR2 | SSTR2, somatostatin receptor 2 | Homo sapiens | Fab | 5 | 6WB4 |
| 77 | GUCY2C | GUCY2C | GUCY2C | GUCY2C, GC-C, guanylate cyclase C | Homo sapiens | VHH | 5 | 6B25 |
| 78 | IL-31/IL31 | IL-31 | IL31 | IL31, interleukin-31 | Homo sapiens | Fab | 5 | 5N0Y |
| 79 | IL-17RA/IL17RA | IL-17RA | IL17RA | IL17RA, IL-17 receptor A | Homo sapiens | Fab | 5 | 6I1K |
| 80 | GM-CSF/CSF2 | GM-CSF | CSF2 | CSF2, granulocyte-macrophage colony-stimulating factor | Homo sapiens | VHH | 5 | 4RSK |
| 81 | IL-36α/IL36A | IL-36α | IL36A | IL36A, IL-36 alpha | Homo sapiens | Fab | 5 | 4I6B |
| 82 | BAFF-R/TNFRSF13C | BAFF-R | TNFRSF13C | TNFRSF13C, BAFF receptor, CD268 | Homo sapiens | Fab | 5 | 6E0M |
| 83 | GLP-1R/GLP1R | GLP-1R | GLP1R | GLP1R, GLP-1 receptor, glucagon-like peptide 1 receptor | Homo sapiens | Fab | 5 | 5NX2 |
| 84 | FGF21 | FGF21 | FGF21 | FGF21, fibroblast growth factor 21 | Homo sapiens | VHH | 5 | 6M6E |
| 85 | LGR5 | LGR5 | LGR5 | LGR5, GPR49, leucine-rich repeat-containing G protein-coupled receptor 5 | Homo sapiens | Fab | 5 | 4BSF |
| 86 | BACE1 | BACE1 | BACE1 | BACE1, beta-site APP cleaving enzyme 1 | Homo sapiens | Fab | 5 | 1FKN |
| 87 | Leptin receptor/LEPR | Leptin receptor | LEPR | LEPR, LEP-R, obesity receptor | Homo sapiens | Fab | 5 | 6V76 |
| 88 | Dengue E/DENV-E | Dengue E | DENV-E | dengue virus envelope protein, DENV E | Dengue virus | Fab | 5 | 1OAN |
| 89 | Zika NS1/ZIKV-NS1 | Zika NS1 | ZIKV-NS1 | Zika virus non-structural protein 1, ZIKV NS1 | Zika virus | Fab | 5 | 5GS6 |
| 90 | Rabies G/RABV-G | Rabies G | RABV-G | rabies virus glycoprotein, RABV G | Rabies virus | Fab | 5 | 6W8J |
| 91 | CMV gB/HCMV-UL55 | CMV gB | HCMV-UL55 | cytomegalovirus glycoprotein B, HCMV gB | Human cytomegalovirus | Fab | 5 | 5ZB3 |
| 92 | CD22/Siglec-2 | CD22 | CD22 | SIGLEC2, B-cell receptor CD22, Leu-14 | Homo sapiens | Fab | 1 | 5VL3 |
| 93 | Mesothelin/MSLN | Mesothelin | MSLN | MSLN, CAK1, SMRP | Homo sapiens | Fab | 1 | 7UED |
| 94 | Claudin 18.2/CLDN18 | Claudin 18.2 | CLDN18 | CLDN18.2, Claudin-18.2, Claudin 18.2 | Homo sapiens | Fab | 1 | 9V32 |
| 95 | MET/c-MET | MET | MET | c-MET, MET receptor, HGF receptor, Hepatocyte growth factor receptor | Homo sapiens | Fab | 1 | 6I04 |
| 96 | HER3/ERBB3 | HER3 | ERBB3 | ERBB3, ErbB3, Receptor tyrosine-protein kinase erbB-3 | Homo sapiens | Fab | 1 | 7D85 |
| 97 | B7-H3/CD276 | B7-H3 | CD276 | CD276, B7H3, B7-H3/CD276 | Homo sapiens | Fab | 1 | 9LY5 |
| 98 | B7-H6/NCR3LG1 | B7-H6 | NCR3LG1 | NCR3LG1, B7H6, Natural cytotoxicity triggering receptor 3 ligand 1 | Homo sapiens | Fab | 1 | 4ZSO |
| 99 | MUC1 | MUC1 | MUC1 | Mucin-1, CD227 | Homo sapiens | Fab | 1 | 7V7K |
| 100 | Nectin-4/NECTIN4 | Nectin-4 | NECTIN4 | NECTIN4, PVRL4, Nectin4 | Homo sapiens | Fab | 1 | 9KKJ |
| 101 | FGFR2/KGFR | FGFR2 | FGFR2 | Fibroblast growth factor receptor 2, FGFR2b, KGFR, K-SAM | Homo sapiens | Fab | 1 | 4WV1 |
| 102 | FGFR3 | FGFR3 | FGFR3 | Fibroblast growth factor receptor 3, JTK4 | Homo sapiens | Fab | 1 | 3GRW |
| 103 | GPRC5D | GPRC5D | GPRC5D | GPCR family C group 5 member D | Homo sapiens | Fab | 1 | 9IMA |
| 104 | CEACAM5/CEA | CEACAM5 | CEACAM5 | CEA, Carcinoembryonic antigen, CD66e | Homo sapiens | Fab | 1 | 8BW0 |
| 105 | STEAP1 | STEAP1 | STEAP1 | STEAP-1, Six-transmembrane epithelial antigen of the prostate 1 | Homo sapiens | Fab | 1 | 6Y9B |
| 106 | CAIX/CA9 | CAIX | CA9 | CA9, Carbonic anhydrase IX, Carbonic anhydrase 9, G250, MN | Homo sapiens | Fab | 1 | 2HKF |
| 107 | IL-5/IL5 | IL-5 | IL5 | IL5, Interleukin-5 | Homo sapiens | Fab | 1 | 9GVN |
| 108 | IL-13/IL13 | IL-13 | IL13 | IL13, Interleukin-13 | Homo sapiens | Fab | 1 | 5L6Y |
| 109 | CD123/IL3RA | CD123 | IL3RA | IL3RA, Interleukin-3 receptor alpha, IL-3R alpha | Homo sapiens | Fab | 1 | 4JZJ |
| 110 | BAFF/TNFSF13B | BAFF | TNFSF13B | BLyS, B-cell activating factor, TNFSF13B, TALL-1 | Homo sapiens | Fab | 1 | 6FXN |
| 111 | FcRn/FCGRT | FcRn | FCGRT | FCRN, Neonatal Fc receptor, FCGRT | Homo sapiens | Fab | 1 | 9MI6 |
| 112 | NGF | NGF | NGF | Beta-NGF, Nerve growth factor | Homo sapiens | Fab | 1 | 4EDW |
| 113 | CD33/Siglec-3 | CD33 | CD33 | SIGLEC3, Siglec-3, Myeloid cell surface antigen CD33 | Homo sapiens | Fab | 1 | 9VL2 |
| 114 | GPC2/Glypican-2 | GPC2 | GPC2 | Glypican-2, GPC-2, Cerebroglycan | Homo sapiens | Fab | 1 | 6WJL |
| 115 | Integrin α4β7/ITGA4-ITGB7 | Integrin α4β7 | ITGA4 / ITGB7 | Integrin alpha4beta7, alpha4beta7, A4B7, α4β7, ITGA4/ITGB7 | Homo sapiens | Fab | 1 | 3V4P |
| 116 | IL-6/IL6 | IL-6 | IL6 | IL6, Interleukin-6 | Homo sapiens | Fab | 1 | 4ZS7 |
| 117 | Myostatin/GDF8 | Myostatin | GDF8 | MSTN, GDF8, Growth/differentiation factor 8 | Homo sapiens | Fab | 1 | 5F3H |
| 118 | TrkB/NTRK2 | TrkB | NTRK2 | NTRK2, Tropomyosin receptor kinase B, Neurotrophic tyrosine kinase receptor type 2 | Homo sapiens | Fab | 1 | 5MO9 |
| 119 | CD40LG/CD40LG | CD40LG | CD40LG | CD40LG, CD40LG | HOMO SAPIENS | VHH | 1 | 1ALY |
| 120 | ARSA/ARSA | ARSA | ARSA | ARSA, ARSA | HOMO SAPIENS | Fab | 1 | 1AUK |
| 121 | APOA1/APOA1 | APOA1 | APOA1 | APOA1, APOA1 | HOMO SAPIENS | Fab | 1 | 1AV1 |
| 122 | APOE/APOE | APOE | APOE | APOE, APOE | HOMO SAPIENS | VHH | 1 | 1B68 |
| 123 | EPO/EPO | EPO | EPO | EPO, EPO | HOMO SAPIENS | VHH | 1 | 1BUY |
| 124 | DMD/DMD | DMD | DMD | DMD, DMD | HOMO SAPIENS | Fab | 1 | 1DXX |
| 125 | APC/APC | APC | APC | APC, APC | HOMO SAPIENS | VHH | 1 | 1EMU |
| 126 | EPOR/EPOR | EPOR | EPOR | EPOR, EPOR | HOMO SAPIENS | Fab | 1 | 1ERN |
| 127 | TTR/TTR | TTR | TTR | TTR, TTR | HOMO SAPIENS | Fab | 1 | 1F41 |
| 128 | IL12B/IL12B | IL12B | IL12B | IL12B, IL12B | HOMO SAPIENS | Fab | 1 | 1F45 |
| 129 | IFNG/IFNG | IFNG | IFNG | IFNG, IFNG | HOMO SAPIENS | Fab | 1 | 1FG9 |
| 130 | FKBP1A/FKBP1A | FKBP1A | FKBP1A | FKBP1A, FKBP1A | HOMO SAPIENS | VHH | 1 | 1FKJ |
| 131 | CRP/CRP | CRP | CRP | CRP, CRP | HOMO SAPIENS | Fab | 1 | 1GNH |
| 132 | IL1B/IL1B | IL1B | IL1B | IL1B, IL1B | HOMO SAPIENS | VHH | 1 | 1I1B |
| 133 | IL4R/IL4R | IL4R | IL4R | IL4R, IL4R | HOMO SAPIENS | Fab | 1 | 1IAR |
| 134 | TNNI3/TNNI3 | TNNI3 | TNNI3 | TNNI3, TNNI3 | HOMO SAPIENS | Fab | 1 | 1J1E |
| 135 | PAH/PAH | PAH | PAH | PAH, PAH | HOMO SAPIENS | Fab | 1 | 1J8T |
| 136 | IMPDH1/IMPDH1 | IMPDH1 | IMPDH1 | IMPDH1, IMPDH1 | HOMO SAPIENS | Fab | 1 | 1JCN |
| 137 | TGFB1/TGFB1 | TGFB1 | TGFB1 | TGFB1, TGFB1 | HOMO SAPIENS | VHH | 1 | 1KLC |
| 138 | ERBB3/ERBB3 | ERBB3 | ERBB3 | ERBB3, ERBB3 | HOMO SAPIENS | Fab | 1 | 1M6B |
| 139 | IL6R/IL6R | IL6R | IL6R | IL6R, IL6R | HOMO SAPIENS | Fab | 1 | 1N26 |
| 140 | IFNAR2/IFNAR2 | IFNAR2 | IFNAR2 | IFNAR2, IFNAR2 | HOMO SAPIENS | VHH | 1 | 1N6V |
| 141 | CXCL10/CXCL10 | CXCL10 | CXCL10 | CXCL10, CXCL10 | HOMO SAPIENS | Fab | 1 | 1O7Y |
| 142 | NR1H4 / FXR/NR1H4 | NR1H4 / FXR | NR1H4 | NR1H4, NR1H4 / FXR | HOMO SAPIENS | Fab | 1 | 1OSH |
| 143 | MYBPC3/MYBPC3 | MYBPC3 | MYBPC3 | MYBPC3, MYBPC3 | HOMO SAPIENS | VHH | 1 | 1PD6 |
| 144 | HLA-DRB1/HLA-DRB1 | HLA-DRB1 | HLA-DRB1 | HLA-DRB1, HLA-DRB1 | HOMO SAPIENS | Fab | 1 | 1PYW |
| 145 | PRNP/PRNP | PRNP | PRNP | PRNP, PRNP | HOMO SAPIENS | VHH | 1 | 1QLX |
| 146 | ACE2/ACE2 | ACE2 | ACE2 | ACE2, ACE2 | HOMO SAPIENS | Fab | 1 | 1R42 |
| 147 | KIT/KIT | KIT | KIT | KIT, KIT | HOMO SAPIENS | Fab | 1 | 1T45 |
| 148 | TP53/TP53 | TP53 | TP53 | TP53, TP53 | HOMO SAPIENS | VHH | 1 | 1TUP |
| 149 | RARB/RARB | RARB | RARB | RARB, RARB | HOMO SAPIENS | Fab | 1 | 1XAP |
| 150 | TNFRSF17/TNFRSF17 | TNFRSF17 | TNFRSF17 | TNFRSF17, TNFRSF17 | MUS MUSCULUS | Fab | 1 | 1XU2 |
| 151 | HPRT1/HPRT1 | HPRT1 | HPRT1 | HPRT1, HPRT1 | HOMO SAPIENS | Fab | 1 | 1Z7G |
| 152 | IL2RA/IL2RA | IL2RA | IL2RA | IL2RA, IL2RA | HOMO SAPIENS | VHH | 1 | 1Z92 |
| 153 | ALDH2/ALDH2 | ALDH2 | ALDH2 | ALDH2, ALDH2 | HOMO SAPIENS | Fab | 1 | 1ZUM |
| 154 | KITLG/KITLG | KITLG | KITLG | KITLG, KITLG | HOMO SAPIENS | Fab | 1 | 2E9W |
| 155 | PDHX/PDHX | PDHX | PDHX | PDHX, PDHX | HOMO SAPIENS | VHH | 1 | 2F60 |
| 156 | BRAF/BRAF | BRAF | BRAF | BRAF, BRAF | HOMO SAPIENS | Fab | 1 | 2FB8 |
| 157 | F10/F10 | F10 | F10 | F10, F10 | HOMO SAPIENS | Fab | 1 | 2GD4 |
| 158 | IL10/IL10 | IL10 | IL10 | IL10, IL10 | HOMO SAPIENS | VHH | 1 | 2H24 |
| 159 | NCAM1/NCAM1 | NCAM1 | NCAM1 | NCAM1, NCAM1 | HOMO SAPIENS | VHH | 1 | 2HAZ |
| 160 | ADK/ADK | ADK | ADK | ADK, ADK | HOMO SAPIENS | Fab | 1 | 2I6A |
| 161 | MYD88/MYD88 | MYD88 | MYD88 | MYD88, MYD88 | HOMO SAPIENS | VHH | 1 | 2JS7 |
| 162 | SCN2A/SCN2A | SCN2A | SCN2A | SCN2A, SCN2A | HOMO SAPIENS | VHH | 1 | 2KAV |
| 163 | HMGB1/HMGB1 | HMGB1 | HMGB1 | HMGB1, HMGB1 | HOMO SAPIENS | VHH | 1 | 2LY4 |
| 164 | SIGLEC8/SIGLEC8 | SIGLEC8 | SIGLEC8 | SIGLEC8, SIGLEC8 | HOMO SAPIENS | VHH | 1 | 2N7B |
| 165 | SERPING1/SERPING1 | SERPING1 | SERPING1 | SERPING1, SERPING1 | HOMO SAPIENS | Fab | 1 | 2OAY |
| 166 | MMP8/MMP8 | MMP8 | MMP8 | MMP8, MMP8 | HOMO SAPIENS | Fab | 1 | 2OY4 |
| 167 | SERPINA1/SERPINA1 | SERPINA1 | SERPINA1 | SERPINA1, SERPINA1 | HOMO SAPIENS | Fab | 1 | 2QUG |
| 168 | CD55/CD55 | CD55 | CD55 | CD55, CD55 | HOMO SAPIENS | VHH | 1 | 2QZD |
| 169 | PRSS1/PRSS1 | PRSS1 | PRSS1 | PRSS1, PRSS1 | HOMO SAPIENS | Fab | 1 | 2RA3 |
| 170 | REN/REN | REN | REN | REN, REN | HOMO SAPIENS | Fab | 1 | 2REN |
| 171 | VDR/VDR | VDR | VDR | VDR, VDR | HOMO SAPIENS | Fab | 1 | 3A78 |
| 172 | PTK2B/PTK2B | PTK2B | PTK2B | PTK2B, PTK2B | HOMO SAPIENS | Fab | 1 | 3CC6 |
| 173 | HECTD1/HECTD1 | HECTD1 | HECTD1 | HECTD1, HECTD1 | HOMO SAPIENS | VHH | 1 | 3DKM |
| 174 | JAK1/JAK1 | JAK1 | JAK1 | JAK1, JAK1 | HOMO SAPIENS | Fab | 1 | 3EYG |
| 175 | BMPR2/BMPR2 | BMPR2 | BMPR2 | BMPR2, BMPR2 | HOMO SAPIENS | Fab | 1 | 3G2F |
| 176 | DST/DST | DST | DST | DST, DST | HOMO SAPIENS | Fab | 1 | 3GJO |
| 177 | THRB/THRB | THRB | THRB | THRB, THRB | HOMO SAPIENS | Fab | 1 | 3GWS |
| 178 | CHEK2/CHEK2 | CHEK2 | CHEK2 | CHEK2, CHEK2 | HOMO SAPIENS | Fab | 1 | 3I6U |
| 179 | ADA2/ADA2 | ADA2 | ADA2 | ADA2, ADA2 | HOMO SAPIENS | Fab | 1 | 3LGG |
| 180 | ADRB2/ADRB2 | ADRB2 | ADRB2 | ADRB2, ADRB2 | HOMO SAPIENS, ENTEROBACTERIA PHAGE T4 | Fab | 1 | 3NY9 |
| 181 | RAF1/RAF1 | RAF1 | RAF1 | RAF1, RAF1 | HOMO SAPIENS | Fab | 1 | 3OMV |
| 182 | CTLA4/CTLA4 | CTLA4 | CTLA4 | CTLA4, CTLA4 | HOMO SAPIENS | Fab | 1 | 3OSK |
| 183 | NF1/NF1 | NF1 | NF1 | NF1, NF1 | HOMO SAPIENS | Fab | 1 | 3P7Z |
| 184 | RB1/RB1 | RB1 | RB1 | RB1, RB1 | HOMO SAPIENS | Fab | 1 | 3POM |
| 185 | CALR/CALR | CALR | CALR | CALR, CALR | HOMO SAPIENS | Fab | 1 | 3POW |
| 186 | VAMP2/VAMP2 | VAMP2 | VAMP2 | VAMP2, VAMP2 | HOMO SAPIENS | VHH | 1 | 3RK2 |
| 187 | NKX2-5/NKX2-5 | NKX2-5 | NKX2-5 | NKX2-5, NKX2-5 | HOMO SAPIENS | VHH | 1 | 3RKQ |
| 188 | MMP1/MMP1 | MMP1 | MMP1 | MMP1, MMP1 | HOMO SAPIENS | Fab | 1 | 3SHI |
| 189 | IL21/IL21 | IL21 | IL21 | IL21, IL21 | HOMO SAPIENS | Fab | 1 | 3TGX |
| 190 | PKP2/PKP2 | PKP2 | PKP2 | PKP2, PKP2 | HOMO SAPIENS | Fab | 1 | 3TT9 |
| 191 | F2 / thrombin/F2 | F2 / thrombin | F2 | F2, F2 / thrombin | HOMO SAPIENS | Fab | 1 | 3U69 |
| 192 | MEN1/MEN1 | MEN1 | MEN1 | MEN1, MEN1 | HOMO SAPIENS | Fab | 1 | 3U84 |
| 193 | CHRM2/CHRM2 | CHRM2 | CHRM2 | CHRM2, CHRM2 | HOMO SAPIENS, ENTEROBACTERIA PHAGE T4 | Fab | 1 | 3UON |
| 194 | FLCN/FLCN | FLCN | FLCN | FLCN, FLCN | HOMO SAPIENS | Fab | 1 | 3V42 |
| 195 | IL18/IL18 | IL18 | IL18 | IL18, IL18 | HOMO SAPIENS | Fab | 1 | 3WO2 |
| 196 | GABRB3/GABRB3 | GABRB3 | GABRB3 | GABRB3, GABRB3 | HOMO SAPIENS | Fab | 1 | 4COF |
| 197 | FTO/FTO | FTO | FTO | FTO, FTO | HOMO SAPIENS | Fab | 1 | 4CXW |
| 198 | FGFR1/FGFR1 | FGFR1 | FGFR1 | FGFR1, FGFR1 | HOMO SAPIENS | Fab | 1 | 4F64 |
| 199 | TOP2A/TOP2A | TOP2A | TOP2A | TOP2A, TOP2A | HOMO SAPIENS | Fab | 1 | 4FM9 |
| 200 | MMP13/MMP13 | MMP13 | MMP13 | MMP13, MMP13 | HOMO SAPIENS | Fab | 1 | 4FU4 |
| 201 | HBB/HBB | HBB | HBB | HBB, HBB | HOMO SAPIENS | Fab | 1 | 4HHB |
| 202 | IL17A/IL17A | IL17A | IL17A | IL17A, IL17A | HOMO SAPIENS | VHH | 1 | 4HR9 |
| 203 | OAS1/OAS1 | OAS1 | OAS1 | OAS1, OAS1 | HOMO SAPIENS | Fab | 1 | 4IG8 |
| 204 | GRIK1/GRIK1 | GRIK1 | GRIK1 | GRIK1, GRIK1 | HOMO SAPIENS | Fab | 1 | 4MF3 |
| 205 | FCGRT / FcRn/FCGRT | FCGRT / FcRn | FCGRT | FCGRT, FCGRT / FcRn | HOMO SAPIENS | VHH | 1 | 4N0U |
| 206 | KRAS/KRAS | KRAS | KRAS | KRAS, KRAS | HOMO SAPIENS | Fab | 1 | 4OBE |
| 207 | NR3C1/NR3C1 | NR3C1 | NR3C1 | NR3C1, NR3C1 | HOMO SAPIENS | Fab | 1 | 4P6X |
| 208 | STAG2/STAG2 | STAG2 | STAG2 | STAG2, STAG2 | HOMO SAPIENS | Fab | 1 | 4PK7 |
| 209 | AXL/AXL | AXL | AXL | AXL, AXL | HOMO SAPIENS | Fab | 1 | 4RA0 |
| 210 | RET/RET | RET | RET | RET, RET | HOMO SAPIENS | Fab | 1 | 4UX8 |
| 211 | MYOC/MYOC | MYOC | MYOC | MYOC, MYOC | HOMO SAPIENS | Fab | 1 | 4WXQ |
| 212 | AGTR1/AGTR1 | AGTR1 | AGTR1 | AGTR1, AGTR1 | ESCHERICHIA COLI, HOMO SAPIENS | Fab | 1 | 4YAY |
| 213 | ODC1/ODC1 | ODC1 | ODC1 | ODC1, ODC1 | HOMO SAPIENS | Fab | 1 | 4ZGY |
| 214 | KRT10/KRT10 | KRT10 | KRT10 | KRT10, KRT10 | HOMO SAPIENS | VHH | 1 | 4ZRY |
| 215 | IDH1/IDH1 | IDH1 | IDH1 | IDH1, IDH1 | HOMO SAPIENS | Fab | 1 | 5DE1 |
| 216 | PTGS2/PTGS2 | PTGS2 | PTGS2 | PTGS2, PTGS2 | HOMO SAPIENS | Fab | 1 | 5F19 |
| 217 | SLC6A4 / SERT/SLC6A4 | SLC6A4 / SERT | SLC6A4 | SLC6A4, SLC6A4 / SERT | HOMO SAPIENS | Fab | 1 | 5I75 |
| 218 | GAA/GAA | GAA | GAA | GAA, GAA | HOMO SAPIENS | Fab | 1 | 5KZW |
| 219 | NTRK2/NTRK2 | NTRK2 | NTRK2 | NTRK2, NTRK2 | MUS MUSCULUS | Fab | 1 | 5MO9 |
| 220 | FBN1/FBN1 | FBN1 | FBN1 | FBN1, FBN1 | HOMO SAPIENS | VHH | 1 | 5MS9 |
| 221 | COL4A1/COL4A1 | COL4A1 | COL4A1 | COL4A1, COL4A1 | HOMO SAPIENS | Fab | 1 | 5NAY |
| 222 | DRD4/DRD4 | DRD4 | DRD4 | DRD4, DRD4 | HOMO SAPIENS, ESCHERICHIA COLI | Fab | 1 | 5WIU |
| 223 | CNR1/CNR1 | CNR1 | CNR1 | CNR1, CNR1 | HOMO SAPIENS, DESULFOVIBRIO VULGARIS (STRAIN HILDENBOROUGH / ATCC 29579 / DSM 644 / NCIMB 8303) | Fab | 1 | 5XRA |
| 224 | ATP4A/ATP4A | ATP4A | ATP4A | ATP4A, ATP4A | SUS SCROFA | Fab | 1 | 5YLU |
| 225 | DICER1/DICER1 | DICER1 | DICER1 | DICER1, DICER1 | HOMO SAPIENS | Fab | 1 | 5ZAL |
| 226 | PLAT/PLAT | PLAT | PLAT | PLAT, PLAT | HOMO SAPIENS | Fab | 1 | 5ZLZ |
| 227 | HTR2A/HTR2A | HTR2A | HTR2A | HTR2A, HTR2A | HOMO SAPIENS, ESCHERICHIA COLI | Fab | 1 | 6A93 |
| 228 | GNAS/GNAS | GNAS | GNAS | GNAS, GNAS | HOMO SAPIENS | Fab | 1 | 6AU6 |
| 229 | DRD2/DRD2 | DRD2 | DRD2 | DRD2, DRD2 | HOMO SAPIENS, ENTEROBACTERIA PHAGE T4 | Fab | 1 | 6CM4 |
| 230 | NTRK1/NTRK1 | NTRK1 | NTRK1 | NTRK1, NTRK1 | HOMO SAPIENS | Fab | 1 | 6D20 |
| 231 | COL3A1/COL3A1 | COL3A1 | COL3A1 | COL3A1, COL3A1 | HOMO SAPIENS | Fab | 1 | 6FZV |
| 232 | SUCLG1/SUCLG1 | SUCLG1 | SUCLG1 | SUCLG1, SUCLG1 | HOMO SAPIENS | Fab | 1 | 6G4Q |
| 233 | PSPH/PSPH | PSPH | PSPH | PSPH, PSPH | HOMO SAPIENS | Fab | 1 | 6HYJ |
| 234 | GUCY1A1/GUCY1A1 | GUCY1A1 | GUCY1A1 | GUCY1A1, GUCY1A1 | HOMO SAPIENS | Fab | 1 | 6JT0 |
| 235 | ADRA2B/ADRA2B | ADRA2B | ADRA2B | ADRA2B, ADRA2B | HOMO SAPIENS | VHH | 1 | 6K41 |
| 236 | ATM/ATM | ATM | ATM | ATM, ATM | HOMO SAPIENS | Fab | 1 | 6K9L |
| 237 | CACNA1G/CACNA1G | CACNA1G | CACNA1G | CACNA1G, CACNA1G | HOMO SAPIENS | Fab | 1 | 6KZO |
| 238 | PROC/PROC | PROC | PROC | PROC, PROC | HOMO SAPIENS | Fab | 1 | 6M3B |
| 239 | CFTR/CFTR | CFTR | CFTR | CFTR, CFTR | HOMO SAPIENS | Fab | 1 | 6MSM |
| 240 | KLKB1/KLKB1 | KLKB1 | KLKB1 | KLKB1, KLKB1 | HOMO SAPIENS | Fab | 1 | 6O1S |
| 241 | MYH7/MYH7 | MYH7 | MYH7 | MYH7, MYH7 | HOMO SAPIENS | Fab | 1 | 6PFP |
| 242 | ABCB4/ABCB4 | ABCB4 | ABCB4 | ABCB4, ABCB4 | HOMO SAPIENS | Fab | 1 | 6S7P |
| 243 | TG/TG | TG | TG | TG, TG | HOMO SAPIENS | Fab | 1 | 6SCJ |
| 244 | RYR1/RYR1 | RYR1 | RYR1 | RYR1, RYR1 | BACTEROIDES THETAIOTAOMICRON (STRAIN ATCC 29148 / DSM 2079 / NCTC 10582 / E50 / VPI-5482), HOMO SAPIENS | VHH | 1 | 6UHI |
| 245 | JAK2/JAK2 | JAK2 | JAK2 | JAK2, JAK2 | HOMO SAPIENS | Fab | 1 | 6VGL |
| 246 | GABRB2/GABRB2 | GABRB2 | GABRB2 | GABRB2, GABRB2 | HOMO SAPIENS | Fab | 1 | 6X3U |
| 247 | AVPR2/AVPR2 | AVPR2 | AVPR2 | AVPR2, AVPR2 | HOMO SAPIENS | VHH | 1 | 7BB6 |
| 248 | TLR7/TLR7 | TLR7 | TLR7 | TLR7, TLR7 | HOMO SAPIENS | Fab | 1 | 7CYN |
| 249 | SCN1A/SCN1A | SCN1A | SCN1A | SCN1A, SCN1A | HOMO SAPIENS | Fab | 1 | 7DTD |
| 250 | LHCGR/LHCGR | LHCGR | LHCGR | LHCGR, LHCGR | HOMO SAPIENS | Fab | 1 | 7FIJ |
| 251 | PDE3A/PDE3A | PDE3A | PDE3A | PDE3A, PDE3A | HOMO SAPIENS | Fab | 1 | 7L28 |
| 252 | ALK/ALK | ALK | ALK | ALK, ALK | HOMO SAPIENS | Fab | 1 | 7MZY |
| 253 | SPINK1/SPINK1 | SPINK1 | SPINK1 | SPINK1, SPINK1 | HOMO SAPIENS | Fab | 1 | 7QE8 |
| 254 | MMP7/MMP7 | MMP7 | MMP7 | MMP7, MMP7 | HOMO SAPIENS | Fab | 1 | 7WXX |
| 255 | ATP2C1/ATP2C1 | ATP2C1 | ATP2C1 | ATP2C1, ATP2C1 | HOMO SAPIENS | VHH | 1 | 7YAG |
| 256 | TLR9/TLR9 | TLR9 | TLR9 | TLR9, TLR9 | HOMO SAPIENS | VHH | 1 | 8AR3 |
| 257 | GREM1/GREM1 | GREM1 | GREM1 | GREM1, GREM1 | HOMO SAPIENS | Fab | 1 | 8B7H |
| 258 | OPRM1/OPRM1 | OPRM1 | OPRM1 | OPRM1, OPRM1 | HOMO SAPIENS | Fab | 1 | 8F7Q |
| 259 | GUCY2C/GUCY2C | GUCY2C | GUCY2C | GUCY2C, GUCY2C | CRICETULUS GRISEUS | Fab | 1 | 8FX4 |
| 260 | GPR161/GPR161 | GPR161 | GPR161 | GPR161, GPR161 | HOMO SAPIENS | VHH | 1 | 8KH4 |
| 261 | ADRB1/ADRB1 | ADRB1 | ADRB1 | ADRB1, ADRB1 | HOMO SAPIENS | VHH | 1 | 8S2T |
| 262 | CTNNB1/CTNNB1 | CTNNB1 | CTNNB1 | CTNNB1, CTNNB1 | HOMO SAPIENS | Fab | 1 | 8Y0G |
| 263 | SCNN1B/SCNN1B | SCNN1B | SCNN1B | SCNN1B, SCNN1B | HOMO SAPIENS | Fab | 1 | 9BLR |
| 264 | BEST1/BEST1 | BEST1 | BEST1 | BEST1, BEST1 | HOMO SAPIENS | Fab | 1 | 9EGT |
| 265 | SLC6A3/SLC6A3 | SLC6A3 | SLC6A3 | SLC6A3, SLC6A3 | HOMO SAPIENS | Fab | 1 | 9EO4 |
| 266 | CHRNA1/CHRNA1 | CHRNA1 | CHRNA1 | CHRNA1, CHRNA1 | HOMO SAPIENS | Fab | 1 | 9GU3 |
| 267 | GNAI1/GNAI1 | GNAI1 | GNAI1 | GNAI1, GNAI1 | HOMO SAPIENS | VHH | 1 | 9ODM |
| 268 | SCN5A/SCN5A | SCN5A | SCN5A | SCN5A, SCN5A | HOMO SAPIENS | Fab | 1 | 9P24 |
| 269 | NKX2-1/NKX2-1 | NKX2-1 | NKX2-1 | NKX2-1, NKX2-1 | HOMO SAPIENS | Fab | 1 | 9U18 |

## 靶点详细信息

### 1. IL-33/IL33

- **target**: IL-33
- **gene**: IL33
- **aliases**: IL33
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: allergic_asthma
- **aliasPrefix**: IL33-Fab
- **fileCount**: 15
- **sourcePdbIds**: 9X0J
- **structuralBasis**: RCSB 9X0J IL-33 / Tozorakimab Fab 复合体
- **disease/structureFamily**: IL-1 家族细胞因子 · Fab 中和候选
- **files**: IL33-Fab-01.pdb, IL33-Fab-02.pdb, IL33-Fab-03.pdb, IL33-Fab-04.pdb, IL33-Fab-05.pdb, IL33-Fab-06.pdb, IL33-Fab-07.pdb, IL33-Fab-08.pdb, IL33-Fab-09.pdb, IL33-Fab-10.pdb, IL33-Fab-11.pdb, IL33-Fab-12.pdb, IL33-Fab-13.pdb, IL33-Fab-14.pdb, IL33-Fab-15.pdb

### 2. TSLP

- **target**: TSLP
- **gene**: TSLP
- **aliases**: TSLP
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: allergic_tslp
- **aliasPrefix**: TSLP-Fab
- **fileCount**: 10
- **sourcePdbIds**: 5J13
- **structuralBasis**: RCSB 5J13 TSLP / tezepelumab Fab 复合体
- **disease/structureFamily**: 上皮来源细胞因子 · Fab 阻断候选
- **files**: TSLP-Fab-01.pdb, TSLP-Fab-02.pdb, TSLP-Fab-03.pdb, TSLP-Fab-04.pdb, TSLP-Fab-05.pdb, TSLP-Fab-06.pdb, TSLP-Fab-07.pdb, TSLP-Fab-08.pdb, TSLP-Fab-09.pdb, TSLP-Fab-10.pdb

### 3. PD-L1/CD274

- **target**: PD-L1
- **gene**: CD274
- **aliases**: CD274, B7-H1, PDL1
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: tumor_immunotherapy
- **aliasPrefix**: PDL1-Fab
- **fileCount**: 10
- **sourcePdbIds**: 5X8L
- **structuralBasis**: RCSB 5X8L PD-L1 / atezolizumab Fab 复合体
- **disease/structureFamily**: 免疫检查点 IgV 结构域 · Fab 候选
- **files**: PDL1-Fab-01.pdb, PDL1-Fab-02.pdb, PDL1-Fab-03.pdb, PDL1-Fab-04.pdb, PDL1-Fab-05.pdb, PDL1-Fab-06.pdb, PDL1-Fab-07.pdb, PDL1-Fab-08.pdb, PDL1-Fab-09.pdb, PDL1-Fab-10.pdb

### 4. PD-1/PDCD1

- **target**: PD-1
- **gene**: PDCD1
- **aliases**: PDCD1, PD1
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: checkpoint_pd1
- **aliasPrefix**: PD1-Fab
- **fileCount**: 10
- **sourcePdbIds**: 5WT9
- **structuralBasis**: RCSB 5WT9 PD-1 / nivolumab Fab complex
- **disease/structureFamily**: 免疫检查点受体 IgV 结构域 · Fab 候选
- **files**: PD1-Fab-01.pdb, PD1-Fab-02.pdb, PD1-Fab-03.pdb, PD1-Fab-04.pdb, PD1-Fab-05.pdb, PD1-Fab-06.pdb, PD1-Fab-07.pdb, PD1-Fab-08.pdb, PD1-Fab-09.pdb, PD1-Fab-10.pdb

### 5. CTLA-4/CTLA4

- **target**: CTLA-4
- **gene**: CTLA4
- **aliases**: CTLA4, CD152
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: checkpoint_ctla4
- **aliasPrefix**: CTLA4-Fab
- **fileCount**: 10
- **sourcePdbIds**: 6RP8
- **structuralBasis**: RCSB 6RP8 CTLA-4 / ipilimumab Fab complex
- **disease/structureFamily**: 免疫检查点受体 · Fab 候选
- **files**: CTLA4-Fab-01.pdb, CTLA4-Fab-02.pdb, CTLA4-Fab-03.pdb, CTLA4-Fab-04.pdb, CTLA4-Fab-05.pdb, CTLA4-Fab-06.pdb, CTLA4-Fab-07.pdb, CTLA4-Fab-08.pdb, CTLA4-Fab-09.pdb, CTLA4-Fab-10.pdb

### 6. CD20/MS4A1

- **target**: CD20
- **gene**: MS4A1
- **aliases**: MS4A1
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: heme_cd20
- **aliasPrefix**: CD20-Fab
- **fileCount**: 10
- **sourcePdbIds**: 6VJA
- **structuralBasis**: RCSB 6VJA CD20 / rituximab Fab complex
- **disease/structureFamily**: B 细胞表面抗原 · Fab 候选
- **files**: CD20-Fab-01.pdb, CD20-Fab-02.pdb, CD20-Fab-03.pdb, CD20-Fab-04.pdb, CD20-Fab-05.pdb, CD20-Fab-06.pdb, CD20-Fab-07.pdb, CD20-Fab-08.pdb, CD20-Fab-09.pdb, CD20-Fab-10.pdb

### 7. CD19

- **target**: CD19
- **gene**: CD19
- **aliases**: CD19
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: heme_cd19
- **aliasPrefix**: CD19-Fab
- **fileCount**: 10
- **sourcePdbIds**: 6AL5
- **structuralBasis**: RCSB 6AL5 CD19 / B43 Fab complex
- **disease/structureFamily**: B 细胞表面抗原 · Fab 候选
- **files**: CD19-Fab-01.pdb, CD19-Fab-02.pdb, CD19-Fab-03.pdb, CD19-Fab-04.pdb, CD19-Fab-05.pdb, CD19-Fab-06.pdb, CD19-Fab-07.pdb, CD19-Fab-08.pdb, CD19-Fab-09.pdb, CD19-Fab-10.pdb

### 8. CD3/CD3E/CD3G

- **target**: CD3
- **gene**: CD3E/CD3G
- **aliases**: CD3E, CD3 epsilon
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: immune_cd3
- **aliasPrefix**: CD3-Fab
- **fileCount**: 10
- **sourcePdbIds**: 1SY6
- **structuralBasis**: RCSB 1SY6 CD3 gamma-epsilon / OKT3 Fab complex
- **disease/structureFamily**: T 细胞 CD3 复合体 · Fab 候选
- **files**: CD3-Fab-01.pdb, CD3-Fab-02.pdb, CD3-Fab-03.pdb, CD3-Fab-04.pdb, CD3-Fab-05.pdb, CD3-Fab-06.pdb, CD3-Fab-07.pdb, CD3-Fab-08.pdb, CD3-Fab-09.pdb, CD3-Fab-10.pdb

### 9. CD4

- **target**: CD4
- **gene**: CD4
- **aliases**: 无
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: immune_cd4
- **aliasPrefix**: CD4-Fab
- **fileCount**: 1
- **sourcePdbIds**: 3O2D
- **structuralBasis**: RCSB 3O2D human CD4 / ibalizumab Fab complex
- **disease/structureFamily**: HIV 进入受体 · Fab 阻断候选
- **files**: CD4-Fab-01.pdb

### 10. C5

- **target**: C5
- **gene**: C5
- **aliases**: Complement C5
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: complement_c5
- **aliasPrefix**: C5-Fab
- **fileCount**: 10
- **sourcePdbIds**: 5I5K
- **structuralBasis**: RCSB 5I5K complement C5 / eculizumab variable-domain antibody complex
- **disease/structureFamily**: 补体通路蛋白 · 抗体候选
- **files**: C5-Fab-01.pdb, C5-Fab-02.pdb, C5-Fab-03.pdb, C5-Fab-04.pdb, C5-Fab-05.pdb, C5-Fab-06.pdb, C5-Fab-07.pdb, C5-Fab-08.pdb, C5-Fab-09.pdb, C5-Fab-10.pdb

### 11. CFH

- **target**: CFH
- **gene**: CFH
- **aliases**: 无
- **organism**: Homo sapiens
- **antibodyFormat**: VHH
- **routeId**: complement_cfh
- **aliasPrefix**: CFH-VHH
- **fileCount**: 1
- **sourcePdbIds**: 7WKI
- **structuralBasis**: RCSB 7WKI human complement factor H / nanobody complex
- **disease/structureFamily**: 补体调节蛋白 · VHH 候选
- **files**: CFH-VHH-01.pdb

### 12. IL-6R/IL6R

- **target**: IL-6R
- **gene**: IL6R
- **aliases**: IL6R, CD126, IL-6Rα
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: inflammation_il6r
- **aliasPrefix**: IL6R-Fab
- **fileCount**: 10
- **sourcePdbIds**: 8J6F
- **structuralBasis**: RCSB 8J6F IL-6R alpha / tocilizumab Fab complex
- **disease/structureFamily**: 炎症细胞因子受体 · Fab 候选
- **files**: IL6R-Fab-01.pdb, IL6R-Fab-02.pdb, IL6R-Fab-03.pdb, IL6R-Fab-04.pdb, IL6R-Fab-05.pdb, IL6R-Fab-06.pdb, IL6R-Fab-07.pdb, IL6R-Fab-08.pdb, IL6R-Fab-09.pdb, IL6R-Fab-10.pdb

### 13. IL-4Rα/IL4R

- **target**: IL-4Rα
- **gene**: IL4R
- **aliases**: IL4R, IL4RA, CD124
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: allergic_il4ra
- **aliasPrefix**: IL4RA-Fab
- **fileCount**: 10
- **sourcePdbIds**: 6WGL
- **structuralBasis**: RCSB 6WGL IL-4 receptor alpha / dupilumab Fab complex
- **disease/structureFamily**: 过敏炎症受体 · Fab 候选
- **files**: IL4RA-Fab-01.pdb, IL4RA-Fab-02.pdb, IL4RA-Fab-03.pdb, IL4RA-Fab-04.pdb, IL4RA-Fab-05.pdb, IL4RA-Fab-06.pdb, IL4RA-Fab-07.pdb, IL4RA-Fab-08.pdb, IL4RA-Fab-09.pdb, IL4RA-Fab-10.pdb

### 14. CD25/IL2RA

- **target**: CD25
- **gene**: IL2RA
- **aliases**: IL2RA
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: immune_cd25
- **aliasPrefix**: CD25-Fab
- **fileCount**: 10
- **sourcePdbIds**: 3NFP
- **structuralBasis**: RCSB 3NFP IL-2RA(CD25) / daclizumab Fab complex
- **disease/structureFamily**: 免疫调节受体 · Fab 候选
- **files**: CD25-Fab-01.pdb, CD25-Fab-02.pdb, CD25-Fab-03.pdb, CD25-Fab-04.pdb, CD25-Fab-05.pdb, CD25-Fab-06.pdb, CD25-Fab-07.pdb, CD25-Fab-08.pdb, CD25-Fab-09.pdb, CD25-Fab-10.pdb

### 15. CD38

- **target**: CD38
- **gene**: CD38
- **aliases**: CD38
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: heme_cd38
- **aliasPrefix**: CD38-Fab
- **fileCount**: 10
- **sourcePdbIds**: 7DUO
- **structuralBasis**: RCSB 7DUO CD38 / daratumumab Fab complex
- **disease/structureFamily**: 血液肿瘤表面抗原 · Fab 候选
- **files**: CD38-Fab-01.pdb, CD38-Fab-02.pdb, CD38-Fab-03.pdb, CD38-Fab-04.pdb, CD38-Fab-05.pdb, CD38-Fab-06.pdb, CD38-Fab-07.pdb, CD38-Fab-08.pdb, CD38-Fab-09.pdb, CD38-Fab-10.pdb

### 16. TIGIT

- **target**: TIGIT
- **gene**: TIGIT
- **aliases**: TIGIT
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: checkpoint_tigit
- **aliasPrefix**: TIGIT-Fab
- **fileCount**: 10
- **sourcePdbIds**: 8VTD
- **structuralBasis**: RCSB 8VTD TIGIT / vibostolimab Fab complex
- **disease/structureFamily**: 免疫检查点受体 · Fab 候选
- **files**: TIGIT-Fab-01.pdb, TIGIT-Fab-02.pdb, TIGIT-Fab-03.pdb, TIGIT-Fab-04.pdb, TIGIT-Fab-05.pdb, TIGIT-Fab-06.pdb, TIGIT-Fab-07.pdb, TIGIT-Fab-08.pdb, TIGIT-Fab-09.pdb, TIGIT-Fab-10.pdb

### 17. CD47

- **target**: CD47
- **gene**: CD47
- **aliases**: CD47
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: checkpoint_cd47
- **aliasPrefix**: CD47-Fab
- **fileCount**: 10
- **sourcePdbIds**: 8ZCA
- **structuralBasis**: RCSB 8ZCA CD47 / hu1C8 Fab complex
- **disease/structureFamily**: 细胞表面免疫调节抗原 · Fab 候选
- **files**: CD47-Fab-01.pdb, CD47-Fab-02.pdb, CD47-Fab-03.pdb, CD47-Fab-04.pdb, CD47-Fab-05.pdb, CD47-Fab-06.pdb, CD47-Fab-07.pdb, CD47-Fab-08.pdb, CD47-Fab-09.pdb, CD47-Fab-10.pdb

### 18. LAG-3/LAG3

- **target**: LAG-3
- **gene**: LAG3
- **aliases**: LAG3
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: checkpoint_lag3
- **aliasPrefix**: LAG3-Fab
- **fileCount**: 10
- **sourcePdbIds**: 8SO3
- **structuralBasis**: RCSB 8SO3 LAG-3 / favezelimab Fab complex
- **disease/structureFamily**: 免疫检查点受体 · Fab 候选
- **files**: LAG3-Fab-01.pdb, LAG3-Fab-02.pdb, LAG3-Fab-03.pdb, LAG3-Fab-04.pdb, LAG3-Fab-05.pdb, LAG3-Fab-06.pdb, LAG3-Fab-07.pdb, LAG3-Fab-08.pdb, LAG3-Fab-09.pdb, LAG3-Fab-10.pdb

### 19. TROP-2/TACSTD2

- **target**: TROP-2
- **gene**: TACSTD2
- **aliases**: TACSTD2
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: solid_tumor_trop2
- **aliasPrefix**: TROP2-Fab
- **fileCount**: 10
- **sourcePdbIds**: 9PI9
- **structuralBasis**: RCSB 9PI9 TROP-2 dimer / sacituzumab Fab complex
- **disease/structureFamily**: 实体瘤表面抗原 · Fab 候选
- **files**: TROP2-Fab-01.pdb, TROP2-Fab-02.pdb, TROP2-Fab-03.pdb, TROP2-Fab-04.pdb, TROP2-Fab-05.pdb, TROP2-Fab-06.pdb, TROP2-Fab-07.pdb, TROP2-Fab-08.pdb, TROP2-Fab-09.pdb, TROP2-Fab-10.pdb

### 20. Tissue Factor/F3

- **target**: Tissue Factor
- **gene**: F3
- **aliases**: F3, CD142, Thromboplastin, Coagulation factor III
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: solid_tumor_tissue_factor
- **aliasPrefix**: F3-Fab
- **fileCount**: 1
- **sourcePdbIds**: 1UJ3
- **structuralBasis**: RCSB 1UJ3 human Tissue Factor extracellular domain / HATR-5 Fab complex
- **disease/structureFamily**: 实体瘤相关凝血通路表面抗原 · Tissue Factor Fab 候选
- **files**: F3-Fab-01.pdb

### 21. BCMA/TNFRSF17

- **target**: BCMA
- **gene**: TNFRSF17
- **aliases**: TNFRSF17, CD269
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: heme_bcma
- **aliasPrefix**: BCMA-Fab
- **fileCount**: 10
- **sourcePdbIds**: 9MQO
- **structuralBasis**: RCSB 9MQO BCMA / CA10V2 Fab complex
- **disease/structureFamily**: B 细胞成熟抗原 · Fab 候选
- **files**: BCMA-Fab-01.pdb, BCMA-Fab-02.pdb, BCMA-Fab-03.pdb, BCMA-Fab-04.pdb, BCMA-Fab-05.pdb, BCMA-Fab-06.pdb, BCMA-Fab-07.pdb, BCMA-Fab-08.pdb, BCMA-Fab-09.pdb, BCMA-Fab-10.pdb

### 22. IgE/IGH

- **target**: IgE
- **gene**: IGH
- **aliases**: Immunoglobulin E
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: allergic_ige
- **aliasPrefix**: IgE-Fab
- **fileCount**: 10
- **sourcePdbIds**: 5G64
- **structuralBasis**: RCSB 5G64 IgE-Fc / anti-IgE Fab complex
- **disease/structureFamily**: 免疫球蛋白 E Fc · Fab 候选
- **files**: IgE-Fab-01.pdb, IgE-Fab-02.pdb, IgE-Fab-03.pdb, IgE-Fab-04.pdb, IgE-Fab-05.pdb, IgE-Fab-06.pdb, IgE-Fab-07.pdb, IgE-Fab-08.pdb, IgE-Fab-09.pdb, IgE-Fab-10.pdb

### 23. CGRP receptor/CALCRL/RAMP1

- **target**: CGRP receptor
- **gene**: CALCRL/RAMP1
- **aliases**: CGRPR, CALCRL, RAMP1
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: migraine_cgrpr
- **aliasPrefix**: CGRPR-Fab
- **fileCount**: 10
- **sourcePdbIds**: 6UMG
- **structuralBasis**: RCSB 6UMG CGRP receptor ECD / erenumab Fab complex
- **disease/structureFamily**: CGRP 受体胞外复合物 · Fab 候选
- **files**: CGRPR-Fab-01.pdb, CGRPR-Fab-02.pdb, CGRPR-Fab-03.pdb, CGRPR-Fab-04.pdb, CGRPR-Fab-05.pdb, CGRPR-Fab-06.pdb, CGRPR-Fab-07.pdb, CGRPR-Fab-08.pdb, CGRPR-Fab-09.pdb, CGRPR-Fab-10.pdb

### 24. HER2/ERBB2

- **target**: HER2
- **gene**: ERBB2
- **aliases**: ERBB2, HER-2
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: breast_cancer
- **aliasPrefix**: HER2-Fab
- **fileCount**: 10
- **sourcePdbIds**: 1N8Z
- **structuralBasis**: RCSB 1N8Z HER2 胞外结构域 / trastuzumab Fab 复合体
- **disease/structureFamily**: HER2 胞外结构域 · 肿瘤靶点 Fab
- **files**: HER2-Fab-01.pdb, HER2-Fab-02.pdb, HER2-Fab-03.pdb, HER2-Fab-04.pdb, HER2-Fab-05.pdb, HER2-Fab-06.pdb, HER2-Fab-07.pdb, HER2-Fab-08.pdb, HER2-Fab-09.pdb, HER2-Fab-10.pdb

### 25. EGFR

- **target**: EGFR
- **gene**: EGFR
- **aliases**: ERBB1
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: solid_tumor_egfr
- **aliasPrefix**: EGFR-Fab
- **fileCount**: 10
- **sourcePdbIds**: 1YY9
- **structuralBasis**: RCSB 1YY9 EGFR 胞外结构域 / cetuximab Fab 复合体
- **disease/structureFamily**: EGFR 胞外受体结构域 · Fab 候选
- **files**: EGFR-Fab-01.pdb, EGFR-Fab-02.pdb, EGFR-Fab-03.pdb, EGFR-Fab-04.pdb, EGFR-Fab-05.pdb, EGFR-Fab-06.pdb, EGFR-Fab-07.pdb, EGFR-Fab-08.pdb, EGFR-Fab-09.pdb, EGFR-Fab-10.pdb

### 26. VEGF-A/VEGFA

- **target**: VEGF-A
- **gene**: VEGFA
- **aliases**: VEGFA, VEGF
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: angiogenesis_oncology
- **aliasPrefix**: VEGFA-Fab
- **fileCount**: 10
- **sourcePdbIds**: 1BJ1
- **structuralBasis**: RCSB 1BJ1 VEGF-A / 中和 Fab 复合体
- **disease/structureFamily**: 血管生成因子 · Fab 中和候选
- **files**: VEGFA-Fab-01.pdb, VEGFA-Fab-02.pdb, VEGFA-Fab-03.pdb, VEGFA-Fab-04.pdb, VEGFA-Fab-05.pdb, VEGFA-Fab-06.pdb, VEGFA-Fab-07.pdb, VEGFA-Fab-08.pdb, VEGFA-Fab-09.pdb, VEGFA-Fab-10.pdb

### 27. TNF

- **target**: TNF
- **gene**: TNF
- **aliases**: TNF-alpha, TNFα
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: autoimmune_inflammation
- **aliasPrefix**: TNF-Fab
- **fileCount**: 10
- **sourcePdbIds**: 5WUX
- **structuralBasis**: RCSB 5WUX TNF alpha trimer / certolizumab Fab complex
- **disease/structureFamily**: TNF 炎症因子 · Fab 中和候选
- **files**: TNF-Fab-01.pdb, TNF-Fab-02.pdb, TNF-Fab-03.pdb, TNF-Fab-04.pdb, TNF-Fab-05.pdb, TNF-Fab-06.pdb, TNF-Fab-07.pdb, TNF-Fab-08.pdb, TNF-Fab-09.pdb, TNF-Fab-10.pdb

### 28. IL-17A/IL17A

- **target**: IL-17A
- **gene**: IL17A
- **aliases**: IL17A
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: autoimmune_il17
- **aliasPrefix**: IL17A-Fab
- **fileCount**: 10
- **sourcePdbIds**: 2VXS
- **structuralBasis**: RCSB 2VXS IL-17A dimer / neutralizing Fab complex
- **disease/structureFamily**: IL-17A 炎症因子 · Fab 候选
- **files**: IL17A-Fab-01.pdb, IL17A-Fab-02.pdb, IL17A-Fab-03.pdb, IL17A-Fab-04.pdb, IL17A-Fab-05.pdb, IL17A-Fab-06.pdb, IL17A-Fab-07.pdb, IL17A-Fab-08.pdb, IL17A-Fab-09.pdb, IL17A-Fab-10.pdb

### 29. IL-23/IL23A/IL12B

- **target**: IL-23
- **gene**: IL23A/IL12B
- **aliases**: IL23, IL23A
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: autoimmune_il23
- **aliasPrefix**: IL23-Fab
- **fileCount**: 10
- **sourcePdbIds**: 3D85
- **structuralBasis**: RCSB 3D85 IL-23 / neutralizing Fab 复合体
- **disease/structureFamily**: IL-23 炎症轴 · Fab 候选
- **files**: IL23-Fab-01.pdb, IL23-Fab-02.pdb, IL23-Fab-03.pdb, IL23-Fab-04.pdb, IL23-Fab-05.pdb, IL23-Fab-06.pdb, IL23-Fab-07.pdb, IL23-Fab-08.pdb, IL23-Fab-09.pdb, IL23-Fab-10.pdb

### 30. RSV F/F

- **target**: RSV F
- **gene**: F
- **aliases**: Respiratory syncytial virus F, RSV fusion protein
- **organism**: Respiratory syncytial virus
- **antibodyFormat**: Fab
- **routeId**: infectious_rsv
- **aliasPrefix**: RSVF-Fab
- **fileCount**: 10
- **sourcePdbIds**: 5W23
- **structuralBasis**: RCSB 5W23 RSV F prefusion trimer / 5C4 Fab 复合体
- **disease/structureFamily**: 病毒融合蛋白 · 中和 Fab 候选
- **files**: RSVF-Fab-01.pdb, RSVF-Fab-02.pdb, RSVF-Fab-03.pdb, RSVF-Fab-04.pdb, RSVF-Fab-05.pdb, RSVF-Fab-06.pdb, RSVF-Fab-07.pdb, RSVF-Fab-08.pdb, RSVF-Fab-09.pdb, RSVF-Fab-10.pdb

### 31. SARS-CoV-2 RBD/S

- **target**: SARS-CoV-2 RBD
- **gene**: S
- **aliases**: SARS-CoV-2 receptor-binding domain, SC2 RBD, RBD
- **organism**: Severe acute respiratory syndrome coronavirus 2
- **antibodyFormat**: Fab
- **routeId**: infectious_covid
- **aliasPrefix**: SC2RBD-Fab
- **fileCount**: 10
- **sourcePdbIds**: 6XDG
- **structuralBasis**: RCSB 6XDG SARS-CoV-2 RBD / REGN10933 Fab 复合体
- **disease/structureFamily**: 病毒受体结合结构域 · 中和 Fab 候选
- **files**: SC2RBD-Fab-01.pdb, SC2RBD-Fab-02.pdb, SC2RBD-Fab-03.pdb, SC2RBD-Fab-04.pdb, SC2RBD-Fab-05.pdb, SC2RBD-Fab-06.pdb, SC2RBD-Fab-07.pdb, SC2RBD-Fab-08.pdb, SC2RBD-Fab-09.pdb, SC2RBD-Fab-10.pdb

### 32. Influenza HA/HA

- **target**: Influenza HA
- **gene**: HA
- **aliases**: Influenza hemagglutinin, Flu HA, 血凝素
- **organism**: Influenza A virus
- **antibodyFormat**: Fab
- **routeId**: infectious_flu
- **aliasPrefix**: FluHA-Fab
- **fileCount**: 10
- **sourcePdbIds**: 3GBM
- **structuralBasis**: RCSB 3GBM influenza HA trimer biological assembly / representative HA protomer-CR6261 Fab interface
- **disease/structureFamily**: 流感表面抗原 · 广谱中和 Fab 候选
- **files**: FluHA-Fab-01.pdb, FluHA-Fab-02.pdb, FluHA-Fab-03.pdb, FluHA-Fab-04.pdb, FluHA-Fab-05.pdb, FluHA-Fab-06.pdb, FluHA-Fab-07.pdb, FluHA-Fab-08.pdb, FluHA-Fab-09.pdb, FluHA-Fab-10.pdb

### 33. Influenza NA/NA

- **target**: Influenza NA
- **gene**: NA
- **aliases**: Influenza neuraminidase, Flu NA, 神经氨酸酶
- **organism**: Influenza A virus
- **antibodyFormat**: Fab
- **routeId**: infectious_flu_na
- **aliasPrefix**: FluNA-Fab
- **fileCount**: 10
- **sourcePdbIds**: 1NCD
- **structuralBasis**: RCSB 1NCD influenza N9 neuraminidase / NC41 Fab complex
- **disease/structureFamily**: 流感神经氨酸酶 · 中和 Fab 候选
- **files**: FluNA-Fab-01.pdb, FluNA-Fab-02.pdb, FluNA-Fab-03.pdb, FluNA-Fab-04.pdb, FluNA-Fab-05.pdb, FluNA-Fab-06.pdb, FluNA-Fab-07.pdb, FluNA-Fab-08.pdb, FluNA-Fab-09.pdb, FluNA-Fab-10.pdb

### 34. PCSK9

- **target**: PCSK9
- **gene**: PCSK9
- **aliases**: PCSK9
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: cardio_pcsk9
- **aliasPrefix**: PCSK9-Fab
- **fileCount**: 10
- **sourcePdbIds**: 3SQO
- **structuralBasis**: RCSB 3SQO PCSK9 / J16 Fab 复合体
- **disease/structureFamily**: 血脂调控靶点 · Fab 阻断候选
- **files**: PCSK9-Fab-01.pdb, PCSK9-Fab-02.pdb, PCSK9-Fab-03.pdb, PCSK9-Fab-04.pdb, PCSK9-Fab-05.pdb, PCSK9-Fab-06.pdb, PCSK9-Fab-07.pdb, PCSK9-Fab-08.pdb, PCSK9-Fab-09.pdb, PCSK9-Fab-10.pdb

### 35. ANGPTL3

- **target**: ANGPTL3
- **gene**: ANGPTL3
- **aliases**: ANGPTL3
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: cardio_angptl3
- **aliasPrefix**: ANGPTL3-CV-Fab
- **fileCount**: 10
- **sourcePdbIds**: 6EUA
- **structuralBasis**: RCSB 6EUA ANGPTL3 真实靶点结构 + Fab 候选参考姿态
- **disease/structureFamily**: 脂质代谢调控靶点 · 心血管 Fab 候选
- **files**: ANGPTL3-CV-Fab-01.pdb, ANGPTL3-CV-Fab-02.pdb, ANGPTL3-CV-Fab-03.pdb, ANGPTL3-CV-Fab-04.pdb, ANGPTL3-CV-Fab-05.pdb, ANGPTL3-CV-Fab-06.pdb, ANGPTL3-CV-Fab-07.pdb, ANGPTL3-CV-Fab-08.pdb, ANGPTL3-CV-Fab-09.pdb, ANGPTL3-CV-Fab-10.pdb

### 36. IL-1B/IL1B

- **target**: IL-1B
- **gene**: IL1B
- **aliases**: IL1B, IL-1β, IL-1 beta
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: cardio_il1b
- **aliasPrefix**: IL1B-Fab
- **fileCount**: 10
- **sourcePdbIds**: 5BVP
- **structuralBasis**: RCSB 5BVP IL-1 beta / canakinumab Fab 复合体
- **disease/structureFamily**: IL-1 家族炎症因子 · Fab 候选
- **files**: IL1B-Fab-01.pdb, IL1B-Fab-02.pdb, IL1B-Fab-03.pdb, IL1B-Fab-04.pdb, IL1B-Fab-05.pdb, IL1B-Fab-06.pdb, IL1B-Fab-07.pdb, IL1B-Fab-08.pdb, IL1B-Fab-09.pdb, IL1B-Fab-10.pdb

### 37. GIPR

- **target**: GIPR
- **gene**: GIPR
- **aliases**: GIP receptor
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: metabolic_gipr
- **aliasPrefix**: GIPR-Fab
- **fileCount**: 10
- **sourcePdbIds**: 4HJ0
- **structuralBasis**: RCSB 4HJ0 human GIPR ECD / GIPG013 Fab 复合体
- **disease/structureFamily**: 代谢受体胞外结构域 · Fab 候选
- **files**: GIPR-Fab-01.pdb, GIPR-Fab-02.pdb, GIPR-Fab-03.pdb, GIPR-Fab-04.pdb, GIPR-Fab-05.pdb, GIPR-Fab-06.pdb, GIPR-Fab-07.pdb, GIPR-Fab-08.pdb, GIPR-Fab-09.pdb, GIPR-Fab-10.pdb

### 38. Amyloid-beta/APP

- **target**: Amyloid-beta
- **gene**: APP
- **aliases**: Aβ, Abeta, Amyloid beta, Amyloid-beta
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: neuro_alz_abeta
- **aliasPrefix**: ABETA-Fab
- **fileCount**: 1
- **sourcePdbIds**: 4OJF
- **structuralBasis**: RCSB 4OJF amyloid-beta 1-8 peptide / humanized 3D6 Fab complex
- **disease/structureFamily**: 阿尔茨海默病相关淀粉样肽 · Amyloid-beta Fab 候选
- **files**: ABETA-Fab-01.pdb

### 39. Tau/MAPT

- **target**: Tau
- **gene**: MAPT
- **aliases**: MAPT, PHF-Tau, Tau protein
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: neuro_alz_tau
- **aliasPrefix**: TAU-Fab
- **fileCount**: 1
- **sourcePdbIds**: 6PXR
- **structuralBasis**: RCSB 6PXR Tau peptide / gosuranemab Fab complex
- **disease/structureFamily**: Tau 蛋白 N 端表位 · Fab 候选
- **files**: TAU-Fab-01.pdb

### 40. TREM2

- **target**: TREM2
- **gene**: TREM2
- **aliases**: Triggering receptor expressed on myeloid cells 2
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: neuro_alz_trem2
- **aliasPrefix**: TREM2-Fab
- **fileCount**: 1
- **sourcePdbIds**: 9PWN
- **structuralBasis**: RCSB 9PWN TREM2 stalk peptide / 7411 Fab complex
- **disease/structureFamily**: 微胶质调节受体 · TREM2 peptide Fab 候选
- **files**: TREM2-Fab-01.pdb

### 41. DAT/SLC6A3

- **target**: DAT
- **gene**: SLC6A3
- **aliases**: SLC6A3, DAT1, dopamine transporter
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: neuro_adhd_dat
- **aliasPrefix**: DAT-Fab
- **fileCount**: 10
- **sourcePdbIds**: 9EO4
- **structuralBasis**: RCSB 9EO4 human dopamine transporter outward-open structure + representative Fab display scaffold
- **disease/structureFamily**: 多巴胺转运蛋白 · Fab 展示候选
- **files**: DAT-Fab-01.pdb, DAT-Fab-02.pdb, DAT-Fab-03.pdb, DAT-Fab-04.pdb, DAT-Fab-05.pdb, DAT-Fab-06.pdb, DAT-Fab-07.pdb, DAT-Fab-08.pdb, DAT-Fab-09.pdb, DAT-Fab-10.pdb

### 42. TSHR

- **target**: TSHR
- **gene**: TSHR
- **aliases**: Thyrotropin receptor, Thyroid-stimulating hormone receptor, 促甲状腺激素受体
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: endocrine_graves_tshr
- **aliasPrefix**: TSHR-Fab
- **fileCount**: 1
- **sourcePdbIds**: 7T9M
- **structuralBasis**: RCSB 7T9M human thyrotropin receptor / CS-17 Fab complex
- **disease/structureFamily**: 甲状腺刺激素受体 ectodomain · Fab 候选
- **files**: TSHR-Fab-01.pdb

### 43. alpha-synuclein/SNCA

- **target**: alpha-synuclein
- **gene**: SNCA
- **aliases**: SNCA, α-synuclein, Alpha synuclein, 突触核蛋白
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: neuro_parkinson_snca
- **aliasPrefix**: SNCA-Fab
- **fileCount**: 1
- **sourcePdbIds**: 8OG0
- **structuralBasis**: RCSB 8OG0 alpha-synuclein epitope peptide / MJF14-6-4-2 Fab complex
- **disease/structureFamily**: 突触核蛋白 peptide epitope · Fab 候选
- **files**: SNCA-Fab-01.pdb

### 44. AQP4

- **target**: AQP4
- **gene**: AQP4
- **aliases**: AQP-4, Aquaporin-4, 水通道蛋白4
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: neuro_nmosd_aqp4
- **aliasPrefix**: AQP4-Fab
- **fileCount**: 1
- **sourcePdbIds**: 8V91
- **structuralBasis**: RCSB 8V91 human AQP4 tetramer / rAB 58 Fab complex
- **disease/structureFamily**: AQP4 tetramer · Fab 界面参考
- **files**: AQP4-Fab-01.pdb

### 45. Canine NGF/NGF

- **target**: Canine NGF
- **gene**: NGF
- **aliases**: dog NGF, dog nerve growth factor, 犬源 NGF, 犬 NGF
- **organism**: Canis lupus familiaris
- **antibodyFormat**: Fab
- **routeId**: veterinary_canine_ngf
- **aliasPrefix**: CANINE-NGF-Fab
- **fileCount**: 10
- **sourcePdbIds**: 4EDW
- **structuralBasis**: AlphaFold DB A0A8I3PYI3 犬源成熟 NGF + RCSB 4EDW tanezumab Fab 展示支架
- **disease/structureFamily**: 犬源神经营养因子 · Fab 中和候选
- **files**: CANINE-NGF-Fab-01.pdb, CANINE-NGF-Fab-02.pdb, CANINE-NGF-Fab-03.pdb, CANINE-NGF-Fab-04.pdb, CANINE-NGF-Fab-05.pdb, CANINE-NGF-Fab-06.pdb, CANINE-NGF-Fab-07.pdb, CANINE-NGF-Fab-08.pdb, CANINE-NGF-Fab-09.pdb, CANINE-NGF-Fab-10.pdb

### 46. PF4/CXCL4

- **target**: PF4
- **gene**: CXCL4
- **aliases**: CXCL4, platelet factor 4
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: inflammation_pf4
- **aliasPrefix**: PF4-Fab
- **fileCount**: 10
- **sourcePdbIds**: 1F9Q
- **structuralBasis**: RCSB 1F9Q platelet factor 4 reference structure + local Fab display scaffold
- **disease/structureFamily**: 血小板因子 4 · Fab 候选
- **files**: PF4-Fab-01.pdb, PF4-Fab-02.pdb, PF4-Fab-03.pdb, PF4-Fab-04.pdb, PF4-Fab-05.pdb, PF4-Fab-06.pdb, PF4-Fab-07.pdb, PF4-Fab-08.pdb, PF4-Fab-09.pdb, PF4-Fab-10.pdb

### 47. Adenovirus hexon/L3

- **target**: Adenovirus hexon
- **gene**: L3
- **aliases**: human adenovirus hexon, adenovirus hexon, HAdV hexon
- **organism**: Human adenovirus 57
- **antibodyFormat**: Fab
- **routeId**: infectious_adenovirus_hexon
- **aliasPrefix**: ADENO-HEXON-Fab
- **fileCount**: 10
- **sourcePdbIds**: 10DP
- **structuralBasis**: RCSB 10DP human adenovirus hexon reference structure + local Fab display scaffold
- **disease/structureFamily**: 腺病毒六邻体主衣壳蛋白 · Fab 候选
- **files**: ADENO-HEXON-Fab-01.pdb, ADENO-HEXON-Fab-02.pdb, ADENO-HEXON-Fab-03.pdb, ADENO-HEXON-Fab-04.pdb, ADENO-HEXON-Fab-05.pdb, ADENO-HEXON-Fab-06.pdb, ADENO-HEXON-Fab-07.pdb, ADENO-HEXON-Fab-08.pdb, ADENO-HEXON-Fab-09.pdb, ADENO-HEXON-Fab-10.pdb

### 48. Influenza M2/M2

- **target**: Influenza M2
- **gene**: M2
- **aliases**: M2e, matrix protein 2, influenza matrix protein 2
- **organism**: Influenza A virus
- **antibodyFormat**: Fab
- **routeId**: infectious_flu_m2
- **aliasPrefix**: M2e-Fab
- **fileCount**: 10
- **sourcePdbIds**: 4N8C
- **structuralBasis**: RCSB 4N8C influenza A M2 ectodomain / antibody complex
- **disease/structureFamily**: 流感病毒 Matrix protein 2 · Fab 候选
- **files**: M2e-Fab-01.pdb, M2e-Fab-02.pdb, M2e-Fab-03.pdb, M2e-Fab-04.pdb, M2e-Fab-05.pdb, M2e-Fab-06.pdb, M2e-Fab-07.pdb, M2e-Fab-08.pdb, M2e-Fab-09.pdb, M2e-Fab-10.pdb

### 49. PRRSV GP4/GP4

- **target**: PRRSV GP4
- **gene**: GP4
- **aliases**: PRRSV-2 GP4, GP4, porcine reproductive and respiratory syndrome virus GP4
- **organism**: Porcine reproductive and respiratory syndrome virus
- **antibodyFormat**: Fab
- **routeId**: infectious_prrsv_gp4
- **aliasPrefix**: PRRSV-GP4-Fab
- **fileCount**: 10
- **sourcePdbIds**: 29TJ
- **structuralBasis**: RCSB 29TJ PRRSV-2 GP4 antigenic region / neutralizing scFv#18 complex
- **disease/structureFamily**: 猪繁殖与呼吸综合征病毒 GP4 · 中和候选
- **files**: PRRSV-GP4-Fab-01.pdb, PRRSV-GP4-Fab-02.pdb, PRRSV-GP4-Fab-03.pdb, PRRSV-GP4-Fab-04.pdb, PRRSV-GP4-Fab-05.pdb, PRRSV-GP4-Fab-06.pdb, PRRSV-GP4-Fab-07.pdb, PRRSV-GP4-Fab-08.pdb, PRRSV-GP4-Fab-09.pdb, PRRSV-GP4-Fab-10.pdb

### 50. PRRSV NSP10/NSP10

- **target**: PRRSV NSP10
- **gene**: NSP10
- **aliases**: PRRSV nsp10, NSP10, porcine reproductive and respiratory syndrome virus NSP10
- **organism**: Porcine reproductive and respiratory syndrome virus
- **antibodyFormat**: Fab
- **routeId**: infectious_prrsv_nsp10
- **aliasPrefix**: PRRSV-NSP10-Fab
- **fileCount**: 10
- **sourcePdbIds**: 6JDS
- **structuralBasis**: RCSB 6JDS PRRSV NSP10 helicase reference structure + local Fab display scaffold
- **disease/structureFamily**: 猪繁殖与呼吸综合征病毒 NSP10/Helicase · Fab 候选
- **files**: PRRSV-NSP10-Fab-01.pdb, PRRSV-NSP10-Fab-02.pdb, PRRSV-NSP10-Fab-03.pdb, PRRSV-NSP10-Fab-04.pdb, PRRSV-NSP10-Fab-05.pdb, PRRSV-NSP10-Fab-06.pdb, PRRSV-NSP10-Fab-07.pdb, PRRSV-NSP10-Fab-08.pdb, PRRSV-NSP10-Fab-09.pdb, PRRSV-NSP10-Fab-10.pdb

### 51. HSV gD/gD

- **target**: HSV gD
- **gene**: gD
- **aliases**: gD, glycoprotein D, HSV glycoprotein D
- **organism**: Human herpesvirus 1
- **antibodyFormat**: Fab
- **routeId**: infectious_hsv_gd
- **aliasPrefix**: HSV-GD-Fab
- **fileCount**: 10
- **sourcePdbIds**: 2C36
- **structuralBasis**: RCSB 2C36 HSV-1 glycoprotein D reference structure + local Fab display scaffold
- **disease/structureFamily**: HSV-1 glycoprotein D · Fab 候选
- **files**: HSV-GD-Fab-01.pdb, HSV-GD-Fab-02.pdb, HSV-GD-Fab-03.pdb, HSV-GD-Fab-04.pdb, HSV-GD-Fab-05.pdb, HSV-GD-Fab-06.pdb, HSV-GD-Fab-07.pdb, HSV-GD-Fab-08.pdb, HSV-GD-Fab-09.pdb, HSV-GD-Fab-10.pdb

### 52. PCV2 capsid/CAP

- **target**: PCV2 capsid
- **gene**: CAP
- **aliases**: PCV2, porcine circovirus 2 capsid, CAP, ORF2
- **organism**: Porcine circovirus 2
- **antibodyFormat**: Fab
- **routeId**: infectious_pcv2_capsid
- **aliasPrefix**: PCV2-Cap-Fab
- **fileCount**: 10
- **sourcePdbIds**: 3R0R
- **structuralBasis**: RCSB 3R0R PCV2 capsid protein reference structure + local Fab display scaffold
- **disease/structureFamily**: 猪圆环病毒 2 型衣壳蛋白 · Fab 候选
- **files**: PCV2-Cap-Fab-01.pdb, PCV2-Cap-Fab-02.pdb, PCV2-Cap-Fab-03.pdb, PCV2-Cap-Fab-04.pdb, PCV2-Cap-Fab-05.pdb, PCV2-Cap-Fab-06.pdb, PCV2-Cap-Fab-07.pdb, PCV2-Cap-Fab-08.pdb, PCV2-Cap-Fab-09.pdb, PCV2-Cap-Fab-10.pdb

### 53. PEDV spike/S

- **target**: PEDV spike
- **gene**: S
- **aliases**: PEDV S, spike glycoprotein, porcine epidemic diarrhea virus spike
- **organism**: Porcine epidemic diarrhea virus
- **antibodyFormat**: Fab
- **routeId**: infectious_pedv_spike
- **aliasPrefix**: PEDV-Spike-Fab
- **fileCount**: 10
- **sourcePdbIds**: 6VV5
- **structuralBasis**: RCSB 6VV5 PEDV spike glycoprotein reference structure + local Fab display scaffold
- **disease/structureFamily**: 猪流行性腹泻病毒 Spike glycoprotein · Fab 候选
- **files**: PEDV-Spike-Fab-01.pdb, PEDV-Spike-Fab-02.pdb, PEDV-Spike-Fab-03.pdb, PEDV-Spike-Fab-04.pdb, PEDV-Spike-Fab-05.pdb, PEDV-Spike-Fab-06.pdb, PEDV-Spike-Fab-07.pdb, PEDV-Spike-Fab-08.pdb, PEDV-Spike-Fab-09.pdb, PEDV-Spike-Fab-10.pdb

### 54. CSFV NS5B/NS5B

- **target**: CSFV NS5B
- **gene**: NS5B
- **aliases**: classical swine fever virus NS5B, NS5B
- **organism**: Classical swine fever virus
- **antibodyFormat**: Fab
- **routeId**: infectious_csfv_ns5b
- **aliasPrefix**: CSFV-NS5B-Fab
- **fileCount**: 10
- **sourcePdbIds**: 7EKJ
- **structuralBasis**: RCSB 7EKJ classical swine fever virus NS5B reference structure + local Fab display scaffold
- **disease/structureFamily**: 经典猪瘟病毒 NS5B · Fab 候选
- **files**: CSFV-NS5B-Fab-01.pdb, CSFV-NS5B-Fab-02.pdb, CSFV-NS5B-Fab-03.pdb, CSFV-NS5B-Fab-04.pdb, CSFV-NS5B-Fab-05.pdb, CSFV-NS5B-Fab-06.pdb, CSFV-NS5B-Fab-07.pdb, CSFV-NS5B-Fab-08.pdb, CSFV-NS5B-Fab-09.pdb, CSFV-NS5B-Fab-10.pdb

### 55. Feline panleukopenia VP2/VP2

- **target**: Feline panleukopenia VP2
- **gene**: VP2
- **aliases**: FPV VP2, feline panleukopenia virus VP2, parvovirus VP2
- **organism**: Feline panleukopenia virus
- **antibodyFormat**: Fab
- **routeId**: infectious_fpv_vp2
- **aliasPrefix**: FPV-VP2-Fab
- **fileCount**: 10
- **sourcePdbIds**: 1FPV
- **structuralBasis**: RCSB 1FPV feline panleukopenia virus VP2 reference structure + local Fab display scaffold
- **disease/structureFamily**: 猫瘟病毒 VP2 衣壳蛋白 · Fab 候选
- **files**: FPV-VP2-Fab-01.pdb, FPV-VP2-Fab-02.pdb, FPV-VP2-Fab-03.pdb, FPV-VP2-Fab-04.pdb, FPV-VP2-Fab-05.pdb, FPV-VP2-Fab-06.pdb, FPV-VP2-Fab-07.pdb, FPV-VP2-Fab-08.pdb, FPV-VP2-Fab-09.pdb, FPV-VP2-Fab-10.pdb

### 56. Connexin-26/GJB2

- **target**: Connexin-26
- **gene**: GJB2
- **aliases**: GJB2, CX26, connexin-26
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: neuro_deafness_gjb2
- **aliasPrefix**: GJB2-Fab
- **fileCount**: 10
- **sourcePdbIds**: 2ZW3
- **structuralBasis**: RCSB 2ZW3 connexin-26 reference structure + local Fab display scaffold
- **disease/structureFamily**: 缝隙连接蛋白 β-2 / Connexin-26 · Fab 候选
- **files**: GJB2-Fab-01.pdb, GJB2-Fab-02.pdb, GJB2-Fab-03.pdb, GJB2-Fab-04.pdb, GJB2-Fab-05.pdb, GJB2-Fab-06.pdb, GJB2-Fab-07.pdb, GJB2-Fab-08.pdb, GJB2-Fab-09.pdb, GJB2-Fab-10.pdb

### 57. DLL3

- **target**: DLL3
- **gene**: DLL3
- **aliases**: DLL3, Delta-like ligand 3
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: cancer_dll3
- **aliasPrefix**: DLL3-Fab
- **fileCount**: 5
- **sourcePdbIds**: 6H9Y
- **structuralBasis**: RCSB 6H9Y DLL3 + nivolumab Fab display scaffold
- **disease/structureFamily**: 小细胞肺癌 · Fab 候选
- **files**: DLL3-Fab-01.pdb, DLL3-Fab-02.pdb, DLL3-Fab-03.pdb, DLL3-Fab-04.pdb, DLL3-Fab-05.pdb

### 58. FOLR1

- **target**: FOLR1
- **gene**: FOLR1
- **aliases**: FOLR1, FOL-alpha, folate receptor alpha
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: cancer_folr1
- **aliasPrefix**: FOLR1-Fab
- **fileCount**: 5
- **sourcePdbIds**: 4LRH
- **structuralBasis**: RCSB 4LRH FOLR1 + tozorakimab Fab display scaffold
- **disease/structureFamily**: 卵巢癌 · Fab 候选
- **files**: FOLR1-Fab-01.pdb, FOLR1-Fab-02.pdb, FOLR1-Fab-03.pdb, FOLR1-Fab-04.pdb, FOLR1-Fab-05.pdb

### 59. ROR1

- **target**: ROR1
- **gene**: ROR1
- **aliases**: ROR1, receptor tyrosine kinase-like orphan receptor 1
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: cancer_ror1
- **aliasPrefix**: ROR1-Fab
- **fileCount**: 5
- **sourcePdbIds**: 6A5F
- **structuralBasis**: RCSB 6A5F ROR1 + daratumumab Fab display scaffold
- **disease/structureFamily**: CLL/乳腺癌 · Fab 候选
- **files**: ROR1-Fab-01.pdb, ROR1-Fab-02.pdb, ROR1-Fab-03.pdb, ROR1-Fab-04.pdb, ROR1-Fab-05.pdb

### 60. CD30/TNFRSF8

- **target**: CD30
- **gene**: TNFRSF8
- **aliases**: TNFRSF8, CD30 antigen
- **organism**: Homo sapiens
- **antibodyFormat**: VHH
- **routeId**: cancer_cd30
- **aliasPrefix**: CD30-VHH
- **fileCount**: 5
- **sourcePdbIds**: 5XBN
- **structuralBasis**: RCSB 5XBN CD30 + TSLP-VHH display scaffold
- **disease/structureFamily**: 霍奇金淋巴瘤 · VHH 候选
- **files**: CD30-VHH-01.pdb, CD30-VHH-02.pdb, CD30-VHH-03.pdb, CD30-VHH-04.pdb, CD30-VHH-05.pdb

### 61. FLT3

- **target**: FLT3
- **gene**: FLT3
- **aliases**: FLT3, FLK2, CD135
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: cancer_flt3
- **aliasPrefix**: FLT3-Fab
- **fileCount**: 5
- **sourcePdbIds**: 1RJQ
- **structuralBasis**: RCSB 1RJQ FLT3 + cetuximab Fab display scaffold
- **disease/structureFamily**: AML · Fab 候选
- **files**: FLT3-Fab-01.pdb, FLT3-Fab-02.pdb, FLT3-Fab-03.pdb, FLT3-Fab-04.pdb, FLT3-Fab-05.pdb

### 62. CD70

- **target**: CD70
- **gene**: CD70
- **aliases**: CD70, CD27 ligand, TNFSF7
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: cancer_cd70
- **aliasPrefix**: CD70-Fab
- **fileCount**: 5
- **sourcePdbIds**: 4F77
- **structuralBasis**: RCSB 4F77 CD70 + ipilimumab Fab display scaffold
- **disease/structureFamily**: 肾细胞癌 · Fab 候选
- **files**: CD70-Fab-01.pdb, CD70-Fab-02.pdb, CD70-Fab-03.pdb, CD70-Fab-04.pdb, CD70-Fab-05.pdb

### 63. PTK7

- **target**: PTK7
- **gene**: PTK7
- **aliases**: PTK7, protein tyrosine kinase 7
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: cancer_ptk7
- **aliasPrefix**: PTK7-Fab
- **fileCount**: 5
- **sourcePdbIds**: 6AY3
- **structuralBasis**: RCSB 6AY3 PTK7 + ipilimumab Fab display scaffold
- **disease/structureFamily**: 结直肠癌 · Fab 候选
- **files**: PTK7-Fab-01.pdb, PTK7-Fab-02.pdb, PTK7-Fab-03.pdb, PTK7-Fab-04.pdb, PTK7-Fab-05.pdb

### 64. PSMA/FOLH1

- **target**: PSMA
- **gene**: FOLH1
- **aliases**: FOLH1, GCPII, glutamate carboxypeptidase II
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: cancer_psma
- **aliasPrefix**: PSMA-Fab
- **fileCount**: 5
- **sourcePdbIds**: 2X6G
- **structuralBasis**: RCSB 2X6G PSMA + cetuximab Fab display scaffold
- **disease/structureFamily**: 前列腺癌 · Fab 候选
- **files**: PSMA-Fab-01.pdb, PSMA-Fab-02.pdb, PSMA-Fab-03.pdb, PSMA-Fab-04.pdb, PSMA-Fab-05.pdb

### 65. CD74

- **target**: CD74
- **gene**: CD74
- **aliases**: CD74, HLA class II histocompatibility antigen gamma chain
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: cancer_cd74
- **aliasPrefix**: CD74-Fab
- **fileCount**: 5
- **sourcePdbIds**: 2WRH
- **structuralBasis**: RCSB 2WRH CD74 + trastuzumab Fab display scaffold
- **disease/structureFamily**: B细胞淋巴瘤 · Fab 候选
- **files**: CD74-Fab-01.pdb, CD74-Fab-02.pdb, CD74-Fab-03.pdb, CD74-Fab-04.pdb, CD74-Fab-05.pdb

### 66. TIM-3/HAVCR2

- **target**: TIM-3
- **gene**: HAVCR2
- **aliases**: HAVCR2, T-cell immunoglobulin and mucin domain-containing protein 3
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: cancer_tim3
- **aliasPrefix**: TIM3-Fab
- **fileCount**: 5
- **sourcePdbIds**: 5F71
- **structuralBasis**: RCSB 5F71 TIM-3 + trastuzumab Fab display scaffold
- **disease/structureFamily**: T细胞耗竭 · Fab 候选
- **files**: TIM3-Fab-01.pdb, TIM3-Fab-02.pdb, TIM3-Fab-03.pdb, TIM3-Fab-04.pdb, TIM3-Fab-05.pdb

### 67. GITR/TNFRSF18

- **target**: GITR
- **gene**: TNFRSF18
- **aliases**: TNFRSF18, CD357
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: cancer_gitr
- **aliasPrefix**: GITR-Fab
- **fileCount**: 5
- **sourcePdbIds**: 5WHD
- **structuralBasis**: RCSB 5WHD GITR + nivolumab Fab display scaffold
- **disease/structureFamily**: T细胞激活 · Fab 候选
- **files**: GITR-Fab-01.pdb, GITR-Fab-02.pdb, GITR-Fab-03.pdb, GITR-Fab-04.pdb, GITR-Fab-05.pdb

### 68. OX40/TNFRSF4

- **target**: OX40
- **gene**: TNFRSF4
- **aliases**: TNFRSF4, CD134
- **organism**: Homo sapiens
- **antibodyFormat**: VHH
- **routeId**: cancer_ox40
- **aliasPrefix**: OX40-VHH
- **fileCount**: 5
- **sourcePdbIds**: 5I8J
- **structuralBasis**: RCSB 5I8J OX40 + IL33-VHH display scaffold
- **disease/structureFamily**: T细胞共刺激 · VHH 候选
- **files**: OX40-VHH-01.pdb, OX40-VHH-02.pdb, OX40-VHH-03.pdb, OX40-VHH-04.pdb, OX40-VHH-05.pdb

### 69. 4-1BB/TNFRSF9

- **target**: 4-1BB
- **gene**: TNFRSF9
- **aliases**: TNFRSF9, CD137
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: cancer_41bb
- **aliasPrefix**: 41BB-Fab
- **fileCount**: 5
- **sourcePdbIds**: 4ZGP
- **structuralBasis**: RCSB 4ZGP 4-1BB + daratumumab Fab display scaffold
- **disease/structureFamily**: T细胞共刺激 · Fab 候选
- **files**: 41BB-Fab-01.pdb, 41BB-Fab-02.pdb, 41BB-Fab-03.pdb, 41BB-Fab-04.pdb, 41BB-Fab-05.pdb

### 70. CD40/TNFRSF5

- **target**: CD40
- **gene**: TNFRSF5
- **aliases**: TNFRSF5, CD40 antigen
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: cancer_cd40
- **aliasPrefix**: CD40-Fab
- **fileCount**: 5
- **sourcePdbIds**: 5L01
- **structuralBasis**: RCSB 5L01 CD40 + tozorakimab Fab display scaffold
- **disease/structureFamily**: 免疫激活 · Fab 候选
- **files**: CD40-Fab-01.pdb, CD40-Fab-02.pdb, CD40-Fab-03.pdb, CD40-Fab-04.pdb, CD40-Fab-05.pdb

### 71. CD27/TNFRSF7

- **target**: CD27
- **gene**: TNFRSF7
- **aliases**: TNFRSF7, T14
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: cancer_cd27
- **aliasPrefix**: CD27-Fab
- **fileCount**: 5
- **sourcePdbIds**: 5NLE
- **structuralBasis**: RCSB 5NLE CD27 + certolizumab Fab display scaffold
- **disease/structureFamily**: T细胞共刺激 · Fab 候选
- **files**: CD27-Fab-01.pdb, CD27-Fab-02.pdb, CD27-Fab-03.pdb, CD27-Fab-04.pdb, CD27-Fab-05.pdb

### 72. DR5/TNFRSF10B

- **target**: DR5
- **gene**: TNFRSF10B
- **aliases**: TNFRSF10B, TRAIL receptor 2, CD262
- **organism**: Homo sapiens
- **antibodyFormat**: VHH
- **routeId**: cancer_dr5
- **aliasPrefix**: DR5-VHH
- **fileCount**: 5
- **sourcePdbIds**: 5C85
- **structuralBasis**: RCSB 5C85 DR5 + TSLP-VHH display scaffold
- **disease/structureFamily**: 凋亡诱导 · VHH 候选
- **files**: DR5-VHH-01.pdb, DR5-VHH-02.pdb, DR5-VHH-03.pdb, DR5-VHH-04.pdb, DR5-VHH-05.pdb

### 73. CLDN6

- **target**: CLDN6
- **gene**: CLDN6
- **aliases**: CLDN6, Claudin-6
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: cancer_cldn6
- **aliasPrefix**: CLDN6-Fab
- **fileCount**: 5
- **sourcePdbIds**: 6XG7
- **structuralBasis**: RCSB 6XG7 CLDN6 + cetuximab Fab display scaffold
- **disease/structureFamily**: 卵巢/睾丸癌 · Fab 候选
- **files**: CLDN6-Fab-01.pdb, CLDN6-Fab-02.pdb, CLDN6-Fab-03.pdb, CLDN6-Fab-04.pdb, CLDN6-Fab-05.pdb

### 74. CDH6

- **target**: CDH6
- **gene**: CDH6
- **aliases**: CDH6, K-cadherin
- **organism**: Homo sapiens
- **antibodyFormat**: VHH
- **routeId**: cancer_cdh6
- **aliasPrefix**: CDH6-VHH
- **fileCount**: 5
- **sourcePdbIds**: 5C4H
- **structuralBasis**: RCSB 5C4H CDH6 + IL33-VHH display scaffold
- **disease/structureFamily**: 卵巢/肾癌 · VHH 候选
- **files**: CDH6-VHH-01.pdb, CDH6-VHH-02.pdb, CDH6-VHH-03.pdb, CDH6-VHH-04.pdb, CDH6-VHH-05.pdb

### 75. PRLR

- **target**: PRLR
- **gene**: PRLR
- **aliases**: PRLR, prolactin receptor
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: cancer_prlr
- **aliasPrefix**: PRLR-Fab
- **fileCount**: 5
- **sourcePdbIds**: 3D48
- **structuralBasis**: RCSB 3D48 PRLR + certolizumab Fab display scaffold
- **disease/structureFamily**: 乳腺/前列腺癌 · Fab 候选
- **files**: PRLR-Fab-01.pdb, PRLR-Fab-02.pdb, PRLR-Fab-03.pdb, PRLR-Fab-04.pdb, PRLR-Fab-05.pdb

### 76. SSTR2

- **target**: SSTR2
- **gene**: SSTR2
- **aliases**: SSTR2, somatostatin receptor 2
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: cancer_sstr2
- **aliasPrefix**: SSTR2-Fab
- **fileCount**: 5
- **sourcePdbIds**: 6WB4
- **structuralBasis**: RCSB 6WB4 SSTR2 + daratumumab Fab display scaffold
- **disease/structureFamily**: NET/GIST · Fab 候选
- **files**: SSTR2-Fab-01.pdb, SSTR2-Fab-02.pdb, SSTR2-Fab-03.pdb, SSTR2-Fab-04.pdb, SSTR2-Fab-05.pdb

### 77. GUCY2C

- **target**: GUCY2C
- **gene**: GUCY2C
- **aliases**: GUCY2C, GC-C, guanylate cyclase C
- **organism**: Homo sapiens
- **antibodyFormat**: VHH
- **routeId**: cancer_gucy2c
- **aliasPrefix**: GUCY2C-VHH
- **fileCount**: 5
- **sourcePdbIds**: 6B25
- **structuralBasis**: RCSB 6B25 GUCY2C + TSLP-VHH display scaffold
- **disease/structureFamily**: 结直肠癌 · VHH 候选
- **files**: GUCY2C-VHH-01.pdb, GUCY2C-VHH-02.pdb, GUCY2C-VHH-03.pdb, GUCY2C-VHH-04.pdb, GUCY2C-VHH-05.pdb

### 78. IL-31/IL31

- **target**: IL-31
- **gene**: IL31
- **aliases**: IL31, interleukin-31
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: inflam_il31
- **aliasPrefix**: IL31-Fab
- **fileCount**: 5
- **sourcePdbIds**: 5N0Y
- **structuralBasis**: RCSB 5N0Y IL-31 + trastuzumab Fab display scaffold
- **disease/structureFamily**: 特应性皮炎 · Fab 候选
- **files**: IL31-Fab-01.pdb, IL31-Fab-02.pdb, IL31-Fab-03.pdb, IL31-Fab-04.pdb, IL31-Fab-05.pdb

### 79. IL-17RA/IL17RA

- **target**: IL-17RA
- **gene**: IL17RA
- **aliases**: IL17RA, IL-17 receptor A
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: inflam_il17ra
- **aliasPrefix**: IL17RA-Fab
- **fileCount**: 5
- **sourcePdbIds**: 6I1K
- **structuralBasis**: RCSB 6I1K IL-17RA + bevacizumab Fab display scaffold
- **disease/structureFamily**: 银屑病 · Fab 候选
- **files**: IL17RA-Fab-01.pdb, IL17RA-Fab-02.pdb, IL17RA-Fab-03.pdb, IL17RA-Fab-04.pdb, IL17RA-Fab-05.pdb

### 80. GM-CSF/CSF2

- **target**: GM-CSF
- **gene**: CSF2
- **aliases**: CSF2, granulocyte-macrophage colony-stimulating factor
- **organism**: Homo sapiens
- **antibodyFormat**: VHH
- **routeId**: inflam_gmcsf
- **aliasPrefix**: GMCSF-VHH
- **fileCount**: 5
- **sourcePdbIds**: 4RSK
- **structuralBasis**: RCSB 4RSK GM-CSF + IL33-VHH display scaffold
- **disease/structureFamily**: 类风湿关节炎 · VHH 候选
- **files**: GMCSF-VHH-01.pdb, GMCSF-VHH-02.pdb, GMCSF-VHH-03.pdb, GMCSF-VHH-04.pdb, GMCSF-VHH-05.pdb

### 81. IL-36α/IL36A

- **target**: IL-36α
- **gene**: IL36A
- **aliases**: IL36A, IL-36 alpha
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: inflam_il36a
- **aliasPrefix**: IL36A-Fab
- **fileCount**: 5
- **sourcePdbIds**: 4I6B
- **structuralBasis**: RCSB 4I6B IL-36α + bevacizumab Fab display scaffold
- **disease/structureFamily**: 银屑病 · Fab 候选
- **files**: IL36A-Fab-01.pdb, IL36A-Fab-02.pdb, IL36A-Fab-03.pdb, IL36A-Fab-04.pdb, IL36A-Fab-05.pdb

### 82. BAFF-R/TNFRSF13C

- **target**: BAFF-R
- **gene**: TNFRSF13C
- **aliases**: TNFRSF13C, BAFF receptor, CD268
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: inflam_baffr
- **aliasPrefix**: BAFFR-Fab
- **fileCount**: 5
- **sourcePdbIds**: 6E0M
- **structuralBasis**: RCSB 6E0M BAFF-R + trastuzumab Fab display scaffold
- **disease/structureFamily**: SLE · Fab 候选
- **files**: BAFFR-Fab-01.pdb, BAFFR-Fab-02.pdb, BAFFR-Fab-03.pdb, BAFFR-Fab-04.pdb, BAFFR-Fab-05.pdb

### 83. GLP-1R/GLP1R

- **target**: GLP-1R
- **gene**: GLP1R
- **aliases**: GLP1R, GLP-1 receptor, glucagon-like peptide 1 receptor
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: metab_glp1r
- **aliasPrefix**: GLP1R-Fab
- **fileCount**: 5
- **sourcePdbIds**: 5NX2
- **structuralBasis**: RCSB 5NX2 GLP-1R + certolizumab Fab display scaffold
- **disease/structureFamily**: 2型糖尿病 · Fab 候选
- **files**: GLP1R-Fab-01.pdb, GLP1R-Fab-02.pdb, GLP1R-Fab-03.pdb, GLP1R-Fab-04.pdb, GLP1R-Fab-05.pdb

### 84. FGF21

- **target**: FGF21
- **gene**: FGF21
- **aliases**: FGF21, fibroblast growth factor 21
- **organism**: Homo sapiens
- **antibodyFormat**: VHH
- **routeId**: metab_fgf21
- **aliasPrefix**: FGF21-VHH
- **fileCount**: 5
- **sourcePdbIds**: 6M6E
- **structuralBasis**: RCSB 6M6E FGF21 + IL33-VHH display scaffold
- **disease/structureFamily**: NASH · VHH 候选
- **files**: FGF21-VHH-01.pdb, FGF21-VHH-02.pdb, FGF21-VHH-03.pdb, FGF21-VHH-04.pdb, FGF21-VHH-05.pdb

### 85. LGR5

- **target**: LGR5
- **gene**: LGR5
- **aliases**: LGR5, GPR49, leucine-rich repeat-containing G protein-coupled receptor 5
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: metab_lgr5
- **aliasPrefix**: LGR5-Fab
- **fileCount**: 5
- **sourcePdbIds**: 4BSF
- **structuralBasis**: RCSB 4BSF LGR5 + daratumumab Fab display scaffold
- **disease/structureFamily**: 肝细胞癌 · Fab 候选
- **files**: LGR5-Fab-01.pdb, LGR5-Fab-02.pdb, LGR5-Fab-03.pdb, LGR5-Fab-04.pdb, LGR5-Fab-05.pdb

### 86. BACE1

- **target**: BACE1
- **gene**: BACE1
- **aliases**: BACE1, beta-site APP cleaving enzyme 1
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: neuro_bace1
- **aliasPrefix**: BACE1-Fab
- **fileCount**: 5
- **sourcePdbIds**: 1FKN
- **structuralBasis**: RCSB 1FKN BACE1 + daratumumab Fab display scaffold
- **disease/structureFamily**: 阿尔茨海默病 · Fab 候选
- **files**: BACE1-Fab-01.pdb, BACE1-Fab-02.pdb, BACE1-Fab-03.pdb, BACE1-Fab-04.pdb, BACE1-Fab-05.pdb

### 87. Leptin receptor/LEPR

- **target**: Leptin receptor
- **gene**: LEPR
- **aliases**: LEPR, LEP-R, obesity receptor
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: neuro_lepr
- **aliasPrefix**: LEPR-Fab
- **fileCount**: 5
- **sourcePdbIds**: 6V76
- **structuralBasis**: RCSB 6V76 Leptin receptor + certolizumab Fab display scaffold
- **disease/structureFamily**: 肥胖症 · Fab 候选
- **files**: LEPR-Fab-01.pdb, LEPR-Fab-02.pdb, LEPR-Fab-03.pdb, LEPR-Fab-04.pdb, LEPR-Fab-05.pdb

### 88. Dengue E/DENV-E

- **target**: Dengue E
- **gene**: DENV-E
- **aliases**: dengue virus envelope protein, DENV E
- **organism**: Dengue virus
- **antibodyFormat**: Fab
- **routeId**: infect_dengue
- **aliasPrefix**: DENGUE-E-Fab
- **fileCount**: 5
- **sourcePdbIds**: 1OAN
- **structuralBasis**: RCSB 1OAN Dengue E + daratumumab Fab display scaffold
- **disease/structureFamily**: 登革热 · Fab 候选
- **files**: DENGUE-E-Fab-01.pdb, DENGUE-E-Fab-02.pdb, DENGUE-E-Fab-03.pdb, DENGUE-E-Fab-04.pdb, DENGUE-E-Fab-05.pdb

### 89. Zika NS1/ZIKV-NS1

- **target**: Zika NS1
- **gene**: ZIKV-NS1
- **aliases**: Zika virus non-structural protein 1, ZIKV NS1
- **organism**: Zika virus
- **antibodyFormat**: Fab
- **routeId**: infect_zika
- **aliasPrefix**: ZIKA-NS1-Fab
- **fileCount**: 5
- **sourcePdbIds**: 5GS6
- **structuralBasis**: RCSB 5GS6 Zika NS1 + cetuximab Fab display scaffold
- **disease/structureFamily**: 寨卡 · Fab 候选
- **files**: ZIKA-NS1-Fab-01.pdb, ZIKA-NS1-Fab-02.pdb, ZIKA-NS1-Fab-03.pdb, ZIKA-NS1-Fab-04.pdb, ZIKA-NS1-Fab-05.pdb

### 90. Rabies G/RABV-G

- **target**: Rabies G
- **gene**: RABV-G
- **aliases**: rabies virus glycoprotein, RABV G
- **organism**: Rabies virus
- **antibodyFormat**: Fab
- **routeId**: infect_rabies
- **aliasPrefix**: RABIES-G-Fab
- **fileCount**: 5
- **sourcePdbIds**: 6W8J
- **structuralBasis**: RCSB 6W8J Rabies G + certolizumab Fab display scaffold
- **disease/structureFamily**: 狂犬病 · Fab 候选
- **files**: RABIES-G-Fab-01.pdb, RABIES-G-Fab-02.pdb, RABIES-G-Fab-03.pdb, RABIES-G-Fab-04.pdb, RABIES-G-Fab-05.pdb

### 91. CMV gB/HCMV-UL55

- **target**: CMV gB
- **gene**: HCMV-UL55
- **aliases**: cytomegalovirus glycoprotein B, HCMV gB
- **organism**: Human cytomegalovirus
- **antibodyFormat**: Fab
- **routeId**: infect_cmv
- **aliasPrefix**: CMV-GB-Fab
- **fileCount**: 5
- **sourcePdbIds**: 5ZB3
- **structuralBasis**: RCSB 5ZB3 CMV gB + bevacizumab Fab display scaffold
- **disease/structureFamily**: CMV感染 · Fab 候选
- **files**: CMV-GB-Fab-01.pdb, CMV-GB-Fab-02.pdb, CMV-GB-Fab-03.pdb, CMV-GB-Fab-04.pdb, CMV-GB-Fab-05.pdb

### 92. CD22/Siglec-2

- **target**: CD22
- **gene**: CD22
- **aliases**: SIGLEC2, B-cell receptor CD22, Leu-14
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: heme_cd22
- **aliasPrefix**: CD22-Fab
- **fileCount**: 1
- **sourcePdbIds**: 5VL3
- **structuralBasis**: RCSB 5VL3 human CD22 D1-D3 ectodomain / epratuzumab Fab complex
- **disease/structureFamily**: B 细胞谱系表面受体 · CD22 Fab 候选
- **files**: CD22-Fab-01.pdb

### 93. Mesothelin/MSLN

- **target**: Mesothelin
- **gene**: MSLN
- **aliases**: MSLN, CAK1, SMRP
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: solid_tumor_mesothelin
- **aliasPrefix**: MSLN-Fab
- **fileCount**: 1
- **sourcePdbIds**: 7UED
- **structuralBasis**: RCSB 7UED full-length mesothelin / MORAb-009 Fab complex
- **disease/structureFamily**: 实体瘤表面抗原 · Mesothelin Fab 候选
- **files**: MSLN-Fab-01.pdb

### 94. Claudin 18.2/CLDN18

- **target**: Claudin 18.2
- **gene**: CLDN18
- **aliases**: CLDN18.2, Claudin-18.2, Claudin 18.2
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: solid_tumor_cldn18
- **aliasPrefix**: CLDN18.2-Fab
- **fileCount**: 1
- **sourcePdbIds**: 9V32
- **structuralBasis**: RCSB 9V32 claudin 18.2 / zolbetuximab Fab complex
- **disease/structureFamily**: 胃癌相关膜蛋白 · Claudin 18.2 Fab 候选
- **files**: CLDN18.2-Fab-01.pdb

### 95. MET/c-MET

- **target**: MET
- **gene**: MET
- **aliases**: c-MET, MET receptor, HGF receptor, Hepatocyte growth factor receptor
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: solid_tumor_met
- **aliasPrefix**: MET-Fab
- **fileCount**: 1
- **sourcePdbIds**: 6I04
- **structuralBasis**: RCSB 6I04 human MET Sema domain / MM-131 Fab arm complex
- **disease/structureFamily**: 实体瘤受体酪氨酸激酶 · MET Fab 候选
- **files**: MET-Fab-01.pdb

### 96. HER3/ERBB3

- **target**: HER3
- **gene**: ERBB3
- **aliases**: ERBB3, ErbB3, Receptor tyrosine-protein kinase erbB-3
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: solid_tumor_her3
- **aliasPrefix**: HER3-Fab
- **fileCount**: 1
- **sourcePdbIds**: 7D85
- **structuralBasis**: RCSB 7D85 human HER3/ERBB3 extracellular domain 3 / ISU104 Fab complex
- **disease/structureFamily**: 实体瘤 ErbB 受体 · HER3 Fab 候选
- **files**: HER3-Fab-01.pdb

### 97. B7-H3/CD276

- **target**: B7-H3
- **gene**: CD276
- **aliases**: CD276, B7H3, B7-H3/CD276
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: solid_tumor_b7h3
- **aliasPrefix**: CD276-Fab
- **fileCount**: 1
- **sourcePdbIds**: 9LY5
- **structuralBasis**: RCSB 9LY5 human B7-H3 IgC domain / 20G5 Fab complex
- **disease/structureFamily**: 实体瘤免疫调节表面抗原 · B7-H3 Fab 候选
- **files**: CD276-Fab-01.pdb

### 98. B7-H6/NCR3LG1

- **target**: B7-H6
- **gene**: NCR3LG1
- **aliases**: NCR3LG1, B7H6, Natural cytotoxicity triggering receptor 3 ligand 1
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: solid_tumor_b7h6
- **aliasPrefix**: B7H6-Fab
- **fileCount**: 1
- **sourcePdbIds**: 4ZSO
- **structuralBasis**: RCSB 4ZSO human B7-H6 ectodomain / inhibitory antibody Fab complex
- **disease/structureFamily**: 实体瘤免疫配体 · B7-H6 Fab 候选
- **files**: B7H6-Fab-01.pdb

### 99. MUC1

- **target**: MUC1
- **gene**: MUC1
- **aliases**: Mucin-1, CD227
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: solid_tumor_muc1
- **aliasPrefix**: MUC1-Fab
- **fileCount**: 1
- **sourcePdbIds**: 7V7K
- **structuralBasis**: RCSB 7V7K MUC1 GlycoST VNTR glycopeptide / 16A Fab complex
- **disease/structureFamily**: 肿瘤相关糖蛋白抗原 · MUC1 glycopeptide Fab 候选
- **files**: MUC1-Fab-01.pdb

### 100. Nectin-4/NECTIN4

- **target**: Nectin-4
- **gene**: NECTIN4
- **aliases**: NECTIN4, PVRL4, Nectin4
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: solid_tumor_nectin4
- **aliasPrefix**: NECTIN4-Fab
- **fileCount**: 1
- **sourcePdbIds**: 9KKJ
- **structuralBasis**: RCSB 9KKJ Nectin-4 D1 domain / 9MW2821 Fab complex
- **disease/structureFamily**: 尿路上皮癌相关黏附分子 · Nectin-4 Fab 候选
- **files**: NECTIN4-Fab-01.pdb

### 101. FGFR2/KGFR

- **target**: FGFR2
- **gene**: FGFR2
- **aliases**: Fibroblast growth factor receptor 2, FGFR2b, KGFR, K-SAM
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: upper_gi_fgfr2
- **aliasPrefix**: FGFR2-Fab
- **fileCount**: 1
- **sourcePdbIds**: 4WV1
- **structuralBasis**: RCSB 4WV1 human FGFR2 D2 domain / Fab 2B.1.3 complex
- **disease/structureFamily**: 上消化道肿瘤相关受体酪氨酸激酶 · FGFR2 Fab 候选
- **files**: FGFR2-Fab-01.pdb

### 102. FGFR3

- **target**: FGFR3
- **gene**: FGFR3
- **aliases**: Fibroblast growth factor receptor 3, JTK4
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: urothelial_fgfr3
- **aliasPrefix**: FGFR3-Fab
- **fileCount**: 1
- **sourcePdbIds**: 3GRW
- **structuralBasis**: RCSB 3GRW human FGFR3 domains 2-3 / R3Mab Fab complex
- **disease/structureFamily**: 尿路上皮癌相关受体酪氨酸激酶 · FGFR3 Fab 候选
- **files**: FGFR3-Fab-01.pdb

### 103. GPRC5D

- **target**: GPRC5D
- **gene**: GPRC5D
- **aliases**: GPCR family C group 5 member D
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: heme_gprc5d
- **aliasPrefix**: GPRC5D-Fab
- **fileCount**: 1
- **sourcePdbIds**: 9IMA
- **structuralBasis**: RCSB 9IMA GPRC5D dimer / talquetamab Fab complex
- **disease/structureFamily**: 浆细胞肿瘤表面受体 · GPRC5D Fab 候选
- **files**: GPRC5D-Fab-01.pdb

### 104. CEACAM5/CEA

- **target**: CEACAM5
- **gene**: CEACAM5
- **aliases**: CEA, Carcinoembryonic antigen, CD66e
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: solid_tumor_ceacam5
- **aliasPrefix**: CEACAM5-Fab
- **fileCount**: 1
- **sourcePdbIds**: 8BW0
- **structuralBasis**: RCSB 8BW0 CEACAM5 A3-B3 domain / tusamitamab Fab complex
- **disease/structureFamily**: 胃肠道肿瘤相关表面抗原 · CEACAM5 Fab 候选
- **files**: CEACAM5-Fab-01.pdb

### 105. STEAP1

- **target**: STEAP1
- **gene**: STEAP1
- **aliases**: STEAP-1, Six-transmembrane epithelial antigen of the prostate 1
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: prostate_steap1
- **aliasPrefix**: STEAP1-Fab
- **fileCount**: 1
- **sourcePdbIds**: 6Y9B
- **structuralBasis**: RCSB 6Y9B trimeric human STEAP1 / Fab120.545 complex
- **disease/structureFamily**: 前列腺癌相关膜蛋白 · STEAP1 Fab 候选
- **files**: STEAP1-Fab-01.pdb

### 106. CAIX/CA9

- **target**: CAIX
- **gene**: CA9
- **aliases**: CA9, Carbonic anhydrase IX, Carbonic anhydrase 9, G250, MN
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: renal_caix
- **aliasPrefix**: CAIX-Fab
- **fileCount**: 1
- **sourcePdbIds**: 2HKF
- **structuralBasis**: RCSB 2HKF CAIX proteoglycan-like domain peptide epitope / M75 Fab complex
- **disease/structureFamily**: 肾癌相关缺氧表面抗原 · CAIX peptide Fab 候选
- **files**: CAIX-Fab-01.pdb

### 107. IL-5/IL5

- **target**: IL-5
- **gene**: IL5
- **aliases**: IL5, Interleukin-5
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: allergic_il5
- **aliasPrefix**: IL5-Fab
- **fileCount**: 1
- **sourcePdbIds**: 9GVN
- **structuralBasis**: RCSB 9GVN depemokimab Fab / IL-5 dimer complex
- **disease/structureFamily**: 2 型炎症细胞因子 · IL-5 Fab 候选
- **files**: IL5-Fab-01.pdb

### 108. IL-13/IL13

- **target**: IL-13
- **gene**: IL13
- **aliases**: IL13, Interleukin-13
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: allergic_il13
- **aliasPrefix**: IL13-Fab
- **fileCount**: 1
- **sourcePdbIds**: 5L6Y
- **structuralBasis**: RCSB 5L6Y IL-13 / tralokinumab Fab complex
- **disease/structureFamily**: 2 型炎症细胞因子 · IL-13 Fab 候选
- **files**: IL13-Fab-01.pdb

### 109. CD123/IL3RA

- **target**: CD123
- **gene**: IL3RA
- **aliases**: IL3RA, Interleukin-3 receptor alpha, IL-3R alpha
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: heme_cd123
- **aliasPrefix**: CD123-Fab
- **fileCount**: 1
- **sourcePdbIds**: 4JZJ
- **structuralBasis**: RCSB 4JZJ human CD123 D2-D3 ectodomain / CSL362 Fab complex
- **disease/structureFamily**: 髓系白血病相关表面受体 · CD123 Fab 候选
- **files**: CD123-Fab-01.pdb

### 110. BAFF/TNFSF13B

- **target**: BAFF
- **gene**: TNFSF13B
- **aliases**: BLyS, B-cell activating factor, TNFSF13B, TALL-1
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: autoimmune_baff
- **aliasPrefix**: BAFF-Fab
- **fileCount**: 1
- **sourcePdbIds**: 6FXN
- **structuralBasis**: RCSB 6FXN human BAFF trimer / belimumab Fab complex
- **disease/structureFamily**: 自身免疫 B 细胞生存配体 · BAFF Fab 候选
- **files**: BAFF-Fab-01.pdb

### 111. FcRn/FCGRT

- **target**: FcRn
- **gene**: FCGRT
- **aliases**: FCRN, Neonatal Fc receptor, FCGRT
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: autoimmune_fcrn
- **aliasPrefix**: FCRN-Fab
- **fileCount**: 1
- **sourcePdbIds**: 9MI6
- **structuralBasis**: RCSB 9MI6 human FcRn / beta-2-microglobulin / nipocalimab Fab complex
- **disease/structureFamily**: IgG 转运受体复合物 · FcRn Fab 候选
- **files**: FCRN-Fab-01.pdb

### 112. NGF

- **target**: NGF
- **gene**: NGF
- **aliases**: Beta-NGF, Nerve growth factor
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: pain_ngf
- **aliasPrefix**: NGF-Fab
- **fileCount**: 1
- **sourcePdbIds**: 4EDW
- **structuralBasis**: RCSB 4EDW human beta-NGF / tanezumab Fab complex
- **disease/structureFamily**: 神经营养因子配体 · NGF Fab 候选
- **files**: NGF-Fab-01.pdb

### 113. CD33/Siglec-3

- **target**: CD33
- **gene**: CD33
- **aliases**: SIGLEC3, Siglec-3, Myeloid cell surface antigen CD33
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: heme_cd33
- **aliasPrefix**: CD33-Fab
- **fileCount**: 1
- **sourcePdbIds**: 9VL2
- **structuralBasis**: RCSB 9VL2 human CD33 / Fab-10C8 complex
- **disease/structureFamily**: 髓系白血病相关 Siglec 受体 · CD33 Fab 候选
- **files**: CD33-Fab-01.pdb

### 114. GPC2/Glypican-2

- **target**: GPC2
- **gene**: GPC2
- **aliases**: Glypican-2, GPC-2, Cerebroglycan
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: sclc_gpc2
- **aliasPrefix**: GPC2-Fab
- **fileCount**: 1
- **sourcePdbIds**: 6WJL
- **structuralBasis**: RCSB 6WJL human GPC2 core protein / D3 Fab complex
- **disease/structureFamily**: 神经内分泌肿瘤相关 glypican 抗原 · GPC2 Fab 候选
- **files**: GPC2-Fab-01.pdb

### 115. Integrin α4β7/ITGA4-ITGB7

- **target**: Integrin α4β7
- **gene**: ITGA4 / ITGB7
- **aliases**: Integrin alpha4beta7, alpha4beta7, A4B7, α4β7, ITGA4/ITGB7
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: ibd_a4b7
- **aliasPrefix**: A4B7-Fab
- **fileCount**: 1
- **sourcePdbIds**: 3V4P
- **structuralBasis**: RCSB 3V4P human integrin α4β7 headpiece / ACT-1 Fab complex
- **disease/structureFamily**: 肠道炎症相关整合素受体 · α4β7 Fab 候选
- **files**: A4B7-Fab-01.pdb

### 116. IL-6/IL6

- **target**: IL-6
- **gene**: IL6
- **aliases**: IL6, Interleukin-6
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: inflammation_il6
- **aliasPrefix**: IL6-Fab
- **fileCount**: 1
- **sourcePdbIds**: 4ZS7
- **structuralBasis**: RCSB 4ZS7 human IL-6 / llama Fab 68F2 complex
- **disease/structureFamily**: 炎症细胞因子 · IL-6 Fab 候选
- **files**: IL6-Fab-01.pdb

### 117. Myostatin/GDF8

- **target**: Myostatin
- **gene**: GDF8
- **aliases**: MSTN, GDF8, Growth/differentiation factor 8
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: metabolic_myostatin
- **aliasPrefix**: MSTN-Fab
- **fileCount**: 1
- **sourcePdbIds**: 5F3H
- **structuralBasis**: RCSB 5F3H human myostatin/GDF8 dimer in complex with humanized RK35 Fab
- **disease/structureFamily**: 代谢与体成分调控配体 · Myostatin Fab 候选
- **files**: MSTN-Fab-01.pdb

### 118. TrkB/NTRK2

- **target**: TrkB
- **gene**: NTRK2
- **aliases**: NTRK2, Tropomyosin receptor kinase B, Neurotrophic tyrosine kinase receptor type 2
- **organism**: Homo sapiens
- **antibodyFormat**: Fab
- **routeId**: neuro_trkb
- **aliasPrefix**: TRKB-Fab
- **fileCount**: 1
- **sourcePdbIds**: 5MO9
- **structuralBasis**: RCSB 5MO9 human TrkB ligand-binding domain / AB20 Fab complex
- **disease/structureFamily**: 神经营养因子受体 ligand-binding domain · TrkB Fab 候选
- **files**: TRKB-Fab-01.pdb

### 119. CD40LG/CD40LG

- **target**: CD40LG
- **gene**: CD40LG
- **aliases**: CD40LG, CD40LG
- **organism**: HOMO SAPIENS
- **antibodyFormat**: VHH
- **routeId**: display_pose_cd40lg_0
- **aliasPrefix**: CD40LG-VHH-1ALY
- **fileCount**: 1
- **sourcePdbIds**: 1ALY
- **structuralBasis**: RCSB 1ALY CD40LG antigen / representative VHH display pose
- **disease/structureFamily**: 免疫炎症方向靶点 · VHH 展示候选
- **files**: CD40LG-VHH-1ALY.pdb

### 120. ARSA/ARSA

- **target**: ARSA
- **gene**: ARSA
- **aliases**: ARSA, ARSA
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_arsa_1
- **aliasPrefix**: ARSA-Fab-1AUK
- **fileCount**: 1
- **sourcePdbIds**: 1AUK
- **structuralBasis**: RCSB 1AUK ARSA antigen / representative Fab display pose
- **disease/structureFamily**: 内分泌方向靶点 · Fab 展示候选
- **files**: ARSA-Fab-1AUK.pdb

### 121. APOA1/APOA1

- **target**: APOA1
- **gene**: APOA1
- **aliases**: APOA1, APOA1
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_apoa1_2
- **aliasPrefix**: APOA1-Fab-1AV1
- **fileCount**: 1
- **sourcePdbIds**: 1AV1
- **structuralBasis**: RCSB 1AV1 APOA1 antigen / representative Fab display pose
- **disease/structureFamily**: 其他方向靶点 · Fab 展示候选
- **files**: APOA1-Fab-1AV1.pdb

### 122. APOE/APOE

- **target**: APOE
- **gene**: APOE
- **aliases**: APOE, APOE
- **organism**: HOMO SAPIENS
- **antibodyFormat**: VHH
- **routeId**: display_pose_apoe_3
- **aliasPrefix**: APOE-VHH-1B68
- **fileCount**: 1
- **sourcePdbIds**: 1B68
- **structuralBasis**: RCSB 1B68 APOE antigen / representative VHH display pose
- **disease/structureFamily**: 其他方向靶点 · VHH 展示候选
- **files**: APOE-VHH-1B68.pdb

### 123. EPO/EPO

- **target**: EPO
- **gene**: EPO
- **aliases**: EPO, EPO
- **organism**: HOMO SAPIENS
- **antibodyFormat**: VHH
- **routeId**: display_pose_epo_4
- **aliasPrefix**: EPO-VHH-1BUY
- **fileCount**: 1
- **sourcePdbIds**: 1BUY
- **structuralBasis**: RCSB 1BUY EPO antigen / representative VHH display pose
- **disease/structureFamily**: 凝血/血液方向靶点 · VHH 展示候选
- **files**: EPO-VHH-1BUY.pdb

### 124. DMD/DMD

- **target**: DMD
- **gene**: DMD
- **aliases**: DMD, DMD
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_dmd_5
- **aliasPrefix**: DMD-Fab-1DXX
- **fileCount**: 1
- **sourcePdbIds**: 1DXX
- **structuralBasis**: RCSB 1DXX DMD antigen / representative Fab display pose
- **disease/structureFamily**: 其他方向靶点 · Fab 展示候选
- **files**: DMD-Fab-1DXX.pdb

### 125. APC/APC

- **target**: APC
- **gene**: APC
- **aliases**: APC, APC
- **organism**: HOMO SAPIENS
- **antibodyFormat**: VHH
- **routeId**: display_pose_apc_6
- **aliasPrefix**: APC-VHH-1EMU
- **fileCount**: 1
- **sourcePdbIds**: 1EMU
- **structuralBasis**: RCSB 1EMU APC antigen / representative VHH display pose
- **disease/structureFamily**: 肿瘤方向靶点 · VHH 展示候选
- **files**: APC-VHH-1EMU.pdb

### 126. EPOR/EPOR

- **target**: EPOR
- **gene**: EPOR
- **aliases**: EPOR, EPOR
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_epor_7
- **aliasPrefix**: EPOR-Fab-1ERN
- **fileCount**: 1
- **sourcePdbIds**: 1ERN
- **structuralBasis**: RCSB 1ERN EPOR antigen / representative Fab display pose
- **disease/structureFamily**: 凝血/血液方向靶点 · Fab 展示候选
- **files**: EPOR-Fab-1ERN.pdb

### 127. TTR/TTR

- **target**: TTR
- **gene**: TTR
- **aliases**: TTR, TTR
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_ttr_8
- **aliasPrefix**: TTR-Fab-1F41
- **fileCount**: 1
- **sourcePdbIds**: 1F41
- **structuralBasis**: RCSB 1F41 TTR antigen / representative Fab display pose
- **disease/structureFamily**: 其他方向靶点 · Fab 展示候选
- **files**: TTR-Fab-1F41.pdb

### 128. IL12B/IL12B

- **target**: IL12B
- **gene**: IL12B
- **aliases**: IL12B, IL12B
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_il12b_9
- **aliasPrefix**: IL12B-Fab-1F45
- **fileCount**: 1
- **sourcePdbIds**: 1F45
- **structuralBasis**: RCSB 1F45 IL12B antigen / representative Fab display pose
- **disease/structureFamily**: 免疫炎症方向靶点 · Fab 展示候选
- **files**: IL12B-Fab-1F45.pdb

### 129. IFNG/IFNG

- **target**: IFNG
- **gene**: IFNG
- **aliases**: IFNG, IFNG
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_ifng_10
- **aliasPrefix**: IFNG-Fab-1FG9
- **fileCount**: 1
- **sourcePdbIds**: 1FG9
- **structuralBasis**: RCSB 1FG9 IFNG antigen / representative Fab display pose
- **disease/structureFamily**: 免疫炎症方向靶点 · Fab 展示候选
- **files**: IFNG-Fab-1FG9.pdb

### 130. FKBP1A/FKBP1A

- **target**: FKBP1A
- **gene**: FKBP1A
- **aliases**: FKBP1A, FKBP1A
- **organism**: HOMO SAPIENS
- **antibodyFormat**: VHH
- **routeId**: display_pose_fkbp1a_11
- **aliasPrefix**: FKBP1A-VHH-1FKJ
- **fileCount**: 1
- **sourcePdbIds**: 1FKJ
- **structuralBasis**: RCSB 1FKJ FKBP1A antigen / representative VHH display pose
- **disease/structureFamily**: 其他方向靶点 · VHH 展示候选
- **files**: FKBP1A-VHH-1FKJ.pdb

### 131. CRP/CRP

- **target**: CRP
- **gene**: CRP
- **aliases**: CRP, CRP
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_crp_12
- **aliasPrefix**: CRP-Fab-1GNH
- **fileCount**: 1
- **sourcePdbIds**: 1GNH
- **structuralBasis**: RCSB 1GNH CRP antigen / representative Fab display pose
- **disease/structureFamily**: 免疫炎症方向靶点 · Fab 展示候选
- **files**: CRP-Fab-1GNH.pdb

### 132. IL1B/IL1B

- **target**: IL1B
- **gene**: IL1B
- **aliases**: IL1B, IL1B
- **organism**: HOMO SAPIENS
- **antibodyFormat**: VHH
- **routeId**: display_pose_il1b_13
- **aliasPrefix**: IL1B-VHH-1I1B
- **fileCount**: 1
- **sourcePdbIds**: 1I1B
- **structuralBasis**: RCSB 1I1B IL1B antigen / representative VHH display pose
- **disease/structureFamily**: 免疫炎症方向靶点 · VHH 展示候选
- **files**: IL1B-VHH-1I1B.pdb

### 133. IL4R/IL4R

- **target**: IL4R
- **gene**: IL4R
- **aliases**: IL4R, IL4R
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_il4r_14
- **aliasPrefix**: IL4R-Fab-1IAR
- **fileCount**: 1
- **sourcePdbIds**: 1IAR
- **structuralBasis**: RCSB 1IAR IL4R antigen / representative Fab display pose
- **disease/structureFamily**: 其他方向靶点 · Fab 展示候选
- **files**: IL4R-Fab-1IAR.pdb

### 134. TNNI3/TNNI3

- **target**: TNNI3
- **gene**: TNNI3
- **aliases**: TNNI3, TNNI3
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_tnni3_15
- **aliasPrefix**: TNNI3-Fab-1J1E
- **fileCount**: 1
- **sourcePdbIds**: 1J1E
- **structuralBasis**: RCSB 1J1E TNNI3 antigen / representative Fab display pose
- **disease/structureFamily**: 神经/心血管方向靶点 · Fab 展示候选
- **files**: TNNI3-Fab-1J1E.pdb

### 135. PAH/PAH

- **target**: PAH
- **gene**: PAH
- **aliases**: PAH, PAH
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_pah_16
- **aliasPrefix**: PAH-Fab-1J8T
- **fileCount**: 1
- **sourcePdbIds**: 1J8T
- **structuralBasis**: RCSB 1J8T PAH antigen / representative Fab display pose
- **disease/structureFamily**: 其他方向靶点 · Fab 展示候选
- **files**: PAH-Fab-1J8T.pdb

### 136. IMPDH1/IMPDH1

- **target**: IMPDH1
- **gene**: IMPDH1
- **aliases**: IMPDH1, IMPDH1
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_impdh1_17
- **aliasPrefix**: IMPDH1-Fab-1JCN
- **fileCount**: 1
- **sourcePdbIds**: 1JCN
- **structuralBasis**: RCSB 1JCN IMPDH1 antigen / representative Fab display pose
- **disease/structureFamily**: 其他方向靶点 · Fab 展示候选
- **files**: IMPDH1-Fab-1JCN.pdb

### 137. TGFB1/TGFB1

- **target**: TGFB1
- **gene**: TGFB1
- **aliases**: TGFB1, TGFB1
- **organism**: HOMO SAPIENS
- **antibodyFormat**: VHH
- **routeId**: display_pose_tgfb1_18
- **aliasPrefix**: TGFB1-VHH-1KLC
- **fileCount**: 1
- **sourcePdbIds**: 1KLC
- **structuralBasis**: RCSB 1KLC TGFB1 antigen / representative VHH display pose
- **disease/structureFamily**: 免疫炎症方向靶点 · VHH 展示候选
- **files**: TGFB1-VHH-1KLC.pdb

### 138. ERBB3/ERBB3

- **target**: ERBB3
- **gene**: ERBB3
- **aliases**: ERBB3, ERBB3
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_erbb3_19
- **aliasPrefix**: ERBB3-Fab-1M6B
- **fileCount**: 1
- **sourcePdbIds**: 1M6B
- **structuralBasis**: RCSB 1M6B ERBB3 antigen / representative Fab display pose
- **disease/structureFamily**: 肿瘤方向靶点 · Fab 展示候选
- **files**: ERBB3-Fab-1M6B.pdb

### 139. IL6R/IL6R

- **target**: IL6R
- **gene**: IL6R
- **aliases**: IL6R, IL6R
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_il6r_20
- **aliasPrefix**: IL6R-Fab-1N26
- **fileCount**: 1
- **sourcePdbIds**: 1N26
- **structuralBasis**: RCSB 1N26 IL6R antigen / representative Fab display pose
- **disease/structureFamily**: 免疫炎症方向靶点 · Fab 展示候选
- **files**: IL6R-Fab-1N26.pdb

### 140. IFNAR2/IFNAR2

- **target**: IFNAR2
- **gene**: IFNAR2
- **aliases**: IFNAR2, IFNAR2
- **organism**: HOMO SAPIENS
- **antibodyFormat**: VHH
- **routeId**: display_pose_ifnar2_21
- **aliasPrefix**: IFNAR2-VHH-1N6V
- **fileCount**: 1
- **sourcePdbIds**: 1N6V
- **structuralBasis**: RCSB 1N6V IFNAR2 antigen / representative VHH display pose
- **disease/structureFamily**: 免疫炎症方向靶点 · VHH 展示候选
- **files**: IFNAR2-VHH-1N6V.pdb

### 141. CXCL10/CXCL10

- **target**: CXCL10
- **gene**: CXCL10
- **aliases**: CXCL10, CXCL10
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_cxcl10_22
- **aliasPrefix**: CXCL10-Fab-1O7Y
- **fileCount**: 1
- **sourcePdbIds**: 1O7Y
- **structuralBasis**: RCSB 1O7Y CXCL10 antigen / representative Fab display pose
- **disease/structureFamily**: 其他方向靶点 · Fab 展示候选
- **files**: CXCL10-Fab-1O7Y.pdb

### 142. NR1H4 / FXR/NR1H4

- **target**: NR1H4 / FXR
- **gene**: NR1H4
- **aliases**: NR1H4, NR1H4 / FXR
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_nr1h4___fxr_23
- **aliasPrefix**: NR1H4-FXR-Fab-1OSH
- **fileCount**: 1
- **sourcePdbIds**: 1OSH
- **structuralBasis**: RCSB 1OSH NR1H4 / FXR antigen / representative Fab display pose
- **disease/structureFamily**: 内分泌方向靶点 · Fab 展示候选
- **files**: NR1H4-FXR-Fab-1OSH.pdb

### 143. MYBPC3/MYBPC3

- **target**: MYBPC3
- **gene**: MYBPC3
- **aliases**: MYBPC3, MYBPC3
- **organism**: HOMO SAPIENS
- **antibodyFormat**: VHH
- **routeId**: display_pose_mybpc3_24
- **aliasPrefix**: MYBPC3-VHH-1PD6
- **fileCount**: 1
- **sourcePdbIds**: 1PD6
- **structuralBasis**: RCSB 1PD6 MYBPC3 antigen / representative VHH display pose
- **disease/structureFamily**: 神经/心血管方向靶点 · VHH 展示候选
- **files**: MYBPC3-VHH-1PD6.pdb

### 144. HLA-DRB1/HLA-DRB1

- **target**: HLA-DRB1
- **gene**: HLA-DRB1
- **aliases**: HLA-DRB1, HLA-DRB1
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_hla_drb1_25
- **aliasPrefix**: HLA-DRB1-Fab-1PYW
- **fileCount**: 1
- **sourcePdbIds**: 1PYW
- **structuralBasis**: RCSB 1PYW HLA-DRB1 antigen / representative Fab display pose
- **disease/structureFamily**: 肿瘤方向靶点 · Fab 展示候选
- **files**: HLA-DRB1-Fab-1PYW.pdb

### 145. PRNP/PRNP

- **target**: PRNP
- **gene**: PRNP
- **aliases**: PRNP, PRNP
- **organism**: HOMO SAPIENS
- **antibodyFormat**: VHH
- **routeId**: display_pose_prnp_26
- **aliasPrefix**: PRNP-VHH-1QLX
- **fileCount**: 1
- **sourcePdbIds**: 1QLX
- **structuralBasis**: RCSB 1QLX PRNP antigen / representative VHH display pose
- **disease/structureFamily**: 其他方向靶点 · VHH 展示候选
- **files**: PRNP-VHH-1QLX.pdb

### 146. ACE2/ACE2

- **target**: ACE2
- **gene**: ACE2
- **aliases**: ACE2, ACE2
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_ace2_27
- **aliasPrefix**: ACE2-Fab-1R42
- **fileCount**: 1
- **sourcePdbIds**: 1R42
- **structuralBasis**: RCSB 1R42 ACE2 antigen / representative Fab display pose
- **disease/structureFamily**: 肾脏/结缔组织方向靶点 · Fab 展示候选
- **files**: ACE2-Fab-1R42.pdb

### 147. KIT/KIT

- **target**: KIT
- **gene**: KIT
- **aliases**: KIT, KIT
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_kit_28
- **aliasPrefix**: KIT-Fab-1T45
- **fileCount**: 1
- **sourcePdbIds**: 1T45
- **structuralBasis**: RCSB 1T45 KIT antigen / representative Fab display pose
- **disease/structureFamily**: 肿瘤方向靶点 · Fab 展示候选
- **files**: KIT-Fab-1T45.pdb

### 148. TP53/TP53

- **target**: TP53
- **gene**: TP53
- **aliases**: TP53, TP53
- **organism**: HOMO SAPIENS
- **antibodyFormat**: VHH
- **routeId**: display_pose_tp53_29
- **aliasPrefix**: TP53-VHH-1TUP
- **fileCount**: 1
- **sourcePdbIds**: 1TUP
- **structuralBasis**: RCSB 1TUP TP53 antigen / representative VHH display pose
- **disease/structureFamily**: 肿瘤方向靶点 · VHH 展示候选
- **files**: TP53-VHH-1TUP.pdb

### 149. RARB/RARB

- **target**: RARB
- **gene**: RARB
- **aliases**: RARB, RARB
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_rarb_30
- **aliasPrefix**: RARB-Fab-1XAP
- **fileCount**: 1
- **sourcePdbIds**: 1XAP
- **structuralBasis**: RCSB 1XAP RARB antigen / representative Fab display pose
- **disease/structureFamily**: 内分泌方向靶点 · Fab 展示候选
- **files**: RARB-Fab-1XAP.pdb

### 150. TNFRSF17/TNFRSF17

- **target**: TNFRSF17
- **gene**: TNFRSF17
- **aliases**: TNFRSF17, TNFRSF17
- **organism**: MUS MUSCULUS
- **antibodyFormat**: Fab
- **routeId**: display_pose_tnfrsf17_31
- **aliasPrefix**: TNFRSF17-Fab-1XU2
- **fileCount**: 1
- **sourcePdbIds**: 1XU2
- **structuralBasis**: RCSB 1XU2 TNFRSF17 antigen / representative Fab display pose
- **disease/structureFamily**: 免疫炎症方向靶点 · Fab 展示候选
- **files**: TNFRSF17-Fab-1XU2.pdb

### 151. HPRT1/HPRT1

- **target**: HPRT1
- **gene**: HPRT1
- **aliases**: HPRT1, HPRT1
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_hprt1_32
- **aliasPrefix**: HPRT1-Fab-1Z7G
- **fileCount**: 1
- **sourcePdbIds**: 1Z7G
- **structuralBasis**: RCSB 1Z7G HPRT1 antigen / representative Fab display pose
- **disease/structureFamily**: 其他方向靶点 · Fab 展示候选
- **files**: HPRT1-Fab-1Z7G.pdb

### 152. IL2RA/IL2RA

- **target**: IL2RA
- **gene**: IL2RA
- **aliases**: IL2RA, IL2RA
- **organism**: HOMO SAPIENS
- **antibodyFormat**: VHH
- **routeId**: display_pose_il2ra_33
- **aliasPrefix**: IL2RA-VHH-1Z92
- **fileCount**: 1
- **sourcePdbIds**: 1Z92
- **structuralBasis**: RCSB 1Z92 IL2RA antigen / representative VHH display pose
- **disease/structureFamily**: 其他方向靶点 · VHH 展示候选
- **files**: IL2RA-VHH-1Z92.pdb

### 153. ALDH2/ALDH2

- **target**: ALDH2
- **gene**: ALDH2
- **aliases**: ALDH2, ALDH2
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_aldh2_34
- **aliasPrefix**: ALDH2-Fab-1ZUM
- **fileCount**: 1
- **sourcePdbIds**: 1ZUM
- **structuralBasis**: RCSB 1ZUM ALDH2 antigen / representative Fab display pose
- **disease/structureFamily**: 其他方向靶点 · Fab 展示候选
- **files**: ALDH2-Fab-1ZUM.pdb

### 154. KITLG/KITLG

- **target**: KITLG
- **gene**: KITLG
- **aliases**: KITLG, KITLG
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_kitlg_35
- **aliasPrefix**: KITLG-Fab-2E9W
- **fileCount**: 1
- **sourcePdbIds**: 2E9W
- **structuralBasis**: RCSB 2E9W KITLG antigen / representative Fab display pose
- **disease/structureFamily**: 肿瘤方向靶点 · Fab 展示候选
- **files**: KITLG-Fab-2E9W.pdb

### 155. PDHX/PDHX

- **target**: PDHX
- **gene**: PDHX
- **aliases**: PDHX, PDHX
- **organism**: HOMO SAPIENS
- **antibodyFormat**: VHH
- **routeId**: display_pose_pdhx_36
- **aliasPrefix**: PDHX-VHH-2F60
- **fileCount**: 1
- **sourcePdbIds**: 2F60
- **structuralBasis**: RCSB 2F60 PDHX antigen / representative VHH display pose
- **disease/structureFamily**: 其他方向靶点 · VHH 展示候选
- **files**: PDHX-VHH-2F60.pdb

### 156. BRAF/BRAF

- **target**: BRAF
- **gene**: BRAF
- **aliases**: BRAF, BRAF
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_braf_37
- **aliasPrefix**: BRAF-Fab-2FB8
- **fileCount**: 1
- **sourcePdbIds**: 2FB8
- **structuralBasis**: RCSB 2FB8 BRAF antigen / representative Fab display pose
- **disease/structureFamily**: 肿瘤方向靶点 · Fab 展示候选
- **files**: BRAF-Fab-2FB8.pdb

### 157. F10/F10

- **target**: F10
- **gene**: F10
- **aliases**: F10, F10
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_f10_38
- **aliasPrefix**: F10-Fab-2GD4
- **fileCount**: 1
- **sourcePdbIds**: 2GD4
- **structuralBasis**: RCSB 2GD4 F10 antigen / representative Fab display pose
- **disease/structureFamily**: 凝血/血液方向靶点 · Fab 展示候选
- **files**: F10-Fab-2GD4.pdb

### 158. IL10/IL10

- **target**: IL10
- **gene**: IL10
- **aliases**: IL10, IL10
- **organism**: HOMO SAPIENS
- **antibodyFormat**: VHH
- **routeId**: display_pose_il10_39
- **aliasPrefix**: IL10-VHH-2H24
- **fileCount**: 1
- **sourcePdbIds**: 2H24
- **structuralBasis**: RCSB 2H24 IL10 antigen / representative VHH display pose
- **disease/structureFamily**: 免疫炎症方向靶点 · VHH 展示候选
- **files**: IL10-VHH-2H24.pdb

### 159. NCAM1/NCAM1

- **target**: NCAM1
- **gene**: NCAM1
- **aliases**: NCAM1, NCAM1
- **organism**: HOMO SAPIENS
- **antibodyFormat**: VHH
- **routeId**: display_pose_ncam1_40
- **aliasPrefix**: NCAM1-VHH-2HAZ
- **fileCount**: 1
- **sourcePdbIds**: 2HAZ
- **structuralBasis**: RCSB 2HAZ NCAM1 antigen / representative VHH display pose
- **disease/structureFamily**: 其他方向靶点 · VHH 展示候选
- **files**: NCAM1-VHH-2HAZ.pdb

### 160. ADK/ADK

- **target**: ADK
- **gene**: ADK
- **aliases**: ADK, ADK
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_adk_41
- **aliasPrefix**: ADK-Fab-2I6A
- **fileCount**: 1
- **sourcePdbIds**: 2I6A
- **structuralBasis**: RCSB 2I6A ADK antigen / representative Fab display pose
- **disease/structureFamily**: 其他方向靶点 · Fab 展示候选
- **files**: ADK-Fab-2I6A.pdb

### 161. MYD88/MYD88

- **target**: MYD88
- **gene**: MYD88
- **aliases**: MYD88, MYD88
- **organism**: HOMO SAPIENS
- **antibodyFormat**: VHH
- **routeId**: display_pose_myd88_42
- **aliasPrefix**: MYD88-VHH-2JS7
- **fileCount**: 1
- **sourcePdbIds**: 2JS7
- **structuralBasis**: RCSB 2JS7 MYD88 antigen / representative VHH display pose
- **disease/structureFamily**: 其他方向靶点 · VHH 展示候选
- **files**: MYD88-VHH-2JS7.pdb

### 162. SCN2A/SCN2A

- **target**: SCN2A
- **gene**: SCN2A
- **aliases**: SCN2A, SCN2A
- **organism**: HOMO SAPIENS
- **antibodyFormat**: VHH
- **routeId**: display_pose_scn2a_43
- **aliasPrefix**: SCN2A-VHH-2KAV
- **fileCount**: 1
- **sourcePdbIds**: 2KAV
- **structuralBasis**: RCSB 2KAV SCN2A antigen / representative VHH display pose
- **disease/structureFamily**: 神经/心血管方向靶点 · VHH 展示候选
- **files**: SCN2A-VHH-2KAV.pdb

### 163. HMGB1/HMGB1

- **target**: HMGB1
- **gene**: HMGB1
- **aliases**: HMGB1, HMGB1
- **organism**: HOMO SAPIENS
- **antibodyFormat**: VHH
- **routeId**: display_pose_hmgb1_44
- **aliasPrefix**: HMGB1-VHH-2LY4
- **fileCount**: 1
- **sourcePdbIds**: 2LY4
- **structuralBasis**: RCSB 2LY4 HMGB1 antigen / representative VHH display pose
- **disease/structureFamily**: 免疫炎症方向靶点 · VHH 展示候选
- **files**: HMGB1-VHH-2LY4.pdb

### 164. SIGLEC8/SIGLEC8

- **target**: SIGLEC8
- **gene**: SIGLEC8
- **aliases**: SIGLEC8, SIGLEC8
- **organism**: HOMO SAPIENS
- **antibodyFormat**: VHH
- **routeId**: display_pose_siglec8_45
- **aliasPrefix**: SIGLEC8-VHH-2N7B
- **fileCount**: 1
- **sourcePdbIds**: 2N7B
- **structuralBasis**: RCSB 2N7B SIGLEC8 antigen / representative VHH display pose
- **disease/structureFamily**: 其他方向靶点 · VHH 展示候选
- **files**: SIGLEC8-VHH-2N7B.pdb

### 165. SERPING1/SERPING1

- **target**: SERPING1
- **gene**: SERPING1
- **aliases**: SERPING1, SERPING1
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_serping1_46
- **aliasPrefix**: SERPING1-Fab-2OAY
- **fileCount**: 1
- **sourcePdbIds**: 2OAY
- **structuralBasis**: RCSB 2OAY SERPING1 antigen / representative Fab display pose
- **disease/structureFamily**: 凝血/血液方向靶点 · Fab 展示候选
- **files**: SERPING1-Fab-2OAY.pdb

### 166. MMP8/MMP8

- **target**: MMP8
- **gene**: MMP8
- **aliases**: MMP8, MMP8
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_mmp8_47
- **aliasPrefix**: MMP8-Fab-2OY4
- **fileCount**: 1
- **sourcePdbIds**: 2OY4
- **structuralBasis**: RCSB 2OY4 MMP8 antigen / representative Fab display pose
- **disease/structureFamily**: 消化/骨骼方向靶点 · Fab 展示候选
- **files**: MMP8-Fab-2OY4.pdb

### 167. SERPINA1/SERPINA1

- **target**: SERPINA1
- **gene**: SERPINA1
- **aliases**: SERPINA1, SERPINA1
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_serpina1_48
- **aliasPrefix**: SERPINA1-Fab-2QUG
- **fileCount**: 1
- **sourcePdbIds**: 2QUG
- **structuralBasis**: RCSB 2QUG SERPINA1 antigen / representative Fab display pose
- **disease/structureFamily**: 凝血/血液方向靶点 · Fab 展示候选
- **files**: SERPINA1-Fab-2QUG.pdb

### 168. CD55/CD55

- **target**: CD55
- **gene**: CD55
- **aliases**: CD55, CD55
- **organism**: HOMO SAPIENS
- **antibodyFormat**: VHH
- **routeId**: display_pose_cd55_49
- **aliasPrefix**: CD55-VHH-2QZD
- **fileCount**: 1
- **sourcePdbIds**: 2QZD
- **structuralBasis**: RCSB 2QZD CD55 antigen / representative VHH display pose
- **disease/structureFamily**: 其他方向靶点 · VHH 展示候选
- **files**: CD55-VHH-2QZD.pdb

### 169. PRSS1/PRSS1

- **target**: PRSS1
- **gene**: PRSS1
- **aliases**: PRSS1, PRSS1
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_prss1_50
- **aliasPrefix**: PRSS1-Fab-2RA3
- **fileCount**: 1
- **sourcePdbIds**: 2RA3
- **structuralBasis**: RCSB 2RA3 PRSS1 antigen / representative Fab display pose
- **disease/structureFamily**: 消化/骨骼方向靶点 · Fab 展示候选
- **files**: PRSS1-Fab-2RA3.pdb

### 170. REN/REN

- **target**: REN
- **gene**: REN
- **aliases**: REN, REN
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_ren_51
- **aliasPrefix**: REN-Fab-2REN
- **fileCount**: 1
- **sourcePdbIds**: 2REN
- **structuralBasis**: RCSB 2REN REN antigen / representative Fab display pose
- **disease/structureFamily**: 肾脏/结缔组织方向靶点 · Fab 展示候选
- **files**: REN-Fab-2REN.pdb

### 171. VDR/VDR

- **target**: VDR
- **gene**: VDR
- **aliases**: VDR, VDR
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_vdr_52
- **aliasPrefix**: VDR-Fab-3A78
- **fileCount**: 1
- **sourcePdbIds**: 3A78
- **structuralBasis**: RCSB 3A78 VDR antigen / representative Fab display pose
- **disease/structureFamily**: 内分泌方向靶点 · Fab 展示候选
- **files**: VDR-Fab-3A78.pdb

### 172. PTK2B/PTK2B

- **target**: PTK2B
- **gene**: PTK2B
- **aliases**: PTK2B, PTK2B
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_ptk2b_53
- **aliasPrefix**: PTK2B-Fab-3CC6
- **fileCount**: 1
- **sourcePdbIds**: 3CC6
- **structuralBasis**: RCSB 3CC6 PTK2B antigen / representative Fab display pose
- **disease/structureFamily**: 肿瘤方向靶点 · Fab 展示候选
- **files**: PTK2B-Fab-3CC6.pdb

### 173. HECTD1/HECTD1

- **target**: HECTD1
- **gene**: HECTD1
- **aliases**: HECTD1, HECTD1
- **organism**: HOMO SAPIENS
- **antibodyFormat**: VHH
- **routeId**: display_pose_hectd1_54
- **aliasPrefix**: HECTD1-VHH-3DKM
- **fileCount**: 1
- **sourcePdbIds**: 3DKM
- **structuralBasis**: RCSB 3DKM HECTD1 antigen / representative VHH display pose
- **disease/structureFamily**: 其他方向靶点 · VHH 展示候选
- **files**: HECTD1-VHH-3DKM.pdb

### 174. JAK1/JAK1

- **target**: JAK1
- **gene**: JAK1
- **aliases**: JAK1, JAK1
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_jak1_55
- **aliasPrefix**: JAK1-Fab-3EYG
- **fileCount**: 1
- **sourcePdbIds**: 3EYG
- **structuralBasis**: RCSB 3EYG JAK1 antigen / representative Fab display pose
- **disease/structureFamily**: 其他方向靶点 · Fab 展示候选
- **files**: JAK1-Fab-3EYG.pdb

### 175. BMPR2/BMPR2

- **target**: BMPR2
- **gene**: BMPR2
- **aliases**: BMPR2, BMPR2
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_bmpr2_56
- **aliasPrefix**: BMPR2-Fab-3G2F
- **fileCount**: 1
- **sourcePdbIds**: 3G2F
- **structuralBasis**: RCSB 3G2F BMPR2 antigen / representative Fab display pose
- **disease/structureFamily**: 信号通路方向靶点 · Fab 展示候选
- **files**: BMPR2-Fab-3G2F.pdb

### 176. DST/DST

- **target**: DST
- **gene**: DST
- **aliases**: DST, DST
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_dst_57
- **aliasPrefix**: DST-Fab-3GJO
- **fileCount**: 1
- **sourcePdbIds**: 3GJO
- **structuralBasis**: RCSB 3GJO DST antigen / representative Fab display pose
- **disease/structureFamily**: 其他方向靶点 · Fab 展示候选
- **files**: DST-Fab-3GJO.pdb

### 177. THRB/THRB

- **target**: THRB
- **gene**: THRB
- **aliases**: THRB, THRB
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_thrb_58
- **aliasPrefix**: THRB-Fab-3GWS
- **fileCount**: 1
- **sourcePdbIds**: 3GWS
- **structuralBasis**: RCSB 3GWS THRB antigen / representative Fab display pose
- **disease/structureFamily**: 内分泌方向靶点 · Fab 展示候选
- **files**: THRB-Fab-3GWS.pdb

### 178. CHEK2/CHEK2

- **target**: CHEK2
- **gene**: CHEK2
- **aliases**: CHEK2, CHEK2
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_chek2_59
- **aliasPrefix**: CHEK2-Fab-3I6U
- **fileCount**: 1
- **sourcePdbIds**: 3I6U
- **structuralBasis**: RCSB 3I6U CHEK2 antigen / representative Fab display pose
- **disease/structureFamily**: 肿瘤方向靶点 · Fab 展示候选
- **files**: CHEK2-Fab-3I6U.pdb

### 179. ADA2/ADA2

- **target**: ADA2
- **gene**: ADA2
- **aliases**: ADA2, ADA2
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_ada2_60
- **aliasPrefix**: ADA2-Fab-3LGG
- **fileCount**: 1
- **sourcePdbIds**: 3LGG
- **structuralBasis**: RCSB 3LGG ADA2 antigen / representative Fab display pose
- **disease/structureFamily**: 其他方向靶点 · Fab 展示候选
- **files**: ADA2-Fab-3LGG.pdb

### 180. ADRB2/ADRB2

- **target**: ADRB2
- **gene**: ADRB2
- **aliases**: ADRB2, ADRB2
- **organism**: HOMO SAPIENS, ENTEROBACTERIA PHAGE T4
- **antibodyFormat**: Fab
- **routeId**: display_pose_adrb2_61
- **aliasPrefix**: ADRB2-Fab-3NY9
- **fileCount**: 1
- **sourcePdbIds**: 3NY9
- **structuralBasis**: RCSB 3NY9 ADRB2 antigen / representative Fab display pose
- **disease/structureFamily**: 神经/心血管方向靶点 · Fab 展示候选
- **files**: ADRB2-Fab-3NY9.pdb

### 181. RAF1/RAF1

- **target**: RAF1
- **gene**: RAF1
- **aliases**: RAF1, RAF1
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_raf1_62
- **aliasPrefix**: RAF1-Fab-3OMV
- **fileCount**: 1
- **sourcePdbIds**: 3OMV
- **structuralBasis**: RCSB 3OMV RAF1 antigen / representative Fab display pose
- **disease/structureFamily**: 肿瘤方向靶点 · Fab 展示候选
- **files**: RAF1-Fab-3OMV.pdb

### 182. CTLA4/CTLA4

- **target**: CTLA4
- **gene**: CTLA4
- **aliases**: CTLA4, CTLA4
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_ctla4_63
- **aliasPrefix**: CTLA4-Fab-3OSK
- **fileCount**: 1
- **sourcePdbIds**: 3OSK
- **structuralBasis**: RCSB 3OSK CTLA4 antigen / representative Fab display pose
- **disease/structureFamily**: 其他方向靶点 · Fab 展示候选
- **files**: CTLA4-Fab-3OSK.pdb

### 183. NF1/NF1

- **target**: NF1
- **gene**: NF1
- **aliases**: NF1, NF1
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_nf1_64
- **aliasPrefix**: NF1-Fab-3P7Z
- **fileCount**: 1
- **sourcePdbIds**: 3P7Z
- **structuralBasis**: RCSB 3P7Z NF1 antigen / representative Fab display pose
- **disease/structureFamily**: 肿瘤方向靶点 · Fab 展示候选
- **files**: NF1-Fab-3P7Z.pdb

### 184. RB1/RB1

- **target**: RB1
- **gene**: RB1
- **aliases**: RB1, RB1
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_rb1_65
- **aliasPrefix**: RB1-Fab-3POM
- **fileCount**: 1
- **sourcePdbIds**: 3POM
- **structuralBasis**: RCSB 3POM RB1 antigen / representative Fab display pose
- **disease/structureFamily**: 肿瘤方向靶点 · Fab 展示候选
- **files**: RB1-Fab-3POM.pdb

### 185. CALR/CALR

- **target**: CALR
- **gene**: CALR
- **aliases**: CALR, CALR
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_calr_66
- **aliasPrefix**: CALR-Fab-3POW
- **fileCount**: 1
- **sourcePdbIds**: 3POW
- **structuralBasis**: RCSB 3POW CALR antigen / representative Fab display pose
- **disease/structureFamily**: 免疫炎症方向靶点 · Fab 展示候选
- **files**: CALR-Fab-3POW.pdb

### 186. VAMP2/VAMP2

- **target**: VAMP2
- **gene**: VAMP2
- **aliases**: VAMP2, VAMP2
- **organism**: HOMO SAPIENS
- **antibodyFormat**: VHH
- **routeId**: display_pose_vamp2_67
- **aliasPrefix**: VAMP2-VHH-3RK2
- **fileCount**: 1
- **sourcePdbIds**: 3RK2
- **structuralBasis**: RCSB 3RK2 VAMP2 antigen / representative VHH display pose
- **disease/structureFamily**: 其他方向靶点 · VHH 展示候选
- **files**: VAMP2-VHH-3RK2.pdb

### 187. NKX2-5/NKX2-5

- **target**: NKX2-5
- **gene**: NKX2-5
- **aliases**: NKX2-5, NKX2-5
- **organism**: HOMO SAPIENS
- **antibodyFormat**: VHH
- **routeId**: display_pose_nkx2_5_68
- **aliasPrefix**: NKX2-5-VHH-3RKQ
- **fileCount**: 1
- **sourcePdbIds**: 3RKQ
- **structuralBasis**: RCSB 3RKQ NKX2-5 antigen / representative VHH display pose
- **disease/structureFamily**: 其他方向靶点 · VHH 展示候选
- **files**: NKX2-5-VHH-3RKQ.pdb

### 188. MMP1/MMP1

- **target**: MMP1
- **gene**: MMP1
- **aliases**: MMP1, MMP1
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_mmp1_69
- **aliasPrefix**: MMP1-Fab-3SHI
- **fileCount**: 1
- **sourcePdbIds**: 3SHI
- **structuralBasis**: RCSB 3SHI MMP1 antigen / representative Fab display pose
- **disease/structureFamily**: 消化/骨骼方向靶点 · Fab 展示候选
- **files**: MMP1-Fab-3SHI.pdb

### 189. IL21/IL21

- **target**: IL21
- **gene**: IL21
- **aliases**: IL21, IL21
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_il21_70
- **aliasPrefix**: IL21-Fab-3TGX
- **fileCount**: 1
- **sourcePdbIds**: 3TGX
- **structuralBasis**: RCSB 3TGX IL21 antigen / representative Fab display pose
- **disease/structureFamily**: 免疫炎症方向靶点 · Fab 展示候选
- **files**: IL21-Fab-3TGX.pdb

### 190. PKP2/PKP2

- **target**: PKP2
- **gene**: PKP2
- **aliases**: PKP2, PKP2
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_pkp2_71
- **aliasPrefix**: PKP2-Fab-3TT9
- **fileCount**: 1
- **sourcePdbIds**: 3TT9
- **structuralBasis**: RCSB 3TT9 PKP2 antigen / representative Fab display pose
- **disease/structureFamily**: 神经/心血管方向靶点 · Fab 展示候选
- **files**: PKP2-Fab-3TT9.pdb

### 191. F2 / thrombin/F2

- **target**: F2 / thrombin
- **gene**: F2
- **aliases**: F2, F2 / thrombin
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_f2___thrombin_72
- **aliasPrefix**: F2-thrombin-Fab-3U69
- **fileCount**: 1
- **sourcePdbIds**: 3U69
- **structuralBasis**: RCSB 3U69 F2 / thrombin antigen / representative Fab display pose
- **disease/structureFamily**: 凝血/血液方向靶点 · Fab 展示候选
- **files**: F2-thrombin-Fab-3U69.pdb

### 192. MEN1/MEN1

- **target**: MEN1
- **gene**: MEN1
- **aliases**: MEN1, MEN1
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_men1_73
- **aliasPrefix**: MEN1-Fab-3U84
- **fileCount**: 1
- **sourcePdbIds**: 3U84
- **structuralBasis**: RCSB 3U84 MEN1 antigen / representative Fab display pose
- **disease/structureFamily**: 肿瘤方向靶点 · Fab 展示候选
- **files**: MEN1-Fab-3U84.pdb

### 193. CHRM2/CHRM2

- **target**: CHRM2
- **gene**: CHRM2
- **aliases**: CHRM2, CHRM2
- **organism**: HOMO SAPIENS, ENTEROBACTERIA PHAGE T4
- **antibodyFormat**: Fab
- **routeId**: display_pose_chrm2_74
- **aliasPrefix**: CHRM2-Fab-3UON
- **fileCount**: 1
- **sourcePdbIds**: 3UON
- **structuralBasis**: RCSB 3UON CHRM2 antigen / representative Fab display pose
- **disease/structureFamily**: 神经/心血管方向靶点 · Fab 展示候选
- **files**: CHRM2-Fab-3UON.pdb

### 194. FLCN/FLCN

- **target**: FLCN
- **gene**: FLCN
- **aliases**: FLCN, FLCN
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_flcn_75
- **aliasPrefix**: FLCN-Fab-3V42
- **fileCount**: 1
- **sourcePdbIds**: 3V42
- **structuralBasis**: RCSB 3V42 FLCN antigen / representative Fab display pose
- **disease/structureFamily**: 肿瘤方向靶点 · Fab 展示候选
- **files**: FLCN-Fab-3V42.pdb

### 195. IL18/IL18

- **target**: IL18
- **gene**: IL18
- **aliases**: IL18, IL18
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_il18_76
- **aliasPrefix**: IL18-Fab-3WO2
- **fileCount**: 1
- **sourcePdbIds**: 3WO2
- **structuralBasis**: RCSB 3WO2 IL18 antigen / representative Fab display pose
- **disease/structureFamily**: 免疫炎症方向靶点 · Fab 展示候选
- **files**: IL18-Fab-3WO2.pdb

### 196. GABRB3/GABRB3

- **target**: GABRB3
- **gene**: GABRB3
- **aliases**: GABRB3, GABRB3
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_gabrb3_77
- **aliasPrefix**: GABRB3-Fab-4COF
- **fileCount**: 1
- **sourcePdbIds**: 4COF
- **structuralBasis**: RCSB 4COF GABRB3 antigen / representative Fab display pose
- **disease/structureFamily**: 神经/心血管方向靶点 · Fab 展示候选
- **files**: GABRB3-Fab-4COF.pdb

### 197. FTO/FTO

- **target**: FTO
- **gene**: FTO
- **aliases**: FTO, FTO
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_fto_78
- **aliasPrefix**: FTO-Fab-4CXW
- **fileCount**: 1
- **sourcePdbIds**: 4CXW
- **structuralBasis**: RCSB 4CXW FTO antigen / representative Fab display pose
- **disease/structureFamily**: 代谢方向靶点 · Fab 展示候选
- **files**: FTO-Fab-4CXW.pdb

### 198. FGFR1/FGFR1

- **target**: FGFR1
- **gene**: FGFR1
- **aliases**: FGFR1, FGFR1
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_fgfr1_79
- **aliasPrefix**: FGFR1-Fab-4F64
- **fileCount**: 1
- **sourcePdbIds**: 4F64
- **structuralBasis**: RCSB 4F64 FGFR1 antigen / representative Fab display pose
- **disease/structureFamily**: 肿瘤方向靶点 · Fab 展示候选
- **files**: FGFR1-Fab-4F64.pdb

### 199. TOP2A/TOP2A

- **target**: TOP2A
- **gene**: TOP2A
- **aliases**: TOP2A, TOP2A
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_top2a_80
- **aliasPrefix**: TOP2A-Fab-4FM9
- **fileCount**: 1
- **sourcePdbIds**: 4FM9
- **structuralBasis**: RCSB 4FM9 TOP2A antigen / representative Fab display pose
- **disease/structureFamily**: 肿瘤方向靶点 · Fab 展示候选
- **files**: TOP2A-Fab-4FM9.pdb

### 200. MMP13/MMP13

- **target**: MMP13
- **gene**: MMP13
- **aliases**: MMP13, MMP13
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_mmp13_81
- **aliasPrefix**: MMP13-Fab-4FU4
- **fileCount**: 1
- **sourcePdbIds**: 4FU4
- **structuralBasis**: RCSB 4FU4 MMP13 antigen / representative Fab display pose
- **disease/structureFamily**: 消化/骨骼方向靶点 · Fab 展示候选
- **files**: MMP13-Fab-4FU4.pdb

### 201. HBB/HBB

- **target**: HBB
- **gene**: HBB
- **aliases**: HBB, HBB
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_hbb_82
- **aliasPrefix**: HBB-Fab-4HHB
- **fileCount**: 1
- **sourcePdbIds**: 4HHB
- **structuralBasis**: RCSB 4HHB HBB antigen / representative Fab display pose
- **disease/structureFamily**: 凝血/血液方向靶点 · Fab 展示候选
- **files**: HBB-Fab-4HHB.pdb

### 202. IL17A/IL17A

- **target**: IL17A
- **gene**: IL17A
- **aliases**: IL17A, IL17A
- **organism**: HOMO SAPIENS
- **antibodyFormat**: VHH
- **routeId**: display_pose_il17a_83
- **aliasPrefix**: IL17A-VHH-4HR9
- **fileCount**: 1
- **sourcePdbIds**: 4HR9
- **structuralBasis**: RCSB 4HR9 IL17A antigen / representative VHH display pose
- **disease/structureFamily**: 其他方向靶点 · VHH 展示候选
- **files**: IL17A-VHH-4HR9.pdb

### 203. OAS1/OAS1

- **target**: OAS1
- **gene**: OAS1
- **aliases**: OAS1, OAS1
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_oas1_84
- **aliasPrefix**: OAS1-Fab-4IG8
- **fileCount**: 1
- **sourcePdbIds**: 4IG8
- **structuralBasis**: RCSB 4IG8 OAS1 antigen / representative Fab display pose
- **disease/structureFamily**: 其他方向靶点 · Fab 展示候选
- **files**: OAS1-Fab-4IG8.pdb

### 204. GRIK1/GRIK1

- **target**: GRIK1
- **gene**: GRIK1
- **aliases**: GRIK1, GRIK1
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_grik1_85
- **aliasPrefix**: GRIK1-Fab-4MF3
- **fileCount**: 1
- **sourcePdbIds**: 4MF3
- **structuralBasis**: RCSB 4MF3 GRIK1 antigen / representative Fab display pose
- **disease/structureFamily**: 神经/心血管方向靶点 · Fab 展示候选
- **files**: GRIK1-Fab-4MF3.pdb

### 205. FCGRT / FcRn/FCGRT

- **target**: FCGRT / FcRn
- **gene**: FCGRT
- **aliases**: FCGRT, FCGRT / FcRn
- **organism**: HOMO SAPIENS
- **antibodyFormat**: VHH
- **routeId**: display_pose_fcgrt___fcrn_86
- **aliasPrefix**: FCGRT-FcRn-VHH-4N0U
- **fileCount**: 1
- **sourcePdbIds**: 4N0U
- **structuralBasis**: RCSB 4N0U FCGRT / FcRn antigen / representative VHH display pose
- **disease/structureFamily**: 其他方向靶点 · VHH 展示候选
- **files**: FCGRT-FcRn-VHH-4N0U.pdb

### 206. KRAS/KRAS

- **target**: KRAS
- **gene**: KRAS
- **aliases**: KRAS, KRAS
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_kras_87
- **aliasPrefix**: KRAS-Fab-4OBE
- **fileCount**: 1
- **sourcePdbIds**: 4OBE
- **structuralBasis**: RCSB 4OBE KRAS antigen / representative Fab display pose
- **disease/structureFamily**: 肿瘤方向靶点 · Fab 展示候选
- **files**: KRAS-Fab-4OBE.pdb

### 207. NR3C1/NR3C1

- **target**: NR3C1
- **gene**: NR3C1
- **aliases**: NR3C1, NR3C1
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_nr3c1_88
- **aliasPrefix**: NR3C1-Fab-4P6X
- **fileCount**: 1
- **sourcePdbIds**: 4P6X
- **structuralBasis**: RCSB 4P6X NR3C1 antigen / representative Fab display pose
- **disease/structureFamily**: 内分泌方向靶点 · Fab 展示候选
- **files**: NR3C1-Fab-4P6X.pdb

### 208. STAG2/STAG2

- **target**: STAG2
- **gene**: STAG2
- **aliases**: STAG2, STAG2
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_stag2_89
- **aliasPrefix**: STAG2-Fab-4PK7
- **fileCount**: 1
- **sourcePdbIds**: 4PK7
- **structuralBasis**: RCSB 4PK7 STAG2 antigen / representative Fab display pose
- **disease/structureFamily**: 肿瘤方向靶点 · Fab 展示候选
- **files**: STAG2-Fab-4PK7.pdb

### 209. AXL/AXL

- **target**: AXL
- **gene**: AXL
- **aliases**: AXL, AXL
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_axl_90
- **aliasPrefix**: AXL-Fab-4RA0
- **fileCount**: 1
- **sourcePdbIds**: 4RA0
- **structuralBasis**: RCSB 4RA0 AXL antigen / representative Fab display pose
- **disease/structureFamily**: 肿瘤方向靶点 · Fab 展示候选
- **files**: AXL-Fab-4RA0.pdb

### 210. RET/RET

- **target**: RET
- **gene**: RET
- **aliases**: RET, RET
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_ret_91
- **aliasPrefix**: RET-Fab-4UX8
- **fileCount**: 1
- **sourcePdbIds**: 4UX8
- **structuralBasis**: RCSB 4UX8 RET antigen / representative Fab display pose
- **disease/structureFamily**: 肿瘤方向靶点 · Fab 展示候选
- **files**: RET-Fab-4UX8.pdb

### 211. MYOC/MYOC

- **target**: MYOC
- **gene**: MYOC
- **aliases**: MYOC, MYOC
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_myoc_92
- **aliasPrefix**: MYOC-Fab-4WXQ
- **fileCount**: 1
- **sourcePdbIds**: 4WXQ
- **structuralBasis**: RCSB 4WXQ MYOC antigen / representative Fab display pose
- **disease/structureFamily**: 肾脏/结缔组织方向靶点 · Fab 展示候选
- **files**: MYOC-Fab-4WXQ.pdb

### 212. AGTR1/AGTR1

- **target**: AGTR1
- **gene**: AGTR1
- **aliases**: AGTR1, AGTR1
- **organism**: ESCHERICHIA COLI, HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_agtr1_93
- **aliasPrefix**: AGTR1-Fab-4YAY
- **fileCount**: 1
- **sourcePdbIds**: 4YAY
- **structuralBasis**: RCSB 4YAY AGTR1 antigen / representative Fab display pose
- **disease/structureFamily**: 肾脏/结缔组织方向靶点 · Fab 展示候选
- **files**: AGTR1-Fab-4YAY.pdb

### 213. ODC1/ODC1

- **target**: ODC1
- **gene**: ODC1
- **aliases**: ODC1, ODC1
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_odc1_94
- **aliasPrefix**: ODC1-Fab-4ZGY
- **fileCount**: 1
- **sourcePdbIds**: 4ZGY
- **structuralBasis**: RCSB 4ZGY ODC1 antigen / representative Fab display pose
- **disease/structureFamily**: 其他方向靶点 · Fab 展示候选
- **files**: ODC1-Fab-4ZGY.pdb

### 214. KRT10/KRT10

- **target**: KRT10
- **gene**: KRT10
- **aliases**: KRT10, KRT10
- **organism**: HOMO SAPIENS
- **antibodyFormat**: VHH
- **routeId**: display_pose_krt10_95
- **aliasPrefix**: KRT10-VHH-4ZRY
- **fileCount**: 1
- **sourcePdbIds**: 4ZRY
- **structuralBasis**: RCSB 4ZRY KRT10 antigen / representative VHH display pose
- **disease/structureFamily**: 其他方向靶点 · VHH 展示候选
- **files**: KRT10-VHH-4ZRY.pdb

### 215. IDH1/IDH1

- **target**: IDH1
- **gene**: IDH1
- **aliases**: IDH1, IDH1
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_idh1_96
- **aliasPrefix**: IDH1-Fab-5DE1
- **fileCount**: 1
- **sourcePdbIds**: 5DE1
- **structuralBasis**: RCSB 5DE1 IDH1 antigen / representative Fab display pose
- **disease/structureFamily**: 其他方向靶点 · Fab 展示候选
- **files**: IDH1-Fab-5DE1.pdb

### 216. PTGS2/PTGS2

- **target**: PTGS2
- **gene**: PTGS2
- **aliases**: PTGS2, PTGS2
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_ptgs2_98
- **aliasPrefix**: PTGS2-Fab-5F19
- **fileCount**: 1
- **sourcePdbIds**: 5F19
- **structuralBasis**: RCSB 5F19 PTGS2 antigen / representative Fab display pose
- **disease/structureFamily**: 信号通路方向靶点 · Fab 展示候选
- **files**: PTGS2-Fab-5F19.pdb

### 217. SLC6A4 / SERT/SLC6A4

- **target**: SLC6A4 / SERT
- **gene**: SLC6A4
- **aliases**: SLC6A4, SLC6A4 / SERT
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_slc6a4___sert_99
- **aliasPrefix**: SLC6A4-SERT-Fab-5I75
- **fileCount**: 1
- **sourcePdbIds**: 5I75
- **structuralBasis**: RCSB 5I75 SLC6A4 / SERT antigen / representative Fab display pose
- **disease/structureFamily**: 神经/心血管方向靶点 · Fab 展示候选
- **files**: SLC6A4-SERT-Fab-5I75.pdb

### 218. GAA/GAA

- **target**: GAA
- **gene**: GAA
- **aliases**: GAA, GAA
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_gaa_100
- **aliasPrefix**: GAA-Fab-5KZW
- **fileCount**: 1
- **sourcePdbIds**: 5KZW
- **structuralBasis**: RCSB 5KZW GAA antigen / representative Fab display pose
- **disease/structureFamily**: 代谢/溶酶体方向靶点 · Fab 展示候选
- **files**: GAA-Fab-5KZW.pdb

### 219. NTRK2/NTRK2

- **target**: NTRK2
- **gene**: NTRK2
- **aliases**: NTRK2, NTRK2
- **organism**: MUS MUSCULUS
- **antibodyFormat**: Fab
- **routeId**: display_pose_ntrk2_101
- **aliasPrefix**: NTRK2-Fab-5MO9
- **fileCount**: 1
- **sourcePdbIds**: 5MO9
- **structuralBasis**: RCSB 5MO9 NTRK2 antigen / representative Fab display pose
- **disease/structureFamily**: 肿瘤方向靶点 · Fab 展示候选
- **files**: NTRK2-Fab-5MO9.pdb

### 220. FBN1/FBN1

- **target**: FBN1
- **gene**: FBN1
- **aliases**: FBN1, FBN1
- **organism**: HOMO SAPIENS
- **antibodyFormat**: VHH
- **routeId**: display_pose_fbn1_102
- **aliasPrefix**: FBN1-VHH-5MS9
- **fileCount**: 1
- **sourcePdbIds**: 5MS9
- **structuralBasis**: RCSB 5MS9 FBN1 antigen / representative VHH display pose
- **disease/structureFamily**: 其他方向靶点 · VHH 展示候选
- **files**: FBN1-VHH-5MS9.pdb

### 221. COL4A1/COL4A1

- **target**: COL4A1
- **gene**: COL4A1
- **aliases**: COL4A1, COL4A1
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_col4a1_103
- **aliasPrefix**: COL4A1-Fab-5NAY
- **fileCount**: 1
- **sourcePdbIds**: 5NAY
- **structuralBasis**: RCSB 5NAY COL4A1 antigen / representative Fab display pose
- **disease/structureFamily**: 肾脏/结缔组织方向靶点 · Fab 展示候选
- **files**: COL4A1-Fab-5NAY.pdb

### 222. DRD4/DRD4

- **target**: DRD4
- **gene**: DRD4
- **aliases**: DRD4, DRD4
- **organism**: HOMO SAPIENS, ESCHERICHIA COLI
- **antibodyFormat**: Fab
- **routeId**: display_pose_drd4_104
- **aliasPrefix**: DRD4-Fab-5WIU
- **fileCount**: 1
- **sourcePdbIds**: 5WIU
- **structuralBasis**: RCSB 5WIU DRD4 antigen / representative Fab display pose
- **disease/structureFamily**: 神经/心血管方向靶点 · Fab 展示候选
- **files**: DRD4-Fab-5WIU.pdb

### 223. CNR1/CNR1

- **target**: CNR1
- **gene**: CNR1
- **aliases**: CNR1, CNR1
- **organism**: HOMO SAPIENS, DESULFOVIBRIO VULGARIS (STRAIN HILDENBOROUGH / ATCC 29579 / DSM 644 / NCIMB 8303)
- **antibodyFormat**: Fab
- **routeId**: display_pose_cnr1_105
- **aliasPrefix**: CNR1-Fab-5XRA
- **fileCount**: 1
- **sourcePdbIds**: 5XRA
- **structuralBasis**: RCSB 5XRA CNR1 antigen / representative Fab display pose
- **disease/structureFamily**: 神经/心血管方向靶点 · Fab 展示候选
- **files**: CNR1-Fab-5XRA.pdb

### 224. ATP4A/ATP4A

- **target**: ATP4A
- **gene**: ATP4A
- **aliases**: ATP4A, ATP4A
- **organism**: SUS SCROFA
- **antibodyFormat**: Fab
- **routeId**: display_pose_atp4a_106
- **aliasPrefix**: ATP4A-Fab-5YLU
- **fileCount**: 1
- **sourcePdbIds**: 5YLU
- **structuralBasis**: RCSB 5YLU ATP4A antigen / representative Fab display pose
- **disease/structureFamily**: 消化/骨骼方向靶点 · Fab 展示候选
- **files**: ATP4A-Fab-5YLU.pdb

### 225. DICER1/DICER1

- **target**: DICER1
- **gene**: DICER1
- **aliases**: DICER1, DICER1
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_dicer1_107
- **aliasPrefix**: DICER1-Fab-5ZAL
- **fileCount**: 1
- **sourcePdbIds**: 5ZAL
- **structuralBasis**: RCSB 5ZAL DICER1 antigen / representative Fab display pose
- **disease/structureFamily**: 肿瘤方向靶点 · Fab 展示候选
- **files**: DICER1-Fab-5ZAL.pdb

### 226. PLAT/PLAT

- **target**: PLAT
- **gene**: PLAT
- **aliases**: PLAT, PLAT
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_plat_108
- **aliasPrefix**: PLAT-Fab-5ZLZ
- **fileCount**: 1
- **sourcePdbIds**: 5ZLZ
- **structuralBasis**: RCSB 5ZLZ PLAT antigen / representative Fab display pose
- **disease/structureFamily**: 信号通路方向靶点 · Fab 展示候选
- **files**: PLAT-Fab-5ZLZ.pdb

### 227. HTR2A/HTR2A

- **target**: HTR2A
- **gene**: HTR2A
- **aliases**: HTR2A, HTR2A
- **organism**: HOMO SAPIENS, ESCHERICHIA COLI
- **antibodyFormat**: Fab
- **routeId**: display_pose_htr2a_109
- **aliasPrefix**: HTR2A-Fab-6A93
- **fileCount**: 1
- **sourcePdbIds**: 6A93
- **structuralBasis**: RCSB 6A93 HTR2A antigen / representative Fab display pose
- **disease/structureFamily**: 神经/心血管方向靶点 · Fab 展示候选
- **files**: HTR2A-Fab-6A93.pdb

### 228. GNAS/GNAS

- **target**: GNAS
- **gene**: GNAS
- **aliases**: GNAS, GNAS
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_gnas_110
- **aliasPrefix**: GNAS-Fab-6AU6
- **fileCount**: 1
- **sourcePdbIds**: 6AU6
- **structuralBasis**: RCSB 6AU6 GNAS antigen / representative Fab display pose
- **disease/structureFamily**: 其他方向靶点 · Fab 展示候选
- **files**: GNAS-Fab-6AU6.pdb

### 229. DRD2/DRD2

- **target**: DRD2
- **gene**: DRD2
- **aliases**: DRD2, DRD2
- **organism**: HOMO SAPIENS, ENTEROBACTERIA PHAGE T4
- **antibodyFormat**: Fab
- **routeId**: display_pose_drd2_111
- **aliasPrefix**: DRD2-Fab-6CM4
- **fileCount**: 1
- **sourcePdbIds**: 6CM4
- **structuralBasis**: RCSB 6CM4 DRD2 antigen / representative Fab display pose
- **disease/structureFamily**: 神经/心血管方向靶点 · Fab 展示候选
- **files**: DRD2-Fab-6CM4.pdb

### 230. NTRK1/NTRK1

- **target**: NTRK1
- **gene**: NTRK1
- **aliases**: NTRK1, NTRK1
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_ntrk1_112
- **aliasPrefix**: NTRK1-Fab-6D20
- **fileCount**: 1
- **sourcePdbIds**: 6D20
- **structuralBasis**: RCSB 6D20 NTRK1 antigen / representative Fab display pose
- **disease/structureFamily**: 肿瘤方向靶点 · Fab 展示候选
- **files**: NTRK1-Fab-6D20.pdb

### 231. COL3A1/COL3A1

- **target**: COL3A1
- **gene**: COL3A1
- **aliases**: COL3A1, COL3A1
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_col3a1_113
- **aliasPrefix**: COL3A1-Fab-6FZV
- **fileCount**: 1
- **sourcePdbIds**: 6FZV
- **structuralBasis**: RCSB 6FZV COL3A1 antigen / representative Fab display pose
- **disease/structureFamily**: 肾脏/结缔组织方向靶点 · Fab 展示候选
- **files**: COL3A1-Fab-6FZV.pdb

### 232. SUCLG1/SUCLG1

- **target**: SUCLG1
- **gene**: SUCLG1
- **aliases**: SUCLG1, SUCLG1
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_suclg1_114
- **aliasPrefix**: SUCLG1-Fab-6G4Q
- **fileCount**: 1
- **sourcePdbIds**: 6G4Q
- **structuralBasis**: RCSB 6G4Q SUCLG1 antigen / representative Fab display pose
- **disease/structureFamily**: 其他方向靶点 · Fab 展示候选
- **files**: SUCLG1-Fab-6G4Q.pdb

### 233. PSPH/PSPH

- **target**: PSPH
- **gene**: PSPH
- **aliases**: PSPH, PSPH
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_psph_115
- **aliasPrefix**: PSPH-Fab-6HYJ
- **fileCount**: 1
- **sourcePdbIds**: 6HYJ
- **structuralBasis**: RCSB 6HYJ PSPH antigen / representative Fab display pose
- **disease/structureFamily**: 其他方向靶点 · Fab 展示候选
- **files**: PSPH-Fab-6HYJ.pdb

### 234. GUCY1A1/GUCY1A1

- **target**: GUCY1A1
- **gene**: GUCY1A1
- **aliases**: GUCY1A1, GUCY1A1
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_gucy1a1_116
- **aliasPrefix**: GUCY1A1-Fab-6JT0
- **fileCount**: 1
- **sourcePdbIds**: 6JT0
- **structuralBasis**: RCSB 6JT0 GUCY1A1 antigen / representative Fab display pose
- **disease/structureFamily**: 消化/骨骼方向靶点 · Fab 展示候选
- **files**: GUCY1A1-Fab-6JT0.pdb

### 235. ADRA2B/ADRA2B

- **target**: ADRA2B
- **gene**: ADRA2B
- **aliases**: ADRA2B, ADRA2B
- **organism**: HOMO SAPIENS
- **antibodyFormat**: VHH
- **routeId**: display_pose_adra2b_117
- **aliasPrefix**: ADRA2B-VHH-6K41
- **fileCount**: 1
- **sourcePdbIds**: 6K41
- **structuralBasis**: RCSB 6K41 ADRA2B antigen / representative VHH display pose
- **disease/structureFamily**: 神经/心血管方向靶点 · VHH 展示候选
- **files**: ADRA2B-VHH-6K41.pdb

### 236. ATM/ATM

- **target**: ATM
- **gene**: ATM
- **aliases**: ATM, ATM
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_atm_118
- **aliasPrefix**: ATM-Fab-6K9L
- **fileCount**: 1
- **sourcePdbIds**: 6K9L
- **structuralBasis**: RCSB 6K9L ATM antigen / representative Fab display pose
- **disease/structureFamily**: 肿瘤方向靶点 · Fab 展示候选
- **files**: ATM-Fab-6K9L.pdb

### 237. CACNA1G/CACNA1G

- **target**: CACNA1G
- **gene**: CACNA1G
- **aliases**: CACNA1G, CACNA1G
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_cacna1g_119
- **aliasPrefix**: CACNA1G-Fab-6KZO
- **fileCount**: 1
- **sourcePdbIds**: 6KZO
- **structuralBasis**: RCSB 6KZO CACNA1G antigen / representative Fab display pose
- **disease/structureFamily**: 神经/心血管方向靶点 · Fab 展示候选
- **files**: CACNA1G-Fab-6KZO.pdb

### 238. PROC/PROC

- **target**: PROC
- **gene**: PROC
- **aliases**: PROC, PROC
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_proc_120
- **aliasPrefix**: PROC-Fab-6M3B
- **fileCount**: 1
- **sourcePdbIds**: 6M3B
- **structuralBasis**: RCSB 6M3B PROC antigen / representative Fab display pose
- **disease/structureFamily**: 凝血/血液方向靶点 · Fab 展示候选
- **files**: PROC-Fab-6M3B.pdb

### 239. CFTR/CFTR

- **target**: CFTR
- **gene**: CFTR
- **aliases**: CFTR, CFTR
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_cftr_121
- **aliasPrefix**: CFTR-Fab-6MSM
- **fileCount**: 1
- **sourcePdbIds**: 6MSM
- **structuralBasis**: RCSB 6MSM CFTR antigen / representative Fab display pose
- **disease/structureFamily**: 消化/骨骼方向靶点 · Fab 展示候选
- **files**: CFTR-Fab-6MSM.pdb

### 240. KLKB1/KLKB1

- **target**: KLKB1
- **gene**: KLKB1
- **aliases**: KLKB1, KLKB1
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_klkb1_122
- **aliasPrefix**: KLKB1-Fab-6O1S
- **fileCount**: 1
- **sourcePdbIds**: 6O1S
- **structuralBasis**: RCSB 6O1S KLKB1 antigen / representative Fab display pose
- **disease/structureFamily**: 凝血/血液方向靶点 · Fab 展示候选
- **files**: KLKB1-Fab-6O1S.pdb

### 241. MYH7/MYH7

- **target**: MYH7
- **gene**: MYH7
- **aliases**: MYH7, MYH7
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_myh7_123
- **aliasPrefix**: MYH7-Fab-6PFP
- **fileCount**: 1
- **sourcePdbIds**: 6PFP
- **structuralBasis**: RCSB 6PFP MYH7 antigen / representative Fab display pose
- **disease/structureFamily**: 神经/心血管方向靶点 · Fab 展示候选
- **files**: MYH7-Fab-6PFP.pdb

### 242. ABCB4/ABCB4

- **target**: ABCB4
- **gene**: ABCB4
- **aliases**: ABCB4, ABCB4
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_abcb4_124
- **aliasPrefix**: ABCB4-Fab-6S7P
- **fileCount**: 1
- **sourcePdbIds**: 6S7P
- **structuralBasis**: RCSB 6S7P ABCB4 antigen / representative Fab display pose
- **disease/structureFamily**: 消化/骨骼方向靶点 · Fab 展示候选
- **files**: ABCB4-Fab-6S7P.pdb

### 243. TG/TG

- **target**: TG
- **gene**: TG
- **aliases**: TG, TG
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_tg_125
- **aliasPrefix**: TG-Fab-6SCJ
- **fileCount**: 1
- **sourcePdbIds**: 6SCJ
- **structuralBasis**: RCSB 6SCJ TG antigen / representative Fab display pose
- **disease/structureFamily**: 其他方向靶点 · Fab 展示候选
- **files**: TG-Fab-6SCJ.pdb

### 244. RYR1/RYR1

- **target**: RYR1
- **gene**: RYR1
- **aliases**: RYR1, RYR1
- **organism**: BACTEROIDES THETAIOTAOMICRON (STRAIN ATCC 29148 / DSM 2079 / NCTC 10582 / E50 / VPI-5482), HOMO SAPIENS
- **antibodyFormat**: VHH
- **routeId**: display_pose_ryr1_126
- **aliasPrefix**: RYR1-VHH-6UHI
- **fileCount**: 1
- **sourcePdbIds**: 6UHI
- **structuralBasis**: RCSB 6UHI RYR1 antigen / representative VHH display pose
- **disease/structureFamily**: 神经/心血管方向靶点 · VHH 展示候选
- **files**: RYR1-VHH-6UHI.pdb

### 245. JAK2/JAK2

- **target**: JAK2
- **gene**: JAK2
- **aliases**: JAK2, JAK2
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_jak2_127
- **aliasPrefix**: JAK2-Fab-6VGL
- **fileCount**: 1
- **sourcePdbIds**: 6VGL
- **structuralBasis**: RCSB 6VGL JAK2 antigen / representative Fab display pose
- **disease/structureFamily**: 其他方向靶点 · Fab 展示候选
- **files**: JAK2-Fab-6VGL.pdb

### 246. GABRB2/GABRB2

- **target**: GABRB2
- **gene**: GABRB2
- **aliases**: GABRB2, GABRB2
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_gabrb2_128
- **aliasPrefix**: GABRB2-Fab-6X3U
- **fileCount**: 1
- **sourcePdbIds**: 6X3U
- **structuralBasis**: RCSB 6X3U GABRB2 antigen / representative Fab display pose
- **disease/structureFamily**: 神经/心血管方向靶点 · Fab 展示候选
- **files**: GABRB2-Fab-6X3U.pdb

### 247. AVPR2/AVPR2

- **target**: AVPR2
- **gene**: AVPR2
- **aliases**: AVPR2, AVPR2
- **organism**: HOMO SAPIENS
- **antibodyFormat**: VHH
- **routeId**: display_pose_avpr2_129
- **aliasPrefix**: AVPR2-VHH-7BB6
- **fileCount**: 1
- **sourcePdbIds**: 7BB6
- **structuralBasis**: RCSB 7BB6 AVPR2 antigen / representative VHH display pose
- **disease/structureFamily**: 其他方向靶点 · VHH 展示候选
- **files**: AVPR2-VHH-7BB6.pdb

### 248. TLR7/TLR7

- **target**: TLR7
- **gene**: TLR7
- **aliases**: TLR7, TLR7
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_tlr7_130
- **aliasPrefix**: TLR7-Fab-7CYN
- **fileCount**: 1
- **sourcePdbIds**: 7CYN
- **structuralBasis**: RCSB 7CYN TLR7 antigen / representative Fab display pose
- **disease/structureFamily**: 免疫炎症方向靶点 · Fab 展示候选
- **files**: TLR7-Fab-7CYN.pdb

### 249. SCN1A/SCN1A

- **target**: SCN1A
- **gene**: SCN1A
- **aliases**: SCN1A, SCN1A
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_scn1a_131
- **aliasPrefix**: SCN1A-Fab-7DTD
- **fileCount**: 1
- **sourcePdbIds**: 7DTD
- **structuralBasis**: RCSB 7DTD SCN1A antigen / representative Fab display pose
- **disease/structureFamily**: 神经/心血管方向靶点 · Fab 展示候选
- **files**: SCN1A-Fab-7DTD.pdb

### 250. LHCGR/LHCGR

- **target**: LHCGR
- **gene**: LHCGR
- **aliases**: LHCGR, LHCGR
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_lhcgr_132
- **aliasPrefix**: LHCGR-Fab-7FIJ
- **fileCount**: 1
- **sourcePdbIds**: 7FIJ
- **structuralBasis**: RCSB 7FIJ LHCGR antigen / representative Fab display pose
- **disease/structureFamily**: 内分泌方向靶点 · Fab 展示候选
- **files**: LHCGR-Fab-7FIJ.pdb

### 251. PDE3A/PDE3A

- **target**: PDE3A
- **gene**: PDE3A
- **aliases**: PDE3A, PDE3A
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_pde3a_133
- **aliasPrefix**: PDE3A-Fab-7L28
- **fileCount**: 1
- **sourcePdbIds**: 7L28
- **structuralBasis**: RCSB 7L28 PDE3A antigen / representative Fab display pose
- **disease/structureFamily**: 其他方向靶点 · Fab 展示候选
- **files**: PDE3A-Fab-7L28.pdb

### 252. ALK/ALK

- **target**: ALK
- **gene**: ALK
- **aliases**: ALK, ALK
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_alk_134
- **aliasPrefix**: ALK-Fab-7MZY
- **fileCount**: 1
- **sourcePdbIds**: 7MZY
- **structuralBasis**: RCSB 7MZY ALK antigen / representative Fab display pose
- **disease/structureFamily**: 肿瘤方向靶点 · Fab 展示候选
- **files**: ALK-Fab-7MZY.pdb

### 253. SPINK1/SPINK1

- **target**: SPINK1
- **gene**: SPINK1
- **aliases**: SPINK1, SPINK1
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_spink1_135
- **aliasPrefix**: SPINK1-Fab-7QE8
- **fileCount**: 1
- **sourcePdbIds**: 7QE8
- **structuralBasis**: RCSB 7QE8 SPINK1 antigen / representative Fab display pose
- **disease/structureFamily**: 消化/骨骼方向靶点 · Fab 展示候选
- **files**: SPINK1-Fab-7QE8.pdb

### 254. MMP7/MMP7

- **target**: MMP7
- **gene**: MMP7
- **aliases**: MMP7, MMP7
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_mmp7_136
- **aliasPrefix**: MMP7-Fab-7WXX
- **fileCount**: 1
- **sourcePdbIds**: 7WXX
- **structuralBasis**: RCSB 7WXX MMP7 antigen / representative Fab display pose
- **disease/structureFamily**: 消化/骨骼方向靶点 · Fab 展示候选
- **files**: MMP7-Fab-7WXX.pdb

### 255. ATP2C1/ATP2C1

- **target**: ATP2C1
- **gene**: ATP2C1
- **aliases**: ATP2C1, ATP2C1
- **organism**: HOMO SAPIENS
- **antibodyFormat**: VHH
- **routeId**: display_pose_atp2c1_137
- **aliasPrefix**: ATP2C1-VHH-7YAG
- **fileCount**: 1
- **sourcePdbIds**: 7YAG
- **structuralBasis**: RCSB 7YAG ATP2C1 antigen / representative VHH display pose
- **disease/structureFamily**: 消化/骨骼方向靶点 · VHH 展示候选
- **files**: ATP2C1-VHH-7YAG.pdb

### 256. TLR9/TLR9

- **target**: TLR9
- **gene**: TLR9
- **aliases**: TLR9, TLR9
- **organism**: HOMO SAPIENS
- **antibodyFormat**: VHH
- **routeId**: display_pose_tlr9_138
- **aliasPrefix**: TLR9-VHH-8AR3
- **fileCount**: 1
- **sourcePdbIds**: 8AR3
- **structuralBasis**: RCSB 8AR3 TLR9 antigen / representative VHH display pose
- **disease/structureFamily**: 免疫炎症方向靶点 · VHH 展示候选
- **files**: TLR9-VHH-8AR3.pdb

### 257. GREM1/GREM1

- **target**: GREM1
- **gene**: GREM1
- **aliases**: GREM1, GREM1
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_grem1_139
- **aliasPrefix**: GREM1-Fab-8B7H
- **fileCount**: 1
- **sourcePdbIds**: 8B7H
- **structuralBasis**: RCSB 8B7H GREM1 antigen / representative Fab display pose
- **disease/structureFamily**: 消化/骨骼方向靶点 · Fab 展示候选
- **files**: GREM1-Fab-8B7H.pdb

### 258. OPRM1/OPRM1

- **target**: OPRM1
- **gene**: OPRM1
- **aliases**: OPRM1, OPRM1
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_oprm1_140
- **aliasPrefix**: OPRM1-Fab-8F7Q
- **fileCount**: 1
- **sourcePdbIds**: 8F7Q
- **structuralBasis**: RCSB 8F7Q OPRM1 antigen / representative Fab display pose
- **disease/structureFamily**: 神经/心血管方向靶点 · Fab 展示候选
- **files**: OPRM1-Fab-8F7Q.pdb

### 259. GUCY2C/GUCY2C

- **target**: GUCY2C
- **gene**: GUCY2C
- **aliases**: GUCY2C, GUCY2C
- **organism**: CRICETULUS GRISEUS
- **antibodyFormat**: Fab
- **routeId**: display_pose_gucy2c_141
- **aliasPrefix**: GUCY2C-Fab-8FX4
- **fileCount**: 1
- **sourcePdbIds**: 8FX4
- **structuralBasis**: RCSB 8FX4 GUCY2C antigen / representative Fab display pose
- **disease/structureFamily**: 消化/骨骼方向靶点 · Fab 展示候选
- **files**: GUCY2C-Fab-8FX4.pdb

### 260. GPR161/GPR161

- **target**: GPR161
- **gene**: GPR161
- **aliases**: GPR161, GPR161
- **organism**: HOMO SAPIENS
- **antibodyFormat**: VHH
- **routeId**: display_pose_gpr161_142
- **aliasPrefix**: GPR161-VHH-8KH4
- **fileCount**: 1
- **sourcePdbIds**: 8KH4
- **structuralBasis**: RCSB 8KH4 GPR161 antigen / representative VHH display pose
- **disease/structureFamily**: 其他方向靶点 · VHH 展示候选
- **files**: GPR161-VHH-8KH4.pdb

### 261. ADRB1/ADRB1

- **target**: ADRB1
- **gene**: ADRB1
- **aliases**: ADRB1, ADRB1
- **organism**: HOMO SAPIENS
- **antibodyFormat**: VHH
- **routeId**: display_pose_adrb1_143
- **aliasPrefix**: ADRB1-VHH-8S2T
- **fileCount**: 1
- **sourcePdbIds**: 8S2T
- **structuralBasis**: RCSB 8S2T ADRB1 antigen / representative VHH display pose
- **disease/structureFamily**: 肿瘤方向靶点 · VHH 展示候选
- **files**: ADRB1-VHH-8S2T.pdb

### 262. CTNNB1/CTNNB1

- **target**: CTNNB1
- **gene**: CTNNB1
- **aliases**: CTNNB1, CTNNB1
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_ctnnb1_144
- **aliasPrefix**: CTNNB1-Fab-8Y0G
- **fileCount**: 1
- **sourcePdbIds**: 8Y0G
- **structuralBasis**: RCSB 8Y0G CTNNB1 antigen / representative Fab display pose
- **disease/structureFamily**: 肿瘤方向靶点 · Fab 展示候选
- **files**: CTNNB1-Fab-8Y0G.pdb

### 263. SCNN1B/SCNN1B

- **target**: SCNN1B
- **gene**: SCNN1B
- **aliases**: SCNN1B, SCNN1B
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_scnn1b_145
- **aliasPrefix**: SCNN1B-Fab-9BLR
- **fileCount**: 1
- **sourcePdbIds**: 9BLR
- **structuralBasis**: RCSB 9BLR SCNN1B antigen / representative Fab display pose
- **disease/structureFamily**: 神经/心血管方向靶点 · Fab 展示候选
- **files**: SCNN1B-Fab-9BLR.pdb

### 264. BEST1/BEST1

- **target**: BEST1
- **gene**: BEST1
- **aliases**: BEST1, BEST1
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_best1_146
- **aliasPrefix**: BEST1-Fab-9EGT
- **fileCount**: 1
- **sourcePdbIds**: 9EGT
- **structuralBasis**: RCSB 9EGT BEST1 antigen / representative Fab display pose
- **disease/structureFamily**: 肾脏/结缔组织方向靶点 · Fab 展示候选
- **files**: BEST1-Fab-9EGT.pdb

### 265. SLC6A3/SLC6A3

- **target**: SLC6A3
- **gene**: SLC6A3
- **aliases**: SLC6A3, SLC6A3
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_slc6a3_147
- **aliasPrefix**: SLC6A3-Fab-9EO4
- **fileCount**: 1
- **sourcePdbIds**: 9EO4
- **structuralBasis**: RCSB 9EO4 SLC6A3 antigen / representative Fab display pose
- **disease/structureFamily**: 神经/心血管方向靶点 · Fab 展示候选
- **files**: SLC6A3-Fab-9EO4.pdb

### 266. CHRNA1/CHRNA1

- **target**: CHRNA1
- **gene**: CHRNA1
- **aliases**: CHRNA1, CHRNA1
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_chrna1_148
- **aliasPrefix**: CHRNA1-Fab-9GU3
- **fileCount**: 1
- **sourcePdbIds**: 9GU3
- **structuralBasis**: RCSB 9GU3 CHRNA1 antigen / representative Fab display pose
- **disease/structureFamily**: 神经/心血管方向靶点 · Fab 展示候选
- **files**: CHRNA1-Fab-9GU3.pdb

### 267. GNAI1/GNAI1

- **target**: GNAI1
- **gene**: GNAI1
- **aliases**: GNAI1, GNAI1
- **organism**: HOMO SAPIENS
- **antibodyFormat**: VHH
- **routeId**: display_pose_gnai1_149
- **aliasPrefix**: GNAI1-VHH-9ODM
- **fileCount**: 1
- **sourcePdbIds**: 9ODM
- **structuralBasis**: RCSB 9ODM GNAI1 antigen / representative VHH display pose
- **disease/structureFamily**: 其他方向靶点 · VHH 展示候选
- **files**: GNAI1-VHH-9ODM.pdb

### 268. SCN5A/SCN5A

- **target**: SCN5A
- **gene**: SCN5A
- **aliases**: SCN5A, SCN5A
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_scn5a_150
- **aliasPrefix**: SCN5A-Fab-9P24
- **fileCount**: 1
- **sourcePdbIds**: 9P24
- **structuralBasis**: RCSB 9P24 SCN5A antigen / representative Fab display pose
- **disease/structureFamily**: 神经/心血管方向靶点 · Fab 展示候选
- **files**: SCN5A-Fab-9P24.pdb

### 269. NKX2-1/NKX2-1

- **target**: NKX2-1
- **gene**: NKX2-1
- **aliases**: NKX2-1, NKX2-1
- **organism**: HOMO SAPIENS
- **antibodyFormat**: Fab
- **routeId**: display_pose_nkx2_1_151
- **aliasPrefix**: NKX2-1-Fab-9U18
- **fileCount**: 1
- **sourcePdbIds**: 9U18
- **structuralBasis**: RCSB 9U18 NKX2-1 antigen / representative Fab display pose
- **disease/structureFamily**: 其他方向靶点 · Fab 展示候选
- **files**: NKX2-1-Fab-9U18.pdb

## 库资产 (Library Assets)

> 这些是非路线预设的本地结构资产，作为抗原参考使用，不一定有对应抗体复合物。

| # | 文件名 | target | gene | 别名 | 物种 | PDB ID | 状态 |
|---|--------|--------|------|------|------|--------|------|
| 1 | VIRUSLIB-FLU-HA-H01-7MFG.pdb | Influenza A H1 HA trimer | HA |  | Influenza A virus | 7MFG |  |
| 2 | VIRUSLIB-FLU-HA-H02-7L0L.pdb | Influenza A H2 HA trimer | HA |  | Influenza A virus | 7L0L |  |
| 3 | VIRUSLIB-FLU-HA-H03-9EI8.pdb | Influenza A H3 HA trimer | HA |  | Influenza A virus | 9EI8 |  |
| 4 | VIRUSLIB-FLU-HA-H04-5XL8.pdb | Influenza A H4 HA | HA |  | Influenza A virus | 5XL8 |  |
| 5 | VIRUSLIB-FLU-HA-H05-4K64.pdb | Influenza A H5 HA | HA |  | Influenza A virus | 4K64 |  |
| 6 | VIRUSLIB-FLU-HA-H06-4WSR.pdb | Influenza A H6 HA | HA |  | Influenza A virus | 4WSR |  |
| 7 | VIRUSLIB-FLU-HA-H07-8TNL.pdb | Influenza A H7 HA | HA |  | Influenza A virus | 8TNL |  |
| 8 | VIRUSLIB-FLU-HA-H08-6V46.pdb | Influenza A H8 HA | HA |  | Influenza A virus | 6V46 |  |
| 9 | VIRUSLIB-FLU-HA-H09-1JSD.pdb | Influenza A H9 HA trimer | HA |  | Influenza A virus | 1JSD |  |
| 10 | VIRUSLIB-FLU-HA-H10-4CYV.pdb | Influenza A H10 HA | HA |  | Influenza A virus | 4CYV |  |
| 11 | VIRUSLIB-FLU-HA-H11-6V47.pdb | Influenza A H11 HA | HA |  | Influenza A virus | 6V47 |  |
| 12 | VIRUSLIB-FLU-HA-H12-7A9D.pdb | Influenza A H12 HA | HA |  | Influenza A virus | 7A9D |  |
| 13 | VIRUSLIB-FLU-HA-H13-4KPQ.pdb | Influenza A H13 HA | HA |  | Influenza A virus | 4KPQ |  |
| 14 | VIRUSLIB-FLU-HA-H14-6V48.pdb | Influenza A H14 HA | HA |  | Influenza A virus | 6V48 |  |
| 15 | VIRUSLIB-FLU-HA-H15-6V49.pdb | Influenza A H15 HA | HA |  | Influenza A virus | 6V49 |  |
| 16 | VIRUSLIB-SC2-SPIKE-WUHAN-7Z3Z.pdb | SARS-CoV-2 Wuhan spike | Spike |  |  | 7Z3Z |  |
| 17 | VIRUSLIB-SC2-SPIKE-D614G-7WZ2.pdb | SARS-CoV-2 D614G spike | Spike |  |  | 7WZ2 |  |
| 18 | VIRUSLIB-SC2-SPIKE-ALPHA-7LWT.pdb | SARS-CoV-2 Alpha spike | Spike |  |  | 7LWT |  |
| 19 | VIRUSLIB-SC2-SPIKE-BETA-7LYN.pdb | SARS-CoV-2 Beta spike | Spike |  |  | 7LYN |  |
| 20 | VIRUSLIB-SC2-SPIKE-GAMMA-7V79.pdb | SARS-CoV-2 Gamma spike | Spike |  |  | 7V79 |  |
| 21 | VIRUSLIB-SC2-SPIKE-DELTA-7TOU.pdb | SARS-CoV-2 Delta spike | Spike |  |  | 7TOU |  |
| 22 | VIRUSLIB-SC2-SPIKE-OMICRON-BA1-8DZH.pdb | SARS-CoV-2 Omicron BA.1 spike | Spike |  |  | 8DZH |  |
| 23 | VIRUSLIB-SC2-SPIKE-OMICRON-BA2-7UB0.pdb | SARS-CoV-2 Omicron BA.2 spike | Spike |  |  | 7UB0 |  |
| 24 | VIRUSLIB-SARS1-SPIKE-8H16.pdb | SARS-CoV-1 Spike | Spike |  |  | 8H16 |  |
| 25 | VIRUSLIB-MERS-SPIKE-5X5C.pdb | MERS-CoV Spike | Spike |  |  | 5X5C |  |
| 26 | VIRUSLIB-NIPAH-G-OLIGOMER-8K0C.pdb | Nipah virus attachment glycoprotein G oligomer | G |  |  | 8K0C |  |
| 27 | VIRUSLIB-NIPAH-F-PREFUSION-8DO4.pdb | Nipah virus prefusion F | F |  |  | 8DO4 |  |
| 28 | VIRUSLIB-EBOLA-ZAIRE-GP-9MHA.pdb | Zaire Ebola virus GP | GP |  |  | 9MHA |  |
| 29 | VIRUSLIB-EBOLA-SUDAN-GP-9N8F.pdb | Sudan ebolavirus GP | GP |  |  | 9N8F |  |
| 30 | VIRUSLIB-EBOLA-BUNDIBUGYO-GP-6DZM.pdb | Bundibugyo ebolavirus GP | GP |  |  | 6DZM |  |
| 31 | VIRUSLIB-RSV-A-F-PREFUSION-5W23.pdb | RSV A prefusion F | F prefusion |  |  | 5W23 |  |
| 32 | VIRUSLIB-RSV-AB-F-POSTFUSION-3RRR.pdb | RSV A/B postfusion F | F postfusion |  |  | 3RRR |  |
| 33 | VIRUSLIB-HIV1-ENV-BG505-4NCO.pdb | HIV-1 BG505 Env trimer | Env |  |  | 4NCO |  |
| 34 | VIRUSLIB-HIV1-ENV-CONC-8F7T.pdb | HIV-1 ConC Env trimer | Env |  |  | 8F7T |  |
| 35 | VIRUSLIB-HIV1-ENV-ZM233-9CV7.pdb | HIV-1 ZM233 Env trimer | Env |  |  | 9CV7 |  |
| 36 | VIRUSLIB-NORO-GI1-VP1-SHELL-7KJP.pdb | Norovirus GI.1 VP1 shell | VP1 shell |  |  | 7KJP |  |
| 37 | VIRUSLIB-NORO-GII1-VP1-PDOMAIN-6GVZ.pdb | Norovirus GII.1 VP1 P-domain | VP1 P-domain |  |  | 6GVZ |  |
| 38 | VIRUSLIB-NORO-GII4-VP1-PDOMAIN-5IYN.pdb | Norovirus GII.4 VP1 P-domain | VP1 P-domain |  |  | 5IYN |  |
| 39 | VIRUSLIB-NORO-GII17-VP1-PDOMAIN-5F4O.pdb | Norovirus GII.17 VP1 P-domain | VP1 P-domain |  |  | 5F4O |  |
| 40 | VIRUSLIB-HMPV-F-PREFUSION-5WB0.pdb | Human metapneumovirus prefusion F | F |  |  | 5WB0 |  |
| 41 | VIRUSLIB-HMPV-A-F-4DAG.pdb | Human metapneumovirus A F | F |  |  | 4DAG |  |
| 42 | VIRUSLIB-HMPV-F-POSTFUSION-5L1X.pdb | Human metapneumovirus postfusion F | F |  |  | 5L1X |  |
| 43 | VIRUSLIB-HPIV3-HN-4MZA.pdb | HPIV3 hemagglutinin-neuraminidase | HN |  |  | 4MZA |  |
| 44 | VIRUSLIB-HPIV3-F-PREFUSION-8DG8.pdb | HPIV3 prefusion F | F prefusion |  |  | 8DG8 |  |
| 45 | CD40LG-VHH-1ALY.pdb | CD40LG | CD40LG | CD40LG, CD40 LIGAND | HOMO SAPIENS | 1ALY |  |
| 46 | ARSA-Fab-1AUK.pdb | ARSA | ARSA | ARSA, ARYLSULFATASE A, CEREBROSIDE-3-SULFATE-SULFATASE | HOMO SAPIENS | 1AUK |  |
| 47 | APOA1-Fab-1AV1.pdb | APOA1 | APOA1 | APOA1, APOLIPOPROTEIN A-I | HOMO SAPIENS | 1AV1 |  |
| 48 | APOE-VHH-1B68.pdb | APOE | APOE | APOE, APOLIPOPROTEIN E | HOMO SAPIENS | 1B68 |  |
| 49 | EPO-VHH-1BUY.pdb | EPO | EPO | EPO, PROTEIN (ERYTHROPOIETIN) | HOMO SAPIENS | 1BUY |  |
| 50 | DMD-Fab-1DXX.pdb | DMD | DMD | DMD, DYSTROPHIN | HOMO SAPIENS | 1DXX |  |
| 51 | APC-VHH-1EMU.pdb | APC | APC | APC, ADENOMATOUS POLYPOSIS COLI PROTEIN | HOMO SAPIENS | 1EMU |  |
| 52 | EPOR-Fab-1ERN.pdb | EPOR | EPOR | EPOR, PROTEIN (ERYTHROPOIETIN RECEPTOR) | HOMO SAPIENS | 1ERN |  |
| 53 | TTR-Fab-1F41.pdb | TTR | TTR | TTR, TRANSTHYRETIN | HOMO SAPIENS | 1F41 |  |
| 54 | IL12B-Fab-1F45.pdb | IL12B | IL12B | IL12B, INTERLEUKIN-12 BETA CHAIN, INTERLEUKIN-12 ALPHA CHAIN | HOMO SAPIENS | 1F45 |  |
| 55 | IFNG-Fab-1FG9.pdb | IFNG | IFNG | IFNG, INTERFERON GAMMA, INTERFERON-GAMMA RECEPTOR ALPHA CHAIN | HOMO SAPIENS | 1FG9 |  |
| 56 | FKBP1A-VHH-1FKJ.pdb | FKBP1A | FKBP1A | FKBP1A, FK506 BINDING PROTEIN, FKBP12 | HOMO SAPIENS | 1FKJ |  |
| 57 | CRP-Fab-1GNH.pdb | CRP | CRP | CRP, C-REACTIVE PROTEIN, HUMAN CRP HCRP | HOMO SAPIENS | 1GNH |  |
| 58 | IL1B-VHH-1I1B.pdb | IL1B | IL1B | IL1B, INTERLEUKIN-1 BETA | HOMO SAPIENS | 1I1B |  |
| 59 | IL4R-Fab-1IAR.pdb | IL4R | IL4R | IL4R, PROTEIN (INTERLEUKIN-4) | HOMO SAPIENS | 1IAR |  |
| 60 | EGFR-Fab-1IVO.pdb | EGFR | EGFR | EGFR, EPIDERMAL GROWTH FACTOR | HOMO SAPIENS | 1IVO |  |
| 61 | TNNI3-Fab-1J1E.pdb | TNNI3 | TNNI3 | TNNI3 | HOMO SAPIENS | 1J1E |  |
| 62 | PAH-Fab-1J8T.pdb | PAH | PAH | PAH, PHENYLALANINE-4-HYDROXYLASE, PHE-4-MONOOXYGENASE | HOMO SAPIENS | 1J8T |  |
| 63 | IMPDH1-Fab-1JCN.pdb | IMPDH1 | IMPDH1 | IMPDH1, INOSINE MONOPHOSPHATE DEHYDROGENASE I, INOSINE-5'-MONOPHOSPHATE DEHYDROGENASE 1 | HOMO SAPIENS | 1JCN |  |
| 64 | TGFB1-VHH-1KLC.pdb | TGFB1 | TGFB1 | TGFB1, TRANSFORMING GROWTH FACTOR-BETA 1, TGF-B1 | HOMO SAPIENS | 1KLC |  |
| 65 | ERBB3-Fab-1M6B.pdb | ERBB3 | ERBB3 | ERBB3, RECEPTOR PROTEIN-TYROSINE KINASE ERBB-3 | HOMO SAPIENS | 1M6B |  |
| 66 | IL6R-Fab-1N26.pdb | IL6R | IL6R | IL6R, IL-6 RECEPTOR ALPHA CHAIN | HOMO SAPIENS | 1N26 |  |
| 67 | IFNAR2-VHH-1N6V.pdb | IFNAR2 | IFNAR2 | IFNAR2, INTERFERON-ALPHA/BETA RECEPTOR BETA CHAIN, IFNAR2-EC, IFN-ALPHA-REC, TYPE I INTERFERON RECEPTOR, INTERFERON ALPHA/BETA RECEPTOR- 2 | HOMO SAPIENS | 1N6V |  |
| 68 | CXCL10-Fab-1O7Y.pdb | CXCL10 | CXCL10 | CXCL10, SMALL INDUCIBLE CYTOKINE B10, GAMMA-IP10, INTERFERON-GAMMA INDUCED PROTEIN | HOMO SAPIENS | 1O7Y |  |
| 69 | NR1H4-FXR-Fab-1OSH.pdb | NR1H4 / FXR | NR1H4 | NR1H4 / FXR, NR1H4, FXR, BILE ACID RECEPTOR, FARNESOID X-ACTIVATED RECEPTOR, FARNESOL RECEPTOR HRR-1, RETINOID X RECEPTOR-INTERACTING PROTEIN 14, RXR-INTERACTING PROTEIN 14 | HOMO SAPIENS | 1OSH |  |
| 70 | MYBPC3-VHH-1PD6.pdb | MYBPC3 | MYBPC3 | MYBPC3, MYOSIN-BINDING PROTEIN C, CARDIAC-TYPE, DOMAIN C2, CARDIAC MYOSIN-BINDING PROTEIN C CARDIAC MYBP-C PROTEIN C, CARDIAC | HOMO SAPIENS | 1PD6 |  |
| 71 | HLA-DRB1-Fab-1PYW.pdb | HLA-DRB1 | HLA-DRB1 | HLA-DRB1, HLA CLASS II HISTOCOMPATIBILITY ANTIGEN, DR ALPHA CHAIN, HLA CLASS II HISTOCOMPATIBILITY ANTIGEN, DR-1 BETA CHAIN, HLA-DRB, 9-RESIDUE INFLUENZA VIRUS HEMAGGLUTININ RELATED PEPTIDE FVKQNA(MAA)AL, ENTC3 OR SAV2009 OR SA1817 | HOMO SAPIENS | 1PYW |  |
| 72 | PRNP-VHH-1QLX.pdb | PRNP | PRNP | PRNP, PRION PROTEIN, MAJOR PRION PROTEIN, PRP27-30, PRP33-35C, (ASCR).PRP | HOMO SAPIENS | 1QLX |  |
| 73 | ACE2-Fab-1R42.pdb | ACE2 | ACE2 | ACE2, ANGIOTENSIN I CONVERTING ENZYME 2, ANGIOTENSIN CONVERTING ENZYME-LIKE PROTEIN, ANGIOTENSIN CONVERTING ENZYME-RELATED CARBOXYPEPTIDASE, DISORDERED SEGMENT OF COLLECTRIN HOMOLOGY DOMAIN | HOMO SAPIENS | 1R42 |  |
| 74 | KIT-Fab-1T45.pdb | KIT | KIT | KIT, HOMO SAPIENS V-KIT HARDY-ZUCKERMAN 4 FELINE SARCOMA VIRAL ONCOGENE HOMOLOG | HOMO SAPIENS | 1T45 |  |
| 75 | TNF-Fab-1TNF.pdb | TNF | TNF | TNF, TUMOR NECROSIS FACTOR-ALPHA | HOMO SAPIENS | 1TNF |  |
| 76 | TP53-VHH-1TUP.pdb | TP53 | TP53 | TP53, PROTEIN (P53 TUMOR SUPPRESSOR ) | HOMO SAPIENS | 1TUP |  |
| 77 | CD4-Fab-1WIP.pdb | CD4 | CD4 | CD4, T-CELL SURFACE GLYCOPROTEIN CD4 | HOMO SAPIENS | 1WIP |  |
| 78 | RARB-Fab-1XAP.pdb | RARB | RARB | RARB, RETINOIC ACID RECEPTOR BETA, RAR-BETA, RAR-EPSILON, HBV-ACTIVATED PROTEIN | HOMO SAPIENS | 1XAP |  |
| 79 | TNFRSF17-Fab-1XU2.pdb | TNFRSF17 | TNFRSF17 | TNFRSF17, TUMOR NECROSIS FACTOR LIGAND SUPERFAMILY MEMBER 13, A PROLIFERATION-INDUCING LIGAND, TNFSF13B OR TALL-2, TNFSF13, TUMOR NECROSIS FACTOR RECEPTOR SUPERFAMILY MEMBER 17, B-CELL MATURATION PROTEIN, TNFFSF17 | MUS MUSCULUS | 1XU2 |  |
| 80 | HPRT1-Fab-1Z7G.pdb | HPRT1 | HPRT1 | HPRT1, HYPOXANTHINE-GUANINE PHOSPHORIBOSYLTRANSFERASE, HGPRTASE | HOMO SAPIENS | 1Z7G |  |
| 81 | IL2RA-VHH-1Z92.pdb | IL2RA | IL2RA | IL2RA, INTERLEUKIN-2, T-CELL GROWTH FACTOR, ALDESLEUKIN, IL-2 RECEPTOR ALPHA SUBUNIT, TAC ANTIGEN, CD25 ANTIGEN | HOMO SAPIENS | 1Z92 |  |
| 82 | ALDH2-Fab-1ZUM.pdb | ALDH2 | ALDH2 | ALDH2, ALDEHYDE DEHYDROGENASE, ALDH CLASS 2, ALDH-E2, ALDH2*2 | HOMO SAPIENS | 1ZUM |  |
| 83 | KITLG-Fab-2E9W.pdb | KITLG | KITLG | KITLG, PROTO-ONCOGENE TYROSINE-PROTEIN KINASE KIT, CD117 ANTIGEN, KIT LIGAND, C-KIT LIGAND, STEM CELL FACTOR, MAST CELL GROWTH FACTOR | HOMO SAPIENS | 2E9W |  |
| 84 | PDHX-VHH-2F60.pdb | PDHX | PDHX | PDHX, PYRUVATE DEHYDROGENASE PROTEIN X COMPONENT, DIHYDROLIPOAMIDE DEHYDROGENASE-BINDING PROTEIN OF PYRUVATE DEHYDROGENASE COMPLEX, LIPOYL-CONTAINING PYRUVATE DEHYDROGENASE COMPLEX COMPONENT X, E3-BINDING PROTEIN | HOMO SAPIENS | 2F60 |  |
| 85 | BRAF-Fab-2FB8.pdb | BRAF | BRAF | BRAF, B-RAF PROTO-ONCOGENE SERINE/THREONINE-PROTEIN KINASE, V-RAF MURINE SARCOMA VIRAL ONCOGENE HOMOLOG B1 | HOMO SAPIENS | 2FB8 |  |
| 86 | CFH-Fab-2G7I.pdb | CFH | CFH | CFH, COMPLEMENT FACTOR H, H FACTOR 1 | HOMO SAPIENS | 2G7I |  |
| 87 | F10-Fab-2GD4.pdb | F10 | F10 | F10 | HOMO SAPIENS | 2GD4 |  |
| 88 | IL10-VHH-2H24.pdb | IL10 | IL10 | IL10, INTERLEUKIN-10, IL-10, CYTOKINE SYNTHESIS INHIBITORY FACTOR | HOMO SAPIENS | 2H24 |  |
| 89 | NCAM1-VHH-2HAZ.pdb | NCAM1 | NCAM1 | NCAM1, NEURAL CELL ADHESION MOLECULE 1, N-CAM 1 | HOMO SAPIENS | 2HAZ |  |
| 90 | ADK-Fab-2I6A.pdb | ADK | ADK | ADK, ADENOSINE KINASE, ADENYLATE KINASE | HOMO SAPIENS | 2I6A |  |
| 91 | MYD88-VHH-2JS7.pdb | MYD88 | MYD88 | MYD88, MYELOID DIFFERENTIATION PRIMARY RESPONSE PROTEIN MYD88 | HOMO SAPIENS | 2JS7 |  |
| 92 | SCN2A-VHH-2KAV.pdb | SCN2A | SCN2A | SCN2A, SODIUM CHANNEL PROTEIN TYPE 2 SUBUNIT ALPHA, SODIUM CHANNEL PROTEIN TYPE II SUBUNIT ALPHA, VOLTAGE-GATED SODIUM CHANNEL SUBUNIT ALPHA NAV1.2, SODIUM CHANNEL PROTEIN, BRAIN II SUBUNIT ALPHA, HBSC II, SCN2A1, SCN2A2 | HOMO SAPIENS | 2KAV |  |
| 93 | HMGB1-VHH-2LY4.pdb | HMGB1 | HMGB1 | HMGB1, HIGH MOBILITY GROUP PROTEIN B1, HIGH MOBILITY GROUP PROTEIN 1, CELLULAR TUMOR ANTIGEN P53, ANTIGEN NY-CO-13, PHOSPHOPROTEIN P53, TUMOR SUPPRESSOR P53 | HOMO SAPIENS | 2LY4 |  |
| 94 | SIGLEC8-VHH-2N7B.pdb | SIGLEC8 | SIGLEC8 | SIGLEC8, SIALIC ACID-BINDING IG-LIKE LECTIN 8, SIGLEC-8, SIALOADHESIN FAMILY MEMBER 2 | HOMO SAPIENS | 2N7B |  |
| 95 | SERPING1-Fab-2OAY.pdb | SERPING1 | SERPING1 | SERPING1, PLASMA PROTEASE C1 INHIBITOR, C1-INHIBITOR C1 INH C1INH C1 ESTERASE INHIBITOR C1- INHIBITING FACTOR | HOMO SAPIENS | 2OAY |  |
| 96 | MMP8-Fab-2OY4.pdb | MMP8 | MMP8 | MMP8, MATRIX METALLOPROTEINASE-8, MMP-8, PMNL- CL | HOMO SAPIENS | 2OY4 |  |
| 97 | PCSK9-Fab-2QTW.pdb | PCSK9 | PCSK9 | PCSK9, PROPROTEIN CONVERTASE SUBTILISIN/KEXIN TYPE 9 PROPEPTIDE, PROPROTEIN CONVERTASE PC9, SUBTILISIN/KEXIN-LIKE PROTEASE PC9, NEURAL APOPTOSIS-REGULATED CONVERTASE 1, PROPROTEIN CONVERTASE SUBTILISIN/KEXIN TYPE 9 | HOMO SAPIENS | 2QTW |  |
| 98 | SERPINA1-Fab-2QUG.pdb | SERPINA1 | SERPINA1 | SERPINA1, ALPHA-1 PROTEASE INHIBITOR, ALPHA-1-ANTIPROTEINASE | HOMO SAPIENS | 2QUG |  |
| 99 | CD55-VHH-2QZD.pdb | CD55 | CD55 | CD55, COMPLEMENT DECAY-ACCELERATING FACTOR, CD55 ANTIGEN | HOMO SAPIENS | 2QZD |  |
| 100 | PRSS1-Fab-2RA3.pdb | PRSS1 | PRSS1 | PRSS1, BASIC PROTEASE INHIBITOR, APROTININ | HOMO SAPIENS | 2RA3 |  |
| 101 | REN-Fab-2REN.pdb | REN | REN | REN | HOMO SAPIENS | 2REN |  |
| 102 | TSHR-Fab-2XWT.pdb | TSHR | TSHR | TSHR, THYROTROPIN RECEPTOR, THYROID-STIMULATING HORMONE RECEPTOR, TSH-R | HOMO SAPIENS | 2XWT |  |
| 103 | VDR-Fab-3A78.pdb | VDR | VDR | VDR, VITAMIN D3 RECEPTOR, 25-DIHYDROXYVITAMIN D3 RECEPTOR, NUCLEAR RECEPTOR SUBFAMILY 1 GROUP I MEMBER 1 | HOMO SAPIENS | 3A78 |  |
| 104 | PTK2B-Fab-3CC6.pdb | PTK2B | PTK2B | PTK2B, PROTEIN TYROSINE KINASE 2 BETA, FOCAL ADHESION KINASE 2, PROLINE-RICH TYROSINE KINASE 2, CELL ADHESION KINASE BETA, CALCIUM-DEPENDENT TYROSINE KINASE, RELATED ADHESION FOCAL TYROSINE KINASE | HOMO SAPIENS | 3CC6 |  |
| 105 | HECTD1-VHH-3DKM.pdb | HECTD1 | HECTD1 | HECTD1, E3 UBIQUITIN-PROTEIN LIGASE HECTD1, HECT DOMAIN-CONTAINING PROTEIN 1, E3 LIGASE FOR INHIBIN RECEPTOR, KIAA1131 | HOMO SAPIENS | 3DKM |  |
| 106 | JAK1-Fab-3EYG.pdb | JAK1 | JAK1 | JAK1, TYROSINE-PROTEIN KINASE, HCG_22179 | HOMO SAPIENS | 3EYG |  |
| 107 | BMPR2-Fab-3G2F.pdb | BMPR2 | BMPR2 | BMPR2, BONE MORPHOGENETIC PROTEIN RECEPTOR TYPE-2, BONE MORPHOGENETIC PROTEIN RECEPTOR TYPE II, BMP TYPE II RECEPTOR, BMPR-II | HOMO SAPIENS | 3G2F |  |
| 108 | DST-Fab-3GJO.pdb | DST | DST | DST, MICROTUBULE-ASSOCIATED PROTEIN RP/EB FAMILY MEMBER 1, APC-BINDING PROTEIN EB1, END-BINDING PROTEIN 1, DYSTONIN | HOMO SAPIENS | 3GJO |  |
| 109 | THRB-Fab-3GWS.pdb | THRB | THRB | THRB, THYROID HORMONE RECEPTOR BETA, NUCLEAR RECEPTOR SUBFAMILY 1 GROUP A MEMBER 2 | HOMO SAPIENS | 3GWS |  |
| 110 | CHEK2-Fab-3I6U.pdb | CHEK2 | CHEK2 | CHEK2, SERINE/THREONINE-PROTEIN KINASE CHK2 | HOMO SAPIENS | 3I6U |  |
| 111 | ADA2-Fab-3LGG.pdb | ADA2 | ADA2 | ADA2, ADENOSINE DEAMINASE CECR1, CAT EYE SYNDROME CRITICAL REGION PROTEIN 1 | HOMO SAPIENS | 3LGG |  |
| 112 | ADRB2-Fab-3NY9.pdb | ADRB2 | ADRB2 | ADRB2, BETA-2 ADRENOCEPTOR, ADRB2R | HOMO SAPIENS, ENTEROBACTERIA PHAGE T4 | 3NY9 |  |
| 113 | RAF1-Fab-3OMV.pdb | RAF1 | RAF1 | RAF1, RAF PROTO-ONCOGENE SERINE/THREONINE-PROTEIN KINASE, PROTO-ONCOGENE C-RAF, RAF-1 | HOMO SAPIENS | 3OMV |  |
| 114 | CTLA4-Fab-3OSK.pdb | CTLA4 | CTLA4 | CTLA4, CYTOTOXIC T-LYMPHOCYTE PROTEIN 4, CYTOTOXIC T-LYMPHOCYTE-ASSOCIATED ANTIGEN 4, CTLA-4 | HOMO SAPIENS | 3OSK |  |
| 115 | NF1-Fab-3P7Z.pdb | NF1 | NF1 | NF1, NEUROFIBROMIN, NEUROFIBROMATOSIS-RELATED PROTEIN NF-1, NEUROFIBROMIN TRUNCATED | HOMO SAPIENS | 3P7Z |  |
| 116 | RB1-Fab-3POM.pdb | RB1 | RB1 | RB1, RETINOBLASTOMA-ASSOCIATED PROTEIN, P105-RB | HOMO SAPIENS | 3POM |  |
| 117 | CALR-Fab-3POW.pdb | CALR | CALR | CALR, CALRETICULIN, CALREGULIN, ENDOPLASMIC RETICULUM RESIDENT PROTEIN 60 | HOMO SAPIENS | 3POW |  |
| 118 | VAMP2-VHH-3RK2.pdb | VAMP2 | VAMP2 | VAMP2, VESICLE-ASSOCIATED MEMBRANE PROTEIN 2, VAMP-2, SYNAPTOBREVIN-2, NEURON-SPECIFIC ANTIGEN HPC-1, SYNAPTOTAGMIN-ASSOCIATED 35 KDA PROTEIN, SYNAPTOSOMAL-ASSOCIATED PROTEIN 25, SUPER PROTEIN, SYNAPTOSOMAL-ASSOCIATED 25 KDA PROTEIN | HOMO SAPIENS | 3RK2 |  |
| 119 | NKX2-5-VHH-3RKQ.pdb | NKX2-5 | NKX2-5 | NKX2-5, HOMEOBOX PROTEIN NKX-2.5, CARDIAC-SPECIFIC HOMEOBOX, HOMEOBOX PROTEIN CSX, HOMEOBOX PROTEIN NK-2 HOMOLOG E, NKX2.5, ANF-242 DNA | HOMO SAPIENS | 3RKQ |  |
| 120 | MMP1-Fab-3SHI.pdb | MMP1 | MMP1 | MMP1, MMP-1, MATRIX METALLOPROTEINASE-1 | HOMO SAPIENS | 3SHI |  |
| 121 | IL21-Fab-3TGX.pdb | IL21 | IL21 | IL21, IL-21 RECEPTOR, UNQ3121/PRO10273, INTERLEUKIN-21, IL-21 | HOMO SAPIENS | 3TGX |  |
| 122 | PKP2-Fab-3TT9.pdb | PKP2 | PKP2 | PKP2, PLAKOPHILIN-2 | HOMO SAPIENS | 3TT9 |  |
| 123 | F2-thrombin-Fab-3U69.pdb | F2 / thrombin | F2 | F2 / thrombin, F2, thrombin, PROTHROMBIN | HOMO SAPIENS | 3U69 |  |
| 124 | MEN1-Fab-3U84.pdb | MEN1 | MEN1 | MEN1 | HOMO SAPIENS | 3U84 |  |
| 125 | CHRM2-Fab-3UON.pdb | CHRM2 | CHRM2 | CHRM2 | HOMO SAPIENS, ENTEROBACTERIA PHAGE T4 | 3UON |  |
| 126 | FLCN-Fab-3V42.pdb | FLCN | FLCN | FLCN, FOLLICULIN, BHD SKIN LESION FIBROFOLLICULOMA PROTEIN, BIRT-HOGG-DUBE SYNDROME PROTEIN | HOMO SAPIENS | 3V42 |  |
| 127 | IL18-Fab-3WO2.pdb | IL18 | IL18 | IL18, INTERLEUKIN-18, IL-18, IBOCTADEKIN, INTERFERON GAMMA-INDUCING FACTOR, IFN- GAMMA-INDUCING FACTOR, INTERLEUKIN-1 GAMMA, IL-1 GAMMA | HOMO SAPIENS | 3WO2 |  |
| 128 | GABRB3-Fab-4COF.pdb | GABRB3 | GABRB3 | GABRB3, GAMMA-AMINOBUTYRIC ACID RECEPTOR SUBUNIT BETA-3, GABA(A) RECEPTOR SUBUNIT BETA-3, GABA RECEPTOR, IONOTROPIC | HOMO SAPIENS | 4COF |  |
| 129 | FTO-Fab-4CXW.pdb | FTO | FTO | FTO, ALPHA-KETOGLUTARATE-DEPENDENT DIOXYGENASE FTO, FAT MASS AND OBESITY-ASSOCIATED PROTEIN | HOMO SAPIENS | 4CXW |  |
| 130 | FGFR1-Fab-4F64.pdb | FGFR1 | FGFR1 | FGFR1, FGFR-1, BFGF-R-1, FMS-LIKE TYROSINE KINASE 2, PROTO-ONCOGENE C- FGR | HOMO SAPIENS | 4F64 |  |
| 131 | TOP2A-Fab-4FM9.pdb | TOP2A | TOP2A | TOP2A, DNA TOPOISOMERASE 2-ALPHA, DNA TOPOISOMERASE II, ALPHA ISOZYME | HOMO SAPIENS | 4FM9 |  |
| 132 | MMP13-Fab-4FU4.pdb | MMP13 | MMP13 | MMP13, MATRIX METALLOPROTEINASE-13, MMP-13 | HOMO SAPIENS | 4FU4 |  |
| 133 | HBB-Fab-4HHB.pdb | HBB | HBB | HBB | HOMO SAPIENS | 4HHB |  |
| 134 | IL17A-VHH-4HR9.pdb | IL17A | IL17A | IL17A, INTERLEUKIN-17A, IL-17A, CYTOTOXIC T-LYMPHOCYTE-ASSOCIATED ANTIGEN 8 | HOMO SAPIENS | 4HR9 |  |
| 135 | OAS1-Fab-4IG8.pdb | OAS1 | OAS1 | OAS1, 2'-5'-OLIGOADENYLATE SYNTHASE 1, (2-5')OLIGO(A) SYNTHASE 1, 2-5A SYNTHASE 1, E18/E16, P46/P42 OAS | HOMO SAPIENS | 4IG8 |  |
| 136 | GRIK1-Fab-4MF3.pdb | GRIK1 | GRIK1 | GRIK1, GLUTAMATE RECEPTOR IONOTROPIC, KAINATE 1, EXCITATORY AMINO ACID RECEPTOR 3, GLUTAMATE RECEPTOR 5 | HOMO SAPIENS | 4MF3 |  |
| 137 | FCGRT-FcRn-VHH-4N0U.pdb | FCGRT / FcRn | FCGRT | FCGRT / FcRn, FCGRT, FcRn, IGG RECEPTOR FCRN LARGE SUBUNIT P51, FCRN, IGG FC FRAGMENT RECEPTOR TRANSPORTER ALPHA CHAIN, NEONATAL FC RECEPTOR, BETA-2-MICROGLOBULIN, BETA-2-MICROGLOBULIN FORM PI 5.3, CDABP0092, HDCMA22P, SERUM ALBUMIN, PRO0903, PRO1708, PRO2044, PRO2619, PRO2675, UNQ696/PRO1341, IG GAMMA-1 CHAIN C REGION | HOMO SAPIENS | 4N0U |  |
| 138 | KRAS-Fab-4OBE.pdb | KRAS | KRAS | KRAS, GTPASE KRAS, C-KI-RAS, N- TERMINALLY PROCESSED, V-KI-RAS2 KIRSTEN RAT SARCOMA VIRAL ONCOGENE HOMOLOG | HOMO SAPIENS | 4OBE |  |
| 139 | NR3C1-Fab-4P6X.pdb | NR3C1 | NR3C1 | NR3C1, GLUCOCORTICOID RECEPTOR, NUCLEAR RECEPTOR SUBFAMILY 3 GROUP C MEMBER 1, CLASS E BASIC HELIX-LOOP-HELIX PROTEIN 75, TRANSCRIPTIONAL INTERMEDIARY FACTOR 2 | HOMO SAPIENS | 4P6X |  |
| 140 | STAG2-Fab-4PK7.pdb | STAG2 | STAG2 | STAG2, COHESIN SUBUNIT SA-2, SCC3 HOMOLOG 2, STROMAL ANTIGEN 2, DOUBLE-STRAND-BREAK REPAIR PROTEIN RAD21 HOMOLOG, NUCLEAR MATRIX PROTEIN 1, SCC1 HOMOLOG, KIAA0078 | HOMO SAPIENS | 4PK7 |  |
| 141 | AXL-Fab-4RA0.pdb | AXL | AXL | AXL, GROWTH ARREST-SPECIFIC PROTEIN 6, AXL RECEPTOR TYROSINE KINASE LIGAND, TYROSINE-PROTEIN KINASE RECEPTOR UFO, AXL ONCOGENE | HOMO SAPIENS | 4RA0 |  |
| 142 | RET-Fab-4UX8.pdb | RET | RET | RET, PROTO-ONCOGENE TYROSINE-PROTEIN KINASE RECEPTOR RET, CADHERIN FAMILY MEMBER 12, PROTO-ONCOGENE C-RET, RET RECEPTOR TYROSINE KINASE, GDNF FAMILY RECEPTOR ALPHA-1, GLIAL CELL LINE-DERIVED NEUROTROPHIC FACTOR, ASTROCYTE-DERIVED TROPHIC FACTOR | HOMO SAPIENS | 4UX8 |  |
| 143 | FGFR2-Fab-4WV1.pdb | FGFR2 | FGFR2 | FGFR2, FGFR-2 | HOMO SAPIENS | 4WV1 |  |
| 144 | MYOC-Fab-4WXQ.pdb | MYOC | MYOC | MYOC, MYOCILIN, MYOCILIN 55 KDA SUBUNIT, TRABECULAR MESHWORK-INDUCED GLUCOCORTICOID RESPONSE PROTEIN | HOMO SAPIENS | 4WXQ |  |
| 145 | AGTR1-Fab-4YAY.pdb | AGTR1 | AGTR1 | AGTR1, ANGIOTENSIN II TYPE-1 RECEPTOR, AGTR1A, AGTR1B, AT2R1B | ESCHERICHIA COLI, HOMO SAPIENS | 4YAY |  |
| 146 | ODC1-Fab-4ZGY.pdb | ODC1 | ODC1 | ODC1, ORNITHINE DECARBOXYLASE, ORNITHINE DECARBOXYLASE ANTIZYME 1 | HOMO SAPIENS | 4ZGY |  |
| 147 | KRT10-VHH-4ZRY.pdb | KRT10 | KRT10 | KRT10, HAIR ALPHA PROTEIN | HOMO SAPIENS | 4ZRY |  |
| 148 | IDH1-Fab-5DE1.pdb | IDH1 | IDH1 | IDH1, ISOCITRATE DEHYDROGENASE [NADP] CYTOPLASMIC, CYTOSOLIC NADP-ISOCITRATE DEHYDROGENASE, NADP(+)- SPECIFIC ICDH, OXALOSUCCINATE DECARBOXYLASE | HOMO SAPIENS | 5DE1 |  |
| 149 | SERPING1-Fab-5DU3.pdb | SERPING1 | SERPING1 | SERPING1, PLASMA PROTEASE C1 INHIBITOR, C1 ESTERASE INHIBITOR, C1-INHIBITING FACTOR, SERPIN G1 | HOMO SAPIENS | 5DU3 |  |
| 150 | PTGS2-Fab-5F19.pdb | PTGS2 | PTGS2 | PTGS2, PROSTAGLANDIN G/H SYNTHASE 2, CYCLOOXYGENASE-2, PROSTAGLANDIN H2 SYNTHASE 2, PROSTAGLANDIN-ENDOPEROXIDE SYNTHASE 2 | HOMO SAPIENS | 5F19 |  |
| 151 | SLC6A4-SERT-Fab-5I75.pdb | SLC6A4 / SERT | SLC6A4 | SLC6A4 / SERT, SLC6A4, SERT, SODIUM-DEPENDENT SEROTONIN TRANSPORTER, 5HT TRANSPORTER, SOLUTE CARRIER FAMILY 6 MEMBER 4 | HOMO SAPIENS | 5I75 |  |
| 152 | TSLP-Fab-5J11.pdb | TSLP | TSLP | TSLP, THYMIC STROMAL LYMPHOPOIETIN, CYTOKINE RECEPTOR-LIKE FACTOR 2, CYTOKINE RECEPTOR-LIKE 2, THYMIC STROMAL LYMPHOPOIETIN PROTEIN RECEPTOR, TSLP RECEPTOR | HOMO SAPIENS | 5J11 |  |
| 153 | GAA-Fab-5KZW.pdb | GAA | GAA | GAA, LYSOSOMAL ALPHA-GLUCOSIDASE, ACID MALTASE, AGLUCOSIDASE ALFA | HOMO SAPIENS | 5KZW |  |
| 154 | NTRK2-Fab-5MO9.pdb | NTRK2 | NTRK2 | NTRK2, BDNF/NT-3 GROWTH FACTORS RECEPTOR, GP145-TRKB, NEUROTROPHIC TYROSINE KINASE RECEPTOR TYPE 2, TRKB TYROSINE KINASE, TROPOMYOSIN-RELATED KINASE B | MUS MUSCULUS | 5MO9 |  |
| 155 | FBN1-VHH-5MS9.pdb | FBN1 | FBN1 | FBN1, FIBRILLIN-1 | HOMO SAPIENS | 5MS9 |  |
| 156 | COL4A1-Fab-5NAY.pdb | COL4A1 | COL4A1 | COL4A1 | HOMO SAPIENS | 5NAY |  |
| 157 | DRD4-Fab-5WIU.pdb | DRD4 | DRD4 | DRD4, D(2C) DOPAMINE RECEPTOR, DOPAMINE D4 RECEPTOR | HOMO SAPIENS, ESCHERICHIA COLI | 5WIU |  |
| 158 | CNR1-Fab-5XRA.pdb | CNR1 | CNR1 | CNR1 | HOMO SAPIENS, DESULFOVIBRIO VULGARIS (STRAIN HILDENBOROUGH / ATCC 29579 / DSM 644 / NCIMB 8303) | 5XRA |  |
| 159 | ATP4A-Fab-5YLU.pdb | ATP4A | ATP4A | ATP4A, POTASSIUM-TRANSPORTING ATPASE ALPHA CHAIN 1, GASTRIC H(+)/K(+) ATPASE SUBUNIT ALPHA, PROTON PUMP, POTASSIUM-TRANSPORTING ATPASE SUBUNIT BETA, GASTRIC H(+)/K(+) ATPASE SUBUNIT BETA, PROTON PUMP BETA CHAIN, GP60-90 | SUS SCROFA | 5YLU |  |
| 160 | DICER1-Fab-5ZAL.pdb | DICER1 | DICER1 | DICER1, ENDORIBONUCLEASE DICER, HELICASE WITH RNASE MOTIF, HELICASE MOI, KIAA0928, RISC-LOADING COMPLEX SUBUNIT TARBP2, AR RNA-BINDING PROTEIN 2, TRANS-ACTIVATION-RESPONSIVE RNA-BINDING PROTEIN, PRELET7 | HOMO SAPIENS | 5ZAL |  |
| 161 | PLAT-Fab-5ZLZ.pdb | PLAT | PLAT | PLAT, PLASMINOGEN ACTIVATOR INHIBITOR 1, ENDOTHELIAL PLASMINOGEN ACTIVATOR INHIBITOR, TISSUE-TYPE PLASMINOGEN ACTIVATOR | HOMO SAPIENS | 5ZLZ |  |
| 162 | HTR2A-Fab-6A93.pdb | HTR2A | HTR2A | HTR2A, SEROTONIN RECEPTOR 2A | HOMO SAPIENS, ESCHERICHIA COLI | 6A93 |  |
| 163 | GNAS-Fab-6AU6.pdb | GNAS | GNAS | GNAS, ADENYLATE CYCLASE-STIMULATING G ALPHA PROTEIN | HOMO SAPIENS | 6AU6 |  |
| 164 | DRD2-Fab-6CM4.pdb | DRD2 | DRD2 | DRD2, DOPAMINE D2 RECEPTOR, T4TP126 | HOMO SAPIENS, ENTEROBACTERIA PHAGE T4 | 6CM4 |  |
| 165 | NTRK1-Fab-6D20.pdb | NTRK1 | NTRK1 | NTRK1, NEUROTROPHIC TYROSINE KINASE RECEPTOR TYPE 1, TRK1- TRANSFORMING TYROSINE KINASE PROTEIN, TROPOMYOSIN-RELATED KINASE A, TYROSINE KINASE RECEPTOR, TYROSINE KINASE RECEPTOR A, GP140TRK, P140-TRKA | HOMO SAPIENS | 6D20 |  |
| 166 | COL3A1-Fab-6FZV.pdb | COL3A1 | COL3A1 | COL3A1 | HOMO SAPIENS | 6FZV |  |
| 167 | SUCLG1-Fab-6G4Q.pdb | SUCLG1 | SUCLG1 | SUCLG1, SUCCINATE--COA LIGASE [ADP/GDP-FORMING] SUBUNIT ALPHA, MITOCHONDRIAL, SUCCINYL-COA SYNTHETASE SUBUNIT ALPHA, SUCCINATE--COA LIGASE [ADP-FORMING] SUBUNIT BETA, MITOCHONDRIAL, ATP-SPECIFIC SUCCINYL-COA SYNTHETASE SUBUNIT BETA, SUCCINYL-COA SYNTHETASE BETA-A CHAIN | HOMO SAPIENS | 6G4Q |  |
| 168 | PSPH-Fab-6HYJ.pdb | PSPH | PSPH | PSPH, PHOSPHOSERINE PHOSPHATASE, PSPASE, L-3-PHOSPHOSERINE PHOSPHATASE, O-PHOSPHOSERINE PHOSPHOHYDROLASE | HOMO SAPIENS | 6HYJ |  |
| 169 | GUCY1A1-Fab-6JT0.pdb | GUCY1A1 | GUCY1A1 | GUCY1A1, GUANYLATE CYCLASE SOLUBLE SUBUNIT ALPHA-1, GUANYLATE CYCLASE SOLUBLE SUBUNIT ALPHA-3, SOLUBLE GUANYLATE CYCLASE LARGE SUBUNIT, GUC1A3, GUCSA3, GUCY1A3, GUANYLATE CYCLASE SOLUBLE SUBUNIT BETA-1, GUANYLATE CYCLASE SOLUBLE SUBUNIT BETA-3, SOLUBLE GUANYLATE CYCLASE SMALL SUBUNIT, GUCSB3 | HOMO SAPIENS | 6JT0 |  |
| 170 | ADRA2B-VHH-6K41.pdb | ADRA2B | ADRA2B | ADRA2B, G GAMMA-I, ADRA2A, RB59_126, ADRA2L1, ADRA2RL1 | HOMO SAPIENS | 6K41 |  |
| 171 | ATM-Fab-6K9L.pdb | ATM | ATM | ATM, SERINE-PROTEIN KINASE ATM, ATAXIA TELANGIECTASIA MUTATED, A-T MUTATED | HOMO SAPIENS | 6K9L |  |
| 172 | CACNA1G-Fab-6KZO.pdb | CACNA1G | CACNA1G | CACNA1G, VOLTAGE-DEPENDENT T-TYPE CALCIUM CHANNEL SUBUNIT ALPHA-1G, CAV3.1C, VOLTAGE-GATED CALCIUM CHANNEL SUBUNIT ALPHA CAV3.1, KIAA1123 | HOMO SAPIENS | 6KZO |  |
| 173 | PROC-Fab-6M3B.pdb | PROC | PROC | PROC, ANTICOAGULANT PROTEIN C, AUTOPROTHROMBIN IIA, BLOOD COAGULATION FACTOR XIV, C25K23 FAB L CHAIN, C25K23 FAB H CHAIN | HOMO SAPIENS | 6M3B |  |
| 174 | CFTR-Fab-6MSM.pdb | CFTR | CFTR | CFTR, CYSTIC FIBROSIS TRANSMEMBRANE CONDUCTANCE REGULATOR, ATP-BINDING CASSETTE SUB-FAMILY C MEMBER 7, CHANNEL CONDUCTANCE-CONTROLLING ATPASE, CAMP-DEPENDENT CHLORIDE CHANNEL, PIECE OF MOLECULE-1 | HOMO SAPIENS | 6MSM |  |
| 175 | KLKB1-Fab-6O1S.pdb | KLKB1 | KLKB1 | KLKB1, PLASMA KALLIKREIN, FLETCHER FACTOR, KININOGENIN, PLASMA PREKALLIKREIN | HOMO SAPIENS | 6O1S |  |
| 176 | MYH7-Fab-6PFP.pdb | MYH7 | MYH7 | MYH7, MYOSIN-7 FUSED TO GP7 AND EB1 | HOMO SAPIENS | 6PFP |  |
| 177 | ABCB4-Fab-6S7P.pdb | ABCB4 | ABCB4 | ABCB4, PHOSPHATIDYLCHOLINE TRANSLOCATOR ABCB4, ATP-BINDING CASSETTE SUB-FAMILY B MEMBER 4, MULTIDRUG RESISTANCE PROTEIN 3, P-GLYCOPROTEIN 3 | HOMO SAPIENS | 6S7P |  |
| 178 | TG-Fab-6SCJ.pdb | TG | TG | TG, THYROGLOBULIN | HOMO SAPIENS | 6SCJ |  |
| 179 | RYR1-VHH-6UHI.pdb | RYR1 | RYR1 | RYR1, RYANODINE RECEPTOR 1 CHIMERA, SKELETAL MUSCLE CALCIUM RELEASE CHANNEL, SKELETAL MUSCLE RYANODINE RECEPTOR, SKELETAL MUSCLE-TYPE RYANODINE RECEPTOR, TYPE 1 RYANODINE RECEPTOR, BT_2247 | BACTEROIDES THETAIOTAOMICRON (STRAIN ATCC 29148 / DSM 2079 / NCTC 10582 / E50 / VPI-5482), HOMO SAPIENS | 6UHI |  |
| 180 | JAK2-Fab-6VGL.pdb | JAK2 | JAK2 | JAK2, TYROSINE-PROTEIN KINASE JAK2, JANUS KINASE 2, JAK-2 | HOMO SAPIENS | 6VGL |  |
| 181 | GABRB2-Fab-6X3U.pdb | GABRB2 | GABRB2 | GABRB2, GAMMA-AMINOBUTYRIC ACID RECEPTOR SUBUNIT BETA-2, GABA(A) RECEPTOR SUBUNIT BETA-2, GAMMA-AMINOBUTYRIC ACID RECEPTOR SUBUNIT ALPHA-1, GABA(A) RECEPTOR SUBUNIT ALPHA-1, GAMMA-AMINOBUTYRIC ACID RECEPTOR SUBUNIT GAMMA-2, GABA(A) RECEPTOR SUBUNIT GAMMA-2 | HOMO SAPIENS | 6X3U |  |
| 182 | AVPR2-VHH-7BB6.pdb | AVPR2 | AVPR2 | AVPR2, VASOPRESSIN V2 RECEPTOR, AVPR V2, ANTIDIURETIC HORMONE RECEPTOR, RENAL-TYPE ARGININE VASOPRESSIN RECEPTOR, ADENYLATE CYCLASE-STIMULATING G ALPHA PROTEIN, G GAMMA-I, ARGININE-VASOPRESSIN | HOMO SAPIENS | 7BB6 |  |
| 183 | TLR7-Fab-7CYN.pdb | TLR7 | TLR7 | TLR7, TOLL-LIKE RECEPTOR 7, UNQ248/PRO285, PROTEIN UNC-93 HOMOLOG B1, UNC93B | HOMO SAPIENS | 7CYN |  |
| 184 | SCN1A-Fab-7DTD.pdb | SCN1A | SCN1A | SCN1A, SODIUM CHANNEL SUBUNIT BETA-4, SODIUM CHANNEL PROTEIN TYPE 1 SUBUNIT ALPHA, SODIUM CHANNEL PROTEIN BRAIN I SUBUNIT ALPHA, SODIUM CHANNEL PROTEIN TYPE I SUBUNIT ALPHA, VOLTAGE-GATED SODIUM CHANNEL SUBUNIT ALPHA NAV1.1 | HOMO SAPIENS | 7DTD |  |
| 185 | LHCGR-Fab-7FIJ.pdb | LHCGR | LHCGR | LHCGR, LUTROPIN-CHORIOGONADOTROPIC HORMONE RECEPTOR, LH/CG-R, LUTEINIZING HORMONE RECEPTOR | HOMO SAPIENS | 7FIJ |  |
| 186 | PDE3A-Fab-7L28.pdb | PDE3A | PDE3A | PDE3A, CGMP-INHIBITED 3',5'-CYCLIC PHOSPHODIESTERASE A, CYCLIC GMP-INHIBITED PHOSPHODIESTERASE A, CGI-PDE A | HOMO SAPIENS | 7L28 |  |
| 187 | ALK-Fab-7MZY.pdb | ALK | ALK | ALK, ALK TYROSINE KINASE RECEPTOR, ANAPLASTIC LYMPHOMA KINASE | HOMO SAPIENS | 7MZY |  |
| 188 | SPINK1-Fab-7QE8.pdb | SPINK1 | SPINK1 | SPINK1 | HOMO SAPIENS | 7QE8 |  |
| 189 | MMP7-Fab-7WXX.pdb | MMP7 | MMP7 | MMP7, MATRILYSIN, MATRIN, MATRIX METALLOPROTEINASE-7, MMP-7, PUMP-1 PROTEASE, UTERINE METALLOPROTEINASE | HOMO SAPIENS | 7WXX |  |
| 190 | ATP2C1-VHH-7YAG.pdb | ATP2C1 | ATP2C1 | ATP2C1, CALCIUM-TRANSPORTING ATPASE TYPE 2C MEMBER 1, ATPASE 2C1, ATP-DEPENDENT CA(2+) PUMP PMR1, CA(2+)/MN(2+)- ATPASE 2C1, SECRETORY PATHWAY CA(2+)-TRANSPORTING ATPASE TYPE 1, KIAA1347, HUSSY-28 | HOMO SAPIENS | 7YAG |  |
| 191 | TLR9-VHH-8AR3.pdb | TLR9 | TLR9 | TLR9, TOLL-LIKE RECEPTOR 9, UNQ5798/PRO19605 | HOMO SAPIENS | 8AR3 |  |
| 192 | GREM1-Fab-8B7H.pdb | GREM1 | GREM1 | GREM1, GREMLIN-1, CELL PROLIFERATION-INDUCING GENE 2 PROTEIN, CYSTEINE KNOT SUPERFAMILY 1, BMP ANTAGONIST 1, DAN DOMAIN FAMILY MEMBER 2, DOWN- REGULATED IN MOS-TRANSFORMED CELLS PROTEIN, INCREASED IN HIGH GLUCOSE PROTEIN 2, CKTSF1B1 | HOMO SAPIENS | 8B7H |  |
| 193 | OPRM1-Fab-8F7Q.pdb | OPRM1 | OPRM1 | OPRM1, MU-TYPE OPIOID RECEPTOR, MU OPIATE RECEPTOR, MU OPIOID RECEPTOR, BETA-ENDORPHIN, ADENYLATE CYCLASE-INHIBITING G ALPHA PROTEIN, G GAMMA-I | HOMO SAPIENS | 8F7Q |  |
| 194 | GUCY2C-Fab-8FX4.pdb | GUCY2C | GUCY2C | GUCY2C, GUANYLYL CYCLASE C, STA RECEPTOR, INTESTINAL GUANYLATE CYCLASE | CRICETULUS GRISEUS | 8FX4 |  |
| 195 | GPR161-VHH-8KH4.pdb | GPR161 | GPR161 | GPR161, G-PROTEIN COUPLED RECEPTOR 161, ADENYLATE CYCLASE-STIMULATING G ALPHA PROTEIN, OLFACTORY TYPE, G GAMMA-I | HOMO SAPIENS | 8KH4 |  |
| 196 | ADRB1-VHH-8S2T.pdb | ADRB1 | ADRB1 | ADRB1, ADENYLATE CYCLASE-STIMULATING G ALPHA PROTEIN, G GAMMA-I, BETA-1 ADRENOCEPTOR, ADRB1R | HOMO SAPIENS | 8S2T |  |
| 197 | CTNNB1-Fab-8Y0G.pdb | CTNNB1 | CTNNB1 | CTNNB1, CATENIN BETA-1, BETA-CATENIN, OK/SW-CL.35, PRO2286 | HOMO SAPIENS | 8Y0G |  |
| 198 | SCNN1B-Fab-9BLR.pdb | SCNN1B | SCNN1B | SCNN1B, ISOFORM 1 OF AMILORIDE-SENSITIVE SODIUM CHANNEL SUBUNIT DELTA, DELTA-NACH, EPITHELIAL NA(+) CHANNEL SUBUNIT DELTA, DELTA- ENAC, NONVOLTAGE-GATED SODIUM CHANNEL 1 SUBUNIT DELTA, AMILORIDE-SENSITIVE SODIUM CHANNEL SUBUNIT BETA, EPITHELIAL NA(+) CHANNEL SUBUNIT BETA, NONVOLTAGE-GATED SODIUM CHANNEL 1 SUBUNIT BETA, AMILORIDE-SENSITIVE SODIUM CHANNEL SUBUNIT GAMMA, EPITHELIAL NA(+) CHANNEL SUBUNIT GAMMA, GAMMA-ENAC, GAMMA-NACH, NONVOLTAGE-GATED SODIUM CHANNEL 1 SUBUNIT GAMMA | HOMO SAPIENS | 9BLR |  |
| 199 | BEST1-Fab-9EGT.pdb | BEST1 | BEST1 | BEST1, BESTROPHIN-1, VITELLIFORM MACULAR DYSTROPHY PROTEIN 2 | HOMO SAPIENS | 9EGT |  |
| 200 | SLC6A3-Fab-9EO4.pdb | SLC6A3 | SLC6A3 | SLC6A3, SODIUM-DEPENDENT DOPAMINE TRANSPORTER, DA TRANSPORTER, SOLUTE CARRIER FAMILY 6 MEMBER 3 | HOMO SAPIENS | 9EO4 |  |
| 201 | CHRNA1-Fab-9GU3.pdb | CHRNA1 | CHRNA1 | CHRNA1, ACETYLCHOLINE RECEPTOR SUBUNIT ALPHA, ACETYLCHOLINE RECEPTOR SUBUNIT BETA, ACETYLCHOLINE RECEPTOR SUBUNIT DELTA | HOMO SAPIENS | 9GU3 |  |
| 202 | GNAI1-VHH-9ODM.pdb | GNAI1 | GNAI1 | GNAI1, ADENYLATE CYCLASE-INHIBITING G ALPHA PROTEIN, G GAMMA-I, MU-TYPE OPIOID RECEPTOR | HOMO SAPIENS | 9ODM |  |
| 203 | SCN5A-Fab-9P24.pdb | SCN5A | SCN5A | SCN5A, SODIUM CHANNEL PROTEIN TYPE 5 SUBUNIT ALPHA, SODIUM CHANNEL PROTEIN CARDIAC MUSCLE SUBUNIT ALPHA, SODIUM CHANNEL PROTEIN TYPE V SUBUNIT ALPHA, VOLTAGE-GATED SODIUM CHANNEL SUBUNIT ALPHA NAV1.5 | HOMO SAPIENS | 9P24 |  |
| 204 | NKX2-1-Fab-9U18.pdb | NKX2-1 | NKX2-1 | NKX2-1, CAAG-CONTAINING 12BP FORWARD STRAND, 12BP REVERSE COMPLEMENTARY, HOMEOBOX PROTEIN NKX-2.1, HOMEOBOX PROTEIN NK-2 HOMOLOG A, THYROID NUCLEAR FACTOR 1, THYROID TRANSCRIPTION FACTOR 1, THYROID-SPECIFIC ENHANCER- BINDING PROTEIN | HOMO SAPIENS | 9U18 |  |
| 205 | VETLIB-DOG-NGF-AF-A0A8I3PYI3.pdb | Canine NGF | NGF |  | Canis lupus familiaris | A0A8I3PYI3 |  |
| 206 | VETLIB-DOG-BDNF-AF-Q7YRB4.pdb | Canine BDNF | BDNF |  | Canis lupus familiaris | Q7YRB4 |  |
| 207 | VETLIB-DOG-NTF3-AF-A0A8I3QXQ5.pdb | Canine NTF3 | NTF3 |  | Canis lupus familiaris | A0A8I3QXQ5 |  |
| 208 | VETLIB-DOG-NTF4-AF-A0A8I3MVE7.pdb | Canine NTF4 | NTF4 |  | Canis lupus familiaris | A0A8I3MVE7 |  |
| 209 | VETLIB-DOG-IL6-AF-P41323.pdb | Canine IL-6 | IL6 |  | Canis lupus familiaris | P41323 |  |
| 210 | VETLIB-DOG-TNF-AF-P51742.pdb | Canine TNF | TNF |  | Canis lupus familiaris | P51742 |  |
| 211 | VETLIB-DOG-TSLP-AF-A0A8I3MRD5.pdb | Canine TSLP | TSLP |  | Canis lupus familiaris | A0A8I3MRD5 |  |
| 212 | VETLIB-DOG-IL13-AF-Q9N0W9.pdb | Canine IL-13 | IL13 |  | Canis lupus familiaris | Q9N0W9 |  |
| 213 | VETLIB-DOG-IL5-AF-Q95J76.pdb | Canine IL-5 | IL5 |  | Canis lupus familiaris | Q95J76 |  |
| 214 | VETLIB-DOG-IL1B-AF-Q28292.pdb | Canine IL-1 beta | IL1B |  | Canis lupus familiaris | Q28292 |  |
| 215 | VETLIB-NGF-TANEZUMAB-RCSB-4EDW.pdb | Human NGF | NGF |  | Homo sapiens | 4EDW |  |
| 216 | CANINE-NGF-Fab-01.pdb | Canine NGF | NGF |  | Canis lupus familiaris | A0A8I3PYI3 |  |
| 217 | CANINE-NGF-Fab-02.pdb | Canine NGF | NGF |  | Canis lupus familiaris | A0A8I3PYI3 |  |
| 218 | CANINE-NGF-Fab-03.pdb | Canine NGF | NGF |  | Canis lupus familiaris | A0A8I3PYI3 |  |
| 219 | CANINE-NGF-Fab-04.pdb | Canine NGF | NGF |  | Canis lupus familiaris | A0A8I3PYI3 |  |
| 220 | CANINE-NGF-Fab-05.pdb | Canine NGF | NGF |  | Canis lupus familiaris | A0A8I3PYI3 |  |
| 221 | CANINE-NGF-Fab-06.pdb | Canine NGF | NGF |  | Canis lupus familiaris | A0A8I3PYI3 |  |
| 222 | CANINE-NGF-Fab-07.pdb | Canine NGF | NGF |  | Canis lupus familiaris | A0A8I3PYI3 |  |
| 223 | CANINE-NGF-Fab-08.pdb | Canine NGF | NGF |  | Canis lupus familiaris | A0A8I3PYI3 |  |
| 224 | CANINE-NGF-Fab-09.pdb | Canine NGF | NGF |  | Canis lupus familiaris | A0A8I3PYI3 |  |
| 225 | CANINE-NGF-Fab-10.pdb | Canine NGF | NGF |  | Canis lupus familiaris | A0A8I3PYI3 |  |
| 226 | INFLAMLIB-HUMAN-IL6-RCSB-1ALU.pdb | IL-6 | IL6 | IL6, Interleukin-6 | Homo sapiens | 1ALU | asset_only |
| 227 | INFLAMLIB-HUMAN-IL6-FAB-RCSB-4ZS7.pdb | IL-6 | IL6 | IL6, Interleukin-6 | Homo sapiens | 4ZS7 | asset_only |
| 228 | ENDOCRINELIB-HUMAN-IGF1R-RCSB-7XGD.pdb | IGF1R | IGF1R | Insulin-like growth factor 1 receptor, IGF-1 receptor | Homo sapiens | 7XGD | asset_only |
| 229 | ENDOCRINELIB-HUMAN-IGF1R-FV-RCSB-5U8R.pdb | IGF1R | IGF1R | Insulin-like growth factor 1 receptor, IGF-1 receptor | Homo sapiens | 5U8R | asset_only |
| 230 | ENDOCRINELIB-HUMAN-GLP1R-RCSB-6LN2.pdb | GLP1R | GLP1R | GLP-1R, Glucagon-like peptide 1 receptor | Homo sapiens | 6LN2 | asset_only |
| 231 | METABOLIB-HUMAN-MSTN-FAB-RCSB-5F3H.pdb | Myostatin | GDF8 | GDF8, Growth/differentiation factor 8 | Homo sapiens | 5F3H | asset_only |
| 232 | METABOLIB-HUMAN-ACTRIIB-FV-RCSB-5NHR.pdb | ActRIIB | ACVR2B | ACVR2B, ACTRIIB, Activin receptor type-2B | Homo sapiens | 5NHR | asset_only |
| 233 | NEUROLIB-HUMAN-DAT-RCSB-9EO4.pdb | DAT | SLC6A3 |  | Homo sapiens | 9EO4 |  |
| 234 | NEUROLIB-HUMAN-TRKB-FAB-RCSB-5MO9.pdb | TrkB | NTRK2 | NTRK2, Tropomyosin receptor kinase B, Neurotrophic tyrosine kinase receptor type 2 | Homo sapiens | 5MO9 | asset_only |
| 235 | NEUROLIB-HUMAN-DRD4-RCSB-5WIU.pdb | DRD4 | DRD4 | D4 dopamine receptor, D(4) dopamine receptor, Dopamine receptor D4 | Homo sapiens | 5WIU | asset_only |
| 236 | DAT-Fab-01.pdb | DAT | SLC6A3 |  | Homo sapiens | 9EO4 |  |
| 237 | DAT-Fab-02.pdb | DAT | SLC6A3 |  | Homo sapiens | 9EO4 |  |
| 238 | DAT-Fab-03.pdb | DAT | SLC6A3 |  | Homo sapiens | 9EO4 |  |
| 239 | DAT-Fab-04.pdb | DAT | SLC6A3 |  | Homo sapiens | 9EO4 |  |
| 240 | DAT-Fab-05.pdb | DAT | SLC6A3 |  | Homo sapiens | 9EO4 |  |
| 241 | DAT-Fab-06.pdb | DAT | SLC6A3 |  | Homo sapiens | 9EO4 |  |
| 242 | DAT-Fab-07.pdb | DAT | SLC6A3 |  | Homo sapiens | 9EO4 |  |
| 243 | DAT-Fab-08.pdb | DAT | SLC6A3 |  | Homo sapiens | 9EO4 |  |
| 244 | DAT-Fab-09.pdb | DAT | SLC6A3 |  | Homo sapiens | 9EO4 |  |
| 245 | DAT-Fab-10.pdb | DAT | SLC6A3 |  | Homo sapiens | 9EO4 |  |
| 246 | NEUROLIB-HUMAN-TRKA-RCSB-1HE7.pdb | TrkA | NTRK1 | NTRK1 | Homo sapiens | 1HE7 | asset_only |
| 247 | NEUROLIB-HUMAN-TRKA-NGF-RCSB-2IFG.pdb | TrkA | NTRK1 | NTRK1 | Homo sapiens | 2IFG | asset_only |
| 248 | NEUROLIB-HUMAN-LRRK2-RCSB-7LHT.pdb | LRRK2 | LRRK2 | Leucine-rich repeat serine/threonine-protein kinase 2 | Homo sapiens | 7LHT | asset_only |
| 249 | NEUROLIB-HUMAN-GBA-RCSB-1OGS.pdb | GBA | GBA1 | GBA1, Glucocerebrosidase, Acid beta-glucosidase | Homo sapiens | 1OGS | asset_only |
| 250 | SOLIDLIB-HUMAN-FOLR1-RCSB-4KM6.pdb | FOLR1 | FOLR1 | Folate receptor alpha | Homo sapiens | 4KM6 | asset_only |
| 251 | SOLIDLIB-HUMAN-FOLR1-RCSB-4KM7.pdb | FOLR1 | FOLR1 | Folate receptor alpha | Homo sapiens | 4KM7 | asset_only |
| 252 | SOLIDLIB-HUMAN-FOLR1-RCSB-4KMX.pdb | FOLR1 | FOLR1 | Folate receptor alpha | Homo sapiens | 4KMX | asset_only |
| 253 | SOLIDLIB-HUMAN-MSLN-FAB-RCSB-4F3F.pdb | Mesothelin | MSLN | MSLN | Homo sapiens | 4F3F | asset_only |
| 254 | SOLIDLIB-HUMAN-MSLN-VH-RCSB-8FSL.pdb | Mesothelin | MSLN | MSLN | Homo sapiens | 8FSL | asset_only |
| 255 | SOLIDLIB-HUMAN-CEACAM6-RCSB-4WHC.pdb | CEACAM6 | CEACAM6 |  | Homo sapiens | 4WHC | asset_only |
| 256 | SOLIDLIB-HUMAN-PSMA-VHH-RCSB-9HLW.pdb | PSMA | FOLH1 | FOLH1, Prostate-specific membrane antigen | Homo sapiens | 9HLW | asset_only |
| 257 | SOLIDLIB-HUMAN-PSMA-VHH-RCSB-9HVI.pdb | PSMA | FOLH1 | FOLH1, Prostate-specific membrane antigen | Homo sapiens | 9HVI | asset_only |
| 258 | SOLIDLIB-HUMAN-PSMA-VHH-RCSB-9HVL.pdb | PSMA | FOLH1 | FOLH1, Prostate-specific membrane antigen | Homo sapiens | 9HVL | asset_only |
| 259 | SOLIDLIB-HUMAN-PSMA-VHH-RCSB-9HVK.pdb | PSMA | FOLH1 | FOLH1, Prostate-specific membrane antigen | Homo sapiens | 9HVK | asset_only |
| 260 | SOLIDLIB-HUMAN-GPC3-RCSB-9NTQ.pdb | GPC3 | GPC3 | Glypican-3 | Homo sapiens | 9NTQ | asset_only |
| 261 | SOLIDLIB-HUMAN-GPC3-RCSB-9NTT.pdb | GPC3 | GPC3 | Glypican-3 | Homo sapiens | 9NTT | asset_only |
| 262 | SOLIDLIB-HUMAN-CAIX-RCSB-6FE2.pdb | CAIX | CA9 | CA9, Carbonic anhydrase IX | Homo sapiens | 6FE2 | asset_only |
| 263 | SOLIDLIB-HUMAN-EPCAM-SCFV-RCSB-6I07.pdb | EpCAM | EPCAM | EPCAM, TACSTD1 | Homo sapiens | 6I07 | asset_only |
| 264 | SOLIDLIB-HUMAN-B7H4-RCSB-4GOS.pdb | B7-H4 | VTCN1 | VTCN1 | Homo sapiens | 4GOS | asset_only |
| 265 | SOLIDLIB-HUMAN-MET-FAB-RCSB-6I04.pdb | MET | MET | MET receptor, HGF receptor, Hepatocyte growth factor receptor | Homo sapiens | 6I04 | asset_only |
| 266 | SOLIDLIB-HUMAN-HER3-FAB-RCSB-7D85.pdb | HER3 | ERBB3 | ERBB3, ErbB3, HER3, Receptor tyrosine-protein kinase erbB-3 | Homo sapiens | 7D85 | asset_only |
| 267 | SOLIDLIB-HUMAN-FGFR3-FAB-RCSB-3GRW.pdb | FGFR3 | FGFR3 | Fibroblast growth factor receptor 3 | Homo sapiens | 3GRW | asset_only |
| 268 | SOLIDLIB-HUMAN-FGFR2-FAB-RCSB-4WV1.pdb | FGFR2 | FGFR2 | Fibroblast growth factor receptor 2, FGFR2b | Homo sapiens | 4WV1 | asset_only |
| 269 | SOLIDLIB-HUMAN-CD70-RCSB-7KX0.pdb | CD70 | TNFSF7 | TNFSF7, CD27 ligand | Homo sapiens | 7KX0 | asset_only |
| 270 | BONELIB-HUMAN-SOST-RCSB-2K8P.pdb | SOST | SOST | Sclerostin | Homo sapiens | 2K8P | asset_only |
| 271 | BONELIB-HUMAN-SOST-LRP6-RCSB-6L6R.pdb | SOST | SOST | Sclerostin | Homo sapiens | 6L6R | asset_only |
| 272 | BONELIB-HUMAN-DKK1-RCSB-5GJE.pdb | DKK1 | DKK1 | Dickkopf-related protein 1 | Homo sapiens | 5GJE | asset_only |
| 273 | BONELIB-HUMAN-RANKL-RCSB-3URF.pdb | RANKL | TNFSF11 | TNFSF11, TRANCE, Receptor activator of nuclear factor kappa-B ligand | Homo sapiens | 3URF | asset_only |
