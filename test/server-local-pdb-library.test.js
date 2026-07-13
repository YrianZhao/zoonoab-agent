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
  assert.ok(Array.isArray(flu.antigenChains));
  assert.ok(Array.isArray(flu.antibodyChains));
  assert.match(flu.updatedAt, /^\d{4}-\d{2}-\d{2}T/);
});
