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
    template: '9WWH',
    sourceLabel: 'RCSB 9WWH IL-33 / Tozorakimab Fab binary complex',
    antigen: [{ from: 'C', to: 'A' }],
    antibody: [{ from: 'H', to: 'B' }, { from: 'L', to: 'C' }],
    preserveComplex: true,
    jitter: 0,
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
    template: '3WD5',
    sourceLabel: 'RCSB 3WD5 TNF alpha / adalimumab Fab complex',
    antigen: [{ from: 'A', to: 'A' }],
    antibody: [{ from: 'H', to: 'B' }, { from: 'L', to: 'C' }],
    jitter: 0.85,
    antigenChains: ['A'],
    antibodyChains: ['B', 'C']
  },
  {
    id: 'autoimmune_il17',
    aliasPrefix: 'IL17A-Fab',
    target: 'IL-17A',
    count: 10,
    format: 'Fab',
    template: '9SG2',
    sourceLabel: 'RCSB 9SG2 IL-17A / ixekizumab Fab complex',
    antigen: [{ from: 'A', to: 'A' }],
    antibody: [{ from: 'H', to: 'B' }, { from: 'L', to: 'C' }],
    jitter: 0.8,
    antigenChains: ['A'],
    antibodyChains: ['B', 'C']
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
    sourceLabel: 'RCSB 3GBM influenza HA / broadly neutralizing Fab CR6261 complex',
    antigen: [{ from: 'A', to: 'A' }, { from: 'B', to: 'D' }],
    antibody: [{ from: 'H', to: 'B' }, { from: 'L', to: 'C' }],
    jitter: 0.65,
    antigenChains: ['A', 'D'],
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
    sourceLabel: 'RCSB 6EUA ANGPTL3 fibrinogen-like domain with representative Fab display scaffold',
    antigen: [{ from: 'A', to: 'A' }, { from: 'B', to: 'D' }, { from: 'C', to: 'E' }],
    scaffoldTemplate: '3SQO',
    scaffold: [{ from: 'H', to: 'B' }, { from: 'L', to: 'C' }],
    attach: [0.74, -0.34, 0.58],
    distance: 38,
    rotate: [-18, 36, -24],
    jitter: 0.9,
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
    sourceLabel: 'RCSB 6EUA ANGPTL3 fibrinogen-like domain with representative Fab display scaffold',
    antigen: [{ from: 'A', to: 'A' }, { from: 'B', to: 'D' }, { from: 'C', to: 'E' }],
    scaffoldTemplate: '3SQO',
    scaffold: [{ from: 'H', to: 'B' }, { from: 'L', to: 'C' }],
    attach: [-0.42, 0.82, 0.38],
    distance: 37,
    rotate: [24, -18, 42],
    jitter: 0.9,
    antigenChains: ['A', 'D', 'E'],
    antibodyChains: ['B', 'C']
  },
  {
    id: 'metabolic_gipr',
    aliasPrefix: 'GIPR-Fab',
    target: 'GIPR',
    count: 10,
    format: 'Fab',
    template: '7DTY',
    sourceLabel: 'RCSB 7DTY GIPR/GIP receptor complex with representative Fab display scaffold',
    antigen: [{ from: 'R', to: 'A' }, { from: 'P', to: 'D' }],
    scaffoldTemplate: '3SQO',
    scaffold: [{ from: 'H', to: 'B' }, { from: 'L', to: 'C' }],
    attach: [0.36, 0.62, 0.70],
    distance: 43,
    rotate: [-35, 18, 58],
    jitter: 0.75,
    antigenChains: ['A', 'D'],
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

function mappedAtoms(templateId, mappings) {
  const atoms = parseAtoms(templateId);
  const out = [];
  for (const map of mappings || []) {
    const chainAtoms = atoms.filter(atom => atom.chain === map.from);
    if (!chainAtoms.length) {
      throw new Error('Template ' + templateId + ' missing chain ' + map.from);
    }
    chainAtoms.forEach(atom => out.push({ atom, to: map.to }));
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
    let xyz = sub(item.atom.xyz, sceneCenter);
    if (options && options.center) xyz = sub(item.atom.xyz, options.center);
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
  const antigenAtoms = antigenMapped.map(item => item.atom);
  const sceneCenter = centerOf(antigenAtoms);
  const serialState = { value: 1 };
  const out = [];

  out.push(...transformMappedAtoms(antigenMapped, sceneCenter, serialState));

  if (route.preserveComplex) {
    const antibodyMapped = route.antibody && route.antibody.length ? mappedAtoms(route.template, route.antibody) : [];
    const scaffoldMapped = route.scaffoldTemplate && route.scaffold && route.scaffold.length
      ? mappedAtoms(route.scaffoldTemplate, route.scaffold)
      : [];
    out.push(...transformMappedAtoms(antibodyMapped, sceneCenter, serialState));
    out.push(...transformMappedAtoms(scaffoldMapped, sceneCenter, serialState));
    return buildPdbText(route, idx, out);
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

  return buildPdbText(route, idx, out);
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
