'use strict';

/**
 * Expand the molecular model library with 35 gap disease targets.
 *
 * This script:
 * 1. Creates 32 diverse antibody scaffold files (22 Fab + 10 VHH) from route preset PDBs and RCSB
 * 2. Downloads 35 gap antigen PDB files from RCSB
 * 3. Generates 5 display poses per target using deterministic scaffold assignment
 * 4. Writes a manifest documenting all generated files
 *
 * Usage: node scripts/expand_model_library.js
 */

const fs = require('fs');
const https = require('https');
const path = require('path');
const crypto = require('crypto');
const {
  generateDisplayPose,
  parsePdbRecords
} = require('../lib/display-pose');

const ROOT = path.resolve(__dirname, '..');
const PDB_DIR = path.join(ROOT, 'pdb');
const SWEEP_DIR = path.join(PDB_DIR, 'antigen-only-sweep');
const SCAFFOLD_DIR = path.join(PDB_DIR, 'scaffolds');
const MANIFEST_PATH = path.join(PDB_DIR, 'expanded-model-library-manifest.json');
const RCSB_FILE_BASE = 'https://files.rcsb.org/download';

// ─── 32 diverse antibody scaffolds (22 Fab + 10 VHH) ───
// Fab scaffolds ordered by atom count for diverse CDR architectures
const SCAFFOLDS = [
  // ── Original 8 Fab scaffolds (extracted from route preset PDBs) ──
  { name: 'trastuzumab',  source: 'HER2-Fab-01.pdb',  chains: ['B', 'C'], format: 'Fab', description: 'Trastuzumab Fab (VH3-23, short CDR-H3)' },
  { name: 'cetuximab',    source: 'EGFR-Fab-01.pdb',  chains: ['B', 'C'], format: 'Fab', description: 'Cetuximab Fab (chimeric, different germline)' },
  { name: 'bevacizumab',  source: 'VEGFA-Fab-01.pdb', chains: ['B', 'C'], format: 'Fab', description: 'Bevacizumab Fab (Kabat I, different VH family)' },
  { name: 'certolizumab', source: 'TNF-Fab-01.pdb',   chains: ['B', 'C'], format: 'Fab', description: 'Certolizumab Fab (humanized Fab)' },
  { name: 'nivolumab',    source: 'PD1-Fab-01.pdb',    chains: ['B', 'C'], format: 'Fab', description: 'Nivolumab Fab (human IgG4)' },
  { name: 'ipilimumab',   source: 'CTLA4-Fab-01.pdb', chains: ['B', 'C'], format: 'Fab', description: 'Ipilimumab Fab (human IgG1)' },
  { name: 'daratumumab',  source: 'CD38-Fab-01.pdb',  chains: ['B', 'C'], format: 'Fab', description: 'Daratumumab Fab (human IgG1)' },
  { name: 'tozorakimab',  source: 'IL33-Fab-01.pdb',  chains: ['B', 'C'], format: 'Fab', description: 'Tozorakimab Fab (humanized)' },
  // ── 14 new Fab scaffolds (diverse atom counts / CDR architectures) ──
  { name: 'fluha',        source: 'FluHA-Fab-01.pdb',  chains: ['B', 'C'], format: 'Fab', description: 'Anti-influenza HA Fab (1498 atoms, distinct CDR architecture)' },
  { name: 'bcma',         source: 'BCMA-Fab-01.pdb',   chains: ['B', 'C'], format: 'Fab', description: 'Anti-BCMA Fab (1539 atoms, compact framework)' },
  { name: 'il13',         source: 'IL13-Fab-01.pdb',   chains: ['H', 'L'], format: 'Fab', description: 'Anti-IL-13 Fab (1544 atoms, different VH family)' },
  { name: 'fcrn',         source: 'FCRN-Fab-01.pdb',   chains: ['H', 'L'], format: 'Fab', description: 'Anti-FcRn Fab (1550 atoms, long CDR-L1)' },
  { name: 'gipr',         source: 'GIPR-Fab-01.pdb',   chains: ['B', 'C'], format: 'Fab', description: 'Anti-GIPR Fab (1566 atoms, class GPCR binder)' },
  { name: 'her3',         source: 'HER3-Fab-01.pdb',   chains: ['B', 'C'], format: 'Fab', description: 'Anti-HER3 Fab (1571 atoms, EGFR family)' },
  { name: 'cd47',         source: 'CD47-Fab-01.pdb',   chains: ['B', 'C'], format: 'Fab', description: 'Anti-CD47 Fab (1581 atoms, macrophage checkpoint)' },
  { name: 'cgrpr',        source: 'CGRPR-Fab-01.pdb',  chains: ['B', 'C'], format: 'Fab', description: 'Anti-CGRP receptor Fab (1592 atoms, distinct germline)' },
  { name: 'il6r',         source: 'IL6R-Fab-01.pdb',   chains: ['B', 'C'], format: 'Fab', description: 'Anti-IL-6R Fab (1615 atoms, tocilizumab-like)' },
  { name: 'b7h6',         source: 'B7H6-Fab-01.pdb',   chains: ['A', 'B'], format: 'Fab', description: 'Anti-B7-H6 Fab (1624 atoms, NK cell checkpoint)' },
  { name: 'cd19',         source: 'CD19-Fab-01.pdb',   chains: ['B', 'C'], format: 'Fab', description: 'Anti-CD19 Fab (1651 atoms, different CDR-H3 length)' },
  { name: 'tigit',        source: 'TIGIT-Fab-01.pdb',  chains: ['B', 'C'], format: 'Fab', description: 'Anti-TIGIT Fab (1653 atoms, IgV domain binder)' },
  { name: 'gprc5d',       source: 'GPRC5D-Fab-01.pdb', chains: ['C', 'D'], format: 'Fab', description: 'Anti-GPRC5D Fab (1665 atoms, orphan GPCR binder)' },
  { name: 'rsvf',         source: 'RSVF-Fab-01.pdb',   chains: ['B', 'C'], format: 'Fab', description: 'Anti-RSV F Fab (1670 atoms, prefusion-specific)' },
  // ── Original 2 VHH scaffolds ──
  { name: 'IL33',         source: 'IL33-VHH-01.pdb',  chains: ['B'],      format: 'VHH', description: 'Anti-IL-33 VHH (single-domain)' },
  { name: 'TSLP',         source: 'TSLP-VHH-01.pdb',  chains: ['B'],      format: 'VHH', description: 'Anti-TSLP VHH (different CDR architecture)' },
  // ── 6 new VHH scaffolds (real nanobody crystal structures from RCSB) ──
  { name: 'nb-7d12',      prebuilt: true, chains: ['A'], format: 'VHH', description: 'Anti-EGFR nanobody 7D12 (Lama glama, 133 res, VHH-only structure)' },
  { name: 'cab-lys3',     prebuilt: true, chains: ['A'], format: 'VHH', description: 'cAb-Lys3 anti-lysozyme VHH (Camelus dromedarius, classic VHH)' },
  { name: 'cab-rn05',     prebuilt: true, chains: ['B'], format: 'VHH', description: 'cAb-RN05 anti-RNase A VHH (Camelus dromedarius, scaffold variant)' },
  { name: 'nb-tnf3',      prebuilt: true, chains: ['D'], format: 'VHH', description: 'Anti-TNF VHH3 (Lama glama, picomolar bivalent candidate)' },
  { name: 'cab-bcii',     prebuilt: true, chains: ['A'], format: 'VHH', description: 'cAb-BCII10 anti-beta-lactamase VHH (Camelus dromedarius)' },
  { name: 'nb80',         prebuilt: true, chains: ['B'], format: 'VHH', description: 'Nb80 anti-beta2 adrenergic receptor VHH (Llama)' },
  // ── 2 additional VHH scaffolds (real nanobody crystal structures from RCSB) ──
  { name: 'mu551',        prebuilt: true, chains: ['B'], format: 'VHH', description: 'MU551 anti-CD38 nanobody (Lama glama, 163 res, therapeutic MM target)' },
  { name: 'clec4f',       prebuilt: true, chains: ['A'], format: 'VHH', description: 'Clec4f Nanobody 246 (VHH-only structure, 131 res, monomer)' }
];

