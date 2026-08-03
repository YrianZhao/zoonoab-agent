#!/usr/bin/env node
'use strict';

/**
 * 验证预生成内容质量
 *
 * 使用方式：
 *   node scripts/pregenerate_validate.js --output <dir>              # 验证全部
 *   node scripts/pregenerate_validate.js --output <dir> --sample 100 # 随机抽检100个
 */

const fs = require('fs');
const path = require('path');

const REQUIRED_FIELDS = [
  'selectionReason', 'mechanism', 'selectedEpitope', 'diseaseDirection',
  'domain', 'evidence', 'evidenceSources', 'referenceEntries',
  'epitopeRowsZh', 'riskSummaryZh', 'structurePrepZh', 'structureRef',
  'antibodies', 'interfaceFocus', 'designMode', 'candidates', 'preferredFormat'
];

const BANNED_WORDS = ['用户指定', '根据请求', '用户希望', '根据输入', '演示'];

function validateFile(filePath) {
  const issues = [];
  let data;
  try {
    data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (err) {
    return { valid: false, issues: ['json_parse_error: ' + err.message] };
  }
  const content = data.content;
  if (!content || typeof content !== 'object') {
    return { valid: false, issues: ['content_missing_or_not_object'] };
  }

  // 检查必填字段
  for (const field of REQUIRED_FIELDS) {
    if (!(field in content)) issues.push(`missing_field: ${field}`);
  }

  // 检查 selectionReason
  if (typeof content.selectionReason === 'string') {
    if (content.selectionReason.length < 60) issues.push(`selectionReason_too_short: ${content.selectionReason.length} chars`);
    const sentences = (content.selectionReason.match(/[。.！!]/g) || []).length;
    if (sentences < 3) issues.push(`selectionReason_too_few_sentences: ${sentences}`);
  }

  // 检查 mechanism
  if (typeof content.mechanism === 'string' && content.mechanism.length < 10) {
    issues.push(`mechanism_too_short: ${content.mechanism.length} chars`);
  }

  // 检查 epitopeRowsZh
  if (!Array.isArray(content.epitopeRowsZh) || content.epitopeRowsZh.length < 3) {
    issues.push(`epitopeRowsZh_insufficient: ${Array.isArray(content.epitopeRowsZh) ? content.epitopeRowsZh.length : 'not_array'}`);
  }

  // 检查 candidates
  if (!Array.isArray(content.candidates) || content.candidates.length < 3) {
    issues.push(`candidates_insufficient: ${Array.isArray(content.candidates) ? content.candidates.length : 'not_array'}`);
  }

  // 检查 preferredFormat
  if (!['Fab', 'VHH', 'both'].includes(content.preferredFormat)) {
    issues.push(`invalid_preferredFormat: ${content.preferredFormat}`);
  }

  // 检查禁用词
  const allText = JSON.stringify(content);
  for (const word of BANNED_WORDS) {
    if (allText.includes(word)) issues.push(`banned_word: ${word}`);
  }

  return { valid: issues.length === 0, issues };
}

function main() {
  const args = process.argv.slice(2);
  const opts = {};
  for (let i = 0; i < args.length; i += 2) {
    opts[args[i].replace(/^--/, '')] = args[i + 1];
  }
  const outputDir = opts.output || path.join(__dirname, '..', 'pdb', 'pregenerated-content');
  const sampleSize = opts.sample ? parseInt(opts.sample, 10) : 0;

  // 收集所有 JSON 文件
  let files = fs.readdirSync(outputDir)
    .filter(f => f.endsWith('.json') && !f.startsWith('_'))
    .map(f => ({ name: f, path: path.join(outputDir, f) }));

  console.log(`=== 预生成内容验证 ===`);
  console.log(`目录: ${outputDir}`);
  console.log(`文件数: ${files.length}`);
  console.log(`模式: ${sampleSize > 0 ? `随机抽检 ${sampleSize} 个` : '全量验证'}`);
  console.log('');

  if (sampleSize > 0 && files.length > sampleSize) {
    // 随机抽样
    files.sort(() => Math.random() - 0.5);
    files = files.slice(0, sampleSize);
  }

  let validCount = 0, invalidCount = 0;
  const allIssues = {};

  for (const file of files) {
    const result = validateFile(file.path);
    if (result.valid) {
      validCount++;
    } else {
      invalidCount++;
      for (const issue of result.issues) {
        const key = issue.split(':')[0];
        allIssues[key] = (allIssues[key] || 0) + 1;
      }
      console.log(`  [失败] ${file.name}: ${result.issues.join('; ')}`);
    }
  }

  console.log('');
  console.log(`=== 验证结果 ===`);
  console.log(`验证文件数: ${files.length}`);
  console.log(`通过: ${validCount} (${(validCount / files.length * 100).toFixed(1)}%)`);
  console.log(`失败: ${invalidCount} (${(invalidCount / files.length * 100).toFixed(1)}%)`);

  if (Object.keys(allIssues).length) {
    console.log(`\n问题统计:`);
    const sorted = Object.entries(allIssues).sort((a, b) => b[1] - a[1]);
    for (const [issue, count] of sorted) {
      console.log(`  ${issue}: ${count}`);
    }
  }
}

main();
