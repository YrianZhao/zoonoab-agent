'use strict';

/**
 * Repair antigen-antibody binding/interface problems in pdb/expanded PDB files.
 *
 * Fixes (per file, geometry re-verified after every step):
 *   P1 ONLY_ANTIGEN      -> place a library antibody scaffold onto the antigen
 *   P1 ONLY_ANTIBODY     -> NOT auto-repaired (cannot fabricate target antigen) -> reported
 *   P2 MULTIPLE_ANTIBODY -> drop extra antibody units, keep best-contacting one
 *   P3 MULTIPLE_ANTIGEN  -> drop extra antigen molecules, keep best-contacting one
 *   P4A TOO_FAR          -> rigid-translate antibody toward antigen; else re-place
 *   P4B OVERLAP          -> re-place existing antibody onto antigen surface
 *
 * Default is DRY-RUN (writes a plan JSON only). Pass --write to apply, with .bak backup.
 *
 * Usage:
 *   node scripts/repair_complex_bindings.js --from-report .runtime/scan-full.json --dry-run --out .runtime/repair-plan.json
 *   node scripts/repair_complex_bindings.js --from-report .runtime/scan-full.json --write --backup
 *   node scripts/repair_complex_bindings.js --target GP1BB --dry-run
 */

const fs = require('fs');
const path = require('path');
const {
  parseRoleRemarks,
  analyzeComplexText,
  analyzeComplexEntities,
  measureInterfaceGeometry,
  thresholdsForFormat,
  splitChainList,
  splitHeavyByChain,
  clusterChainsByContact,
  createAntibodyTranslationPlan,
  applyAntibodyTranslation
} = require('../lib/pdb-complex-geometry');
const { generateDisplayPose } = require('../lib/display-pose');
const { analyzeFileText, DEFAULTS } = require('./scan_complex_bindings');

const ROOT = path.resolve(__dirname, '..');
const PDB_DIR = path.join(ROOT, 'pdb');
const EXPANDED_DIR = path.join(PDB_DIR, 'expanded');

// Antibody scaffold library (mirrors scripts/build_antigen_display_pose_library.js SCAFFOLDS).
// `file` is relative to pdb/. `chains` = antibody chains within that file.
const SCAFFOLDS = [
  { name: 'trastuzumab',  file: 'HER2-Fab-01.pdb',  chains: ['B', 'C'], format: 'Fab' },
  { name: 'cetuximab',    file: 'EGFR-Fab-01.pdb',  chains: ['B', 'C'], format: 'Fab' },
  { name: 'bevacizumab',  file: 'VEGFA-Fab-01.pdb', chains: ['B', 'C'], format: 'Fab' },
  { name: 'certolizumab', file: 'TNF-Fab-01.pdb',   chains: ['B', 'C'], format: 'Fab' },
  { name: 'nivolumab',    file: 'PD1-Fab-01.pdb',   chains: ['B', 'C'], format: 'Fab' },
  { name: 'ipilimumab',   file: 'CTLA4-Fab-01.pdb', chains: ['B', 'C'], format: 'Fab' },
  { name: 'daratumumab',  file: 'CD38-Fab-01.pdb',  chains: ['B', 'C'], format: 'Fab' },
  { name: 'tozorakimab',  file: 'IL33-Fab-01.pdb',  chains: ['B', 'C'], format: 'Fab' },
  { name: 'fluha',        file: 'FluHA-Fab-01.pdb', chains: ['B', 'C'], format: 'Fab' },
  { name: 'bcma',         file: 'BCMA-Fab-01.pdb',  chains: ['B', 'C'], format: 'Fab' },
  { name: 'il13',         file: 'IL13-Fab-01.pdb',  chains: ['H', 'L'], format: 'Fab' },
  { name: 'fcrn',         file: 'FCRN-Fab-01.pdb',  chains: ['H', 'L'], format: 'Fab' },
  { name: 'gipr',         file: 'GIPR-Fab-01.pdb',  chains: ['B', 'C'], format: 'Fab' },
  { name: 'her3',         file: 'HER3-Fab-01.pdb',  chains: ['B', 'C'], format: 'Fab' },
  { name: 'cd47',         file: 'CD47-Fab-01.pdb',  chains: ['B', 'C'], format: 'Fab' },
  { name: 'cgrpr',        file: 'CGRPR-Fab-01.pdb', chains: ['B', 'C'], format: 'Fab' },
  { name: 'il6r',         file: 'IL6R-Fab-01.pdb',  chains: ['B', 'C'], format: 'Fab' },
  { name: 'b7h6',         file: 'B7H6-Fab-01.pdb',  chains: ['A', 'B'], format: 'Fab' },
  { name: 'cd19',         file: 'CD19-Fab-01.pdb',  chains: ['B', 'C'], format: 'Fab' },
  { name: 'tigit',        file: 'TIGIT-Fab-01.pdb', chains: ['B', 'C'], format: 'Fab' },
  { name: 'gprc5d',       file: 'GPRC5D-Fab-01.pdb',chains: ['C', 'D'], format: 'Fab' },
  { name: 'rsvf',         file: 'RSVF-Fab-01.pdb',  chains: ['B', 'C'], format: 'Fab' },
  { name: 'IL33-vhh',     file: 'IL33-VHH-01.pdb',  chains: ['B'],      format: 'VHH' },
  { name: 'TSLP-vhh',     file: 'TSLP-VHH-01.pdb',  chains: ['B'],      format: 'VHH' },
  { name: 'nb-7d12',      file: 'scaffolds/SCAFFOLD-VHH-nb-7d12.pdb',  chains: ['A'], format: 'VHH' },
  { name: 'cab-lys3',     file: 'scaffolds/SCAFFOLD-VHH-cab-lys3.pdb', chains: ['A'], format: 'VHH' },
  { name: 'cab-rn05',     file: 'scaffolds/SCAFFOLD-VHH-cab-rn05.pdb', chains: ['B'], format: 'VHH' },
  { name: 'nb-tnf3',      file: 'scaffolds/SCAFFOLD-VHH-nb-tnf3.pdb',  chains: ['D'], format: 'VHH' },
  { name: 'cab-bcii',     file: 'scaffolds/SCAFFOLD-VHH-cab-bcii.pdb', chains: ['A'], format: 'VHH' },
  { name: 'nb80',         file: 'scaffolds/SCAFFOLD-VHH-nb80.pdb',     chains: ['B'], format: 'VHH' },
  { name: 'mu551',        file: 'scaffolds/SCAFFOLD-VHH-mu551.pdb',    chains: ['B'], format: 'VHH' },
  { name: 'clec4f',       file: 'scaffolds/SCAFFOLD-VHH-clec4f.pdb',   chains: ['A'], format: 'VHH' }
];

