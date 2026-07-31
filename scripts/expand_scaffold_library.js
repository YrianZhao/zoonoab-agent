'use strict';

/**
 * Expand the antibody scaffold library from 10 to 30+ diverse scaffolds.
 *
 * This script:
 * 1. Extracts 14 new Fab scaffolds from existing original route-preset PDB files
 *    (selected for maximum structural diversity via distinct atom counts)
 * 2. Downloads 8 real nanobody (VHH) structures from RCSB PDB
 * 3. Creates scaffold files in pdb/scaffolds/
 * 4. Writes a manifest documenting all new scaffolds
 *
 * Usage: node scripts/expand_scaffold_library.js
 */

const fs = require('fs');
const https = require('https');
const path = require('path');
const crypto = require('crypto');
const { parsePdbRecords } = require('../lib/display-pose');

const ROOT = path.resolve(__dirname, '..');
const PDB_DIR = path.join(ROOT, 'pdb');
const SCAFFOLD_DIR = path.join(PDB_DIR, 'scaffolds');
const MANIFEST_PATH = path.join(PDB_DIR, 'expanded-scaffold-library-manifest.json');
const RCSB_FILE_BASE = 'https://files.rcsb.org/download';

// ─── 14 new Fab scaffold sources (selected for diverse atom counts / structures) ───
// Each entry: { name, source (existing PDB file), chains (antibody chains), description }
const NEW_FAB_SCAFFOLDS = [
  { name: 'fluha',    source: 'FluHA-Fab-01.pdb',  chains: ['B', 'C'], description: 'Anti-influenza HA Fab (1498 atoms, distinct CDR architecture)' },
  { name: 'bcma',     source: 'BCMA-Fab-01.pdb',   chains: ['B', 'C'], description: 'Anti-BCMA Fab (1539 atoms, compact framework)' },
  { name: 'il13',     source: 'IL13-Fab-01.pdb',   chains: ['H', 'L'], description: 'Anti-IL-13 Fab (1544 atoms, different VH family)' },
  { name: 'fcrn',     source: 'FCRN-Fab-01.pdb',   chains: ['H', 'L'], description: 'Anti-FcRn Fab (1550 atoms, long CDR-L1)' },
  { name: 'gipr',     source: 'GIPR-Fab-01.pdb',   chains: ['B', 'C'], description: 'Anti-GIPR Fab (1566 atoms, class GPCR binder)' },
  { name: 'her3',     source: 'HER3-Fab-01.pdb',   chains: ['B', 'C'], description: 'Anti-HER3 Fab (1571 atoms, EGFR family)' },
  { name: 'cd47',     source: 'CD47-Fab-01.pdb',   chains: ['B', 'C'], description: 'Anti-CD47 Fab (1581 atoms, macrophage checkpoint)' },
  { name: 'cgrpr',    source: 'CGRPR-Fab-01.pdb',  chains: ['B', 'C'], description: 'Anti-CGRP receptor Fab (1592 atoms, distinct germline)' },
  { name: 'il6r',     source: 'IL6R-Fab-01.pdb',   chains: ['B', 'C'], description: 'Anti-IL-6R Fab (1615 atoms, tocilizumab-like)' },
  { name: 'b7h6',     source: 'B7H6-Fab-01.pdb',   chains: ['A', 'B'], description: 'Anti-B7-H6 Fab (1624 atoms, NK cell checkpoint)' },
  { name: 'cd19',     source: 'CD19-Fab-01.pdb',   chains: ['B', 'C'], description: 'Anti-CD19 Fab (1651 atoms, different CDR-H3 length)' },
  { name: 'tigit',    source: 'TIGIT-Fab-01.pdb',  chains: ['B', 'C'], description: 'Anti-TIGIT Fab (1653 atoms, IgV domain binder)' },
  { name: 'gprc5d',   source: 'GPRC5D-Fab-01.pdb', chains: ['C', 'D'], description: 'Anti-GPRC5D Fab (1665 atoms, orphan GPCR binder)' },
  { name: 'rsvf',     source: 'RSVF-Fab-01.pdb',   chains: ['B', 'C'], description: 'Anti-RSV F Fab (1670 atoms, prefusion-specific)' }
];

