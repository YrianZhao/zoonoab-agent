const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const test = require('node:test');

const html = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');

function extractFunction(source, signature) {
  const start = source.indexOf(signature);
  assert.notEqual(start, -1, signature + ' should exist');
  const parenStart = source.indexOf('(', start);
  assert.notEqual(parenStart, -1, signature + ' should have parameters');
  let parenDepth = 0;
  let parenEnd = -1;
  for (let i = parenStart; i < source.length; i++) {
    const ch = source[i];
    if (ch === '(') parenDepth++;
    if (ch === ')') parenDepth--;
    if (parenDepth === 0) {
      parenEnd = i;
      break;
    }
  }
  assert.notEqual(parenEnd, -1, signature + ' parameters should close');
  const braceStart = source.indexOf('{', parenEnd);
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
  assert.match(html, /function\s+historyFullText\s*\(/);
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
  assert.match(handleMsg, /recordHistoryResearchTrace\(traceMsg\)/);
  assert.match(handleMsg, /recordHistoryResearchTraceComplete\(/);
  assert.match(handleMsg, /recordHistoryResults\(msg\.sequences,\s*msg\.stats\)/);
  assert.match(handleMsg, /recordHistory3D\(msg\.primaryPDB,\s*msg\.allPDBs,\s*msg\.label,\s*msg\.binderData/);
  assert.match(handleMsg, /finalizeHistoryRun\('completed'\)/);
  assert.doesNotMatch(handleMsg, /saveHistory\(\{\s*label,\s*ts:\s*Date\.now\(\)\s*\}\)/);

  const demoMsg = extractFunction(html, 'function demoMsg');
  assert.match(demoMsg, /recordHistoryEvent\('assistant'/);
});

test('research trace history deduplicates step updates and preserves terminal status', () => {
  const recordTrace = extractFunction(html, 'function recordHistoryResearchTrace');
  const recordTraceComplete = extractFunction(html, 'function recordHistoryResearchTraceComplete');
  const structuredEvent = extractFunction(html, 'function historyStructuredEventHtml');
  const renderHistoryDetail = extractFunction(html, 'function renderHistoryDetail');

  assert.match(recordTrace, /event\.data\.clientRunId\s*===\s*clientRunId\s*&&\s*event\.data\.stepId\s*===\s*stepId/);
  assert.match(recordTrace, /recordHistoryEvent\('research_trace'/);
  assert.match(recordTrace, /resolveResearchTraceTerminalStatus\(existing\.data\.status,\s*data\.status\)/);
  assert.match(recordTraceComplete, /event\.data\.clientRunId\s*===\s*clientRunId/);
  assert.match(recordTraceComplete, /if\s*\(event\.data\.status\s*===\s*'active'\)\s*event\.data\.status\s*=\s*status/);
  assert.match(recordTraceComplete, /recordHistoryEvent\('research_trace_complete'/);
  assert.match(structuredEvent, /event\.type\s*===\s*'research_trace'/);
  assert.match(structuredEvent, /event\.type\s*===\s*'research_trace_complete'/);
  assert.match(renderHistoryDetail, /research_trace:'\u5206\u6790\u8f68\u8ff9'/);
  assert.match(renderHistoryDetail, /research_trace_complete:'\u5206\u6790\u8f68\u8ff9\u5b8c\u6210'/);
});

test('workflow history keeps full transcript text instead of summary-sized snippets', () => {
  const startHistoryRun = extractFunction(html, 'function startHistoryRun');
  const recordHistoryEvent = extractFunction(html, 'function recordHistoryEvent');
  const historyTextHtml = extractFunction(html, 'function historyTextHtml');

  assert.match(startHistoryRun, /input:\s*historyFullText\(text\)/);
  assert.match(recordHistoryEvent, /text:\s*payload\.text\s*!==\s*undefined\s*\?\s*historyFullText\(payload\.text\)\s*:/);
  assert.match(recordHistoryEvent, /historyFullJsonClone\(payload\.params\)/);
  assert.match(recordHistoryEvent, /historyFullJsonClone\(payload\.result\)/);
  assert.match(recordHistoryEvent, /historyFullJsonClone\(payload\.data\)/);
  assert.doesNotMatch(recordHistoryEvent, /truncateHistoryText\(payload\.text,\s*12000\)/);
  assert.doesNotMatch(recordHistoryEvent, /historyJsonClone\(payload\.result,\s*3000\)/);
  assert.doesNotMatch(recordHistoryEvent, /events\.slice\(-?_HIST_EVENT_MAX\)/);
  assert.doesNotMatch(html, /_HIST_EVENT_MAX/);
  assert.doesNotMatch(historyTextHtml, /truncateHistoryText/);
});

test('workflow history is persisted from submit through cancellation and errors', () => {
  assert.match(html, /function\s+persistActiveHistoryRun\s*\(/);

  const startHistoryRun = extractFunction(html, 'function startHistoryRun');
  const recordHistoryEvent = extractFunction(html, 'function recordHistoryEvent');
  const finalizeHistoryRun = extractFunction(html, 'function finalizeHistoryRun');
  const cancelTask = extractFunction(html, 'function cancelTask');
  const handleMsg = extractFunction(html, 'function handleMsg');

  assert.match(startHistoryRun, /status:\s*'running'/);
  assert.match(startHistoryRun, /recordHistoryEvent\('user',\s*\{\s*text\s*\}\)/);
  assert.match(startHistoryRun, /persistActiveHistoryRun\('submitted',\s*\{\s*immediate:\s*true\s*\}\)/);
  assert.match(recordHistoryEvent, /persistActiveHistoryRun\('event'\)/);
  assert.match(finalizeHistoryRun, /statusDetail/);
  assert.match(finalizeHistoryRun, /activeHistoryRun\.error\s*=\s*status\s*===\s*'error'/);
  assert.match(cancelTask, /finalizeHistoryRun\('cancelled',\s*'用户手动停止工作流'\)/);
  assert.match(handleMsg, /finalizeHistoryRun\('cancelled',\s*msg\.text\s*\|\|\s*'服务端确认工作流已取消'\)/);
  assert.match(handleMsg, /finalizeHistoryRun\('error',\s*msg\.text\s*\|\|\s*'服务器错误，请重试'\)/);
  assert.match(html, /addEventListener\('pagehide'[\s\S]*persistActiveHistoryRun\('pagehide'/);
});

test('history detail presents the user question and read-only workflow transcript', () => {
  const renderHistoryDetail = extractFunction(html, 'function renderHistoryDetail');

  assert.match(renderHistoryDetail, /用户问题/);
  assert.match(renderHistoryDetail, /模型 \/ 工作流完整输出/);
  assert.match(renderHistoryDetail, /statusDetail/);
  assert.match(renderHistoryDetail, /outputEvents\s*=\s*\(record\.events\s*\|\|\s*\[\]\)\.filter\(event\s*=>\s*event\s*&&\s*event\.type\s*!==\s*'user'\)/);
});

test('history 3D model viewing is read-only and does not restore into the live workflow', () => {
  assert.match(html, /function\s+openHistory3D\s*\(/);

  const renderHistoryModels = extractFunction(html, 'function renderHistoryModels');
  assert.match(renderHistoryModels, /openHistory3D\('/);
  assert.doesNotMatch(renderHistoryModels, /restoreHistory3D/);

  const openHistory3D = extractFunction(html, 'function openHistory3D');
  assert.match(openHistory3D, /buildHistoryMoleculeFrameUrl/);
  assert.doesNotMatch(openHistory3D, /switchView\('chat'\)/);
  assert.doesNotMatch(openHistory3D, /renderViewerSection/);
  assert.doesNotMatch(openHistory3D, /binderDataList\s*=/);
  assert.doesNotMatch(openHistory3D, /useLocalPDB\s*=/);
  assert.doesNotMatch(openHistory3D, /getStream\(\)\.appendChild/);
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

  assert.doesNotMatch(html, /id="projectHistorySection"/);
  assert.doesNotMatch(html, /id="projectHistoryList"/);
  assert.doesNotMatch(html, /历史会话/);
  assert.doesNotMatch(html, /function\s+renderProjectHistory\s*\(/);
});

test('knowledge base exposes common molecular structures for PDB inspection', () => {
  assert.match(html, /id="kbLocalPDBEntry"/);
  assert.match(html, /onclick="openLocalPDBLibrary\(\)"/);
  assert.match(html, /常见分子模型结构/);
  assert.doesNotMatch(html, /本地分子模型结构/);
  assert.match(html, /id="kbLocalPDBCount"/);
  assert.match(html, /function\s+loadLocalPDBModels\s*\(/);
  assert.match(html, /function\s+renderLocalPDBLibrary\s*\(/);
  assert.match(html, /function\s+openLocalPDBLibrary\s*\(/);
  assert.match(html, /function\s+openLocalPDBModel\s*\(/);
  assert.match(html, /function\s+buildLocalPDBModelFrameUrl\s*\(/);

  const commonIndex = html.indexOf("data-project=\"common\"");
  const localIndex = html.indexOf('id="kbLocalPDBEntry"');
  assert.ok(commonIndex >= 0 && localIndex > commonIndex, 'local structure library entry should be under the public library area');

  const loader = extractFunction(html, 'async function loadLocalPDBModels');
  assert.match(loader, /fetch\('\/api\/pdb\/local-models'/);
  assert.match(loader, /kbLocalPDBModels\s*=/);

  const renderer = extractFunction(html, 'function renderLocalPDBLibrary');
  assert.match(renderer, /kbLocalPDBModels/);
  assert.match(renderer, /查看结构/);
  assert.match(renderer, /openLocalPDBModel\(/);
  assert.match(renderer, /靶点 \/ 类型/);
  assert.match(renderer, /targetDisplay/);
  assert.match(renderer, /structureKind/);
  assert.match(renderer, /antigenChains/);
  assert.match(renderer, /antibodyChains/);
  assert.match(html, /function\s+renderKBStats\s*\(/);
  assert.match(renderer, /renderKBStats\(\s*models\.length[\s\S]*本地结构/);
  assert.doesNotMatch(renderer, /文件大小/);
  assert.doesNotMatch(renderer, /formatLocalPDBSize/);
  assert.doesNotMatch(renderer, /sizeBytes/);
  assert.doesNotMatch(renderer, /AI 生成/);

  const opener = extractFunction(html, 'function openLocalPDBModel');
  const frameUrl = extractFunction(html, 'function buildLocalPDBModelFrameUrl');
  assert.match(opener, /buildLocalPDBModelFrameUrl\(model\)/);
  assert.match(frameUrl, /autoSpin=1/);
  assert.doesNotMatch(opener, /binderDataList\s*=/);
  assert.doesNotMatch(opener, /renderViewerSection/);
});

test('history and common molecular structure viewers auto-spin on first open', () => {
  const historyFrameUrl = extractFunction(html, 'function buildHistoryMoleculeFrameUrl');
  const localFrameUrl = extractFunction(html, 'function buildLocalPDBModelFrameUrl');

  assert.match(historyFrameUrl, /autoSpin=1/);
  assert.match(localFrameUrl, /autoSpin=1/);
});

test('history titles use the original user input instead of workflow summary labels', () => {
  const makeHistoryTitle = extractFunction(html, 'function makeHistoryTitle');
  const normalizeHistoryRecord = extractFunction(html, 'function normalizeHistoryRecord');
  const recordHistoryResults = extractFunction(html, 'function recordHistoryResults');
  const renderHistoryPanel = extractFunction(html, 'function renderHistoryPanel');
  const renderHistoryDetail = extractFunction(html, 'function renderHistoryDetail');

  assert.doesNotMatch(makeHistoryTitle, /stats/);
  assert.doesNotMatch(makeHistoryTitle, /分子设计/);
  assert.match(normalizeHistoryRecord, /title:\s*makeHistoryTitle\(input\s*\|\|\s*\(entry\s*&&\s*\(entry\.title\s*\|\|\s*entry\.label\)\)\)/);
  assert.doesNotMatch(recordHistoryResults, /makeHistoryTitle\(activeHistoryRun\.input,\s*stats/);
  assert.match(recordHistoryResults, /activeHistoryRun\.title\s*=\s*makeHistoryTitle\(activeHistoryRun\.input\)/);
  assert.match(renderHistoryPanel, /historyDisplayTitle\(item\)/);
  assert.match(renderHistoryDetail, /historyDisplayTitle\(record\)/);
});

test('submitted user questions are also saved to a question-only backend test set', () => {
  assert.match(html, /function\s+saveQuestionTestSet\s*\(/);

  const saveQuestionTestSet = extractFunction(html, 'function saveQuestionTestSet');
  const startHistoryRun = extractFunction(html, 'function startHistoryRun');

  assert.match(saveQuestionTestSet, /fetch\('\/api\/question-test-set'/);
  assert.match(saveQuestionTestSet, /method:\s*'POST'/);
  assert.match(saveQuestionTestSet, /question:\s*historyFullText\(text\)/);
  assert.doesNotMatch(saveQuestionTestSet, /events|results|models3d|statusDetail|error/);
  assert.match(startHistoryRun, /saveQuestionTestSet\(text\)/);
});

test('knowledge base history is loaded from shared server APIs instead of browser localStorage', () => {
  const historyBlockStart = html.indexOf('CONVERSATION HISTORY');
  assert.ok(historyBlockStart >= 0, 'history block should exist');
  const historyBlockEnd = html.indexOf('function formatHistoryTime', historyBlockStart);
  assert.ok(historyBlockEnd > historyBlockStart, 'history persistence block should be bounded');
  const historyBlock = html.slice(historyBlockStart, historyBlockEnd);

  assert.match(historyBlock, /fetch\('\/api\/history'/);
  assert.match(historyBlock, /method:\s*'POST'/);
  assert.match(historyBlock, /method:\s*'DELETE'/);
  assert.match(html, /refreshHistoryFromServer\(\)/);
  assert.doesNotMatch(historyBlock, /localStorage\.(getItem|setItem|removeItem)\(_HIST_KEY\)/);
});
