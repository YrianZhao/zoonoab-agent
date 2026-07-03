const assert = require('assert/strict');
const test = require('node:test');

const {
  extractDesignRequest,
  buildDynamicDemoRoute,
  buildGenericTargetProfile,
  shouldSuppressDesignWorkflow
} = require('../lib/design-routing');

test('extracts a user-specified unknown biological target without replacing it', () => {
  const parsed = extractDesignRequest('设计10个烟草花叶病毒的抗体');

  assert.equal(parsed.isDesignRequest, true);
  assert.equal(parsed.target, '烟草花叶病毒');
  assert.equal(parsed.count, 10);
  assert.equal(parsed.abType, 'Fab');
});

test('builds a dynamic route that keeps unknown targets out of preset target names', () => {
  const route = buildDynamicDemoRoute('设计10个烟草花叶病毒的抗体');

  assert.equal(route.target, '烟草花叶病毒');
  assert.equal(route.count, 10);
  assert.equal(route.abType, 'Fab');
  assert.equal(route.dynamic, true);
  assert.doesNotMatch(JSON.stringify(route), /IL-33|ST2|PD-L1/);
});

test('builds a generic target profile without unrelated preset references', () => {
  const profile = buildGenericTargetProfile('烟草花叶病毒', null, 'Fab');
  const serialized = JSON.stringify(profile);

  assert.equal(profile.targetDisplay, '烟草花叶病毒');
  assert.equal(profile.routeLabel, '烟草花叶病毒');
  assert.match(profile.mechanism, /烟草花叶病毒/);
  assert.match(profile.selectedEpitope, /烟草花叶病毒/);
  assert.doesNotMatch(serialized, /IL-33|ST2|PD-L1|4KC3|CD274/);
});

test('keeps known biomedical targets extractable for preset profiles', () => {
  const parsed = extractDesignRequest('阻断 PD-1/PD-L1 通路，设计 10 个高亲和力 Fab');

  assert.equal(parsed.isDesignRequest, true);
  assert.equal(parsed.target, 'PD-L1');
  assert.equal(parsed.blockTarget, 'PD-1');
  assert.equal(parsed.count, 10);
  assert.equal(parsed.abType, 'Fab');
});

test('suppresses non-biomedical computer virus requests', () => {
  assert.equal(shouldSuppressDesignWorkflow('电脑病毒设计抗体'), true);
  assert.equal(extractDesignRequest('电脑病毒设计抗体').isDesignRequest, false);
});
