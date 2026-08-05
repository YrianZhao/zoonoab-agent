#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const {
  analyzeComplexText,
  applyAntibodyTranslation,
  createAntibodyTranslationPlan,
  reportableAnalysis
} = require('../lib/pdb-complex-geometry');

const ROOT = path.resolve(__dirname, '..');
const DEFAULT_SCAN_ROOT = path.join(ROOT, 'pdb');
const DEFAULT_REPORT_DIR = path.join(ROOT, '.runtime', 'reports');
const DEFAULT_EXCLUDE_DIRS = new Set([
  '.git',
  '.runtime',
  'node_modules',
  'output',
  'scaffolds',
  'antigen-only-sweep'
]);

function usage() {
  return [
    'Usage:',
    '  node scripts/audit_pdb_complex_geometry.js [options]',
    '',
    'Options:',
    '  --scan-root <dir>                 Directory to scan. Default: pdb/',
    '  --out <file>                      JSON report path. Default: .runtime/reports/pdb-complex-geometry-audit.json',
    '  --csv <file>                      CSV report path. Default: .runtime/reports/pdb-complex-geometry-audit.csv',
    '  --md <file>                       Optional Markdown report path.',
    '  --focus <text>                    Only scan files/targets matching text. Can be repeated.',
    '  --max <n>                         Stop after n matching PDB files.',
    '  --plan-fixes                      Include dry-run rigid antibody translation plans.',
    '  --apply-fixes                     Write planned fixes. Implies --plan-fixes and creates backups.',
    '  --backup-dir <dir>                Backup directory for --apply-fixes.',
    '  --no-catalog                      Do not use project catalog/index metadata.',
    '  --no-progress                     Suppress progress output.',
    '  --fail-on-problems                Exit non-zero if problem files remain.',
    '  --threshold-min-contact-pairs <n> Override contact-pair threshold.',
    '  --threshold-min-near-pairs <n>    Override near-pair threshold.',
    '  --threshold-too-far-distance <A>  Override too-far minimum-distance threshold.',
    '  --threshold-near-distance <A>     Override near-interface distance.',
    '  --threshold-contact-distance <A>  Override contact distance.',
    ''
  ].join('\n');
}

function parseArgs(argv) {
  const options = {
    scanRoot: DEFAULT_SCAN_ROOT,
    out: path.join(DEFAULT_REPORT_DIR, 'pdb-complex-geometry-audit.json'),
    csv: path.join(DEFAULT_REPORT_DIR, 'pdb-complex-geometry-audit.csv'),
    md: null,
    focus: [],
    max: Infinity,
    planFixes: false,
    applyFixes: false,
    backupDir: null,
    useCatalog: true,
    progress: true,
    failOnProblems: false,
    thresholds: {}
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = () => {
      index += 1;
      if (index >= argv.length) throw new Error('Missing value for ' + arg);
      return argv[index];
    };
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--scan-root') {
      options.scanRoot = next();
    } else if (arg === '--out') {
      options.out = next();
    } else if (arg === '--csv') {
      options.csv = next();
    } else if (arg === '--md') {
      options.md = next();
    } else if (arg === '--focus') {
      options.focus.push(next());
    } else if (arg === '--max') {
      options.max = Math.max(0, Math.floor(Number(next()) || 0));
    } else if (arg === '--plan-fixes') {
      options.planFixes = true;
    } else if (arg === '--apply-fixes') {
      options.applyFixes = true;
      options.planFixes = true;
    } else if (arg === '--backup-dir') {
      options.backupDir = next();
    } else if (arg === '--no-catalog') {
      options.useCatalog = false;
    } else if (arg === '--no-progress') {
      options.progress = false;
    } else if (arg === '--fail-on-problems') {
      options.failOnProblems = true;
    } else if (arg === '--threshold-min-contact-pairs') {
      options.thresholds.minContactPairs = Number(next());
    } else if (arg === '--threshold-min-near-pairs') {
      options.thresholds.minNearPairs = Number(next());
    } else if (arg === '--threshold-too-far-distance') {
      options.thresholds.tooFarDistance = Number(next());
    } else if (arg === '--threshold-near-distance') {
      options.thresholds.nearDistance = Number(next());
    } else if (arg === '--threshold-contact-distance') {
      options.thresholds.contactDistance = Number(next());
    } else if (arg.trim()) {
      throw new Error('Unknown argument: ' + arg);
    }
  }

  options.scanRoot = path.resolve(ROOT, options.scanRoot);
  options.out = path.resolve(ROOT, options.out);
  options.csv = options.csv ? path.resolve(ROOT, options.csv) : null;
  options.md = options.md ? path.resolve(ROOT, options.md) : null;
  if (!options.backupDir) {
    options.backupDir = path.join(ROOT, '.runtime', 'pdb-complex-geometry-backups', timestampForPath());
  } else {
    options.backupDir = path.resolve(ROOT, options.backupDir);
  }
  options.focus = options.focus
    .flatMap(item => String(item || '').split(','))
    .map(item => item.trim())
    .filter(Boolean);
  return options;
}

