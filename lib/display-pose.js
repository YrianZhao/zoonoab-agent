'use strict';

const CHAIN_ID_POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.split('');
const FORMAT_DEFAULTS = Object.freeze({
  Fab: Object.freeze({ minContactPairs: 8, minNearPairs: 40, twistCount: 6 }),
  VHH: Object.freeze({ minContactPairs: 6, minNearPairs: 24, twistCount: 4 })
});
const BASE_GEOMETRY = Object.freeze({
  hardClashDistance: 2.0,
  contactDistance: 4.5,
  nearDistance: 6.0,
  targetMinDistance: 2.35,
  maxMinDistance: 4.5
});

class DisplayPoseError extends Error {
  constructor(code, message, details) {
    super(message);
    this.name = 'DisplayPoseError';
    this.code = code;
    this.details = details || {};
  }
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

function magnitude(vector) {
  return Math.sqrt(dot(vector, vector));
}

function unit(vector, fallback = [1, 0, 0]) {
  const length = magnitude(vector);
  if (length < 1e-9) return fallback.slice();
  return mul(vector, 1 / length);
}

function centerOf(records) {
  if (!records.length) return [0, 0, 0];
  return mul(records.reduce((sum, record) => add(sum, record.xyz), [0, 0, 0]), 1 / records.length);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function roundCoordinate(value) {
  return Math.round(value * 1000) / 1000;
}

function roundVector(vector) {
  return vector.map(roundCoordinate);
}

function matrixApply(matrix, vector) {
  return [
    dot(matrix[0], vector),
    dot(matrix[1], vector),
    dot(matrix[2], vector)
  ];
}

function matrixMultiply(left, right) {
  const columns = [
    [right[0][0], right[1][0], right[2][0]],
    [right[0][1], right[1][1], right[2][1]],
    [right[0][2], right[1][2], right[2][2]]
  ];
  return left.map(row => columns.map(column => dot(row, column)));
}

function axisAngleMatrix(axis, angle) {
  const [x, y, z] = unit(axis);
  const cosine = Math.cos(angle);
  const sine = Math.sin(angle);
  const complement = 1 - cosine;
  return [
    [cosine + x * x * complement, x * y * complement - z * sine, x * z * complement + y * sine],
    [y * x * complement + z * sine, cosine + y * y * complement, y * z * complement - x * sine],
    [z * x * complement - y * sine, z * y * complement + x * sine, cosine + z * z * complement]
  ];
}

function rotationFromTo(from, to) {
  const source = unit(from);
  const target = unit(to);
  const cosine = clamp(dot(source, target), -1, 1);
  if (cosine > 1 - 1e-10) return [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  if (cosine < -1 + 1e-10) {
    const helper = Math.abs(source[0]) < 0.8 ? [1, 0, 0] : [0, 1, 0];
    return axisAngleMatrix(cross(source, helper), Math.PI);
  }
  const axis = cross(source, target);
  return axisAngleMatrix(axis, Math.acos(cosine));
}

function hashSeed(value) {
  const text = String(value == null ? '' : value);
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createRandom(seed) {
  let state = hashSeed(seed) || 0x6d2b79f5;
  return function nextRandom() {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function normalizeChainList(value, label) {
  if (!Array.isArray(value) || !value.length) {
    throw new DisplayPoseError('INVALID_CHAINS', label + ' must contain at least one PDB chain ID');
  }
  const chains = [];
  for (const item of value) {
    const chain = String(item == null ? '' : item).trim();
    if (chain.length > 4) {
      throw new DisplayPoseError('INVALID_CHAINS', label + ' contains a chain ID longer than 4 characters', { chain });
    }
    // For standard PDB format the chain ID is a single character at column 22.
    // Some non-standard or converted files may have longer IDs; we accept up to 4 chars
    // and normalise empty to a single space for column-22 compatibility.
    const normalized = chain || ' ';
    if (!chains.includes(normalized)) chains.push(normalized);
  }
  return chains;
}

function parsePdbRecords(pdbText, requestedChains) {
  const allowed = new Set(requestedChains);
  const records = [];
  let modelSeen = false;
  let inFirstModel = true;
  const lines = String(pdbText || '').split(/\r?\n/);

  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex];
    if (line.startsWith('MODEL')) {
      if (modelSeen) {
        inFirstModel = false;
        continue;
      }
      modelSeen = true;
      inFirstModel = true;
      continue;
    }
    if (line.startsWith('ENDMDL')) {
      if (modelSeen && inFirstModel) inFirstModel = false;
      continue;
    }
    if (!inFirstModel || (!line.startsWith('ATOM  ') && !line.startsWith('HETATM'))) continue;

    const padded = line.padEnd(80, ' ');
    const chain = padded[21] || ' ';
    if (!allowed.has(chain)) continue;
    const xyz = [
      Number.parseFloat(padded.slice(30, 38)),
      Number.parseFloat(padded.slice(38, 46)),
      Number.parseFloat(padded.slice(46, 54))
    ];
    if (!xyz.every(Number.isFinite)) continue;
    const atomName = padded.slice(12, 16).trim();
    const element = padded.slice(76, 78).trim().toUpperCase();
    const residueKey = chain + '|' + padded.slice(22, 27);
    records.push({
      line: padded,
      lineIndex,
      recordName: padded.slice(0, 6).trim(),
      chain,
      xyz,
      atomName,
      residueKey,
      isHeavy: element ? element !== 'H' && element !== 'D' : !/^\d*[HD]/i.test(atomName)
    });
  }
  return records;
}

function validateSelectedChains(records, chains, label) {
  const present = new Set(records.map(record => record.chain));
  const missing = chains.filter(chain => !present.has(chain));
  if (missing.length) {
    throw new DisplayPoseError('MISSING_CHAIN', label + ' PDB is missing one or more requested chains', {
      missingChains: missing.map(chain => chain === ' ' ? '(blank)' : chain)
    });
  }
}

function isUsableOutputChain(chain) {
  return chain.length === 1 && chain !== ' ' && CHAIN_ID_POOL.includes(chain);
}

function allocateChainMappings(antigenChains, antibodyChains, format) {
  const used = new Set();
  const antigen = {};
  const antibody = {};

  for (const source of antigenChains) {
    let output = isUsableOutputChain(source) && !used.has(source) ? source : null;
    if (!output) output = CHAIN_ID_POOL.find(chain => !used.has(chain));
    if (!output) throw new DisplayPoseError('CHAIN_IDS_EXHAUSTED', 'No PDB chain IDs remain for the antigen');
    antigen[source] = output;
    used.add(output);
  }

  const preferred = format === 'Fab'
    ? ['H', 'L', 'B', 'C', ...CHAIN_ID_POOL]
    : ['V', 'B', 'H', ...CHAIN_ID_POOL];
  for (const source of antibodyChains) {
    let output = isUsableOutputChain(source) && !used.has(source) ? source : null;
    if (!output) output = preferred.find(chain => !used.has(chain));
    if (!output) throw new DisplayPoseError('CHAIN_IDS_EXHAUSTED', 'No PDB chain IDs remain for the antibody scaffold');
    antibody[source] = output;
    used.add(output);
  }

  return { antigen, antibody };
}

function firstResidueTip(scaffoldRecords, antibodyChains) {
  const selectedResidues = new Set();
  for (const chain of antibodyChains) {
    const residueKeys = [];
    for (const record of scaffoldRecords) {
      if (record.chain === chain && !residueKeys.includes(record.residueKey)) residueKeys.push(record.residueKey);
    }
    const take = Math.min(12, Math.max(1, Math.ceil(residueKeys.length * 0.15)));
    residueKeys.slice(0, take).forEach(key => selectedResidues.add(key));
  }
  const tipRecords = scaffoldRecords.filter(record => record.isHeavy && selectedResidues.has(record.residueKey));
  const heavyRecords = scaffoldRecords.filter(record => record.isHeavy);
  const tipCenter = centerOf(tipRecords.length ? tipRecords : heavyRecords.slice(0, Math.max(1, Math.ceil(heavyRecords.length * 0.1))));
  const scaffoldCenter = centerOf(heavyRecords);
  let centerToTip = sub(tipCenter, scaffoldCenter);

  if (magnitude(centerToTip) < 1) {
    centerToTip = principalAxis(heavyRecords);
    if (dot(centerToTip, sub(tipCenter, scaffoldCenter)) < 0) centerToTip = mul(centerToTip, -1);
  }
  if (magnitude(centerToTip) < 0.5) {
    throw new DisplayPoseError('SCAFFOLD_BINDING_END_UNRESOLVED', 'The antibody binding end could not be inferred from its N-terminal residues');
  }

  const anchorCandidates = tipRecords.length ? tipRecords : heavyRecords;
  let anchor = anchorCandidates[0];
  let anchorDistance = Infinity;
  for (const record of anchorCandidates) {
    const distance = dot(sub(record.xyz, tipCenter), sub(record.xyz, tipCenter));
    if (distance < anchorDistance) {
      anchor = record;
      anchorDistance = distance;
    }
  }
  return { centerToTip: unit(centerToTip), anchor, tipCenter };
}

function principalAxis(records) {
  if (!records.length) return [1, 0, 0];
  const center = centerOf(records);
  const covariance = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (const record of records) {
    const relative = sub(record.xyz, center);
    for (let row = 0; row < 3; row += 1) {
      for (let column = 0; column < 3; column += 1) {
        covariance[row][column] += relative[row] * relative[column];
      }
    }
  }
  let axis = [1, 0.7, 0.3];
  for (let iteration = 0; iteration < 20; iteration += 1) axis = unit(matrixApply(covariance, axis));
  return axis;
}

function buildSurfaceCandidates(antigenRecords, count, random, restrictChains) {
  // When restrictChains is provided, only sample surface points from those chains.
  // The grid and output still include ALL antigen atoms; only the surface
  // sampling anchors are limited to the primary protomer to avoid placing
  // the antibody on a symmetry-related copy in multimeric antigens.
  const surfaceRecords = restrictChains && restrictChains.size > 0
    ? antigenRecords.filter(record => restrictChains.has(record.chain))
    : antigenRecords;
  const surfaceSource = surfaceRecords.length >= 3 ? surfaceRecords : antigenRecords;
  const center = centerOf(surfaceSource);
  const phase = random() * Math.PI * 2;
  const tiltAxis = unit([random() - 0.5, random() - 0.5, random() - 0.5], [0, 1, 0]);
  const tilt = axisAngleMatrix(tiltAxis, random() * Math.PI * 2);
  const candidates = [];
  const seenAnchors = new Set();
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let index = 0; index < count; index += 1) {
    const z = 1 - 2 * (index + 0.5) / count;
    const radial = Math.sqrt(Math.max(0, 1 - z * z));
    const theta = phase + goldenAngle * index;
    const direction = unit(matrixApply(tilt, [Math.cos(theta) * radial, Math.sin(theta) * radial, z]));
    let anchor = surfaceSource[0];
    let support = -Infinity;
    for (const record of surfaceSource) {
      const projection = dot(sub(record.xyz, center), direction);
      if (projection > support) {
        support = projection;
        anchor = record;
      }
    }
    const key = anchor.lineIndex + '|' + anchor.chain;
    if (!seenAnchors.has(key)) {
      seenAnchors.add(key);
      candidates.push({ direction, anchor, support });
    }
  }
  return candidates;
}

function geometryOptions(format, overrides) {
  const defaults = FORMAT_DEFAULTS[format];
  const input = overrides && typeof overrides === 'object' ? overrides : {};
  return {
    hardClashDistance: BASE_GEOMETRY.hardClashDistance,
    contactDistance: BASE_GEOMETRY.contactDistance,
    nearDistance: BASE_GEOMETRY.nearDistance,
    targetMinDistance: clamp(Number(input.targetMinDistance) || BASE_GEOMETRY.targetMinDistance, 2.15, 3.2),
    maxMinDistance: Math.min(BASE_GEOMETRY.maxMinDistance, Number(input.maxMinDistance) || BASE_GEOMETRY.maxMinDistance),
    minContactPairs: Math.max(defaults.minContactPairs, Math.floor(Number(input.minContactPairs) || defaults.minContactPairs)),
    minNearPairs: Math.max(defaults.minNearPairs, Math.floor(Number(input.minNearPairs) || defaults.minNearPairs))
  };
}

function gridKey(x, y, z) {
  return x + ',' + y + ',' + z;
}

function buildSpatialGrid(records, cellSize) {
  const cells = new Map();
  for (const record of records) {
    const cell = record.xyz.map(value => Math.floor(value / cellSize));
    const key = gridKey(cell[0], cell[1], cell[2]);
    if (!cells.has(key)) cells.set(key, []);
    cells.get(key).push(record);
  }
  return { cells, cellSize };
}

function measureWithGrid(antibodyRecords, grid, thresholds) {
  const nearSq = thresholds.nearDistance ** 2;
  const contactSq = thresholds.contactDistance ** 2;
  const clashSq = thresholds.hardClashDistance ** 2;
  let minDistanceSq = Infinity;
  let contactPairs = 0;
  let nearPairs = 0;
  let hardClashes = 0;

  for (const antibody of antibodyRecords) {
    const cell = antibody.xyz.map(value => Math.floor(value / grid.cellSize));
    for (let dx = -1; dx <= 1; dx += 1) {
      for (let dy = -1; dy <= 1; dy += 1) {
        for (let dz = -1; dz <= 1; dz += 1) {
          const antigenBucket = grid.cells.get(gridKey(cell[0] + dx, cell[1] + dy, cell[2] + dz));
          if (!antigenBucket) continue;
          for (const antigen of antigenBucket) {
            const delta = sub(antigen.xyz, antibody.xyz);
            const distanceSq = dot(delta, delta);
            if (distanceSq > nearSq) continue;
            if (distanceSq < minDistanceSq) minDistanceSq = distanceSq;
            nearPairs += 1;
            if (distanceSq <= contactSq) contactPairs += 1;
            if (distanceSq < clashSq) hardClashes += 1;
          }
        }
      }
    }
  }

  return {
    minDistance: Number.isFinite(minDistanceSq) ? Math.sqrt(minDistanceSq) : Infinity,
    contactPairs,
    nearPairs,
    hardClashes
  };
}

function measureInterfaceGeometry(antigenRecords, antibodyRecords, options = {}) {
  const thresholds = {
    hardClashDistance: Number(options.hardClashDistance) || BASE_GEOMETRY.hardClashDistance,
    contactDistance: Number(options.contactDistance) || BASE_GEOMETRY.contactDistance,
    nearDistance: Number(options.nearDistance) || BASE_GEOMETRY.nearDistance
  };
  const antigen = antigenRecords.filter(record => record.isHeavy !== false);
  const antibody = antibodyRecords.filter(record => record.isHeavy !== false);
  return measureWithGrid(antibody, buildSpatialGrid(antigen, thresholds.nearDistance), thresholds);
}

function transformRecords(records, rotation, origin, placement) {
  return records.map(record => ({
    ...record,
    xyz: roundVector(add(matrixApply(rotation, sub(record.xyz, origin)), placement))
  }));
}

function findPlacement(orientedHeavy, antigenAnchor, direction, grid, thresholds) {
  let minProjection = Infinity;
  for (const record of orientedHeavy) minProjection = Math.min(minProjection, dot(record.xyz, direction));
  let far = thresholds.nearDistance + 3 - minProjection;
  let near = 0;

  function atomsNearSupportingPlane(distance) {
    const placement = add(antigenAnchor.xyz, mul(direction, distance));
    const atoms = [];
    for (const record of orientedHeavy) {
      // The selected antigen atom defines a supporting plane: antigen atoms all
      // lie behind it, so scaffold atoms farther than 6 A in the normal
      // direction cannot contribute a contact or a clash.
      if (distance + dot(record.xyz, direction) > thresholds.nearDistance) continue;
      atoms.push({ ...record, xyz: roundVector(add(record.xyz, placement)) });
    }
    return { placement, atoms };
  }

  for (let iteration = 0; iteration < 15; iteration += 1) {
    const distance = (far + near) / 2;
    const moved = atomsNearSupportingPlane(distance);
    const geometry = measureWithGrid(moved.atoms, grid, thresholds);
    if (geometry.minDistance <= thresholds.targetMinDistance) near = distance;
    else far = distance;
  }

  const moved = atomsNearSupportingPlane(near);
  return { placement: moved.placement, atoms: moved.atoms, geometry: measureWithGrid(moved.atoms, grid, thresholds) };
}

function poseIsAcceptable(geometry, thresholds) {
  return geometry.hardClashes === 0 &&
    geometry.minDistance >= thresholds.hardClashDistance &&
    geometry.minDistance <= thresholds.maxMinDistance &&
    geometry.contactPairs >= thresholds.minContactPairs &&
    geometry.nearPairs >= thresholds.minNearPairs;
}

function comparePoses(left, right) {
  if (!right) return 1;
  if (left.acceptable !== right.acceptable) return left.acceptable ? 1 : -1;
  if (left.geometry.hardClashes !== right.geometry.hardClashes) return right.geometry.hardClashes - left.geometry.hardClashes;
  if (left.geometry.contactPairs !== right.geometry.contactPairs) return left.geometry.contactPairs - right.geometry.contactPairs;
  if (left.geometry.nearPairs !== right.geometry.nearPairs) return left.geometry.nearPairs - right.geometry.nearPairs;
  const leftGap = Math.abs(left.geometry.minDistance - BASE_GEOMETRY.targetMinDistance);
  const rightGap = Math.abs(right.geometry.minDistance - BASE_GEOMETRY.targetMinDistance);
  return rightGap - leftGap;
}

function cleanRemark(value, fallback) {
  const cleaned = String(value == null ? '' : value)
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return (cleaned || fallback).slice(0, 240);
}

function formatCoordinate(value) {
  if (!Number.isFinite(value) || value <= -1000 || value >= 10000) {
    throw new DisplayPoseError('COORDINATE_RANGE', 'A generated antibody coordinate exceeds the classic PDB field range');
  }
  return value.toFixed(3).padStart(8, ' ');
}

function formatRecordLine(record, serial, chain, xyz) {
  const line = record.line.padEnd(80, ' ');
  const serialText = String(serial).padStart(5, ' ');
  const coordinateText = xyz
    ? formatCoordinate(xyz[0]) + formatCoordinate(xyz[1]) + formatCoordinate(xyz[2])
    : line.slice(30, 54);
  return (line.slice(0, 6) + serialText + line.slice(11, 21) + chain + line.slice(22, 30) + coordinateText + line.slice(54)).trimEnd();
}

function buildCombinedPdb(input) {
  const {
    antigenRecords,
    antibodyRecords,
    transformedAntibodyRecords,
    chainMappings,
    format,
    seed,
    candidateIndex,
    sourceMetadata,
    geometry
  } = input;
  if (antigenRecords.length + antibodyRecords.length > 99999) {
    throw new DisplayPoseError('TOO_MANY_ATOMS', 'The combined display structure exceeds the classic PDB atom serial limit');
  }

  const antigenSource = cleanRemark(sourceMetadata.antigenSource || sourceMetadata.antigen || sourceMetadata.structureSource, 'provided antigen PDB');
  const scaffoldSource = cleanRemark(sourceMetadata.scaffoldSource || sourceMetadata.scaffold, 'local antibody display scaffold');
  const target = cleanRemark(sourceMetadata.target, 'resolved target');
  const antigenChains = Object.values(chainMappings.antigen);
  const antibodyChains = Object.values(chainMappings.antibody);
  const lines = [
    'HEADER    ZOONOAB REPRESENTATIVE DISPLAY POSE',
    'REMARK 900 DISPLAY_POSE: REPRESENTATIVE_GEOMETRIC_PLACEMENT',
    'REMARK 901 TARGET: ' + target,
    'REMARK 902 FORMAT: ' + format,
    'REMARK 903 ANTIGEN SOURCE: ' + antigenSource,
    'REMARK 903 SCAFFOLD SOURCE: ' + scaffoldSource,
    'REMARK 904 ANTIGEN CHAINS: ' + antigenChains.join(','),
    'REMARK 905 ANTIBODY CHAINS: ' + antibodyChains.join(','),
    'REMARK 906 DISPLAY POSE ONLY; ANTIBODY ORIENTATION IS GEOMETRICALLY GENERATED',
    'REMARK 907 GEOMETRY MIN_DISTANCE_A: ' + geometry.minDistance.toFixed(3) +
      ' CONTACTS_4_5A: ' + geometry.contactPairs +
      ' CONTACTS_6_0A: ' + geometry.nearPairs +
      ' HARD_CLASHES_LT_2_0A: ' + geometry.hardClashes,
    'REMARK 908 DISPLAY_POSE SEED: ' + cleanRemark(seed, 'default') + ' CANDIDATE_INDEX: ' + candidateIndex,
    'REMARK 909 NOT AN EXPERIMENTAL COMPLEX OR A PREDICTED AFFINITY CLAIM',
    'MODEL        1'
  ];

  let serial = 1;
  for (const record of antigenRecords) {
    lines.push(formatRecordLine(record, serial, chainMappings.antigen[record.chain], null));
    serial += 1;
  }
  lines.push('TER');
  for (let index = 0; index < antibodyRecords.length; index += 1) {
    const source = antibodyRecords[index];
    const transformed = transformedAntibodyRecords[index];
    lines.push(formatRecordLine(source, serial, chainMappings.antibody[source.chain], transformed.xyz));
    serial += 1;
  }
  lines.push('TER', 'ENDMDL', 'END', '');
  return lines.join('\n');
}

function failure(code, message, details) {
  return {
    ok: false,
    generated: false,
    pdbText: null,
    combinedPdb: null,
    error: { code, message, details: details || {} }
  };
}

function normalizeFormat(value) {
  const normalized = String(value || '').trim().toUpperCase();
  if (normalized === 'FAB') return 'Fab';
  if (normalized === 'VHH') return 'VHH';
  throw new DisplayPoseError('INVALID_FORMAT', 'Antibody format must be Fab or VHH');
}

function generateDisplayPose(options = {}) {
  try {
    const format = normalizeFormat(options.antibodyFormat || options.format);
    const antigenChains = normalizeChainList(options.antigenChains, 'antigenChains');
    const scaffoldChains = normalizeChainList(options.scaffoldAntibodyChains || options.antibodyChains, 'scaffoldAntibodyChains');
    if (format === 'Fab' && scaffoldChains.length < 2) {
      throw new DisplayPoseError('INVALID_SCAFFOLD', 'A Fab display scaffold must include at least two antibody chains');
    }
    if (format === 'VHH' && scaffoldChains.length !== 1) {
      throw new DisplayPoseError('INVALID_SCAFFOLD', 'A VHH display scaffold must include exactly one antibody chain');
    }

    const antigenRecords = parsePdbRecords(options.antigenPdbText, antigenChains);
    const antibodyRecords = parsePdbRecords(options.scaffoldPdbText, scaffoldChains);
    validateSelectedChains(antigenRecords, antigenChains, 'Antigen');
    validateSelectedChains(antibodyRecords, scaffoldChains, 'Antibody scaffold');
    const antigenHeavy = antigenRecords.filter(record => record.isHeavy);
    const antibodyHeavy = antibodyRecords.filter(record => record.isHeavy);
    if (antigenHeavy.length < 3 || antibodyHeavy.length < 3) {
      throw new DisplayPoseError('INSUFFICIENT_ATOMS', 'Antigen and antibody scaffold each require at least three heavy atoms');
    }

    const seed = options.seed == null ? 'display-pose' : options.seed;
    const candidateIndex = Math.max(1, Math.floor(Number(options.candidateIndex) || 1));
    const random = createRandom(String(seed) + '|' + candidateIndex + '|' + format);
    const thresholds = geometryOptions(format, options.geometry);
    const bindingEnd = firstResidueTip(antibodyRecords, scaffoldChains);
    const surfaceCount = clamp(Math.floor(Number(options.surfaceSampleCount) || 12), 8, 300);
    // Determine which chains to restrict surface sampling to (primary protomer)
    let surfaceRestrictSet = null;
    if (Array.isArray(options.surfaceRestrictChains) && options.surfaceRestrictChains.length > 0) {
      surfaceRestrictSet = new Set(options.surfaceRestrictChains);
    } else if (antigenChains.length >= 3) {
      // Auto-detect: if antigen has 3+ chains of similar size, restrict to first 1-2
      const chainSizes = {};
      for (const record of antigenHeavy) {
        chainSizes[record.chain] = (chainSizes[record.chain] || 0) + 1;
      }
      const sizes = Object.values(chainSizes);
      if (sizes.length >= 3) {
        const maxSize = Math.max(...sizes);
        const similarCount = sizes.filter(s => s >= maxSize * 0.6).length;
        if (similarCount >= 3) {
          // This is likely a symmetric multimer; restrict to first chain
          surfaceRestrictSet = new Set([antigenChains[0]]);
        }
      }
    }
    const surfaceCandidates = buildSurfaceCandidates(antigenHeavy, surfaceCount, random, surfaceRestrictSet);
    const grid = buildSpatialGrid(antigenHeavy, thresholds.nearDistance);
    const twistCount = FORMAT_DEFAULTS[format].twistCount;
    const twistOffset = random() * Math.PI * 2;
    let best = null;

    // Surface partitioning: restrict which surface candidates are tried,
    // forcing diversity when generating multiple poses for the same antigen.
    const surfaceStart = Math.max(0, Math.floor(Number(options.surfaceStart) || 0));
    const surfaceLimit = Math.max(1, Math.floor(Number(options.surfaceLimit) || surfaceCandidates.length));
    const surfaceEnd = Math.min(surfaceCandidates.length, surfaceStart + surfaceLimit);

    for (let surfaceIndex = surfaceStart; surfaceIndex < surfaceEnd; surfaceIndex += 1) {
      const surface = surfaceCandidates[surfaceIndex];
      const alignment = rotationFromTo(bindingEnd.centerToTip, mul(surface.direction, -1));
      for (let twistIndex = 0; twistIndex < twistCount; twistIndex += 1) {
        const twistAngle = twistOffset + twistIndex * Math.PI * 2 / twistCount;
        const rotation = matrixMultiply(axisAngleMatrix(surface.direction, twistAngle), alignment);
        const orientedHeavy = antibodyHeavy.map(record => ({
          ...record,
          xyz: matrixApply(rotation, sub(record.xyz, bindingEnd.anchor.xyz))
        }));
        const placement = findPlacement(orientedHeavy, surface.anchor, surface.direction, grid, thresholds);
        const pose = {
          acceptable: poseIsAcceptable(placement.geometry, thresholds),
          geometry: placement.geometry,
          rotation,
          placement: placement.placement,
          direction: surface.direction,
          antigenAnchor: surface.anchor,
          surfaceIndex,
          twistIndex,
          twistAngle
        };
        if (comparePoses(pose, best) > 0) best = pose;
      }
    }

    if (!best || !best.acceptable) {
      return failure('NO_ACCEPTABLE_POSE', 'No rigid Fab/VHH display pose satisfied the interface geometry thresholds', {
        bestGeometry: best ? best.geometry : null,
        thresholds
      });
    }

    const transformedAntibodyRecords = transformRecords(
      antibodyRecords,
      best.rotation,
      bindingEnd.anchor.xyz,
      best.placement
    );
    const finalGeometry = measureWithGrid(
      transformedAntibodyRecords.filter(record => record.isHeavy),
      grid,
      thresholds
    );
    if (!poseIsAcceptable(finalGeometry, thresholds)) {
      return failure('ROUNDED_POSE_REJECTED', 'The PDB-rounded display pose did not retain acceptable interface geometry', {
        geometry: finalGeometry,
        thresholds
      });
    }

    const chainMappings = allocateChainMappings(antigenChains, scaffoldChains, format);
    const sourceMetadata = options.sourceMetadata && typeof options.sourceMetadata === 'object'
      ? { ...options.sourceMetadata }
      : {};
    const pdbText = buildCombinedPdb({
      antigenRecords,
      antibodyRecords,
      transformedAntibodyRecords,
      chainMappings,
      format,
      seed,
      candidateIndex,
      sourceMetadata,
      geometry: finalGeometry
    });
    const rotation = best.rotation.map(row => row.map(value => Number(value.toFixed(9))));
    const affineTranslation = sub(best.placement, matrixApply(best.rotation, bindingEnd.anchor.xyz));
    const antigenOutputChains = antigenChains.map(chain => chainMappings.antigen[chain]);
    const antibodyOutputChains = scaffoldChains.map(chain => chainMappings.antibody[chain]);

    return {
      ok: true,
      generated: true,
      pdbText,
      combinedPdb: pdbText,
      antigenChains: antigenOutputChains,
      antibodyChains: antibodyOutputChains,
      chainMappings,
      pose: {
        type: 'DISPLAY_POSE',
        classification: 'representative_geometric_placement',
        format,
        seed: String(seed),
        candidateIndex,
        antigenSurfaceDirection: best.direction.map(value => Number(value.toFixed(9))),
        antigenAnchor: {
          sourceChain: best.antigenAnchor.chain,
          outputChain: chainMappings.antigen[best.antigenAnchor.chain],
          coordinate: best.antigenAnchor.xyz.slice()
        },
        antibodyBindingEnd: 'N-terminal variable-domain end',
        rotation,
        translation: affineTranslation.map(value => Number(value.toFixed(9))),
        geometry: {
          minDistance: Number(finalGeometry.minDistance.toFixed(3)),
          contactPairs4_5A: finalGeometry.contactPairs,
          nearPairs6A: finalGeometry.nearPairs,
          hardClashesBelow2A: finalGeometry.hardClashes,
          thresholds: { ...thresholds }
        },
        sources: sourceMetadata,
        disclaimer: 'Representative display pose; not an experimental complex or affinity prediction.'
      }
    };
  } catch (error) {
    if (error instanceof DisplayPoseError) return failure(error.code, error.message, error.details);
    return failure('DISPLAY_POSE_ERROR', error && error.message ? error.message : 'Unexpected display pose error');
  }
}

module.exports = {
  BASE_GEOMETRY,
  FORMAT_DEFAULTS,
  generateDisplayPose,
  createDisplayPose: generateDisplayPose,
  measureInterfaceGeometry,
  parsePdbRecords
};
