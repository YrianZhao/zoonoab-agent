#!/usr/bin/env node
'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const DEFAULT_HISTORY_MAX = Math.max(50, Number(process.env.HISTORY_MAX_RECORDS || 5000) || 5000);
const DEFAULT_QUESTION_MAX = Math.max(100, Number(process.env.QUESTION_TEST_SET_MAX_ITEMS || 5000) || 5000);
const HISTORY_TEXT_MAX = Math.max(20_000, Number(process.env.HISTORY_TEXT_MAX || 200_000) || 200_000);
const HISTORY_JSON_TEXT_MAX = Math.max(8_000, Number(process.env.HISTORY_JSON_TEXT_MAX || 80_000) || 80_000);
const HISTORY_ARRAY_MAX = Math.max(50, Number(process.env.HISTORY_ARRAY_MAX || 1000) || 1000);
const QUESTION_TEXT_MAX = Math.max(1000, Number(process.env.QUESTION_TEST_SET_TEXT_MAX || 4000) || 4000);

function usage() {
  console.error('Usage: node scripts/sync_history_store.js --history-store <path> --question-set <path> [--backup] <source.json>...');
}

function parseArgs(argv) {
  const args = { sources: [], backup: false };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--history-store') args.historyStore = argv[++i];
    else if (arg === '--question-set') args.questionSet = argv[++i];
    else if (arg === '--backup') args.backup = true;
    else if (arg === '--help' || arg === '-h') {
      usage();
      process.exit(0);
    } else if (arg && arg.startsWith('--')) {
      throw new Error('Unknown option: ' + arg);
    } else {
      args.sources.push(arg);
    }
  }
  if (!args.historyStore && !args.questionSet) throw new Error('At least --history-store or --question-set is required.');
  return args;
}

function readJsonFile(file) {
  if (!file || !fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, 'utf8');
  if (!raw.trim()) return null;
  return JSON.parse(raw);
}

function truncateText(value, max = HISTORY_TEXT_MAX) {
  const text = value === undefined || value === null ? '' : String(value);
  return text.length > max ? text.slice(0, max - 1) + '...' : text;
}

function cloneValue(value, maxText = HISTORY_JSON_TEXT_MAX) {
  if (value === undefined || value === null) return value;
  try {
    return JSON.parse(JSON.stringify(value, (key, val) => {
      if (typeof val === 'function' || typeof val === 'symbol' || typeof val === 'bigint') return undefined;
      if (typeof val === 'string') return truncateText(val, maxText);
      return val;
    }));
  } catch {
    return truncateText(String(value), maxText);
  }
}

function normalizeTimestamp(value, fallback = Date.now()) {
  const n = Number(value);
  if (Number.isFinite(n) && n > 0) return n;
  const parsed = Date.parse(String(value || ''));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeArray(value, max = HISTORY_ARRAY_MAX, itemMaxText = HISTORY_JSON_TEXT_MAX) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, max).map(item => cloneValue(item, itemMaxText)).filter(item => item !== undefined);
}

function normalizeQuestion(value) {
  const text = value === undefined || value === null ? '' : String(value).trim();
  return text ? truncateText(text, QUESTION_TEXT_MAX) : '';
}

function historyTitleFromInput(input, fallback) {
  const primary = input !== undefined && input !== null && String(input).trim() ? input : fallback;
  return truncateText(primary || '未命名设计记录', 120);
}

function stableFingerprint(source, normalized = {}) {
  const messages = Array.isArray(source && source.messages) ? source.messages : [];
  const events = Array.isArray(source && source.events) ? source.events : [];
  const models3d = Array.isArray(source && source.models3d) ? source.models3d : [];
  const basis = {
    ts: normalizeTimestamp((source && (source.ts || source.createdAt || source.updatedAt)) || normalized.ts, 0),
    input: truncateText(normalized.input || (source && (source.input || source.title || source.label)) || '', 2000),
    title: truncateText((source && (source.title || source.label)) || normalized.title || '', 2000),
    status: normalized.status || (source && source.status) || '',
    routeId: truncateText((source && source.routeId) || '', 160),
    routeLabel: truncateText((source && source.routeLabel) || '', 200),
    messageCount: messages.length,
    eventCount: events.length,
    resultCount: Array.isArray(source && source.results) ? source.results.length : 0,
    modelCount: models3d.length
  };
  return crypto.createHash('sha256').update(JSON.stringify(basis)).digest('hex');
}

function normalizeHistoryRecord(entry, idx = 0) {
  const source = entry && typeof entry === 'object' && !Array.isArray(entry) ? entry : {};
  const ts = normalizeTimestamp(source.ts || source.createdAt || source.updatedAt, Date.now() + idx);
  const updatedAt = normalizeTimestamp(source.updatedAt || source.ts || source.createdAt, ts);
  const messages = normalizeArray(source.messages, HISTORY_ARRAY_MAX);
  const events = normalizeArray(source.events, HISTORY_ARRAY_MAX);
  const firstUser = messages.find(item => item && item.role === 'user');
  const input = truncateText(source.input || (firstUser && firstUser.text) || '');
  const status = ['running', 'completed', 'cancelled', 'error', 'interrupted'].includes(source.status)
    ? source.status
    : 'completed';
  const explicitId = String(source.id || '').trim();
  const fingerprint = stableFingerprint(source, { ts, input, status, title: source.title || source.label || '' });
  const id = /^[-_A-Za-z0-9:.]{3,120}$/.test(explicitId)
    ? explicitId
    : 'hist-fp-' + fingerprint.slice(0, 24);

  return {
    id,
    _fingerprint: fingerprint,
    schemaVersion: Number(source.schemaVersion) || 2,
    title: historyTitleFromInput(input, source.title || source.label),
    input,
    status,
    statusDetail: truncateText(source.statusDetail || source.detail || source.error || '', 1000),
    error: truncateText(source.error || '', 1000),
    ts,
    updatedAt,
    routeId: truncateText(source.routeId || '', 120),
    routeLabel: truncateText(source.routeLabel || '', 160),
    messages,
    events,
    results: normalizeArray(source.results, HISTORY_ARRAY_MAX),
    models3d: normalizeArray(source.models3d, HISTORY_ARRAY_MAX),
    stats: cloneValue(source.stats || null, HISTORY_JSON_TEXT_MAX)
  };
}

