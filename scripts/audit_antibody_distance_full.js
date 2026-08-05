'use strict';

/**
 * PDB 抗原抗体距离全量审计脚本
 *
 * 扫描项目内所有 .pdb 文件，解析实际原子坐标，
 * 计算质心距离、视觉间隙和最小原子对距离，
 * 输出距离过远的问题清单。
 *
 * 用法:
 *   node scripts/audit_antibody_distance_full.js [--quick] [--target-dir <dir>]
 *   --quick        仅扫描根目录 pdb/ 下的文件（跳过 expanded/）
 *   --target-dir   只扫描指定目录（用于调试）
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PDB_DIR = path.join(ROOT, 'pdb');

// ─── 阈值 ───
const VISUAL_GAP_BAD = 20;     // 视觉间隙 > 20Å → BAD_VISUAL
const VISUAL_GAP_WARN = 12;    // 视觉间隙 > 12Å → WARNING
const MINDIST_BAD = 10;
const MINDIST_WARN = 5;
// CoM 距离阈值（按格式区分）：抗体有接触但整体距离过远
const COM_BAD_FAB = 65;    // Fab CoM > 65Å 且有接触 → BAD_VISUAL
const COM_BAD_VHH = 50;    // VHH CoM > 50Å 且有接触 → BAD_VISUAL
const COM_WARN_FAB = 55;
const COM_WARN_VHH = 40;

const EXCLUDE_DIRS = new Set([
  'node_modules', '.runtime', '.git',
  'antigen-only-sweep', 'scaffolds',
]);

// ─── 向量工具 ───
function vDist(a, b) {
  const dx = a[0]-b[0], dy = a[1]-b[1], dz = a[2]-b[2];
  return Math.sqrt(dx*dx + dy*dy + dz*dz);
}

/**
 * 从 REMARK 头部提取链声明
 */
function parseRemarks(lines) {
  let antigenChains = null;
  let antibodyChains = null;
  let format = null;
  let target = null;
  let isRoutePreset = false;

  for (let i = 0; i < Math.min(lines.length, 30); i++) {
    const line = lines[i];
    if (line.startsWith('HEADER') && line.includes('ROUTE PRESET')) isRoutePreset = true;
    if (line.startsWith('REMARK 900') && !target) {
      const m = line.match(/TARGET:\s*(\S+)/); if (m) target = m[1];
    }
    if (line.startsWith('REMARK 902')) {
      const m = line.match(/FORMAT:\s*(\S+)/); if (m) format = m[1];
    }
    if (line.startsWith('REMARK 904')) {
      const m = line.match(/ANTIGEN\s+CHAINS:\s*(.+)/i);
      if (m) antigenChains = m[1].trim().split(/[,;\s]+/).filter(Boolean);
    }
    if (line.startsWith('REMARK 905')) {
      const m = line.match(/ANTIBODY\s+CHAINS:\s*(.+)/i);
      if (m) antibodyChains = m[1].trim().split(/[,;\s]+/).filter(Boolean);
    }
  }
  return { antigenChains, antibodyChains, format, target, isRoutePreset };
}

/**
 * 自动检测链 ID 所在列位置（position 20 或 21）
 * 返回匹配度最高的位置
 */
function detectChainColumn(lines, expectedChains) {
  if (!expectedChains || !expectedChains.length) return 21;
  const expected = new Set(expectedChains);
  let match20 = 0, match21 = 0, total = 0;

  for (let i = 0; i < lines.length && total < 500; i++) {
    const line = lines[i];
    if (!line.startsWith('ATOM  ') && !line.startsWith('HETATM')) continue;
    total++;
    const c20 = line[20] || ' ';
    const c21 = line[21] || ' ';
    if (expected.has(c20)) match20++;
    if (expected.has(c21)) match21++;
  }

  return match20 > match21 ? 20 : 21;
}

/**
 * 解析 ATOM 记录，按链分组返回重原子坐标
 */
