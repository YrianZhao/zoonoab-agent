const assert = require('assert/strict');
const { spawn } = require('child_process');
const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');
const test = require('node:test');

const PORT = 19141;
const CONFIG_PATH = path.join(os.tmpdir(), 'zoonoab-chat-provider-routing-' + PORT + '.json');
const HISTORY_PATH = path.join(os.tmpdir(), 'zoonoab-chat-provider-routing-history-' + PORT + '.json');
const QUESTION_SET_PATH = path.join(os.tmpdir(), 'zoonoab-chat-provider-routing-questions-' + PORT + '.json');
let serverProcess;

function listenOnLocalhost(server) {
  return new Promise(resolve => {
    server.listen(0, '127.0.0.1', () => resolve(server.address().port));
  });
}

async function waitForHealth() {
  const deadline = Date.now() + 8000;
  while (Date.now() < deadline) {
    try {
      const res = await fetch('http://127.0.0.1:' + PORT + '/api/health');
      if (res.ok) return;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 150));
  }
  throw new Error('server did not become healthy');
}

function readJsonBody(req) {
  return new Promise(resolve => {
    let body = '';
    req.setEncoding('utf8');
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(body || '{}')); } catch { resolve({}); }
    });
  });
}

function makeResponsesServer(options = {}) {
  const requests = [];
  const server = http.createServer(async (req, res) => {
    const body = await readJsonBody(req);
    requests.push({
      method: req.method,
      url: req.url,
      authorization: req.headers.authorization || '',
      body
    });
    res.setHeader('Content-Type', 'application/json');
    if (options.fail) {
      res.statusCode = options.statusCode || 502;
      res.end(JSON.stringify({ error: { message: 'primary unavailable' } }));
      return;
    }
    res.end(JSON.stringify({
      id: 'resp_test',
      output_text: options.reply || '测试通过'
    }));
  });
  return { server, requests };
}

function makeChatCompletionsServer(options = {}) {
  const requests = [];
  const server = http.createServer(async (req, res) => {
    const body = await readJsonBody(req);
    requests.push({
      method: req.method,
      url: req.url,
      authorization: req.headers.authorization || '',
      body
    });
    res.setHeader('Content-Type', 'application/json');
    if (req.method === 'GET' && /\/models$/.test(req.url)) {
      res.end(JSON.stringify({ data: [{ id: options.model || 'fallback-model' }] }));
      return;
    }
    if (Array.isArray(options.failModels) && options.failModels.includes(body.model)) {
      res.statusCode = options.statusCode || 503;
      res.end(JSON.stringify({ error: { message: 'model unavailable: ' + body.model } }));
      return;
    }
    res.end(JSON.stringify({
      choices: [
        { message: { content: options.reply || '备用模型测试通过' } }
      ]
    }));
  });
  return { server, requests };
}

async function saveAutoProviderConfig(primaryPort, fallbackPort, overrides = {}) {
  const resp = await fetch('http://127.0.0.1:' + PORT + '/api/voice/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      voice: { mode: 'local', provider: 'local' },
      chat: {
        mode: overrides.mode || 'auto',
        primary: {
          provider: 'su8',
          baseUrl: 'http://127.0.0.1:' + primaryPort + '/v1',
          apiKey: 'sk-primary-secret',
          model: 'gpt-5.5',
          wireApi: 'responses',
          reasoningEffort: 'xhigh'
        },
        fallback: {
          provider: 'siliconflow',
          baseUrl: 'http://127.0.0.1:' + fallbackPort + '/v1',
          apiKey: 'sk-fallback-secret',
          model: 'Qwen/Qwen3-32B',
          wireApi: 'chat_completions'
        }
      }
    })
  });
  assert.equal(resp.status, 200);
  return resp.json();
}

