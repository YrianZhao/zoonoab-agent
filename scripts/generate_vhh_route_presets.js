'use strict';

const fs = require('fs');
const path = require('path');
const { ROUTES } = require('./generate_route_pdb_presets');
const { generateDisplayPose, FORMAT_DEFAULTS } = require('../lib/display-pose');

const ROOT = path.resolve(__dirname, '..');
const PDB_DIR = path.join(ROOT, 'pdb');
const VHH_SCAFFOLD_FILE = 'IL33-VHH-01.pdb';
const VHH_SCAFFOLD_CHAINS = ['B'];
const CANDIDATES_PER_ROUTE = 10;

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

function buildVhhPdbText(poseResult, route, candidateIdx, antigenChains) {
  const lines = String(poseResult.pdbText).split(/\r?\n/);
  const headerIdx = lines.findIndex(l => l.startsWith('HEADER'));
  if (headerIdx >= 0) {
    lines[headerIdx] = 'HEADER    ZOONOAB ROUTE PRESET ' + route.aliasPrefix.replace(/-Fab$/i, '-VHH');
  }
  const modelIdx = lines.findIndex(l => l.startsWith('MODEL'));
  const insertLines = [
    'REMARK 900 STATIC ROUTE PRESET: ' + route.id,
    'REMARK 900 CANDIDATE INDEX: ' + String(candidateIdx + 1).padStart(2, '0'),
    'REMARK 903 STRUCTURAL BASIS: ' + route.sourceLabel + ' antigen + VHH display scaffold',
    'REMARK 906 VHH DISPLAY POSE GENERATED FROM REAL ANTIGEN STRUCTURE',
    'REMARK 907 GEOMETRY MIN_DISTANCE_A: ' + poseResult.pose.geometry.minDistance.toFixed(3) +
      ' CONTACTS_4_5A: ' + poseResult.pose.geometry.contactPairs4_5A +
      ' CONTACTS_6_0A: ' + poseResult.pose.geometry.nearPairs6A +
      ' HARD_CLASHES_LT_2_0A: ' + poseResult.pose.geometry.hardClashesBelow2A
  ];
  if (modelIdx >= 0) {
    lines.splice(modelIdx, 0, ...insertLines);
  }
  return lines.join('\n') + (lines[lines.length - 1] === '' ? '' : '\n');
}

