'use strict';

const crypto = require('crypto');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const zlib = require('zlib');
const { AsyncLocalStorage } = require('async_hooks');

const SCHEMA_VERSION = 3;
const MB = 1024 * 1024;
const DEFAULT_CACHE_DIR = path.resolve(__dirname, '..', '.runtime', 'structure-cache', 'v3');
const ALLOWED_REMOTE_HOSTS = new Set([
  'rest.uniprot.org',
  'search.rcsb.org',
  'data.rcsb.org',
  'files.rcsb.org',
  'www.rcsb.org',
  'alphafold.ebi.ac.uk'
]);
const UNIPROT_ACCESSION_RE = /^(?:[OPQ][0-9][A-Z0-9]{3}[0-9]|[A-NR-Z][0-9][A-Z][A-Z0-9]{2}[0-9]|[A-NR-Z][0-9](?:[A-Z0-9][A-Z0-9]{2}[0-9]){2})(?:-[1-9][0-9]*)?$/;
const PDB_ID_RE = /^[0-9][A-Z0-9]{3}$/;
const CACHE_KEY_RE = /^[a-f0-9]{64}$/;
const COORDINATE_FILE_RE = /^([a-f0-9]{64})\.pdb$/;
const inflightByResolver = new WeakMap();
const cacheMutationByResolver = new WeakMap();

class StructureResolverError extends Error {
  constructor(code, message, options = {}) {
    super(message);
    this.name = 'StructureResolverError';
    this.code = code;
    this.transient = Boolean(options.transient);
    this.status = options.status || null;
  }
}

function textValue(value, maxLength = 160) {
  const text = String(value == null ? '' : value).trim();
  if (!text) return '';
  if (text.length > maxLength || /[\u0000-\u001f\u007f]/.test(text)) {
    throw new StructureResolverError('invalid_input', 'Structure identity fields must be short, printable text.');
  }
  return text;
}

function normalizeIdentityToken(value) {
  return String(value || '')
    .normalize('NFKC')
    .toLocaleLowerCase('en-US')
    .replace(/[^a-z0-9\p{L}]+/gu, '');
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function uniqueStrings(values) {
  return [...new Set((values || []).map(value => String(value || '').trim()).filter(Boolean))];
}

function likelyPathogenTarget(input) {
  const text = [input.requestedTarget, input.targetGene, input.strain]
    .filter(Boolean)
    .join(' ')
    .toLocaleLowerCase('en-US');
  return /(virus|viral|influenza|sars|coronavirus|cov[- ]?2|rsv|hiv|ebola|nipah|norovirus|metapneumovirus|parainfluenza|bacteri|fung|parasite|spike|hemagglutinin|neuraminidase|\brbd\b|病毒|流感|冠状|新冠|细菌|真菌|寄生)/i.test(text);
}

function normalizeOrganism(input) {
  const suppliedName = textValue(input.organismName || input.organism || '', 120);
  const suppliedTaxId = input.organismTaxId ?? input.taxId ?? input.TaxId ?? input.organism_tax_id;
  let taxId = suppliedTaxId == null || suppliedTaxId === '' ? null : Number(suppliedTaxId);
  if (taxId != null && (!Number.isSafeInteger(taxId) || taxId <= 0 || taxId > 2147483647)) {
    throw new StructureResolverError('invalid_taxon', 'Organism taxon ID must be a positive integer.');
  }
  let name = suppliedName;
  if (/^(?:human|homo sapiens|人|人源)$/i.test(name)) {
    name = 'Homo sapiens';
    taxId = taxId || 9606;
  }
  const defaulted = !name && !taxId;
  if (defaulted && !likelyPathogenTarget(input)) {
    return { name: 'Homo sapiens', taxId: 9606, defaulted: true, required: false };
  }
  if (defaulted) return { name: '', taxId: null, defaulted: false, required: true };
  return { name, taxId, defaulted: false, required: false };
}

function normalizeInput(rawInput) {
  const input = rawInput && typeof rawInput === 'object' ? rawInput : {};
  const requestedTarget = textValue(input.requestedTarget || input.target || input.targetLabel || '', 160);
  const targetGene = textValue(input.targetGene || input.geneSymbol || input.gene || '', 80);
  if (!requestedTarget && !targetGene) {
    throw new StructureResolverError('missing_target', 'A requested target or target gene is required.');
  }
  const organism = normalizeOrganism({ ...input, requestedTarget, targetGene });
  return {
    requestedTarget: requestedTarget || targetGene,
    targetGene,
    organism,
    strain: textValue(input.strain || '', 120),
    isoform: textValue(input.isoform || '', 40)
  };
}

function cacheKeyForInput(input) {
  const normalized = input && input.organism ? input : normalizeInput(input);
  return sha256(JSON.stringify({
    schemaVersion: SCHEMA_VERSION,
    requestedTarget: normalizeIdentityToken(normalized.requestedTarget),
    targetGene: normalizeIdentityToken(normalized.targetGene),
    organismName: normalizeIdentityToken(normalized.organism.name),
    organismTaxId: normalized.organism.taxId,
    strain: normalizeIdentityToken(normalized.strain),
    isoform: normalizeIdentityToken(normalized.isoform)
  }));
}

function emptySource() {
  return {
    kind: null,
    database: null,
    accession: null,
    assemblyId: null,
    biologicalAssembly: false,
    sourceUrl: '',
    downloadUrl: '',
    retrievedAt: null,
    sha256: null,
    experimentalMethod: null,
    resolutionAngstrom: null,
    sequenceCoverage: null
  };
}

function emptyCoordinates(cacheKey = '') {
  return {
    structureUrl: '',
    cacheKey,
    format: 'pdb',
    coordinateAntigenLabel: '',
    targetVerified: false,
    antigenChains: [],
    antibodyChains: [],
    sourceAntigenChains: [],
    sourceAntibodyChains: []
  };
}

function baseContract(input, cacheKey, status, disclosure) {
  return {
    schemaVersion: SCHEMA_VERSION,
    status,
    targetIdentity: {
      requestedLabel: input.requestedTarget,
      canonicalName: '',
      geneSymbol: input.targetGene,
      uniprotAccession: null,
      organismName: input.organism.name,
      organismTaxId: input.organism.taxId,
      strain: input.strain || null,
      isoform: input.isoform || null,
      exactMatch: false,
      confidence: 0
    },
    source: emptySource(),
    coordinates: emptyCoordinates(cacheKey),
    pose: { kind: 'antigen_only', geometryValidated: false },
    display: {
      grade: 'C',
      interfaceDetail: '尚未获得可验证的抗原结构。',
      structureTitle: `${input.requestedTarget} 结构待解析`,
      structuralBasis: '未获得与目标身份精确对应的公开结构。',
      visualSummary: '保留当前目标信息，等待结构来源确认后再生成三维展示。',
      disclosure
    }
  };
}

function unresolvedContract(input, cacheKey, reason) {
  return baseContract(input, cacheKey, 'unresolved', reason || '没有找到与目标和物种精确匹配的公开结构。');
}

function failedContract(input, cacheKey, reason) {
  return baseContract(input, cacheKey, 'failed', reason || '结构解析暂时不可用，可稍后重试。');
}

function cloneContract(value) {
  return JSON.parse(JSON.stringify(value));
}

function assertAllowedRemoteUrl(value) {
  let url;
  try {
    url = new URL(String(value));
  } catch {
    throw new StructureResolverError('unsafe_remote_url', 'Remote structure URL is invalid.');
  }
  if (url.protocol !== 'https:' || url.username || url.password || url.port || !ALLOWED_REMOTE_HOSTS.has(url.hostname)) {
    throw new StructureResolverError('unsafe_remote_url', `Remote host is not allowed: ${url.hostname || 'unknown'}.`);
  }
  return url;
}

function responseHeader(response, name) {
  if (!response || !response.headers) return '';
  if (typeof response.headers.get === 'function') return response.headers.get(name) || '';
  return response.headers[String(name).toLowerCase()] || response.headers[name] || '';
}

function requestAbortError() {
  return new StructureResolverError('request_aborted', 'Structure resolution was cancelled.', { transient: true });
}

function activeRequestSignal(resolver) {
  const context = resolver.requestContext && resolver.requestContext.getStore();
  return context && context.signal ? context.signal : null;
}

function throwIfRequestAborted(resolver) {
  const signal = activeRequestSignal(resolver);
  if (signal && signal.aborted) throw requestAbortError();
}

async function readResponseBuffer(response, maxBytes) {
  const contentLength = Number(responseHeader(response, 'content-length'));
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    throw new StructureResolverError('response_too_large', `Remote response exceeds ${maxBytes} bytes.`, { transient: true });
  }
  if (!response.body || typeof response.body[Symbol.asyncIterator] !== 'function') {
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length > maxBytes) throw new StructureResolverError('response_too_large', 'Remote response is too large.', { transient: true });
    return buffer;
  }
  const chunks = [];
  let bytes = 0;
  for await (const chunk of response.body) {
    const buffer = Buffer.from(chunk);
    bytes += buffer.length;
    if (bytes > maxBytes) throw new StructureResolverError('response_too_large', 'Remote response is too large.', { transient: true });
    chunks.push(buffer);
  }
  return Buffer.concat(chunks, bytes);
}

