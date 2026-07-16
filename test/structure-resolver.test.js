'use strict';

const assert = require('assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const test = require('node:test');
const zlib = require('zlib');

const {
  SCHEMA_VERSION,
  StructureResolverError,
  assertAllowedRemoteUrl,
  createStructureResolver
} = require('../lib/structure-resolver');

function tempCache() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'zoonoab-structure-cache-'));
}

function jsonResponse(value, status = 200) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { 'content-type': 'application/json' }
  });
}

function bufferResponse(value, status = 200) {
  return new Response(value, {
    status,
    headers: { 'content-type': 'application/octet-stream' }
  });
}

function atomLine(serial, chain, x = serial) {
  return `ATOM  ${String(serial).padStart(5, ' ')}  CA  GLY ${chain}${String(serial).padStart(4, ' ')}    ${Number(x).toFixed(3).padStart(8, ' ')}${(x + 1).toFixed(3).padStart(8, ' ')}${(x + 2).toFixed(3).padStart(8, ' ')}  1.00 20.00           C`;
}

function pdbText(chains) {
  const lines = ['HEADER    TEST STRUCTURE'];
  let serial = 1;
  for (const chain of chains) {
    lines.push(atomLine(serial++, chain));
    lines.push(atomLine(serial++, chain));
  }
  lines.push('END', '');
  return lines.join('\n');
}

function uniprotRecord({ accession = 'P12345', gene = 'NOVEL1', target = 'Novel antigen', taxId = 9606, organism = 'Homo sapiens', pdbIds = [] } = {}) {
  return {
    primaryAccession: accession,
    uniProtkbId: `${gene}_HUMAN`,
    proteinDescription: {
      recommendedName: { fullName: { value: target } },
      alternativeNames: [{ shortNames: [{ value: gene }] }]
    },
    genes: [{ geneName: { value: gene } }],
    organism: { scientificName: organism, taxonId: taxId },
    sequence: { length: 200 },
    uniProtKBCrossReferences: pdbIds.map(id => ({ database: 'PDB', id }))
  };
}

function targetEntity({
  accession = 'P12345',
  taxId = 9606,
  chains = ['A'],
  coverage = 180,
  description = 'Novel antigen',
  labelChains = []
} = {}) {
  return {
    rcsb_polymer_entity: { pdbx_description: description },
    rcsb_polymer_entity_container_identifiers: {
      auth_asym_ids: chains,
      asym_ids: labelChains,
      reference_sequence_identifiers: [{ database_name: 'UniProt', database_accession: accession }]
    },
    rcsb_entity_source_organism: [{ scientific_name: 'Homo sapiens', ncbi_taxonomy_id: taxId }],
    rcsb_polymer_entity_align: [{ aligned_regions: [{ ref_beg_seq_id: 1, entity_beg_seq_id: 1, length: coverage }] }]
  };
}

function antibodyEntity(description, chains) {
  return {
    rcsb_polymer_entity: { pdbx_description: description },
    rcsb_polymer_entity_container_identifiers: { auth_asym_ids: chains }
  };
}

function exactRcsbFetch(calls, options = {}) {
  const accession = options.accession || 'P12345';
  const gene = options.gene || 'NOVEL1';
  const assembly = zlib.gzipSync(Buffer.from(options.pdb || pdbText(['A', 'H', 'L'])));
  return async (url, init = {}) => {
    calls.push({ url, init });
    if (url.startsWith('https://rest.uniprot.org/uniprotkb/search?')) {
      return jsonResponse({ results: [uniprotRecord({ accession, gene, pdbIds: ['1ABC'] })] });
    }
    if (url === 'https://search.rcsb.org/rcsbsearch/v2/query') {
      const body = JSON.parse(init.body);
      assert.equal(body.query.parameters.value, accession);
      return jsonResponse({ result_set: [{ identifier: '1ABC_1' }] });
    }
    if (url === 'https://data.rcsb.org/rest/v1/core/entry/1ABC') {
      return jsonResponse({
        struct: { title: 'NOVEL1 antigen in complex with Fab' },
        rcsb_entry_container_identifiers: { polymer_entity_ids: ['1', '2', '3'], assembly_ids: ['1'] },
        exptl: [{ method: 'X-RAY DIFFRACTION' }],
        rcsb_entry_info: { resolution_combined: [2.4] }
      });
    }
    if (url === 'https://data.rcsb.org/rest/v1/core/polymer_entity/1ABC/1') return jsonResponse(targetEntity({ accession }));
    if (url === 'https://data.rcsb.org/rest/v1/core/polymer_entity/1ABC/2') return jsonResponse(antibodyEntity('Fab heavy chain', options.heavyChains || ['H']));
    if (url === 'https://data.rcsb.org/rest/v1/core/polymer_entity/1ABC/3') return jsonResponse(antibodyEntity('Fab light chain', options.lightChains || ['L']));
    if (url === 'https://files.rcsb.org/download/1ABC.pdb1.gz') return bufferResponse(assembly);
    throw new Error(`Unexpected URL ${url}`);
  };
}