// ─── 35 gap disease targets with RCSB PDB IDs ───
const GAP_TARGETS = [
  // Tumor targets (21)
  { routeId: 'cancer_dll3',     target: 'DLL3',       gene: 'DLL3',       disease: '小细胞肺癌',         pdbId: '6H9Y', aliasPrefix: 'DLL3-Fab',       organism: 'Homo sapiens', taxId: 9606 },
  { routeId: 'cancer_folr1',    target: 'FOLR1',      gene: 'FOLR1',      disease: '卵巢癌',             pdbId: '4LRH', aliasPrefix: 'FOLR1-Fab',      organism: 'Homo sapiens', taxId: 9606 },
  { routeId: 'cancer_ror1',     target: 'ROR1',       gene: 'ROR1',       disease: 'CLL/乳腺癌',         pdbId: '6A5F', aliasPrefix: 'ROR1-Fab',       organism: 'Homo sapiens', taxId: 9606 },
  { routeId: 'cancer_cd30',     target: 'CD30',       gene: 'TNFRSF8',    disease: '霍奇金淋巴瘤',       pdbId: '5XBN', aliasPrefix: 'CD30-VHH',       organism: 'Homo sapiens', taxId: 9606 },
  { routeId: 'cancer_flt3',     target: 'FLT3',       gene: 'FLT3',       disease: 'AML',                pdbId: '1RJQ', aliasPrefix: 'FLT3-Fab',       organism: 'Homo sapiens', taxId: 9606 },
  { routeId: 'cancer_cd70',    target: 'CD70',       gene: 'CD70',       disease: '肾细胞癌',           pdbId: '4F77', aliasPrefix: 'CD70-Fab',       organism: 'Homo sapiens', taxId: 9606 },
  { routeId: 'cancer_ptk7',     target: 'PTK7',       gene: 'PTK7',       disease: '结直肠癌',           pdbId: '6AY3', aliasPrefix: 'PTK7-Fab',       organism: 'Homo sapiens', taxId: 9606 },
  { routeId: 'cancer_psma',    target: 'PSMA',        gene: 'FOLH1',      disease: '前列腺癌',           pdbId: '2X6G', aliasPrefix: 'PSMA-Fab',       organism: 'Homo sapiens', taxId: 9606 },
  { routeId: 'cancer_cd74',     target: 'CD74',       gene: 'CD74',       disease: 'B细胞淋巴瘤',       pdbId: '2WRH', aliasPrefix: 'CD74-Fab',       organism: 'Homo sapiens', taxId: 9606 },
  { routeId: 'cancer_tim3',     target: 'TIM-3',      gene: 'HAVCR2',     disease: 'T细胞耗竭',          pdbId: '5F71', aliasPrefix: 'TIM3-Fab',       organism: 'Homo sapiens', taxId: 9606 },
  { routeId: 'cancer_gitr',     target: 'GITR',       gene: 'TNFRSF18',   disease: 'T细胞激活',          pdbId: '5WHD', aliasPrefix: 'GITR-Fab',       organism: 'Homo sapiens', taxId: 9606 },
  { routeId: 'cancer_ox40',     target: 'OX40',       gene: 'TNFRSF4',    disease: 'T细胞共刺激',        pdbId: '5I8J', aliasPrefix: 'OX40-VHH',       organism: 'Homo sapiens', taxId: 9606 },
  { routeId: 'cancer_41bb',     target: '4-1BB',      gene: 'TNFRSF9',    disease: 'T细胞共刺激',        pdbId: '4ZGP', aliasPrefix: '41BB-Fab',       organism: 'Homo sapiens', taxId: 9606 },
  { routeId: 'cancer_cd40',    target: 'CD40',       gene: 'TNFRSF5',    disease: '免疫激活',           pdbId: '5L01', aliasPrefix: 'CD40-Fab',       organism: 'Homo sapiens', taxId: 9606 },
  { routeId: 'cancer_cd27',     target: 'CD27',       gene: 'TNFRSF7',    disease: 'T细胞共刺激',        pdbId: '5NLE', aliasPrefix: 'CD27-Fab',       organism: 'Homo sapiens', taxId: 9606 },
  { routeId: 'cancer_dr5',      target: 'DR5',        gene: 'TNFRSF10B',  disease: '凋亡诱导',           pdbId: '5C85', aliasPrefix: 'DR5-VHH',        organism: 'Homo sapiens', taxId: 9606 },
  { routeId: 'cancer_cldn6',    target: 'CLDN6',      gene: 'CLDN6',      disease: '卵巢/睾丸癌',        pdbId: '6XG7', aliasPrefix: 'CLDN6-Fab',      organism: 'Homo sapiens', taxId: 9606 },
  { routeId: 'cancer_cdh6',     target: 'CDH6',       gene: 'CDH6',       disease: '卵巢/肾癌',           pdbId: '5C4H', aliasPrefix: 'CDH6-VHH',       organism: 'Homo sapiens', taxId: 9606 },
  { routeId: 'cancer_prlr',     target: 'PRLR',       gene: 'PRLR',       disease: '乳腺/前列腺癌',      pdbId: '3D48', aliasPrefix: 'PRLR-Fab',       organism: 'Homo sapiens', taxId: 9606 },
  { routeId: 'cancer_sstr2',    target: 'SSTR2',      gene: 'SSTR2',      disease: 'NET/GIST',           pdbId: '6WB4', aliasPrefix: 'SSTR2-Fab',      organism: 'Homo sapiens', taxId: 9606 },
  { routeId: 'cancer_gucy2c',   target: 'GUCY2C',     gene: 'GUCY2C',     disease: '结直肠癌',           pdbId: '6B25', aliasPrefix: 'GUCY2C-VHH',     organism: 'Homo sapiens', taxId: 9606 },
  // Inflammation/autoimmune (5)
  { routeId: 'inflam_il31',     target: 'IL-31',      gene: 'IL31',       disease: '特应性皮炎',         pdbId: '5N0Y', aliasPrefix: 'IL31-Fab',       organism: 'Homo sapiens', taxId: 9606 },
  { routeId: 'inflam_il17ra',  target: 'IL-17RA',     gene: 'IL17RA',     disease: '银屑病',              pdbId: '6I1K', aliasPrefix: 'IL17RA-Fab',     organism: 'Homo sapiens', taxId: 9606 },
  { routeId: 'inflam_gmcsf',    target: 'GM-CSF',     gene: 'CSF2',       disease: '类风湿关节炎',       pdbId: '4RSK', aliasPrefix: 'GMCSF-VHH',      organism: 'Homo sapiens', taxId: 9606 },
  { routeId: 'inflam_il36a',    target: 'IL-36α',     gene: 'IL36A',      disease: '银屑病',              pdbId: '4I6B', aliasPrefix: 'IL36A-Fab',      organism: 'Homo sapiens', taxId: 9606 },
  { routeId: 'inflam_baffr',   target: 'BAFF-R',     gene: 'TNFRSF13C',  disease: 'SLE',                pdbId: '6E0M', aliasPrefix: 'BAFFR-Fab',     organism: 'Homo sapiens', taxId: 9606 },
  // Metabolic (3)
  { routeId: 'metab_glp1r',     target: 'GLP-1R',     gene: 'GLP1R',      disease: '2型糖尿病',          pdbId: '5NX2', aliasPrefix: 'GLP1R-Fab',      organism: 'Homo sapiens', taxId: 9606 },
  { routeId: 'metab_fgf21',     target: 'FGF21',      gene: 'FGF21',      disease: 'NASH',               pdbId: '6M6E', aliasPrefix: 'FGF21-VHH',      organism: 'Homo sapiens', taxId: 9606 },
  { routeId: 'metab_lgr5',      target: 'LGR5',       gene: 'LGR5',       disease: '肝细胞癌',           pdbId: '4BSF', aliasPrefix: 'LGR5-Fab',       organism: 'Homo sapiens', taxId: 9606 },
  // Neurodegenerative (2)
  { routeId: 'neuro_bace1',     target: 'BACE1',      gene: 'BACE1',      disease: '阿尔茨海默病',       pdbId: '1FKN', aliasPrefix: 'BACE1-Fab',      organism: 'Homo sapiens', taxId: 9606 },
  { routeId: 'neuro_lepr',      target: 'Leptin receptor', gene: 'LEPR',   disease: '肥胖症',              pdbId: '6V76', aliasPrefix: 'LEPR-Fab',       organism: 'Homo sapiens', taxId: 9606 },
  // Infectious (4)
  { routeId: 'infect_dengue',   target: 'Dengue E',   gene: 'DENV-E',     disease: '登革热',              pdbId: '1OAN', aliasPrefix: 'DENGUE-E-Fab',   organism: 'Dengue virus', taxId: 11051 },
  { routeId: 'infect_zika',     target: 'Zika NS1',    gene: 'ZIKV-NS1',   disease: '寨卡',                pdbId: '5GS6', aliasPrefix: 'ZIKA-NS1-Fab',   organism: 'Zika virus',  taxId: 1983736 },
  { routeId: 'infect_rabies',   target: 'Rabies G',    gene: 'RABV-G',     disease: '狂犬病',              pdbId: '6W8J', aliasPrefix: 'RABIES-G-Fab',   organism: 'Rabies virus', taxId: 11292 },
  { routeId: 'infect_cmv',      target: 'CMV gB',      gene: 'HCMV-UL55',  disease: 'CMV感染',             pdbId: '5ZB3', aliasPrefix: 'CMV-GB-Fab',     organism: 'Human cytomegalovirus', taxId: 10359 }
];

