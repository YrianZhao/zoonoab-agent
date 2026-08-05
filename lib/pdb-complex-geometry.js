'use strict';

const DEFAULT_THRESHOLDS = Object.freeze({
  hardClashDistance: 2.0,
  contactDistance: 4.5,
  nearDistance: 6.0,
  tooFarDistance: 10.0,
  maxWeakContactDistance: 8.0,
  minAntigenAtoms: 3,
  minAntibodyAtoms: 3,
  minContactPairs: 8,
  minNearPairs: 40,
  maxVisualGap: 25.0,
  targetMinDistance: 2.4
});

const FORMAT_THRESHOLDS = Object.freeze({
  FAB: Object.freeze({ minContactPairs: 8, minNearPairs: 40, maxVisualGap: 28.0 }),
  VHH: Object.freeze({ minContactPairs: 6, minNearPairs: 24, maxVisualGap: 22.0 })
});

function firstDefined(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return undefined;
}

function numberOrDefault(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalizeFormat(value) {
  const normalized = String(value || '').trim().toUpperCase();
  if (normalized === 'FAB') return 'Fab';
  if (normalized === 'VHH' || normalized === 'VH' || normalized === 'NANOBODY') return 'VHH';
  return String(value || '').trim() || null;
}

function thresholdsForFormat(format, overrides = {}) {
  const normalized = normalizeFormat(format);
  const formatDefaults = FORMAT_THRESHOLDS[String(normalized || '').toUpperCase()] || {};
  const merged = { ...DEFAULT_THRESHOLDS, ...formatDefaults, ...(overrides || {}) };
  return {
    hardClashDistance: numberOrDefault(merged.hardClashDistance, DEFAULT_THRESHOLDS.hardClashDistance),
    contactDistance: numberOrDefault(merged.contactDistance, DEFAULT_THRESHOLDS.contactDistance),
    nearDistance: numberOrDefault(merged.nearDistance, DEFAULT_THRESHOLDS.nearDistance),
    tooFarDistance: numberOrDefault(merged.tooFarDistance, DEFAULT_THRESHOLDS.tooFarDistance),
    maxWeakContactDistance: numberOrDefault(merged.maxWeakContactDistance, DEFAULT_THRESHOLDS.maxWeakContactDistance),
    minAntigenAtoms: Math.max(1, Math.floor(numberOrDefault(merged.minAntigenAtoms, DEFAULT_THRESHOLDS.minAntigenAtoms))),
    minAntibodyAtoms: Math.max(1, Math.floor(numberOrDefault(merged.minAntibodyAtoms, DEFAULT_THRESHOLDS.minAntibodyAtoms))),
    minContactPairs: Math.max(0, Math.floor(numberOrDefault(merged.minContactPairs, DEFAULT_THRESHOLDS.minContactPairs))),
    minNearPairs: Math.max(0, Math.floor(numberOrDefault(merged.minNearPairs, DEFAULT_THRESHOLDS.minNearPairs))),
    maxVisualGap: numberOrDefault(merged.maxVisualGap, DEFAULT_THRESHOLDS.maxVisualGap),
    targetMinDistance: numberOrDefault(merged.targetMinDistance, DEFAULT_THRESHOLDS.targetMinDistance)
  };
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

function magnitude(vector) {
  return Math.sqrt(dot(vector, vector));
}

function distance(a, b) {
  return magnitude(sub(a, b));
}

function unit(vector, fallback = [1, 0, 0]) {
  const length = magnitude(vector);
  if (length < 1e-9) return fallback.slice();
  return mul(vector, 1 / length);
}

function round(value, digits = 3) {
  if (!Number.isFinite(value)) return value;
  const scale = 10 ** digits;
  return Math.round(value * scale) / scale;
}

function roundVector(vector, digits = 3) {
  return vector.map(value => round(value, digits));
}

function splitChainList(value) {
  if (Array.isArray(value)) {
    return [...new Set(value.map(item => String(item == null ? '' : item).trim()).filter(Boolean))];
  }
  return [...new Set(String(value == null ? '' : value)
    .split(/[,;\s]+/)
    .map(item => item.trim())
    .filter(Boolean))];
}

function lineStartsAtomRecord(line) {
  return line.startsWith('ATOM  ') || line.startsWith('HETATM');
}

function parseRoleRemarks(text) {
  const lines = String(text || '').split(/\r?\n/);
  const metadata = {
    target: null,
    format: null,
    antigenChains: [],
    antibodyChains: [],
    hasRoleRemarks: false
  };

  for (let index = 0; index < Math.min(lines.length, 160); index += 1) {
    const line = lines[index];
    if (!metadata.target && /^REMARK\s+90[01]\b/.test(line)) {
      const match = line.match(/TARGET:\s*(.+)$/i);
      if (match) metadata.target = match[1].trim();
    }
    if (/^REMARK\s+902\b/.test(line)) {
      const match = line.match(/FORMAT:\s*(\S+)/i);
      if (match) metadata.format = normalizeFormat(match[1]);
    }
    if (/^REMARK\s+904\b/.test(line)) {
      const match = line.match(/ANTIGEN\s+CHAINS:\s*(.*)$/i);
      if (match) {
        metadata.antigenChains = splitChainList(match[1]);
        metadata.hasRoleRemarks = true;
      }
    }
    if (/^REMARK\s+905\b/.test(line)) {
      const match = line.match(/ANTIBODY\s+CHAINS:\s*(.*)$/i);
      if (match) {
        metadata.antibodyChains = splitChainList(match[1]);
        metadata.hasRoleRemarks = true;
      }
    }
  }

  return metadata;
}

function detectChainColumn(lines, expectedChains = []) {
  const expected = new Set(splitChainList(expectedChains));
  const scores = { 20: 0, 21: 0 };
  let total = 0;
  let nonBlank20 = 0;
  let nonBlank21 = 0;

  for (const line of lines) {
    if (!lineStartsAtomRecord(line)) continue;
    total += 1;
    const padded = line.padEnd(80, ' ');
    const c20 = padded[20] || ' ';
    const c21 = padded[21] || ' ';
    if (c20 !== ' ') nonBlank20 += 1;
    if (c21 !== ' ') nonBlank21 += 1;
    if (expected.size) {
      if (expected.has(c20)) scores[20] += 1;
      if (expected.has(c21)) scores[21] += 1;
    }
    if (total >= 1500) break;
  }

  if (expected.size) {
    if (scores[20] > scores[21]) return { column: 20, scores, total };
    return { column: 21, scores, total };
  }
  return { column: nonBlank20 > nonBlank21 ? 20 : 21, scores: { 20: nonBlank20, 21: nonBlank21 }, total };
}

function parseAtomRecords(text, options = {}) {
  const lines = String(text || '').split(/\r?\n/);
  const chainColumn = Number.isInteger(options.chainColumn) ? options.chainColumn : 21;
  const firstModelOnly = options.firstModelOnly !== false;
  const records = [];
  let modelSeen = false;
  let inFirstModel = true;

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex];
    if (line.startsWith('MODEL')) {
      if (firstModelOnly && modelSeen) {
        inFirstModel = false;
        continue;
      }
      modelSeen = true;
      inFirstModel = true;
      continue;
    }
    if (line.startsWith('ENDMDL')) {
      if (firstModelOnly && modelSeen && inFirstModel) inFirstModel = false;
      continue;
    }
    if (firstModelOnly && !inFirstModel) continue;
    if (!lineStartsAtomRecord(line)) continue;

    const padded = line.padEnd(80, ' ');
    const xyz = [
      Number.parseFloat(padded.slice(30, 38)),
      Number.parseFloat(padded.slice(38, 46)),
      Number.parseFloat(padded.slice(46, 54))
    ];
    if (!xyz.every(Number.isFinite)) continue;
    const atomName = padded.slice(12, 16).trim();
    const element = padded.slice(76, 78).trim().toUpperCase();
    records.push({
      line,
      lineIndex,
      recordName: padded.slice(0, 6).trim(),
      chain: padded[chainColumn] || ' ',
      xyz,
      atomName,
      element,
      isHeavy: element ? element !== 'H' && element !== 'D' : !/^\d*[HD]/i.test(atomName)
    });
  }

  return { records, lines };
}

