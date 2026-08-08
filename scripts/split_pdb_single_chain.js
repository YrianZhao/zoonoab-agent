#!/usr/bin/env node
'use strict';

/**
 * PDB 多链结构拆单链脚本
 *
 * 读取 chain-analysis.json 获取每文件最优靶点链，
 * 从原始 PDB 中提取纯靶点链 ATOM 记录，输出单链 PDB 文件。
 *
 * 规则：
 *   - 每文件取 atomCount 最大的 TARGET_CHAIN
 *   - 只保留该链的 ATOM 记录 + 头部信息
 *   - 丢弃 HETATM、伙伴蛋白、配体、核酸、水、CONECT
 *
 * 用法：
 *   node split_pdb_single_chain.js --input <pdb-dir> --analysis <analysis.json> --output <out-dir>
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// ── 命令行参数 ──────────────────────────────────────────────
function parseArgs(argv) {
  const args = { input: null, analysis: null, output: null };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--input' && i + 1 < argv.length) args.input = argv[++i];
    else if (argv[i] === '--analysis' && i + 1 < argv.length) args.analysis = argv[++i];
    else if (argv[i] === '--output' && i + 1 < argv.length) args.output = argv[++i];
  }
  if (!args.input || !args.analysis || !args.output) {
    console.error('Usage: node split_pdb_single_chain.js --input <pdb-dir> --analysis <analysis.json> --output <out-dir>');
    process.exit(1);
  }
  return args;
}

// ── 主流程 ──────────────────────────────────────────────────
async function main() {
  const args = parseArgs(process.argv);
  const inputDir = path.resolve(args.input);
  const analysisPath = path.resolve(args.analysis);
  const outputDir = path.resolve(args.output);

  console.log(`[split_pdb] Input: ${inputDir}`);
  console.log(`[split_pdb] Analysis: ${analysisPath}`);
  console.log(`[split_pdb] Output: ${outputDir}`);

  fs.mkdirSync(outputDir, { recursive: true });

  // 读取分析结果
  console.log('[split_pdb] Loading analysis JSON...');
  const analysis = JSON.parse(fs.readFileSync(analysisPath, 'utf8'));
  console.log(`[split_pdb] Loaded ${analysis.entries.length} entries`);

  // 为每个 entry 选出最优靶点链
  const plan = [];
  const skipped = [];

  for (const entry of analysis.entries) {
    const targetChains = entry.chains.filter(c => c.type === 'TARGET_CHAIN');
    if (targetChains.length === 0) {
      skipped.push({ file: entry.file, reason: 'No TARGET_CHAIN found' });
      continue;
    }

    // 选 atomCount 最大的链
    targetChains.sort((a, b) => b.atomCount - a.atomCount);
    const best = targetChains[0];

    // 安全网：atomCount 为 0 的链跳过
    if (best.atomCount === 0) {
      skipped.push({ file: entry.file, reason: 'Best chain has 0 atoms' });
      continue;
    }

    plan.push({
      sourceFile: entry.file,
      subDir: entry.subDir,
      gene: entry.gene,
      pdbId: entry.pdbId,
      selectedChain: best.chainId,
      chainAtomCount: best.atomCount,
      totalChainsInOriginal: entry.totalChains,
      targetChainsInOriginal: entry.chains.filter(c => c.type === 'TARGET_CHAIN').map(c => c.chainId),
      skippedChains: entry.chains.filter(c => c.chainId !== best.chainId).map(c => c.chainId),
      reason: `${best.chainId} has most atoms (${best.atomCount})`,
    });
  }

  console.log(`[split_pdb] Plan: ${plan.length} files to split, ${skipped.length} skipped`);

  // ── 执行拆分 ──────────────────────────────────────────────
  const manifestEntries = [];
  let processed = 0;
  let errors = 0;
  const startTime = Date.now();

  for (const item of plan) {
    try {
      const sourcePath = path.join(inputDir, item.subDir, item.sourceFile);
      const outputFile = `${item.gene}_${item.pdbId}_chain${item.selectedChain}.pdb`;
      const outputPath = path.join(outputDir, outputFile);

      const result = await splitSingleChain(sourcePath, outputPath, item);

      manifestEntries.push({
        ...item,
        outputFile,
        outputAtomCount: result.atomCount,
        outputResidueCount: result.residueCount,
      });
    } catch (err) {
      errors++;
      console.error(`[split_pdb] ERROR: ${item.sourceFile}: ${err.message}`);
      manifestEntries.push({
        ...item,
        outputFile: null,
        error: err.message,
      });
    }

    processed++;
    if (processed % 500 === 0 || processed === plan.length) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const rate = (processed / (Date.now() - startTime) * 1000).toFixed(1);
      console.log(`[split_pdb] Progress: ${processed}/${plan.length} (${elapsed}s, ${rate} files/s, ${errors} errors)`);
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`[split_pdb] Done in ${totalTime}s, ${errors} errors`);

  // ── 写入清单 JSON ─────────────────────────────────────────
  const manifest = {
    generatedAt: new Date().toISOString(),
    sourceDir: inputDir,
    outputDir,
    analysisSource: analysisPath,
    totalInput: analysis.entries.length,
    totalOutput: manifestEntries.filter(e => e.outputFile).length,
    skipped: skipped.length,
    errors,
    skippedFiles: skipped,
    entries: manifestEntries,
  };

  const manifestPath = path.join(outputDir, 'split-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`[split_pdb] Manifest written: ${manifestPath}`);

  // 统计
  const totalAtoms = manifestEntries.reduce((s, e) => s + (e.outputAtomCount || 0), 0);
  console.log(`[split_pdb] Total output files: ${manifest.totalOutput}`);
  console.log(`[split_pdb] Total atoms extracted: ${totalAtoms}`);
  console.log(`[split_pdb] Avg atoms/file: ${Math.round(totalAtoms / manifest.totalOutput)}`);
}

// ── 单文件拆分 ──────────────────────────────────────────────
async function splitSingleChain(sourcePath, outputPath, item) {
  const targetChain = item.selectedChain;
  const gene = item.gene;

  const stream = fs.createReadStream(sourcePath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

  const outLines = [];
  let atomCount = 0;
  let lastResSeq = 0;
  let lastResName = '';
  let inFirstModel = true;
  let modelStarted = false;

  // 收集头部记录
  let headerLines = [];

  for await (const line of rl) {
    const padded = line.padEnd(80, ' ');
    const recordType = line.substring(0, 6).trim();

    // MODEL 处理：只取第一个 MODEL
    if (recordType === 'MODEL') {
      modelStarted = true;
      if (!inFirstModel) continue;
      // 跳过 MODEL 行本身（不加 MODEL 包装）
      continue;
    }
    if (recordType === 'ENDMDL') {
      if (modelStarted) {
        inFirstModel = false;
      }
      // 遇到第一个 ENDMDL 就停止读取坐标
      break;
    }

    // 只在第一个 MODEL 内解析坐标
    if (modelStarted && !inFirstModel) continue;

    // ATOM：只保留目标链
    if (recordType === 'ATOM') {
      const chainId = padded[21] || ' ';
      if (chainId === targetChain) {
        outLines.push(line);
        atomCount++;
        const resSeq = parseInt(line.substring(22, 26).trim()) || 0;
        if (resSeq > lastResSeq) lastResSeq = resSeq;
        lastResName = line.substring(17, 20).trim();
      }
      continue;
    }

    // 丢弃 HETATM、ANISOU、CONECT
    if (recordType === 'HETATM' || recordType === 'ANISOU' || recordType === 'CONECT') {
      continue;
    }

    // 坐标区之后出现的 TER：只保留目标链的
    if (recordType === 'TER') {
      const chainId = padded[21] || ' ';
      if (chainId === targetChain) {
        outLines.push(line);
      }
      continue;
    }

    // 头部记录按需保留
    if (!modelStarted) {
      // HEADER
      if (recordType === 'HEADER') {
        headerLines.push(line);
        continue;
      }
      // TITLE（多行全部保留）
      if (recordType === 'TITLE') {
        headerLines.push(line);
        continue;
      }
      // EXPDTA
      if (recordType === 'EXPDTA') {
        headerLines.push(line);
        continue;
      }
      // REMARK 2 (分辨率)
      if (line.startsWith('REMARK   2 RESOLUTION')) {
        headerLines.push(line);
        continue;
      }
      // DBREF：只保留目标链的
      if (recordType === 'DBREF') {
        const chainId = padded[12] || ' ';
        if (chainId === targetChain) {
          headerLines.push(line);
        }
        continue;
      }
      // 其他头部记录（SEQRES/HELIX/SHEET/SITE等）跳过以减少文件体积
      // 原始 REMARK 350（生物学组装）对单链无意义，跳过
    }
  }

  rl.close();
  stream.destroy();

  // 安全检查
  if (atomCount === 0) {
    throw new Error(`No ATOM records found for chain ${targetChain}`);
  }

  // 残基数估算
  const residueCount = countResidues(outLines);

  // ── 组装输出 PDB ──────────────────────────────────────────

  // 来源标注 REMARK
  const remarkLines = [
    `REMARK 900 SOURCE: extracted from ${item.sourceFile}`,
    `REMARK 901 TARGET: ${gene}`,
    `REMARK 906 SINGLE_CHAIN: ${targetChain} (atoms=${atomCount}, residues=${residueCount})`,
  ];

  // 写出：头部 + 来源标注 + 坐标 + TER + END
  const fullOutput = [
    ...headerLines,
    ...remarkLines,
    ...outLines,
    // 如果最后一条不是 TER，补一个
    ...(outLines[outLines.length - 1]?.startsWith('TER') ? [] : [
      `TER   ${String(atomCount + 1).padStart(5, ' ')}      ${lastResName} ${targetChain}${String(lastResSeq).padStart(5, ' ')}`
    ]),
    'END',
  ].join('\n') + '\n';

  fs.writeFileSync(outputPath, fullOutput, 'utf8');

  return { atomCount, residueCount };
}

// ── 辅助：估算残基数 ────────────────────────────────────────
function countResidues(atomLines) {
  const seen = new Set();
  for (const line of atomLines) {
    if (!line.startsWith('ATOM')) continue;
    const resSeq = line.substring(22, 26).trim();
    const chainId = line[21] || ' ';
    seen.add(`${chainId}:${resSeq}`);
  }
  return seen.size;
}

main().catch(err => {
  console.error('[split_pdb] Fatal error:', err);
  process.exit(1);
});
