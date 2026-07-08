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
