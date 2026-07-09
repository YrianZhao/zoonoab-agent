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
const QUESTION_LOG_PATH = path.join(os.tmpdir(), 'zoonoab-test-question-routing-' + PORT + '.jsonl');
const VISIBLE_RESOLVER_LEAK_PATTERN = /未能完成|当前未能|在线靶点解析|解析失败|兜底|代表靶点|代表抗原|补充明确靶点|无关靶点|系统保留|系统选择|系统优先选择|验证展示序列|大模型\s*API|真正的研发设计/;
let serverProcess;
let defaultMockServer;
let defaultVoiceSessionId = '';

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
        ...((options.voiceSessionId || defaultVoiceSessionId) ? { voiceSessionId: options.voiceSessionId || defaultVoiceSessionId } : {})
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

function buildCompactDesignResponse({
  summary = '抗体设计需求',
  background = '已根据用户输入整理疾病方向、靶点背景和抗体设计入口。',
  disease = '',
  target,
  gene = '',
  label = '',
  reason = '该靶点与用户需求具备明确生物学关联，并具备可用于抗体候选设计的可及结构区域。',
  candidates = [],
  mechanism = '围绕目标抗原外露表位生成抗体候选。',
  ab = 'Fab',
  count = 10,
  block = '',
  confidence = 0.8
}) {
  return JSON.stringify({
    i: 'design',
    start: true,
    summary,
    bg: background,
    disease,
    target,
    gene,
    label,
    reason,
    cands: candidates.map(item => ({ t: item.target, g: item.gene || '', r: item.rationale || '' })),
    mech: mechanism,
    ab,
    n: count,
    block,
    confidence,
    clarify: false,
    q: ''
  });
}

