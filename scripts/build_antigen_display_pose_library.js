'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const {
  FORMAT_DEFAULTS,
  generateDisplayPose,
  measureInterfaceGeometry,
  parsePdbRecords
} = require('../lib/display-pose');

const ROOT = path.resolve(__dirname, '..');
const PDB_DIR = path.join(ROOT, 'pdb');
const SOURCE_DIR = path.join(PDB_DIR, 'antigen-only-sweep');
const OUTPUT_DIR = path.join(PDB_DIR, 'antigen-display-pose');
const MANIFEST_PATH = path.join(PDB_DIR, 'antigen-display-pose-manifest.json');
const AUDIT_JSON_PATH = path.join(PDB_DIR, 'antigen-display-pose-audit.json');
const AUDIT_MD_PATH = path.join(PDB_DIR, 'antigen-display-pose-audit.md');
const FAB_SCAFFOLD_FILE = 'PDL1-Fab-01.pdb';
const FAB_SCAFFOLD_CHAINS = ['B', 'C'];
const VHH_SCAFFOLD_FILE = 'IL33-VHH-01.pdb';
const VHH_SCAFFOLD_CHAINS = ['B'];
const ANTIBODY_KEYWORD_RE = /\b(?:antibody|autoantibody|immunoglobulin|fab|nanobody|vhh|scfv|single[- ]chain fv|megabody|vh[- ]domain)\b/i;
const PDB_ID_RE = /^[0-9][A-Z0-9]{3}$/;
const DEFAULT_ORGANISM = 'Homo sapiens';
const DEFAULT_TAX_ID = 9606;

