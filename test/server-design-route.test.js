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
const VISIBLE_RESOLVER_LEAK_PATTERN = /未能完成|当前未能|在线靶点解析|解析失败|兜底|代表靶点|代表抗原|补充明确靶点|无关靶点|系统保留|系统选择|系统优先选择|验证展示序列|大模型\s*API|真正的研发设计/;
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

function collectUserMessageStream(text, options = {}) {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket('ws://127.0.0.1:' + PORT);
    const messages = [];
    const timer = setTimeout(() => {
      try { ws.close(); } catch {}
      reject(new Error('timed out waiting for websocket done message'));
    }, options.timeoutMs || 8000);

    ws.on('open', () => {
      ws.send(JSON.stringify({
        type: 'user_msg',
        text,
        ...(options.voiceSessionId ? { voiceSessionId: options.voiceSessionId } : {})
      }));
    });
    ws.on('message', raw => {
      let msg;
      try { msg = JSON.parse(String(raw)); } catch { return; }
      messages.push(msg);
      if ((typeof options.stopWhen === 'function' && options.stopWhen(msg, messages)) || msg.type === 'done') {
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
      LOCAL_ASR_AUTO_START: '0',
      TARGET_RESOLVER_TIMEOUT_MS: '4000'
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

test('server design route sends implicit unknown targets to target resolution', async () => {
  const query = encodeURIComponent('设计10个烟草花叶病毒的抗体');
  const res = await fetch('http://127.0.0.1:' + PORT + '/api/debug/design-route?text=' + query);
  assert.equal(res.status, 200);
  const data = await res.json();
  const serialized = JSON.stringify(data);

  assert.equal(data.intent, 'design');
  assert.equal(data.route, null);
  assert.equal(data.requiresTargetResolution, true);
  assert.equal(data.parsed.target, '烟草花叶病毒');
  assert.doesNotMatch(serialized, /IL-33|ST2|4KC3/);
});

test('server design route preserves explicitly declared unknown targets across route, parse, and profile', async () => {
  const query = encodeURIComponent('设计10个抗体，靶点是烟草花叶病毒');
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

test('server previews distinct 3D model files for different design targets and antibody formats', async () => {
  const requests = [
    { text: '针对流感HA血凝素设计10个抗体', expectedPrefix: /^FluHA-Fab-/ },
    { text: '设计10个针对PD-L1的Fab', expectedPrefix: /^PDL1-Fab-/ },
    { text: '设计10个抗体，靶点是烟草花叶病毒', expectedNotPrefix: /^PDL1-Fab-/ },
    { text: '设计10个纳米抗体，靶点是烟草花叶病毒', expectedNotPrefix: /^PDL1-Fab-/ }
  ];
  const previews = [];

  for (const item of requests) {
    const query = encodeURIComponent(item.text);
    const res = await fetch('http://127.0.0.1:' + PORT + '/api/debug/design-route?text=' + query);
    assert.equal(res.status, 200);
    const data = await res.json();
    const firstFile = data.threeDPreview && data.threeDPreview.binders && data.threeDPreview.binders[0]
      ? data.threeDPreview.binders[0].file
      : '';
    assert.ok(firstFile, item.text + ' should preview a local 3D model file');
    if (item.expectedPrefix) assert.match(firstFile, item.expectedPrefix);
    if (item.expectedNotPrefix) assert.doesNotMatch(firstFile, item.expectedNotPrefix);
    previews.push({ ...item, data, firstFile });
  }

  assert.notEqual(previews[0].firstFile, previews[1].firstFile);
  assert.notEqual(previews[2].firstFile, previews[3].firstFile);
  assert.equal(previews[2].data.threeDPreview.binders[0].antibodyFormat, 'Fab');
  assert.equal(previews[3].data.threeDPreview.binders[0].antibodyFormat, 'VHH');
});

test('server preview count follows spoken Chinese candidate count for preset routes', async () => {
  const oneQuery = encodeURIComponent('针对 PD-L1 设计一个高亲和力 Fab');
  const oneRes = await fetch('http://127.0.0.1:' + PORT + '/api/debug/design-route?text=' + oneQuery);
  assert.equal(oneRes.status, 200);
  const one = await oneRes.json();
  assert.equal(one.parsed.count, 1);
  assert.equal(one.threeDPreview.binders.length, 1);
  assert.equal(one.threeDPreview.files.length, 1);

  const tenQuery = encodeURIComponent('针对 PD-L1 设计十个高亲和力 Fab');
  const tenRes = await fetch('http://127.0.0.1:' + PORT + '/api/debug/design-route?text=' + tenQuery);
  assert.equal(tenRes.status, 200);
  const ten = await tenRes.json();
  assert.equal(ten.parsed.count, 10);
  assert.equal(ten.threeDPreview.binders.length, 10);
  const poseSeeds = ten.threeDPreview.binders.map(item => item.viewerPoseSeed);
  assert.equal(new Set(poseSeeds).size, 10);
  assert.ok(poseSeeds.every(Number.isFinite));
});

test('allergic asthma route previews real IL-33 Fab structure presets', async () => {
  const query = encodeURIComponent('帮我为过敏性哮喘设计十个抗体分子，靶点是 IL-33');
  const res = await fetch('http://127.0.0.1:' + PORT + '/api/debug/design-route?text=' + query);
  assert.equal(res.status, 200);
  const data = await res.json();
  const preview = data.threeDPreview;
  const firstBinder = preview && preview.binders && preview.binders[0];
  const serialized = JSON.stringify(preview);

  assert.equal(data.parsed.count, 10);
  assert.equal(data.route.id, 'allergic_asthma');
  assert.equal(data.route.abType, 'Fab');
  assert.match(data.profile.scaffold, /Fab/);
  assert.equal(preview.binders.length, 10);
  assert.match(firstBinder.file, /^IL33-Fab-01\.pdb$/);
  assert.equal(firstBinder.antibodyFormat, 'Fab');
  assert.deepEqual(firstBinder.antigenChains, ['A']);
  assert.deepEqual(firstBinder.antibodyChains, ['B', 'C']);
  assert.match(firstBinder.structuralBasis, /9WWH|Tozorakimab Fab/);
  assert.doesNotMatch(serialized, /IL33-VHH|本地 VHH 展示支架|4KC3/);
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

test('assistant chat emits a transient thinking indicator before the final reply', async () => {
  const messages = await collectUserMessageStream('今天天气怎么样');
  const firstBusinessMessage = messages.find(msg => msg.type !== 'connected');
  const thinkingMessages = messages.filter(msg => msg.type === 'assistant_thinking');

  assert.equal(firstBusinessMessage.type, 'assistant_thinking');
  assert.equal(thinkingMessages.length, 1);
  assert.equal(thinkingMessages[0].active, true);
  assert.match(thinkingMessages[0].topic, /天气|weather/i);
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

test('server routes implicit target design requests through target resolution', async () => {
  const query = encodeURIComponent('设计10个烟草花叶病毒的抗体');
  const res = await fetch('http://127.0.0.1:' + PORT + '/api/debug/user-routing?text=' + query);
  assert.equal(res.status, 200);
  const data = await res.json();

  assert.equal(data.intent, 'design');
  assert.equal(data.localWorkflowAllowed, true);
  assert.equal(data.runner, 'target_resolution_workflow');
  assert.equal(data.requiresTargetResolution, true);
  assert.equal(data.demoRoute, null);
});

test('server allows direct local workflow when the target is explicitly declared', async () => {
  const query = encodeURIComponent('设计10个抗体，靶点是烟草花叶病毒');
  const res = await fetch('http://127.0.0.1:' + PORT + '/api/debug/user-routing?text=' + query);
  assert.equal(res.status, 200);
  const data = await res.json();

  assert.equal(data.intent, 'design');
  assert.equal(data.localWorkflowAllowed, true);
  assert.equal(data.runner, 'local_workflow');
  assert.equal(data.requiresTargetResolution, false);
  assert.equal(data.demoRoute.target, '烟草花叶病毒');
});

test('server routes prepared disease wording through target resolution unless target is explicit', async () => {
  const query = encodeURIComponent('乳腺癌方向设计10个抗体');
  const res = await fetch('http://127.0.0.1:' + PORT + '/api/debug/user-routing?text=' + query);
  assert.equal(res.status, 200);
  const data = await res.json();

  assert.equal(data.intent, 'design');
  assert.equal(data.localWorkflowAllowed, true);
  assert.equal(data.runner, 'target_resolution_workflow');
  assert.equal(data.requiresTargetResolution, true);
  assert.equal(data.demoRoute, null);
});

test('server routes unsupported disease requests through target resolution', async () => {
  const query = encodeURIComponent('给阿尔茨海默设计10个抗体');
  const res = await fetch('http://127.0.0.1:' + PORT + '/api/debug/user-routing?text=' + query);
  assert.equal(res.status, 200);
  const data = await res.json();

  assert.equal(data.detectedIntent, 'assistant_chat');
  assert.equal(data.intent, 'design');
  assert.equal(data.localWorkflowAllowed, true);
  assert.equal(data.runner, 'target_resolution_workflow');
  assert.equal(data.requiresTargetResolution, true);
  assert.equal(data.demoRoute, null);
});

test('server routes obesity indication requests through target resolution instead of direct disease target', async () => {
  const query = encodeURIComponent('帮我设计10个针对肥胖的抗体');
  const res = await fetch('http://127.0.0.1:' + PORT + '/api/debug/user-routing?text=' + query);
  assert.equal(res.status, 200);
  const data = await res.json();

  assert.equal(data.intent, 'design');
  assert.equal(data.localWorkflowAllowed, true);
  assert.equal(data.runner, 'target_resolution_workflow');
  assert.equal(data.requiresTargetResolution, true);
  assert.equal(data.diseaseIndication, '肥胖');
});

test('server routes compact obesity antibody wording through target resolution', async () => {
  const query = encodeURIComponent('设计一个肥胖抗体');
  const res = await fetch('http://127.0.0.1:' + PORT + '/api/debug/user-routing?text=' + query);
  assert.equal(res.status, 200);
  const data = await res.json();

  assert.equal(data.intent, 'design');
  assert.equal(data.localWorkflowAllowed, true);
  assert.equal(data.runner, 'target_resolution_workflow');
  assert.equal(data.requiresTargetResolution, true);
  assert.equal(data.diseaseIndication, '肥胖');
});

test('server design route does not render obesity as a direct antigen target', async () => {
  const query = encodeURIComponent('设计一个针对肥胖的抗体');
  const res = await fetch('http://127.0.0.1:' + PORT + '/api/debug/design-route?text=' + query);
  assert.equal(res.status, 200);
  const data = await res.json();
  const serialized = JSON.stringify(data);

  assert.equal(data.intent, 'design');
  assert.equal(data.route, null);
  assert.equal(data.parsed.target, '肥胖');
  assert.equal(data.diseaseIndication, '肥胖');
  assert.doesNotMatch(serialized, /肥胖\s*(?:表面|目标)?抗原|肥胖\s*代表性目标结构约束|肥胖\s*抗原可及/);
});

test('disease design requests resolve a real target before launching the workflow', async () => {
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
          {
            message: {
              content: JSON.stringify({
                inputType: 'disease_indication',
                disease: '肥胖',
                selectedTarget: 'Activin E / Myostatin',
                selectedGene: 'INHBE / GDF8',
                designLabel: 'OBESITY-1',
                confidence: 0.88,
                reason: '肥胖方向更适合先解析到可设计抗体靶点。Activin E / Myostatin 与代谢调控、体重管理和瘦体重保持相关，适合作为本轮抗体设计代表靶点。',
                candidates: [
                  { target: 'Activin E', gene: 'INHBE', rationale: '脂肪分布和心代谢调控相关' },
                  { target: 'Myostatin', gene: 'GDF8', rationale: '骨骼肌保持和体成分改善相关' }
                ]
              })
            }
          }
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
          apiKey: 'test-target-resolver-secret',
          model: 'mock-target-resolver'
        }
      })
    });
    assert.equal(saveResp.status, 200);
    const saved = await saveResp.json();

    const messages = await collectUserMessageStream('设计一个针对肥胖的抗体', {
      timeoutMs: 12000,
      voiceSessionId: saved.voiceSessionId,
      stopWhen: (msg) => msg.type === 'tool_call' && msg.tool === 'target_evidence_review'
    });
    const serialized = JSON.stringify(messages);
    const agentTexts = messages.filter(msg => msg.type === 'agent_msg').map(msg => msg.text || '');
    const evidenceCall = messages.find(msg => msg.type === 'tool_call' && msg.tool === 'target_evidence_review');

    assert.equal(captured.method, 'POST');
    assert.equal(captured.url, '/v1/chat/completions');
    assert.equal(captured.authorization, 'Bearer test-target-resolver-secret');
    assert.equal(captured.body.model, 'mock-target-resolver');
    assert.deepEqual(captured.body.response_format, { type: 'json_object' });
    assert.match(captured.body.messages[0].content, /靶点解析|疾病方向|JSON/);
    assert.match(captured.body.messages[1].content, /设计一个针对肥胖的抗体/);
    assert.match(agentTexts[0], /肥胖|OBESITY-1|Activin E|Myostatin|INHBE|GDF8/);
    assert.equal(evidenceCall.params.target, 'Activin E/Myostatin');
    assert.match(serialized, /Activin E \/ Myostatin|INHBE \/ GDF8/);
    assert.doesNotMatch(serialized, /肥胖\s*(?:表面|目标)?抗原|肥胖\s*代表性目标结构约束|肥胖\s*抗原可及/);
    assert.doesNotMatch(serialized, VISIBLE_RESOLVER_LEAK_PATTERN);
  } finally {
    await new Promise(resolve => mockServer.close(resolve));
  }
});

test('implicit pathogen target requests call the model before launching the workflow', async () => {
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
          {
            message: {
              content: JSON.stringify({
                inputType: 'pathogen_antigen',
                disease: '植物病毒抗原识别方向',
                selectedTarget: 'TMV coat protein',
                selectedGene: 'CP',
                designLabel: 'TMV-CP-1',
                confidence: 0.82,
                reason: '烟草花叶病毒抗体设计更适合围绕衣壳蛋白抗原表面展开。',
                candidates: [
                  { target: 'TMV coat protein', gene: 'CP', rationale: '病毒颗粒表面主要结构蛋白。' }
                ]
              })
            }
          }
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
          apiKey: 'test-pathogen-target-secret',
          model: 'mock-pathogen-target'
        }
      })
    });
    assert.equal(saveResp.status, 200);
    const saved = await saveResp.json();

    const messages = await collectUserMessageStream('设计10个烟草花叶病毒的抗体', {
      timeoutMs: 12000,
      voiceSessionId: saved.voiceSessionId,
      stopWhen: (msg) => msg.type === 'tool_call' && msg.tool === 'target_evidence_review'
    });
    const serialized = JSON.stringify(messages);
    const agentTexts = messages.filter(msg => msg.type === 'agent_msg').map(msg => msg.text || '');
    const evidenceCall = messages.find(msg => msg.type === 'tool_call' && msg.tool === 'target_evidence_review');
    const firstBusinessMessage = messages.find(msg => msg.type !== 'connected');
    const thinkingMessages = messages.filter(msg => msg.type === 'assistant_thinking');

    assert.equal(captured.method, 'POST');
    assert.equal(captured.body.model, 'mock-pathogen-target');
    assert.match(captured.body.messages[0].content, /烟草花叶病毒|抗体设计需求|靶点解析/);
    assert.equal(firstBusinessMessage.type, 'assistant_thinking');
    assert.equal(thinkingMessages.length, 1);
    assert.match(thinkingMessages[0].topic, /biomedical design intent/i);
    assert.match(agentTexts[0], /烟草花叶病毒|TMV coat protein|TMV-CP-1|CP/);
    assert.equal(evidenceCall.params.target, 'TMV coat protein');
    assert.match(serialized, /TMV coat protein|TMV-CP-1/);
    assert.doesNotMatch(serialized, /IL-33|ST2|PD-L1|CD274/);
  } finally {
    await new Promise(resolve => mockServer.close(resolve));
  }
});

