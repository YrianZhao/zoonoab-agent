#!/usr/bin/env node
'use strict';

/**
 * ZoonoAb selectionReason 升级脚本 — 只重新生成 selectionReason 字段
 * 保留 v1.0 的其他 16 个字段，只覆盖 selectionReason
 *
 * 使用方式：
 *   node scripts/pregenerate_selectionreason.js
 *   node scripts/pregenerate_selectionreason.js --retry-only
 *
 * 环境变量：
 *   ASSISTANT_CHAT_API_KEY
 *   PREGEN_MODEL            — 模型名称（默认 gpt-5.4）
 *   PREGEN_BATCH_SIZE       — 每批并发数（默认 10）
 *   PREGEN_BATCH_INTERVAL   — 批间间隔毫秒（默认 2000）
 *   PREGEN_MAX_RETRIES      — 最大重试次数（默认 3）
 *   PREGEN_TIMEOUT          — 单请求超时毫秒（默认 90000）
 */

const fs = require('fs');
const path = require('path');

// ─── 配置 ───────────────────────────────────────────
const CONFIG = {
  batchSize: parseInt(process.env.PREGEN_BATCH_SIZE || '40', 10),
  batchInterval: parseInt(process.env.PREGEN_BATCH_INTERVAL || '1000', 10),
  maxRetries: parseInt(process.env.PREGEN_MAX_RETRIES || '3', 10),
  timeout: parseInt(process.env.PREGEN_TIMEOUT || '60000', 10),
  model: process.env.PREGEN_MODEL || 'gpt-5.4',
};

const CONTENT_DIR = path.join(__dirname, '..', 'pdb', 'pregenerated-content');

// ─── API 配置 ──────────────────────────────────────
function loadApiConfig() {
  const configPath = path.join(__dirname, '..', '.runtime', 'voice-api-config.json');
  try {
    const raw = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const chat = raw.chat || {};
    const provider = chat.fallback || chat.primary || {};
    if (provider.key && provider.url) {
      const chatUrl = provider.url.replace(/\/responses$/, '/chat/completions');
      return { key: provider.key, url: chatUrl, model: CONFIG.model };
    }
  } catch {}
  const key = process.env.ASSISTANT_CHAT_API_KEY || '';
  const url = (process.env.ASSISTANT_CHAT_BASE_URL || '').replace(/\/responses$/, '/chat/completions');
  if (key && url) return { key, url, model: CONFIG.model };
  return null;
}

// ─── Prompt（只生成 selectionReason）──────────────
const SYSTEM_PROMPT = `你是 ZoonoAb 学术分子设计引擎。为指定靶点生成 selectionReason（靶点选择学术依据）。

要求：
1. 正式、严谨的学术分子设计口吻，禁止"用户指定""根据请求"等表述
2. 400-500 字，包含 6 个维度，每个维度 1-2 句话：
   ①疾病通路定位：靶点所在信号通路、病理角色、临床证据等级
   ②抗原结构基础：结构域架构、晶体结构分辨率、构象状态、翻译后修饰
   ③表位可及性分析：胞外区拓扑、表面静电、已知表位簇、空间位障
   ④机制可解释性：阻断界面、下游信号级联、量效关系
   ⑤同类靶点对比：与同通路2-3个替代靶点的具体对比
   ⑥转化潜力：序列保守性、免疫原性、抗体药precedent、可制造性
3. 生物学描述必须准确
4. 输出纯 JSON：{"selectionReason":"400-500字的学术依据"}`;

function buildUserPrompt(gene, oldContent) {
  // 从旧内容提取一些上下文
  const disease = oldContent.diseaseDirection || '';
  const domain = oldContent.domain || '';
  const mechanism = oldContent.mechanism || '';
  const oldReason = oldContent.selectionReason || '';

  return `靶点：${gene}
${disease ? '疾病方向：' + disease : ''}
${domain ? '结构域：' + domain : ''}
${mechanism ? '已知机制：' + mechanism : ''}
${oldReason ? '旧版选择理由（供参考，不要照抄）：' + oldReason.slice(0, 200) : ''}

请生成该靶点的 selectionReason（400-500字，6个维度）。`;
}

