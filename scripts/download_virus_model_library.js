#!/usr/bin/env node

const fs = require('fs');
const https = require('https');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PDB_DIR = path.join(ROOT, 'pdb');
const MANIFEST_PATH = path.join(PDB_DIR, 'virus-library-manifest.json');

const RCSB_DATA_BASE = 'https://data.rcsb.org/rest/v1/core';
const RCSB_FILE_BASE = 'https://files.rcsb.org/download';

const entries = [
  // Influenza A hemagglutinin representatives, H1-H15.
  { group: 'Influenza', subtype: 'H1', antigen: 'HA', pdbId: '7MFG', file: 'VIRUSLIB-FLU-HA-H01-7MFG.pdb', label: 'Influenza A H1 HA trimer', note: 'H1 NC99 HA trimer with Fab; keeps the HA trimer for display.' },
  { group: 'Influenza', subtype: 'H2', antigen: 'HA', pdbId: '7L0L', file: 'VIRUSLIB-FLU-HA-H02-7L0L.pdb', label: 'Influenza A H2 HA trimer', note: 'H2 CAN05 HA trimer with Fab.' },
  { group: 'Influenza', subtype: 'H3', antigen: 'HA', pdbId: '9EI8', file: 'VIRUSLIB-FLU-HA-H03-9EI8.pdb', label: 'Influenza A H3 HA trimer', note: 'H3 Singapore 2016 HA trimer with Fab.' },
  { group: 'Influenza', subtype: 'H4', antigen: 'HA', pdbId: '5XL8', file: 'VIRUSLIB-FLU-HA-H04-5XL8.pdb', label: 'Influenza A H4 HA', note: 'A/duck/Czech/1956 H4N6 HA.' },
  { group: 'Influenza', subtype: 'H5', antigen: 'HA', pdbId: '4K64', file: 'VIRUSLIB-FLU-HA-H05-4K64.pdb', label: 'Influenza A H5 HA', note: 'Avian H5 HA with human receptor analog.' },
  { group: 'Influenza', subtype: 'H6', antigen: 'HA', pdbId: '4WSR', file: 'VIRUSLIB-FLU-HA-H06-4WSR.pdb', label: 'Influenza A H6 HA', note: 'A/chicken/New York/14677-13/1998 H6 HA.' },
  { group: 'Influenza', subtype: 'H7', antigen: 'HA', pdbId: '8TNL', file: 'VIRUSLIB-FLU-HA-H07-8TNL.pdb', label: 'Influenza A H7 HA', note: 'A/Shanghai/2013 H7N9 HA with neutralizing antibody.' },
  { group: 'Influenza', subtype: 'H8', antigen: 'HA', pdbId: '6V46', file: 'VIRUSLIB-FLU-HA-H08-6V46.pdb', label: 'Influenza A H8 HA', note: 'A/turkey/Ontario/6118/1968 H8N4 HA.' },
  { group: 'Influenza', subtype: 'H9', antigen: 'HA', pdbId: '1JSD', file: 'VIRUSLIB-FLU-HA-H09-1JSD.pdb', label: 'Influenza A H9 HA', note: 'Swine H9 hemagglutinin.' },
  { group: 'Influenza', subtype: 'H10', antigen: 'HA', pdbId: '4CYV', file: 'VIRUSLIB-FLU-HA-H10-4CYV.pdb', label: 'Influenza A H10 HA', note: 'A/mallard/Sweden/51/2002 H10 HA.' },
  { group: 'Influenza', subtype: 'H11', antigen: 'HA', pdbId: '6V47', file: 'VIRUSLIB-FLU-HA-H11-6V47.pdb', label: 'Influenza A H11 HA', note: 'A/duck/Memphis/546/1974 H11N9 HA.' },
  { group: 'Influenza', subtype: 'H12', antigen: 'HA', pdbId: '7A9D', file: 'VIRUSLIB-FLU-HA-H12-7A9D.pdb', label: 'Influenza A H12 HA', note: 'H12 hemagglutinin.' },
  { group: 'Influenza', subtype: 'H13', antigen: 'HA', pdbId: '4KPQ', file: 'VIRUSLIB-FLU-HA-H13-4KPQ.pdb', label: 'Influenza A H13 HA', note: 'Avian H13N6 HA.' },
  { group: 'Influenza', subtype: 'H14', antigen: 'HA', pdbId: '6V48', file: 'VIRUSLIB-FLU-HA-H14-6V48.pdb', label: 'Influenza A H14 HA', note: 'A/mallard/Gurjev/263/1982 H14N5 HA.' },
  { group: 'Influenza', subtype: 'H15', antigen: 'HA', pdbId: '6V49', file: 'VIRUSLIB-FLU-HA-H15-6V49.pdb', label: 'Influenza A H15 HA', note: 'A/wedge-tailed shearwater/Western Australia/2576/1979 H15N9 HA.' },

  // SARS-CoV-2 spike variant representatives.
  { group: 'SARS-CoV-2', subtype: 'Wuhan', antigen: 'Spike', pdbId: '7Z3Z', file: 'VIRUSLIB-SC2-SPIKE-WUHAN-7Z3Z.pdb', label: 'SARS-CoV-2 Wuhan spike', note: 'Locked Wuhan prefusion Spike ectodomain.' },
  { group: 'SARS-CoV-2', subtype: 'D614G', antigen: 'Spike', pdbId: '7WZ2', file: 'VIRUSLIB-SC2-SPIKE-D614G-7WZ2.pdb', label: 'SARS-CoV-2 D614G spike', note: 'D614G Spike trimer.' },
  { group: 'SARS-CoV-2', subtype: 'Alpha B.1.1.7', antigen: 'Spike', pdbId: '7LWT', file: 'VIRUSLIB-SC2-SPIKE-ALPHA-7LWT.pdb', label: 'SARS-CoV-2 Alpha spike', note: 'B.1.1.7 Spike trimer, 1-RBD-up.' },
  { group: 'SARS-CoV-2', subtype: 'Beta B.1.351', antigen: 'Spike', pdbId: '7LYN', file: 'VIRUSLIB-SC2-SPIKE-BETA-7LYN.pdb', label: 'SARS-CoV-2 Beta spike', note: 'B.1.351 Spike trimer, 1-RBD-up.' },
  { group: 'SARS-CoV-2', subtype: 'Gamma P.1', antigen: 'Spike', pdbId: '7V79', file: 'VIRUSLIB-SC2-SPIKE-GAMMA-7V79.pdb', label: 'SARS-CoV-2 Gamma spike', note: 'P.1 Spike trimer, 1-RBD-up.' },
  { group: 'SARS-CoV-2', subtype: 'Delta B.1.617.2', antigen: 'Spike', pdbId: '7TOU', file: 'VIRUSLIB-SC2-SPIKE-DELTA-7TOU.pdb', label: 'SARS-CoV-2 Delta spike', note: 'B.1.617.2 Spike trimer, 3-RBD-down.' },
  { group: 'SARS-CoV-2', subtype: 'Omicron BA.1/B.1.1.529', antigen: 'Spike', pdbId: '8DZH', file: 'VIRUSLIB-SC2-SPIKE-OMICRON-BA1-8DZH.pdb', label: 'SARS-CoV-2 Omicron BA.1 spike', note: 'BA.1.1.529 Spike trimer with Fab.' },
  { group: 'SARS-CoV-2', subtype: 'Omicron BA.2', antigen: 'Spike', pdbId: '7UB0', file: 'VIRUSLIB-SC2-SPIKE-OMICRON-BA2-7UB0.pdb', label: 'SARS-CoV-2 Omicron BA.2 spike', note: 'BA.2 Spike trimer, 3-RBD-down.' },

  // Other coronaviruses.
  { group: 'SARS-CoV-1', subtype: 'SARS one', antigen: 'Spike', pdbId: '8H16', file: 'VIRUSLIB-SARS1-SPIKE-8H16.pdb', label: 'SARS-CoV-1 Spike', note: 'Native SARS-CoV-1 Spike, open conformation.' },
  { group: 'MERS-CoV', subtype: 'MERS', antigen: 'Spike', pdbId: '5X5C', file: 'VIRUSLIB-MERS-SPIKE-5X5C.pdb', label: 'MERS-CoV Spike', note: 'MERS-CoV prefusion Spike glycoprotein.' },

  // Nipah virus.
  { group: 'Nipah virus', subtype: 'G attachment', antigen: 'G', pdbId: '2VWD', file: 'VIRUSLIB-NIPAH-G-2VWD.pdb', label: 'Nipah virus attachment glycoprotein G', note: 'Attachment glycoprotein head domain.' },
  { group: 'Nipah virus', subtype: 'F prefusion', antigen: 'F', pdbId: '8DO4', file: 'VIRUSLIB-NIPAH-F-PREFUSION-8DO4.pdb', label: 'Nipah virus prefusion F', note: 'Prefusion-stabilized Nipah F, dimer of trimers.' },

  // Ebolavirus GP representatives with reliable GP structures.
  { group: 'Ebolavirus', subtype: 'Zaire ebolavirus', antigen: 'GP', pdbId: '9MHA', file: 'VIRUSLIB-EBOLA-ZAIRE-GP-9MHA.pdb', label: 'Zaire Ebola virus GP', note: 'Zaire Ebola envelope glycoprotein GP.' },
  { group: 'Ebolavirus', subtype: 'Sudan ebolavirus', antigen: 'GP', pdbId: '9N8F', file: 'VIRUSLIB-EBOLA-SUDAN-GP-9N8F.pdb', label: 'Sudan ebolavirus GP', note: 'Sudan GP trimer with Fab.' },
  { group: 'Ebolavirus', subtype: 'Bundibugyo ebolavirus', antigen: 'GP', pdbId: '6DZM', file: 'VIRUSLIB-EBOLA-BUNDIBUGYO-GP-6DZM.pdb', label: 'Bundibugyo ebolavirus GP', note: 'Bundibugyo GP with pan-ebolavirus Fab.' },

  // Respiratory syncytial virus.
  { group: 'Respiratory syncytial virus', subtype: 'RSV A', antigen: 'F prefusion', pdbId: '5W23', file: 'VIRUSLIB-RSV-A-F-PREFUSION-5W23.pdb', label: 'RSV A prefusion F', note: 'RSV F prefusion trimer with 5C4 Fab.' },
  { group: 'Respiratory syncytial virus', subtype: 'RSV A/B', antigen: 'F postfusion', pdbId: '3RRR', file: 'VIRUSLIB-RSV-AB-F-POSTFUSION-3RRR.pdb', label: 'RSV A/B postfusion F', note: 'Postfusion F entry containing RSV A and RSV B chains.' },

  // HIV-1 Env display representatives.
  { group: 'HIV', subtype: 'HIV-1 BG505', antigen: 'Env', pdbId: '4NCO', file: 'VIRUSLIB-HIV1-ENV-BG505-4NCO.pdb', label: 'HIV-1 BG505 Env trimer', note: 'BG505 SOSIP gp140 Env trimer with PGT122 Fab.' },
  { group: 'HIV', subtype: 'HIV-1 ConC', antigen: 'Env', pdbId: '8F7T', file: 'VIRUSLIB-HIV1-ENV-CONC-8F7T.pdb', label: 'HIV-1 ConC Env trimer', note: 'Glycan-base ConC Env trimer.' },
  { group: 'HIV', subtype: 'HIV-1 ZM233', antigen: 'Env', pdbId: '9CV7', file: 'VIRUSLIB-HIV1-ENV-ZM233-9CV7.pdb', label: 'HIV-1 ZM233 Env trimer', note: 'ZM233 NFL TD CC3+ Env trimer with Fab.' },

  // Norovirus capsid representatives.
  { group: 'Norovirus', subtype: 'GI.1 Norwalk', antigen: 'VP1 shell', pdbId: '7KJP', file: 'VIRUSLIB-NORO-GI1-VP1-SHELL-7KJP.pdb', label: 'Norovirus GI.1 VP1 shell', note: 'Disulfide-stabilized Norovirus GI.1 VLP shell region.' },
  { group: 'Norovirus', subtype: 'GII.1', antigen: 'VP1 P-domain', pdbId: '6GVZ', file: 'VIRUSLIB-NORO-GII1-VP1-PDOMAIN-6GVZ.pdb', label: 'Norovirus GII.1 VP1 P-domain', note: 'GII.1 protruding domain with bile acid ligand.' },
  { group: 'Norovirus', subtype: 'GII.4', antigen: 'VP1 P-domain', pdbId: '5IYN', file: 'VIRUSLIB-NORO-GII4-VP1-PDOMAIN-5IYN.pdb', label: 'Norovirus GII.4 VP1 P-domain', note: 'GII.4 CHDC2094 protruding domain.' },
  { group: 'Norovirus', subtype: 'GII.17', antigen: 'VP1 P-domain', pdbId: '5F4O', file: 'VIRUSLIB-NORO-GII17-VP1-PDOMAIN-5F4O.pdb', label: 'Norovirus GII.17 VP1 P-domain', note: 'GII.17 Kawasaki308 protruding domain.' },

  // Human metapneumovirus.
  { group: 'Human metapneumovirus', subtype: 'hMPV prefusion', antigen: 'F', pdbId: '5WB0', file: 'VIRUSLIB-HMPV-F-PREFUSION-5WB0.pdb', label: 'Human metapneumovirus prefusion F', note: 'Prefusion-stabilized hMPV fusion glycoprotein.' },
  { group: 'Human metapneumovirus', subtype: 'hMPV A', antigen: 'F', pdbId: '4DAG', file: 'VIRUSLIB-HMPV-A-F-4DAG.pdb', label: 'Human metapneumovirus A F', note: 'hMPV A F with neutralizing antibody.' },
  { group: 'Human metapneumovirus', subtype: 'hMPV postfusion', antigen: 'F', pdbId: '5L1X', file: 'VIRUSLIB-HMPV-F-POSTFUSION-5L1X.pdb', label: 'Human metapneumovirus postfusion F', note: 'Postfusion hMPV F.' },

  // Human parainfluenza virus. Reliable human PDB coverage is HPIV3-heavy.
  { group: 'Human parainfluenza virus', subtype: 'HPIV3', antigen: 'HN', pdbId: '4MZA', file: 'VIRUSLIB-HPIV3-HN-4MZA.pdb', label: 'HPIV3 hemagglutinin-neuraminidase', note: 'Human parainfluenza virus type 3 HN.' },
  { group: 'Human parainfluenza virus', subtype: 'HPIV3', antigen: 'F prefusion', pdbId: '8DG8', file: 'VIRUSLIB-HPIV3-F-PREFUSION-8DG8.pdb', label: 'HPIV3 prefusion F', note: 'HPIV3 prefusion F trimer with Fab.' }
];

