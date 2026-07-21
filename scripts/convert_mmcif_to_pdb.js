#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

function fail(message) {
  console.error(message);
  process.exit(1);
}

function usage(message) {
  if (message) console.error(message);
  console.error('Usage: node scripts/convert_mmcif_to_pdb.js --input <path-or-url> --output <path> [--title <line>] [--remark <line>]... [--expect-chains <A,B,...>] [--overwrite]');
  process.exit(message ? 1 : 0);
}

function parseArgs(argv) {
  const args = {
    input: '',
    output: '',
    title: '',
    remarks: [],
    expectChains: [],
    overwrite: false
  };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--help' || token === '-h') usage();
    if (token === '--overwrite') {
      args.overwrite = true;
      continue;
    }
    const value = argv[i + 1];
    if (value === undefined) usage('Missing value for ' + token);
    if (token === '--input') args.input = value;
    else if (token === '--output') args.output = value;
    else if (token === '--title') args.title = value;
    else if (token === '--remark') args.remarks.push(value);
    else if (token === '--expect-chains') {
      args.expectChains.push(...String(value).split(',').map(item => item.trim()).filter(Boolean));
    } else {
      usage('Unknown argument: ' + token);
    }
    i += 1;
  }
  if (!args.input) usage('Missing --input');
  if (!args.output) usage('Missing --output');
  return args;
}

function isUrl(value) {
  return /^https?:\/\//i.test(String(value || ''));
}

function requestText(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https://') ? https : http;
    const req = client.get(url, res => {
      const status = res.statusCode || 0;
      if (status >= 300 && status < 400 && res.headers.location) {
        if (redirects >= 5) {
          reject(new Error('Too many redirects while fetching ' + url));
          return;
        }
        const nextUrl = new URL(res.headers.location, url).toString();
        res.resume();
        resolve(requestText(nextUrl, redirects + 1));
        return;
      }
      if (status < 200 || status >= 300) {
        const chunks = [];
        res.on('data', chunk => chunks.push(chunk));
        res.on('end', () => {
          reject(new Error('Failed to fetch ' + url + ': HTTP ' + status + ' ' + Buffer.concat(chunks).toString('utf8').slice(0, 200)));
        });
        return;
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    });
    req.on('error', reject);
  });
}

async function readInputText(input) {
  if (isUrl(input)) return requestText(input);
  return fs.readFileSync(path.resolve(process.cwd(), input), 'utf8');
}

function parseAtomSiteLoop(text) {
  const lines = String(text || '').split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].trim() !== 'loop_') continue;
    let j = i + 1;
    if (!String(lines[j] || '').trim().startsWith('_atom_site.')) continue;
    const headers = [];
    while (String(lines[j] || '').trim().startsWith('_atom_site.')) {
      headers.push(lines[j].trim());
      j += 1;
    }
    if (!headers.length) continue;
    const rows = [];
    let buffered = [];
    while (j < lines.length) {
      const trimmed = String(lines[j] || '').trim();
      if (!trimmed) {
        j += 1;
        continue;
      }
      if (trimmed === '#' || trimmed === 'loop_' || trimmed.startsWith('_')) break;
      buffered.push(...trimmed.split(/\s+/));
      while (buffered.length >= headers.length) {
        rows.push(buffered.slice(0, headers.length));
        buffered = buffered.slice(headers.length);
      }
      j += 1;
    }
    if (buffered.length) {
      throw new Error('Truncated _atom_site loop: expected ' + headers.length + ' values per row');
    }
    return { headers, rows };
  }
  throw new Error('Unable to locate _atom_site loop in mmCIF input');
}

function headerIndexMap(headers) {
  return new Map(headers.map((name, idx) => [name, idx]));
}

function fieldForRow(row, indexMap, name, fallback = '') {
  const idx = indexMap.get(name);
  if (idx === undefined) return fallback;
  return row[idx];
}

