#!/usr/bin/env node
/**
 * build-expanded-index.js
 *
 * 从隔离工作目录的 manifest.json 和 target_expansion_full.csv 构建
 * pdb/expanded-target-index.json，供运行时 Tier 2 匹配引擎使用。
 *
 * 精简策略：
 *   manifest.json (116MB) → expanded-target-index.json (~30MB)
 *   每个 pose 只保留 fileName, scaffold, format, antibodyChains, geometry.minDistance
 *   CSV 只保留 approved_symbol, approved_name, uniprot, disease_count,
 *   max_association_score, top_indications（前5）
 *
 * 用法:
 *   node scripts/build-expanded-index.js
 *   node scripts/build-expanded-index.js --update   # 增量更新（保留现有别名）
 */

'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// ─── 路径配置 ─────────────────────────────────────────────
const PROJECT_ROOT = path.resolve(__dirname, '..');
const ISOLATED_DIR = '/Users/ryan/.trae-cn/work/6a6b5f0283052dfa200e13ce/target_expansion_isolated';
const MANIFEST_PATH = path.join(ISOLATED_DIR, 'complexes', 'manifest.json');
const CSV_PATH = path.join(ISOLATED_DIR, 'generated', 'full_human_targets', 'target_expansion_full.csv');
const OUTPUT_PATH = path.join(PROJECT_ROOT, 'pdb', 'expanded-target-index.json');

// ─── 常见基因别名表（手工维护，用于多键匹配） ───────────────
const GENE_ALIASES = {
  ERBB2: ['HER2', 'NEU', 'NGL', 'TKR1', 'CD340'],
  ERBB1: ['EGFR', 'HER1'],
  PDCD1LG2: ['PD-L2', 'B7-DC', 'CD273'],
  CD274: ['PD-L1', 'B7-H1', 'PDL1', 'PDCD1LG1'],
  PDCD1: ['PD1', 'PD-1'],
  IL33: ['IL-33', 'NFHEV', 'C9orf26', 'IL1F11'],
  IL6R: ['IL-6R', 'IL6RA', 'CD126'],
  TNF: ['TNF-alpha', 'TNFA', 'TNFSF1A', 'DIF'],
  VEGFA: ['VEGF-A', 'VEGF', 'VPF'],
  PCSK9: ['PC9', 'NARC1', 'FH3'],
  TSLP: ['TYMP', 'IL-7-like'],
  IL17A: ['IL-17A', 'CTLA8', 'IL17'],
  ANGPTL3: ['ANGPT3', 'ANG-5', 'ANGPTL-3'],
  RSVF: ['RSV-F', 'RSV F protein', 'F protein'],
  HER2: ['ERBB2', 'NEU'],
  EGFR: ['ERBB1', 'HER1'],
  'PD-L1': ['CD274', 'B7-H1', 'PDL1'],
  'PD-L2': ['PDCD1LG2', 'B7-DC', 'CD273'],
  'PD-1': ['PDCD1', 'PD1'],
  'IL-33': ['IL33', 'NFHEV'],
  'IL-6R': ['IL6R', 'CD126'],
  'VEGF-A': ['VEGFA', 'VEGF'],
  'TNF-alpha': ['TNF', 'TNFA'],
};