function defaultModelResponseForText(text) {
  const raw = String(text || '');
  if (/天气|weather|你能做什么|what can|表位预测/.test(raw)) {
    return JSON.stringify({
      i: 'chat',
      start: false,
      answer: /表位预测/.test(raw)
        ? '请补充明确靶点或抗原名称后，我可以继续整理表位预测任务。'
        : '我可以帮助你把疾病方向、靶点和抗体形式整理成可执行的分子设计任务。'
    });
  }
  if (/PD-?L1|PD-?L-?1/i.test(raw)) {
    return buildCompactDesignResponse({
      summary: 'PD-L1 Fab 设计',
      background: 'PD-L1 是肿瘤免疫检查点通路中的关键配体，具备明确胞外结构域和抗体开发背景。',
      disease: '肿瘤免疫治疗',
      target: 'PD-L1',
      gene: 'CD274',
      label: 'ONCOLOGY-PDL1-1',
      reason: 'PD-L1 与 PD-1 介导的免疫抑制通路直接相关，胞外 IgV 结构域可作为抗体结合与阻断界面，且具有成熟抗体开发和结构展示背景；该靶点与用户要求的 Fab 设计高度匹配，适合进入候选筛选和三维结构评估。',
      candidates: [
        { target: 'PD-L1', gene: 'CD274', rationale: '免疫检查点配体，适合阻断 PD-1/PD-L1 相互作用。' },
        { target: 'PD-1', gene: 'PDCD1', rationale: 'T 细胞抑制性受体，可作为通路备选。' }
      ],
      mechanism: '阻断 PD-1/PD-L1 相互作用并筛选高亲和力 Fab。',
      block: 'PD-1'
    });
  }
  if (/烟草花叶病毒|tobacco mosaic|TMV/i.test(raw)) {
    return buildCompactDesignResponse({
      summary: '烟草花叶病毒抗体设计需求',
      background: '烟草花叶病毒抗体设计更适合围绕衣壳蛋白抗原表面展开。',
      disease: '植物病毒抗原识别方向',
      target: 'TMV coat protein',
      gene: 'CP',
      label: 'TMV-CP-1',
      reason: '烟草花叶病毒抗体设计应优先解析到 TMV coat protein。该衣壳蛋白是病毒颗粒表面的主要结构蛋白，重复排列形成稳定外露界面，适合抗体识别、候选结合姿态评估和结构展示；相比直接把病毒名作为靶点，它提供了更明确的抗原对象。',
      candidates: [
        { target: 'TMV coat protein', gene: 'CP', rationale: '病毒颗粒表面主要结构蛋白。' },
        { target: 'TMV virion surface', gene: '', rationale: '完整颗粒表面可作为检测型抗体备选方向。' }
      ],
      mechanism: '识别衣壳蛋白外露表面并生成 Fab 候选。'
    });
  }
  if (/过敏性哮喘|asthma|哮喘/.test(raw)) {
    return buildCompactDesignResponse({
      summary: '过敏性哮喘抗体设计',
      background: '过敏性哮喘抗体设计通常关注上皮报警素和 2 型炎症轴。',
      disease: '过敏性哮喘',
      target: 'IL-33',
      gene: 'IL33',
      label: 'ASTHMA-IL33-1',
      reason: 'IL-33 是过敏性哮喘中重要的上皮来源报警素，可通过 ST2 受体放大 2 型炎症反应。其通路与气道炎症、嗜酸性粒细胞募集和免疫调控关联明确，且蛋白靶点具备可讨论的外露结构区域，适合作为本轮抗体候选设计入口。',
      candidates: [
        { target: 'IL-33', gene: 'IL33', rationale: '上皮报警素，适合阻断 IL-33/ST2 轴。' },
        { target: 'TSLP', gene: 'TSLP', rationale: '上皮细胞因子，过敏炎症备选入口。' },
        { target: 'IL-5', gene: 'IL5', rationale: '2 型炎症和嗜酸性粒细胞相关因子。' }
      ],
      mechanism: '阻断 IL-33/ST2 通路并筛选 Fab 候选。'
    });
  }
  if (/肿瘤免疫|癌症免疫|checkpoint/.test(raw)) {
    return buildCompactDesignResponse({
      summary: '肿瘤免疫治疗抗体设计',
      background: '肿瘤免疫治疗方向可优先围绕 PD-1/PD-L1 免疫检查点通路展开。',
      disease: '肿瘤免疫治疗',
      target: 'PD-L1',
      gene: 'CD274',
      label: 'ONCOLOGY-PDL1-1',
      reason: '肿瘤免疫治疗方向中，PD-L1 是与 T 细胞 PD-1 结合并介导免疫抑制的关键配体，胞外结构域明确且抗体开发背景成熟。选择 PD-L1 可直接服务于阻断 PD-1/PD-L1 相互作用的机制展示，并与后续 Fab 候选设计、结构评估和 3D 展示保持一致。',
      candidates: [
        { target: 'PD-L1', gene: 'CD274', rationale: '免疫检查点配体，适合展示阻断机制。' },
        { target: 'PD-1', gene: 'PDCD1', rationale: 'T 细胞抑制性受体，可作为通路备选入口。' },
        { target: 'CTLA-4', gene: 'CTLA4', rationale: '经典免疫检查点靶点。' }
      ],
      mechanism: '阻断 PD-1/PD-L1 相互作用并筛选 Fab 候选。',
      block: 'PD-1'
    });
  }
  if (/肥胖/.test(raw)) {
    return buildCompactDesignResponse({
      summary: '面向肥胖方向设计抗体候选',
      background: '肥胖方向抗体设计需要先解析到可被抗体识别的真实蛋白靶点。',
      disease: '肥胖',
      target: 'Activin E / Myostatin',
      gene: 'INHBE / GDF8',
      label: 'OBESITY-1',
      reason: '肥胖方向更适合先解析到可设计抗体靶点。Activin E / Myostatin 与代谢调控、体重管理和瘦体重保持相关，具备可讨论的分泌蛋白或通路调控背景，适合作为本轮抗体设计代表靶点；相比直接把肥胖作为抗原，该组合能提供明确蛋白对象。',
      candidates: [
        { target: 'Activin E', gene: 'INHBE', rationale: '脂肪分布和心代谢调控相关。' },
        { target: 'Myostatin', gene: 'GDF8', rationale: '骨骼肌保持和体成分改善相关。' }
      ],
      mechanism: '围绕代谢调控相关蛋白生成 Fab 候选。'
    });
  }
  if (/心肌炎|慢性炎症|炎症/.test(raw)) {
    return buildCompactDesignResponse({
      summary: '炎症相关抗体设计',
      background: '炎症相关疾病可先围绕可中和细胞因子入口进行抗体候选设计。',
      disease: /心肌炎/.test(raw) ? '心肌炎' : '慢性炎症',
      target: 'IL-1β',
      gene: 'IL1B',
      label: 'INFLAMMATION-IL1B-1',
      reason: 'IL-1β 是炎症级联中的可中和细胞因子，与多类炎症反应、免疫细胞活化和组织损伤通路相关。对于缺少明确靶点的炎症类需求，选择 IL-1β 能提供真实蛋白对象、可及表面和抗体设计背景，便于稳定进入候选生成和结构评估。',
      candidates: [
        { target: 'IL-1β', gene: 'IL1B', rationale: '炎症通路中可中和细胞因子。' },
        { target: 'TNF', gene: 'TNF', rationale: '经典炎症因子，可作为备选。' },
        { target: 'IL-6', gene: 'IL6', rationale: '炎症级联相关细胞因子。' }
      ],
      mechanism: '中和 IL-1β 并生成 Fab 候选。'
    });
  }
  return buildCompactDesignResponse({
    summary: '抗体设计需求',
    disease: '用户指定方向',
    target: 'PD-L1',
    gene: 'CD274',
    label: 'GENERIC-PDL1-1',
    reason: '用户输入被理解为抗体设计请求，但缺少更细的靶点限定；模型选择具备成熟结构展示和抗体开发背景的 PD-L1 作为可进入流程的代表入口，便于完成候选生成、结构评估和可开发性展示。',
    candidates: [
      { target: 'PD-L1', gene: 'CD274', rationale: '成熟抗体设计和结构展示入口。' }
    ],
    mechanism: '围绕 PD-L1 外露结构域生成候选抗体。'
  });
}

