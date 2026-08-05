'use strict';

/**
 * PDB 抗原抗体距离修复脚本
 *
 * 读取审计结果，对距离过远的文件重新放置抗体位置。
 *
 * 用法:
 *   node scripts/fix_antibody_distance.js [--dry-run] [--max <n>]
 *   --dry-run  只输出修复计划，不修改文件
 *   --max <n>  最多修复 n 个文件（用于测试）
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const AUDIT_JSON = path.join(ROOT, 'pdb-distance-audit-full.json');
const BACKUP_DIR = path.join(ROOT, '.runtime', 'pdb-backup-before-distance-fix');
const FIX_REPORT = path.join(ROOT, 'pdb-distance-fix-report.json');

// ─── 向量工具 ───
function vSub(a, b) { return [a[0]-b[0], a[1]-b[1], a[2]-b[2]]; }
function vAdd(a, b) { return [a[0]+b[0], a[1]+b[1], a[2]+b[2]]; }
function vMul(a, s) { return [a[0]*s, a[1]*s, a[2]*s]; }
function vDot(a, b) { return a[0]*b[0] + a[1]*b[1] + a[2]*b[2]; }
function vMag(a) { return Math.sqrt(vDot(a, a)); }
function vUnit(a, fb) { const m = vMag(a); return m < 1e-9 ? (fb||[1,0,0]) : vMul(a, 1/m); }
function vDist(a, b) { return vMag(vSub(a, b)); }

// ─── PDB 解析 ───
function parseRemarks(lines) {
  let ag=null, ab=null, fmt=null, tgt=null;
  for (let i = 0; i < Math.min(lines.length, 30); i++) {
    const l = lines[i];
    if (l.startsWith('REMARK 901') && !tgt) { const m = l.match(/TARGET:\s*(\S+)/); if (m) tgt = m[1]; }
    if (l.startsWith('REMARK 900') && !tgt) { const m = l.match(/TARGET:\s*(\S+)/); if (m) tgt = m[1]; }
    if (l.startsWith('REMARK 902')) { const m = l.match(/FORMAT:\s*(\S+)/); if (m) fmt = m[1]; }
    if (l.startsWith('REMARK 904')) { const m = l.match(/ANTIGEN\s+CHAINS:\s*(.+)/i); if (m) ag = m[1].trim().split(/[,;\s]+/).filter(Boolean); }
    if (l.startsWith('REMARK 905')) { const m = l.match(/ANTIBODY\s+CHAINS:\s*(.+)/i); if (m) ab = m[1].trim().split(/[,;\s]+/).filter(Boolean); }
  }
  return { antigenChains: ag, antibodyChains: ab, format: fmt, target: tgt };
}

function detectChainCol(lines, expected) {
  const s = new Set(expected);
  let m20 = 0, m21 = 0, tot = 0;
  for (let i = 0; i < lines.length && tot < 500; i++) {
    const l = lines[i];
    if (!l.startsWith('ATOM  ') && !l.startsWith('HETATM')) continue;
    tot++;
    if (s.has(l[20] || ' ')) m20++;
    if (s.has(l[21] || ' ')) m21++;
  }
  return m20 > m21 ? 20 : 21;
}

function centerOfMass(coords) {
  if (!coords || !coords.length) return [0, 0, 0];
  let s = [0, 0, 0];
  for (const c of coords) { s[0] += c[0]; s[1] += c[1]; s[2] += c[2]; }
  return [s[0]/coords.length, s[1]/coords.length, s[2]/coords.length];
}

function radiusOfGyration(coords, com) {
  if (!coords || coords.length < 2) return 0;
  const c = com || centerOfMass(coords);
  let s = 0;
  for (const p of coords) { const d = vSub(p, c); s += vDot(d, d); }
  return Math.sqrt(s / coords.length);
}

function minAtomDistance(coordsA, coordsB) {
  if (!coordsA || !coordsB || !coordsA.length || !coordsB.length) return Infinity;
  const cellSize = 50;
  const grid = new Map();
  for (const p of coordsA) {
    const k = Math.floor(p[0]/cellSize)+','+Math.floor(p[1]/cellSize)+','+Math.floor(p[2]/cellSize);
    if (!grid.has(k)) grid.set(k, []);
    grid.get(k).push(p);
  }
  let minSq = Infinity;
  for (const p of coordsB) {
    const cx = Math.floor(p[0]/cellSize), cy = Math.floor(p[1]/cellSize), cz = Math.floor(p[2]/cellSize);
    for (let dx=-1;dx<=1;dx++) for (let dy=-1;dy<=1;dy++) for (let dz=-1;dz<=1;dz++) {
      const cell = grid.get((cx+dx)+','+(cy+dy)+','+(cz+dz));
      if (!cell) continue;
      for (const q of cell) {
        const d = vSub(p, q);
        const sq = vDot(d, d);
        if (sq < minSq) minSq = sq;
      }
    }
    if (minSq < 4) break;
  }
  return minSq === Infinity ? Infinity : Math.sqrt(minSq);
}

/**
 * 从 ATOM 行提取坐标
 */