const POSES_PER_TARGET = 5;
const ANTIBODY_KEYWORD_RE = /\b(?:antibody|autoantibody|immunoglobulin|fab|nanobody|vhh|scfv|single[- ]chain fv|megabody|vh[- ]domain)\b/i;

// ─── HTTP download helper ───
function httpRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { accept: 'application/json,text/plain,*/*' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        resolve(httpRequest(new URL(res.headers.location, url).toString()));
        return;
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const body = Buffer.concat(chunks);
        if (res.statusCode >= 400) {
          reject(new Error(res.statusCode + ' ' + url + ' ' + body.toString('utf8').slice(0, 200)));
          return;
        }
        resolve(body);
      });
    }).on('error', reject);
  });
}

async function downloadPdb(pdbId, outputPath) {
  const url = `${RCSB_FILE_BASE}/${pdbId}.pdb`;
  console.log(`  Downloading ${pdbId} from RCSB...`);
  try {
    const body = await httpRequest(url);
    const text = body.toString('utf8');
    if (text.length < 100 || !text.includes('ATOM')) {
      throw new Error('Downloaded file does not contain ATOM records');
    }
    fs.writeFileSync(outputPath, text);
    console.log(`  ✓ Saved ${pdbId} → ${path.basename(outputPath)} (${text.length} bytes)`);
    return text;
  } catch (err) {
    console.error(`  ✗ Failed to download ${pdbId}: ${err.message}`);
    return null;
  }
}

