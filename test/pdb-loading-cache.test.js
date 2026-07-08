const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const test = require('node:test');

const root = path.join(__dirname, '..');
const serverJs = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
const indexHtml = fs.readFileSync(path.join(root, 'public', 'index.html'), 'utf8');

test('PDB proxy caches remote structures for repeated analysis-panel loads', () => {
  assert.match(serverJs, /PDB_CACHE_TTL_MS/);
  assert.match(serverJs, /pdbResponseCache\s*=\s*new Map\(\)/);
  assert.match(serverJs, /Cache-Control['"],\s*'public,\s*max-age=/);
  assert.match(serverJs, /X-ZoonoAb-PDB-Cache/);
});

test('sequence analysis preview reuses and prefetches PDB text before rendering 3Dmol', () => {
  assert.match(indexHtml, /seqMolPdbTextCache\s*=\s*new Map\(\)/);
  assert.match(indexHtml, /seqMolPdbRequestCache\s*=\s*new Map\(\)/);
  assert.match(indexHtml, /function fetchSeqMolPdbText\(pdbId\)/);
  assert.match(indexHtml, /function preloadSeqMol3dPreview\(mol\)/);
  assert.match(indexHtml, /preloadSeqMol3dPreview\('nivolumab'\)/);
  assert.match(indexHtml, /fetchSeqMolPdbText\(pdbId\)\.then/);
});
