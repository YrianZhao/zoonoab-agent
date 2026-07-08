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

test('new chat runs clear per-run 3D modal state before backend replies arrive', () => {
  const startChatRun = extractFunction(html, 'function startChatRun');

  assert.match(html, /let\s+currentRunHas3D\s*=\s*false/);
  assert.match(html, /function\s+resetCurrentRun3DState\s*\(/);
  assert.match(startChatRun, /resetCurrentRun3DState\(\)/);
});

test('show_3d marks only the current run as eligible for automatic structure display', () => {
  const show3dCase = extractSwitchCase(html, "case 'show_3d':");

  assert.match(html, /function\s+markCurrentRunHas3D\s*\(/);
  assert.match(show3dCase, /markCurrentRunHas3D\(\)/);
});

test('done handler cannot directly reopen a stale structure modal from a previous run', () => {
  const doneCase = extractSwitchCase(html, "case 'done':");

  assert.match(html, /function\s+maybeOpenBinderSpinModalForCurrentRun\s*\(/);
  assert.match(doneCase, /maybeOpenBinderSpinModalForCurrentRun\(\)/);
  assert.doesNotMatch(
    doneCase.replace(/maybeOpenBinderSpinModalForCurrentRun\(\)/g, ''),
    /openBinderSpinModal\s*\(/,
    'done must go through the current-run 3D gate instead of opening the modal directly'
  );
});

test('assistant thinking indicator starts on model wait and stops before final output', () => {
  const thinkingCase = extractSwitchCase(html, "case 'assistant_thinking':");
  const agentCase = extractSwitchCase(html, "case 'agent_msg':");
  const doneCase = extractSwitchCase(html, "case 'done':");
  const errorCase = extractSwitchCase(html, "case 'error':");

  assert.match(html, /box\.id\s*=\s*['"]assistantThinkingIndicator['"]/);
  assert.match(html, /getStream\(\)\.appendChild\(box\)/);
  assert.match(html, /function\s+startAssistantThinking\s*\(/);
  assert.match(html, /function\s+stopAssistantThinking\s*\(/);
  assert.match(thinkingCase, /startAssistantThinking\(msg\)/);
  assert.match(agentCase, /stopAssistantThinking\(\)/);
  assert.match(doneCase, /stopAssistantThinking\(\)/);
  assert.match(errorCase, /stopAssistantThinking\(\)/);
});

test('candidate gallery thumbnails receive deterministic per-candidate pose seeds', () => {
  const frameUrlFunction = extractFunction(html, 'function buildMoleculeFrameUrl');
  const initGalleryViewer = extractFunction(html, 'function initGalleryViewer');
  const galleryHtml = fs.readFileSync(path.join(__dirname, '..', 'public', 'gallery-mol.html'), 'utf8');

  assert.match(frameUrlFunction, /poseSeed/);
  assert.match(frameUrlFunction, /viewerPoseSeed/);
  assert.match(initGalleryViewer, /idx/);
  assert.match(initGalleryViewer, /buildMoleculeFrameUrl\('\/gallery-mol\.html',\s*pdbId,\s*[^,]+,\s*idx\)/);
  assert.match(galleryHtml, /params\.get\('poseSeed'\)/);
  assert.match(galleryHtml, /applyViewerPose/);
  assert.match(galleryHtml, /glv\.rotate/);
});