function centerOf(records) {
  if (!records.length) return null;
  const sum = records.reduce((acc, record) => add(acc, record.xyz), [0, 0, 0]);
  return mul(sum, 1 / records.length);
}

function radiusOf(records, center) {
  if (records.length < 2 || !center) return 0;
  let sum = 0;
  for (const record of records) {
    const delta = sub(record.xyz, center);
    sum += dot(delta, delta);
  }
  return Math.sqrt(sum / records.length);
}

function gridKey(x, y, z) {
  return x + ',' + y + ',' + z;
}

function buildSpatialGrid(records, cellSize) {
  const safeCellSize = Math.max(0.1, Number(cellSize) || 1);
  const cells = new Map();
  for (const record of records) {
    const cx = Math.floor(record.xyz[0] / safeCellSize);
    const cy = Math.floor(record.xyz[1] / safeCellSize);
    const cz = Math.floor(record.xyz[2] / safeCellSize);
    const key = gridKey(cx, cy, cz);
    if (!cells.has(key)) cells.set(key, []);
    cells.get(key).push(record);
  }
  return { cells, cellSize: safeCellSize };
}

function measureNearbyWithGrid(antigenRecords, antibodyRecords, thresholds) {
  const nearSq = thresholds.nearDistance ** 2;
  const contactSq = thresholds.contactDistance ** 2;
  const clashSq = thresholds.hardClashDistance ** 2;
  const grid = buildSpatialGrid(antigenRecords, thresholds.nearDistance);
  let minDistanceSq = Infinity;
  let minPair = null;
  let contactPairs = 0;
  let nearPairs = 0;
  let hardClashes = 0;

  for (const antibody of antibodyRecords) {
    const cell = antibody.xyz.map(value => Math.floor(value / grid.cellSize));
    for (let dx = -1; dx <= 1; dx += 1) {
      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dz = -1; dz <= 1; dz += 1) {
          const bucket = grid.cells.get(gridKey(cell[0] + dx, cell[1] + dy, cell[2] + dz));
          if (!bucket) continue;
          for (const antigen of bucket) {
            const delta = sub(antigen.xyz, antibody.xyz);
            const distanceSq = dot(delta, delta);
            if (distanceSq < minDistanceSq) {
              minDistanceSq = distanceSq;
              minPair = { antigen, antibody };
            }
            if (distanceSq <= nearSq) nearPairs += 1;
            if (distanceSq <= contactSq) contactPairs += 1;
            if (distanceSq < clashSq) hardClashes += 1;
          }
        }
      }
    }
  }

  return {
    minDistance: Number.isFinite(minDistanceSq) ? Math.sqrt(minDistanceSq) : Infinity,
    minPair,
    contactPairs,
    nearPairs,
    hardClashes
  };
}