// ─── PDB parsing helpers (reused from build_antigen_display_pose_library.js) ───
function normalizeSpaces(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function normalizeToken(value) {
  return String(value || '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

function proteinLinesForChains(pdbText, chains) {
  const allowed = new Set(chains);
  return String(pdbText)
    .split(/\r?\n/)
    .filter(line => /^(?:ATOM  |HETATM|ANISOU|TER)/.test(line) && (!/^(?:ATOM  |HETATM|ANISOU)/.test(line) || allowed.has(line[21] || ' ')))
    .join('\n')
    .trimEnd() + '\nEND\n';
}

function allCoordinateChains(pdbText) {
  const chains = new Set();
  for (const line of String(pdbText).split(/\r?\n/)) {
    if (line.startsWith('ATOM  ') || line.startsWith('HETATM')) chains.add(line[21] || ' ');
  }
  return [...chains];
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

function entityLooksAntibody(entity) {
  const text = [entity.molecule, entity.synonym, entity.fragment, entity.gene].filter(Boolean).join(' ');
  if (!ANTIBODY_KEYWORD_RE.test(text)) return false;
  // Exclude false positives where "immunoglobulin" appears as part of a domain name
  // (e.g., "T-cell immunoglobulin and mucin domain-containing protein 3" = TIM-3 antigen)
  const falsePositiveRe = /\b(?:domain[- ]containing|receptor|mucin|cellular receptor)\b/i;
  if (falsePositiveRe.test(text) && !/\b(?:fab|nanobody|vhh|scfv|single[- ]chain fv|megabody)\b/i.test(text)) {
    return false;
  }
  return true;
}

function entityMatchesTarget(entity, terms) {
  const haystack = [entity.molecule, entity.synonym, entity.fragment, entity.gene]
    .map(normalizeToken).filter(Boolean);
  if (!haystack.length) return false;
  for (const term of terms) {
    const normalized = normalizeToken(term);
    if (!normalized) continue;
    if (haystack.includes(normalized)) return true;
    if (normalized.length >= 3 && haystack.some(value => value.includes(normalized) || normalized.includes(value))) return true;
  }
  return false;
}

function sanitizeLabel(value, fallback = 'Target') {
  const cleaned = String(value || '')
    .replace(/[/+(),]/g, ' ')
    .replace(/[^A-Za-z0-9._ -]+/g, ' ')
    .trim()
    .replace(/\s+/g, '-');
  return cleaned || fallback;
}

function chainResidueStats(records) {
  const stats = new Map();
  for (const record of records) {
    const chain = record.chain;
    if (!stats.has(chain)) {
      stats.set(chain, { chain, heavyAtoms: 0, residues: new Set() });
    }
    const item = stats.get(chain);
    if (record.isHeavy) item.heavyAtoms += 1;
    item.residues.add(record.residueKey);
  }
  return new Map([...stats.entries()].map(([chain, value]) => [chain, {
    chain, heavyAtoms: value.heavyAtoms, residueCount: value.residues.size
  }]));
}

function chooseGeneratedFormat(chainStats, antigenChains) {
  const totalHeavyAtoms = antigenChains.reduce((sum, chain) => sum + ((chainStats.get(chain) && chainStats.get(chain).heavyAtoms) || 0), 0);
  const totalResidues = antigenChains.reduce((sum, chain) => sum + ((chainStats.get(chain) && chainStats.get(chain).residueCount) || 0), 0);
  if (antigenChains.length <= 2 && totalHeavyAtoms <= 2200 && totalResidues <= 280) return 'VHH';
  return 'Fab';
}

// ─── Deterministic scaffold assignment with rotation ───
// Rotation offset ensures consecutive batch calls select different scaffolds,
// preventing repetitive antibody structures across targets.
let _scaffoldRotationOffset = 0;

function hashScaffoldIndex(target, scaffoldCount) {
  const hash = crypto.createHash('sha256').update(target).digest();
  const num = hash.readUInt32BE(0);
  return num % scaffoldCount;
}

function selectScaffoldsForTarget(target, format, count) {
  const matchingScaffolds = SCAFFOLDS.filter(s => s.format === format);
  if (matchingScaffolds.length === 0) return [];
  const baseIdx = hashScaffoldIndex(target, matchingScaffolds.length);
  // Apply rotation offset so consecutive targets/calls get different scaffolds.
  // Step by count to ensure consecutive calls for the same target have minimal overlap.
  const startIdx = (baseIdx + _scaffoldRotationOffset) % matchingScaffolds.length;
  _scaffoldRotationOffset = (_scaffoldRotationOffset + count) % matchingScaffolds.length;
  const selected = [];
  for (let i = 0; i < count && i < matchingScaffolds.length; i++) {
    selected.push(matchingScaffolds[(startIdx + i) % matchingScaffolds.length]);
  }
  return selected;
}

// ─── Scaffold creation ───
function createScaffoldFiles() {
  console.log(`\n=== Step 1: Creating ${SCAFFOLDS.length} diverse antibody scaffold files ===`);
  if (!fs.existsSync(SCAFFOLD_DIR)) {
    fs.mkdirSync(SCAFFOLD_DIR, { recursive: true });
  }
  const created = [];
  for (const scaffold of SCAFFOLDS) {
    const scaffoldFileName = `SCAFFOLD-${scaffold.format}-${scaffold.name}.pdb`;
    const scaffoldPath = path.join(SCAFFOLD_DIR, scaffoldFileName);
    // Prebuilt scaffolds (e.g. RCSB-downloaded VHH) already exist in scaffolds/
    if (scaffold.prebuilt) {
      if (fs.existsSync(scaffoldPath)) {
        console.log(`  ✓ ${scaffoldFileName} (prebuilt, already exists)`);
        created.push({ ...scaffold, file: scaffoldFileName });
      } else {
        console.error(`  ✗ Prebuilt scaffold file not found: ${scaffoldFileName}`);
      }
      continue;
    }
    const sourcePath = path.join(PDB_DIR, scaffold.source);
    if (!fs.existsSync(sourcePath)) {
      console.error(`  ✗ Source file not found: ${scaffold.source}`);
      continue;
    }
    const sourceText = fs.readFileSync(sourcePath, 'utf8');
    const scaffoldPdbText = proteinLinesForChains(sourceText, scaffold.chains);
    const header = [
      'HEADER    ZOONOAB ANTIBODY SCAFFOLD',
      `REMARK 900 SCAFFOLD: ${scaffold.name} ${scaffold.format}`,
      `REMARK 901 SOURCE: ${scaffold.source} chains ${scaffold.chains.join(',')}`,
      `REMARK 902 DESCRIPTION: ${scaffold.description}`,
      'REMARK 903 STATIC SCAFFOLD FOR DISPLAY POSE GENERATION',
      'MODEL        1'
    ].join('\n') + '\n';
    const body = scaffoldPdbText.replace(/^MODEL.*\n/, '').replace(/^END\n/, '');
    fs.writeFileSync(scaffoldPath, header + body);
    console.log(`  ✓ ${scaffoldFileName} ← ${scaffold.source} (chains ${scaffold.chains.join(',')})`);
    created.push({ ...scaffold, file: scaffoldFileName });
  }
  return created;
}

// ─── Antigen download ───
async function downloadGapAntigens() {
  console.log('\n=== Step 2: Downloading 35 gap antigen PDB files from RCSB ===');
  if (!fs.existsSync(SWEEP_DIR)) {
    fs.mkdirSync(SWEEP_DIR, { recursive: true });
  }
  const downloaded = [];
  const skipped = [];
  for (const target of GAP_TARGETS) {
    const outputPath = path.join(SWEEP_DIR, `${target.pdbId}.pdb`);
    if (fs.existsSync(outputPath)) {
      console.log(`  ⊙ Skip ${target.pdbId} (${target.target}) — already exists`);
      skipped.push(target);
      continue;
    }
    const text = await downloadPdb(target.pdbId, outputPath);
    if (text) {
      downloaded.push(target);
    }
  }
  console.log(`\n  Summary: ${downloaded.length} downloaded, ${skipped.length} skipped`);
  return { downloaded, skipped };
}

// ─── Display pose generation ───
function generatePoseForTarget(target, scaffold, antigenPdbText, antigenChains, chainStats) {
  const format = scaffold.format;
  const scaffoldPath = path.join(SCAFFOLD_DIR, `SCAFFOLD-${format}-${scaffold.name}.pdb`);
  if (!fs.existsSync(scaffoldPath)) {
    throw new Error(`Scaffold file not found: ${scaffoldPath}`);
  }
  const scaffoldPdbText = proteinLinesForChains(
    fs.readFileSync(scaffoldPath, 'utf8'),
    scaffold.chains
  );
  const antigenOnlyText = proteinLinesForChains(antigenPdbText, antigenChains);
  const pose = generateDisplayPose({
    antigenPdbText: antigenOnlyText,
    antigenChains,
    antibodyFormat: format,
    scaffoldPdbText,
    scaffoldAntibodyChains: scaffold.chains,
    seed: `expand-${target.target}-${scaffold.name}`,
    candidateIndex: 1,
    sourceMetadata: {
      target: target.target,
      antigenSource: `${target.pdbId} antigen chains ${antigenChains.join(',')}`,
      scaffoldSource: `SCAFFOLD-${format}-${scaffold.name} chains ${scaffold.chains.join(',')}`
    }
  });
  if (!pose.ok) {
    throw new Error(`Pose generation failed: ${JSON.stringify(pose.error)}`);
  }
  return pose;
}

function validateGeometry(pose, format) {
  const g = pose.pose.geometry;
  if (g.minDistance > 5.0) return { valid: false, reason: `minDistance ${g.minDistance} > 5.0` };
  const minContacts = format === 'VHH' ? 6 : 8;
  if (g.contactPairs4_5A < minContacts) return { valid: false, reason: `contactPairs ${g.contactPairs4_5A} < ${minContacts}` };
  if (g.hardClashesBelow2A > 0) return { valid: false, reason: `${g.hardClashesBelow2A} hard clashes` };
  return { valid: true };
}

function writeRoutePresetPdb(target, scaffold, pose, candidateIndex) {
  const format = scaffold.format;
  const aliasPrefix = target.aliasPrefix;
  const fileName = `${aliasPrefix}-${String(candidateIndex).padStart(2, '0')}.pdb`;
  const outputPath = path.join(PDB_DIR, fileName);
  const remarks = [
    'HEADER    ZOONOAB ROUTE PRESET ' + aliasPrefix,
    `REMARK 900 STATIC ROUTE PRESET: ${target.routeId}`,
    `REMARK 900 CANDIDATE INDEX: ${String(candidateIndex).padStart(2, '0')}`,
    `REMARK 901 TARGET: ${target.target}`,
    `REMARK 902 FORMAT: ${format}`,
    `REMARK 903 STRUCTURAL BASIS: RCSB ${target.pdbId} ${target.target} + ${scaffold.name} ${format} display scaffold`,
    `REMARK 904 ANTIGEN CHAINS: ${pose.antigenChains.join(',')}`,
    `REMARK 905 ANTIBODY CHAINS: ${pose.antibodyChains.join(',')}`,
    `REMARK 906 SCAFFOLD: SCAFFOLD-${format}-${scaffold.name}`,
    `REMARK 907 DISEASE: ${target.disease}`,
    `REMARK 908 ORGANISM: ${target.organism}`,
    `REMARK 909 GEOMETRY: minDist=${pose.pose.geometry.minDistance}Å contacts=${pose.pose.geometry.contactPairs4_5A} clashes=${pose.pose.geometry.hardClashesBelow2A}`,
    'REMARK 910 STATIC DISPLAY ONLY; NOT A CLAIM OF CLINICAL ACTIVITY',
    'REMARK 911 GENERATED BY expand_model_library.js',
    'MODEL        1'
  ].join('\n') + '\n';
  const body = String(pose.pdbText)
    .replace(/^MODEL.*\n/, '')
    .replace(/^ENDMDL\n/, '')
    .replace(/^END\n/, '');
  fs.writeFileSync(outputPath, remarks + body + 'END\n');
  return fileName;
}

function generateAllDisplayPoses() {
  console.log('\n=== Step 3: Generating display poses for 35 gap targets ===');
  const results = [];
  for (const target of GAP_TARGETS) {
    const antigenPath = path.join(SWEEP_DIR, `${target.pdbId}.pdb`);
    if (!fs.existsSync(antigenPath)) {
      console.error(`  ✗ ${target.target} (${target.pdbId}): antigen PDB not found, skipping`);
      results.push({ ...target, status: 'antigen_not_found', poses: [] });
      continue;
    }
    const antigenPdbText = fs.readFileSync(antigenPath, 'utf8');
    const entities = parseCompoundEntities(antigenPdbText);
    const allChains = allCoordinateChains(antigenPdbText);
    // Identify antigen chains: all chains that are NOT antibody
    const antibodyChains = new Set();
    for (const entity of entities) {
      if (entityLooksAntibody(entity)) {
        for (const chain of entity.chains) antibodyChains.add(chain);
      }
    }
    const antigenChains = allChains.filter(chain => !antibodyChains.has(chain));
    if (antigenChains.length === 0) {
      console.error(`  ✗ ${target.target} (${target.pdbId}): no antigen chains identified`);
      results.push({ ...target, status: 'no_antigen_chains', poses: [] });
      continue;
    }
    const records = parsePdbRecords(antigenPdbText, antigenChains);
    const chainStats = chainResidueStats(records);
    const format = chooseGeneratedFormat(chainStats, antigenChains);
    const selectedScaffolds = selectScaffoldsForTarget(target.target, format, POSES_PER_TARGET);
    if (selectedScaffolds.length === 0) {
      console.error(`  ✗ ${target.target}: no ${format} scaffolds available`);
      results.push({ ...target, status: 'no_scaffolds', poses: [] });
      continue;
    }
    console.log(`\n  Processing ${target.target} (${target.pdbId}):`);
    console.log(`    Antigen chains: ${antigenChains.join(',')} | Format: ${format} | Scaffolds: ${selectedScaffolds.map(s => s.name).join(', ')}`);
    const poses = [];
    let scaffoldIdx = 0;
    for (let i = 0; i < POSES_PER_TARGET && scaffoldIdx < SCAFFOLDS.length * 2; scaffoldIdx++) {
      const scaffold = selectedScaffolds[i % selectedScaffolds.length];
      if (!scaffold) break;
      try {
        const pose = generatePoseForTarget(target, scaffold, antigenPdbText, antigenChains, chainStats);
        const validation = validateGeometry(pose, format);
        if (!validation.valid) {
          console.log(`    ✗ Scaffold ${scaffold.name}: ${validation.reason}, trying next...`);
          // Try next scaffold of same format
          const allMatching = SCAFFOLDS.filter(s => s.format === format);
          const nextScaffold = allMatching[(allMatching.indexOf(scaffold) + 1) % allMatching.length];
          if (nextScaffold && nextScaffold.name !== scaffold.name) {
            const retryPose = generatePoseForTarget(target, nextScaffold, antigenPdbText, antigenChains, chainStats);
            const retryValidation = validateGeometry(retryPose, format);
            if (retryValidation.valid) {
              const fileName = writeRoutePresetPdb(target, nextScaffold, retryPose, i + 1);
              console.log(`    ✓ Pose ${i + 1}: ${fileName} (scaffold: ${nextScaffold.name}, minDist: ${retryPose.pose.geometry.minDistance}Å)`);
              poses.push({
                fileName, scaffold: nextScaffold.name, format,
                antigenChains: retryPose.antigenChains,
                antibodyChains: retryPose.antibodyChains,
                geometry: retryPose.pose.geometry
              });
              i++;
              continue;
            }
          }
          console.log(`    ✗ All scaffolds failed for pose ${i + 1}, using best attempt`);
          const fileName = writeRoutePresetPdb(target, scaffold, pose, i + 1);
          poses.push({
            fileName, scaffold: scaffold.name, format,
            antigenChains: pose.antigenChains,
            antibodyChains: pose.antibodyChains,
            geometry: pose.pose.geometry,
            warning: validation.reason
          });
          i++;
          continue;
        }
        const fileName = writeRoutePresetPdb(target, scaffold, pose, i + 1);
        console.log(`    ✓ Pose ${i + 1}: ${fileName} (scaffold: ${scaffold.name}, minDist: ${pose.pose.geometry.minDistance}Å, contacts: ${pose.pose.geometry.contactPairs4_5A})`);
        poses.push({
          fileName, scaffold: scaffold.name, format,
          antigenChains: pose.antigenChains,
          antibodyChains: pose.antibodyChains,
          geometry: pose.pose.geometry
        });
        i++;
      } catch (err) {
        console.error(`    ✗ Scaffold ${scaffold.name}: ${err.message}`);
        // Try next scaffold
        continue;
      }
    }
    if (poses.length === 0) {
      console.error(`  ✗ ${target.target}: no valid poses generated`);
      results.push({ ...target, status: 'pose_generation_failed', poses: [] });
    } else {
      console.log(`  ✓ ${target.target}: ${poses.length} poses generated`);
      results.push({ ...target, status: 'success', poses });
    }
  }
  return results;
}

// ─── Manifest writer ───
function writeManifest(scaffoldResults, poseResults) {
  const manifest = {
    generatedAt: new Date().toISOString(),
    description: 'Expanded molecular model library with 35 gap disease targets and 32 diverse antibody scaffolds (22 Fab + 10 VHH)',
    scaffoldCount: scaffoldResults.length,
    targetCount: GAP_TARGETS.length,
    posesPerTarget: POSES_PER_TARGET,
    scaffolds: scaffoldResults.map(s => ({
      name: s.name,
      file: s.file,
      format: s.format,
      source: s.source,
      chains: s.chains,
      description: s.description
    })),
    targets: poseResults.map(r => ({
      routeId: r.routeId,
      target: r.target,
      gene: r.gene,
      disease: r.disease,
      pdbId: r.pdbId,
      aliasPrefix: r.aliasPrefix,
      organism: r.organism,
      taxId: r.taxId,
      status: r.status,
      poseCount: r.poses.length,
      poses: r.poses.map(p => ({
        file: p.fileName,
        scaffold: p.scaffold,
        format: p.format,
        antigenChains: p.antigenChains,
        antibodyChains: p.antibodyChains,
        geometry: p.geometry,
        ...(p.warning ? { warning: p.warning } : {})
      }))
    })),
    summary: {
      totalScaffolds: scaffoldResults.length,
      totalTargets: GAP_TARGETS.length,
      successfulTargets: poseResults.filter(r => r.status === 'success').length,
      failedTargets: poseResults.filter(r => r.status !== 'success').length,
      totalPoses: poseResults.reduce((sum, r) => sum + r.poses.length, 0)
    }
  };
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`\n✓ Manifest written to ${path.basename(MANIFEST_PATH)}`);
  console.log(`  Scaffolds: ${manifest.summary.totalScaffolds}`);
  console.log(`  Targets: ${manifest.summary.successfulTargets}/${manifest.summary.totalTargets} successful`);
  console.log(`  Total poses: ${manifest.summary.totalPoses}`);
}

// ─── Main ───
async function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║  Expand Molecular Model Library                              ║');
  console.log('║  35 gap disease targets + 32 diverse antibody scaffolds     ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');

  // Step 1: Create scaffold files
  const scaffoldResults = createScaffoldFiles();

  // Step 2: Download gap antigen PDBs
  await downloadGapAntigens();

  // Step 3: Generate display poses
  const poseResults = generateAllDisplayPoses();

  // Step 4: Write manifest
  writeManifest(scaffoldResults, poseResults);

  console.log('\n=== Done ===');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
