const assert = require('assert/strict');
const { spawn } = require('child_process');
const fs = require('fs');
const http = require('http');
const os = require('os');
const path = require('path');
const test = require('node:test');
const WebSocket = require('ws');

const PORT = 19081;
const MOCK_CHAT_PORT = 19082;
const CONFIG_PATH = path.join(os.tmpdir(), 'zoonoab-test-voice-config-' + PORT + '.json');
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

function collectUserMessageStream(text) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket('ws://127.0.0.1:' + PORT);
    const messages = [];
    const timer = setTimeout(() => {
      try { ws.close(); } catch {}
      reject(new Error('timed out waiting for websocket done message'));
    }, 8000);

    ws.on('open', () => {
      ws.send(JSON.stringify({ type: 'user_msg', text }));
    });
    ws.on('message', raw => {
      let msg;
      try { msg = JSON.parse(String(raw)); } catch { return; }
      messages.push(msg);
      if (msg.type === 'done') {
        clearTimeout(timer);
        ws.close();
        resolve(messages);
      }
    });
    ws.on('error', err => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

test.before(async () => {
  try { fs.unlinkSync(CONFIG_PATH); } catch {}
  serverProcess = spawn(process.execPath, ['server.js'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      NODE_ENV: 'test',
      PORT: String(PORT),
      VOICE_API_CONFIG_FILE: CONFIG_PATH,
      LOCAL_ASR_AUTO_START: '0'
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  await waitForHealth();
});

test.after(async () => {
  if (!serverProcess || serverProcess.killed) return;
  serverProcess.kill('SIGTERM');
  await new Promise(resolve => serverProcess.once('exit', resolve));
  try { fs.unlinkSync(CONFIG_PATH); } catch {}
});

test('server design route preserves unknown user target across route, parse, and profile', async () => {
  const query = encodeURIComponent('设计10个烟草花叶病毒的抗体');
  const res = await fetch('http://127.0.0.1:' + PORT + '/api/debug/design-route?text=' + query);
  assert.equal(res.status, 200);
  const data = await res.json();
  const serialized = JSON.stringify(data);

  assert.equal(data.intent, 'design');
  assert.equal(data.route.target, '烟草花叶病毒');
  assert.equal(data.route.dynamic, true);
  assert.equal(data.parsed.target, '烟草花叶病毒');
  assert.equal(data.parsed.count, 10);
  assert.equal(data.profile.targetDisplay, '烟草花叶病毒');
  assert.match(data.profile.mechanism, /烟草花叶病毒/);
  assert.doesNotMatch(serialized, /IL-33|ST2|PD-L1|CD274|4KC3/);
});

test('server keeps non-biomedical virus wording out of design workflow', async () => {
  const query = encodeURIComponent('电脑病毒设计抗体');
  const res = await fetch('http://127.0.0.1:' + PORT + '/api/debug/design-route?text=' + query);
  assert.equal(res.status, 200);
  const data = await res.json();

  assert.equal(data.intent, 'assistant_chat');
  assert.equal(data.route, null);
});

test('server routes ordinary non-workflow questions to assistant chat only', async () => {
  const query = encodeURIComponent('今天天气怎么样');
  const res = await fetch('http://127.0.0.1:' + PORT + '/api/debug/user-routing?text=' + query);
  assert.equal(res.status, 200);
  const data = await res.json();

  assert.equal(data.intent, 'assistant_chat');
  assert.equal(data.localWorkflowAllowed, false);
  assert.equal(data.runner, 'assistant_chat');
  assert.equal(data.demoRoute, null);
});

test('assistant chat replies do not append recommendation chips', async () => {
  const messages = await collectUserMessageStream('今天天气是什么设计抗体');
  const chipMessages = messages.filter(msg => msg.type === 'chips');
  const serialized = JSON.stringify(messages);

  assert.equal(chipMessages.length, 0);
  assert.doesNotMatch(serialized, /启动抗体设计演示|从疾病自动选择靶点|生成可打印结构模型|查看平台能力/);
  assert.equal(messages.some(msg => msg.type === 'agent_msg'), true);
  assert.equal(messages[messages.length - 1].type, 'done');
});

test('server refuses ambiguous local workflow commands that would otherwise use fake defaults', async () => {
  const query = encodeURIComponent('帮我做一下表位预测');
  const res = await fetch('http://127.0.0.1:' + PORT + '/api/debug/user-routing?text=' + query);
  assert.equal(res.status, 200);
  const data = await res.json();

  assert.equal(data.detectedIntent, 'epitope_prediction');
  assert.equal(data.intent, 'assistant_chat');
  assert.equal(data.localWorkflowAllowed, false);
  assert.equal(data.runner, 'assistant_chat');
});

test('server allows local workflow only when user gives a concrete design target', async () => {
  const query = encodeURIComponent('设计10个烟草花叶病毒的抗体');
  const res = await fetch('http://127.0.0.1:' + PORT + '/api/debug/user-routing?text=' + query);
  assert.equal(res.status, 200);
  const data = await res.json();

  assert.equal(data.intent, 'design');
  assert.equal(data.localWorkflowAllowed, true);
  assert.equal(data.runner, 'local_workflow');
  assert.equal(data.demoRoute.target, '烟草花叶病毒');
});

test('server allows prepared disease routes without replacing them with generic defaults', async () => {
  const query = encodeURIComponent('乳腺癌方向设计10个抗体');
  const res = await fetch('http://127.0.0.1:' + PORT + '/api/debug/user-routing?text=' + query);
  assert.equal(res.status, 200);
  const data = await res.json();

  assert.equal(data.intent, 'design');
  assert.equal(data.localWorkflowAllowed, true);
  assert.equal(data.runner, 'local_workflow');
  assert.equal(data.demoRoute.routeId || data.demoRoute.id, 'breast_cancer');
  assert.equal(data.demoRoute.target, 'HER2');
});

test('server does not replace unsupported disease requests with representative local targets', async () => {
  const query = encodeURIComponent('给阿尔茨海默设计10个抗体');
  const res = await fetch('http://127.0.0.1:' + PORT + '/api/debug/user-routing?text=' + query);
  assert.equal(res.status, 200);
  const data = await res.json();

  assert.equal(data.detectedIntent, 'design');
  assert.equal(data.intent, 'assistant_chat');
  assert.equal(data.localWorkflowAllowed, false);
  assert.equal(data.runner, 'assistant_chat');
  assert.equal(data.demoRoute, null);
});

test('server keeps obesity as the clean user target without the leading phrase', async () => {
  const query = encodeURIComponent('帮我设计10个针对肥胖的抗体');
  const res = await fetch('http://127.0.0.1:' + PORT + '/api/debug/user-routing?text=' + query);
  assert.equal(res.status, 200);
  const data = await res.json();
  const serialized = JSON.stringify(data);

  assert.equal(data.intent, 'design');
  assert.equal(data.localWorkflowAllowed, true);
  assert.equal(data.runner, 'local_workflow');
  assert.equal(data.demoRoute.target, '肥胖');
  assert.equal(data.demoRoute.dynamic, true);
  assert.doesNotMatch(serialized, /一个针对肥胖/);
  assert.doesNotMatch(serialized, /GIPR/);
});

test('server design route renders obesity as the clean target field', async () => {
  const query = encodeURIComponent('设计一个针对肥胖的抗体');
  const res = await fetch('http://127.0.0.1:' + PORT + '/api/debug/design-route?text=' + query);
  assert.equal(res.status, 200);
  const data = await res.json();
  const serialized = JSON.stringify(data);

  assert.equal(data.intent, 'design');
  assert.equal(data.route.target, '肥胖');
  assert.equal(data.route.dynamic, true);
  assert.equal(data.parsed.target, '肥胖');
  assert.equal(data.profile.targetDisplay, '肥胖');
  assert.match(data.profile.mechanism, /肥胖/);
  assert.doesNotMatch(serialized, /一个针对肥胖|GIPR/);
});

test('server keeps diabetes as the clean user target without the leading phrase', async () => {
  const query = encodeURIComponent('帮我设计10个针对糖尿病的抗体');
  const res = await fetch('http://127.0.0.1:' + PORT + '/api/debug/user-routing?text=' + query);
  assert.equal(res.status, 200);
  const data = await res.json();
  const serialized = JSON.stringify(data);

  assert.equal(data.intent, 'design');
  assert.equal(data.localWorkflowAllowed, true);
  assert.equal(data.runner, 'local_workflow');
  assert.equal(data.demoRoute.target, '糖尿病');
  assert.equal(data.demoRoute.dynamic, true);
  assert.doesNotMatch(serialized, /一个针对糖尿病|针对糖尿病/);
});

test('server does not treat ordinary English words containing ha as influenza HA', async () => {
  const query = encodeURIComponent('how much has the dow changed today');
  const res = await fetch('http://127.0.0.1:' + PORT + '/api/debug/user-routing?text=' + query);
  assert.equal(res.status, 200);
  const data = await res.json();

  assert.equal(data.intent, 'assistant_chat');
  assert.equal(data.localWorkflowAllowed, false);
  assert.equal(data.demoRoute, null);
});

test('server does not launch prepared disease routes for biomedical QA without design intent', async () => {
  const query = encodeURIComponent('Multidisciplinary breast cancer clinics. Do they work?');
  const res = await fetch('http://127.0.0.1:' + PORT + '/api/debug/user-routing?text=' + query);
  assert.equal(res.status, 200);
  const data = await res.json();

  assert.equal(data.intent, 'assistant_chat');
  assert.equal(data.localWorkflowAllowed, false);
  assert.equal(data.demoRoute, null);
});

test('server answers broad capability questions through assistant chat instead of local workflow display', async () => {
  const query = encodeURIComponent('what can you do for me');
  const res = await fetch('http://127.0.0.1:' + PORT + '/api/debug/user-routing?text=' + query);
  assert.equal(res.status, 200);
  const data = await res.json();

  assert.equal(data.detectedIntent, 'capability');
  assert.equal(data.intent, 'assistant_chat');
  assert.equal(data.localWorkflowAllowed, false);
  assert.equal(data.runner, 'assistant_chat');
});

test('server persists OpenAI-compatible chat config without returning the raw key', async () => {
  const saveResp = await fetch('http://127.0.0.1:' + PORT + '/api/voice/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      voice: { mode: 'local', provider: 'local' },
      chat: {
        baseUrl: 'https://api.siliconflow.cn/v1',
        apiKey: 'sk-test-secret-value',
        model: 'Qwen/Qwen3-32B'
      }
    })
  });
  assert.equal(saveResp.status, 200);
  const saveData = await saveResp.json();
  const serializedSave = JSON.stringify(saveData);

  assert.equal(saveData.chat.ready, true);
  assert.equal(saveData.chat.hasApiKey, true);
  assert.equal(saveData.chat.baseUrl, 'https://api.siliconflow.cn/v1/chat/completions');
  assert.equal(saveData.chat.model, 'Qwen/Qwen3-32B');
  assert.doesNotMatch(serializedSave, /sk-test-secret-value/);

  const configResp = await fetch('http://127.0.0.1:' + PORT + '/api/voice/config');
  assert.equal(configResp.status, 200);
  const configData = await configResp.json();
  const serializedConfig = JSON.stringify(configData);

  assert.equal(configData.chat.ready, true);
  assert.equal(configData.chat.hasApiKey, true);
  assert.equal(configData.chat.baseUrl, 'https://api.siliconflow.cn/v1/chat/completions');
  assert.equal(configData.chat.model, 'Qwen/Qwen3-32B');
  assert.doesNotMatch(serializedConfig, /sk-test-secret-value/);

  const persisted = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  assert.equal(persisted.chat.key, 'sk-test-secret-value');
  assert.equal(persisted.chat.url, 'https://api.siliconflow.cn/v1/chat/completions');
});

