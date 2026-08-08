#!/usr/bin/env node
'use strict';

/**
 * PDB 靶点链分析脚本
 *
 * 扫描指定目录下的所有 PDB 文件，解析每条链的信息，
 * 基于 DBREF UniProt 注释 + 文件名基因名交叉匹配识别靶点链，
 * 输出完整 JSON 清单、CSV 速查表、系统预设 JSON 和 Markdown 报告。
 *
 * 用法：
 *   node analyze_pdb_chains.js --input <dir> --output <dir>
 *
 * 无外部依赖，纯 Node.js (>= v16)。
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// ── 命令行参数解析 ──────────────────────────────────────────
function parseArgs(argv) {
  const args = { input: null, output: null };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--input' && i + 1 < argv.length) args.input = argv[++i];
    else if (argv[i] === '--output' && i + 1 < argv.length) args.output = argv[++i];
  }
  if (!args.input) {
    console.error('Usage: node analyze_pdb_chains.js --input <pdb-dir> --output <out-dir>');
    process.exit(1);
  }
  if (!args.output) args.output = path.join(args.input, 'analysis');
  return args;
}

// ── 文件名解析 ──────────────────────────────────────────────
function parseFilename(filename) {
  // HUMAN-{GENE}-RCSB-{PDB_ID}.pdb → { species: 'HUMAN', gene: 'GENE', pdbId: 'PDB_ID' }
  // {TARGET}-RCSB-{PDB_ID}.pdb → { species: null, gene: 'TARGET', pdbId: 'PDB_ID' }
  const base = filename.replace(/\.pdb$/i, '');
  const rcsbMatch = base.match(/-RCSB-([0-9A-Z]+)$/i);
  const pdbId = rcsbMatch ? rcsbMatch[1] : '';
  const targetPart = rcsbMatch ? base.slice(0, rcsbMatch.index) : base;

  if (targetPart.startsWith('HUMAN-')) {
    return { species: 'HUMAN', gene: targetPart.slice(6), pdbId };
  }
  return { species: null, gene: targetPart, pdbId };
}

// ── 基因名匹配工具 ──────────────────────────────────────────
function normalizeGene(gene) {
  return gene.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

/**
 * 判断基因名与 UniProt 描述是否匹配
 * 返回 confidence: 'high' | 'medium' | 'low' | null
 */
function matchGeneToUniprot(gene, uniprotDescription) {
  if (!gene || !uniprotDescription) return null;
  const g = normalizeGene(gene);
  const desc = uniprotDescription.toUpperCase();

  // 提取 description 中 _ 前的蛋白标识符
  const proteinId = desc.split('_')[0];

  // 精确匹配：基因名 == proteinId
  if (g === proteinId) return 'high';

  // 包含匹配（基因名 ≥ 3 字符）
  if (g.length >= 3 && desc.includes(g)) return 'high';

  // proteinId 包含基因名
  if (g.length >= 3 && proteinId.includes(g)) return 'high';

  // 基因名去掉常见后缀后匹配（如 A2M → A2MG）
  // 尝试基因名是 proteinId 的前缀
  if (g.length >= 3 && proteinId.startsWith(g)) return 'medium';

  // 基因名包含 proteinId
  if (proteinId.length >= 3 && g.includes(proteinId)) return 'medium';

  return null;
}

// ── 核酸残基名集合 ──────────────────────────────────────────
const NA_RESIDUES = new Set(['DA', 'DT', 'DG', 'DC', 'DU', 'A', 'U', 'G', 'C', 'DI', 'PSU', 'OMC', 'OMG', '1MA', 'H2U', '5MC', '7MG', '5MU', 'M2G']);

