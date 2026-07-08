const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const test = require('node:test');

const ROOT = path.resolve(__dirname, '..');

function parsePdbAtoms(filename) {
  const file = path.join(ROOT, filename);
  assert.ok(fs.existsSync(file), filename + ' should exist');
  return fs.readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .filter(line => line.startsWith('ATOM'))
    .map(line => ({
      chain: line[21] || ' ',
      atom: line.slice(12, 16).trim(),
      x: parseFloat(line.slice(30, 38)),
      y: parseFloat(line.slice(38, 46)),
      z: parseFloat(line.slice(46, 54))
    }))
    .filter(atom => Number.isFinite(atom.x) && Number.isFinite(atom.y) && Number.isFinite(atom.z));
}

function readPdbText(filename) {
  const file = path.join(ROOT, filename);
  assert.ok(fs.existsSync(file), filename + ' should exist');
  return fs.readFileSync(file, 'utf8');
}

function remarkChains(text, remarkNo) {
  const match = text.match(new RegExp('REMARK\\s+' + remarkNo + '\\s+[^:]+:\\s*(.*)'));
  return match ? match[1].split(',').map(item => item.trim()).filter(Boolean) : [];
}

function chainAtomCounts(atoms) {
  const counts = new Map();
  for (const atom of atoms) counts.set(atom.chain, (counts.get(atom.chain) || 0) + 1);
  return counts;
}

function crossChainClashSummary(atoms, threshold = 1.2) {
  const cellSize = threshold;
  const cells = new Map();
  let minDistance = Infinity;
  let hardClashes = 0;
  const thresholdSq = threshold * threshold;

  function cellKey(x, y, z) {
    return x + ',' + y + ',' + z;
  }

  function cellIndex(value) {
    return Math.floor(value / cellSize);
  }

  for (const atom of atoms) {
    const cx = cellIndex(atom.x);
    const cy = cellIndex(atom.y);
    const cz = cellIndex(atom.z);
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dz = -1; dz <= 1; dz++) {
          const bucket = cells.get(cellKey(cx + dx, cy + dy, cz + dz)) || [];
          for (const other of bucket) {
            if (other.chain === atom.chain) continue;
            const distSq = ((atom.x - other.x) ** 2) + ((atom.y - other.y) ** 2) + ((atom.z - other.z) ** 2);
            if (distSq < minDistance) minDistance = distSq;
            if (distSq < thresholdSq) hardClashes += 1;
          }
        }
      }
    }
    const key = cellKey(cx, cy, cz);
    if (!cells.has(key)) cells.set(key, []);
    cells.get(key).push(atom);
  }

  return {
    minDistance: Number.isFinite(minDistance) ? Math.sqrt(minDistance) : Infinity,
    hardClashes
  };
}

function crossRoleContactSummary(atoms, antigenChains, antibodyChains, contactThreshold = 4.5) {
  const antigen = atoms.filter(atom => antigenChains.includes(atom.chain));
  const antibody = atoms.filter(atom => antibodyChains.includes(atom.chain));
  let minDistance = Infinity;
  let contactPairs = 0;
  const contactSq = contactThreshold * contactThreshold;

  for (const a of antigen) {
    for (const b of antibody) {
      const distSq = ((a.x - b.x) ** 2) + ((a.y - b.y) ** 2) + ((a.z - b.z) ** 2);
      if (distSq < minDistance) minDistance = distSq;
      if (distSq <= contactSq) contactPairs += 1;
    }
  }

  return {
    minDistance: Number.isFinite(minDistance) ? Math.sqrt(minDistance) : Infinity,
    contactPairs
  };
}

test('IL-33 allergic asthma preset uses a real Fab complex without cross-chain hard clashes', () => {
  const atoms = parsePdbAtoms('pdb/IL33-Fab-01.pdb');
  const counts = chainAtomCounts(atoms);
  const text = readPdbText('pdb/IL33-Fab-01.pdb');

  assert.ok(atoms.length > 3000, 'IL33-Fab-01 should contain a full antigen-Fab complex');
  assert.ok((counts.get('A') || 0) > 500, 'chain A should contain the IL-33 antigen');
  assert.ok((counts.get('B') || 0) > 1000, 'chain B should contain the Fab heavy chain');
  assert.ok((counts.get('C') || 0) > 900, 'chain C should contain the Fab light chain');

  const clashes = crossChainClashSummary(atoms);
  assert.equal(clashes.hardClashes, 0, 'IL33-Fab-01 should have no cross-chain atom pairs below 1.2 A');
  assert.ok(clashes.minDistance > 1.2, 'closest cross-chain atom distance should be physically plausible');

  const contacts = crossRoleContactSummary(atoms, remarkChains(text, 904), remarkChains(text, 905));
  assert.ok(contacts.contactPairs >= 50, 'IL33-Fab-01 should expose a visible antigen-Fab interface');
  assert.ok(contacts.minDistance >= 1.2 && contacts.minDistance <= 3.5, 'IL33-Fab-01 should have a plausible closest antigen-Fab contact');
});

