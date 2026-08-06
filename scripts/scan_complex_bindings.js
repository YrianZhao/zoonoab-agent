'use strict';

/**
 * Scan pdb/expanded/**.pdb for antigen-antibody binding/interface problems.
 *
 * Problem types detected:
 *   P1_MISSING_PARTNER   only antigen OR only antibody present
 *   P2_MULTIPLE_ANTIBODY one antigen with >1 antibody unit
 *   P3_MULTIPLE_ANTIGEN  one antibody with >1 antigen molecule
 *   P4A_TOO_FAR          antigen-antibody closest pair beyond too-far threshold
 *   P4B_OVERLAP          severe sub-clash atom pairs (interpenetration)
 *
 * Usage:
 *   node scripts/scan_complex_bindings.js --max-targets 5 --out .runtime/scan-sample.json
 *   node scripts/scan_complex_bindings.js --full --out .runtime/scan-full.json
 *   node scripts/scan_complex_bindings.js --selftest
 */

const fs = require('fs');
const path = require('path');
const {
  parseRoleRemarks,
  analyzeComplexText,
  analyzeComplexEntities
} = require('../lib/pdb-complex-geometry');

const ROOT = path.resolve(__dirname, '..');
const EXPANDED_DIR = path.join(ROOT, 'pdb', 'expanded');

// ─── CLI ───
function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token.startsWith('--')) {
      const key = token.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) {
        args[key] = true;
      } else {
        args[key] = next;
        i += 1;
      }
    } else {
      args._.push(token);
    }
  }
  return args;
}

const DEFAULTS = {
  maxTargets: 5,
  examplesPerTarget: 3,
  tooFar: 10.0,
  minOverlapClashes: 10,
  moleculeGap: 6.0,
  minAtoms: 3,
  progressEvery: 500
};

function numArg(args, key, fallback) {
  const value = Number(args[key]);
  return Number.isFinite(value) ? value : fallback;
}

// ─── file discovery ───
function listExpandedPdbs(dir) {
  const out = [];
  function walk(d) {
    let names;
    try {
      names = fs.readdirSync(d);
    } catch (err) {
      return;
    }
    for (const name of names) {
      const full = path.join(d, name);
      let stat;
      try {
        stat = fs.statSync(full);
      } catch (err) {
        continue;
      }
      if (stat.isDirectory()) walk(full);
      else if (name.toLowerCase().endsWith('.pdb')) out.push(full);
    }
  }
  walk(dir);
  out.sort();
  return out;
}

function deriveTarget(filePath, meta) {
  if (meta && meta.target) return meta.target;
  const rel = path.relative(EXPANDED_DIR, filePath);
  const parts = rel.split(path.sep);
  if (parts.length > 1) return parts[0];
  return path.basename(filePath, '.pdb');
}

// ─── per-file analysis ───
function analyzeFileText(text, filePath, opts) {
  const meta = parseRoleRemarks(text);
  const target = deriveTarget(filePath, meta);
  const analysis = analyzeComplexText(text, { file: filePath });
  const problems = [];

  // P1: missing / insufficient partner
  if (['NO_ROLE_METADATA', 'MISSING_ROLE_ATOMS', 'INSUFFICIENT_ROLE_ATOMS'].includes(analysis.status)) {
    const antigenAtoms = (analysis.atoms && analysis.atoms.antigen) || 0;
    const antibodyAtoms = (analysis.atoms && analysis.atoms.antibody) || 0;
    let side;
    if (antigenAtoms < opts.minAtoms && antibodyAtoms < opts.minAtoms) side = 'NEITHER';
    else if (antigenAtoms < opts.minAtoms) side = 'ONLY_ANTIBODY';
    else side = 'ONLY_ANTIGEN';
    problems.push({ type: 'P1_MISSING_PARTNER', detail: { side, status: analysis.status, antigenAtoms, antibodyAtoms } });
  }

  // P2 / P3: oligomer-aware entity counts
  const entities = analyzeComplexEntities(analysis, opts.moleculeGap);
  if (entities) {
    if (entities.multipleAntibody) {
      problems.push({
        type: 'P2_MULTIPLE_ANTIBODY',
        detail: { antibodyUnitCount: entities.antibodyUnitCount, units: entities.antibodyUnits }
      });
    }
    if (entities.multipleAntigen) {
      problems.push({
        type: 'P3_MULTIPLE_ANTIGEN',
        detail: { antigenMoleculeCount: entities.antigenMoleculeCount, molecules: entities.antigenMolecules }
      });
    }
  }

  // P4a / P4b: geometry
  const geom = analysis.geometry;
  if (geom) {
    const tooFar = !Number.isFinite(geom.minDistance) || geom.minDistance > opts.tooFar || analysis.status === 'TOO_FAR';
    if (tooFar) {
      problems.push({ type: 'P4A_TOO_FAR', detail: { minDistance: geom.minDistance, visualGap: geom.visualGap } });
    }
    if (geom.hardClashes >= opts.minOverlapClashes) {
      problems.push({ type: 'P4B_OVERLAP', detail: { hardClashes: geom.hardClashes } });
    }
  }

  return {
    target,
    format: analysis.format || meta.format || null,
    problems,
    geometry: geom,
    roles: analysis.roles,
    atoms: analysis.atoms
  };
}

