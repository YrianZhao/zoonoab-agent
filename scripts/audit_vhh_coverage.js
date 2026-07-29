'use strict';

const fs = require('fs');
const path = require('path');
const { ROUTES } = require('./generate_route_pdb_presets');

const ROOT = path.resolve(__dirname, '..');
const PDB_DIR = path.join(ROOT, 'pdb');

function scanPdbFiles() {
  const files = fs.readdirSync(PDB_DIR).filter(name => /\.pdb$/i.test(name));
  const fabFiles = [];
  const vhhFiles = [];
  for (const name of files) {
    if (/-VHH-\d+\.pdb$/i.test(name)) {
      vhhFiles.push(name);
    } else if (/-Fab-\d+\.pdb$/i.test(name)) {
      fabFiles.push(name);
    }
  }
  return { fabFiles, vhhFiles, allFiles: files };
}

function routeHasVhh(route, vhhFiles) {
  const vhhPrefix = route.aliasPrefix.replace(/-Fab$/i, '-VHH');
  return vhhFiles.filter(f => f.startsWith(vhhPrefix + '-')).length;
}

function main() {
  const { fabFiles, vhhFiles, allFiles } = scanPdbFiles();
  console.log('=== VHH Coverage Audit Report ===\n');
  console.log('Total PDB files in pdb/:', allFiles.length);
  console.log('Fab route preset files:', fabFiles.length);
  console.log('VHH route preset files:', vhhFiles.length);
  console.log('Routes in generate_route_pdb_presets.js:', ROUTES.length);
  console.log('');

  const report = [];
  let missingVhh = 0;
  let hasVhh = 0;

  for (const route of ROUTES) {
    const fabCount = fabFiles.filter(f => f.startsWith(route.aliasPrefix + '-')).length;
    const vhhCount = routeHasVhh(route, vhhFiles);
    const vhhPrefix = route.aliasPrefix.replace(/-Fab$/i, '-VHH');
    const status = vhhCount > 0 ? 'OK' : 'MISSING';
    if (vhhCount > 0) hasVhh++;
    else missingVhh++;

    report.push({
      id: route.id,
      target: route.target,
      aliasPrefix: route.aliasPrefix,
      vhhPrefix,
      fabCount,
      vhhCount,
      status
    });
  }

  console.log('Routes with VHH structures:', hasVhh);
  console.log('Routes missing VHH structures:', missingVhh);
  console.log('');

  console.log('--- Detailed Report ---');
  console.log('| # | Route ID | Target | Fab Files | VHH Files | Status |');
  console.log('|---|----------|--------|-----------|-----------|--------|');
  for (let i = 0; i < report.length; i++) {
    const r = report[i];
    console.log(`| ${i + 1} | ${r.id} | ${r.target} | ${r.fabCount} | ${r.vhhCount} | ${r.status} |`);
  }

  console.log('\n--- Routes Needing VHH Generation ---');
  const missing = report.filter(r => r.status === 'MISSING');
  for (const r of missing) {
    console.log(`  ${r.id}: ${r.target} (prefix: ${r.vhhPrefix})`);
  }

  const outputPath = path.join(PDB_DIR, 'vhh-coverage-audit.json');
  fs.writeFileSync(outputPath, JSON.stringify({
    generatedAt: new Date().toISOString(),
    totalRoutes: ROUTES.length,
    routesWithVhh: hasVhh,
    routesMissingVhh: missingVhh,
    routes: report
  }, null, 2) + '\n');
  console.log('\nAudit report saved to', outputPath);
}

main();
