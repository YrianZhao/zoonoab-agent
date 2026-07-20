const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const test = require('node:test');

const server = fs.readFileSync(path.join(__dirname, '..', 'server.js'), 'utf8');

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

test('workflow delays use a global scale so visible progress is faster by default', () => {
  const scaledDelay = extractFunction(server, 'function scaledWorkflowDelayMs');
  const workflowDelay = extractFunction(server, 'function workflowDelay');

  assert.match(server, /const\s+WORKFLOW_DELAY_SCALE\s*=/);
  assert.match(server, /const\s+WORKFLOW_MIN_DELAY_MS\s*=/);
  assert.match(scaledDelay, /WORKFLOW_DELAY_SCALE/);
  assert.match(scaledDelay, /WORKFLOW_MIN_DELAY_MS/);
  assert.match(workflowDelay, /scaledWorkflowDelayMs\(ms\)/);
  assert.doesNotMatch(
    workflowDelay,
    /const\s+normalMs\s*=\s*Number\(ms\)\s*\|\|\s*0/,
    'workflowDelay should not wait the original unscaled duration'
  );
});

test('post-target pacing is condensed while explicit skip keeps the visible delay budget under 30 seconds', () => {
  const workflowDelay = extractFunction(server, 'function workflowDelay');
  const routedWorkflow = extractFunction(server, 'async function runDemoRoutedWorkflow');
  const fastDelay = Number(server.match(/WORKFLOW_FAST_DELAY_MS\s*=\s*Number\([^\n]+\|\|\s*(\d+)\)/)[1]);
  const visibleDelayCount = (server.slice(
    server.indexOf('async function runWorkflow('),
    server.indexOf('// ─── Risk Site Scan')
  ).match(/await\s+delay\(/g) || []).length;

  assert.equal(fastDelay, 40);
  assert.match(server, /const\s+WORKFLOW_POST_TARGET_DELAY_MS\s*=/);
  assert.match(workflowDelay, /sess\.condensedWorkflow/);
  assert.match(workflowDelay, /WORKFLOW_POST_TARGET_DELAY_MS/);
  assert.ok(visibleDelayCount * fastDelay < 30_000, 'server-side visible waits must fit inside the 30 second skip budget');
  assert.match(routedWorkflow, /pacing:\s*'target-review'/);
  assert.match(routedWorkflow, /type:\s*'workflow_pacing'[\s\S]*mode:\s*'condensed'/);
  assert.match(routedWorkflow, /completeResearchTrace\([^\n]+\'靶点评审已完成'/);
});

test('debug fast workflow mode is isolated to explicitly flagged websocket runs', () => {
  const runSocketTask = extractFunction(server, 'function runSocketTask');

  assert.match(runSocketTask, /Boolean\(msg\s*&&\s*msg\.debugFastWorkflow\)/);
  assert.match(runSocketTask, /sess\.fastForwardWorkflow\s*=\s*debugFastWorkflow/);
  assert.match(runSocketTask, /sess\.skipThinking\s*=\s*false/);
});