test('server detects chat models from an OpenAI-compatible model list endpoint', async () => {
  let captured = null;
  const mockServer = http.createServer((req, res) => {
    captured = {
      method: req.method,
      url: req.url,
      authorization: req.headers.authorization || ''
    };
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      data: [
        { id: 'Qwen/Qwen3-32B' },
        { id: 'deepseek-ai/DeepSeek-V3' }
      ]
    }));
  });

  const modelPort = await listenOnLocalhost(mockServer);
  try {
    const resp = await fetch('http://127.0.0.1:' + PORT + '/api/voice/models/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat: {
          baseUrl: 'http://127.0.0.1:' + modelPort + '/v1/chat/completions',
          apiKey: 'sk-model-secret'
        }
      })
    });
    assert.equal(resp.status, 200);
    const data = await resp.json();
    const serialized = JSON.stringify(data);

    assert.equal(captured.method, 'GET');
    assert.equal(captured.url, '/v1/models');
    assert.equal(captured.authorization, 'Bearer sk-model-secret');
    assert.equal(data.ok, true);
    assert.equal(data.baseUrl, 'http://127.0.0.1:' + modelPort + '/v1/chat/completions');
    assert.deepEqual(data.models.map(model => model.id), ['Qwen/Qwen3-32B', 'deepseek-ai/DeepSeek-V3']);
    assert.doesNotMatch(serialized, /sk-model-secret/);
  } finally {
    await new Promise(resolve => mockServer.close(resolve));
  }
});

