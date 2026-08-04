#!/usr/bin/env node
'use strict';

/**
 * ZoonoAb 预生成脚本 — 为 8,635 个靶点批量生成选择理由和工作流文案
 *
 * 使用方式：
 *   node scripts/pregenerate_content.js --manifest <path> --csv <path> --output <dir>
 *   node scripts/pregenerate_content.js --retry-only --output <dir>
 *   node scripts/pregenerate_content.js --new-only --manifest <path> --output <dir>
 *
 * 环境变量：
 *   ASSISTANT_CHAT_API_KEY  — API Key（从 .runtime/voice-api-config.json 或环境变量读取）
 *   PREGEN_MODEL            — 模型名称（默认 gpt-5.5）
 *   PREGEN_BATCH_SIZE       — 每批并发数（默认 50）
 *   PREGEN_BATCH_INTERVAL   — 批间间隔毫秒（默认 2000）
 *   PREGEN_MAX_RETRIES      — 最大重试次数（默认 3）
 *   PREGEN_TIMEOUT          — 单请求超时毫秒（默认 30000）
 */

const fs = require('fs');
const path = require('path');

// ─── 配置 ───────────────────────────────────────────
const CONFIG = {
  batchSize: parseInt(process.env.PREGEN_BATCH_SIZE || '100', 10),
  batchInterval: parseInt(process.env.PREGEN_BATCH_INTERVAL || '2000', 10),
  maxRetries: parseInt(process.env.PREGEN_MAX_RETRIES || '3', 10),
  timeout: parseInt(process.env.PREGEN_TIMEOUT || '120000', 10),
  model: process.env.PREGEN_MODEL || 'gpt-5.4',
  promptVersion: 'v2.0'
};

// ─── API 配置 ──────────────────────────────────────
function loadApiConfig() {
  // 1. 尝试从 .runtime/voice-api-config.json 读取
  const configPath = path.join(__dirname, '..', '.runtime', 'voice-api-config.json');
  try {
    const raw = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const chat = raw.chat || {};
    // 优先用 fallback（gpt-5.5），其次 primary
    const provider = chat.fallback || chat.primary || {};
    if (provider.key && provider.url) {
      return {
        key: provider.key,
        url: provider.url,
        model: CONFIG.model,
        wireApi: provider.wireApi || 'responses',
        reasoningEffort: provider.reasoningEffort || 'none'
      };
    }
  } catch {}
  // 2. 从环境变量读取
  const key = process.env.ASSISTANT_CHAT_API_KEY || process.env.DEEPSEEK_API_KEY || '';
  const url = process.env.ASSISTANT_CHAT_BASE_URL || process.env.DEEPSEEK_CHAT_BASE_URL || '';
  if (key && url) {
    return { key, url, model: CONFIG.model, wireApi: 'responses', reasoningEffort: 'none' };
  }
  return null;
}