function nullishToEmpty(value) {
  const text = String(value === undefined || value === null ? '' : value).trim();
  return text === '.' || text === '?' ? '' : text;
}

function requireField(indexMap, name) {
  if (!indexMap.has(name)) throw new Error('mmCIF is missing required field ' + name);
}

function parseIntegerField(value, label) {
  const text = nullishToEmpty(value);
  const parsed = Number.parseInt(text, 10);
  if (!Number.isFinite(parsed)) throw new Error('Unable to parse integer field ' + label + ': ' + value);
  return parsed;
}

function parseFloatField(value, label) {
  const text = nullishToEmpty(value);
  const parsed = Number.parseFloat(text);
  if (!Number.isFinite(parsed)) throw new Error('Unable to parse float field ' + label + ': ' + value);
  return parsed;
}

function formatAtomName(atomName, element) {
  const clean = String(atomName || '').trim().slice(0, 4);
  const cleanElement = String(element || '').trim().toUpperCase();
  if (!clean) return '    ';
  const leftJustify = clean.length === 4 || /^[0-9]/.test(clean) || cleanElement.length === 2 || clean.length === 1;
  return leftJustify ? clean.padEnd(4, ' ') : clean.padStart(4, ' ');
}

function formatCharge(value) {
  const text = nullishToEmpty(value);
  if (!text || text === '0') return '';
  const sign = text.startsWith('-') ? '-' : '+';
  const magnitude = text.replace(/[+-]/g, '').slice(0, 1);
  return (magnitude + sign).slice(0, 2);
}

function formatFloat(value, width, decimals) {
  const numeric = Number(value);
  for (let places = decimals; places >= 0; places -= 1) {
    const text = numeric.toFixed(places);
    if (text.length <= width) return text.padStart(width, ' ');
  }
  throw new Error('Float field overflow: ' + numeric);
}

function formatInteger(value, width) {
  const text = String(value);
  if (text.length > width) throw new Error('Integer field overflow: ' + text);
  return text.padStart(width, ' ');
}

function toPdbAtomLine(record) {
  const line = [
    String(record.group).padEnd(6, ' ').slice(0, 6),
    formatInteger(record.serial, 5),
    ' ',
    formatAtomName(record.atomName, record.element),
    (record.altLoc || ' ').slice(0, 1),
    String(record.resName || 'UNK').trim().slice(0, 3).padStart(3, ' '),
    ' ',
    record.chain,
    formatInteger(record.resSeq, 4),
    (record.insCode || ' ').slice(0, 1),
    '   ',
    formatFloat(record.x, 8, 3),
    formatFloat(record.y, 8, 3),
    formatFloat(record.z, 8, 3),
    formatFloat(record.occupancy, 6, 2),
    formatFloat(record.bFactor, 6, 2),
    '          ',
    String(record.element || '').trim().toUpperCase().slice(0, 2).padStart(2, ' '),
    formatCharge(record.charge).padStart(2, ' ')
  ].join('');
  return line.padEnd(80, ' ').slice(0, 80);
}

