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

function coordinateChains(filename) {
  const chains = new Set();
  const text = fs.readFileSync(path.join(ROOT, 'pdb', filename), 'utf8');
  for (const line of text.split(/\r?\n/)) {
    if (line.startsWith('ATOM  ') || line.startsWith('HETATM')) chains.add(line[21]);
  }
  return chains;
}

test('local structure catalog is the machine-readable inventory for route-backed models', () => {
  const catalog = loadLocalStructureCatalog(ROOT);
  assert.equal(catalog.schemaVersion, 1);
  assert.ok(catalog.summary.pdbFileCount >= 516);
  assert.ok(catalog.summary.promptEligibleRoutePresetCount >= 30);
  assert.ok(catalog.summary.libraryAssetCount >= 273);

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

  const mslnEpitope = catalogEntryForFilename(catalog, 'SOLIDLIB-HUMAN-MSLN-FAB-RCSB-4F3F.pdb');
  assert.ok(mslnEpitope, 'solid-tumor Mesothelin epitope Fab asset should be represented in the catalog');
  assert.equal(mslnEpitope.target, 'Mesothelin');
  assert.equal(mslnEpitope.gene, 'MSLN');
  assert.equal(mslnEpitope.organismTaxId, 9606);
  assert.equal(mslnEpitope.antibodyFormat, 'Fab');
  assert.equal(mslnEpitope.structureClass, 'target_exact_epitope_complex');
  assert.deepEqual(mslnEpitope.antigenChains, ['C']);
  assert.deepEqual(mslnEpitope.antibodyChains, ['A', 'B']);

  const mslnVh = catalogEntryForFilename(catalog, 'SOLIDLIB-HUMAN-MSLN-VH-RCSB-8FSL.pdb');
  assert.ok(mslnVh, 'solid-tumor Mesothelin VH asset should be represented in the catalog');
  assert.equal(mslnVh.target, 'Mesothelin');
  assert.equal(mslnVh.gene, 'MSLN');
  assert.equal(mslnVh.organismTaxId, 9606);
  assert.equal(mslnVh.antibodyFormat, 'VH');
  assert.equal(mslnVh.structureClass, 'target_exact_complex');
  assert.deepEqual(mslnVh.antigenChains, ['E']);
  assert.deepEqual(mslnVh.antibodyChains, ['A']);
  assert.deepEqual(mslnVh.sourceAntigenChains, ['E', 'F']);
  assert.deepEqual(mslnVh.sourceAntibodyChains, ['A', 'B', 'C', 'D']);

  const psma = catalogEntryForFilename(catalog, 'SOLIDLIB-HUMAN-PSMA-VHH-RCSB-9HLW.pdb');
  assert.ok(psma, 'solid-tumor PSMA asset should be represented in the catalog');
  assert.equal(psma.target, 'PSMA');
  assert.equal(psma.gene, 'FOLH1');
  assert.equal(psma.organismTaxId, 9606);
  assert.equal(psma.antibodyFormat, 'VHH');
  assert.equal(psma.structureClass, 'target_exact_nanobody_complex');
  assert.deepEqual(psma.antigenChains, ['A', 'E']);
  assert.deepEqual(psma.antibodyChains, ['H', 'Q']);

  const psma8 = catalogEntryForFilename(catalog, 'SOLIDLIB-HUMAN-PSMA-VHH-RCSB-9HVI.pdb');
  assert.ok(psma8, 'solid-tumor PSMA nanobody 8 asset should be represented in the catalog');
  assert.equal(psma8.target, 'PSMA');
  assert.equal(psma8.gene, 'FOLH1');
  assert.equal(psma8.organismTaxId, 9606);
  assert.equal(psma8.antibodyFormat, 'VHH');
  assert.equal(psma8.structureClass, 'target_exact_nanobody_complex');
  assert.deepEqual(psma8.antigenChains, ['A', 'E']);
  assert.deepEqual(psma8.antibodyChains, ['H', 'Q']);

  const psma37 = catalogEntryForFilename(catalog, 'SOLIDLIB-HUMAN-PSMA-VHH-RCSB-9HVL.pdb');
  assert.ok(psma37, 'solid-tumor PSMA nanobody 37 asset should be represented in the catalog');
  assert.equal(psma37.target, 'PSMA');
  assert.equal(psma37.gene, 'FOLH1');
  assert.equal(psma37.organismTaxId, 9606);
  assert.equal(psma37.antibodyFormat, 'VHH');
  assert.equal(psma37.structureClass, 'target_exact_nanobody_complex');
  assert.deepEqual(psma37.antigenChains, ['A', 'E']);
  assert.deepEqual(psma37.antibodyChains, ['H', 'P']);
  assert.deepEqual(psma37.sourceAntibodyChains, ['H', 'P']);

  const psmaDual = catalogEntryForFilename(catalog, 'SOLIDLIB-HUMAN-PSMA-VHH-RCSB-9HVK.pdb');
  assert.ok(psmaDual, 'solid-tumor PSMA dual-nanobody asset should be represented in the catalog');
  assert.equal(psmaDual.target, 'PSMA');
  assert.equal(psmaDual.gene, 'FOLH1');
  assert.equal(psmaDual.organismTaxId, 9606);
  assert.equal(psmaDual.antibodyFormat, 'VHH');
  assert.equal(psmaDual.structureClass, 'target_exact_nanobody_complex');
  assert.deepEqual(psmaDual.antigenChains, ['A', 'E']);
  assert.deepEqual(psmaDual.antibodyChains, ['H', 'Q', 'M', 'P']);
  assert.deepEqual(psmaDual.sourceAntibodyChains, ['H', 'Q', 'M', 'P']);

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

  const cd22 = catalogEntryForFilename(catalog, 'CD22-Fab-01.pdb');
  assert.ok(cd22, 'CD22-Fab-01 should be represented in the catalog');
  assert.equal(cd22.target, 'CD22');
  assert.equal(cd22.gene, 'CD22');
  assert.equal(cd22.organismTaxId, 9606);
  assert.equal(cd22.aliasPrefix, 'CD22-Fab');
  assert.equal(cd22.structureClass, 'target_exact_domain_complex');
  assert.deepEqual(cd22.display.antigenChains, ['Q']);
  assert.deepEqual(cd22.display.antibodyChains, ['H', 'L']);
  assert.deepEqual(cd22.display.sourceAntigenChains, ['Q', 'R', 'S', 'T']);
  assert.deepEqual(cd22.display.sourceAntibodyChains, ['A', 'B', 'C', 'D', 'E', 'F', 'H', 'L']);

  const b7h6 = catalogEntryForFilename(catalog, 'B7H6-Fab-01.pdb');
  assert.ok(b7h6, 'B7H6-Fab-01 should be represented in the catalog');
  assert.equal(b7h6.target, 'B7-H6');
  assert.equal(b7h6.gene, 'NCR3LG1');
  assert.equal(b7h6.organismTaxId, 9606);
  assert.equal(b7h6.aliasPrefix, 'B7H6-Fab');
  assert.equal(b7h6.structureClass, 'target_exact_domain_complex');
  assert.deepEqual(b7h6.display.antigenChains, ['E']);
  assert.deepEqual(b7h6.display.antibodyChains, ['A', 'B']);
  assert.deepEqual(b7h6.display.sourceAntigenChains, ['E', 'F']);
  assert.deepEqual(b7h6.display.sourceAntibodyChains, ['A', 'B', 'C', 'D']);

  const metRoute = catalogEntryForFilename(catalog, 'MET-Fab-01.pdb');
  assert.ok(metRoute, 'MET-Fab-01 should be represented in the catalog');
  assert.equal(metRoute.target, 'MET');
  assert.equal(metRoute.gene, 'MET');
  assert.equal(metRoute.organismTaxId, 9606);
  assert.equal(metRoute.aliasPrefix, 'MET-Fab');
  assert.equal(metRoute.structureClass, 'target_exact_domain_complex');
  assert.deepEqual(metRoute.display.antigenChains, ['A']);
  assert.deepEqual(metRoute.display.antibodyChains, ['H', 'L']);
  assert.deepEqual(metRoute.display.sourceAntigenChains, ['A', 'B']);
  assert.deepEqual(metRoute.display.sourceAntibodyChains, ['H', 'L', 'C', 'D']);

  const her3Route = catalogEntryForFilename(catalog, 'HER3-Fab-01.pdb');
  assert.ok(her3Route, 'HER3-Fab-01 should be represented in the catalog');
  assert.equal(her3Route.target, 'HER3');
  assert.equal(her3Route.gene, 'ERBB3');
  assert.equal(her3Route.organismTaxId, 9606);
  assert.equal(her3Route.aliasPrefix, 'HER3-Fab');
  assert.equal(her3Route.structureClass, 'target_exact_domain_complex');
  assert.deepEqual(her3Route.display.antigenChains, ['A']);
  assert.deepEqual(her3Route.display.antibodyChains, ['B', 'C']);
  assert.deepEqual(her3Route.display.sourceAntigenChains, ['A', 'D']);
  assert.deepEqual(her3Route.display.sourceAntibodyChains, ['B', 'C', 'E', 'F']);

  const fgfr3Route = catalogEntryForFilename(catalog, 'FGFR3-Fab-01.pdb');
  assert.ok(fgfr3Route, 'FGFR3-Fab-01 should be represented in the catalog');
  assert.equal(fgfr3Route.target, 'FGFR3');
  assert.equal(fgfr3Route.gene, 'FGFR3');
  assert.equal(fgfr3Route.organismTaxId, 9606);
  assert.equal(fgfr3Route.aliasPrefix, 'FGFR3-Fab');
  assert.equal(fgfr3Route.structureClass, 'target_exact_domain_complex');
  assert.deepEqual(fgfr3Route.display.antigenChains, ['A']);
  assert.deepEqual(fgfr3Route.display.antibodyChains, ['H', 'L']);
  assert.deepEqual(fgfr3Route.display.sourceAntigenChains, ['A']);
  assert.deepEqual(fgfr3Route.display.sourceAntibodyChains, ['H', 'L']);

  const fgfr2Route = catalogEntryForFilename(catalog, 'FGFR2-Fab-01.pdb');
  assert.ok(fgfr2Route, 'FGFR2-Fab-01 should be represented in the catalog');
  assert.equal(fgfr2Route.target, 'FGFR2');
  assert.equal(fgfr2Route.gene, 'FGFR2');
  assert.equal(fgfr2Route.organismTaxId, 9606);
  assert.equal(fgfr2Route.aliasPrefix, 'FGFR2-Fab');
  assert.equal(fgfr2Route.structureClass, 'target_exact_domain_complex');
  assert.deepEqual(fgfr2Route.display.antigenChains, ['C']);
  assert.deepEqual(fgfr2Route.display.antibodyChains, ['A', 'B']);
  assert.deepEqual(fgfr2Route.display.sourceAntigenChains, ['C', 'F']);
  assert.deepEqual(fgfr2Route.display.sourceAntibodyChains, ['A', 'B', 'D', 'E']);

  const il6Route = catalogEntryForFilename(catalog, 'IL6-Fab-01.pdb');
  assert.ok(il6Route, 'IL6-Fab-01 should be represented in the catalog');
  assert.equal(il6Route.target, 'IL-6');
  assert.equal(il6Route.gene, 'IL6');
  assert.equal(il6Route.organismTaxId, 9606);
  assert.equal(il6Route.aliasPrefix, 'IL6-Fab');
  assert.equal(il6Route.structureClass, 'target_exact_complex');
  assert.deepEqual(il6Route.display.antigenChains, ['A']);
  assert.deepEqual(il6Route.display.antibodyChains, ['H', 'L']);
  assert.deepEqual(il6Route.display.sourceAntigenChains, ['A']);
  assert.deepEqual(il6Route.display.sourceAntibodyChains, ['H', 'L']);

  const mstnRoute = catalogEntryForFilename(catalog, 'MSTN-Fab-01.pdb');
  assert.ok(mstnRoute, 'MSTN-Fab-01 should be represented in the catalog');
  assert.equal(mstnRoute.target, 'Myostatin');
  assert.equal(mstnRoute.gene, 'GDF8');
  assert.equal(mstnRoute.organismTaxId, 9606);
  assert.equal(mstnRoute.aliasPrefix, 'MSTN-Fab');
  assert.equal(mstnRoute.structureClass, 'target_exact_complex');
  assert.deepEqual(mstnRoute.display.antigenChains, ['I', 'J']);
  assert.deepEqual(mstnRoute.display.antibodyChains, ['A', 'B', 'C', 'D']);
  assert.deepEqual(mstnRoute.display.sourceAntigenChains, ['I', 'J', 'K', 'L']);
  assert.deepEqual(mstnRoute.display.sourceAntibodyChains, ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']);

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

  const trkbRoute = catalogEntryForFilename(catalog, 'TRKB-Fab-01.pdb');
  assert.ok(trkbRoute, 'TRKB-Fab-01 should be represented in the catalog');
  assert.equal(trkbRoute.target, 'TrkB');
  assert.equal(trkbRoute.gene, 'NTRK2');
  assert.equal(trkbRoute.organismTaxId, 9606);
  assert.equal(trkbRoute.aliasPrefix, 'TRKB-Fab');
  assert.equal(trkbRoute.structureClass, 'target_exact_domain_complex');
  assert.deepEqual(trkbRoute.display.antigenChains, ['X']);
  assert.deepEqual(trkbRoute.display.antibodyChains, ['H', 'L']);
  assert.deepEqual(trkbRoute.display.sourceAntigenChains, ['X']);
  assert.deepEqual(trkbRoute.display.sourceAntibodyChains, ['H', 'L']);

  const igf1r = catalogEntryForFilename(catalog, 'ENDOCRINELIB-HUMAN-IGF1R-RCSB-7XGD.pdb');
  assert.ok(igf1r, 'endocrine-library IGF1R asset should be represented in the catalog');
  assert.equal(igf1r.target, 'IGF1R');
  assert.equal(igf1r.gene, 'IGF1R');
  assert.equal(igf1r.organismTaxId, 9606);
  assert.equal(igf1r.structureClass, 'experimental_antigen_only');
  assert.deepEqual(igf1r.antigenChains, ['A', 'B']);
  assert.deepEqual(igf1r.antibodyChains, []);

  const igf1rFv = catalogEntryForFilename(catalog, 'ENDOCRINELIB-HUMAN-IGF1R-FV-RCSB-5U8R.pdb');
  assert.ok(igf1rFv, 'endocrine-library IGF1R Fv asset should be represented in the catalog');
  assert.equal(igf1rFv.target, 'IGF1R');
  assert.equal(igf1rFv.gene, 'IGF1R');
  assert.equal(igf1rFv.organismTaxId, 9606);
  assert.equal(igf1rFv.structureClass, 'experimental_reference_complex');
  assert.equal(igf1rFv.antibodyFormat, 'Fv');
  assert.deepEqual(igf1rFv.antigenChains, ['A']);
  assert.deepEqual(igf1rFv.antibodyChains, ['H', 'L']);
  assert.deepEqual(igf1rFv.sourceAntigenChains, ['A']);
  assert.deepEqual(igf1rFv.sourceAntibodyChains, ['H', 'L']);
  assert.match(igf1rFv.structuralBasis, /5U8R/);

  const glp1r = catalogEntryForFilename(catalog, 'ENDOCRINELIB-HUMAN-GLP1R-RCSB-6LN2.pdb');
  assert.ok(glp1r, 'endocrine-library GLP1R asset should be represented in the catalog');
  assert.equal(glp1r.target, 'GLP1R');
  assert.equal(glp1r.gene, 'GLP1R');
  assert.equal(glp1r.organismTaxId, 9606);
  assert.equal(glp1r.structureClass, 'experimental_reference_complex');
  assert.equal(glp1r.antibodyFormat, 'Fab');
  assert.deepEqual(glp1r.antigenChains, ['A']);
  assert.deepEqual(glp1r.antibodyChains, ['B', 'C']);

  const myostatin = catalogEntryForFilename(catalog, 'METABOLIB-HUMAN-MSTN-FAB-RCSB-5F3H.pdb');
  assert.ok(myostatin, 'metabolic-library Myostatin asset should be represented in the catalog');
  assert.equal(myostatin.target, 'Myostatin');
  assert.equal(myostatin.gene, 'GDF8');
  assert.equal(myostatin.organismTaxId, 9606);
  assert.equal(myostatin.structureClass, 'target_exact_complex');
  assert.equal(myostatin.antibodyFormat, 'Fab');
  assert.deepEqual(myostatin.antigenChains, ['I', 'J']);
  assert.deepEqual(myostatin.antibodyChains, ['A', 'B', 'C', 'D']);
  assert.deepEqual(myostatin.sourceAntigenChains, ['I', 'J', 'K', 'L']);
  assert.deepEqual(myostatin.sourceAntibodyChains, ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']);

  const actriib = catalogEntryForFilename(catalog, 'METABOLIB-HUMAN-ACTRIIB-FV-RCSB-5NHR.pdb');
  assert.ok(actriib, 'metabolic-library ActRIIB asset should be represented in the catalog');
  assert.equal(actriib.target, 'ActRIIB');
  assert.equal(actriib.gene, 'ACVR2B');
  assert.equal(actriib.organismTaxId, 9606);
  assert.equal(actriib.structureClass, 'target_exact_fv_complex');
  assert.equal(actriib.antibodyFormat, 'Fv');
  assert.deepEqual(actriib.antigenChains, ['C', 'D']);
  assert.deepEqual(actriib.antibodyChains, ['A', 'B', 'H', 'L']);

  const trkb = catalogEntryForFilename(catalog, 'NEUROLIB-HUMAN-TRKB-FAB-RCSB-5MO9.pdb');
  assert.ok(trkb, 'neuro-library TrkB Fab asset should be represented in the catalog');
  assert.equal(trkb.target, 'TrkB');
  assert.equal(trkb.gene, 'NTRK2');
  assert.equal(trkb.organismTaxId, 9606);
  assert.equal(trkb.structureClass, 'experimental_reference_complex');
  assert.equal(trkb.antibodyFormat, 'Fab');
  assert.deepEqual(trkb.antigenChains, ['X']);
  assert.deepEqual(trkb.antibodyChains, ['H', 'L']);
  assert.deepEqual(trkb.sourceAntigenChains, ['X']);
  assert.deepEqual(trkb.sourceAntibodyChains, ['H', 'L']);
  assert.match(trkb.structuralBasis, /5MO9/);

  const met = catalogEntryForFilename(catalog, 'SOLIDLIB-HUMAN-MET-FAB-RCSB-6I04.pdb');
  assert.ok(met, 'solid-tumor MET Fab asset should be represented in the catalog');
  assert.equal(met.target, 'MET');
  assert.equal(met.gene, 'MET');
  assert.equal(met.organismTaxId, 9606);
  assert.equal(met.structureClass, 'target_exact_domain_complex');
  assert.equal(met.antibodyFormat, 'Fab');
  assert.deepEqual(met.antigenChains, ['A']);
  assert.deepEqual(met.antibodyChains, ['H', 'L']);
  assert.deepEqual(met.sourceAntigenChains, ['A', 'B']);
  assert.deepEqual(met.sourceAntibodyChains, ['H', 'L', 'C', 'D']);
  assert.match(met.structuralBasis, /6I04/);

  const her3 = catalogEntryForFilename(catalog, 'SOLIDLIB-HUMAN-HER3-FAB-RCSB-7D85.pdb');
  assert.ok(her3, 'solid-tumor HER3 Fab asset should be represented in the catalog');
  assert.equal(her3.target, 'HER3');
  assert.equal(her3.gene, 'ERBB3');
  assert.equal(her3.organismTaxId, 9606);
  assert.equal(her3.structureClass, 'target_exact_domain_complex');
  assert.equal(her3.antibodyFormat, 'Fab');
  assert.deepEqual(her3.antigenChains, ['A']);
  assert.deepEqual(her3.antibodyChains, ['B', 'C']);
  assert.deepEqual(her3.sourceAntigenChains, ['A', 'D']);
  assert.deepEqual(her3.sourceAntibodyChains, ['B', 'C', 'E', 'F']);
  assert.match(her3.structuralBasis, /7D85/);

  const fgfr3 = catalogEntryForFilename(catalog, 'SOLIDLIB-HUMAN-FGFR3-FAB-RCSB-3GRW.pdb');
  assert.ok(fgfr3, 'solid-tumor FGFR3 Fab asset should be represented in the catalog');
  assert.equal(fgfr3.target, 'FGFR3');
  assert.equal(fgfr3.gene, 'FGFR3');
  assert.equal(fgfr3.organismTaxId, 9606);
  assert.equal(fgfr3.structureClass, 'target_exact_domain_complex');
  assert.equal(fgfr3.antibodyFormat, 'Fab');
  assert.deepEqual(fgfr3.antigenChains, ['A']);
  assert.deepEqual(fgfr3.antibodyChains, ['H', 'L']);
  assert.deepEqual(fgfr3.sourceAntigenChains, ['A']);
  assert.deepEqual(fgfr3.sourceAntibodyChains, ['H', 'L']);
  assert.match(fgfr3.structuralBasis, /3GRW/);

  const fgfr2 = catalogEntryForFilename(catalog, 'SOLIDLIB-HUMAN-FGFR2-FAB-RCSB-4WV1.pdb');
  assert.ok(fgfr2, 'solid-tumor FGFR2 Fab asset should be represented in the catalog');
  assert.equal(fgfr2.target, 'FGFR2');
  assert.equal(fgfr2.gene, 'FGFR2');
  assert.equal(fgfr2.organismTaxId, 9606);
  assert.equal(fgfr2.structureClass, 'target_exact_domain_complex');
  assert.equal(fgfr2.antibodyFormat, 'Fab');
  assert.deepEqual(fgfr2.antigenChains, ['C']);
  assert.deepEqual(fgfr2.antibodyChains, ['A', 'B']);
  assert.deepEqual(fgfr2.sourceAntigenChains, ['C', 'F']);
  assert.deepEqual(fgfr2.sourceAntibodyChains, ['A', 'B', 'D', 'E']);
  assert.match(fgfr2.structuralBasis, /4WV1/);

  const cd70 = catalogEntryForFilename(catalog, 'SOLIDLIB-HUMAN-CD70-RCSB-7KX0.pdb');
  assert.ok(cd70, 'solid-tumor CD70 reference asset should be represented in the catalog');
  assert.equal(cd70.target, 'CD70');
  assert.equal(cd70.gene, 'TNFSF7');
  assert.equal(cd70.organismTaxId, 9606);
  assert.equal(cd70.structureClass, 'experimental_reference_complex');
  assert.deepEqual(cd70.antigenChains, ['A', 'B', 'C']);
  assert.deepEqual(cd70.antibodyChains, []);
  assert.match(cd70.structuralBasis, /7KX0/);

  const il6 = catalogEntryForFilename(catalog, 'INFLAMLIB-HUMAN-IL6-RCSB-1ALU.pdb');
  assert.ok(il6, 'inflammation-library IL-6 antigen-only asset should be represented in the catalog');
  assert.equal(il6.target, 'IL-6');
  assert.equal(il6.gene, 'IL6');
  assert.equal(il6.organismTaxId, 9606);
  assert.equal(il6.structureClass, 'experimental_antigen_only');
  assert.deepEqual(il6.antigenChains, ['A']);
  assert.deepEqual(il6.antibodyChains, []);

  const il6Fab = catalogEntryForFilename(catalog, 'INFLAMLIB-HUMAN-IL6-FAB-RCSB-4ZS7.pdb');
  assert.ok(il6Fab, 'inflammation-library IL-6 Fab asset should be represented in the catalog');
  assert.equal(il6Fab.target, 'IL-6');
  assert.equal(il6Fab.gene, 'IL6');
  assert.equal(il6Fab.organismTaxId, 9606);
  assert.equal(il6Fab.structureClass, 'target_exact_complex');
  assert.equal(il6Fab.antibodyFormat, 'Fab');
  assert.deepEqual(il6Fab.antigenChains, ['A']);
  assert.deepEqual(il6Fab.antibodyChains, ['H', 'L']);

  const lrrk2 = catalogEntryForFilename(catalog, 'NEUROLIB-HUMAN-LRRK2-RCSB-7LHT.pdb');
  assert.ok(lrrk2, 'neuro-library LRRK2 asset should be represented in the catalog');
  assert.equal(lrrk2.target, 'LRRK2');
  assert.equal(lrrk2.gene, 'LRRK2');
  assert.equal(lrrk2.organismTaxId, 9606);
  assert.equal(lrrk2.structureClass, 'experimental_antigen_only');
  assert.deepEqual(lrrk2.antigenChains, ['A', 'B']);
  assert.deepEqual(lrrk2.antibodyChains, []);

  const drd4 = catalogEntryForFilename(catalog, 'NEUROLIB-HUMAN-DRD4-RCSB-5WIU.pdb');
  assert.ok(drd4, 'neuro-library DRD4 asset should be represented in the catalog');
  assert.equal(drd4.target, 'DRD4');
  assert.equal(drd4.gene, 'DRD4');
  assert.equal(drd4.organismTaxId, 9606);
  assert.equal(drd4.structureClass, 'experimental_antigen_only');
  assert.deepEqual(drd4.antigenChains, ['A']);
  assert.deepEqual(drd4.antibodyChains, []);

  const gba = catalogEntryForFilename(catalog, 'NEUROLIB-HUMAN-GBA-RCSB-1OGS.pdb');
  assert.ok(gba, 'neuro-library GBA asset should be represented in the catalog');
  assert.equal(gba.target, 'GBA');
  assert.equal(gba.gene, 'GBA1');
  assert.equal(gba.organismTaxId, 9606);
  assert.equal(gba.structureClass, 'experimental_antigen_only');
  assert.deepEqual(gba.antigenChains, ['A', 'B']);
  assert.deepEqual(gba.antibodyChains, []);

  const tshr = catalogEntryForFilename(catalog, 'TSHR-Fab-01.pdb');
  assert.ok(tshr, 'TSHR-Fab-01 should be represented in the catalog');
  assert.equal(tshr.target, 'TSHR');
  assert.equal(tshr.gene, 'TSHR');
  assert.equal(tshr.organismTaxId, 9606);
  assert.equal(tshr.aliasPrefix, 'TSHR-Fab');
  assert.equal(tshr.structureClass, 'target_exact_complex');
  assert.deepEqual(tshr.display.antigenChains, ['R']);
  assert.deepEqual(tshr.display.antibodyChains, ['H', 'L']);

  const snca = catalogEntryForFilename(catalog, 'SNCA-Fab-01.pdb');
  assert.ok(snca, 'SNCA-Fab-01 should be represented in the catalog');
  assert.equal(snca.target, 'alpha-synuclein');
  assert.equal(snca.gene, 'SNCA');
  assert.equal(snca.organismTaxId, 9606);
  assert.equal(snca.aliasPrefix, 'SNCA-Fab');
  assert.equal(snca.structureClass, 'target_exact_epitope_complex');
  assert.deepEqual(snca.display.antigenChains, ['P']);
  assert.deepEqual(snca.display.antibodyChains, ['H', 'L']);

  const aqp4 = catalogEntryForFilename(catalog, 'AQP4-Fab-01.pdb');
  assert.ok(aqp4, 'AQP4-Fab-01 should be represented in the catalog');
  assert.equal(aqp4.target, 'AQP4');
  assert.equal(aqp4.gene, 'AQP4');
  assert.equal(aqp4.organismTaxId, 9606);
  assert.equal(aqp4.aliasPrefix, 'AQP4-Fab');
  assert.equal(aqp4.structureClass, 'target_exact_complex');
  assert.deepEqual(aqp4.display.antigenChains, ['A', 'B', 'C', 'D']);
  assert.deepEqual(aqp4.display.antibodyChains, ['J', 'I']);

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
  assert.match(supportList, /CD22\/Siglec-2/);
  assert.match(supportList, /BAFF\/TNFSF13B/);
  assert.match(supportList, /FcRn\/FCGRT/);
  assert.match(supportList, /NGF/);
  assert.match(supportList, /Integrin α4β7\/ITGA4-ITGB7/);
  assert.match(supportList, /GPC2\/Glypican-2/);
  assert.match(supportList, /B7-H6\/NCR3LG1/);
  assert.match(supportList, /MET\/c-MET/);
  assert.match(supportList, /HER3\/ERBB3/);
  assert.match(supportList, /FGFR3/);
  assert.match(supportList, /FGFR2\/KGFR/);
  assert.match(supportList, /IL-6\/IL6/);
  assert.match(supportList, /Myostatin\/GDF8/);
  assert.match(supportList, /Amyloid-beta\/APP/);
  assert.match(supportList, /Tau\/MAPT/);
  assert.match(supportList, /TREM2/);
  assert.match(supportList, /TrkB\/NTRK2/);
  assert.match(supportList, /TSHR/);
  assert.match(supportList, /alpha-synuclein\/SNCA/);
  assert.match(supportList, /AQP4/);
});

test('virus library display roles match the flattened biological assembly chains', () => {
  const catalog = loadLocalStructureCatalog(ROOT);
  const expected = {
    'VIRUSLIB-FLU-HA-H07-8TNL.pdb': { antigen: ['C', 'D', 'E'], antibody: ['A', 'B', 'F', 'G', 'H', 'I'] },
    'VIRUSLIB-SC2-SPIKE-D614G-7WZ2.pdb': { antigen: ['A', 'B', 'C'], antibody: [] },
    'VIRUSLIB-NIPAH-F-PREFUSION-8DO4.pdb': { antigen: ['A', 'B', 'C', 'D', 'E', 'F'], antibody: [] },
    'VIRUSLIB-RSV-A-F-PREFUSION-5W23.pdb': { antigen: ['A', 'B', 'C'], antibody: ['D', 'E', 'F', 'G', 'H', 'I'] },
    'VIRUSLIB-RSV-AB-F-POSTFUSION-3RRR.pdb': { antigen: ['A', 'B', 'C', 'D', 'E', 'F'], antibody: [] },
    'VIRUSLIB-HIV1-ENV-ZM233-9CV7.pdb': { antigen: ['A', 'D', 'E'], antibody: ['B', 'C'] },
    'VIRUSLIB-HMPV-A-F-4DAG.pdb': { antigen: ['A'], antibody: ['B', 'C'] },
    'VIRUSLIB-HPIV3-F-PREFUSION-8DG8.pdb': { antigen: ['A', 'D', 'E'], antibody: ['B', 'C'] }
  };

  for (const [filename, roles] of Object.entries(expected)) {
    const asset = catalogEntryForFilename(catalog, filename);
    assert.ok(asset, filename + ' should be present in the catalog');
    assert.deepEqual(asset.antigenChains || [], roles.antigen, filename + ' antigen roles');
    assert.deepEqual(asset.antibodyChains || [], roles.antibody, filename + ' antibody roles');
  }
});

test('every catalog display role references a chain present in its local PDB', () => {
  const catalog = loadLocalStructureCatalog(ROOT);
  for (const asset of catalog.libraryAssets) {
    if (!asset.filename || !fs.existsSync(path.join(ROOT, 'pdb', asset.filename))) continue;
    const actual = coordinateChains(asset.filename);
    const declared = [...(asset.antigenChains || []), ...(asset.antibodyChains || [])];
    for (const chain of declared) {
      assert.ok(actual.has(chain), asset.filename + ' declares missing display chain ' + chain);
    }
  }
});

test('antigen display pose library assets are indexed for exact local matching', () => {
  const catalog = loadLocalStructureCatalog(ROOT);
  const displayAssets = catalog.libraryAssets.filter(item => item.sourceCatalog === 'antigen-display-pose-manifest.json');
  assert.equal(displayAssets.length, 160);

  const pcsk9 = catalogEntryForFilename(catalog, 'PCSK9-Fab-2QTW.pdb');
  assert.ok(pcsk9, 'PCSK9 display pose asset should be represented in the catalog');
  assert.equal(pcsk9.target, 'PCSK9');
  assert.equal(pcsk9.gene, 'PCSK9');
  assert.equal(pcsk9.antibodyFormat, 'Fab');
  assert.equal(pcsk9.structureClass, 'target_exact_display_pose');
  assert.deepEqual(pcsk9.antigenChains, ['A', 'B']);
  assert.deepEqual(pcsk9.antibodyChains, ['H', 'C']);
  assert.equal(pcsk9.localPath, 'pdb/antigen-display-pose/PCSK9-Fab-2QTW.pdb');

  const prnp = catalogEntryForFilename(catalog, 'PRNP-VHH-1QLX.pdb');
  assert.ok(prnp, 'PRNP display pose asset should be represented in the catalog');
  assert.equal(prnp.target, 'PRNP');
  assert.equal(prnp.gene, 'PRNP');
  assert.equal(prnp.antibodyFormat, 'VHH');
  assert.equal(prnp.structureClass, 'target_exact_display_pose');
  assert.deepEqual(prnp.antibodyChains, ['B']);

  const adrb1 = catalogEntryForFilename(catalog, 'ADRB1-VHH-8S2T.pdb');
  assert.ok(adrb1, 'ADRB1 display pose asset should be represented in the catalog');
  assert.equal(adrb1.target, 'ADRB1');
  assert.equal(adrb1.gene, 'ADRB1');
  assert.equal(adrb1.antibodyFormat, 'VHH');
  assert.equal(adrb1.structureClass, 'target_exact_nanobody_complex');
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
  assert.equal(map[normalizeStructureCatalogKey('CD22')], 'heme_cd22');
  assert.equal(map[normalizeStructureCatalogKey('SIGLEC2')], 'heme_cd22');
  assert.equal(map[normalizeStructureCatalogKey('BAFF')], 'autoimmune_baff');
  assert.equal(map[normalizeStructureCatalogKey('TNFSF13B')], 'autoimmune_baff');
  assert.equal(map[normalizeStructureCatalogKey('B7-H6')], 'solid_tumor_b7h6');
  assert.equal(map[normalizeStructureCatalogKey('NCR3LG1')], 'solid_tumor_b7h6');
  assert.equal(map[normalizeStructureCatalogKey('FcRn')], 'autoimmune_fcrn');
  assert.equal(map[normalizeStructureCatalogKey('FCGRT')], 'autoimmune_fcrn');
  assert.equal(map[normalizeStructureCatalogKey('NGF')], 'pain_ngf');
  assert.equal(map[normalizeStructureCatalogKey('Canine NGF')], 'veterinary_canine_ngf');
  assert.equal(map[normalizeStructureCatalogKey('犬源 NGF')], 'veterinary_canine_ngf');
  assert.equal(map[normalizeStructureCatalogKey('Integrin α4β7')], 'ibd_a4b7');
  assert.equal(map[normalizeStructureCatalogKey('alpha4beta7')], 'ibd_a4b7');
  assert.equal(map[normalizeStructureCatalogKey('GPC2')], 'sclc_gpc2');
  assert.equal(map[normalizeStructureCatalogKey('Glypican-2')], 'sclc_gpc2');
  assert.equal(map[normalizeStructureCatalogKey('MET')], 'solid_tumor_met');
  assert.equal(map[normalizeStructureCatalogKey('c-MET')], 'solid_tumor_met');
  assert.equal(map[normalizeStructureCatalogKey('HER3')], 'solid_tumor_her3');
  assert.equal(map[normalizeStructureCatalogKey('ERBB3')], 'solid_tumor_her3');
  assert.equal(map[normalizeStructureCatalogKey('FGFR3')], 'urothelial_fgfr3');
  assert.equal(map[normalizeStructureCatalogKey('JTK4')], 'urothelial_fgfr3');
  assert.equal(map[normalizeStructureCatalogKey('FGFR2')], 'upper_gi_fgfr2');
  assert.equal(map[normalizeStructureCatalogKey('KGFR')], 'upper_gi_fgfr2');
  assert.equal(map[normalizeStructureCatalogKey('IL-6')], 'inflammation_il6');
  assert.equal(map[normalizeStructureCatalogKey('IL6')], 'inflammation_il6');
  assert.equal(map[normalizeStructureCatalogKey('Myostatin')], 'metabolic_myostatin');
  assert.equal(map[normalizeStructureCatalogKey('GDF8')], 'metabolic_myostatin');
  assert.equal(map[normalizeStructureCatalogKey('Amyloid-beta')], 'neuro_alz_abeta');
  assert.equal(map[normalizeStructureCatalogKey('APP')], 'neuro_alz_abeta');
  assert.equal(map[normalizeStructureCatalogKey('Tau')], 'neuro_alz_tau');
  assert.equal(map[normalizeStructureCatalogKey('MAPT')], 'neuro_alz_tau');
  assert.equal(map[normalizeStructureCatalogKey('TREM2')], 'neuro_alz_trem2');
  assert.equal(map[normalizeStructureCatalogKey('TrkB')], 'neuro_trkb');
  assert.equal(map[normalizeStructureCatalogKey('NTRK2')], 'neuro_trkb');
  assert.equal(map[normalizeStructureCatalogKey('TSHR')], 'endocrine_graves_tshr');
  assert.equal(map[normalizeStructureCatalogKey('Thyrotropin receptor')], 'endocrine_graves_tshr');
  assert.equal(map[normalizeStructureCatalogKey('alpha-synuclein')], 'neuro_parkinson_snca');
  assert.equal(map[normalizeStructureCatalogKey('SNCA')], 'neuro_parkinson_snca');
  assert.equal(map[normalizeStructureCatalogKey('AQP4')], 'neuro_nmosd_aqp4');
  assert.equal(map[normalizeStructureCatalogKey('Aquaporin-4')], 'neuro_nmosd_aqp4');
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
  assert.equal(
    generated.routePresets.find(item => item.routeId === 'immune_cd4').target,
    'CD4'
  );
  assert.equal(
    generated.routePresets.find(item => item.routeId === 'immune_cd4').structureClass,
    'target_exact_complex'
  );
  assert.equal(
    generated.routePresets.find(item => item.routeId === 'complement_cfh').target,
    'CFH'
  );
  assert.equal(
    generated.routePresets.find(item => item.routeId === 'complement_cfh').structureClass,
    'target_exact_nanobody_complex'
  );
});