const gaps = [
  { group: 'Ebolavirus', subtype: 'Reston / Tai Forest GP', reason: 'No reliable RCSB GP display structure found during this pass; VP24/internal proteins were not used as GP substitutes.' },
  { group: 'Human parainfluenza virus', subtype: 'HPIV1 / HPIV2 / HPIV4 surface proteins', reason: 'RCSB text searches repeatedly resolved to HPIV3 or non-human rubulavirus structures; not downloaded as subtype substitutes.' },
  { group: 'HIV', subtype: 'HIV-2 Env trimer', reason: 'No reliable RCSB HIV-2 Env trimer display structure found during this pass; HIV-1 Env trimer representatives were downloaded.' }
];

function request(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { accept: 'application/json,text/plain,*/*' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        resolve(request(new URL(res.headers.location, url).toString()));
        return;
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const body = Buffer.concat(chunks);
        if (res.statusCode >= 400) {
          reject(new Error(res.statusCode + ' ' + url + ' ' + body.toString('utf8').slice(0, 200)));
          return;
        }
        resolve(body);
      });
    }).on('error', reject);
  });
}

async function getJson(url) {
  return JSON.parse((await request(url)).toString('utf8'));
}

async function fetchEntryMeta(pdbId) {
  const entry = await getJson(`${RCSB_DATA_BASE}/entry/${pdbId}`);
  const entityIds = entry.rcsb_entry_container_identifiers?.polymer_entity_ids || [];
  const entities = [];
  for (const entityId of entityIds) {
    const entity = await getJson(`${RCSB_DATA_BASE}/polymer_entity/${pdbId}/${entityId}`);
    entities.push({
      entityId,
      description: entity.rcsb_polymer_entity?.pdbx_description || '',
      organisms: (entity.rcsb_entity_source_organism || [])
        .map(item => item.scientific_name)
        .filter(Boolean),
      chains: entity.rcsb_polymer_entity_container_identifiers?.auth_asym_ids || []
    });
  }
  return {
    pdbId,
    title: entry.struct?.title || '',
    releaseDate: entry.rcsb_accession_info?.initial_release_date || '',
    experimentalMethod: (entry.exptl || []).map(item => item.method).filter(Boolean),
    resolutionAngstrom: entry.rcsb_entry_info?.resolution_combined?.[0] || null,
    assemblyIds: entry.rcsb_entry_container_identifiers?.assembly_ids || [],
    depositedAtomCount: entry.rcsb_entry_info?.deposited_atom_count || null,
    entities
  };
}

