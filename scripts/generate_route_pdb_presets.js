'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'pdb');
const TEMPLATE_DIR = path.join(ROOT, 'pdb_templates');

const ROUTES = [
  {
    id: 'allergic_asthma',
    aliasPrefix: 'IL33-Fab',
    target: 'IL-33',
    count: 15,
    format: 'Fab',
    template: '9X0J',
    sourceLabel: 'RCSB 9X0J IL-33 / Tozorakimab Fab ternary complex',
    antigen: [{ from: 'A', to: 'A' }],
    antibody: [{ from: 'F', to: 'B' }, { from: 'C', to: 'C' }],
    jitter: 0.35,
    antigenChains: ['A'],
    antibodyChains: ['B', 'C']
  },
  {
    id: 'allergic_tslp',
    aliasPrefix: 'TSLP-Fab',
    target: 'TSLP',
    count: 10,
    format: 'Fab',
    template: '5J13',
    sourceLabel: 'RCSB 5J13 TSLP / tezepelumab Fab complex',
    antigen: [{ from: 'A', to: 'A' }],
    antibody: [{ from: 'C', to: 'B' }, { from: 'B', to: 'C' }],
    jitter: 0.8,
    antigenChains: ['A'],
    antibodyChains: ['B', 'C']
  },
  {
    id: 'tumor_immunotherapy',
    aliasPrefix: 'PDL1-Fab',
    target: 'PD-L1',
    count: 10,
    format: 'Fab',
    template: '5X8L',
    sourceLabel: 'RCSB 5X8L PD-L1 / atezolizumab Fab complex',
    antigen: [{ from: 'A', to: 'A' }],
    antibody: [{ from: 'F', to: 'B' }, { from: 'K', to: 'C' }],
    jitter: 0.7,
    antigenChains: ['A'],
    antibodyChains: ['B', 'C']
  },
  {
    id: 'checkpoint_pd1',
    aliasPrefix: 'PD1-Fab',
    target: 'PD-1',
    count: 10,
    format: 'Fab',
    template: '5WT9',
    sourceLabel: 'RCSB 5WT9 PD-1 / nivolumab Fab complex',
    antigen: [{ from: 'G', to: 'A' }],
    antibody: [{ from: 'H', to: 'B' }, { from: 'L', to: 'C' }],
    preserveComplex: true,
    antigenChains: ['A'],
    antibodyChains: ['B', 'C']
  },
  {
    id: 'checkpoint_ctla4',
    aliasPrefix: 'CTLA4-Fab',
    target: 'CTLA-4',
    count: 10,
    format: 'Fab',
    template: '6RP8',
    sourceLabel: 'RCSB 6RP8 CTLA-4 / ipilimumab Fab complex',
    antigen: [{ from: 'C', to: 'A' }],
    antibody: [{ from: 'H', to: 'B' }, { from: 'L', to: 'C' }],
    preserveComplex: true,
    antigenChains: ['A'],
    antibodyChains: ['B', 'C']
  },
  {
    id: 'heme_cd20',
    aliasPrefix: 'CD20-Fab',
    target: 'CD20',
    count: 10,
    format: 'Fab',
    template: '6VJA',
    sourceLabel: 'RCSB 6VJA CD20 / rituximab Fab complex',
    antigen: [{ from: 'C', to: 'A' }, { from: 'D', to: 'D' }],
    antibody: [{ from: 'H', to: 'B' }, { from: 'L', to: 'C' }, { from: 'I', to: 'F' }, { from: 'M', to: 'G' }],
    preserveComplex: true,
    antigenChains: ['A', 'D'],
    antibodyChains: ['B', 'C', 'F', 'G']
  },
  {
    id: 'heme_cd19',
    aliasPrefix: 'CD19-Fab',
    target: 'CD19',
    count: 10,
    format: 'Fab',
    template: '6AL5',
    sourceLabel: 'RCSB 6AL5 CD19 / B43 Fab complex',
    antigen: [{ from: 'A', to: 'A' }],
    antibody: [{ from: 'H', to: 'B' }, { from: 'L', to: 'C' }],
    preserveComplex: true,
    antigenChains: ['A'],
    antibodyChains: ['B', 'C']
  },
  {
    id: 'immune_cd3',
    aliasPrefix: 'CD3-Fab',
    target: 'CD3',
    count: 10,
    format: 'Fab',
    template: '1SY6',
    sourceLabel: 'RCSB 1SY6 CD3 gamma-epsilon / OKT3 Fab complex',
    antigen: [{ from: 'A', to: 'A' }],
    antibody: [{ from: 'H', to: 'B' }, { from: 'L', to: 'C' }],
    preserveComplex: true,
    antigenChains: ['A'],
    antibodyChains: ['B', 'C']
  },
  {
    id: 'complement_c5',
    aliasPrefix: 'C5-Fab',
    target: 'C5',
    count: 10,
    format: 'Fab',
    template: '5I5K',
    sourceLabel: 'RCSB 5I5K complement C5 / eculizumab variable-domain antibody complex',
    antigen: [{ from: 'B', to: 'A' }, { from: 'A', to: 'D' }],
    antibody: [{ from: 'H', to: 'B' }, { from: 'L', to: 'C' }, { from: 'X', to: 'F' }, { from: 'Y', to: 'G' }],
    preserveComplex: true,
    antigenChains: ['A', 'D'],
    antibodyChains: ['B', 'C', 'F', 'G']
  },
  {
    id: 'inflammation_il6r',
    aliasPrefix: 'IL6R-Fab',
    target: 'IL-6R',
    count: 10,
    format: 'Fab',
    template: '8J6F',
    sourceLabel: 'RCSB 8J6F IL-6R alpha / tocilizumab Fab complex',
    antigen: [{ from: 'I', to: 'A' }],
    antibody: [{ from: 'H', to: 'B' }, { from: 'L', to: 'C' }],
    preserveComplex: true,
    antigenChains: ['A'],
    antibodyChains: ['B', 'C']
  },
  {
    id: 'allergic_il4ra',
    aliasPrefix: 'IL4RA-Fab',
    target: 'IL-4Rα',
    count: 10,
    format: 'Fab',
    template: '6WGL',
    sourceLabel: 'RCSB 6WGL IL-4 receptor alpha / dupilumab Fab complex',
    antigen: [{ from: 'C', to: 'A' }],
    antibody: [{ from: 'A', to: 'B' }, { from: 'B', to: 'C' }],
    preserveComplex: true,
    antigenChains: ['A'],
    antibodyChains: ['B', 'C']
  },
  {
    id: 'immune_cd25',
    aliasPrefix: 'CD25-Fab',
    target: 'CD25',
    count: 10,
    format: 'Fab',
    template: '3NFP',
    sourceLabel: 'RCSB 3NFP IL-2RA(CD25) / daclizumab Fab complex',
    antigen: [{ from: 'I', to: 'A' }],
    antibody: [{ from: 'H', to: 'B' }, { from: 'L', to: 'C' }],
    preserveComplex: true,
    antigenChains: ['A'],
    antibodyChains: ['B', 'C']
  },
  {
    id: 'heme_cd38',
    aliasPrefix: 'CD38-Fab',
    target: 'CD38',
    count: 10,
    format: 'Fab',
    template: '7DUO',
    sourceLabel: 'RCSB 7DUO CD38 / daratumumab Fab complex',
    antigen: [{ from: 'B', to: 'A' }],
    antibody: [{ from: 'H', to: 'B' }, { from: 'L', to: 'C' }],
    preserveComplex: true,
    antigenChains: ['A'],
    antibodyChains: ['B', 'C']
  },
  {
    id: 'checkpoint_tigit',
    aliasPrefix: 'TIGIT-Fab',
    target: 'TIGIT',
    count: 10,
    format: 'Fab',
    template: '8VTD',
    sourceLabel: 'RCSB 8VTD TIGIT / vibostolimab Fab complex',
    antigen: [{ from: 'C', to: 'A' }],
    antibody: [{ from: 'B', to: 'B' }, { from: 'A', to: 'C' }],
    preserveComplex: true,
    antigenChains: ['A'],
    antibodyChains: ['B', 'C']
  },
  {
    id: 'checkpoint_cd47',
    aliasPrefix: 'CD47-Fab',
    target: 'CD47',
    count: 10,
    format: 'Fab',
    template: '8ZCA',
    sourceLabel: 'RCSB 8ZCA CD47 / hu1C8 Fab complex',
    antigen: [{ from: 'E', to: 'A' }],
    antibody: [{ from: 'B', to: 'B' }, { from: 'C', to: 'C' }],
    preserveComplex: true,
    antigenChains: ['A'],
    antibodyChains: ['B', 'C']
  },
  {
    id: 'checkpoint_lag3',
    aliasPrefix: 'LAG3-Fab',
    target: 'LAG-3',
    count: 10,
    format: 'Fab',
    template: '8SO3',
    sourceLabel: 'RCSB 8SO3 LAG-3 / favezelimab Fab complex',
    antigen: [{ from: 'D', to: 'A' }],
    antibody: [{ from: 'H', to: 'B' }, { from: 'L', to: 'C' }],
    preserveComplex: true,
    antigenChains: ['A'],
    antibodyChains: ['B', 'C']
  },
  {
    id: 'solid_tumor_trop2',
    aliasPrefix: 'TROP2-Fab',
    target: 'TROP-2',
    count: 10,
    format: 'Fab',
    template: '9PI9',
    sourceLabel: 'RCSB 9PI9 TROP-2 dimer / sacituzumab Fab complex',
    antigen: [{ from: 'E', to: 'A' }, { from: 'F', to: 'D' }],
    antibody: [{ from: 'A', to: 'B' }, { from: 'B', to: 'C' }, { from: 'C', to: 'F' }, { from: 'D', to: 'G' }],
    preserveComplex: true,
    antigenChains: ['A', 'D'],
    antibodyChains: ['B', 'C', 'F', 'G']
  },
  {
    id: 'heme_bcma',
    aliasPrefix: 'BCMA-Fab',
    target: 'BCMA',
    count: 10,
    format: 'Fab',
    template: '9MQO',
    sourceLabel: 'RCSB 9MQO BCMA / CA10V2 Fab complex',
    antigen: [{ from: 'A', to: 'A' }],
    antibody: [{ from: 'B', to: 'B' }, { from: 'C', to: 'C' }],
    preserveComplex: true,
    antigenChains: ['A'],
    antibodyChains: ['B', 'C']
  },
  {
    id: 'allergic_ige',
    aliasPrefix: 'IgE-Fab',
    target: 'IgE',
    count: 10,
    format: 'Fab',
    template: '5G64',
    sourceLabel: 'RCSB 5G64 IgE-Fc / anti-IgE Fab complex',
    antigen: [{ from: 'A', to: 'A' }, { from: 'B', to: 'D' }],
    antibody: [{ from: 'H', to: 'B' }, { from: 'L', to: 'C' }, { from: 'I', to: 'F' }, { from: 'M', to: 'G' }],
    preserveComplex: true,
    antigenChains: ['A', 'D'],
    antibodyChains: ['B', 'C', 'F', 'G']
  },
  {
    id: 'migraine_cgrpr',
    aliasPrefix: 'CGRPR-Fab',
    target: 'CGRP receptor',
    count: 10,
    format: 'Fab',
    template: '6UMG',
    sourceLabel: 'RCSB 6UMG CGRP receptor ECD / erenumab Fab complex',
    antigen: [{ from: 'C', to: 'A' }, { from: 'R', to: 'D' }],
    antibody: [{ from: 'H', to: 'B' }, { from: 'L', to: 'C' }],
    preserveComplex: true,
    antigenChains: ['A', 'D'],
    antibodyChains: ['B', 'C']
  },
  {
    id: 'breast_cancer',
    aliasPrefix: 'HER2-Fab',
    target: 'HER2',
    count: 10,
    format: 'Fab',
    template: '1N8Z',
    sourceLabel: 'RCSB 1N8Z HER2 extracellular domain / trastuzumab Fab complex',
    antigen: [{ from: 'C', to: 'A' }],
    antibody: [{ from: 'B', to: 'B' }, { from: 'A', to: 'C' }],
    jitter: 0.65,
    antigenChains: ['A'],
    antibodyChains: ['B', 'C']
  },
  {
    id: 'solid_tumor_egfr',
    aliasPrefix: 'EGFR-Fab',
    target: 'EGFR',
    count: 10,
    format: 'Fab',
    template: '1YY9',
    sourceLabel: 'RCSB 1YY9 EGFR extracellular domain / cetuximab Fab complex',
    antigen: [{ from: 'A', to: 'A' }],
    antibody: [{ from: 'D', to: 'B' }, { from: 'C', to: 'C' }],
    jitter: 0.7,
    antigenChains: ['A'],
    antibodyChains: ['B', 'C']
  },
  {
    id: 'angiogenesis_oncology',
    aliasPrefix: 'VEGFA-Fab',
    target: 'VEGF-A',
    count: 10,
    format: 'Fab',
    template: '1BJ1',
    sourceLabel: 'RCSB 1BJ1 VEGF-A / neutralizing Fab complex',
    antigen: [{ from: 'V', to: 'A' }, { from: 'W', to: 'D' }],
    antibody: [{ from: 'H', to: 'B' }, { from: 'L', to: 'C' }],
    jitter: 0.75,
    antigenChains: ['A', 'D'],
    antibodyChains: ['B', 'C']
  },
  {
    id: 'autoimmune_inflammation',
    aliasPrefix: 'TNF-Fab',
    target: 'TNF',
    count: 10,
    format: 'Fab',
    template: '5WUX',
    sourceLabel: 'RCSB 5WUX TNF alpha trimer / certolizumab Fab complex',
    antigen: [{ from: 'E', to: 'A' }, { from: 'F', to: 'D' }, { from: 'G', to: 'E' }],
    antibody: [{ from: 'H', to: 'B' }, { from: 'L', to: 'C' }],
    jitter: 0.55,
    antigenChains: ['A', 'D', 'E'],
    antibodyChains: ['B', 'C']
  },
  {
    id: 'autoimmune_il17',
    aliasPrefix: 'IL17A-Fab',
    target: 'IL-17A',
    count: 10,
    format: 'Fab',
    template: '2VXS',
    sourceLabel: 'RCSB 2VXS IL-17A dimer / neutralizing Fab complex',
    antigen: [{ from: 'C', to: 'A' }, { from: 'D', to: 'D' }],
    antibody: [{ from: 'J', to: 'B' }, { from: 'N', to: 'C' }, { from: 'K', to: 'F' }, { from: 'O', to: 'G' }],
    jitter: 0.5,
    antigenChains: ['A', 'D'],
    antibodyChains: ['B', 'C', 'F', 'G']
  },
  {
    id: 'autoimmune_il23',
    aliasPrefix: 'IL23-Fab',
    target: 'IL-23',
    count: 10,
    format: 'Fab',
    template: '3D85',
    sourceLabel: 'RCSB 3D85 IL-23 / neutralizing Fab complex',
    antigen: [{ from: 'C', to: 'A' }, { from: 'D', to: 'D' }],
    antibody: [{ from: 'B', to: 'B' }, { from: 'A', to: 'C' }],
    jitter: 0.75,
    antigenChains: ['A', 'D'],
    antibodyChains: ['B', 'C']
  },
  {
    id: 'infectious_rsv',
    aliasPrefix: 'RSVF-Fab',
    target: 'RSV F',
    count: 10,
    format: 'Fab',
    template: '5W23',
    sourceLabel: 'RCSB 5W23 RSV F prefusion trimer / 5C4 Fab complex',
    antigen: [{ from: 'A', to: 'A' }, { from: 'B', to: 'D' }, { from: 'C', to: 'E' }],
    antibody: [{ from: 'H', to: 'B' }, { from: 'L', to: 'C' }],
    jitter: 0.6,
    antigenChains: ['A', 'D', 'E'],
    antibodyChains: ['B', 'C']
  },
  {
    id: 'infectious_covid',
    aliasPrefix: 'SC2RBD-Fab',
    target: 'SARS-CoV-2 RBD',
    count: 10,
    format: 'Fab',
    template: '6XDG',
    sourceLabel: 'RCSB 6XDG SARS-CoV-2 RBD / REGN10933 Fab complex',
    antigen: [{ from: 'E', to: 'A' }],
    antibody: [{ from: 'B', to: 'B' }, { from: 'D', to: 'C' }],
    jitter: 0.8,
    antigenChains: ['A'],
    antibodyChains: ['B', 'C']
  },
  {
    id: 'infectious_flu',
    aliasPrefix: 'FluHA-Fab',
    target: 'Influenza HA',
    count: 10,
    format: 'Fab',
    template: '3GBM',
    sourceLabel: 'RCSB 3GBM influenza HA trimer biological assembly / CR6261 Fab complex',
    antigen: [
      { from: 'A', to: 'A', biomt: 0 }, { from: 'B', to: 'D', biomt: 0 },
      { from: 'A', to: 'E', biomt: 1 }, { from: 'B', to: 'F', biomt: 1 },
      { from: 'A', to: 'G', biomt: 2 }, { from: 'B', to: 'H', biomt: 2 }
    ],
    antibody: [{ from: 'H', to: 'B' }, { from: 'L', to: 'C' }],
    jitter: 0.65,
    antigenChains: ['A', 'D', 'E', 'F', 'G', 'H'],
    antibodyChains: ['B', 'C']
  },
  {
    id: 'infectious_flu_na',
    aliasPrefix: 'FluNA-Fab',
    target: 'Influenza NA',
    count: 10,
    format: 'Fab',
    template: '1NCD',
    sourceLabel: 'RCSB 1NCD influenza N9 neuraminidase / NC41 Fab complex',
    antigen: [{ from: 'N', to: 'A' }],
    antibody: [{ from: 'H', to: 'B' }, { from: 'L', to: 'C' }],
    preserveComplex: true,
    antigenChains: ['A'],
    antibodyChains: ['B', 'C']
  },
  {
    id: 'cardio_pcsk9',
    aliasPrefix: 'PCSK9-Fab',
    target: 'PCSK9',
    count: 10,
    format: 'Fab',
    template: '3SQO',
    sourceLabel: 'RCSB 3SQO PCSK9 / J16 Fab complex',
    antigen: [{ from: 'A', to: 'A' }, { from: 'P', to: 'D' }],
    antibody: [{ from: 'H', to: 'B' }, { from: 'L', to: 'C' }],
    jitter: 0.7,
    antigenChains: ['A', 'D'],
    antibodyChains: ['B', 'C']
  },
  {
    id: 'cardio_angptl3',
    aliasPrefix: 'ANGPTL3-CV-Fab',
    target: 'ANGPTL3',
    count: 10,
    format: 'Fab',
    template: '6EUA',
    sourceLabel: 'RCSB 6EUA ANGPTL3 fibrinogen-like domain with representative Fab reference pose',
    antigen: [{ from: 'A', to: 'A' }, { from: 'B', to: 'D' }, { from: 'C', to: 'E' }],
    scaffoldTemplate: '3SQO',
    scaffold: [{ from: 'H', to: 'B' }, { from: 'L', to: 'C' }],
    attach: [1, 0, 0],
    distance: 70,
    rotate: [-18, 36, -24],
    jitter: 0.45,
    antigenChains: ['A', 'D', 'E'],
    antibodyChains: ['B', 'C']
  },
  {
    id: 'cardio_il1b',
    aliasPrefix: 'IL1B-Fab',
    target: 'IL-1B',
    count: 10,
    format: 'Fab',
    template: '5BVP',
    sourceLabel: 'RCSB 5BVP IL-1 beta / canakinumab Fab complex',
    antigen: [{ from: 'I', to: 'A' }],
    antibody: [{ from: 'H', to: 'B' }, { from: 'L', to: 'C' }],
    jitter: 0.8,
    antigenChains: ['A'],
    antibodyChains: ['B', 'C']
  },
  {
    id: 'metabolic_angptl3',
    aliasPrefix: 'ANGPTL3-Met-Fab',
    target: 'ANGPTL3',
    count: 10,
    format: 'Fab',
    template: '6EUA',
    sourceLabel: 'RCSB 6EUA ANGPTL3 fibrinogen-like domain with representative Fab reference pose',
    antigen: [{ from: 'A', to: 'A' }, { from: 'B', to: 'D' }, { from: 'C', to: 'E' }],
    scaffoldTemplate: '3SQO',
    scaffold: [{ from: 'H', to: 'B' }, { from: 'L', to: 'C' }],
    attach: [0, -1, 0],
    distance: 70,
    rotate: [24, -18, 42],
    jitter: 0.45,
    antigenChains: ['A', 'D', 'E'],
    antibodyChains: ['B', 'C']
  },
  {
    id: 'metabolic_gipr',
    aliasPrefix: 'GIPR-Fab',
    target: 'GIPR',
    count: 10,
    format: 'Fab',
    template: '4HJ0',
    sourceLabel: 'RCSB 4HJ0 human GIPR ECD / GIPG013 Fab complex',
    antigen: [{ from: 'A', to: 'A' }],
    antibody: [{ from: 'P', to: 'B' }, { from: 'Q', to: 'C' }],
    jitter: 0.55,
    antigenChains: ['A'],
    antibodyChains: ['B', 'C']
  },
  {
    id: 'inflammation_pf4',
    aliasPrefix: 'PF4-Fab',
    target: 'PF4',
    count: 10,
    format: 'Fab',
    template: '1F9Q',
    sourceLabel: 'RCSB 1F9Q platelet factor 4 reference structure + local Fab display scaffold',
    antigen: [{ from: 'A', to: 'A' }, { from: 'B', to: 'D' }, { from: 'C', to: 'E' }, { from: 'D', to: 'F' }],
    scaffoldTemplate: '3SQO',
    scaffold: [{ from: 'H', to: 'B' }, { from: 'L', to: 'C' }],
    attach: [0, 1, 0],
    distance: 58,
    rotate: [16, -24, 12],
    jitter: 0.45,
    antigenChains: ['A', 'D', 'E', 'F'],
    antibodyChains: ['B', 'C']
  },
  {
    id: 'infectious_adenovirus_hexon',
    aliasPrefix: 'ADENO-HEXON-Fab',
    target: 'Adenovirus hexon',
    count: 10,
    format: 'Fab',
    template: '10DP',
    sourceLabel: 'RCSB 10DP human adenovirus hexon reference structure + local Fab display scaffold',
    antigen: [{ from: 'A', to: 'A' }, { from: 'B', to: 'D' }, { from: 'C', to: 'E' }],
    scaffoldTemplate: '3SQO',
    scaffold: [{ from: 'H', to: 'B' }, { from: 'L', to: 'C' }],
    attach: [1, 0, 0],
    distance: 62,
    rotate: [-14, 28, -12],
    jitter: 0.5,
    antigenChains: ['A', 'D', 'E'],
    antibodyChains: ['B', 'C']
  },
  {
    id: 'infectious_flu_m2',
    aliasPrefix: 'M2e-Fab',
    target: 'Influenza M2',
    count: 10,
    format: 'Fab',
    template: '4N8C',
    sourceLabel: 'RCSB 4N8C influenza A M2 ectodomain / antibody complex',
    antigen: [{ from: 'X', to: 'A' }, { from: 'Y', to: 'D' }],
    antibody: [{ from: 'H', to: 'B' }, { from: 'L', to: 'C' }],
    preserveComplex: true,
    antigenChains: ['A', 'D'],
    antibodyChains: ['B', 'C']
  },
  {
    id: 'infectious_prrsv_gp4',
    aliasPrefix: 'PRRSV-GP4-Fab',
    target: 'PRRSV GP4',
    count: 10,
    format: 'Fab',
    template: '29TJ',
    sourceLabel: 'RCSB 29TJ PRRSV-2 GP4 antigenic region / neutralizing scFv#18 complex',
    antigen: [{ from: 'P', to: 'A' }],
    antibody: [{ from: 'B', to: 'B' }],
    preserveComplex: true,
    antigenChains: ['A'],
    antibodyChains: ['B']
  },
  {
    id: 'infectious_prrsv_nsp10',
    aliasPrefix: 'PRRSV-NSP10-Fab',
    target: 'PRRSV NSP10',
    count: 10,
    format: 'Fab',
    template: '6JDS',
    sourceLabel: 'RCSB 6JDS PRRSV NSP10 helicase reference structure + local Fab display scaffold',
    antigen: [{ from: 'A', to: 'A' }],
    scaffoldTemplate: '3SQO',
    scaffold: [{ from: 'H', to: 'B' }, { from: 'L', to: 'C' }],
    attach: [0, -1, 0],
    distance: 60,
    rotate: [20, -18, 14],
    jitter: 0.45,
    antigenChains: ['A'],
    antibodyChains: ['B', 'C']
  },
  {
    id: 'infectious_hsv_gd',
    aliasPrefix: 'HSV-GD-Fab',
    target: 'HSV gD',
    count: 10,
    format: 'Fab',
    template: '2C36',
    sourceLabel: 'RCSB 2C36 HSV-1 glycoprotein D reference structure + local Fab display scaffold',
    antigen: [{ from: 'A', to: 'A' }, { from: 'B', to: 'D' }],
    scaffoldTemplate: '3SQO',
    scaffold: [{ from: 'H', to: 'B' }, { from: 'L', to: 'C' }],
    attach: [0, 0, 1],
    distance: 60,
    rotate: [-18, 30, 8],
    jitter: 0.45,
    antigenChains: ['A', 'D'],
    antibodyChains: ['B', 'C']
  },
  {
    id: 'infectious_pcv2_capsid',
    aliasPrefix: 'PCV2-Cap-Fab',
    target: 'PCV2 capsid',
    count: 10,
    format: 'Fab',
    template: '3R0R',
    sourceLabel: 'RCSB 3R0R PCV2 capsid protein reference structure + local Fab display scaffold',
    antigen: [{ from: 'A', to: 'A' }],
    scaffoldTemplate: '3SQO',
    scaffold: [{ from: 'H', to: 'B' }, { from: 'L', to: 'C' }],
    attach: [1, 0, 0],
    distance: 58,
    rotate: [14, -16, 10],
    jitter: 0.45,
    antigenChains: ['A'],
    antibodyChains: ['B', 'C']
  },
  {
    id: 'infectious_pedv_spike',
    aliasPrefix: 'PEDV-Spike-Fab',
    target: 'PEDV spike',
    count: 10,
    format: 'Fab',
    template: '6VV5',
    sourceLabel: 'RCSB 6VV5 PEDV spike glycoprotein reference structure + local Fab display scaffold',
    antigen: [{ from: 'A', to: 'A' }, { from: 'B', to: 'D' }, { from: 'C', to: 'E' }],
    scaffoldTemplate: '3SQO',
    scaffold: [{ from: 'H', to: 'B' }, { from: 'L', to: 'C' }],
    attach: [0, 1, 0],
    distance: 72,
    rotate: [-16, 22, -20],
    jitter: 0.48,
    antigenChains: ['A', 'D', 'E'],
    antibodyChains: ['B', 'C']
  },
  {
    id: 'infectious_csfv_ns5b',
    aliasPrefix: 'CSFV-NS5B-Fab',
    target: 'CSFV NS5B',
    count: 10,
    format: 'Fab',
    template: '7EKJ',
    sourceLabel: 'RCSB 7EKJ classical swine fever virus NS5B reference structure + local Fab display scaffold',
    antigen: [{ from: 'A', to: 'A' }],
    scaffoldTemplate: '3SQO',
    scaffold: [{ from: 'H', to: 'B' }, { from: 'L', to: 'C' }],
    attach: [0, -1, 0],
    distance: 58,
    rotate: [18, -12, 18],
    jitter: 0.45,
    antigenChains: ['A'],
    antibodyChains: ['B', 'C']
  },
  {
    id: 'infectious_fpv_vp2',
    aliasPrefix: 'FPV-VP2-Fab',
    target: 'Feline panleukopenia VP2',
    count: 10,
    format: 'Fab',
    template: '1FPV',
    sourceLabel: 'RCSB 1FPV feline panleukopenia virus VP2 reference structure + local Fab display scaffold',
    antigen: [{ from: 'A', to: 'A' }],
    scaffoldTemplate: '3SQO',
    scaffold: [{ from: 'H', to: 'B' }, { from: 'L', to: 'C' }],
    attach: [1, 0, 0],
    distance: 56,
    rotate: [12, -18, 6],
    jitter: 0.45,
    antigenChains: ['A'],
    antibodyChains: ['B', 'C']
  },
  {
    id: 'neuro_deafness_gjb2',
    aliasPrefix: 'GJB2-Fab',
    target: 'Connexin-26',
    count: 10,
    format: 'Fab',
    template: '2ZW3',
    sourceLabel: 'RCSB 2ZW3 connexin-26 reference structure + local Fab display scaffold',
    antigen: [{ from: 'A', to: 'A' }, { from: 'B', to: 'D' }, { from: 'C', to: 'E' }, { from: 'D', to: 'F' }, { from: 'E', to: 'G' }, { from: 'F', to: 'H' }],
    scaffoldTemplate: '3SQO',
    scaffold: [{ from: 'H', to: 'B' }, { from: 'L', to: 'C' }],
    attach: [0, 1, 0],
    distance: 72,
    rotate: [-8, 28, -14],
    jitter: 0.4,
    antigenChains: ['A', 'D', 'E', 'F', 'G', 'H'],
    antibodyChains: ['B', 'C']
  }
];