// ─── 8 VHH structures to download from RCSB (real nanobody crystal structures) ───
// Each entry: { pdbId, name, vhhChains (auto-detected if empty), description }
const NEW_VHH_SOURCES = [
  { pdbId: '7XL1', name: 'nb-7d12',   description: 'Anti-EGFR nanobody 7D12 (Lama glama, 133 res, VHH-only structure)' },
  { pdbId: '1ZV5', name: 'cab-lys3',  description: 'cAb-Lys3 anti-lysozyme VHH (Camelus dromedarius, classic VHH)' },
  { pdbId: '2P46', name: 'cab-rn05',  description: 'cAb-RN05 anti-RNase A VHH (Camelus dromedarius, scaffold variant)' },
  { pdbId: '5M2M', name: 'nb-tnf3',   description: 'Anti-TNF VHH3 (Lama glama, picomolar bivalent candidate)' },
  { pdbId: '3K1K', name: 'nb-gfp',    description: 'Anti-GFP enhancer VHH (single-domain, long CDR3)' },
  { pdbId: '1QD0', name: 'cab-bcii',  description: 'cAb-BCII10 anti-beta-lactamase VHH (Camelus dromedarius)' },
  { pdbId: '5IM6', name: 'nb-her2',   description: 'Anti-HER2 VHH (Lama glama, receptor binder)' },
  { pdbId: '3P0G', name: 'nb80',      description: 'Nb80 anti-beta2 adrenergic receptor VHH (Llama)' }
];

// ─── PDB parsing helpers ───
function proteinLinesForChains(pdbText, chains) {
  const allowed = new Set(chains);
  return String(pdbText)
    .split(/\r?\n/)
    .filter(line => /^(?:ATOM  |HETATM|ANISOU|TER)/.test(line) && (!/^(?:ATOM  |HETATM|ANISOU)/.test(line) || allowed.has(line[21] || ' ')))
    .join('\n')
    .trimEnd() + '\nEND\n';
}

function normalizeSpaces(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function parseStructuredSection(text, prefix) {
  const lines = String(text)
    .split(/\r?\n/)
    .filter(line => line.startsWith(prefix))
    .map(line => normalizeSpaces(line.slice(10)));
  const entities = [];
  let current = null;
  let lastKey = '';
  const tokens = lines.join(' ').split(';').map(item => item.trim()).filter(Boolean);
  for (const token of tokens) {
    const idx = token.indexOf(':');
    if (idx >= 0) {
      const key = token.slice(0, idx).trim().toUpperCase();
      const value = token.slice(idx + 1).trim();
      lastKey = key;
      if (key === 'MOL_ID') {
        current = { molId: value };
        entities.push(current);
      } else if (current) {
        current[key] = value;
      }
    } else if (current && lastKey) {
      current[lastKey] = normalizeSpaces((current[lastKey] || '') + ' ' + token);
    }
  }
  return entities;
}

function parseCompoundEntities(pdbText) {
  const compound = parseStructuredSection(pdbText, 'COMPND');
  const source = parseStructuredSection(pdbText, 'SOURCE');
  const byMolId = new Map(compound.map(entry => [entry.molId, {
    molId: entry.molId,
    molecule: normalizeSpaces(entry.MOLECULE || ''),
    synonym: normalizeSpaces(entry.SYNONYM || ''),
    chains: String(entry.CHAIN || '').split(',').map(item => item.trim()).filter(Boolean),
    fragment: normalizeSpaces(entry.FRAGMENT || ''),
    gene: ''
  }]));
  for (const item of source) {
    const entity = byMolId.get(item.molId);
    if (!entity) continue;
    entity.gene = normalizeSpaces(item.GENE || entity.gene || '');
  }
  return [...byMolId.values()];
}

const ANTIBODY_KEYWORD_RE = /\b(?:antibody|autoantibody|immunoglobulin|fab|nanobody|vhh|scfv|single[- ]chain fv|megabody|vh[- ]domain|single[- ]domain)\b/i;

function entityLooksLikeVhh(entity) {
  const text = [entity.molecule, entity.synonym, entity.fragment, entity.gene].filter(Boolean).join(' ');
  if (!ANTIBODY_KEYWORD_RE.test(text)) return false;
  // Exclude false positives
  const falsePositiveRe = /\b(?:domain[- ]containing|receptor|mucin|cellular receptor)\b/i;
  if (falsePositiveRe.test(text) && !/\b(?:nanobody|vhh|single[- ]domain)\b/i.test(text)) {
    return false;
  }
  return true;
}

function countChainAtoms(pdbText, chains) {
  const allowed = new Set(chains);
  let atomCount = 0;
  const residues = new Set();
  for (const line of String(pdbText).split(/\r?\n/)) {
    if (!line.startsWith('ATOM  ')) continue;
    const chain = line[21] || ' ';
    if (!allowed.has(chain)) continue;
    atomCount++;
    const resSeq = line.slice(22, 27).trim();
    residues.add(chain + ':' + resSeq);
  }
  return { atomCount, residueCount: residues.size };
}

// ─── HTTP download helper ───
function httpRequest(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { accept: 'application/json,text/plain,*/*' }, timeout: 30000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        resolve(httpRequest(new URL(res.headers.location, url).toString()));
        return;
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const body = Buffer.concat(chunks);
        if (res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          return;
        }
        resolve(body);
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout for ' + url)); });
  });
}

