const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const test = require('node:test');

const ROOT = path.resolve(__dirname, '..');

const MULTIMER_ROUTE_EXPECTATIONS = [
  {
    routeId: 'autoimmune_inflammation',
    file: 'pdb/TNF-Fab-01.pdb',
    basis: /RCSB 5WUX TNF alpha trimer \/ certolizumab Fab complex/,
    basisText: 'RCSB 5WUX TNF alpha trimer / certolizumab Fab complex',
    antigenChains: ['A', 'D', 'E'],
    antibodyChains: ['B', 'C']
  },
  {
    routeId: 'autoimmune_il17',
    file: 'pdb/IL17A-Fab-01.pdb',
    basis: /RCSB 2VXS IL-17A dimer \/ neutralizing Fab complex/,
    basisText: 'RCSB 2VXS IL-17A dimer / neutralizing Fab complex',
    antigenChains: ['A', 'D'],
    antibodyChains: ['B', 'C', 'F', 'G']
  },
  {
    routeId: 'infectious_flu',
    file: 'pdb/FluHA-Fab-01.pdb',
    basis: /RCSB 3GBM influenza HA trimer biological assembly \/ CR6261 Fab complex/,
    basisText: 'RCSB 3GBM influenza HA trimer biological assembly / CR6261 Fab complex',
    antigenChains: ['A', 'D', 'E', 'F', 'G', 'H'],
    antibodyChains: ['B', 'C']
  }
];

const COMMON_REAL_COMPLEX_EXPECTATIONS = [
  {
    prefix: 'PD1-Fab',
    basis: /RCSB 5WT9 PD-1 \/ nivolumab Fab complex/,
    antigenChains: ['A'],
    antibodyChains: ['B', 'C']
  },
  {
    prefix: 'CTLA4-Fab',
    basis: /RCSB 6RP8 CTLA-4 \/ ipilimumab Fab complex/,
    antigenChains: ['A'],
    antibodyChains: ['B', 'C']
  },
  {
    prefix: 'CD20-Fab',
    basis: /RCSB 6VJA CD20 \/ rituximab Fab complex/,
    antigenChains: ['A', 'D'],
    antibodyChains: ['B', 'C', 'F', 'G']
  },
  {
    prefix: 'CD19-Fab',
    basis: /RCSB 6AL5 CD19 \/ B43 Fab complex/,
    antigenChains: ['A'],
    antibodyChains: ['B', 'C']
  },
  {
    prefix: 'CD3-Fab',
    basis: /RCSB 1SY6 CD3 gamma-epsilon \/ OKT3 Fab complex/,
    antigenChains: ['A'],
    antibodyChains: ['B', 'C']
  },
  {
    prefix: 'C5-Fab',
    basis: /RCSB 5I5K complement C5 \/ eculizumab variable-domain antibody complex/,
    antigenChains: ['A', 'D'],
    antibodyChains: ['B', 'C', 'F', 'G']
  },
  {
    prefix: 'IL6R-Fab',
    basis: /RCSB 8J6F IL-6R alpha \/ tocilizumab Fab complex/,
    antigenChains: ['A'],
    antibodyChains: ['B', 'C']
  },
  {
    prefix: 'IL4RA-Fab',
    basis: /RCSB 6WGL IL-4 receptor alpha \/ dupilumab Fab complex/,
    antigenChains: ['A'],
    antibodyChains: ['B', 'C']
  },
  {
    prefix: 'CD25-Fab',
    basis: /RCSB 3NFP IL-2RA\(CD25\) \/ daclizumab Fab complex/,
    antigenChains: ['A'],
    antibodyChains: ['B', 'C']
  },
  {
    prefix: 'CD38-Fab',
    basis: /RCSB 7DUO CD38 \/ daratumumab Fab complex/,
    antigenChains: ['A'],
    antibodyChains: ['B', 'C']
  },
  {
    prefix: 'TIGIT-Fab',
    basis: /RCSB 8VTD TIGIT \/ vibostolimab Fab complex/,
    antigenChains: ['A'],
    antibodyChains: ['B', 'C']
  },
  {
    prefix: 'CD47-Fab',
    basis: /RCSB 8ZCA CD47 \/ hu1C8 Fab complex/,
    antigenChains: ['A'],
    antibodyChains: ['B', 'C']
  },
  {
    prefix: 'LAG3-Fab',
    basis: /RCSB 8SO3 LAG-3 \/ favezelimab Fab complex/,
    antigenChains: ['A'],
    antibodyChains: ['B', 'C']
  },
  {
    prefix: 'TROP2-Fab',
    basis: /RCSB 9PI9 TROP-2 dimer \/ sacituzumab Fab complex/,
    antigenChains: ['A', 'D'],
    antibodyChains: ['B', 'C', 'F', 'G']
  },
  {
    prefix: 'BCMA-Fab',
    basis: /RCSB 9MQO BCMA \/ CA10V2 Fab complex/,
    antigenChains: ['A'],
    antibodyChains: ['B', 'C']
  },
  {
    prefix: 'IgE-Fab',
    basis: /RCSB 5G64 IgE-Fc \/ anti-IgE Fab complex/,
    antigenChains: ['A', 'D'],
    antibodyChains: ['B', 'C', 'F', 'G']
  },
  {
    prefix: 'CGRPR-Fab',
    basis: /RCSB 6UMG CGRP receptor ECD \/ erenumab Fab complex/,
    antigenChains: ['A', 'D'],
    antibodyChains: ['B', 'C']
  },
  {
    prefix: 'FluNA-Fab',
    basis: /RCSB 1NCD influenza N9 neuraminidase \/ NC41 Fab complex/,
    antigenChains: ['A'],
    antibodyChains: ['B', 'C']
  }
];

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

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