function extractCoords(line, chainCol) {
  const p = line.padEnd(80, ' ');
  const x = parseFloat(p.slice(30, 38));
  const y = parseFloat(p.slice(38, 46));
  const z = parseFloat(p.slice(46, 54));
  if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) return null;
  return [x, y, z];
}

/**
 * 对 ATOM 行应用平移
 */
function shiftAtomLine(line, shift) {
  const p = line.padEnd(80, ' ');
  const x = parseFloat(p.slice(30, 38)) + shift[0];
  const y = parseFloat(p.slice(38, 46)) + shift[1];
  const z = parseFloat(p.slice(46, 54)) + shift[2];
  const fmt = (v) => {
    const s = v.toFixed(3);
    return s.padStart(8, ' ');
  };
  return p.slice(0, 30) + fmt(x) + fmt(y) + fmt(z) + p.slice(54);
}

/**
 * 对 ATOM 行应用旋转+平移（绕指定中心点）
 */
function transformAtomLine(line, rotation, center, translation) {
  const p = line.padEnd(80, ' ');
  const x = parseFloat(p.slice(30, 38));
  const y = parseFloat(p.slice(38, 46));
  const z = parseFloat(p.slice(46, 54));
  if (!Number.isFinite(x)) return line;

  // 减去中心点
  let vx = x - center[0];
  let vy = y - center[1];
  let vz = y - center[2];  // Wait - this should be z, not y

  // Hmm, let me fix this properly
  return line; // Will implement below
}

function matrixApplyVec(m, v) {
  return [
    m[0][0]*v[0]+m[0][1]*v[1]+m[0][2]*v[2],
    m[1][0]*v[0]+m[1][1]*v[1]+m[1][2]*v[2],
    m[2][0]*v[0]+m[2][1]*v[1]+m[2][2]*v[2]
  ];
}

function rotationFromToVec(from, to) {
  const f = vUnit(from);
  const t = vUnit(to);
  const cos = Math.max(-1, Math.min(1, vDot(f, t)));
  if (cos > 1 - 1e-10) return [[1,0,0],[0,1,0],[0,0,1]];
  if (cos < -1 + 1e-10) {
    // 180 degree rotation around any perpendicular axis
    const helper = Math.abs(f[0]) < 0.8 ? [1,0,0] : [0,1,0];
    const axis = vUnit([
      f[1]*helper[2]-f[2]*helper[1],
      f[2]*helper[0]-f[0]*helper[2],
      f[0]*helper[1]-f[1]*helper[0]
    ]);
    const c = -1, s = 0, t1 = 1-c;
    return [
      [c+axis[0]*axis[0]*t1, axis[0]*axis[1]*t1-axis[2]*s, axis[0]*axis[2]*t1+axis[1]*s],
      [axis[1]*axis[0]*t1+axis[2]*s, c+axis[1]*axis[1]*t1, axis[1]*axis[2]*t1-axis[0]*s],
      [axis[2]*axis[0]*t1-axis[1]*s, axis[2]*axis[1]*t1+axis[0]*s, c+axis[2]*axis[2]*t1]
    ];
  }
  const axis = vUnit([
    f[1]*t[2]-f[2]*t[1],
    f[2]*t[0]-f[0]*t[2],
    f[0]*t[1]-f[1]*t[0]
  ]);
  const c = cos, s = Math.sqrt(1-cos*cos), t1 = 1-c;
  return [
    [c+axis[0]*axis[0]*t1, axis[0]*axis[1]*t1-axis[2]*s, axis[0]*axis[2]*t1+axis[1]*s],
    [axis[1]*axis[0]*t1+axis[2]*s, c+axis[1]*axis[1]*t1, axis[1]*axis[2]*t1-axis[0]*s],
    [axis[2]*axis[0]*t1-axis[1]*s, axis[2]*axis[1]*t1+axis[0]*s, c+axis[2]*axis[2]*t1]
  ];
}