function timestampForPath() {
  return new Date().toISOString().replace(/[-:]/g, '').replace(/\..+$/, '').replace('T', '-');
}

function ensureParent(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function readJson(filePath, fallback = null) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

function normalizeRel(filePath) {
  return String(filePath || '').split(path.sep).join('/');
}

function inferFormatFromFilename(filename) {
  const base = path.basename(String(filename || ''));
  if (/-Fab-/i.test(base)) return 'Fab';
  if (/-VHH-/i.test(base)) return 'VHH';
  return null;
}

function chainsFromDisplay(entry, key) {
  if (!entry || typeof entry !== 'object') return [];
  const display = entry.display && typeof entry.display === 'object' ? entry.display : {};
  return display[key] || entry[key] || [];
}

function addMetadata(metadataByKey, key, metadata) {
  const normalized = normalizeRel(key);
  if (!normalized) return;
  metadataByKey.set(normalized, {
    ...metadata,
    antigenChains: Array.isArray(metadata.antigenChains) ? metadata.antigenChains : [],
    antibodyChains: Array.isArray(metadata.antibodyChains) ? metadata.antibodyChains : []
  });
}

function loadProjectMetadata() {
  const metadataByKey = new Map();

  const catalog = readJson(path.join(ROOT, 'pdb', 'local-structure-catalog.json'), {});
  for (const entry of catalog.routePresets || []) {
    const files = [...(entry.files || []), ...(entry.localFiles || [])];
    for (const filename of files) {
      const metadata = {
        metadataSource: 'local-structure-catalog',
        target: entry.target || null,
        format: inferFormatFromFilename(filename),
        antigenChains: chainsFromDisplay(entry, 'antigenChains'),
        antibodyChains: chainsFromDisplay(entry, 'antibodyChains')
      };
      addMetadata(metadataByKey, filename, metadata);
      addMetadata(metadataByKey, path.join('pdb', filename), metadata);
    }
  }
  for (const asset of catalog.libraryAssets || []) {
    const filename = asset.filename || asset.file || (asset.localPath ? path.basename(asset.localPath) : '');
    if (!filename) continue;
    const metadata = {
      metadataSource: 'local-structure-catalog',
      target: asset.target || asset.protein || null,
      format: asset.antibodyFormat || inferFormatFromFilename(filename),
      antigenChains: asset.antigenChains || chainsFromDisplay(asset, 'antigenChains'),
      antibodyChains: asset.antibodyChains || chainsFromDisplay(asset, 'antibodyChains')
    };
    addMetadata(metadataByKey, filename, metadata);
    if (asset.localPath) addMetadata(metadataByKey, asset.localPath, metadata);
  }

  for (const indexFile of ['root-target-index.json', 'expanded-target-index.json']) {
    const indexData = readJson(path.join(ROOT, 'pdb', indexFile), {});
    for (const [gene, target] of Object.entries(indexData.targets || {})) {
      const complexDir = target.complexDir || gene;
      for (const pose of target.poses || []) {
        if (!pose || !pose.fileName) continue;
        const rel = indexFile === 'expanded-target-index.json'
          ? path.join('pdb', 'expanded', complexDir, pose.fileName)
          : path.join('pdb', pose.fileName);
        const metadata = {
          metadataSource: indexFile,
          target: target.proteinName || gene,
          format: pose.format || inferFormatFromFilename(pose.fileName),
          antigenChains: target.antigenChains || [],
          antibodyChains: pose.antibodyChains || []
        };
        addMetadata(metadataByKey, rel, metadata);
        if (!metadataByKey.has(pose.fileName)) addMetadata(metadataByKey, pose.fileName, metadata);
      }
    }
  }

  return metadataByKey;
}

function metadataForFile(metadataByKey, filePath) {
  if (!metadataByKey) return null;
  const projectRel = normalizeRel(path.relative(ROOT, filePath));
  const basename = path.basename(filePath);
  return metadataByKey.get(projectRel) || metadataByKey.get(basename) || null;
}

function collectPdbFiles(dir, results = []) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return results;
  }
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (DEFAULT_EXCLUDE_DIRS.has(entry.name)) continue;
      collectPdbFiles(fullPath, results);
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.pdb')) {
      results.push(fullPath);
    }
  }
  return results;
}

