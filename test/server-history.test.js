const assert = require('assert/strict');
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const test = require('node:test');

const PORT = 19084;
const HISTORY_STORE_FILE = path.join(os.tmpdir(), 'zoonoab-test-history-' + PORT + '.json');

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
      HISTORY_STORE_FILE,
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

async function readHistory() {
  const res = await fetch('http://127.0.0.1:' + PORT + '/api/history');
  assert.equal(res.status, 200);
  return res.json();
}

test.beforeEach(async () => {
  try { fs.unlinkSync(HISTORY_STORE_FILE); } catch {}
  await startServer();
});

test.afterEach(async () => {
  await stopServer();
  try { fs.unlinkSync(HISTORY_STORE_FILE); } catch {}
});

test('history API persists shared records in a server-side store across restarts', async () => {
  const initial = await readHistory();
  assert.deepEqual(initial.history, []);

  const record = {
    id: 'shared-history-1',
    schemaVersion: 2,
    title: '访客提交的 PD-L1 设计记录',
    input: '阻断 PD-1/PD-L1 通路，设计 10 个高亲和力 Fab',
    status: 'completed',
    ts: Date.now(),
    updatedAt: Date.now(),
    messages: [{ role: 'user', text: 'PD-L1 Fab', ts: Date.now() }],
    events: [{ type: 'assistant', text: '已生成候选结构。', ts: Date.now() }],
    results: [],
    models3d: []
  };

  const saveRes = await fetch('http://127.0.0.1:' + PORT + '/api/history', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(record)
  });
  assert.equal(saveRes.status, 200);
  const saved = await saveRes.json();
  assert.equal(saved.record.id, record.id);
  assert.equal(saved.history.length, 1);

  const disk = JSON.parse(fs.readFileSync(HISTORY_STORE_FILE, 'utf8'));
  assert.equal(disk[0].id, record.id);

  await stopServer();
  await startServer();

  const afterRestart = await readHistory();
  assert.equal(afterRestart.history.length, 1);
  assert.equal(afterRestart.history[0].id, record.id);
  assert.equal(afterRestart.history[0].input, record.input);
});

test('history API upserts records and can clear the shared server history', async () => {
  const record = {
    id: 'shared-history-2',
    title: '首次标题',
    input: '设计 HER2 抗体',
    status: 'running',
    ts: Date.now(),
    updatedAt: Date.now(),
    events: []
  };

  for (const title of ['首次标题', '更新后的标题']) {
    const res = await fetch('http://127.0.0.1:' + PORT + '/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...record, title, status: 'completed' })
    });
    assert.equal(res.status, 200);
  }

  const saved = await readHistory();
  assert.equal(saved.history.length, 1);
  assert.equal(saved.history[0].title, record.input);
  assert.equal(saved.history[0].status, 'completed');

  const clearRes = await fetch('http://127.0.0.1:' + PORT + '/api/history', { method: 'DELETE' });
  assert.equal(clearRes.status, 200);

  const cleared = await readHistory();
  assert.deepEqual(cleared.history, []);
});

test('history API assigns stable ids to imported legacy records without explicit ids', async () => {
  const legacyRecord = {
    label: '🧬 PD-L1 Fab × 10',
    ts: 1780570103262
  };

  for (let i = 0; i < 2; i += 1) {
    const res = await fetch('http://127.0.0.1:' + PORT + '/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(legacyRecord)
    });
    assert.equal(res.status, 200);
  }

  const saved = await readHistory();
  assert.equal(saved.history.length, 1);
  assert.match(saved.history[0].id, /^hist-fp-[a-f0-9]{24}$/);
  assert.equal(saved.history[0].title, legacyRecord.label);
});

test('history API preserves cancellation and error details for shared records', async () => {
  const record = {
    id: 'shared-history-error-detail',
    title: '错误记录',
    input: '设计一个候选抗体',
    status: 'error',
    statusDetail: '服务器错误：目标解析失败',
    error: '服务器错误：目标解析失败',
    ts: Date.now(),
    updatedAt: Date.now(),
    messages: [{ role: 'user', text: '设计一个候选抗体', ts: Date.now() }],
    events: [{ type: 'log', text: '[Error] 服务器错误：目标解析失败', ts: Date.now() }]
  };

  const res = await fetch('http://127.0.0.1:' + PORT + '/api/history', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(record)
  });
  assert.equal(res.status, 200);
  const saved = await res.json();
  assert.equal(saved.record.status, 'error');
  assert.equal(saved.record.statusDetail, record.statusDetail);
  assert.equal(saved.record.error, record.error);

  const history = await readHistory();
  assert.equal(history.history[0].statusDetail, record.statusDetail);
  assert.equal(history.history[0].error, record.error);
});