test('server detects chat models with a persisted key when the key field is left blank', async () => {
  let captured = null;
  const mockServer = http.createServer((req, res) => {
    captured = {
      method: req.method,
      url: req.url,
      authorization: req.headers.authorization || ''
    };
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      models: [
        { name: 'persisted-chat-model' },
        'fallback-string-model'
      ]
    }));
  });

  const modelPort = await listenOnLocalhost(mockServer);
  try {
    const saveResp = await fetch('http://127.0.0.1:' + PORT + '/api/voice/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        voice: { mode: 'local', provider: 'local' },
        chat: {
          baseUrl: 'http://127.0.0.1:' + modelPort + '/v1',
          apiKey: 'sk-persisted-model-secret',
          model: 'persisted-chat-model'
        }
      })
    });
    assert.equal(saveResp.status, 200);

    const resp = await fetch('http://127.0.0.1:' + PORT + '/api/voice/models/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat: {
          baseUrl: 'http://127.0.0.1:' + modelPort + '/v1',
          apiKey: ''
        }
      })
    });
    assert.equal(resp.status, 200);
    const data = await resp.json();
    const serialized = JSON.stringify(data);

    assert.equal(captured.method, 'GET');
    assert.equal(captured.url, '/v1/models');
    assert.equal(captured.authorization, 'Bearer sk-persisted-model-secret');
    assert.deepEqual(data.models.map(model => model.id), ['persisted-chat-model', 'fallback-string-model']);
    assert.doesNotMatch(serialized, /sk-persisted-model-secret/);
  } finally {
    await new Promise(resolve => mockServer.close(resolve));
  }
});