function crossRoleGeometrySummary(atoms, antigenChains, antibodyChains, contactThreshold = 4.5, nearThreshold = 6.0, clashThreshold = 2.0) {
  const antigen = atoms.filter(atom => antigenChains.includes(atom.chain));
  const antibody = atoms.filter(atom => antibodyChains.includes(atom.chain));
  let minDistance = Infinity;
  let contactPairs = 0;
  let nearPairs = 0;
  let closeClashes = 0;
  const contactSq = contactThreshold * contactThreshold;
  const nearSq = nearThreshold * nearThreshold;
  const clashSq = clashThreshold * clashThreshold;

  for (const a of antigen) {
    for (const b of antibody) {
      const distSq = ((a.x - b.x) ** 2) + ((a.y - b.y) ** 2) + ((a.z - b.z) ** 2);
      if (distSq < minDistance) minDistance = distSq;
      if (distSq <= contactSq) contactPairs += 1;
      if (distSq <= nearSq) nearPairs += 1;
      if (distSq < clashSq) closeClashes += 1;
    }
  }

  return {
    minDistance: Number.isFinite(minDistance) ? Math.sqrt(minDistance) : Infinity,
    contactPairs,
    nearPairs,
    closeClashes
  };
}

function assertPlausibleRoleGeometry(filename, options = {}) {
  const text = readPdbText(filename);
  const atoms = parsePdbAtoms(filename);
  const antigenChains = remarkChains(text, 904);
  const antibodyChains = remarkChains(text, 905);
  const geometry = crossRoleGeometrySummary(
    atoms,
    antigenChains,
    antibodyChains,
    options.contactThreshold || 4.5,
    options.nearThreshold || 6.0,
    options.clashThreshold || 2.0
  );

  assert.ok(antigenChains.length > 0, filename + ' should declare antigen chains');
  assert.ok(antibodyChains.length > 0, filename + ' should declare antibody chains');
  assert.equal(geometry.closeClashes, 0, filename + ' should not have antigen-antibody atom pairs below 2.0 A');
  assert.ok(geometry.contactPairs >= (options.minContacts || 10), filename + ' should keep visible antigen-antibody contacts within 4.5 A');
  assert.ok(geometry.nearPairs >= (options.minNearPairs || 50), filename + ' should keep antigen-antibody chains within 6.0 A');
  assert.ok(geometry.minDistance >= 2.0 && geometry.minDistance <= 4.5, filename + ' should be close enough for an interface but not overlap');
}