test('resolves an exact RCSB biological assembly and preserves every mapped chain', async t => {
  const cacheDir = tempCache();
  t.after(() => fs.rmSync(cacheDir, { recursive: true, force: true }));
  const calls = [];
  const resolver = createStructureResolver({ cacheDir, fetchImpl: exactRcsbFetch(calls) });

  const structure = await resolver.resolveStructure({
    requestedTarget: 'Novel antigen',
    targetGene: 'NOVEL1'
  });

  assert.equal(structure.status, 'ready');
  assert.equal(structure.source.kind, 'rcsb_exact_complex');
  assert.equal(structure.source.database, 'RCSB PDB');
  assert.equal(structure.source.accession, '1ABC');
  assert.equal(structure.source.assemblyId, '1');
  assert.equal(structure.source.biologicalAssembly, true);
  assert.equal(structure.targetIdentity.uniprotAccession, 'P12345');
  assert.equal(structure.targetIdentity.organismTaxId, 9606);
  assert.equal(structure.targetIdentity.exactMatch, true);
  assert.equal(structure.coordinates.targetVerified, true);
  assert.deepEqual(structure.coordinates.antigenChains, ['A']);
  assert.deepEqual(structure.coordinates.antibodyChains, ['H', 'L']);
  assert.deepEqual(structure.coordinates.sourceAntigenChains, ['A']);
  assert.deepEqual(structure.coordinates.sourceAntibodyChains, ['H', 'L']);
  assert.equal(structure.pose.kind, 'experimental_complex');
  assert.equal(structure.pose.geometryValidated, false);
  assert.equal(structure.display.grade, 'A');
  assert.equal(path.isAbsolute(structure.coordinates.cacheKey), false);
  assert.equal(Object.hasOwn(structure.coordinates, 'cacheFile'), false);

  const text = await resolver.readStructureText(structure);
  assert.match(text, /^ATOM.* A/m);
  assert.match(text, /^ATOM.* H/m);
  assert.match(text, /^ATOM.* L/m);
  assert.equal(structure.source.sha256.length, 64);
  assert.ok(calls.some(call => call.url.endsWith('.pdb1.gz')));
});

test('accepts a model display label containing the exact gene alias', async t => {
  const cacheDir = tempCache();
  t.after(() => fs.rmSync(cacheDir, { recursive: true, force: true }));
  const calls = [];
  const resolver = createStructureResolver({ cacheDir, fetchImpl: exactRcsbFetch(calls, { gene: 'HCRTR2' }) });

  const structure = await resolver.resolveStructure({
    requestedTarget: 'Orexin receptor type 2 (HCRTR2)',
    targetGene: 'HCRTR2'
  });

  assert.equal(structure.status, 'ready');
  assert.equal(structure.targetIdentity.geneSymbol, 'HCRTR2');
  assert.equal(structure.coordinates.targetVerified, true);
});

test('selects one complete Fab when an RCSB assembly repeats antibody chains', async t => {
  const cacheDir = tempCache();
  t.after(() => fs.rmSync(cacheDir, { recursive: true, force: true }));
  const calls = [];
  const resolver = createStructureResolver({
    cacheDir,
    fetchImpl: exactRcsbFetch(calls, {
      pdb: pdbText(['A', 'H', 'L', 'X', 'Y']),
      heavyChains: ['H', 'X'],
      lightChains: ['L', 'Y']
    })
  });

  const structure = await resolver.resolveStructure({ requestedTarget: 'Novel antigen', targetGene: 'NOVEL1' });

  assert.deepEqual(structure.coordinates.antibodyChains, ['H', 'L']);
});

test('uses author chain IDs without mixing in RCSB label chain IDs', async t => {
  const cacheDir = tempCache();
  t.after(() => fs.rmSync(cacheDir, { recursive: true, force: true }));
  const assembly = zlib.gzipSync(Buffer.from(pdbText(['R', 'E'])));
  const fetchImpl = async (url, init = {}) => {
    if (url.startsWith('https://rest.uniprot.org/uniprotkb/search?')) {
      return jsonResponse({ results: [uniprotRecord({ pdbIds: ['1ABC'] })] });
    }
    if (url === 'https://search.rcsb.org/rcsbsearch/v2/query') return jsonResponse({ result_set: [{ identifier: '1ABC_1' }] });
    if (url === 'https://data.rcsb.org/rest/v1/core/entry/1ABC') {
      return jsonResponse({
        struct: { title: 'Novel antigen with a single-domain antibody' },
        rcsb_entry_container_identifiers: { polymer_entity_ids: ['1', '2'], assembly_ids: ['1'] }
      });
    }
    if (url === 'https://data.rcsb.org/rest/v1/core/polymer_entity/1ABC/1') {
      return jsonResponse(targetEntity({ chains: ['R'], labelChains: ['A'] }));
    }
    if (url === 'https://data.rcsb.org/rest/v1/core/polymer_entity/1ABC/2') {
      return jsonResponse(antibodyEntity('single-domain antibody', ['E']));
    }
    if (url === 'https://files.rcsb.org/download/1ABC.pdb1.gz') return bufferResponse(assembly);
    throw new Error(`Unexpected URL ${url} ${init.method || 'GET'}`);
  };
  const resolver = createStructureResolver({ cacheDir, fetchImpl });

  const structure = await resolver.resolveStructure({ requestedTarget: 'Novel antigen', targetGene: 'NOVEL1' });

  assert.deepEqual(structure.coordinates.antigenChains, ['R']);
  assert.deepEqual(structure.coordinates.antibodyChains, ['E']);
});

