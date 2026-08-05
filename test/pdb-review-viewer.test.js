const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const test = require('node:test');

const PORT = 19117;
const ROOT = path.join(__dirname, '..');
const REVIEW_ROOT = path.join(ROOT, '.runtime', 'test-pdb-review-viewer');
const SAMPLE_DIR = path.join(REVIEW_ROOT, 'fixed-99');
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
    cwd: ROOT,
    env: {
      ...process.env,
      NODE_ENV: 'test',
      PORT: String(PORT),
      LOCAL_ASR_AUTO_START: '0',
      PDB_REVIEW_ROOT: REVIEW_ROOT
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
  fs.mkdirSync(SAMPLE_DIR, { recursive: true });
  const beforeText = [
    'HEADER    TEST BEFORE',
    'ATOM      1  CA  GLY Z   1       0.000   0.000   0.000  1.00 20.00           C',
    'END',
    ''
  ].join('\n');
  const afterText = [
    'HEADER    TEST AFTER',
    'ATOM      1  CA  GLY Y   1       1.000   0.000   0.000  1.00 20.00           C',
    'END',
    ''
  ].join('\n');
  fs.writeFileSync(path.join(SAMPLE_DIR, 'before.pdb'), beforeText);
  fs.writeFileSync(path.join(SAMPLE_DIR, 'after.pdb'), afterText);
  fs.writeFileSync(path.join(SAMPLE_DIR, 'README.md'), '# fixed-99\n');
  fs.writeFileSync(path.join(REVIEW_ROOT, 'index.csv'), [
    'id,originalFile,before,after,backup,method',
    'fixed-99,pdb/example.pdb,.runtime/reports/pdb-small-batch-review/before-after/fixed-99/before.pdb,.runtime/reports/pdb-small-batch-review/before-after/fixed-99/after.pdb,.runtime/backup/example.pdb.gz,antibody rigid translation',
    ''
  ].join('\n'));
  await startServer();
});

test.after(async () => {
  await stopServer();
  fs.rmSync(REVIEW_ROOT, { recursive: true, force: true });
});

test('PDB review page is available and uses the full viewer in all-chain mode', async () => {
  const res = await fetch('http://127.0.0.1:' + PORT + '/pdb-review.html');
  assert.equal(res.status, 200);
  const html = await res.text();
  assert.match(html, /PDB 修复复核/);
  assert.match(html, /viewer-full\.html/);
  assert.match(html, /allChains=1/);
});

test('PDB review API lists before and after viewer URLs without exposing file contents', async () => {
  const res = await fetch('http://127.0.0.1:' + PORT + '/api/pdb/review-pairs');
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.ok, true);
  const sample = data.pairs.find(item => item.id === 'fixed-99');
  assert.ok(sample, 'review sample should be listed');
  assert.equal(sample.originalFile, 'pdb/example.pdb');
  assert.equal(sample.beforeUrl, '/api/pdb/review/fixed-99/before.pdb');
  assert.equal(sample.afterUrl, '/api/pdb/review/fixed-99/after.pdb');
  assert.match(sample.beforeViewerUrl, /^\/viewer-full\.html\?/);
  assert.match(sample.beforeViewerUrl, /allChains=1/);
  assert.equal(JSON.stringify(sample).includes('HEADER    TEST'), false);
  assert.equal(JSON.stringify(sample).includes('ATOM      1'), false);
});

test('PDB review file endpoint serves only selected before or after files', async () => {
  const before = await fetch('http://127.0.0.1:' + PORT + '/api/pdb/review/fixed-99/before.pdb');
  assert.equal(before.status, 200);
  assert.match(before.headers.get('content-type') || '', /chemical\/x-pdb/);
  assert.equal(before.headers.get('content-disposition'), 'inline; filename="fixed-99-before.pdb"');
  assert.match(await before.text(), /HEADER    TEST BEFORE/);

  const badKind = await fetch('http://127.0.0.1:' + PORT + '/api/pdb/review/fixed-99/full.pdb');
  assert.equal(badKind.status, 400);

  const traversal = await fetch('http://127.0.0.1:' + PORT + '/api/pdb/review/..%2F..%2Ffixed-99/before.pdb');
  assert.equal(traversal.status, 400);
});
