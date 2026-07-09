const assert = require('assert/strict');
const { spawn } = require('child_process');
const http = require('http');
const os = require('os');
const path = require('path');
const fs = require('fs');
const test = require('node:test');
const WebSocket = require('ws');

const PORT = 19131;
const CONFIG_PATH = path.join(os.tmpdir(), 'zoonoab-model-first-config-' + PORT + '.json');
const QUESTION_LOG_PATH = path.join(os.tmpdir(), 'zoonoab-model-first-routing-' + PORT + '.jsonl');
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

async function saveMockChatConfig(mockPort, model = 'mock-model-first-router') {
  const saveResp = await fetch('http://127.0.0.1:' + PORT + '/api/voice/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      voice: { mode: 'local', provider: 'local' },
      chat: {
        baseUrl: 'http://127.0.0.1:' + mockPort + '/v1',
        apiKey: 'test-model-first-secret',
        model
      }
    })
  });
  assert.equal(saveResp.status, 200);
  return saveResp.json();
}

test.before(async () => {
  try { fs.unlinkSync(CONFIG_PATH); } catch {}
  try { fs.unlinkSync(QUESTION_LOG_PATH); } catch {}
  serverProcess = spawn(process.execPath, ['server.js'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      NODE_ENV: 'test',
      PORT: String(PORT),
      VOICE_API_CONFIG_FILE: CONFIG_PATH,
      WORKFLOW_REJECTION_LOG_FILE: QUESTION_LOG_PATH,
      LOCAL_ASR_AUTO_START: '0',
      WORKFLOW_INTENT_TIMEOUT_MS: '2500',
      TARGET_RESOLVER_TIMEOUT_MS: '2500',
      ASSISTANT_CHAT_API_KEY: '',
      ASSISTANT_CHAT_BASE_URL: '',
      DEEPSEEK_API_KEY: '',
      DEEPSEEK_CHAT_BASE_URL: '',
      VOICE_CHAT_API_KEY: '',
      VOICE_CHAT_BASE_URL: ''
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
  try { fs.unlinkSync(QUESTION_LOG_PATH); } catch {}
});

test('ordinary user input requires a configured chat key before any local workflow starts', async () => {
  const messages = await collectUserMessageStream('设计一个胰腺癌的抗体');
  const agentMessages = messages.filter(msg => msg.type === 'agent_msg').map(msg => msg.text || '');
  const serialized = JSON.stringify(messages);

  assert.deepEqual(agentMessages, ['智能解析服务暂时不可用，请检查助手问答配置后重试。']);
  assert.equal(messages[messages.length - 1].type, 'done');
  assert.doesNotMatch(serialized, /target_evidence_review|IL-1β|INFLAMMATION-IL1B|正在启动抗体设计工作流/);
});

test('model structured design result supplies target, background and candidates for workflow display', async () => {
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
        choices: [{
          message: {
            content: JSON.stringify({
              i: 'design',
              start: true,
              summary: '用户希望面向胰腺癌设计抗体候选分子。',
              bg: '胰腺癌常见抗体设计入口需要优先考虑肿瘤相关抗原表达、膜表面可及性和正常组织背景表达。',
              disease: '胰腺癌',
              target: 'MUC1',
              gene: 'MUC1',
              cands: [
                { t: 'MUC1', g: 'MUC1', r: '胰腺癌相关糖蛋白抗原，具备膜表面可及性。' },
                { t: 'Claudin 18.2', g: 'CLDN18', r: '部分胃肠道肿瘤和胰腺癌方向可讨论的膜蛋白入口。' },
                { t: 'Mesothelin', g: 'MSLN', r: '胰腺癌相关细胞表面抗原，可作为备选设计入口。' }
              ],
              mech: '优先识别 MUC1 肿瘤相关外露表位，生成可进入结构评估的 Fab 候选。',
              ab: 'Fab',
              n: 10,
              confidence: 0.82,
              workflow: {
                routeLabel: 'MUC1 胰腺癌细胞表面识别路线',
                disease: '胰腺癌',
                targetDisplay: 'MUC1',
                partnerDisplay: '',
                domain: 'MUC1 胞外糖蛋白串联重复区',
                mechanism: '识别 MUC1 异常糖基化外露表面并生成 Fab 候选。',
                evidence: 'MUC1 胰腺癌模型证据包',
                evidenceSources: ['模型返回证据摘要', '膜表面可及性评估', '胰腺癌表达背景'],
                referenceEntries: 'MUC1 / MSLN / CLDN18.2 模型候选靶点条目',
                structure: 'MUC1 胞外串联重复区与代表性 Fab 结合姿态约束集合',
                structureRef: 'MUC1 胞外可及表面模型',
                antibodies: ['anti-MUC1 discovery antibody', 'MUC1 glycopeptide binder'],
                interfaceFocus: 'MUC1 异常糖基化外露表面',
                selectedEpitope: 'MUC1 VNTR 糖肽邻近可及表面',
                epitopeRows: [
                  { site: 'Site A', region: 'VNTR 糖肽邻近表面', value: '贴近胰腺癌异常糖基化识别目标', decision: '优先' },
                  { site: 'Site B', region: '胞外稳定暴露面', value: '适合提高结合稳定性', decision: '备选' },
                  { site: 'Site C', region: '高度异质糖链区', value: '样本差异较大', decision: '谨慎' }
                ],
                riskSummary: '模型提示应优先覆盖 MUC1 VNTR 糖肽邻近可及表面，并避开高度异质糖链区。',
                structurePrep: '加载 MUC1 胞外可及表面模型，围绕 VNTR 糖肽邻近表面生成 Fab 设计约束。',
                scaffold: 'Fab 片段抗体骨架',
                designMode: '胰腺癌细胞表面识别设计',
                structuralBasis: '模型返回的 MUC1 胞外可及表面与代表性 Fab 姿态约束。'
              }
            })
          }
        }]
      }));
    });
  });

  const mockPort = await listenOnLocalhost(mockServer);
  try {
    const saved = await saveMockChatConfig(mockPort);
    const messages = await collectUserMessageStream('设计一个胰腺癌的抗体', {
      timeoutMs: 12000,
      voiceSessionId: saved.voiceSessionId,
      stopWhen: msg => msg.type === 'tool_call' && msg.tool === 'target_evidence_review'
    });
    const agentTexts = messages.filter(msg => msg.type === 'agent_msg').map(msg => msg.text || '');
    const evidenceCall = messages.find(msg => msg.type === 'tool_call' && msg.tool === 'target_evidence_review');
    const serialized = JSON.stringify(messages);

    assert.equal(captured.length, 1, 'one compact model call should provide routing, target and background');
    assert.match(captured[0].messages[0].content, /工作流展示|workflow|profile|tool_call|tool_result/);
    assert.ok(captured[0].max_tokens >= 1200);
    assert.deepEqual(captured[0].response_format, { type: 'json_object' });
    assert.ok(evidenceCall, 'design response should enter workflow');
    assert.equal(evidenceCall.params.target, 'MUC1');
    assert.equal(evidenceCall.params.route, 'MUC1 胰腺癌细胞表面识别路线');
    assert.equal(evidenceCall.params.evidence_package, 'MUC1 胰腺癌模型证据包');
    assert.match(evidenceCall.params.design_goal, /MUC1 异常糖基化外露表面/);
    assert.match(agentTexts[0], /胰腺癌|MUC1|MUC1|胰腺癌常见抗体设计入口/);
    assert.match(agentTexts[0], /Mesothelin|Claudin 18\.2/);
    assert.match(serialized, /MUC1 胰腺癌模型证据包|MUC1 VNTR 糖肽邻近可及表面|模型返回证据摘要/);
    assert.doesNotMatch(serialized, /IL-1β|INFLAMMATION-IL1B|当前疾病方向缺少明确靶点/);
  } finally {
    await new Promise(resolve => mockServer.close(resolve));
  }
});