test.before(async () => {
  try { fs.unlinkSync(CONFIG_PATH); } catch {}
  try { fs.unlinkSync(QUESTION_LOG_PATH); } catch {}
  defaultMockServer = http.createServer((req, res) => {
    let body = '';
    req.setEncoding('utf8');
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      let text = '';
      try {
        const parsed = JSON.parse(body || '{}');
        const userMessage = Array.isArray(parsed.messages) ? parsed.messages.find(item => item && item.role === 'user') : null;
        text = userMessage && userMessage.content ? String(userMessage.content) : '';
      } catch {}
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ choices: [{ message: { content: defaultModelResponseForText(text) } }] }));
    });
  });
  await new Promise(resolve => defaultMockServer.listen(0, '127.0.0.1', resolve));
  const defaultMockPort = defaultMockServer.address().port;
  fs.writeFileSync(CONFIG_PATH, JSON.stringify({
    voice: { provider: 'local', key: '', url: 'http://127.0.0.1:8765/v1/audio/transcriptions', model: 'paraformer-zh' },
    chat: { provider: 'compatible', key: 'test-default-model-secret', url: 'http://127.0.0.1:' + defaultMockPort + '/v1/chat/completions', model: 'mock-default-model' },
    updatedAt: Date.now()
  }), { mode: 0o600 });
  serverProcess = spawn(process.execPath, ['server.js'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      NODE_ENV: 'test',
      PORT: String(PORT),
      VOICE_API_CONFIG_FILE: CONFIG_PATH,
      WORKFLOW_REJECTION_LOG_FILE: QUESTION_LOG_PATH,
      LOCAL_ASR_AUTO_START: '0',
      TARGET_RESOLVER_TIMEOUT_MS: '4000'
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  await waitForHealth();
  const defaultSessionResp = await fetch('http://127.0.0.1:' + PORT + '/api/voice/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      voice: { mode: 'local', provider: 'local' },
      chat: {
        baseUrl: 'http://127.0.0.1:' + defaultMockPort + '/v1',
        apiKey: 'test-default-model-secret',
        model: 'mock-default-model'
      }
    })
  });
  assert.equal(defaultSessionResp.status, 200);
  const defaultSession = await defaultSessionResp.json();
  defaultVoiceSessionId = defaultSession.voiceSessionId;
});

test.after(async () => {
  if (serverProcess && !serverProcess.killed) {
    serverProcess.kill('SIGTERM');
    await new Promise(resolve => serverProcess.once('exit', resolve));
  }
  if (defaultMockServer) await new Promise(resolve => defaultMockServer.close(resolve));
  try { fs.unlinkSync(CONFIG_PATH); } catch {}
  try { fs.unlinkSync(QUESTION_LOG_PATH); } catch {}
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

test('server routes shorthand flu NA monoclonal sequence requests to design workflow', async () => {
  const query = encodeURIComponent('设计 10 个具有结合活性的流感 NA 单抗序列');
  const res = await fetch('http://127.0.0.1:' + PORT + '/api/debug/user-routing?text=' + query);
  assert.equal(res.status, 200);
  const data = await res.json();

  assert.equal(data.intent, 'design');
  assert.equal(data.localWorkflowAllowed, true);
  assert.equal(data.runner, 'local_workflow');
  assert.equal(data.requiresTargetResolution, false);
  assert.equal(data.demoRoute.target, 'Influenza NA');
});

test('voice health exposes the current build version at the top level', async () => {
  const html = fs.readFileSync(path.join(process.cwd(), 'public/index.html'), 'utf8');
  const buildVersion = html.match(/APP_BUILD_VERSION\s*=\s*'(\d+)'/)[1];
  const res = await fetch('http://127.0.0.1:' + PORT + '/api/voice/health?autostart=0');
  assert.equal(res.status, 200);
  const data = await res.json();

  assert.equal(data.buildVersion, buildVersion);
  assert.equal(data.diagnostics && data.diagnostics.buildVersion, buildVersion);
});

test('server can let the chat model route terse monoclonal slang into workflow', async () => {
  const captured = [];
  const mockServer = http.createServer((req, res) => {
    let body = '';
    req.setEncoding('utf8');
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      const parsedBody = JSON.parse(body || '{}');
      captured.push(parsedBody);
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ choices: [{ message: { content: buildCompactDesignResponse({
        summary: '烟草花叶病毒单抗序列设计',
        background: '烟草花叶病毒抗体设计应优先围绕病毒颗粒表面的衣壳蛋白抗原展开。',
        disease: '植物病毒抗原识别方向',
        target: 'TMV coat protein',
        gene: 'CP',
        label: 'TMV-CP-1',
        reason: '烟草花叶病毒来十个单抗属于病原抗原识别设计请求。TMV coat protein 是病毒颗粒表面主要结构蛋白，重复排列、外露程度高，适合作为抗体识别和结构展示入口；相较把整个病毒名称当作靶点，衣壳蛋白能提供更明确的抗原对象和候选结合表面。',
        candidates: [
          { target: 'TMV coat protein', gene: 'CP', rationale: '病毒颗粒表面主要结构蛋白，适合作为抗体识别入口。' },
          { target: 'TMV virion surface', gene: '', rationale: '完整颗粒表面可作为检测型抗体备选方向。' }
        ],
        mechanism: '识别 TMV coat protein 外露表面并生成 mAb 候选。',
        ab: 'mAb',
        count: 10
      }) } }] }));
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
          apiKey: 'test-intent-router-secret',
          model: 'mock-intent-router'
        }
      })
    });
    assert.equal(saveResp.status, 200);
    const saved = await saveResp.json();

    const messages = await collectUserMessageStream('烟草花叶病毒来十个单抗', {
      timeoutMs: 12000,
      voiceSessionId: saved.voiceSessionId,
      stopWhen: (msg) => msg.type === 'tool_call' && msg.tool === 'target_evidence_review'
    });
    const evidenceCall = messages.find(msg => msg.type === 'tool_call' && msg.tool === 'target_evidence_review');

    assert.ok(evidenceCall, 'model-routed slang request should enter target-resolution workflow');
    assert.equal(evidenceCall.params.target, 'TMV coat protein');
    assert.equal(captured.length, 1);
    assert.match(captured[0].messages[0].content, /自然语言理解器|选择理由/);
    assert.deepEqual(captured[0].response_format, { type: 'json_object' });
    assert.ok(captured[0].max_tokens <= 700);
  } finally {
    await new Promise(resolve => mockServer.close(resolve));
  }
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