// ─── CSV 解析 ─────────────────────────────────────────────
function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const targets = new Map();
    const stream = fs.createReadStream(filePath, 'utf8');
    const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

    let headers = null;
    let lineNum = 0;

    rl.on('line', (line) => {
      lineNum++;
      if (lineNum === 1) {
        headers = parseCSVLine(line);
        return;
      }
      if (!line.trim()) return;

      const fields = parseCSVLine(line);
      const entry = {};
      headers.forEach((h, i) => {
        entry[h] = (fields[i] || '').trim();
      });

      const gene = (entry.approved_symbol || entry.target_id || '').toUpperCase().trim();
      if (!gene) return;

      // 解析 top_indications（取前5）
      let topDiseases = [];
      const rawDiseases = entry.top_indications || '';
      if (rawDiseases) {
        const parts = rawDiseases.split('|').slice(0, 5);
        topDiseases = parts.map(p => {
          const match = p.match(/^(.+?)\s*\[/);
          return match ? match[1].trim() : p.trim();
        }).filter(Boolean);
      }

      targets.set(gene, {
        gene,
        uniprot: entry.uniprot || '',
        proteinName: entry.approved_name || '',
        diseaseCount: parseInt(entry.disease_count, 10) || 0,
        maxAssociationScore: parseFloat(entry.max_association_score) || 0,
        topDiseases,
        structureStatus: entry.structure_status || '',
        representativePdb: entry.representative_pdb || '',
        representativeMethod: entry.representative_method || '',
      });
    });

    rl.on('close', () => {
      console.log(`[csv] Parsed ${targets.size} targets from CSV`);
      resolve(targets);
    });

    rl.on('error', reject);
  });
}

// 简单 CSV 行解析（处理引号包裹的字段）
function parseCSVLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current);
  return fields;
}

// ─── Manifest 流式解析 ─────────────────────────────────────
function parseManifest(filePath) {
  return new Promise((resolve, reject) => {
    // manifest.json 是一个大 JSON 文件，直接读取并解析
    // 116MB 在 Node.js 中可以处理
    console.log('[manifest] Reading manifest.json (116MB)...');

    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) return reject(err);

      console.log('[manifest] Parsing JSON...');
      const manifest = JSON.parse(data);

      const targets = new Map();
      const manifestTargets = manifest.targets || [];

      console.log(`[manifest] Processing ${manifestTargets.length} targets...`);

      for (const t of manifestTargets) {
        const gene = (t.gene || '').toUpperCase().trim();
        if (!gene) continue;

        // 精简 poses 数组
        const poses = (t.poses || []).map(p => ({
          fileName: p.fileName || '',
          scaffold: p.scaffold || '',
          format: p.format || 'Fab',
          antibodyChains: Array.isArray(p.antibodyChains) ? p.antibodyChains : [],
          geometry: {
            minDistance: p.geometry ? p.geometry.minDistance || null : null,
          },
        }));

        targets.set(gene, {
          gene,
          pdbId: t.pdbId || '',
          fabCount: t.fabCount || 0,
          vhhCount: t.vhhCount || 0,
          antigenChains: Array.isArray(t.antigenChains) ? t.antigenChains : [],
          poses,
          structureSource: t.status === 'success' ? 'experimental' : 'mixed',
        });
      }

      console.log(`[manifest] Processed ${targets.size} targets`);
      resolve(targets);
    });
  });
}

// ─── 合并数据源 ──────────────────────────────────────────
function mergeSources(manifestTargets, csvTargets) {
  const merged = {};
  let mergedCount = 0;
  let csvOnlyCount = 0;
  let manifestOnlyCount = 0;

  // 以 manifest 为基础
  for (const [gene, manifestEntry] of manifestTargets) {
    const csvEntry = csvTargets.get(gene);

    merged[gene] = {
      gene,
      ...manifestEntry,
      uniprot: csvEntry?.uniprot || '',
      proteinName: csvEntry?.proteinName || '',
      diseaseCount: csvEntry?.diseaseCount || 0,
      maxAssociationScore: csvEntry?.maxAssociationScore || 0,
      topDiseases: csvEntry?.topDiseases || [],
      aliases: getAliases(gene),
      complexDir: gene,
    };
    mergedCount++;
  }

  // CSV 中有但 manifest 中没有的靶点
  for (const [gene, csvEntry] of csvTargets) {
    if (!manifestTargets.has(gene)) {
      csvOnlyCount++;
      // 不加入索引（没有 PDB 结构的靶点不入库）
    }
  }

  console.log(`[merge] Merged: ${mergedCount}, CSV-only (no PDB): ${csvOnlyCount}, Manifest-only: ${manifestOnlyCount}`);
  return merged;
}