function deg(value) {
  return value * Math.PI / 180;
}

function add(a, b) {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

function sub(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function mul(a, scalar) {
  return [a[0] * scalar, a[1] * scalar, a[2] * scalar];
}

function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function cross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]
  ];
}

function norm(a) {
  return Math.sqrt(dot(a, a)) || 1;
}

function unit(a) {
  return mul(a, 1 / norm(a));
}

function rotateAxis(v, axis, angleRad) {
  const u = unit(axis);
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);
  return add(add(mul(v, cos), mul(cross(u, v), sin)), mul(u, dot(u, v) * (1 - cos)));
}

function rotateEuler(v, ax, ay, az) {
  let out = v;
  out = rotateAxis(out, [1, 0, 0], deg(ax));
  out = rotateAxis(out, [0, 1, 0], deg(ay));
  out = rotateAxis(out, [0, 0, 1], deg(az));
  return out;
}

function applyMatrixTransform(xyz, matrix) {
  if (!Array.isArray(matrix) || matrix.length !== 3) return xyz;
  return [
    (Number(matrix[0][0]) || 0) * xyz[0] + (Number(matrix[0][1]) || 0) * xyz[1] + (Number(matrix[0][2]) || 0) * xyz[2] + (Number(matrix[0][3]) || 0),
    (Number(matrix[1][0]) || 0) * xyz[0] + (Number(matrix[1][1]) || 0) * xyz[1] + (Number(matrix[1][2]) || 0) * xyz[2] + (Number(matrix[1][3]) || 0),
    (Number(matrix[2][0]) || 0) * xyz[0] + (Number(matrix[2][1]) || 0) * xyz[1] + (Number(matrix[2][2]) || 0) * xyz[2] + (Number(matrix[2][3]) || 0)
  ];
}