test('target resolver accepts provider reasoning JSON when message content is empty', async () => {
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
          {
            message: {
              content: '',
              reasoning_content: JSON.stringify({
                inputType: 'disease_indication',
                disease: '肥胖',
                selectedTarget: 'Leptin receptor',
                selectedGene: 'LEPR',
                designLabel: 'OBESITY-LLM',
                confidence: 0.81,
                reason: '模型将肥胖方向解析为可进入抗体设计的 Leptin receptor 靶点。',
                candidates: [
                  { target: 'Leptin receptor', gene: 'LEPR', rationale: '食欲和能量稳态相关受体。' }
                ]
              })
            }
          }
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
          apiKey: 'test-reasoning-json-secret',
          model: 'mock-reasoning-json'
        }
      })
    });
    assert.equal(saveResp.status, 200);
    const saved = await saveResp.json();

    const messages = await collectUserMessageStream('设计一个针对肥胖的抗体', {
      timeoutMs: 12000,
      voiceSessionId: saved.voiceSessionId,
      stopWhen: (msg) => msg.type === 'tool_call' && msg.tool === 'target_evidence_review'
    });
    const agentTexts = messages.filter(msg => msg.type === 'agent_msg').map(msg => msg.text || '');
    const evidenceCall = messages.find(msg => msg.type === 'tool_call' && msg.tool === 'target_evidence_review');

    assert.equal(captured.body.model, 'mock-reasoning-json');
    assert.match(agentTexts[0], /OBESITY-LLM|Leptin receptor|LEPR/);
    assert.equal(evidenceCall.params.target, 'Leptin receptor');
  } finally {
    await new Promise(resolve => mockServer.close(resolve));
  }
});