test('server previews curated real complexes for common explicit antigen targets', async () => {
  const requests = [
    { text: '设计10个针对PD-1的Fab', expectedTarget: 'PD-1', expectedPrefix: /^PD1-Fab-/ },
    { text: '设计10个针对CTLA-4的抗体', expectedTarget: 'CTLA-4', expectedPrefix: /^CTLA4-Fab-/ },
    { text: '设计10个针对CD20的Fab', expectedTarget: 'CD20', expectedPrefix: /^CD20-Fab-/ },
    { text: '设计10个针对CD19的Fab', expectedTarget: 'CD19', expectedPrefix: /^CD19-Fab-/ },
    { text: '设计10个针对CD3的Fab', expectedTarget: 'CD3', expectedPrefix: /^CD3-Fab-/ },
    { text: '设计10个针对C5的Fab', expectedTarget: 'C5', expectedPrefix: /^C5-Fab-/ },
    { text: '设计10个针对IL-6R的Fab', expectedTarget: 'IL-6R', expectedPrefix: /^IL6R-Fab-/ },
    { text: '设计10个针对IL-4Rα的Fab', expectedTarget: 'IL-4Rα', expectedPrefix: /^IL4RA-Fab-/ },
    { text: '设计10个针对CD25的Fab', expectedTarget: 'CD25', expectedPrefix: /^CD25-Fab-/ },
    { text: '设计10个针对CD38的Fab', expectedTarget: 'CD38', expectedPrefix: /^CD38-Fab-/ },
    { text: '设计10个针对TIGIT的Fab', expectedTarget: 'TIGIT', expectedPrefix: /^TIGIT-Fab-/ },
    { text: '设计10个针对CD47的Fab', expectedTarget: 'CD47', expectedPrefix: /^CD47-Fab-/ },
    { text: '设计10个针对LAG-3的Fab', expectedTarget: 'LAG-3', expectedPrefix: /^LAG3-Fab-/ },
    { text: '设计10个针对TROP-2的Fab', expectedTarget: 'TROP-2', expectedPrefix: /^TROP2-Fab-/ },
    { text: '设计10个针对BCMA的Fab', expectedTarget: 'BCMA', expectedPrefix: /^BCMA-Fab-/ },
    { text: '设计10个针对IgE的Fab', expectedTarget: 'IgE', expectedPrefix: /^IgE-Fab-/ },
    { text: '设计10个针对CGRP receptor的Fab', expectedTarget: 'CGRP receptor', expectedPrefix: /^CGRPR-Fab-/ },
    { text: '设计10个针对流感NA的Fab', expectedTarget: 'Influenza NA', expectedPrefix: /^FluNA-Fab-/ }
  ];

  for (const item of requests) {
    const query = encodeURIComponent(item.text);
    const res = await fetch('http://127.0.0.1:' + PORT + '/api/debug/design-route?text=' + query);
    assert.equal(res.status, 200);
    const data = await res.json();
    const firstBinder = data.threeDPreview && data.threeDPreview.binders && data.threeDPreview.binders[0];

    assert.ok(firstBinder, item.text + ' should preview a local 3D model');
    assert.equal(data.profile && data.profile.targetDisplay, item.expectedTarget, item.text + ' should keep the explicit target in the preview profile');
    assert.match(firstBinder.file, item.expectedPrefix);
    assert.match(firstBinder.structuralBasis, /RCSB /);
    assert.equal(firstBinder.fallback, false);
    assert.ok(Array.isArray(firstBinder.antigenChains) && firstBinder.antigenChains.length >= 1);
    assert.ok(Array.isArray(firstBinder.antibodyChains) && firstBinder.antibodyChains.length >= 2);
  }
});