// ─── CLI ───
function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token.startsWith('--')) {
      const key = token.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) args[key] = true;
      else { args[key] = next; i += 1; }
    } else args._.push(token);
  }
  return args;
}
function numArg(args, key, fallback) {
  const value = Number(args[key]);
  return Number.isFinite(value) ? value : fallback;
}

// ─── text helpers ───
function isAtom(line) { return line.startsWith('ATOM  ') || line.startsWith('HETATM'); }
function chainOf(line, column) { return (line.padEnd(80, ' ')[column] || ' '); }

function dropChainsFromText(text, dropChains, chainColumn) {
  const drop = new Set(dropChains);
  return String(text).split(/\r?\n/)
    .map(line => (isAtom(line) && drop.has(chainOf(line, chainColumn))) ? null : line)
    .filter(line => line !== null)
    .join('\n');
}

function filterChainsPdb(text, keepChains, chainColumn) {
  const keep = new Set(keepChains);
  const lines = String(text).split(/\r?\n/);
  const out = ['MODEL        1'];
  for (const line of lines) {
    if (isAtom(line) && keep.has(chainOf(line, chainColumn))) out.push(line);
  }
  out.push('ENDMDL', 'END', '');
  return out.join('\n');
}

function rewriteRoleRemarks(text, antigenChains, antibodyChains) {
  const lines = String(text).split(/\r?\n/);
  let saw904 = false;
  let saw905 = false;
  const out = lines.map(line => {
    if (/^REMARK\s+904\b/.test(line)) { saw904 = true; return 'REMARK 904 ANTIGEN CHAINS: ' + antigenChains.join(','); }
    if (/^REMARK\s+905\b/.test(line)) { saw905 = true; return 'REMARK 905 ANTIBODY CHAINS: ' + antibodyChains.join(','); }
    return line;
  });
  if (!saw904) out.splice(1, 0, 'REMARK 904 ANTIGEN CHAINS: ' + antigenChains.join(','));
  if (!saw905) out.splice(1, 0, 'REMARK 905 ANTIBODY CHAINS: ' + antibodyChains.join(','));
  return out.join('\n');
}