test('assistant model calls include ZoonoAb persona prompt and hide provider names in replies', async () => {
  let captured = null;
  const mockServer = http.createServer((req, res) => {
    let body = '';
    req.setEncoding('utf8');
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      captured = {
        method: req.method,
        url: req.url,
        authorization: req.headers.authorization || '',
        body: JSON.parse(body || '{}')
      };
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        choices: [
          { message: { content: '我是 OpenAI GPT 模型，但会协助回答。' } }
        ]
      }));
    });
  });

  await new Promise(resolve => mockServer.listen(MOCK_CHAT_PORT, '127.0.0.1', resolve));
  try {
    const saveResp = await fetch('http://127.0.0.1:' + PORT + '/api/voice/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        voice: { mode: 'local', provider: 'local' },
        chat: {
          baseUrl: 'http://127.0.0.1:' + MOCK_CHAT_PORT + '/v1',
          apiKey: 'sk-mock-chat-secret',
          model: 'mock-chat-model'
        }
      })
    });
    assert.equal(saveResp.status, 200);

    const answerResp = await fetch('http://127.0.0.1:' + PORT + '/api/debug/assistant-answer?text=' + encodeURIComponent('你是谁'));
    assert.equal(answerResp.status, 200);
    const answerData = await answerResp.json();

    assert.equal(captured.method, 'POST');
    assert.equal(captured.url, '/v1/chat/completions');
    assert.equal(captured.authorization, 'Bearer sk-mock-chat-secret');
    assert.equal(captured.body.model, 'mock-chat-model');
    assert.match(captured.body.messages[0].content, /ZoonoAb/);
    assert.match(captured.body.messages[0].content, /溯本源/);
    assert.match(captured.body.messages[0].content, /小诺/);
    assert.match(captured.body.messages[0].content, /不要透露|不得透露/);
    assert.match(captured.body.messages[0].content, /本地工作流|工作流/);
    assert.doesNotMatch(answerData.answer, /OpenAI|GPT|mock-chat-model|sk-mock-chat-secret/i);
    assert.match(answerData.answer, /ZoonoAb|小诺/);
  } finally {
    await new Promise(resolve => mockServer.close(resolve));
  }
});