function parseAtomCoords(lines, chainCol, allExpectedChains) {
  const chains = {};
  let modelSeen = false;
  let inFirstModel = true;
  const expected = allExpectedChains ? new Set(allExpectedChains) : null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('MODEL')) {
      if (modelSeen) { inFirstModel = false; continue; }
      modelSeen = true; inFirstModel = true; continue;
    }
    if (line.startsWith('ENDMDL')) {
      if (modelSeen && inFirstModel) inFirstModel = false;
      continue;
    }
    if (!inFirstModel) continue;
    if (!line.startsWith('ATOM  ') && !line.startsWith('HETATM')) continue;

    const padded = line.padEnd(80, ' ');
    const chain = padded[chainCol] || ' ';
    if (expected && !expected.has(chain)) continue;

    const x = parseFloat(padded.slice(30, 38));
    const y = parseFloat(padded.slice(38, 46));
    const z = parseFloat(padded.slice(46, 54));
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) continue;

    const atomName = padded.slice(12, 16).trim();
    const element = padded.slice(76, 78).trim().toUpperCase();
    const isHeavy = element ? (element !== 'H' && element !== 'D') : !/^\d*[HD]/i.test(atomName);
    if (!isHeavy) continue;

    if (!chains[chain]) chains[chain] = [];
    chains[chain].push([x, y, z]);
  }
  return chains;
}

function centerOfMass(coords) {
  if (!coords || !coords.length) return null;
  let sx = 0, sy = 0, sz = 0;
  for (const c of coords) { sx += c[0]; sy += c[1]; sz += c[2]; }
  return [sx / coords.length, sy / coords.length, sz / coords.length];
}

function radiusOfGyration(coords, com) {
  if (!coords || coords.length < 2) return 0;
  const c = com || centerOfMass(coords);
  let sumSq = 0;
  for (const p of coords) {
    const dx = p[0]-c[0], dy = p[1]-c[1], dz = p[2]-c[2];
    sumSq += dx*dx + dy*dy + dz*dz;
  }
  return Math.sqrt(sumSq / coords.length);
}

/**
 * 空间网格加速的最小原子对距离
 */
function minAtomDistance(coordsA, coordsB, cutoff) {
  if (!coordsA || !coordsB || !coordsA.length || !coordsB.length) return Infinity;
  const limit = cutoff || 50;
  const cellSize = limit;
  const grid = new Map();

  for (const p of coordsA) {
    const key = Math.floor(p[0]/cellSize) + ',' + Math.floor(p[1]/cellSize) + ',' + Math.floor(p[2]/cellSize);
    if (!grid.has(key)) grid.set(key, []);
    grid.get(key).push(p);
  }

  let minDistSq = Infinity;
  for (const p of coordsB) {
    const cx = Math.floor(p[0]/cellSize), cy = Math.floor(p[1]/cellSize), cz = Math.floor(p[2]/cellSize);
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dz = -1; dz <= 1; dz++) {
          const cell = grid.get((cx+dx)+','+(cy+dy)+','+(cz+dz));
          if (!cell) continue;
          for (const q of cell) {
            const ddx = p[0]-q[0], ddy = p[1]-q[1], ddz = p[2]-q[2];
            const dsq = ddx*ddx + ddy*ddy + ddz*ddz;
            if (dsq < minDistSq) minDistSq = dsq;
          }
        }
      }
    }
    if (minDistSq < 4) break; // 早停
  }
  return minDistSq === Infinity ? Infinity : Math.sqrt(minDistSq);
}

function collectPdbFiles(dir, quick, targetDir, results) {
  results = results || [];
  // 如果指定了 target-dir，只扫描该目录
  if (targetDir && path.resolve(dir) === path.resolve(PDB_DIR)) {
    dir = path.join(PDB_DIR, targetDir);
    if (!fs.existsSync(dir)) return results;
  }
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch (e) { return results; }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (quick && entry.name === 'expanded') continue;
      if (EXCLUDE_DIRS.has(entry.name)) continue;
      if (entry.name.includes('zoonoab,click.mab 2')) continue;
      collectPdbFiles(fullPath, quick, null, results);
    } else if (entry.isFile() && entry.name.endsWith('.pdb')) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * 审计单个 PDB 文件
 */