test('target resolver rejects disease-shaped pseudo targets from the model', async () => {
  const mockServer = http.createServer((req, res) => {
    req.resume();
    req.on('end', () => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        choices: [
          {
            message: {
              content: JSON.stringify({
                inputType: 'disease_indication',
                disease: '肥胖',
                selectedTarget: '肥胖表面抗原',
                selectedGene: '',
                designLabel: 'BAD-OBESITY',
                confidence: 0.95,
                reason: '错误地把疾病短语包装成抗原。',
                candidates: [
                  { target: '肥胖抗原可及区域', gene: '', rationale: '伪靶点。' }
                ]
              })
            }
          }
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
          apiKey: 'test-pseudo-target-secret',
          model: 'mock-pseudo-target'
        }
      })
    });
    assert.equal(saveResp.status, 200);
    const saved = await saveResp.json();

    const messages = await collectUserMessageStream('设计一个针对肥胖的抗体', {
      timeoutMs: 12000,
      voiceSessionId: saved.voiceSessionId,
      stopWhen: (msg) => msg.type === 'tool_call' && msg.tool === 'target_evidence_review'
    });
    const serialized = JSON.stringify(messages);
    const evidenceCall = messages.find(msg => msg.type === 'tool_call' && msg.tool === 'target_evidence_review');

    assert.equal(evidenceCall.params.target, 'Activin E/Myostatin');
    assert.match(serialized, /Activin E \/ Myostatin|OBESITY-1/);
    assert.doesNotMatch(serialized, /肥胖\s*(?:表面|目标)?抗原|肥胖\s*代表性目标结构约束|肥胖\s*抗原可及|BAD-OBESITY/);
    assert.doesNotMatch(serialized, VISIBLE_RESOLVER_LEAK_PATTERN);
  } finally {
    await new Promise(resolve => mockServer.close(resolve));
  }
});

