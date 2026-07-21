'use strict';

const KNOWN_TARGET_ALIASES = [
  { canonical: 'PD-L1', patterns: [/pd\s*-?\s*l\s*-?\s*1/i, /pdl1/i] },
  { canonical: 'PD-1', patterns: [/pd\s*-?\s*1/i, /pd1/i] },
  { canonical: 'CTLA-4', patterns: [/ctla\s*-?\s*4/i, /cd152/i] },
  { canonical: 'IL-33', patterns: [/il\s*-?\s*33/i, /il33/i] },
  { canonical: 'IL-6', patterns: [/il\s*-?\s*6(?!\s*-?\s*r)\b/i, /\bil6(?!r)\b/i, /interleukin\s*-?\s*6\b/i] },
  { canonical: 'IL-5', patterns: [/il\s*-?\s*5\b/i, /il5\b/i, /interleukin\s*-?\s*5/i] },
  { canonical: 'IL-13', patterns: [/il\s*-?\s*13\b/i, /il13\b/i, /interleukin\s*-?\s*13/i] },
  { canonical: 'BAFF', patterns: [/\bbaff\b/i, /\bblys\b/i, /b[\s-]?cell activating factor/i, /tnfsf13b/i, /tall-?1/i] },
  { canonical: 'FcRn', patterns: [/\bfcrn\b/i, /\bfcgrt\b/i, /neonatal fc receptor/i, /igg fc fragment receptor transporter alpha chain/i] },
  { canonical: 'Integrin α4β7', patterns: [/(?:integrin\s*)?(?:α|alpha|a)\s*4\s*(?:β|beta|b)\s*7/i, /\ba4b7\b/i, /itga4\s*\/\s*itgb7/i, /alpha4beta7/i] },
  { canonical: 'ST2', patterns: [/\bst2\b/i, /il1rl1/i] },
  { canonical: 'HER2', patterns: [/her\s*-?\s*2/i, /erbb\s*-?\s*2/i] },
  { canonical: 'HER3', patterns: [/her\s*-?\s*3/i, /erbb\s*-?\s*3/i, /erb\s*b\s*-?\s*3/i] },
  { canonical: 'EGFR', patterns: [/\begfr\b/i] },
  { canonical: 'MET', patterns: [/\bc\s*-?\s*met\b/i, /\bhgf\s+receptor\b/i, /hepatocyte\s+growth\s+factor\s+receptor/i, /proto-?oncogene\s+c-?met/i] },
  { canonical: 'FGFR2', patterns: [/\bfgfr\s*-?\s*2\b/i, /fibroblast\s+growth\s+factor\s+receptor\s+2/i, /\bkgfr\b/i, /\bk-?sam\b/i] },
  { canonical: 'FGFR3', patterns: [/\bfgfr\s*-?\s*3\b/i, /fibroblast\s+growth\s+factor\s+receptor\s+3/i] },
  { canonical: 'VEGF-A', patterns: [/vegf\s*-?\s*a/i, /vegfa/i] },
  { canonical: 'MUC1', patterns: [/\bmuc\s*-?\s*1\b/i, /cd227/i] },
  { canonical: 'Mesothelin', patterns: [/\bmesothelin\b/i, /\bmsln\b/i] },
  { canonical: 'Claudin 18.2', patterns: [/claudin\s*18(?:\s*[\.-]?\s*2)?/i, /\bcldn\s*18(?:\s*[\.-]?\s*2)?\b/i] },
  { canonical: 'B7-H3', patterns: [/\bb7\s*-\s*h\s*3\b/i, /\bcd\s*-?\s*276\b/i] },
  { canonical: 'CAIX', patterns: [/\bcaix\b/i, /\bca\s*-?\s*9\b/i, /carbonic\s+anhydrase\s+(?:ix|9)/i, /\bg250\b/i] },
  { canonical: 'Amyloid-beta', patterns: [/amyloid\s*[- ]?\s*(?:beta|β)/i, /\babeta\b/i, /\baβ\b/i, /β淀粉样蛋白/i, /淀粉样蛋白\s*β/i] },
  { canonical: 'Tau', patterns: [/\btau\b/i, /\bmicrotubule[-\s]*associated protein tau\b/i, /\bm\s*a\s*p\s*t\b/i, /\bmapt\b/i] },
  { canonical: 'TREM2', patterns: [/\btrem\s*-?\s*2\b/i, /\btrem2\b/i, /triggering receptor expressed on myeloid cells 2/i] },
  { canonical: 'GPC3', patterns: [/\bgpc\s*-?\s*3\b/i, /glypican\s*-?\s*3/i] },
  { canonical: 'CEACAM6', patterns: [/\bceacam\s*-?\s*6\b/i, /\bcd\s*-?\s*66c\b/i] },
  { canonical: 'EpCAM', patterns: [/\bep\s*-?\s*cam\b/i, /\bepcam\b/i, /\btacstd\s*-?\s*1\b/i, /\btacstd1\b/i, /\btrop\s*-?\s*1\b/i, /\btrop1\b/i] },
  { canonical: 'Nectin-4', patterns: [/\bnectin\s*-?\s*4\b/i, /\bnectin4\b/i, /\bpvrl\s*-?\s*4\b/i, /\bpvrl4\b/i] },
  { canonical: 'GPRC5D', patterns: [/\bgprc\s*-?\s*5\s*-?\s*d\b/i, /\bgprc5d\b/i] },
  { canonical: 'CEACAM5', patterns: [/\bceacam\s*-?\s*5\b/i, /\bcea\b/i, /\bcd\s*-?\s*66e\b/i] },
  { canonical: 'STEAP1', patterns: [/\bsteap\s*-?\s*1\b/i, /\bsteap1\b/i] },
  { canonical: 'Tissue Factor', patterns: [/\btissue\s+factor\b/i, /\bf\s*3\b/i, /\bcd\s*-?\s*142\b/i, /thromboplastin/i] },
  { canonical: 'FOLR1', patterns: [/\bfolr\s*-?\s*1\b/i, /\bfolr1\b/i, /folate\s+receptor\s+alpha/i, /\bfr\s*-?\s*alpha\b/i, /\bfrα\b/i] },
  { canonical: 'PSMA', patterns: [/\bpsma\b/i, /\bfolh\s*-?\s*1\b/i, /\bfolh1\b/i, /prostate\s+specific\s+membrane\s+antigen/i] },
  { canonical: 'DLL3', patterns: [/\bdll\s*-?\s*3\b/i, /\bdll3\b/i, /delta[-\s]*like\s+protein\s+3/i] },
  { canonical: 'GPC2', patterns: [/\bgpc\s*-?\s*2\b/i, /glypican\s*-?\s*2/i, /cerebroglycan/i] },
  { canonical: 'DRD4', patterns: [/\bdrd\s*-?\s*4\b/i, /\bdrd4\b/i, /dopamine\s+d4\s+receptor/i] },
  { canonical: 'IGF1R', patterns: [/\bigf\s*-?\s*1\s*r\b/i, /\bigf1r\b/i, /insulin[-\s]*like\s+growth\s+factor\s+1\s+receptor/i, /\bigf\s*-?\s*i\s+receptor\b/i] },
  { canonical: 'GLP1R', patterns: [/\bglp\s*-?\s*1\s*r\b/i, /\bglp1r\b/i, /glp[\s-]*1\s+receptor/i, /glucagon[\s-]*like peptide[\s-]*1 receptor/i] },
  { canonical: 'Myostatin', patterns: [/\bmyostatin\b/i, /\bgdf\s*-?\s*8\b/i, /\bgdf8\b/i] },
  { canonical: 'ActRIIA', patterns: [/\bactriia\b/i, /\bacvr2a\b/i, /activin\s+receptor\s+type\s*iia/i, /activin\s+type\s*iia\s+receptor/i] },
  { canonical: 'ActRIIB', patterns: [/\bactriib\b/i, /\bacvr2b\b/i, /activin\s+receptor\s+type\s*iib/i, /activin\s+type\s*iib\s+receptor/i] },
  { canonical: 'TSHR', patterns: [/\btshr\b/i, /thyrotropin\s+receptor/i, /thyroid[\s-]*stimulating\s+hormone\s+receptor/i, /促甲状腺激素受体/i] },
  { canonical: 'AQP4', patterns: [/\baqp\s*-?\s*4\b/i, /aquaporin[\s-]*4/i, /水通道蛋白\s*4/i] },
  { canonical: 'alpha-synuclein', patterns: [/alpha[\s-]*synuclein/i, /α[\s-]*synuclein/i, /\bsnca\b/i, /突触核蛋白/i] },
  { canonical: 'SOST', patterns: [/\bsost\b/i, /sclerostin/i] },
  { canonical: 'RANKL', patterns: [/\brankl\b/i, /\btnfsf11\b/i, /\btrance\b/i, /receptor activator of nuclear factor kappa-b ligand/i] },
  { canonical: 'DKK1', patterns: [/\bdkk\s*-?\s*1\b/i, /\bdkk1\b/i, /dickkopf-related protein 1/i] },
  { canonical: 'TrkA', patterns: [/\btrk\s*-?\s*a\b/i, /\bntrk\s*-?\s*1\b/i, /\bntrk1\b/i, /high\s+affinity\s+nerve\s+growth\s+factor\s+receptor/i, /nerve\s+growth\s+factor\s+receptor\s+trk\s*a/i] },
  { canonical: 'B7-H4', patterns: [/\bb7\s*-\s*h\s*4\b/i, /\bb7h4\b/i, /\bvtcn\s*-?\s*1\b/i, /\bvtcn1\b/i, /\bb7x\b/i, /\bb7s1\b/i] },
  { canonical: 'CD20', patterns: [/\bcd\s*-?\s*20\b/i, /ms4a1/i] },
  { canonical: 'CD19', patterns: [/\bcd\s*-?\s*19\b/i] },
  { canonical: 'CD3', patterns: [/\bcd\s*-?\s*3(?:e|epsilon|ε)?\b/i] },
  { canonical: 'C5', patterns: [/\bc\s*-?\s*5\b/i, /complement\s+c5/i, /补体\s*c5/i] },
  { canonical: 'IL-6R', patterns: [/il\s*-?\s*6\s*-?\s*r/i, /il6r/i, /cd126/i] },
  { canonical: 'IL-4Rα', patterns: [/il\s*-?\s*4\s*-?\s*r(?:a|α|alpha)?/i, /il4ra/i, /cd124/i] },
  { canonical: 'CD25', patterns: [/\bcd\s*-?\s*25\b/i, /il\s*-?\s*2\s*-?\s*ra/i, /il2ra/i] },
  { canonical: 'CD38', patterns: [/\bcd\s*-?\s*38\b/i] },
  { canonical: 'CD123', patterns: [/\bcd\s*-?\s*123\b/i, /\bil\s*-?\s*3\s*-?\s*r(?:a|alpha)?\b/i, /\bil3ra\b/i, /interleukin\s*-?\s*3\s+receptor\s+subunit\s+alpha/i] },
  { canonical: 'CD33', patterns: [/\bcd\s*-?\s*33\b/i, /\bsiglec\s*-?\s*3\b/i, /\bsiglec3\b/i, /myeloid\s+cell\s+surface\s+antigen\s+cd33/i] },
  { canonical: 'TIGIT', patterns: [/\btigit\b/i] },
  { canonical: 'CD47', patterns: [/\bcd\s*-?\s*47\b/i] },
  { canonical: 'LAG-3', patterns: [/lag\s*-?\s*3/i, /lag3/i] },
  { canonical: 'TROP-2', patterns: [/trop\s*-?\s*2/i, /tacstd2/i] },
  { canonical: 'BCMA', patterns: [/\bbcma\b/i, /tnfrsf17/i, /cd269/i] },
  { canonical: 'IgE', patterns: [/\bige\b/i, /免疫球蛋白\s*e/i] },
  { canonical: 'CGRP receptor', patterns: [/cgrp\s*receptor/i, /cgrp\s*r/i, /calcrl/i] },
  { canonical: 'TNF', patterns: [/\btnf(?:\s*-?\s*(?:a|alpha|α))?\b/i] },
  { canonical: 'IL-17A', patterns: [/il\s*-?\s*17\s*-?\s*a/i, /il17a/i] },
  { canonical: 'IL-23', patterns: [/il\s*-?\s*23/i, /il23/i] },
  { canonical: 'TSLP', patterns: [/\btslp\b/i] },
  { canonical: 'RSV F', patterns: [/\brsv\s*-?\s*f\b/i, /呼吸道合胞病毒/i] },
  { canonical: 'SARS-CoV-2 RBD', patterns: [/sars\s*-?\s*cov\s*-?\s*2\s*rbd/i, /\brbd\b/i, /新冠/i] },
  { canonical: 'Influenza NA', patterns: [/influenza\s*(?:na|neuraminidase)/i, /流感\s*(?:na|神经氨酸酶)/i] },
  { canonical: 'Influenza HA', patterns: [/influenza\s*ha/i, /流感\s*(?:ha|血凝素)?/i] },
  { canonical: 'PCSK9', patterns: [/\bpcsk9\b/i] },
  { canonical: 'ANGPTL3', patterns: [/\bangptl3\b/i] },
  { canonical: 'GIPR', patterns: [/\bgipr\b/i] },
  { canonical: 'IL-1β', patterns: [/il\s*-?\s*1\s*(?:β|b|beta)/i, /il1b/i] },
  { canonical: 'NGF', patterns: [/\bngf\b/i, /nerve\s+growth\s+factor/i, /神经生长因子/i] },
  { canonical: 'DAT', patterns: [/\bdat1\b/i, /\bslc6a3\b/i, /dopamine\s+transporter/i, /多巴胺转运蛋白/i] }
];