function focusMatches(focus, filePath, scanRoot, metadata) {
  if (!focus.length) return true;
  const haystack = [
    normalizeRel(path.relative(scanRoot, filePath)),
    normalizeRel(path.relative(ROOT, filePath)),
    path.basename(filePath),
    metadata && metadata.target
  ].join('\n').toLowerCase();
  return focus.some(item => haystack.includes(item.toLowerCase()));
}

function statusBucket(status) {
  if (status === 'OK') return 'ok';
  if (status === 'NO_ROLE_METADATA') return 'noRoleMetadata';
  if (status === 'MISSING_ROLE_ATOMS') return 'missingRoleAtoms';
  if (status === 'INSUFFICIENT_ROLE_ATOMS') return 'insufficientRoleAtoms';
  if (status === 'HARD_CLASH') return 'hardClash';
  if (status === 'TOO_FAR') return 'tooFar';
  if (status === 'WEAK_INTERFACE') return 'weakInterface';
  return 'other';
}

function isProblemStatus(status) {
  return !['OK', 'NO_ROLE_METADATA'].includes(status);
}

function sortProblems(left, right) {
  const rank = {
    MISSING_ROLE_ATOMS: 1,
    TOO_FAR: 2,
    HARD_CLASH: 3,
    WEAK_INTERFACE: 4,
    INSUFFICIENT_ROLE_ATOMS: 5
  };
  const rankDiff = (rank[left.status] || 99) - (rank[right.status] || 99);
  if (rankDiff) return rankDiff;
  const leftMin = left.geometry && Number.isFinite(left.geometry.minDistance) ? left.geometry.minDistance : -1;
  const rightMin = right.geometry && Number.isFinite(right.geometry.minDistance) ? right.geometry.minDistance : -1;
  return rightMin - leftMin;
}

function buildReportEntry(analysis, extras = {}) {
  return {
    ...reportableAnalysis(analysis),
    ...extras
  };
}

