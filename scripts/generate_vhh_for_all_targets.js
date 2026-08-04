'use strict';

/**
 * Generates VHH nanobody PDB files for ALL targets that have Fab files but no VHH files.
 *
 * This script scans pdb/ for *-Fab-01.pdb files without corresponding *-VHH-01.pdb,
 * extracts antigen chains from the Fab file's REMARK 904, and generates 10 VHH
 * display-pose candidates per target using IL33-VHH-01.pdb as the nanobody scaffold.
 *
 * Usage:
 *   node scripts/generate_vhh_for_all_targets.js              # generate all missing
 *   node scripts/generate_vhh_for_all_targets.js TMV-CP       # generate one target
 *   ROUTTE_FILTER=TMV-CP node scripts/generate_vhh_for_all_targets.js
 */

const fs = require('fs');
const path = require('path');
const { generateDisplayPose } = require('../lib/display-pose');

const ROOT = path.resolve(__dirname, '..');
const PDB_DIR = path.join(ROOT, 'pdb');
const VHH_SCAFFOLD_FILE = 'IL33-VHH-01.pdb';
const VHH_SCAFFOLD_CHAINS = ['B'];
const CANDIDATES_PER_ROUTE = 10;

// ---------------------------------------------------------------------------
// PDB helpers
// ---------------------------------------------------------------------------

function proteinLinesForChains(pdbText, chains) {
  const allowed = new Set(chains);
  return String(pdbText)
    .split(/\r?\n/)
    .filter(line => {
      if (!/^(?:ATOM  |HETATM|ANISOU|TER)/.test(line)) return false;
      if (/^(?:ATOM  |HETATM|ANISOU)/.test(line)) {
        return allowed.has(line[21] || ' ');
      }
      return true;
    })
    .join('\n')
    .trimEnd() + '\n';
}

function extractScaffoldChains(pdbText, chains) {
  const allowed = new Set(chains);
  const lines = String(pdbText).split(/\r?\n/);
  const result = [];
  let inModel = false;
  for (const line of lines) {
    if (line.startsWith('MODEL')) { inModel = true; continue; }
    if (line.startsWith('ENDMDL')) { break; }
    if (!inModel && (line.startsWith('ATOM  ') || line.startsWith('HETATM'))) {
      if (allowed.has(line[21] || ' ')) result.push(line);
    }
    if (inModel && (line.startsWith('ATOM  ') || line.startsWith('HETATM'))) {
      if (allowed.has(line[21] || ' ')) result.push(line);
    }
  }
  return result.join('\n') + '\nTER\n';
}

function buildVhhPdbText(poseResult, targetInfo, candidateIdx) {
  const lines = String(poseResult.pdbText).split(/\r?\n/);
  const headerIdx = lines.findIndex(l => l.startsWith('HEADER'));
  if (headerIdx >= 0) {
    lines[headerIdx] = 'HEADER    ZOONOAB ROUTE PRESET ' + targetInfo.vhhPrefix;
  }
  const modelIdx = lines.findIndex(l => l.startsWith('MODEL'));
  const insertLines = [
    'REMARK 900 STATIC ROUTE PRESET: ' + targetInfo.routeId,
    'REMARK 900 CANDIDATE INDEX: ' + String(candidateIdx + 1).padStart(2, '0'),
    'REMARK 901 TARGET: ' + targetInfo.target,
    'REMARK 902 FORMAT: VHH',
    'REMARK 903 STRUCTURAL BASIS: ' + targetInfo.sourceLabel + ' antigen + VHH display scaffold',
    'REMARK 903 SCAFFOLD SOURCE: ' + VHH_SCAFFOLD_FILE + ' chain ' + VHH_SCAFFOLD_CHAINS.join(','),
    'REMARK 904 ANTIGEN CHAINS: ' + targetInfo.antigenChains.join(','),
    'REMARK 905 ANTIBODY CHAINS: B',
    'REMARK 906 VHH DISPLAY POSE GENERATED FROM REAL ANTIGEN STRUCTURE',
    'REMARK 907 GEOMETRY MIN_DISTANCE_A: ' + poseResult.pose.geometry.minDistance.toFixed(3) +
      ' CONTACTS_4_5A: ' + poseResult.pose.geometry.contactPairs4_5A +
      ' CONTACTS_6_0A: ' + poseResult.pose.geometry.nearPairs6A +
      ' HARD_CLASHES_LT_2_0A: ' + poseResult.pose.geometry.hardClashesBelow2A,
    'REMARK 909 NOT AN EXPERIMENTAL COMPLEX OR A PREDICTED AFFINITY CLAIM'
  ];
  if (modelIdx >= 0) {
    lines.splice(modelIdx, 0, ...insertLines);
  }
  return lines.join('\n') + (lines[lines.length - 1] === '' ? '' : '\n');
}

