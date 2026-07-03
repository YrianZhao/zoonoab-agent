const assert = require('assert/strict');
const { spawn } = require('child_process');
const test = require('node:test');

const PORT = 19081;
let serverProcess;

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

test.before(async () => {
  serverProcess = spawn(process.execPath, ['server.js'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      NODE_ENV: 'test',
      PORT: String(PORT),
      LOCAL_ASR_AUTO_START: '0'
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  await waitForHealth();
});

test.after(async () => {
  if (!serverProcess || serverProcess.killed) return;
  serverProcess.kill('SIGTERM');
  await new Promise(resolve => serverProcess.once('exit', resolve));
});

test('server design route preserves unknown user target across route, parse, and profile', async () => {
  const query = encodeURIComponent('设计10个烟草花叶病毒的抗体');
  const res = await fetch('http://127.0.0.1:' + PORT + '/api/debug/design-route?text=' + query);
  assert.equal(res.status, 200);
  const data = await res.json();
  const serialized = JSON.stringify(data);

  assert.equal(data.intent, 'design');
  assert.equal(data.route.target, '烟草花叶病毒');
  assert.equal(data.route.dynamic, true);
  assert.equal(data.parsed.target, '烟草花叶病毒');
  assert.equal(data.parsed.count, 10);
  assert.equal(data.profile.targetDisplay, '烟草花叶病毒');
  assert.match(data.profile.mechanism, /烟草花叶病毒/);
  assert.doesNotMatch(serialized, /IL-33|ST2|PD-L1|CD274|4KC3/);
});

test('server keeps non-biomedical virus wording out of design workflow', async () => {
  const query = encodeURIComponent('电脑病毒设计抗体');
  const res = await fetch('http://127.0.0.1:' + PORT + '/api/debug/design-route?text=' + query);
  assert.equal(res.status, 200);
  const data = await res.json();

  assert.equal(data.intent, 'assistant_chat');
  assert.equal(data.route, null);
});
