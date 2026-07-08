const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const test = require('node:test');

const publicIndexPath = path.join(__dirname, '..', 'public', 'index.html');

test('keeps Chinese surnames attached to doctor titles in visible copy', () => {
  const html = fs.readFileSync(publicIndexPath, 'utf8');

  assert.doesNotMatch(html, /[\u4e00-\u9fff]\s+博士/);
});

test('gives the team collaboration view a full workspace width', () => {
  const html = fs.readFileSync(publicIndexPath, 'utf8');

  assert.match(html, /--team-content-max-width:\s*1[01]\d{2}px;/);
  assert.match(html, /body\.team-open\s+\.main-container/);
  assert.match(html, /document\.body\.classList\.toggle\('team-open',\s*view === 'team'\)/);
});