function csvEscape(value) {
  if (value == null) return '';
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  if (/[",\n\r]/.test(text)) return '"' + text.replace(/"/g, '""') + '"';
  return text;
}

function writeCsv(filePath, rows) {
  const headers = [
    'file',
    'status',
    'target',
    'format',
    'metadataSource',
    'antigenChains',
    'antibodyChains',
    'missingAntigenChains',
    'missingAntibodyChains',
    'antigenAtoms',
    'antibodyAtoms',
    'minDistance',
    'contactPairs',
    'nearPairs',
    'hardClashes',
    'comDistance',
    'visualGap',
    'fixPlanOk',
    'applied'
  ];
  const lines = [headers.join(',')];
  for (const row of rows) {
    const values = [
      row.file,
      row.status,
      row.target,
      row.format,
      row.metadataSource,
      row.roles && row.roles.antigenChains,
      row.roles && row.roles.antibodyChains,
      row.roles && row.roles.missingAntigenChains,
      row.roles && row.roles.missingAntibodyChains,
      row.atoms && row.atoms.antigen,
      row.atoms && row.atoms.antibody,
      row.geometry && row.geometry.minDistance,
      row.geometry && row.geometry.contactPairs,
      row.geometry && row.geometry.nearPairs,
      row.geometry && row.geometry.hardClashes,
      row.geometry && row.geometry.comDistance,
      row.geometry && row.geometry.visualGap,
      row.fixPlan && row.fixPlan.ok,
      row.applied === true
    ];
    lines.push(values.map(csvEscape).join(','));
  }
  ensureParent(filePath);
  fs.writeFileSync(filePath, lines.join('\n') + '\n');
}

function writeMarkdown(filePath, report) {
  const lines = [
    '# PDB Complex Geometry Audit',
    '',
    '- Scan root: `' + report.scanRoot + '`',
    '- Scanned files: ' + report.summary.scannedFiles,
    '- Role-backed complexes: ' + report.summary.roleBackedComplexes,
    '- Problem files: ' + report.summary.problemFiles,
    '- Planned fixes: ' + report.summary.plannedFixes,
    '- Applied fixes: ' + report.summary.appliedFixes,
    '',
    '## Problem Files',
    '',
    '| File | Status | Min distance (A) | Contacts | Near pairs | Missing antibody chains | Fix plan |',
    '|------|--------|------------------|----------|------------|-------------------------|----------|'
  ];
  for (const row of report.problems) {
    lines.push([
      '`' + row.file + '`',
      row.status,
      row.geometry && row.geometry.minDistance != null ? row.geometry.minDistance : '',
      row.geometry && row.geometry.contactPairs != null ? row.geometry.contactPairs : '',
      row.geometry && row.geometry.nearPairs != null ? row.geometry.nearPairs : '',
      row.roles && row.roles.missingAntibodyChains ? row.roles.missingAntibodyChains.join(',') : '',
      row.fixPlan ? (row.fixPlan.ok ? 'ready' : row.fixPlan.reason) : ''
    ].join(' | ').replace(/^/, '| ') + ' |');
  }
  ensureParent(filePath);
  fs.writeFileSync(filePath, lines.join('\n') + '\n');
}

function backupAndWrite(filePath, fixedText, scanRoot, backupDir) {
  const rel = normalizeRel(path.relative(scanRoot, filePath));
  const backupPath = path.join(backupDir, rel);
  ensureParent(backupPath);
  fs.copyFileSync(filePath, backupPath);
  fs.writeFileSync(filePath, fixedText);
  return backupPath;
}

function analyzeFile(filePath, scanRoot, metadataByKey, options) {
  const metadata = metadataForFile(metadataByKey, filePath);
  const text = fs.readFileSync(filePath, 'utf8');
  const reportRel = normalizeRel(path.relative(scanRoot, filePath));
  const analysis = analyzeComplexText(text, {
    ...(metadata || {}),
    file: reportRel,
    thresholds: options.thresholds
  });
  const extras = {};

  if (options.planFixes && analysis.fixable) {
    const plan = createAntibodyTranslationPlan(analysis);
    extras.fixPlan = plan.ok
      ? {
          ok: true,
          method: plan.method,
          antibodyChains: plan.antibodyChains,
          chainColumn: plan.chainColumn,
          translation: plan.translation,
          beforeGeometry: plan.beforeGeometry,
          afterGeometry: plan.afterGeometry
        }
      : plan;
    if (options.applyFixes && plan.ok) {
      const fixedText = applyAntibodyTranslation(text, analysis, plan);
      const backupPath = backupAndWrite(filePath, fixedText, scanRoot, options.backupDir);
      const after = analyzeComplexText(fixedText, {
        ...(metadata || {}),
        file: reportRel,
        thresholds: options.thresholds
      });
      extras.applied = true;
      extras.backup = normalizeRel(path.relative(ROOT, backupPath));
      extras.afterApply = reportableAnalysis(after);
    }
  }

  return buildReportEntry(analysis, extras);
}

function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    console.error('');
    console.error(usage());
    process.exit(1);
  }

  if (options.help) {
    console.log(usage());
    return;
  }

  if (!fs.existsSync(options.scanRoot)) {
    console.error('Scan root does not exist:', options.scanRoot);
    process.exit(1);
  }

  const metadataByKey = options.useCatalog ? loadProjectMetadata() : null;
  const allFiles = collectPdbFiles(options.scanRoot);
  const matchingFiles = [];
  for (const filePath of allFiles) {
    const metadata = metadataForFile(metadataByKey, filePath);
    if (!focusMatches(options.focus, filePath, options.scanRoot, metadata)) continue;
    matchingFiles.push(filePath);
    if (matchingFiles.length >= options.max) break;
  }

  if (options.applyFixes) fs.mkdirSync(options.backupDir, { recursive: true });

  const startedAt = new Date().toISOString();
  const rows = [];
  const problems = [];
  const stats = {
    ok: 0,
    noRoleMetadata: 0,
    missingRoleAtoms: 0,
    insufficientRoleAtoms: 0,
    hardClash: 0,
    tooFar: 0,
    weakInterface: 0,
    other: 0,
    readError: 0
  };

  for (let index = 0; index < matchingFiles.length; index += 1) {
    const filePath = matchingFiles[index];
    try {
      const row = analyzeFile(filePath, options.scanRoot, metadataByKey, options);
      rows.push(row);
      stats[statusBucket(row.status)] += 1;
      if (isProblemStatus(row.status)) problems.push(row);
    } catch (error) {
      stats.readError += 1;
      const row = {
        file: normalizeRel(path.relative(options.scanRoot, filePath)),
        status: 'READ_ERROR',
        fixable: false,
        error: error.message
      };
      rows.push(row);
      problems.push(row);
    }

    if (options.progress && (index + 1) % 1000 === 0) {
      const percent = ((index + 1) / matchingFiles.length * 100).toFixed(1);
      process.stdout.write('\rScanned ' + (index + 1) + '/' + matchingFiles.length + ' (' + percent + '%), problems: ' + problems.length);
    }
  }
  if (options.progress && matchingFiles.length >= 1000) console.log('');

  problems.sort(sortProblems);
  const plannedFixes = rows.filter(row => row.fixPlan && row.fixPlan.ok).length;
  const appliedFixes = rows.filter(row => row.applied === true).length;
  const report = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    startedAt,
    scanRoot: normalizeRel(path.relative(ROOT, options.scanRoot)) || '.',
    focus: options.focus,
    mode: {
      planFixes: options.planFixes,
      applyFixes: options.applyFixes,
      backupDir: options.applyFixes ? normalizeRel(path.relative(ROOT, options.backupDir)) : null
    },
    thresholds: options.thresholds,
    summary: {
      discoveredPdbFiles: allFiles.length,
      scannedFiles: matchingFiles.length,
      roleBackedComplexes: rows.filter(row => row.status !== 'NO_ROLE_METADATA').length,
      problemFiles: problems.length,
      plannedFixes,
      appliedFixes,
      stats
    },
    problems,
    rows
  };

  ensureParent(options.out);
  fs.writeFileSync(options.out, JSON.stringify(report, null, 2));
  if (options.csv) writeCsv(options.csv, rows);
  if (options.md) writeMarkdown(options.md, report);

  console.log('PDB complex geometry audit complete.');
  console.log('Scanned files:', report.summary.scannedFiles);
  console.log('Role-backed complexes:', report.summary.roleBackedComplexes);
  console.log('Problem files:', report.summary.problemFiles);
  console.log('Planned fixes:', report.summary.plannedFixes);
  console.log('Applied fixes:', report.summary.appliedFixes);
  console.log('JSON report:', options.out);
  if (options.csv) console.log('CSV report:', options.csv);
  if (options.md) console.log('Markdown report:', options.md);
  if (options.applyFixes) console.log('Backups:', options.backupDir);

  if (options.failOnProblems && report.summary.problemFiles > 0) process.exitCode = 2;
}

if (require.main === module) {
  main();
}

module.exports = {
  parseArgs,
  collectPdbFiles,
  loadProjectMetadata,
  metadataForFile,
  focusMatches,
  analyzeFile
};