// ── 单文件解析 ──────────────────────────────────────────────
async function analyzePDBFile(filePath, subDir) {
  const filename = path.basename(filePath);
  const meta = parseFilename(filename);

  const result = {
    file: filename,
    subDir,
    gene: meta.gene,
    species: meta.species,
    pdbId: meta.pdbId,
    title: '',
    classification: '',
    method: '',
    resolution: null,
    biologicalAssembly: '',
    chains: {},
    dbrefs: [],
    hets: [],
  };

  // 链信息按 chainId 累积
  const chains = {};

  function ensureChain(id) {
    if (!chains[id]) {
      chains[id] = {
        chainId: id,
        atomCount: 0,
        hetatmCount: 0,
        residueCount: 0,
        minResSeq: Infinity,
        maxResSeq: -Infinity,
        residueNames: new Set(),
        firstResidueName: '',
      };
    }
    return chains[id];
  }

  const stream = fs.createReadStream(filePath, { encoding: 'utf8' });
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

  let titleParts = [];
  let inRemark350 = false;
  let remark350ApplyLines = [];

  for await (const line of rl) {
    const recordType = line.substring(0, 6).trim();

    // HEADER
    if (recordType === 'HEADER') {
      result.classification = line.substring(10, 50).trim();
      if (!result.pdbId) result.pdbId = line.substring(62, 66).trim();
    }

    // TITLE（多行拼接）
    if (recordType === 'TITLE') {
      titleParts.push(line.substring(10, 80).trim());
    }

    // EXPDTA
    if (recordType === 'EXPDTA') {
      result.method = line.substring(10, 79).trim();
    }

    // REMARK 2 (分辨率)
    if (line.startsWith('REMARK   2 RESOLUTION')) {
      const m = line.match(/RESOLUTION\.\s+([\d.]+)/i);
      if (m) result.resolution = parseFloat(m[1]);
    }

    // REMARK 350
    if (line.startsWith('REMARK 350')) {
      inRemark350 = true;
      if (line.includes('AUTHOR DETERMINED BIOLOGICAL UNIT')) {
        result.biologicalAssembly = line.split('BIOLOGICAL UNIT:')[1]?.trim() || '';
      }
      if (line.includes('APPLY THE FOLLOWING TO CHAINS:')) {
        remark350ApplyLines.push(line.split('CHAINS:')[1]?.trim() || '');
      }
    } else if (inRemark350 && recordType === 'REMARK' && line.startsWith('REMARK 350')) {
      // continuation
    } else if (inRemark350) {
      inRemark350 = false;
    }

    // DBREF (PDB 固定列宽格式, 0-indexed)
    // 7-10: PDB ID, 12: chain, 14-17: seqBegin, 19-23: seqEnd
    // 26-31: database, 33-41: dbAccession, 42-54: dbIdentification
    // 55-59: dbSeqBegin, 62-67: dbSeqEnd
    if (recordType === 'DBREF') {
      const chainId = line.substring(12, 13).trim();
      const database = line.substring(26, 32).trim();
      const dbAcc = line.substring(33, 42).trim();
      const dbDesc = line.substring(42, 55).trim();
      const seqBegin = parseInt(line.substring(14, 18).trim()) || 0;
      const seqEnd = parseInt(line.substring(19, 24).trim()) || 0;
      const dbSeqBegin = parseInt(line.substring(55, 60).trim()) || 0;
      const dbSeqEnd = parseInt(line.substring(62, 68).trim()) || 0;

      result.dbrefs.push({
        chainId,
        database,
        dbAcc,
        dbDesc,
        seqBegin,
        seqEnd,
        dbSeqBegin,
        dbSeqEnd,
      });
    }

    // SEQRES (计数残基)
    if (recordType === 'SEQRES') {
      const chainId = line.substring(11, 12).trim();
      const numRes = parseInt(line.substring(13, 17).trim()) || 0;
      const c = ensureChain(chainId);
      if (numRes > c.residueCount) c.residueCount = numRes;
    }

    // HET (配体定义)
    if (recordType === 'HET' && !line.startsWith('HETNAM')) {
      const hetName = line.substring(7, 10).trim();
      const chainId = line.substring(12, 14).trim();
      const hetCount = parseInt(line.substring(20, 25).trim()) || 0;
      if (hetName && hetName !== 'HOH') {
        result.hets.push({ hetName, chainId, atomCount: hetCount });
      }
    }

    // ATOM
    if (recordType === 'ATOM') {
      const chainId = line.substring(21, 22).trim() || line.substring(20, 21).trim() || '?';
      const resName = line.substring(17, 20).trim();
      const resSeq = parseInt(line.substring(22, 26).trim()) || 0;
      const c = ensureChain(chainId);
      c.atomCount++;
      c.residueNames.add(resName);
      if (!c.firstResidueName) c.firstResidueName = resName;
      if (resSeq && resSeq < c.minResSeq) c.minResSeq = resSeq;
      if (resSeq && resSeq > c.maxResSeq) c.maxResSeq = resSeq;
    }

    // HETATM
    if (recordType === 'HETATM') {
      const chainId = line.substring(21, 22).trim() || line.substring(20, 21).trim() || '?';
      const resName = line.substring(17, 20).trim();
      const resSeq = parseInt(line.substring(22, 26).trim()) || 0;
      const c = ensureChain(chainId);
      c.hetatmCount++;
      c.residueNames.add(resName);
      if (!c.firstResidueName) c.firstResidueName = resName;
      if (resSeq && resSeq < c.minResSeq) c.minResSeq = resSeq;
      if (resSeq && resSeq > c.maxResSeq) c.maxResSeq = resSeq;
    }

    // 遇到 END 则停止读取（只解析第一个 MODEL）
    // 注意：不提前 break，因为 HEADER/DBREF 在 MODEL 之前
  }

  rl.close();
  stream.destroy();

  // 拼接标题
  result.title = titleParts.join(' ').replace(/\s+/g, ' ').trim();

  // ── 链分类 ────────────────────────────────────────────────

  // 1. 收集每个链的 DBREF 信息
  const chainDbrefs = {};
  for (const d of result.dbrefs) {
    if (!chainDbrefs[d.chainId]) chainDbrefs[d.chainId] = [];
    chainDbrefs[d.chainId].push(d);
  }

  // 2. 基于基因名匹配靶点 UniProt
  const gene = normalizeGene(meta.gene);
  let targetUniprotIds = new Set();

  // 第一轮：寻找最佳匹配的 UniProt
  let bestMatchConfidence = null;
  for (const d of result.dbrefs) {
    if (d.database === 'UNP' && d.dbAcc) {
      const conf = matchGeneToUniprot(meta.gene, d.dbDesc || d.dbAcc);
      if (conf === 'high') {
        targetUniprotIds.add(d.dbAcc);
        bestMatchConfidence = 'high';
      }
    }
  }

  // 如果没有 high 匹配，尝试 medium
  if (targetUniprotIds.size === 0) {
    for (const d of result.dbrefs) {
      if (d.database === 'UNP' && d.dbAcc) {
        const conf = matchGeneToUniprot(meta.gene, d.dbDesc || d.dbAcc);
        if (conf === 'medium') {
          targetUniprotIds.add(d.dbAcc);
          bestMatchConfidence = 'medium';
        }
      }
    }
  }

  // 3. 分类每条链
  const chainList = [];
  const sortedChainIds = Object.keys(chains).sort((a, b) => {
    // 先字母后数字排序
    return a.localeCompare(b);
  });

  // 收集所有有 ATOM 记录且只有单一 UniProt 的情况
  const proteinChains = sortedChainIds.filter(id => chains[id].atomCount > 0);
  const uniqueUniprotsForProteinChains = new Set();
  for (const id of proteinChains) {
    const dbs = chainDbrefs[id] || [];
    for (const d of dbs) {
      if (d.database === 'UNP' && d.dbAcc) uniqueUniprotsForProteinChains.add(d.dbAcc);
    }
  }

  for (const id of sortedChainIds) {
    const c = chains[id];
    const dbs = chainDbrefs[id] || [];

    // 提取该链的 UniProt 信息
    const unpDbrefs = dbs.filter(d => d.database === 'UNP');
    const uniprotId = unpDbrefs.length > 0 ? unpDbrefs[0].dbAcc : '';
    const uniprotDesc = unpDbrefs.length > 0 ? unpDbrefs[0].dbDesc : '';

    let type = 'UNKNOWN';
    let matchConfidence = null;
    let isAntigen = false;
    let ligandName = '';

    // 判断是否纯配体链（无 ATOM，只有 HETATM）
    const isPureLigand = c.atomCount === 0 && c.hetatmCount > 0;
    const isPureAtom = c.atomCount > 0;

    // 判断是否水分子
    const isWater = c.residueNames.size === 1 && c.residueNames.has('HOH');

    // 判断是否核酸链
    const naCount = [...c.residueNames].filter(r => NA_RESIDUES.has(r)).length;
    const isNucleicAcid = isPureAtom && c.residueNames.size > 0 && naCount / c.residueNames.size > 0.5;

    if (isWater) {
      type = 'WATER';
    } else if (isPureLigand) {
      type = 'LIGAND_CHAIN';
      // 尝试获取配体名称
      const hetEntry = result.hets.find(h => h.chainId === id || h.chainId === ` ${id}`);
      ligandName = c.firstResidueName || (hetEntry ? hetEntry.hetName : '') || '';
    } else if (isNucleicAcid) {
      type = 'NUCLEIC_ACID';
    } else if (isPureAtom) {
      // 蛋白质链 —— 判断是否靶点
      if (targetUniprotIds.size > 0 && uniprotId && targetUniprotIds.has(uniprotId)) {
        type = 'TARGET_CHAIN';
        matchConfidence = bestMatchConfidence;
        isAntigen = true;
      } else if (targetUniprotIds.size === 0) {
        // 没有找到匹配的 UniProt
        // 启发式：如果所有蛋白链共享同一 UniProt，则都是靶点
        if (uniqueUniprotsForProteinChains.size === 1 && uniprotId && uniqueUniprotsForProteinChains.has(uniprotId)) {
          type = 'TARGET_CHAIN';
          matchConfidence = 'medium';
          isAntigen = true;
        } else if (proteinChains.length === 1) {
          // 只有一条蛋白链，大概率是靶点
          type = 'TARGET_CHAIN';
          matchConfidence = 'low';
          isAntigen = true;
        } else if (!uniprotId) {
          // 有 ATOM 但无 DBREF —— 可能是靶点但没有注释
          type = 'TARGET_CHAIN';
          matchConfidence = 'low';
          isAntigen = true;
        } else {
          type = 'PROTEIN_PARTNER';
        }
      } else {
        // 有靶点 UniProt 但这条链不是
        type = 'PROTEIN_PARTNER';
      }
    } else if (c.atomCount > 0 && c.hetatmCount > 0) {
      // 混合链（有 ATOM 和 HETATM）
      if (targetUniprotIds.size > 0 && uniprotId && targetUniprotIds.has(uniprotId)) {
        type = 'TARGET_CHAIN';
        matchConfidence = bestMatchConfidence;
        isAntigen = true;
      } else {
        type = 'PROTEIN_PARTNER';
      }
    }

    chainList.push({
      chainId: id,
      type,
      matchConfidence,
      atomCount: c.atomCount,
      hetatmCount: c.hetatmCount,
      residueCount: c.residueCount,
      residueRange: c.minResSeq !== Infinity ? [c.minResSeq, c.maxResSeq] : [],
      residueNames: [...c.residueNames].slice(0, 10),
      firstResidueName: c.firstResidueName,
      uniprotId,
      uniprotDescription: uniprotDesc,
      dbrefRange: unpDbrefs.length > 0 ? [unpDbrefs[0].seqBegin, unpDbrefs[0].seqEnd] : [],
      isAntigen,
      ligandName,
    });
  }

  // 如果没有任何靶点链被识别，取最大的蛋白链作为靶点（低置信度）
  const targetChains = chainList.filter(c => c.type === 'TARGET_CHAIN');
  if (targetChains.length === 0) {
    const proteinCandidates = chainList.filter(c => c.atomCount > 0);
    if (proteinCandidates.length > 0) {
      proteinCandidates.sort((a, b) => b.atomCount - a.atomCount);
      proteinCandidates[0].type = 'TARGET_CHAIN';
      proteinCandidates[0].matchConfidence = 'low';
      proteinCandidates[0].isAntigen = true;
    }
  }

  // 统计
  const finalTargetChains = chainList.filter(c => c.type === 'TARGET_CHAIN').map(c => c.chainId);
  const partnerChains = chainList.filter(c => c.type === 'PROTEIN_PARTNER').map(c => c.chainId);
  const ligandChains = chainList.filter(c => c.type === 'LIGAND_CHAIN').map(c => c.chainId);
  const naChains = chainList.filter(c => c.type === 'NUCLEIC_ACID').map(c => c.chainId);
  const waterChains = chainList.filter(c => c.type === 'WATER').map(c => c.chainId);

  // 寡聚体状态推断
  let oligomericState = 'unknown';
  if (finalTargetChains.length === 1) oligomericState = 'monomer';
  else if (finalTargetChains.length === 2) oligomericState = 'homodimer';
  else if (finalTargetChains.length === 3) oligomericState = 'homotrimer';
  else if (finalTargetChains.length === 4) oligomericState = 'homotetramer';
  else if (finalTargetChains.length >= 5) oligomericState = `homo-oligomer(${finalTargetChains.length})`;
  if (result.biologicalAssembly) {
    oligomericState += ` [bio: ${result.biologicalAssembly}]`;
  }

  // 配体列表
  const allLigands = [...new Set(result.hets.map(h => h.hetName))];

  return {
    file: result.file,
    subDir: result.subDir,
    gene: result.gene,
    species: result.species,
    pdbId: result.pdbId,
    title: result.title,
    classification: result.classification,
    method: result.method,
    resolution: result.resolution,
    totalChains: chainList.length,
    chains: chainList,
    targetChains: finalTargetChains,
    partnerChains,
    ligandChains,
    naChains,
    waterChains,
    oligomericState,
    biologicalAssembly: result.biologicalAssembly,
    partnerProteins: chainList
      .filter(c => c.type === 'PROTEIN_PARTNER')
      .map(c => ({ chainId: c.chainId, uniprotId: c.uniprotId, uniprotDescription: c.uniprotDescription, atomCount: c.atomCount })),
    ligands: allLigands,
    notes: '',
  };
}