// ─── API 调用（非流式）────────────────────────────
async function callModel(apiConfig, gene, oldContent) {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: buildUserPrompt(gene, oldContent) }
  ];

  const body = {
    model: apiConfig.model,
    messages,
    temperature: 0.3,
    max_tokens: 1500,
    stream: false,
    response_format: { type: 'json_object' }
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CONFIG.timeout);

  try {
    const resp = await fetch(apiConfig.url, {
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

    const data = await resp.json();
    const text = data.choices && data.choices[0] && data.choices[0].message
      ? (data.choices[0].message.content || '')
      : '';

    if (!text) throw new Error('empty_response');
    return text;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

function extractJsonFromText(text) {
  if (!text) return null;
  let cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const s = cleaned.indexOf('{'), e = cleaned.lastIndexOf('}');
  if (s < 0 || e <= s) return null;
  let str = cleaned.slice(s, e + 1);
  try { return JSON.parse(str); } catch {}
  try { return JSON.parse(str.replace(/,(\s*[}\]])/g, '$1')); } catch {}
  return null;
}

function validateSelectionReason(text) {
  if (!text || typeof text !== 'string') return false;
  if (text.length < 300) return false;
  const sentences = (text.match(/[。.！!]/g) || []).length;
  if (sentences < 5) return false;
  return true;
}

// ─── 数据加载 ──────────────────────────────────────
function loadAllTargets() {
  const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.json') && f !== '_index.json');
  const targets = [];
  let skipped = 0;
  for (const file of files) {
    try {
      const raw = JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, file), 'utf8'));
      if (raw.gene && raw.content) {
        // 跳过已升级到 v2.0 的文件
        if (raw.promptVersion === 'v2.0' && raw.content.selectionReason
            && raw.content.selectionReason.length >= 300) {
          skipped++;
          continue;
        }
        targets.push({ gene: raw.gene, file, oldContent: raw.content });
      }
    } catch {}
  }
  if (skipped > 0) console.log(`跳过已升级文件: ${skipped} 个`);
  return targets;
}

function updateSelectionReason(gene, newReason) {
  const filePath = path.join(CONTENT_DIR, gene + '.json');
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  raw.content.selectionReason = newReason;
  raw.generatedAt = new Date().toISOString();
  raw.modelUsed = CONFIG.model;
  raw.promptVersion = 'v2.0';
  fs.writeFileSync(filePath, JSON.stringify(raw, null, 2), 'utf8');
}

// ─── 主流程 ────────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function chunk(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size));
  return result;
}

// 失败记录文件
const FAILED_LOG = path.join(CONTENT_DIR, '_failed_v2.txt');

async function processSingleTarget(apiConfig, target) {
  let lastError = null;
  for (let attempt = 0; attempt < CONFIG.maxRetries; attempt++) {
    try {
      const text = await callModel(apiConfig, target.gene, target.oldContent);
      const json = extractJsonFromText(text);
      if (!json || !json.selectionReason) throw new Error('json_parse_failed');
      if (!validateSelectionReason(json.selectionReason)) throw new Error('validation_failed');
      return { status: 'success', selectionReason: json.selectionReason };
    } catch (err) {
      lastError = err;
      const backoff = (3 * Math.pow(2, attempt)) * 1000;
      if (attempt < CONFIG.maxRetries - 1) await sleep(backoff);
    }
  }
  return { status: 'failed', error: lastError ? lastError.message : 'unknown' };
}