function sha256(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

function normalizeSpaces(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function normalizeToken(value) {
  return String(value || '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

function sanitizeLabel(value, fallback = 'Target') {
  const cleaned = String(value || '')
    .replace(/[/+(),]/g, ' ')
    .replace(/[^A-Za-z0-9._ -]+/g, ' ')
    .trim()
    .replace(/\s+/g, '-');
  return cleaned || fallback;
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

function remarksForGeneratedPose(text, extras) {
  const lines = String(text).split(/\r?\n/);
  if (lines[lines.length - 1] === '') lines.pop();
  const insertAt = 2;
  lines.splice(insertAt, 0, ...extras);
  return lines.join('\n') + '\n';
}

function exactPosePdb({ sourceText, antigenChains, antibodyChains, target, accession, organism, taxId, sourceFile, note, format }) {
  const selected = new Set([...antigenChains, ...antibodyChains]);
  const body = String(sourceText)
    .split(/\r?\n/)
    .filter(line => {
      if (/^(?:ATOM  |HETATM|ANISOU)/.test(line)) return selected.has(line[21] || ' ');
      if (line.startsWith('TER')) return true;
      return false;
    })
    .join('\n')
    .trimEnd();
  const remarks = [
    'HEADER    ZOONOAB ANTIGEN DISPLAY LIBRARY',
    'REMARK 900 DISPLAY_POSE: EXACT_LOCAL_COMPLEX',
    'REMARK 901 TARGET: ' + target,
    'REMARK 902 FORMAT: ' + format,
    'REMARK 903 STRUCTURAL BASIS: local antigen-only sweep exact complex from ' + sourceFile,
    'REMARK 904 ANTIGEN CHAINS: ' + antigenChains.join(','),
    'REMARK 905 ANTIBODY CHAINS: ' + antibodyChains.join(','),
    'REMARK 906 LOCAL EXACT COMPLEX PRESERVED FROM PUBLIC EXPERIMENTAL COORDINATES',
    'REMARK 909 NOT A NEW AFFINITY CLAIM; REUSES A LOCAL PUBLIC EXPERIMENTAL COMPLEX',
    'REMARK 910 ORGANISM: ' + organism,
    'REMARK 911 TAXID: ' + taxId,
    'REMARK 912 ACCESSION: ' + accession,
    'REMARK 913 NOTE: ' + note,
    'MODEL        1'
  ];
  return remarks.join('\n') + '\n' + body + '\nENDMDL\nEND\n';
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

function parseTargetMap() {
  const map = new Map();
  const files = fs.readdirSync(SOURCE_DIR).filter(name => /\.md$/i.test(name));
  for (const name of files) {
    const text = fs.readFileSync(path.join(SOURCE_DIR, name), 'utf8');
    for (const line of text.split(/\r?\n/)) {
      const cells = line.split('|').map(item => item.trim());
      if (cells.length < 7 || !/^\d+$/.test(cells[1] || '')) continue;
      let target = '';
      let pdbId = '';
      if (/^antigen-only-batch-/.test(name)) {
        target = cells[3] || '';
        pdbId = cells[4] || '';
      } else if (/^antigen-only-rescan-batch-/.test(name)) {
        target = cells[3] || '';
        pdbId = cells[6] || '';
      }
      if (!PDB_ID_RE.test(String(pdbId).toUpperCase())) continue;
      if (!target || target === '-') continue;
      const key = String(pdbId).toUpperCase();
      if (!map.has(key)) map.set(key, { targets: [], aliases: new Set() });
      const entry = map.get(key);
      if (!entry.targets.includes(target)) entry.targets.push(target);
      for (const piece of target.split('/')) {
        const alias = normalizeSpaces(piece);
        if (alias) entry.aliases.add(alias);
      }
    }
  }
  return map;
}

function targetTermsForEntry(targetEntry, fallback) {
  const out = new Set();
  for (const value of (targetEntry && targetEntry.targets) || []) out.add(value);
  for (const value of (targetEntry && targetEntry.aliases) || []) out.add(value);
  out.add(fallback);
  const extras = [];
  for (const item of out) {
    const value = normalizeSpaces(item);
    if (!value) continue;
    extras.push(value);
    for (const piece of value.split(/[\/,]/)) {
      const trimmed = normalizeSpaces(piece);
      if (trimmed) extras.push(trimmed);
    }
  }
  return [...new Set(extras)];
}

function entityLooksAntibody(entity) {
  return ANTIBODY_KEYWORD_RE.test([entity.molecule, entity.synonym, entity.fragment, entity.gene].filter(Boolean).join(' '));
}

function entityMatchesTarget(entity, terms) {
  const haystack = [
    entity.molecule,
    entity.synonym,
    entity.fragment,
    entity.gene
  ].map(normalizeToken).filter(Boolean);
  if (!haystack.length) return false;
  for (const term of terms) {
    const normalized = normalizeToken(term);
    if (!normalized) continue;
    if (haystack.includes(normalized)) return true;
    if (normalized.length >= 3 && haystack.some(value => value.includes(normalized) || normalized.includes(value))) return true;
  }
  return false;
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
    chain,
    heavyAtoms: value.heavyAtoms,
    residueCount: value.residues.size
  }]));
}

function atomDistance(a, b) {
  return Math.sqrt(
    (a.xyz[0] - b.xyz[0]) ** 2 +
    (a.xyz[1] - b.xyz[1]) ** 2 +
    (a.xyz[2] - b.xyz[2]) ** 2
  );
}

function contactingChains(records, leftChains, rightChains, thresholdA = 8) {
  const left = new Set();
  const right = new Set();
  const leftRecords = records.filter(record => record.isHeavy && leftChains.includes(record.chain));
  const rightRecords = records.filter(record => record.isHeavy && rightChains.includes(record.chain));
  for (const a of leftRecords) {
    for (const b of rightRecords) {
      if (atomDistance(a, b) <= thresholdA) {
        left.add(a.chain);
        right.add(b.chain);
      }
    }
  }
  return {
    left: left.size ? leftChains.filter(chain => left.has(chain)) : leftChains.slice(),
    right: right.size ? rightChains.filter(chain => right.has(chain)) : rightChains.slice()
  };
}

function chooseGeneratedFormat(chainStats, antigenChains) {
  const totalHeavyAtoms = antigenChains.reduce((sum, chain) => sum + ((chainStats.get(chain) && chainStats.get(chain).heavyAtoms) || 0), 0);
  const totalResidues = antigenChains.reduce((sum, chain) => sum + ((chainStats.get(chain) && chainStats.get(chain).residueCount) || 0), 0);
  if (antigenChains.length <= 2 && totalHeavyAtoms <= 2200 && totalResidues <= 280) return 'VHH';
  return 'Fab';
}

function generatePoseFromSource({ filePath, sourceText, accession, primaryTarget, organism, taxId, antigenChains, chainStats }) {
  const format = chooseGeneratedFormat(chainStats, antigenChains);
  const scaffoldFile = format === 'VHH' ? VHH_SCAFFOLD_FILE : FAB_SCAFFOLD_FILE;
  const scaffoldChains = format === 'VHH' ? VHH_SCAFFOLD_CHAINS : FAB_SCAFFOLD_CHAINS;
  const scaffoldPdbText = proteinLinesForChains(
    fs.readFileSync(path.join(PDB_DIR, scaffoldFile), 'utf8'),
    scaffoldChains
  );
  const antigenPdbText = proteinLinesForChains(sourceText, antigenChains);
  const pose = generateDisplayPose({
    antigenPdbText,
    antigenChains,
    antibodyFormat: format,
    scaffoldPdbText,
    scaffoldAntibodyChains: scaffoldChains,
    seed: 'antigen-display-pose-v1',
    candidateIndex: 1,
    sourceMetadata: {
      target: primaryTarget,
      antigenSource: path.basename(filePath) + ' antigen chains ' + antigenChains.join(','),
      scaffoldSource: scaffoldFile + ' chains ' + scaffoldChains.join(',')
    }
  });
  if (!pose.ok) {
    throw new Error('Display pose generation failed for ' + path.basename(filePath) + ': ' + JSON.stringify(pose.error));
  }
  const outputPdbText = remarksForGeneratedPose(pose.pdbText, [
    'REMARK 910 ORGANISM: ' + organism,
    'REMARK 911 TAXID: ' + taxId,
    'REMARK 912 ACCESSION: ' + accession,
    'REMARK 913 SOURCE FILE: ' + path.basename(filePath)
  ]);
  return {
    accession,
    primaryTarget,
    organism,
    taxId,
    sourceText,
    antigenChains: pose.antigenChains,
    antibodyChains: pose.antibodyChains,
    sourceKind: 'generated_display_pose',
    format,
    outputPdbText,
    geometry: {
      minDistance: pose.pose.geometry.minDistance,
      contactPairs: pose.pose.geometry.contactPairs4_5A,
      nearPairs: pose.pose.geometry.nearPairs6A,
      hardClashes: pose.pose.geometry.hardClashesBelow2A
    },
    scaffoldFile,
    sourceFile: path.basename(filePath)
  };
}

function parseOrganism(pdbText) {
  const sourceLines = String(pdbText).split(/\r?\n/).filter(line => line.startsWith('SOURCE'));
  const joined = sourceLines.map(line => normalizeSpaces(line.slice(10))).join(' ');
  const organismMatch = joined.match(/ORGANISM_SCIENTIFIC:\s*([^;]+);/i);
  const taxMatch = joined.match(/ORGANISM_TAXID:\s*(\d+);/i);
  return {
    organism: organismMatch ? normalizeSpaces(organismMatch[1]) : DEFAULT_ORGANISM,
    taxId: taxMatch ? Number(taxMatch[1]) : DEFAULT_TAX_ID
  };
}

function describeSource(sourceKind) {
  return sourceKind === 'exact_local_complex'
    ? 'local exact antigen-antibody complex'
    : 'local antigen structure with geometric antibody display pose';
}

function analyzeSourceFile(filePath, targetEntry) {
  const sourceText = fs.readFileSync(filePath, 'utf8');
  const accession = path.basename(filePath, '.pdb').toUpperCase();
  const entities = parseCompoundEntities(sourceText);
  const allChains = allCoordinateChains(sourceText);
  const records = parsePdbRecords(sourceText, allChains);
  const chainStats = chainResidueStats(records);
  const targetFallback = (entities[0] && entities[0].gene) || (entities[0] && entities[0].molecule) || accession;
  const terms = targetTermsForEntry(targetEntry, targetFallback);
  const exactAntibodyChains = entities.filter(entityLooksAntibody).flatMap(entity => entity.chains);
  const matchedAntigenChains = entities.filter(entity => !entityLooksAntibody(entity) && entityMatchesTarget(entity, terms)).flatMap(entity => entity.chains);
  const nonAntibodyChains = entities.filter(entity => !entityLooksAntibody(entity)).flatMap(entity => entity.chains);
  let antigenChains = [...new Set((matchedAntigenChains.length ? matchedAntigenChains : nonAntibodyChains).filter(chain => chainStats.has(chain)))];
  const antibodyChains = [...new Set(exactAntibodyChains.filter(chain => chainStats.has(chain)))];

  if (!antigenChains.length) {
    antigenChains = [...chainStats.values()]
      .filter(item => !antibodyChains.includes(item.chain))
      .sort((a, b) => b.heavyAtoms - a.heavyAtoms)
      .map(item => item.chain);
  }
  if (!antigenChains.length) throw new Error('No antigen chains selected for ' + filePath);

  const primaryTarget = ((targetEntry && targetEntry.targets && targetEntry.targets[0]) || targetFallback || accession).replace(/\s+/g, ' ').trim();
  const { organism, taxId } = parseOrganism(sourceText);

  if (antibodyChains.length) {
    const contact = contactingChains(records, antigenChains, antibodyChains, 8);
    const exactText = exactPosePdb({
      sourceText,
      antigenChains: contact.left,
      antibodyChains: contact.right,
      target: primaryTarget,
      accession,
      organism,
      taxId,
      sourceFile: path.basename(filePath),
      note: 'Subset of local public complex retained for the display library.',
      format: contact.right.length === 1 ? 'VHH' : 'Fab'
    });
    const exactRecords = parsePdbRecords(exactText, [...contact.left, ...contact.right]);
    const exactGeometry = measureInterfaceGeometry(
      exactRecords.filter(record => record.isHeavy && contact.left.includes(record.chain)),
      exactRecords.filter(record => record.isHeavy && contact.right.includes(record.chain))
    );
    const exactResult = {
      accession,
      primaryTarget,
      organism,
      taxId,
      sourceText,
      antigenChains: contact.left,
      antibodyChains: contact.right,
      sourceKind: 'exact_local_complex',
      format: contact.right.length === 1 ? 'VHH' : 'Fab',
      outputPdbText: exactText,
      geometry: exactGeometry,
      scaffoldFile: null,
      sourceFile: path.basename(filePath)
    };
    if (auditStatus(exactResult.format, exactResult.geometry).accepted) return exactResult;
    return generatePoseFromSource({ filePath, sourceText, accession, primaryTarget, organism, taxId, antigenChains, chainStats });
  }

  return generatePoseFromSource({ filePath, sourceText, accession, primaryTarget, organism, taxId, antigenChains, chainStats });
}

function auditStatus(format, geometry) {
  const thresholds = FORMAT_DEFAULTS[format];
  const accepted = geometry.hardClashes === 0 &&
    geometry.minDistance >= 2 &&
    geometry.minDistance <= 4.5 &&
    geometry.contactPairs >= thresholds.minContactPairs &&
    geometry.nearPairs >= thresholds.minNearPairs;
  return {
    accepted,
    thresholds
  };
}

function writeAudit(manifestEntries) {
  const rows = manifestEntries.map(entry => {
    const verdict = auditStatus(entry.format, entry.geometry);
    return {
      file: entry.filename,
      target: entry.target,
      sourceKind: entry.sourceKind,
      format: entry.format,
      antigenChains: entry.antigenChains,
      antibodyChains: entry.antibodyChains,
      minDistanceA: Number(entry.geometry.minDistance.toFixed(3)),
      contactPairs45A: entry.geometry.contactPairs,
      nearPairs60A: entry.geometry.nearPairs,
      clashesBelow20A: entry.geometry.hardClashes,
      accepted: verdict.accepted,
      thresholds: verdict.thresholds
    };
  });
  fs.writeFileSync(AUDIT_JSON_PATH, JSON.stringify({
    generatedAt: new Date().toISOString(),
    totalFiles: rows.length,
    acceptedFiles: rows.filter(item => item.accepted).length,
    rows
  }, null, 2) + '\n');

  const md = [
    '# Antigen Display Pose Audit',
    '',
    '| file | target | source kind | format | antigen chains | antibody chains | min distance (A) | contacts <=4.5A | near <=6.0A | clashes <2.0A | accepted |',
    '| --- | --- | --- | --- | --- | --- | ---: | ---: | ---: | ---: | --- |'
  ];
  for (const row of rows) {
    md.push(`| ${row.file} | ${row.target} | ${row.sourceKind} | ${row.format} | ${row.antigenChains.join(',')} | ${row.antibodyChains.join(',')} | ${row.minDistanceA.toFixed(3)} | ${row.contactPairs45A} | ${row.nearPairs60A} | ${row.clashesBelow20A} | ${row.accepted ? 'accepted' : 'rejected'} |`);
  }
  fs.writeFileSync(AUDIT_MD_PATH, md.join('\n') + '\n');
}

function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  for (const name of fs.readdirSync(OUTPUT_DIR)) {
    if (/\.pdb$/i.test(name)) fs.unlinkSync(path.join(OUTPUT_DIR, name));
  }
  const targetMap = parseTargetMap();
  const sourceFiles = fs.readdirSync(SOURCE_DIR)
    .filter(name => /\.pdb$/i.test(name))
    .sort();
  const limit = Number(process.env.LIMIT || 0);
  const selectedFiles = limit > 0 ? sourceFiles.slice(0, limit) : sourceFiles;
  const manifestEntries = [];

  for (const name of selectedFiles) {
    const accession = path.basename(name, '.pdb').toUpperCase();
    const targetEntry = targetMap.get(accession) || null;
    const analyzed = analyzeSourceFile(path.join(SOURCE_DIR, name), targetEntry);
    const filename = sanitizeLabel(analyzed.primaryTarget, accession) + '-' + analyzed.format + '-' + analyzed.accession + '.pdb';
    fs.writeFileSync(path.join(OUTPUT_DIR, filename), analyzed.outputPdbText);
    manifestEntries.push({
      filename,
      sourceFile: analyzed.sourceFile,
      sourceAccession: analyzed.accession,
      sourceKind: analyzed.sourceKind,
      sourceDescription: describeSource(analyzed.sourceKind),
      target: analyzed.primaryTarget,
      organism: analyzed.organism,
      taxId: analyzed.taxId,
      format: analyzed.format,
      scaffoldFile: analyzed.scaffoldFile,
      antigenChains: analyzed.antigenChains,
      antibodyChains: analyzed.antibodyChains,
      geometry: {
        minDistance: Number(analyzed.geometry.minDistance.toFixed(3)),
        contactPairs: analyzed.geometry.contactPairs,
        nearPairs: analyzed.geometry.nearPairs,
        hardClashes: analyzed.geometry.hardClashes
      },
      sha256: sha256(analyzed.outputPdbText)
    });
  }

  const summary = {
    totalSourceFiles: sourceFiles.length,
    generatedFiles: manifestEntries.length,
    exactComplexReused: manifestEntries.filter(item => item.sourceKind === 'exact_local_complex').length,
    generatedDisplayPoses: manifestEntries.filter(item => item.sourceKind === 'generated_display_pose').length,
    fabCount: manifestEntries.filter(item => item.format === 'Fab').length,
    vhhCount: manifestEntries.filter(item => item.format === 'VHH').length
  };
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify({
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    sourceDir: path.relative(ROOT, SOURCE_DIR),
    outputDir: path.relative(ROOT, OUTPUT_DIR),
    scaffolds: {
      Fab: { file: FAB_SCAFFOLD_FILE, chains: FAB_SCAFFOLD_CHAINS },
      VHH: { file: VHH_SCAFFOLD_FILE, chains: VHH_SCAFFOLD_CHAINS }
    },
    summary,
    entries: manifestEntries
  }, null, 2) + '\n');
  writeAudit(manifestEntries);
  console.log(JSON.stringify(summary, null, 2));
}

main();
