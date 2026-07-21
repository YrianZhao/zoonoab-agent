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

function buildTargetRouteMapFromCatalog(catalog, fallback = {}) {
  const map = { ...(fallback || {}) };
  for (const entry of catalogRouteEntries(catalog, { includeClientFallbackOnly: false })) {
    if (entry.routeable === false) continue;
    for (const alias of catalogAliasesForEntry(entry)) {
      const key = normalizeStructureCatalogKey(alias);
      if (key && !map[key]) map[key] = entry.routeId;
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
  return {
    schemaVersion: catalog && catalog.schemaVersion ? catalog.schemaVersion : 1,
    generatedAt: catalog && catalog.generatedAt ? catalog.generatedAt : '',
    summary: catalog && catalog.summary ? catalog.summary : {},
    promptSupportTargets: buildStructureSupportPromptList(catalog, ''),
    routePresets
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
