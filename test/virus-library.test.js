const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const test = require('node:test');

const ROOT = path.resolve(__dirname, '..');
const MANIFEST_PATH = path.join(ROOT, 'pdb', 'virus-library-manifest.json');

function readManifest() {
  return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
}

function readModelText(model) {
  return fs.readFileSync(path.join(ROOT, model.localPath), 'utf8');
}

function atomCount(text) {
  return (text.match(/^ATOM/gm) || []).length;
}

test('virus library stores downloaded local PDB files for every manifest entry', () => {
  const manifest = readManifest();
  assert.equal(manifest.models.length, manifest.totalModels);
  for (const model of manifest.models) {
    const fullPath = path.join(ROOT, model.localPath);
    assert.ok(fs.existsSync(fullPath), `${model.file} should exist locally`);
    assert.ok(atomCount(fs.readFileSync(fullPath, 'utf8')) > 0, `${model.file} should contain ATOM records`);
  }
});

test('virus library PDBs are flattened for stable 3Dmol display', () => {
  const manifest = readManifest();
  for (const model of manifest.models) {
    const text = readModelText(model);
    assert.equal((text.match(/^MODEL/gm) || []).length, 0, `${model.file} should not keep MODEL blocks`);
    assert.equal((text.match(/^ENDMDL/gm) || []).length, 0, `${model.file} should not keep ENDMDL blocks`);
  }
});

test('influenza H9 uses the trimer biological assembly instead of a single protomer', () => {
  const manifest = readManifest();
  const h9 = manifest.models.find(model => model.group === 'Influenza' && model.subtype === 'H9');
  assert.ok(h9, 'H9 model should be present');
  assert.equal(h9.assemblyId, '2');
  assert.ok(atomCount(readModelText(h9)) > 10000, 'H9 should contain the trimer-scale assembly');
});

test('Nipah G uses an oligomeric display assembly instead of a monomeric head only', () => {
  const manifest = readManifest();
  const nipahG = manifest.models.find(model => model.group === 'Nipah virus' && model.antigen === 'G');
  assert.ok(nipahG, 'Nipah G model should be present');
  assert.equal(nipahG.pdbId, '8K0C');
  assert.match((nipahG.assembly?.oligomericStates || []).join('|'), /Hetero 8-mer/);
  assert.ok(atomCount(readModelText(nipahG)) > 12000, 'Nipah G should contain the oligomeric G-antibody assembly');
});
