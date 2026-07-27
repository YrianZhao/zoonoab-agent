'use strict';

const fs = require('fs');
const path = require('path');
const {
  extractDesignRequest,
  normalizeTargetAlias
} = require('../lib/design-routing');

const ROOT = path.resolve(__dirname, '..');
const CATALOG_PATH = path.join(ROOT, 'pdb', 'local-structure-catalog.json');

function compactKey(value) {
  return String(value || '')
    .normalize('NFKC')
    .toUpperCase()
    .replace(/(?:ALPHA|Α)/g, 'A')
    .replace(/(?:BETA|Β)/g, 'B')
    .replace(/[^\p{Script=Han}A-Z0-9]/gu, '');
}

function equivalentTarget(actual, expected) {
  return compactKey(actual) === compactKey(expected);
}

function isSafeAlias(alias) {
  const key = compactKey(alias);
  if (!key) return false;
  if (key.length >= 3) return true;
  return /^(?:C\d|CD\d+|IL\d+|PD1|C5)$/i.test(String(alias || '').replace(/\s+/g, ''));
}

function aliasCandidates(entry) {
  const target = String(entry.target || '').trim();
  const gene = String(entry.gene || '').trim();
  const includeBareGene = !(target && /^Canine\s+/i.test(target)) && compactKey(gene).length > 1;
  const aliases = new Set([
    target,
    includeBareGene ? gene : '',
    entry.promptLabel,
    ...(Array.isArray(entry.aliases) ? entry.aliases : [])
  ].map(item => String(item || '').trim()).filter(Boolean));

  for (const base of [target, includeBareGene ? gene : '']) {
    if (!base || /\breceptor\b/i.test(base) || compactKey(base).length <= 1) continue;
    const receptorSuffixWouldMislead = /^IL[-\s]?\d/i.test(base) && !/R(?:A|B|ALPHA|BETA)?$/i.test(compactKey(base));
    if (!receptorSuffixWouldMislead) aliases.add(base + ' receptor');
    aliases.add(base + ' protein');
  }
  return [...aliases].filter(isSafeAlias);
}

function audit() {
  const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
  const failures = [];
  const rows = [];
  for (const entry of catalog.routePresets || []) {
    if (!entry || entry.routeable === false || entry.promptEligible === false) continue;
    const expected = String(entry.target || '').trim();
    if (!expected) continue;
    for (const alias of aliasCandidates(entry)) {
      const normalized = normalizeTargetAlias(alias);
      const parsed = extractDesignRequest('请为' + alias + '设计一个候选抗体');
      rows.push({ routeId: entry.routeId, alias, expected, normalized, parsedTarget: parsed.target });
      if (!equivalentTarget(normalized, expected) || !equivalentTarget(parsed.target, expected)) {
        failures.push({ routeId: entry.routeId, alias, expected, normalized, parsedTarget: parsed.target });
      }
    }
  }
  return { rows, failures };
}

function main() {
  const { rows, failures } = audit();
  if (failures.length) {
    console.error('[target-alias-audit] failures: ' + failures.length);
    console.error(JSON.stringify(failures.slice(0, 30), null, 2));
    process.exit(1);
  }
  console.log('[target-alias-audit] ok: ' + rows.length + ' aliases checked across local route presets.');
}

if (require.main === module) main();

module.exports = { audit, aliasCandidates, equivalentTarget };