async function downloadPdb(pdbId) {
  const url = `${RCSB_FILE_BASE}/${pdbId}.pdb`;
  console.log(`  Downloading ${pdbId} from RCSB...`);
  try {
    const body = await httpRequest(url);
    const text = body.toString('utf8');
    if (text.length < 100 || !text.includes('ATOM')) {
      throw new Error('Downloaded file does not contain ATOM records');
    }
    console.log(`  ✓ Downloaded ${pdbId} (${text.length} bytes)`);
    return text;
  } catch (err) {
    console.error(`  ✗ Failed to download ${pdbId}: ${err.message}`);
    return null;
  }
}

function identifyVhhChains(pdbText) {
  const entities = parseCompoundEntities(pdbText);
  const vhhEntities = entities.filter(entityLooksLikeVhh);
  if (!vhhEntities.length) return [];
  // Collect all chains from VHH entities, prefer shorter chain IDs first
  const chains = vhhEntities.flatMap(e => e.chains);
  // For VHH, we want exactly 1 chain. Pick the first one.
  return chains.slice(0, 1);
}

// ─── Scaffold file creation ───
function createFabScaffoldFile(scaffold) {
  const sourcePath = path.join(PDB_DIR, scaffold.source);
  if (!fs.existsSync(sourcePath)) {
    console.error(`  ✗ Source file not found: ${scaffold.source}`);
    return null;
  }
  const sourceText = fs.readFileSync(sourcePath, 'utf8');
  const scaffoldPdbText = proteinLinesForChains(sourceText, scaffold.chains);
  const stats = countChainAtoms(sourceText, scaffold.chains);
  if (stats.atomCount < 800) {
    console.error(`  ✗ ${scaffold.source}: too few atoms (${stats.atomCount}) for chains ${scaffold.chains.join(',')}`);
    return null;
  }
  const scaffoldFileName = `SCAFFOLD-Fab-${scaffold.name}.pdb`;
  const scaffoldPath = path.join(SCAFFOLD_DIR, scaffoldFileName);
  const header = [
    'HEADER    ZOONOAB ANTIBODY SCAFFOLD',
    `REMARK 900 SCAFFOLD: ${scaffold.name} Fab`,
    `REMARK 901 SOURCE: ${scaffold.source} chains ${scaffold.chains.join(',')}`,
    `REMARK 902 DESCRIPTION: ${scaffold.description}`,
    `REMARK 903 ATOMS: ${stats.atomCount} RESIDUES: ${stats.residueCount}`,
    'REMARK 904 STATIC SCAFFOLD FOR DISPLAY POSE GENERATION',
    'REMARK 905 EXTRACTED FROM ORIGINAL EXPERIMENTAL STRUCTURE',
    'MODEL        1'
  ].join('\n') + '\n';
  const body = scaffoldPdbText.replace(/^MODEL.*\n/, '').replace(/^END\n/, '');
  fs.writeFileSync(scaffoldPath, header + body);
  console.log(`  ✓ ${scaffoldFileName} ← ${scaffold.source} (chains ${scaffold.chains.join(',')}, ${stats.atomCount} atoms, ${stats.residueCount} res)`);
  return { ...scaffold, file: scaffoldFileName, atoms: stats.atomCount, residues: stats.residueCount };
}

function createVhhScaffoldFile(scaffold, pdbText) {
  const vhhChains = scaffold.vhhChains && scaffold.vhhChains.length
    ? scaffold.vhhChains
    : identifyVhhChains(pdbText);
  if (!vhhChains.length) {
    console.error(`  ✗ ${scaffold.pdbId}: no VHH chains identified`);
    return null;
  }
  const scaffoldPdbText = proteinLinesForChains(pdbText, vhhChains);
  const stats = countChainAtoms(pdbText, vhhChains);
  if (stats.atomCount < 500) {
    console.error(`  ✗ ${scaffold.pdbId}: VHH chain ${vhhChains.join(',')} has too few atoms (${stats.atomCount})`);
    return null;
  }
  const scaffoldFileName = `SCAFFOLD-VHH-${scaffold.name}.pdb`;
  const scaffoldPath = path.join(SCAFFOLD_DIR, scaffoldFileName);
  const header = [
    'HEADER    ZOONOAB ANTIBODY SCAFFOLD',
    `REMARK 900 SCAFFOLD: ${scaffold.name} VHH`,
    `REMARK 901 SOURCE: RCSB ${scaffold.pdbId} chains ${vhhChains.join(',')}`,
    `REMARK 902 DESCRIPTION: ${scaffold.description}`,
    `REMARK 903 ATOMS: ${stats.atomCount} RESIDUES: ${stats.residueCount}`,
    'REMARK 904 STATIC SCAFFOLD FOR DISPLAY POSE GENERATION',
    `REMARK 905 DOWNLOADED FROM RCSB PDB ${scaffold.pdbId}`,
    'MODEL        1'
  ].join('\n') + '\n';
  const body = scaffoldPdbText.replace(/^MODEL.*\n/, '').replace(/^END\n/, '');
  fs.writeFileSync(scaffoldPath, header + body);
  console.log(`  ✓ ${scaffoldFileName} ← RCSB ${scaffold.pdbId} (chains ${vhhChains.join(',')}, ${stats.atomCount} atoms, ${stats.residueCount} res)`);
  return { ...scaffold, file: scaffoldFileName, chains: vhhChains, atoms: stats.atomCount, residues: stats.residueCount };
}