test('keeps only one heavy-light antibody pair when an entry contains multiple Fabs', async t => {
  const cacheDir = tempCache();
  t.after(() => fs.rmSync(cacheDir, { recursive: true, force: true }));
  const assembly = zlib.gzipSync(Buffer.from(pdbText(['A', 'H', 'L', 'X', 'Y'])));
  const fetchImpl = async url => {
    if (url.startsWith('https://rest.uniprot.org/uniprotkb/search?')) {
      return jsonResponse({ results: [uniprotRecord({ pdbIds: ['1ABC'] })] });
    }
    if (url === 'https://search.rcsb.org/rcsbsearch/v2/query') return jsonResponse({ result_set: [{ identifier: '1ABC_1' }] });
    if (url === 'https://data.rcsb.org/rest/v1/core/entry/1ABC') {
      return jsonResponse({
        struct: { title: 'Novel antigen with two Fabs' },
        rcsb_entry_container_identifiers: { polymer_entity_ids: ['1', '2', '3', '4', '5'], assembly_ids: ['1'] }
      });
    }
    if (url === 'https://data.rcsb.org/rest/v1/core/polymer_entity/1ABC/1') return jsonResponse(targetEntity());
    if (url === 'https://data.rcsb.org/rest/v1/core/polymer_entity/1ABC/2') return jsonResponse(antibodyEntity('First Fab heavy chain', ['H']));
    if (url === 'https://data.rcsb.org/rest/v1/core/polymer_entity/1ABC/3') return jsonResponse(antibodyEntity('First Fab light chain', ['L']));
    if (url === 'https://data.rcsb.org/rest/v1/core/polymer_entity/1ABC/4') return jsonResponse(antibodyEntity('Second Fab heavy chain', ['X']));
    if (url === 'https://data.rcsb.org/rest/v1/core/polymer_entity/1ABC/5') return jsonResponse(antibodyEntity('Second Fab light chain', ['Y']));
    if (url === 'https://files.rcsb.org/download/1ABC.pdb1.gz') return bufferResponse(assembly);
    throw new Error(`Unexpected URL ${url}`);
  };
  const resolver = createStructureResolver({ cacheDir, fetchImpl });

  const structure = await resolver.resolveStructure({ requestedTarget: 'Novel antigen', targetGene: 'NOVEL1' });

  assert.deepEqual(structure.coordinates.antibodyChains, ['H', 'L']);
});

test('falls back to the exact AlphaFold accession when no RCSB entry exists', async t => {
  const cacheDir = tempCache();
  t.after(() => fs.rmSync(cacheDir, { recursive: true, force: true }));
  const calls = [];
  const fetchImpl = async (url, init = {}) => {
    calls.push({ url, init });
    if (url.startsWith('https://rest.uniprot.org/uniprotkb/search?')) {
      return jsonResponse({ results: [uniprotRecord()] });
    }
    if (url === 'https://search.rcsb.org/rcsbsearch/v2/query') return jsonResponse({ result_set: [] });
    if (url === 'https://alphafold.ebi.ac.uk/api/prediction/P12345') {
      return jsonResponse([{
        uniprotAccession: 'P12345',
        uniprotStart: 1,
        uniprotEnd: 200,
        pdbUrl: 'https://alphafold.ebi.ac.uk/files/AF-P12345-F1-model_v6.pdb'
      }]);
    }
    if (url === 'https://alphafold.ebi.ac.uk/files/AF-P12345-F1-model_v6.pdb') {
      return bufferResponse(Buffer.from(pdbText(['A'])));
    }
    throw new Error(`Unexpected URL ${url}`);
  };
  const resolver = createStructureResolver({ cacheDir, fetchImpl });

  const structure = await resolver.resolveStructure({ requestedTarget: 'Novel antigen', targetGene: 'NOVEL1' });

  assert.equal(structure.status, 'ready');
  assert.equal(structure.source.kind, 'alphafold_exact_antigen');
  assert.equal(structure.source.accession, 'P12345');
  assert.equal(structure.source.sequenceCoverage, 1);
  assert.equal(structure.coordinates.targetVerified, true);
  assert.deepEqual(structure.coordinates.antigenChains, ['A']);
  assert.deepEqual(structure.coordinates.antibodyChains, []);
  assert.equal(structure.pose.kind, 'antigen_only');
  assert.equal(structure.display.grade, 'C');
  assert.match(await resolver.readStructureText(structure), /^ATOM/m);
  assert.equal(calls.filter(call => call.url.includes('alphafold.ebi.ac.uk/files/')).length, 1);
});