async function main() {
  const args = process.argv.slice(2);
  const retryOnly = args.includes('--retry-only');

  console.log('=== selectionReason v2.0 升级脚本 ===');
  console.log(`模型: ${CONFIG.model}`);
  console.log(`批次大小: ${CONFIG.batchSize}`);
  console.log(`超时: ${CONFIG.timeout}ms`);
  console.log('');

  const apiConfig = loadApiConfig();
  if (!apiConfig) {
    console.error('错误: 未找到 API 配置。');
    process.exit(1);
  }
  console.log(`API: ${apiConfig.url}`);
  console.log('');

  // 加载所有靶点
  let targets = loadAllTargets();
  console.log(`已加载 ${targets.length} 个靶点`);

  // 重试模式：只处理上次失败的
  if (retryOnly && fs.existsSync(FAILED_LOG)) {
    const failedGenes = fs.readFileSync(FAILED_LOG, 'utf8').trim().split('\n').filter(Boolean);
    const failedSet = new Set(failedGenes);
    targets = targets.filter(t => failedSet.has(t.gene));
    console.log(`重试模式: ${targets.length} 个失败靶点`);
  }

  if (!targets.length) {
    console.log('没有需要处理的靶点。');
    process.exit(0);
  }

  // 清空失败记录
  if (!retryOnly) {
    fs.writeFileSync(FAILED_LOG, '', 'utf8');
  }

  const batches = chunk(targets, CONFIG.batchSize);
  let totalSuccess = 0, totalFailed = 0;
  const startTime = Date.now();

  for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
    const batch = batches[batchIdx];
    const batchNum = batchIdx + 1;

    const promises = batch.map(async (target) => {
      try {
        const result = await processSingleTarget(apiConfig, target);
        if (result.status === 'success') {
          updateSelectionReason(target.gene, result.selectionReason);
          return { gene: target.gene, status: 'success' };
        } else {
          return { gene: target.gene, status: 'failed', error: result.error };
        }
      } catch (err) {
        return { gene: target.gene, status: 'failed', error: err.message };
      }
    });

    const results = await Promise.allSettled(promises);
    let batchSuccess = 0, batchFailed = 0;
    for (const r of results) {
      if (r.value && r.value.status === 'success') {
        batchSuccess++; totalSuccess++;
      } else {
        batchFailed++; totalFailed++;
        if (r.value) {
          fs.appendFileSync(FAILED_LOG, r.value.gene + '\n', 'utf8');
        }
      }
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
    const rate = (totalSuccess / (totalSuccess + totalFailed) * 100).toFixed(1);
    const remaining = batches.length - batchNum;
    const eta = remaining > 0 ? ((Date.now() - startTime) / batchNum * remaining / 1000 / 60).toFixed(0) : 0;

    console.log(`[${batchNum}/${batches.length}] 成功:${batchSuccess} 失败:${batchFailed} | 累计 ${totalSuccess}/${totalSuccess + totalFailed} (${rate}%) | ${elapsed}s elapsed, ~${eta}min remaining`);

    // 打印失败的
    for (const r of results) {
      if (r.value && r.value.status === 'failed') {
        console.log(`  [失败] ${r.value.gene}: ${r.value.error}`);
      }
    }

    // 批间间隔
    if (batchIdx < batches.length - 1) {
      await sleep(CONFIG.batchInterval);
    }
  }

  // 最终统计
  console.log('\n=== 升级完成 ===');
  console.log(`总计: ${targets.length}`);
  console.log(`成功: ${totalSuccess}`);
  console.log(`失败: ${totalFailed}`);
  console.log(`成功率: ${(totalSuccess / targets.length * 100).toFixed(1)}%`);
  console.log(`总耗时: ${((Date.now() - startTime) / 1000 / 60).toFixed(1)} 分钟`);

  if (totalFailed > 0) {
    console.log(`\n失败靶点可通过以下命令重试:`);
    console.log(`  node scripts/pregenerate_selectionreason.js --retry-only`);
  }
}

main().catch(err => {
  console.error('致命错误:', err);
  process.exit(1);
});