async function fetchBuffer(resolver, urlValue, init = {}, maxBytes = resolver.options.maxMetadataBytes) {
  const url = assertAllowedRemoteUrl(urlValue);
  const requestSignal = activeRequestSignal(resolver);
  if (requestSignal && requestSignal.aborted) throw requestAbortError();
  const controller = new AbortController();
  let timer;
  let timeoutTriggered = false;
  let requestAbortHandler = null;
  const timeoutError = new StructureResolverError('remote_timeout', `Timed out requesting ${url.hostname}.`, { transient: true });
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => {
      timeoutTriggered = true;
      controller.abort();
      reject(timeoutError);
    }, resolver.options.timeoutMs);
  });
  const requestAbortPromise = requestSignal
    ? new Promise((_, reject) => {
      requestAbortHandler = () => {
        controller.abort();
        reject(requestAbortError());
      };
      requestSignal.addEventListener('abort', requestAbortHandler, { once: true });
    })
    : null;
  const fetchPromise = (async () => {
    let response;
    try {
      response = await resolver.fetchImpl(url.toString(), {
        ...init,
        redirect: 'manual',
        signal: controller.signal,
        headers: {
          accept: 'application/json,text/plain,application/octet-stream,*/*',
          'user-agent': 'ZoonoAb-Structure-Resolver/1.0',
          ...(init.headers || {})
        }
      });
    } catch (error) {
      if (requestSignal && requestSignal.aborted) throw requestAbortError();
      if (timeoutTriggered) throw timeoutError;
      if (error && error.code === 'remote_timeout') throw error;
      throw new StructureResolverError('remote_fetch_failed', `Request to ${url.hostname} failed.`, { transient: true });
    }
    if (response.status >= 300 && response.status < 400) {
      const location = responseHeader(response, 'location');
      if (location) assertAllowedRemoteUrl(new URL(location, url).toString());
      throw new StructureResolverError('remote_redirect', 'Unexpected redirect from a structure data service.', { transient: true, status: response.status });
    }
    if (!response.ok) {
      throw new StructureResolverError('remote_http_error', `${url.hostname} returned HTTP ${response.status}.`, {
        transient: response.status !== 404 && response.status !== 410,
        status: response.status
      });
    }
    try {
      return await readResponseBuffer(response, maxBytes);
    } catch (error) {
      if (error instanceof StructureResolverError) throw error;
      if (requestSignal && requestSignal.aborted) throw requestAbortError();
      if (timeoutTriggered) throw timeoutError;
      throw new StructureResolverError('remote_response_failed', `Response from ${url.hostname} could not be read.`, { transient: true });
    }
  })();
  try {
    const contenders = requestAbortPromise ? [fetchPromise, timeoutPromise, requestAbortPromise] : [fetchPromise, timeoutPromise];
    return await Promise.race(contenders);
  } finally {
    clearTimeout(timer);
    if (requestSignal && requestAbortHandler) requestSignal.removeEventListener('abort', requestAbortHandler);
  }
}

async function fetchJson(resolver, url, init = {}) {
  const buffer = await fetchBuffer(resolver, url, init, resolver.options.maxMetadataBytes);
  try {
    return JSON.parse(buffer.toString('utf8'));
  } catch {
    throw new StructureResolverError('invalid_remote_json', 'Structure data service returned invalid JSON.', { transient: true });
  }
}

