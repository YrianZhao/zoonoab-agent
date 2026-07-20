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