test('model chat result is answered from the same compact parse instead of starting local routing', async () => {
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
        choices: [{
          message: {
            content: JSON.stringify({
              i: 'chat',
              start: false,
              answer: '我可以帮助你把疾病方向、靶点和抗体形式整理成可执行的分子设计任务。'
            })
          }
        }]
      }));
    });
  });

  const mockPort = await listenOnLocalhost(mockServer);
  try {
    const saved = await saveMockChatConfig(mockPort, 'mock-model-first-chat');
    const messages = await collectUserMessageStream('你能做什么', {
      timeoutMs: 8000,
      voiceSessionId: saved.voiceSessionId
    });
    const agentMessages = messages.filter(msg => msg.type === 'agent_msg').map(msg => msg.text || '');
    const serialized = JSON.stringify(messages);

    assert.equal(captured.length, 1);
    assert.deepEqual(agentMessages, ['我可以帮助你把疾病方向、靶点和抗体形式整理成可执行的分子设计任务。']);
    assert.equal(messages[messages.length - 1].type, 'done');
    assert.doesNotMatch(serialized, /target_evidence_review|正在启动抗体设计工作流/);
  } finally {
    await new Promise(resolve => mockServer.close(resolve));
  }
});

test('model workflow display fields start a workflow even when start is false', async () => {
  const mockServer = http.createServer((req, res) => {
    req.resume();
    req.on('end', () => {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        choices: [{
          message: {
            content: JSON.stringify({
              i: 'chat',
              start: false,
              answer: '已整理为过敏炎症方向的分子设计任务。',
              summary: '过敏性哮喘抗体设计',
              bg: '过敏性哮喘方向适合围绕上皮报警素通路组织抗体设计。',
              disease: '过敏性哮喘',
              target: 'IL-33',
              gene: 'IL33',
              cands: [
                { t: 'IL-33', g: 'IL33', r: 'IL-33/ST2 通路与过敏炎症放大相关。' },
                { t: 'TSLP', g: 'TSLP', r: '上皮炎症启动因子，可作备选。' }
              ],
              mech: '阻断 IL-33/ST2 通路并筛选 Fab 候选。',
              ab: 'Fab',
              n: 10,
              workflow: {
                routeLabel: 'IL-33 / ST2 模型展示路线',
                disease: '过敏性哮喘',
                targetDisplay: 'IL-33',
                partnerDisplay: 'ST2',
                domain: 'IL-1 家族细胞因子结构域',
                mechanism: '阻断 IL-33 与 ST2 受体形成炎症信号复合物',
                evidence: 'IL-33/ST2 模型返回证据包',
                evidenceSources: ['模型返回过敏炎症证据', 'IL-33 结构注释'],
                referenceEntries: 'IL33 / IL1RL1(ST2) 模型靶点条目',
                structure: 'IL-33 与 Fab 复合物结构约束集合',
                structureRef: 'IL-33/ST2 参考界面',
                antibodies: ['Tozorakimab'],
                interfaceFocus: 'ST2 受体结合表面',
                selectedEpitope: 'ST2 结合界面邻近的保守表面',
                epitopeRows: [
                  { site: 'Site A', region: 'ST2 结合界面', value: '直接服务于炎症信号阻断目标', decision: '优先' },
                  { site: 'Site B', region: 'β-trefoil 侧向暴露面', value: '适合结合检测', decision: '备选' }
                ],
                riskSummary: '优先覆盖 ST2 结合表面，同时避开柔性外周环区。',
                structurePrep: '加载 IL-33/ST2 参考界面并生成 Fab 设计约束。',
                scaffold: 'Fab 片段抗体骨架',
                designMode: '过敏炎症通路阻断设计',
                structuralBasis: 'IL-33 与代表性 Fab 复合物结构依据。'
              }
            })
          }
        }]
      }));
    });
  });

  const mockPort = await listenOnLocalhost(mockServer);
  try {
    const saved = await saveMockChatConfig(mockPort, 'mock-workflow-fields-start');
    const messages = await collectUserMessageStream('帮我为过敏性哮喘设计一个抗体', {
      timeoutMs: 12000,
      voiceSessionId: saved.voiceSessionId,
      stopWhen: msg => msg.type === 'tool_call' && msg.tool === 'target_evidence_review'
    });
    const evidenceCall = messages.find(msg => msg.type === 'tool_call' && msg.tool === 'target_evidence_review');
    const serialized = JSON.stringify(messages);

    assert.ok(evidenceCall, 'workflow fields should override start=false and launch the workflow');
    assert.equal(evidenceCall.params.target, 'IL-33');
    assert.equal(evidenceCall.params.evidence_package, 'IL-33/ST2 模型返回证据包');
    assert.match(serialized, /IL-33 \/ ST2 模型展示路线|ST2 结合界面邻近的保守表面/);
    assert.doesNotMatch(serialized, /已整理为过敏炎症方向的分子设计任务/);
  } finally {
    await new Promise(resolve => mockServer.close(resolve));
  }
});

