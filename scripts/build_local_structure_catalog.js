'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const {
  toClientStructureCatalog
} = require('../lib/local-structure-catalog');

const ROOT = path.resolve(__dirname, '..');
const PDB_DIR = path.join(ROOT, 'pdb');
const SERVER_PATH = path.join(ROOT, 'server.js');
const INDEX_PATH = path.join(ROOT, 'public', 'index.html');
const CATALOG_PATH = path.join(PDB_DIR, 'local-structure-catalog.json');
const CATALOG_MD_PATH = path.join(PDB_DIR, 'local-structure-catalog.md');
const CLIENT_CATALOG_PATH = path.join(ROOT, 'public', 'local-structure-catalog.generated.js');
const SIMPLE_LIBRARY_MANIFESTS = [
  'veterinary-library-manifest.json',
  'inflammation-library-manifest.json',
  'endocrine-library-manifest.json',
  'metabolic-library-manifest.json',
  'neuro-library-manifest.json',
  'solid-tumor-library-manifest.json',
  'bone-library-manifest.json'
];

const GENE_BY_TARGET = {
  'PD-L1': 'CD274',
  'PD-1': 'PDCD1',
  'CTLA-4': 'CTLA4',
  HER2: 'ERBB2',
  EGFR: 'EGFR',
  'VEGF-A': 'VEGFA',
  TNF: 'TNF',
  'IL-17A': 'IL17A',
  'IL-23': 'IL23A/IL12B',
  'IL-33': 'IL33',
  TSLP: 'TSLP',
  'RSV F': 'F',
  'SARS-CoV-2 RBD': 'S',
  'Influenza HA': 'HA',
  'Influenza NA': 'NA',
  PCSK9: 'PCSK9',
  ANGPTL3: 'ANGPTL3',
  GIPR: 'GIPR',
  DAT: 'SLC6A3',
  CD4: 'CD4',
  CFH: 'CFH',
  TSHR: 'TSHR',
  AQP4: 'AQP4',
  'alpha-synuclein': 'SNCA',
  CD20: 'MS4A1',
  CD19: 'CD19',
  CD3: 'CD3E/CD3G',
  C5: 'C5',
  'IL-6R': 'IL6R',
  'IL-4Rα': 'IL4R',
  CD25: 'IL2RA',
  CD38: 'CD38',
  TIGIT: 'TIGIT',
  CD47: 'CD47',
  'LAG-3': 'LAG3',
  'TROP-2': 'TACSTD2',
  BCMA: 'TNFRSF17',
  IgE: 'IGH',
  'CGRP receptor': 'CALCRL/RAMP1',
  'IL-1β': 'IL1B',
  'Tissue Factor': 'F3',
  'Canine NGF': 'NGF'
};