// ── 主流程 ──────────────────────────────────────────────────
async function main() {
  const args = parseArgs(process.argv);
  const inputDir = path.resolve(args.input);
  const outputDir = path.resolve(args.output);

  console.log(`[analyze_pdb_chains] Input: ${inputDir}`);
  console.log(`[analyze_pdb_chains] Output: ${outputDir}`);

  // 确保输出目录存在
  fs.mkdirSync(outputDir, { recursive: true });

  // 收集所有 PDB 文件
  const subDirs = ['full_human_rank1_pdb', 'immediate_reviewed_pdb'];
  const allFiles = [];

  for (const sub of subDirs) {
    const subPath = path.join(inputDir, sub);
    if (fs.existsSync(subPath)) {
      const files = fs.readdirSync(subPath).filter(f => f.endsWith('.pdb')).sort();
      for (const f of files) {
        allFiles.push({ path: path.join(subPath, f), subDir: sub });
      }
    }
  }

  // 也检查直接在 input 目录下的 .pdb 文件
  const directFiles = fs.readdirSync(inputDir).filter(f => f.endsWith('.pdb'));
  for (const f of directFiles) {
    allFiles.push({ path: path.join(inputDir, f), subDir: '.' });
  }

  console.log(`[analyze_pdb_chains] Found ${allFiles.length} PDB files`);

  const entries = [];
  let processed = 0;
  let errors = 0;
  const startTime = Date.now();

  for (const { path: filePath, subDir } of allFiles) {
    try {
      const entry = await analyzePDBFile(filePath, subDir);
      entries.push(entry);
    } catch (err) {
      errors++;
      entries.push({
        file: path.basename(filePath),
        subDir,
        gene: '',
        species: null,
        pdbId: '',
        title: '',
        classification: '',
        method: '',
        resolution: null,
        totalChains: 0,
        chains: [],
        targetChains: [],
        partnerChains: [],
        ligandChains: [],
        naChains: [],
        waterChains: [],
        oligomericState: 'error',
        biologicalAssembly: '',
        partnerProteins: [],
        ligands: [],
        notes: `ERROR: ${err.message}`,
      });
    }

    processed++;
    if (processed % 500 === 0 || processed === allFiles.length) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      const rate = (processed / (Date.now() - startTime) * 1000).toFixed(1);
      console.log(`[analyze_pdb_chains] Progress: ${processed}/${allFiles.length} (${elapsed}s, ${rate} files/s, ${errors} errors)`);
    }
  }

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`[analyze_pdb_chains] Done in ${totalTime}s, ${errors} errors`);

  // ── 统计 ──────────────────────────────────────────────────
  const stats = {
    totalFiles: entries.length,
    errors,
    singleChain: entries.filter(e => e.totalChains === 1).length,
    multiChain: entries.filter(e => e.totalChains > 1).length,
    avgChainsPerFile: (entries.reduce((s, e) => s + e.totalChains, 0) / entries.length).toFixed(2),
    chainCountDistribution: {},
    chainTypeDistribution: {
      TARGET_CHAIN: 0,
      PROTEIN_PARTNER: 0,
      LIGAND_CHAIN: 0,
      NUCLEIC_ACID: 0,
      WATER: 0,
      UNKNOWN: 0,
    },
    matchConfidenceDistribution: {
      high: 0,
      medium: 0,
      low: 0,
      null: 0,
    },
    oligomericStateDistribution: {},
  };

  for (const e of entries) {
    const cc = e.totalChains;
    stats.chainCountDistribution[cc] = (stats.chainCountDistribution[cc] || 0) + 1;

    for (const c of e.chains) {
      stats.chainTypeDistribution[c.type] = (stats.chainTypeDistribution[c.type] || 0) + 1;
    }

    // 靶点链匹配置信度
    const targetChains = e.chains.filter(c => c.type === 'TARGET_CHAIN');
    const bestConf = targetChains.reduce((best, c) => {
      const order = { high: 3, medium: 2, low: 1, null: 0 };
      return (order[c.matchConfidence] || 0) > (order[best] || 0) ? c.matchConfidence : best;
    }, null);
    stats.matchConfidenceDistribution[bestConf || 'null'] = (stats.matchConfidenceDistribution[bestConf || 'null'] || 0) + 1;

    // 寡聚体状态
    const olioBase = e.oligomericState.split(' [')[0];
    stats.oligomericStateDistribution[olioBase] = (stats.oligomericStateDistribution[olioBase] || 0) + 1;
  }

  // ── 输出 A: 完整 JSON 清单 ────────────────────────────────
  const fullJSON = {
    generatedAt: new Date().toISOString(),
    sourceDir: inputDir,
    totalFiles: entries.length,
    statistics: stats,
    entries: entries.sort((a, b) => a.file.localeCompare(b.file)),
  };

  const jsonPath = path.join(outputDir, 'pdb-chain-analysis.json');
  fs.writeFileSync(jsonPath, JSON.stringify(fullJSON, null, 2));
  console.log(`[analyze_pdb_chains] Written: ${jsonPath} (${(fs.statSync(jsonPath).size / 1024 / 1024).toFixed(1)} MB)`);

  // ── 输出 B: CSV 速查表 ────────────────────────────────────
  const csvHeader = 'file,subDir,gene,species,pdbId,title,totalChains,targetChains,partnerChains,ligandChains,naChains,oligomericState,method,resolution,classification,ligands\n';
  const csvLines = entries.map(e => {
    const esc = (s) => `"${String(s).replace(/"/g, '""')}"`;
    return [
      esc(e.file),
      esc(e.subDir),
      esc(e.gene),
      esc(e.species || ''),
      esc(e.pdbId),
      esc(e.title.substring(0, 120)),
      e.totalChains,
      esc(e.targetChains.join(';')),
      esc(e.partnerChains.join(';')),
      esc(e.ligandChains.join(';')),
      esc(e.naChains.join(';')),
      esc(e.oligomericState),
      esc(e.method),
      e.resolution || '',
      esc(e.classification),
      esc(e.ligands.join(',')),
    ].join(',');
  });
  const csvPath = path.join(outputDir, 'pdb-chain-analysis.csv');
  fs.writeFileSync(csvPath, '\ufeff' + csvHeader + csvLines.join('\n') + '\n', 'utf8');
  console.log(`[analyze_pdb_chains] Written: ${csvPath}`);

  // ── 输出 C: 系统预设 JSON ─────────────────────────────────
  const presets = entries.map(e => ({
    gene: e.gene,
    pdbId: e.pdbId,
    sourceFile: e.file,
    subDir: e.subDir,
    species: e.species,
    structuralBasis: `RCSB ${e.pdbId}${e.title ? ' - ' + e.title : ''}`,
    antigenChains: e.targetChains,
    sourceAntigenChains: e.targetChains,
    antibodyChains: [],
    oligomericState: e.oligomericState.split(' [')[0],
    classification: e.classification,
    method: e.method,
    resolution: e.resolution,
    title: e.title,
    totalChains: e.totalChains,
    chainDetails: e.chains.map(c => ({
      chainId: c.chainId,
      type: c.type,
      matchConfidence: c.matchConfidence,
      uniprotId: c.uniprotId,
      uniprotDescription: c.uniprotDescription,
      atomCount: c.atomCount,
      hetatmCount: c.hetatmCount,
      residueCount: c.residueCount,
      ligandName: c.ligandName || undefined,
    })),
  }));

  const presetsJSON = {
    generatedAt: new Date().toISOString(),
    totalPresets: presets.length,
    presets: presets.sort((a, b) => a.gene.localeCompare(b.gene)),
  };

  const presetsPath = path.join(outputDir, 'pdb-chain-presets.json');
  fs.writeFileSync(presetsPath, JSON.stringify(presetsJSON, null, 2));
  console.log(`[analyze_pdb_chains] Written: ${presetsPath} (${(fs.statSync(presetsPath).size / 1024 / 1024).toFixed(1)} MB)`);

  // ── 输出 D: Markdown 统计报告 ─────────────────────────────
  const md = generateMarkdownReport(fullJSON);
  const mdPath = path.join(outputDir, 'pdb-chain-analysis-report.md');
  fs.writeFileSync(mdPath, md, 'utf8');
  console.log(`[analyze_pdb_chains] Written: ${mdPath}`);

  console.log(`\n[analyze_pdb_chains] All outputs written to: ${outputDir}`);
  console.log(`[analyze_pdb_chains] Total time: ${totalTime}s`);
}