function boundingBox(records) {
  if (!records.length) return null;
  const min = records[0].xyz.slice();
  const max = records[0].xyz.slice();
  for (const record of records.slice(1)) {
    for (let axis = 0; axis < 3; axis += 1) {
      if (record.xyz[axis] < min[axis]) min[axis] = record.xyz[axis];
      if (record.xyz[axis] > max[axis]) max[axis] = record.xyz[axis];
    }
  }
  return { min, max };
}

function boundingBoxGap(left, right) {
  if (!left || !right) return Infinity;
  let gapSq = 0;
  for (let axis = 0; axis < 3; axis += 1) {
    let axisGap = 0;
    if (left.max[axis] < right.min[axis]) axisGap = right.min[axis] - left.max[axis];
    else if (right.max[axis] < left.min[axis]) axisGap = left.min[axis] - right.max[axis];
    gapSq += axisGap * axisGap;
  }
  return Math.sqrt(gapSq);
}

function nearestPairDistance(antigenRecords, antibodyRecords, thresholds) {
  const nearby = measureNearbyWithGrid(antigenRecords, antibodyRecords, thresholds);
  if (Number.isFinite(nearby.minDistance)) return nearby;

  const antigenBox = boundingBox(antigenRecords);
  const antibodyBox = boundingBox(antibodyRecords);
  let cellSize = Math.max(thresholds.nearDistance, boundingBoxGap(antigenBox, antibodyBox), 1);
  let best = { minDistance: Infinity, minPair: null };
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const grid = buildSpatialGrid(antigenRecords, cellSize);
    let minDistanceSq = Infinity;
    let minPair = null;
    for (const antibody of antibodyRecords) {
      const cell = antibody.xyz.map(value => Math.floor(value / grid.cellSize));
      for (let dx = -1; dx <= 1; dx += 1) {
        for (let dy = -1; dy <= 1; dy += 1) {
          for (let dz = -1; dz <= 1; dz += 1) {
            const bucket = grid.cells.get(gridKey(cell[0] + dx, cell[1] + dy, cell[2] + dz));
            if (!bucket) continue;
            for (const antigen of bucket) {
              const delta = sub(antigen.xyz, antibody.xyz);
              const distanceSq = dot(delta, delta);
              if (distanceSq < minDistanceSq) {
                minDistanceSq = distanceSq;
                minPair = { antigen, antibody };
              }
            }
          }
        }
      }
    }
    if (Number.isFinite(minDistanceSq)) {
      best = { minDistance: Math.sqrt(minDistanceSq), minPair };
      break;
    }
    cellSize *= 2;
  }

  return {
    ...nearby,
    minDistance: best.minDistance,
    minPair: best.minPair
  };
}

