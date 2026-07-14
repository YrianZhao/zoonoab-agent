const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const test = require('node:test');

const {
  FORMAT_DEFAULTS,
  generateDisplayPose,
  measureInterfaceGeometry,
  parsePdbRecords
} = require('../lib/display-pose');

const ROOT = path.resolve(__dirname, '..');

function readPdb(filename) {
  return fs.readFileSync(path.join(ROOT, 'pdb', filename), 'utf8');
}

function atomLinesForChains(text, chains, chainMap = {}) {
  return String(text)
    .split(/\r?\n/)
    .filter(line => (line.startsWith('ATOM  ') || line.startsWith('HETATM')) && chains.includes(line[21] || ' '))
    .map(line => line.slice(0, 21) + (chainMap[line[21] || ' '] || line[21] || ' ') + line.slice(22))
    .join('\n') + '\n';
}

function distance(a, b) {
  return Math.sqrt(
    ((a.xyz[0] - b.xyz[0]) ** 2) +
    ((a.xyz[1] - b.xyz[1]) ** 2) +
    ((a.xyz[2] - b.xyz[2]) ** 2)
  );
}

function assertGeometryAccepted(result) {
  const antigen = parsePdbRecords(result.pdbText, result.antigenChains).filter(record => record.isHeavy);
  const antibody = parsePdbRecords(result.pdbText, result.antibodyChains).filter(record => record.isHeavy);
  const measured = measureInterfaceGeometry(antigen, antibody);
  const defaults = FORMAT_DEFAULTS[result.pose.format];

  assert.equal(measured.hardClashes, 0, 'there must be no antigen-antibody atom pairs below 2.0 A');
  assert.ok(measured.minDistance >= 2.0 && measured.minDistance <= 4.5, 'closest role distance must remain in the display interface range');
  assert.ok(measured.contactPairs >= defaults.minContactPairs, '4.5 A contact threshold must be met');
  assert.ok(measured.nearPairs >= defaults.minNearPairs, '6.0 A near-contact threshold must be met');
  assert.equal(result.pose.geometry.contactPairs4_5A, measured.contactPairs);
  assert.equal(result.pose.geometry.nearPairs6A, measured.nearPairs);
  assert.equal(result.pose.geometry.hardClashesBelow2A, measured.hardClashes);
  assert.ok(Math.abs(result.pose.geometry.minDistance - measured.minDistance) < 0.001);
}

function fabOptions(overrides = {}) {
  const source = readPdb('PDL1-Fab-01.pdb');
  return {
    antigenPdbText: source,
    antigenChains: ['A'],
    antibodyFormat: 'Fab',
    scaffoldPdbText: source,
    scaffoldAntibodyChains: ['B', 'C'],
    seed: 'fab-repeatable-seed',
    candidateIndex: 3,
    sourceMetadata: {
      target: 'PD-L1',
      antigenSource: 'RCSB 5X8L PD-L1 antigen chain',
      scaffoldSource: 'local Fab display scaffold'
    },
    ...overrides
  };
}

test('Fab display pose generation is byte-for-byte deterministic for a seed and candidate', () => {
  const first = generateDisplayPose(fabOptions());
  const second = generateDisplayPose(fabOptions());

  assert.equal(first.ok, true, first.error && first.error.message);
  assert.equal(second.ok, true, second.error && second.error.message);
  assert.equal(first.pdbText, second.pdbText);
  assert.deepEqual(first.pose, second.pose);
  assert.equal(first.combinedPdb, first.pdbText);
  assert.equal(first.pose.type, 'DISPLAY_POSE');
  assert.equal(first.pose.classification, 'representative_geometric_placement');
  assert.match(first.pdbText, /REMARK 900 DISPLAY_POSE: REPRESENTATIVE_GEOMETRIC_PLACEMENT/);
  assert.match(first.pdbText, /REMARK 903 ANTIGEN SOURCE: RCSB 5X8L PD-L1 antigen chain/);
  assert.match(first.pdbText, /REMARK 906 DISPLAY POSE ONLY; ANTIBODY ORIENTATION IS GEOMETRICALLY GENERATED/);
  assert.doesNotMatch(first.pdbText, /\b(?:ipTM|DockQ)\b/i);
  assertGeometryAccepted(first);
});

test('all antigen coordinate fields remain unchanged while the antibody undergoes one rigid transform', () => {
  const options = fabOptions({ seed: 'coordinate-invariance', candidateIndex: 1 });
  const result = generateDisplayPose(options);
  assert.equal(result.ok, true, result.error && result.error.message);

  const sourceAntigen = parsePdbRecords(options.antigenPdbText, options.antigenChains);
  const outputAntigen = parsePdbRecords(result.pdbText, result.antigenChains);
  assert.equal(outputAntigen.length, sourceAntigen.length);
  assert.deepEqual(outputAntigen.map(record => record.xyz), sourceAntigen.map(record => record.xyz));
  assert.deepEqual(
    outputAntigen.map(record => record.line.slice(30, 54)),
    sourceAntigen.map(record => record.line.slice(30, 54)),
    'antigen PDB coordinate columns must be copied without reformatting'
  );

  const sourceScaffold = parsePdbRecords(options.scaffoldPdbText, options.scaffoldAntibodyChains);
  const outputScaffold = parsePdbRecords(result.pdbText, result.antibodyChains);
  assert.equal(outputScaffold.length, sourceScaffold.length);
  const samplePairs = [[0, 25], [100, 750], [400, sourceScaffold.length - 1]];
  for (const [left, right] of samplePairs) {
    assert.ok(
      Math.abs(distance(sourceScaffold[left], sourceScaffold[right]) - distance(outputScaffold[left], outputScaffold[right])) < 0.004,
      'rigid transformation must preserve scaffold internal distances within PDB rounding precision'
    );
  }
  assertGeometryAccepted(result);
});

