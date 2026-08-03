#!/usr/bin/env node
'use strict';

/**
 * 查看预生成状态
 *
 * 使用方式：node scripts/pregenerate_status.js --output <dir>
 */

const fs = require('fs');
const path = require('path');

function main() {
  const args = process.argv.slice(2);
  const opts = {};
  for (let i = 0; i < args.length; i += 2) {
    opts[args[i].replace(/^--/, '')] = args[i + 1];
  }
  const outputDir = opts.output || path.join(__dirname, '..', 'pdb', 'pregenerated-content');
  const indexPath = path.join(outputDir, '_index.json');

  let index;
  try {
    index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  } catch {
    console.log('未找到索引文件，可能尚未运行预生成。');
    process.exit(0);
  }

  console.log('=== 预生成状态 ===\n');
  console.log(`索引生成时间: ${index.generatedAt || '未知'}`);
  console.log(`使用模型: ${index.modelUsed || '未知'}`);
  console.log(`提示词版本: ${index.promptVersion || '未知'}`);
  console.log(`总靶点数: ${index.totalTargets || 0}`);
  console.log(`成功: ${index.success || 0}`);
  console.log(`失败: ${index.failed || 0}`);

  if (index.totalTargets) {
    const rate = (index.success / index.totalTargets * 100).toFixed(1);
    console.log(`成功率: ${rate}%`);
  }

  // 列出失败的靶点
  const failed = Object.entries(index.targets || {})
    .filter(([_, v]) => v.status === 'failed')
    .map(([gene, v]) => ({ gene, error: v.error, retries: v.retries }));

  if (failed.length) {
    console.log(`\n失败靶点 (${failed.length}):`);
    for (const f of failed.slice(0, 50)) {
      console.log(`  ${f.gene}: ${f.error || 'unknown'} (重试 ${f.retries || 0} 次)`);
    }
    if (failed.length > 50) console.log(`  ... 还有 ${failed.length - 50} 个`);
    console.log(`\n重试命令: node scripts/pregenerate_content.js --retry-only --output ${outputDir}`);
  } else {
    console.log('\n全部完成，无失败靶点。');
  }

  // 检查文件是否真实存在
  const successTargets = Object.entries(index.targets || {})
    .filter(([_, v]) => v.status === 'success');
  let missingFiles = 0;
  for (const [gene, v] of successTargets) {
    const filePath = path.join(outputDir, v.file || `${gene}.json`);
    if (!fs.existsSync(filePath)) {
      missingFiles++;
      console.log(`  [警告] ${gene} 标记为成功但文件不存在: ${filePath}`);
    }
  }
  if (missingFiles) {
    console.log(`\n[警告] ${missingFiles} 个靶点标记为成功但文件缺失`);
  } else if (successTargets.length) {
    console.log(`文件完整性检查: ${successTargets.length} 个文件全部存在`);
  }
}

main();