function measureInterfaceGeometry(antigenRecords, antibodyRecords, thresholds) {
  const antigenHeavy = antigenRecords.filter(record => record.isHeavy !== false);
  const antibodyHeavy = antibodyRecords.filter(record => record.isHeavy !== false);
  const nearby = nearestPairDistance(antigenHeavy, antibodyHeavy, thresholds);
  const antigenCenter = centerOf(antigenHeavy);
  const antibodyCenter = centerOf(antibodyHeavy);
  const antigenRadius = radiusOf(antigenHeavy, antigenCenter);
  const antibodyRadius = radiusOf(antibodyHeavy, antibodyCenter);
  const comDistance = antigenCenter && antibodyCenter ? distance(antigenCenter, antibodyCenter) : Infinity;
  const visualGap = Number.isFinite(comDistance) ? comDistance - antigenRadius - antibodyRadius : Infinity;

  return {
    minDistance: nearby.minDistance,
    contactPairs: nearby.contactPairs,
    nearPairs: nearby.nearPairs,
    hardClashes: nearby.hardClashes,
    minPair: nearby.minPair,
    antigenCenter,
    antibodyCenter,
    antigenRadius,
    antibodyRadius,
    comDistance,
    visualGap
  };
}

function issue(code, message, details = {}) {
  return { code, message, details };
}

