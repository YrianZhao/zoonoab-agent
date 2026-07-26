const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const test = require('node:test');

const html = fs.readFileSync(path.join(__dirname, '..', 'public', 'index.html'), 'utf8');

function extractFunction(source, signature) {
  const start = source.indexOf(signature);
  assert.notEqual(start, -1, signature + ' should exist');
  const braceStart = source.indexOf('{', start);
  assert.notEqual(braceStart, -1, signature + ' should have a body');
  let depth = 0;
  for (let i = braceStart; i < source.length; i++) {
    if (source[i] === '{') depth++;
    if (source[i] === '}') depth--;
    if (depth === 0) return source.slice(start, i + 1);
  }
  throw new Error(signature + ' body was not closed');
}

test('page fullscreen control sits in the upper-right content area with stable icon sizing', () => {
  const headerEnd = html.indexOf('</header>');
  const buttonIndex = html.indexOf('id="pageFullscreenBtn"');
  const mainIndex = html.indexOf('<main class="main-container">');

  assert.ok(headerEnd >= 0 && buttonIndex > headerEnd && buttonIndex < mainIndex);
  assert.match(html, /\.page-fullscreen-btn\s*\{[\s\S]*?position:\s*fixed;[\s\S]*?top:\s*76px;[\s\S]*?right:\s*calc\(20px \+ env\(safe-area-inset-right\)\);[\s\S]*?width:\s*38px;[\s\S]*?height:\s*38px;/);
  assert.match(html, /id="pageFullscreenBtn"[^>]*aria-pressed="false"/);
  assert.match(html, /data-lucide="maximize"/);
  assert.match(html, /data-lucide="minimize"/);
});

test('page fullscreen control enters, exits, and follows browser fullscreen state', () => {
  const togglePageFullscreen = extractFunction(html, 'async function togglePageFullscreen');
  const syncPageFullscreenButton = extractFunction(html, 'function syncPageFullscreenButton');

  assert.match(togglePageFullscreen, /document\.documentElement/);
  assert.match(togglePageFullscreen, /page\.requestFullscreen \|\| page\.webkitRequestFullscreen/);
  assert.match(togglePageFullscreen, /document\.exitFullscreen \|\| document\.webkitExitFullscreen/);
  assert.match(syncPageFullscreenButton, /aria-pressed/);
  assert.match(syncPageFullscreenButton, /classList\.toggle\('is-active', isFullscreen\)/);
  assert.match(html, /addEventListener\('fullscreenchange', syncPageFullscreenButton\)/);
  assert.match(html, /addEventListener\('webkitfullscreenchange', syncPageFullscreenButton\)/);
  assert.match(html, /if \(getPageFullscreenElement\(\)\) \{\s*togglePageFullscreen\(\);\s*return;/);
});
