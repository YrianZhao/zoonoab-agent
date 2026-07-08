'use strict';

const KNOWN_TARGET_ALIASES = [
  { canonical: 'PD-L1', patterns: [/pd\s*-?\s*l\s*-?\s*1/i, /pdl1/i] },
  { canonical: 'PD-1', patterns: [/pd\s*-?\s*1/i, /pd1/i] },
  { canonical: 'IL-33', patterns: [/il\s*-?\s*33/i, /il33/i] },
  { canonical: 'ST2', patterns: [/\bst2\b/i, /il1rl1/i] },
  { canonical: 'HER2', patterns: [/her\s*-?\s*2/i, /erbb\s*-?\s*2/i] },
  { canonical: 'EGFR', patterns: [/\begfr\b/i] },
  { canonical: 'VEGF-A', patterns: [/vegf\s*-?\s*a/i, /vegfa/i] },
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
  { canonical: 'IL-1β', patterns: [/il\s*-?\s*1\s*(?:β|b|beta)/i, /il1b/i] }
];

const NON_BIOMEDICAL_CONTEXT_PATTERNS = [
  /(电脑|计算机|手机|iphone|安卓|windows|macos|mac|浏览器|edge|chrome|网络|wifi|路由器|服务器|网站|数据库|硬盘|文件|u盘|邮箱|微信|账号|软件|程序|代码|app|应用|操作系统).{0,18}(病毒|中毒|木马|勒索|恶意软件|被黑|黑客|入侵|网络攻击|钓鱼)/,
  /(病毒|中毒|木马|勒索|恶意软件|被黑|黑客|入侵|网络攻击|钓鱼).{0,18}(电脑|计算机|手机|iphone|安卓|windows|macos|mac|浏览器|edge|chrome|网络|wifi|路由器|服务器|网站|数据库|硬盘|文件|u盘|邮箱|微信|账号|软件|程序|代码|app|应用|操作系统)/,
  /电脑中病毒|计算机病毒|手机中病毒|系统中毒|杀毒|杀软|防火墙|勒索软件|木马病毒|malware|ransomware|trojan|computer virus|cybersecurity|cyber security|hacked|phishing/
];