function statusFromGeometry(geometry, thresholds) {
  const issues = [];
  if (geometry.hardClashes > 0) {
    issues.push(issue('HARD_CLASH', 'Antigen and antibody atoms overlap below the hard-clash distance.', {
      hardClashes: geometry.hardClashes
    }));
  }
  if (!Number.isFinite(geometry.minDistance) || geometry.minDistance > thresholds.tooFarDistance) {
    issues.push(issue('MIN_DISTANCE_TOO_LARGE', 'The closest antigen-antibody atom pair is beyond the too-far threshold.', {
      minDistance: geometry.minDistance,
      threshold: thresholds.tooFarDistance
    }));
  }
  if (geometry.contactPairs < thresholds.minContactPairs) {
    issues.push(issue('LOW_CONTACT_COUNT', 'Too few antigen-antibody atom pairs are within the contact distance.', {
      contactPairs: geometry.contactPairs,
      threshold: thresholds.minContactPairs
    }));
  }
  if (geometry.nearPairs < thresholds.minNearPairs) {
    issues.push(issue('LOW_NEAR_PAIR_COUNT', 'Too few antigen-antibody atom pairs are within the near-interface distance.', {
      nearPairs: geometry.nearPairs,
      threshold: thresholds.minNearPairs
    }));
  }
  if (
    Number.isFinite(geometry.visualGap) &&
    geometry.visualGap > thresholds.maxVisualGap &&
    geometry.contactPairs < thresholds.minContactPairs * 3
  ) {
    issues.push(issue('VISUAL_GAP_TOO_LARGE', 'The bodies have a large center/radius gap and weak visible interface support.', {
      visualGap: geometry.visualGap,
      threshold: thresholds.maxVisualGap
    }));
  }

  if (issues.some(item => item.code === 'HARD_CLASH')) return { status: 'HARD_CLASH', issues, fixable: false };
  if (issues.some(item => item.code === 'MIN_DISTANCE_TOO_LARGE')) return { status: 'TOO_FAR', issues, fixable: true };
  if (issues.length) return { status: 'WEAK_INTERFACE', issues, fixable: true };
  return { status: 'OK', issues, fixable: false };
}

function resolveRoleMetadata(text, options = {}) {
  const remarkMetadata = parseRoleRemarks(text);
  const antigenChains = splitChainList(firstDefined(options.antigenChains, options.expectedAntigenChains, remarkMetadata.antigenChains));
  const antibodyChains = splitChainList(firstDefined(options.antibodyChains, options.expectedAntibodyChains, remarkMetadata.antibodyChains));
  return {
    target: firstDefined(options.target, remarkMetadata.target),
    format: normalizeFormat(firstDefined(options.format, options.antibodyFormat, remarkMetadata.format)),
    antigenChains,
    antibodyChains,
    metadataSource: options.metadataSource || (remarkMetadata.hasRoleRemarks ? 'pdb-remarks' : 'none'),
    remarkMetadata
  };
}

function countAtomsByChain(records) {
  const counts = {};
  for (const record of records) counts[record.chain] = (counts[record.chain] || 0) + 1;
  return counts;
}

function filterChains(records, chains) {
  const allowed = new Set(chains);
  return records.filter(record => allowed.has(record.chain));
}

function summarizeGeometry(geometry) {
  return {
    minDistance: round(geometry.minDistance, 3),
    contactPairs: geometry.contactPairs,
    nearPairs: geometry.nearPairs,
    hardClashes: geometry.hardClashes,
    antigenCenter: geometry.antigenCenter ? roundVector(geometry.antigenCenter, 3) : null,
    antibodyCenter: geometry.antibodyCenter ? roundVector(geometry.antibodyCenter, 3) : null,
    antigenRadius: round(geometry.antigenRadius, 3),
    antibodyRadius: round(geometry.antibodyRadius, 3),
    comDistance: round(geometry.comDistance, 3),
    visualGap: round(geometry.visualGap, 3)
  };
}