function roleGeometryThresholds(filename) {
  const base = path.basename(filename);
  if (/^ANGPTL3-(?:CV|Met)-Fab-\d+\.pdb$/.test(base)) {
    return { minContacts: 4, minNearPairs: 20 };
  }
  if (/^IL33-VHH-\d+\.pdb$/.test(base)) {
    return { minContacts: 8, minNearPairs: 45 };
  }
  return { minContacts: 8, minNearPairs: 40 };
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

test('multimeric antigen presets preserve their public biological shapes', () => {
  for (const item of MULTIMER_ROUTE_EXPECTATIONS) {
    const text = readPdbText(item.file);
    const atoms = parsePdbAtoms(item.file);
    const antigenChains = remarkChains(text, 904);
    const antibodyChains = remarkChains(text, 905);
    const counts = chainAtomCounts(atoms);
    const contacts = crossRoleContactSummary(atoms, antigenChains, antibodyChains);

    assert.match(text, item.basis);
    assert.deepEqual(antigenChains, item.antigenChains, item.file + ' should expose all antigen chains required for the target shape');
    for (const chain of item.antigenChains) {
      assert.ok((counts.get(chain) || 0) > 500, item.file + ' antigen chain ' + chain + ' should contain a visible protein chain');
    }
    assert.ok(contacts.contactPairs >= 50, item.file + ' should keep a visible antigen-Fab interface');
  }
});

test('multimeric antigen metadata stays aligned across backend and frontend fallbacks', () => {
  const serverSource = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
  const frontendSource = fs.readFileSync(path.join(ROOT, 'public/index.html'), 'utf8');

  for (const item of MULTIMER_ROUTE_EXPECTATIONS) {
    const backendAntigens = item.antigenChains.map(chain => "'" + chain + "'").join(', ');
    const backendAntibodies = item.antibodyChains.map(chain => "'" + chain + "'").join(', ');
    const frontendAntigens = item.antigenChains.map(chain => "'" + chain + "'").join(',');
    const frontendAntibodies = item.antibodyChains.map(chain => "'" + chain + "'").join(',');
    const basisPattern = escapeRegExp(item.basisText);

    assert.match(
      serverSource,
      new RegExp(`${item.routeId}: \\{[\\s\\S]*structuralBasis: '${basisPattern}'`)
    );
    assert.match(
      serverSource,
      new RegExp(item.routeId + ': \\{[\\s\\S]*antigenChains: \\[' + escapeRegExp(backendAntigens) + '\\]')
    );
    assert.match(
      serverSource,
      new RegExp(item.routeId + ': \\{[\\s\\S]*antibodyChains: \\[' + escapeRegExp(backendAntibodies) + '\\]')
    );

    assert.match(
      frontendSource,
      new RegExp(`${item.routeId}: \\{[\\s\\S]*structuralBasis: '${basisPattern}'`)
    );
    assert.match(
      frontendSource,
      new RegExp(item.routeId + ': \\{[\\s\\S]*antigenChains: \\[' + escapeRegExp(frontendAntigens) + '\\]')
    );
    assert.match(
      frontendSource,
      new RegExp(item.routeId + ': \\{[\\s\\S]*antibodyChains: \\[' + escapeRegExp(frontendAntibodies) + '\\]')
    );
  }
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

test('local 3D display presets keep plausible antigen-antibody spacing', () => {
  const pdbDir = path.join(ROOT, 'pdb');
  const files = fs.readdirSync(pdbDir)
    .filter(file => /-\d+\.pdb$/.test(file))
    .filter(file => {
      const text = readPdbText(path.join('pdb', file));
      return remarkChains(text, 904).length > 0 && remarkChains(text, 905).length > 0;
    })
    .sort();

  assert.ok(files.length >= 350, 'local display library should keep broad antigen-antibody preset coverage');
  for (const file of files) {
    assertPlausibleRoleGeometry(path.join('pdb', file), roleGeometryThresholds(file));
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

test('common real antigen-antibody library covers high-frequency user targets with verified chain roles', () => {
  for (const item of COMMON_REAL_COMPLEX_EXPECTATIONS) {
    const filename = path.join('pdb', item.prefix + '-01.pdb');
    const text = readPdbText(filename);
    const atoms = parsePdbAtoms(filename);
    const antigenChains = remarkChains(text, 904);
    const antibodyChains = remarkChains(text, 905);
    const counts = chainAtomCounts(atoms);
    const contacts = crossRoleContactSummary(atoms, antigenChains, antibodyChains);

    assert.match(text, item.basis, item.prefix + ' should keep the verified public structure source');
    assert.deepEqual(antigenChains, item.antigenChains, item.prefix + ' should mark the real antigen chain set');
    assert.deepEqual(antibodyChains, item.antibodyChains, item.prefix + ' should mark the real antibody chain set');
    for (const chain of item.antigenChains) {
      assert.ok((counts.get(chain) || 0) > 50, item.prefix + ' antigen chain ' + chain + ' should contain visible atoms');
    }
    for (const chain of item.antibodyChains) {
      assert.ok((counts.get(chain) || 0) > 800, item.prefix + ' antibody chain ' + chain + ' should contain a visible Fab chain');
    }
    assert.ok(contacts.contactPairs >= 50, item.prefix + ' should expose a visible antigen-antibody interface');
    assert.ok(contacts.minDistance >= 1.2 && contacts.minDistance <= 3.5, item.prefix + ' should have a plausible closest antigen-antibody contact');
  }
});