test('generic target previews avoid local display structures without antigen-antibody contact', async () => {
  const query = encodeURIComponent('设计10个具有结合活性的流感NA单抗序列');
  const res = await fetch('http://127.0.0.1:' + PORT + '/api/debug/design-route?text=' + query);
  assert.equal(res.status, 200);
  const data = await res.json();
  const files = data.threeDPreview.files;
  const firstBinder = data.threeDPreview.binders[0];

  assert.equal(data.parsed.target, 'Influenza NA');
  assert.ok(files.length >= 10);
  assert.ok(files.every(file => !/^ANGPTL3-/.test(file)), 'generic Influenza NA previews should not borrow non-contact ANGPTL3 display structures');
  assert.ok(data.threeDPreview.binders.every(item => Array.isArray(item.antigenChains) && item.antigenChains.length >= 1));
  assert.ok(data.threeDPreview.binders.every(item => Array.isArray(item.antibodyChains) && item.antibodyChains.length >= 1));
  assert.match(firstBinder.file, /^FluNA-Fab-/);
  assert.deepEqual(firstBinder.antigenChains, ['A'], 'Flu NA should show the neuraminidase antigen chain from the real NA-Fab complex');
  assert.deepEqual(firstBinder.sourceAntigenChains, ['A']);
  assert.deepEqual(firstBinder.antibodyChains, ['B', 'C']);
  assert.deepEqual(firstBinder.sourceAntibodyChains, ['B', 'C']);
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
  assert.match(firstBinder.structuralBasis, /9X0J|Tozorakimab Fab/);
  assert.doesNotMatch(serialized, /IL33-VHH|本地 VHH 展示支架|4KC3/);
});