function analyzeComplexText(text, options = {}) {
  const roles = resolveRoleMetadata(text, options);
  const lines = String(text || '').split(/\r?\n/);
  const allExpectedChains = [...roles.antigenChains, ...roles.antibodyChains];
  if (!roles.antigenChains.length || !roles.antibodyChains.length) {
    return {
      file: options.file || null,
      status: 'NO_ROLE_METADATA',
      fixable: false,
      target: roles.target || null,
      format: roles.format || null,
      metadataSource: roles.metadataSource,
      roles: {
        antigenChains: roles.antigenChains,
        antibodyChains: roles.antibodyChains,
        missingAntigenChains: roles.antigenChains,
        missingAntibodyChains: roles.antibodyChains,
        chainColumn: null,
        chainColumnScores: null
      },
      atoms: { total: 0, byChain: {} },
      geometry: null,
      issues: [
        issue('NO_ROLE_METADATA', 'No antigen/antibody chain roles were available from metadata or PDB remarks.')
      ]
    };
  }

  const detected = detectChainColumn(lines, allExpectedChains);
  const parsed = parseAtomRecords(text, {
    chainColumn: detected.column,
    firstModelOnly: options.firstModelOnly !== false
  });
  const byChain = countAtomsByChain(parsed.records);
  const antigenRecords = filterChains(parsed.records, roles.antigenChains);
  const antibodyRecords = filterChains(parsed.records, roles.antibodyChains);
  const missingAntigenChains = roles.antigenChains.filter(chain => !byChain[chain]);
  const missingAntibodyChains = roles.antibodyChains.filter(chain => !byChain[chain]);
  const thresholds = thresholdsForFormat(roles.format, options.thresholds);

  if (missingAntigenChains.length || missingAntibodyChains.length) {
    const result = {
      file: options.file || null,
      status: 'MISSING_ROLE_ATOMS',
      fixable: false,
      target: roles.target || null,
      format: roles.format || null,
      metadataSource: roles.metadataSource,
      thresholds,
      roles: {
        antigenChains: roles.antigenChains,
        antibodyChains: roles.antibodyChains,
        missingAntigenChains,
        missingAntibodyChains,
        chainColumn: detected.column,
        chainColumnScores: detected.scores
      },
      atoms: {
        total: parsed.records.length,
        antigen: antigenRecords.length,
        antibody: antibodyRecords.length,
        byChain
      },
      geometry: null,
      issues: [
        issue('MISSING_ROLE_ATOMS', 'One or more declared role chains have no parsed ATOM/HETATM coordinates.', {
          missingAntigenChains,
          missingAntibodyChains
        })
      ]
    };
    Object.defineProperty(result, '_workingSet', {
      value: { lines: parsed.lines, records: parsed.records, antigenRecords, antibodyRecords },
      enumerable: false
    });
    return result;
  }

  if (antigenRecords.length < thresholds.minAntigenAtoms || antibodyRecords.length < thresholds.minAntibodyAtoms) {
    const result = {
      file: options.file || null,
      status: 'INSUFFICIENT_ROLE_ATOMS',
      fixable: false,
      target: roles.target || null,
      format: roles.format || null,
      metadataSource: roles.metadataSource,
      thresholds,
      roles: {
        antigenChains: roles.antigenChains,
        antibodyChains: roles.antibodyChains,
        missingAntigenChains,
        missingAntibodyChains,
        chainColumn: detected.column,
        chainColumnScores: detected.scores
      },
      atoms: {
        total: parsed.records.length,
        antigen: antigenRecords.length,
        antibody: antibodyRecords.length,
        byChain
      },
      geometry: null,
      issues: [
        issue('INSUFFICIENT_ROLE_ATOMS', 'Antigen or antibody role chains have too few parsed atoms for geometry validation.', {
          antigenAtoms: antigenRecords.length,
          antibodyAtoms: antibodyRecords.length
        })
      ]
    };
    Object.defineProperty(result, '_workingSet', {
      value: { lines: parsed.lines, records: parsed.records, antigenRecords, antibodyRecords },
      enumerable: false
    });
    return result;
  }

  const geometryRaw = measureInterfaceGeometry(antigenRecords, antibodyRecords, thresholds);
  const status = statusFromGeometry(geometryRaw, thresholds);
  const result = {
    file: options.file || null,
    status: status.status,
    fixable: status.fixable,
    target: roles.target || null,
    format: roles.format || null,
    metadataSource: roles.metadataSource,
    thresholds,
    roles: {
      antigenChains: roles.antigenChains,
      antibodyChains: roles.antibodyChains,
      missingAntigenChains,
      missingAntibodyChains,
      chainColumn: detected.column,
      chainColumnScores: detected.scores
    },
    atoms: {
      total: parsed.records.length,
      antigen: antigenRecords.length,
      antibody: antibodyRecords.length,
      byChain
    },
    geometry: summarizeGeometry(geometryRaw),
    issues: status.issues
  };
  Object.defineProperty(result, '_workingSet', {
    value: {
      lines: parsed.lines,
      records: parsed.records,
      antigenRecords,
      antibodyRecords,
      geometryRaw
    },
    enumerable: false
  });
  return result;
}