function transformAtomLineProper(line, rotation, pivot, translation) {
  const p = line.padEnd(80, ' ');
  const x = parseFloat(p.slice(30, 38));
  const y = parseFloat(p.slice(38, 46));
  const z = parseFloat(p.slice(46, 54));
  if (!Number.isFinite(x)) return line;

  // relative to pivot
  const rel = [x - pivot[0], y - pivot[1], z - pivot[2]];
  // rotate
  const rotated = matrixApplyVec(rotation, rel);
  // translate back + additional translation
  const fx = rotated[0] + pivot[0] + translation[0];
  const fy = rotated[1] + pivot[1] + translation[1];
  const fz = rotated[2] + pivot[2] + translation[2];
  const fmt = (v) => v.toFixed(3).padStart(8, ' ');
  return p.slice(0, 30) + fmt(fx) + fmt(fy) + fmt(fz) + p.slice(54);
}

/**
 * 修复单个 PDB 文件的抗原抗体距离
 * 策略：沿抗原-抗体质心连线方向平移抗体，使 CoM 距离达到合理范围，
 * 然后微调以保持适当的接触距离
 */
function fixFile(filePath, auditEntry) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  const remarks = parseRemarks(lines);

  if (!remarks.antigenChains || !remarks.antibodyChains) {
    return { status: 'SKIP_NO_CHAINS', file: filePath };
  }

  const allChains = [...remarks.antigenChains, ...remarks.antibodyChains];
  const chainCol = detectChainCol(lines, allChains);

  // 分离各行
  const headerLines = [];
  const antigenAtomLines = [];
  const antibodyAtomLines = [];
  const otherLines = [];
  let phase = 'header';

  for (const line of lines) {
    if (line.startsWith('ATOM  ') || line.startsWith('HETATM')) {
      phase = 'atoms';
      const chain = line[chainCol] || ' ';
      const xyz = extractCoords(line, chainCol);
      if (!xyz) { otherLines.push(line); continue; }
      if (remarks.antigenChains.includes(chain)) {
        antigenAtomLines.push({ line, chain, xyz });
      } else if (remarks.antibodyChains.includes(chain)) {
        antibodyAtomLines.push({ line, chain, xyz });
      } else {
        otherLines.push(line);
      }
    } else if (phase === 'header') {
      headerLines.push(line);
    } else {
      otherLines.push(line);
    }
  }

  if (antigenAtomLines.length < 3 || antibodyAtomLines.length < 3) {
    return { status: 'SKIP_INSUFFICIENT', file: filePath, agAtoms: antigenAtomLines.length, abAtoms: antibodyAtomLines.length };
  }

  const agCoords = antigenAtomLines.map(a => a.xyz);
  const abCoords = antibodyAtomLines.map(a => a.xyz);
  const agCoM = centerOfMass(agCoords);
  const abCoM = centerOfMass(abCoords);
  const agRg = radiusOfGyration(agCoords, agCoM);
  const abRg = radiusOfGyration(abCoords, abCoM);

  const oldCoMDist = vDist(agCoM, abCoM);
  const oldGap = oldCoMDist - agRg - abRg;
  const oldMinDist = minAtomDistance(agCoords, abCoords);

  // 目标 CoM 距离：Rg 之和 + 5Å 间隙
  const targetCoMDist = agRg + abRg + 5;

  if (oldCoMDist <= targetCoMDist + 3) {
    return { status: 'NO_IMPROVEMENT', file: filePath, oldCoMDist, reason: 'already_close_enough' };
  }

  // 沿抗原方向平移抗体
  const slideDir = vUnit(vSub(agCoM, abCoM));
  let slideAmount = oldCoMDist - targetCoMDist;

  // 二分搜索最佳平移量：既拉近 CoM 又不产生严重碰撞
  let bestShift = null;
  let bestCoMDist = oldCoMDist;
  let bestMinDist = oldMinDist;

  // 尝试逐步增大平移量（从 30% 到 90%）
  for (let fraction = 0.3; fraction <= 0.95; fraction += 0.1) {
    const testShift = vMul(slideDir, slideAmount * fraction);
    const testAbCoords = abCoords.map(c => vAdd(c, testShift));
    const testMinDist = minAtomDistance(agCoords, testAbCoords);
    const testAbCoM = centerOfMass(testAbCoords);
    const testCoMDist = vDist(agCoM, testAbCoM);

    // 接受条件：CoM 改善且 minDist >= 1.8（允许轻微接触）
    if (testCoMDist < bestCoMDist && testMinDist >= 1.8) {
      bestShift = testShift;
      bestCoMDist = testCoMDist;
      bestMinDist = testMinDist;
    }
  }

  if (!bestShift) {
    // 所有平移量都导致碰撞，尝试很小的平移
    const tinyShift = vMul(slideDir, Math.min(5, slideAmount * 0.1));
    const testAbCoords = abCoords.map(c => vAdd(c, tinyShift));
    const testMinDist = minAtomDistance(agCoords, testAbCoords);
    if (testMinDist >= 1.5) {
      bestShift = tinyShift;
      bestCoMDist = vDist(agCoM, centerOfMass(testAbCoords));
      bestMinDist = testMinDist;
    }
  }

  if (!bestShift) {
    return { status: 'NO_IMPROVEMENT', file: filePath, oldCoMDist, reason: 'clash_prevents_slide' };
  }

  const newGap = bestCoMDist - agRg - abRg;

  // 验证改善
  if (bestCoMDist >= oldCoMDist - 2) {
    return { status: 'NO_IMPROVEMENT', file: filePath, oldCoMDist, newCoMDist: bestCoMDist };
  }

  return applyFix(filePath, headerLines, antigenAtomLines, antibodyAtomLines,
    otherLines, bestShift, oldCoMDist, oldGap, oldMinDist, bestCoMDist,
    newGap, bestMinDist, 'slide');
}

