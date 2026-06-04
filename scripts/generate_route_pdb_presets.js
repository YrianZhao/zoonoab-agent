'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'pdb');

const TEMPLATE_FILES = [
  '4KC3_site1_1655576_binder-0_iptm-0.7953_complex.pdb',
  '4KC3_site1_1655576_binder-1_iptm-0.7825_complex.pdb',
  '4KC3_site1_1665463_binder-2_iptm-0.7847_complex.pdb',
  '4KC3_site1_1665463_binder-3_iptm-0.7770_complex.pdb',
  '4KC3_site1_1665463_binder-4_iptm-0.7834_complex.pdb',
  '4KC3_site1_1665463_binder-5_iptm-0.7835_complex.pdb',
  '4KC3_site1_1665463_binder-7_iptm-0.7780_complex.pdb',
  '4KC3_site1_1665463_binder-8_iptm-0.7761_complex.pdb',
  '4KC3_site1_1037374_binder-2_iptm-0.7727_complex.pdb',
  '4KC3_site1_1037374_binder-3_iptm-0.7503_complex.pdb',
  '4KC3_site1_1037374_binder-8_iptm-0.7685_complex.pdb',
  'IL33_VHH_complex.pdb'
];

const ROUTES = [
  { id: 'allergic_asthma', aliasPrefix: 'IL33-VHH', target: 'IL-33', count: 15, format: 'VHH', template: 11, theta: 20, phi: -16, distance: 25, tilt: 8, spin: 18, spread: 0 },
  { id: 'allergic_tslp', aliasPrefix: 'TSLP-Fab', target: 'TSLP', count: 10, format: 'Fab', template: 1, theta: 63, phi: -8, distance: 27, tilt: 18, spin: -22, spread: 7 },
  { id: 'tumor_immunotherapy', aliasPrefix: 'PDL1-Fab', target: 'PD-L1', count: 10, format: 'Fab', template: 0, theta: 110, phi: 10, distance: 28, tilt: -12, spin: 31, spread: 8 },
  { id: 'breast_cancer', aliasPrefix: 'HER2-Fab', target: 'HER2', count: 10, format: 'Fab', template: 2, theta: 155, phi: 20, distance: 30, tilt: 22, spin: -35, spread: 9 },
  { id: 'solid_tumor_egfr', aliasPrefix: 'EGFR-Fab', target: 'EGFR', count: 10, format: 'Fab', template: 3, theta: 205, phi: -12, distance: 29, tilt: -26, spin: 42, spread: 10 },
  { id: 'angiogenesis_oncology', aliasPrefix: 'VEGFA-Fab', target: 'VEGF-A', count: 10, format: 'Fab', template: 4, theta: 252, phi: 4, distance: 26, tilt: 14, spin: -47, spread: 8 },
  { id: 'autoimmune_inflammation', aliasPrefix: 'TNF-Fab', target: 'TNF', count: 10, format: 'Fab', template: 5, theta: 300, phi: 18, distance: 31, tilt: 30, spin: 11, spread: 11 },
  { id: 'autoimmune_il17', aliasPrefix: 'IL17A-Fab', target: 'IL-17A', count: 10, format: 'Fab', template: 6, theta: 25, phi: 32, distance: 29, tilt: -18, spin: -28, spread: 9 },
  { id: 'autoimmune_il23', aliasPrefix: 'IL23-Fab', target: 'IL-23', count: 10, format: 'Fab', template: 7, theta: 78, phi: -30, distance: 30, tilt: 24, spin: 51, spread: 10 },
  { id: 'infectious_rsv', aliasPrefix: 'RSVF-Fab', target: 'RSV F', count: 10, format: 'Fab', template: 8, theta: 132, phi: 38, distance: 34, tilt: -8, spin: -54, spread: 12 },
  { id: 'infectious_covid', aliasPrefix: 'SC2RBD-Fab', target: 'SARS-CoV-2 RBD', count: 10, format: 'Fab', template: 9, theta: 188, phi: -35, distance: 33, tilt: 28, spin: 59, spread: 12 },
  { id: 'infectious_flu', aliasPrefix: 'FluHA-Fab', target: 'Influenza HA', count: 10, format: 'Fab', template: 10, theta: 242, phi: 28, distance: 35, tilt: -32, spin: -12, spread: 13 },
  { id: 'cardio_pcsk9', aliasPrefix: 'PCSK9-Fab', target: 'PCSK9', count: 10, format: 'Fab', template: 1, theta: 315, phi: -22, distance: 32, tilt: 16, spin: 36, spread: 10 },
  { id: 'cardio_angptl3', aliasPrefix: 'ANGPTL3-CV-Fab', target: 'ANGPTL3', count: 10, format: 'Fab', template: 2, theta: 52, phi: 24, distance: 30, tilt: -20, spin: -41, spread: 9 },
  { id: 'cardio_il1b', aliasPrefix: 'IL1B-Fab', target: 'IL-1B', count: 10, format: 'Fab', template: 3, theta: 100, phi: -28, distance: 28, tilt: 34, spin: 19, spread: 8 },
  { id: 'metabolic_angptl3', aliasPrefix: 'ANGPTL3-Met-Fab', target: 'ANGPTL3', count: 10, format: 'Fab', template: 4, theta: 168, phi: 34, distance: 31, tilt: -38, spin: 48, spread: 10 },
  { id: 'metabolic_gipr', aliasPrefix: 'GIPR-Fab', target: 'GIPR', count: 10, format: 'Fab', template: 5, theta: 224, phi: -18, distance: 29, tilt: 12, spin: -63, spread: 9 }
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

function cross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]
  ];
}