function centerOf(atoms) {
  if (!atoms.length) return [0, 0, 0];
  const sum = atoms.reduce((acc, atom) => add(acc, atom.xyz), [0, 0, 0]);
  return mul(sum, 1 / atoms.length);
}

function templatePath(templateId) {
  const name = String(templateId || '').replace(/\.pdb$/i, '') + '.pdb';
  const inTemplateDir = path.join(TEMPLATE_DIR, name);
  if (fs.existsSync(inTemplateDir)) return inTemplateDir;
  const inRoot = path.join(ROOT, name);
  if (fs.existsSync(inRoot)) return inRoot;
  throw new Error('Missing PDB template ' + name);
}

const atomCache = new Map();
const biomtCache = new Map();
function parseAtoms(templateId) {
  const file = templatePath(templateId);
  if (atomCache.has(file)) return atomCache.get(file);
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  const atoms = lines
    .filter(line => line.startsWith('ATOM'))
    .map(line => ({
      line,
      chain: line[21] || ' ',
      xyz: [
        parseFloat(line.slice(30, 38)),
        parseFloat(line.slice(38, 46)),
        parseFloat(line.slice(46, 54))
      ]
    }))
    .filter(atom => atom.xyz.every(Number.isFinite));
  atomCache.set(file, atoms);
  return atoms;
}