// contacts (4.5A pairs) between two record sets, heavy atoms only
function contactPairsBetween(recordsA, recordsB, format) {
  const thresholds = thresholdsForFormat(format);
  const a = recordsA.filter(r => r.isHeavy !== false);
  const b = recordsB.filter(r => r.isHeavy !== false);
  if (!a.length || !b.length) return 0;
  return measureInterfaceGeometry(a, b, thresholds).contactPairs;
}

function recordsForChains(allRecords, chains) {
  const allowed = new Set(chains);
  return allRecords.filter(r => allowed.has(r.chain));
}

// ─── scaffold placement ───
function readScaffoldText(scaffold) {
  const full = path.join(PDB_DIR, scaffold.file);
  try { return fs.readFileSync(full, 'utf8'); } catch (err) { return null; }
}

function tryPlace(antigenPdbText, antigenChains, scaffoldPdbText, scaffoldChains, format, sourceMeta, seed) {
  const result = generateDisplayPose({
    antibodyFormat: format,
    antigenChains,
    antigenPdbText,
    scaffoldAntibodyChains: scaffoldChains,
    scaffoldPdbText,
    seed: seed || 'repair',
    candidateIndex: 1,
    sourceMetadata: sourceMeta || {}
  });
  if (!result || !result.ok) return null;
  return result.pdbText;
}

// Place a fresh library scaffold onto an existing antigen. Tries several scaffolds.
function placeLibraryScaffold(originalText, analysis, opts) {
  const antigenChains = analysis.roles.antigenChains;
  const format = analysis.format;
  const target = analysis.target || 'target';
  const sourceMeta = { target, antigenSource: path.basename(analysis.file), scaffoldSource: 'repair-library' };
  const candidates = SCAFFOLDS.filter(s => s.format === format);
  for (let i = 0; i < candidates.length; i += 1) {
    const scaffold = candidates[(i + Math.abs(hashCode(target))) % candidates.length];
    const scaffoldText = readScaffoldText(scaffold);
    if (!scaffoldText) continue;
    const placed = tryPlace(originalText, antigenChains, scaffoldText, scaffold.chains, format, sourceMeta, 'repair-' + target);
    if (placed) return { text: placed, scaffold: scaffold.name };
  }
  return null;
}

// Re-place the EXISTING antibody onto the antigen surface (preserves antibody identity).
function replaceExistingAntibody(originalText, analysis, opts) {
  const antigenChains = analysis.roles.antigenChains;
  const antibodyChains = analysis.roles.antibodyChains;
  const format = analysis.format;
  if (!antigenChains.length || !antibodyChains.length) return null;
  if (format === 'Fab' && antibodyChains.length < 2) return null;
  if (format === 'VHH' && antibodyChains.length !== 1) return null;
  const column = analysis.roles.chainColumn || 21;
  const scaffoldText = filterChainsPdb(originalText, antibodyChains, column);
  const target = analysis.target || 'target';
  const sourceMeta = { target, antigenSource: path.basename(analysis.file), scaffoldSource: 'existing-antibody' };
  const placed = tryPlace(originalText, antigenChains, scaffoldText, antibodyChains, format, sourceMeta, 'replace-' + target);
  return placed ? { text: placed } : null;
}

function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return h;
}

