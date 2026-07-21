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