// ─── Main ───
async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║  Expand Antibody Scaffold Library                           ║');
  console.log('║  14 new Fab scaffolds + 8 new VHH scaffolds from RCSB       ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');

  if (!fs.existsSync(SCAFFOLD_DIR)) {
    fs.mkdirSync(SCAFFOLD_DIR, { recursive: true });
  }

  // Step 1: Create Fab scaffolds from existing original PDB files
  console.log('\n=== Step 1: Extracting 14 new Fab scaffolds from existing structures ===');
  const fabResults = [];
  for (const scaffold of NEW_FAB_SCAFFOLDS) {
    const result = createFabScaffoldFile(scaffold);
    if (result) fabResults.push(result);
  }
  console.log(`\n  Fab scaffolds created: ${fabResults.length}/${NEW_FAB_SCAFFOLDS.length}`);

  // Step 2: Download and create VHH scaffolds from RCSB
  console.log('\n=== Step 2: Downloading 8 VHH structures from RCSB ===');
  const vhhResults = [];
  for (const scaffold of NEW_VHH_SOURCES) {
    const pdbText = await downloadPdb(scaffold.pdbId);
    if (!pdbText) continue;
    const result = createVhhScaffoldFile(scaffold, pdbText);
    if (result) vhhResults.push(result);
  }
  console.log(`\n  VHH scaffolds created: ${vhhResults.length}/${NEW_VHH_SOURCES.length}`);

  // Step 3: List all scaffolds now in the directory
  console.log('\n=== Step 3: Final scaffold inventory ===');
  const allScaffolds = fs.readdirSync(SCAFFOLD_DIR).filter(f => f.endsWith('.pdb')).sort();
  const fabScaffolds = allScaffolds.filter(f => f.startsWith('SCAFFOLD-Fab-'));
  const vhhScaffolds = allScaffolds.filter(f => f.startsWith('SCAFFOLD-VHH-'));
  console.log(`  Fab scaffolds: ${fabScaffolds.length}`);
  for (const f of fabScaffolds) console.log(`    ${f}`);
  console.log(`  VHH scaffolds: ${vhhScaffolds.length}`);
  for (const f of vhhScaffolds) console.log(`    ${f}`);
  console.log(`  Total: ${allScaffolds.length}`);

  // Step 4: Write manifest
  const manifest = {
    generatedAt: new Date().toISOString(),
    description: 'Expanded antibody scaffold library with diverse Fab and VHH structures',
    newFabScaffolds: fabResults.map(s => ({
      name: s.name, file: s.file, source: s.source, chains: s.chains,
      description: s.description, atoms: s.atoms, residues: s.residues
    })),
    newVhhScaffolds: vhhResults.map(s => ({
      name: s.name, file: s.file, pdbId: s.pdbId, chains: s.chains,
      description: s.description, atoms: s.atoms, residues: s.residues
    })),
    summary: {
      newFabCount: fabResults.length,
      newVhhCount: vhhResults.length,
      totalNewScaffolds: fabResults.length + vhhResults.length,
      totalFabScaffolds: fabScaffolds.length,
      totalVhhScaffolds: vhhScaffolds.length,
      totalScaffolds: allScaffolds.length
    }
  };
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`\n✓ Manifest written to ${path.basename(MANIFEST_PATH)}`);
  console.log(`\n=== Done ===`);
  console.log(`  Total scaffolds: ${allScaffolds.length} (was 10, now ${allScaffolds.length})`);
  console.log(`  Fab: ${fabScaffolds.length} (was 8)`);
  console.log(`  VHH: ${vhhScaffolds.length} (was 2)`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
