const assert = require('assert/strict');
const test = require('node:test');

const {
  extractDesignRequest,
  extractDiseaseIndication,
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

test('understands shorthand monoclonal antibody sequence requests', () => {
  const parsed = extractDesignRequest('设计 10 个具有结合活性的流感 NA 单抗序列');

  assert.equal(parsed.isDesignRequest, true);
  assert.equal(parsed.target, 'Influenza NA');
  assert.equal(parsed.count, 10);
  assert.equal(parsed.abType, 'mAb');
});

test('suppresses non-biomedical computer virus requests', () => {
  assert.equal(shouldSuppressDesignWorkflow('电脑病毒设计抗体'), true);
  assert.equal(extractDesignRequest('电脑病毒设计抗体').isDesignRequest, false);
});

test('cleans disease-area wording before using it as a dynamic target', () => {
  const obesity = extractDesignRequest('设计一个针对肥胖的抗体');
  assert.equal(obesity.isDesignRequest, true);
  assert.equal(obesity.target, '肥胖');
  assert.equal(obesity.count, 1);
  assert.equal(obesity.hasExplicitTarget, true);
  assert.equal(buildDynamicDemoRoute('设计一个针对肥胖的抗体').target, '肥胖');

  const diabetes = extractDesignRequest('帮我设计10个针对糖尿病的抗体');
  assert.equal(diabetes.isDesignRequest, true);
  assert.equal(diabetes.target, '糖尿病');
  assert.equal(diabetes.hasExplicitTarget, true);
});

test('keeps explicit targets inside disease-area requests', () => {
  const parsed = extractDesignRequest('肥胖方向，靶点 GIPR，设计10个抗体');

  assert.equal(parsed.isDesignRequest, true);
  assert.equal(parsed.target, 'GIPR');
  assert.equal(parsed.count, 10);
  assert.equal(parsed.hasExplicitTarget, true);
});

test('cleans spoken target wording that places the design count after the pathogen name', () => {
  const parsed = extractDesignRequest('针对蓝耳病毒设计10个抗体');

  assert.equal(parsed.isDesignRequest, true);
  assert.equal(parsed.target, '蓝耳病毒');
  assert.equal(parsed.count, 10);
});

test('understands spoken Chinese candidate counts for one and ten antibodies', () => {
  const one = extractDesignRequest('针对 PD-L1 生成一支抗体');
  assert.equal(one.isDesignRequest, true);
  assert.equal(one.count, 1);
  assert.equal(buildDynamicDemoRoute('针对流感 HA 血凝素设计一个抗体').count, 1);

  const ten = extractDesignRequest('针对 HER2 生成十个候选抗体');
  assert.equal(ten.isDesignRequest, true);
  assert.equal(ten.count, 10);
});

test('treats allergic asthma ten-candidate wording as a disease indication, not a numeric target', () => {
  const parsed = extractDesignRequest('帮我为过敏性哮喘设计十个抗体分子');

  assert.equal(parsed.isDesignRequest, true);
  assert.equal(parsed.count, 10);
  assert.equal(parsed.target, '过敏性哮喘');
  assert.equal(extractDiseaseIndication('帮我为过敏性哮喘设计十个抗体分子'), '过敏性哮喘');
});

test('treats drug molecule wording as a molecular design request', () => {
  const targetDrug = extractDesignRequest('帮我设计10个针对流感 NA 的药物分子');
  assert.equal(targetDrug.isDesignRequest, true);
  assert.equal(targetDrug.target, 'Influenza NA');
  assert.equal(targetDrug.count, 10);

  const diseaseDrug = extractDesignRequest('帮我为过敏性哮喘设计一款药物');
  assert.equal(diseaseDrug.isDesignRequest, true);
  assert.equal(diseaseDrug.target, '过敏性哮喘');
  assert.equal(diseaseDrug.count, 1);
  assert.equal(extractDiseaseIndication('帮我为过敏性哮喘设计一款药物'), '过敏性哮喘');
});