function auditFile(filePath) {
  let content;
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    return { file: filePath, status: 'READ_ERROR', error: e.message };
  }

  const stat = fs.statSync(filePath);
  if (stat.size > 50 * 1024 * 1024) {
    return { file: filePath, status: 'SKIP_TOO_LARGE', size: stat.size };
  }

  const lines = content.split(/\r?\n/);
  const remarks = parseRemarks(lines);

  if (!remarks.antigenChains || !remarks.antibodyChains) return null;
  if (!remarks.antigenChains.length || !remarks.antibodyChains.length) return null;

  const allChains = [...remarks.antigenChains, ...remarks.antibodyChains];
  // 自动检测链 ID 列位置
  const chainCol = detectChainColumn(lines, allChains);
  const chainCoords = parseAtomCoords(lines, chainCol, allChains);

  // 收集抗原和抗体坐标
  let antigenCoords = [];
  for (const ch of remarks.antigenChains) {
    const coords = chainCoords[ch];
    if (coords) antigenCoords = antigenCoords.concat(coords);
  }
  let antibodyCoords = [];
  for (const ch of remarks.antibodyChains) {
    const coords = chainCoords[ch];
    if (coords) antibodyCoords = antibodyCoords.concat(coords);
  }

  if (antigenCoords.length < 3 || antibodyCoords.length < 3) {
    return {
      file: path.relative(ROOT, filePath),
      status: 'INSUFFICIENT_ATOMS',
      antigenAtoms: antigenCoords.length,
      antibodyAtoms: antibodyCoords.length,
      antigenChains: remarks.antigenChains,
      antibodyChains: remarks.antibodyChains,
      chainCol,
    };
  }

  const agCoM = centerOfMass(antigenCoords);
  const abCoM = centerOfMass(antibodyCoords);
  const agRg = radiusOfGyration(antigenCoords, agCoM);
  const abRg = radiusOfGyration(antibodyCoords, abCoM);

  const comDistance = vDist(agCoM, abCoM);
  const visualGap = comDistance - agRg - abRg;

  // 按格式确定 CoM 阈值
  const isFab = remarks.format === 'Fab';
  const comBadThreshold = isFab ? COM_BAD_FAB : COM_BAD_VHH;
  const comWarnThreshold = isFab ? COM_WARN_FAB : COM_WARN_VHH;

  // 仅对可疑文件计算 minDist
  let minDist;
  const needsMinDistCheck = visualGap > VISUAL_GAP_WARN || comDistance > comWarnThreshold;
  if (needsMinDistCheck) {
    minDist = minAtomDistance(antigenCoords, antibodyCoords, 50);
  } else {
    minDist = 2.5; // 快速路径
  }

  let status;
  if (minDist > MINDIST_BAD) {
    status = 'BAD_DISTANCE';
  } else if (minDist <= 5 && (visualGap > VISUAL_GAP_BAD || comDistance > comBadThreshold)) {
    status = 'BAD_VISUAL';
  } else if (minDist > MINDIST_WARN || visualGap > VISUAL_GAP_WARN || comDistance > comWarnThreshold) {
    status = 'WARNING';
  } else {
    status = 'OK';
  }

  return {
    file: path.relative(ROOT, filePath),
    status,
    target: remarks.target,
    format: remarks.format,
    isRoutePreset: remarks.isRoutePreset,
    antigenChains: remarks.antigenChains,
    antibodyChains: remarks.antibodyChains,
    antigenAtoms: antigenCoords.length,
    antibodyAtoms: antibodyCoords.length,
    comDistance: Math.round(comDistance * 10) / 10,
    visualGap: Math.round(visualGap * 10) / 10,
    minDist: Math.round(minDist * 100) / 100,
    agRg: Math.round(agRg * 10) / 10,
    abRg: Math.round(abRg * 10) / 10,
    chainCol,
  };
}

