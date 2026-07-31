#!/usr/bin/env node
'use strict';

/**
 * Batch Complex Generation Script
 *
 * Generates 10 Fab + 10 VHH = 20 antigen-antibody display pose PDB files
 * per target, with epitope separation validation.
 *
 * Usage:
 *   node scripts/generate_complexes_batch.js --test          # 10 targets
 *   node scripts/generate_complexes_batch.js --limit 50      # 50 targets
 *   node scripts/generate_complexes_batch.js                 # all targets
 */

const fs = require('fs');
const path = require('path');
const { generateDisplayPose } = require('../lib/display-pose');
const matcher = require('../lib/scaffold-matcher');

// ─── Paths ───
const ROOT = path.resolve(__dirname, '..');
const SCAFFOLD_DIR = path.join(ROOT, 'pdb', 'scaffolds');
const ANTIGEN_DIR = '/Users/ryan/.trae-cn/work/6a6b5f0283052dfa200e13ce/target_expansion_isolated/downloads/full_human_rank1_pdb';
const OUTPUT_BASE = '/Users/ryan/.trae-cn/work/6a6b5f0283052dfa200e13ce/target_expansion_isolated/complexes';
const MANIFEST_PATH = path.join(OUTPUT_BASE, 'manifest.json');

// ─── Configuration ───
const FAB_TARGET = 10;
const VHH_TARGET = 10;
const FAB_OVERSAMPLE = 22;  // all 22 Fab scaffolds, partitionSize=5, allows 12 failures
const VHH_OVERSAMPLE = 10;  // all 10 VHH scaffolds, partitionSize=12
const SURFACE_SAMPLE_COUNT = 120;  // total surface candidates for partitioning
const MAX_ANTIGEN_CHAINS = 20;  // skip targets with too many chains
const MAX_ANTIGEN_ATOMS = 30000;  // skip targets with too many atoms

// ─── 32 antibody scaffolds (22 Fab + 10 VHH) ───
const SCAFFOLDS = [
  // Fab scaffolds (22)
  { name: 'trastuzumab',  chains: ['B', 'C'], format: 'Fab' },
  { name: 'cetuximab',    chains: ['B', 'C'], format: 'Fab' },
  { name: 'bevacizumab',  chains: ['B', 'C'], format: 'Fab' },
  { name: 'certolizumab', chains: ['B', 'C'], format: 'Fab' },
  { name: 'nivolumab',    chains: ['B', 'C'], format: 'Fab' },
  { name: 'ipilimumab',   chains: ['B', 'C'], format: 'Fab' },
  { name: 'daratumumab',  chains: ['B', 'C'], format: 'Fab' },
  { name: 'tozorakimab',  chains: ['B', 'C'], format: 'Fab' },
  { name: 'fluha',        chains: ['B', 'C'], format: 'Fab' },
  { name: 'bcma',         chains: ['B', 'C'], format: 'Fab' },
  { name: 'il13',         chains: ['H', 'L'], format: 'Fab' },
  { name: 'fcrn',         chains: ['H', 'L'], format: 'Fab' },
  { name: 'gipr',         chains: ['B', 'C'], format: 'Fab' },
  { name: 'her3',         chains: ['B', 'C'], format: 'Fab' },
  { name: 'cd47',         chains: ['B', 'C'], format: 'Fab' },
  { name: 'cgrpr',        chains: ['B', 'C'], format: 'Fab' },
  { name: 'il6r',         chains: ['B', 'C'], format: 'Fab' },
  { name: 'b7h6',         chains: ['A', 'B'], format: 'Fab' },
  { name: 'cd19',         chains: ['B', 'C'], format: 'Fab' },
  { name: 'tigit',        chains: ['B', 'C'], format: 'Fab' },
  { name: 'gprc5d',       chains: ['C', 'D'], format: 'Fab' },
  { name: 'rsvf',         chains: ['B', 'C'], format: 'Fab' },
  // VHH scaffolds (10)
  { name: 'IL33',         chains: ['B'],      format: 'VHH' },
  { name: 'TSLP',         chains: ['B'],      format: 'VHH' },
  { name: 'nb-7d12',      chains: ['A'],      format: 'VHH' },
  { name: 'cab-lys3',     chains: ['A'],      format: 'VHH' },
  { name: 'cab-rn05',     chains: ['B'],      format: 'VHH' },
  { name: 'nb-tnf3',      chains: ['D'],      format: 'VHH' },
  { name: 'cab-bcii',     chains: ['A'],      format: 'VHH' },
  { name: 'nb80',         chains: ['B'],      format: 'VHH' },
  { name: 'mu551',        chains: ['B'],      format: 'VHH' },
  { name: 'clec4f',       chains: ['A'],      format: 'VHH' }
];