const ALIASES_BY_TARGET = {
  'PD-L1': ['CD274', 'B7-H1', 'PDL1'],
  'PD-1': ['PDCD1', 'PD1'],
  'CTLA-4': ['CTLA4', 'CD152'],
  HER2: ['ERBB2', 'HER-2'],
  EGFR: ['ERBB1'],
  'VEGF-A': ['VEGFA', 'VEGF'],
  TNF: ['TNF-alpha', 'TNFα'],
  'IL-17A': ['IL17A'],
  'IL-23': ['IL23', 'IL23A'],
  'IL-33': ['IL33'],
  TSLP: ['TSLP'],
  'RSV F': ['Respiratory syncytial virus F', 'RSV fusion protein'],
  'SARS-CoV-2 RBD': ['SARS-CoV-2 receptor-binding domain', 'SC2 RBD', 'RBD'],
  'Influenza HA': ['Influenza hemagglutinin', 'Flu HA', '血凝素'],
  'Influenza NA': ['Influenza neuraminidase', 'Flu NA', '神经氨酸酶'],
  PCSK9: ['PCSK9'],
  ANGPTL3: ['ANGPTL3'],
  GIPR: ['GIP receptor'],
  DAT: ['SLC6A3', 'DAT1', 'dopamine transporter'],
  TSHR: ['Thyrotropin receptor', 'Thyroid-stimulating hormone receptor', '促甲状腺激素受体'],
  AQP4: ['AQP-4', 'Aquaporin-4', '水通道蛋白4'],
  'alpha-synuclein': ['SNCA', 'α-synuclein', 'Alpha synuclein', '突触核蛋白'],
  CD20: ['MS4A1'],
  CD19: ['CD19'],
  CD3: ['CD3E', 'CD3 epsilon'],
  C5: ['Complement C5'],
  'IL-6R': ['IL6R', 'CD126', 'IL-6Rα'],
  'IL-4Rα': ['IL4R', 'IL4RA', 'CD124'],
  CD25: ['IL2RA'],
  CD38: ['CD38'],
  TIGIT: ['TIGIT'],
  CD47: ['CD47'],
  'LAG-3': ['LAG3'],
  'TROP-2': ['TACSTD2'],
  BCMA: ['TNFRSF17', 'CD269'],
  IgE: ['Immunoglobulin E'],
  'CGRP receptor': ['CGRPR', 'CALCRL', 'RAMP1'],
  'IL-1β': ['IL1B', 'IL-1B', 'IL-1 beta'],
  'Tissue Factor': ['F3', 'CD142', 'Thromboplastin', 'Coagulation factor III'],
  'Canine NGF': ['dog NGF', 'dog nerve growth factor', '犬源 NGF', '犬 NGF']
};

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function findObjectLiteral(source, constName) {
  const needle = 'const ' + constName + ' =';
  const idx = source.indexOf(needle);
  if (idx < 0) throw new Error('Unable to find ' + constName);
  const start = source.indexOf('{', idx);
  if (start < 0) throw new Error('Unable to find object start for ' + constName);
  let depth = 0;
  let quote = '';
  let escaped = false;
  for (let i = start; i < source.length; i += 1) {
    const ch = source[i];
    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === quote) {
        quote = '';
      }
      continue;
    }
    if (ch === '\'' || ch === '"' || ch === '`') {
      quote = ch;
      continue;
    }
    if (ch === '{') depth += 1;
    if (ch === '}') {
      depth -= 1;
      if (depth === 0) return source.slice(start, i + 1);
    }
  }
  throw new Error('Unable to find object end for ' + constName);
}

function evaluateObjectLiteral(source, constName) {
  const literal = findObjectLiteral(source, constName);
  return vm.runInNewContext('(' + literal + ')', {}, { timeout: 1000 });
}

function readJsonIfExists(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function sortedPdbFiles() {
  return fs.readdirSync(PDB_DIR)
    .filter(file => file.endsWith('.pdb'))
    .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
}

function filesForAliasPrefix(files, aliasPrefix) {
  const safePrefix = String(aliasPrefix || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp('^' + safePrefix + '-\\d+\\.pdb$', 'i');
  return files.filter(file => pattern.test(file));
}

function inferFormat(aliasPrefix) {
  if (/VHH/i.test(aliasPrefix)) return 'VHH';
  if (/Fab/i.test(aliasPrefix)) return 'Fab';
  if (/mAb/i.test(aliasPrefix)) return 'mAb';
  return '';
}

function inferRouteStructureClass(preset) {
  if (preset && preset.interfaceDetail === false) return 'target_exact_display_pose';
  if (preset && preset.displayMode === 'representative_interface') return 'representative_experimental_interface';
  if (/VHH/i.test(String(preset && preset.aliasPrefix || ''))) return 'target_exact_nanobody_complex';
  const text = [
    preset && preset.structuralBasis,
    preset && preset.title,
    preset && preset.structureFamily,
    preset && preset.visualSummary
  ].filter(Boolean).join(' ');
  if (/(?:glyco)?peptide|stalk peptide|epitope/i.test(text)) {
    return 'target_exact_epitope_complex';
  }
  return 'target_exact_complex';
}

function parseRcsbIds(value) {
  return [...String(value || '').matchAll(/RCSB\s+([0-9][A-Za-z0-9]{3})/g)]
    .map(match => match[1].toUpperCase());
}

function promptLabelForTarget(target, gene) {
  if (!target) return '';
  if (gene && gene !== target && !String(target).includes('/')) return target + '/' + gene;
  return target;
}

function compactObject(input) {
  const output = {};
  for (const [key, value] of Object.entries(input || {})) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value) && value.length === 0) continue;
    output[key] = value;
  }
  return output;
}

