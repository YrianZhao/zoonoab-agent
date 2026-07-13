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

test('API settings panel separates model routing from voice recognition controls', () => {
  assert.match(html, /聊天模型/);
  assert.match(html, /主模型/);
  assert.match(html, /备用模型/);
  assert.match(html, /自动优先主模型/);
  assert.match(html, /id="chatModeSelect"/);
  assert.match(html, /id="primaryChatBaseUrlInput"/);
  assert.match(html, /id="primaryChatApiKeyInput"/);
  assert.match(html, /id="primaryChatModelInput"/);
  assert.match(html, /id="primaryChatWireApiSelect"/);
  assert.match(html, /id="chatReasoningEffortSelect"/);
  assert.match(html, /id="fallbackChatBaseUrlInput"/);
  assert.match(html, /id="fallbackChatApiKeyInput"/);
  assert.match(html, /id="fallbackChatModelInput"/);
  assert.match(html, /id="chatProvidersHealthCard"/);
  assert.match(html, /id="voiceChatHealthBtn"/);
});

test('API settings save payload includes primary provider, fallback provider, mode and reasoning effort', () => {
  assert.match(html, /function\s+refreshChatProviderHealth\s*\(/);

  const collectVoiceSettings = extractFunction(html, 'function collectVoiceSettings');
  const saveVoiceSettings = extractFunction(html, 'async function saveVoiceSettings');
  const loadVoiceConfig = extractFunction(html, 'async function loadVoiceConfig');

  assert.match(collectVoiceSettings, /chatModeSelect/);
  assert.match(collectVoiceSettings, /primaryChatBaseUrlInput/);
  assert.match(collectVoiceSettings, /primaryChatApiKeyInput/);
  assert.match(collectVoiceSettings, /primaryChatModelInput/);
  assert.match(collectVoiceSettings, /primaryChatWireApiSelect/);
  assert.match(collectVoiceSettings, /chatReasoningEffortSelect/);
  assert.match(collectVoiceSettings, /fallbackChatBaseUrlInput/);
  assert.match(collectVoiceSettings, /fallbackChatApiKeyInput/);
  assert.match(collectVoiceSettings, /fallbackChatModelInput/);
  assert.match(saveVoiceSettings, /mode:\s*chatMode/);
  assert.match(saveVoiceSettings, /primary:\s*\{/);
  assert.match(saveVoiceSettings, /fallback:\s*\{/);
  assert.match(saveVoiceSettings, /reasoningEffort:\s*chatReasoningEffort/);
  assert.match(loadVoiceConfig, /refreshChatProviderHealth\(/);
  assert.match(loadVoiceConfig, /cfg\.chat\?\.primary/);
  assert.match(loadVoiceConfig, /cfg\.chat\?\.fallback/);
});

test('API settings default chat reasoning effort is off for direct responses', () => {
  const selectMatch = html.match(/<select id="chatReasoningEffortSelect">([\s\S]*?)<\/select>/);
  assert.ok(selectMatch, 'chat reasoning effort select should exist');
  assert.match(selectMatch[1].trim(), /^<option value="">关闭<\/option>/);

  const loadVoiceConfig = extractFunction(html, 'async function loadVoiceConfig');
  assert.doesNotMatch(loadVoiceConfig, /\|\|\s*'xhigh'/);
});
