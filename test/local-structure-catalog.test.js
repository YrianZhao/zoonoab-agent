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

  const supportList = buildStructureSupportPromptList(catalog);
  assert.match(supportList, /PD-L1\/CD274/);
  assert.match(supportList, /SARS-CoV-2 RBD\/S/);
  assert.match(supportList, /Influenza HA\/HA/);
  assert.doesNotMatch(supportList, /MUC1/, 'MUC1 should not be advertised as locally structure-supported until route files are added');
});

test('catalog-derived target map can route aliases without hand-editing target maps', () => {
  const catalog = loadLocalStructureCatalog(ROOT);
  const map = buildTargetRouteMapFromCatalog(catalog);
  assert.equal(map[normalizeStructureCatalogKey('PD-L1')], 'tumor_immunotherapy');
  assert.equal(map[normalizeStructureCatalogKey('CD274')], 'tumor_immunotherapy');
  assert.equal(map[normalizeStructureCatalogKey('SARS-CoV-2 RBD')], 'infectious_covid');
  assert.equal(map[normalizeStructureCatalogKey('DAT1')], 'neuro_adhd_dat');
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
