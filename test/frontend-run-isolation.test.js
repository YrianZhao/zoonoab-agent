const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const test = require('node:test');

const html = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');

function extractSwitchCase(source, marker) {
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, marker + ' should exist');
  const nextCase = source.indexOf('\n            case ', start + marker.length);
  const end = nextCase === -1 ? source.indexOf('\n        }\n    }', start) : nextCase;
  assert.notEqual(end, -1, marker + ' should have an end');
  return source.slice(start, end);
}

function extractFunction(source, signature) {
  const start = source.indexOf(signature);
  assert.notEqual(start, -1, signature + ' should exist');
  const parenStart = source.indexOf('(', start);
  let searchStart = start;
  if (parenStart !== -1) {
    let parenDepth = 0;
    for (let i = parenStart; i < source.length; i++) {
      const ch = source[i];
      if (ch === '(') parenDepth++;
      if (ch === ')') parenDepth--;
      if (parenDepth === 0) {
        searchStart = i;
        break;
      }
    }
  }
  const braceStart = source.indexOf('{', searchStart);
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

test('frontend assigns a client run id before sending workflow messages', () => {
  const startChatRun = extractFunction(html, 'function startChatRun');
  const sendQuickDesignWorkflow = extractFunction(html, 'function sendQuickDesignWorkflow');
  const sendMessage = extractFunction(html, 'function sendMessage');

  assert.match(html, /let\s+currentClientRunId\s*=\s*['"]{2}/);
  assert.match(html, /function\s+createClientRunId\s*\(/);
  assert.match(startChatRun, /currentClientRunId\s*=\s*createClientRunId\(\)/);
  assert.match(startChatRun, /return\s+currentClientRunId/);
  assert.match(sendQuickDesignWorkflow, /const\s+clientRunId\s*=\s*startChatRun\(text\)/);
  assert.match(sendQuickDesignWorkflow, /type:\s*'quick_design'[\s\S]*clientRunId/);
  assert.match(sendMessage, /const\s+clientRunId\s*=\s*startChatRun\(text\)/);
  assert.match(sendMessage, /type:\s*'user_msg'[\s\S]*clientRunId/);
});

test('frontend cancellation includes and retires the active client run id', () => {
  const cancelTask = extractFunction(html, 'function cancelTask');

  assert.match(html, /let\s+cancelledClientRunIds\s*=\s*new\s+Set\(\)/);
  assert.match(cancelTask, /const\s+clientRunId\s*=\s*currentClientRunId/);
  assert.match(cancelTask, /cancelledClientRunIds\.add\(clientRunId\)/);
  assert.match(cancelTask, /type:\s*'cancel'[\s\S]*clientRunId/);
  assert.match(cancelTask, /retireClientRun\(clientRunId\)/);
});

test('frontend ignores stale run control messages before mutating UI state', () => {
  const cancelledCase = extractSwitchCase(html, "case 'cancelled':");
  const errorCase = extractSwitchCase(html, "case 'error':");
  const doneCase = extractSwitchCase(html, "case 'done':");

  assert.match(html, /function\s+isStaleRunMessage\s*\(/);
  assert.match(cancelledCase, /if\s*\(isStaleRunMessage\(msg\)\)\s*break/);
  assert.match(errorCase, /if\s*\(isStaleRunMessage\(msg\)\)\s*break/);
  assert.match(doneCase, /if\s*\(isStaleRunMessage\(msg\)\)\s*break/);
  assert.match(cancelledCase, /retireClientRun\(msg\.clientRunId\)/);
  assert.match(errorCase, /retireClientRun\(msg\.clientRunId\)/);
  assert.match(doneCase, /retireClientRun\(msg\.clientRunId\)/);
});
