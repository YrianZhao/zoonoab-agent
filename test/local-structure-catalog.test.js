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
  assert.ok(catalog.summary.pdbFileCount >= 471);
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

  const il5 = catalogEntryForFilename(catalog, 'IL5-Fab-01.pdb');
  assert.ok(il5, 'IL5-Fab-01 should be represented in the catalog');
  assert.equal(il5.target, 'IL-5');
  assert.equal(il5.gene, 'IL5');
  assert.equal(il5.organismTaxId, 9606);
  assert.equal(il5.aliasPrefix, 'IL5-Fab');
  assert.equal(il5.structureClass, 'target_exact_complex');
  assert.deepEqual(il5.display.antigenChains, ['A', 'B']);
  assert.deepEqual(il5.display.antibodyChains, ['C', 'D', 'E', 'F']);

  const il13 = catalogEntryForFilename(catalog, 'IL13-Fab-01.pdb');
  assert.ok(il13, 'IL13-Fab-01 should be represented in the catalog');
  assert.equal(il13.target, 'IL-13');
  assert.equal(il13.gene, 'IL13');
  assert.equal(il13.organismTaxId, 9606);
  assert.equal(il13.aliasPrefix, 'IL13-Fab');
  assert.equal(il13.structureClass, 'target_exact_complex');
  assert.deepEqual(il13.display.antigenChains, ['C']);
  assert.deepEqual(il13.display.antibodyChains, ['H', 'L']);

  const cd123 = catalogEntryForFilename(catalog, 'CD123-Fab-01.pdb');
  assert.ok(cd123, 'CD123-Fab-01 should be represented in the catalog');
  assert.equal(cd123.target, 'CD123');
  assert.equal(cd123.gene, 'IL3RA');
  assert.equal(cd123.organismTaxId, 9606);
  assert.equal(cd123.aliasPrefix, 'CD123-Fab');
  assert.equal(cd123.structureClass, 'target_exact_domain_complex');
  assert.deepEqual(cd123.display.antigenChains, ['C', 'D']);
  assert.deepEqual(cd123.display.antibodyChains, ['A', 'B', 'H', 'L']);

  const cd33 = catalogEntryForFilename(catalog, 'CD33-Fab-01.pdb');
  assert.ok(cd33, 'CD33-Fab-01 should be represented in the catalog');
  assert.equal(cd33.target, 'CD33');
  assert.equal(cd33.gene, 'CD33');
  assert.equal(cd33.organismTaxId, 9606);
  assert.equal(cd33.aliasPrefix, 'CD33-Fab');
  assert.equal(cd33.structureClass, 'target_exact_domain_complex');
  assert.deepEqual(cd33.display.antigenChains, ['A', 'D']);
  assert.deepEqual(cd33.display.antibodyChains, ['B', 'C', 'E', 'F']);

  const baff = catalogEntryForFilename(catalog, 'BAFF-Fab-01.pdb');
  assert.ok(baff, 'BAFF-Fab-01 should be represented in the catalog');
  assert.equal(baff.target, 'BAFF');
  assert.equal(baff.gene, 'TNFSF13B');
  assert.equal(baff.organismTaxId, 9606);
  assert.equal(baff.aliasPrefix, 'BAFF-Fab');
  assert.equal(baff.structureClass, 'target_exact_complex');
  assert.deepEqual(baff.display.antigenChains, ['A', 'B', 'C']);
  assert.deepEqual(baff.display.antibodyChains, ['D', 'E', 'F', 'G', 'H', 'I']);

  const fcrn = catalogEntryForFilename(catalog, 'FCRN-Fab-01.pdb');
  assert.ok(fcrn, 'FCRN-Fab-01 should be represented in the catalog');
  assert.equal(fcrn.target, 'FcRn');
  assert.equal(fcrn.gene, 'FCGRT');
  assert.equal(fcrn.organismTaxId, 9606);
  assert.equal(fcrn.aliasPrefix, 'FCRN-Fab');
  assert.equal(fcrn.structureClass, 'target_exact_domain_complex');
  assert.deepEqual(fcrn.display.antigenChains, ['A', 'B']);
  assert.deepEqual(fcrn.display.antibodyChains, ['H', 'L']);

  const ngf = catalogEntryForFilename(catalog, 'NGF-Fab-01.pdb');
  assert.ok(ngf, 'NGF-Fab-01 should be represented in the catalog');
  assert.equal(ngf.target, 'NGF');
  assert.equal(ngf.gene, 'NGF');
  assert.equal(ngf.organismTaxId, 9606);
  assert.equal(ngf.aliasPrefix, 'NGF-Fab');
  assert.equal(ngf.structureClass, 'target_exact_complex');
  assert.deepEqual(ngf.display.antigenChains, ['V']);
  assert.deepEqual(ngf.display.antibodyChains, ['H', 'L']);

  const a4b7 = catalogEntryForFilename(catalog, 'A4B7-Fab-01.pdb');
  assert.ok(a4b7, 'A4B7-Fab-01 should be represented in the catalog');
  assert.equal(a4b7.target, 'Integrin α4β7');
  assert.equal(a4b7.gene, 'ITGA4 / ITGB7');
  assert.equal(a4b7.organismTaxId, 9606);
  assert.equal(a4b7.aliasPrefix, 'A4B7-Fab');
  assert.equal(a4b7.structureClass, 'target_exact_domain_complex');
  assert.deepEqual(a4b7.display.antigenChains, ['A', 'B']);
  assert.deepEqual(a4b7.display.antibodyChains, ['H', 'L']);

  const gpc2 = catalogEntryForFilename(catalog, 'GPC2-Fab-01.pdb');
  assert.ok(gpc2, 'GPC2-Fab-01 should be represented in the catalog');
  assert.equal(gpc2.target, 'GPC2');
  assert.equal(gpc2.gene, 'GPC2');
  assert.equal(gpc2.organismTaxId, 9606);
  assert.equal(gpc2.aliasPrefix, 'GPC2-Fab');
  assert.equal(gpc2.structureClass, 'target_exact_domain_complex');
  assert.deepEqual(gpc2.display.antigenChains, ['G']);
  assert.deepEqual(gpc2.display.antibodyChains, ['H', 'L']);
  assert.deepEqual(gpc2.display.sourceAntigenChains, ['E', 'G']);
  assert.deepEqual(gpc2.display.sourceAntibodyChains, ['F', 'H', 'I', 'J', 'K', 'L']);

  const abeta = catalogEntryForFilename(catalog, 'ABETA-Fab-01.pdb');
  assert.ok(abeta, 'ABETA-Fab-01 should be represented in the catalog');
  assert.equal(abeta.target, 'Amyloid-beta');
  assert.equal(abeta.gene, 'APP');
  assert.equal(abeta.organismTaxId, 9606);
  assert.equal(abeta.aliasPrefix, 'ABETA-Fab');
  assert.equal(abeta.structureClass, 'target_exact_epitope_complex');
  assert.deepEqual(abeta.display.antigenChains, ['A']);
  assert.deepEqual(abeta.display.antibodyChains, ['H', 'L']);

  const tau = catalogEntryForFilename(catalog, 'TAU-Fab-01.pdb');
  assert.ok(tau, 'TAU-Fab-01 should be represented in the catalog');
  assert.equal(tau.target, 'Tau');
  assert.equal(tau.gene, 'MAPT');
  assert.equal(tau.organismTaxId, 9606);
  assert.equal(tau.aliasPrefix, 'TAU-Fab');
  assert.equal(tau.structureClass, 'target_exact_epitope_complex');
  assert.deepEqual(tau.display.antigenChains, ['A']);
  assert.deepEqual(tau.display.antibodyChains, ['H', 'L']);

  const trem2 = catalogEntryForFilename(catalog, 'TREM2-Fab-01.pdb');
  assert.ok(trem2, 'TREM2-Fab-01 should be represented in the catalog');
  assert.equal(trem2.target, 'TREM2');
  assert.equal(trem2.gene, 'TREM2');
  assert.equal(trem2.organismTaxId, 9606);
  assert.equal(trem2.aliasPrefix, 'TREM2-Fab');
  assert.equal(trem2.structureClass, 'target_exact_epitope_complex');
  assert.deepEqual(trem2.display.antigenChains, ['A']);
  assert.deepEqual(trem2.display.antibodyChains, ['H', 'L']);

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
  assert.match(supportList, /IL-5\/IL5/);
  assert.match(supportList, /IL-13\/IL13/);
  assert.match(supportList, /CD123\/IL3RA/);
  assert.match(supportList, /CD33\/Siglec-3/);
  assert.match(supportList, /BAFF\/TNFSF13B/);
  assert.match(supportList, /FcRn\/FCGRT/);
  assert.match(supportList, /NGF/);
  assert.match(supportList, /Integrin α4β7\/ITGA4-ITGB7/);
  assert.match(supportList, /GPC2\/Glypican-2/);
  assert.match(supportList, /Amyloid-beta\/APP/);
  assert.match(supportList, /Tau\/MAPT/);
  assert.match(supportList, /TREM2/);
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
  assert.equal(map[normalizeStructureCatalogKey('IL-5')], 'allergic_il5');
  assert.equal(map[normalizeStructureCatalogKey('IL5')], 'allergic_il5');
  assert.equal(map[normalizeStructureCatalogKey('IL-13')], 'allergic_il13');
  assert.equal(map[normalizeStructureCatalogKey('IL13')], 'allergic_il13');
  assert.equal(map[normalizeStructureCatalogKey('CD123')], 'heme_cd123');
  assert.equal(map[normalizeStructureCatalogKey('IL3RA')], 'heme_cd123');
  assert.equal(map[normalizeStructureCatalogKey('CD33')], 'heme_cd33');
  assert.equal(map[normalizeStructureCatalogKey('Siglec-3')], 'heme_cd33');
  assert.equal(map[normalizeStructureCatalogKey('BAFF')], 'autoimmune_baff');
  assert.equal(map[normalizeStructureCatalogKey('TNFSF13B')], 'autoimmune_baff');
  assert.equal(map[normalizeStructureCatalogKey('FcRn')], 'autoimmune_fcrn');
  assert.equal(map[normalizeStructureCatalogKey('FCGRT')], 'autoimmune_fcrn');
  assert.equal(map[normalizeStructureCatalogKey('NGF')], 'pain_ngf');
  assert.equal(map[normalizeStructureCatalogKey('Canine NGF')], 'veterinary_canine_ngf');
  assert.equal(map[normalizeStructureCatalogKey('犬源 NGF')], 'veterinary_canine_ngf');
  assert.equal(map[normalizeStructureCatalogKey('Integrin α4β7')], 'ibd_a4b7');
  assert.equal(map[normalizeStructureCatalogKey('alpha4beta7')], 'ibd_a4b7');
  assert.equal(map[normalizeStructureCatalogKey('GPC2')], 'sclc_gpc2');
  assert.equal(map[normalizeStructureCatalogKey('Glypican-2')], 'sclc_gpc2');
  assert.equal(map[normalizeStructureCatalogKey('Amyloid-beta')], 'neuro_alz_abeta');
  assert.equal(map[normalizeStructureCatalogKey('APP')], 'neuro_alz_abeta');
  assert.equal(map[normalizeStructureCatalogKey('Tau')], 'neuro_alz_tau');
  assert.equal(map[normalizeStructureCatalogKey('MAPT')], 'neuro_alz_tau');
  assert.equal(map[normalizeStructureCatalogKey('TREM2')], 'neuro_alz_trem2');
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
