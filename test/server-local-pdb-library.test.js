const assert = require('assert/strict');
const { spawn } = require('child_process');
const path = require('path');
const test = require('node:test');

const PORT = 19086;
let serverProcess = null;

async function waitForHealth() {
  const deadline = Date.now() + 8000;
  while (Date.now() < deadline) {
    try {
      const res = await fetch('http://127.0.0.1:' + PORT + '/api/health');
      if (res.ok) return;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 150));
  }
  throw new Error('server did not become healthy');
}

function startServer() {
  serverProcess = spawn(process.execPath, ['server.js'], {
    cwd: path.join(__dirname, '..'),
    env: {
      ...process.env,
      NODE_ENV: 'test',
      PORT: String(PORT),
      LOCAL_ASR_AUTO_START: '0'
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  return waitForHealth();
}

async function stopServer() {
  if (!serverProcess) return;
  const proc = serverProcess;
  serverProcess = null;
  if (proc.exitCode !== null) return;
  await new Promise(resolve => {
    const timer = setTimeout(() => {
      try { proc.kill('SIGKILL'); } catch {}
      resolve();
    }, 3000);
    proc.once('exit', () => {
      clearTimeout(timer);
      resolve();
    });
    try { proc.kill('SIGTERM'); } catch {
      clearTimeout(timer);
      resolve();
    }
  });
}

test.before(async () => {
  await startServer();
});

test.after(async () => {
  await stopServer();
});

test('local PDB model library API lists local structures with viewer metadata', async () => {
  const res = await fetch('http://127.0.0.1:' + PORT + '/api/pdb/local-models');
  assert.equal(res.status, 200);
  const data = await res.json();

  assert.equal(data.ok, true);
  assert.ok(data.count >= 100, 'local structure library should expose the populated pdb/ directory');
  assert.equal(data.count, data.models.length);

  const flu = data.models.find(model => model.filename === 'FluHA-Fab-01.pdb');
  assert.ok(flu, 'known local PDB should be listed');
  assert.equal(flu.name, 'FluHA-Fab-01');
  assert.equal(flu.url, '/api/pdb/local/FluHA-Fab-01.pdb');
  assert.match(flu.viewerUrl, /^\/viewer-full\.html\?/);
  assert.match(flu.viewerUrl, /pdb=/);
  assert.ok(flu.sizeBytes > 0);
  assert.equal(flu.targetDisplay, 'Influenza HA');
  assert.equal(flu.antibodyFormat, 'Fab');
  assert.equal(flu.modelOrigin, 'local');
  assert.equal(flu.targetTag.tagged, true);
  assert.equal(flu.targetTag.verifiedTag, true);
  assert.equal(flu.targetTag.target, 'Influenza HA');
  assert.equal(flu.targetTag.antibodyFormat, 'Fab');
  assert.equal(flu.targetTag.source, 'pdb-remark');
  assert.equal(flu.structureKind, 'Fab 代表性实验结合界面');
  assert.match(flu.structureBrief, /Influenza HA/);
  assert.match(flu.structureBrief, /Fab 代表性实验结合界面/);
  assert.equal(flu.structuralBasis, 'RCSB 3GBM influenza HA trimer biological assembly / representative HA protomer-CR6261 Fab interface');
  assert.ok(Array.isArray(flu.antigenChains));
  assert.ok(Array.isArray(flu.antibodyChains));
  assert.deepEqual(flu.antigenChains, ['A', 'D']);
  assert.deepEqual(flu.antibodyChains, ['B', 'C']);
  assert.deepEqual(flu.sourceAntigenChains, ['A', 'D', 'E', 'F', 'G', 'H']);
  assert.deepEqual(flu.sourceAntibodyChains, ['B', 'C']);
  const fluViewerPdbUrl = new URL(flu.viewerUrl, 'http://127.0.0.1').searchParams.get('pdb');
  assert.match(fluViewerPdbUrl, /chains=A%2CD%2CB%2CC/);
  assert.match(flu.updatedAt, /^\d{4}-\d{2}-\d{2}T/);

  const folr1 = data.models.find(model => model.filename === 'SOLIDLIB-HUMAN-FOLR1-RCSB-4KM6.pdb');
  assert.ok(folr1, 'solid-tumor antigen-only asset should be listed');
  assert.equal(folr1.targetDisplay, 'FOLR1');
  assert.equal(folr1.antibodyFormat, '');
  assert.equal(folr1.structureKind, '实验抗原结构');
  assert.deepEqual(folr1.antigenChains, ['A']);
  assert.deepEqual(folr1.antibodyChains, []);
  assert.equal(folr1.targetTag.tagged, true);
  assert.equal(folr1.targetTag.verifiedTag, true);
  assert.equal(folr1.targetTag.source, 'pdb-remark');
  const folr1ViewerPdbUrl = new URL(folr1.viewerUrl, 'http://127.0.0.1').searchParams.get('pdb');
  assert.match(folr1ViewerPdbUrl, /chains=A$/);

  const sost = data.models.find(model => model.filename === 'BONELIB-HUMAN-SOST-RCSB-2K8P.pdb');
  assert.ok(sost, 'bone-library SOST antigen-only asset should be listed');
  assert.equal(sost.targetDisplay, 'SOST');
  assert.equal(sost.antibodyFormat, '');
  assert.equal(sost.structureKind, '实验抗原结构');
  assert.deepEqual(sost.antigenChains, ['A']);
  assert.deepEqual(sost.antibodyChains, []);
  assert.match(sost.structuralBasis, /2K8P/);
  assert.equal(sost.targetTag.verifiedTag, true);

  const dkk1 = data.models.find(model => model.filename === 'BONELIB-HUMAN-DKK1-RCSB-5GJE.pdb');
  assert.ok(dkk1, 'bone-library DKK1 reference asset should be listed');
  assert.equal(dkk1.targetDisplay, 'DKK1');
  assert.equal(dkk1.antibodyFormat, '');
  assert.deepEqual(dkk1.antigenChains, ['C']);
  assert.deepEqual(dkk1.antibodyChains, []);
  assert.match(dkk1.structuralBasis, /5GJE/);
  assert.equal(dkk1.targetTag.verifiedTag, true);

  const igf1r = data.models.find(model => model.filename === 'ENDOCRINELIB-HUMAN-IGF1R-RCSB-7XGD.pdb');
  assert.ok(igf1r, 'endocrine-library IGF1R asset should be listed');
  assert.equal(igf1r.targetDisplay, 'IGF1R');
  assert.equal(igf1r.antibodyFormat, '');
  assert.equal(igf1r.structureKind, '实验抗原结构');
  assert.deepEqual(igf1r.antigenChains, ['A', 'B']);
  assert.deepEqual(igf1r.antibodyChains, []);
  assert.match(igf1r.structuralBasis, /7XGD/);
  assert.equal(igf1r.targetTag.verifiedTag, true);

  const igf1rFv = data.models.find(model => model.filename === 'ENDOCRINELIB-HUMAN-IGF1R-FV-RCSB-5U8R.pdb');
  assert.ok(igf1rFv, 'endocrine-library IGF1R Fv asset should be listed');
  assert.equal(igf1rFv.targetDisplay, 'IGF1R');
  assert.equal(igf1rFv.antibodyFormat, 'Fv');
  assert.equal(igf1rFv.structureKind, 'Fv 抗原-抗体复合体');
  assert.deepEqual(igf1rFv.antigenChains, ['A']);
  assert.deepEqual(igf1rFv.antibodyChains, ['H', 'L']);
  assert.deepEqual(igf1rFv.sourceAntigenChains, ['A']);
  assert.deepEqual(igf1rFv.sourceAntibodyChains, ['H', 'L']);
  assert.match(igf1rFv.structuralBasis, /5U8R/);
  assert.equal(igf1rFv.targetTag.verifiedTag, true);

  const glp1r = data.models.find(model => model.filename === 'ENDOCRINELIB-HUMAN-GLP1R-RCSB-6LN2.pdb');
  assert.ok(glp1r, 'endocrine-library GLP1R asset should be listed');
  assert.equal(glp1r.targetDisplay, 'GLP1R');
  assert.equal(glp1r.antibodyFormat, 'Fab');
  assert.equal(glp1r.structureKind, 'Fab 抗原-抗体复合体');
  assert.deepEqual(glp1r.antigenChains, ['A']);
  assert.deepEqual(glp1r.antibodyChains, ['B', 'C']);
  assert.match(glp1r.structuralBasis, /6LN2/);
  assert.equal(glp1r.targetTag.verifiedTag, true);

  const myostatin = data.models.find(model => model.filename === 'METABOLIB-HUMAN-MSTN-FAB-RCSB-5F3H.pdb');
  assert.ok(myostatin, 'metabolic-library Myostatin asset should be listed');
  assert.equal(myostatin.targetDisplay, 'Myostatin');
  assert.equal(myostatin.antibodyFormat, 'Fab');
  assert.equal(myostatin.structureKind, 'Fab 抗原-抗体复合体');
  assert.deepEqual(myostatin.antigenChains, ['I', 'J']);
  assert.deepEqual(myostatin.antibodyChains, ['A', 'B']);
  assert.deepEqual(myostatin.sourceAntigenChains, ['I', 'J', 'K', 'L']);
  assert.deepEqual(myostatin.sourceAntibodyChains, ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']);
  assert.match(myostatin.structuralBasis, /5F3H/);
  assert.equal(myostatin.targetTag.verifiedTag, true);

  const actriib = data.models.find(model => model.filename === 'METABOLIB-HUMAN-ACTRIIB-FV-RCSB-5NHR.pdb');
  assert.ok(actriib, 'metabolic-library ActRIIB asset should be listed');
  assert.equal(actriib.targetDisplay, 'ActRIIB');
  assert.equal(actriib.antibodyFormat, 'Fv');
  assert.equal(actriib.structureKind, 'Fv 抗原-抗体复合体');
  assert.deepEqual(actriib.antigenChains, ['C', 'D']);
  assert.deepEqual(actriib.antibodyChains, ['A', 'B']);
  assert.deepEqual(actriib.sourceAntibodyChains, ['A', 'B', 'H', 'L']);
  assert.match(actriib.structuralBasis, /5NHR/);
  assert.equal(actriib.targetTag.verifiedTag, true);

  const il6 = data.models.find(model => model.filename === 'INFLAMLIB-HUMAN-IL6-RCSB-1ALU.pdb');
  assert.ok(il6, 'inflammation-library IL-6 antigen-only asset should be listed');
  assert.equal(il6.targetDisplay, 'IL-6');
  assert.equal(il6.antibodyFormat, '');
  assert.equal(il6.structureKind, '实验抗原结构');
  assert.deepEqual(il6.antigenChains, ['A']);
  assert.deepEqual(il6.antibodyChains, []);
  assert.match(il6.structuralBasis, /1ALU/);
  assert.equal(il6.targetTag.verifiedTag, true);

  const il6Fab = data.models.find(model => model.filename === 'INFLAMLIB-HUMAN-IL6-FAB-RCSB-4ZS7.pdb');
  assert.ok(il6Fab, 'inflammation-library IL-6 Fab asset should be listed');
  assert.equal(il6Fab.targetDisplay, 'IL-6');
  assert.equal(il6Fab.antibodyFormat, 'Fab');
  assert.equal(il6Fab.structureKind, 'Fab 抗原-抗体复合体');
  assert.deepEqual(il6Fab.antigenChains, ['A']);
  assert.deepEqual(il6Fab.antibodyChains, ['H', 'L']);
  assert.match(il6Fab.structuralBasis, /4ZS7/);
  assert.equal(il6Fab.targetTag.verifiedTag, true);

  const lrrk2 = data.models.find(model => model.filename === 'NEUROLIB-HUMAN-LRRK2-RCSB-7LHT.pdb');
  assert.ok(lrrk2, 'neuro-library LRRK2 asset should be listed');
  assert.equal(lrrk2.targetDisplay, 'LRRK2');
  assert.equal(lrrk2.antibodyFormat, '');
  assert.equal(lrrk2.structureKind, '实验抗原结构');
  assert.deepEqual(lrrk2.antigenChains, ['A', 'B']);
  assert.deepEqual(lrrk2.antibodyChains, []);
  assert.match(lrrk2.structuralBasis, /7LHT/);
  assert.equal(lrrk2.targetTag.verifiedTag, true);

  const drd4 = data.models.find(model => model.filename === 'NEUROLIB-HUMAN-DRD4-RCSB-5WIU.pdb');
  assert.ok(drd4, 'neuro-library DRD4 asset should be listed');
  assert.equal(drd4.targetDisplay, 'DRD4');
  assert.equal(drd4.antibodyFormat, '');
  assert.equal(drd4.structureKind, '实验抗原结构');
  assert.deepEqual(drd4.antigenChains, ['A']);
  assert.deepEqual(drd4.antibodyChains, []);
  assert.match(drd4.structuralBasis, /5WIU/);
  assert.equal(drd4.targetTag.verifiedTag, true);

  const trkb = data.models.find(model => model.filename === 'NEUROLIB-HUMAN-TRKB-FAB-RCSB-5MO9.pdb');
  assert.ok(trkb, 'neuro-library TrkB Fab asset should be listed');
  assert.equal(trkb.targetDisplay, 'TrkB');
  assert.equal(trkb.antibodyFormat, 'Fab');
  assert.equal(trkb.structureKind, 'Fab 抗原-抗体复合体');
  assert.deepEqual(trkb.antigenChains, ['X']);
  assert.deepEqual(trkb.antibodyChains, ['H', 'L']);
  assert.deepEqual(trkb.sourceAntigenChains, ['X']);
  assert.deepEqual(trkb.sourceAntibodyChains, ['H', 'L']);
  assert.match(trkb.structuralBasis, /5MO9/);
  assert.equal(trkb.targetTag.verifiedTag, true);

  const met = data.models.find(model => model.filename === 'SOLIDLIB-HUMAN-MET-FAB-RCSB-6I04.pdb');
  assert.ok(met, 'solid-tumor MET Fab asset should be listed');
  assert.equal(met.targetDisplay, 'MET');
  assert.equal(met.antibodyFormat, 'Fab');
  assert.equal(met.structureKind, 'Fab 抗原-抗体复合体');
  assert.deepEqual(met.antigenChains, ['A']);
  assert.deepEqual(met.antibodyChains, ['H', 'L']);
  assert.deepEqual(met.sourceAntigenChains, ['A', 'B']);
  assert.deepEqual(met.sourceAntibodyChains, ['H', 'L', 'C', 'D']);
  assert.match(met.structuralBasis, /6I04/);
  assert.equal(met.targetTag.verifiedTag, true);

  const her3 = data.models.find(model => model.filename === 'SOLIDLIB-HUMAN-HER3-FAB-RCSB-7D85.pdb');
  assert.ok(her3, 'solid-tumor HER3 Fab asset should be listed');
  assert.equal(her3.targetDisplay, 'HER3');
  assert.equal(her3.antibodyFormat, 'Fab');
  assert.equal(her3.structureKind, 'Fab 抗原-抗体复合体');
  assert.deepEqual(her3.antigenChains, ['A']);
  assert.deepEqual(her3.antibodyChains, ['B', 'C']);
  assert.deepEqual(her3.sourceAntigenChains, ['A', 'D']);
  assert.deepEqual(her3.sourceAntibodyChains, ['B', 'C', 'E', 'F']);
  assert.match(her3.structuralBasis, /7D85/);
  assert.equal(her3.targetTag.verifiedTag, true);

  const fgfr3 = data.models.find(model => model.filename === 'SOLIDLIB-HUMAN-FGFR3-FAB-RCSB-3GRW.pdb');
  assert.ok(fgfr3, 'solid-tumor FGFR3 Fab asset should be listed');
  assert.equal(fgfr3.targetDisplay, 'FGFR3');
  assert.equal(fgfr3.antibodyFormat, 'Fab');
  assert.equal(fgfr3.structureKind, 'Fab 抗原-抗体复合体');
  assert.deepEqual(fgfr3.antigenChains, ['A']);
  assert.deepEqual(fgfr3.antibodyChains, ['H', 'L']);
  assert.deepEqual(fgfr3.sourceAntigenChains, ['A']);
  assert.deepEqual(fgfr3.sourceAntibodyChains, ['H', 'L']);
  assert.match(fgfr3.structuralBasis, /3GRW/);
  assert.equal(fgfr3.targetTag.verifiedTag, true);

  const fgfr2 = data.models.find(model => model.filename === 'SOLIDLIB-HUMAN-FGFR2-FAB-RCSB-4WV1.pdb');
  assert.ok(fgfr2, 'solid-tumor FGFR2 Fab asset should be listed');
  assert.equal(fgfr2.targetDisplay, 'FGFR2');
  assert.equal(fgfr2.antibodyFormat, 'Fab');
  assert.equal(fgfr2.structureKind, 'Fab 抗原-抗体复合体');
  assert.deepEqual(fgfr2.antigenChains, ['C']);
  assert.deepEqual(fgfr2.antibodyChains, ['A', 'B']);
  assert.deepEqual(fgfr2.sourceAntigenChains, ['C', 'F']);
  assert.deepEqual(fgfr2.sourceAntibodyChains, ['A', 'B', 'D', 'E']);
  assert.match(fgfr2.structuralBasis, /4WV1/);
  assert.equal(fgfr2.targetTag.verifiedTag, true);

  const gba = data.models.find(model => model.filename === 'NEUROLIB-HUMAN-GBA-RCSB-1OGS.pdb');
  assert.ok(gba, 'neuro-library GBA asset should be listed');
  assert.equal(gba.targetDisplay, 'GBA');
  assert.equal(gba.antibodyFormat, '');
  assert.equal(gba.structureKind, '实验抗原结构');
  assert.deepEqual(gba.antigenChains, ['A', 'B']);
  assert.deepEqual(gba.antibodyChains, []);
  assert.match(gba.structuralBasis, /1OGS/);
  assert.equal(gba.targetTag.verifiedTag, true);

  const rankl = data.models.find(model => model.filename === 'BONELIB-HUMAN-RANKL-RCSB-3URF.pdb');
  assert.ok(rankl, 'bone-library RANKL reference asset should be listed');
  assert.equal(rankl.targetDisplay, 'RANKL');
  assert.equal(rankl.antibodyFormat, '');
  assert.deepEqual(rankl.antigenChains, ['A']);
  assert.deepEqual(rankl.antibodyChains, []);
  assert.match(rankl.structuralBasis, /3URF/);
  assert.equal(rankl.targetTag.verifiedTag, true);

  const psma = data.models.find(model => model.filename === 'SOLIDLIB-HUMAN-PSMA-VHH-RCSB-9HLW.pdb');
  assert.ok(psma, 'solid-tumor PSMA nanobody asset should be listed');
  assert.equal(psma.targetDisplay, 'PSMA');
  assert.equal(psma.antibodyFormat, 'VHH');
  assert.equal(psma.structureKind, 'VHH 抗原-抗体复合体');
  assert.deepEqual(psma.antigenChains, ['A', 'E']);
  assert.deepEqual(psma.antibodyChains, ['H']);
  assert.deepEqual(psma.sourceAntibodyChains, ['H', 'Q']);
  assert.match(psma.structuralBasis, /9HLW/);
  assert.equal(psma.targetTag.verifiedTag, true);

  const psma8 = data.models.find(model => model.filename === 'SOLIDLIB-HUMAN-PSMA-VHH-RCSB-9HVI.pdb');
  assert.ok(psma8, 'solid-tumor PSMA nanobody 8 asset should be listed');
  assert.equal(psma8.targetDisplay, 'PSMA');
  assert.equal(psma8.antibodyFormat, 'VHH');
  assert.equal(psma8.structureKind, 'VHH 抗原-抗体复合体');
  assert.deepEqual(psma8.antigenChains, ['A', 'E']);
  assert.deepEqual(psma8.antibodyChains, ['H']);
  assert.deepEqual(psma8.sourceAntibodyChains, ['H', 'Q']);
  assert.match(psma8.structuralBasis, /9HVI/);
  assert.equal(psma8.targetTag.verifiedTag, true);

  const psma37 = data.models.find(model => model.filename === 'SOLIDLIB-HUMAN-PSMA-VHH-RCSB-9HVL.pdb');
  assert.ok(psma37, 'solid-tumor PSMA nanobody 37 asset should be listed');
  assert.equal(psma37.targetDisplay, 'PSMA');
  assert.equal(psma37.antibodyFormat, 'VHH');
  assert.equal(psma37.structureKind, 'VHH 抗原-抗体复合体');
  assert.deepEqual(psma37.antigenChains, ['A', 'E']);
  assert.deepEqual(psma37.antibodyChains, ['H']);
  assert.deepEqual(psma37.sourceAntibodyChains, ['H', 'P']);
  assert.match(psma37.structuralBasis, /9HVL/);
  assert.equal(psma37.targetTag.verifiedTag, true);

  const psmaDual = data.models.find(model => model.filename === 'SOLIDLIB-HUMAN-PSMA-VHH-RCSB-9HVK.pdb');
  assert.ok(psmaDual, 'solid-tumor PSMA dual-nanobody asset should be listed');
  assert.equal(psmaDual.targetDisplay, 'PSMA');
  assert.equal(psmaDual.antibodyFormat, 'VHH');
  assert.equal(psmaDual.structureKind, 'VHH 抗原-抗体复合体');
  assert.deepEqual(psmaDual.antigenChains, ['A', 'E']);
  assert.deepEqual(psmaDual.antibodyChains, ['H']);
  assert.deepEqual(psmaDual.sourceAntibodyChains, ['H', 'Q', 'M', 'P']);
  assert.match(psmaDual.structuralBasis, /9HVK/);
  assert.equal(psmaDual.targetTag.verifiedTag, true);

  const caix = data.models.find(model => model.filename === 'CAIX-Fab-01.pdb');
  assert.ok(caix, 'CAIX routeable Fab preset should be listed');
  assert.equal(caix.targetDisplay, 'CAIX');
  assert.equal(caix.antibodyFormat, 'Fab');
  assert.equal(caix.structureKind, 'Fab 抗原-抗体复合体');
  assert.deepEqual(caix.antigenChains, ['P']);
  assert.deepEqual(caix.antibodyChains, ['H', 'L']);
  assert.match(caix.structuralBasis, /2HKF/);
  assert.equal(caix.targetTag.verifiedTag, true);
  const caixViewerPdbUrl = new URL(caix.viewerUrl, 'http://127.0.0.1').searchParams.get('pdb');
  assert.match(caixViewerPdbUrl, /chains=P%2CH%2CL/);

  const tissueFactor = data.models.find(model => model.filename === 'F3-Fab-01.pdb');
  assert.ok(tissueFactor, 'Tissue Factor routeable Fab preset should be listed');
  assert.equal(tissueFactor.targetDisplay, 'Tissue Factor');
  assert.equal(tissueFactor.antibodyFormat, 'Fab');
  assert.equal(tissueFactor.structureKind, 'Fab 抗原-抗体复合体');
  assert.deepEqual(tissueFactor.antigenChains, ['C']);
  assert.deepEqual(tissueFactor.antibodyChains, ['A', 'B']);
  assert.match(tissueFactor.structuralBasis, /1UJ3/);
  assert.equal(tissueFactor.targetTag.verifiedTag, true);
  const tissueFactorViewerPdbUrl = new URL(tissueFactor.viewerUrl, 'http://127.0.0.1').searchParams.get('pdb');
  assert.match(tissueFactorViewerPdbUrl, /chains=C%2CA%2CB/);

  const epcam = data.models.find(model => model.filename === 'SOLIDLIB-HUMAN-EPCAM-SCFV-RCSB-6I07.pdb');
  assert.ok(epcam, 'solid-tumor EpCAM scFv asset should be listed');
  assert.equal(epcam.targetDisplay, 'EpCAM');
  assert.equal(epcam.antibodyFormat, 'scFv');
  assert.equal(epcam.structureKind, 'scFv 抗原-抗体复合体');
  assert.deepEqual(epcam.antigenChains, ['C', 'D']);
  assert.deepEqual(epcam.antibodyChains, ['A', 'B']);
  assert.equal(epcam.targetTag.verifiedTag, true);

  const il5 = data.models.find(model => model.filename === 'IL5-Fab-01.pdb');
  assert.ok(il5, 'IL-5 routeable Fab preset should be listed');
  assert.equal(il5.targetDisplay, 'IL-5');
  assert.equal(il5.antibodyFormat, 'Fab');
  assert.equal(il5.structureKind, 'Fab 抗原-抗体复合体');
  assert.deepEqual(il5.antigenChains, ['A', 'B']);
  assert.deepEqual(il5.antibodyChains, ['C', 'D', 'E', 'F']);
  assert.match(il5.structuralBasis, /9GVN/);
  assert.equal(il5.targetTag.verifiedTag, true);

  const il13 = data.models.find(model => model.filename === 'IL13-Fab-01.pdb');
  assert.ok(il13, 'IL-13 routeable Fab preset should be listed');
  assert.equal(il13.targetDisplay, 'IL-13');
  assert.equal(il13.antibodyFormat, 'Fab');
  assert.equal(il13.structureKind, 'Fab 抗原-抗体复合体');
  assert.deepEqual(il13.antigenChains, ['C']);
  assert.deepEqual(il13.antibodyChains, ['H', 'L']);
  assert.match(il13.structuralBasis, /5L6Y/);
  assert.equal(il13.targetTag.verifiedTag, true);

  const cd123 = data.models.find(model => model.filename === 'CD123-Fab-01.pdb');
  assert.ok(cd123, 'CD123 routeable Fab preset should be listed');
  assert.equal(cd123.targetDisplay, 'CD123');
  assert.equal(cd123.antibodyFormat, 'Fab');
  assert.equal(cd123.structureKind, 'Fab 抗原-抗体复合体');
  assert.deepEqual(cd123.antigenChains, ['C', 'D']);
  assert.deepEqual(cd123.antibodyChains, ['A', 'B', 'H', 'L']);
  assert.match(cd123.structuralBasis, /4JZJ/);
  assert.equal(cd123.targetTag.verifiedTag, true);

  const cd33 = data.models.find(model => model.filename === 'CD33-Fab-01.pdb');
  assert.ok(cd33, 'CD33 routeable Fab preset should be listed');
  assert.equal(cd33.targetDisplay, 'CD33');
  assert.equal(cd33.antibodyFormat, 'Fab');
  assert.equal(cd33.structureKind, 'Fab 抗原-抗体复合体');
  assert.deepEqual(cd33.antigenChains, ['A', 'D']);
  assert.deepEqual(cd33.antibodyChains, ['B', 'C', 'E', 'F']);
  assert.match(cd33.structuralBasis, /9VL2/);
  assert.equal(cd33.targetTag.verifiedTag, true);

  const baff = data.models.find(model => model.filename === 'BAFF-Fab-01.pdb');
  assert.ok(baff, 'BAFF routeable Fab preset should be listed');
  assert.equal(baff.targetDisplay, 'BAFF');
  assert.equal(baff.antibodyFormat, 'Fab');
  assert.equal(baff.structureKind, 'Fab 抗原-抗体复合体');
  assert.deepEqual(baff.antigenChains, ['A', 'B', 'C']);
  assert.deepEqual(baff.antibodyChains, ['D', 'E', 'F', 'G', 'H', 'I']);
  assert.match(baff.structuralBasis, /6FXN/);
  assert.equal(baff.targetTag.verifiedTag, true);

  const fcrn = data.models.find(model => model.filename === 'FCRN-Fab-01.pdb');
  assert.ok(fcrn, 'FcRn routeable Fab preset should be listed');
  assert.equal(fcrn.targetDisplay, 'FcRn');
  assert.equal(fcrn.antibodyFormat, 'Fab');
  assert.equal(fcrn.structureKind, 'Fab 抗原-抗体复合体');
  assert.deepEqual(fcrn.antigenChains, ['A', 'B']);
  assert.deepEqual(fcrn.antibodyChains, ['H', 'L']);
  assert.match(fcrn.structuralBasis, /9MI6/);
  assert.equal(fcrn.targetTag.verifiedTag, true);

  const ngf = data.models.find(model => model.filename === 'NGF-Fab-01.pdb');
  assert.ok(ngf, 'NGF routeable Fab preset should be listed');
  assert.equal(ngf.targetDisplay, 'NGF');
  assert.equal(ngf.antibodyFormat, 'Fab');
  assert.equal(ngf.structureKind, 'Fab 抗原-抗体复合体');
  assert.deepEqual(ngf.antigenChains, ['V']);
  assert.deepEqual(ngf.antibodyChains, ['H', 'L']);
  assert.match(ngf.structuralBasis, /4EDW/);
  assert.equal(ngf.targetTag.verifiedTag, true);

  const a4b7 = data.models.find(model => model.filename === 'A4B7-Fab-01.pdb');
  assert.ok(a4b7, 'α4β7 routeable Fab preset should be listed');
  assert.equal(a4b7.targetDisplay, 'Integrin α4β7');
  assert.equal(a4b7.antibodyFormat, 'Fab');
  assert.equal(a4b7.structureKind, 'Fab 抗原-抗体复合体');
  assert.deepEqual(a4b7.antigenChains, ['A', 'B']);
  assert.deepEqual(a4b7.antibodyChains, ['H', 'L']);
  assert.match(a4b7.structuralBasis, /3V4P/);
  assert.equal(a4b7.targetTag.verifiedTag, true);

  const gpc2 = data.models.find(model => model.filename === 'GPC2-Fab-01.pdb');
  assert.ok(gpc2, 'GPC2 routeable Fab preset should be listed');
  assert.equal(gpc2.targetDisplay, 'GPC2');
  assert.equal(gpc2.antibodyFormat, 'Fab');
  assert.equal(gpc2.structureKind, 'Fab 抗原-抗体复合体');
  assert.deepEqual(gpc2.antigenChains, ['G']);
  assert.deepEqual(gpc2.antibodyChains, ['H', 'L']);
  assert.deepEqual(gpc2.sourceAntigenChains, ['E', 'G']);
  assert.deepEqual(gpc2.sourceAntibodyChains, ['F', 'H', 'I', 'J', 'K', 'L']);
  assert.match(gpc2.structuralBasis, /6WJL/);
  assert.equal(gpc2.targetTag.verifiedTag, true);

  const abeta = data.models.find(model => model.filename === 'ABETA-Fab-01.pdb');
  assert.ok(abeta, 'Amyloid-beta routeable Fab preset should be listed');
  assert.equal(abeta.targetDisplay, 'Amyloid-beta');
  assert.equal(abeta.antibodyFormat, 'Fab');
  assert.equal(abeta.structureKind, 'Fab 抗原-抗体复合体');
  assert.deepEqual(abeta.antigenChains, ['A']);
  assert.deepEqual(abeta.antibodyChains, ['H', 'L']);
  assert.match(abeta.structuralBasis, /4OJF/);
  assert.equal(abeta.targetTag.verifiedTag, true);

  const tau = data.models.find(model => model.filename === 'TAU-Fab-01.pdb');
  assert.ok(tau, 'Tau routeable Fab preset should be listed');
  assert.equal(tau.targetDisplay, 'Tau');
  assert.equal(tau.antibodyFormat, 'Fab');
  assert.equal(tau.structureKind, 'Fab 抗原-抗体复合体');
  assert.deepEqual(tau.antigenChains, ['A']);
  assert.deepEqual(tau.antibodyChains, ['H', 'L']);
  assert.match(tau.structuralBasis, /6PXR/);
  assert.equal(tau.targetTag.verifiedTag, true);

  const trem2 = data.models.find(model => model.filename === 'TREM2-Fab-01.pdb');
  assert.ok(trem2, 'TREM2 routeable Fab preset should be listed');
  assert.equal(trem2.targetDisplay, 'TREM2');
  assert.equal(trem2.antibodyFormat, 'Fab');
  assert.equal(trem2.structureKind, 'Fab 抗原-抗体复合体');
  assert.deepEqual(trem2.antigenChains, ['A']);
  assert.deepEqual(trem2.antibodyChains, ['H', 'L']);
  assert.match(trem2.structuralBasis, /9PWN/);
  assert.equal(trem2.targetTag.verifiedTag, true);

  const tshr = data.models.find(model => model.filename === 'TSHR-Fab-01.pdb');
  assert.ok(tshr, 'TSHR routeable Fab preset should be listed');
  assert.equal(tshr.targetDisplay, 'TSHR');
  assert.equal(tshr.antibodyFormat, 'Fab');
  assert.equal(tshr.structureKind, 'Fab 抗原-抗体复合体');
  assert.deepEqual(tshr.antigenChains, ['R']);
  assert.deepEqual(tshr.antibodyChains, ['H', 'L']);
  assert.match(tshr.structuralBasis, /7T9M/);
  assert.equal(tshr.targetTag.verifiedTag, true);

  const snca = data.models.find(model => model.filename === 'SNCA-Fab-01.pdb');
  assert.ok(snca, 'alpha-synuclein routeable Fab preset should be listed');
  assert.equal(snca.targetDisplay, 'alpha-synuclein');
  assert.equal(snca.antibodyFormat, 'Fab');
  assert.equal(snca.structureKind, 'Fab 抗原-抗体复合体');
  assert.deepEqual(snca.antigenChains, ['P']);
  assert.deepEqual(snca.antibodyChains, ['H', 'L']);
  assert.match(snca.structuralBasis, /8OG0/);
  assert.equal(snca.targetTag.verifiedTag, true);

  const aqp4 = data.models.find(model => model.filename === 'AQP4-Fab-01.pdb');
  assert.ok(aqp4, 'AQP4 routeable Fab preset should be listed');
  assert.equal(aqp4.targetDisplay, 'AQP4');
  assert.equal(aqp4.antibodyFormat, 'Fab');
  assert.equal(aqp4.structureKind, 'Fab 抗原-抗体复合体');
  assert.deepEqual(aqp4.antigenChains, ['A', 'B', 'C', 'D']);
  assert.deepEqual(aqp4.antibodyChains, ['J', 'I']);
  assert.match(aqp4.structuralBasis, /8V91/);
  assert.equal(aqp4.targetTag.verifiedTag, true);

  const trka = data.models.find(model => model.filename === 'NEUROLIB-HUMAN-TRKA-RCSB-1HE7.pdb');
  assert.ok(trka, 'TrkA antigen-only asset should be listed');
  assert.equal(trka.targetDisplay, 'TrkA');
  assert.equal(trka.antibodyFormat, '');
  assert.equal(trka.structureKind, '实验抗原结构');
  assert.deepEqual(trka.antigenChains, ['A']);
  assert.deepEqual(trka.antibodyChains, []);
  assert.match(trka.structuralBasis, /1HE7/);
  assert.equal(trka.targetTag.verifiedTag, true);

  const trkaNgf = data.models.find(model => model.filename === 'NEUROLIB-HUMAN-TRKA-NGF-RCSB-2IFG.pdb');
  assert.ok(trkaNgf, 'TrkA-NGF reference asset should be listed');
  assert.equal(trkaNgf.targetDisplay, 'TrkA');
  assert.equal(trkaNgf.antibodyFormat, '');
  assert.equal(trkaNgf.structureKind, '实验参考复合体');
  assert.deepEqual(trkaNgf.antigenChains, ['A', 'B']);
  assert.deepEqual(trkaNgf.antibodyChains, []);
  assert.match(trkaNgf.structuralBasis, /2IFG/);
  assert.equal(trkaNgf.targetTag.verifiedTag, true);

  const b7h4 = data.models.find(model => model.filename === 'SOLIDLIB-HUMAN-B7H4-RCSB-4GOS.pdb');
  assert.ok(b7h4, 'B7-H4 antigen-only asset should be listed');
  assert.equal(b7h4.targetDisplay, 'B7-H4');
  assert.equal(b7h4.antibodyFormat, '');
  assert.equal(b7h4.structureKind, '实验抗原结构');
  assert.deepEqual(b7h4.antigenChains, ['A']);
  assert.deepEqual(b7h4.antibodyChains, []);
  assert.match(b7h4.structuralBasis, /4GOS/);
  assert.equal(b7h4.targetTag.verifiedTag, true);
});

test('structure catalog API exposes route-backed structure inventory', async () => {
  const res = await fetch('http://127.0.0.1:' + PORT + '/api/structure-catalog');
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.ok, true);
  assert.ok(data.catalog);
  assert.ok(Array.isArray(data.catalog.routePresets));
  const covid = data.catalog.routePresets.find(item => item.routeId === 'infectious_covid');
  assert.ok(covid, 'catalog should expose the SARS-CoV-2 local route');
  assert.equal(covid.aliasPrefix, 'SC2RBD-Fab');
  assert.equal(covid.target, 'SARS-CoV-2 RBD');
  assert.ok((covid.files || []).includes('SC2RBD-Fab-01.pdb'));

  const abeta = data.catalog.routePresets.find(item => item.routeId === 'neuro_alz_abeta');
  assert.ok(abeta, 'catalog should expose the Alzheimer Amyloid-beta local route');
  assert.equal(abeta.aliasPrefix, 'ABETA-Fab');
  assert.equal(abeta.target, 'Amyloid-beta');
  assert.ok((abeta.files || []).includes('ABETA-Fab-01.pdb'));

  const il5 = data.catalog.routePresets.find(item => item.routeId === 'allergic_il5');
  assert.ok(il5, 'catalog should expose the IL-5 local route');
  assert.equal(il5.aliasPrefix, 'IL5-Fab');
  assert.equal(il5.target, 'IL-5');
  assert.ok((il5.files || []).includes('IL5-Fab-01.pdb'));

  const baff = data.catalog.routePresets.find(item => item.routeId === 'autoimmune_baff');
  assert.ok(baff, 'catalog should expose the BAFF local route');
  assert.equal(baff.aliasPrefix, 'BAFF-Fab');
  assert.equal(baff.target, 'BAFF');
  assert.ok((baff.files || []).includes('BAFF-Fab-01.pdb'));

  const ngf = data.catalog.routePresets.find(item => item.routeId === 'pain_ngf');
  assert.ok(ngf, 'catalog should expose the NGF local route');
  assert.equal(ngf.aliasPrefix, 'NGF-Fab');
  assert.equal(ngf.target, 'NGF');
  assert.ok((ngf.files || []).includes('NGF-Fab-01.pdb'));

  const cd33 = data.catalog.routePresets.find(item => item.routeId === 'heme_cd33');
  assert.ok(cd33, 'catalog should expose the CD33 local route');
  assert.equal(cd33.aliasPrefix, 'CD33-Fab');
  assert.equal(cd33.target, 'CD33');
  assert.ok((cd33.files || []).includes('CD33-Fab-01.pdb'));

  const gpc2 = data.catalog.routePresets.find(item => item.routeId === 'sclc_gpc2');
  assert.ok(gpc2, 'catalog should expose the GPC2 local route');
  assert.equal(gpc2.aliasPrefix, 'GPC2-Fab');
  assert.equal(gpc2.target, 'GPC2');
  assert.ok((gpc2.files || []).includes('GPC2-Fab-01.pdb'));

  const tissueFactor = data.catalog.routePresets.find(item => item.routeId === 'solid_tumor_tissue_factor');
  assert.ok(tissueFactor, 'catalog should expose the Tissue Factor local route');
  assert.equal(tissueFactor.aliasPrefix, 'F3-Fab');
  assert.equal(tissueFactor.target, 'Tissue Factor');
  assert.ok((tissueFactor.files || []).includes('F3-Fab-01.pdb'));

  const tshr = data.catalog.routePresets.find(item => item.routeId === 'endocrine_graves_tshr');
  assert.ok(tshr, 'catalog should expose the TSHR local route');
  assert.equal(tshr.aliasPrefix, 'TSHR-Fab');
  assert.equal(tshr.target, 'TSHR');
  assert.ok((tshr.files || []).includes('TSHR-Fab-01.pdb'));

  const snca = data.catalog.routePresets.find(item => item.routeId === 'neuro_parkinson_snca');
  assert.ok(snca, 'catalog should expose the alpha-synuclein local route');
  assert.equal(snca.aliasPrefix, 'SNCA-Fab');
  assert.equal(snca.target, 'alpha-synuclein');
  assert.ok((snca.files || []).includes('SNCA-Fab-01.pdb'));

  const aqp4 = data.catalog.routePresets.find(item => item.routeId === 'neuro_nmosd_aqp4');
  assert.ok(aqp4, 'catalog should expose the AQP4 local route');
  assert.equal(aqp4.aliasPrefix, 'AQP4-Fab');
  assert.equal(aqp4.target, 'AQP4');
  assert.ok((aqp4.files || []).includes('AQP4-Fab-01.pdb'));
});

test('local PDB responses are cacheable and can project only viewer-visible chains', async () => {
  const full = await fetch('http://127.0.0.1:' + PORT + '/api/pdb/local/PDL1-Fab-01.pdb');
  assert.equal(full.status, 200);
  const fullText = await full.text();
  const etag = full.headers.get('etag');
  assert.match(full.headers.get('cache-control') || '', /max-age=86400/);
  assert.ok(etag);

  const projected = await fetch('http://127.0.0.1:' + PORT + '/api/pdb/local/PDL1-Fab-01.pdb?chains=A');
  assert.equal(projected.status, 200);
  const projectedText = await projected.text();
  assert.ok(projectedText.length < fullText.length, 'chain projection should remove hidden antibody coordinates');
  const coordinateChains = [...projectedText.matchAll(/^(?:ATOM  |HETATM).{15}(.).*/gm)].map(match => match[1]);
  assert.ok(coordinateChains.length > 0);
  assert.deepEqual([...new Set(coordinateChains)], ['A']);

  const notModified = await fetch('http://127.0.0.1:' + PORT + '/api/pdb/local/PDL1-Fab-01.pdb', {
    headers: { 'if-none-match': etag }
  });
  assert.equal(notModified.status, 304);
});
