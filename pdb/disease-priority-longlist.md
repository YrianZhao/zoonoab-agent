# Disease Priority Longlist

用于后续逐病种选择一个主靶点的工作底稿。该文件不是 route-backed 结构库真源，也不会自动改变现有本地 PDB 路由。

## Method

- Core layer: WHO Global Health Estimates 2021 global DALYs, using disease-like causes that can be ranked directly by burden.
- Extension layer: WHO ICD-11 MMS 2025-01 simple tabulation, expanded under major disease chapters to reach 1000 entries after removing overly broad buckets, injuries, perinatal or pregnancy bookkeeping rows, oral or device-related rows, and other poor target-scouting terms.
- Local-coverage filter: obvious diseases already covered by the current local disease directions were excluded from this list so later target-search work can focus on gaps first.
- Ranking note: the WHO GHE core keeps exact burden order; the ICD-11 extension is a curated follow-up backlog rather than a literal global incidence ranking across all remaining diseases.
- Granularity control: ICD-11 expansion is limited to depth-1 disease categories to avoid over-fragmented complication or manifestation rows.

## Sources

- WHO GHE 2021 DALY workbook: [https://cdn.who.int/media/docs/default-source/gho-documents/global-health-estimates/ghe2021_daly_global_new.xlsx?sfvrsn=cbefe871_3](https://cdn.who.int/media/docs/default-source/gho-documents/global-health-estimates/ghe2021_daly_global_new.xlsx?sfvrsn=cbefe871_3)
- WHO ICD-11 MMS simple tabulation 2025-01: [https://icdcdn.who.int/static/releasefiles/2025-01/SimpleTabulation-ICD-11-MMS-en.zip](https://icdcdn.who.int/static/releasefiles/2025-01/SimpleTabulation-ICD-11-MMS-en.zip)
- WHO ICD landing page: [International Classification of Diseases (ICD)](https://www.who.int/standards/classifications/classification-of-diseases)

## Longlist (1000 items)

| # | Disease | Source tier | Priority basis | Reference |
| --- | --- | --- | --- | --- |
| 1 | Ischaemic heart disease | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 2 | Stroke | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 3 | Lower respiratory infections | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 4 | Preterm birth complications | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 5 | Haemorrhagic stroke | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 6 | Chronic obstructive pulmonary disease | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 7 | Diarrhoeal diseases | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 8 | Ischaemic stroke | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 9 | Tuberculosis | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 10 | Birth asphyxia and birth trauma | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 11 | Malaria | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 12 | Cirrhosis of the liver | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 13 | Anxiety disorders | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 14 | HIV/AIDS | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 15 | Iron-deficiency anaemia | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 16 | Hypertensive heart disease | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 17 | Congenital heart anomalies | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 18 | Neonatal sepsis and infections | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 19 | Drug use disorders | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 20 | Alcohol use disorders | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 21 | Meningitis | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 22 | Schizophrenia | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 23 | Epilepsy | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 24 | Rheumatic heart disease | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 25 | Oesophagus cancer | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 26 | Cardiomyopathy, myocarditis, endocarditis | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 27 | Opioid use disorders | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 28 | Cirrhosis due to alcohol use | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 29 | Mouth and oropharynx cancers | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 30 | Protein-energy malnutrition | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 31 | Austism and Asperger syndrome | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 32 | Cirrhosis due to hepatitis B | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 33 | Cirrhosis due to hepatitis C | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 34 | Brain and nervous system cancers | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 35 | Bipolar disorder | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 36 | Paralytic ileus and intestinal obstruction | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 37 | Cataracts | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 38 | Peptic ulcer disease | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 39 | Syphilis | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 40 | Upper respiratory infections | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 41 | Whooping cough | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 42 | Conduct disorder | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 43 | Neural tube defects | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 44 | Sickle cell disorders and trait | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 45 | Encephalitis | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 46 | Pancreatitis | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 47 | Idiopathic intellectual disability | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 48 | Gallbladder and biliary tract cancer | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 49 | Eating disorders | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 50 | Melanoma and other skin cancers | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 51 | Larynx cancer | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 52 | Rheumatoid arthritis | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 53 | Gastritis and duodenitis | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 54 | Thalassaemias | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 55 | Corpus uteri cancer | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 56 | Rabies | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 57 | Otitis media | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 58 | Sudden infant death syndrome | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 59 | Intestinal nematode infections | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 60 | Iodine deficiency | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 61 | Down syndrome | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 62 | Acute hepatitis B | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 63 | Amphetamine use disorders | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 64 | Acute hepatitis A | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 65 | Schistosomiasis | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 66 | Gout | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 67 | Dengue | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 68 | Malignant skin melanoma | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 69 | Non-melanoma skin cancer | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 70 | Tetanus | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 71 | Cocaine use disorders | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 72 | Thyroid cancer | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 73 | Appendicitis | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 74 | lymphatic filariasis | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 75 | Onchocerciasis | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 76 | Vitamin A deficiency | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 77 | Cysticercosis | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 78 | Multiple sclerosis | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 79 | Food-borne trematodes | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 80 | Leishmaniasis | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 81 | Glaucoma | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 82 | Ascariasis | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 83 | Cannabis use disorders | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 84 | Urolithiasis | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 85 | Macular degeneration | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 86 | Echinococcosis | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 87 | Testicular cancer | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 88 | Acute hepatitis C | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 89 | Hookworm disease | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 90 | Yellow fever | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 91 | Cleft lip and cleft palate | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 92 | Diphtheria | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 93 | Acute glomerulonephritis | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 94 | Trichomoniasis | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 95 | Gential Herpes | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 96 | Acute hepatitis E | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 97 | Chagas disease | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 98 | Trichuriasis | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 99 | Chlamydia | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 100 | Trachoma | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 101 | Gonorrhoea | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 102 | Trypanosomiasis | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 103 | Leprosy | WHO GHE 2021 core | Exact global DALY ordering | WHO GHE 2021 |
| 104 | Cholera | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1A00 |
| 105 | Intestinal infection due to other Vibrio | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1A01 |
| 106 | Intestinal infections due to Shigella | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1A02 |
| 107 | Intestinal infections due to Escherichia coli | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1A03 |
| 108 | Essential hypertension | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BA00 |
| 109 | Hypertensive renal disease | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BA02 |
| 110 | Angina pectoris | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BA40 |
| 111 | Hypothyroidism | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5A00 |
| 112 | Nontoxic goitre | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5A01 |
| 113 | Autism spectrum disorder | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6A02 |
| 114 | Stereotyped movement disorder | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6A06 |
| 115 | Direct infections of joint | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the musculoskeletal system or connective tissue | ICD-11 FA10 |
| 116 | Infectious spondyloarthritis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the musculoskeletal system or connective tissue | ICD-11 FA13 |
| 117 | Acute nasopharyngitis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the respiratory system | ICD-11 CA00 |
| 118 | Chronic rhinosinusitis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the respiratory system | ICD-11 CA0A |
| 119 | Choreiform disorders | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8A01 |
| 120 | Dystonic disorders | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8A02 |
| 121 | Oesophagitis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DA24 |
| 122 | Oesophageal ulcer | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DA25 |
| 123 | Primary neoplasms of brain | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2A00 |
| 124 | Primary neoplasms of meninges | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2A01 |
| 125 | Megaloblastic anaemia due to vitamin B12 deficiency | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the blood or blood-forming organs | ICD-11 3A01 |
| 126 | Primary immunodeficiencies due to disorders of innate immunity | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the immune system | ICD-11 4A00 |
| 127 | Necrolytic acral erythema | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the skin | ICD-11 EA20 |
| 128 | Intestinal infections due to Clostridioides difficile | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1A04 |
| 129 | Intestinal infections due to Yersinia enterocolitica | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1A05 |
| 130 | Gastroenteritis due to Campylobacter | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1A06 |
| 131 | Typhoid fever | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1A07 |
| 132 | Acute myocardial infarction | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BA41 |
| 133 | Subsequent myocardial infarction | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BA42 |
| 134 | Coronary thrombosis not resulting in myocardial infarction | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BA43 |
| 135 | Thyrotoxicosis | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5A02 |
| 136 | Thyroiditis | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5A03 |
| 137 | Schizoaffective disorder | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6A21 |
| 138 | Schizotypal disorder | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6A22 |
| 139 | Psoriatic arthritis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the musculoskeletal system or connective tissue | ICD-11 FA21 |
| 140 | Polymyalgia rheumatica | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the musculoskeletal system or connective tissue | ICD-11 FA22 |
| 141 | Chronic laryngitis or laryngotracheitis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the respiratory system | ICD-11 CA0G |
| 142 | Acute sinusitis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the respiratory system | ICD-11 CA01 |
| 143 | Ataxic disorders | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8A03 |
| 144 | Disorders associated with tremor | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8A04 |
| 145 | Vascular disorders of the oesophagus | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DA26 |
| 146 | Gastroduodenal motor or secretory disorders | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DA41 |
| 147 | Primary neoplasm of spinal cord, cranial nerves, paraspinal nerves or remaining parts of central nervous system | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2A02 |
| 148 | Non mast cell myeloproliferative neoplasms | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2A20 |
| 149 | Folate deficiency anaemia | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the blood or blood-forming organs | ICD-11 3A02 |
| 150 | Primary immunodeficiencies due to disorders of adaptive immunity | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the immune system | ICD-11 4A01 |
| 151 | Tropical phagedaenic ulcer | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the skin | ICD-11 EA40 |
| 152 | Paratyphoid fever | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1A08 |
| 153 | Infections due to other Salmonella | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1A09 |
| 154 | Botulism | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1A11 |
| 155 | Enteritis due to Adenovirus | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1A20 |
| 156 | Old myocardial infarction | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BA50 |
| 157 | Ischaemic cardiomyopathy | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BA51 |
| 158 | Coronary atherosclerosis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BA52 |
| 159 | Sick-euthyroid syndrome | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5A06 |
| 160 | Hypoparathyroidism | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5A50 |
| 161 | Acute and transient psychotic disorder | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6A23 |
| 162 | Delusional disorder | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6A24 |
| 163 | Adult-onset Still disease | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the musculoskeletal system or connective tissue | ICD-11 FA23 |
| 164 | Juvenile idiopathic arthritis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the musculoskeletal system or connective tissue | ICD-11 FA24 |
| 165 | Acute pharyngitis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the respiratory system | ICD-11 CA02 |
| 166 | Acute tonsillitis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the respiratory system | ICD-11 CA03 |
| 167 | Tic disorders | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8A05 |
| 168 | Myoclonic disorders | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8A06 |
| 169 | Vascular disorders of the stomach | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DA43 |
| 170 | Gastric polyp | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DA44 |
| 171 | Mastocytosis | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2A21 |
| 172 | Refractory anaemia | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2A30 |
| 173 | Hereditary haemolytic anaemia | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the blood or blood-forming organs | ICD-11 3A10 |
| 174 | Acquired immunodeficiencies | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the immune system | ICD-11 4A20 |
| 175 | Toxin-mediated cutaneous reactions to distant or systemic bacterial infection | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the skin | ICD-11 EA50 |
| 176 | Gastroenteritis due to Astrovirus | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1A21 |
| 177 | Gastroenteritis due to Rotavirus | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1A22 |
| 178 | Enteritis due to Norovirus | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1A23 |
| 179 | Intestinal infections due to Cytomegalovirus | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1A24 |
| 180 | Coronary artery aneurysm | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BA81 |
| 181 | Coronary artery dissection | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BA82 |
| 182 | Coronary artery fistula, acquired | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BA83 |
| 183 | Hyperparathyroidism | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5A51 |
| 184 | Hyperfunction of pituitary gland | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5A60 |
| 185 | Catatonia associated with another mental disorder | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6A40 |
| 186 | Catatonia induced by substances or medications | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6A41 |
| 187 | Internal derangement of knee | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the musculoskeletal system or connective tissue | ICD-11 FA33 |
| 188 | Effusion of joint | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the musculoskeletal system or connective tissue | ICD-11 FA36 |
| 189 | Acute laryngopharyngitis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the respiratory system | ICD-11 CA04 |
| 190 | Acute laryngitis or tracheitis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the respiratory system | ICD-11 CA05 |
| 191 | Progressive focal atrophies | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8A21 |
| 192 | Lewy body disease | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8A22 |
| 193 | Duodenitis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DA51 |
| 194 | Vascular disorders of the duodenum | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DA52 |
| 195 | Refractory neutropaenia | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2A31 |
| 196 | Refractory thrombocytopenia | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2A32 |
| 197 | Acquired haemolytic anaemia, immune | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the blood or blood-forming organs | ICD-11 3A20 |
| 198 | Idiopathic inflammatory myopathy | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the immune system | ICD-11 4A41 |
| 199 | Skin complications of BCG immunisation | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the skin | ICD-11 EA51 |
| 200 | Infections due to Balantidium coli | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1A30 |
| 201 | Giardiasis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1A31 |
| 202 | Cryptosporidiosis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1A32 |
| 203 | Cystoisosporiasis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1A33 |
| 204 | Coronary vasospastic disease | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BA85 |
| 205 | Coronary microvascular disease | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BA86 |
| 206 | Pulmonary thromboembolism | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BB00 |
| 207 | Cushing syndrome | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5A70 |
| 208 | Adrenogenital disorders | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5A71 |
| 209 | Bipolar type I disorder | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6A60 |
| 210 | Bipolar type II disorder | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6A61 |
| 211 | Spinal deformities | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the musculoskeletal system or connective tissue | ICD-11 FA70 |
| 212 | Torticollis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the musculoskeletal system or connective tissue | ICD-11 FA71 |
| 213 | Acute obstructive laryngitis or epiglottitis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the respiratory system | ICD-11 CA06 |
| 214 | Vasomotor or allergic rhinitis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the respiratory system | ICD-11 CA08 |
| 215 | Isolated demyelinating syndromes of the central nervous system | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8A41 |
| 216 | Acute disseminated encephalomyelitis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8A42 |
| 217 | Duodenal polyp | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DA53 |
| 218 | Gastric ulcer | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DA60 |
| 219 | Refractory anaemia with ring sideroblasts | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2A33 |
| 220 | Refractory cytopenia with multi-lineage dysplasia | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2A34 |
| 221 | Acquired haemolytic anaemia, non-immune | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the blood or blood-forming organs | ICD-11 3A21 |
| 222 | Systemic sclerosis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the immune system | ICD-11 4A42 |
| 223 | Certain skin disorders attributable to fungal infection | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the skin | ICD-11 EA60 |
| 224 | Sarcocystosis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1A34 |
| 225 | Blastocystosis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1A35 |
| 226 | Amoebiasis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1A36 |
| 227 | Congenital syphilis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1A60 |
| 228 | Pulmonary hypertension | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BB01 |
| 229 | Acquired pulmonary venous abnormality | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BB03 |
| 230 | Chronic rheumatic pericarditis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BB21 |
| 231 | Hyperaldosteronism | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5A72 |
| 232 | Hypoaldosteronism | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5A73 |
| 233 | Cyclothymic disorder | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6A62 |
| 234 | Dysthymic disorder | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6A72 |
| 235 | Intervertebral disc degeneration | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the musculoskeletal system or connective tissue | ICD-11 FA80 |
| 236 | Spondylolysis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the musculoskeletal system or connective tissue | ICD-11 FA81 |
| 237 | Chronic rhinitis, nasopharyngitis or pharyngitis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the respiratory system | ICD-11 CA09 |
| 238 | Bronchitis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the respiratory system | ICD-11 CA20 |
| 239 | Leukodystrophies | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8A44 |
| 240 | Central demyelination of corpus callosum | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8A46 |
| 241 | Anastomotic ulcer | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DA62 |
| 242 | Duodenal ulcer | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DA63 |
| 243 | Refractory anaemia with excess of blasts | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2A35 |
| 244 | Myelodysplastic syndrome with isolated del(5q) | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2A36 |
| 245 | Sickle cell disorders or other haemoglobinopathies | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the blood or blood-forming organs | ICD-11 3A51 |
| 246 | Overlap or undifferentiated nonorgan specific systemic autoimmune disease | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the immune system | ICD-11 4A43 |
| 247 | Atopic eczema | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the skin | ICD-11 EA80 |
| 248 | Early syphilis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1A61 |
| 249 | Late syphilis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1A62 |
| 250 | Gonococcal genitourinary infection | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1A70 |
| 251 | Gonococcal pelviperitonitis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1A71 |
| 252 | Constrictive pericarditis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BB22 |
| 253 | Cardiac tamponade | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BB23 |
| 254 | Haemopericardium | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BB24 |
| 255 | Adrenocortical insufficiency | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5A74 |
| 256 | Adrenomedullary hyperfunction | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5A75 |
| 257 | Mixed depressive and anxiety disorder | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6A73 |
| 258 | Symptomatic and course presentations for mood episodes in mood disorders | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6A80 |
| 259 | Spinal stenosis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the musculoskeletal system or connective tissue | ICD-11 FA82 |
| 260 | Spinal endplate defects | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the musculoskeletal system or connective tissue | ICD-11 FA85 |
| 261 | Emphysema | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the respiratory system | ICD-11 CA21 |
| 262 | Bronchiectasis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the respiratory system | ICD-11 CA24 |
| 263 | Epilepsy due to structural or metabolic conditions or diseases | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8A60 |
| 264 | Genetic or presumed genetic syndromes primarily expressed as epilepsy | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8A61 |
| 265 | Obstruction of small intestine | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DA91 |
| 266 | Motility disorders of small intestine | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DA93 |
| 267 | Myelodysplastic syndrome, unclassifiable | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2A37 |
| 268 | Refractory cytopenia of childhood | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2A38 |
| 269 | Congenital pure red cell aplasia | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the blood or blood-forming organs | ICD-11 3A60 |
| 270 | Vasculitis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the immune system | ICD-11 4A44 |
| 271 | Seborrhoeic dermatitis and related conditions | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the skin | ICD-11 EA81 |
| 272 | Gonococcal infection of other sites | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1A72 |
| 273 | Disseminated gonococcal infection | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1A73 |
| 274 | Chlamydial lymphogranuloma | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1A80 |
| 275 | Non-ulcerative sexually transmitted chlamydial infection | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1A81 |
| 276 | Pericardial effusion | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BB25 |
| 277 | Myoendocarditis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BB41 |
| 278 | Periendocarditis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BB42 |
| 279 | Disorder of puberty due to oestrogen resistance | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5A90 |
| 280 | Delayed puberty | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5A91 |
| 281 | Generalised anxiety disorder | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6B00 |
| 282 | Panic disorder | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6B01 |
| 283 | Infection of vertebra | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the musculoskeletal system or connective tissue | ICD-11 FA90 |
| 284 | Infection of intervertebral disc | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the musculoskeletal system or connective tissue | ICD-11 FA91 |
| 285 | Cystic fibrosis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the respiratory system | ICD-11 CA25 |
| 286 | Chronic bronchiolitis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the respiratory system | ICD-11 CA26 |
| 287 | Epileptic encephalopathies | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8A62 |
| 288 | Single unprovoked seizure | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8A65 |
| 289 | Noninfectious enteritis or ulcer of small intestine | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DA94 |
| 290 | Coeliac disease | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DA95 |
| 291 | Refractory anaemia with ring sideroblasts associated with marked thrombocytosis | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2A43 |
| 292 | Myeloproliferative and myelodysplastic disease, unclassifiable | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2A44 |
| 293 | Acquired pure red cell aplasia | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the blood or blood-forming organs | ICD-11 3A61 |
| 294 | Monogenic autoinflammatory syndromes | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the immune system | ICD-11 4A60 |
| 295 | Nummular dermatitis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the skin | ICD-11 EA82 |
| 296 | Chancroid | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1A90 |
| 297 | Granuloma inguinale | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1A91 |
| 298 | Sexually transmissible infestations | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1A93 |
| 299 | Anogenital herpes simplex infection | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1A94 |
| 300 | Mitral valve stenosis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BB60 |
| 301 | Mitral valve insufficiency | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BB61 |
| 302 | Mitral valve prolapse | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BB62 |
| 303 | Peripheral precocious puberty | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5A92 |
| 304 | Autoimmune polyendocrinopathy | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5B00 |
| 305 | Agoraphobia | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6B02 |
| 306 | Specific phobia | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6B03 |
| 307 | Inflammatory spondyloarthritis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the musculoskeletal system or connective tissue | ICD-11 FA92 |
| 308 | Ankylosis of spinal joint | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the musculoskeletal system or connective tissue | ICD-11 FB00 |
| 309 | Tracheobronchitis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the respiratory system | ICD-11 CA27 |
| 310 | Pneumonia | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the respiratory system | ICD-11 CA40 |
| 311 | Status epilepticus | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8A66 |
| 312 | Acute repetitive seizures | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8A67 |
| 313 | Intestinal malabsorption or protein-losing enteropathy | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DA96 |
| 314 | Certain vascular disorders of small intestine | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DA97 |
| 315 | Myeloid/lymphoid neoplasm associated with PDGFRA rearrangement | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2A50 |
| 316 | Myeloid neoplasm associated with PDGFRB rearrangement | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2A51 |
| 317 | Aplastic anaemia | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the blood or blood-forming organs | ICD-11 3A70 |
| 318 | SAPHO syndrome | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the immune system | ICD-11 4A61 |
| 319 | Lichen simplex or lichenification | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the skin | ICD-11 EA83 |
| 320 | Anogenital warts | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1A95 |
| 321 | Extraintestinal yersiniosis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1B9A |
| 322 | Tuberculosis of the respiratory system | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1B10 |
| 323 | Tuberculosis of the nervous system | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1B11 |
| 324 | Mitral valve stenosis with insufficiency | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BB63 |
| 325 | Mitral valvar abscess | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BB64 |
| 326 | Mitral valve rupture | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BB65 |
| 327 | Polyglandular hyperfunction | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5B01 |
| 328 | Vitamin B1 deficiency | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5B5A |
| 329 | Social anxiety disorder | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6B04 |
| 330 | Separation anxiety disorder | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6B05 |
| 331 | Spinal instabilities | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the musculoskeletal system or connective tissue | ICD-11 FB10 |
| 332 | Infectious myositis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the musculoskeletal system or connective tissue | ICD-11 FB30 |
| 333 | Acute bronchiolitis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the respiratory system | ICD-11 CA41 |
| 334 | Acute bronchitis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the respiratory system | ICD-11 CA42 |
| 335 | Tension-type headache | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8A81 |
| 336 | Trigeminal autonomic cephalalgias | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8A82 |
| 337 | Polyps of small intestine | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DA98 |
| 338 | Obstruction of large intestine | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DB30 |
| 339 | Myeloid or lymphoid neoplasms with FGFR1 abnormalities | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2A52 |
| 340 | Precursor B-lymphoblastic neoplasms | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2A70 |
| 341 | Sideroblastic anaemia | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the blood or blood-forming organs | ICD-11 3A72 |
| 342 | Behçet disease | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the immune system | ICD-11 4A62 |
| 343 | Asteatotic eczema | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the skin | ICD-11 EA84 |
| 344 | Tuberculosis of other systems and organs | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1B12 |
| 345 | Miliary tuberculosis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1B13 |
| 346 | Latent tuberculosis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1B14 |
| 347 | Infections due to non-tuberculous mycobacteria | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1B21 |
| 348 | Aortic valve stenosis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BB70 |
| 349 | Aortic valve stenosis with insufficiency | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BB72 |
| 350 | Aortic valvar abscess | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BB73 |
| 351 | Vitamin B2 deficiency | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5B5B |
| 352 | Vitamin B3 deficiency | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5B5C |
| 353 | Selective mutism | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6B06 |
| 354 | Obsessive-compulsive disorder | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6B20 |
| 355 | Calcification or ossification of muscle | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the musculoskeletal system or connective tissue | ICD-11 FB31 |
| 356 | Tenosynovitis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the musculoskeletal system or connective tissue | ICD-11 FB40 |
| 357 | Pyothorax | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the respiratory system | ICD-11 CA44 |
| 358 | Pneumoconiosis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the respiratory system | ICD-11 CA60 |
| 359 | Painful cranial neuropathies or other facial pains | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8A85 |
| 360 | Intracerebral haemorrhage | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8B00 |
| 361 | Motility disorders of large intestine | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DB32 |
| 362 | Certain noninfectious colitis or proctitis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DB33 |
| 363 | Precursor T-lymphoblastic neoplasms | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2A71 |
| 364 | Mature B-cell neoplasm with leukaemic behaviour | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2A82 |
| 365 | Congenital dyserythropoietic anaemia | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the blood or blood-forming organs | ICD-11 3A73 |
| 366 | Allergic or hypersensitivity disorders involving the respiratory tract | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the immune system | ICD-11 4A80 |
| 367 | Dermatitis or eczema of hands or feet | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the skin | ICD-11 EA85 |
| 368 | Acute rheumatic fever without mention of heart involvement | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1B40 |
| 369 | Acute rheumatic fever with heart involvement | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1B41 |
| 370 | Rheumatic chorea | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1B42 |
| 371 | Scarlet fever | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1B50 |
| 372 | Aortic valvar prolapse | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BB74 |
| 373 | Tricuspid valve stenosis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BB80 |
| 374 | Tricuspid valve insufficiency | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BB81 |
| 375 | Vitamin B6 deficiency | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5B5D |
| 376 | Folate deficiency | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5B5E |
| 377 | Body dysmorphic disorder | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6B21 |
| 378 | Olfactory reference disorder | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6B22 |
| 379 | Spontaneous rupture of synovium or tendon | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the musculoskeletal system or connective tissue | ICD-11 FB41 |
| 380 | Bursitis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the musculoskeletal system or connective tissue | ICD-11 FB50 |
| 381 | Hypersensitivity pneumonitis due to organic dust | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the respiratory system | ICD-11 CA70 |
| 382 | Pneumonitis due to solids or liquids | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the respiratory system | ICD-11 CA71 |
| 383 | Subarachnoid haemorrhage | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8B01 |
| 384 | Nontraumatic subdural haemorrhage | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8B02 |
| 385 | Certain vascular disorders of large intestine | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DB34 |
| 386 | Polyp of large intestine | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DB35 |
| 387 | Plasma cell neoplasms | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2A83 |
| 388 | Heavy chain diseases or malignant immunoproliferative diseases | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2A84 |
| 389 | Congenital polycythaemia | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the blood or blood-forming organs | ICD-11 3A80 |
| 390 | Allergic or hypersensitivity disorders involving the eye | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the immune system | ICD-11 4A81 |
| 391 | Dermatitis or eczema of lower legs | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the skin | ICD-11 EA86 |
| 392 | Streptococcal pharyngitis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1B51 |
| 393 | Meningitis due to Streptococcus | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1B53 |
| 394 | Meningitis due to Staphylococcus | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1B54 |
| 395 | Bacterial cellulitis, erysipelas or lymphangitis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1B70 |
| 396 | Tricuspid valve stenosis with insufficiency | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BB82 |
| 397 | Tricuspid valvular abscess | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BB83 |
| 398 | Tricuspid valve rupture | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BB84 |
| 399 | Vitamin B12 deficiency | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5B5F |
| 400 | Biotin deficiency | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5B5G |
| 401 | Hypochondriasis | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6B23 |
| 402 | Hoarding disorder | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6B24 |
| 403 | Fibroblastic disorders | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the musculoskeletal system or connective tissue | ICD-11 FB51 |
| 404 | Shoulder lesions | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the musculoskeletal system or connective tissue | ICD-11 FB53 |
| 405 | Mendelson syndrome | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the respiratory system | ICD-11 CA72 |
| 406 | Airway disease due to specific organic dust | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the respiratory system | ICD-11 CA80 |
| 407 | Nontraumatic epidural haemorrhage | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8B03 |
| 408 | Transient ischaemic attack | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8B10 |
| 409 | Certain infections of the large intestine | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DB36 |
| 410 | Fissure or fistula of anal regions | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DB50 |
| 411 | Mycosis fungoides | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2B01 |
| 412 | Sézary syndrome | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2B02 |
| 413 | Acquired polycythaemia | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the blood or blood-forming organs | ICD-11 3A81 |
| 414 | Allergic or hypersensitivity disorders involving skin or mucous membranes | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the immune system | ICD-11 4A82 |
| 415 | Dermatitis or eczema of anogenital region | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the skin | ICD-11 EA87 |
| 416 | Necrotising fasciitis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1B71 |
| 417 | Impetigo | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1B72 |
| 418 | Ecthyma | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1B73 |
| 419 | Superficial bacterial folliculitis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1B74 |
| 420 | Pulmonary valve stenosis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BB90 |
| 421 | Pulmonary valve insufficiency | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BB91 |
| 422 | Pulmonary valve stenosis with insufficiency | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BB92 |
| 423 | Pantothenic acid deficiency | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5B5H |
| 424 | Choline deficiency | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5B5J |
| 425 | Body-focused repetitive behaviour disorders | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6B25 |
| 426 | Post traumatic stress disorder | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6B40 |
| 427 | Enthesopathies of lower limb | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the musculoskeletal system or connective tissue | ICD-11 FB54 |
| 428 | Chondropathies | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the musculoskeletal system or connective tissue | ICD-11 FB82 |
| 429 | Respiratory conditions due to inhalation of chemicals, gases, fumes or vapours | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the respiratory system | ICD-11 CA81 |
| 430 | Respiratory conditions due to other external agents | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the respiratory system | ICD-11 CA82 |
| 431 | Cerebral ischaemic stroke | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8B11 |
| 432 | Stroke not known if ischaemic or haemorrhagic | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8B20 |
| 433 | Stenosis of anal canal | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DB51 |
| 434 | Ulcer of anus | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DB52 |
| 435 | Primary cutaneous CD30-positive T-cell lymphoproliferative disorders | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2B03 |
| 436 | Synovial sarcoma, primary site | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2B5A |
| 437 | Anaemia due to acute disease | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the blood or blood-forming organs | ICD-11 3A90 |
| 438 | Allergic or hypersensitivity disorders involving the gastrointestinal tract | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the immune system | ICD-11 4A83 |
| 439 | Lichen planus | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the skin | ICD-11 EA91 |
| 440 | Rat-bite fevers | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1B90 |
| 441 | Leptospirosis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1B91 |
| 442 | Glanders | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1B92 |
| 443 | Plague | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1B93 |
| 444 | Pulmonary valvar abscess | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BB93 |
| 445 | Multiple valve disease | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BC00 |
| 446 | Acquired abnormality of congenitally malformed valve | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BC02 |
| 447 | Mineral deficiencies | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5B5K |
| 448 | Carcinoid syndrome | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5B10 |
| 449 | Complex post traumatic stress disorder | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6B41 |
| 450 | Prolonged grief disorder | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6B42 |
| 451 | Low bone mass disorders | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the musculoskeletal system or connective tissue | ICD-11 FB83 |
| 452 | Osteomyelitis or osteitis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the musculoskeletal system or connective tissue | ICD-11 FB84 |
| 453 | Acute respiratory distress syndrome | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the respiratory system | ICD-11 CB00 |
| 454 | Pulmonary oedema | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the respiratory system | ICD-11 CB01 |
| 455 | Cerebrovascular disease with no acute cerebral symptom | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8B21 |
| 456 | Hypoxic-ischaemic encephalopathy | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8B24 |
| 457 | Anal prolapse | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DB53 |
| 458 | Haemorrhoids | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DB60 |
| 459 | Gastrointestinal stromal tumour, primary site | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2B5B |
| 460 | Endometrial stromal sarcoma, primary site | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2B5C |
| 461 | Congenital methaemoglobinaemia | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the blood or blood-forming organs | ICD-11 3A91 |
| 462 | Anaphylaxis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the immune system | ICD-11 4A84 |
| 463 | Lichenoid dermatoses | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the skin | ICD-11 EA92 |
| 464 | Tularaemia | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1B94 |
| 465 | Brucellosis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1B95 |
| 466 | Erysipeloid | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1B96 |
| 467 | Anthrax | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1B97 |
| 468 | Acquired atrial abnormality | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BC40 |
| 469 | Acquired ventricular abnormality | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BC41 |
| 470 | Noncompaction cardiomyopathy | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BC44 |
| 471 | Constitutional tall stature | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5B12 |
| 472 | Underweight in infants, children or adolescents | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5B50 |
| 473 | Adjustment disorder | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6B43 |
| 474 | Reactive attachment disorder | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6B44 |
| 475 | Paget disease of bone | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the musculoskeletal system or connective tissue | ICD-11 FB85 |
| 476 | Disorders associated with bone growth | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the musculoskeletal system or connective tissue | ICD-11 FB86 |
| 477 | Pulmonary eosinophilia | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the respiratory system | ICD-11 CB02 |
| 478 | Idiopathic interstitial pneumonitis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the respiratory system | ICD-11 CB03 |
| 479 | Late effects of cerebrovascular disease | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8B25 |
| 480 | Cauda equina syndrome | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8B40 |
| 481 | Perianal venous thrombosis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DB61 |
| 482 | Residual haemorrhoidal skin tags | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DB62 |
| 483 | Malignant mixed epithelial mesenchymal tumour, primary site | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2B5D |
| 484 | Malignant nerve sheath tumour of peripheral nerves or autonomic nervous system, primary site | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2B5E |
| 485 | Hereditary methaemoglobinaemia | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the blood or blood-forming organs | ICD-11 3A92 |
| 486 | Complex allergic or hypersensitivity conditions | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the immune system | ICD-11 4A85 |
| 487 | Pityriasis lichenoides | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the skin | ICD-11 EA93 |
| 488 | Cat-scratch disease | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1B98 |
| 489 | Pasteurellosis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1B99 |
| 490 | Listeriosis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1C1A |
| 491 | Nocardiosis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1C1B |
| 492 | Cardiomegaly | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BC45 |
| 493 | Intracardiac thrombosis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BC46 |
| 494 | Atrial premature depolarization | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BC60 |
| 495 | Wasting in infants, children or adolescents | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5B51 |
| 496 | Acute malnutrition in infants, children or adolescents | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5B52 |
| 497 | Disinhibited social engagement disorder | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6B45 |
| 498 | Dissociative neurological symptom disorder | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6B60 |
| 499 | Postprocedural disorders of the musculoskeletal system | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the musculoskeletal system or connective tissue | ICD-11 FC01 |
| 500 | Primary interstitial lung diseases specific to infancy or childhood | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the respiratory system | ICD-11 CB04 |
| 501 | Pulmonary alveolar microlithiasis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the respiratory system | ICD-11 CB06 |
| 502 | Non-compressive vascular myelopathies | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8B43 |
| 503 | Degenerative myelopathic disorders | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8B44 |
| 504 | Infections of the anal region | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DB70 |
| 505 | Anal polyp | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DB71 |
| 506 | Myosarcoma of uterus, part not specified | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2B5G |
| 507 | Malignant neoplasms of oropharynx | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2B6A |
| 508 | Acquired methaemoglobinaemia | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the blood or blood-forming organs | ICD-11 3A93 |
| 509 | Eosinopenia | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the immune system | ICD-11 4B02 |
| 510 | Pityriasis rubra pilaris | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the skin | ICD-11 EA94 |
| 511 | Meningococcal disease | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1C1C |
| 512 | Yaws | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1C1D |
| 513 | Pinta | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1C1E |
| 514 | Endemic non-venereal syphilis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1C1F |
| 515 | Junctional premature depolarization | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BC61 |
| 516 | Accessory pathway | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BC62 |
| 517 | Conduction disorders | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BC63 |
| 518 | Stunting in infants, children or adolescents | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5B53 |
| 519 | Underweight in adults | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5B54 |
| 520 | Dissociative amnesia | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6B61 |
| 521 | Trance disorder | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6B62 |
| 522 | Lymphangioleiomyomatosis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the respiratory system | ICD-11 CB07 |
| 523 | Pleural plaque | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the respiratory system | ICD-11 CB20 |
| 524 | Motor neuron disease | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8B60 |
| 525 | Spinal muscular atrophy | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8B61 |
| 526 | Infectious liver disease | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DB90 |
| 527 | Acute or subacute hepatic failure | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DB91 |
| 528 | Malignant neoplasms of nasopharynx | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2B6B |
| 529 | Malignant neoplasms of piriform sinus | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2B6C |
| 530 | Acute posthaemorrhagic anaemia | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the blood or blood-forming organs | ICD-11 3A94 |
| 531 | Eosinophilia | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the immune system | ICD-11 4B03 |
| 532 | Spontaneous urticaria | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the skin | ICD-11 EB00 |
| 533 | Lyme borreliosis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1C1G |
| 534 | Necrotising ulcerative gingivitis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1C1H |
| 535 | Relapsing fever | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1C1J |
| 536 | California encephalitis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1C8B |
| 537 | Sudden arrhythmic death syndrome | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BC64 |
| 538 | Cardiac arrhythmia associated with genetic disorder | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BC65 |
| 539 | Ventricular premature depolarization | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BC70 |
| 540 | Vitamin C deficiency | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5B56 |
| 541 | Vitamin D deficiency | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5B57 |
| 542 | Possession trance disorder | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6B63 |
| 543 | Dissociative identity disorder | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6B64 |
| 544 | Pneumothorax | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the respiratory system | ICD-11 CB21 |
| 545 | Chylous effusion | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the respiratory system | ICD-11 CB24 |
| 546 | Post polio progressive muscular atrophy | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8B62 |
| 547 | Brachial plexus disorders | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8B91 |
| 548 | Non-alcoholic fatty liver disease | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DB92 |
| 549 | Hepatic fibrosis or cirrhosis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DB93 |
| 550 | Malignant neoplasms of hypopharynx | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2B6D |
| 551 | Histiocytic or dendritic cell neoplasms | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2B31 |
| 552 | Hereditary factor VIII deficiency | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the blood or blood-forming organs | ICD-11 3B10 |
| 553 | Disorders with decreased monocyte counts | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the immune system | ICD-11 4B04 |
| 554 | Inducible urticaria or angioedema | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the skin | ICD-11 EB01 |
| 555 | Venezuelan equine encephalitis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1C8C |
| 556 | La Crosse encephalitis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1C8D |
| 557 | Lymphocytic choriomeningitis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1C8F |
| 558 | Tick-borne encephalitis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1C8G |
| 559 | Ventricular tachyarrhythmia | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BC71 |
| 560 | Supraventricular bradyarrhythmia | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BC80 |
| 561 | Supraventricular tachyarrhythmia | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BC81 |
| 562 | Vitamin E deficiency | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5B58 |
| 563 | Vitamin K deficiency | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5B59 |
| 564 | Partial dissociative identity disorder | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6B65 |
| 565 | Depersonalization-derealization disorder | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6B66 |
| 566 | Fibrothorax | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the respiratory system | ICD-11 CB25 |
| 567 | Haemothorax | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the respiratory system | ICD-11 CB26 |
| 568 | Lumbosacral plexus disorders | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8B92 |
| 569 | Radiculopathy | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8B93 |
| 570 | Alcoholic liver disease | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DB94 |
| 571 | Drug-induced or toxic liver disease | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DB95 |
| 572 | Immunodeficiency-associated lymphoproliferative disorders | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2B32 |
| 573 | Malignant haematopoietic neoplasms without further specification | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2B33 |
| 574 | Hereditary factor IX deficiency | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the blood or blood-forming organs | ICD-11 3B11 |
| 575 | Disorders with increased monocyte counts | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the immune system | ICD-11 4B05 |
| 576 | Cholinergic urticaria or related conditions | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the skin | ICD-11 EB02 |
| 577 | Actinomycosis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1C10 |
| 578 | Bartonellosis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1C11 |
| 579 | Obstetrical tetanus | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1C14 |
| 580 | Tetanus neonatorum | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1C15 |
| 581 | Rhythm disturbance at level of atrioventricular junction | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BC90 |
| 582 | Pacemaker or implantable cardioverter defibrillator battery at end of battery life | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BC91 |
| 583 | Congestive heart failure | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BD10 |
| 584 | Sequelae of protein-energy malnutrition | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5B60 |
| 585 | Sequelae of vitamin A deficiency | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5B61 |
| 586 | Anorexia Nervosa | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6B80 |
| 587 | Bulimia Nervosa | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6B81 |
| 588 | Chronic pulmonary insufficiency following surgery | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the respiratory system | ICD-11 CB61 |
| 589 | Postprocedural subglottic stenosis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the respiratory system | ICD-11 CB62 |
| 590 | Secondary brachial plexus lesion due to certain specified disorders | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8B95 |
| 591 | Idiopathic progressive neuropathy | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8C00 |
| 592 | Autoimmune liver disease | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DB96 |
| 593 | Vascular disorders of the liver | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DB98 |
| 594 | Chondrosarcoma, primary site | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2B50 |
| 595 | Osteosarcoma, primary site | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2B51 |
| 596 | Von Willebrand disease | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the blood or blood-forming organs | ICD-11 3B12 |
| 597 | Acquired lymphopenia | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the immune system | ICD-11 4B06 |
| 598 | Syndromes with urticarial reactions or angioedema | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the skin | ICD-11 EB03 |
| 599 | Gas gangrene | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1C16 |
| 600 | Brazilian purpuric fever | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1C18 |
| 601 | Legionellosis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1C19 |
| 602 | Chlamydial conjunctivitis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1C20 |
| 603 | Left ventricular failure | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BD11 |
| 604 | High output syndromes | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BD12 |
| 605 | Right ventricular failure | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BD13 |
| 606 | Sequelae of vitamin C deficiency | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5B62 |
| 607 | Sequelae of rickets | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5B63 |
| 608 | Binge eating disorder | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6B82 |
| 609 | Avoidant-restrictive food intake disorder | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6B83 |
| 610 | Postprocedural stenosis of the trachea | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the respiratory system | ICD-11 CB63 |
| 611 | Inflammatory polyneuropathy | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8C01 |
| 612 | Hereditary motor and sensory neuropathy | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8C20 |
| 613 | Cholelithiasis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DC11 |
| 614 | Cholecystitis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DC12 |
| 615 | Ewing sarcoma, primary site | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2B52 |
| 616 | Fibroblastic or myofibroblastic tumour, primary site | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2B53 |
| 617 | Haemophilia C | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the blood or blood-forming organs | ICD-11 3B13 |
| 618 | Acquired lymphocytosis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the immune system | ICD-11 4B07 |
| 619 | Idiopathic angioedema | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the skin | ICD-11 EB04 |
| 620 | Chlamydial peritonitis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1C21 |
| 621 | Infections due to Chlamydia psittaci | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1C22 |
| 622 | Typhus fever | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1C30 |
| 623 | Spotted fever | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1C31 |
| 624 | Biventricular failure | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BD14 |
| 625 | Atherosclerotic chronic arterial occlusive disease | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BD40 |
| 626 | Non-atherosclerotic chronic arterial occlusive disease | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BD41 |
| 627 | Essential fatty acid deficiency | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5B70 |
| 628 | Protein deficiency | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5B71 |
| 629 | Pica | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6B84 |
| 630 | Rumination-regurgitation disorder | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6B85 |
| 631 | Hereditary sensory or autonomic neuropathy | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8C21 |
| 632 | Congenital myasthenic syndromes | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8C61 |
| 633 | Cholangitis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DC13 |
| 634 | Cystic diseases of the pancreas | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DC30 |
| 635 | Undifferentiated pleomorphic sarcoma, primary site | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2B54 |
| 636 | Rhabdomyosarcoma, primary site | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2B55 |
| 637 | Inherited coagulation factor deficiency without bleeding tendency | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the blood or blood-forming organs | ICD-11 3B15 |
| 638 | Sarcoidosis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the immune system | ICD-11 4B20 |
| 639 | Diffuse inflammatory erythemas | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the skin | ICD-11 EB10 |
| 640 | Rickettsialpox | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1C32 |
| 641 | Q fever | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1C33 |
| 642 | Campylobacteriosis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1C40 |
| 643 | Melioidosis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1C42 |
| 644 | Raynaud phenomenon | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BD42 |
| 645 | Aortic aneurysm or dissection | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BD50 |
| 646 | Arterial aneurysm or dissection, excluding aorta | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BD51 |
| 647 | Overweight or localised adiposity | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5B80 |
| 648 | Vitamin excesses | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5B90 |
| 649 | Enuresis | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6C00 |
| 650 | Encopresis | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6C01 |
| 651 | Lambert-Eaton syndrome | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8C62 |
| 652 | Muscular dystrophy | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8C70 |
| 653 | Acute pancreatitis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DC31 |
| 654 | Chronic pancreatitis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DC32 |
| 655 | Angiosarcoma, primary site | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2B56 |
| 656 | Kaposi sarcoma, primary site | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2B57 |
| 657 | Disseminated intravascular coagulation | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the blood or blood-forming organs | ICD-11 3B20 |
| 658 | Polyclonal hypergammaglobulinaemia | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the immune system | ICD-11 4B21 |
| 659 | Annular erythema | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the skin | ICD-11 EB11 |
| 660 | Actinomycetoma | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1C43 |
| 661 | Non-pyogenic bacterial infections of the skin | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1C44 |
| 662 | Toxic shock syndrome | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1C45 |
| 663 | Human immunodeficiency virus disease associated with tuberculosis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1C60 |
| 664 | Asymptomatic stenosis of intracranial or extracranial artery | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BD55 |
| 665 | Asymptomatic occlusion of intracranial or extracranial artery | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BD56 |
| 666 | Superficial thrombophlebitis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BD70 |
| 667 | Mineral excesses | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5B91 |
| 668 | Alpha-1-antitrypsin deficiency | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5C5A |
| 669 | Disorders due to use of nicotine | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6C4A |
| 670 | Disorders due to use of volatile inhalants | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6C4B |
| 671 | Myotonic disorders | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8C71 |
| 672 | Congenital myopathies | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8C72 |
| 673 | Autoimmune pancreatitis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DC33 |
| 674 | Obstructive pancreatitis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DC34 |
| 675 | Leiomyosarcoma, primary site | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2B58 |
| 676 | Malignant neoplasms of gum | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2B63 |
| 677 | Haemorrhagic disorder due to circulating anticoagulants or coagulation factors inhibitors | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the blood or blood-forming organs | ICD-11 3B21 |
| 678 | Cryoglobulinaemia | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the immune system | ICD-11 4B22 |
| 679 | Erythema multiforme | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the skin | ICD-11 EB12 |
| 680 | Human immunodeficiency virus disease associated with malaria | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1C61 |
| 681 | Human immunodeficiency virus disease without mention of tuberculosis or malaria | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1C62 |
| 682 | Acute poliomyelitis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1C81 |
| 683 | Western equine encephalitis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1C83 |
| 684 | Deep vein thrombosis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BD71 |
| 685 | Venous thromboembolism | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BD72 |
| 686 | Acquired systemic vein abnormality | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BD73 |
| 687 | Inborn errors of amino acid or other organic acid metabolism | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5C50 |
| 688 | Inborn errors of carbohydrate metabolism | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5C51 |
| 689 | Disorders due to use of MDMA or related drugs, including MDA | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6C4C |
| 690 | Disorders due to use of dissociative drugs including ketamine and phencyclidine [PCP] | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6C4D |
| 691 | Mitochondrial myopathies | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8C73 |
| 692 | Periodic paralyses or disorders of muscle membrane excitability | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8C74 |
| 693 | Peritonitis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DC50 |
| 694 | Diverticulitis of small intestine | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DC70 |
| 695 | Malignant neoplasms of floor of mouth | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2B64 |
| 696 | Malignant neoplasms of palate | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2B65 |
| 697 | Acquired haemophilia | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the blood or blood-forming organs | ICD-11 3B22 |
| 698 | Immune reconstitution inflammatory syndrome | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the immune system | ICD-11 4B23 |
| 699 | Stevens-Johnson syndrome or toxic epidermal necrolysis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the skin | ICD-11 EB13 |
| 700 | Eastern equine encephalitis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1C84 |
| 701 | Japanese encephalitis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1C85 |
| 702 | St Louis encephalitis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1C86 |
| 703 | Rocio viral encephalitis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1C87 |
| 704 | Chronic peripheral venous insufficiency of lower extremities | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BD74 |
| 705 | Venous varicosities of sites other than lower extremity | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BD75 |
| 706 | Lymphadenitis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BD90 |
| 707 | Inborn errors of energy metabolism | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5C53 |
| 708 | Inborn errors of purine, pyrimidine or nucleotide metabolism | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5C55 |
| 709 | Disorders due to use of multiple specified psychoactive substances, including medications | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6C4F |
| 710 | Disorders due to use of non-psychoactive substances | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6C4H |
| 711 | Distal myopathies | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8C75 |
| 712 | Myofibrillar myopathy | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8C76 |
| 713 | Diverticulosis of small intestine | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DC71 |
| 714 | Diverticulum of small intestine | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DC72 |
| 715 | Malignant neoplasms of parotid gland | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2B67 |
| 716 | Malignant neoplasms of submandibular or sublingual glands | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2B68 |
| 717 | Inherited fibrinolytic defects | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the blood or blood-forming organs | ICD-11 3B50 |
| 718 | Graft-versus-host disease | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the immune system | ICD-11 4B24 |
| 719 | Acute febrile neutrophilic dermatosis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the skin | ICD-11 EB20 |
| 720 | Murray Valley encephalitis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1C88 |
| 721 | Infectious granulomas of the central nervous system | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1D04 |
| 722 | Omsk haemorrhagic fever | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1D4A |
| 723 | Kyasanur Forest disease | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1D4B |
| 724 | Lymphangiectasia | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BD92 |
| 725 | Lymphoedema | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BD93 |
| 726 | Cardiac transplant associated coronary allograft vasculopathy | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BE1A |
| 727 | Lysosomal diseases | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5C56 |
| 728 | Peroxisomal diseases | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5C57 |
| 729 | Bodily distress disorder | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6C20 |
| 730 | Body integrity dysphoria | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6C21 |
| 731 | Ocular myopathy | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8C77 |
| 732 | Malignant hyperthermia or hyperpyrexia | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8C78 |
| 733 | Diverticulitis of large intestine | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DC80 |
| 734 | Diverticulosis of large intestine | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DC81 |
| 735 | Malignant neoplasms of tonsil | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2B69 |
| 736 | Malignant neoplasms of oesophagus | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2B70 |
| 737 | Acquired fibrinolytic defects | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the blood or blood-forming organs | ICD-11 3B51 |
| 738 | Pyoderma gangrenosum | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the skin | ICD-11 EB21 |
| 739 | Alkhurma haemorrhagic fever | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1D4C |
| 740 | Ross River disease | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1D4D |
| 741 | Severe fever with thrombocytopenia syndrome | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1D4E |
| 742 | Infectious cysts of the central nervous system | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1D05 |
| 743 | Lymphoedema due to surgery or radiotherapy | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BE1B |
| 744 | Inferior caval vein obstruction due to foreign body | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BE1C |
| 745 | Superior caval vein obstruction due to foreign body | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BE1D |
| 746 | Inborn errors of porphyrin or heme metabolism | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5C58 |
| 747 | Inborn errors of neurotransmitter metabolism | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5C59 |
| 748 | Disorders due to use of alcohol | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6C40 |
| 749 | Disorders due to use of cannabis | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6C41 |
| 750 | Drug-induced myopathy | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8C80 |
| 751 | Focal or segmental autonomic disorders | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8D8A |
| 752 | Diverticulum of large intestine | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DC82 |
| 753 | Diverticular disease of small and large intestine | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DC90 |
| 754 | Malignant neoplasms of oesophagogastric junction | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2B71 |
| 755 | Malignant neoplasms of stomach | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2B72 |
| 756 | Non-thrombocytopenic purpura | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the blood or blood-forming organs | ICD-11 3B60 |
| 757 | Eosinophilic cellulitis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the skin | ICD-11 EB30 |
| 758 | Dengue without warning signs | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1D20 |
| 759 | Dengue with warning signs | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1D21 |
| 760 | Severe dengue | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1D22 |
| 761 | Chikungunya virus disease | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1D40 |
| 762 | Postprocedural right atrial complication | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BE1E |
| 763 | Postprocedural left atrial complication | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BE1F |
| 764 | Postcardiotomy syndrome | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BE10 |
| 765 | Volume depletion | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5C70 |
| 766 | Hyperosmolality or hypernatraemia | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5C71 |
| 767 | Disorders due to use of synthetic cannabinoids | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6C42 |
| 768 | Disorders due to use of opioids | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6C43 |
| 769 | Disorders affecting autonomic synaptic neurotransmission | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8D8B |
| 770 | Autonomic dysreflexia | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8D8C |
| 771 | Acute vascular disorders of intestine | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DD30 |
| 772 | Chronic vascular disorders of intestine | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DD31 |
| 773 | Malignant neoplasms of small intestine | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2B80 |
| 774 | Malignant neoplasms of appendix | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2B81 |
| 775 | Thrombophilia | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the blood or blood-forming organs | ICD-11 3B61 |
| 776 | Erythema nodosum | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the skin | ICD-11 EB31 |
| 777 | Colorado tick fever | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1D41 |
| 778 | O'nyong-nyong fever | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1D42 |
| 779 | Oropouche virus disease | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1D43 |
| 780 | Rift Valley fever | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1D44 |
| 781 | Postprocedural valve disorders | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BE12 |
| 782 | Postprocedural true or false aortic aneurysm | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BE13 |
| 783 | Postprocedural disorder of circulatory system following repair of congenital heart or great vessel anomaly | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BE14 |
| 784 | Hypo-osmolality or hyponatraemia | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5C72 |
| 785 | Acidosis | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5C73 |
| 786 | Disorders due to use of sedatives, hypnotics or anxiolytics | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6C44 |
| 787 | Disorders due to use of cocaine | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6C45 |
| 788 | Spastic cerebral palsy | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8D20 |
| 789 | Dyskinetic cerebral palsy | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8D21 |
| 790 | Non-abdominal wall hernia | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DD50 |
| 791 | Inguinal hernia | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DD51 |
| 792 | Malignant neoplasms of colon | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2B90 |
| 793 | Malignant neoplasms of rectosigmoid junction | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2B91 |
| 794 | Qualitative platelet defects | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the blood or blood-forming organs | ICD-11 3B62 |
| 795 | Pemphigus | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the skin | ICD-11 EB40 |
| 796 | Sandfly fever | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1D45 |
| 797 | West Nile virus infection | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1D46 |
| 798 | Zika virus disease | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1D48 |
| 799 | Crimean-Congo haemorrhagic fever | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1D49 |
| 800 | Postprocedural pulmonary arterial tree disorder | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BE15 |
| 801 | Postprocedural pulmonary venous disorder | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BE16 |
| 802 | Postprocedural residual or recurrent interatrial communication | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BE17 |
| 803 | Alkalosis | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5C74 |
| 804 | Mixed disorder of acid-base balance | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5C75 |
| 805 | Disorders due to use of stimulants including amphetamines, methamphetamine or methcathinone | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6C46 |
| 806 | Disorders due to use of synthetic cathinones | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6C47 |
| 807 | Ataxic cerebral palsy | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8D22 |
| 808 | Worster-Drought syndrome | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8D23 |
| 809 | Umbilical hernia | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DD53 |
| 810 | Paraumbilical hernia | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DD54 |
| 811 | Malignant neoplasms of rectum | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2B92 |
| 812 | Malignant neoplasms of anus or anal canal | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2C00 |
| 813 | Thrombocytosis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the blood or blood-forming organs | ICD-11 3B63 |
| 814 | Pemphigoid | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the skin | ICD-11 EB41 |
| 815 | Filovirus disease | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1D60 |
| 816 | Arenavirus disease | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1D61 |
| 817 | Hantavirus disease | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1D62 |
| 818 | Henipavirus encephalitis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1D63 |
| 819 | Postprocedural ventricular abnormality | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the circulatory system | ICD-11 BE19 |
| 820 | Hyperkalaemia | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5C76 |
| 821 | Hypokalaemia | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5C77 |
| 822 | Disorders due to use of caffeine | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6C48 |
| 823 | Disorders due to use of hallucinogens | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6C49 |
| 824 | Neurological disorders due to toxicity | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8D43 |
| 825 | Alcohol-related neurological disorders | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8D44 |
| 826 | Epigastric hernia | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DD55 |
| 827 | Incisional hernia | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DD56 |
| 828 | Malignant neoplasm of pancreas | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2C10 |
| 829 | Malignant neoplasms of other or ill-defined digestive organs | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2C11 |
| 830 | Thrombocytopenia | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the blood or blood-forming organs | ICD-11 3B64 |
| 831 | Linear IgA bullous dermatosis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the skin | ICD-11 EB42 |
| 832 | Middle East respiratory syndrome | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1D64 |
| 833 | Severe acute respiratory syndrome | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1D65 |
| 834 | Mumps | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1D80 |
| 835 | Infectious mononucleosis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1D81 |
| 836 | Fluid overload | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5C78 |
| 837 | Metabolic or transporter liver disease | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5C90 |
| 838 | Gambling disorder | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6C50 |
| 839 | Gaming disorder | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6C51 |
| 840 | Increased intracranial pressure | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8D60 |
| 841 | Cerebrospinal fluid rhinorrhoea | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8D62 |
| 842 | Parastomal hernia | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DD57 |
| 843 | Indeterminate colitis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DD72 |
| 844 | Malignant neoplasms of liver or intrahepatic bile ducts | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2C12 |
| 845 | Malignant neoplasms of gallbladder | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2C13 |
| 846 | Congenital disorders of spleen | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the blood or blood-forming organs | ICD-11 3B80 |
| 847 | Epidermolysis bullosa acquisita | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the skin | ICD-11 EB43 |
| 848 | Cytomegaloviral disease | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1D82 |
| 849 | Epidemic myalgia | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1D83 |
| 850 | Viral carditis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1D85 |
| 851 | Influenza due to identified seasonal influenza virus | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1E30 |
| 852 | Amyloidosis | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5D00 |
| 853 | Postprocedural hypothyroidism | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5D40 |
| 854 | Pyromania | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6C70 |
| 855 | Kleptomania | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6C71 |
| 856 | Cerebrospinal fluid otorrhoea | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8D63 |
| 857 | Hydrocephalus | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8D64 |
| 858 | Functional oesophageal or gastroduodenal disorders | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DD90 |
| 859 | Irritable bowel syndrome or certain specified functional bowel disorders | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DD91 |
| 860 | Malignant neoplasms of proximal biliary tract, cystic duct | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2C14 |
| 861 | Malignant neoplasms of biliary tract, distal bile duct | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2C15 |
| 862 | Acquired disorders of spleen | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the blood or blood-forming organs | ICD-11 3B81 |
| 863 | Dermatitis herpetiformis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the skin | ICD-11 EB44 |
| 864 | Influenza due to identified zoonotic or pandemic influenza virus | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1E31 |
| 865 | Influenza, virus not identified | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1E32 |
| 866 | Acute viral hepatitis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1E50 |
| 867 | Chronic viral hepatitis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1E51 |
| 868 | Postprocedural hypoinsulinaemia | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5D41 |
| 869 | Postprocedural hypoparathyroidism | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5D42 |
| 870 | Compulsive sexual behaviour disorder | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6C72 |
| 871 | Intermittent explosive disorder | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6C73 |
| 872 | Cerebrospinal fluid fistula | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8D65 |
| 873 | Syringomyelia or syringobulbia | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8D66 |
| 874 | Functional anorectal disorders | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DD92 |
| 875 | Functional digestive disorders of infants, toddlers or children | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DD93 |
| 876 | Malignant neoplasms of ampulla of Vater | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2C16 |
| 877 | Malignant neoplasms of perihilar bile duct | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2C18 |
| 878 | Lichen sclerosus | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the skin | ICD-11 EB60 |
| 879 | Smallpox | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1E70 |
| 880 | Mpox | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1E71 |
| 881 | Cowpox | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1E72 |
| 882 | Vaccinia | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1E73 |
| 883 | Postprocedural hypopituitarism | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5D43 |
| 884 | Postprocedural ovarian failure | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5D44 |
| 885 | Oppositional defiant disorder | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6C90 |
| 886 | Conduct-dissocial disorder | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6C91 |
| 887 | Intracranial arachnoid cyst | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8D67 |
| 888 | Porencephalic cyst | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8D68 |
| 889 | Functional gallbladder disorder | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DD94 |
| 890 | Functional sphincter of Oddi disorder | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DD95 |
| 891 | Malignant neoplasms of nasal cavity | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2C20 |
| 892 | Malignant neoplasms of middle ear | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2C21 |
| 893 | Morphoea | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the skin | ICD-11 EB61 |
| 894 | Buffalopox | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1E74 |
| 895 | Orf | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1E75 |
| 896 | Molluscum contagiosum | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1E76 |
| 897 | Common warts | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1E80 |
| 898 | Postprocedural testicular hypofunction | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5D45 |
| 899 | Postprocedural adrenocortical hypofunction | WHO ICD-11 extension | Weighted extension after WHO core · Endocrine, nutritional or metabolic diseases | ICD-11 5D46 |
| 900 | Personality disorder | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6D10 |
| 901 | Prominent personality traits or patterns | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6D11 |
| 902 | Congenital malformations of the autonomic nervous system | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8D80 |
| 903 | Inherited autonomic nervous system disorders | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8D81 |
| 904 | Vomiting following gastrointestinal surgery | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DE10 |
| 905 | Dumping syndrome | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the digestive system | ICD-11 DE11 |
| 906 | Malignant neoplasms of accessory sinuses | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2C22 |
| 907 | Malignant neoplasms of larynx | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2C23 |
| 908 | Dermatoses resulting from disturbed metabolic processes | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the skin | ICD-11 EB90 |
| 909 | Plane warts | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1E81 |
| 910 | Wart virus proliferation in immune-deficient states | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1E83 |
| 911 | Varicella | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1E90 |
| 912 | Zoster | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1E91 |
| 913 | Exhibitionistic disorder | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6D30 |
| 914 | Voyeuristic disorder | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6D31 |
| 915 | Autoimmune disorders involving the autonomic nervous system | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8D82 |
| 916 | Pure autonomic nervous system failure | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8D84 |
| 917 | Malignant neoplasms of trachea | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2C24 |
| 918 | Malignant neoplasms of bronchus or lung | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2C25 |
| 919 | Genetic syndromes with poikiloderma | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the skin | ICD-11 EC10 |
| 920 | Herpes simplex infections | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1F00 |
| 921 | Roseola infantum | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1F01 |
| 922 | Rubella | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1F02 |
| 923 | Histoplasmosis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1F2A |
| 924 | Pedophilic disorder | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6D32 |
| 925 | Coercive sexual sadism disorder | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6D33 |
| 926 | Autonomic nervous system disorder due to substances | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8D85 |
| 927 | Autonomic nervous system hyperactivity | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8D86 |
| 928 | Malignant neoplasms of the pleura | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2C26 |
| 929 | Malignant neoplasms of thymus | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2C27 |
| 930 | Genetic disorders of keratinisation | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the skin | ICD-11 EC20 |
| 931 | Lobomycosis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1F2B |
| 932 | Mucormycosis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1F2C |
| 933 | Non-dermatophyte superficial dermatomycoses | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1F2D |
| 934 | Paracoccidioidomycosis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1F2E |
| 935 | Frotteuristic disorder | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6D34 |
| 936 | Paraphilic disorder involving solitary behaviour or consenting individuals | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6D36 |
| 937 | Autonomic nervous system disorder due to certain specified neurodegenerative disorder | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8D87 |
| 938 | Autonomic neuropathies | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8D88 |
| 939 | Malignant neoplasms of heart or mediastinum | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2C28 |
| 940 | Malignant neoplasms of other or ill-defined sites in the respiratory system or intrathoracic organs | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2C29 |
| 941 | Genetic defects of hair or hair growth | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the skin | ICD-11 EC21 |
| 942 | Phaeohyphomycosis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1F2F |
| 943 | Pneumocystosis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1F2G |
| 944 | Scedosporiosis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1F2H |
| 945 | Sporotrichosis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1F2J |
| 946 | Factitious disorder imposed on self | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6D50 |
| 947 | Factitious disorder imposed on another | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6D51 |
| 948 | Sporadic Creutzfeldt-Jakob Disease | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8E00 |
| 949 | Acquired prion disease | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8E01 |
| 950 | Melanoma of skin | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2C30 |
| 951 | Squamous cell carcinoma of skin | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2C31 |
| 952 | Genetic defects of nails or nail growth | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the skin | ICD-11 EC22 |
| 953 | Talaromycosis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1F2K |
| 954 | Emmonsiosis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1F2L |
| 955 | Measles | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1F03 |
| 956 | Erythema infectiosum | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1F04 |
| 957 | Delirium | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6D70 |
| 958 | Amnestic disorder | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6D72 |
| 959 | Genetic prion diseases | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8E02 |
| 960 | Variably protease sensitive prionopathy | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8E03 |
| 961 | Basal cell carcinoma of skin | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2C32 |
| 962 | Adnexal carcinoma of skin | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2C33 |
| 963 | Genetic disorders of skin pigmentation | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the skin | ICD-11 EC23 |
| 964 | Picornavirus infections presenting in the skin or mucous membranes | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1F05 |
| 965 | Strongyloidiasis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1F6B |
| 966 | Syngamosis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1F6C |
| 967 | Toxocariasis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1F6D |
| 968 | Psychological or behavioural factors affecting disorders or diseases classified elsewhere | WHO ICD-11 extension | Weighted extension after WHO core · Mental, behavioural or neurodevelopmental disorders | ICD-11 6E40 |
| 969 | Persistent vegetative state | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8E20 |
| 970 | Permanent vegetative state | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8E21 |
| 971 | Cutaneous neuroendocrine carcinoma | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2C34 |
| 972 | Cutaneous sarcoma | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2C35 |
| 973 | Epidermolysis bullosa simplex | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the skin | ICD-11 EC30 |
| 974 | Trichinosis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1F6E |
| 975 | Trichostrongyliasis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1F6F |
| 976 | Uncinariosis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1F6H |
| 977 | Aspergillosis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1F20 |
| 978 | Minimally conscious state | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8E22 |
| 979 | Pachymeningitis | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8E41 |
| 980 | Malignant neuroepitheliomatous neoplasms of peripheral nerves or autonomic nervous system | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2C40 |
| 981 | Malignant perineurioma | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2C41 |
| 982 | Junctional epidermolysis bullosa | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the skin | ICD-11 EC31 |
| 983 | Basidiobolomycosis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1F21 |
| 984 | Blastomycosis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1F22 |
| 985 | Candidosis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1F23 |
| 986 | Chromoblastomycosis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1F24 |
| 987 | Superficial siderosis of the nervous system | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8E42 |
| 988 | Pain disorders | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8E43 |
| 989 | Malignant neoplasms of retroperitoneum | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2C50 |
| 990 | Malignant neoplasms of peritoneum | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2C51 |
| 991 | Dystrophic epidermolysis bullosa | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the skin | ICD-11 EC32 |
| 992 | Coccidioidomycosis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1F25 |
| 993 | Conidiobolomycosis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1F26 |
| 994 | Cryptococcosis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1F27 |
| 995 | Dermatophytosis | WHO ICD-11 extension | Weighted extension after WHO core · Certain infectious or parasitic diseases | ICD-11 1F28 |
| 996 | Post anoxic brain damage | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8E44 |
| 997 | Locked-in syndrome | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the nervous system | ICD-11 8E45 |
| 998 | Malignant neoplasms of omentum | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2C52 |
| 999 | Malignant neoplasm involving overlapping sites of retroperitoneum, peritoneum or omentum | WHO ICD-11 extension | Weighted extension after WHO core · Neoplasms | ICD-11 2C53 |
| 1000 | Syndromic epidermolysis bullosa | WHO ICD-11 extension | Weighted extension after WHO core · Diseases of the skin | ICD-11 EC33 |
