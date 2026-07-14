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
  const startChatRun = extractFunction(html, 'function startChatRun');
  const thinkingCase = extractSwitchCase(html, "case 'assistant_thinking':");
  const agentCase = extractSwitchCase(html, "case 'agent_msg':");
  const doneCase = extractSwitchCase(html, "case 'done':");
  const errorCase = extractSwitchCase(html, "case 'error':");

  assert.match(html, /box\.id\s*=\s*['"]assistantThinkingIndicator['"]/);
  assert.match(html, /getStream\(\)\.appendChild\(box\)/);
  assert.match(html, /function\s+startAssistantThinking\s*\(/);
  assert.match(html, /function\s+stopAssistantThinking\s*\(/);
  assert.match(startChatRun, /startAssistantThinking\(\{\s*topic:\s*text\s*,\s*local:\s*true\s*\}\)/);
  assert.match(thinkingCase, /startAssistantThinking\(msg\)/);
  assert.match(agentCase, /stopAssistantThinking\(\)/);
  assert.match(doneCase, /stopAssistantThinking\(\)/);
  assert.match(errorCase, /stopAssistantThinking\(\)/);
});

test('skip thinking acknowledgement does not duplicate the local pending log', () => {
  const skipThinking = extractFunction(html, 'function skipThinking');
  const ackCase = extractSwitchCase(html, "case 'skip_thinking_ack':");

  assert.match(skipThinking, /appendLog\('\[System\] 正在收束当前阶段，后续流程将进入快速思考\.\.\.'\)/);
  assert.doesNotMatch(
    ackCase,
    /appendLog\('\[System\] '\s*\+/,
    'server acknowledgement should not append a second pending skip-thinking line'
  );
  assert.match(ackCase, /setSkipThinkingButtonState\('pending'\)/);
});

test('workflow auto-scroll only follows while the page is pinned near the bottom', () => {
  const scrollBottom = extractFunction(html, 'function scrollBottom');

  assert.match(html, /const\s+AUTO_SCROLL_BOTTOM_THRESHOLD\s*=/);
  assert.match(html, /const\s+AUTO_SCROLL_FOLLOW_SETTLE_MS\s*=/);
  assert.match(html, /let\s+autoScrollPinnedToBottom\s*=/);
  assert.match(html, /let\s+autoScrollFollowUntil\s*=/);
  assert.match(html, /function\s+isPageNearBottom\s*\(/);
  assert.match(html, /function\s+captureAutoScrollState\s*\(/);
  assert.match(html, /function\s+extendAutoScrollFollowWindow\s*\(/);
  assert.match(html, /function\s+shouldFollowAutoScroll\s*\(/);
  assert.match(scrollBottom, /autoScrollPinnedToBottom/);
  assert.match(scrollBottom, /shouldFollowAutoScroll/);
  assert.match(scrollBottom, /extendAutoScrollFollowWindow/);
  assert.match(scrollBottom, /return\s+false/);
  assert.match(scrollBottom, /window\.scrollTo/);
  assert.doesNotMatch(
    scrollBottom,
    /function\s+scrollBottom\s*\(\)\s*{\s*window\.scrollTo/s,
    'scrollBottom must not unconditionally move the page'
  );
});

test('workflow auto-scroll observes content growth while pinned and cancels when user scrolls away', () => {
  assert.match(html, /function\s+handleAutoScrollContentGrowth\s*\(/);
  assert.match(html, /new\s+ResizeObserver\s*\(\s*handleAutoScrollContentGrowth\s*\)/);
  assert.match(html, /autoScrollResizeObserver\.observe\(document\.body\)/);

  const growthHandler = extractFunction(html, 'function handleAutoScrollContentGrowth');
  assert.match(growthHandler, /autoScrollPinnedToBottom/);
  assert.match(growthHandler, /autoScrollFollowUntil/);
  assert.match(growthHandler, /Date\.now\(\)\s*<=\s*autoScrollFollowUntil/);
  assert.match(growthHandler, /scrollBottom\(\{\s*behavior:\s*'auto'/);

  const scrollHandlerStart = html.indexOf("window.addEventListener('scroll'");
  assert.notEqual(scrollHandlerStart, -1, 'scroll event handler should exist');
  const scrollHandler = html.slice(scrollHandlerStart, html.indexOf('}, { passive: true });', scrollHandlerStart));
  assert.match(scrollHandler, /autoScrollFollowUntil\s*=\s*0/);
});

test('final workflow modal preparation does not force page scrolling when the user has scrolled away', () => {
  const doneCase = extractSwitchCase(html, "case 'done':");
  const scrollToBottomThen = extractFunction(doneCase, 'function scrollToBottomThen');

  assert.match(scrollToBottomThen, /captureAutoScrollState\(\)/);
  assert.match(scrollToBottomThen, /if\s*\(\s*!autoScroll\.wasAtBottom\s*\)/);
  assert.match(scrollToBottomThen, /cb\(\)/);
});

test('agent message typewriter uses bounded pacing with a fast-forward path', () => {
  const typewriter = extractFunction(html, 'function typewriterEffect');

  assert.match(html, /const\s+TYPEWRITER_TICK_MS\s*=\s*24/);
  assert.match(html, /const\s+TYPEWRITER_TARGET_MIN_MS\s*=\s*720/);
  assert.match(html, /const\s+TYPEWRITER_TARGET_MAX_MS\s*=\s*10000/);
  assert.match(html, /const\s+TYPEWRITER_MS_PER_CHAR\s*=\s*16/);
  assert.match(html, /const\s+TYPEWRITER_SENTENCE_PAUSE_MS\s*=\s*96/);
  assert.match(html, /const\s+TYPEWRITER_CLAUSE_PAUSE_MS\s*=\s*48/);
  assert.match(typewriter, /TYPEWRITER_TICK_MS/);
  assert.match(typewriter, /TYPEWRITER_TARGET_MAX_MS/);
  assert.match(typewriter, /TYPEWRITER_TARGET_MIN_MS/);
  assert.match(typewriter, /TYPEWRITER_MS_PER_CHAR/);
  assert.match(typewriter, /accelerated \? 10/);
  assert.doesNotMatch(typewriter, /target\s+2-4s/, 'stale slower timing comment should be removed');
});

test('candidate gallery thumbnails receive deterministic per-candidate pose seeds', () => {
  const frameUrlFunction = extractFunction(html, 'function buildMoleculeFrameUrl');
  const initGalleryViewer = extractFunction(html, 'function initGalleryViewer');
  const viewerHtml = fs.readFileSync(path.join(__dirname, '..', 'public', 'viewer-full.html'), 'utf8');

  assert.match(frameUrlFunction, /poseSeed/);
  assert.match(frameUrlFunction, /viewerPoseSeed/);
  assert.match(initGalleryViewer, /idx/);
  assert.match(initGalleryViewer, /buildMoleculeFrameUrl\('\/viewer-full\.html',\s*pdbId,\s*[^,]+,\s*idx,\s*\{\s*compact:\s*true\s*\}\)/);
  assert.match(viewerHtml, /params\.get\('poseSeed'\)/);
  assert.match(viewerHtml, /applyViewerPose/);
  assert.match(viewerHtml, /glv\.rotate/);
});

test('3D modal title bar shows the current selection reason without covering controls', () => {
  const buildSelectionReason = extractFunction(html, 'function buildSelectionReasonHtml');
  const openMolModal = extractFunction(html, 'function openMolModal');
  const openHistory3D = extractFunction(html, 'function openHistory3D');
  const normalizeBinderPayload = extractFunction(html, 'function normalizeBinderPayload');
  const titleCssStart = html.indexOf('.mol-modal-title {');
  assert.notEqual(titleCssStart, -1, 'modal title CSS should exist');
  const titleCss = html.slice(titleCssStart, html.indexOf('}', titleCssStart) + 1);

  assert.match(html, /function\s+buildSelectionReasonHtml\s*\(/);
  assert.match(html, /\.mol-modal-reason\s*{/);
  assert.match(html, /-webkit-line-clamp:\s*2/);
  assert.match(buildSelectionReason, /String\(meta\.selectionReason \|\| meta\.reason \|\| meta\.targetSelectionReason\)\.trim\(\)/);
  assert.match(buildSelectionReason, /title="' \+ escHtml\('\u9009\u62e9\u7406\u7531\uff1a' \+ reason\)/);
  assert.doesNotMatch(buildSelectionReason, /replace\(\/\\s\+\//, 'selection reason text should not be rewritten before visual clamping');
  assert.match(titleCss, /flex-direction:\s*column/);
  assert.doesNotMatch(titleCss, /flex-direction:\s*row/);
  assert.match(html, /\.mol-modal-reason\s*{[\s\S]*max-width:\s*100%/);
  assert.match(html, /\.mol-modal-subtitle\s*{[\s\S]*max-width:\s*100%/);
  assert.match(html, /\.mol-modal-close\s*{[\s\S]*flex-shrink:\s*0/);
  assert.match(normalizeBinderPayload, /selectionReason:\s*meta\.selectionReason\s*\|\|\s*meta\.reason\s*\|\|\s*meta\.targetSelectionReason\s*\|\|\s*''/);
  assert.match(openMolModal, /buildSelectionReasonHtml\(meta\)/);
  assert.match(openMolModal, /titleEl\.innerHTML\s*=\s*'<div class="mol-modal-title-copy">/);
  assert.match(openHistory3D, /buildSelectionReasonHtml\(model\)/);
  assert.match(openHistory3D, /titleEl\.innerHTML\s*=\s*'<div class="mol-modal-title-copy">/);
  assert.doesNotMatch(openMolModal, /quick_design|route|profile|API|大模型/);
});

test('automatic spin modal passes autoSpin into viewer without adding a title badge', () => {
  const openMolModal = extractFunction(html, 'function openMolModal');
  const openBinderSpinModal = extractFunction(html, 'function openBinderSpinModal');

  assert.match(openMolModal, /options\s*=\s*options\s*\|\|\s*\{\}/);
  assert.match(openMolModal, /const\s+shouldAutoSpin\s*=\s*options\.autoSpin\s*!==\s*false/);
  assert.match(openMolModal, /autoSpin:\s*shouldAutoSpin/);
  assert.match(openMolModal, /buildMoleculeFrameUrl\('\/viewer-full\.html',\s*pdbId,\s*displayTitle,\s*undefined,\s*\{/);
  assert.match(openBinderSpinModal, /openMolModal\(meta\.id,\s*meta\.candidateLabel\s*\|\|\s*meta\.name\s*\|\|\s*meta\.id,\s*\{\s*autoSpin:\s*true\s*\}\)/);
  assert.match(openBinderSpinModal, /type:\s*'setSpin'/);
  assert.doesNotMatch(openBinderSpinModal, /\.click\(\)/);
  assert.doesNotMatch(openBinderSpinModal, /querySelectorAll\('button'\)/);
  assert.doesNotMatch(openBinderSpinModal, /autoSpinBadge/);
  assert.doesNotMatch(openBinderSpinModal, /titleMain\.appendChild\(badge\)/);
});
