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

test('debug fast workflow switch is gated and opt-in per workflow message', () => {
  const toggleDrZhaoWorkflow = extractFunction(html, 'function toggleDrZhaoWorkflow');
  const shouldUseDebugFastWorkflow = extractFunction(html, 'function shouldUseDebugFastWorkflow');
  const sendQuickDesignWorkflow = extractFunction(html, 'function sendQuickDesignWorkflow');
  const sendMessage = extractFunction(html, 'function sendMessage');

  assert.match(html, /id="drZhaoWorkflowToggle"/);
  assert.match(html, /let\s+debugFastWorkflowEnabled\s*=\s*false/);
  assert.match(toggleDrZhaoWorkflow, /prompt\('请输入赵博士验证口令'\)/);
  assert.match(toggleDrZhaoWorkflow, /code\s*!==\s*'123456'/);
  assert.match(shouldUseDebugFastWorkflow, /debugFastWorkflowEnabled\s*===\s*true/);
  assert.match(sendQuickDesignWorkflow, /debugFastWorkflow:\s*shouldUseDebugFastWorkflow\(\)/);
  assert.match(sendMessage, /debugFastWorkflow:\s*shouldUseDebugFastWorkflow\(\)/);
});

test('debug fast workflow entry is hidden inside the team member list', () => {
  const teamMembersIndex = html.indexOf('团队成员 (4)');
  const liIndex = html.indexOf('李博士', teamMembersIndex);
  const zhaoIndex = html.indexOf('id="drZhaoWorkflowToggle"', teamMembersIndex);
  const beforeZhaoMarkup = html.slice(teamMembersIndex, zhaoIndex);
  const zhaoButtonMarkup = html.slice(
    html.lastIndexOf('<button', zhaoIndex),
    html.indexOf('</button>', zhaoIndex) + '</button>'.length
  );

  assert.notEqual(teamMembersIndex, -1, 'team member list should exist');
  assert.notEqual(liIndex, -1, '李博士 should remain in the team member list');
  assert.notEqual(zhaoIndex, -1, '赵博士 workflow entry should exist');
  assert.ok(liIndex < zhaoIndex, '赵博士 should appear directly after the visible team members');
  assert.doesNotMatch(beforeZhaoMarkup, /<div class="team-sidebar-section">/);
  assert.match(zhaoButtonMarkup, /class="team-member-item dr-zhao-toggle"/);
  assert.doesNotMatch(zhaoButtonMarkup, /dr-zhao-switch/);
});

test('debug fast workflow entry keeps the same visual typography as team members', () => {
  const drZhaoStyle = html.match(/\.dr-zhao-toggle\s*\{([\s\S]*?)\}/)?.[1] || '';

  assert.match(drZhaoStyle, /font-family:\s*inherit/);
  assert.match(drZhaoStyle, /font-size:\s*12px/);
  assert.match(drZhaoStyle, /font-weight:\s*400/);
  assert.match(drZhaoStyle, /line-height:\s*inherit/);
  assert.match(drZhaoStyle, /color:\s*var\(--text-secondary\)/);
  assert.doesNotMatch(drZhaoStyle, /font:\s*inherit/);
  assert.doesNotMatch(html, /\.dr-zhao-toggle\.enabled\s*\{/);
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

test('research trace events are queued, scoped to the active run, and finalized on terminal messages', () => {
  const traceCase = extractSwitchCase(html, "case 'research_trace':");
  const traceCompleteCase = extractSwitchCase(html, "case 'research_trace_complete':");
  const cancelledCase = extractSwitchCase(html, "case 'cancelled':");
  const errorCase = extractSwitchCase(html, "case 'error':");
  const doneCase = extractSwitchCase(html, "case 'done':");

  assert.match(html, /const\s+researchTracePanels\s*=\s*new\s+Map\(\)/);
  assert.match(traceCase, /enqueueOp\(/);
  assert.match(traceCase, /isStaleClientRunId\(traceClientRunId\)/);
  assert.match(traceCase, /traceClientRunId\s*!==\s*currentClientRunId/);
  assert.match(traceCase, /recordHistoryResearchTrace\(traceMsg\)/);
  assert.match(traceCase, /updateResearchTracePanel\(traceMsg\)/);
  assert.match(traceCompleteCase, /enqueueOp\(/);
  assert.match(traceCompleteCase, /isStaleClientRunId\(traceCompleteClientRunId\)/);
  assert.match(traceCompleteCase, /recordHistoryResearchTraceComplete\(/);
  assert.match(traceCompleteCase, /completeResearchTracePanel\(/);
  assert.match(cancelledCase, /completeResearchTracePanel\(msg\.clientRunId,\s*'cancelled'/);
  assert.match(errorCase, /completeResearchTracePanel\(msg\.clientRunId,\s*'error'/);
  assert.match(doneCase, /completeResearchTracePanel\(msg\.clientRunId,\s*'completed'/);
});

test('research trace panel stays expanded and reveals stable-id steps in order', () => {
  const ensurePanel = extractFunction(html, 'function ensureResearchTracePanel');
  const updatePanel = extractFunction(html, 'function updateResearchTracePanel');
  const completePanel = extractFunction(html, 'function completeResearchTracePanel');

  assert.match(ensurePanel, /researchTracePanels\.get\(runKey\)/);
  assert.match(ensurePanel, /className\s*=\s*'research-trace-panel'/);
  assert.doesNotMatch(ensurePanel, /classList\.toggle\('collapsed'\)/);
  assert.match(ensurePanel, /research-trace-waiting/);
  assert.match(ensurePanel, /data-lucide="sparkles"/);
  assert.match(updatePanel, /state\.steps\.get\(stepId\)/);
  assert.match(updatePanel, /state\.steps\.set\(stepId,\s*step\)/);
  assert.match(updatePanel, /resolveResearchTraceTerminalStatus\(prior\.status,\s*status\)/);
  assert.match(updatePanel, /return reveal/);
  assert.match(completePanel, /if\s*\(step\.status\s*===\s*'active'\)/);
  assert.match(completePanel, /renderResearchTracePanelSummary\(state\)/);
});

test('workflow logs and tool cards wait for earlier typewriter output', () => {
  const logCase = extractSwitchCase(html, "case 'log':");
  const toolCallCase = extractSwitchCase(html, "case 'tool_call':");
  const toolResultCase = extractSwitchCase(html, "case 'tool_result':");
  const appendToolCall = extractFunction(html, 'function appendToolCall');
  const appendToolResult = extractFunction(html, 'function appendToolResult');

  assert.match(logCase, /enqueueOp\(\(\) => appendLogAnimated/);
  assert.match(toolCallCase, /enqueueOp/);
  assert.match(toolCallCase, /Promise\.resolve\(appendToolCall/);
  assert.match(toolResultCase, /Promise\.resolve\(appendToolResult/);
  assert.match(appendToolCall, /is-revealing/);
  assert.match(appendToolCall, /--tool-row-index/);
  assert.doesNotMatch(appendToolCall, /classList\.toggle\('collapsed'\)/);
  assert.doesNotMatch(appendToolResult, /tool-content collapsed|classList\.toggle\('collapsed'\)/);
});
