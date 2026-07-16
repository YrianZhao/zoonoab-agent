const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const test = require('node:test');

const ROOT = path.resolve(__dirname, '..');
const indexHtml = fs.readFileSync(path.join(ROOT, 'public', 'index.html'), 'utf8');
const viewerFullHtml = fs.readFileSync(path.join(ROOT, 'public', 'viewer-full.html'), 'utf8');

function extractFunction(source, signature) {
  const start = source.indexOf(signature);
  assert.notEqual(start, -1, signature + ' should exist');
  const braceStart = source.indexOf('{', start);
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

test('result modal defaults to pure cartoon antigen-antibody coloring', () => {
  assert.match(viewerFullHtml, /var\s+currentStyle\s*=\s*['"]cartoon['"]/);
  assert.match(viewerFullHtml, /var\s+currentColor\s*=\s*['"]ab-ag['"]/);

  const applyFunction = extractFunction(viewerFullHtml, 'function apply()');
  assert.match(applyFunction, /glv\.setStyle\(\{\},\s*\{\}\)/);
  assert.doesNotMatch(applyFunction, /stick\s*:/);
  assert.match(viewerFullHtml, /case\s+['"]cartoon['"]:\s*glv\.setStyle\(selector,\s*\{cartoon:\{color:\s*color\}\}\)/);
});

test('surface mode never maps to stick in the embedded structure viewer', () => {
  const mol3dStyleFunction = extractFunction(indexHtml, 'function mol3dStyle(style)');

  assert.doesNotMatch(mol3dStyleFunction, /surface\s*:\s*\{\s*stick\s*:/);
  assert.match(mol3dStyleFunction, /addSurface/);
  assert.match(mol3dStyleFunction, /setStyle\(\{\},\s*\{\s*cartoon:/);
});

test('stick rendering is reserved for an explicit interface detail mode', () => {
  assert.match(viewerFullHtml, /interface\s*:\s*['"]interface['"]/);
  assert.match(viewerFullHtml, /function\s+normalizeStyle\(/);
  assert.match(viewerFullHtml, /function\s+doInterfaceDetail\(\)/);

  const normalizeFunction = extractFunction(viewerFullHtml, 'function normalizeStyle(s)');
  assert.match(normalizeFunction, /['"]stick['"]/);
  assert.match(normalizeFunction, /['"]interface['"]/);

  const interfaceFunction = extractFunction(viewerFullHtml, 'function doInterfaceDetail()');
  assert.match(interfaceFunction, /cartoon/);
  assert.match(interfaceFunction, /stick/);
  assert.match(interfaceFunction, /within/);

  const doSurfaceFunction = extractFunction(viewerFullHtml, 'function doSurface()');
  assert.doesNotMatch(doSurfaceFunction, /stick\s*:/);
});

test('3D viewers expose an antigen and antibody color legend', () => {
  assert.match(indexHtml, /function\s+buildRoleLegendHtml\(/);
  assert.match(indexHtml, /function\s+safeViewerColor\(/);
  assert.match(indexHtml, /viewer-role-legend/);
  assert.match(indexHtml, /viewer-role-swatch/);
  assert.match(indexHtml, /抗原/);
  assert.match(indexHtml, /抗体/);

  const frameUrlFunction = extractFunction(indexHtml, 'function buildMoleculeFrameUrl(basePath, pdbId, title, candidateIndex)');
  assert.match(frameUrlFunction, /antigenLabel/);
  assert.match(frameUrlFunction, /antibodyLabel/);

  assert.match(viewerFullHtml, /function\s+renderRoleLegend\(/);
  assert.match(viewerFullHtml, /function\s+safeViewerColor\(/);
  assert.match(viewerFullHtml, /safeViewerColor\(params\.get\('chainA'\),\s*'#FB923C'\)/);
  assert.match(viewerFullHtml, /safeViewerColor\(params\.get\('chainB'\),\s*'#2DD4BF'\)/);
  assert.match(viewerFullHtml, /vf-role-legend/);
  assert.match(viewerFullHtml, /抗原/);
  assert.match(viewerFullHtml, /抗体/);
});

test('3D role legends only show role names and color swatches', () => {
  const legendHtmlFunction = extractFunction(indexHtml, 'function buildRoleLegendHtml(meta)');
  assert.match(legendHtmlFunction, /item\.role/);
  assert.doesNotMatch(legendHtmlFunction, /item\.label/);
  assert.doesNotMatch(legendHtmlFunction, /viewer-role-chains/);
  assert.doesNotMatch(legendHtmlFunction, /展示链|chains\.join/);

  const frameUrlFunction = extractFunction(indexHtml, 'function buildMoleculeFrameUrl(basePath, pdbId, title, candidateIndex)');
  assert.doesNotMatch(frameUrlFunction, /展示链/);
  assert.doesNotMatch(frameUrlFunction, /legend\.antigen\.label|legend\.antibody\.label/);

  const historyFrameUrlFunction = extractFunction(indexHtml, 'function buildHistoryMoleculeFrameUrl(section, model, modelIdx, title)');
  assert.doesNotMatch(historyFrameUrlFunction, /展示链/);
  assert.doesNotMatch(historyFrameUrlFunction, /legend\.antigen\.label|legend\.antibody\.label/);

  const fullLegendFunction = extractFunction(viewerFullHtml, 'function renderRoleLegend()');
  assert.doesNotMatch(fullLegendFunction, /AG_LABEL|AB_LABEL|replace\(/);
  assert.doesNotMatch(fullLegendFunction, /Chains|展示链|Target antigen|Fab 候选/);
});

test('embedded and full 3D viewers hide chains outside the selected antigen-antibody pair in product display modes', () => {
  const galleryHtml = fs.readFileSync(path.join(ROOT, 'public', 'gallery-mol.html'), 'utf8');
  const galleryApplyChainColors = extractFunction(galleryHtml, 'function applyChainColors(m)');
  const galleryInit = extractFunction(galleryHtml, 'function init()');
  const fullAntibodySelector = extractFunction(viewerFullHtml, 'function antibodySelector()');
  const fullAbAgColor = viewerFullHtml.slice(
    viewerFullHtml.indexOf("'ab-ag': function()"),
    viewerFullHtml.indexOf("// Chain: product display keeps the same two role colors")
  );

  assert.match(galleryInit, /visibleChains/);
  assert.match(galleryApplyChainColors, /hiddenChains/);
  assert.match(galleryApplyChainColors, /glv\.setStyle\(\{chain:ch\},\s*\{\}\)/);
  assert.doesNotMatch(galleryApplyChainColors, /CHAIN_PALETTE\[i\s*%\s*CHAIN_PALETTE\.length\]/);

  assert.match(viewerFullHtml, /function\s+visibleSelector\(\)/);
  assert.match(fullAntibodySelector, /selectorForChains\(AB_CHAINS\)/);
  assert.doesNotMatch(fullAntibodySelector, /\{not:\s*selectorForChains\(AG_CHAINS\)\}/);
  assert.match(fullAbAgColor, /glv\.setStyle\(\{not:\s*visibleSelector\(\)\},\s*\{\}\)/);
});

test('auto-spin badge uses audience-facing copy and is rendered before Spin', () => {
  assert.match(viewerFullHtml, /var\s+AUTO_SPIN\s*=/);
  assert.match(viewerFullHtml, /\.vf-auto-spin-badge\s*{/);
  assert.match(viewerFullHtml, /function\s+renderAutoSpinBadge\s*\(/);

  const renderBadge = extractFunction(viewerFullHtml, 'function renderAutoSpinBadge()');
  assert.match(renderBadge, /AUTO_SPIN/);
  assert.match(renderBadge, /document\.getElementById\('acts'\)/);
  assert.match(renderBadge, /textContent\s*=\s*'自动旋转'/);
  assert.match(renderBadge, /actions\.querySelector\('\.act'\)/);
  assert.match(renderBadge, /insertBefore\(badge,\s*firstAction\)/);

  const initStart = viewerFullHtml.indexOf('// Action buttons');
  assert.notEqual(initStart, -1, 'action button block should exist');
  const initEnd = viewerFullHtml.indexOf('load(pdbUrl, ldEl)', initStart);
  assert.notEqual(initEnd, -1, 'action button block should be bounded');
  const initBlock = viewerFullHtml.slice(initStart, initEnd);
  assert.ok(
    initBlock.indexOf('renderAutoSpinBadge()') >= 0 && initBlock.indexOf('renderAutoSpinBadge()') < initBlock.indexOf("['Spin','Reset','PNG']"),
    'AUTO SPIN badge should be inserted before the Spin button is appended'
  );
});

test('full viewer keeps every toolbar control visible on narrow mobile screens', () => {
  assert.match(viewerFullHtml, /@media \(max-width:600px\)/);
  assert.match(viewerFullHtml, /\.toolbar\{display:grid;grid-template-columns:44px minmax\(0,1fr\)/);
  assert.match(viewerFullHtml, /\.btns\{min-width:0;flex-wrap:wrap/);
  assert.match(viewerFullHtml, /\.actions\{grid-column:2;[^}]*flex-wrap:wrap/);
});

test('representative structures disable interface-detail controls in history and live viewers', () => {
  const frameUrlFunction = extractFunction(indexHtml, 'function buildMoleculeFrameUrl(basePath, pdbId, title, candidateIndex)');
  const historyFrameUrlFunction = extractFunction(indexHtml, 'function buildHistoryMoleculeFrameUrl(section, model, modelIdx, title)');
  const interfaceFunction = extractFunction(viewerFullHtml, 'function doInterfaceDetail()');

  assert.match(frameUrlFunction, /interfaceDetail/);
  assert.match(frameUrlFunction, /meta\.interfaceDetail === false \? '0' : '1'/);
  assert.match(historyFrameUrlFunction, /interfaceDetail/);
  assert.match(historyFrameUrlFunction, /meta\.interfaceDetail === false \? '0' : '1'/);
  assert.match(viewerFullHtml, /var\s+INTERFACE_DETAIL_ENABLED\s*=\s*params\.get\('interfaceDetail'\)\s*!==\s*'0'/);
  assert.match(viewerFullHtml, /if\s*\(!INTERFACE_DETAIL_ENABLED\)\s*delete STYLES\.interface/);
  assert.match(interfaceFunction, /if\s*\(!INTERFACE_DETAIL_ENABLED\)/);
  assert.match(interfaceFunction, /currentStyle\s*=\s*'cartoon'/);

  const disabledBranch = interfaceFunction.slice(0, interfaceFunction.indexOf('glv.removeAllSurfaces'));
  assert.doesNotMatch(disabledBranch, /within|stick/);
});

test('molecular viewers avoid duplicate parsing and reuse the loaded full-screen iframe', () => {
  const lazyInit = extractFunction(indexHtml, 'function lazyInitGalleryViewers()');
  const scheduler = extractFunction(indexHtml, 'function pumpGalleryInitQueue()');
  const initGallery = extractFunction(indexHtml, 'function initGalleryViewer(pdbId, idx)');
  const openModal = extractFunction(indexHtml, 'function openMolModal(pdbId, name, options)');
  const closeModal = extractFunction(indexHtml, 'function closeMolModal()');
  const restoreModal = extractFunction(indexHtml, 'function restorePromotedModalIframe()');
  const loadViewer = extractFunction(viewerFullHtml, 'function load(url,ldEl)');

  assert.match(indexHtml, /const GALLERY_INIT_CONCURRENCY = 1/);
  assert.match(lazyInit, /scheduleGalleryViewerInit\(0, true\)/);
  assert.doesNotMatch(lazyInit, /Math\.min\(4/);
  assert.match(scheduler, /galleryInitActive < GALLERY_INIT_CONCURRENCY/);
  assert.match(scheduler, /if \(typeof molModalOpen !== 'undefined' && molModalOpen\) return/);
  assert.match(initGallery, /buildMoleculeFrameUrl\('\/viewer-full\.html',[\s\S]*compact:\s*true/);
  assert.match(openModal, /reusableGalleryIframe/);
  assert.match(openModal, /modalIframeHome\s*=\s*\{\s*iframe:\s*reusableGalleryIframe/);
  assert.match(openModal, /reusableGalleryCard\.classList\.add\('viewer-promoted'\)/);
  assert.match(openModal, /postModalViewerCommand\('setCompact',[\s\S]*compact:\s*false/);
  const promoteStart = openModal.indexOf('if (bodyEl && reusableGalleryIframe && reusableGalleryCard)');
  const promoteEnd = openModal.indexOf('} else if (bodyEl)', promoteStart);
  assert.ok(promoteStart >= 0 && promoteEnd > promoteStart);
  assert.doesNotMatch(openModal.slice(promoteStart, promoteEnd), /appendChild\(modalIframe\)/);
  assert.match(indexHtml, /\.gallery-card\.viewer-promoted\s*{/);
  assert.match(openModal, /!modalIframe \|\| modalIframeUrl !== vfUrl/);
  assert.match(openModal, /modalIframeUrl = vfUrl/);
  assert.match(restoreModal, /type:\s*'setCompact'/);
  assert.match(restoreModal, /compact:\s*true/);
  assert.doesNotMatch(closeModal, /bodyEl\.innerHTML\s*=\s*''/);
  assert.doesNotMatch(closeModal, /modalIframe\s*=\s*null/);
  assert.match(closeModal, /setSpin.*false/s);
  assert.doesNotMatch(loadViewer, /\$3Dmol\.download/);
  assert.match(loadViewer, /fetchMs/);
  assert.match(loadViewer, /parseRenderMs/);
});

test('full viewer keeps model origin internal and shows an audience-facing readiness badge', () => {
  const sourceBadge = extractFunction(viewerFullHtml, 'function renderModelOriginBadge()');
  const frameUrl = extractFunction(indexHtml, 'function buildMoleculeFrameUrl(basePath, pdbId, title, candidateIndex)');
  const historyFrameUrl = extractFunction(indexHtml, 'function buildHistoryMoleculeFrameUrl(section, model, modelIdx, title)');

  assert.match(viewerFullHtml, /var\s+MODEL_ORIGIN\s*=\s*params\.get\('modelOrigin'\)\s*===\s*'local'\s*\?\s*'local'\s*:\s*'auto'/);
  assert.match(viewerFullHtml, /\.vf-source-badge\{[^}]*pointer-events:none/);
  assert.match(viewerFullHtml, /\.vf-source-badge\.local/);
  assert.match(viewerFullHtml, /\.vf-source-badge\.auto/);
  assert.match(sourceBadge, /document\.createElement\('span'\)/);
  assert.match(sourceBadge, /MODEL_ORIGIN\s*===\s*'local'\s*\?\s*'结构已就绪'\s*:\s*'结构已载入'/);
  assert.match(sourceBadge, /textContent\s*=\s*displayLabel/);
  assert.doesNotMatch(sourceBadge, /textContent\s*=\s*MODEL_ORIGIN/);
  assert.doesNotMatch(sourceBadge, /onclick|addEventListener\(['"]click/);
  const actionStart = viewerFullHtml.indexOf('// Action buttons');
  const actionEnd = viewerFullHtml.indexOf('load(pdbUrl, ldEl)', actionStart);
  const actionBlock = viewerFullHtml.slice(actionStart, actionEnd);
  assert.ok(actionBlock.indexOf('renderModelOriginBadge()') < actionBlock.indexOf('renderAutoSpinBadge()'));
  assert.ok(actionBlock.indexOf('renderAutoSpinBadge()') < actionBlock.indexOf("['Spin','Reset','PNG']"));
  assert.match(frameUrl, /modelOrigin/);
  assert.match(frameUrl, /getModelOrigin\(meta\)/);
  assert.match(historyFrameUrl, /modelOrigin/);
  assert.match(historyFrameUrl, /getModelOrigin\(meta\)/);
  assert.match(viewerFullHtml, /badge\.textContent = '自动旋转'/);
});