// ---------------------------------------------------------------------------
// Target scanning
// ---------------------------------------------------------------------------

function scanMissingTargets() {
  const allFiles = fs.readdirSync(PDB_DIR);
  const vhhFiles = new Set(allFiles.filter(f => /-VHH-\d+\.pdb$/i.test(f)));
  const fab01Files = allFiles.filter(f => /-Fab-01\.pdb$/i.test(f)).sort();

  const targets = [];

  for (const fabFile of fab01Files) {
    const prefix = fabFile.replace(/-Fab-01\.pdb$/i, ''); // e.g. TMV-CP
    const vhhPrefix = prefix + '-VHH';
    const vhh01 = vhhPrefix + '-01.pdb';

    // Skip if VHH already exists
    if (vhhFiles.has(vhh01)) continue;

    const fabPath = path.join(PDB_DIR, fabFile);
    const fabContent = fs.readFileSync(fabPath, 'utf8');

    // Extract antigen chains from REMARK 904
    const antigenMatch = fabContent.match(/REMARK 904\s+ANTIGEN CHAINS:\s*(.+)/i);
    if (!antigenMatch) {
      console.warn('  SKIP ' + prefix + ': no REMARK 904 antigen chains found');
      continue;
    }
    const antigenChains = antigenMatch[1].trim().split(/[,\s]+/).map(s => s.trim()).filter(Boolean);
    if (!antigenChains.length) {
      console.warn('  SKIP ' + prefix + ': empty antigen chain list');
      continue;
    }

    // Extract target name from REMARK 901
    const targetMatch = fabContent.match(/REMARK 901\s+TARGET:\s*(.+)/i);
    const target = targetMatch ? targetMatch[1].trim() : prefix;

    // Extract source label from REMARK 903
    const sourceMatch = fabContent.match(/REMARK 903\s+STRUCTURAL BASIS:\s*(.+)/i);
    const sourceLabel = sourceMatch ? sourceMatch[1].trim() : prefix + ' antigen + VHH display scaffold';

    // Generate route ID from prefix
    const routeId = prefix.toLowerCase().replace(/[^a-z0-9]+/g, '_') + '_vhh';

    targets.push({
      prefix,
      fabFile,
      vhhPrefix,
      routeId,
      target,
      sourceLabel,
      antigenChains
    });
  }

  return targets;
}

// ---------------------------------------------------------------------------
// VHH generation
// ---------------------------------------------------------------------------