test('rejects low-coverage whole-target RCSB entries and falls back to AlphaFold', async t => {
  const cacheDir = tempCache();
  t.after(() => fs.rmSync(cacheDir, { recursive: true, force: true }));
  let rcsbCoordinateFetches = 0;
  const fetchImpl = async (url, init = {}) => {
    if (url.startsWith('https://rest.uniprot.org/uniprotkb/search?')) {
      return jsonResponse({ results: [uniprotRecord({ pdbIds: ['1ABC'] })] });
    }
    if (url === 'https://search.rcsb.org/rcsbsearch/v2/query') {
      return jsonResponse({ result_set: [{ identifier: '1ABC_1' }] });
    }
    if (url === 'https://data.rcsb.org/rest/v1/core/entry/1ABC') {
      return jsonResponse({
        struct: { title: 'Short target fragment' },
        rcsb_entry_container_identifiers: { polymer_entity_ids: ['1'], assembly_ids: ['1'] }
      });
    }
    if (url === 'https://data.rcsb.org/rest/v1/core/polymer_entity/1ABC/1') {
      return jsonResponse(targetEntity({ coverage: 20 }));
    }
    if (url.startsWith('https://files.rcsb.org/download/1ABC')) {
      rcsbCoordinateFetches += 1;
      return bufferResponse(zlib.gzipSync(Buffer.from(pdbText(['A']))));
    }
    if (url === 'https://alphafold.ebi.ac.uk/api/prediction/P12345') {
      return jsonResponse([{
        uniprotAccession: 'P12345',
        uniprotStart: 1,
        uniprotEnd: 200,
        pdbUrl: 'https://alphafold.ebi.ac.uk/files/AF-P12345-F1-model_v6.pdb'
      }]);
    }
    if (url === 'https://alphafold.ebi.ac.uk/files/AF-P12345-F1-model_v6.pdb') {
      return bufferResponse(Buffer.from(pdbText(['A'])));
    }
    throw new Error(`Unexpected URL ${url} ${init.method || 'GET'}`);
  };
  const resolver = createStructureResolver({ cacheDir, fetchImpl });

  const structure = await resolver.resolveStructure({ requestedTarget: 'Novel antigen', targetGene: 'NOVEL1' });

  assert.equal(structure.status, 'ready');
  assert.equal(structure.source.kind, 'alphafold_exact_antigen');
  assert.equal(structure.source.sequenceCoverage, 1);
  assert.equal(structure.coordinates.targetVerified, true);
  assert.equal(rcsbCoordinateFetches, 0, 'a whole-target request must not download a 10% coverage RCSB fragment');
});

test('allows a low-coverage experimental fragment only when the requested target names a domain', async t => {
  const cacheDir = tempCache();
  t.after(() => fs.rmSync(cacheDir, { recursive: true, force: true }));
  const assembly = zlib.gzipSync(Buffer.from(pdbText(['A', 'H', 'L'])));
  const fetchImpl = async (url, init = {}) => {
    if (url.startsWith('https://rest.uniprot.org/uniprotkb/search?')) {
      return jsonResponse({ results: [uniprotRecord({ target: 'Novel antigen ECD', pdbIds: ['1ABC'] })] });
    }
    if (url === 'https://search.rcsb.org/rcsbsearch/v2/query') {
      return jsonResponse({ result_set: [{ identifier: '1ABC_1' }] });
    }
    if (url === 'https://data.rcsb.org/rest/v1/core/entry/1ABC') {
      return jsonResponse({
        struct: { title: 'Novel antigen ECD with Fab' },
        rcsb_entry_container_identifiers: { polymer_entity_ids: ['1', '2', '3'], assembly_ids: ['1'] }
      });
    }
    if (url === 'https://data.rcsb.org/rest/v1/core/polymer_entity/1ABC/1') {
      return jsonResponse(targetEntity({ coverage: 20, description: 'Novel antigen ECD' }));
    }
    if (url === 'https://data.rcsb.org/rest/v1/core/polymer_entity/1ABC/2') {
      return jsonResponse(antibodyEntity('Fab heavy chain', ['H']));
    }
    if (url === 'https://data.rcsb.org/rest/v1/core/polymer_entity/1ABC/3') {
      return jsonResponse(antibodyEntity('Fab light chain', ['L']));
    }
    if (url === 'https://files.rcsb.org/download/1ABC.pdb1.gz') return bufferResponse(assembly);
    throw new Error(`Unexpected URL ${url} ${init.method || 'GET'}`);
  };
  const resolver = createStructureResolver({ cacheDir, fetchImpl });

  const structure = await resolver.resolveStructure({ requestedTarget: 'Novel antigen ECD', targetGene: 'NOVEL1' });

  assert.equal(structure.status, 'ready');
  assert.equal(structure.source.kind, 'rcsb_exact_complex');
  assert.equal(structure.source.sequenceCoverage, 0.1);
  assert.equal(structure.coordinates.targetVerified, true);
  assert.match(structure.display.disclosure, /结构域.*片段.*不代表完整天然抗原形状/);
});

test('keeps an explicit isoform unresolved when no isoform accession can be proven', async t => {
  const cacheDir = tempCache();
  t.after(() => fs.rmSync(cacheDir, { recursive: true, force: true }));
  let networkCalls = 0;
  const resolver = createStructureResolver({
    cacheDir,
    fetchImpl: async () => {
      networkCalls += 1;
      throw new Error('An unproven isoform must not reach remote structure services.');
    }
  });

  const structure = await resolver.resolveStructure({
    requestedTarget: 'Novel antigen',
    targetGene: 'NOVEL1',
    isoform: '2'
  });

  assert.equal(structure.status, 'unresolved');
  assert.equal(structure.coordinates.targetVerified, false);
  assert.equal(structure.targetIdentity.isoform, '2');
  assert.match(structure.display.disclosure, /isoform|UniProt/i);
  assert.equal(networkCalls, 0);
});