test('multi-chain antigen shape is preserved and conflicting Fab chain IDs are remapped', () => {
  const vegf = readPdb('VEGFA-Fab-01.pdb');
  const pdl1 = readPdb('PDL1-Fab-01.pdb');
  const antigenPdbText = atomLinesForChains(vegf, ['A', 'D'], { A: 'B', D: 'C' });
  const scaffoldPdbText = atomLinesForChains(pdl1, ['B', 'C']);
  const result = generateDisplayPose({
    antigenPdbText,
    antigenChains: ['B', 'C'],
    format: 'Fab',
    scaffoldPdbText,
    scaffoldAntibodyChains: ['B', 'C'],
    seed: 'multichain-conflict',
    candidateIndex: 2,
    sourceMetadata: {
      target: 'VEGF-A',
      antigenSource: 'RCSB 1BJ1 VEGF-A biological dimer',
      scaffoldSource: 'local Fab display scaffold'
    }
  });

  assert.equal(result.ok, true, result.error && result.error.message);
  assert.deepEqual(result.antigenChains, ['B', 'C']);
  assert.deepEqual(result.antibodyChains, ['H', 'L']);
  assert.deepEqual(result.chainMappings.antigen, { B: 'B', C: 'C' });
  assert.deepEqual(result.chainMappings.antibody, { B: 'H', C: 'L' });
  assert.equal(new Set([...result.antigenChains, ...result.antibodyChains]).size, 4);

  const sourceAntigen = parsePdbRecords(antigenPdbText, ['B', 'C']);
  const outputAntigen = parsePdbRecords(result.pdbText, ['B', 'C']);
  assert.deepEqual(outputAntigen.map(record => record.xyz), sourceAntigen.map(record => record.xyz));
  assert.ok(outputAntigen.some(record => record.chain === 'B'));
  assert.ok(outputAntigen.some(record => record.chain === 'C'));
  assertGeometryAccepted(result);
});

test('a one-chain VHH scaffold produces a valid representative interface', () => {
  const source = readPdb('IL33-VHH-01.pdb');
  const result = generateDisplayPose({
    antigenPdbText: source,
    antigenChains: ['A'],
    format: 'VHH',
    scaffoldPdbText: source,
    scaffoldAntibodyChains: ['B'],
    seed: 'vhh-seed',
    candidateIndex: 7,
    sourceMetadata: {
      target: 'IL-33',
      antigenSource: 'RCSB 4KC3 IL-33 chain',
      scaffoldSource: 'local VHH display scaffold'
    }
  });

  assert.equal(result.ok, true, result.error && result.error.message);
  assert.equal(result.pose.format, 'VHH');
  assert.equal(result.antibodyChains.length, 1);
  assert.match(result.pdbText, /REMARK 902 FORMAT: VHH/);
  assert.match(result.pdbText, /REMARK 909 NOT AN EXPERIMENTAL COMPLEX OR A PREDICTED AFFINITY CLAIM/);
  assertGeometryAccepted(result);
});

test('impossible geometry requirements fail explicitly without generating a PDB', () => {
  const result = generateDisplayPose(fabOptions({
    seed: 'intentional-failure',
    geometry: {
      minContactPairs: 1000000,
      minNearPairs: 1000000
    }
  }));

  assert.equal(result.ok, false);
  assert.equal(result.generated, false);
  assert.equal(result.pdbText, null);
  assert.equal(result.combinedPdb, null);
  assert.equal(result.error.code, 'NO_ACCEPTABLE_POSE');
  assert.ok(result.error.details.bestGeometry);
  assert.equal(result.error.details.bestGeometry.hardClashes, 0);
});

test('invalid Fab/VHH scaffold chain sets return structured failures', () => {
  const source = readPdb('PDL1-Fab-01.pdb');
  const invalidFab = generateDisplayPose({
    antigenPdbText: source,
    antigenChains: ['A'],
    format: 'Fab',
    scaffoldPdbText: source,
    scaffoldAntibodyChains: ['B']
  });
  const invalidVhh = generateDisplayPose({
    antigenPdbText: source,
    antigenChains: ['A'],
    format: 'VHH',
    scaffoldPdbText: source,
    scaffoldAntibodyChains: ['B', 'C']
  });

  assert.equal(invalidFab.ok, false);
  assert.equal(invalidFab.error.code, 'INVALID_SCAFFOLD');
  assert.equal(invalidFab.pdbText, null);
  assert.equal(invalidVhh.ok, false);
  assert.equal(invalidVhh.error.code, 'INVALID_SCAFFOLD');
  assert.equal(invalidVhh.pdbText, null);
});
