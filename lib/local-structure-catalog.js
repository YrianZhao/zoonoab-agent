'use strict';

const fs = require('fs');
const path = require('path');

const DEFAULT_CATALOG_RELATIVE_PATH = path.join('pdb', 'local-structure-catalog.json');

function normalizeStructureCatalogKey(value) {
  return String(value || '')
    .normalize('NFKC')
    .toUpperCase()
    .replace(/(?:ALPHA|Α)/g, 'A')
    .replace(/(?:BETA|Β)/g, 'B')
    .replace(/[^\p{Script=Han}A-Z0-9]/gu, '');
}

function readJsonFile(filePath, fallback) {
  try {
    if (!filePath || !fs.existsSync(filePath)) return fallback;
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return parsed && typeof parsed === 'object' ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function loadLocalStructureCatalog(projectRoot, options = {}) {
  const root = projectRoot || path.resolve(__dirname, '..');
  const catalogPath = options.catalogPath || path.join(root, DEFAULT_CATALOG_RELATIVE_PATH);
  const catalog = readJsonFile(catalogPath, null);
  if (!catalog || !Array.isArray(catalog.routePresets)) {
    return {
      schemaVersion: 1,
      generatedAt: '',
      routePresets: [],
      libraryAssets: [],
      summary: {
        routePresetCount: 0,
        promptEligibleRoutePresetCount: 0,
        libraryAssetCount: 0,
        pdbFileCount: 0
      }
    };
  }
  if (!Array.isArray(catalog.libraryAssets)) catalog.libraryAssets = [];
  if (!catalog.summary || typeof catalog.summary !== 'object') catalog.summary = {};
  return catalog;
}

function catalogRouteEntries(catalog, options = {}) {
  const includeClientFallbackOnly = options.includeClientFallbackOnly !== false;
  const includeDisabled = options.includeDisabled === true;
  const entries = Array.isArray(catalog && catalog.routePresets) ? catalog.routePresets : [];
  return entries.filter(entry => {
    if (!entry || typeof entry !== 'object') return false;
    if (!includeDisabled && entry.enabled === false) return false;
    if (!includeClientFallbackOnly && entry.routeable === false) return false;
    return Boolean(entry.routeId && entry.aliasPrefix);
  });
}

function catalogPromptRouteEntries(catalog) {
  return catalogRouteEntries(catalog, { includeClientFallbackOnly: false })
    .filter(entry => entry.promptEligible !== false);
}

function catalogAliasesForEntry(entry) {
  const target = String(entry && entry.target || '').trim();
  const gene = String(entry && entry.gene || '').trim();
  const shouldIncludeBareGeneAlias = !(target && /^Canine\s+/i.test(target));
  const aliases = [
    target,
    shouldIncludeBareGeneAlias ? gene : '',
    entry && entry.promptLabel,
    ...(Array.isArray(entry && entry.aliases) ? entry.aliases : [])
  ];
  return [...new Set(aliases.map(item => String(item || '').trim()).filter(Boolean))];
}

function buildStructureSupportPromptList(catalog, fallbackList = '') {
  const labels = [];
  for (const entry of catalogPromptRouteEntries(catalog)) {
    const label = String(entry.promptLabel || entry.target || '').trim();
    if (label && !labels.includes(label)) labels.push(label);
  }
  return labels.length ? labels.join('、') : fallbackList;
}

const ROUTE_CATEGORY_PREFIXES = [
  { prefixes: ['allergic_', 'migraine_'], label: '过敏/呼吸' },
  { prefixes: ['tumor_', 'checkpoint_', 'solid_tumor_', 'breast_', 'prostate_', 'sclc_', 'heme_'], label: '肿瘤/血液' },
  { prefixes: ['autoimmune_', 'inflammation_', 'complement_', 'immune_', 'ibd_'], label: '自身免疫/炎症' },
  { prefixes: ['infectious_'], label: '感染' },
  { prefixes: ['cardio_'], label: '心血管' },
  { prefixes: ['metabolic_'], label: '代谢' },
  { prefixes: ['neuro_', 'endocrine_'], label: '神经/内分泌' },
  { prefixes: ['veterinary_'], label: '兽用' }
];

function categorizeRouteId(routeId) {
  const id = String(routeId || '');
  for (const cat of ROUTE_CATEGORY_PREFIXES) {
    for (const prefix of cat.prefixes) {
      if (id.startsWith(prefix)) return cat.label;
    }
  }
  if (/^display_pose_/i.test(id)) return '其他基因靶点';
  return '其他';
}

function buildCategorizedPromptList(catalog, fallbackList = '') {
  const categories = {};
  for (const entry of catalogPromptRouteEntries(catalog)) {
    const label = String(entry.promptLabel || entry.target || '').trim();
    if (!label) continue;
    const category = categorizeRouteId(entry.routeId);
    if (!categories[category]) categories[category] = [];
    if (!categories[category].includes(label)) categories[category].push(label);
  }
  const lines = [];
  for (const [category, labels] of Object.entries(categories)) {
    lines.push('[' + category + '] ' + labels.join(', '));
  }
  return lines.length ? lines.join('\n') : fallbackList;
}

function buildAliasPrefixTargetMapFromCatalog(catalog, fallback = {}) {
  const map = { ...(fallback || {}) };
  for (const entry of catalogRouteEntries(catalog)) {
    if (entry.aliasPrefix && entry.target) map[entry.aliasPrefix] = entry.target;
  }
  return map;
}

function buildRoutePresetOrganismsFromCatalog(catalog, fallback = {}) {
  const map = { ...(fallback || {}) };
  for (const entry of catalogRouteEntries(catalog, { includeClientFallbackOnly: false })) {
    const organismName = String(entry.organismName || entry.organism || '').trim();
    const organismTaxId = Number(entry.organismTaxId || entry.taxId || 0) || null;
    if (entry.routeId && (organismName || organismTaxId)) {
      map[entry.routeId] = { organismName, organismTaxId };
    }
  }
  return map;
}

function isDisplayPoseRouteId(routeId) {
  return /^display_pose_/i.test(String(routeId || ''));
}

function routeEntryPriority(entry) {
  // Non-display_pose routes (original hand-crafted profiles) take priority
  // over display_pose routes (mechanically generated profiles).
  if (!entry) return 0;
  if (entry.promptEligible === false) return 0;
  if (!isDisplayPoseRouteId(entry.routeId)) return 2;
  return 1;
}

function buildTargetRouteMapFromCatalog(catalog, fallback = {}) {
  const map = { ...(fallback || {}) };
  // Collect all candidate entries per key so we can resolve ambiguities
  // (same target alias mapping to multiple routeIds) by priority.
  const candidatesByKey = {};
  for (const entry of catalogRouteEntries(catalog, { includeClientFallbackOnly: false })) {
    if (entry.routeable === false) continue;
    for (const alias of catalogAliasesForEntry(entry)) {
      const key = normalizeStructureCatalogKey(alias);
      if (!key) continue;
      if (!candidatesByKey[key]) candidatesByKey[key] = [];
      candidatesByKey[key].push(entry);
    }
  }
  for (const [key, entries] of Object.entries(candidatesByKey)) {
    if (map[key] && !fallback.hasOwnProperty(key)) {
      // Already set by fallback; skip catalog override
      continue;
    }
    // Sort by priority descending, then by file count descending
    const sorted = entries.slice().sort((a, b) => {
      const priorityDiff = routeEntryPriority(b) - routeEntryPriority(a);
      if (priorityDiff !== 0) return priorityDiff;
      const fileCountA = filesForCatalogRouteEntry(a).length;
      const fileCountB = filesForCatalogRouteEntry(b).length;
      return fileCountB - fileCountA;
    });
    const winner = sorted[0];
    if (winner && winner.routeId) {
      map[key] = winner.routeId;
      if (sorted.length > 1) {
        if (!map.__ambiguityLog) map.__ambiguityLog = {};
        map.__ambiguityLog[key] = {
          chosen: winner.routeId,
          alternatives: sorted.slice(1).map(e => e.routeId)
        };
      }
    }
  }
  return map;
}

function filesForCatalogRouteEntry(entry) {
  const files = [];
  if (Array.isArray(entry && entry.files)) files.push(...entry.files);
  if (Array.isArray(entry && entry.localFiles)) files.push(...entry.localFiles);
  return [...new Set(files.map(item => String(item || '').trim()).filter(Boolean))];
}

function catalogRouteEntryForFilename(catalog, filename) {
  const safeName = path.basename(String(filename || '').trim());
  if (!safeName) return null;
  for (const entry of catalogRouteEntries(catalog)) {
    if (filesForCatalogRouteEntry(entry).includes(safeName)) return entry;
    if (entry.aliasPrefix) {
      const safePrefix = String(entry.aliasPrefix).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (new RegExp('^' + safePrefix + '-\\d+\\.pdb$', 'i').test(safeName)) return entry;
    }
  }
  return null;
}

function catalogLibraryAssetForFilename(catalog, filename) {
  const safeName = path.basename(String(filename || '').trim());
  if (!safeName) return null;
  const assets = Array.isArray(catalog && catalog.libraryAssets) ? catalog.libraryAssets : [];
  return assets.find(asset => {
    const candidates = [
      asset && asset.filename,
      asset && asset.file,
      asset && asset.localPath ? path.basename(asset.localPath) : ''
    ].map(item => String(item || '').trim()).filter(Boolean);
    return candidates.includes(safeName);
  }) || null;
}

function catalogEntryForFilename(catalog, filename) {
  return catalogRouteEntryForFilename(catalog, filename) || catalogLibraryAssetForFilename(catalog, filename);
}

function firstDefined(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return undefined;
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

function routePresetFieldsFromCatalogEntry(entry) {
  const display = entry && typeof entry.display === 'object' ? entry.display : {};
  const visualColors = display.visualColors || {};
  const basis = firstDefined(display.structuralBasis, entry.structuralBasis);
  return compactObject({
    aliasPrefix: entry.aliasPrefix,
    title: firstDefined(display.structureTitle, display.title, entry.title),
    structureFamily: display.structureFamily,
    visualSummary: display.visualSummary,
    structuralBasis: basis,
    antigenChains: firstDefined(display.antigenChains, entry.antigenChains),
    antibodyChains: firstDefined(display.antibodyChains, entry.antibodyChains),
    sourceAntigenChains: display.sourceAntigenChains,
    sourceAntibodyChains: display.sourceAntibodyChains,
    displayMode: display.displayMode,
    interfaceDetail: firstDefined(display.interfaceDetail, entry.interfaceDetail),
    keepAllAntibodyChains: display.keepAllAntibodyChains,
    antigenColor: firstDefined(visualColors.antigen, entry.antigenColor),
    antibodyColor: firstDefined(visualColors.antibody, entry.antibodyColor),
    order: display.order,
    ipTmBias: display.ipTmBias,
    files: filesForCatalogRouteEntry(entry)
  });
}

function applyCatalogRoutePresetOverlay(routePresets, catalog) {
  if (!routePresets || typeof routePresets !== 'object') return routePresets;
  for (const entry of catalogRouteEntries(catalog, { includeClientFallbackOnly: false })) {
    if (entry.routeable === false) continue;
    const fields = routePresetFieldsFromCatalogEntry(entry);
    const current = routePresets[entry.routeId] || {};
    routePresets[entry.routeId] = {
      ...current,
      ...fields
    };
  }
  return routePresets;
}

function toClientStructureCatalog(catalog) {
  const routePresets = catalogRouteEntries(catalog)
    .filter(entry => entry.clientFallbackEligible !== false)
    .map(entry => {
      const display = entry.display || {};
      return compactObject({
        routeId: entry.routeId,
        aliasPrefix: entry.aliasPrefix,
        target: entry.target,
        gene: entry.gene,
        aliases: Array.isArray(entry.aliases) ? entry.aliases : [],
        promptLabel: entry.promptLabel,
        structureClass: entry.structureClass,
        routeable: entry.routeable !== false,
        promptEligible: entry.promptEligible !== false,
        clientFallbackEligible: entry.clientFallbackEligible !== false,
        files: filesForCatalogRouteEntry(entry),
        display: compactObject({
          structureTitle: display.structureTitle || display.title,
          structureFamily: display.structureFamily,
          visualSummary: display.visualSummary,
          structuralBasis: display.structuralBasis || entry.structuralBasis,
          antigenChains: display.antigenChains || entry.antigenChains,
          antibodyChains: display.antibodyChains || entry.antibodyChains,
          sourceAntigenChains: display.sourceAntigenChains,
          sourceAntibodyChains: display.sourceAntibodyChains,
          displayMode: display.displayMode,
          interfaceDetail: firstDefined(display.interfaceDetail, entry.interfaceDetail),
          keepAllAntibodyChains: display.keepAllAntibodyChains,
          visualColors: display.visualColors,
          order: display.order,
          ipTmBias: display.ipTmBias
        })
      });
    });
  const libraryAssets = (Array.isArray(catalog && catalog.libraryAssets) ? catalog.libraryAssets : [])
    .map(asset => compactObject({
      sourceCatalog: asset.sourceCatalog,
      filename: asset.filename || asset.file,
      localPath: asset.localPath,
      target: asset.target,
      gene: asset.gene,
      aliases: Array.isArray(asset.aliases) ? asset.aliases : [],
      protein: asset.protein,
      organismName: asset.organismName,
      organismTaxId: asset.organismTaxId,
      accession: asset.accession,
      uniprotAccession: asset.uniprotAccession,
      referenceAccession: asset.referenceAccession,
      source: asset.source,
      sourceUrl: asset.sourceUrl,
      sourceEntryUrl: asset.sourceEntryUrl,
      structureClass: asset.structureClass,
      antibodyFormat: asset.antibodyFormat,
      routeable: asset.routeable !== false,
      promptEligible: asset.promptEligible === true,
      fileCount: asset.fileCount,
      experimentalMethod: asset.experimentalMethod,
      resolutionAngstrom: asset.resolutionAngstrom,
      biologicalAssembly: asset.biologicalAssembly,
      structuralBasis: asset.structuralBasis,
      status: asset.status,
      context: asset.context,
      note: asset.note,
      antigenChains: Array.isArray(asset.antigenChains) ? asset.antigenChains : [],
      antibodyChains: Array.isArray(asset.antibodyChains) ? asset.antibodyChains : [],
      sourceAntigenChains: Array.isArray(asset.sourceAntigenChains) ? asset.sourceAntigenChains : [],
      sourceAntibodyChains: Array.isArray(asset.sourceAntibodyChains) ? asset.sourceAntibodyChains : []
    }));
  return {
    schemaVersion: catalog && catalog.schemaVersion ? catalog.schemaVersion : 1,
    generatedAt: catalog && catalog.generatedAt ? catalog.generatedAt : '',
    summary: catalog && catalog.summary ? catalog.summary : {},
    promptSupportTargets: buildStructureSupportPromptList(catalog, ''),
    routePresets,
    libraryAssets
  };
}

module.exports = {
  DEFAULT_CATALOG_RELATIVE_PATH,
  normalizeStructureCatalogKey,
  loadLocalStructureCatalog,
  catalogRouteEntries,
  catalogPromptRouteEntries,
  catalogAliasesForEntry,
  buildStructureSupportPromptList,
  buildCategorizedPromptList,
  buildAliasPrefixTargetMapFromCatalog,
  buildRoutePresetOrganismsFromCatalog,
  buildTargetRouteMapFromCatalog,
  catalogRouteEntryForFilename,
  catalogLibraryAssetForFilename,
  catalogEntryForFilename,
  filesForCatalogRouteEntry,
  applyCatalogRoutePresetOverlay,
  toClientStructureCatalog
};