function isPlainObject(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function mergeCatalogObjects(base, override) {
  if (!isPlainObject(base)) return override;
  if (!isPlainObject(override)) return base;
  const output = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (isPlainObject(value) && isPlainObject(output[key])) {
      output[key] = mergeCatalogObjects(output[key], value);
    } else {
      output[key] = value;
    }
  }
  return output;
}

function mergeExistingRoutePresets(baseEntries, existingEntries) {
  const ordered = [];
  const byRouteId = new Map();
  for (const entry of baseEntries || []) {
    if (!entry || !entry.routeId) continue;
    const copy = { ...entry };
    byRouteId.set(copy.routeId, copy);
    ordered.push(copy);
  }
  for (const existing of existingEntries || []) {
    if (!existing || !existing.routeId) continue;
    const current = byRouteId.get(existing.routeId);
    if (current) {
      const merged = mergeCatalogObjects(current, existing);
      byRouteId.set(existing.routeId, merged);
      const idx = ordered.findIndex(item => item.routeId === existing.routeId);
      if (idx >= 0) ordered[idx] = merged;
    } else {
      const manual = {
        ...existing,
        sourceClass: existing.sourceClass || 'catalog_manual'
      };
      byRouteId.set(existing.routeId, manual);
      ordered.push(manual);
    }
  }
  return ordered;
}

function mergeExistingLibraryAssets(baseAssets, existingAssets) {
  const keyFor = asset => [
    asset && asset.sourceCatalog,
    asset && (asset.filename || asset.file || asset.localPath || asset.target)
  ].filter(Boolean).join('|');
  const assets = [];
  const seen = new Set();
  for (const asset of baseAssets || []) {
    const key = keyFor(asset);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    assets.push(asset);
  }
  for (const asset of existingAssets || []) {
    const key = keyFor(asset);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    assets.push(asset);
  }
  return assets;
}

function recalculateCatalogSummary(catalog, pdbFiles) {
  const routeEntries = Array.isArray(catalog.routePresets) ? catalog.routePresets : [];
  const libraryAssets = Array.isArray(catalog.libraryAssets) ? catalog.libraryAssets : [];
  const routeFileCount = routeEntries.reduce((sum, entry) => sum + (Number(entry.fileCount) || (Array.isArray(entry.files) ? entry.files.length : 0)), 0);
  catalog.summary = {
    pdbFileCount: pdbFiles.length,
    routePresetCount: routeEntries.length,
    routeableRoutePresetCount: routeEntries.filter(entry => entry.routeable !== false).length,
    promptEligibleRoutePresetCount: routeEntries.filter(entry => entry.routeable !== false && entry.promptEligible !== false).length,
    routePresetFileCount: routeFileCount,
    libraryAssetCount: libraryAssets.length
  };
  return catalog;
}