const NON_BIOMEDICAL_CONTEXT_PATTERNS = [
  /(电脑|计算机|手机|iphone|安卓|windows|macos|mac|浏览器|edge|chrome|网络|wifi|路由器|服务器|网站|数据库|硬盘|文件|u盘|邮箱|微信|账号|软件|程序|代码|app|应用|操作系统).{0,18}(病毒|中毒|木马|勒索|恶意软件|被黑|黑客|入侵|网络攻击|钓鱼)/,
  /(病毒|中毒|木马|勒索|恶意软件|被黑|黑客|入侵|网络攻击|钓鱼).{0,18}(电脑|计算机|手机|iphone|安卓|windows|macos|mac|浏览器|edge|chrome|网络|wifi|路由器|服务器|网站|数据库|硬盘|文件|u盘|邮箱|微信|账号|软件|程序|代码|app|应用|操作系统)/,
  /电脑中病毒|计算机病毒|手机中病毒|系统中毒|杀毒|杀软|防火墙|勒索软件|木马病毒|malware|ransomware|trojan|computer virus|cybersecurity|cyber security|hacked|phishing/
];

const NON_BIOMEDICAL_TOPIC_PATTERN = /电脑|计算机|手机|iphone|安卓|windows|macos|mac|浏览器|edge|chrome|网络|wifi|路由器|服务器|网站|数据库|硬盘|文件|u盘|邮箱|微信|账号|软件|程序|代码|app|应用|操作系统|黑客|木马|勒索软件|恶意软件|杀毒|防火墙|cybersecurity|cyber security|computer|phone|browser|server|database|malware|ransomware|trojan|phishing|hacked/;
const NON_DESIGN_QUESTION_PATTERN = /天气|气温|下雨|今天|明天|昨天|几点|时间|日期|新闻|股价|股票|汇率|路况|天气预报|weather|temperature|rain|today|tomorrow|yesterday|stock|exchange rate|news/;
const BIOMEDICAL_CONTEXT_PATTERN = /抗体|单抗|单克隆|抗原|靶点|表位|蛋白|细胞|受体|配体|通路|疾病|治疗|药物|药物分子|治疗分子|候选药物|肿瘤|癌|白血病|髓系|AML|哮喘|过敏|皮炎|湿疹|嗜酸性|炎症|自身免疫|类风湿|关节炎|骨关节炎|骨质疏松|疼痛|慢性疼痛|红斑狼疮|狼疮|系统性红斑狼疮|重症肌无力|甲状腺眼病|graves|parkinson|帕金森|视神经脊髓炎|nmosd|感染|病原|细菌|真菌|病毒|疫苗|免疫|生物|分子|植物病原|肥胖|糖尿病|银屑病|阿尔茨海默|老年痴呆|amyloid|aβ|abeta|tau|trem2|心肌炎|心肌病|代谢|流感|神经氨酸酶|血凝素|多动症|注意缺陷|多巴胺|神经可塑性|pd-1|pd-l1|ctla-4|il-33|il-5|il-13|il-4r|il-6r|st2|baff|blys|tnfsf13b|fcrn|fcgrt|alpha4beta7|α4β7|a4b7|itga4\/itgb7|ngf|trka|ntrk1|nerve growth factor receptor|her2|erbb2|her3|erbb3|c-?met|hepatocyte growth factor receptor|fgfr2|fibroblast growth factor receptor 2|kgfr|k-sam|fgfr3|fibroblast growth factor receptor 3|tnf|egfr|vegf|igf1r|igf-1 receptor|insulin[-\s]*like growth factor 1 receptor|muc1|mesothelin|msln|claudin\s*18(?:\s*[\.-]?\s*2)?|cldn\s*18(?:\s*[\.-]?\s*2)?|b7-h3|cd276|b7-h4|vtcn1|b7x|b7s1|caix|ca9|carbonic anhydrase ix|epcam|tacstd1|trop1|gpc2|glypican\s*-?\s*2|cerebroglycan|gpc3|ceacam5|cea|ceacam6|nectin\s*-?\s*4|nectin4|pvrl4|gprc5d|steap1|tissue factor|cd142|\bf3\b|folr1|folate receptor alpha|psma|folh1|dll3|tshr|thyrotropin receptor|aqp4|aquaporin\s*-?\s*4|alpha[\s-]*synuclein|α[\s-]*synuclein|\bsnca\b|突触核蛋白|sost|sclerostin|rankl|tnfsf11|trance|dkk1|cd3|cd19|cd20|cd25|cd33|siglec3|siglec-3|cd38|cd47|cd123|il3ra|bcma|tigit|lag-3|trop-2|ige|cgrp|slc6a3|ntrk2|trkb|dat1|dopamine transporter|mab|fab|vhh|scfv|biolog|biomedical|therapeutic|therapeutic molecule|drug|medicine|tumou?r|cancer|leukemia|asthma|allergy|dermatitis|eczema|inflammation|autoimmune|lupus|sle|myasthenia|gravis|gmg|osteoarthritis|osteoporosis|pain|infection|pathogen|bacteria|fungal|viral|myocarditis|adhd|antigen|target|epitope|protein|receptor|ligand|immune|vaccine|antibody|monoclonal/;
const ANTIBODY_DESIGN_OBJECT_PATTERN = /单克隆抗体|单抗|抗体|候选抗体|抗体候选|纳米抗体|单域抗体|片段抗体|候选|分子|药物|药物分子|治疗分子|候选药物|结合体|结合序列|候选序列|抗体序列|单抗序列|binder|drug|medicine|therapeutic molecule|antibody|monoclonal|mab|nanobody|vhh|fab|scfv/i;
const DESIGN_ACTION_PATTERN = /设计|生成|开发|构建|筛选|做|来一个|来一批|制备|获得|输出|design|generate|create|make|develop/i;
const DESIGN_REQUEST_PATTERN = /(设计|生成|开发|构建|筛选|做|来一个|来一批|制备|获得|输出|design|generate|create|make|develop).{0,100}(单克隆抗体|单抗|抗体|候选抗体|抗体候选|纳米抗体|单域抗体|片段抗体|候选|分子|药物|药物分子|治疗分子|候选药物|结合体|结合序列|候选序列|抗体序列|单抗序列|binder|drug|medicine|therapeutic molecule|antibody|monoclonal|mab|nanobody|vhh|fab|scfv)|(单克隆抗体|单抗|抗体|药物|药物分子|治疗分子|mab|antibody|binder|drug|medicine).{0,50}(设计|生成|开发|筛选|design|generate|develop)/i;
const EXPLICIT_TARGET_CONTEXT_PATTERN = /(?:靶点|抗原|蛋白|受体|配体|因子|细胞因子|target|antigen|protein|receptor|ligand|cytokine)\s*(?:是|为|:|：)?|(?:针对|靶向|结合|中和|阻断|抗)\s*(?:human\s+)?(?:[A-Z0-9][A-Z0-9()._\-\/]{1,50}|[A-Za-z]{2,}[A-Za-z0-9()._\-\/]{0,50}|[\u4e00-\u9fff][\u4e00-\u9fffA-Za-z0-9()._\-\/]{1,50})/i;
const TARGET_LIKE_PATTERN = /(?:病毒|病原|细菌|真菌|毒素|抗原|蛋白|受体|配体|因子|细胞因子|酶|激酶|通道|叶绿体|线粒体|细胞器|生物材料|virus|viral|pathogen|bacteria|bacterial|fungal|toxin|antigen|protein|receptor|ligand|cytokine|enzyme|kinase|chloroplast|mitochondria|organelle)|(?:[A-Z][A-Z0-9]{1,8}(?:-[A-Z0-9]{1,6})?(?:\/[A-Z][A-Z0-9-]{1,8})?)/;
const DISEASE_INDICATION_PATTERN = /肥胖|糖尿病|银屑病|阿尔茨海默|老年痴呆|代谢病|代谢疾病|心肌炎|心肌病|心血管|高血脂|高脂血症|多动症|注意缺陷|注意缺陷多动障碍|白血病|髓系|AML|癌|肿瘤|哮喘|过敏|皮炎|湿疹|嗜酸性|炎症|炎症性肠病|溃疡性结肠炎|克罗恩|类风湿|关节炎|骨关节炎|骨质疏松|疼痛|慢性疼痛|红斑狼疮|狼疮|系统性红斑狼疮|重症肌无力|甲状腺眼病|graves|graves disease|thyroid eye disease|parkinson|parkinson's disease|帕金森|帕金森病|视神经脊髓炎|neuromyelitis optica|nmosd|感染|obesity|diabetes|psoriasis|alzheimer|myocarditis|cardiomyopathy|metabolic|cardiovascular|adhd|attention deficit|hyperactivity|leukemia|myeloid|cancer|asthma|allergy|dermatitis|eczema|inflammation|arthritis|osteoarthritis|osteoporosis|pain|chronic pain|ulcerative colitis|crohn|ibd|lupus|sle|myasthenia|myasthenia gravis|gmg/i;