function quoteSearchTerm(value) {
  return `"${String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function collectNamedValues(value, out = []) {
  if (!value) return out;
  if (Array.isArray(value)) {
    for (const item of value) collectNamedValues(item, out);
    return out;
  }
  if (typeof value !== 'object') return out;
  if (typeof value.value === 'string') out.push(value.value);
  for (const [key, child] of Object.entries(value)) {
    if (key !== 'value') collectNamedValues(child, out);
  }
  return out;
}

function geneAliases(record) {
  const out = [];
  for (const gene of record.genes || []) {
    for (const key of ['geneName', 'synonyms', 'orderedLocusNames', 'orfNames']) {
      collectNamedValues(gene[key], out);
    }
  }
  return uniqueStrings(out);
}

function proteinNames(record) {
  return uniqueStrings(collectNamedValues(record.proteinDescription || {}));
}

function organismMatches(record, requested) {
  const organism = record.organism || {};
  const resultTaxId = Number(organism.taxonId || organism.taxId || 0) || null;
  if (requested.taxId && resultTaxId !== requested.taxId) return false;
  if (requested.name) {
    const wanted = normalizeIdentityToken(requested.name);
    const names = [organism.scientificName, organism.commonName]
      .map(normalizeIdentityToken)
      .filter(Boolean);
    if (!names.includes(wanted)) return false;
  }
  return Boolean(resultTaxId);
}

function recordMatchesInput(record, input, directAccession = '') {
  if (!record || !record.primaryAccession || !organismMatches(record, input.organism)) return false;
  const accession = String(record.primaryAccession).toUpperCase();
  if (directAccession && accession !== directAccession.split('-')[0]) return false;
  const aliases = geneAliases(record).map(normalizeIdentityToken);
  const names = proteinNames(record).map(normalizeIdentityToken);
  const requested = normalizeIdentityToken(input.requestedTarget);
  const requestedContainsAlias = aliases.some(alias => alias.length >= 3 && requested.includes(alias));
  const nameMatches = names.some(name => {
    if (!name || !requested) return false;
    return name === requested || (Math.min(name.length, requested.length) >= 8 && (name.includes(requested) || requested.includes(name)));
  });
  const targetMatches = aliases.includes(requested) || requestedContainsAlias || nameMatches;
  if (input.targetGene) {
    const geneMatches = aliases.includes(normalizeIdentityToken(input.targetGene));
    return geneMatches && targetMatches;
  }
  if (directAccession) return true;
  return targetMatches;
}

function canonicalProteinName(record) {
  const names = proteinNames(record);
  return names[0] || geneAliases(record)[0] || record.primaryAccession;
}

function uniprotCrossReferenceIds(record) {
  const sequenceLength = Number(record.sequence && record.sequence.length) || null;
  return (record.uniProtKBCrossReferences || [])
    .filter(item => String(item.database || '').toUpperCase() === 'PDB' && PDB_ID_RE.test(String(item.id || '').toUpperCase()))
    .map((item, order) => {
      const chains = (item.properties || []).find(property => String(property.key).toLowerCase() === 'chains');
      let coveredResidues = 0;
      for (const match of String(chains && chains.value || '').matchAll(/=(\d+)-(\d+)/g)) {
        coveredResidues = Math.max(coveredResidues, Math.abs(Number(match[2]) - Number(match[1])) + 1);
      }
      return {
        id: String(item.id).toUpperCase(),
        coverage: sequenceLength && coveredResidues ? coveredResidues / sequenceLength : -1,
        order
      };
    })
    .sort((a, b) => b.coverage - a.coverage || a.order - b.order)
    .map(item => item.id);
}

async function resolveUniProtIdentity(resolver, input) {
  const requestedUpper = input.requestedTarget.toUpperCase();
  const directAccession = !input.targetGene && UNIPROT_ACCESSION_RE.test(requestedUpper) ? requestedUpper : '';
  let records = [];
  if (directAccession) {
    try {
      records = [await fetchJson(resolver, `https://rest.uniprot.org/uniprotkb/${encodeURIComponent(directAccession)}.json`)];
    } catch (error) {
      if (error.status === 404) return null;
      throw error;
    }
  } else {
    const identityTerm = input.targetGene || input.requestedTarget;
    const organismFilter = input.organism.taxId
      ? `organism_id:${input.organism.taxId}`
      : `organism_name:${quoteSearchTerm(input.organism.name)}`;
    const queryKinds = input.targetGene ? ['gene_exact'] : ['gene_exact', 'protein_name'];
    for (const queryKind of queryKinds) {
      const params = new URLSearchParams({
        query: `(${queryKind}:${quoteSearchTerm(identityTerm)}) AND (${organismFilter}) AND (reviewed:true)`,
        format: 'json',
        size: '10',
        fields: 'accession,id,protein_name,gene_names,organism_id,organism_name,length,xref_pdb'
      });
      const data = await fetchJson(resolver, `https://rest.uniprot.org/uniprotkb/search?${params}`);
      records = Array.isArray(data.results) ? data.results : [];
      const exact = records.find(record => recordMatchesInput(record, input, directAccession));
      if (exact) {
        records = [exact];
        break;
      }
    }
  }
  const record = records.find(item => recordMatchesInput(item, input, directAccession));
  if (!record) return null;
  const organism = record.organism || {};
  const genes = geneAliases(record);
  const accession = String(record.primaryAccession).toUpperCase();
  return {
    record,
    accession,
    canonicalName: canonicalProteinName(record),
    geneSymbol: genes[0] || input.targetGene || '',
    organismName: organism.scientificName || input.organism.name,
    organismTaxId: Number(organism.taxonId || organism.taxId),
    sequenceLength: Number(record.sequence && record.sequence.length) || null,
    pdbIds: uniprotCrossReferenceIds(record)
  };
}

function rcsbSearchBody(identity, rows) {
  return {
    query: {
      type: 'terminal',
      service: 'text',
      parameters: {
        attribute: 'rcsb_polymer_entity_container_identifiers.reference_sequence_identifiers.database_accession',
        operator: 'exact_match',
        value: identity.accession
      }
    },
    return_type: 'polymer_entity',
    request_options: {
      paginate: { start: 0, rows },
      results_content_type: ['experimental']
    }
  };
}

async function searchRcsbCandidates(resolver, identity) {
  let results = [];
  let incompleteError = null;
  try {
    const data = await fetchJson(resolver, 'https://search.rcsb.org/rcsbsearch/v2/query', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(rcsbSearchBody(identity, resolver.options.maxRcsbCandidates))
    });
    results = Array.isArray(data.result_set) ? data.result_set : [];
  } catch (error) {
    if (!identity.pdbIds.length) throw error;
    incompleteError = error;
  }
  const hintedEntities = new Map();
  const pdbIds = [];
  for (const result of results) {
    const identifier = String(result.identifier || '').toUpperCase();
    const match = /^([0-9][A-Z0-9]{3})_([A-Z0-9]+)$/.exec(identifier);
    if (!match) continue;
    const [, pdbId, entityId] = match;
    if (!hintedEntities.has(pdbId)) hintedEntities.set(pdbId, []);
    hintedEntities.get(pdbId).push(entityId);
    pdbIds.push(pdbId);
  }
  pdbIds.unshift(...identity.pdbIds);
  const candidates = uniqueStrings(pdbIds).slice(0, resolver.options.maxRcsbCandidates).map(pdbId => ({
    pdbId,
    hintedEntityIds: uniqueStrings(hintedEntities.get(pdbId) || [])
  }));
  candidates.incompleteError = incompleteError;
  return candidates;
}

function entityReferenceAccessions(entity) {
  const identifiers = entity.rcsb_polymer_entity_container_identifiers || {};
  const refs = identifiers.reference_sequence_identifiers || [];
  const out = [];
  for (const ref of refs) {
    if (String(ref.database_name || ref.database || '').toUpperCase() !== 'UNIPROT') continue;
    const values = Array.isArray(ref.database_accession) ? ref.database_accession : [ref.database_accession];
    out.push(...values);
  }
  return uniqueStrings(out.map(value => String(value).toUpperCase()));
}

function entityTaxIds(entity) {
  const sources = [
    ...(entity.rcsb_entity_source_organism || []),
    ...(entity.entity_src_nat || []),
    ...(entity.entity_src_gen || [])
  ];
  return [...new Set(sources.map(item => Number(
    item.ncbi_taxonomy_id || item.pdbx_ncbi_taxonomy_id || item.pdbx_gene_src_ncbi_taxonomy_id
  )).filter(Number.isSafeInteger))];
}

function entityChains(entity) {
  const identifiers = entity.rcsb_polymer_entity_container_identifiers || {};
  const authorChains = uniqueStrings(identifiers.auth_asym_ids || []);
  return authorChains.length ? authorChains : uniqueStrings(identifiers.asym_ids || []);
}

function isExactTargetEntity(entity, identity) {
  return entityReferenceAccessions(entity).includes(identity.accession) && entityTaxIds(entity).includes(identity.organismTaxId);
}

