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

test('IL-33 allergic asthma preset uses a real Fab complex without cross-chain hard clashes', () => {
  const atoms = parsePdbAtoms('pdb/IL33-Fab-01.pdb');
  const counts = chainAtomCounts(atoms);

  assert.ok(atoms.length > 3000, 'IL33-Fab-01 should contain a full antigen-Fab complex');
  assert.ok((counts.get('A') || 0) > 500, 'chain A should contain the IL-33 antigen');
  assert.ok((counts.get('B') || 0) > 1000, 'chain B should contain the Fab heavy chain');
  assert.ok((counts.get('C') || 0) > 900, 'chain C should contain the Fab light chain');

  const clashes = crossChainClashSummary(atoms);
  assert.equal(clashes.hardClashes, 0, 'IL33-Fab-01 should have no cross-chain atom pairs below 1.2 A');
  assert.ok(clashes.minDistance > 1.2, 'closest cross-chain atom distance should be physically plausible');
});