function parseBiomtTransforms(templateId) {
  const file = templatePath(templateId);
  if (biomtCache.has(file)) return biomtCache.get(file);
  const transforms = [];
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const match = line.match(/^REMARK 350\s+BIOMT([123])\s+(\d+)\s+(-?\d+\.\d+)\s+(-?\d+\.\d+)\s+(-?\d+\.\d+)\s+(-?\d+\.\d+)/);
    if (!match) continue;
    const row = Number(match[1]) - 1;
    const idx = Number(match[2]) - 1;
    if (!transforms[idx]) transforms[idx] = [];
    transforms[idx][row] = [
      Number(match[3]),
      Number(match[4]),
      Number(match[5]),
      Number(match[6])
    ];
  }
  const complete = transforms.filter(matrix => matrix && matrix.length === 3);
  biomtCache.set(file, complete);
  return complete;
}

function mappedAtomXyz(item, templateId) {
  const transform = item.transform || (Number.isInteger(item.biomt) ? parseBiomtTransforms(templateId)[item.biomt] : null);
  return applyMatrixTransform(item.atom.xyz, transform);
}

function formatCoord(value) {
  return value.toFixed(3).padStart(8, ' ');
}

function setAtomLine(atom, serial, chain, xyz) {
  const line = atom.line.padEnd(80, ' ');
  const serialText = String(serial).padStart(5, ' ');
  return (line.slice(0, 6) +
    serialText +
    line.slice(11, 21) +
    chain +
    line.slice(22, 30) +
    formatCoord(xyz[0]) +
    formatCoord(xyz[1]) +
    formatCoord(xyz[2]) +
    line.slice(54)).trimEnd();
}