function translatedRecords(records, translation) {
  return records.map(record => ({
    ...record,
    xyz: add(record.xyz, translation)
  }));
}

function geometryIsAcceptable(geometry, thresholds) {
  return geometry.hardClashes === 0 &&
    Number.isFinite(geometry.minDistance) &&
    geometry.minDistance >= thresholds.hardClashDistance &&
    geometry.minDistance <= thresholds.contactDistance &&
    geometry.contactPairs >= thresholds.minContactPairs &&
    geometry.nearPairs >= thresholds.minNearPairs;
}

function geometryScore(geometry, thresholds, shiftMagnitude) {
  if (!Number.isFinite(geometry.minDistance)) return -Infinity;
  const target = thresholds.targetMinDistance;
  const minDistancePenalty = Math.abs(geometry.minDistance - target) * 120;
  const clashPenalty = geometry.hardClashes * 10000;
  const contactScore = geometry.contactPairs * 8 + geometry.nearPairs;
  const acceptedBonus = geometryIsAcceptable(geometry, thresholds) ? 100000 : 0;
  return acceptedBonus + contactScore - minDistancePenalty - clashPenalty - shiftMagnitude * 0.02;
}

function createAntibodyTranslationPlan(analysis, options = {}) {
  if (!analysis || !analysis.fixable || !['TOO_FAR', 'WEAK_INTERFACE'].includes(analysis.status)) {
    return { ok: false, reason: 'not_fixable_status' };
  }
  const working = analysis._workingSet;
  if (!working || !working.antigenRecords || !working.antibodyRecords || !working.geometryRaw) {
    return { ok: false, reason: 'missing_working_set' };
  }

  const thresholds = {
    ...analysis.thresholds,
    targetMinDistance: numberOrDefault(options.targetMinDistance, analysis.thresholds.targetMinDistance)
  };
  const antigenHeavy = working.antigenRecords.filter(record => record.isHeavy !== false);
  const antibodyHeavy = working.antibodyRecords.filter(record => record.isHeavy !== false);
  if (!antigenHeavy.length || !antibodyHeavy.length) return { ok: false, reason: 'missing_role_atoms' };

  const before = working.geometryRaw;
  const direction = unit(sub(before.antigenCenter || [0, 0, 0], before.antibodyCenter || [0, 0, 0]));
  const currentCenterDistance = Number.isFinite(before.comDistance) ? before.comDistance : 0;
  const currentMinDistance = Number.isFinite(before.minDistance) ? before.minDistance : currentCenterDistance;
  const defaultMaxShift = Math.max(
    currentMinDistance + thresholds.nearDistance,
    currentCenterDistance + before.antibodyRadius + thresholds.nearDistance,
    thresholds.tooFarDistance * 2
  );
  const maxShift = Math.max(1, numberOrDefault(options.maxShift, defaultMaxShift));
  const sampleCount = Math.max(12, Math.floor(numberOrDefault(options.samples, 80)));
  let best = null;

  for (let sample = 1; sample <= sampleCount; sample += 1) {
    const amount = maxShift * sample / sampleCount;
    const translation = mul(direction, amount);
    const moved = translatedRecords(antibodyHeavy, translation);
    const geometry = measureInterfaceGeometry(antigenHeavy, moved, thresholds);
    const score = geometryScore(geometry, thresholds, amount);
    if (!best || score > best.score) {
      best = { amount, translation, geometry, score };
    }
  }

  if (!best || !geometryIsAcceptable(best.geometry, thresholds)) {
    return {
      ok: false,
      reason: 'no_acceptable_translation',
      bestGeometry: best ? summarizeGeometry(best.geometry) : null
    };
  }

  const movedFullAntibody = translatedRecords(working.antibodyRecords, best.translation);
  const finalGeometry = measureInterfaceGeometry(working.antigenRecords, movedFullAntibody, thresholds);
  if (!geometryIsAcceptable(finalGeometry, thresholds)) {
    return {
      ok: false,
      reason: 'rounded_or_full_atom_geometry_not_acceptable',
      bestGeometry: summarizeGeometry(finalGeometry)
    };
  }

  return {
    ok: true,
    method: 'rigid_antibody_translation',
    antibodyChains: analysis.roles.antibodyChains.slice(),
    chainColumn: analysis.roles.chainColumn,
    translation: roundVector(best.translation, 6),
    beforeGeometry: analysis.geometry,
    afterGeometry: summarizeGeometry(finalGeometry)
  };
}