function chainSummary(entities) {
  return entities
    .map(entity => {
      const org = entity.organisms.length ? entity.organisms.join(' / ') : 'unknown organism';
      return `${entity.entityId}:${entity.description} [${org}] chains=${entity.chains.join(',')}`;
    });
}

async function downloadPdb(entry) {
  const outputPath = path.join(PDB_DIR, entry.file);
  const assemblyUrl = `${RCSB_FILE_BASE}/${entry.pdbId}.pdb1`;
  const entryUrl = `${RCSB_FILE_BASE}/${entry.pdbId}.pdb`;
  let sourceUrl = assemblyUrl;
  let body;
  try {
    body = await request(assemblyUrl);
  } catch (err) {
    sourceUrl = entryUrl;
    body = await request(entryUrl);
  }
  const text = body.toString('utf8');
  if (!/\bATOM\b/.test(text)) {
    throw new Error(`Downloaded file for ${entry.pdbId} did not contain ATOM records.`);
  }
  const header = [
    `REMARK 900 ZOONOAB VIRUS DISPLAY LIBRARY`,
    `REMARK 920 SOURCE PDB: ${entry.pdbId}`,
    `REMARK 921 DISPLAY LABEL: ${entry.label}`,
    `REMARK 922 VIRUS GROUP: ${entry.group}`,
    `REMARK 923 SUBTYPE: ${entry.subtype}`,
    `REMARK 924 ANTIGEN: ${entry.antigen}`,
    `REMARK 925 DOWNLOAD URL: ${sourceUrl}`,
    `REMARK 926 NOTE: ${entry.note || ''}`
  ].join('\n') + '\n';
  fs.writeFileSync(outputPath, header + text);
  return { sourceUrl, bytes: fs.statSync(outputPath).size, atomLines: (text.match(/^ATOM/gm) || []).length };
}

