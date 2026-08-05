'use strict';

const assert = require('assert/strict');
const childProcess = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const test = require('node:test');

const {
  analyzeComplexText,
  createAntibodyTranslationPlan,
  applyAntibodyTranslation
} = require('../lib/pdb-complex-geometry');
const {
  formatDurationMs,
  renderProgressLine
} = require('../scripts/audit_pdb_complex_geometry');

function atomLine(serial, atom, residue, chain, resSeq, x, y, z, element = 'C') {
  return 'ATOM  ' +
    String(serial).padStart(5, ' ') + ' ' +
    String(atom).padEnd(4, ' ') +
    ' ' +
    String(residue).padStart(3, ' ') + ' ' +
    String(chain || ' ') +
    String(resSeq).padStart(4, ' ') +
    '    ' +
    Number(x).toFixed(3).padStart(8, ' ') +
    Number(y).toFixed(3).padStart(8, ' ') +
    Number(z).toFixed(3).padStart(8, ' ') +
    '  1.00 20.00           ' +
    String(element || '').padStart(2, ' ');
}

function pdbText({ antibodyOffset = 100, includeAntibody = true, includeOther = false } = {}) {
  const lines = [
    'HEADER    SYNTHETIC COMPLEX',
    'REMARK 901 TARGET: synthetic',
    'REMARK 902 FORMAT: Fab',
    'REMARK 904 ANTIGEN CHAINS: A',
    'REMARK 905 ANTIBODY CHAINS: B,C',
    'MODEL        1',
    atomLine(1, 'CA', 'GLY', 'A', 1, 0, 0, 0),
    atomLine(2, 'CB', 'GLY', 'A', 1, 0, 1, 0),
    atomLine(3, 'CG', 'GLY', 'A', 1, 0, 0, 1),
    atomLine(4, 'CD', 'GLY', 'A', 1, 0, 1, 1)
  ];
  if (includeOther) {
    lines.push(atomLine(5, 'CA', 'GLY', 'Z', 1, -30, 0, 0));
  }
  if (includeAntibody) {
    lines.push(atomLine(6, 'CA', 'GLY', 'B', 1, antibodyOffset, 0, 0));
    lines.push(atomLine(7, 'CB', 'GLY', 'B', 1, antibodyOffset, 1, 0));
    lines.push(atomLine(8, 'CA', 'GLY', 'C', 1, antibodyOffset, 0, 1));
    lines.push(atomLine(9, 'CB', 'GLY', 'C', 1, antibodyOffset, 1, 1));
  }
  lines.push('TER', 'ENDMDL', 'END', '');
  return lines.join('\n');
}

const looseTinyThresholds = {
  minContactPairs: 1,
  minNearPairs: 1,
  minAntigenAtoms: 3,
  minAntibodyAtoms: 3
};

test('analyzeComplexText flags antigen-antibody coordinates that are too far apart', () => {
  const analysis = analyzeComplexText(pdbText({ antibodyOffset: 120 }), {
    thresholds: looseTinyThresholds,
    file: 'synthetic-far.pdb'
  });

  assert.equal(analysis.status, 'TOO_FAR');
  assert.ok(analysis.geometry.minDistance > 10);
  assert.ok(analysis.issues.some(issue => issue.code === 'MIN_DISTANCE_TOO_LARGE'));
  assert.deepEqual(analysis.roles.antigenChains, ['A']);
  assert.deepEqual(analysis.roles.antibodyChains, ['B', 'C']);
});

test('analyzeComplexText reports declared antibody chains that have no atoms', () => {
  const analysis = analyzeComplexText(pdbText({ includeAntibody: false }), {
    thresholds: looseTinyThresholds,
    file: 'synthetic-missing-antibody.pdb'
  });

  assert.equal(analysis.status, 'MISSING_ROLE_ATOMS');
  assert.deepEqual(analysis.roles.missingAntibodyChains, ['B', 'C']);
  assert.equal(analysis.fixable, false);
});

test('translation fix preserves file lines and moves only antibody coordinate fields', () => {
  const source = pdbText({ antibodyOffset: 80, includeOther: true });
  const before = analyzeComplexText(source, {
    thresholds: looseTinyThresholds,
    file: 'synthetic-fixable.pdb'
  });
  const plan = createAntibodyTranslationPlan(before, { targetMinDistance: 2.4 });
  assert.equal(plan.ok, true);

  const fixed = applyAntibodyTranslation(source, before, plan);
  const after = analyzeComplexText(fixed, {
    thresholds: looseTinyThresholds,
    file: 'synthetic-fixed.pdb'
  });

  assert.equal(after.status, 'OK');
  assert.ok(after.geometry.minDistance >= 2.0 && after.geometry.minDistance <= 4.5);
  assert.equal(fixed.split(/\r?\n/).length, source.split(/\r?\n/).length);
  assert.equal((fixed.match(/^ATOM/gm) || []).length, (source.match(/^ATOM/gm) || []).length);
  assert.match(fixed, /^ATOM.{17}A/m);
  assert.match(fixed, /^ATOM.{17}B/m);
  assert.match(fixed, /^ATOM.{17}C/m);
  assert.match(fixed, /^ATOM.{17}Z/m);

  const beforeLines = source.split(/\r?\n/);
  const afterLines = fixed.split(/\r?\n/);
  for (let index = 0; index < beforeLines.length; index += 1) {
    const chain = beforeLines[index][21];
    if (!beforeLines[index].startsWith('ATOM') || chain === 'B' || chain === 'C') continue;
    assert.equal(afterLines[index], beforeLines[index]);
  }
});

