const assert = require('assert/strict');
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const test = require('node:test');

const scriptPath = path.join(__dirname, '..', 'scripts', 'sync_history_store.js');

test('history sync script merges local history and questions without duplicating records', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'zoonoab-history-sync-'));
  const historyStore = path.join(dir, 'history-records.json');
  const questionSet = path.join(dir, 'user-question-test-set.json');
  const source = path.join(dir, 'source-history.json');

  const legacyRecord = {
    label: '🧬 PD-L1 Fab × 10',
    ts: 1780570103262
  };
  const fullRecord = {
    id: 'hist-existing-full-record',
    title: '分子设计 · PD-L1',
    input: '阻断 PD-1/PD-L1 通路，设计 10 个高亲和力 Fab',
    status: 'completed',
    ts: 1780570104000,
    updatedAt: 1780570105000,
    messages: [{ role: 'user', text: '阻断 PD-1/PD-L1 通路，设计 10 个高亲和力 Fab', ts: 1780570104000 }],
    events: [{ type: 'assistant', text: '已生成候选结构。', ts: 1780570105000 }]
  };

  fs.writeFileSync(historyStore, JSON.stringify([legacyRecord], null, 2));
  fs.writeFileSync(questionSet, JSON.stringify(['已有问题'], null, 2));
  fs.writeFileSync(source, JSON.stringify([legacyRecord, fullRecord, fullRecord], null, 2));

  for (let i = 0; i < 2; i += 1) {
    execFileSync(process.execPath, [
      scriptPath,
      '--history-store', historyStore,
      '--question-set', questionSet,
      source
    ], { stdio: 'pipe' });
  }

  const history = JSON.parse(fs.readFileSync(historyStore, 'utf8'));
  const questions = JSON.parse(fs.readFileSync(questionSet, 'utf8'));
  assert.equal(history.length, 2);
  assert.equal(new Set(history.map(item => item.id)).size, 2);
  assert.ok(history.some(item => /^hist-fp-[a-f0-9]{24}$/.test(item.id) && item.title === legacyRecord.label));
  assert.deepEqual(questions, ['已有问题', fullRecord.input]);
});