test('GIPR metabolic preset uses a real GIPR ECD Fab complex interface', () => {
  const text = readPdbText('pdb/GIPR-Fab-01.pdb');
  const atoms = parsePdbAtoms('pdb/GIPR-Fab-01.pdb');
  const contacts = crossRoleContactSummary(atoms, remarkChains(text, 904), remarkChains(text, 905));

  assert.match(text, /RCSB 4HJ0 human GIPR ECD \/ GIPG013 Fab complex/);
  assert.ok(contacts.contactPairs >= 80, 'GIPR-Fab-01 should expose a visible antigen-Fab interface');
  assert.ok(contacts.minDistance >= 1.2 && contacts.minDistance <= 3.5, 'GIPR-Fab-01 should have a plausible closest antigen-Fab contact');
});

test('static route preset PDBs avoid cross-chain hard clashes', () => {
  const pdbDir = path.join(ROOT, 'pdb');
  const files = fs.readdirSync(pdbDir)
    .filter(file => /^(IL33-Fab|TSLP-Fab|PDL1-Fab|HER2-Fab|EGFR-Fab|VEGFA-Fab|TNF-Fab|IL17A-Fab|IL23-Fab|RSVF-Fab|SC2RBD-Fab|FluHA-Fab|PCSK9-Fab|ANGPTL3-CV-Fab|ANGPTL3-Met-Fab|IL1B-Fab|GIPR-Fab)-\d+\.pdb$/.test(file));

  assert.ok(files.length >= 170, 'route preset library should contain broad local 3D coverage');
  for (const file of files) {
    const atoms = parsePdbAtoms(path.join('pdb', file));
    const clashes = crossChainClashSummary(atoms);
    assert.equal(clashes.hardClashes, 0, file + ' should have no cross-chain atom pairs below 1.2 A');
    assert.ok(clashes.minDistance > 1.2, file + ' closest cross-chain atom distance should be physically plausible');
  }
});

test('default display library only contains local complexes with visible antigen-antibody contacts', () => {
  const displayPrefixes = [
    'IL33-Fab',
    'TSLP-Fab',
    'PDL1-Fab',
    'HER2-Fab',
    'EGFR-Fab',
    'VEGFA-Fab',
    'TNF-Fab',
    'IL17A-Fab',
    'IL23-Fab',
    'RSVF-Fab',
    'SC2RBD-Fab',
    'FluHA-Fab',
    'PCSK9-Fab',
    'IL1B-Fab',
    'GIPR-Fab'
  ];

  for (const prefix of displayPrefixes) {
    for (let idx = 1; idx <= 10; idx++) {
      const filename = path.join('pdb', prefix + '-' + String(idx).padStart(2, '0') + '.pdb');
      const text = readPdbText(filename);
      const atoms = parsePdbAtoms(filename);
      const contacts = crossRoleContactSummary(atoms, remarkChains(text, 904), remarkChains(text, 905));

      assert.ok(contacts.contactPairs >= 50, filename + ' should expose a visible antigen-antibody interface');
      assert.ok(contacts.minDistance >= 1.2 && contacts.minDistance <= 3.5, filename + ' should have a plausible closest antigen-antibody contact');
    }
  }
});

test('A-grade local complex presets have real source remarks and visible antigen-antibody interfaces', () => {
  const realComplexPrefixes = [
    'IL33-Fab',
    'TSLP-Fab',
    'PDL1-Fab',
    'HER2-Fab',
    'EGFR-Fab',
    'VEGFA-Fab',
    'TNF-Fab',
    'IL17A-Fab',
    'IL23-Fab',
    'RSVF-Fab',
    'SC2RBD-Fab',
    'FluHA-Fab',
    'PCSK9-Fab',
    'IL1B-Fab',
    'GIPR-Fab'
  ];

  for (const prefix of realComplexPrefixes) {
    const filename = path.join('pdb', prefix + '-01.pdb');
    const text = readPdbText(filename);
    const atoms = parsePdbAtoms(filename);
    const antigenChains = remarkChains(text, 904);
    const antibodyChains = remarkChains(text, 905);
    const contacts = crossRoleContactSummary(atoms, antigenChains, antibodyChains);

    assert.match(text, /REMARK 903 STRUCTURAL BASIS: RCSB /, prefix + ' should keep a public RCSB basis');
    assert.ok(antigenChains.length >= 1, prefix + ' should mark antigen chains');
    assert.ok(antibodyChains.length >= 1, prefix + ' should mark antibody chains');
    assert.ok(contacts.contactPairs >= 50, prefix + ' should expose a visible antigen-antibody interface');
    assert.ok(contacts.minDistance >= 1.2 && contacts.minDistance <= 3.5, prefix + ' should have plausible closest antigen-antibody contact');
  }
});