test('uses structure cache schema version 3', () => {
  assert.equal(SCHEMA_VERSION, 3);
});

test('loads verified coordinates after resolver restart without making network requests', async t => {
  const cacheDir = tempCache();
  t.after(() => fs.rmSync(cacheDir, { recursive: true, force: true }));
  const input = { requestedTarget: 'Novel antigen', targetGene: 'NOVEL1' };
  const first = createStructureResolver({ cacheDir, fetchImpl: exactRcsbFetch([]) });
  const initial = await first.resolveStructure(input);
  const initialText = await first.readStructureText(initial);
  let networkCalls = 0;
  const restarted = createStructureResolver({
    cacheDir,
    fetchImpl: async () => {
      networkCalls += 1;
      throw new Error('Network must not be used for a cache hit.');
    }
  });

  const cached = await restarted.resolveStructure(input);

  assert.deepEqual(cached, initial);
  assert.equal(await restarted.readStructureText(cached), initialText);
  assert.deepEqual(await restarted.loadCachedStructure(input), initial);
  assert.equal(networkCalls, 0);
});

test('negative-caches exact identity misses and never marks an unresolved target as verified', async t => {
  const cacheDir = tempCache();
  t.after(() => fs.rmSync(cacheDir, { recursive: true, force: true }));
  let calls = 0;
  const fetchImpl = async url => {
    calls += 1;
    assert.match(url, /^https:\/\/rest\.uniprot\.org\/uniprotkb\/search\?/);
    return jsonResponse({ results: [] });
  };
  const input = { requestedTarget: 'Missing antigen', targetGene: 'MISSING1' };
  const resolver = createStructureResolver({ cacheDir, fetchImpl });

  const first = await resolver.resolveStructure(input);
  const callsAfterFirst = calls;
  const second = await createStructureResolver({ cacheDir, fetchImpl }).resolveStructure(input);

  assert.equal(first.status, 'unresolved');
  assert.equal(first.targetIdentity.exactMatch, false);
  assert.equal(first.coordinates.targetVerified, false);
  assert.deepEqual(second, first);
  assert.equal(calls, callsAfterFirst);
  assert.ok(callsAfterFirst >= 1);
});

test('requires requested target and target gene to identify the same UniProt record', async t => {
  const cacheDir = tempCache();
  t.after(() => fs.rmSync(cacheDir, { recursive: true, force: true }));
  let downstreamCalls = 0;
  const fetchImpl = async url => {
    if (url.startsWith('https://rest.uniprot.org/uniprotkb/search?')) {
      return jsonResponse({ results: [uniprotRecord({
        accession: 'Q9NZQ9',
        gene: 'IL33',
        target: 'Interleukin-33',
        pdbIds: ['9X0J']
      })] });
    }
    downstreamCalls += 1;
    throw new Error(`Mismatched identity must not reach a structure service: ${url}`);
  };
  const resolver = createStructureResolver({ cacheDir, fetchImpl });

  const structure = await resolver.resolveStructure({ requestedTarget: 'PD-L1', targetGene: 'IL33' });

  assert.equal(structure.status, 'unresolved');
  assert.equal(structure.targetIdentity.requestedLabel, 'PD-L1');
  assert.equal(structure.targetIdentity.exactMatch, false);
  assert.equal(structure.coordinates.targetVerified, false);
  assert.equal(downstreamCalls, 0);
});

test('times out a non-responsive remote fetch and does not persist a transient failure', async t => {
  const cacheDir = tempCache();
  t.after(() => fs.rmSync(cacheDir, { recursive: true, force: true }));
  const fetchImpl = () => new Promise(() => {});
  const resolver = createStructureResolver({ cacheDir, fetchImpl, timeoutMs: 25 });
  const startedAt = Date.now();

  const structure = await resolver.resolveStructure({ requestedTarget: 'Novel antigen', targetGene: 'NOVEL1' });

  assert.equal(structure.status, 'failed');
  assert.equal(structure.coordinates.targetVerified, false);
  assert.ok(Date.now() - startedAt < 500, 'timeout should bound a fetch implementation that ignores AbortSignal');
  assert.equal(await resolver.loadCachedStructure({ requestedTarget: 'Novel antigen', targetGene: 'NOVEL1' }), null);
});

test('an external AbortSignal stops resolution promptly and never writes a cache record', async t => {
  const cacheDir = tempCache();
  t.after(() => fs.rmSync(cacheDir, { recursive: true, force: true }));
  const fetchImpl = () => new Promise(() => {});
  const resolver = createStructureResolver({ cacheDir, fetchImpl, timeoutMs: 5000 });
  const controller = new AbortController();
  const input = { requestedTarget: 'Cancelled antigen', targetGene: 'CANCEL1' };
  const startedAt = Date.now();
  const pending = resolver.resolveStructure(input, { signal: controller.signal });

  setTimeout(() => controller.abort(), 15);

  await assert.rejects(pending, error => error instanceof StructureResolverError && error.code === 'request_aborted');
  assert.ok(Date.now() - startedAt < 500, 'workflow cancellation should not wait for the per-request timeout');
  assert.equal(await resolver.loadCachedStructure(input), null);
});

