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
  assert.ok(catalog.summary.pdbFileCount >= 465);
  assert.ok(catalog.summary.promptEligibleRoutePresetCount >= 30);
  assert.ok(catalog.summary.libraryAssetCount >= 86);

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

  const nectin4 = catalogEntryForFilename(catalog, 'NECTIN4-Fab-01.pdb');
  assert.ok(nectin4, 'NECTIN4-Fab-01 should be represented in the catalog');
  assert.equal(nectin4.target, 'Nectin-4');
  assert.equal(nectin4.organismTaxId, 9606);
  assert.equal(nectin4.aliasPrefix, 'NECTIN4-Fab');
  assert.deepEqual(nectin4.display.antigenChains, ['A']);
  assert.deepEqual(nectin4.display.antibodyChains, ['H', 'L']);

  const folr1 = catalogEntryForFilename(catalog, 'SOLIDLIB-HUMAN-FOLR1-RCSB-4KM6.pdb');
  assert.ok(folr1, 'solid-tumor FOLR1 asset should be represented in the catalog');
  assert.equal(folr1.target, 'FOLR1');
  assert.equal(folr1.organismTaxId, 9606);
  assert.equal(folr1.structureClass, 'experimental_antigen_only');
  assert.deepEqual(folr1.antigenChains, ['A']);
  assert.deepEqual(folr1.antibodyChains, []);

  const psma = catalogEntryForFilename(catalog, 'SOLIDLIB-HUMAN-PSMA-VHH-RCSB-9HLW.pdb');
  assert.ok(psma, 'solid-tumor PSMA asset should be represented in the catalog');
  assert.equal(psma.target, 'PSMA');
  assert.equal(psma.gene, 'FOLH1');
  assert.equal(psma.organismTaxId, 9606);
  assert.equal(psma.antibodyFormat, 'VHH');
  assert.equal(psma.structureClass, 'target_exact_nanobody_complex');
  assert.deepEqual(psma.antigenChains, ['A', 'E']);
  assert.deepEqual(psma.antibodyChains, ['H', 'Q']);

  const caix = catalogEntryForFilename(catalog, 'CAIX-Fab-01.pdb');
  assert.ok(caix, 'CAIX-Fab-01 should be represented in the catalog');
  assert.equal(caix.target, 'CAIX');
  assert.equal(caix.gene, 'CA9');
  assert.equal(caix.organismTaxId, 9606);
  assert.equal(caix.aliasPrefix, 'CAIX-Fab');
  assert.equal(caix.structureClass, 'target_exact_epitope_complex');
  assert.deepEqual(caix.display.antigenChains, ['P']);
  assert.deepEqual(caix.display.antibodyChains, ['H', 'L']);

  const epcam = catalogEntryForFilename(catalog, 'SOLIDLIB-HUMAN-EPCAM-SCFV-RCSB-6I07.pdb');
  assert.ok(epcam, 'solid-tumor EpCAM asset should be represented in the catalog');
  assert.equal(epcam.target, 'EpCAM');
  assert.equal(epcam.gene, 'EPCAM');
  assert.equal(epcam.organismTaxId, 9606);
  assert.equal(epcam.antibodyFormat, 'scFv');
  assert.equal(epcam.structureClass, 'target_exact_scfv_complex');
  assert.deepEqual(epcam.antigenChains, ['C', 'D']);
  assert.deepEqual(epcam.antibodyChains, ['A', 'B']);

  const supportList = buildStructureSupportPromptList(catalog);
  assert.match(supportList, /PD-L1\/CD274/);
  assert.match(supportList, /SARS-CoV-2 RBD\/S/);
  assert.match(supportList, /Influenza HA\/HA/);
  assert.match(supportList, /MUC1/);
  assert.match(supportList, /Mesothelin\/MSLN/);
  assert.match(supportList, /Claudin 18\.2\/CLDN18/);
  assert.match(supportList, /B7-H3\/CD276/);
  assert.match(supportList, /Nectin-4\/NECTIN4/);
  assert.match(supportList, /GPRC5D/);
  assert.match(supportList, /CEACAM5\/CEA/);
  assert.match(supportList, /CAIX\/CA9/);
  assert.match(supportList, /STEAP1/);
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
  assert.equal(map[normalizeStructureCatalogKey('CAIX')], 'renal_caix');
  assert.equal(map[normalizeStructureCatalogKey('CA9')], 'renal_caix');
  assert.equal(map[normalizeStructureCatalogKey('Nectin-4')], 'solid_tumor_nectin4');
  assert.equal(map[normalizeStructureCatalogKey('PVRL4')], 'solid_tumor_nectin4');
  assert.equal(map[normalizeStructureCatalogKey('GPRC5D')], 'heme_gprc5d');
  assert.equal(map[normalizeStructureCatalogKey('CEA')], 'solid_tumor_ceacam5');
  assert.equal(map[normalizeStructureCatalogKey('CEACAM5')], 'solid_tumor_ceacam5');
  assert.equal(map[normalizeStructureCatalogKey('STEAP1')], 'prostate_steap1');
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