test('translation planning refuses to change already acceptable geometry', () => {
  const source = pdbText({ antibodyOffset: 3.1 });
  const analysis = analyzeComplexText(source, {
    thresholds: looseTinyThresholds,
    file: 'synthetic-ok.pdb'
  });
  assert.equal(analysis.status, 'OK');

  const plan = createAntibodyTranslationPlan(analysis, { targetMinDistance: 2.4 });
  assert.equal(plan.ok, false);
  assert.equal(plan.reason, 'not_fixable_status');
});

test('progress line estimates remaining scan time', () => {
  assert.equal(formatDurationMs(15 * 60 * 1000), '15m 00s');
  assert.equal(formatDurationMs((2 * 60 * 60 + 3 * 60 + 4) * 1000), '2h 03m 04s');

  const line = renderProgressLine({
    processed: 2500,
    total: 10000,
    problemCount: 12,
    startedAtMs: 1_000_000,
    nowMs: 1_300_000
  });

  assert.match(line, /Scanned 2500\/10000 \(25\.0%\)/);
  assert.match(line, /elapsed: 5m 00s/);
  assert.match(line, /remaining: 15m 00s/);
  assert.match(line, /problems: 12/);
});

test('audit CLI writes report and dry-run fix plans without changing files', t => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'zoonoab-pdb-audit-'));
  t.after(() => fs.rmSync(tempDir, { recursive: true, force: true }));
  const farPath = path.join(tempDir, 'synthetic-far.pdb');
  const okPath = path.join(tempDir, 'synthetic-ok.pdb');
  const before = pdbText({ antibodyOffset: 90 });
  fs.writeFileSync(farPath, before);
  fs.writeFileSync(okPath, pdbText({ antibodyOffset: 3.1 }));

  const outPath = path.join(tempDir, 'audit.json');
  const csvPath = path.join(tempDir, 'audit.csv');
  const result = childProcess.spawnSync(process.execPath, [
    path.resolve(__dirname, '..', 'scripts', 'audit_pdb_complex_geometry.js'),
    '--scan-root', tempDir,
    '--out', outPath,
    '--csv', csvPath,
    '--plan-fixes',
    '--no-progress',
    '--threshold-min-contact-pairs', '1',
    '--threshold-min-near-pairs', '1'
  ], {
    cwd: path.resolve(__dirname, '..'),
    encoding: 'utf8'
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.equal(fs.readFileSync(farPath, 'utf8'), before);
  assert.ok(fs.existsSync(outPath));
  assert.ok(fs.existsSync(csvPath));

  const report = JSON.parse(fs.readFileSync(outPath, 'utf8'));
  assert.equal(report.summary.scannedFiles, 2);
  assert.equal(report.summary.problemFiles, 1);
  assert.equal(report.problems[0].file, 'synthetic-far.pdb');
  assert.equal(report.problems[0].status, 'TOO_FAR');
  assert.equal(report.problems[0].fixPlan.ok, true);
});

test('audit CLI can write compressed backups when applying fixes', t => {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'zoonoab-pdb-apply-'));
  t.after(() => fs.rmSync(tempDir, { recursive: true, force: true }));
  const farPath = path.join(tempDir, 'synthetic-far.pdb');
  fs.writeFileSync(farPath, pdbText({ antibodyOffset: 90 }));

  const outPath = path.join(tempDir, 'audit.json');
  const backupDir = path.join(tempDir, 'backups');
  const result = childProcess.spawnSync(process.execPath, [
    path.resolve(__dirname, '..', 'scripts', 'audit_pdb_complex_geometry.js'),
    '--scan-root', tempDir,
    '--out', outPath,
    '--csv', path.join(tempDir, 'audit.csv'),
    '--apply-fixes',
    '--compress-backups',
    '--backup-dir', backupDir,
    '--no-progress',
    '--threshold-min-contact-pairs', '1',
    '--threshold-min-near-pairs', '1'
  ], {
    cwd: path.resolve(__dirname, '..'),
    encoding: 'utf8'
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  const report = JSON.parse(fs.readFileSync(outPath, 'utf8'));
  assert.equal(report.summary.appliedFixes, 1);
  assert.equal(report.problems[0].backup.endsWith('.gz'), true);
  assert.ok(fs.existsSync(path.join(path.resolve(__dirname, '..'), report.problems[0].backup)));
  assert.equal(fs.existsSync(path.join(backupDir, 'synthetic-far.pdb')), false);
});