function normalizeCommandText(input) {
  return String(input || '')
    .toLowerCase()
    .replace(/pd[\s-]*one/g, 'pd-1')
    .replace(/pd[\s-]*l[\s-]*one/g, 'pd-l1')
    .replace(/pdl1/g, 'pd-l1')
    .replace(/pd1/g, 'pd-1')
    .replace(/[，。！？、；：,.!?;:]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeInfluenzaHaSubtypeDisplay(input) {
  const raw = String(input || '').trim();
  if (!raw || /(?:neuraminidase|神经氨酸酶|\bNA\b)/i.test(raw)) return '';
  const hasInfluenzaContext = /influenza|flu|流感|禽流感|hemagglutinin|ha\b|血凝素/i.test(raw);
  const subtypeMatch = raw.match(/\bH\s*(1[0-8]|[1-9])\s*(?:N\s*\d+)?\b/i) ||
    raw.match(/H\s*(1[0-8]|[1-9])\s*N\s*\d+/i);
  if (!hasInfluenzaContext || !subtypeMatch) return '';
  return 'Influenza A(H' + Number(subtypeMatch[1]) + ') hemagglutinin (HA)';
}

function normalizeTargetAlias(target) {
  let value = String(target || '').trim();
  if (!value) return '';
  value = value
    .replace(/\s*\/\s*/g, '/')
    .replace(/\s*-\s*/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/^human\s+/i, '')
    .trim();
  const influenzaHaSubtype = normalizeInfluenzaHaSubtypeDisplay(value);
  if (influenzaHaSubtype) return influenzaHaSubtype;
  const compact = value.toLowerCase().replace(/\s+/g, '');
  if (/^pd-?l-?1$/.test(compact) || compact === 'pdl1') return 'PD-L1';
  if (/^pd-?1$/.test(compact) || compact === 'pd1') return 'PD-1';
  if (/^ctla-?4$/.test(compact) || compact === 'cd152') return 'CTLA-4';
  if (/^il-?33$/.test(compact) || compact === 'il33') return 'IL-33';
  if (/^il-?6$/.test(compact) || compact === 'il6' || compact === 'interleukin6') return 'IL-6';
  if (/^il-?5$/.test(compact) || compact === 'il5' || compact === 'interleukin5') return 'IL-5';
  if (/^il-?13$/.test(compact) || compact === 'il13' || compact === 'interleukin13') return 'IL-13';
  if (/^(baff|blys|tnfsf13b|tall1|bcellactivatingfactor)$/.test(compact)) return 'BAFF';
  if (/^(fcrn|fcgrt|neonatalfcreceptor|iggfcfragmentreceptortransporteralphachain)$/.test(compact)) return 'FcRn';
  if (/^(integrin)?(α|a|alpha)4(β|b|beta)7$/.test(compact) || compact === 'a4b7' || compact === 'alpha4beta7' || compact === 'itga4/itgb7') return 'Integrin α4β7';
  if (/^her-?2$/.test(compact) || compact === 'erbb2') return 'HER2';
  if (/^(her-?3|erbb-?3)$/.test(compact)) return 'HER3';
  if (/^cd-?20$/.test(compact) || compact === 'ms4a1') return 'CD20';
  if (/^cd-?19$/.test(compact)) return 'CD19';
  if (/^cd-?3(?:e|epsilon|ε)?$/.test(compact)) return 'CD3';
  if (/^muc-?1$/.test(compact) || compact === 'cd227') return 'MUC1';
  if (compact === 'mesothelin' || compact === 'msln') return 'Mesothelin';
  if (/^(claudin18(?:[.\-]?2)?|cldn18(?:[.\-]?2)?)$/.test(compact)) return 'Claudin 18.2';
  if (/^(b7-?h3|cd-?276)$/.test(compact)) return 'B7-H3';
  if (/^(caix|ca-?9|carbonicanhydrase(?:ix|9)|g250)$/.test(compact)) return 'CAIX';
  if (/^(amyloid-?beta|amyloidβ|amyloid-?β|amyloidbeta|abeta|aβ)$/.test(compact)) return 'Amyloid-beta';
  if (/^(tau|mapt|microtubule-?associatedproteintau)$/.test(compact)) return 'Tau';
  if (/^(trem-?2)$/.test(compact)) return 'TREM2';
  if (/^gpc-?3$/.test(compact) || compact === 'glypican3') return 'GPC3';
  if (/^(epcam|ep-?cam|tacstd-?1|trop-?1)$/.test(compact)) return 'EpCAM';
  if (/^(nectin-?4|nectin4|pvrl-?4|pvrl4)$/.test(compact)) return 'Nectin-4';
  if (compact === 'gprc5d') return 'GPRC5D';
  if (/^(ceacam-?5|cea|cd-?66e)$/.test(compact)) return 'CEACAM5';
  if (/^ceacam-?6$/.test(compact) || compact === 'cd66c') return 'CEACAM6';
  if (/^steap-?1$/.test(compact)) return 'STEAP1';
  if (/^(tissuefactor|f3|cd-?142|thromboplastin)$/.test(compact)) return 'Tissue Factor';
  if (/^(folr-?1|folatereceptoralpha|fr-?alpha|frα)$/.test(compact)) return 'FOLR1';
  if (/^(psma|folh-?1)$/.test(compact)) return 'PSMA';
  if (/^dll-?3$/.test(compact)) return 'DLL3';
  if (/^(gpc-?2|glypican2|cerebroglycan)$/.test(compact)) return 'GPC2';
  if (compact === 'drd4' || compact === 'dopamined4receptor') return 'DRD4';
  if (/^(igf-?1r|igf1r|igf-?1receptor|insulin-?likegrowthfactor1receptor)$/.test(compact)) return 'IGF1R';
  if (/^(glp-?1r|glp1r|glp1receptor|glucagonlikepeptide1receptor)$/.test(compact)) return 'GLP1R';
  if (compact === 'myostatin' || compact === 'gdf8') return 'Myostatin';
  if (/^(met|c-?met|hgfreceptor|hepatocytegrowthfactorreceptor|proto-oncogenec-?met)$/.test(compact)) return 'MET';
  if (/^(fgfr-?2|fibroblastgrowthfactorreceptor2|kgfr|k-?sam)$/.test(compact)) return 'FGFR2';
  if (/^(fgfr-?3|fibroblastgrowthfactorreceptor3|jtk4)$/.test(compact)) return 'FGFR3';
  if (/^(actriia|acvr2a|activinreceptortypeiia|activintypeiiareceptor)$/.test(compact)) return 'ActRIIA';
  if (/^(actriib|acvr2b|activinreceptortypeiib|activintypeiibreceptor)$/.test(compact)) return 'ActRIIB';
  if (/^(tshr|thyrotropinreceptor|thyroidstimulatinghormonereceptor)$/.test(compact)) return 'TSHR';
  if (/^(aqp-?4|aquaporin-?4)$/.test(compact)) return 'AQP4';
  if (/^(alpha-?synuclein|α-?synuclein|snca|突触核蛋白)$/.test(compact)) return 'alpha-synuclein';
  if (/^(sost|sclerostin)$/.test(compact)) return 'SOST';
  if (/^(rankl|tnfsf11|trance|receptoractivatorofnuclearfactorkappa-bligand)$/.test(compact)) return 'RANKL';
  if (/^(dkk-?1|dkk1|dickkopf-relatedprotein1)$/.test(compact)) return 'DKK1';
  if (/^(trk-?a|ntrk-?1|highaffinitynervegrowthfactorreceptor|nervegrowthfactorreceptortrka)$/.test(compact)) return 'TrkA';
  if (/^(b7-?h4|b7h4|vtcn-?1|b7x|b7s1)$/.test(compact)) return 'B7-H4';
  if (/^c-?5$/.test(compact) || compact === 'complementc5') return 'C5';
  if (/^il-?6-?r$/.test(compact) || compact === 'il6r' || compact === 'cd126') return 'IL-6R';
  if (/^il-?4-?r(?:a|α|alpha)?$/.test(compact) || compact === 'il4ra' || compact === 'cd124') return 'IL-4Rα';
  if (/^cd-?25$/.test(compact) || compact === 'il2ra') return 'CD25';
  if (/^cd-?38$/.test(compact)) return 'CD38';
  if (/^cd-?123$/.test(compact) || /^(il-?3-?r(?:a|alpha)?|il3ra|interleukin3receptorsubunitalpha)$/.test(compact)) return 'CD123';
  if (/^(cd-?33|siglec-?3|siglec3|myeloidcellsurfaceantigencd33)$/.test(compact)) return 'CD33';
  if (compact === 'tigit') return 'TIGIT';
  if (/^cd-?47$/.test(compact)) return 'CD47';
  if (/^lag-?3$/.test(compact)) return 'LAG-3';
  if (/^trop-?2$/.test(compact) || compact === 'tacstd2') return 'TROP-2';
  if (compact === 'bcma' || compact === 'tnfrsf17' || compact === 'cd269') return 'BCMA';
  if (compact === 'ige') return 'IgE';
  if (/^(cgrpreceptor|cgrpr|calcrl)$/.test(compact)) return 'CGRP receptor';
  if (compact === 'vegfa' || compact === 'vegf-a') return 'VEGF-A';
  if (/^il-?17-?a$/.test(compact) || compact === 'il17a') return 'IL-17A';
  if (/^il-?23$/.test(compact) || compact === 'il23') return 'IL-23';
  if (/^il-?1(?:b|β|beta)$/.test(compact) || compact === 'il1b') return 'IL-1β';
  if (/^rsv-?f$/.test(compact)) return 'RSV F';
  if (/^(sars-cov-2rbd|sars-cov-2-rbd|sar-cov-2rbd|rbd)$/.test(compact)) return 'SARS-CoV-2 RBD';
  if (/^(influenzana|influenza-na|fluna|na)$/.test(compact)) return 'Influenza NA';
  if (/^(influenzaha|influenza-ha|fluha|ha)$/.test(compact)) return 'Influenza HA';
  if (/^tnf(?:-?(?:a|alpha|α))?$/.test(compact)) return 'TNF';
  if (/^(dat|dat1|slc6a3|dopaminetransporter)$/.test(compact)) return 'DAT';
  return value;
}

function shouldSuppressDesignWorkflow(input) {
  const lower = normalizeCommandText(input);
  if (!lower) return false;
  if (NON_BIOMEDICAL_CONTEXT_PATTERNS.some(pattern => pattern.test(lower))) return true;
  if (NON_DESIGN_QUESTION_PATTERN.test(lower) && !EXPLICIT_TARGET_CONTEXT_PATTERN.test(lower)) return true;
  return NON_BIOMEDICAL_TOPIC_PATTERN.test(lower) && !BIOMEDICAL_CONTEXT_PATTERN.test(lower);
}

function hasBiomedicalContext(input) {
  return BIOMEDICAL_CONTEXT_PATTERN.test(normalizeCommandText(input));
}

function parseCount(input, fallback = 10) {
  const raw = String(input || '');
  const match = raw.match(/(\d+)\s*(?:个|条|组|支|候选|pass|passing|candidate|candidates)/i) ||
    raw.match(/(?:设计|生成|开发|筛选|design|generate|create|make|develop)\s*(\d+)/i);
  if (match) return Math.min(Math.max(parseInt(match[1], 10), 1), 200);

  const chineseMatch = raw.match(/(?:设计|生成|开发|构建|筛选|做|来|获得|制备|给我|帮我|需要|输出)?\s*(一|二|两|三|四|五|六|七|八|九|十)\s*(?:个|条|组|支|款|种|份|候选)?\s*(?:高亲和力|高特异性|候选|抗体|分子|药物|binder|drug|medicine|antibody|nanobody|vhh|fab|scfv)/i) ||
    raw.match(/(?:设计|生成|开发|构建|筛选|做|获得|制备|输出)\s*(一|二|两|三|四|五|六|七|八|九|十)\s*(?:个|条|组|支|款|份|候选)?\s*(?=针对|靶向|面向|用于|结合|中和|阻断)/i) ||
    raw.match(/(?:设计|生成|开发|构建|筛选|做|获得|制备|输出)\s*(一|二|两|三|四|五|六|七|八|九|十)\b/i);
  if (!chineseMatch) return fallback;
  const chineseCounts = {
    '一': 1,
    '二': 2,
    '两': 2,
    '三': 3,
    '四': 4,
    '五': 5,
    '六': 6,
    '七': 7,
    '八': 8,
    '九': 9,
    '十': 10
  };
  return chineseCounts[chineseMatch[1]] || fallback;
}

function parseAbType(input, fallback = 'Fab') {
  const raw = String(input || '');
  if (/vhh|nanobod|纳米抗体|单域抗体/i.test(raw)) return 'VHH';
  if (/scfv/i.test(raw)) return 'scFv';
  if (/\bigg\b|全长抗体/i.test(raw)) return 'IgG';
  if (/单抗|单克隆抗体|\bmab\b|monoclonal/i.test(raw)) return 'mAb';
  if (/fab\b|片段抗体/i.test(raw)) return 'Fab';
  return fallback;
}

function extractKnownTarget(input) {
  const raw = String(input || '');
  if (/(?:狗|犬源|犬用|canine)[^，。；;]{0,32}(?:\bNGF\b|nerve growth factor|神经生长因子)/i.test(raw) ||
      /(?:\bNGF\b|nerve growth factor|神经生长因子)[^，。；;]{0,32}(?:狗|犬源|犬用|canine)/i.test(raw)) {
    return { target: 'Canine NGF', blockTarget: null };
  }
  const pair = raw.match(/(PD\s*-?\s*1)\s*\/\s*(PD\s*-?\s*L\s*-?\s*1)|(PD\s*-?\s*L\s*-?\s*1)\s*\/\s*(PD\s*-?\s*1)/i);
  if (pair) return { target: 'PD-L1', blockTarget: 'PD-1' };
  const influenzaHaSubtype = normalizeInfluenzaHaSubtypeDisplay(raw);
  if (influenzaHaSubtype) return { target: influenzaHaSubtype, blockTarget: null };
  for (const item of KNOWN_TARGET_ALIASES) {
    if (item.patterns.some(pattern => pattern.test(raw))) {
      return { target: item.canonical, blockTarget: null };
    }
  }
  return { target: '', blockTarget: null };
}

function trimTargetCandidate(value) {
  let target = String(value || '').trim();
  target = target
    .replace(/^[\s:：,，。的]+|[\s:：,，。的]+$/g, '')
    .replace(/^(?:一个|一种|一类|某个|某种)\s*/i, '')
    .replace(/^(?:some|a|an)\s+/i, '')
    .replace(/^(?:请|帮我|为|给|针对|靶向|结合|中和|阻断|开发|设计|生成|做|来一个|筛选)+/g, '')
    .replace(/^(?:一个|一种|一类|某个|某种)\s*/i, '')
    .replace(/^(?:some|a|an)\s+/i, '')
    .replace(/^(?:高亲和力|高特异性|中和性|候选|可打印|用于检测|用于治疗|抗)+/g, '')
    .replace(/(?:请|帮我|为|给)?(?:设计|生成|开发|构建|筛选|做|来一个|制备|获得)\s*\d*\s*(?:个|条|组|支)?\s*$/i, '')
    .replace(/(?:设计|生成|开发|构建|筛选|做|来一个|来一批|制备|获得|输出)\s*\d*\s*(?:个|条|组|支|款|份|候选)?\s*$/i, '')
    .replace(/(?:的)?(?:候选)?(?:单克隆抗体|单抗序列|抗体序列|单抗|候选抗体|抗体候选|抗体|分子|药物|治疗分子|binder|drug|medicine|monoclonal\s+antibody|antibody|nanobody|vhh|fab|scfv).*$/i, '')
    .replace(/^(?:\d+\s*(?:个|条|组|支)?)\s*/g, '')
    .replace(/^(?:一|二|两|三|四|五|六|七|八|九|十)\s*(?:个|条|组|支|款|份|候选)?\s*/g, '')
    .trim();
  target = target.replace(/^抗(?=.{2,})/, '').trim();
  target = target.replace(/[“”"']/g, '').trim();
  if (target.length > 48) target = target.slice(0, 48).trim();
  return normalizeTargetAlias(target);
}

function extractUnknownTarget(input) {
  const raw = String(input || '').trim();
  const patterns = [
    /(?:靶点|抗原|目标抗原|target|antigen)\s*(?:是|为|:|：|=)\s*([^，。！？、,.!?;；:：\n]{2,60})/i,
    /(?:以|用|使用|指定|选择)\s*([^，。！？、,.!?;；:：\n]{2,60}?)(?:作为|为)\s*(?:靶点|抗原|目标抗原|target|antigen)/i,
    /(?:设计|生成|开发|构建|筛选|做|来一个|制备|获得)\s*(?:\d+\s*(?:个|条|组|支|款)?\s*)?(?:高亲和力|高特异性|中和性|候选|可打印|用于检测|用于治疗)?\s*(?:针对|靶向|结合|中和|阻断|抗)?\s*([^，。！？、,.!?;；:：\n]{2,60}?)(?:的)?(?:单克隆抗体|单抗|候选抗体|抗体候选|抗体|分子|药物|治疗分子|binder|drug|medicine|monoclonal\s+antibody|antibody|nanobody|vhh|fab|scfv)/i,
    /(?:设计|生成|开发|构建|筛选|做|来一个|来一批|制备|获得|输出)\s*(?:\d+\s*(?:个|条|组|支|款)?\s*)?(?:具有结合活性|结合活性|高亲和力|高特异性|中和性|候选|可打印|用于检测|用于治疗)?\s*(?:针对|靶向|结合|中和|阻断|抗)?\s*([^，。！？、,.!?;；:：\n]{2,60}?)(?:的)?(?:单克隆抗体|单抗序列|抗体序列|单抗|候选抗体|抗体候选|抗体|候选序列|结合序列|分子|药物|治疗分子|binder|drug|medicine|monoclonal\s+antibody|monoclonal|mab|antibody|nanobody|vhh|fab|scfv)/i,
    /(?:针对|靶向|结合|中和|阻断|抗)\s*([^，。！？、,.!?;；:：\n]{2,60}?)(?:的)?(?:抗体|候选|分子|药物|治疗分子|binder|drug|medicine|antibody)/i,
    /(?:anti[-\s]?)([A-Za-z0-9][A-Za-z0-9\s().βα\-\/]{1,60})(?:\s+(?:antibody|Fab|VHH|nanobody)|抗体|候选)/i
  ];
  for (const pattern of patterns) {
    const match = raw.match(pattern);
    if (!match) continue;
    const target = trimTargetCandidate(match[1]);
    if (isPlausibleTarget(target, raw)) return target;
  }
  return '';
}

function extractExplicitTargetDeclaration(input) {
  const raw = String(input || '').trim();
  if (!raw || shouldSuppressDesignWorkflow(raw)) return '';
  const patterns = [
    /(?:靶点|抗原|目标抗原|target|antigen)\s*(?:是|为|:|：|=|is)\s*([^，。！？、,.!?;；:：\n]{2,60})/i,
    /(?:以|用|使用|指定|选择)\s*([^，。！？、,.!?;；:：\n]{2,60}?)(?:作为|为)\s*(?:靶点|抗原|目标抗原|target|antigen)/i,
    /(?:targeting|targets?|bind(?:ing)? to)\s+(?:human\s+)?([A-Za-z0-9][A-Za-z0-9()._\-\/\s]{1,60})/i,
    /(?:靶向|针对|结合|中和|阻断)\s*(?:human\s+)?([^，。！？、,.!?;；:：\n]{2,60}?)(?=\s*(?:的)?\s*(?:单克隆抗体|单抗序列|抗体序列|单抗|候选抗体|抗体候选|抗体|候选序列|结合序列|分子|药物|治疗分子|binder|drug|medicine|monoclonal\s+antibody|monoclonal|mab|antibody|nanobody|vhh|fab|scfv)\b|\s*(?:设计|生成|开发|构建|筛选|做|来一个|来一批|制备|获得|输出)|\s*(?:靶点|抗原|蛋白)\b|$)/i
  ];
  for (const pattern of patterns) {
    const match = raw.match(pattern);
    if (!match) continue;
    const target = trimTargetCandidate(match[1]);
    if (target && !isDiseaseIndication(target) && isPlausibleTarget(target, raw)) return target;
  }
  return '';
}

function extractDiseaseIndication(input) {
  const raw = String(input || '').trim();
  if (!raw || shouldSuppressDesignWorkflow(raw)) return '';
  const patterns = [
    /(?:请|帮我|为|给)?(?:为|给|针对|面向|用于治疗|治疗)\s*([^，。！？、,.!?;；:：\n]{2,40}?)(?:设计|生成|开发|构建|筛选|做|制备|获得)\s*(?:\d+|一|二|两|三|四|五|六|七|八|九|十)?\s*(?:个|条|组|支|款|份|候选)?\s*(?:抗体|候选抗体|抗体候选|分子|药物|治疗分子|binder|drug|medicine|antibody|nanobody|vhh|fab|scfv)/i,
    /(?:设计|生成|开发|构建|筛选|做|来一个|制备|获得)\s*(?:\d+\s*(?:个|条|组|支|款)?\s*)?(?:一个|一种|一类|某个|某种|一款)?\s*(?:针对|靶向|面向|治疗|用于治疗|用于)?\s*([^，。！？、,.!?;；:：\n]{2,40}?)(?:的)?(?:抗体|候选抗体|抗体候选|分子|药物|治疗分子|binder|drug|medicine|antibody|nanobody|vhh|fab|scfv)/i,
    /(?:针对|靶向|面向|治疗|用于治疗|用于)\s*([^，。！？、,.!?;；:：\n]{2,40}?)(?:的)?(?:抗体|候选|分子|药物|治疗分子|binder|drug|medicine|antibody)/i
  ];
  for (const pattern of patterns) {
    const match = raw.match(pattern);
    if (!match) continue;
    const value = trimTargetCandidate(match[1]);
    if (isDiseaseIndication(value)) return value;
  }
  return '';
}

function isDiseaseIndication(value) {
  const text = String(value || '').trim();
  if (!text) return false;
  if (extractKnownTarget(text).target) return false;
  if (TARGET_LIKE_PATTERN.test(text) && !DISEASE_INDICATION_PATTERN.test(text)) return false;
  return DISEASE_INDICATION_PATTERN.test(text);
}

function isPlausibleTarget(target, sourceText = '') {
  if (!target || target.length < 2) return false;
  if (/^(高亲和力|高特异性|结合活性|特异性结合|候选|完整|一次|一个|一款|一种|几个|几款|几种|抗体|单抗|单克隆|分子|药物|治疗分子|模型|结构|打印|设计)$/.test(target)) return false;
  if (!/[\u4e00-\u9fffA-Za-z0-9]/.test(target)) return false;
  if (TARGET_LIKE_PATTERN.test(target)) return true;
  if (/^[\u4e00-\u9fffA-Za-z0-9][\u4e00-\u9fffA-Za-z0-9()._\-\/\s]{1,48}$/.test(target) && EXPLICIT_TARGET_CONTEXT_PATTERN.test(sourceText)) return true;
  return false;
}

function extractDesignRequest(input) {
  const raw = String(input || '').trim();
  if (!raw || shouldSuppressDesignWorkflow(raw)) {
    return { isDesignRequest: false, count: 10, target: '', blockTarget: null, abType: 'Fab' };
  }
  const hasDesignIntent = DESIGN_REQUEST_PATTERN.test(raw);
  const known = extractKnownTarget(raw);
  const hasKnownTargetDesignIntent = Boolean(known.target) && DESIGN_ACTION_PATTERN.test(raw) && ANTIBODY_DESIGN_OBJECT_PATTERN.test(raw);
  if (!hasDesignIntent && !(DESIGN_ACTION_PATTERN.test(raw) && ANTIBODY_DESIGN_OBJECT_PATTERN.test(raw)) && !hasKnownTargetDesignIntent) {
    return { isDesignRequest: false, count: 10, target: '', blockTarget: null, abType: 'Fab' };
  }
  if (!known.target && !hasBiomedicalContext(raw) && !/(病毒|病原|抗原|抗体|单抗|单克隆|protein|antigen|antibody|monoclonal|mab|virus|viral)/i.test(raw)) {
    return { isDesignRequest: false, count: 10, target: '', blockTarget: null, abType: 'Fab' };
  }
  const explicitTarget = extractExplicitTargetDeclaration(raw);
  const diseaseIndication = extractDiseaseIndication(raw);
  const target = known.target || explicitTarget || extractUnknownTarget(raw) || diseaseIndication;
  return {
    isDesignRequest: true,
    count: parseCount(raw, 10),
    target,
    blockTarget: known.blockTarget,
    abType: parseAbType(raw, 'Fab'),
    hasExplicitTarget: Boolean(target)
  };
}

function targetHash(input) {
  const value = String(input || '');
  let hash = 2166136261;
  for (const ch of value) {
    hash ^= ch.charCodeAt(0);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash.toString(36);
}

function inferDiseaseDirection(target) {
  const value = String(target || '');
  if (/烟草|植物|花叶|tobacco mosaic|tmv/i.test(value)) return '植物病毒抗原识别方向';
  if (/病毒|virus|viral|rbd|ha|rsv/i.test(value)) return '病毒抗原相关方向';
  if (/细菌|菌|bacteria|bacterial/i.test(value)) return '病原抗原相关方向';
  if (/肿瘤|癌|cancer|tumou?r/i.test(value)) return '肿瘤相关抗原方向';
  if (/炎症|免疫|il-|tnf|cytokine|baff|blys|tnfsf13b|fcrn|fcgrt|alpha4beta7|α4β7|ibd|crohn|colitis|lupus|sle|myasthenia|gmg/i.test(value)) return '免疫炎症相关方向';
  if (/骨关节炎|疼痛|慢性疼痛|osteoarthritis|chronic pain|ngf/.test(value)) return '疼痛与神经营养因子相关方向';
  if (/多动症|注意缺陷|adhd|多巴胺|dopamine|slc6a3|dat1|dat|trkb|ntrk2/i.test(value)) return '神经递质调控相关方向';
  return '用户指定靶点方向';
}

function buildDynamicDemoRoute(input) {
  const parsed = extractDesignRequest(input);
  if (!parsed.isDesignRequest || !parsed.target) return null;
  const disease = inferDiseaseDirection(parsed.target);
  const blockText = parsed.blockTarget ? parsed.target + '/' + parsed.blockTarget + ' 相互作用' : parsed.target + ' 抗原可及表面';
  return {
    id: 'custom_target_' + targetHash(parsed.target).slice(0, 8),
    disease,
    systemUnderstanding: '围绕用户指定目标“' + parsed.target + '”进行抗体候选设计',
    target: parsed.target,
    blockTarget: parsed.blockTarget,
    abType: parsed.abType,
    count: parsed.count,
    printable: true,
    dynamic: true,
    displayStory: '围绕 ' + blockText + ' 生成抗体候选结构和可开发性评估结果。',
    keywords: []
  };
}

function buildGenericTargetProfile(target, blockTarget, abType) {
  const targetDisplay = normalizeTargetAlias(target) || '用户指定目标';
  const antibodyFormat = abType || 'Fab';
  const disease = inferDiseaseDirection(targetDisplay);
  const partnerDisplay = blockTarget ? normalizeTargetAlias(blockTarget) : '';
  const pairText = partnerDisplay ? targetDisplay + '/' + partnerDisplay : targetDisplay;
  const interfaceFocus = partnerDisplay ? pairText + ' 相互作用界面' : targetDisplay + ' 抗原可及表面';
  const selectedEpitope = partnerDisplay ? pairText + ' 邻近可及界面' : targetDisplay + ' 表面优先可及区域';
  const mechanism = partnerDisplay
    ? '阻断 ' + pairText + ' 相互作用，生成可进入结构评估的抗体候选'
    : '靶向识别 ' + targetDisplay + '，围绕抗原可及表面生成稳定结合的抗体候选';
  return {
    genericProfile: true,
    routeLabel: targetDisplay,
    disease,
    targetDisplay,
    partnerDisplay,
    domain: targetDisplay + ' 目标抗原可及结构区域',
    mechanism,
    evidence: targetDisplay + ' 目标需求证据包',
    evidenceSources: ['用户指定目标需求', targetDisplay + ' 抗原名称解析', '抗体可及性通用规则', '可开发性规则库'],
    referenceEntries: '当前目标需求条目：' + targetDisplay,
    structure: targetDisplay + ' 目标抗原可及表面与抗体骨架约束集合',
    structureRef: targetDisplay + ' 目标结构约束',
    structuralBasis: targetDisplay + ' 抗原-抗体结合构象展示',
    antibodies: [targetDisplay + ' 抗体候选背景', '同类抗原结合抗体设计经验'],
    interfaceFocus,
    selectedEpitope,
    epitopeRowsZh: [
      ['Site A', targetDisplay + ' 表面高可及区域', '直接服务于当前用户指定目标', '优先'],
      ['Site B', targetDisplay + ' 稳定外侧表面', '适合增强结合稳定性和多样性', '备选'],
      ['Site C', targetDisplay + ' 柔性或低可及区域', '构象不确定性较高', '谨慎']
    ],
    epitopeRowsEn: [
      ['Site A', targetDisplay + ' accessible surface', 'directly aligned with the user-specified target', 'primary'],
      ['Site B', targetDisplay + ' stable outer surface', 'useful for binding stability and diversity', 'backup'],
      ['Site C', targetDisplay + ' flexible or low-accessibility region', 'higher conformational uncertainty', 'caution']
    ],
    riskSummaryZh: '界面风险标注显示，当前路线应优先覆盖 ' + targetDisplay + ' 的抗体可及表面，同时避开低可及或高柔性区域。',
    riskSummaryEn: 'Interface-risk annotation prioritizes antibody-accessible surfaces on ' + targetDisplay + ' while avoiding low-accessibility or flexible regions.',
    structurePrepZh: '加载 ' + targetDisplay + ' 的目标约束，提取抗体可及表面并生成 ' + antibodyFormat + ' 设计输入。',
    structurePrepEn: 'Loaded target constraints for ' + targetDisplay + ' and prepared ' + antibodyFormat + ' design inputs around accessible antigen surfaces.',
    scaffold: antibodyFormat === 'VHH' ? 'VHH 纳米抗体骨架' : (antibodyFormat === 'Fab' ? 'Fab 片段抗体骨架' : antibodyFormat + ' 抗体骨架'),
    designMode: '用户指定目标抗体设计'
  };
}

module.exports = {
  normalizeCommandText,
  normalizeTargetAlias,
  shouldSuppressDesignWorkflow,
  extractDiseaseIndication,
  isDiseaseIndication,
  extractExplicitTargetDeclaration,
  parseDesignCount: parseCount,
  extractDesignRequest,
  buildDynamicDemoRoute,
  buildGenericTargetProfile
};
