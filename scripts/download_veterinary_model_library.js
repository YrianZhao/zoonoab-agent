'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { generateDisplayPose } = require('../lib/display-pose');

const ROOT = path.resolve(__dirname, '..');
const PDB_DIR = path.join(ROOT, 'pdb');
const MANIFEST_PATH = path.join(PDB_DIR, 'veterinary-library-manifest.json');
const CANINE_TAX_ID = 9615;

const CANINE_MODELS = [
  { gene: 'NGF', accession: 'A0A8I3PYI3', target: 'Canine NGF', protein: 'Beta-nerve growth factor', context: '疼痛与骨关节炎相关展示' },
  { gene: 'BDNF', accession: 'Q7YRB4', target: 'Canine BDNF', protein: 'Brain-derived neurotrophic factor', context: '神经营养因子相关展示' },
  { gene: 'NTF3', accession: 'A0A8I3QXQ5', target: 'Canine NTF3', protein: 'Neurotrophin-3', context: '神经营养因子相关展示' },
  { gene: 'NTF4', accession: 'A0A8I3MVE7', target: 'Canine NTF4', protein: 'Neurotrophin-4', context: '神经营养因子相关展示' },
  { gene: 'IL6', accession: 'P41323', target: 'Canine IL-6', protein: 'Interleukin-6', context: '炎症通路相关展示' },
  { gene: 'TNF', accession: 'P51742', target: 'Canine TNF', protein: 'Tumor necrosis factor', context: '炎症通路相关展示' },
  { gene: 'TSLP', accession: 'A0A8I3MRD5', target: 'Canine TSLP', protein: 'Thymic stromal lymphopoietin', context: '过敏性皮炎相关展示' },
  { gene: 'IL13', accession: 'Q9N0W9', target: 'Canine IL-13', protein: 'Interleukin-13', context: '过敏炎症相关展示' },
  { gene: 'IL5', accession: 'Q95J76', target: 'Canine IL-5', protein: 'Interleukin-5', context: '嗜酸粒细胞炎症相关展示' },
  { gene: 'IL1B', accession: 'Q28292', target: 'Canine IL-1 beta', protein: 'Interleukin-1 beta', context: '炎症通路相关展示' }
];