function atomLineRecord(line, index) {
  if (!line.startsWith('ATOM')) return null;
  const xyz = [
    parseFloat(line.slice(30, 38)),
    parseFloat(line.slice(38, 46)),
    parseFloat(line.slice(46, 54))
  ];
  if (!xyz.every(Number.isFinite)) return null;
  return {
    index,
    chain: line[21] || ' ',
    xyz
  };
}

function setAtomLineXyz(line, xyz) {
  const padded = line.padEnd(80, ' ');
  return (padded.slice(0, 30) +
    formatCoord(xyz[0]) +
    formatCoord(xyz[1]) +
    formatCoord(xyz[2]) +
    padded.slice(54)).trimEnd();
}

function roleGeometryForLines(atomLines, antigenChains, antibodyChains) {
  const records = atomLines
    .map((line, index) => atomLineRecord(line, index))
    .filter(Boolean);
  const antigen = records.filter(atom => antigenChains.includes(atom.chain));
  const antibody = records.filter(atom => antibodyChains.includes(atom.chain));
  const contactSq = 4.5 * 4.5;
  const nearSq = 6 * 6;
  const clashSq = 2 * 2;
  let minDistanceSq = Infinity;
  let closestPair = null;
  let contactPairs = 0;
  let nearPairs = 0;
  let closeClashes = 0;

  for (const a of antigen) {
    for (const b of antibody) {
      const dx = a.xyz[0] - b.xyz[0];
      const dy = a.xyz[1] - b.xyz[1];
      const dz = a.xyz[2] - b.xyz[2];
      const distSq = dx * dx + dy * dy + dz * dz;
      if (distSq < minDistanceSq) {
        minDistanceSq = distSq;
        closestPair = { antigen: a, antibody: b };
      }
      if (distSq < clashSq) closeClashes += 1;
      if (distSq <= contactSq) contactPairs += 1;
      if (distSq <= nearSq) nearPairs += 1;
    }
  }

  return {
    minDistance: Number.isFinite(minDistanceSq) ? Math.sqrt(minDistanceSq) : Infinity,
    closestPair,
    contactPairs,
    nearPairs,
    closeClashes
  };
}