function formatCoordinate(value) {
  if (!Number.isFinite(value)) throw new Error('Cannot format a non-finite PDB coordinate');
  const formatted = value.toFixed(3);
  if (formatted.length > 8) {
    throw new Error('Translated coordinate exceeds classic PDB coordinate field width: ' + formatted);
  }
  return formatted.padStart(8, ' ');
}

function translateAtomLine(line, translation) {
  const padded = line.padEnd(80, ' ');
  const xyz = [
    Number.parseFloat(padded.slice(30, 38)),
    Number.parseFloat(padded.slice(38, 46)),
    Number.parseFloat(padded.slice(46, 54))
  ];
  if (!xyz.every(Number.isFinite)) return line;
  const moved = add(xyz, translation);
  return padded.slice(0, 30) +
    formatCoordinate(moved[0]) +
    formatCoordinate(moved[1]) +
    formatCoordinate(moved[2]) +
    padded.slice(54).trimEnd();
}

function applyAntibodyTranslation(text, analysis, plan) {
  if (!plan || plan.ok !== true) {
    throw new Error('A successful translation plan is required before writing a fixed PDB');
  }
  const chainColumn = Number.isInteger(plan.chainColumn)
    ? plan.chainColumn
    : analysis && analysis.roles ? analysis.roles.chainColumn : 21;
  const antibodyChains = new Set(plan.antibodyChains || (analysis && analysis.roles ? analysis.roles.antibodyChains : []));
  const translation = plan.translation;
  if (!Array.isArray(translation) || translation.length !== 3 || !translation.every(Number.isFinite)) {
    throw new Error('Translation must be a finite [x, y, z] vector');
  }

  const lines = String(text || '').split(/\r?\n/);
  const fixed = lines.map(line => {
    if (!lineStartsAtomRecord(line)) return line;
    const padded = line.padEnd(80, ' ');
    const chain = padded[chainColumn] || ' ';
    if (!antibodyChains.has(chain)) return line;
    return translateAtomLine(line, translation);
  });
  return fixed.join('\n');
}

function reportableAnalysis(analysis) {
  if (!analysis || typeof analysis !== 'object') return analysis;
  return {
    file: analysis.file,
    status: analysis.status,
    fixable: analysis.fixable,
    target: analysis.target,
    format: analysis.format,
    metadataSource: analysis.metadataSource,
    roles: analysis.roles,
    atoms: analysis.atoms,
    geometry: analysis.geometry,
    issues: analysis.issues
  };
}

module.exports = {
  DEFAULT_THRESHOLDS,
  thresholdsForFormat,
  parseRoleRemarks,
  detectChainColumn,
  parseAtomRecords,
  measureInterfaceGeometry,
  analyzeComplexText,
  createAntibodyTranslationPlan,
  applyAntibodyTranslation,
  reportableAnalysis,
  splitChainList
};