async function main() {
  fs.mkdirSync(PDB_DIR, { recursive: true });
  const downloadedAt = new Date().toISOString();
  const results = [];
  for (const entry of entries) {
    process.stdout.write(`Downloading ${entry.file} (${entry.pdbId})... `);
    const meta = await fetchEntryMeta(entry.pdbId);
    const download = await downloadPdb(entry);
    const manifestEntry = {
      ...entry,
      sourceType: 'experimental',
      sourceDatabase: 'RCSB PDB',
      rcsbEntryUrl: `https://www.rcsb.org/structure/${entry.pdbId}`,
      downloadUrl: download.sourceUrl,
      localPath: `pdb/${entry.file}`,
      downloadedAt,
      bytes: download.bytes,
      atomLines: download.atomLines,
      title: meta.title,
      releaseDate: meta.releaseDate,
      experimentalMethod: meta.experimentalMethod,
      resolutionAngstrom: meta.resolutionAngstrom,
      assemblyIds: meta.assemblyIds,
      depositedAtomCount: meta.depositedAtomCount,
      entities: meta.entities,
      entitySummary: chainSummary(meta.entities)
    };
    results.push(manifestEntry);
    console.log(`${download.atomLines} atoms`);
  }

  const manifest = {
    schemaVersion: 1,
    purpose: 'Local display-only virus molecular model library for ZoonoAb. These files are public structural models and are not experimental protocols.',
    generatedAt: downloadedAt,
    sources: [
      'https://www.rcsb.org/',
      'https://data.rcsb.org/',
      'https://files.rcsb.org/'
    ],
    totalModels: results.length,
    models: results,
    gaps
  };
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`Wrote ${MANIFEST_PATH}`);
}

main().catch(err => {
  console.error(err && err.stack ? err.stack : err);
  process.exit(1);
});
