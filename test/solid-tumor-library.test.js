'use strict';

const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const test = require('node:test');

const ROOT = path.resolve(__dirname, '..');
const manifest = require('../pdb/solid-tumor-library-manifest.json');

function readModelText(model) {
  return fs.readFileSync(path.join(ROOT, 'pdb', model.filename), 'utf8');
}

test('solid-tumor asset library keeps exact local sources for non-routeable tumor targets', () => {
  assert.equal(manifest.schemaVersion, 1);
  assert.equal(manifest.totalModels, manifest.models.length);
  assert.equal(manifest.totalModels, 7);

  for (const model of manifest.models) {
    assert.ok(fs.existsSync(path.join(ROOT, 'pdb', model.filename)), model.filename + ' should exist locally');
    assert.equal(model.status, 'asset_only');
    assert.ok((model.sourceUrl || '').startsWith('https://files.rcsb.org/download/'));
    assert.ok((model.sourceEntryUrl || '').startsWith('https://www.rcsb.org/structure/'));
  }
});

test('solid-tumor antigen-only assets keep empty antibody chain remarks', () => {
  for (const filename of [
    'SOLIDLIB-HUMAN-FOLR1-RCSB-4KM6.pdb',
    'SOLIDLIB-HUMAN-FOLR1-RCSB-4KM7.pdb',
    'SOLIDLIB-HUMAN-FOLR1-RCSB-4KMX.pdb',
    'SOLIDLIB-HUMAN-CEACAM6-RCSB-4WHC.pdb'
  ]) {
    const text = fs.readFileSync(path.join(ROOT, 'pdb', filename), 'utf8');
    assert.match(text, /REMARK 901 TARGET: (FOLR1|CEACAM6)/);
    assert.match(text, /REMARK 910 ORGANISM: Homo sapiens/);
    assert.match(text, /REMARK 911 TAXID: 9606/);
    const antibodyLine = text.split(/\r?\n/).find(line => line.startsWith('REMARK 905 ANTIBODY CHAINS:'));
    assert.equal(Boolean(antibodyLine), true);
    assert.equal(antibodyLine.trim(), 'REMARK 905 ANTIBODY CHAINS:');
  }
});

test('solid-tumor non-Fab complexes keep truthful local chain-role remarks', () => {
  const psma = readModelText(manifest.models.find(model => model.accession === '9HLW'));
  assert.match(psma, /REMARK 901 TARGET: PSMA/);
  assert.match(psma, /REMARK 902 FORMAT: VHH/);
  assert.match(psma, /REMARK 904 ANTIGEN CHAINS: A,E/);
  assert.match(psma, /REMARK 905 ANTIBODY CHAINS: H,Q/);
  assert.match(psma, /REMARK 912 ACCESSION: 9HLW/);

  const gpc3 = readModelText(manifest.models.find(model => model.accession === '9NTQ'));
  assert.match(gpc3, /REMARK 901 TARGET: GPC3/);
  assert.match(gpc3, /REMARK 904 ANTIGEN CHAINS: A/);
  assert.match(gpc3, /REMARK 905 ANTIBODY CHAINS: B/);
  assert.match(gpc3, /REMARK 912 ACCESSION: 9NTQ/);
});
