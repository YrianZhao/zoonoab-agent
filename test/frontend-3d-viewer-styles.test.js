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
