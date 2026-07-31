'use strict';

/**
 * Scaffold Matcher v2.0
 *
 * Implements epitope clustering, scaffold selection, and cross-candidate
 * separation validation for generating 10 Fab + 10 VHH = 20 diverse
 * antigen-antibody display poses per target.
 */

const crypto = require('crypto');

// ─── Vector operations ───

function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function sub(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function magnitude(v) {
  return Math.sqrt(dot(v, v));
}

function distance(a, b) {
  return magnitude(sub(a, b));
}

function angleBetweenDirections(dirA, dirB) {
  const cosTheta = Math.max(-1, Math.min(1, dot(dirA, dirB)));
  return Math.acos(cosTheta) * 180 / Math.PI;
}

// ─── Scaffold selection ───

function hashIndex(key, count) {
  const hash = crypto.createHash('sha256').update(String(key)).digest();
  return hash.readUInt32BE(0) % count;
}

let _rotationOffset = 0;

/**
 * Select 10 Fab scaffolds from 22 available, using deterministic hashing
 * and rotation offset to ensure diversity across consecutive targets.
 */
function selectFabScaffolds(targetName, fabScaffolds, count) {
  const n = count || 10;
  if (fabScaffolds.length <= n) return fabScaffolds.slice();
  const baseIdx = hashIndex(targetName, fabScaffolds.length);
  const startIdx = (baseIdx + _rotationOffset) % fabScaffolds.length;
  _rotationOffset = (_rotationOffset + n) % fabScaffolds.length;
  const selected = [];
  const step = 2; // cross-tier selection
  for (let i = 0; i < n; i++) {
    const idx = (startIdx + i * step) % fabScaffolds.length;
    const scaffold = fabScaffolds[idx];
    if (!selected.includes(scaffold)) {
      selected.push(scaffold);
    }
  }
  // Fill any gaps from step collisions
  let fillIdx = 0;
  while (selected.length < n && fillIdx < fabScaffolds.length) {
    const scaffold = fabScaffolds[(startIdx + fillIdx) % fabScaffolds.length];
    if (!selected.includes(scaffold)) selected.push(scaffold);
    fillIdx++;
  }
  return selected;
}

/**
 * Select all 10 VHH scaffolds, order determined by target hash.
 */
function selectVHHScaffolds(targetName, vhhScaffolds) {
  if (vhhScaffolds.length <= 1) return vhhScaffolds.slice();
  const baseIdx = hashIndex(targetName + '_vhh', vhhScaffolds.length);
  return vhhScaffolds
    .map((s, i) => ({ s, order: (i + baseIdx) % vhhScaffolds.length }))
    .sort((a, b) => a.order - b.order)
    .map(item => item.s);
}

function resetRotationOffset() {
  _rotationOffset = 0;
}

// ─── PDB atom parsing ───

function parsePdbAtoms(pdbText, chains) {
  const allowed = new Set(chains);
  const atoms = [];
  const lines = String(pdbText || '').split(/\r?\n/);
  let modelSeen = false;
  let inFirstModel = true;

  for (const line of lines) {
    if (line.startsWith('MODEL')) {
      if (modelSeen) { inFirstModel = false; continue; }
      modelSeen = true;
      inFirstModel = true;
      continue;
    }
    if (line.startsWith('ENDMDL')) {
      if (modelSeen && inFirstModel) inFirstModel = false;
      continue;
    }
    if (!inFirstModel) continue;
    if (!line.startsWith('ATOM  ') && !line.startsWith('HETATM')) continue;

    const padded = line.padEnd(80, ' ');
    const chain = padded[21] || ' ';
    if (!allowed.has(chain)) continue;

    const xyz = [
      parseFloat(padded.slice(30, 38)),
      parseFloat(padded.slice(38, 46)),
      parseFloat(padded.slice(46, 54))
    ];
    if (!xyz.every(Number.isFinite)) continue;

    const element = padded.slice(76, 78).trim().toUpperCase();
    const atomName = padded.slice(12, 16).trim();
    const isHeavy = element ? element !== 'H' && element !== 'D' : !/^\d*[HD]/i.test(atomName);
    const residueKey = chain + '|' + padded.slice(22, 27).trim();

    atoms.push({ chain, xyz, isHeavy, residueKey });
  }
  return atoms;
}

// ─── Contact residue computation ───

/**
 * Compute the set of antigen residue keys within `threshold` Å of any
 * antibody atom. Uses a spatial grid for O(n) performance.
 */
function computeContactResidues(pdbText, antigenChains, antibodyChains, threshold) {
  const t = threshold || 4.5;
  const antigenAtoms = parsePdbAtoms(pdbText, antigenChains).filter(a => a.isHeavy);
  const antibodyAtoms = parsePdbAtoms(pdbText, antibodyChains).filter(a => a.isHeavy);

  if (!antigenAtoms.length || !antibodyAtoms.length) return new Set();

  const thresholdSq = t * t;
  const cellSize = t;
  const grid = new Map();

  for (const atom of antibodyAtoms) {
    const key = Math.floor(atom.xyz[0] / cellSize) + ',' +
                Math.floor(atom.xyz[1] / cellSize) + ',' +
                Math.floor(atom.xyz[2] / cellSize);
    if (!grid.has(key)) grid.set(key, []);
    grid.get(key).push(atom);
  }

  const contactResidues = new Set();

  for (const agAtom of antigenAtoms) {
    if (contactResidues.has(agAtom.residueKey)) continue;
    const cx = Math.floor(agAtom.xyz[0] / cellSize);
    const cy = Math.floor(agAtom.xyz[1] / cellSize);
    const cz = Math.floor(agAtom.xyz[2] / cellSize);
    let found = false;

    for (let dx = -1; dx <= 1 && !found; dx++) {
      for (let dy = -1; dy <= 1 && !found; dy++) {
        for (let dz = -1; dz <= 1 && !found; dz++) {
          const bucket = grid.get((cx + dx) + ',' + (cy + dy) + ',' + (cz + dz));
          if (!bucket) continue;
          for (const abAtom of bucket) {
            const delta = sub(agAtom.xyz, abAtom.xyz);
            if (dot(delta, delta) <= thresholdSq) {
              contactResidues.add(agAtom.residueKey);
              found = true;
              break;
            }
          }
        }
      }
    }
  }

  return contactResidues;
}

// ─── Max antigen span ───

/**
 * Approximate the maximum pairwise distance among antigen heavy atoms.
 * Uses the farthest-from-centroid → farthest-from-that approach (O(n)).
 */
function computeMaxSpan(pdbText, antigenChains) {
  const atoms = parsePdbAtoms(pdbText, antigenChains).filter(a => a.isHeavy);
  if (atoms.length < 2) return 0;

  // Centroid
  const center = [0, 0, 0];
  for (const a of atoms) {
    center[0] += a.xyz[0];
    center[1] += a.xyz[1];
    center[2] += a.xyz[2];
  }
  center[0] /= atoms.length;
  center[1] /= atoms.length;
  center[2] /= atoms.length;

  // Farthest from centroid
  let farthest = atoms[0];
  let maxDist = 0;
  for (const a of atoms) {
    const d = distance(a.xyz, center);
    if (d > maxDist) { maxDist = d; farthest = a; }
  }

  // Farthest from that atom
  let maxSpan = 0;
  for (const a of atoms) {
    const d = distance(a.xyz, farthest.xyz);
    if (d > maxSpan) maxSpan = d;
  }

  return maxSpan;
}

// ─── Separation validation ───

/**
 * Default separation thresholds.
 */
const DEFAULT_THRESHOLDS = Object.freeze({
  minAngleDeg: 25,         // binding direction angle ≥ 25°
  minAnchorDist: 8,        // anchor distance ≥ 8 Å
  maxAnchorDistRatio: 0.8, // anchor distance ≤ 80% of max span
  maxContactOverlap: 0.5   // Jaccard overlap ≤ 50%
});

/**
 * Validate epitope separation between two poses.
 * Each pose should have: { direction, anchor, contactResidues }
 */
function validateEpitopeSeparation(poseA, poseB, maxAntigenSpan, options) {
  const opts = Object.assign({}, DEFAULT_THRESHOLDS, options || {});
  const issues = [];

  // 1. Angle between binding directions
  const angle = angleBetweenDirections(poseA.direction, poseB.direction);
  if (angle < opts.minAngleDeg) {
    issues.push({ check: 'angle', value: angle.toFixed(1), threshold: opts.minAngleDeg });
  }

  // 2. Anchor distance
  const anchorDist = distance(poseA.anchor, poseB.anchor);
  if (anchorDist < opts.minAnchorDist) {
    issues.push({ check: 'anchorDistMin', value: anchorDist.toFixed(1), threshold: opts.minAnchorDist });
  }
  if (maxAntigenSpan > 0 && anchorDist > opts.maxAnchorDistRatio * maxAntigenSpan) {
    issues.push({ check: 'anchorDistMax', value: anchorDist.toFixed(1), threshold: (opts.maxAnchorDistRatio * maxAntigenSpan).toFixed(1) });
  }

  // 3. Contact residue overlap (Jaccard)
  if (poseA.contactResidues && poseB.contactResidues) {
    const setA = poseA.contactResidues;
    const setB = poseB.contactResidues;
    let intersection = 0;
    for (const r of setA) {
      if (setB.has(r)) intersection++;
    }
    const union = setA.size + setB.size - intersection;
    const overlap = union > 0 ? intersection / union : 0;
    if (overlap > opts.maxContactOverlap) {
      issues.push({ check: 'contactOverlap', value: overlap.toFixed(2), threshold: opts.maxContactOverlap });
    }
  }

  return { valid: issues.length === 0, issues, angle: angle, anchorDist: anchorDist };
}

/**
 * Validate all pairs in a pose list.
 */
function validateAllPairs(poses, maxAntigenSpan, options) {
  const violations = [];
  for (let i = 0; i < poses.length; i++) {
    for (let j = i + 1; j < poses.length; j++) {
      const result = validateEpitopeSeparation(poses[i], poses[j], maxAntigenSpan, options);
      if (!result.valid) {
        violations.push({ i, j, issues: result.issues });
      }
    }
  }
  return { valid: violations.length === 0, violations };
}

/**
 * Greedily select `targetCount` poses from `candidates` that satisfy
 * pairwise epitope separation constraints. Applies progressive relaxation
 * if insufficient candidates pass strict thresholds.
 *
 * @param {Array} candidates - Array of pose objects with { direction, anchor, contactResidues, geometry, scaffold, format }
 * @param {number} targetCount - Desired number of separated poses
 * @param {number} maxAntigenSpan - Maximum antigen dimension (Å)
 * @param {Object} options - Threshold overrides
 * @returns {{ selected: Array, degradation: string, rejectedCount: number }}
 */
function selectSeparatedPoses(candidates, targetCount, maxAntigenSpan, options) {
  const opts = Object.assign({}, DEFAULT_THRESHOLDS, options || {});

  // Sort by contact pairs descending (prefer poses with more contacts)
  const sorted = candidates.slice().sort((a, b) => {
    const ca = a.geometry ? a.geometry.contactPairs4_5A || 0 : 0;
    const cb = b.geometry ? b.geometry.contactPairs4_5A || 0 : 0;
    return cb - ca;
  });

  // L0: strict thresholds
  let selected = greedySelect(sorted, targetCount, maxAntigenSpan, opts, null);
  if (selected.length >= targetCount) {
    return { selected, degradation: 'L0', rejectedCount: candidates.length - selected.length };
  }

  // L3: relax angle to 15°, overlap to 0.6
  const l3Opts = Object.assign({}, opts, { minAngleDeg: Math.max(15, opts.minAngleDeg - 10), maxContactOverlap: 0.6 });
  selected = greedySelect(sorted, targetCount, maxAntigenSpan, l3Opts, null);
  if (selected.length >= targetCount) {
    return { selected, degradation: 'L3', rejectedCount: candidates.length - selected.length };
  }

  // L4: relax angle to 10°, overlap to 0.7
  const l4Opts = Object.assign({}, opts, { minAngleDeg: 10, maxContactOverlap: 0.7, minAnchorDist: 5 });
  selected = greedySelect(sorted, targetCount, maxAntigenSpan, l4Opts, null);
  if (selected.length >= targetCount) {
    return { selected, degradation: 'L4', rejectedCount: candidates.length - selected.length };
  }

  // L5: just fill with whatever we have, even if not separated
  const fallback = sorted.slice(0, targetCount);
  return { selected: fallback, degradation: 'L5', rejectedCount: candidates.length - fallback.length };
}

function greedySelect(candidates, targetCount, maxAntigenSpan, opts, existing) {
  const selected = [];
  const checkAgainst = existing ? existing.slice() : [];
  for (const candidate of candidates) {
    if (selected.length >= targetCount) break;
    let fits = true;
    for (const other of checkAgainst) {
      const result = validateEpitopeSeparation(candidate, other, maxAntigenSpan, opts);
      if (!result.valid) {
        fits = false;
        break;
      }
    }
    if (fits) {
      selected.push(candidate);
      checkAgainst.push(candidate);
    }
  }
  return selected;
}

/**
 * Greedily select separated poses, considering existing already-selected poses.
 * Used for cross-format separation (e.g., select VHH considering selected Fab).
 */
function selectSeparatedPosesWithExisting(candidates, existing, targetCount, maxAntigenSpan, options) {
  const opts = Object.assign({}, DEFAULT_THRESHOLDS, options || {});
  const sorted = candidates.slice().sort((a, b) => {
    const ca = a.geometry ? a.geometry.contactPairs4_5A || 0 : 0;
    const cb = b.geometry ? b.geometry.contactPairs4_5A || 0 : 0;
    return cb - ca;
  });

  // L0: strict
  let selected = greedySelect(sorted, targetCount, maxAntigenSpan, opts, existing);
  if (selected.length >= targetCount) {
    return { selected, degradation: 'L0' };
  }
  // L3: relax angle/overlap
  const l3Opts = Object.assign({}, opts, { minAngleDeg: Math.max(15, opts.minAngleDeg - 10), maxContactOverlap: 0.6 });
  selected = greedySelect(sorted, targetCount, maxAntigenSpan, l3Opts, existing);
  if (selected.length >= targetCount) {
    return { selected, degradation: 'L3' };
  }
  // L4: further relax
  const l4Opts = Object.assign({}, opts, { minAngleDeg: 10, maxContactOverlap: 0.7, minAnchorDist: 5 });
  selected = greedySelect(sorted, targetCount, maxAntigenSpan, l4Opts, existing);
  if (selected.length >= targetCount) {
    return { selected, degradation: 'L4' };
  }
  // L5: fill
  const fallback = sorted.slice(0, targetCount);
  return { selected: fallback, degradation: 'L5' };
}

/**
 * Extract pose metadata (direction, anchor, contactResidues) from a
 * generateDisplayPose result for separation validation.
 */
function extractPoseMetadata(poseResult, combinedPdbText) {
  if (!poseResult || !poseResult.ok) return null;
  const pose = poseResult.pose;
  const direction = pose.antigenSurfaceDirection;
  const anchor = pose.antigenAnchor.coordinate;
  const contactResidues = computeContactResidues(
    combinedPdbText,
    poseResult.antigenChains,
    poseResult.antibodyChains,
    4.5
  );
  return {
    direction,
    anchor,
    contactResidues,
    geometry: pose.geometry,
    antigenChains: poseResult.antigenChains,
    antibodyChains: poseResult.antibodyChains
  };
}

module.exports = {
  // Vector operations
  dot,
  sub,
  magnitude,
  distance,
  angleBetweenDirections,
  // Scaffold selection
  hashIndex,
  selectFabScaffolds,
  selectVHHScaffolds,
  resetRotationOffset,
  // PDB parsing
  parsePdbAtoms,
  // Contact residues
  computeContactResidues,
  // Max span
  computeMaxSpan,
  // Separation validation
  validateEpitopeSeparation,
  validateAllPairs,
  selectSeparatedPoses,
  selectSeparatedPosesWithExisting,
  extractPoseMetadata,
  // Constants
  DEFAULT_THRESHOLDS
};