test('compact prompt tells the model to infer distant or colloquial design wording before rejecting it', async () => {
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
        choices: [{
          message: {
            content: JSON.stringify({
              i: 'design',
              start: true,
              summary: '用户用口语表达，希望获得能识别胰腺癌细胞表面的候选分子。',
              bg: '胰腺癌细胞表面识别设计应优先考虑肿瘤相关膜抗原、表达背景和正常组织安全窗口。',
              disease: '胰腺癌',
              target: 'Mesothelin',
              gene: 'MSLN',
              label: 'PANCREATIC-MSLN-1',
              reason: '虽然用户没有使用标准“抗体设计”措辞，但“能抓住胰腺癌细胞表面的分子”语义上指向肿瘤细胞表面识别候选。Mesothelin 是胰腺癌相关细胞表面抗原，具备抗体识别背景、外露结构域和肿瘤相关表达依据，适合作为本轮分子设计入口。',
              cands: [
                { t: 'Mesothelin', g: 'MSLN', r: '胰腺癌相关细胞表面抗原，适合抗体识别。' },
                { t: 'MUC1', g: 'MUC1', r: '肿瘤相关糖蛋白，可作为备选表面入口。' }
              ],
              mech: '识别 Mesothelin 外露表位并生成 Fab 候选。',
              ab: 'Fab',
              n: 10,
              confidence: 0.78
            })
          }
        }]
      }));
    });
  });

  const mockPort = await listenOnLocalhost(mockServer);
  try {
    const saved = await saveMockChatConfig(mockPort, 'mock-colloquial-router');
    const messages = await collectUserMessageStream('想搞几个能抓住胰腺癌细胞表面的分子', {
      timeoutMs: 12000,
      voiceSessionId: saved.voiceSessionId,
      stopWhen: msg => msg.type === 'tool_call' && msg.tool === 'target_evidence_review'
    });
    const evidenceCall = messages.find(msg => msg.type === 'tool_call' && msg.tool === 'target_evidence_review');
    const agentTexts = messages.filter(msg => msg.type === 'agent_msg').map(msg => msg.text || '');

    assert.equal(captured.length, 1);
    assert.match(captured[0].messages[0].content, /口语|比喻|不完整|陌生|尽量理解/);
    assert.ok(evidenceCall, 'colloquial design wording should still enter workflow when the model resolves it');
    assert.equal(evidenceCall.params.target, 'Mesothelin');
    assert.match(agentTexts[0], /胰腺癌|Mesothelin|MSLN|细胞表面/);
  } finally {
    await new Promise(resolve => mockServer.close(resolve));
  }
});