function buildRouteEntries(routePresets, organisms, fallbackTargets, fallback3DPresets, files) {
  const entries = [];
  for (const [routeId, preset] of Object.entries(routePresets)) {
    const target = fallbackTargets[preset.aliasPrefix] || '';
    const gene = GENE_BY_TARGET[target] || '';
    const localFiles = filesForAliasPrefix(files, preset.aliasPrefix);
    const organism = organisms[routeId] || {};
    const visualColors = compactObject({
      antigen: preset.antigenColor,
      antibody: preset.antibodyColor
    });
    entries.push(compactObject({
      routeId,
      aliasPrefix: preset.aliasPrefix,
      target,
      gene,
      aliases: ALIASES_BY_TARGET[target] || [],
      organismName: organism.organismName || '',
      organismTaxId: organism.organismTaxId || null,
      antibodyFormat: inferFormat(preset.aliasPrefix),
      routeable: true,
      promptEligible: localFiles.length > 0,
      clientFallbackEligible: true,
      structureClass: inferRouteStructureClass(preset),
      sourceClass: 'route_preset',
      filenamePattern: preset.aliasPrefix + '-NN.pdb',
      files: localFiles,
      fileCount: localFiles.length,
      promptLabel: promptLabelForTarget(target, gene),
      structuralBasis: preset.structuralBasis,
      sourcePdbIds: parseRcsbIds(preset.structuralBasis),
      display: compactObject({
        structureTitle: preset.title,
        structureFamily: preset.structureFamily,
        visualSummary: preset.visualSummary,
        structuralBasis: preset.structuralBasis,
        antigenChains: preset.antigenChains,
        antibodyChains: preset.antibodyChains,
        sourceAntigenChains: preset.sourceAntigenChains,
        sourceAntibodyChains: preset.sourceAntibodyChains,
        displayMode: preset.displayMode,
        interfaceDetail: preset.interfaceDetail,
        keepAllAntibodyChains: preset.keepAllAntibodyChains,
        visualColors,
        order: preset.order,
        ipTmBias: preset.ipTmBias
      })
    }));
  }

  const genericVhh = fallback3DPresets.generic_vhh;
  if (genericVhh) {
    const target = fallbackTargets[genericVhh.aliasPrefix] || 'IL-33';
    const gene = GENE_BY_TARGET[target] || '';
    const localFiles = filesForAliasPrefix(files, genericVhh.aliasPrefix);
    entries.push(compactObject({
      routeId: 'generic_vhh',
      aliasPrefix: genericVhh.aliasPrefix,
      target,
      gene,
      aliases: ALIASES_BY_TARGET[target] || [],
      organismName: 'Homo sapiens',
      organismTaxId: 9606,
      antibodyFormat: 'VHH',
      routeable: false,
      promptEligible: false,
      clientFallbackEligible: true,
      structureClass: 'generic_vhh_display_scaffold',
      sourceClass: 'client_fallback_scaffold',
      filenamePattern: genericVhh.aliasPrefix + '-NN.pdb',
      files: localFiles,
      fileCount: localFiles.length,
      promptLabel: target,
      structuralBasis: genericVhh.structuralBasis,
      display: compactObject({
        structureTitle: genericVhh.structureTitle,
        structureFamily: genericVhh.structureFamily,
        visualSummary: genericVhh.visualSummary,
        structuralBasis: genericVhh.structuralBasis,
        antigenChains: genericVhh.antigenChains,
        antibodyChains: genericVhh.antibodyChains,
        visualColors: genericVhh.visualColors,
        order: genericVhh.order
      })
    }));
  }
  return entries;
}

function summarizeVirusAsset(model) {
  return compactObject({
    sourceCatalog: 'virus-library-manifest.json',
    filename: model.file || '',
    localPath: model.localPath || (model.file ? 'pdb/' + model.file : ''),
    target: model.label || [model.group, model.subtype, model.antigen].filter(Boolean).join(' '),
    gene: model.antigen || '',
    group: model.group,
    subtype: model.subtype,
    antigen: model.antigen,
    organismName: model.group === 'Influenza' ? 'Influenza A virus' : '',
    organismTaxId: model.group === 'Influenza' ? 11320 : null,
    pdbId: model.pdbId,
    source: model.sourceDatabase || 'RCSB PDB',
    sourceUrl: model.rcsbEntryUrl || model.downloadUrl || '',
    structureClass: model.sourceType === 'experimental' ? 'experimental_antigen_or_complex' : model.sourceType,
    routeable: false,
    promptEligible: false,
    fileCount: model.file ? 1 : 0,
    label: model.label,
    note: model.note,
    assemblyId: model.assemblyId,
    experimentalMethod: model.experimentalMethod,
    resolutionAngstrom: model.resolutionAngstrom,
    antigenChains: Array.isArray(model.entities)
      ? model.entities
        .filter(entity => /hemagglutinin|\bHA\b|spike|glycoprotein|neuraminidase|antigen|fusion|attachment|VP1|Env/i.test(String(entity.description || '')))
        .flatMap(entity => Array.isArray(entity.chains) ? entity.chains : [])
      : [],
    antibodyChains: Array.isArray(model.entities)
      ? model.entities
        .filter(entity => /antibody|fab|heavy chain|light chain|neutralizing/i.test(String(entity.description || '')))
        .flatMap(entity => Array.isArray(entity.chains) ? entity.chains : [])
      : []
  });
}