function historyScore(record) {
  return [
    record.input ? 1000 : 0,
    Array.isArray(record.events) ? record.events.length : 0,
    Array.isArray(record.messages) ? record.messages.length : 0,
    Array.isArray(record.models3d) ? record.models3d.length * 20 : 0,
    Array.isArray(record.results) ? record.results.length * 10 : 0
  ].reduce((sum, value) => sum + value, 0);
}

function sortHistory(records) {
  return records.sort((a, b) => {
    const byUpdated = normalizeTimestamp(b.updatedAt || b.ts, 0) - normalizeTimestamp(a.updatedAt || a.ts, 0);
    if (byUpdated) return byUpdated;
    return String(b.id || '').localeCompare(String(a.id || ''));
  });
}

function extractFromJson(value) {
  const history = [];
  const questions = [];
  const pushQuestion = item => {
    const text = typeof item === 'string'
      ? normalizeQuestion(item)
      : normalizeQuestion(item && (item.question || item.input || item.text));
    if (text) questions.push(text);
  };
  const pushHistory = item => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return;
    history.push(item);
    const firstUser = Array.isArray(item.messages) ? item.messages.find(msg => msg && msg.role === 'user') : null;
    pushQuestion(item.input || (firstUser && firstUser.text));
  };

  if (Array.isArray(value)) {
    for (const item of value) {
      if (typeof item === 'string') pushQuestion(item);
      else pushHistory(item);
    }
  } else if (value && typeof value === 'object') {
    if (Array.isArray(value.history)) value.history.forEach(pushHistory);
    if (Array.isArray(value.records)) value.records.forEach(pushHistory);
    if (Array.isArray(value.questions)) value.questions.forEach(pushQuestion);
  }
  return { history, questions };
}

function readSources(files) {
  const history = [];
  const questions = [];
  for (const file of files) {
    if (!file || !fs.existsSync(file)) continue;
    const parsed = readJsonFile(file);
    const extracted = extractFromJson(parsed);
    history.push(...extracted.history);
    questions.push(...extracted.questions);
  }
  return { history, questions };
}

function mergeHistory(existing, incoming) {
  const byId = new Map();
  const fingerprintToId = new Map();
  for (const [idx, item] of [...existing, ...incoming].entries()) {
    const record = normalizeHistoryRecord(item, idx);
    const duplicateId = fingerprintToId.get(record._fingerprint);
    const key = duplicateId || record.id;
    const current = byId.get(key);
    if (!current || historyScore(record) >= historyScore(current)) {
      record.id = key;
      byId.set(key, record);
    }
    fingerprintToId.set(record._fingerprint, key);
  }
  const merged = sortHistory([...byId.values()]).slice(0, DEFAULT_HISTORY_MAX);
  return merged.map(({ _fingerprint, ...record }) => record);
}

function mergeQuestions(existing, incoming) {
  const seen = new Set();
  const merged = [];
  for (const item of [...existing, ...incoming]) {
    const text = normalizeQuestion(item);
    if (!text || seen.has(text)) continue;
    seen.add(text);
    merged.push(text);
  }
  if (merged.length > DEFAULT_QUESTION_MAX) {
    return merged.slice(merged.length - DEFAULT_QUESTION_MAX);
  }
  return merged;
}

function atomicWriteJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
  const tempFile = file + '.' + process.pid + '.' + Date.now() + '.tmp';
  fs.writeFileSync(tempFile, JSON.stringify(value, null, 2), { mode: 0o600 });
  fs.renameSync(tempFile, file);
  try { fs.chmodSync(file, 0o600); } catch {}
}

function backupFile(file) {
  if (!file || !fs.existsSync(file)) return '';
  const backup = file + '.bak-' + new Date().toISOString().replace(/[:.]/g, '-');
  fs.copyFileSync(file, backup);
  return backup;
}

function main() {
  const args = parseArgs(process.argv);
  const sources = [...args.sources];
  if (args.historyStore) sources.unshift(args.historyStore);
  if (args.questionSet) sources.unshift(args.questionSet);
  const extracted = readSources(sources);
  const summary = { ok: true, history: null, questions: null, backups: [] };

  if (args.backup) {
    for (const file of [args.historyStore, args.questionSet]) {
      const backup = backupFile(file);
      if (backup) summary.backups.push(backup);
    }
  }
  if (args.historyStore) {
    const existing = extractFromJson(readJsonFile(args.historyStore)).history;
    const merged = mergeHistory(existing, extracted.history);
    atomicWriteJson(args.historyStore, merged);
    summary.history = { file: args.historyStore, count: merged.length };
  }
  if (args.questionSet) {
    const existing = extractFromJson(readJsonFile(args.questionSet)).questions;
    const merged = mergeQuestions(existing, extracted.questions);
    atomicWriteJson(args.questionSet, merged);
    summary.questions = { file: args.questionSet, count: merged.length };
  }
  console.log(JSON.stringify(summary, null, 2));
}

try {
  main();
} catch (err) {
  console.error(err && err.message ? err.message : err);
  usage();
  process.exit(1);
}