function main() {
  const args = process.argv.slice(2);
  const quick = args.includes('--quick');
  const targetDirIdx = args.indexOf('--target-dir');
  const targetDir = targetDirIdx >= 0 ? args[targetDirIdx + 1] : null;

  console.log('=== PDB 抗原抗体距离全量审计 ===');
  console.log('扫描目录:', targetDir ? path.join(PDB_DIR, targetDir) : PDB_DIR);
  console.log('模式:', quick ? '快速' : '全量');

  console.time('文件收集');
  const files = collectPdbFiles(PDB_DIR, quick, targetDir);
  console.timeEnd('文件收集');
  console.log('找到 PDB 文件:', files.length);

  console.time('审计');
  const problems = [];
  const stats = { total: 0, skipped: 0, ok: 0, warning: 0, badDistance: 0, badVisual: 0, insufficient: 0, readError: 0 };

  const BATCH_LOG = 5000;
  for (let i = 0; i < files.length; i++) {
    const result = auditFile(files[i]);
    if (result === null) { stats.skipped++; continue; }
    stats.total++;

    switch (result.status) {
      case 'OK': stats.ok++; break;
      case 'WARNING': stats.warning++; problems.push(result); break;
      case 'BAD_DISTANCE': stats.badDistance++; problems.push(result); break;
      case 'BAD_VISUAL': stats.badVisual++; problems.push(result); break;
      case 'INSUFFICIENT_ATOMS': stats.insufficient++; break;
      case 'READ_ERROR': stats.readError++; break;
      case 'SKIP_TOO_LARGE': stats.skipped++; break;
    }

    if ((i + 1) % BATCH_LOG === 0) {
      const pct = ((i + 1) / files.length * 100).toFixed(1);
      process.stdout.write(`\r  进度: ${i+1}/${files.length} (${pct}%) - 问题: ${problems.length}`);
    }
  }
  if (files.length >= BATCH_LOG) console.log('');
  console.timeEnd('审计');

  problems.sort((a, b) => (b.visualGap || 0) - (a.visualGap || 0));

  const jsonPath = path.join(ROOT, 'pdb-distance-audit-full.json');
  const badOnly = problems.filter(p => p.status === 'BAD_DISTANCE' || p.status === 'BAD_VISUAL');
  const warnings = problems.filter(p => p.status === 'WARNING');
  const jsonData = {
    scanDate: new Date().toISOString(),
    totalFiles: files.length,
    totalComplexes: stats.total,
    stats,
    problems: badOnly,
    warnings,
  };
  fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));
  console.log('JSON 报告:', jsonPath);

  const mdPath = path.join(ROOT, 'pdb-distance-audit-full.md');
  generateMarkdownReport(mdPath, jsonData);
  console.log('Markdown 报告:', mdPath);

  console.log('\n=== 审计摘要 ===');
  console.log('总复合物:', stats.total);
  console.log('正常:', stats.ok, '| 警告:', stats.warning, '| 距离过远:', stats.badDistance, '| 视觉漂浮:', stats.badVisual);
  console.log('总问题:', stats.badDistance + stats.badVisual);

  if (badOnly.length > 0) {
    console.log('\n=== 问题文件 Top 20 ===');
    for (const p of badOnly.slice(0, 20)) {
      console.log(`  [${p.status}] ${p.file} | CoM=${p.comDistance}Å gap=${p.visualGap}Å minDist=${p.minDist}Å`);
    }
  }
}