function sha256(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

async function downloadText(url) {
  const response = await fetch(url, { headers: { 'user-agent': 'ZoonoAb-display-library/1.0' } });
  if (!response.ok) throw new Error('Download failed (' + response.status + '): ' + url);
  const text = await response.text();
  if (!/^ATOM  |^HETATM/m.test(text)) throw new Error('Downloaded structure has no coordinate records: ' + url);
  return text.replace(/\r\n/g, '\n').split('\n').map(line => line.trimEnd()).join('\n');
}

function withLibraryRemarks(pdbText, model) {
  const remarks = [
    'HEADER    ZOONOAB VETERINARY DISPLAY LIBRARY',
    'REMARK 900 VETERINARY DISPLAY STRUCTURE',
    'REMARK 901 TARGET: ' + model.target,
    'REMARK 903 STRUCTURAL BASIS: AlphaFold DB ' + model.accession + ' canine target model',
    'REMARK 904 ANTIGEN CHAINS: A',
    'REMARK 905 ANTIBODY CHAINS:',
    'REMARK 906 TARGET MODEL FOR EXHIBITION AND PRODUCT PRESENTATION',
    'REMARK 910 ORGANISM: Canis lupus familiaris',
    'REMARK 911 TAXID: ' + CANINE_TAX_ID,
    'REMARK 912 ACCESSION: ' + model.accession,
    'REMARK 913 DISPLAY CONTEXT: ' + model.context
  ];
  return remarks.join('\n') + '\n' + String(pdbText).replace(/^HEADER.*\n?/m, '');
}

function matureCanineNgfPdb(pdbText) {
  const lines = String(pdbText).split(/\r?\n/);
  const selected = lines.filter(line => {
    if (!/^(?:ATOM  |HETATM)/.test(line)) return false;
    const residue = Number.parseInt(line.slice(22, 26).trim(), 10);
    return (line[21] || ' ') === 'A' && residue >= 122 && residue <= 241;
  });
  if (selected.length < 300) throw new Error('Canine NGF mature-domain extraction produced too few atoms');
  return selected.join('\n') + '\nEND\n';
}

function antibodyProteinChainsPdb(pdbText, chains) {
  const allowed = new Set(chains);
  const selected = String(pdbText).split(/\r?\n/).filter(line => (
    line.startsWith('ATOM  ') && allowed.has(line[21] || ' ')
  ));
  if (selected.length < 1000) throw new Error('Fab scaffold extraction produced too few protein atoms');
  return selected.join('\n') + '\nEND\n';
}

function withCanineNgfPoseRemarks(pdbText, candidateIndex) {
  const extra = [
    'REMARK 903 STRUCTURAL BASIS: AlphaFold DB A0A8I3PYI3 canine mature NGF + RCSB 4EDW tanezumab Fab display scaffold',
    'REMARK 910 ORGANISM: Canis lupus familiaris',
    'REMARK 911 TAXID: ' + CANINE_TAX_ID,
    'REMARK 912 ACCESSION: A0A8I3PYI3',
    'REMARK 913 CANDIDATE: CANINE-NGF-Fab-' + String(candidateIndex).padStart(2, '0')
  ];
  const lines = String(pdbText).split(/\r?\n/);
  lines.splice(1, 0, ...extra);
  return lines.join('\n');
}

async function main() {
  fs.mkdirSync(PDB_DIR, { recursive: true });
  const manifestModels = [];
  let canineNgfRaw = '';

  for (const model of CANINE_MODELS) {
    const sourceUrl = 'https://alphafold.ebi.ac.uk/files/AF-' + model.accession + '-F1-model_v6.pdb';
    const downloaded = await downloadText(sourceUrl);
    const decorated = withLibraryRemarks(downloaded, model);
    const filename = 'VETLIB-DOG-' + model.gene + '-AF-' + model.accession + '.pdb';
    fs.writeFileSync(path.join(PDB_DIR, filename), decorated);
    if (model.gene === 'NGF') canineNgfRaw = downloaded;
    manifestModels.push({
      filename,
      target: model.target,
      gene: model.gene,
      protein: model.protein,
      organism: 'Canis lupus familiaris',
      organismTaxId: CANINE_TAX_ID,
      accession: model.accession,
      source: 'AlphaFold DB',
      sourceUrl,
      structureClass: 'predicted_antigen',
      context: model.context,
      sha256: sha256(decorated)
    });
  }

  const referenceUrl = 'https://files.rcsb.org/download/4EDW.pdb';
  const ngfFabReference = await downloadText(referenceUrl);
  const referenceFilename = 'VETLIB-NGF-TANEZUMAB-RCSB-4EDW.pdb';
  fs.writeFileSync(path.join(PDB_DIR, referenceFilename), ngfFabReference);
  manifestModels.push({
    filename: referenceFilename,
    target: 'Human NGF',
    gene: 'NGF',
    protein: 'Beta-nerve growth factor / tanezumab Fab complex',
    organism: 'Homo sapiens',
    organismTaxId: 9606,
    accession: '4EDW',
    source: 'RCSB PDB',
    sourceUrl: referenceUrl,
    structureClass: 'experimental_reference_complex',
    context: '犬源 NGF 展示路线的同靶点 Fab 结构参考',
    sha256: sha256(ngfFabReference)
  });

  const matureNgf = matureCanineNgfPdb(canineNgfRaw);
  const ngfFabProteinScaffold = antibodyProteinChainsPdb(ngfFabReference, ['H', 'L']);
  for (let candidateIndex = 1; candidateIndex <= 10; candidateIndex += 1) {
    const pose = generateDisplayPose({
      antigenPdbText: matureNgf,
      antigenChains: ['A'],
      scaffoldPdbText: ngfFabProteinScaffold,
      scaffoldAntibodyChains: ['H', 'L'],
      antibodyFormat: 'Fab',
      seed: 'canine-ngf-display-library-v1',
      candidateIndex,
      sourceMetadata: {
        target: 'Canine NGF',
        antigenSource: 'AlphaFold DB A0A8I3PYI3 mature canine NGF',
        scaffoldSource: 'RCSB 4EDW tanezumab Fab'
      }
    });
    if (!pose.ok) throw new Error('Canine NGF display pose ' + candidateIndex + ' failed: ' + JSON.stringify(pose.error));
    const filename = 'CANINE-NGF-Fab-' + String(candidateIndex).padStart(2, '0') + '.pdb';
    const pdbText = withCanineNgfPoseRemarks(pose.pdbText, candidateIndex);
    fs.writeFileSync(path.join(PDB_DIR, filename), pdbText);
    manifestModels.push({
      filename,
      target: 'Canine NGF',
      gene: 'NGF',
      protein: 'Canine mature NGF with Fab display scaffold',
      organism: 'Canis lupus familiaris',
      organismTaxId: CANINE_TAX_ID,
      accession: 'A0A8I3PYI3',
      source: 'AlphaFold DB + RCSB PDB',
      sourceUrl: 'https://alphafold.ebi.ac.uk/entry/A0A8I3PYI3',
      referenceAccession: '4EDW',
      structureClass: 'target_exact_display_pose',
      context: '犬源 NGF 单抗候选展示',
      antigenChains: pose.antigenChains,
      antibodyChains: pose.antibodyChains,
      geometry: pose.pose.geometry,
      sha256: sha256(pdbText)
    });
  }

  const manifest = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    purpose: 'Roadshow, exhibition and product-presentation molecular structure library',
    totalModels: manifestModels.length,
    models: manifestModels
  };
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');
  console.log('Downloaded and generated ' + manifestModels.length + ' veterinary display structures.');
}

main().catch(error => {
  console.error(error && error.stack ? error.stack : error);
  process.exitCode = 1;
});
