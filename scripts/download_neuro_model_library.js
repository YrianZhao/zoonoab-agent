'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { generateDisplayPose } = require('../lib/display-pose');

const ROOT = path.resolve(__dirname, '..');
const PDB_DIR = path.join(ROOT, 'pdb');
const MANIFEST_PATH = path.join(PDB_DIR, 'neuro-library-manifest.json');
const HUMAN_TAX_ID = 9606;

function sha256(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

async function downloadText(url) {
  const response = await fetch(url, { headers: { 'user-agent': 'ZoonoAb-neuro-library/1.0' } });
  if (!response.ok) throw new Error('Download failed (' + response.status + '): ' + url);
  const text = await response.text();
  if (!/^(?:ATOM  |HETATM|HEADER)/m.test(text)) {
    throw new Error('Downloaded structure has no coordinate records: ' + url);
  }
  return text.replace(/\r\n/g, '\n').split('\n').map(line => line.trimEnd()).join('\n');
}

function extractProteinChainsPdb(pdbText, chains) {
  const allowed = new Set(chains);
  const selected = String(pdbText).split(/\r?\n/).filter(line => (
    line.startsWith('ATOM  ') && allowed.has(line[21] || ' ')
  ));
  if (selected.length < 300) throw new Error('Protein-chain extraction produced too few atoms for ' + chains.join(','));
  return selected.join('\n') + '\nEND\n';
}

function withLibraryRemarks(pdbText, remarkLines) {
  const lines = String(pdbText).replace(/^HEADER.*\n?/m, '').trimStart();
  return ['HEADER    ZOONOAB NEURO DISPLAY LIBRARY', ...remarkLines, lines].join('\n').replace(/\n{3,}/g, '\n\n');
}

function withDatPoseRemarks(pdbText, candidateIndex) {
  const remarks = [
    'REMARK 900 NEURO DISPLAY STRUCTURE',
    'REMARK 901 TARGET: DAT',
    'REMARK 902 FORMAT: Fab',
    'REMARK 903 STRUCTURAL BASIS: RCSB 9EO4 human dopamine transporter outward-open structure + RCSB 5MO9 AB20 Fab display scaffold',
    'REMARK 904 ANTIGEN CHAINS: B',
    'REMARK 905 ANTIBODY CHAINS: H,L',
    'REMARK 906 TARGET-EXACT DISPLAY POSE FOR ROADSHOW AND PRODUCT PRESENTATION',
    'REMARK 910 ORGANISM: Homo sapiens',
    'REMARK 911 TAXID: ' + HUMAN_TAX_ID,
    'REMARK 912 ACCESSION: 9EO4',
    'REMARK 913 CANDIDATE: DAT-Fab-' + String(candidateIndex).padStart(2, '0'),
    'REMARK 914 GENE: SLC6A3'
  ];
  const lines = String(pdbText).split(/\r?\n/);
  if (lines[0] && lines[0].startsWith('HEADER')) {
    lines.splice(1, 0, ...remarks);
    return lines.join('\n');
  }
  return ['HEADER    ZOONOAB NEURO DISPLAY LIBRARY', ...remarks, ...lines].join('\n');
}

async function main() {
  fs.mkdirSync(PDB_DIR, { recursive: true });

  const datUrl = 'https://files.rcsb.org/download/9EO4.pdb';
  const trkbUrl = 'https://files.rcsb.org/download/5MO9.pdb';
  const datRaw = await downloadText(datUrl);
  const trkbRaw = await downloadText(trkbUrl);

  const manifestModels = [];

  const datReferenceFilename = 'NEUROLIB-HUMAN-DAT-RCSB-9EO4.pdb';
  const datReference = withLibraryRemarks(datRaw, [
    'REMARK 900 NEURO DISPLAY STRUCTURE',
    'REMARK 901 TARGET: DAT',
    'REMARK 902 FORMAT: Antigen',
    'REMARK 903 STRUCTURAL BASIS: RCSB 9EO4 outward-open human dopamine transporter bound to cocaine',
    'REMARK 904 ANTIGEN CHAINS: B',
    'REMARK 905 ANTIBODY CHAINS:',
    'REMARK 906 EXACT HUMAN DAT ANTIGEN STRUCTURE FOR EXHIBITION AND PRODUCT PRESENTATION',
    'REMARK 910 ORGANISM: Homo sapiens',
    'REMARK 911 TAXID: ' + HUMAN_TAX_ID,
    'REMARK 912 ACCESSION: 9EO4',
    'REMARK 913 DISPLAY CONTEXT: ADHD and dopamine reuptake regulation',
    'REMARK 914 GENE: SLC6A3'
  ]);
  fs.writeFileSync(path.join(PDB_DIR, datReferenceFilename), datReference);
  manifestModels.push({
    filename: datReferenceFilename,
    target: 'DAT',
    gene: 'SLC6A3',
    organism: 'Homo sapiens',
    organismTaxId: HUMAN_TAX_ID,
    accession: '9EO4',
    source: 'RCSB PDB',
    sourceUrl: datUrl,
    structureClass: 'experimental_antigen',
    context: 'ADHD and dopamine reuptake regulation',
    sha256: sha256(datReference)
  });

  const trkbReferenceFilename = 'NEUROLIB-HUMAN-TRKB-FAB-RCSB-5MO9.pdb';
  const trkbReference = withLibraryRemarks(trkbRaw, [
    'REMARK 900 NEURO DISPLAY STRUCTURE',
    'REMARK 901 TARGET: TrkB',
    'REMARK 902 FORMAT: Fab',
    'REMARK 903 STRUCTURAL BASIS: RCSB 5MO9 human TrkB ligand-binding domain in complex with AB20 Fab',
    'REMARK 904 ANTIGEN CHAINS: X',
    'REMARK 905 ANTIBODY CHAINS: H,L',
    'REMARK 906 EXACT HUMAN TRKB-FAB COMPLEX FOR EXHIBITION AND PRODUCT PRESENTATION',
    'REMARK 910 ORGANISM: Homo sapiens',
    'REMARK 911 TAXID: ' + HUMAN_TAX_ID,
    'REMARK 912 ACCESSION: 5MO9',
    'REMARK 913 DISPLAY CONTEXT: neuroplasticity-axis structural reference',
    'REMARK 914 GENE: NTRK2'
  ]);
  fs.writeFileSync(path.join(PDB_DIR, trkbReferenceFilename), trkbReference);
  manifestModels.push({
    filename: trkbReferenceFilename,
    target: 'TrkB',
    gene: 'NTRK2',
    organism: 'Homo sapiens',
    organismTaxId: HUMAN_TAX_ID,
    accession: '5MO9',
    source: 'RCSB PDB',
    sourceUrl: trkbUrl,
    structureClass: 'experimental_reference_complex',
    context: 'Neuroplasticity-axis structural reference',
    sha256: sha256(trkbReference)
  });

  const datAntigen = extractProteinChainsPdb(datRaw, ['B']);
  const trkbFabScaffold = extractProteinChainsPdb(trkbRaw, ['H', 'L']);
  for (let candidateIndex = 1; candidateIndex <= 10; candidateIndex += 1) {
    const pose = generateDisplayPose({
      antigenPdbText: datAntigen,
      antigenChains: ['B'],
      scaffoldPdbText: trkbFabScaffold,
      scaffoldAntibodyChains: ['H', 'L'],
      antibodyFormat: 'Fab',
      seed: 'human-dat-display-library-v1',
      candidateIndex,
      sourceMetadata: {
        target: 'DAT',
        antigenSource: 'RCSB 9EO4 human dopamine transporter outward-open structure',
        scaffoldSource: 'RCSB 5MO9 AB20 Fab'
      }
    });
    if (!pose.ok) {
      throw new Error('DAT display pose ' + candidateIndex + ' failed: ' + JSON.stringify(pose.error));
    }
    const filename = 'DAT-Fab-' + String(candidateIndex).padStart(2, '0') + '.pdb';
    const pdbText = withDatPoseRemarks(pose.pdbText, candidateIndex);
    fs.writeFileSync(path.join(PDB_DIR, filename), pdbText);
    manifestModels.push({
      filename,
      target: 'DAT',
      gene: 'SLC6A3',
      organism: 'Homo sapiens',
      organismTaxId: HUMAN_TAX_ID,
      accession: '9EO4',
      referenceAccession: '5MO9',
      source: 'RCSB PDB',
      sourceUrl: datUrl,
      structureClass: 'target_exact_display_pose',
      context: 'ADHD DAT Fab display pose',
      antigenChains: pose.antigenChains,
      antibodyChains: pose.antibodyChains,
      geometry: pose.pose.geometry,
      sha256: sha256(pdbText)
    });
  }

  const manifest = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    purpose: 'Roadshow, exhibition and product-presentation neuro molecular structure library',
    sources: ['https://www.rcsb.org/', 'https://files.rcsb.org/'],
    totalModels: manifestModels.length,
    models: manifestModels
  };
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');
  console.log('Downloaded and generated ' + manifestModels.length + ' neuro display structures.');
}

main().catch(error => {
  console.error(error && error.stack ? error.stack : error);
  process.exitCode = 1;
});
