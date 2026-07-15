const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const test = require('node:test');

const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'public', 'index.html'), 'utf8');
const galleryHtml = fs.readFileSync(path.join(ROOT, 'public', 'gallery-mol.html'), 'utf8');

function sliceBetween(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  assert.notEqual(start, -1, startMarker + ' should exist');
  const end = source.indexOf(endMarker, start + startMarker.length);
  assert.notEqual(end, -1, endMarker + ' should follow ' + startMarker);
  return source.slice(start, end);
}

test('history and live binder normalization retain the nested structure contract and URL', () => {
  const compact = sliceBetween(html, 'function compactHistoryBinder', 'function makeHistoryTitle');
  const normalize = sliceBetween(html, 'function normalizeBinderPayload', 'function renderViewerSection');

  assert.match(compact, /cloneBinderStructure\(meta\.structure\)/);
  assert.match(compact, /displayPose\s*\?\s*sanitizeDisplayPoseLabel\(meta\.name\)/);
  assert.match(compact, /nonScoringStructure\s*=\s*displayPose\s*\|\|\s*structureKind\s*===\s*'representative'/);
  assert.match(compact, /ipTm:\s*!nonScoringStructure/);
  assert.match(compact, /structureUrl:\s*coordinates\.structureUrl\s*\|\|\s*meta\.structureUrl\s*\|\|\s*''/);
  assert.match(compact, /structure,\s*\n/);
  assert.match(normalize, /cloneBinderStructure\(meta\.structure\)/);
  assert.match(normalize, /structureUrl:\s*coordinates\.structureUrl\s*\|\|\s*meta\.structureUrl\s*\|\|\s*''/);
  assert.match(normalize, /display\.disclosure\s*\|\|\s*meta\.structureDisclosure/);
  assert.match(normalize, /coordinates\.antigenChains/);
  assert.match(normalize, /coordinates\.antibodyChains/);
  assert.match(normalize, /displayPose\s*\?\s*\(sanitizeDisplayPoseLabel\(meta\.name\)/);
  assert.match(normalize, /nonScoringStructure\s*=\s*displayPose\s*\|\|\s*structureKind\s*===\s*'representative'/);
  assert.match(normalize, /ipTm:\s*!nonScoringStructure/);
});

test('history and live viewers prefer controlled structure URLs over local aliases', () => {
  const historyUrl = sliceBetween(html, 'function getHistoryPDBUrl', 'function buildHistoryMoleculeFrameUrl');
  const liveUrl = sliceBetween(html, 'function getPDBUrl', '// ═══ Surface rendering state');

  assert.match(historyUrl, /meta\.structure\?\.coordinates\?\.structureUrl\s*\|\|\s*meta\.structureUrl/);
  assert.match(historyUrl, /if\s*\(structureUrl\)\s*return addViewerChainProjection\(structureUrl, meta\)/);
  assert.match(liveUrl, /meta\.structure\?\.coordinates\?\.structureUrl\s*\|\|\s*meta\.structureUrl/);
  assert.match(liveUrl, /if\s*\(structureUrl\)\s*return addViewerChainProjection\(structureUrl, meta\)/);
});

test('structure contracts retain provenance while public views hide internal validation copy', () => {
  const presentation = sliceBetween(html, 'function getStructurePresentation', 'function getStructureSummaryItems');
  const summary = sliceBetween(html, 'function getStructureSummaryItems', 'function buildStructureDisclosureHtml');
  const routeSummary = sliceBetween(html, 'function renderViewerSection', '// ─── Chain Sequence Strip');
  const historySummary = sliceBetween(html, 'function renderHistoryModelRouteSummary', 'function getHistoryPDBUrl');
  const historyModal = sliceBetween(html, 'function openHistory3D', '// ═══════════════ WebSocket');
  const fullModal = sliceBetween(html, 'function openMolModal', 'let molCloseTimer');

  assert.match(presentation, /kindLabel\s*=\s*'展示姿态'/);
  assert.match(presentation, /badgeText\s*=\s*'DISPLAY'/);
  assert.match(presentation, /kindLabel\s*=\s*'实验复合物'/);
  assert.match(presentation, /kindLabel\s*=\s*'预测抗原结构'/);
  assert.match(presentation, /不代表实验复合物、对接预测或经验证结合界面/);
  assert.match(presentation, /coordinates\.targetVerified\s*===\s*true/);
  assert.match(presentation, /抗原坐标身份尚未核验/);
  assert.match(summary, /rawSequenceCoverage === null \|\| rawSequenceCoverage === undefined \|\| rawSequenceCoverage === ''/);
  assert.match(summary, /publicKind/);
  assert.doesNotMatch(summary, /'结构来源'|'展示等级'|'抗原身份'|'结构说明'/);
  assert.match(routeSummary, /getStructureSummaryItems\(routeMeta\)/);
  assert.match(historySummary, /getStructureSummaryItems\(first\)/);
  assert.doesNotMatch(historyModal, /buildStructureDisclosureHtml|buildSelectionReasonHtml|结构来源|展示等级|抗原身份/);
  assert.doesNotMatch(fullModal, /buildStructureDisclosureHtml|buildSelectionReasonHtml|结构来源|展示等级|抗原身份/);
});

test('display poses and representative fallbacks never receive PASS or synthetic structural quality metrics', () => {
  const historyModels = sliceBetween(html, 'function renderHistoryModels', 'function renderHistoryModelRouteSummary');
  const gallery = sliceBetween(html, 'function renderGalleryCards', 'function lazyInitGalleryViewers');
  const binders = sliceBetween(html, 'function renderBindersRow', 'function selectBinder');
  const sequence = sliceBetween(html, 'function renderSequenceDetail', 'function generateMockVHH');
  const displayBranchStart = sequence.indexOf('if (structureMeta.isDisplayPose || structureMeta.isRepresentative)');
  const displayBranchEnd = sequence.indexOf('} else {', displayBranchStart);

  assert.notEqual(displayBranchStart, -1, 'display pose sequence branch should exist');
  assert.notEqual(displayBranchEnd, -1, 'display pose sequence branch should end before legacy metrics');
  const displayBranch = sequence.slice(displayBranchStart, displayBranchEnd);
  assert.doesNotMatch(displayBranch, /DockQ|RMSD|pLDDT|pTM|iPAE|IPTM/);
  assert.match(displayBranch, /const nonScoringLabel = '抗原与抗体空间构象'/);
  assert.doesNotMatch(displayBranch, /已核验|未核验|说明/);
  assert.match(gallery, /else if \(structureMeta\.isRepresentative\)\s*{\s*badgeClass = 'badge-reference'/);
  assert.doesNotMatch(gallery, /gallery-disclosure|structureMeta\.sourceLabel|structureMeta\.grade|UNVERIFIED|VERIFIED/);
  assert.match(binders, /\? 'STRUCTURE'/);
  assert.match(html, /\.binder-chip\.display\s*{/);
  assert.match(html, /\.binder-chip\.reference\s*{/);
  assert.match(html, /\.badge-display\s*{/);
  assert.match(html, /\.badge-reference\s*{/);
  assert.match(historyModels, /!structureMeta\.isDisplayPose\s*&&\s*!structureMeta\.isRepresentative/);
});

test('disconnected and empty-payload fallbacks preserve the requested target with explicit representative provenance', () => {
  const profileFallback = sliceBetween(html, 'function extractFallbackRequestedTarget', 'function fallbackAgents');
  const binderFallback = sliceBetween(html, 'function makeFallbackBinders', 'const STRUCTURE_SOURCE_LABELS');
  const normalize = sliceBetween(html, 'function normalizeBinderPayload', 'function renderViewerSection');

  assert.match(profileFallback, /return buildGenericFallbackRouteProfile\(userText\)/);
  assert.doesNotMatch(profileFallback, /return profiles\.tumor_immunotherapy;\s*\n\s*}/);
  assert.match(profileFallback, /extractFallbackRequestedTarget\(userText, true\)/);
  const explicitTargetGuard = profileFallback.indexOf('if (extractFallbackRequestedTarget(userText, true))');
  const diseaseFallback = profileFallback.indexOf("if (/her\\s*-?\\s*2|erbb\\s*-?\\s*2|乳腺癌|胃癌/.test(text))");
  assert.ok(explicitTargetGuard >= 0 && diseaseFallback > explicitTargetGuard,
    'an explicit requested target must win before disease-keyword fallback routing');
  assert.match(profileFallback, /namedTarget = raw\.match/);
  assert.match(profileFallback, /function inferFallbackDiseaseContext\(userText\)/);
  assert.match(profileFallback, /\[\/\u80c3\u764c\/, '\u80c3\u764c'\]/);
  assert.match(profileFallback, /function inferFallbackMechanismContext\(userText, target\)/);
  assert.match(profileFallback, /function inferFallbackEpitopeContext\(userText, target\)/);
  assert.match(profileFallback, /disease,\s*\n\s*target,/);
  assert.match(profileFallback, /\n\s*mechanism,/);
  assert.match(profileFallback, /\n\s*selectedEpitope,/);
  assert.match(binderFallback, /requestedLabel: target/);
  assert.match(binderFallback, /coordinateAntigenLabel: coordinateTarget/);
  assert.match(binderFallback, /targetVerified,/);
  assert.match(binderFallback, /kind: representative \? 'representative' : 'experimental_complex'/);
  assert.match(binderFallback, /grade: !targetVerified \? 'D'/);
  assert.match(binderFallback, /题头保留用户需求靶点/);
  assert.match(binderFallback, /if \(representative\) meta\.ipTm = null/);
  assert.match(normalize, /currentStats && currentStats\.target/);
  assert.match(normalize, /const missingStructureMetadata = ids\.length > 0 && ids\.some/);
  assert.match(normalize, /!meta\.structure\.coordinates \|\| !meta\.structure\.display/);
  assert.match(normalize, /makeFallbackBinders\(Math\.max\(1, ids\.length \|\| 12\), fallbackProfile\)/);
});

test('structure summaries expose sequence coverage when the resolver provides it', () => {
  const summary = sliceBetween(html, 'function getStructureSummaryItems', 'function buildStructureDisclosureHtml');

  assert.match(summary, /source\.sequenceCoverage/);
  assert.match(summary, /Number\.isFinite\(sequenceCoverage\)/);
  assert.match(summary, /'\u5e8f\u5217\u8986\u76d6'/);
  assert.match(summary, /sequenceCoverage \* 100/);
});

test('gallery validates HTTP and PDB content before creating a 3D model', () => {
  const fetchStart = galleryHtml.indexOf('fetch(pdbUrl)');
  const addModel = galleryHtml.indexOf("glv.addModel(txt, 'pdb')", fetchStart);
  const validation = galleryHtml.indexOf('if (!isPdbText(txt))', fetchStart);

  assert.notEqual(fetchStart, -1, 'gallery fetch should exist');
  assert.match(galleryHtml, /if\s*\(!r\.ok\)\s*throw new Error/);
  assert.match(galleryHtml, /\(\?:\^\|\\n\)\(\?:ATOM  \|HETATM\)/);
  assert.ok(validation > fetchStart && validation < addModel, 'PDB text must be validated before addModel');
  assert.match(galleryHtml, /Structure unavailable/);
  assert.doesNotMatch(galleryHtml, /\$3Dmol\.download\(/, 'fallback must not bypass coordinate validation');
});
