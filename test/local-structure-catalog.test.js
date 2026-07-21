'use strict';

const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const test = require('node:test');
const {
  loadLocalStructureCatalog,
  buildStructureSupportPromptList,
  buildTargetRouteMapFromCatalog,
  catalogEntryForFilename,
  normalizeStructureCatalogKey,
  toClientStructureCatalog
} = require('../lib/local-structure-catalog');

const ROOT = path.resolve(__dirname, '..');

test('local structure catalog is the machine-readable inventory for route-backed models', () => {
  const catalog = loadLocalStructureCatalog(ROOT);
  assert.equal(catalog.schemaVersion, 1);
  assert.ok(catalog.summary.pdbFileCount >= 400);
  assert.ok(catalog.summary.promptEligibleRoutePresetCount >= 30);

  const covid = catalogEntryForFilename(catalog, 'SC2RBD-Fab-01.pdb');
  assert.ok(covid, 'SC2RBD-Fab-01 should be represented in the catalog');
  assert.equal(covid.target, 'SARS-CoV-2 RBD');
  assert.equal(covid.organismTaxId, 2697049);
  assert.equal(covid.aliasPrefix, 'SC2RBD-Fab');
  assert.deepEqual(covid.display.antigenChains, ['A']);
  assert.deepEqual(covid.display.antibodyChains, ['B', 'C']);

  const muc1 = catalogEntryForFilename(catalog, 'MUC1-Fab-01.pdb');
  assert.ok(muc1, 'MUC1-Fab-01 should be represented in the catalog');
  assert.equal(muc1.target, 'MUC1');
  assert.equal(muc1.organismTaxId, 9606);
  assert.equal(muc1.aliasPrefix, 'MUC1-Fab');
  assert.deepEqual(muc1.display.antigenChains, ['C']);
  assert.deepEqual(muc1.display.antibodyChains, ['A', 'B']);

  const supportList = buildStructureSupportPromptList(catalog);
  assert.match(supportList, /PD-L1\/CD274/);
  assert.match(supportList, /SARS-CoV-2 RBD\/S/);
  assert.match(supportList, /Influenza HA\/HA/);
  assert.match(supportList, /MUC1/);
  assert.match(supportList, /Mesothelin\/MSLN/);
  assert.match(supportList, /Claudin 18\.2\/CLDN18/);
  assert.match(supportList, /B7-H3\/CD276/);
});

test('catalog-derived target map can route aliases without hand-editing target maps', () => {
  const catalog = loadLocalStructureCatalog(ROOT);
  const map = buildTargetRouteMapFromCatalog(catalog);
  assert.equal(map[normalizeStructureCatalogKey('PD-L1')], 'tumor_immunotherapy');
  assert.equal(map[normalizeStructureCatalogKey('CD274')], 'tumor_immunotherapy');
  assert.equal(map[normalizeStructureCatalogKey('SARS-CoV-2 RBD')], 'infectious_covid');
  assert.equal(map[normalizeStructureCatalogKey('DAT1')], 'neuro_adhd_dat');
  assert.equal(map[normalizeStructureCatalogKey('MUC1')], 'solid_tumor_muc1');
  assert.equal(map[normalizeStructureCatalogKey('Mesothelin')], 'solid_tumor_mesothelin');
  assert.equal(map[normalizeStructureCatalogKey('MSLN')], 'solid_tumor_mesothelin');
  assert.equal(map[normalizeStructureCatalogKey('Claudin 18.2')], 'solid_tumor_cldn18');
  assert.equal(map[normalizeStructureCatalogKey('CLDN18')], 'solid_tumor_cldn18');
  assert.equal(map[normalizeStructureCatalogKey('B7-H3')], 'solid_tumor_b7h3');
  assert.equal(map[normalizeStructureCatalogKey('CD276')], 'solid_tumor_b7h3');
});

test('client generated structure catalog stays synchronized with JSON source', () => {
  const catalog = loadLocalStructureCatalog(ROOT);
  const expectedClient = toClientStructureCatalog(catalog);
  const script = fs.readFileSync(path.join(ROOT, 'public', 'local-structure-catalog.generated.js'), 'utf8');
  const sandbox = { window: {} };
  vm.runInNewContext(script, sandbox, { timeout: 1000 });
  const generated = sandbox.window.ZOONOAB_LOCAL_STRUCTURE_CATALOG;

  assert.ok(generated);
  assert.equal(generated.schemaVersion, expectedClient.schemaVersion);
  assert.equal(generated.routePresets.length, expectedClient.routePresets.length);
  assert.equal(
    JSON.stringify(generated.routePresets.map(item => item.routeId).sort()),
    JSON.stringify(expectedClient.routePresets.map(item => item.routeId).sort())
  );
  assert.equal(
    generated.routePresets.find(item => item.routeId === 'infectious_covid').target,
    'SARS-CoV-2 RBD'
  );
});