// ─── per-file repair ───
function repairFileText(originalText, filePath, opts) {
  const meta = parseRoleRemarks(originalText);
  const target = meta.target || path.basename(path.dirname(filePath));
  const format = meta.format;
  const analysis = analyzeComplexText(originalText, { file: filePath });
  const chainColumn = analysis.roles.chainColumn || 21;
  const before = analyzeFileText(originalText, filePath, opts);
  const record = {
    file: path.relative(ROOT, filePath),
    target,
    format,
    beforeProblems: before.problems.map(p => p.type),
    beforeGeometry: before.geometry,
    actions: [],
    outcome: null,
    afterGeometry: null,
    changed: false
  };

  // Nothing to do
  if (!before.problems.length) {
    record.outcome = 'NO_PROBLEM';
    return record;
  }

  let text = originalText;
  const problemTypes = new Set(before.problems.map(p => p.type));

  const ws = analysis._workingSet;
  const allRecords = ws && ws.records ? ws.records : [];

  // P1 ONLY_ANTIBODY: cannot fabricate antigen
  const onlyAntibody = before.problems.some(p => p.type === 'P1_MISSING_PARTNER' && p.detail && p.detail.side === 'ONLY_ANTIBODY');
  if (onlyAntibody) {
    record.outcome = 'UNREPAIRABLE_MISSING_ANTIGEN';
    return record;
  }

  // P1 ONLY_ANTIGEN: add a library scaffold
  const onlyAntigen = before.problems.some(p => p.type === 'P1_MISSING_PARTNER' && p.detail && p.detail.side === 'ONLY_ANTIGEN');
  if (onlyAntigen) {
    const placed = placeLibraryScaffold(text, analysis, opts);
    if (!placed) { record.outcome = 'REPAIR_FAILED'; record.actions.push({ step: 'add_scaffold', ok: false }); return record; }
    text = placed.text;
    record.actions.push({ step: 'add_scaffold', ok: true, scaffold: placed.scaffold });
    record.changed = true;
    return verifyAndFinalize(text, filePath, record, opts);
  }

  // P2/P3: trim extra entities
  const entities = analyzeComplexEntities(analysis, opts.moleculeGap);
  if (entities && (entities.multipleAntigen || entities.multipleAntibody) && allRecords.length) {
    // choose antibody unit with max contacts to antigen (all antigen atoms)
    const antigenRecords = recordsForChains(allRecords, analysis.roles.antigenChains);
    let dropAntibody = [];
    if (entities.multipleAntibody && entities.antibodyUnits.length > 1) {
      let bestIdx = 0;
      let bestContacts = -1;
      entities.antibodyUnits.forEach((unit, i) => {
        const recs = recordsForChains(allRecords, unit.chains);
        const c = contactPairsBetween(antigenRecords, recs, format);
        if (c > bestContacts) { bestContacts = c; bestIdx = i; }
      });
      entities.antibodyUnits.forEach((unit, i) => { if (i !== bestIdx) dropAntibody.push(...unit.chains); });
    }
    // recompute antigen molecules after antibody trim is not necessary; choose antigen molecule with max contacts to kept antibody
    const keptAntibodyChains = analysis.roles.antibodyChains.filter(c => !dropAntibody.includes(c));
    const antibodyRecords = recordsForChains(allRecords, keptAntibodyChains);
    let dropAntigen = [];
    if (entities.multipleAntigen && entities.antigenMolecules.length > 1) {
      let bestIdx = 0;
      let bestContacts = -1;
      entities.antigenMolecules.forEach((mol, i) => {
        const recs = recordsForChains(allRecords, mol.chains);
        const c = contactPairsBetween(recs, antibodyRecords, format);
        if (c > bestContacts) { bestContacts = c; bestIdx = i; }
      });
      entities.antigenMolecules.forEach((mol, i) => { if (i !== bestIdx) dropAntigen.push(...mol.chains); });
    }
    if (dropAntibody.length || dropAntigen.length) {
      text = dropChainsFromText(text, dropAntibody, chainColumn);
      text = dropChainsFromText(text, dropAntigen, chainColumn);
      const keptAntigen = analysis.roles.antigenChains.filter(c => !dropAntigen.includes(c));
      text = rewriteRoleRemarks(text, keptAntigen, keptAntibodyChains);
      record.actions.push({ step: 'trim_entities', ok: true, dropAntibody, dropAntigen });
      record.changed = true;
    }
  }

  // After trimming, re-check geometry problems; if still too-far/overlap, fix below.
  let midCheck = analyzeFileText(text, filePath, opts);
  const stillBad = midCheck.problems.length > 0;

  // P4A TOO_FAR: translate existing antibody; else re-place
  if (stillBad) {
    const fresh = analyzeComplexText(text, { file: filePath });
    const tooFar = midCheck.problems.some(p => p.type === 'P4A_TOO_FAR');
    const overlap = midCheck.problems.some(p => p.type === 'P4B_OVERLAP');
    if (tooFar && fresh.fixable) {
      const plan = createAntibodyTranslationPlan(fresh, { targetMinDistance: 2.4 });
      if (plan && plan.ok) {
        const moved = applyAntibodyTranslation(text, fresh, plan);
        const movedCheck = analyzeFileText(moved, filePath, opts);
        if (!movedCheck.problems.length) {
          text = moved;
          record.actions.push({ step: 'translate_antibody', ok: true, translation: plan.translation });
          record.changed = true;
          return verifyAndFinalize(text, filePath, record, opts);
        }
        record.actions.push({ step: 'translate_antibody', ok: false });
      }
    }
    // fallback for too-far (translate failed) and for overlap: re-place antibody
    if (tooFar || overlap) {
      const replaced = replaceExistingAntibody(text, fresh, opts) || placeLibraryScaffold(text, fresh, opts);
      if (replaced) {
        text = replaced.text;
        record.actions.push({ step: 'replace_antibody', ok: true, scaffold: replaced.scaffold || 'existing' });
        record.changed = true;
      } else {
        record.actions.push({ step: 'replace_antibody', ok: false });
      }
    }
  }

  return verifyAndFinalize(text, filePath, record, opts);
}