test('target resolver fallback keeps implicit pathogen requests on a related antigen', async () => {
  const messages = await collectUserMessageStream('设计10个烟草花叶病毒的抗体', {
    timeoutMs: 12000,
    stopWhen: (msg) => msg.type === 'tool_call' && msg.tool === 'target_evidence_review'
  });
  const serialized = JSON.stringify(messages);
  const evidenceCall = messages.find(msg => msg.type === 'tool_call' && msg.tool === 'target_evidence_review');

  assert.match(evidenceCall.params.target, /TMV coat protein|烟草花叶病毒/);
  assert.doesNotMatch(serialized, /PD-L1|CD274|IL-33|ST2/);
  assert.doesNotMatch(serialized, VISIBLE_RESOLVER_LEAK_PATTERN);
});

test('target resolver fallback keeps allergic asthma ten-candidate workflows on a prepared target', async () => {
  const messages = await collectUserMessageStream('帮我为过敏性哮喘设计十个抗体分子', {
    timeoutMs: 12000,
    stopWhen: (msg) => msg.type === 'tool_call' && msg.tool === 'target_evidence_review'
  });
  const serialized = JSON.stringify(messages);
  const evidenceCall = messages.find(msg => msg.type === 'tool_call' && msg.tool === 'target_evidence_review');

  assert.ok(evidenceCall, 'workflow should reach target evidence review instead of erroring');
  assert.match(evidenceCall.params.target, /IL-33|TSLP/);
  assert.doesNotMatch(serialized, /工作流执行出错|Cannot read properties/);
  assert.doesNotMatch(serialized, VISIBLE_RESOLVER_LEAK_PATTERN);
});

test('server routes diabetes indication requests through target resolution', async () => {
  const query = encodeURIComponent('帮我设计10个针对糖尿病的抗体');
  const res = await fetch('http://127.0.0.1:' + PORT + '/api/debug/user-routing?text=' + query);
  assert.equal(res.status, 200);
  const data = await res.json();

  assert.equal(data.intent, 'design');
  assert.equal(data.localWorkflowAllowed, true);
  assert.equal(data.runner, 'target_resolution_workflow');
  assert.equal(data.requiresTargetResolution, true);
  assert.equal(data.diseaseIndication, '糖尿病');
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
