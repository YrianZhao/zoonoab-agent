const assert = require('assert/strict');
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const test = require('node:test');

const PORT = 19087;
const QUESTION_TEST_SET_FILE = path.join(os.tmpdir(), 'zoonoab-test-question-set-' + PORT + '.json');
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
      QUESTION_TEST_SET_FILE,
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

async function readQuestionSet() {
  const res = await fetch('http://127.0.0.1:' + PORT + '/api/question-test-set');
  assert.equal(res.status, 200);
  return res.json();
}

test.beforeEach(async () => {
  try { fs.unlinkSync(QUESTION_TEST_SET_FILE); } catch {}
  await startServer();
});

test.afterEach(async () => {
  await stopServer();
  try { fs.unlinkSync(QUESTION_TEST_SET_FILE); } catch {}
});

test('question test set persists only original user question strings', async () => {
  const initial = await readQuestionSet();
  assert.deepEqual(initial.questions, []);

  const firstQuestion = '帮我做一个肿瘤免疫治疗方向的抗体设计';
  const secondQuestion = 'PD-L1 做 10 个 Fab 候选';
  for (const question of [firstQuestion, secondQuestion]) {
    const res = await fetch('http://127.0.0.1:' + PORT + '/api/question-test-set', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        status: 'completed',
        output: '这些内容不能保存到测试集'
      })
    });
    assert.equal(res.status, 200);
  }

  const saved = await readQuestionSet();
  assert.deepEqual(saved.questions, [firstQuestion, secondQuestion]);
  assert.equal(saved.count, 2);

  const disk = JSON.parse(fs.readFileSync(QUESTION_TEST_SET_FILE, 'utf8'));
  assert.deepEqual(disk, [firstQuestion, secondQuestion]);
  assert.doesNotMatch(JSON.stringify(disk), /completed|这些内容不能保存到测试集/);
});

test('question test set survives restarts and can be cleared independently', async () => {
  const question = '分析 HER2 VHH 序列风险';
  const saveRes = await fetch('http://127.0.0.1:' + PORT + '/api/question-test-set', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question })
  });
  assert.equal(saveRes.status, 200);

  await stopServer();
  await startServer();

  const afterRestart = await readQuestionSet();
  assert.deepEqual(afterRestart.questions, [question]);

  const clearRes = await fetch('http://127.0.0.1:' + PORT + '/api/question-test-set', { method: 'DELETE' });
  assert.equal(clearRes.status, 200);
  const cleared = await readQuestionSet();
  assert.deepEqual(cleared.questions, []);
});