test('temporary RCSB failures are not persisted as a negative structure cache', async t => {
  const cacheDir = tempCache();
  t.after(() => fs.rmSync(cacheDir, { recursive: true, force: true }));
  let rcsbRecovered = false;
  let rcsbCalls = 0;
  const fetchImpl = async url => {
    if (url.startsWith('https://rest.uniprot.org/uniprotkb/search?')) {
      return jsonResponse({ results: [uniprotRecord()] });
    }
    if (url === 'https://search.rcsb.org/rcsbsearch/v2/query') {
      rcsbCalls += 1;
      return rcsbRecovered ? jsonResponse({ result_set: [] }) : jsonResponse({ error: 'temporary outage' }, 503);
    }
    if (url === 'https://alphafold.ebi.ac.uk/api/prediction/P12345') return jsonResponse([]);
    throw new Error(`Unexpected URL ${url}`);
  };
  const resolver = createStructureResolver({ cacheDir, fetchImpl });
  const input = { requestedTarget: 'Novel antigen', targetGene: 'NOVEL1' };

  const failed = await resolver.resolveStructure(input);
  assert.equal(failed.status, 'failed');
  assert.equal(await resolver.loadCachedStructure(input), null, 'transient downstream failures must not become six-hour misses');

  rcsbRecovered = true;
  const recovered = await resolver.resolveStructure(input);
  assert.equal(recovered.status, 'unresolved');
  assert.equal(rcsbCalls, 2, 'the recovered service should be queried again immediately');
  assert.ok(await resolver.loadCachedStructure(input), 'an authoritative no-result response may be negative-cached');
});

test('HTTP timeouts and truncated response streams remain retryable', async t => {
  const cacheDir = tempCache();
  t.after(() => fs.rmSync(cacheDir, { recursive: true, force: true }));
  const input = { requestedTarget: 'Novel antigen', targetGene: 'NOVEL1' };

  for (const failure of ['408', '425', 'truncated-stream']) {
    let failedOnce = false;
    const fetchImpl = async url => {
      if (url.startsWith('https://rest.uniprot.org/uniprotkb/search?')) {
        return jsonResponse({ results: [uniprotRecord()] });
      }
      if (url === 'https://search.rcsb.org/rcsbsearch/v2/query') {
        if (!failedOnce) {
          failedOnce = true;
          if (failure !== 'truncated-stream') return jsonResponse({ error: 'retry later' }, Number(failure));
          return new Response(new ReadableStream({
            start(controller) {
              controller.enqueue(new TextEncoder().encode('{"result_set":'));
              controller.error(new Error('upstream stream truncated'));
            }
          }), { status: 200, headers: { 'content-type': 'application/json' } });
        }
        return jsonResponse({ result_set: [] });
      }
      if (url === 'https://alphafold.ebi.ac.uk/api/prediction/P12345') return jsonResponse([]);
      throw new Error(`Unexpected URL ${url}`);
    };
    const resolver = createStructureResolver({ cacheDir: path.join(cacheDir, failure), fetchImpl });

    const failed = await resolver.resolveStructure(input);
    assert.equal(failed.status, 'failed', `${failure} should be treated as a transient failure`);
    assert.equal(await resolver.loadCachedStructure(input), null, `${failure} must not create a negative cache entry`);

    const recovered = await resolver.resolveStructure(input);
    assert.equal(recovered.status, 'unresolved', `${failure} should be retried after recovery`);
    assert.ok(await resolver.loadCachedStructure(input), 'an authoritative recovered miss may be cached');
  }
});