const NON_BIOMEDICAL_TOPIC_PATTERN = /电脑|计算机|手机|iphone|安卓|windows|macos|mac|浏览器|edge|chrome|网络|wifi|路由器|服务器|网站|数据库|硬盘|文件|u盘|邮箱|微信|账号|软件|程序|代码|app|应用|操作系统|黑客|木马|勒索软件|恶意软件|杀毒|防火墙|cybersecurity|cyber security|computer|phone|browser|server|database|malware|ransomware|trojan|phishing|hacked/;
const NON_DESIGN_QUESTION_PATTERN = /天气|气温|下雨|今天|明天|昨天|几点|时间|日期|新闻|股价|股票|汇率|路况|天气预报|weather|temperature|rain|today|tomorrow|yesterday|stock|exchange rate|news/;
const BIOMEDICAL_CONTEXT_PATTERN = /抗体|单抗|单克隆|抗原|靶点|表位|蛋白|细胞|受体|配体|通路|疾病|治疗|药物|药物分子|治疗分子|候选药物|肿瘤|癌|哮喘|过敏|炎症|自身免疫|类风湿|关节炎|感染|病原|细菌|真菌|病毒|疫苗|免疫|生物|分子|植物病原|肥胖|糖尿病|银屑病|阿尔茨海默|代谢|流感|神经氨酸酶|血凝素|pd-1|pd-l1|il-33|st2|her2|erbb2|tnf|egfr|vegf|cd3|cd20|bcma|mab|biolog|biomedical|therapeutic|therapeutic molecule|drug|medicine|tumou?r|cancer|asthma|allergy|inflammation|autoimmune|infection|pathogen|bacteria|fungal|viral|antigen|target|epitope|protein|receptor|ligand|immune|vaccine|antibody|monoclonal/;
const ANTIBODY_DESIGN_OBJECT_PATTERN = /抗体|单抗|单克隆抗体|候选抗体|抗体候选|纳米抗体|单域抗体|片段抗体|候选|分子|药物|药物分子|治疗分子|候选药物|结合体|结合序列|候选序列|抗体序列|单抗序列|binder|drug|medicine|therapeutic molecule|antibody|monoclonal|mab|nanobody|vhh|fab|scfv/i;
const DESIGN_ACTION_PATTERN = /设计|生成|开发|构建|筛选|做|来一个|来一批|制备|获得|输出|design|generate|create|make|develop/i;
const DESIGN_REQUEST_PATTERN = /(设计|生成|开发|构建|筛选|做|来一个|来一批|制备|获得|输出|design|generate|create|make|develop).{0,100}(抗体|单抗|单克隆抗体|候选抗体|抗体候选|纳米抗体|单域抗体|片段抗体|候选|分子|药物|药物分子|治疗分子|候选药物|结合体|结合序列|候选序列|抗体序列|单抗序列|binder|drug|medicine|therapeutic molecule|antibody|monoclonal|mab|nanobody|vhh|fab|scfv)|(抗体|单抗|单克隆抗体|药物|药物分子|治疗分子|mab|antibody|binder|drug|medicine).{0,50}(设计|生成|开发|筛选|design|generate|develop)/i;
const EXPLICIT_TARGET_CONTEXT_PATTERN = /(?:靶点|抗原|蛋白|受体|配体|因子|细胞因子|target|antigen|protein|receptor|ligand|cytokine)\s*(?:是|为|:|：)?|(?:针对|靶向|结合|中和|阻断|抗)\s*(?:human\s+)?(?:[A-Z0-9][A-Z0-9()._\-\/]{1,50}|[A-Za-z]{2,}[A-Za-z0-9()._\-\/]{0,50}|[\u4e00-\u9fff][\u4e00-\u9fffA-Za-z0-9()._\-\/]{1,50})/i;
const TARGET_LIKE_PATTERN = /(?:病毒|病原|细菌|真菌|毒素|抗原|蛋白|受体|配体|因子|细胞因子|酶|激酶|通道|virus|viral|pathogen|bacteria|bacterial|fungal|toxin|antigen|protein|receptor|ligand|cytokine|enzyme|kinase)|(?:[A-Z][A-Z0-9]{1,8}(?:-[A-Z0-9]{1,6})?(?:\/[A-Z][A-Z0-9-]{1,8})?)/;
const DISEASE_INDICATION_PATTERN = /肥胖|糖尿病|银屑病|阿尔茨海默|老年痴呆|代谢病|代谢疾病|心血管|高血脂|高脂血症|癌|肿瘤|哮喘|过敏|炎症|类风湿|关节炎|感染|obesity|diabetes|psoriasis|alzheimer|metabolic|cardiovascular|cancer|asthma|allergy|inflammation|arthritis/i;

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