function entityDescription(entity) {
  return String(
    (entity.rcsb_polymer_entity && entity.rcsb_polymer_entity.pdbx_description) ||
    (entity.entity && entity.entity.pdbx_description) ||
    ''
  );
}

function isAntibodyEntity(entity, entryTitle) {
  const description = entityDescription(entity);
  if (/(antibody|immunoglobulin|\bfab\b|nanobody|single[- ]domain|\bvhh\b|\bscfv\b)/i.test(description)) return true;
  return /(antibody|immunoglobulin|\bfab\b|nanobody|\bvhh\b|\bscfv\b)/i.test(entryTitle || '') && /(?:heavy|light) chain/i.test(description);
}

function selectSingleAntibodyChains(antibodyEntities) {
  const described = antibodyEntities.map(item => ({
    description: entityDescription(item.data),
    chain: entityChains(item.data)[0] || ''
  })).filter(item => item.chain);
  const heavy = described.find(item => /heavy chain/i.test(item.description));
  const light = described.find(item => /light chain/i.test(item.description));
  if (heavy && light) return uniqueStrings([heavy.chain, light.chain]);
  return described.length ? [described[0].chain] : [];
}

function entitySequenceCoverage(entity, sequenceLength) {
  if (!sequenceLength) return null;
  const aligns = entity.rcsb_polymer_entity_align || [];
  let covered = 0;
  for (const align of aligns) {
    for (const region of align.aligned_regions || []) {
      covered += Number(region.length) || 0;
    }
  }
  return covered ? Math.min(1, Number((covered / sequenceLength).toFixed(4))) : null;
}

function requestAllowsDomainFragment(input) {
  return /(?:\bRBD\b|\bECD\b|domain|fragment|ectodomain|extracellular|结构域|片段|胞外区|胞外结构域)/i.test(
    String(input && input.requestedTarget || '')
  );
}

async function fetchRcsbEntity(resolver, pdbId, entityId) {
  return fetchJson(resolver, `https://data.rcsb.org/rest/v1/core/polymer_entity/${pdbId}/${encodeURIComponent(entityId)}`);
}

async function inspectRcsbCandidate(resolver, candidate, identity) {
  const { pdbId } = candidate;
  if (!PDB_ID_RE.test(pdbId)) return null;
  const entry = await fetchJson(resolver, `https://data.rcsb.org/rest/v1/core/entry/${pdbId}`);
  const identifiers = entry.rcsb_entry_container_identifiers || {};
  const allEntityIds = uniqueStrings([
    ...(candidate.hintedEntityIds || []),
    ...(identifiers.polymer_entity_ids || [])
  ]).slice(0, resolver.options.maxEntitiesPerEntry);
  if (!allEntityIds.length) return null;
  const entities = [];
  for (const entityId of allEntityIds) {
    try {
      entities.push({ entityId, data: await fetchRcsbEntity(resolver, pdbId, entityId) });
    } catch (error) {
      if ((candidate.hintedEntityIds || []).includes(entityId)) throw error;
    }
  }
  const targetEntities = entities.filter(item => isExactTargetEntity(item.data, identity));
  if (!targetEntities.length) return null;
  const title = String((entry.struct && entry.struct.title) || '');
  const antibodyEntities = entities.filter(item => !targetEntities.includes(item) && isAntibodyEntity(item.data, title));
  const antigenChains = uniqueStrings(targetEntities.flatMap(item => entityChains(item.data)));
  // A Fab is normally represented by separate heavy- and light-chain entities. Biological
  // assemblies can repeat both entities, so keep one chain instance from each entity to
  // display one complete antibody instead of every symmetry-related Fab in the entry.
  const antibodyChains = selectSingleAntibodyChains(antibodyEntities);
  if (!antigenChains.length) return null;
  const methods = (entry.exptl || []).map(item => item.method).filter(Boolean);
  const resolution = Number(entry.rcsb_entry_info && entry.rcsb_entry_info.resolution_combined && entry.rcsb_entry_info.resolution_combined[0]);
  const coverageValues = targetEntities
    .map(item => entitySequenceCoverage(item.data, identity.sequenceLength))
    .filter(value => value != null);
  return {
    pdbId,
    entry,
    title,
    targetEntities,
    sourceAntigenChains: antigenChains,
    sourceAntibodyChains: antibodyChains,
    assemblyIds: uniqueStrings(identifiers.assembly_ids || []),
    experimentalMethod: methods.length ? methods.join(', ') : null,
    resolutionAngstrom: Number.isFinite(resolution) ? resolution : null,
    sequenceCoverage: coverageValues.length ? Math.max(...coverageValues) : null
  };
}

function maybeGunzip(buffer, maxOutputBytes) {
  if (buffer.length >= 2 && buffer[0] === 0x1f && buffer[1] === 0x8b) {
    try {
      return zlib.gunzipSync(buffer, { maxOutputLength: maxOutputBytes });
    } catch {
      throw new StructureResolverError('invalid_gzip', 'Compressed coordinate file could not be decoded.', { transient: true });
    }
  }
  return buffer;
}

function validatePdbBuffer(buffer, maxBytes) {
  if (!Buffer.isBuffer(buffer) || !buffer.length || buffer.length > maxBytes) {
    throw new StructureResolverError('invalid_coordinates', 'Coordinate file is empty or exceeds the configured size limit.', { transient: true });
  }
  const text = buffer.toString('utf8');
  if (text.includes('\u0000')) throw new StructureResolverError('invalid_coordinates', 'Coordinate file contains binary data.', { transient: true });
  const lines = text.split(/\r?\n/);
  let atomCount = 0;
  let modelCount = 0;
  const chains = new Set();
  for (const line of lines) {
    if (line.startsWith('MODEL')) modelCount += 1;
    if (!line.startsWith('ATOM  ')) continue;
    const x = Number.parseFloat(line.slice(30, 38));
    const y = Number.parseFloat(line.slice(38, 46));
    const z = Number.parseFloat(line.slice(46, 54));
    if (![x, y, z].every(Number.isFinite)) continue;
    atomCount += 1;
    chains.add((line[21] || '').trim());
  }
  if (!atomCount) throw new StructureResolverError('invalid_coordinates', 'Coordinate file contains no valid ATOM records.', { transient: true });
  return {
    buffer: Buffer.from(text.replace(/\r\n/g, '\n'), 'utf8'),
    text: text.replace(/\r\n/g, '\n'),
    atomCount,
    chains: [...chains],
    modelCount
  };
}

async function fetchPdbCoordinates(resolver, downloadUrl) {
  const compressed = await fetchBuffer(resolver, downloadUrl, {}, resolver.options.maxCompressedBytes);
  const uncompressed = maybeGunzip(compressed, resolver.options.maxCoordinateBytes);
  return validatePdbBuffer(uncompressed, resolver.options.maxCoordinateBytes);
}

function intersectChains(sourceChains, actualChains) {
  const actual = new Set(actualChains);
  return uniqueStrings(sourceChains).filter(chain => actual.has(chain));
}