// ── Markdown 报告生成 ───────────────────────────────────────
function generateMarkdownReport(data) {
  const s = data.statistics;
  let md = `# PDB 靶点链分析报告\n\n`;
  md += `**生成时间**：${data.generatedAt}\n`;
  md += `**数据源**：${data.sourceDir}\n`;
  md += `**文件总数**：${data.totalFiles}\n\n`;

  md += `## 总览统计\n\n`;
  md += `| 指标 | 数值 |\n|------|------|\n`;
  md += `| 总文件数 | ${s.totalFiles} |\n`;
  md += `| 解析错误 | ${s.errors} |\n`;
  md += `| 单链结构 | ${s.singleChain} |\n`;
  md += `| 多链结构 | ${s.multiChain} |\n`;
  md += `| 平均链数/文件 | ${s.avgChainsPerFile} |\n\n`;

  md += `### 链类型分布\n\n`;
  md += `| 链类型 | 数量 |\n|--------|------|\n`;
  for (const [k, v] of Object.entries(s.chainTypeDistribution).sort((a, b) => b[1] - a[1])) {
    md += `| ${k} | ${v} |\n`;
  }
  md += `\n`;

  md += `### 靶点链匹配置信度\n\n`;
  md += `| 置信度 | 文件数 | 占比 |\n|--------|--------|------|\n`;
  for (const k of ['high', 'medium', 'low', 'null']) {
    const v = s.matchConfidenceDistribution[k] || 0;
    md += `| ${k} | ${v} | ${(v / s.totalFiles * 100).toFixed(1)}% |\n`;
  }
  md += `\n`;

  md += `### 寡聚体状态分布\n\n`;
  md += `| 寡聚体状态 | 文件数 |\n|-----------|--------|\n`;
  for (const [k, v] of Object.entries(s.oligomericStateDistribution).sort((a, b) => b[1] - a[1])) {
    md += `| ${k} | ${v} |\n`;
  }
  md += `\n`;

  md += `### 链数分布\n\n`;
  md += `| 链数 | 文件数 |\n|------|--------|\n`;
  for (const [k, v] of Object.entries(s.chainCountDistribution).sort((a, b) => parseInt(a[0]) - parseInt(b[0]))) {
    md += `| ${k} | ${v} |\n`;
  }
  md += `\n`;

  // 低置信度匹配列表（需人工审核）
  const lowConfidence = data.entries.filter(e => {
    const targets = e.chains.filter(c => c.type === 'TARGET_CHAIN');
    return targets.some(c => c.matchConfidence === 'low' || c.matchConfidence === null);
  });
  md += `## 低置信度匹配（需人工审核）\n\n`;
  md += `共 ${lowConfidence.length} 个文件需要人工确认靶点链。\n\n`;
  if (lowConfidence.length > 0) {
    md += `| 文件 | 基因 | PDB ID | 靶点链 | 总链数 | 标题 |\n|------|------|--------|--------|--------|------|\n`;
    for (const e of lowConfidence.slice(0, 100)) {
      md += `| ${e.file} | ${e.gene} | ${e.pdbId} | ${e.targetChains.join(',')} | ${e.totalChains} | ${e.title.substring(0, 60)} |\n`;
    }
    if (lowConfidence.length > 100) {
      md += `\n... 还有 ${lowConfidence.length - 100} 个，请查看 JSON 清单。\n`;
    }
  }
  md += `\n`;

  // 多链靶点 Top 20
  const multiChain = data.entries
    .filter(e => e.totalChains >= 10)
    .sort((a, b) => b.totalChains - a.totalChains);
  md += `## 多链结构 Top 20（≥10 条链）\n\n`;
  md += `| 文件 | 基因 | PDB ID | 总链数 | 靶点链 | 伙伴链 | 配体链 | 标题 |\n|------|------|--------|--------|--------|--------|--------|------|\n`;
  for (const e of multiChain.slice(0, 20)) {
    md += `| ${e.file} | ${e.gene} | ${e.pdbId} | ${e.totalChains} | ${e.targetChains.join(',')} | ${e.partnerChains.length}条 | ${e.ligandChains.join(',')} | ${e.title.substring(0, 50)} |\n`;
  }
  md += `\n`;

  // 同源多聚体列表
  const multimers = data.entries
    .filter(e => e.targetChains.length >= 2)
    .sort((a, b) => b.targetChains.length - a.targetChains.length);
  md += `## 同源多聚体靶点（≥2 条靶点链）\n\n`;
  md += `共 ${multimers.length} 个文件。\n\n`;
  md += `| 文件 | 基因 | PDB ID | 靶点链数 | 靶点链 | 寡聚体状态 |\n|------|------|--------|----------|--------|-----------|\n`;
  for (const e of multimers.slice(0, 50)) {
    md += `| ${e.file} | ${e.gene} | ${e.pdbId} | ${e.targetChains.length} | ${e.targetChains.join(',')} | ${e.oligomericState.split(' [')[0]} |\n`;
  }
  if (multimers.length > 50) {
    md += `\n... 还有 ${multimers.length - 50} 个。\n`;
  }
  md += `\n`;

  return md;
}

main().catch(err => {
  console.error('[analyze_pdb_chains] Fatal error:', err);
  process.exit(1);
});