function compactEntry(filePath, result) {
  return {
    file: path.relative(ROOT, filePath),
    target: result.target,
    format: result.format,
    problems: result.problems,
    geometry: result.geometry
  };
}

// ─── main scan ───
function runScan(args) {
  const opts = {
    maxTargets: args.full ? Infinity : numArg(args, 'max-targets', DEFAULTS.maxTargets),
    examplesPerTarget: numArg(args, 'examples-per-target', DEFAULTS.examplesPerTarget),
    tooFar: numArg(args, 'too-far', DEFAULTS.tooFar),
    minOverlapClashes: numArg(args, 'min-overlap-clashes', DEFAULTS.minOverlapClashes),
    moleculeGap: numArg(args, 'molecule-gap', DEFAULTS.moleculeGap),
    minAtoms: numArg(args, 'min-atoms', DEFAULTS.minAtoms),
    progressEvery: numArg(args, 'progress-every', DEFAULTS.progressEvery),
    maxFiles: args['max-files'] ? numArg(args, 'max-files', Infinity) : Infinity,
    full: !!args.full
  };

  const files = listExpandedPdbs(EXPANDED_DIR);
  process.stderr.write(`Discovered ${files.length} PDB files under pdb/expanded\n`);

  const targetMap = new Map(); // target -> { target, items: [] }
  const problemsByType = {};
  let scanned = 0;
  let problemFiles = 0;
  let stopped = false;

  for (const file of files) {
    scanned += 1;
    if (scanned > opts.maxFiles) break;
    let text;
    try {
      text = fs.readFileSync(file, 'utf8');
    } catch (err) {
      continue;
    }
    let result;
    try {
      result = analyzeFileText(text, file, opts);
    } catch (err) {
      continue;
    }
    if (result.problems.length) {
      problemFiles += 1;
      for (const problem of result.problems) {
        problemsByType[problem.type] = (problemsByType[problem.type] || 0) + 1;
      }
      if (!targetMap.has(result.target)) {
        targetMap.set(result.target, { target: result.target, items: [] });
      }
      const bucket = targetMap.get(result.target);
      if (bucket.items.length < opts.examplesPerTarget) {
        bucket.items.push(compactEntry(file, result));
      }
      if (!opts.full && targetMap.size >= opts.maxTargets) {
        stopped = true;
        break;
      }
    }
    if (scanned % opts.progressEvery === 0) {
      process.stderr.write(`  scanned ${scanned} / ${files.length} | problem files ${problemFiles} | targets w/ problems ${targetMap.size}\n`);
    }
  }

  const targets = [...targetMap.values()];
  const report = {
    mode: opts.full ? 'full' : 'sample',
    range: 'pdb/expanded',
    scanned,
    total: files.length,
    problemFiles,
    targetsWithProblems: targets.length,
    stoppedEarly: stopped,
    options: opts,
    problemsByType,
    targets
  };

  const outPath = args.out ? path.resolve(ROOT, args.out) : null;
  if (outPath) {
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  }

  // console summary
  console.log('='.repeat(78));
  console.log(`PDB binding scan — ${report.mode} mode`);
  console.log(`scanned ${scanned}/${files.length} files | ${problemFiles} problem files | ${targets.length} targets with problems${stopped ? ' (stopped early)' : ''}`);
  console.log('problems by type:', JSON.stringify(problemsByType));
  if (outPath) console.log('report written:', path.relative(ROOT, outPath));
  console.log('-'.repeat(78));
  for (const t of targets) {
    console.log(`\nTARGET: ${t.target}`);
    for (const item of t.items) {
      const types = item.problems.map(p => p.type).join(',');
      const g = item.geometry || {};
      console.log(`  - ${item.file} [${item.format || '?'}] {${types}} minDist=${g.minDistance ?? '-'} contacts=${g.contactPairs ?? '-'} clashes=${g.hardClashes ?? '-'}`);
    }
  }
  console.log('='.repeat(78));
  return report;
}