// ─── System Prompt ─────────────────────────────────
const SYSTEM_PROMPT = `你是 ZoonoAb 学术分子设计引擎的靶点文案生成模块。你的任务是为指定靶点生成完整的抗体设计工作流展示文案。

要求：
1. 所有内容必须以正式、严谨的学术分子设计口吻撰写，禁止口语化或任务执行口吻
2. 禁止出现"用户指定""根据请求""用户希望"等任务执行类表述
3. selectionReason 须 400-500 字，包含 6 个维度，每个维度 1-2 句话：
   ①疾病通路定位：靶点所在信号通路、在疾病中的病理角色、临床证据等级（是否有获批药物或进入临床试验）
   ②抗原结构基础：结构域架构、已知晶体结构分辨率、构象状态、糖基化或翻译后修饰对抗原性的影响
   ③表位可及性分析：胞外区拓扑特征、表面静电分布、已知表位簇位置、空间位障评估
   ④机制可解释性：具体阻断或激活的分子界面、下游信号级联通路、功能阻断的量效关系
   ⑤同类靶点对比：与同一疾病通路中 2-3 个替代靶点在亲和力、选择性、逃逸风险方面的具体对比
   ⑥转化潜力：序列保守性跨物种比较、免疫原性风险、已知抗体药 precedent、可制造性评估
4. 所有生物学描述必须准确，不得编造不存在的通路、受体或疾病关联
5. 机制描述要具体（如"阻断 XX 与 YY 的相互作用"而非泛泛的"调控信号通路"）
6. 表位策略要结合靶点结构域信息（如"Domain II 二聚化界面"而非"表面可及区域"）
7. 候选靶点必须是与主靶点在同疾病通路中的真实靶点，不得编造
8. 输出纯 JSON，不要 Markdown、代码块或额外解释

JSON 键固定：
{
  "selectionReason": "靶点选择学术依据，须按6个维度分段撰写（400-500字）：①疾病通路定位②抗原结构基础③表位可及性分析④机制可解释性⑤同类靶点对比⑥转化潜力",
  "mechanism": "作用机制描述（30-80字）",
  "selectedEpitope": "推荐表位策略（20-60字）",
  "diseaseDirection": "疾病方向标签（10-30字）",
  "domain": "靶点结构域描述（20-60字）",
  "evidence": "证据包标题（20-40字）",
  "evidenceSources": ["证据来源1","证据来源2","证据来源3","证据来源4"],
  "referenceEntries": "UniProt/数据库参考条目（20-50字）",
  "epitopeRowsZh": [
    ["Site A","表位区域","设计价值","优先"],
    ["Site B","表位区域","设计价值","备选"],
    ["Site C","表位区域","设计价值","谨慎"]
  ],
  "riskSummaryZh": "界面风险标注与设计建议（30-80字）",
  "structurePrepZh": "结构准备说明（30-80字）",
  "structureRef": "结构参考文献（20-50字）",
  "antibodies": ["已知同类抗体1","已知同类抗体2"],
  "interfaceFocus": "界面关注区域（15-40字）",
  "designMode": "设计模式标签（8-20字）",
  "candidates": [
    {"target":"候选靶点基因符号","rationale":"推荐理由（1-2句话）"},
    {"target":"候选靶点基因符号","rationale":"推荐理由"},
    {"target":"候选靶点基因符号","rationale":"推荐理由"}
  ],
  "preferredFormat": "Fab 或 VHH 或 both"
}`;

// ─── User Prompt 构建 ──────────────────────────────
function buildUserPrompt(target) {
  const topDiseases = target.topDiseases
    ? target.topDiseases.split('|').slice(0, 5).map(d => d.trim()).join('； ')
    : '未知';
  return `请为以下靶点生成完整的抗体设计工作流文案：

靶点基因符号：${target.gene}
蛋白全名：${target.proteinName || target.gene}
UniProt ID：${target.uniprot || '未知'}
RCSB PDB ID：${target.pdbId || '未知'}
结构来源：${target.structureSource || '未知'}
物种：Homo sapiens

疾病关联数据（来自 Open Targets Platform）：
- 关联疾病数量：${target.diseaseCount || '未知'}
- 最大关联得分：${target.maxAssociationScore || '未知'}
- Top 5 关联疾病：${topDiseases}

已知结构信息：
- 抗原链集合：${(target.antigenChains || []).join(', ') || '未知'}
- 结构方法：${target.structureMethod || '未知'}
- 分辨率：${target.resolution || '未知'}

请基于以上信息，生成该靶点作为抗体设计主靶点的完整工作流文案。
要求 selectionReason 按 6 个维度分段撰写，总篇幅 400-500 字，
机制描述具体到分子相互作用层面，
表位策略结合结构域信息，候选靶点来自同一疾病通路。`;
}

// ─── 数据加载 ──────────────────────────────────────
function loadManifest(manifestPath) {
  const raw = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const targets = Array.isArray(raw.targets) ? raw.targets : [];
  return targets.map(t => ({
    gene: t.gene,
    pdbId: t.pdbId,
    antigenChains: t.antigenChains || [],
    fabCount: t.fabCount || 0,
    vhhCount: t.vhhCount || 0,
    poses: t.poses || []
  }));
}

function loadCsv(csvPath) {
  const content = fs.readFileSync(csvPath, 'utf8');
  const lines = content.split('\n').filter(l => l.trim());
  if (!lines.length) return [];
  const header = parseCsvLine(lines[0]);
  const targets = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    const row = {};
    header.forEach((h, idx) => { row[h] = cols[idx] || ''; });
    targets.push({
      gene: row.approved_symbol || '',
      proteinName: row.approved_name || '',
      uniprot: row.uniprot || '',
      diseaseCount: parseInt(row.disease_count || '0', 10),
      maxAssociationScore: parseFloat(row.max_association_score || '0'),
      topDiseases: row.top_indications || '',
      structureSource: row.structure_status || '',
      structureMethod: row.representative_method || '',
      resolution: row.representative_resolution || ''
    });
  }
  return targets;
}