const FAB_SCAFFOLDS = SCAFFOLDS.filter(s => s.format === 'Fab');
const VHH_SCAFFOLDS = SCAFFOLDS.filter(s => s.format === 'VHH');

const ANTIBODY_KEYWORD_RE = /\b(?:antibody|autoantibody|immunoglobulin|fab|nanobody|vhh|scfv|single[- ]chain fv|megabody|vh[- ]domain)\b/i;

// ─── PDB helper functions ───

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

function normalizeSpaces(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function normalizeToken(value) {
  return String(value || '').normalize('NFKC').toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function parseStructuredSection(text, prefix) {
  const lines = String(text).split(/\r?\n/)
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
  const falsePositiveRe = /\b(?:domain[- ]containing|receptor|mucin|cellular receptor)\b/i;
  if (falsePositiveRe.test(text) && !/\b(?:fab|nanobody|vhh|scfv|single[- ]chain fv|megabody)\b/i.test(text)) {
    return false;
  }
  return true;
}

function sanitizeGeneName(name) {
  const cleaned = String(name || '').replace(/[^A-Za-z0-9._-]+/g, '').trim();
  return cleaned || 'TARGET';
}

function identifyAntigenChains(pdbText) {
  const entities = parseCompoundEntities(pdbText);
  const allChains = allCoordinateChains(pdbText);
  const antibodyChains = new Set();
  for (const entity of entities) {
    if (entityLooksAntibody(entity)) {
      for (const chain of entity.chains) antibodyChains.add(chain);
    }
  }
  const antigenChains = allChains.filter(chain => !antibodyChains.has(chain));
  return { antigenChains, antibodyChains: [...antibodyChains], allChains };
}

// ─── Pose generation ───

function readScaffoldPdb(scaffold) {
  const scaffoldFileName = `SCAFFOLD-${scaffold.format}-${scaffold.name}.pdb`;
  const scaffoldPath = path.join(SCAFFOLD_DIR, scaffoldFileName);
  if (!fs.existsSync(scaffoldPath)) {
    throw new Error(`Scaffold file not found: ${scaffoldPath}`);
  }
  const rawText = fs.readFileSync(scaffoldPath, 'utf8');
  return proteinLinesForChains(rawText, scaffold.chains);
}

function generateSinglePose(target, scaffold, antigenPdbText, antigenChains, seedSuffix, candidateIdx, surfaceStart, surfaceLimit) {
  const scaffoldPdbText = readScaffoldPdb(scaffold);
  const antigenOnlyText = proteinLinesForChains(antigenPdbText, antigenChains);
  // Use target-only seed so all scaffolds share the same surface candidate
  // distribution. Surface partitioning then ensures each scaffold binds
  // a different epitope region on the antigen.
  const seed = `${target}|${scaffold.format.toLowerCase()}`;
  const result = generateDisplayPose({
    antigenPdbText: antigenOnlyText,
    antigenChains,
    antibodyFormat: scaffold.format,
    scaffoldPdbText,
    scaffoldAntibodyChains: scaffold.chains,
    seed,
    candidateIndex: candidateIdx || 1,
    surfaceSampleCount: SURFACE_SAMPLE_COUNT,
    surfaceStart: surfaceStart || 0,
    surfaceLimit: surfaceLimit || SURFACE_SAMPLE_COUNT,
    sourceMetadata: {
      target,
      antigenSource: `RCSB antigen chains ${antigenChains.join(',')}`,
      scaffoldSource: `SCAFFOLD-${scaffold.format}-${scaffold.name}`
    }
  });
  return result;
}

function generateCandidatesForFormat(target, scaffolds, antigenPdbText, antigenChains, oversampleCount) {
  const candidates = [];
  // Partition the antigen surface into regions, one per scaffold.
  // This forces each candidate to bind a different epitope region.
  const partitionSize = Math.max(1, Math.floor(SURFACE_SAMPLE_COUNT / oversampleCount));
  
  for (let i = 0; i < scaffolds.length && candidates.length < oversampleCount; i++) {
    const scaffold = scaffolds[i];
    const surfaceStart = (i * partitionSize) % SURFACE_SAMPLE_COUNT;
    
    // Progressive fallback: try partition → 2x → 3x → 5x → 8x
    // Do NOT fall back to full surface — that creates duplicates
    const fallbackMultipliers = [1, 2, 3, 5, 8];
    let result = null;
    
    for (const mult of fallbackMultipliers) {
      const limit = Math.min(partitionSize * mult, SURFACE_SAMPLE_COUNT);
      const start = mult === 1 ? surfaceStart : Math.max(0, surfaceStart - Math.floor((limit - partitionSize) / 2));
      try {
        const r = generateSinglePose(target, scaffold, antigenPdbText, antigenChains, `sp${i}_m${mult}`, 1, start, limit);
        if (r.ok) {
          result = r;
          break;
        }
      } catch (err) {
        // Continue to next multiplier
      }
    }
    
    if (!result) {
      // Skip this scaffold — no acceptable pose in its partition
      continue;
    }
    
    const meta = matcher.extractPoseMetadata(result, result.pdbText);
    if (meta) {
      candidates.push({
        ...meta,
        scaffold: scaffold.name,
        format: scaffold.format,
        scaffoldIndex: i,
        candidateIndex: 1,
        pdbText: result.pdbText,
        seed: `${target}|${scaffold.format.toLowerCase()}|sp${i}`
      });
    }
  }
  return candidates;
}

// ─── Geometry validation ───

function validatePoseGeometry(pose) {
  const g = pose.geometry;
  if (!g) return { valid: false, reason: 'no geometry' };
  if (g.hardClashesBelow2A > 0) return { valid: false, reason: `${g.hardClashesBelow2A} hard clashes` };
  if (g.minDistance > 5.0) return { valid: false, reason: `minDist ${g.minDistance} > 5.0` };
  if (g.minDistance < 2.0) return { valid: false, reason: `minDist ${g.minDistance} < 2.0` };
  const minContacts = pose.format === 'VHH' ? 6 : 8;
  if (g.contactPairs4_5A < minContacts) return { valid: false, reason: `contacts ${g.contactPairs4_5A} < ${minContacts}` };
  return { valid: true, geometry: g };
}

// ─── PDB writing ───

function writeComplexPdb(targetGene, pdbId, pose, candidateIndex, outputDir) {
  const format = pose.format;
  const fileName = `${targetGene}-${format}-${String(candidateIndex).padStart(2, '0')}.pdb`;
  const outputPath = path.join(outputDir, fileName);

  // Add custom remarks to the PDB text
  const header = [
    `HEADER    ZOONOAB COMPLEX ${format}`,
    `REMARK 900 TARGET: ${targetGene}`,
    `REMARK 901 PDB_ID: ${pdbId}`,
    `REMARK 902 FORMAT: ${format}`,
    `REMARK 903 SCAFFOLD: ${pose.scaffold}`,
    `REMARK 904 ANTIGEN CHAINS: ${pose.antigenChains.join(',')}`,
    `REMARK 905 ANTIBODY CHAINS: ${pose.antibodyChains.join(',')}`,
    `REMARK 906 GEOMETRY: minDist=${pose.geometry.minDistance} contacts=${pose.geometry.contactPairs4_5A} clashes=${pose.geometry.hardClashesBelow2A}`,
    `REMARK 907 CONTACT_RESIDUES: ${pose.contactResidues.size}`,
    `REMARK 908 DISPLAY POSE; NOT EXPERIMENTAL`,
    ''
  ].join('\n');

  const body = String(pose.pdbText)
    .replace(/^HEADER.*\n/, '')
    .replace(/^REMARK\s+900.*\n/g, '')
    .replace(/^REMARK\s+901.*\n/g, '')
    .replace(/^REMARK\s+902.*\n/g, '')
    .replace(/^REMARK\s+903.*\n/g, '')
    .replace(/^REMARK\s+904.*\n/g, '')
    .replace(/^REMARK\s+905.*\n/g, '')
    .replace(/^REMARK\s+906.*\n/g, '')
    .replace(/^REMARK\s+907.*\n/g, '')
    .replace(/^REMARK\s+908.*\n/g, '')
    .replace(/^REMARK\s+909.*\n/g, '');

  fs.writeFileSync(outputPath, header + body);
  return fileName;
}

// ─── Target processing ───

function processTarget(targetInfo) {
  const { gene, pdbId, filePath } = targetInfo;
  const safeGene = sanitizeGeneName(gene);
  const outputDir = path.join(OUTPUT_BASE, safeGene);

  const result = {
    gene,
    safeGene,
    pdbId,
    status: 'pending',
    fabCount: 0,
    vhhCount: 0,
    degradation: 'L0',
    poses: [],
    errors: []
  };

  // Read antigen PDB
  let antigenPdbText;
  try {
    antigenPdbText = fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    result.status = 'read_failed';
    result.errors.push(`Failed to read PDB: ${err.message}`);
    return result;
  }

  // Identify antigen chains
  const { antigenChains, antibodyChains } = identifyAntigenChains(antigenPdbText);
  if (antigenChains.length === 0) {
    result.status = 'no_antigen_chains';
    result.errors.push(`No antigen chains identified (all chains: ${antibodyChains.join(',')})`);
    return result;
  }
  if (antigenChains.length > MAX_ANTIGEN_CHAINS) {
    result.status = 'too_many_chains';
    result.errors.push(`Antigen has ${antigenChains.length} chains (max ${MAX_ANTIGEN_CHAINS})`);
    return result;
  }

  result.antigenChains = antigenChains;
  result.antibodyChainsRemoved = antibodyChains;

  // Compute max antigen span
  const antigenOnlyText = proteinLinesForChains(antigenPdbText, antigenChains);
  const maxSpan = matcher.computeMaxSpan(antigenOnlyText, antigenChains);
  result.maxAntigenSpan = maxSpan;

  // Small antigen check and max atom check
  const antigenAtoms = matcher.parsePdbAtoms(antigenOnlyText, antigenChains).filter(a => a.isHeavy);
  if (antigenAtoms.length < 10) {
    result.status = 'antigen_too_small';
    result.errors.push(`Antigen has only ${antigenAtoms.length} heavy atoms`);
    return result;
  }
  if (antigenAtoms.length > MAX_ANTIGEN_ATOMS) {
    result.status = 'antigen_too_large';
    result.errors.push(`Antigen has ${antigenAtoms.length} heavy atoms (max ${MAX_ANTIGEN_ATOMS})`);
    return result;
  }

  // Select scaffolds
  matcher.resetRotationOffset();
  const fabScaffolds = matcher.selectFabScaffolds(gene, FAB_SCAFFOLDS, FAB_OVERSAMPLE);
  const vhhScaffolds = matcher.selectVHHScaffolds(gene, VHH_SCAFFOLDS);

  // Generate Fab candidates (oversample)
  console.log(`    Generating Fab candidates...`);
  const fabCandidates = generateCandidatesForFormat(gene, fabScaffolds, antigenPdbText, antigenChains, FAB_OVERSAMPLE);
  console.log(`    Fab candidates: ${fabCandidates.length}/${FAB_OVERSAMPLE}`);

  // Generate VHH candidates (oversample)
  console.log(`    Generating VHH candidates...`);
  const vhhCandidates = generateCandidatesForFormat(gene, vhhScaffolds, antigenPdbText, antigenChains, VHH_OVERSAMPLE);
  console.log(`    VHH candidates: ${vhhCandidates.length}/${VHH_OVERSAMPLE}`);

  if (fabCandidates.length === 0 && vhhCandidates.length === 0) {
    result.status = 'no_poses_generated';
    result.errors.push('All pose generation failed for both Fab and VHH');
    return result;
  }

  // Validate individual pose geometry
  const validFab = fabCandidates.filter(p => {
    const v = validatePoseGeometry(p);
    return v.valid;
  });
  const validVhh = vhhCandidates.filter(p => {
    const v = validatePoseGeometry(p);
    return v.valid;
  });

  console.log(`    Valid Fab: ${validFab.length}, Valid VHH: ${validVhh.length}`);

  // Select separated poses - Fab first, then VHH considering Fab
  const fabSelection = matcher.selectSeparatedPoses(validFab, FAB_TARGET, maxSpan, {});
  
  // For VHH, consider selected Fab poses as "existing" to ensure cross-format separation
  const selectedFabPoses = fabSelection.selected.slice(0, FAB_TARGET).map(p => ({
    direction: p.direction,
    anchor: p.anchor,
    contactResidues: p.contactResidues,
    geometry: p.geometry
  }));
  const vhhSelection = matcher.selectSeparatedPosesWithExisting(validVhh, selectedFabPoses, VHH_TARGET, maxSpan, {});

  // Use the worse degradation level
  const degradationOrder = ['L0', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6'];
  const fabDeg = fabSelection.degradation;
  const vhhDeg = vhhSelection.degradation;
  result.degradation = degradationOrder.indexOf(fabDeg) >= degradationOrder.indexOf(vhhDeg) ? fabDeg : vhhDeg;

  // Create output directory
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write Fab PDBs
  const selectedFab = fabSelection.selected.slice(0, FAB_TARGET);
  for (let i = 0; i < selectedFab.length; i++) {
    const pose = selectedFab[i];
    const fileName = writeComplexPdb(safeGene, pdbId, pose, i + 1, outputDir);
    result.poses.push({
      fileName,
      scaffold: pose.scaffold,
      format: 'Fab',
      candidateIndex: i + 1,
      antigenChains: pose.antigenChains,
      antibodyChains: pose.antibodyChains,
      geometry: pose.geometry,
      contactResidues: pose.contactResidues.size
    });
  }
  result.fabCount = selectedFab.length;

  // Write VHH PDBs
  const selectedVhh = vhhSelection.selected.slice(0, VHH_TARGET);
  for (let i = 0; i < selectedVhh.length; i++) {
    const pose = selectedVhh[i];
    const fileName = writeComplexPdb(safeGene, pdbId, pose, i + 1, outputDir);
    result.poses.push({
      fileName,
      scaffold: pose.scaffold,
      format: 'VHH',
      candidateIndex: i + 1,
      antigenChains: pose.antigenChains,
      antibodyChains: pose.antibodyChains,
      geometry: pose.geometry,
      contactResidues: pose.contactResidues.size
    });
  }
  result.vhhCount = selectedVhh.length;

  // Final status
  const totalPoses = result.fabCount + result.vhhCount;
  if (totalPoses >= 20) {
    result.status = 'success';
  } else if (totalPoses >= 10) {
    result.status = 'partial';
  } else if (totalPoses > 0) {
    result.status = 'low_candidates';
  } else {
    result.status = 'failed';
  }

  // Validate final separation
  const allSelected = [...selectedFab, ...selectedVhh].map(p => ({
    direction: p.direction,
    anchor: p.anchor,
    contactResidues: p.contactResidues
  }));
  const finalValidation = matcher.validateAllPairs(allSelected, maxSpan, {});
  result.separationValid = finalValidation.valid;
  result.separationViolations = finalValidation.violations.length;

  return result;
}

// ─── Target list ───

function scanAntigenFiles() {
  const files = fs.readdirSync(ANTIGEN_DIR).filter(f => f.endsWith('.pdb'));
  const targets = [];
  for (const file of files) {
    const match = file.match(/^HUMAN-(.+)-RCSB-(.+)\.pdb$/);
    if (!match) continue;
    targets.push({
      gene: match[1],
      pdbId: match[2],
      file: file,
      filePath: path.join(ANTIGEN_DIR, file)
    });
  }
  return targets;
}

// ─── Manifest ───

function writeManifest(results) {
  const manifest = {
    generatedAt: new Date().toISOString(),
    description: 'Batch-generated antigen-antibody display pose complexes (10 Fab + 10 VHH per target)',
    config: {
      fabTarget: FAB_TARGET,
      vhhTarget: VHH_TARGET,
      fabOversample: FAB_OVERSAMPLE,
      vhhOversample: VHH_OVERSAMPLE,
      surfaceSampleCount: SURFACE_SAMPLE_COUNT,
      scaffoldCount: SCAFFOLDS.length,
      fabScaffoldCount: FAB_SCAFFOLDS.length,
      vhhScaffoldCount: VHH_SCAFFOLDS.length
    },
    summary: {
      totalTargets: results.length,
      success: results.filter(r => r.status === 'success').length,
      partial: results.filter(r => r.status === 'partial').length,
      lowCandidates: results.filter(r => r.status === 'low_candidates').length,
      failed: results.filter(r => r.status === 'failed').length,
      skipped: results.filter(r => r.status === 'no_antigen_chains' || r.status === 'antigen_too_small' || r.status === 'read_failed').length,
      totalPoses: results.reduce((sum, r) => sum + r.fabCount + r.vhhCount, 0),
      totalFab: results.reduce((sum, r) => sum + r.fabCount, 0),
      totalVhh: results.reduce((sum, r) => sum + r.vhhCount, 0),
      avgPosesPerTarget: 0,
      degradationStats: {}
    },
    targets: results.map(r => ({
      gene: r.gene,
      pdbId: r.pdbId,
      status: r.status,
      fabCount: r.fabCount,
      vhhCount: r.vhhCount,
      degradation: r.degradation,
      maxAntigenSpan: r.maxAntigenSpan || 0,
      separationValid: r.separationValid !== false,
      separationViolations: r.separationViolations || 0,
      antigenChains: r.antigenChains || [],
      poses: r.poses || [],
      errors: r.errors || []
    }))
  };
  manifest.summary.avgPosesPerTarget = manifest.summary.totalTargets > 0
    ? Number((manifest.summary.totalPoses / manifest.summary.totalTargets).toFixed(1))
    : 0;

  // Degradation stats
  for (const r of results) {
    const deg = r.degradation || 'unknown';
    manifest.summary.degradationStats[deg] = (manifest.summary.degradationStats[deg] || 0) + 1;
  }

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  return manifest;
}

// ─── Summary printing ───

function printSummary(results, elapsedMs) {
  const success = results.filter(r => r.status === 'success').length;
  const partial = results.filter(r => r.status === 'partial').length;
  const failed = results.filter(r => r.status === 'failed').length;
  const skipped = results.filter(r => r.status === 'no_antigen_chains' || r.status === 'antigen_too_small' || r.status === 'read_failed' || r.status === 'no_poses_generated').length;
  const totalPoses = results.reduce((sum, r) => sum + r.fabCount + r.vhhCount, 0);
  const totalFab = results.reduce((sum, r) => sum + r.fabCount, 0);
  const totalVhh = results.reduce((sum, r) => sum + r.vhhCount, 0);

  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║  Batch Generation Summary                                    ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log(`  Total targets:  ${results.length}`);
  console.log(`  Success (20/20): ${success}`);
  console.log(`  Partial (≥10):  ${partial}`);
  console.log(`  Low (<10):      ${results.filter(r => r.status === 'low_candidates').length}`);
  console.log(`  Failed (0):     ${failed}`);
  console.log(`  Skipped:        ${skipped}`);
  console.log(`  Total poses:    ${totalPoses} (${totalFab} Fab + ${totalVhh} VHH)`);
  console.log(`  Avg per target: ${results.length > 0 ? (totalPoses / results.length).toFixed(1) : 0}`);
  console.log(`  Elapsed:        ${(elapsedMs / 1000).toFixed(1)}s`);
  console.log(`  Output dir:     ${OUTPUT_BASE}`);

  // Print geometry stats
  let minDistSum = 0, minDistCount = 0;
  let contactSum = 0;
  let clashCount = 0;
  for (const r of results) {
    for (const p of (r.poses || [])) {
      if (p.geometry) {
        minDistSum += p.geometry.minDistance;
        minDistCount++;
        contactSum += p.geometry.contactPairs4_5A;
        if (p.geometry.hardClashesBelow2A > 0) clashCount++;
      }
    }
  }
  if (minDistCount > 0) {
    console.log(`\n  Geometry validation:`);
    console.log(`    Avg minDist:     ${(minDistSum / minDistCount).toFixed(2)} Å`);
    console.log(`    Avg contacts:    ${(contactSum / minDistCount).toFixed(1)}`);
    console.log(`    Clashes:         ${clashCount} / ${minDistCount}`);
  }

  // Print separation stats
  const sepValid = results.filter(r => r.separationValid !== false).length;
  console.log(`\n  Epitope separation:`);
  console.log(`    Valid:           ${sepValid} / ${results.length}`);
  console.log(`    Violations:      ${results.reduce((s, r) => s + (r.separationViolations || 0), 0)}`);

  // Print degradation stats
  const degStats = {};
  for (const r of results) {
    const d = r.degradation || 'unknown';
    degStats[d] = (degStats[d] || 0) + 1;
  }
  console.log(`\n  Degradation: ${JSON.stringify(degStats)}`);

  // Print failed targets
  const failedTargets = results.filter(r => r.status === 'failed' || r.status === 'low_candidates');
  if (failedTargets.length > 0) {
    console.log(`\n  Failed/low targets:`);
    for (const t of failedTargets.slice(0, 10)) {
      console.log(`    ${t.gene} (${t.pdbId}): ${t.status} - ${(t.errors || []).join('; ')}`);
    }
    if (failedTargets.length > 10) {
      console.log(`    ... and ${failedTargets.length - 10} more`);
    }
  }
}

// ─── Main ───

async function main() {
  const args = process.argv.slice(2);
  const isTest = args.includes('--test');
  const limitIdx = args.indexOf('--limit');
  const limit = limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) : 0;

  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║  Batch Complex Generation                                     ║');
  console.log('║  10 Fab + 10 VHH = 20 poses per target                       ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_BASE)) {
    fs.mkdirSync(OUTPUT_BASE, { recursive: true });
  }

  // Scan antigen files
  console.log('\nScanning antigen PDB files...');
  const allTargets = scanAntigenFiles();
  console.log(`Found ${allTargets.length} antigen PDB files`);

  // Determine batch size
  let targets;
  if (isTest) {
    targets = allTargets.slice(0, 10);
    console.log(`Test mode: processing first 10 targets`);
  } else if (limit > 0) {
    targets = allTargets.slice(0, limit);
    console.log(`Limited mode: processing first ${limit} targets`);
  } else {
    targets = allTargets;
    console.log(`Full mode: processing all ${targets.length} targets`);
  }

  // Process each target
  const startTime = Date.now();
  const results = [];

  for (let i = 0; i < targets.length; i++) {
    const target = targets[i];
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n[${i + 1}/${targets.length}] ${target.gene} (${target.pdbId}) [${elapsed}s elapsed]`);

    try {
      const result = processTarget(target);
      results.push(result);

      const totalPoses = result.fabCount + result.vhhCount;
      console.log(`  → ${result.status}: ${result.fabCount} Fab + ${result.vhhCount} VHH = ${totalPoses} poses [${result.degradation}]`);
      if (result.separationViolations > 0) {
        console.log(`  ⚠ ${result.separationViolations} separation violations`);
      }
    } catch (err) {
      console.error(`  ✗ Fatal error: ${err.message}`);
      results.push({
        gene: target.gene,
        pdbId: target.pdbId,
        status: 'error',
        fabCount: 0,
        vhhCount: 0,
        degradation: 'L6',
        poses: [],
        errors: [err.message]
      });
    }
  }

  const elapsedMs = Date.now() - startTime;

  // Write manifest
  const manifest = writeManifest(results);
  console.log(`\n✓ Manifest written to ${MANIFEST_PATH}`);

  // Print summary
  printSummary(results, elapsedMs);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