test('drug-name requests are routed through the model so it can infer antibody drug targets', async () => {
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
        choices: [{
          message: {
            content: JSON.stringify({
              i: 'design',
              start: true,
              summary: '用户以奥希替尼药物方向表达，希望生成可进入抗体药物设计的分子候选。',
              bg: '奥希替尼是 EGFR 突变非小细胞肺癌方向的小分子靶向药；转化为抗体药物设计时，应围绕 EGFR 胞外结构域、表达背景和可及表位重新整理抗体靶点。',
              disease: '非小细胞肺癌',
              target: 'EGFR',
              gene: 'EGFR',
              label: 'NSCLC-EGFR-AB-1',
              reason: '用户给出的不是标准抗体靶点，而是已有药物奥希替尼。该药物的核心生物学线索指向 EGFR 驱动的肺癌治疗场景；抗体药物无法照搬小分子结合位点，应转化为面向 EGFR 胞外结构域的抗原识别设计，并结合肿瘤表达背景、膜表面可及性和可形成抗体表位的结构区域来生成候选。',
              cands: [
                { t: 'EGFR', g: 'EGFR', r: '奥希替尼相关治疗场景指向 EGFR 驱动肺癌，EGFR 胞外结构域可作为抗体药物入口。' },
                { t: 'HER3', g: 'ERBB3', r: 'EGFR 通路旁路激活相关受体，可作为组合或备选生物学方向。' }
              ],
              mech: '识别 EGFR 胞外可及表位，生成抗体药物候选。',
              ab: 'Fab',
              n: 10,
              confidence: 0.76
            })
          }
        }]
      }));
    });
  });

  const mockPort = await listenOnLocalhost(mockServer);
  try {
    const saved = await saveMockChatConfig(mockPort, 'mock-drug-name-router');
    const messages = await collectUserMessageStream('奥希替尼这种药能不能帮我生成几个抗体药物', {
      timeoutMs: 12000,
      voiceSessionId: saved.voiceSessionId,
      stopWhen: msg => msg.type === 'tool_call' && msg.tool === 'target_evidence_review'
    });
    const evidenceCall = messages.find(msg => msg.type === 'tool_call' && msg.tool === 'target_evidence_review');
    const agentTexts = messages.filter(msg => msg.type === 'agent_msg').map(msg => msg.text || '');

    assert.equal(captured.length, 1);
    assert.match(captured[0].messages[0].content, /药物名|药物类别|作用靶点|适应症|反推/);
    assert.ok(evidenceCall, 'drug-name wording should still enter workflow when the model resolves it');
    assert.equal(evidenceCall.params.target, 'EGFR');
    assert.match(agentTexts[0], /奥希替尼|非小细胞肺癌|EGFR|胞外结构域/);
  } finally {
    await new Promise(resolve => mockServer.close(resolve));
  }
});