// ─── self-test ───
function atomLine(serial, atomName, resName, chain, resSeq, x, y, z, element) {
  const rjust = (v, w) => String(v).padStart(w).slice(0, w);
  const ljust = (v, w) => String(v).padEnd(w).slice(0, w);
  let line = 'ATOM  ';
  line += rjust(serial, 5);      // 6-10
  line += ' ';                   // 11
  line += ljust(atomName, 4);    // 12-15
  line += ' ';                   // 16 altLoc
  line += ljust(resName, 3);     // 17-19
  line += ' ';                   // 20
  line += chain;                 // 21
  line += rjust(resSeq, 4);      // 22-25
  line += ' ';                   // 26
  line += '   ';                 // 27-29
  line += rjust(x.toFixed(3), 8); // 30-37
  line += rjust(y.toFixed(3), 8); // 38-45
  line += rjust(z.toFixed(3), 8); // 46-53
  line = line.padEnd(76, ' ');
  line += rjust(element.toUpperCase(), 2); // 76-77
  return line.padEnd(80, ' ');
}

function buildPdb(antigenChains, antibodyChains, format, blocks) {
  const lines = [];
  lines.push(`HEADER    ZOONOAB COMPLEX ${format}`);
  lines.push(`REMARK 901 TARGET: SELFTEST`);
  lines.push(`REMARK 902 FORMAT: ${format}`);
  lines.push(`REMARK 904 ANTIGEN CHAINS: ${antigenChains.join(',')}`);
  lines.push(`REMARK 905 ANTIBODY CHAINS: ${antibodyChains.join(',')}`);
  lines.push('MODEL        1');
  let serial = 1;
  for (const block of blocks) {
    for (const point of block.points) {
      lines.push(atomLine(serial++, 'CA', 'ALA', block.chain, point[3] || serial, point[0], point[1], point[2], 'C'));
    }
  }
  lines.push('ENDMDL');
  lines.push('END');
  return lines.join('\n');
}

function assert(cond, msg) {
  if (!cond) {
    console.error('SELFTEST FAILED:', msg);
    process.exit(1);
  }
}