function mmcifRowsToPdbRecords(loop) {
  const indexMap = headerIndexMap(loop.headers);
  for (const name of [
    '_atom_site.group_PDB',
    '_atom_site.id',
    '_atom_site.type_symbol',
    '_atom_site.label_atom_id',
    '_atom_site.label_alt_id',
    '_atom_site.label_comp_id',
    '_atom_site.pdbx_PDB_ins_code',
    '_atom_site.Cartn_x',
    '_atom_site.Cartn_y',
    '_atom_site.Cartn_z',
    '_atom_site.occupancy',
    '_atom_site.B_iso_or_equiv',
    '_atom_site.pdbx_formal_charge',
    '_atom_site.auth_seq_id',
    '_atom_site.auth_comp_id',
    '_atom_site.auth_asym_id',
    '_atom_site.auth_atom_id'
  ]) {
    requireField(indexMap, name);
  }

  return loop.rows.map(row => {
    const chain = nullishToEmpty(fieldForRow(row, indexMap, '_atom_site.auth_asym_id'));
    if (!chain) throw new Error('Encountered _atom_site row without auth chain ID');
    if (chain.length !== 1) {
      throw new Error('Legacy PDB export requires single-character auth chain IDs, received "' + chain + '"');
    }
    const serial = parseIntegerField(fieldForRow(row, indexMap, '_atom_site.id'), '_atom_site.id');
    if (serial > 99999) throw new Error('Legacy PDB serial overflow for atom ID ' + serial);
    return {
      group: fieldForRow(row, indexMap, '_atom_site.group_PDB', 'ATOM'),
      serial,
      atomName: nullishToEmpty(fieldForRow(row, indexMap, '_atom_site.auth_atom_id'))
        || nullishToEmpty(fieldForRow(row, indexMap, '_atom_site.label_atom_id')),
      altLoc: nullishToEmpty(fieldForRow(row, indexMap, '_atom_site.label_alt_id')),
      resName: nullishToEmpty(fieldForRow(row, indexMap, '_atom_site.auth_comp_id'))
        || nullishToEmpty(fieldForRow(row, indexMap, '_atom_site.label_comp_id')),
      chain,
      resSeq: parseIntegerField(fieldForRow(row, indexMap, '_atom_site.auth_seq_id'), '_atom_site.auth_seq_id'),
      insCode: nullishToEmpty(fieldForRow(row, indexMap, '_atom_site.pdbx_PDB_ins_code')),
      x: parseFloatField(fieldForRow(row, indexMap, '_atom_site.Cartn_x'), '_atom_site.Cartn_x'),
      y: parseFloatField(fieldForRow(row, indexMap, '_atom_site.Cartn_y'), '_atom_site.Cartn_y'),
      z: parseFloatField(fieldForRow(row, indexMap, '_atom_site.Cartn_z'), '_atom_site.Cartn_z'),
      occupancy: parseFloatField(fieldForRow(row, indexMap, '_atom_site.occupancy'), '_atom_site.occupancy'),
      bFactor: parseFloatField(fieldForRow(row, indexMap, '_atom_site.B_iso_or_equiv'), '_atom_site.B_iso_or_equiv'),
      element: nullishToEmpty(fieldForRow(row, indexMap, '_atom_site.type_symbol')),
      charge: nullishToEmpty(fieldForRow(row, indexMap, '_atom_site.pdbx_formal_charge'))
    };
  });
}

function orderedUnique(items) {
  const seen = new Set();
  const output = [];
  for (const item of items) {
    if (seen.has(item)) continue;
    seen.add(item);
    output.push(item);
  }
  return output;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const outputPath = path.resolve(process.cwd(), args.output);
  if (!args.overwrite && fs.existsSync(outputPath)) {
    fail('Refusing to overwrite existing file without --overwrite: ' + outputPath);
  }

  const mmcifText = await readInputText(args.input);
  const loop = parseAtomSiteLoop(mmcifText);
  const records = mmcifRowsToPdbRecords(loop);
  const presentChains = orderedUnique(records.map(record => record.chain));
  const missingChains = orderedUnique(args.expectChains).filter(chain => !presentChains.includes(chain));
  if (missingChains.length) {
    fail('Expected auth chains not found in converted records: ' + missingChains.join(', '));
  }

  const lines = [];
  if (args.title) lines.push(String(args.title));
  for (const remark of args.remarks) lines.push(String(remark));
  for (const record of records) lines.push(toPdbAtomLine(record));
  lines.push('END');

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, lines.join('\n') + '\n', 'utf8');

  console.log('Wrote ' + path.relative(process.cwd(), outputPath) + ' with ' + records.length + ' coordinate records');
  console.log('Observed auth chains: ' + presentChains.join(','));
}

main().catch(error => fail(error && error.stack ? error.stack : String(error)));