function normalizeTargetAlias(target) {
  let value = String(target || '').trim();
  if (!value) return '';
  value = value
    .replace(/\s*\/\s*/g, '/')
    .replace(/\s*-\s*/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/^human\s+/i, '')
    .trim();
  const compact = value.toLowerCase().replace(/\s+/g, '');
  if (/^pd-?l-?1$/.test(compact) || compact === 'pdl1') return 'PD-L1';
  if (/^pd-?1$/.test(compact) || compact === 'pd1') return 'PD-1';
  if (/^il-?33$/.test(compact) || compact === 'il33') return 'IL-33';
  if (/^her-?2$/.test(compact) || compact === 'erbb2') return 'HER2';
  if (compact === 'vegfa' || compact === 'vegf-a') return 'VEGF-A';
  if (/^il-?17-?a$/.test(compact) || compact === 'il17a') return 'IL-17A';
  if (/^il-?23$/.test(compact) || compact === 'il23') return 'IL-23';
  if (/^il-?1(?:b|β|beta)$/.test(compact) || compact === 'il1b') return 'IL-1β';
  if (/^rsv-?f$/.test(compact)) return 'RSV F';
  if (/^(sars-cov-2rbd|sars-cov-2-rbd|sar-cov-2rbd|rbd)$/.test(compact)) return 'SARS-CoV-2 RBD';
  if (/^(influenzana|influenza-na|fluna|na)$/.test(compact)) return 'Influenza NA';
  if (/^(influenzaha|influenza-ha|fluha|ha)$/.test(compact)) return 'Influenza HA';
  if (/^tnf(?:-?(?:a|alpha|α))?$/.test(compact)) return 'TNF';
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
  const pair = raw.match(/(PD\s*-?\s*1)\s*\/\s*(PD\s*-?\s*L\s*-?\s*1)|(PD\s*-?\s*L\s*-?\s*1)\s*\/\s*(PD\s*-?\s*1)/i);
  if (pair) return { target: 'PD-L1', blockTarget: 'PD-1' };
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
    .replace(/^(?:一个|一种|一类|某个|某种|some|a|an)\s*/i, '')
    .replace(/^(?:请|帮我|为|给|针对|靶向|结合|中和|阻断|开发|设计|生成|做|来一个|筛选)+/g, '')
    .replace(/^(?:一个|一种|一类|某个|某种|some|a|an)\s*/i, '')
    .replace(/^(?:高亲和力|高特异性|中和性|候选|可打印|用于检测|用于治疗|抗)+/g, '')
    .replace(/(?:请|帮我|为|给)?(?:设计|生成|开发|构建|筛选|做|来一个|制备|获得)\s*\d*\s*(?:个|条|组|支)?\s*$/i, '')
    .replace(/(?:的)?(?:候选)?(?:抗体|分子|药物|治疗分子|binder|drug|medicine|antibody|nanobody|vhh|fab|scfv).*$/i, '')
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
    /(?:设计|生成|开发|构建|筛选|做|来一个|制备|获得)\s*(?:\d+\s*(?:个|条|组|支|款)?\s*)?(?:高亲和力|高特异性|中和性|候选|可打印|用于检测|用于治疗)?\s*(?:针对|靶向|结合|中和|阻断|抗)?\s*([^，。！？、,.!?;；:：\n]{2,60}?)(?:的)?(?:抗体|候选抗体|抗体候选|分子|药物|治疗分子|binder|drug|medicine|antibody|nanobody|vhh|fab|scfv)/i,
    /(?:设计|生成|开发|构建|筛选|做|来一个|来一批|制备|获得|输出)\s*(?:\d+\s*(?:个|条|组|支|款)?\s*)?(?:具有结合活性|结合活性|高亲和力|高特异性|中和性|候选|可打印|用于检测|用于治疗)?\s*(?:针对|靶向|结合|中和|阻断|抗)?\s*([^，。！？、,.!?;；:：\n]{2,60}?)(?:的)?(?:抗体|单抗|单克隆抗体|候选抗体|抗体候选|抗体序列|单抗序列|候选序列|结合序列|分子|药物|治疗分子|binder|drug|medicine|antibody|monoclonal|mab|nanobody|vhh|fab|scfv)/i,
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
    /(?:靶向|针对|结合|中和|阻断)\s*([A-Z0-9][A-Z0-9()._\-\/]{1,50}(?:\s*\/\s*[A-Z0-9][A-Z0-9()._\-\/]{1,50})?)(?:\s*(?:靶点|抗原|蛋白))?/i
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
  if (/^(高亲和力|候选|完整|一次|一个|一款|一种|抗体|分子|药物|治疗分子|模型|结构|打印|设计)$/.test(target)) return false;
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
  if (!hasDesignIntent && !(DESIGN_ACTION_PATTERN.test(raw) && ANTIBODY_DESIGN_OBJECT_PATTERN.test(raw))) {
    return { isDesignRequest: false, count: 10, target: '', blockTarget: null, abType: 'Fab' };
  }
  if (!hasBiomedicalContext(raw) && !/(病毒|病原|抗原|抗体|单抗|单克隆|protein|antigen|antibody|monoclonal|mab|virus|viral)/i.test(raw)) {
    return { isDesignRequest: false, count: 10, target: '', blockTarget: null, abType: 'Fab' };
  }
  const known = extractKnownTarget(raw);
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
  if (/炎症|免疫|il-|tnf|cytokine/i.test(value)) return '免疫炎症相关方向';
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
    structure: targetDisplay + ' 目标抗原可及表面与代表性抗体骨架约束集合',
    structureRef: targetDisplay + ' 代表性目标结构约束',
    structuralBasis: '本地代表性抗体-抗原结构用于候选构象展示；目标名称、候选标签和设计摘要来自当前用户需求。',
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