function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
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
  const term1 = mul(v, cos);
  const term2 = mul(cross(u, v), sin);
  const term3 = mul(u, dot(u, v) * (1 - cos));
  return add(add(term1, term2), term3);
}

function rotateEuler(v, ax, ay, az) {
  let out = v;
  out = rotateAxis(out, [1, 0, 0], deg(ax));
  out = rotateAxis(out, [0, 1, 0], deg(ay));
  out = rotateAxis(out, [0, 0, 1], deg(az));
  return out;
}

function centerOf(atoms) {
  const sum = atoms.reduce((acc, atom) => add(acc, atom.xyz), [0, 0, 0]);
  return mul(sum, 1 / Math.max(1, atoms.length));
}

function parseAtoms(file) {
  const lines = fs.readFileSync(path.join(ROOT, file), 'utf8').split(/\r?\n/);
  return lines
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

function spherical(thetaDeg, phiDeg, distance) {
  const theta = deg(thetaDeg);
  const phi = deg(phiDeg);
  return [
    distance * Math.cos(phi) * Math.cos(theta),
    distance * Math.cos(phi) * Math.sin(theta),
    distance * Math.sin(phi)
  ];
}

function routeFrame(route, idx) {
  const theta = route.theta + idx * 9.5;
  const phi = route.phi + Math.sin((idx + 1) * 0.85) * 7;
  const distance = route.distance + (idx % 4) * 1.1;
  const primary = unit(spherical(theta, phi, 1));
  const upBase = Math.abs(primary[2]) > 0.85 ? [0, 1, 0] : [0, 0, 1];
  const side = unit(cross(primary, upBase));
  const up = unit(cross(side, primary));
  return { theta, phi, distance, primary, side, up };
}

function transformRoute(route, idx, templateAtoms) {
  const antigen = templateAtoms.filter(atom => atom.chain === 'A');
  const binder = templateAtoms.filter(atom => atom.chain === 'B');
  const centerA = centerOf(antigen);
  const centerB = centerOf(binder);
  const frame = routeFrame(route, idx);
  const serialLines = [];
  let serial = 1;

  const targetScale = route.format === 'VHH' ? 0.94 : 1 + (idx % 3) * 0.018;
  const targetShift = [0, 0, 0];
  antigen.forEach(atom => {
    let local = sub(atom.xyz, centerA);
    local = rotateEuler(local, route.tilt + idx * 1.2, route.theta * 0.22, route.phi * 0.35);
    local = [local[0] * targetScale, local[1] * targetScale, local[2] * (1 + (idx % 2) * 0.012)];
    serialLines.push(setAtomLine(atom, serial++, 'A', add(local, targetShift)));
  });

  const binderPose = (chain, spreadSign, extraSpin, compactScale) => {
    const baseDistance = frame.distance + spreadSign * 0.8;
    const attach = add(
      mul(frame.primary, baseDistance),
      add(mul(frame.side, spreadSign * route.spread), mul(frame.up, spreadSign * 2.2))
    );
    binder.forEach(atom => {
      let local = sub(atom.xyz, centerB);
      local = rotateEuler(local, route.spin + extraSpin + idx * 2.8, route.tilt + spreadSign * 11, route.theta + idx * 4.5);
      local = rotateAxis(local, frame.primary, deg(route.spin * 0.25 + extraSpin));
      local = mul(local, compactScale);
      serialLines.push(setAtomLine(atom, serial++, chain, add(local, attach)));
    });
  };

  if (route.format === 'VHH') {
    binderPose('B', 0, idx * 2.5, 0.92);
  } else {
    binderPose('B', -0.52, -12, 0.88);
    binderPose('C', 0.52, 18, 0.86);
  }

  return [
    'HEADER    ZOONOAB ROUTE PRESET ' + route.aliasPrefix,
    'REMARK 900 STATIC ROUTE PRESET: ' + route.id,
    'REMARK 901 TARGET: ' + route.target,
    'REMARK 902 FORMAT: ' + route.format,
    'REMARK 903 SOURCE TEMPLATE: ' + TEMPLATE_FILES[route.template],
    'MODEL        1',
    ...serialLines,
    'ENDMDL',
    'END',
    ''
  ].join('\n');
}

fs.mkdirSync(OUT_DIR, { recursive: true });

let written = 0;
for (const route of ROUTES) {
  const templateFile = TEMPLATE_FILES[route.template];
  const templateAtoms = parseAtoms(templateFile);
  if (!templateAtoms.length) throw new Error('No atoms in template ' + templateFile);
  for (let idx = 0; idx < route.count; idx++) {
    const filename = route.aliasPrefix + '-' + String(idx + 1).padStart(2, '0') + '.pdb';
    const out = transformRoute(route, idx, templateAtoms);
    fs.writeFileSync(path.join(OUT_DIR, filename), out);
    written += 1;
  }
}

console.log('Generated ' + written + ' route preset PDB files in ' + OUT_DIR);