function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (char === ',' && !inQuotes) {
      result.push(current); current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function mergeData(manifestTargets, csvTargets) {
  const csvMap = new Map();
  for (const t of csvTargets) {
    if (t.gene) csvMap.set(t.gene.toUpperCase(), t);
  }
  return manifestTargets.map(mt => {
    const csv = csvMap.get(mt.gene.toUpperCase()) || {};
    return { ...mt, ...csv, gene: mt.gene };
  });
}

// ─── API 调用（streaming chat/completions）─────────
async function callModel(apiConfig, target) {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: buildUserPrompt(target) }
  ];

  // 使用 chat/completions + streaming，避免 su8 上游 30s 超时
  const chatUrl = apiConfig.url.replace(/\/responses$/, '/chat/completions');
  const body = {
    model: apiConfig.model,
    messages,
    temperature: 0.3,
    max_tokens: 4000,
    stream: true,
    response_format: { type: 'json_object' }
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CONFIG.timeout);

  try {
    const resp = await fetch(chatUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiConfig.key,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
      signal: controller.signal
    });
    clearTimeout(timer);

    if (!resp.ok) {
      const raw = await resp.text();
      throw new Error(`HTTP ${resp.status}: ${raw.slice(0, 200)}`);
    }

    // 流式读取
    let fullText = '';
    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      for (const line of chunk.split('\n')) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (data === '[DONE]') continue;
        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices && parsed.choices[0] && parsed.choices[0].delta
            ? (parsed.choices[0].delta.content || '') : '';
          fullText += delta;
        } catch {}
      }
    }

    if (!fullText) throw new Error('empty_response');
    return fullText;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

// ─── 内容验证 ──────────────────────────────────────
const REQUIRED_FIELDS = [
  'selectionReason', 'mechanism', 'selectedEpitope', 'diseaseDirection',
  'domain', 'evidence', 'evidenceSources', 'referenceEntries',
  'epitopeRowsZh', 'riskSummaryZh', 'structurePrepZh', 'structureRef',
  'antibodies', 'interfaceFocus', 'designMode', 'candidates', 'preferredFormat'
];

const BANNED_WORDS = ['用户指定', '根据请求', '用户希望', '根据输入', '演示'];

function validateContent(content, target) {
  if (!content || typeof content !== 'object') return { valid: false, reason: 'not_object' };
  for (const field of REQUIRED_FIELDS) {
    if (!(field in content)) return { valid: false, reason: `missing_field:${field}` };
  }
  if (typeof content.selectionReason !== 'string' || content.selectionReason.length < 300) {
    return { valid: false, reason: 'selectionReason_too_short' };
  }
  const sentenceCount = (content.selectionReason.match(/[。.！!]/g) || []).length;
  if (sentenceCount < 6) return { valid: false, reason: 'selectionReason_too_few_sentences' };
  if (typeof content.mechanism !== 'string' || content.mechanism.length < 10) {
    return { valid: false, reason: 'mechanism_too_short' };
  }
  if (!Array.isArray(content.epitopeRowsZh) || content.epitopeRowsZh.length < 3) {
    return { valid: false, reason: 'epitopeRowsZh_insufficient' };
  }
  if (!Array.isArray(content.candidates) || content.candidates.length < 3) {
    return { valid: false, reason: 'candidates_insufficient' };
  }
  if (!['Fab', 'VHH', 'both'].includes(content.preferredFormat)) {
    return { valid: false, reason: 'invalid_preferredFormat' };
  }
  const allText = JSON.stringify(content);
  for (const word of BANNED_WORDS) {
    if (allText.includes(word)) return { valid: false, reason: `banned_word:${word}` };
  }
  return { valid: true };
}

function extractJsonFromText(text) {
  if (!text) return null;
  let cleaned = text.trim();
  // 去掉 markdown 代码块
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  // 找到第一个 { 和最后一个 }
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  let jsonStr = cleaned.slice(start, end + 1);
  try {
    return JSON.parse(jsonStr);
  } catch {
    // 尝试修复尾随逗号
    try {
      return JSON.parse(jsonStr.replace(/,(\s*[}\]])/g, '$1'));
    } catch {
      return null;
    }
  }
}

// ─── 存储 ──────────────────────────────────────────
function ensureOutputDir(outputDir) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function saveTargetContent(outputDir, gene, content, modelUsed) {
  const filePath = path.join(outputDir, `${gene}.json`);
  const payload = {
    gene,
    generatedAt: new Date().toISOString(),
    modelUsed,
    promptVersion: CONFIG.promptVersion,
    content
  };
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf8');
}