function applyFix(filePath, headerLines, antigenAtomLines, antibodyAtomLines,
    otherLines, shiftVec, oldCoMDist, oldGap, oldMinDist, newCoMDist, newGap, newMinDist, method) {
  const fixedAbLines = antibodyAtomLines.map(entry => shiftAtomLine(entry.line, shiftVec));
  return applyFixLines(filePath, headerLines, antigenAtomLines, fixedAbLines, otherLines,
    oldCoMDist, oldGap, oldMinDist, newCoMDist, newGap, newMinDist, method);
}

function applyFixLines(filePath, headerLines, antigenAtomLines, fixedAbLines, otherLines,
    oldCoMDist, oldGap, oldMinDist, newCoMDist, newGap, newMinDist, method) {
  // 更新 REMARK 906/907 的几何信息
  const updatedHeaders = headerLines.map(line => {
    if (line.startsWith('REMARK 907') && line.includes('MIN_DISTANCE_A')) {
      return 'REMARK 907 GEOMETRY MIN_DISTANCE_A: ' + newMinDist.toFixed(3) +
        ' CONTACTS_4_5A: estimated' +
        ' CONTACTS_6_0A: estimated' +
        ' HARD_CLASHES_LT_2_0A: ' + (newMinDist < 2.0 ? '1' : '0') +
        '  DISTANCE_FIX: ' + method.toUpperCase() + ' CoM ' + oldCoMDist.toFixed(1) + '->' + newCoMDist.toFixed(1);
    }
    if (line.startsWith('REMARK 906') && line.includes('GEOMETRY:')) {
      return 'REMARK 906 GEOMETRY: minDist=' + newMinDist.toFixed(2) + ' CoMDist=' + newCoMDist.toFixed(1) + ' FIX=' + method;
    }
    return line;
  });

  // 重建文件
  const agLines = antigenAtomLines.map(a => a.line);
  const allLines = [...updatedHeaders, ...agLines, 'TER', ...fixedAbLines, ...otherLines];
  const newContent = allLines.join('\n');

  return {
    status: 'FIXED',
    file: filePath,
    method,
    oldCoMDist: Math.round(oldCoMDist * 10) / 10,
    newCoMDist: Math.round(newCoMDist * 10) / 10,
    oldGap: Math.round(oldGap * 10) / 10,
    newGap: Math.round(newGap * 10) / 10,
    oldMinDist: Math.round(oldMinDist * 100) / 100,
    newMinDist: Math.round(newMinDist * 100) / 100,
    writeContent: newContent,
  };
}