function translateChains(atomLines, chains, vector) {
  return atomLines.map(line => {
    const record = atomLineRecord(line, -1);
    if (!record || !chains.includes(record.chain)) return line;
    return setAtomLineXyz(line, add(record.xyz, vector));
  });
}

function routeRoleSpacingThresholds(route) {
  if (/^ANGPTL3-(?:CV|Met)-Fab$/.test(route.aliasPrefix || '')) {
    return { minContacts: 4, minNearPairs: 20 };
  }
  if (/^IL33-VHH$/.test(route.aliasPrefix || '')) {
    return { minContacts: 8, minNearPairs: 45 };
  }
  return { minContacts: 8, minNearPairs: 40 };
}

function roleSpacingLooksPlausible(geometry, thresholds) {
  return geometry.closeClashes === 0 &&
    geometry.minDistance >= 2 &&
    geometry.minDistance <= 4.5 &&
    geometry.contactPairs >= thresholds.minContacts &&
    geometry.nearPairs >= thresholds.minNearPairs;
}

function pairDirection(pair, fallback, awayFromAntigen) {
  if (!pair) return unit(fallback || [1, 0, 0]);
  const from = awayFromAntigen ? pair.antigen.xyz : pair.antibody.xyz;
  const to = awayFromAntigen ? pair.antibody.xyz : pair.antigen.xyz;
  const vector = sub(to, from);
  if (norm(vector) < 0.001) return unit(fallback || [1, 0, 0]);
  return unit(vector);
}