test('server marks interface detail availability according to real-complex evidence', async () => {
  const giprQuery = encodeURIComponent('针对 GIPR 设计十个抗体分子');
  const giprRes = await fetch('http://127.0.0.1:' + PORT + '/api/debug/design-route?text=' + giprQuery);
  assert.equal(giprRes.status, 200);
  const gipr = await giprRes.json();
  const giprBinder = gipr.threeDPreview.binders[0];

  assert.match(giprBinder.file, /^GIPR-Fab-01\.pdb$/);
  assert.match(giprBinder.structuralBasis, /4HJ0|GIPG013 Fab/);
  assert.equal(giprBinder.interfaceDetail, true);
  assert.deepEqual(giprBinder.antigenChains, ['A']);
  assert.deepEqual(giprBinder.antibodyChains, ['B', 'C']);

  const angptl3Query = encodeURIComponent('针对 ANGPTL3 设计十个抗体分子');
  const angptl3Res = await fetch('http://127.0.0.1:' + PORT + '/api/debug/design-route?text=' + angptl3Query);
  assert.equal(angptl3Res.status, 200);
  const angptl3 = await angptl3Res.json();
  const angptl3Binder = angptl3.threeDPreview.binders[0];

  assert.match(angptl3Binder.file, /^ANGPTL3-(?:CV|Met)-Fab-\d+\.pdb$/);
  assert.match(angptl3Binder.displayFile, /^ANGPTL3-(?:CV|Met)-Fab-\d+\.pdb$/);
  assert.doesNotMatch(angptl3Binder.file, /^PCSK9-Fab-/);
  assert.match(angptl3Binder.structuralBasis, /ANGPTL3|6EUA|真实靶点结构/);
  assert.equal(angptl3Binder.interfaceDetail, false);
  assert.deepEqual(angptl3Binder.antigenChains, ['A', 'D', 'E']);
  assert.deepEqual(angptl3Binder.antibodyChains, ['B', 'C']);
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

  assert.equal(firstBusinessMessage.type, 'agent_msg');
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

test('server records user inputs that are routed away from local workflows', async () => {
  const text = '帮我做一下表位预测';
  await collectUserMessageStream(text);

  const res = await fetch('http://127.0.0.1:' + PORT + '/api/workflow-rejection-logs?limit=5');
  assert.equal(res.status, 200);
  const data = await res.json();
  const entry = data.logs.find(item => item.input === text);

  assert.ok(entry, 'expected rejected workflow input to be recorded');
  assert.equal(entry.detectedIntent, 'assistant_chat');
  assert.equal(entry.finalIntent, 'assistant_chat');
  assert.equal(entry.localWorkflowAllowed, false);
  assert.match(entry.reason, /未识别|问答/);
  assert.doesNotMatch(JSON.stringify(entry), /quick_design|白名单|写死|大模型 API/);
});

test('server records all user questions and classifies workflow routing', async () => {
  const acceptedText = '设计10个针对PD-L1的Fab';
  const rejectedText = '帮我做一下表位预测';
  await collectUserMessageStream(acceptedText, {
    stopWhen: (msg, messages) => (
      msg.type === 'quick_design_ack' ||
      messages.some(item => item.type === 'agent_msg' && /正在启动抗体设计工作流/.test(item.text || ''))
    ),
    timeoutMs: 5000
  });
  await collectUserMessageStream(rejectedText);

  const allResp = await fetch('http://127.0.0.1:' + PORT + '/api/question-routing-logs?limit=20');
  assert.equal(allResp.status, 200);
  const allData = await allResp.json();
  const accepted = allData.logs.find(item => item.input === acceptedText);
  const rejected = allData.logs.find(item => item.input === rejectedText);

  assert.ok(accepted, 'expected workflow-routed input to be recorded');
  assert.ok(rejected, 'expected rejected input to be recorded');
  assert.equal(accepted.status, 'workflow_started');
  assert.equal(accepted.workflowStarted, true);
  assert.equal(accepted.finalIntent, 'design');
  assert.equal(rejected.status, 'workflow_rejected');
  assert.equal(rejected.workflowStarted, false);
  assert.equal(rejected.finalIntent, 'assistant_chat');

  const workflowResp = await fetch('http://127.0.0.1:' + PORT + '/api/question-routing-logs?status=workflow_started&limit=20');
  assert.equal(workflowResp.status, 200);
  const workflowData = await workflowResp.json();
  assert.ok(workflowData.logs.some(item => item.input === acceptedText));
  assert.equal(workflowData.logs.some(item => item.input === rejectedText), false);

  const rejectedResp = await fetch('http://127.0.0.1:' + PORT + '/api/question-routing-logs?status=workflow_rejected&limit=20');
  assert.equal(rejectedResp.status, 200);
  const rejectedData = await rejectedResp.json();
  assert.ok(rejectedData.logs.some(item => item.input === rejectedText));
  assert.equal(rejectedData.logs.some(item => item.input === acceptedText), false);
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

  assert.equal(data.detectedIntent, 'design');
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
              content: buildCompactDesignResponse({
                summary: '面向肥胖方向设计抗体候选',
                background: '肥胖方向抗体设计需要先解析到可被抗体识别的真实蛋白靶点。',
                disease: '肥胖',
                target: 'Activin E / Myostatin',
                gene: 'INHBE / GDF8',
                label: 'OBESITY-1',
                reason: '肥胖方向更适合先解析到可设计抗体靶点。Activin E / Myostatin 与代谢调控、体重管理和瘦体重保持相关，具备可讨论的分泌蛋白或通路调控背景，适合作为本轮抗体设计代表靶点；相比直接把肥胖作为抗原，该组合能提供明确蛋白对象和后续结构评估入口。',
                candidates: [
                  { target: 'Activin E', gene: 'INHBE', rationale: '脂肪分布和心代谢调控相关。' },
                  { target: 'Myostatin', gene: 'GDF8', rationale: '骨骼肌保持和体成分改善相关。' }
                ],
                mechanism: '围绕代谢调控相关蛋白生成可进入结构评估的 Fab 候选。',
                confidence: 0.88
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
    assert.match(captured.body.messages[0].content, /自然语言理解器|疾病方向|选择理由|JSON/);
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
              content: buildCompactDesignResponse({
                summary: '烟草花叶病毒抗体设计需求',
                background: '烟草花叶病毒抗体设计更适合围绕衣壳蛋白抗原表面展开。',
                disease: '植物病毒抗原识别方向',
                target: 'TMV coat protein',
                gene: 'CP',
                label: 'TMV-CP-1',
                reason: '烟草花叶病毒抗体设计更适合围绕衣壳蛋白抗原表面展开。TMV coat protein 是病毒颗粒表面的主要结构蛋白，重复排列形成稳定外露界面，适合作为抗体识别、候选结合姿态和结构展示的明确抗原入口。',
                candidates: [
                  { target: 'TMV coat protein', gene: 'CP', rationale: '病毒颗粒表面主要结构蛋白。' }
                ],
                mechanism: '识别衣壳蛋白外露表面并生成 Fab 候选。',
                confidence: 0.82
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
    assert.match(captured.body.messages[0].content, /自然语言理解器|选择理由|疾病方向/);
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
                i: 'design',
                start: true,
                summary: '面向肥胖方向设计抗体候选',
                bg: '肥胖方向抗体设计需要先解析到真实蛋白靶点。',
                disease: '肥胖',
                target: 'Leptin receptor',
                gene: 'LEPR',
                label: 'OBESITY-LLM',
                confidence: 0.81,
                reason: '模型将肥胖方向解析为可进入抗体设计的 Leptin receptor 靶点。',
                cands: [
                  { t: 'Leptin receptor', g: 'LEPR', r: '食欲和能量稳态相关受体。' }
                ],
                mech: '围绕 Leptin receptor 可及结构域生成 Fab 候选。',
                ab: 'Fab',
                n: 10
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
                i: 'design',
                start: true,
                summary: '面向肥胖方向设计抗体候选',
                bg: '肥胖方向抗体设计需要先解析到真实蛋白靶点。',
                disease: '肥胖',
                target: '肥胖表面抗原',
                gene: '',
                label: 'BAD-OBESITY',
                confidence: 0.95,
                reason: '错误地把疾病短语包装成抗原。',
                cands: [
                  { t: '肥胖抗原可及区域', g: '', r: '伪靶点。' }
                ],
                mech: '错误伪机制。',
                ab: 'Fab',
                n: 10
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
    const agentTexts = messages.filter(msg => msg.type === 'agent_msg').map(msg => msg.text || '');

    assert.equal(evidenceCall, undefined);
    assert.deepEqual(agentTexts, ['暂时无法理解这个需求，请稍后重试。']);
    assert.doesNotMatch(serialized, /肥胖\s*(?:表面|目标)?抗原|肥胖\s*代表性目标结构约束|肥胖\s*抗原可及|BAD-OBESITY/);
    assert.doesNotMatch(serialized, VISIBLE_RESOLVER_LEAK_PATTERN);
  } finally {
    await new Promise(resolve => mockServer.close(resolve));
  }
});

test('model-first routing keeps implicit pathogen requests on a related antigen', async () => {
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

test('model-first routing keeps allergic asthma ten-candidate workflows on a prepared target', async () => {
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

test('model-first routing handles myocarditis disease requests without startup failure', async () => {
  const messages = await collectUserMessageStream('帮我设计心肌炎抗体', {
    timeoutMs: 12000,
    stopWhen: (msg) => msg.type === 'error' || (msg.type === 'tool_call' && msg.tool === 'target_evidence_review')
  });
  const serialized = JSON.stringify(messages);
  const errorMessage = messages.find(msg => msg.type === 'error');
  const evidenceCall = messages.find(msg => msg.type === 'tool_call' && msg.tool === 'target_evidence_review');

  assert.equal(errorMessage, undefined);
  assert.ok(evidenceCall, 'myocarditis design request should reach target evidence review instead of erroring');
  assert.match(evidenceCall.params.target, /IL-1β|IL-1B|TNF|IL-6/i);
  assert.doesNotMatch(serialized, /工作流执行出错|Cannot read properties|心肌炎表面抗原|心肌炎代表性目标结构约束/);
  assert.doesNotMatch(serialized, VISIBLE_RESOLVER_LEAK_PATTERN);
});

test('tumor immunotherapy disease requests use one compact model parse before workflow launch', async () => {
  const captured = [];
  const mockServer = http.createServer((req, res) => {
    let body = '';
    req.setEncoding('utf8');
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      const parsedBody = JSON.parse(body || '{}');
      captured.push(parsedBody);
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        choices: [
          {
            message: {
              content: JSON.stringify({
                inputType: 'disease_indication',
                disease: '肿瘤免疫治疗',
                selectedTarget: 'PD-L1',
                selectedGene: 'CD274',
                designLabel: 'ONCOLOGY-PDL1-1',
                confidence: 0.91,
                reason: '肿瘤免疫治疗方向可优先围绕 PD-1/PD-L1 免疫检查点通路展开。PD-L1 具有明确胞外 IgV 结构域、抗体开发背景和本地三维结构预设，适合进入阻断型 Fab 候选设计。',
                candidates: [
                  { target: 'PD-L1', gene: 'CD274', rationale: '免疫检查点配体，适合展示阻断 PD-1/PD-L1 相互作用的抗体设计。' },
                  { target: 'PD-1', gene: 'PDCD1', rationale: 'T 细胞抑制性受体，可作为检查点通路备选入口。' },
                  { target: 'CTLA-4', gene: 'CTLA4', rationale: '经典免疫检查点靶点，可作为备选展示方向。' }
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
          apiKey: 'test-tumor-target-resolver-secret',
          model: 'mock-tumor-target-resolver'
        }
      })
    });
    assert.equal(saveResp.status, 200);
    const saved = await saveResp.json();

    const messages = await collectUserMessageStream('帮我做一个肿瘤免疫治疗方向的抗体设计', {
      timeoutMs: 12000,
      voiceSessionId: saved.voiceSessionId,
      stopWhen: (msg) => msg.type === 'tool_call' && msg.tool === 'target_evidence_review'
    });
    const serialized = JSON.stringify(messages);
    const agentTexts = messages.filter(msg => msg.type === 'agent_msg').map(msg => msg.text || '');
    const evidenceCall = messages.find(msg => msg.type === 'tool_call' && msg.tool === 'target_evidence_review');

    assert.equal(captured.length, 1, 'tumor immunotherapy disease request should use one compact model parse');
    assert.equal(captured[0].model, 'mock-tumor-target-resolver');
    assert.deepEqual(captured[0].response_format, { type: 'json_object' });
    assert.match(captured[0].messages[0].content, /自然语言理解器|选择理由|JSON/);
    assert.match(captured[0].messages[1].content, /肿瘤免疫治疗方向/);
    assert.match(agentTexts[0], /肿瘤免疫治疗|PD-L1|CD274|ONCOLOGY-PDL1-1/);
    assert.equal(evidenceCall.params.target, 'PD-L1');
    assert.match(evidenceCall.params.evidence_package, /PD-1\/PD-L1|免疫检查点/);
    assert.doesNotMatch(serialized, /IL-1β|IL1B|INFLAMMATION-IL1B/);
    assert.doesNotMatch(serialized, VISIBLE_RESOLVER_LEAK_PATTERN);
  } finally {
    await new Promise(resolve => mockServer.close(resolve));
  }
});

test('default model-first routing uses PD-L1 for tumor immunotherapy instead of inflammation defaults', async () => {
  const messages = await collectUserMessageStream('帮我做一个肿瘤免疫治疗方向的抗体设计', {
    timeoutMs: 12000,
    stopWhen: (msg) => msg.type === 'tool_call' && msg.tool === 'target_evidence_review'
  });
  const serialized = JSON.stringify(messages);
  const agentTexts = messages.filter(msg => msg.type === 'agent_msg').map(msg => msg.text || '');
  const evidenceCall = messages.find(msg => msg.type === 'tool_call' && msg.tool === 'target_evidence_review');

  assert.ok(evidenceCall, 'tumor immunotherapy request should reach target evidence review');
  assert.equal(evidenceCall.params.target, 'PD-L1');
  assert.match(agentTexts[0], /肿瘤免疫治疗|PD-L1|CD274|ONCOLOGY-PDL1-1/);
  assert.match(serialized, /PD-1\/PD-L1|免疫检查点|CD274/);
  assert.doesNotMatch(serialized, /IL-1β|IL1B|INFLAMMATION-IL1B/);
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

test('model-first routing stops when the model has no explicit target', async () => {
  const mockServer = http.createServer((req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ choices: [{ message: { content: '{"selectedTarget":"UNKNOWN"}' } }] }));
  });

  const mockPort = await listenOnLocalhost(mockServer);
  try {
    const saveResp = await fetch('http://127.0.0.1:' + PORT + '/api/voice/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        voice: { mode: 'local', provider: 'local' },
        chat: {
          baseUrl: 'http://127.0.0.1:' + mockPort + '/v1',
          apiKey: 'test-unknown-target-secret',
          model: 'mock-unknown-target'
        }
      })
    });
    assert.equal(saveResp.status, 200);
    const saved = await saveResp.json();

    const messages = await collectUserMessageStream('帮我设计10个针对慢性炎症的抗体', {
      timeoutMs: 12000,
      voiceSessionId: saved.voiceSessionId,
      stopWhen: (msg) => msg.type === 'done'
    });
    const agentTexts = messages.filter(msg => msg.type === 'agent_msg').map(msg => msg.text || '');
    const intro = agentTexts[0] || '';

    assert.equal(intro, '暂时无法理解这个需求，请稍后重试。');
    assert.equal(messages.some(msg => msg.type === 'tool_call' && msg.tool === 'target_evidence_review'), false);
    assert.doesNotMatch(intro, VISIBLE_RESOLVER_LEAK_PATTERN);
  } finally {
    await new Promise(resolve => mockServer.close(resolve));
  }
});

test('server routes drug molecule design wording through molecular design workflow', async () => {
  const targetQuery = encodeURIComponent('帮我设计10个针对流感 NA 的药物分子');
  const targetRes = await fetch('http://127.0.0.1:' + PORT + '/api/debug/user-routing?text=' + targetQuery);
  assert.equal(targetRes.status, 200);
  const targetData = await targetRes.json();

  assert.equal(targetData.intent, 'design');
  assert.equal(targetData.localWorkflowAllowed, true);
  assert.equal(targetData.runner, 'local_workflow');
  assert.equal(targetData.requiresTargetResolution, false);
  assert.equal(targetData.demoRoute.target, 'Influenza NA');

  const diseaseQuery = encodeURIComponent('帮我为过敏性哮喘设计一款药物');
  const diseaseRes = await fetch('http://127.0.0.1:' + PORT + '/api/debug/user-routing?text=' + diseaseQuery);
  assert.equal(diseaseRes.status, 200);
  const diseaseData = await diseaseRes.json();

  assert.equal(diseaseData.intent, 'design');
  assert.equal(diseaseData.localWorkflowAllowed, true);
  assert.equal(diseaseData.runner, 'target_resolution_workflow');
  assert.equal(diseaseData.requiresTargetResolution, true);
  assert.equal(diseaseData.diseaseIndication, '过敏性哮喘');
});

test('target resolver explanation remains rich for drug molecule design requests', async () => {
  const messages = await collectUserMessageStream('帮我为过敏性哮喘设计一款药物', {
    timeoutMs: 12000,
    stopWhen: (msg) => msg.type === 'tool_call' && msg.tool === 'target_evidence_review'
  });
  const agentTexts = messages.filter(msg => msg.type === 'agent_msg').map(msg => msg.text || '');
  const intro = agentTexts[0] || '';

  assert.match(intro, /本轮选择|选择理由|候选靶点评估/);
  assert.match(intro, /生物学关联|可及|结构评估|候选分子/);
  assert.match(intro, /IL-33|TSLP|IL-5/);
  assert.ok(intro.length > 260, 'target resolver visible explanation should not collapse to a short template');
  assert.doesNotMatch(intro, VISIBLE_RESOLVER_LEAK_PATTERN);
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