test('concurrent distinct-key resolutions publish complete coordinate records', async t => {
  const cacheDir = tempCache();
  t.after(() => fs.rmSync(cacheDir, { recursive: true, force: true }));
  const assemblies = {
    P11111: zlib.gzipSync(Buffer.from(pdbText(['A', 'H', 'L']))),
    P22222: zlib.gzipSync(Buffer.from(pdbText(['B', 'H', 'L'])))
  };
  const fetchImpl = async (url, init = {}) => {
    const decoded = decodeURIComponent(url);
    if (url.startsWith('https://rest.uniprot.org/uniprotkb/search?')) {
      const isA = decoded.includes('GENEA');
      return jsonResponse({ results: [uniprotRecord({
        accession: isA ? 'P11111' : 'P22222',
        gene: isA ? 'GENEA' : 'GENEB',
        target: isA ? 'Antigen A' : 'Antigen B',
        pdbIds: [isA ? '1AAA' : '2BBB']
      })] });
    }
    if (url === 'https://search.rcsb.org/rcsbsearch/v2/query') {
      const accession = JSON.parse(init.body).query.parameters.value;
      return jsonResponse({ result_set: [{ identifier: (accession === 'P11111' ? '1AAA' : '2BBB') + '_1' }] });
    }
    const entryMatch = url.match(/\/core\/entry\/(1AAA|2BBB)$/);
    if (entryMatch) {
      return jsonResponse({
        struct: { title: 'Antigen in complex with Fab' },
        rcsb_entry_container_identifiers: { polymer_entity_ids: ['1', '2', '3'], assembly_ids: ['1'] }
      });
    }
    const entityMatch = url.match(/\/polymer_entity\/(1AAA|2BBB)\/(1|2|3)$/);
    if (entityMatch) {
      const accession = entityMatch[1] === '1AAA' ? 'P11111' : 'P22222';
      const antigenChain = accession === 'P11111' ? 'A' : 'B';
      if (entityMatch[2] === '1') return jsonResponse(targetEntity({ accession, chains: [antigenChain] }));
      if (entityMatch[2] === '2') return jsonResponse(antibodyEntity('Fab heavy chain', ['H']));
      return jsonResponse(antibodyEntity('Fab light chain', ['L']));
    }
    const coordinateMatch = url.match(/\/(1AAA|2BBB)\.pdb1\.gz$/);
    if (coordinateMatch) return bufferResponse(assemblies[coordinateMatch[1] === '1AAA' ? 'P11111' : 'P22222']);
    throw new Error(`Unexpected URL ${url}`);
  };
  const resolver = createStructureResolver({ cacheDir, fetchImpl });
  const inputs = [
    { requestedTarget: 'Antigen A', targetGene: 'GENEA' },
    { requestedTarget: 'Antigen B', targetGene: 'GENEB' }
  ];

  const structures = await Promise.all(inputs.map(input => resolver.resolveStructure(input)));

  assert.deepEqual(structures.map(item => item.status), ['ready', 'ready']);
  assert.match(await resolver.readStructureText(structures[0]), /^ATOM.* A/m);
  assert.match(await resolver.readStructureText(structures[1]), /^ATOM.* B/m);
  assert.ok(await resolver.loadCachedStructure(inputs[0]));
  assert.ok(await resolver.loadCachedStructure(inputs[1]));
});

test('rejects unapproved AlphaFold download hosts and cache path traversal', async t => {
  const cacheDir = tempCache();
  t.after(() => fs.rmSync(cacheDir, { recursive: true, force: true }));
  let evilHostFetched = false;
  const fetchImpl = async url => {
    if (url.startsWith('https://rest.uniprot.org/uniprotkb/search?')) {
      return jsonResponse({ results: [uniprotRecord()] });
    }
    if (url === 'https://search.rcsb.org/rcsbsearch/v2/query') return jsonResponse({ result_set: [] });
    if (url === 'https://alphafold.ebi.ac.uk/api/prediction/P12345') {
      return jsonResponse([{ uniprotAccession: 'P12345', pdbUrl: 'https://evil.example/target.pdb' }]);
    }
    evilHostFetched = true;
    throw new Error(`Unexpected URL ${url}`);
  };
  const resolver = createStructureResolver({ cacheDir, fetchImpl });

  const structure = await resolver.resolveStructure({ requestedTarget: 'Novel antigen', targetGene: 'NOVEL1' });

  assert.equal(structure.status, 'failed');
  assert.equal(structure.coordinates.targetVerified, false);
  assert.equal(evilHostFetched, false);
  await assert.rejects(() => resolver.readStructureText('../../etc/passwd'), error => {
    assert.ok(error instanceof StructureResolverError);
    return error.code === 'unsafe_cache_key';
  });
  await assert.rejects(() => resolver.readStructureText({ coordinates: { cacheKey: '../bad' } }), /Cache key is invalid/);
  assert.throws(() => assertAllowedRemoteUrl('http://rest.uniprot.org/file'), /not allowed/);
  assert.throws(() => assertAllowedRemoteUrl('https://rest.uniprot.org.evil.example/file'), /not allowed/);
  assert.throws(() => assertAllowedRemoteUrl('https://127.0.0.1/file'), /not allowed/);
});

test('requires an explicit organism for pathogen-looking targets instead of assuming human', async t => {
  const cacheDir = tempCache();
  t.after(() => fs.rmSync(cacheDir, { recursive: true, force: true }));
  let calls = 0;
  const resolver = createStructureResolver({
    cacheDir,
    fetchImpl: async () => {
      calls += 1;
      throw new Error('No request should be made without pathogen organism context.');
    }
  });

  const structure = await resolver.resolveStructure({ requestedTarget: 'SARS-CoV-2 Spike' });

  assert.equal(structure.status, 'unresolved');
  assert.equal(structure.targetIdentity.organismTaxId, null);
  assert.equal(structure.coordinates.targetVerified, false);
  assert.match(structure.display.disclosure, /病原体|物种|毒株/);
  assert.equal(calls, 0);
});