function getAliases(gene) {
  const aliases = new Set();
  // 从别名表查找
  if (GENE_ALIASES[gene]) {
    GENE_ALIASES[gene].forEach(a => aliases.add(a.toUpperCase()));
  }
  // 反向查找
  for (const [key, values] of Object.entries(GENE_ALIASES)) {
    if (values.some(v => v.toUpperCase() === gene)) {
      aliases.add(key.toUpperCase());
      values.forEach(v => aliases.add(v.toUpperCase()));
    }
  }
  aliases.delete(gene.toUpperCase());
  return [...aliases];
}

// ─── 主流程 ──────────────────────────────────────────────
async function main() {
  const isUpdate = process.argv.includes('--update');

  console.log('=== build-expanded-index.js ===');
  console.log(`Mode: ${isUpdate ? 'update' : 'full'}`);
  console.log(`Manifest: ${MANIFEST_PATH}`);
  console.log(`CSV: ${CSV_PATH}`);
  console.log(`Output: ${OUTPUT_PATH}`);
  console.log();

  // 检查输入文件
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error(`ERROR: Manifest not found: ${MANIFEST_PATH}`);
    process.exit(1);
  }
  if (!fs.existsSync(CSV_PATH)) {
    console.warn(`WARNING: CSV not found: ${CSV_PATH} (continuing without disease data)`);
  }

  // 1. 解析 manifest
  const manifestTargets = await parseManifest(MANIFEST_PATH);

  // 2. 解析 CSV（如果存在）
  let csvTargets = new Map();
  if (fs.existsSync(CSV_PATH)) {
    csvTargets = await parseCSV(CSV_PATH);
  }

  // 3. 合并
  const merged = mergeSources(manifestTargets, csvTargets);

  // 4. 如果是更新模式，保留现有别名
  if (isUpdate && fs.existsSync(OUTPUT_PATH)) {
    try {
      const existing = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf8'));
      if (existing.targets) {
        for (const [gene, entry] of Object.entries(existing.targets)) {
          if (merged[gene] && entry.aliases && entry.aliases.length) {
            const existingAliases = new Set(merged[gene].aliases.map(a => a.toUpperCase()));
            entry.aliases.forEach(a => existingAliases.add(a.toUpperCase()));
            merged[gene].aliases = [...existingAliases];
          }
        }
        console.log('[update] Preserved aliases from existing index');
      }
    } catch (e) {
      console.warn('[update] Failed to read existing index, ignoring aliases');
    }
  }

  // 5. 构建输出
  const output = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    totalTargets: Object.keys(merged).length,
    sources: {
      manifest: path.basename(MANIFEST_PATH),
      csv: fs.existsSync(CSV_PATH) ? path.basename(CSV_PATH) : null,
    },
    targets: merged,
  };

  // 6. 统计信息
  let totalFab = 0, totalVhh = 0, totalPoses = 0;
  for (const entry of Object.values(merged)) {
    totalFab += entry.fabCount || 0;
    totalVhh += entry.vhhCount || 0;
    totalPoses += entry.poses ? entry.poses.length : 0;
  }

  console.log();
  console.log('=== Statistics ===');
  console.log(`Total targets: ${output.totalTargets}`);
  console.log(`Total Fab poses: ${totalFab}`);
  console.log(`Total VHH poses: ${totalVhh}`);
  console.log(`Total poses: ${totalPoses}`);
  console.log(`Avg poses/target: ${(totalPoses / output.totalTargets).toFixed(1)}`);

  // 7. 写入文件
  const outputDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`\nWriting to ${OUTPUT_PATH}...`);
  const jsonStr = JSON.stringify(output, null, 0); // 无缩进，减小文件大小
  fs.writeFileSync(OUTPUT_PATH, jsonStr, 'utf8');

  const fileSize = fs.statSync(OUTPUT_PATH).size;
  console.log(`Done! File size: ${(fileSize / 1024 / 1024).toFixed(1)} MB`);
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