function generateForRoute(route) {
  const fabFile = path.join(PDB_DIR, route.aliasPrefix + '-01.pdb');
  if (!fs.existsSync(fabFile)) {
    console.warn('  SKIP: Fab source file not found: ' + route.aliasPrefix + '-01.pdb');
    return { route: route.id, generated: 0, failed: 0, errors: ['Source file not found'] };
  }

  const fabText = fs.readFileSync(fabFile, 'utf8');
  const antigenPdbText = proteinLinesForChains(fabText, route.antigenChains);
  if (!antigenPdbText.trim()) {
    console.warn('  SKIP: No antigen atoms found in ' + route.aliasPrefix + '-01.pdb for chains ' + route.antigenChains.join(','));
    return { route: route.id, generated: 0, failed: 0, errors: ['No antigen atoms'] };
  }

  const scaffoldText = fs.readFileSync(path.join(PDB_DIR, VHH_SCAFFOLD_FILE), 'utf8');
  const scaffoldPdbText = extractScaffoldChains(scaffoldText, VHH_SCAFFOLD_CHAINS);

  const vhhPrefix = route.aliasPrefix.replace(/-Fab$/i, '-VHH');
  const manifest = [];
  let generated = 0;
  let failed = 0;
  const errors = [];

  for (let idx = 0; idx < CANDIDATES_PER_ROUTE; idx++) {
    const seed = route.id + '-vhh-v1';
    const candidateIndex = idx + 1;
    const result = generateDisplayPose({
      antigenPdbText,
      antigenChains: route.antigenChains,
      antibodyFormat: 'VHH',
      scaffoldPdbText,
      scaffoldAntibodyChains: VHH_SCAFFOLD_CHAINS,
      seed,
      candidateIndex,
      sourceMetadata: {
        target: route.target,
        antigenSource: route.aliasPrefix + '-01.pdb antigen chains ' + route.antigenChains.join(','),
        scaffoldSource: VHH_SCAFFOLD_FILE + ' chain ' + VHH_SCAFFOLD_CHAINS.join(',')
      }
    });

    if (!result.ok) {
      const altSeed = route.id + '-vhh-alt-' + idx;
      const altResult = generateDisplayPose({
        antigenPdbText,
        antigenChains: route.antigenChains,
        antibodyFormat: 'VHH',
        scaffoldPdbText,
        scaffoldAntibodyChains: VHH_SCAFFOLD_CHAINS,
        seed: altSeed,
        candidateIndex: idx + 1,
        sourceMetadata: {
          target: route.target,
          antigenSource: route.aliasPrefix + '-01.pdb antigen chains ' + route.antigenChains.join(','),
          scaffoldSource: VHH_SCAFFOLD_FILE + ' chain ' + VHH_SCAFFOLD_CHAINS.join(',')
        }
      });
      if (!altResult.ok) {
        failed++;
        errors.push('Candidate ' + (idx + 1) + ': ' + (result.error && result.error.message || 'Unknown error'));
        continue;
      }
      const pdbText = buildVhhPdbText(altResult, route, idx, route.antigenChains);
      const filename = vhhPrefix + '-' + String(idx + 1).padStart(2, '0') + '.pdb';
      fs.writeFileSync(path.join(PDB_DIR, filename), pdbText);
      generated++;
      manifest.push({
        filename,
        routeId: route.id,
        target: route.target,
        vhhPrefix,
        candidateIndex: idx + 1,
        antigenChains: altResult.antigenChains,
        antibodyChains: altResult.antibodyChains,
        geometry: {
          minDistance: altResult.pose.geometry.minDistance,
          contactPairs: altResult.pose.geometry.contactPairs4_5A,
          nearPairs: altResult.pose.geometry.nearPairs6A,
          hardClashes: altResult.pose.geometry.hardClashesBelow2A
        }
      });
      continue;
    }

    const pdbText = buildVhhPdbText(result, route, idx, route.antigenChains);
    const filename = vhhPrefix + '-' + String(idx + 1).padStart(2, '0') + '.pdb';
    fs.writeFileSync(path.join(PDB_DIR, filename), pdbText);
    generated++;
    manifest.push({
      filename,
      routeId: route.id,
      target: route.target,
      vhhPrefix,
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

  return { route: route.id, target: route.target, vhhPrefix, generated, failed, errors, manifest };
}

function main() {
  const routeFilter = String(process.env.ROUTE_FILTER || process.argv[2] || '').trim();
  const selectedRoutes = routeFilter
    ? ROUTES.filter(r => r.id === routeFilter || r.aliasPrefix === routeFilter)
    : ROUTES;

  console.log('Generating VHH route preset PDB files for ' + selectedRoutes.length + ' routes...');
  console.log('VHH scaffold: ' + VHH_SCAFFOLD_FILE + ' (chain ' + VHH_SCAFFOLD_CHAINS.join(',') + ')');
  console.log('Candidates per route: ' + CANDIDATES_PER_ROUTE);
  console.log('');

  const allManifest = [];
  let totalGenerated = 0;
  let totalFailed = 0;

  for (const route of selectedRoutes) {
    const vhhPrefix = route.aliasPrefix.replace(/-Fab$/i, '-VHH');
    const existing = fs.readdirSync(PDB_DIR).filter(f => f.startsWith(vhhPrefix + '-') && /\.pdb$/i.test(f));
    if (existing.length >= CANDIDATES_PER_ROUTE) {
      console.log('SKIP ' + route.id + ' (' + route.target + '): already has ' + existing.length + ' VHH files');
      continue;
    }

    console.log('Processing ' + route.id + ' (' + route.target + ') -> ' + vhhPrefix + '...');
    const result = generateForRoute(route);
    totalGenerated += result.generated;
    totalFailed += result.failed;
    if (result.generated > 0) {
      console.log('  Generated ' + result.generated + '/' + CANDIDATES_PER_ROUTE + ' VHH candidates');
    }
    if (result.failed > 0) {
      console.log('  Failed: ' + result.failed + ' candidates');
      result.errors.slice(0, 3).forEach(e => console.log('    - ' + e));
    }
    allManifest.push(...(result.manifest || []));
  }

  const manifestPath = path.join(PDB_DIR, 'vhh-route-presets-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify({
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    purpose: 'VHH nanobody display pose structures for route-aligned molecular design demonstration',
    scaffold: { file: VHH_SCAFFOLD_FILE, chains: VHH_SCAFFOLD_CHAINS },
    candidatesPerRoute: CANDIDATES_PER_ROUTE,
    summary: {
      totalRoutes: selectedRoutes.length,
      totalGenerated,
      totalFailed
    },
    models: allManifest
  }, null, 2) + '\n');

  console.log('\n=== Summary ===');
  console.log('Total VHH files generated: ' + totalGenerated);
  console.log('Total failures: ' + totalFailed);
  console.log('Manifest saved to: ' + manifestPath);
}

main();