function loadIndex(outputDir) {
  const indexPath = path.join(outputDir, '_index.json');
  try {
    return JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  } catch {
    return {
      schemaVersion: 1,
      generatedAt: new Date().toISOString(),
      modelUsed: CONFIG.model,
      promptVersion: CONFIG.promptVersion,
      totalTargets: 0,
      success: 0,
      failed: 0,
      targets: {}
    };
  }
}

function saveIndex(outputDir, index) {
  const indexPath = path.join(outputDir, '_index.json');
  index.generatedAt = new Date().toISOString();
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2), 'utf8');
}

function updateIndexEntry(index, gene, status, extra) {
  if (!index.targets[gene]) index.targets[gene] = {};
  index.targets[gene].status = status;
  index.targets[gene].file = status === 'success' ? `${gene}.json` : null;
  if (extra) Object.assign(index.targets[gene], extra);
  // 重新计数
  let success = 0, failed = 0;
  for (const key of Object.keys(index.targets)) {
    if (index.targets[key].status === 'success') success++;
    else if (index.targets[key].status === 'failed') failed++;
  }
  index.success = success;
  index.failed = failed;
  index.totalTargets = Object.keys(index.targets).length;
}

// ─── 主流程 ────────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function chunk(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

async function processSingleTarget(apiConfig, target) {
  let lastError = null;
  for (let attempt = 0; attempt < CONFIG.maxRetries; attempt++) {
    try {
      const text = await callModel(apiConfig, target);
      const content = extractJsonFromText(text);
      if (!content) throw new Error('json_parse_failed');
      const validation = validateContent(content, target);
      if (!validation.valid) throw new Error(`validation_failed:${validation.reason}`);
      return { status: 'success', content };
    } catch (err) {
      lastError = err;
      const backoff = (5 * Math.pow(2, attempt)) * 1000;
      if (attempt < CONFIG.maxRetries - 1) await sleep(backoff);
    }
  }
  return { status: 'failed', error: lastError ? lastError.message : 'unknown' };
}