test.before(async () => {
  try { fs.unlinkSync(CONFIG_PATH); } catch {}
  try { fs.unlinkSync(HISTORY_PATH); } catch {}
  try { fs.unlinkSync(QUESTION_SET_PATH); } catch {}
  serverProcess = spawn(process.execPath, ['server.js'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      NODE_ENV: 'test',
      PORT: String(PORT),
      VOICE_API_CONFIG_FILE: CONFIG_PATH,
      HISTORY_STORE_FILE: HISTORY_PATH,
      QUESTION_TEST_SET_FILE: QUESTION_SET_PATH,
      LOCAL_ASR_AUTO_START: '0',
      ASSISTANT_CHAT_API_KEY: '',
      ASSISTANT_CHAT_BASE_URL: '',
      VOICE_CHAT_API_KEY: '',
      VOICE_CHAT_BASE_URL: '',
      DEEPSEEK_API_KEY: '',
      DEEPSEEK_CHAT_BASE_URL: ''
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  await waitForHealth();
});

test.after(async () => {
  if (serverProcess && !serverProcess.killed) {
    serverProcess.kill('SIGTERM');
    await new Promise(resolve => serverProcess.once('exit', resolve));
  }
  try { fs.unlinkSync(CONFIG_PATH); } catch {}
  try { fs.unlinkSync(HISTORY_PATH); } catch {}
  try { fs.unlinkSync(QUESTION_SET_PATH); } catch {}
});

test('server persists auto primary and fallback chat providers without returning raw keys', async () => {
  const primary = makeResponsesServer();
  const fallback = makeChatCompletionsServer();
  const primaryPort = await listenOnLocalhost(primary.server);
  const fallbackPort = await listenOnLocalhost(fallback.server);
  try {
    const saved = await saveAutoProviderConfig(primaryPort, fallbackPort);
    const serializedSave = JSON.stringify(saved);

    assert.equal(saved.chat.mode, 'auto');
    assert.equal(saved.chat.ready, true);
    assert.equal(saved.chat.activeProvider, 'primary');
    assert.equal(saved.chat.primary.provider, 'su8');
    assert.equal(saved.chat.primary.wireApi, 'responses');
    assert.equal(saved.chat.primary.reasoningEffort, 'xhigh');
    assert.equal(saved.chat.primary.model, 'gpt-5.5');
    assert.equal(saved.chat.fallback.provider, 'siliconflow');
    assert.equal(saved.chat.fallback.wireApi, 'chat_completions');
    assert.doesNotMatch(serializedSave, /sk-primary-secret|sk-fallback-secret/);

    const configResp = await fetch('http://127.0.0.1:' + PORT + '/api/voice/config');
    assert.equal(configResp.status, 200);
    const configData = await configResp.json();
    const serializedConfig = JSON.stringify(configData);

    assert.equal(configData.chat.mode, 'auto');
    assert.equal(configData.chat.primary.hasApiKey, true);
    assert.equal(configData.chat.primary.baseUrl, 'http://127.0.0.1:' + primaryPort + '/v1/responses');
    assert.equal(configData.chat.fallback.hasApiKey, true);
    assert.equal(configData.chat.fallback.baseUrl, 'http://127.0.0.1:' + fallbackPort + '/v1/chat/completions');
    assert.doesNotMatch(serializedConfig, /sk-primary-secret|sk-fallback-secret/);

    const persisted = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    assert.equal(persisted.chat.primary.key, 'sk-primary-secret');
    assert.equal(persisted.chat.primary.url, 'http://127.0.0.1:' + primaryPort + '/v1/responses');
    assert.equal(persisted.chat.primary.wireApi, 'responses');
    assert.equal(persisted.chat.fallback.key, 'sk-fallback-secret');
    assert.equal(persisted.chat.fallback.url, 'http://127.0.0.1:' + fallbackPort + '/v1/chat/completions');
    assert.equal(persisted.chat.fallback.wireApi, 'chat_completions');
  } finally {
    await new Promise(resolve => primary.server.close(resolve));
    await new Promise(resolve => fallback.server.close(resolve));
  }
});

test('assistant model uses the responses primary provider before fallback in auto mode', async () => {
  const primary = makeResponsesServer({ reply: '我是 OpenAI GPT 模型，但会协助回答。' });
  const fallback = makeChatCompletionsServer({ reply: '不应该使用备用模型' });
  const primaryPort = await listenOnLocalhost(primary.server);
  const fallbackPort = await listenOnLocalhost(fallback.server);
  try {
    await saveAutoProviderConfig(primaryPort, fallbackPort);

    const answerResp = await fetch('http://127.0.0.1:' + PORT + '/api/debug/assistant-answer?text=' + encodeURIComponent('你是谁'));
    assert.equal(answerResp.status, 200);
    const answerData = await answerResp.json();

    assert.equal(primary.requests.length, 1);
    assert.equal(primary.requests[0].method, 'POST');
    assert.equal(primary.requests[0].url, '/v1/responses');
    assert.equal(primary.requests[0].authorization, 'Bearer sk-primary-secret');
    assert.equal(primary.requests[0].body.model, 'gpt-5.5');
    assert.equal(primary.requests[0].body.reasoning.effort, 'xhigh');
    assert.equal(fallback.requests.length, 0);
    assert.doesNotMatch(answerData.answer, /OpenAI|GPT|sk-primary-secret|gpt-5\.5/i);
    assert.match(answerData.answer, /ZoonoAb|小诺/);
  } finally {
    await new Promise(resolve => primary.server.close(resolve));
    await new Promise(resolve => fallback.server.close(resolve));
  }
});

test('assistant model falls back to the SiliconFlow chat provider when the responses primary fails', async () => {
  const primary = makeResponsesServer({ fail: true });
  const fallback = makeChatCompletionsServer({ reply: '备用模型测试通过' });
  const primaryPort = await listenOnLocalhost(primary.server);
  const fallbackPort = await listenOnLocalhost(fallback.server);
  try {
    await saveAutoProviderConfig(primaryPort, fallbackPort);

    const answerResp = await fetch('http://127.0.0.1:' + PORT + '/api/debug/assistant-answer?text=' + encodeURIComponent('请测试连接'));
    assert.equal(answerResp.status, 200);
    const answerData = await answerResp.json();

    assert.equal(primary.requests.length, 1);
    assert.equal(fallback.requests.length, 1);
    assert.equal(fallback.requests[0].url, '/v1/chat/completions');
    assert.equal(fallback.requests[0].authorization, 'Bearer sk-fallback-secret');
    assert.equal(fallback.requests[0].body.model, 'Qwen/Qwen3-32B');
    assert.match(answerData.answer, /备用模型测试通过/);
  } finally {
    await new Promise(resolve => primary.server.close(resolve));
    await new Promise(resolve => fallback.server.close(resolve));
  }
});

test('assistant model tries alternate SiliconFlow fallback models when Qwen3-32B fails', async () => {
  const primary = makeResponsesServer({ fail: true });
  const fallback = makeChatCompletionsServer({
    failModels: ['Qwen/Qwen3-32B'],
    reply: '备用模型二级测试通过'
  });
  const primaryPort = await listenOnLocalhost(primary.server);
  const fallbackPort = await listenOnLocalhost(fallback.server);
  try {
    await saveAutoProviderConfig(primaryPort, fallbackPort);

    const answerResp = await fetch('http://127.0.0.1:' + PORT + '/api/debug/assistant-answer?text=' + encodeURIComponent('请测试连接'));
    assert.equal(answerResp.status, 200);
    const answerData = await answerResp.json();

    assert.equal(primary.requests.length, 1);
    assert.equal(fallback.requests.length, 2);
    assert.equal(fallback.requests[0].body.model, 'Qwen/Qwen3-32B');
    assert.equal(fallback.requests[1].body.model, 'Qwen/Qwen3-14B');
    assert.match(answerData.answer, /备用模型二级测试通过/);
  } finally {
    await new Promise(resolve => primary.server.close(resolve));
    await new Promise(resolve => fallback.server.close(resolve));
  }
});

test('chat provider health endpoint checks primary and fallback providers for the settings panel', async () => {
  const primary = makeResponsesServer();
  const fallback = makeChatCompletionsServer();
  const primaryPort = await listenOnLocalhost(primary.server);
  const fallbackPort = await listenOnLocalhost(fallback.server);
  try {
    await saveAutoProviderConfig(primaryPort, fallbackPort);

    const healthResp = await fetch('http://127.0.0.1:' + PORT + '/api/voice/chat/health?refresh=1');
    assert.equal(healthResp.status, 200);
    const data = await healthResp.json();
    const serialized = JSON.stringify(data);

    assert.equal(data.ok, true);
    assert.equal(data.mode, 'auto');
    assert.equal(data.activeProvider, 'primary');
    assert.equal(data.providers.primary.ok, true);
    assert.equal(data.providers.primary.wireApi, 'responses');
    assert.equal(data.providers.fallback.ok, true);
    assert.equal(data.providers.fallback.wireApi, 'chat_completions');
    assert.equal(primary.requests.length, 1);
    assert.equal(fallback.requests.length, 1);
    assert.doesNotMatch(serialized, /sk-primary-secret|sk-fallback-secret/);
  } finally {
    await new Promise(resolve => primary.server.close(resolve));
    await new Promise(resolve => fallback.server.close(resolve));
  }
});

test('chat test endpoint can reuse the saved primary provider when only the mode is submitted', async () => {
  const primary = makeResponsesServer({ reply: '测试通过' });
  const fallback = makeChatCompletionsServer();
  const primaryPort = await listenOnLocalhost(primary.server);
  const fallbackPort = await listenOnLocalhost(fallback.server);
  try {
    await saveAutoProviderConfig(primaryPort, fallbackPort, { mode: 'primary' });

    const resp = await fetch('http://127.0.0.1:' + PORT + '/api/voice/test/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat: { mode: 'primary' } })
    });
    assert.equal(resp.status, 200);
    const data = await resp.json();

    assert.equal(data.ok, true);
    assert.equal(data.provider, 'su8');
    assert.equal(data.model, 'gpt-5.5');
    assert.equal(data.wireApi, 'responses');
    assert.equal(primary.requests.length, 1);
    assert.equal(primary.requests[0].url, '/v1/responses');
    assert.equal(fallback.requests.length, 0);
  } finally {
    await new Promise(resolve => primary.server.close(resolve));
    await new Promise(resolve => fallback.server.close(resolve));
  }
});

test('chat provider reasoning effort can be cleared so responses calls output directly', async () => {
  const primary = makeResponsesServer({ reply: '测试通过' });
  const fallback = makeChatCompletionsServer();
  const primaryPort = await listenOnLocalhost(primary.server);
  const fallbackPort = await listenOnLocalhost(fallback.server);
  try {
    await saveAutoProviderConfig(primaryPort, fallbackPort, { mode: 'primary' });

    const clearResp = await fetch('http://127.0.0.1:' + PORT + '/api/voice/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        voice: { mode: 'local', provider: 'local' },
        chat: {
          mode: 'primary',
          reasoningEffort: '',
          primary: {
            provider: 'su8',
            baseUrl: 'http://127.0.0.1:' + primaryPort + '/v1',
            apiKey: '',
            model: 'gpt-5.5',
            wireApi: 'responses',
            reasoningEffort: ''
          },
          fallback: {
            provider: 'siliconflow',
            baseUrl: 'http://127.0.0.1:' + fallbackPort + '/v1',
            apiKey: '',
            model: 'Qwen/Qwen3-32B',
            wireApi: 'chat_completions'
          }
        }
      })
    });
    assert.equal(clearResp.status, 200);
    const clearData = await clearResp.json();
    assert.equal(clearData.chat.reasoningEffort, '');
    assert.equal(clearData.chat.primary.reasoningEffort, '');

    const testResp = await fetch('http://127.0.0.1:' + PORT + '/api/voice/test/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat: { mode: 'primary' } })
    });
    assert.equal(testResp.status, 200);

    const latestPrimaryRequest = primary.requests[primary.requests.length - 1];
    assert.ok(latestPrimaryRequest, 'primary provider should be called after clearing reasoning effort');
    assert.equal(latestPrimaryRequest.url, '/v1/responses');
    assert.equal(latestPrimaryRequest.body.model, 'gpt-5.5');
    assert.equal(latestPrimaryRequest.body.reasoning, undefined);
  } finally {
    await new Promise(resolve => primary.server.close(resolve));
    await new Promise(resolve => fallback.server.close(resolve));
  }
});
