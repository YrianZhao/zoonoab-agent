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

test('API settings expose SiliconFlow fallback model candidates', () => {
  assert.match(html, /Qwen\/Qwen3-32B/);
  assert.match(html, /Qwen\/Qwen3-14B/);
  assert.match(html, /Qwen\/Qwen3-8B/);
  assert.match(html, /deepseek-ai\/DeepSeek-V3/);

  const saveVoiceSettings = extractFunction(html, 'async function saveVoiceSettings');
  assert.match(saveVoiceSettings, /modelCandidates:\s*SILICONFLOW_CHAT_FALLBACK_MODELS/);
});

test('top wake button keeps wake label and uses warning color when voice is unsupported', () => {
  assert.match(html, /\.header-wake-btn\.voice-unavailable/);

  const updateVoiceUI = extractFunction(html, 'function updateVoiceUI');
  const initVoiceShortcuts = extractFunction(html, 'function initVoiceShortcuts');
  assert.match(updateVoiceUI, /wakeBtn\.classList\.toggle\('voice-unavailable'/);
  assert.match(initVoiceShortcuts, /wakeBtn\.classList\.toggle\('voice-unavailable'/);
  assert.match(initVoiceShortcuts, /wakeBtn\.textContent\s*=\s*'唤醒'/);
  assert.doesNotMatch(initVoiceShortcuts, /wakeBtn\)\s*wakeBtn\.textContent\s*=\s*'不可用'/);
});

test('top connection dot reflects chat provider health instead of websocket color writes', () => {
  assert.match(html, /function\s+setChatConnectionIndicator\s*\(/);
  assert.match(html, /chat-connection-primary/);
  assert.match(html, /chat-connection-fallback/);
  assert.match(html, /chat-connection-unavailable/);

  const renderChatProviderHealth = extractFunction(html, 'function renderChatProviderHealth');
  const refreshChatProviderHealth = extractFunction(html, 'async function refreshChatProviderHealth');
  const connectWS = extractFunction(html, 'function connectWS');
  assert.match(renderChatProviderHealth, /setChatConnectionIndicator\(/);
  assert.match(refreshChatProviderHealth, /setChatConnectionIndicator\('checking'/);
  assert.doesNotMatch(connectWS, /wsStatus'\)\.style\.background/);
});

test('top connection status opens a model availability popover', () => {
  assert.match(html, /id="chatProviderStatusBtn"/);
  assert.match(html, /onclick="toggleChatProviderPopover\(event\)"/);
  assert.match(html, /id="chatProviderPopover"/);
  assert.match(html, /id="chatProviderPopoverBody"/);
  assert.match(html, /aria-expanded="false"/);
  assert.match(html, /当前使用/);
  assert.match(html, /主模型/);
  assert.match(html, /备用模型/);

  const renderChatProviderHealth = extractFunction(html, 'function renderChatProviderHealth');
  const toggleChatProviderPopover = extractFunction(html, 'function toggleChatProviderPopover');
  const renderChatProviderPopover = extractFunction(html, 'function renderChatProviderPopover');
  const renderChatProviderRow = extractFunction(html, 'function renderChatProviderRow');
  const chatProviderDisplayName = extractFunction(html, 'function chatProviderDisplayName');
  assert.match(renderChatProviderHealth, /chatProviderHealthState\s*=\s*data\s*\|\|\s*null/);
  assert.match(renderChatProviderHealth, /renderChatProviderPopover\(chatProviderHealthState\)/);
  assert.match(toggleChatProviderPopover, /refreshChatProviderHealth\(\{\s*popover:\s*true\s*\}\)/);
  assert.match(renderChatProviderPopover, /activeHealth\.model/);
  assert.match(renderChatProviderRow, /chatProviderDisplayName\(health\)/);
  assert.match(chatProviderDisplayName, /health\.model/);
  assert.match(renderChatProviderRow, /formatChatProviderStatus/);
  assert.doesNotMatch(renderChatProviderPopover, /apiKey|hasApiKey|baseUrl/);
  assert.doesNotMatch(renderChatProviderRow, /apiKey|hasApiKey|baseUrl/);
});

test('home input toolbar states the default ten molecule output', () => {
  assert.match(html, /class="default-model-count-hint"/);
  assert.match(html, /默认生成十个分子模型/);

  const hintIndex = html.indexOf('默认生成十个分子模型');
  const toggleIndex = html.indexOf('id="hideToolsToggle"');
  assert.ok(hintIndex >= 0 && toggleIndex >= 0 && hintIndex < toggleIndex, 'default model count hint should appear before Hide Tool Calls');
});
