'use strict';

const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const test = require('node:test');

const ROOT = path.resolve(__dirname, '..');
const manifest = require('../pdb/veterinary-library-manifest.json');

test('veterinary display library keeps exact canine target sources locally', () => {
  assert.equal(manifest.schemaVersion, 1);
  assert.equal(manifest.totalModels, manifest.models.length);
  assert.ok(manifest.totalModels >= 21);

  const expectedGenes = ['NGF', 'BDNF', 'NTF3', 'NTF4', 'IL6', 'TNF', 'TSLP', 'IL13', 'IL5', 'IL1B'];
  for (const gene of expectedGenes) {
    const model = manifest.models.find(item => item.gene === gene && item.organismTaxId === 9615 && item.structureClass === 'predicted_antigen');
    assert.ok(model, 'missing canine ' + gene + ' target model');
    assert.ok(fs.existsSync(path.join(ROOT, 'pdb', model.filename)), model.filename + ' should exist');
    assert.match(model.sourceUrl, /^https:\/\/alphafold\.ebi\.ac\.uk\//);
  }
});

test('canine NGF route stores ten target-tagged Fab display structures', () => {
  const candidates = manifest.models.filter(item => item.structureClass === 'target_exact_display_pose' && item.target === 'Canine NGF');
  assert.equal(candidates.length, 10);
  for (const candidate of candidates) {
    const text = fs.readFileSync(path.join(ROOT, 'pdb', candidate.filename), 'utf8');
    assert.match(text, /REMARK 901 TARGET: Canine NGF/);
    assert.match(text, /REMARK 910 ORGANISM: Canis lupus familiaris/);
    assert.match(text, /REMARK 911 TAXID: 9615/);
    assert.match(text, /REMARK 912 ACCESSION: A0A8I3PYI3/);
    assert.match(text, /REMARK 904 ANTIGEN CHAINS: A/);
    assert.match(text, /REMARK 905 ANTIBODY CHAINS: H,L/);
    assert.match(text, /HARD_CLASHES_LT_2_0A: 0/);
  }
});

test('NGF experimental reference remains clearly human and separate from canine coordinates', () => {
  const reference = manifest.models.find(item => item.accession === '4EDW');
  assert.ok(reference);
  assert.equal(reference.organismTaxId, 9606);
  assert.equal(reference.structureClass, 'experimental_reference_complex');
  assert.match(reference.context, /结构参考/);
});

test('raw canine antigen remarks keep the antibody chain list empty', () => {
  const text = fs.readFileSync(path.join(ROOT, 'pdb', 'VETLIB-DOG-NGF-AF-A0A8I3PYI3.pdb'), 'utf8');
  const antibodyLine = text.split(/\r?\n/).find(line => line.startsWith('REMARK 905 ANTIBODY CHAINS:'));
  assert.equal(antibodyLine, 'REMARK 905 ANTIBODY CHAINS:');
  assert.doesNotMatch(antibodyLine, /REMARK 906/);
});