async function main() {
  const args = process.argv.slice(2);
  const opts = {};
  const BOOLEAN_FLAGS = ['retry-only', 'new-only'];
  for (let i = 0; i < args.length; i++) {
    const key = args[i].replace(/^--/, '');
    if (BOOLEAN_FLAGS.includes(key)) {
      opts[key] = 'true';
    } else if (key && !key.startsWith('-') && i + 1 < args.length && !args[i + 1].startsWith('--')) {
      opts[key] = args[i + 1];
      i++;
    } else if (key && !key.startsWith('-')) {
      opts[key] = 'true';
    }
  }

  const outputDir = opts.output || path.join(__dirname, '..', 'pdb', 'pregenerated-content');
  const retryOnly = opts['retry-only'] === 'true';
  const newOnly = opts['new-only'] === 'true';

  console.log('=== ZoonoAb 预生成脚本 ===');
  console.log(`模型: ${CONFIG.model}`);
  console.log(`批次大小: ${CONFIG.batchSize}`);
  console.log(`批间间隔: ${CONFIG.batchInterval}ms`);
  console.log(`最大重试: ${CONFIG.maxRetries}`);
  console.log(`超时: ${CONFIG.timeout}ms`);
  console.log(`输出目录: ${outputDir}`);
  console.log('');

  // 加载 API 配置
  const apiConfig = loadApiConfig();
  if (!apiConfig) {
    console.error('错误: 未找到 API 配置。请确保 .runtime/voice-api-config.json 存在或设置环境变量。');
    process.exit(1);
  }
  console.log(`API 端点: ${apiConfig.url}`);
  console.log(`Wire API: ${apiConfig.wireApi}`);
  console.log('');

  // 加载数据
  let targets = [];
  if (retryOnly) {
    const index = loadIndex(outputDir);
    const failedGenes = Object.entries(index.targets)
      .filter(([_, v]) => v.status === 'failed')
      .map(([gene]) => gene);
    if (!failedGenes.length) {
      console.log('没有需要重试的靶点。');
      process.exit(0);
    }
    // 从 manifest 加载这些靶点的完整信息
    const manifestPath = opts.manifest || path.join(__dirname, '..', '..', 'target_expansion_isolated', 'complexes', 'manifest.json');
    const csvPath = opts.csv || path.join(__dirname, '..', '..', 'target_expansion_isolated', 'generated', 'full_human_targets', 'target_expansion_full.csv');
    const allTargets = mergeData(loadManifest(manifestPath), loadCsv(csvPath));
    targets = allTargets.filter(t => failedGenes.includes(t.gene));
    console.log(`重试模式: ${targets.length} 个失败靶点`);
  } else if (newOnly) {
    const manifestPath = opts.manifest || path.join(__dirname, '..', '..', 'target_expansion_isolated', 'complexes', 'manifest.json');
    const csvPath = opts.csv || path.join(__dirname, '..', '..', 'target_expansion_isolated', 'generated', 'full_human_targets', 'target_expansion_full.csv');
    const allTargets = mergeData(loadManifest(manifestPath), loadCsv(csvPath));
    const index = loadIndex(outputDir);
    targets = allTargets.filter(t => !index.targets[t.gene] || index.targets[t.gene].status !== 'success');
    console.log(`增量模式: ${targets.length} 个新靶点`);
  } else {
    const manifestPath = opts.manifest || path.join(__dirname, '..', '..', 'target_expansion_isolated', 'complexes', 'manifest.json');
    const csvPath = opts.csv || path.join(__dirname, '..', '..', 'target_expansion_isolated', 'generated', 'full_human_targets', 'target_expansion_full.csv');
    targets = mergeData(loadManifest(manifestPath), loadCsv(csvPath));
    console.log(`全量模式: ${targets.length} 个靶点`);
  }
  console.log('');

  if (!targets.length) {
    console.log('没有需要处理的靶点。');
    process.exit(0);
  }

  ensureOutputDir(outputDir);
  const index = loadIndex(outputDir);

  // 分批处理
  const batches = chunk(targets, CONFIG.batchSize);
  let totalSuccess = 0, totalFailed = 0;

  for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
    const batch = batches[batchIdx];
    const batchNum = batchIdx + 1;
    console.log(`\n--- 批次 ${batchNum}/${batches.length} (${batch.length} 个靶点) ---`);

    const promises = batch.map(async (target) => {
      try {
        const result = await processSingleTarget(apiConfig, target);
        if (result.status === 'success') {
          saveTargetContent(outputDir, target.gene, result.content, CONFIG.model);
          updateIndexEntry(index, target.gene, 'success');
          return { gene: target.gene, status: 'success' };
        } else {
          updateIndexEntry(index, target.gene, 'failed', { error: result.error, retries: CONFIG.maxRetries });
          return { gene: target.gene, status: 'failed', error: result.error };
        }
      } catch (err) {
        updateIndexEntry(index, target.gene, 'failed', { error: err.message, retries: CONFIG.maxRetries });
        return { gene: target.gene, status: 'failed', error: err.message };
      }
    });

    const results = await Promise.allSettled(promises);
    let batchSuccess = 0, batchFailed = 0;
    for (const r of results) {
      if (r.value && r.value.status === 'success') { batchSuccess++; totalSuccess++; }
      else { batchFailed++; totalFailed++; }
    }

    // 每批保存索引
    saveIndex(outputDir, index);

    console.log(`  成功: ${batchSuccess}, 失败: ${batchFailed}`);
    console.log(`  累计: 成功 ${totalSuccess}, 失败 ${totalFailed}, 总计 ${totalSuccess + totalFailed}/${targets.length}`);

    // 打印失败的靶点
    for (const r of results) {
      if (r.value && r.value.status === 'failed') {
        console.log(`  [失败] ${r.value.gene}: ${r.value.error || r.value.reason || 'unknown'}`);
      }
    }

    // 批间间隔
    if (batchIdx < batches.length - 1) {
      process.stdout.write(`  等待 ${CONFIG.batchInterval}ms...`);
      await sleep(CONFIG.batchInterval);
      process.stdout.write('\r\x1b[K');
    }
  }

  // 最终统计
  console.log('\n=== 预生成完成 ===');
  console.log(`总计: ${targets.length}`);
  console.log(`成功: ${totalSuccess}`);
  console.log(`失败: ${totalFailed}`);
  console.log(`成功率: ${(totalSuccess / targets.length * 100).toFixed(1)}%`);
  console.log(`索引文件: ${path.join(outputDir, '_index.json')}`);

  if (totalFailed > 0) {
    console.log(`\n失败靶点可通过以下命令重试:`);
    console.log(`  node scripts/pregenerate_content.js --retry-only --output ${outputDir}`);
  }
}

main().catch(err => {
  console.error('致命错误:', err);
  process.exit(1);
});