function summarizeSimpleManifestAsset(model, sourceCatalog) {
  const filename = model.filename || model.file || '';
  const structureClass = String(model.structureClass || '');
  const asset = compactObject({
    sourceCatalog,
    filename,
    localPath: model.localPath || (filename ? 'pdb/' + filename : ''),
    target: model.target || model.label || '',
    gene: model.gene || '',
    aliases: model.aliases || [],
    protein: model.protein || '',
    organismName: model.organism || model.organismName || '',
    organismTaxId: model.organismTaxId || null,
    accession: model.accession || '',
    uniprotAccession: model.uniprotAccession || '',
    referenceAccession: model.referenceAccession || '',
    source: model.source || model.sourceDatabase || '',
    sourceUrl: model.sourceUrl || model.downloadUrl || '',
    sourceEntryUrl: model.sourceEntryUrl || '',
    structureClass,
    antibodyFormat: model.antibodyFormat || '',
    routeable: /^target_exact_display_pose$/.test(structureClass),
    promptEligible: false,
    fileCount: filename ? 1 : 0,
    experimentalMethod: model.experimentalMethod || '',
    resolutionAngstrom: model.resolutionAngstrom || null,
    biologicalAssembly: model.biologicalAssembly || '',
    structuralBasis: model.structuralBasis || '',
    status: model.status || '',
    context: model.context || '',
    note: model.note || ''
  });
  if (Array.isArray(model.antigenChains)) asset.antigenChains = model.antigenChains;
  if (Array.isArray(model.antibodyChains)) asset.antibodyChains = model.antibodyChains;
  if (Array.isArray(model.sourceAntigenChains)) asset.sourceAntigenChains = model.sourceAntigenChains;
  if (Array.isArray(model.sourceAntibodyChains)) asset.sourceAntibodyChains = model.sourceAntibodyChains;
  return asset;
}