function verifyAndFinalize(text, filePath, record, opts) {
  const after = analyzeFileText(text, filePath, opts);
  record.afterGeometry = after.geometry;
  record.afterProblems = after.problems.map(p => p.type);
  if (after.problems.length === 0) {
    record.outcome = 'REPAIRED';
    record.fixedText = text;
  } else {
    record.outcome = 'REPAIR_FAILED';
    record.changed = false; // do not write failed fixes
  }
  return record;
}

// ─── file selection ───
function collectFiles(args) {
  const files = new Set();
  if (args['from-report']) {
    const reportPath = path.resolve(ROOT, args['from-report']);
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    for (const t of report.targets || []) {
      for (const item of t.items || []) files.add(path.resolve(ROOT, item.file));
    }
  }
  if (args.file) files.add(path.resolve(ROOT, args.file));
  if (args.target) {
    const dir = path.join(EXPANDED_DIR, args.target);
    if (fs.existsSync(dir)) {
      for (const name of fs.readdirSync(dir)) {
        if (name.toLowerCase().endsWith('.pdb')) files.add(path.join(dir, name));
      }
    }
  }
  if (args.dir) {
    const base = path.resolve(ROOT, args.dir);
    function walk(d) {
      for (const name of fs.readdirSync(d)) {
        const full = path.join(d, name);
        const st = fs.statSync(full);
        if (st.isDirectory()) walk(full);
        else if (name.toLowerCase().endsWith('.pdb')) files.add(full);
      }
    }
    if (fs.existsSync(base)) walk(base);
  }
  return [...files].sort();
}

// ─── main ───
function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || args.h) {
    console.log('Usage: node scripts/repair_complex_bindings.js --from-report <scan.json> [--write] [--backup] [--dry-run] [--out plan.json] [--target GENE] [--file path] [--dir path]');
    return;
  }
  const opts = {
    tooFar: numArg(args, 'too-far', DEFAULTS.tooFar),
    minOverlapClashes: numArg(args, 'min-overlap-clashes', DEFAULTS.minOverlapClashes),
    moleculeGap: numArg(args, 'molecule-gap', DEFAULTS.moleculeGap),
    minAtoms: numArg(args, 'min-atoms', DEFAULTS.minAtoms)
  };
  const write = !!args.write;
  const backup = args.backup !== false; // default on
  const files = collectFiles(args);
  process.stderr.write(`Repair targets: ${files.length} file(s); mode=${write ? 'WRITE' : 'DRY-RUN'}\n`);

  const results = [];
  let repaired = 0;
  let failed = 0;
  let unrepaired = 0;
  for (const file of files) {
    let text;
    try { text = fs.readFileSync(file, 'utf8'); } catch (err) { continue; }
    let rec;
    try { rec = repairFileText(text, file, opts); } catch (err) {
      rec = { file: path.relative(ROOT, file), outcome: 'ERROR', error: err.message };
    }
    if (rec.outcome === 'REPAIRED') {
      repaired += 1;
      if (write && rec.fixedText) {
        if (backup) {
          try { fs.writeFileSync(file + '.bak', text); } catch (err) { /* ignore backup failure */ }
        }
        fs.writeFileSync(file, rec.fixedText);
        rec.written = true;
      }
    } else if (rec.outcome === 'UNREPAIRABLE_MISSING_ANTIGEN') unrepaired += 1;
    else if (rec.outcome === 'REPAIR_FAILED' || rec.outcome === 'ERROR') failed += 1;
    results.push(rec);
    process.stderr.write(`  ${rec.outcome.padEnd(26)} ${rec.file}\n`);
  }

  const plan = {
    mode: write ? 'write' : 'dry-run',
    files: files.length,
    summary: { repaired, failed, unrepaired },
    results
  };
  const outPath = args.out ? path.resolve(ROOT, args.out) : null;
  if (outPath) {
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(plan, null, 2));
  }
  console.log('='.repeat(78));
  console.log(`Repair ${plan.mode}: ${files.length} files | repaired ${repaired} | failed ${failed} | unrepairable(missing antigen) ${unrepaired}`);
  if (outPath) console.log('plan written:', path.relative(ROOT, outPath));
  console.log('='.repeat(78));
}

if (require.main === module) {
  main();
}

module.exports = { repairFileText, SCAFFOLDS };