function generateMarkdownReport(mdPath, data) {
  const lines = [];
  lines.push('# PDB 抗原抗体距离全量审计报告');
  lines.push('');
  lines.push(`**扫描日期:** ${data.scanDate}`);
  lines.push(`**检测方法:** 实际原子坐标解析 + 质心距离 + 视觉间隙 + 最小原子对距离`);
  lines.push('');
  lines.push('---\n');

  lines.push('## 总体统计\n');
  lines.push('| 指标 | 数量 | 占比 |');
  lines.push('|------|------|------|');
  const s = data.stats;
  const total = s.total || 1;
  lines.push(`| **总复合物** | **${s.total}** | 100% |`);
  lines.push(`| 正常 (OK) | ${s.ok} | ${(s.ok/total*100).toFixed(1)}% |`);
  lines.push(`| 警告 (WARNING) | ${s.warning} | ${(s.warning/total*100).toFixed(1)}% |`);
  lines.push(`| 距离过远 (BAD_DISTANCE) | ${s.badDistance} | ${(s.badDistance/total*100).toFixed(1)}% |`);
  lines.push(`| 视觉漂浮 (BAD_VISUAL) | ${s.badVisual} | ${(s.badVisual/total*100).toFixed(1)}% |`);
  lines.push(`| 原子不足 | ${s.insufficient} | - |\n`);

  const allBad = data.problems;
  if (allBad.length > 0) {
    lines.push('---\n');
    lines.push(`## 问题文件清单 (${allBad.length} 个)\n`);

    // 按目录
    const byDir = {};
    for (const p of allBad) {
      const dir = path.dirname(p.file);
      if (!byDir[dir]) byDir[dir] = [];
      byDir[dir].push(p);
    }
    lines.push('### 按目录分布\n');
    lines.push('| 目录 | 问题数 |');
    lines.push('|------|--------|');
    for (const [dir, items] of Object.entries(byDir).sort((a, b) => b[1].length - a[1].length).slice(0, 30)) {
      lines.push(`| \`${dir}\` | ${items.length} |`);
    }
    lines.push('');

    // 按靶点
    const byTarget = {};
    for (const p of allBad) {
      const t = p.target || 'unknown';
      if (!byTarget[t]) byTarget[t] = [];
      byTarget[t].push(p);
    }
    lines.push('### 按靶点分布 (Top 30)\n');
    lines.push('| 靶点 | 问题数 | 最大间隙 (Å) |');
    lines.push('|------|--------|-------------|');
    for (const [target, items] of Object.entries(byTarget).sort((a, b) => b[1].length - a[1].length).slice(0, 30)) {
      const maxGap = Math.max(...items.map(i => i.visualGap || 0));
      lines.push(`| ${target} | ${items.length} | ${maxGap} |`);
    }
    lines.push('');

    // 完整清单
    lines.push('### 完整问题清单\n');
    lines.push('| 文件 | 状态 | CoM (Å) | 间隙 (Å) | minDist (Å) | 靶点 | 格式 |');
    lines.push('|------|------|---------|---------|------------|------|------|');
    for (const p of allBad) {
      lines.push(`| \`${p.file}\` | ${p.status} | ${p.comDistance} | ${p.visualGap} | ${p.minDist} | ${p.target || '-'} | ${p.format || '-'} |`);
    }
    lines.push('');
  }

  if (data.warnings.length > 0) {
    lines.push('---\n');
    lines.push(`## 警告文件 (${data.warnings.length} 个)\n`);
    lines.push('| 文件 | CoM (Å) | 间隙 (Å) | minDist (Å) |');
    lines.push('|------|---------|---------|------------|');
    for (const p of data.warnings.slice(0, 50)) {
      lines.push(`| \`${p.file}\` | ${p.comDistance} | ${p.visualGap} | ${p.minDist} |`);
    }
    if (data.warnings.length > 50) lines.push(`\n*(共 ${data.warnings.length} 个，仅显示前 50)*\n`);
  }

  lines.push('---\n');
  lines.push('## 判定标准\n');
  lines.push('| 状态 | 条件 |');
  lines.push('|------|------|');
  lines.push('| OK | minDist ≤ 5Å 且 Visual Gap ≤ 15Å |');
  lines.push('| WARNING | minDist ≤ 5Å 但 Visual Gap > 15Å，或 minDist 5-10Å |');
  lines.push('| BAD_DISTANCE | minDist > 10Å |');
  lines.push('| BAD_VISUAL | minDist ≤ 5Å 但 Visual Gap > 25Å |');
  lines.push('');
  lines.push('- **Visual Gap** = 质心距离 - 抗原Rg - 抗体Rg');
  lines.push('- **CoM 距离** = 抗原质心到抗体质心的欧氏距离');
  lines.push('- **minDist** = 抗原和抗体最近原子对距离');

  fs.writeFileSync(mdPath, lines.join('\n'));
}

main();