function buildLibraryAssets() {
  const assets = [];
  const virus = readJsonIfExists(path.join(PDB_DIR, 'virus-library-manifest.json'));
  if (virus && Array.isArray(virus.models)) {
    assets.push(...virus.models.map(summarizeVirusAsset));
  }
  for (const manifestName of SIMPLE_LIBRARY_MANIFESTS) {
    const manifest = readJsonIfExists(path.join(PDB_DIR, manifestName));
    if (manifest && Array.isArray(manifest.models)) {
      assets.push(...manifest.models.map(model => summarizeSimpleManifestAsset(model, manifestName)));
    }
  }
  const seen = new Set();
  return assets.filter(asset => {
    const key = [asset.sourceCatalog, asset.filename || asset.localPath || asset.target].join('|');
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildCatalog() {
  const existingCatalog = readJsonIfExists(CATALOG_PATH);
  const serverSource = readText(SERVER_PATH);
  const indexSource = readText(INDEX_PATH);
  const routePresets = evaluateObjectLiteral(serverSource, 'ROUTE_3D_PRESETS');
  const organisms = evaluateObjectLiteral(serverSource, 'ROUTE_3D_PRESET_ORGANISMS_FALLBACK');
  const fallbackTargets = evaluateObjectLiteral(indexSource, 'FALLBACK_PRESET_TARGETS');
  const fallback3DPresets = evaluateObjectLiteral(indexSource, 'FALLBACK_3D_PRESETS');
  const pdbFiles = sortedPdbFiles();
  const baseRouteEntries = buildRouteEntries(routePresets, organisms, fallbackTargets, fallback3DPresets, pdbFiles);
  const baseLibraryAssets = buildLibraryAssets();
  const routeEntries = mergeExistingRoutePresets(
    baseRouteEntries,
    Array.isArray(existingCatalog && existingCatalog.routePresets) ? existingCatalog.routePresets : []
  );
  const libraryAssets = mergeExistingLibraryAssets(
    baseLibraryAssets,
    Array.isArray(existingCatalog && existingCatalog.libraryAssets) ? existingCatalog.libraryAssets : []
  );
  const catalog = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    sourceFiles: [
      'server.js:ROUTE_3D_PRESETS',
      'server.js:ROUTE_3D_PRESET_ORGANISMS_FALLBACK',
      'public/index.html:FALLBACK_3D_PRESETS',
      'public/index.html:FALLBACK_PRESET_TARGETS',
      'pdb/*-library-manifest.json',
      'pdb/*.pdb'
    ],
    promptPolicy: {
      useWhen: 'Only prefer a structure-supported target when multiple candidate targets are biologically similarly reasonable.',
      preserveExplicitTarget: true,
      doNotExposeInternalAvailabilityReason: true
    },
    routePresets: routeEntries,
    libraryAssets,
    extensionPriorities: Array.isArray(existingCatalog && existingCatalog.extensionPriorities) ? existingCatalog.extensionPriorities : [
      {
        priority: 1,
        area: 'solid_tumor_surface_antigens',
        targets: ['MUC1', 'Mesothelin/MSLN', 'Claudin 18.2/CLDN18', 'CEACAM6', 'GPC3', 'B7-H3/CD276'],
        reason: 'These targets appear in natural-language tumor requests or tests but are not yet backed by route-level local PDB families.'
      },
      {
        priority: 2,
        area: 'route_variants',
        targets: ['VHH variants for prepared Fab routes', 'species-specific veterinary variants', 'viral subtype/strain variants'],
        reason: 'Adding variants under existing target identities improves coverage without multiplying unrelated route logic.'
      },
      {
        priority: 3,
        area: 'library_asset_promotion',
        targets: ['VIRUSLIB surface proteins', 'VETLIB predicted antigens', 'NEUROLIB reference assets'],
        reason: 'Some assets can become routeable only after target identity, chain roles and candidate display metadata are filled.'
      }
    ]
  };
  return recalculateCatalogSummary(catalog, pdbFiles);
}

function escapeMd(value) {
  return String(value || '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

function markdownTable(rows) {
  return rows.map(row => '| ' + row.map(escapeMd).join(' | ') + ' |').join('\n');
}

function buildCatalogMarkdown(catalog) {
  const routeRows = [
    ['routeId', 'target', 'gene', 'aliasPrefix', 'files', 'organism', 'structure basis'],
    ['---', '---', '---', '---', '---:', '---', '---']
  ];
  for (const entry of catalog.routePresets) {
    routeRows.push([
      entry.routeId,
      entry.target,
      entry.gene,
      entry.aliasPrefix,
      String(entry.fileCount || 0),
      entry.organismName || '',
      entry.structuralBasis || ''
    ]);
  }

  const priorityRows = [
    ['priority', 'area', 'targets', 'reason'],
    ['---:', '---', '---', '---']
  ];
  for (const item of catalog.extensionPriorities) {
    priorityRows.push([
      String(item.priority),
      item.area,
      item.targets.join(', '),
      item.reason
    ]);
  }

  return [
    '# Local structure catalog',
    '',
    'This file is generated from `pdb/local-structure-catalog.json` and summarizes the local molecular structure inventory for maintainers.',
    '',
    '## Summary',
    '',
    '- PDB files: ' + catalog.summary.pdbFileCount,
    '- Route presets: ' + catalog.summary.routePresetCount,
    '- Routeable presets: ' + catalog.summary.routeableRoutePresetCount,
    '- Prompt-eligible structure-supported targets: ' + catalog.summary.promptEligibleRoutePresetCount,
    '- Library assets: ' + catalog.summary.libraryAssetCount,
    '',
    '## Route-backed structure families',
    '',
    markdownTable(routeRows),
    '',
    '## Extension priorities',
    '',
    markdownTable(priorityRows),
    '',
    '## Maintenance contract',
    '',
    '- `local-structure-catalog.json` is the machine-readable source of truth.',
    '- Runtime prompts should consume only the structure-supported target summary generated from this catalog.',
    '- New routeable entries must include target identity, aliases, organism/taxid, file pattern, chain roles and structural basis.',
    '- Asset-only entries should not be promoted to routeable status until chain roles and display metadata are complete.',
    ''
  ].join('\n');
}

function buildClientCatalogJs(catalog) {
  const clientCatalog = toClientStructureCatalog(catalog);
  return [
    '// Generated by scripts/build_local_structure_catalog.js. Do not edit by hand.',
    '(function(){',
    '  window.ZOONOAB_LOCAL_STRUCTURE_CATALOG = ' + JSON.stringify(clientCatalog, null, 2) + ';',
    '}());',
    ''
  ].join('\n');
}

function main() {
  const catalog = buildCatalog();
  fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2) + '\n');
  fs.writeFileSync(CATALOG_MD_PATH, buildCatalogMarkdown(catalog));
  fs.writeFileSync(CLIENT_CATALOG_PATH, buildClientCatalogJs(catalog));
  console.log('Wrote ' + path.relative(ROOT, CATALOG_PATH));
  console.log('Wrote ' + path.relative(ROOT, CATALOG_MD_PATH));
  console.log('Wrote ' + path.relative(ROOT, CLIENT_CATALOG_PATH));
}

if (require.main === module) main();

module.exports = {
  buildCatalog,
  buildCatalogMarkdown,
  buildClientCatalogJs
};