test('model targets prefer prepared local 3D display targets when candidates include one', async () => {
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
        choices: [{
          message: {
            content: JSON.stringify({
              i: 'design',
              start: true,
              summary: '用户希望面向胃癌方向生成抗体药物候选。',
              bg: '胃癌抗体药物设计需要兼顾肿瘤相关表面抗原、可及性和可进入三维结构展示的靶点证据。',
              disease: '胃癌',
              target: 'Claudin 18.2',
              gene: 'CLDN18',
              label: 'GASTRIC-CLDN18-AB-1',
              reason: 'Claudin 18.2 是胃癌方向常见的肿瘤相关膜蛋白入口，具备抗体药物开发背景；同时需要比较胃癌中有明确疾病关联、胞外结构域可及性和抗体开发依据的候选靶点，避免把疾病名或治疗方向本身当作抗原。',
              cands: [
                { t: 'Claudin 18.2', g: 'CLDN18', r: '胃癌方向肿瘤相关膜蛋白，适合作为抗体药物候选入口。' },
                { t: 'HER2', g: 'ERBB2', r: '胃癌和乳腺癌相关受体靶点，已有清晰胞外结构域和抗体复合物展示基础。' },
                { t: 'EGFR', g: 'EGFR', r: '实体瘤生长信号相关受体，可作为备选抗体药物入口。' }
              ],
              mech: '识别肿瘤相关膜蛋白外露表位并生成 Fab 候选。',
              ab: 'Fab',
              n: 10,
              confidence: 0.74
            })
          }
        }]
      }));
    });
  });

  const mockPort = await listenOnLocalhost(mockServer);
  try {
    const saved = await saveMockChatConfig(mockPort, 'mock-prepared-target-router');
    const messages = await collectUserMessageStream('胃癌方向做几个抗体药物候选', {
      timeoutMs: 12000,
      voiceSessionId: saved.voiceSessionId,
      stopWhen: msg => msg.type === 'tool_call' && msg.tool === 'target_evidence_review'
    });
    const evidenceCall = messages.find(msg => msg.type === 'tool_call' && msg.tool === 'target_evidence_review');
    const agentTexts = messages.filter(msg => msg.type === 'agent_msg').map(msg => msg.text || '');

    assert.equal(captured.length, 1);
    assert.match(captured[0].messages[0].content, /可展示靶点|HER2|EGFR|PD-L1|3D/);
    assert.ok(evidenceCall, 'supported candidate should enter the structure-backed workflow');
    assert.equal(evidenceCall.params.target, 'HER2');
    assert.match(agentTexts[0], /胃癌|HER2|ERBB2|Claudin 18\.2/);
    assert.doesNotMatch(agentTexts[0], /本地|预设|可展示靶点|为了展示|3D 预设|已有分子模型/);
  } finally {
    await new Promise(resolve => mockServer.close(resolve));
  }
});