function runSelfTest() {
  const opts = {
    maxTargets: 99, examplesPerTarget: 99, tooFar: 10, minOverlapClashes: 10, moleculeGap: 6, minAtoms: 3, progressEvery: 1, full: true
  };

  // 1. only antigen: antibody chain declared but absent
  {
    const pdb = buildPdb(['A'], ['B'], 'VHH', [
      { chain: 'A', points: [[0, 0, 0], [1, 1, 1], [2, 2, 2], [3, 3, 3], [4, 4, 4]] }
    ]);
    const r = analyzeFileText(pdb, 'selftest/only-antigen.pdb', opts);
    assert(r.problems.some(p => p.type === 'P1_MISSING_PARTNER' && p.detail.side === 'ONLY_ANTIGEN'), 'only-antigen not detected');
  }

  // 2. multiple antibody (VHH): two antibody chains far apart
  {
    const pdb = buildPdb(['A'], ['B', 'C'], 'VHH', [
      { chain: 'A', points: [[0, 0, 0], [1, 1, 1], [2, 2, 2], [3, 3, 3], [4, 4, 4]] },
      { chain: 'B', points: [[5, 5, 5], [5.5, 5.5, 5.5], [6, 6, 6], [6.5, 6.5, 6.5], [7, 7, 7]] },
      { chain: 'C', points: [[40, 40, 40], [41, 41, 41], [42, 42, 42], [43, 43, 43], [44, 44, 44]] }
    ]);
    const r = analyzeFileText(pdb, 'selftest/multi-ab.pdb', opts);
    assert(r.problems.some(p => p.type === 'P2_MULTIPLE_ANTIBODY'), 'multiple-antibody not detected');
  }

  // 3. multiple antigen: two antigen chains far apart
  {
    const pdb = buildPdb(['A', 'D'], ['B'], 'VHH', [
      { chain: 'A', points: [[0, 0, 0], [1, 1, 1], [2, 2, 2], [3, 3, 3], [4, 4, 4]] },
      { chain: 'D', points: [[50, 50, 50], [51, 51, 51], [52, 52, 52], [53, 53, 53], [54, 54, 54]] },
      { chain: 'B', points: [[5, 5, 5], [5.5, 5.5, 5.5], [6, 6, 6], [6.5, 6.5, 6.5], [7, 7, 7]] }
    ]);
    const r = analyzeFileText(pdb, 'selftest/multi-ag.pdb', opts);
    assert(r.problems.some(p => p.type === 'P3_MULTIPLE_ANTIGEN'), 'multiple-antigen not detected');
  }

  // 4. too far: antigen and antibody well beyond 10 A
  {
    const pdb = buildPdb(['A'], ['B'], 'VHH', [
      { chain: 'A', points: [[0, 0, 0], [1, 1, 1], [2, 2, 2], [3, 3, 3], [4, 4, 4]] },
      { chain: 'B', points: [[60, 60, 60], [61, 61, 61], [62, 62, 62], [63, 63, 63], [64, 64, 64]] }
    ]);
    const r = analyzeFileText(pdb, 'selftest/too-far.pdb', opts);
    assert(r.problems.some(p => p.type === 'P4A_TOO_FAR'), 'too-far not detected');
  }

  // 5. overlap: antigen and antibody at same coords -> many sub-2A pairs
  {
    const pdb = buildPdb(['A'], ['B'], 'VHH', [
      { chain: 'A', points: [[0, 0, 0], [1, 1, 1], [2, 2, 2], [3, 3, 3], [4, 4, 4], [5, 5, 5], [6, 6, 6], [7, 7, 7], [8, 8, 8], [9, 9, 9], [10, 10, 10]] },
      { chain: 'B', points: [[0, 0, 0], [1, 1, 1], [2, 2, 2], [3, 3, 3], [4, 4, 4], [5, 5, 5], [6, 6, 6], [7, 7, 7], [8, 8, 8], [9, 9, 9], [10, 10, 10]] }
    ]);
    const r = analyzeFileText(pdb, 'selftest/overlap.pdb', opts);
    assert(r.problems.some(p => p.type === 'P4B_OVERLAP'), 'overlap not detected');
  }

  // 6. native oligomer sanity: antigen A,B,C touching (1 molecule), one antibody
  //    contacting at ~3.5A (real interface, no clash, not too far) -> NO problem
  {
    const pdb = buildPdb(['A', 'B', 'C'], ['D'], 'VHH', [
      { chain: 'A', points: [[0, 0, 0], [1, 0, 0], [2, 0, 0], [3, 0, 0], [4, 0, 0]] },
      { chain: 'B', points: [[3, 0, 0], [4, 0, 0], [5, 0, 0], [6, 0, 0], [7, 0, 0]] },
      { chain: 'C', points: [[6, 0, 0], [7, 0, 0], [8, 0, 0], [9, 0, 0], [10, 0, 0]] },
      { chain: 'D', points: [[4, 3.5, 0], [4.5, 3.6, 0], [5, 3.5, 0], [5.5, 3.6, 0], [6, 3.5, 0]] }
    ]);
    const r = analyzeFileText(pdb, 'selftest/oligomer.pdb', opts);
    assert(!r.problems.some(p => p.type === 'P3_MULTIPLE_ANTIGEN'), 'native oligomer wrongly flagged as multiple-antigen');
    assert(r.problems.length === 0, `native oligomer wrongly flagged: ${JSON.stringify(r.problems)}`);
  }

  console.log('SELFTEST OK — all 6 cases passed');
}

// ─── entry ───
function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.selftest) {
    runSelfTest();
    return;
  }
  if (args.help || args.h) {
    console.log('Usage: node scripts/scan_complex_bindings.js [--max-targets N] [--full] [--out path] [--too-far 10] [--min-overlap-clashes 10] [--molecule-gap 6] [--examples-per-target 3] [--max-files N] [--selftest]');
    return;
  }
  runScan(args);
}

module.exports = { analyzeFileText, parseArgs, DEFAULTS, EXPANDED_DIR, ROOT };

if (require.main === module) {
  main();
}