async function downloadRcsbCandidate(resolver, meta, identity) {
  const attempts = [];
  let firstTransientError = null;
  const assemblyIds = meta.assemblyIds.length ? meta.assemblyIds.slice(0, 3) : ['1'];
  for (const assemblyId of assemblyIds) {
    if (!/^[A-Za-z0-9._-]{1,20}$/.test(assemblyId)) continue;
    attempts.push({
      url: `https://files.rcsb.org/download/${meta.pdbId}.pdb${assemblyId}.gz`,
      assemblyId,
      biologicalAssembly: true
    });
  }
  attempts.push({
    url: `https://files.rcsb.org/download/${meta.pdbId}.pdb.gz`,
    assemblyId: null,
    biologicalAssembly: false
  });
  for (const attempt of attempts) {
    try {
      const pdb = await fetchPdbCoordinates(resolver, attempt.url);
      const antigenChains = intersectChains(meta.sourceAntigenChains, pdb.chains);
      if (!antigenChains.length) continue;
      const antibodyChains = intersectChains(meta.sourceAntibodyChains, pdb.chains);
      return { ...attempt, pdb, antigenChains, antibodyChains };
    } catch (error) {
      if (error.code === 'request_aborted' || error.code === 'remote_timeout') throw error;
      if (error.transient && !firstTransientError) firstTransientError = error;
    }
  }
  if (firstTransientError) throw firstTransientError;
  return null;
}

function exactTargetIdentity(input, identity) {
  return {
    requestedLabel: input.requestedTarget,
    canonicalName: identity.canonicalName,
    geneSymbol: identity.geneSymbol,
    uniprotAccession: identity.accession,
    organismName: identity.organismName,
    organismTaxId: identity.organismTaxId,
    strain: input.strain || null,
    isoform: input.isoform || (input.requestedTarget.includes('-') && UNIPROT_ACCESSION_RE.test(input.requestedTarget.toUpperCase()) ? input.requestedTarget : null),
    exactMatch: true,
    confidence: 1
  };
}

function makeReadyRcsbContract(input, cacheKey, identity, meta, download, nowIso) {
  const hasAntibody = download.antibodyChains.length > 0;
  const kind = hasAntibody ? 'rcsb_exact_complex' : 'rcsb_exact_antigen';
  const digest = sha256(download.pdb.buffer);
  const biologicalText = download.biologicalAssembly ? 'biological assembly' : '公开实验条目坐标';
  const domainFragment = meta.sequenceCoverage != null && meta.sequenceCoverage < 0.5;
  const shapeLabel = domainFragment ? '目标结构域片段' : '抗原整体形态';
  const coverageLabel = meta.sequenceCoverage == null ? '' : `，序列覆盖 ${(meta.sequenceCoverage * 100).toFixed(1)}%`;
  return {
    schemaVersion: SCHEMA_VERSION,
    status: 'ready',
    targetIdentity: exactTargetIdentity(input, identity),
    source: {
      kind,
      database: 'RCSB PDB',
      accession: meta.pdbId,
      assemblyId: download.assemblyId,
      biologicalAssembly: download.biologicalAssembly,
      sourceUrl: `https://www.rcsb.org/structure/${meta.pdbId}`,
      downloadUrl: download.url,
      retrievedAt: nowIso,
      sha256: digest,
      experimentalMethod: meta.experimentalMethod,
      resolutionAngstrom: meta.resolutionAngstrom,
      sequenceCoverage: meta.sequenceCoverage
    },
    coordinates: {
      structureUrl: '',
      cacheKey,
      format: 'pdb',
      coordinateAntigenLabel: identity.canonicalName,
      targetVerified: true,
      antigenChains: download.antigenChains,
      antibodyChains: download.antibodyChains,
      sourceAntigenChains: meta.sourceAntigenChains,
      sourceAntibodyChains: meta.sourceAntibodyChains
    },
    pose: { kind: hasAntibody ? 'experimental_complex' : 'antigen_only', geometryValidated: false },
    display: {
      grade: hasAntibody ? 'A' : 'B',
      interfaceDetail: hasAntibody
        ? `抗原链 ${download.antigenChains.join(', ')} 与抗体链 ${download.antibodyChains.join(', ')} 来自同一公开实验${biologicalText}${coverageLabel}。`
        : `已确认抗原链 ${download.antigenChains.join(', ')}${coverageLabel}；当前结构不包含可验证的抗体界面。`,
      structureTitle: hasAntibody
        ? `${input.requestedTarget} 实验复合物结构`
        : `${input.requestedTarget} 实验抗原结构`,
      structuralBasis: `RCSB ${meta.pdbId} ${meta.title || identity.canonicalName}${download.biologicalAssembly ? ` / assembly ${download.assemblyId}` : ''}`,
      visualSummary: hasAntibody
        ? `保留公开实验结构中的${shapeLabel}与抗体结合姿态。`
        : `保留公开实验结构中的真实${shapeLabel}，后续可叠加展示级 Fab/VHH 姿态。`,
      disclosure: hasAntibody
        ? (domainFragment
          ? '抗原身份、物种和链映射已交叉验证；当前坐标是用户所请求结构域的实验片段，不代表完整天然抗原形状，复合物几何仍需单独校验。'
          : '抗原身份、物种和链映射已按 UniProt 与 RCSB 实体交叉验证；复合物几何仍需单独校验。')
        : (domainFragment
          ? '抗原身份、物种和链映射已验证；当前仅展示用户所请求结构域片段，后续 Fab/VHH 姿态属于展示级候选。'
          : '抗原身份、物种和链映射已验证；后续添加的 Fab/VHH 将属于展示级候选姿态，不代表公开实验复合物。')
    }
  };
}

async function resolveRcsb(resolver, input, cacheKey, identity) {
  const candidates = await searchRcsbCandidates(resolver, identity);
  const antigenOnly = [];
  let firstTransientError = candidates.incompleteError && candidates.incompleteError.transient
    ? candidates.incompleteError
    : null;
  const minSequenceCoverage = requestAllowsDomainFragment(input)
    ? Math.min(resolver.options.minSequenceCoverage, resolver.options.minDomainSequenceCoverage)
    : resolver.options.minSequenceCoverage;
  for (const candidate of candidates) {
    let meta;
    try {
      meta = await inspectRcsbCandidate(resolver, candidate, identity);
    } catch (error) {
      if (error.code === 'request_aborted' || error.code === 'remote_timeout') throw error;
      if (error.transient && !firstTransientError) firstTransientError = error;
      continue;
    }
    if (!meta) continue;
    if (meta.sequenceCoverage != null && meta.sequenceCoverage < minSequenceCoverage) continue;
    if (meta.sourceAntibodyChains.length) {
      try {
        const download = await downloadRcsbCandidate(resolver, meta, identity);
        if (download) {
          const contract = makeReadyRcsbContract(input, cacheKey, identity, meta, download, resolver.now().toISOString());
          return { contract, coordinateBuffer: download.pdb.buffer };
        }
      } catch (error) {
        if (error.code === 'request_aborted' || error.code === 'remote_timeout') throw error;
        if (error.transient && !firstTransientError) firstTransientError = error;
      }
    }
    antigenOnly.push(meta);
  }
  antigenOnly.sort((a, b) => {
    const coverageDelta = (b.sequenceCoverage == null ? -1 : b.sequenceCoverage) -
      (a.sequenceCoverage == null ? -1 : a.sequenceCoverage);
    if (coverageDelta) return coverageDelta;
    const assemblyDelta = Number(Boolean(b.assemblyIds.length)) - Number(Boolean(a.assemblyIds.length));
    if (assemblyDelta) return assemblyDelta;
    return (a.resolutionAngstrom || Infinity) - (b.resolutionAngstrom || Infinity);
  });
  for (const meta of antigenOnly) {
    try {
      const download = await downloadRcsbCandidate(resolver, meta, identity);
      if (!download) continue;
      const contract = makeReadyRcsbContract(input, cacheKey, identity, meta, download, resolver.now().toISOString());
      return { contract, coordinateBuffer: download.pdb.buffer };
    } catch (error) {
      if (error.code === 'request_aborted' || error.code === 'remote_timeout') throw error;
      if (error.transient && !firstTransientError) firstTransientError = error;
    }
  }
  if (firstTransientError) throw firstTransientError;
  return null;
}

