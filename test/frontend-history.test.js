const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const test = require('node:test');

const html = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');

function extractFunction(source, signature) {
  const start = source.indexOf(signature);
  assert.notEqual(start, -1, signature + ' should exist');
  const braceStart = source.indexOf('{', start);
  assert.notEqual(braceStart, -1, signature + ' should have a body');
  let depth = 0;
  for (let i = braceStart; i < source.length; i++) {
    const ch = source[i];
    if (ch === '{') depth++;
    if (ch === '}') depth--;
    if (depth === 0) return source.slice(start, i + 1);
  }
  throw new Error(signature + ' body was not closed');
}

test('workflow history stores full visible output and shown 3D model metadata', () => {
  assert.match(html, /let\s+activeHistoryRun\s*=\s*null/);
  assert.match(html, /function\s+startHistoryRun\s*\(/);
  assert.match(html, /function\s+recordHistoryEvent\s*\(/);
  assert.match(html, /function\s+recordHistoryResults\s*\(/);
  assert.match(html, /function\s+recordHistory3D\s*\(/);
  assert.match(html, /function\s+finalizeHistoryRun\s*\(/);

  const handleMsg = extractFunction(html, 'function handleMsg');
  assert.match(handleMsg, /recordHistoryEvent\('assistant'/);
  assert.match(handleMsg, /recordHistoryEvent\('log'/);
  assert.match(handleMsg, /recordHistoryEvent\('tool_call'/);
  assert.match(handleMsg, /recordHistoryEvent\('tool_result'/);
  assert.match(handleMsg, /recordHistoryEvent\('tasks'/);
  assert.match(handleMsg, /recordHistoryEvent\('subagents'/);
  assert.match(handleMsg, /recordHistoryEvent\('plan'/);
  assert.match(handleMsg, /recordHistoryEvent\('workflow_result'/);
  assert.match(handleMsg, /recordHistoryResults\(msg\.sequences,\s*msg\.stats\)/);
  assert.match(handleMsg, /recordHistory3D\(msg\.primaryPDB,\s*msg\.allPDBs,\s*msg\.label,\s*msg\.binderData/);
  assert.match(handleMsg, /finalizeHistoryRun\('completed'\)/);
  assert.doesNotMatch(handleMsg, /saveHistory\(\{\s*label,\s*ts:\s*Date\.now\(\)\s*\}\)/);

  const demoMsg = extractFunction(html, 'function demoMsg');
  assert.match(demoMsg, /recordHistoryEvent\('assistant'/);
});

test('knowledge base exposes history as a separate public-library entry with detail view', () => {
  assert.match(html, /id="kbHistoryEntry"/);
  assert.match(html, /onclick="openHistoryPanel\(\)"/);
  assert.match(html, /id="kbHistoryPanel"/);
  assert.match(html, /id="kbHistoryList"/);
  assert.match(html, /id="kbHistoryDetail"/);
  assert.match(html, /function\s+openHistoryPanel\s*\(/);
  assert.match(html, /function\s+renderHistoryPanel\s*\(/);
  assert.match(html, /function\s+openHistoryDetail\s*\(/);

  const commonIndex = html.indexOf("data-project=\"common\"");
  const historyIndex = html.indexOf('id="kbHistoryEntry"');
  assert.ok(commonIndex >= 0 && historyIndex > commonIndex, 'history entry should be below public library');

  const sidebarStart = html.indexOf('id="agentTasksSidebar"');
  if (sidebarStart >= 0) {
    const sidebarEnd = html.indexOf('id="chatStream"', sidebarStart);
    const sidebarMarkup = html.slice(sidebarStart, sidebarEnd >= 0 ? sidebarEnd : sidebarStart + 5000);
    assert.doesNotMatch(sidebarMarkup, /kbHistoryEntry|kbHistoryPanel|projectHistoryList/);
  }
});