function generateForTarget(targetInfo, scaffoldText, scaffoldPdbText) {
  const fabPath = path.join(PDB_DIR, targetInfo.fabFile);
  const fabText = fs.readFileSync(fabPath, 'utf8');
  const antigenPdbText = proteinLinesForChains(fabText, targetInfo.antigenChains);

  if (!antigenPdbText.trim()) {
    return { generated: 0, failed: 0, errors: ['No antigen atoms extracted'], manifest: [] };
  }

  const manifest = [];
  let generated = 0;
  let failed = 0;
  const errors = [];

  for (let idx = 0; idx < CANDIDATES_PER_ROUTE; idx++) {
    const seed = targetInfo.routeId + '-vhh-v1';
    const candidateIndex = idx + 1;

    let result = generateDisplayPose({
      antigenPdbText,
      antigenChains: targetInfo.antigenChains,
      antibodyFormat: 'VHH',
      scaffoldPdbText,
      scaffoldAntibodyChains: VHH_SCAFFOLD_CHAINS,
      seed,
      candidateIndex,
      sourceMetadata: {
        target: targetInfo.target,
        antigenSource: targetInfo.fabFile + ' antigen chains ' + targetInfo.antigenChains.join(','),
        scaffoldSource: VHH_SCAFFOLD_FILE + ' chain ' + VHH_SCAFFOLD_CHAINS.join(',')
      }
    });

    if (!result.ok) {
      // Try alternate seed
      const altSeed = targetInfo.routeId + '-vhh-alt-' + idx;
      result = generateDisplayPose({
        antigenPdbText,
        antigenChains: targetInfo.antigenChains,
        antibodyFormat: 'VHH',
        scaffoldPdbText,
        scaffoldAntibodyChains: VHH_SCAFFOLD_CHAINS,
        seed: altSeed,
        candidateIndex: idx + 1,
        sourceMetadata: {
          target: targetInfo.target,
          antigenSource: targetInfo.fabFile + ' antigen chains ' + targetInfo.antigenChains.join(','),
          scaffoldSource: VHH_SCAFFOLD_FILE + ' chain ' + VHH_SCAFFOLD_CHAINS.join(',')
        }
      });
    }

    if (!result.ok) {
      failed++;
      errors.push('Candidate ' + (idx + 1) + ': ' + (result.error && result.error.message || 'Unknown error'));
      continue;
    }

    const pdbText = buildVhhPdbText(result, targetInfo, idx);
    const filename = targetInfo.vhhPrefix + '-' + String(idx + 1).padStart(2, '0') + '.pdb';
    fs.writeFileSync(path.join(PDB_DIR, filename), pdbText);
    generated++;

    manifest.push({
      filename,
      routeId: targetInfo.routeId,
      target: targetInfo.target,
      fabPrefix: targetInfo.prefix + '-Fab',
      vhhPrefix: targetInfo.vhhPrefix,
      candidateIndex: idx + 1,
      antigenChains: result.antigenChains,
      antibodyChains: result.antibodyChains,
      geometry: {
        minDistance: result.pose.geometry.minDistance,
        contactPairs: result.pose.geometry.contactPairs4_5A,
        nearPairs: result.pose.geometry.nearPairs6A,
        hardClashes: result.pose.geometry.hardClashesBelow2A
      }
    });
  }

  return { generated, failed, errors, manifest };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const filterArg = String(process.env.ROUTE_FILTER || process.argv[2] || '').trim();

  // Load scaffold
  const scaffoldPath = path.join(PDB_DIR, VHH_SCAFFOLD_FILE);
  if (!fs.existsSync(scaffoldPath)) {
    console.error('FATAL: VHH scaffold file not found: ' + VHH_SCAFFOLD_FILE);
    process.exit(1);
  }
  const scaffoldText = fs.readFileSync(scaffoldPath, 'utf8');
  const scaffoldPdbText = extractScaffoldChains(scaffoldText, VHH_SCAFFOLD_CHAINS);

  // Scan for missing targets
  let targets = scanMissingTargets();
  if (filterArg) {
    targets = targets.filter(t =>
      t.prefix === filterArg ||
      t.prefix.toLowerCase() === filterArg.toLowerCase() ||
      t.vhhPrefix.toLowerCase() === filterArg.toLowerCase()
    );
  }

  console.log('VHH scaffold: ' + VHH_SCAFFOLD_FILE + ' (chain ' + VHH_SCAFFOLD_CHAINS.join(',') + ')');
  console.log('Candidates per target: ' + CANDIDATES_PER_ROUTE);
  console.log('Targets needing VHH: ' + targets.length);
  console.log('');

  if (!targets.length) {
    console.log('All targets already have VHH files. Nothing to do.');
    return;
  }

  const allManifest = [];
  let totalGenerated = 0;
  let totalFailed = 0;
  const failedTargets = [];

  for (const target of targets) {
    console.log('Processing ' + target.prefix + ' (' + target.target + ') -> ' + target.vhhPrefix + '...');
    const result = generateForTarget(target, scaffoldText, scaffoldPdbText);
    totalGenerated += result.generated;
    totalFailed += result.failed;

    if (result.generated > 0) {
      console.log('  Generated ' + result.generated + '/' + CANDIDATES_PER_ROUTE + ' VHH candidates');
    }
    if (result.failed > 0) {
      console.log('  Failed: ' + result.failed + ' candidates');
      result.errors.slice(0, 3).forEach(e => console.log('    - ' + e));
      if (result.generated === 0) failedTargets.push(target.prefix);
    }
    allManifest.push(...result.manifest);
  }

  // Merge into manifest
  const manifestPath = path.join(PDB_DIR, 'vhh-route-presets-manifest.json');
  let existingManifest = { models: [] };
  if (fs.existsSync(manifestPath)) {
    try {
      existingManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      if (!Array.isArray(existingManifest.models)) existingManifest.models = [];
    } catch (e) {
      console.warn('Warning: could not parse existing manifest, starting fresh');
    }
  }

  // Deduplicate: remove old entries for targets we just generated
  const newPrefixes = new Set(targets.map(t => t.vhhPrefix));
  const filteredModels = existingManifest.models.filter(m => !newPrefixes.has(m.vhhPrefix));
  existingManifest.models = [...filteredModels, ...allManifest];
  existingManifest.generatedAt = new Date().toISOString();
  existingManifest.summary = {
    ...existingManifest.summary,
    totalGenerated: (existingManifest.summary?.totalGenerated || 0) + totalGenerated,
    totalFailed: (existingManifest.summary?.totalFailed || 0) + totalFailed
  };

  fs.writeFileSync(manifestPath, JSON.stringify(existingManifest, null, 2) + '\n');

  console.log('\n=== Summary ===');
  console.log('Total VHH files generated: ' + totalGenerated);
  console.log('Total failures: ' + totalFailed);
  if (failedTargets.length) {
    console.log('Targets with 0 VHH generated: ' + failedTargets.join(', '));
  }
  console.log('Manifest updated: ' + manifestPath);
}

main();