// ─── 主流程 ───
function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const maxIdx = args.indexOf('--max');
  const maxFix = maxIdx >= 0 ? parseInt(args[maxIdx + 1]) : Infinity;
  const minGapIdx = args.indexOf('--min-gap');
  const minGap = minGapIdx >= 0 ? parseFloat(args[minGapIdx + 1]) : 0;
  const includeWarnings = args.includes('--include-warnings');

  console.log('=== PDB 抗原抗体距离修复 ===');
  console.log('模式:', dryRun ? '试运行（不修改文件）' : '执行修复');

  if (!fs.existsSync(AUDIT_JSON)) {
    console.error('审计报告不存在:', AUDIT_JSON);
    console.error('请先运行: node scripts/audit_antibody_distance_full.js');
    process.exit(1);
  }

  const auditData = JSON.parse(fs.readFileSync(AUDIT_JSON, 'utf8'));
  let toFix = [...auditData.problems];
  if (includeWarnings) toFix = [...toFix, ...auditData.warnings];
  if (minGap > 0) toFix = toFix.filter(p => (p.visualGap || 0) >= minGap);
  console.log('待修复文件数:', toFix.length, '(BAD:', auditData.problems.length, '+ WARNING:', auditData.warnings.length + ')');
  if (minGap > 0) console.log('最小间隙过滤: >=' + minGap + 'Å');
  if (maxFix < toFix.length) console.log('限制修复:', maxFix, '个');

  if (!dryRun && !fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }

  const results = [];
  const stats = { fixed: 0, skipped: 0, noImprovement: 0, error: 0 };

  console.time('修复');
  for (let i = 0; i < Math.min(toFix.length, maxFix); i++) {
    const entry = toFix[i];
    const filePath = path.join(ROOT, entry.file);

    if (!fs.existsSync(filePath)) {
      stats.skipped++;
      continue;
    }

    try {
      const result = fixFile(filePath, entry);

      if (result.status === 'FIXED' && result.writeContent) {
        if (!dryRun) {
          const backupPath = path.join(BACKUP_DIR, entry.file.replace(/\//g, '_'));
          fs.copyFileSync(filePath, backupPath);
          fs.writeFileSync(filePath, result.writeContent);
        }
        stats.fixed++;
        // 只保留摘要信息，丢弃文件内容以节省内存
        results.push({
          status: 'FIXED', file: entry.file, method: result.method,
          oldCoMDist: result.oldCoMDist, newCoMDist: result.newCoMDist,
          oldGap: result.oldGap, newGap: result.newGap,
          oldMinDist: result.oldMinDist, newMinDist: result.newMinDist,
        });
        if ((i + 1) % 200 === 0) {
          process.stdout.write(`\r  进度: ${i+1}/${Math.min(toFix.length, maxFix)} - 已修复: ${stats.fixed}`);
        }
      } else {
        stats[result.status === 'NO_IMPROVEMENT' ? 'noImprovement' : 'skipped']++;
      }
    } catch (e) {
      stats.error++;
    }

    // 定期强制垃圾回收（每 1000 个文件）
    if ((i + 1) % 1000 === 0 && global.gc) global.gc();
  }
  if (toFix.length >= 100) console.log('');
  console.timeEnd('修复');

  // 输出报告
  const report = {
    fixDate: new Date().toISOString(),
    dryRun,
    totalAttempted: Math.min(toFix.length, maxFix),
    stats,
    results: results,
  };
  fs.writeFileSync(FIX_REPORT, JSON.stringify(report, null, 2));

  console.log('\n=== 修复摘要 ===');
  console.log('已修复:', stats.fixed);
  console.log('无改善:', stats.noImprovement);
  console.log('跳过:', stats.skipped);
  console.log('错误:', stats.error);
  console.log('修复报告:', FIX_REPORT);

  if (stats.fixed > 0 && !dryRun) {
    const sample = results.filter(r => r.status === 'FIXED').slice(0, 10);
    console.log('\n=== 修复样例 ===');
    for (const r of sample) {
      console.log(`  ${r.method}: ${path.relative(ROOT, r.file)} | CoM ${r.oldCoMDist}->${r.newCoMDist}Å | gap ${r.oldGap}->${r.newGap}Å`);
    }
  }
}

main();
