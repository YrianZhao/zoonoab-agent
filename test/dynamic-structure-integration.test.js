const assert = require('assert/strict');
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const test = require('node:test');

const ROOT = path.join(__dirname, '..');
const PORT = 19174;
const BASE_URL = 'http://127.0.0.1:' + PORT;
const serverSource = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
const runtimePrefix = path.join(os.tmpdir(), 'zoonoab-dynamic-structure-' + process.pid);
let serverProcess = null;
let serverOutput = '';

function sliceBetween(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  assert.notEqual(start, -1, startMarker + ' should exist');
  const end = source.indexOf(endMarker, start + startMarker.length);
  assert.notEqual(end, -1, endMarker + ' should follow ' + startMarker);
  return source.slice(start, end);
}

function assertOwnProperties(value, properties, label) {
  assert.ok(value && typeof value === 'object' && !Array.isArray(value), label + ' should be an object');
  for (const property of properties) {
    assert.ok(Object.prototype.hasOwnProperty.call(value, property), label + '.' + property + ' should exist');
  }
}

async function waitForHealth() {
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    if (serverProcess && serverProcess.exitCode !== null) {
      throw new Error('server exited before health check\n' + serverOutput);
    }
    try {
      const response = await fetch(BASE_URL + '/api/health');
      if (response.ok) return;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error('server did not become healthy\n' + serverOutput);
}

async function stopServer() {
  if (!serverProcess) return;
  const processToStop = serverProcess;
  serverProcess = null;
  if (processToStop.exitCode !== null) return;
  await new Promise(resolve => {
    const timer = setTimeout(() => {
      try { processToStop.kill('SIGKILL'); } catch {}
      resolve();
    }, 3000);
    processToStop.once('exit', () => {
      clearTimeout(timer);
      resolve();
    });
    try { processToStop.kill('SIGTERM'); } catch {
      clearTimeout(timer);
      resolve();
    }
  });
}

test.before(async () => {
  serverProcess = spawn(process.execPath, ['server.js'], {
    cwd: ROOT,
    env: {
      ...process.env,
      NODE_ENV: 'test',
      PORT: String(PORT),
      LOCAL_ASR_AUTO_START: '0',
      STRUCTURE_RESOLVER_TEST_NETWORK: '0',
      VOICE_API_CONFIG_FILE: runtimePrefix + '-voice.json',
      HISTORY_STORE_FILE: runtimePrefix + '-history.json',
      QUESTION_TEST_SET_FILE: runtimePrefix + '-questions.json',
      DIAGNOSTIC_LOG_FILE: runtimePrefix + '-diagnostics.jsonl',
      WORKFLOW_REJECTION_LOG_FILE: runtimePrefix + '-rejections.jsonl'
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  const capture = chunk => { serverOutput += String(chunk).slice(-8000); };
  serverProcess.stdout.on('data', capture);
  serverProcess.stderr.on('data', capture);
  await waitForHealth();
});

test.after(async () => {
  await stopServer();
  for (const suffix of ['-voice.json', '-history.json', '-questions.json', '-diagnostics.jsonl', '-rejections.jsonl']) {
    await fs.promises.unlink(runtimePrefix + suffix).catch(() => {});
  }
});

test('unknown targets do not borrow coordinates from the local prepared-route library', async () => {
  const response = await fetch(BASE_URL + '/api/debug/design-route?text=' + encodeURIComponent(
    '设计一个针对 CLDN18.2 的 Fab 抗体'
  ));
  assert.equal(response.status, 200);
  const data = await response.json();

  assert.equal(data.profile.targetDisplay, 'CLDN18.2');
  assert.equal(data.profile.genericProfile, true);
  assert.deepEqual(data.threeDPreview.files, []);
  assert.deepEqual(data.threeDPreview.displayFiles, []);
  assert.deepEqual(data.threeDPreview.binders, []);
  assert.doesNotMatch(JSON.stringify(data.threeDPreview), /PDL1|IL33|HER2|EGFR|4KC3|FluHA|RSVF/);

  const routeLocalPDBs = sliceBetween(serverSource, 'function routeLocalPDBs(', 'function hasPreparedRouteStructure(');
  assert.match(routeLocalPDBs, /const preset = getRoute3DPreset\(profile\)/);
  assert.match(routeLocalPDBs, /if \(!preset\) return \[\]/);
  assert.match(routeLocalPDBs, /filesForRoute3DPreset\(profile, preset\)/);
  assert.match(routeLocalPDBs, /preparedStructureTargetMatches\(profile, file\)/);
  assert.match(routeLocalPDBs, /if \(!exactPresetFiles\.length\) return \[\]/);
  assert.doesNotMatch(routeLocalPDBs, /genericDisplayModelFiles|LOCAL_3D_PDB_FILES|orderPDBFilesForPreset/);
});

test('prepared local structures require an exact requested-target to PDB REMARK identity match', () => {
  const matcher = sliceBetween(serverSource, 'function normalizePreparedStructureTarget(', 'function localPDBSha256(');
  const contract = sliceBetween(serverSource, 'function preparedStructureContract(', 'function buildRoute3DMeta(');
  const preparedCheck = sliceBetween(serverSource, 'function hasPreparedRouteStructure(', 'function structureResolutionInput(');

  assert.match(matcher, /buildLocalPDBTargetTag\(filename, remarks\)/);
  assert.match(matcher, /targetTag\.verifiedTag/);
  assert.match(matcher, /targetTag\.antibodyFormat/);
  assert.match(matcher, /requestedFormat === coordinateFormat/);
  assert.match(matcher, /!strain && !isoform && organismMatches/);
  assert.match(matcher, /requestedTargetAlias === coordinateTargetAlias/);
  assert.match(matcher, /coordinateOrganismTaxId/);
  assert.match(contract, /preparedStructureTargetMatches\(profile, file\)/);
  assert.match(contract, /grade: !targetVerified \? 'D'/);
  assert.match(preparedCheck, /preparedStructureTargetMatches\(profile, file\)/);
});

test('target-exact scaffold structures are classified as display poses rather than experimental complexes', () => {
  const contract = sliceBetween(serverSource, 'function preparedStructureContract(', 'function buildRoute3DMeta(');

  assert.match(contract, /const displayPose = targetVerified && Boolean\(preset && preset\.interfaceDetail === false\)/);
  assert.match(contract, /kind: displayPose \? 'display_pose'/);
  assert.match(contract, /representativeInterface \? 'representative_interface' : 'experimental_complex'/);
  assert.match(contract, /不代表实验复合物或经验证结合界面/);
});

test('the academic target rationale remains the binder reason used throughout the workflow', () => {
  const intro = sliceBetween(serverSource, 'function targetResolutionIntro(', 'function buildAssistantThinkingTopic(');
  const workflow = sliceBetween(serverSource, 'async function runWorkflow(', 'async function runRiskSiteScan(');
  const binderMeta = sliceBetween(serverSource, 'function buildRoute3DMeta(', 'function routeLocalPDBs(');

  assert.match(intro, /\(route && route\.selectionReason\) \|\| sanitizedTargetSelectionReason/);
  assert.match(intro, /'\u5b66\u672f\u4f9d\u636e\uff1a' \+ selectionReason/);
  assert.match(workflow, /if \(forcedRoute && forcedRoute\.selectionReason\)/);
  assert.match(workflow, /profile\.selectionReason = forcedRoute\.selectionReason/);
  assert.match(binderMeta, /profile && \(profile\.selectionReason \|\| profile\.targetSelectionReason \|\| profile\.reason\)/);
});

test('generic candidate aliases cannot select an arbitrary local PDB', async () => {
  const response = await fetch(BASE_URL + '/api/pdb/local/UnknownTarget-candidate-01.pdb');
  assert.equal(response.status, 404);

  const aliasResolver = sliceBetween(serverSource, 'function resolveLocalPDBAlias(', 'function localPDBPath(');
  assert.doesNotMatch(aliasResolver, /candidateMatch|candidate-\(\\d\+\)|files\[idx % files\.length\]/);
  assert.match(aliasResolver, /return requested;\s*\n}/);
});

test('prepared route binders expose the complete structure contract and a controlled coordinate URL', async () => {
  const response = await fetch(BASE_URL + '/api/debug/design-route?text=' + encodeURIComponent(
    '阻断 PD-1/PD-L1 通路，设计 2 个高亲和力 Fab'
  ));
  assert.equal(response.status, 200);
  const data = await response.json();
  const binder = data.threeDPreview && data.threeDPreview.binders && data.threeDPreview.binders[0];

  assert.ok(binder, 'PD-L1 prepared route should expose a structure binder');
  assert.equal(binder.targetDisplay, 'PD-L1');
  assertOwnProperties(binder.structure, ['schemaVersion', 'status', 'targetIdentity', 'source', 'coordinates', 'pose', 'display'], 'structure');
  assertOwnProperties(binder.structure.targetIdentity, [
    'requestedLabel', 'canonicalName', 'geneSymbol', 'uniprotAccession', 'organismName',
    'organismTaxId', 'strain', 'isoform', 'exactMatch', 'confidence'
  ], 'structure.targetIdentity');
  assertOwnProperties(binder.structure.source, [
    'kind', 'database', 'accession', 'assemblyId', 'biologicalAssembly', 'sourceUrl',
    'downloadUrl', 'retrievedAt', 'sha256', 'experimentalMethod', 'resolutionAngstrom', 'sequenceCoverage'
  ], 'structure.source');
  assertOwnProperties(binder.structure.coordinates, [
    'structureUrl', 'cacheKey', 'format', 'coordinateAntigenLabel', 'targetVerified',
    'antigenChains', 'antibodyChains', 'sourceAntigenChains', 'sourceAntibodyChains'
  ], 'structure.coordinates');
  assertOwnProperties(binder.structure.pose, [
    'kind', 'scaffoldId', 'generatorVersion', 'anchorStrategy', 'minDistanceA',
    'contactPairs45A', 'nearPairs60A', 'clashesBelow20A', 'geometryValidated'
  ], 'structure.pose');
  assertOwnProperties(binder.structure.display, [
    'grade', 'interfaceDetail', 'structureTitle', 'structuralBasis', 'visualSummary', 'disclosure'
  ], 'structure.display');

  assert.equal(binder.structure.schemaVersion, 1);
  assert.equal(binder.structure.status, 'ready');
  assert.equal(binder.structure.targetIdentity.exactMatch, true);
  assert.equal(binder.structure.source.kind, 'prepared_exact_complex');
  assert.equal(binder.structure.source.database, 'local');
  assert.equal(binder.modelOrigin, 'local');
  assert.equal(binder.structure.coordinates.targetVerified, true);
  assert.equal(binder.structure.coordinates.coordinateAntigenLabel, 'PD-L1');
  assert.equal(binder.structure.coordinates.format, 'pdb');
  assert.equal(binder.structure.pose.kind, 'experimental_complex');
  assert.equal(binder.structure.pose.geometryValidated, true);
  assert.equal(binder.structure.display.grade, 'A');
  assert.match(binder.structure.source.sha256, /^[a-f0-9]{64}$/);
  assert.ok(binder.structure.coordinates.antigenChains.length > 0);
  assert.ok(binder.structure.coordinates.antibodyChains.length > 0);

  const structureUrl = binder.structure.coordinates.structureUrl;
  assert.equal(binder.structureUrl, structureUrl);
  assert.match(structureUrl, /^\/api\/pdb\/local\/[A-Za-z0-9_.%\-]+\.pdb$/);
  const absoluteStructureUrl = new URL(structureUrl, BASE_URL);
  assert.equal(absoluteStructureUrl.origin, BASE_URL);
  assert.equal(absoluteStructureUrl.search, '');

  const originResolver = sliceBetween(serverSource, 'function structureModelOrigin(', 'function buildRoute3DMeta(');
  assert.match(originResolver, /source\.database/);
  assert.match(originResolver, /coordinates\.targetVerified\s*===\s*true/);
  assert.match(originResolver, /\?\s*'local'\s*:\s*'auto'/);

  const aliasResponse = await fetch(BASE_URL + '/api/debug/design-route?text=' + encodeURIComponent(
    '设计 2 个 Fab，靶点是 PD-L1 / CD274'
  ));
  assert.equal(aliasResponse.status, 200);
  const aliasData = await aliasResponse.json();
  const aliasBinder = aliasData.threeDPreview && aliasData.threeDPreview.binders && aliasData.threeDPreview.binders[0];
  assert.ok(aliasBinder, 'target/gene combined labels should still use the exact prepared structure');
  assert.match(aliasBinder.file, /^PDL1-Fab-/);
  assert.equal(aliasBinder.structure.coordinates.coordinateAntigenLabel, 'PD-L1');
});

test('runtime structure endpoint accepts only a 64-character hexadecimal cache key', async () => {
  const invalidKeys = [
    'f'.repeat(63),
    'f'.repeat(65),
    'g'.repeat(64),
    '0'.repeat(32) + '.pdb'
  ];
  for (const cacheKey of invalidKeys) {
    const response = await fetch(BASE_URL + '/api/structures/' + cacheKey);
    assert.equal(response.status, 400, cacheKey + ' should be rejected before cache access');
    assert.deepEqual(await response.json(), { error: 'Invalid structure cache key' });
  }

  const wellFormedMissingKey = '0'.repeat(64);
  const missingResponse = await fetch(BASE_URL + '/api/structures/' + wellFormedMissingKey);
  assert.equal(missingResponse.status, 404, 'a valid-shaped cache key should pass validation and miss cleanly');

  assert.match(serverSource, /const STRUCTURE_CACHE_KEY_RE = \/\^\[a-f0-9\]\{64\}\$\//);
  const endpoint = sliceBetween(serverSource, "app.get('/api/structures/:cacheKey'", '// ─── PDB Proxy');
  assert.match(endpoint, /STRUCTURE_CACHE_KEY_RE\.test\(cacheKey\)/);
  assert.match(endpoint, /status\(400\)\.json\(\{ error: 'Invalid structure cache key' \}\)/);
});

test('local PDB responses are compressed, cacheable, and conditionally reusable', async () => {
  const response = await fetch(BASE_URL + '/api/pdb/local/PDL1-Fab-01.pdb', {
    headers: { 'Accept-Encoding': 'gzip' }
  });

  assert.equal(response.status, 200);
  assert.equal(response.headers.get('content-encoding'), 'gzip');
  assert.match(response.headers.get('cache-control') || '', /max-age=86400/);
  assert.match(response.headers.get('cache-control') || '', /stale-while-revalidate=604800/);
  assert.match(response.headers.get('content-type') || '', /chemical\/x-pdb/);
  assert.match(response.headers.get('content-disposition') || '', /^inline;/);
  const etag = response.headers.get('etag');
  assert.ok(etag, 'local PDB responses should expose an ETag');
  assert.match(await response.text(), /(?:^|\n)ATOM  /m);

  const conditional = await fetch(BASE_URL + '/api/pdb/local/PDL1-Fab-01.pdb', {
    headers: { 'If-None-Match': etag }
  });
  assert.equal(conditional.status, 304);
});

test('generated display-pose coordinates enforce the configured cache limits after every write', () => {
  const storeGenerated = sliceBetween(serverSource, 'async function storeGeneratedStructure(', 'async function readGeneratedStructure(');
  const writeIndex = storeGenerated.indexOf('await atomicWriteRuntimeFile(filePath, buffer)');
  const cleanupIndex = storeGenerated.indexOf('await cleanupGeneratedStructureCache().catch(() => {})');
  const returnIndex = storeGenerated.indexOf('return { cacheKey, structureUrl:');

  assert.ok(writeIndex >= 0, 'generated coordinates should be written atomically');
  assert.ok(cleanupIndex > writeIndex, 'cache cleanup should run after a new coordinate file is available');
  assert.ok(returnIndex > cleanupIndex, 'the controlled URL should only be returned after cache limits are enforced');
});

test('workflow starts target resolution in the background and uses an explicit representative fallback', () => {
  const workflow = sliceBetween(serverSource, 'async function runWorkflow(', '// ─── Risk Site Scan');
  const startJob = workflow.indexOf('const structureJob = startWorkflowStructureResolution(');
  const firstWorkflowWait = workflow.indexOf('await delay(900)');
  const awaitResolution = workflow.indexOf('resolvedStructure = await waitForWorkflowStructure(');

  assert.ok(startJob >= 0, 'workflow should create a structure-resolution job');
  assert.ok(startJob < firstWorkflowWait, 'resolution should start before the visible workflow delays');
  assert.ok(awaitResolution > firstWorkflowWait, 'resolution should be awaited only near final 3D preparation');
  assert.match(workflow, /type: 'structure_status',\s*\n\s*status: 'resolving'/);

  const gallery = sliceBetween(workflow, '// 3D Gallery', "markWorkflowStage(sess, '');");
  const fallbackBuild = gallery.indexOf('allLocalPDBs = buildRepresentativeFallbackBinders(profile)');
  const readyGuard = gallery.indexOf('if (allLocalPDBs.length)');
  const show3D = gallery.indexOf("type: 'show_3d'");
  assert.ok(fallbackBuild >= 0 && fallbackBuild < readyGuard, 'unresolved targets should receive a representative binder before the gallery guard');
  assert.ok(readyGuard >= 0 && show3D > readyGuard, 'show_3d should be inside the non-empty binder guard');
  assert.equal((gallery.match(/type: 'show_3d'/g) || []).length, 1);
  assert.match(gallery, /status: 'representative'/);
  assert.match(gallery, /已准备抗原与抗体空间构象展示/);
  assert.doesNotMatch(gallery, /页面题头|题头保留/);

  const fallback = sliceBetween(serverSource, 'function representativeFallbackStructure(', 'function buildRepresentativeFallbackBinders(');
  assert.match(fallback, /kind: 'representative'/);
  assert.match(fallback, /targetVerified: false/);
  assert.match(fallback, /requestedLabel: target/);
  assert.match(fallback, /structureTitle: target \+ ' ' \+ antibodyFormat \+ ' 候选结构'/);
  assert.match(fallback, /coordinateAntigenLabel: actualAntigen/);
  assert.match(fallback, /当前展示用于呈现本轮设计目标/);

  const startResolution = sliceBetween(serverSource, 'function startWorkflowStructureResolution(', 'async function waitForWorkflowStructure(');
  const finalWait = sliceBetween(serverSource, 'async function waitForWorkflowStructure(', 'function displayPoseScaffold(');
  assert.match(startResolution, /const controller = new AbortController\(\)/);
  assert.match(startResolution, /resolveStructure\(input, \{ signal: controller\.signal \}\)/);
  assert.match(startResolution, /STRUCTURE_RESOLVER_JOB_TIMEOUT_MS/);
  assert.match(finalWait, /job\.abort\(\)/, 'the final display deadline should terminate the underlying resolver job');

  const dynamicBuild = gallery.indexOf('try {\n        allLocalPDBs = await buildResolvedStructureBinders(');
  const dynamicCatch = gallery.indexOf("recordDiagnosticEvent('dynamic_structure_build_failed'", dynamicBuild);
  assert.ok(dynamicBuild >= 0 && dynamicCatch > dynamicBuild && dynamicCatch < fallbackBuild,
    'dynamic pose/cache failures should be contained before the representative fallback branch');
  assert.match(
    gallery,
    /}, structureJob && structureJob\.controller\.signal\);/,
    'workflow should pass the active resolver signal into pose generation'
  );
  assert.match(
    gallery,
    /catch \(err\) \{\s*if \(err && err\.isCancelled\) throw err;/,
    'builder cancellation must escape instead of being presented as a representative fallback'
  );
});

test('workflow cancellation and socket close abort the active structure resolver job', () => {
  const socketRunner = sliceBetween(serverSource, 'function runSocketTask(', '// ─── Capability Overview');
  const websocket = sliceBetween(serverSource, "wss.on('connection'", '// ─── Export API');
  const cancelHandler = sliceBetween(websocket, "if (msg.type === 'cancel')", "if (msg.type === 'skip_thinking')");
  const closeHandler = sliceBetween(websocket, "ws.on('close'", "});\n});");

  assert.match(socketRunner, /runState\.cancelled \|\| !sess \|\| sess\.currentRun !== runState/);
  assert.match(socketRunner, /runState\.structureAbortController\.abort\(\)/);
  assert.match(cancelHandler, /sess\.currentRun\.structureAbortController\.abort\(\)/);
  assert.match(closeHandler, /sess\.currentRun\.cancelled = true/);
  assert.match(closeHandler, /sess\.currentRun\.structureAbortController\.abort\(\)/);
});

test('resolved antigens are identity-gated before deterministic Fab or VHH display-pose generation', () => {
  const builder = sliceBetween(serverSource, 'async function buildResolvedStructureBinders(', 'function msgs(lang)');

  assert.match(
    builder,
    /async function buildResolvedStructureBinders\(profile, count, resolvedStructure, onProgress, signal = null\)/
  );
  assert.match(builder, /structure\.status !== 'ready'/);
  assert.match(builder, /structure\.coordinates\.targetVerified !== true/);
  assert.match(builder, /structureResolver\.readStructureText\(resolvedStructure\)/);
  assert.match(builder, /validateResolvedExperimentalComplexGeometry\(antigenPdbText, structure, antibodyFormat\)/);
  assert.match(builder, /if \(validation\.accepted\)/);
  assert.match(builder, /geometry\.minDistance/);
  assert.match(builder, /geometry\.contactPairs/);
  assert.match(builder, /geometry\.hardClashes/);
  assert.match(builder, /const scaffold = displayPoseScaffold\(antibodyFormat\)/);
  assert.match(builder, /generateDisplayPose\(\{/);
  assert.match(builder, /antigenPdbText,/);
  assert.match(builder, /scaffoldPdbText,/);
  assert.match(builder, /candidateIndex: idx \+ 1/);
  assert.match(builder, /const stored = await storeGeneratedStructure\(generated\.pdbText\)/);
  assert.match(builder, /candidateStructure\.source\.kind = 'display_pose'/);
  assert.match(builder, /kind: 'display_pose'/);
  assert.match(builder, /geometryValidated: geometry\.hardClashesBelow2A === 0/);
  assert.match(builder, /不是实验复合物、分子对接预测或已验证结合界面/);
  assert.match(builder, /if \(binders\.length\) return binders;\s*return \[\];/,
    'when every pose is rejected, the workflow should use the default antigen-antibody fallback');

  const validationIndex = builder.indexOf('validateResolvedExperimentalComplexGeometry(');
  const poseGenerationIndex = builder.indexOf('generateDisplayPose({');
  assert.ok(validationIndex >= 0 && poseGenerationIndex > validationIndex,
    'a public experimental complex must be checked before a replacement display pose is generated');

  const candidateLoop = sliceBetween(
    builder,
    'for (let idx = 0; idx < targetCount; idx++) {',
    'await cleanupGeneratedStructureCache()'
  );
  const generateIndex = candidateLoop.indexOf('const generated = generateDisplayPose({');
  const storeIndex = candidateLoop.indexOf('const stored = await storeGeneratedStructure(generated.pdbText)');
  const abortIndexes = [...candidateLoop.matchAll(/throwIfStructureBuildAborted\(signal\)/g)].map(match => match.index);
  assert.ok(abortIndexes.some(index => index < generateIndex), 'each candidate should check cancellation before pose generation');
  assert.ok(abortIndexes.some(index => index > generateIndex && index < storeIndex),
    'cancellation should be checked after pose generation and before storage');
  assert.ok(abortIndexes.some(index => index > storeIndex),
    'cancellation should be checked after storage before continuing');
});

test('target resolver reserves enough output tokens for identity fields and candidate evidence', () => {
  const resolver = sliceBetween(
    serverSource,
    'async function resolveDiseaseTargetWithModel(',
    'function buildResolvedTargetRoute('
  );
  const budgetMatch = resolver.match(/maxTokens:\s*(\d+)/);

  assert.ok(budgetMatch, 'target resolver should declare an explicit output budget');
  assert.ok(Number(budgetMatch[1]) >= 400,
    'target resolver JSON includes target, species, strain, isoform, reason, and candidates');
});