test('does not accept an RCSB entity whose accession or taxon mapping conflicts', async t => {
  const cacheDir = tempCache();
  t.after(() => fs.rmSync(cacheDir, { recursive: true, force: true }));
  let coordinateFetches = 0;
  const fetchImpl = async (url, init = {}) => {
    if (url.startsWith('https://rest.uniprot.org/uniprotkb/search?')) return jsonResponse({ results: [uniprotRecord()] });
    if (url === 'https://search.rcsb.org/rcsbsearch/v2/query') return jsonResponse({ result_set: [{ identifier: '1ABC_1' }] });
    if (url === 'https://data.rcsb.org/rest/v1/core/entry/1ABC') {
      return jsonResponse({ rcsb_entry_container_identifiers: { polymer_entity_ids: ['1'], assembly_ids: ['1'] } });
    }
    if (url === 'https://data.rcsb.org/rest/v1/core/polymer_entity/1ABC/1') {
      return jsonResponse(targetEntity({ accession: 'P99999', taxId: 10090 }));
    }
    if (url === 'https://alphafold.ebi.ac.uk/api/prediction/P12345') return jsonResponse([]);
    if (url.includes('files.rcsb.org')) coordinateFetches += 1;
    throw new Error(`Unexpected URL ${url} ${init.method || 'GET'}`);
  };
  const resolver = createStructureResolver({ cacheDir, fetchImpl });

  const structure = await resolver.resolveStructure({ requestedTarget: 'Novel antigen', targetGene: 'NOVEL1' });

  assert.equal(structure.status, 'unresolved');
  assert.equal(structure.targetIdentity.exactMatch, true, 'UniProt identity remains exact');
  assert.equal(structure.coordinates.targetVerified, false, 'coordinate verification requires exact RCSB entity mapping');
  assert.equal(coordinateFetches, 0);
});

test('enforces coordinate size and ATOM validation before writing cache files', async t => {
  const cacheDir = tempCache();
  t.after(() => fs.rmSync(cacheDir, { recursive: true, force: true }));
  const calls = [];
  const rcsbFetch = exactRcsbFetch(calls, { pdb: 'HEADER NO COORDINATES\nEND\n' });
  const invalidCoordinates = zlib.gzipSync(Buffer.from('HEADER NO COORDINATES\nEND\n'));
  const fetchImpl = (url, init) => {
    if (url === 'https://alphafold.ebi.ac.uk/api/prediction/P12345') return jsonResponse([]);
    if (url === 'https://files.rcsb.org/download/1ABC.pdb.gz') return bufferResponse(invalidCoordinates);
    return rcsbFetch(url, init);
  };
  const resolver = createStructureResolver({ cacheDir, fetchImpl });

  const structure = await resolver.resolveStructure({ requestedTarget: 'Novel antigen', targetGene: 'NOVEL1' });

  assert.equal(structure.status, 'failed');
  assert.equal(structure.coordinates.targetVerified, false);
  assert.equal(await resolver.loadCachedStructure({ requestedTarget: 'Novel antigen', targetGene: 'NOVEL1' }), null,
    'invalid upstream coordinates must remain retryable rather than becoming a negative cache hit');
  const coordinateDir = path.join(cacheDir, 'coordinates');
  const files = fs.existsSync(coordinateDir) ? fs.readdirSync(coordinateDir) : [];
  assert.deepEqual(files, []);
});

test('cache capacity cleanup evicts the least recently used identity', async t => {
  const cacheDir = tempCache();
  t.after(() => fs.rmSync(cacheDir, { recursive: true, force: true }));
  let nowMs = Date.parse('2026-07-14T00:00:00.000Z');
  const fetchImpl = async url => {
    assert.match(url, /^https:\/\/rest\.uniprot\.org\/uniprotkb\/search\?/);
    return jsonResponse({ results: [] });
  };
  const resolver = createStructureResolver({
    cacheDir,
    fetchImpl,
    maxCacheEntries: 2,
    now: () => new Date(nowMs)
  });
  const a = { requestedTarget: 'Missing A', targetGene: 'MISS_A' };
  const b = { requestedTarget: 'Missing B', targetGene: 'MISS_B' };
  const c = { requestedTarget: 'Missing C', targetGene: 'MISS_C' };

  await resolver.resolveStructure(a);
  nowMs += 1000;
  await resolver.resolveStructure(b);
  nowMs += 1000;
  assert.ok(await resolver.loadCachedStructure(a), 'reading A should make it most recently used');
  nowMs += 1000;
  await resolver.resolveStructure(c);

  assert.ok(await resolver.loadCachedStructure(a));
  assert.equal(await resolver.loadCachedStructure(b), null, 'B should be evicted as the least recently used entry');
  assert.ok(await resolver.loadCachedStructure(c));
});

test('invalidates cached metadata when coordinate contents fail their checksum', async t => {
  const cacheDir = tempCache();
  t.after(() => fs.rmSync(cacheDir, { recursive: true, force: true }));
  const input = { requestedTarget: 'Novel antigen', targetGene: 'NOVEL1' };
  const resolver = createStructureResolver({ cacheDir, fetchImpl: exactRcsbFetch([]) });
  const structure = await resolver.resolveStructure(input);
  const coordinateDir = path.join(cacheDir, 'coordinates');
  const [coordinateFile] = fs.readdirSync(coordinateDir);
  fs.writeFileSync(path.join(coordinateDir, coordinateFile), pdbText(['Z']));

  assert.equal(await resolver.loadCachedStructure(input), null);
  await assert.rejects(() => resolver.readStructureText(structure), /No verified coordinate file/);
});