function normalizeRoleSpacing(route, atomLines) {
  if (!route.antigenChains || !route.antibodyChains || !route.antigenChains.length || !route.antibodyChains.length) {
    return atomLines;
  }
  let lines = atomLines.slice();
  const thresholds = routeRoleSpacingThresholds(route);
  const fallbackDirection = route.attach || [1, 0, 0];
  let geometry = roleGeometryForLines(lines, route.antigenChains, route.antibodyChains);

  for (let i = 0; i < 40 && geometry.closeClashes > 0; i++) {
    const direction = pairDirection(geometry.closestPair, fallbackDirection, true);
    const amount = Math.max(0.05, 2.2 - geometry.minDistance + 0.02);
    lines = translateChains(lines, route.antibodyChains, mul(direction, amount));
    geometry = roleGeometryForLines(lines, route.antigenChains, route.antibodyChains);
  }

  if (!roleSpacingLooksPlausible(geometry, thresholds) &&
      (geometry.minDistance > 4.5 || geometry.contactPairs < thresholds.minContacts || geometry.nearPairs < thresholds.minNearPairs)) {
    const direction = pairDirection(geometry.closestPair, fallbackDirection, false);
    const amount = Math.max(0, geometry.minDistance - 2.25);
    if (amount > 0) {
      lines = translateChains(lines, route.antibodyChains, mul(direction, amount));
      geometry = roleGeometryForLines(lines, route.antigenChains, route.antibodyChains);
    }
  }

  for (let i = 0; i < 40 && geometry.closeClashes > 0; i++) {
    const direction = pairDirection(geometry.closestPair, fallbackDirection, true);
    const amount = Math.max(0.05, 2.2 - geometry.minDistance + 0.02);
    lines = translateChains(lines, route.antibodyChains, mul(direction, amount));
    geometry = roleGeometryForLines(lines, route.antigenChains, route.antibodyChains);
  }

  return lines;
}

function mappedAtoms(templateId, mappings) {
  const atoms = parseAtoms(templateId);
  const out = [];
  for (const map of mappings || []) {
    const chainAtoms = atoms.filter(atom => atom.chain === map.from);
    if (!chainAtoms.length) {
      throw new Error('Template ' + templateId + ' missing chain ' + map.from);
    }
    chainAtoms.forEach(atom => out.push({ atom, to: map.to, transform: map.transform, biomt: map.biomt }));
  }
  return out;
}