async function resolveAlphaFold(resolver, input, cacheKey, identity) {
  let records;
  try {
    records = await fetchJson(resolver, `https://alphafold.ebi.ac.uk/api/prediction/${encodeURIComponent(identity.accession)}`);
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
  if (!Array.isArray(records)) return null;
  const record = records.find(item => String(item.uniprotAccession || '').toUpperCase() === identity.accession);
  if (!record || !record.pdbUrl) return null;
  const downloadUrl = assertAllowedRemoteUrl(record.pdbUrl).toString();
  const pdb = await fetchPdbCoordinates(resolver, downloadUrl);
  const antigenChains = uniqueStrings(pdb.chains);
  if (!antigenChains.length) return null;
  const digest = sha256(pdb.buffer);
  const coverageStart = Number(record.uniprotStart || record.sequenceStart || 0);
  const coverageEnd = Number(record.uniprotEnd || record.sequenceEnd || 0);
  const sequenceCoverage = identity.sequenceLength && coverageStart > 0 && coverageEnd >= coverageStart
    ? Math.min(1, Number(((coverageEnd - coverageStart + 1) / identity.sequenceLength).toFixed(4)))
    : null;
  const contract = {
    schemaVersion: SCHEMA_VERSION,
    status: 'ready',
    targetIdentity: exactTargetIdentity(input, identity),
    source: {
      kind: 'alphafold_exact_antigen',
      database: 'AlphaFold DB',
      accession: identity.accession,
      assemblyId: null,
      biologicalAssembly: false,
      sourceUrl: `https://alphafold.ebi.ac.uk/entry/${identity.accession}`,
      downloadUrl,
      retrievedAt: resolver.now().toISOString(),
      sha256: digest,
      experimentalMethod: null,
      resolutionAngstrom: null,
      sequenceCoverage
    },
    coordinates: {
      structureUrl: '',
      cacheKey,
      format: 'pdb',
      coordinateAntigenLabel: identity.canonicalName,
      targetVerified: true,
      antigenChains,
      antibodyChains: [],
      sourceAntigenChains: antigenChains,
      sourceAntibodyChains: []
    },
    pose: { kind: 'antigen_only', geometryValidated: false },
    display: {
      grade: 'C',
      interfaceDetail: `AlphaFold 精确条目中的抗原链 ${antigenChains.join(', ')}；当前不包含实验验证的抗体界面。`,
      structureTitle: `${input.requestedTarget} 预测抗原结构`,
      structuralBasis: `AlphaFold DB ${identity.accession} 精确 UniProt 条目`,
      visualSummary: '保留精确目标条目的预测抗原形态，后续可叠加展示级 Fab/VHH 姿态。',
      disclosure: '抗原身份与物种来自精确 UniProt 条目，坐标来自 AlphaFold 预测；后续结合姿态属于展示级候选，不代表公开实验复合物。'
    }
  };
  return { contract, coordinateBuffer: pdb.buffer };
}

function safeCacheKey(value) {
  const key = String(value || '').toLowerCase();
  if (!CACHE_KEY_RE.test(key)) throw new StructureResolverError('unsafe_cache_key', 'Cache key is invalid.');
  return key;
}

function recordPath(resolver, cacheKey) {
  return path.join(resolver.recordsDir, `${safeCacheKey(cacheKey)}.json`);
}

function coordinatePath(resolver, fileName) {
  const match = COORDINATE_FILE_RE.exec(String(fileName || ''));
  if (!match) throw new StructureResolverError('unsafe_cache_path', 'Cached coordinate filename is invalid.');
  const fullPath = path.resolve(resolver.coordinatesDir, fileName);
  const prefix = path.resolve(resolver.coordinatesDir) + path.sep;
  if (!fullPath.startsWith(prefix)) throw new StructureResolverError('unsafe_cache_path', 'Cached coordinate path escapes the cache directory.');
  return fullPath;
}

async function ensureCacheDirectories(resolver) {
  await Promise.all([
    fsp.mkdir(resolver.recordsDir, { recursive: true }),
    fsp.mkdir(resolver.coordinatesDir, { recursive: true })
  ]);
}

async function atomicWrite(filePath, data) {
  const tempPath = `${filePath}.${process.pid}.${crypto.randomBytes(8).toString('hex')}.tmp`;
  try {
    await fsp.writeFile(tempPath, data, { flag: 'wx', mode: 0o600 });
    await fsp.rename(tempPath, filePath);
  } finally {
    await fsp.unlink(tempPath).catch(() => {});
  }
}

function withCacheMutation(resolver, operation) {
  const previous = cacheMutationByResolver.get(resolver) || Promise.resolve();
  const current = previous.catch(() => {}).then(operation);
  cacheMutationByResolver.set(resolver, current);
  return current.finally(() => {
    if (cacheMutationByResolver.get(resolver) === current) cacheMutationByResolver.delete(resolver);
  });
}

function saveCacheRecord(resolver, cacheKey, structure, coordinateBuffer = null) {
  return withCacheMutation(resolver, async () => {
    throwIfRequestAborted(resolver);
    await ensureCacheDirectories(resolver);
    const nowMs = resolver.now().getTime();
    let coordinateFile = null;
    if (coordinateBuffer) {
      const digest = sha256(coordinateBuffer);
      if (structure.source.sha256 !== digest) throw new StructureResolverError('checksum_mismatch', 'Coordinate checksum changed before caching.');
      coordinateFile = `${digest}.pdb`;
      const filePath = coordinatePath(resolver, coordinateFile);
      try {
        await fsp.access(filePath, fs.constants.R_OK);
      } catch {
        await atomicWrite(filePath, coordinateBuffer);
      }
    }
    throwIfRequestAborted(resolver);
    const ttl = structure.status === 'ready' ? resolver.options.positiveTtlMs : resolver.options.negativeTtlMs;
    const record = {
      schemaVersion: SCHEMA_VERSION,
      kind: structure.status === 'ready' ? 'positive' : 'negative',
      cacheKey,
      createdAt: new Date(nowMs).toISOString(),
      lastAccessedAt: new Date(nowMs).toISOString(),
      expiresAt: new Date(nowMs + ttl).toISOString(),
      coordinateFile,
      structure
    };
    const cacheRecordPath = recordPath(resolver, cacheKey);
    await atomicWrite(cacheRecordPath, `${JSON.stringify(record, null, 2)}\n`);
    const recordTime = new Date(nowMs);
    await fsp.utimes(cacheRecordPath, recordTime, recordTime).catch(() => {});
    await cleanupCacheUnlocked(resolver).catch(() => {});
  });
}

async function readRecordUnlocked(resolver, cacheKey, allowExpired = false, verifyCoordinates = true) {
  let record;
  try {
    const data = await fsp.readFile(recordPath(resolver, cacheKey), 'utf8');
    if (Buffer.byteLength(data) > resolver.options.maxMetadataBytes) return null;
    record = JSON.parse(data);
  } catch (error) {
    if (error && error.code === 'ENOENT') return null;
    return null;
  }
  if (!record || record.schemaVersion !== SCHEMA_VERSION || record.cacheKey !== cacheKey || !record.structure) return null;
  if (!allowExpired && Date.parse(record.expiresAt) <= resolver.now().getTime()) {
    await fsp.unlink(recordPath(resolver, cacheKey)).catch(() => {});
    return null;
  }
  if (record.kind === 'positive') {
    try {
      if (record.coordinateFile !== `${record.structure.source && record.structure.source.sha256}.pdb`) {
        throw new StructureResolverError('checksum_mismatch', 'Cached coordinate filename does not match metadata.');
      }
      const filePath = coordinatePath(resolver, record.coordinateFile);
      if (verifyCoordinates) {
        const buffer = await fsp.readFile(filePath);
        validatePdbBuffer(buffer, resolver.options.maxCoordinateBytes);
        const digest = sha256(buffer);
        if (digest !== record.structure.source.sha256 || record.coordinateFile !== `${digest}.pdb`) {
          throw new StructureResolverError('checksum_mismatch', 'Cached coordinate checksum does not match metadata.');
        }
      } else {
        const stat = await fsp.stat(filePath);
        if (!stat.isFile() || stat.size <= 0 || stat.size > resolver.options.maxCoordinateBytes) {
          throw new StructureResolverError('invalid_coordinates', 'Cached coordinate file metadata is invalid.');
        }
      }
    } catch {
      await fsp.unlink(recordPath(resolver, cacheKey)).catch(() => {});
      return null;
    }
  }
  if (!allowExpired) {
    const now = resolver.now();
    record.lastAccessedAt = now.toISOString();
    await fsp.utimes(recordPath(resolver, cacheKey), now, now).catch(() => {});
  }
  return record;
}

function readRecord(resolver, cacheKey, allowExpired = false, verifyCoordinates = true) {
  return withCacheMutation(resolver, () => readRecordUnlocked(resolver, cacheKey, allowExpired, verifyCoordinates));
}

async function cleanupCacheUnlocked(resolver) {
  await ensureCacheDirectories(resolver);
  const names = (await fsp.readdir(resolver.recordsDir)).filter(name => CACHE_KEY_RE.test(name.replace(/\.json$/, '')) && name.endsWith('.json'));
  const records = [];
  for (const name of names) {
    const key = name.slice(0, -5);
    const record = await readRecordUnlocked(resolver, key, true, false);
    if (!record) {
      await fsp.unlink(path.join(resolver.recordsDir, name)).catch(() => {});
      continue;
    }
    const stat = await fsp.stat(path.join(resolver.recordsDir, name)).catch(() => null);
    records.push({
      key,
      record,
      bytes: stat ? stat.size : 0,
      lastAccessedAt: Math.max(
        Date.parse(record.lastAccessedAt || record.createdAt) || 0,
        stat ? stat.mtimeMs : 0
      )
    });
  }
  records.sort((a, b) => a.lastAccessedAt - b.lastAccessedAt);
  const nowMs = resolver.now().getTime();
  const keep = records.filter(item => Date.parse(item.record.expiresAt) > nowMs);
  const remove = records.filter(item => Date.parse(item.record.expiresAt) <= nowMs);
  let totalBytes = keep.reduce((sum, item) => sum + item.bytes, 0);
  const coordinateSizes = new Map();
  for (const item of keep) {
    if (!item.record.coordinateFile || coordinateSizes.has(item.record.coordinateFile)) continue;
    const stat = await fsp.stat(coordinatePath(resolver, item.record.coordinateFile)).catch(() => null);
    coordinateSizes.set(item.record.coordinateFile, stat ? stat.size : 0);
    totalBytes += stat ? stat.size : 0;
  }
  while (keep.length > resolver.options.maxCacheEntries || totalBytes > resolver.options.maxCacheBytes) {
    const item = keep.shift();
    if (!item) break;
    remove.push(item);
    totalBytes -= item.bytes;
    if (item.record.coordinateFile && !keep.some(other => other.record.coordinateFile === item.record.coordinateFile)) {
      totalBytes -= coordinateSizes.get(item.record.coordinateFile) || 0;
    }
  }
  for (const item of remove) await fsp.unlink(recordPath(resolver, item.key)).catch(() => {});
  const referenced = new Set(keep.map(item => item.record.coordinateFile).filter(Boolean));
  for (const name of await fsp.readdir(resolver.coordinatesDir)) {
    if (!COORDINATE_FILE_RE.test(name) || referenced.has(name)) continue;
    await fsp.unlink(coordinatePath(resolver, name)).catch(() => {});
  }
}

function cleanupCache(resolver) {
  return withCacheMutation(resolver, () => cleanupCacheUnlocked(resolver));
}

async function loadCachedStructureForResolver(resolver, inputOrKey) {
  let key;
  if (typeof inputOrKey === 'string') key = safeCacheKey(inputOrKey);
  else key = cacheKeyForInput(normalizeInput(inputOrKey));
  const record = await readRecord(resolver, key);
  return record ? cloneContract(record.structure) : null;
}

async function readStructureTextForResolver(resolver, structureOrKey) {
  const key = typeof structureOrKey === 'string'
    ? safeCacheKey(structureOrKey)
    : safeCacheKey(structureOrKey && structureOrKey.coordinates && structureOrKey.coordinates.cacheKey);
  return withCacheMutation(resolver, async () => {
    const record = await readRecordUnlocked(resolver, key);
    if (!record || record.kind !== 'positive' || !record.coordinateFile) {
      throw new StructureResolverError('structure_not_cached', 'No verified coordinate file exists for this cache key.');
    }
    const buffer = await fsp.readFile(coordinatePath(resolver, record.coordinateFile));
    const validated = validatePdbBuffer(buffer, resolver.options.maxCoordinateBytes);
    if (sha256(buffer) !== record.structure.source.sha256) {
      throw new StructureResolverError('checksum_mismatch', 'Cached coordinate checksum is invalid.');
    }
    return validated.text;
  });
}

async function resolveStructureForResolver(resolver, rawInput) {
  throwIfRequestAborted(resolver);
  let input;
  try {
    input = normalizeInput(rawInput);
  } catch (error) {
    const fallbackInput = {
      requestedTarget: String(rawInput && (rawInput.requestedTarget || rawInput.target) || '未知靶点').slice(0, 160),
      targetGene: '',
      organism: { name: '', taxId: null },
      strain: '',
      isoform: ''
    };
    return failedContract(fallbackInput, '', error.message);
  }
  const cacheKey = cacheKeyForInput(input);
  const cached = await loadCachedStructureForResolver(resolver, cacheKey);
  if (cached) return cached;
  throwIfRequestAborted(resolver);
  if (input.isoform) {
    const requestedUpper = input.requestedTarget.toUpperCase();
    const suffix = requestedUpper.match(/-([1-9][0-9]*)$/);
    const requestedIsoform = normalizeIdentityToken(input.isoform).replace(/^isoform/, '');
    if (!suffix || normalizeIdentityToken(suffix[1]) !== requestedIsoform) {
      const unresolved = unresolvedContract(input, cacheKey, '已指定蛋白 isoform，但本轮没有可将该亚型与公开坐标严格对应的 UniProt isoform accession。');
      await saveCacheRecord(resolver, cacheKey, unresolved);
      return unresolved;
    }
  }
  if (input.organism.required) {
    const unresolved = unresolvedContract(input, cacheKey, '病原体靶点必须先确认物种或毒株，系统不会默认套用人源结构。');
    await saveCacheRecord(resolver, cacheKey, unresolved);
    return unresolved;
  }
  let identity;
  try {
    identity = await resolveUniProtIdentity(resolver, input);
  } catch (error) {
    if (error.code === 'request_aborted') throw error;
    return failedContract(input, cacheKey, error.code === 'remote_timeout' ? '目标身份解析超时，可稍后重试。' : '目标身份服务暂时不可用，可稍后重试。');
  }
  if (!identity) {
    const unresolved = unresolvedContract(input, cacheKey, 'UniProt 中没有找到与目标名称、基因和物种精确一致的条目。');
    await saveCacheRecord(resolver, cacheKey, unresolved);
    return unresolved;
  }
  let resolved = null;
  let rcsbError = null;
  let alphaFoldError = null;
  try {
    resolved = await resolveRcsb(resolver, input, cacheKey, identity);
  } catch (error) {
    if (error.code === 'request_aborted') throw error;
    rcsbError = error;
  }
  if (!resolved) {
    try {
      resolved = await resolveAlphaFold(resolver, input, cacheKey, identity);
    } catch (error) {
      if (error.code === 'request_aborted') throw error;
      alphaFoldError = error;
    }
  }
  if (!resolved) {
    const transientError = [rcsbError, alphaFoldError].find(error => error && error.transient);
    if (transientError) {
      return failedContract(input, cacheKey, '公开结构服务暂时不可用，本次结果不会写入无结构缓存。');
    }
    if (alphaFoldError && alphaFoldError.code === 'unsafe_remote_url') {
      return failedContract(input, cacheKey, '结构来源未通过安全校验。');
    }
    const unresolved = unresolvedContract(input, cacheKey, '已确认目标身份，但 RCSB 与 AlphaFold 均没有可安全加载的精确结构。');
    unresolved.targetIdentity = exactTargetIdentity(input, identity);
    unresolved.targetIdentity.exactMatch = true;
    unresolved.targetIdentity.confidence = 1;
    await saveCacheRecord(resolver, cacheKey, unresolved);
    return unresolved;
  }
  throwIfRequestAborted(resolver);
  await saveCacheRecord(resolver, cacheKey, resolved.contract, resolved.coordinateBuffer);
  return cloneContract(resolved.contract);
}

function createStructureResolver(options = {}) {
  const cacheDir = path.resolve(options.cacheDir || DEFAULT_CACHE_DIR);
  const resolver = {
    options: {
      timeoutMs: Math.max(10, Number(options.timeoutMs) || 6000),
      maxMetadataBytes: Math.max(1024, Number(options.maxMetadataBytes) || 2 * MB),
      maxCompressedBytes: Math.max(1024, Number(options.maxCompressedBytes) || 24 * MB),
      maxCoordinateBytes: Math.max(1024, Number(options.maxCoordinateBytes) || 48 * MB),
      positiveTtlMs: Math.max(1000, Number(options.positiveTtlMs) || 30 * 24 * 60 * 60 * 1000),
      negativeTtlMs: Math.max(1000, Number(options.negativeTtlMs) || 6 * 60 * 60 * 1000),
      maxCacheBytes: Math.max(4096, Number(options.maxCacheBytes) || 512 * MB),
      maxCacheEntries: Math.max(1, Number(options.maxCacheEntries) || 250),
      maxRcsbCandidates: Math.max(1, Math.min(50, Number(options.maxRcsbCandidates) || 12)),
      maxEntitiesPerEntry: Math.max(1, Math.min(100, Number(options.maxEntitiesPerEntry) || 24)),
      minSequenceCoverage: Math.max(0, Math.min(1, Number(options.minSequenceCoverage) || 0.5)),
      minDomainSequenceCoverage: Math.max(0, Math.min(1, Number(options.minDomainSequenceCoverage) || 0.08))
    },
    cacheDir,
    recordsDir: path.join(cacheDir, 'records'),
    coordinatesDir: path.join(cacheDir, 'coordinates'),
    fetchImpl: options.fetchImpl || globalThis.fetch,
    now: typeof options.now === 'function' ? options.now : () => new Date(),
    requestContext: new AsyncLocalStorage()
  };
  if (typeof resolver.fetchImpl !== 'function') {
    throw new StructureResolverError('fetch_unavailable', 'This Node.js runtime does not provide fetch.');
  }
  inflightByResolver.set(resolver, new Map());
  return {
    cacheDir,
    resolveStructure(rawInput, requestOptions = {}) {
      const requestSignal = requestOptions && requestOptions.signal;
      const execute = () => resolveStructureForResolver(resolver, rawInput);
      if (requestSignal) {
        return resolver.requestContext.run({ signal: requestSignal }, execute);
      }
      let key;
      try {
        key = cacheKeyForInput(normalizeInput(rawInput));
      } catch {
        return resolver.requestContext.run({ signal: null }, execute);
      }
      const inflight = inflightByResolver.get(resolver);
      if (inflight.has(key)) return inflight.get(key);
      const promise = resolver.requestContext.run({ signal: null }, execute).finally(() => inflight.delete(key));
      inflight.set(key, promise);
      return promise;
    },
    resolveTargetStructure(rawInput, requestOptions = {}) {
      return this.resolveStructure(rawInput, requestOptions);
    },
    loadCachedStructure(inputOrKey) {
      return loadCachedStructureForResolver(resolver, inputOrKey);
    },
    readStructureText(structureOrKey) {
      return readStructureTextForResolver(resolver, structureOrKey);
    },
    cleanupCache() {
      return cleanupCache(resolver);
    },
    cacheKeyForInput(rawInput) {
      return cacheKeyForInput(normalizeInput(rawInput));
    }
  };
}

let defaultResolver;
function getDefaultResolver() {
  if (!defaultResolver) defaultResolver = createStructureResolver();
  return defaultResolver;
}

module.exports = {
  ALLOWED_REMOTE_HOSTS,
  SCHEMA_VERSION,
  StructureResolverError,
  assertAllowedRemoteUrl,
  cacheKeyForInput: rawInput => cacheKeyForInput(normalizeInput(rawInput)),
  createStructureResolver,
  resolveStructure: (rawInput, requestOptions) => getDefaultResolver().resolveStructure(rawInput, requestOptions),
  resolveTargetStructure: (rawInput, requestOptions) => getDefaultResolver().resolveStructure(rawInput, requestOptions),
  loadCachedStructure: inputOrKey => getDefaultResolver().loadCachedStructure(inputOrKey),
  readStructureText: structureOrKey => getDefaultResolver().readStructureText(structureOrKey)
};