function routeJitter(route, idx) {
  const mag = Number(route.jitter) || 0.7;
  const t = idx + 1;
  return {
    angle: deg(Math.sin(t * 1.7) * mag),
    axis: unit([0.35 + (idx % 3) * 0.17, 0.62 - (idx % 4) * 0.11, 0.48 + (idx % 5) * 0.07]),
    shift: [
      Math.sin(t * 0.91) * mag * 0.36,
      Math.cos(t * 0.73) * mag * 0.32,
      Math.sin(t * 1.13) * mag * 0.24
    ]
  };
}

function transformMappedAtoms(mapped, sceneCenter, serialState, options) {
  const lines = [];
  for (const item of mapped) {
    const sourceXyz = options && options.templateId ? mappedAtomXyz(item, options.templateId) : item.atom.xyz;
    let xyz = sub(sourceXyz, sceneCenter);
    if (options && options.center) xyz = sub(sourceXyz, options.center);
    if (options && options.rotate) xyz = rotateEuler(xyz, options.rotate[0], options.rotate[1], options.rotate[2]);
    if (options && options.axis) xyz = rotateAxis(xyz, options.axis, options.angle || 0);
    if (options && options.shift) xyz = add(xyz, options.shift);
    if (options && options.attach) xyz = add(xyz, options.attach);
    lines.push(setAtomLine(item.atom, serialState.value++, item.to, xyz));
  }
  return lines;
}

function buildStaticComplex(route, idx) {
  const antigenMapped = mappedAtoms(route.template, route.antigen);
  const antigenAtoms = antigenMapped.map(item => ({ xyz: mappedAtomXyz(item, route.template) }));
  const sceneCenter = centerOf(antigenAtoms);
  const serialState = { value: 1 };
  const out = [];

  out.push(...transformMappedAtoms(antigenMapped, sceneCenter, serialState, { templateId: route.template }));

  if (route.preserveComplex) {
    const antibodyMapped = route.antibody && route.antibody.length ? mappedAtoms(route.template, route.antibody) : [];
    const scaffoldMapped = route.scaffoldTemplate && route.scaffold && route.scaffold.length
      ? mappedAtoms(route.scaffoldTemplate, route.scaffold)
      : [];
    out.push(...transformMappedAtoms(antibodyMapped, sceneCenter, serialState));
    out.push(...transformMappedAtoms(scaffoldMapped, sceneCenter, serialState));
    return buildPdbText(route, idx, normalizeRoleSpacing(route, out));
  }

  const jitter = routeJitter(route, idx);
  if (route.antibody && route.antibody.length) {
    const antibodyMapped = mappedAtoms(route.template, route.antibody);
    out.push(...transformMappedAtoms(antibodyMapped, sceneCenter, serialState, {
      axis: jitter.axis,
      angle: jitter.angle,
      shift: jitter.shift
    }));
  }

  if (route.scaffoldTemplate && route.scaffold && route.scaffold.length) {
    const scaffoldMapped = mappedAtoms(route.scaffoldTemplate, route.scaffold);
    const scaffoldCenter = centerOf(scaffoldMapped.map(item => item.atom));
    const attach = mul(unit(route.attach || [1, 0, 0]), (Number(route.distance) || 32) + (idx % 4) * 0.45);
    const rotate = route.rotate || [0, 0, 0];
    out.push(...transformMappedAtoms(scaffoldMapped, sceneCenter, serialState, {
      center: scaffoldCenter,
      rotate: [
        rotate[0] + Math.sin((idx + 1) * 0.9) * 2.2,
        rotate[1] + Math.cos((idx + 1) * 0.8) * 2.0,
        rotate[2] + idx * 1.4
      ],
      axis: jitter.axis,
      angle: jitter.angle * 0.75,
      shift: jitter.shift,
      attach
    }));
  }

  return buildPdbText(route, idx, normalizeRoleSpacing(route, out));
}

function buildPdbText(route, idx, atomLines) {
  return [
    'HEADER    ZOONOAB ROUTE PRESET ' + route.aliasPrefix,
    'REMARK 900 STATIC ROUTE PRESET: ' + route.id,
    'REMARK 900 CANDIDATE INDEX: ' + String(idx + 1).padStart(2, '0'),
    'REMARK 901 TARGET: ' + route.target,
    'REMARK 902 FORMAT: ' + route.format,
    'REMARK 903 STRUCTURAL BASIS: ' + route.sourceLabel,
    'REMARK 904 ANTIGEN CHAINS: ' + route.antigenChains.join(','),
    'REMARK 905 ANTIBODY CHAINS: ' + route.antibodyChains.join(','),
    'REMARK 906 STATIC DISPLAY ONLY; NOT A CLAIM OF CLINICAL ACTIVITY',
    'MODEL        1',
    ...atomLines,
    'ENDMDL',
    'END',
    ''
  ].join('\n');
}

fs.mkdirSync(OUT_DIR, { recursive: true });

let written = 0;
const routeFilter = String(process.env.ROUTE_FILTER || process.env.ROUTE_ID || process.argv[2] || '').trim();
const selectedRoutes = routeFilter
  ? ROUTES.filter(route => route.id === routeFilter || route.aliasPrefix === routeFilter)
  : ROUTES;
if (routeFilter && !selectedRoutes.length) {
  throw new Error('No route matched filter ' + routeFilter);
}

for (const route of selectedRoutes) {
  for (let idx = 0; idx < route.count; idx++) {
    const filename = route.aliasPrefix + '-' + String(idx + 1).padStart(2, '0') + '.pdb';
    const out = buildStaticComplex(route, idx);
    fs.writeFileSync(path.join(OUT_DIR, filename), out);
    written += 1;
  }
}

console.log('Generated ' + written + ' disease-aligned route preset PDB files in ' + OUT_DIR);
