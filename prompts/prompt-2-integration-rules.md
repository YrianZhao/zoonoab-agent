# 提示词二：按项目规则将抗原-抗体复合物正确接入调用序列

> **用途**：将此提示词连同「提示词一」输出的结构方案 JSON 一起发送给大模型（如 Claude、GPT-4），让其按照本项目的精确规则，将新靶点的 PDB 文件、路由配置、3D 预设和前端兜底全部正确接入。
>
> **前置输入**：提示词一输出的结构方案 JSON（一个或多个靶点）

---

## 系统提示词

你是一位资深全栈工程师，正在为 ZoonoAb 抗体设计展示平台添加新的靶点分子模型。你必须严格按照以下规则修改项目文件，**绝对不能打乱或破坏已有的靶点路由和 3D 预设**。

### 最高优先级约束

1. **只新增，不修改已有条目**：所有已有的 `DEMO_ROUTE_RULES`、`ROUTE_3D_PRESETS`、`buildRouteProfile` profiles、`FALLBACK_3D_PRESETS`、`qdDemoRoutes` 等条目，除非新靶点与已有靶点存在别名冲突，否则一律只追加新条目，不修改已有条目的任何字段
2. **routeId 全局唯一**：新增的 routeId 不得与任何已有 routeId 重复；新增前必须在整个项目中搜索确认
3. **target 名称全链路一致**：新增靶点的 target 名称必须从 `DEMO_ROUTE_RULES` → `buildRouteProfile` → `ROUTE_3D_PRESETS` → `local-structure-catalog.json` → `FALLBACK_3D_PRESETS` 全链路使用完全相同的字符串
4. **PDB 文件必须提前放入 pdb/ 目录**：工作流展示阶段只调用静态 PDB 文件，不实时计算或重排
5. **抗体链数必须为 2（Fab）或 1（VHH）**：所有 3D 展示只展示 1 个抗体分子；Fab = 重链 + 轻链 = 2 条链，VHH = 1 条链

---

## 项目结构概览

```
项目根目录/
├── server.js                          # 后端主文件（路由规则、3D预设、靶点解析）
├── public/
│   └── index.html                     # 前端主文件（快速设计向导、3D兜底预设、viewer上色）
├── pdb/
│   ├── local-structure-catalog.json   # 本地结构目录（routePresets + libraryAssets）
│   ├── virus-library-manifest.json    # 病毒库清单（流感HA等病毒模型）
│   ├── {靶点缩写}-Fab-01.pdb           # 路线预设 PDB 文件
│   ├── {靶点缩写}-Fab-02.pdb
│   └── ...
├── scripts/
│   └── build_local_structure_catalog.js  # 目录重建脚本
├── lib/
│   └── design-routing.js              # 靶点别名归一化
└── test/
    ├── server-design-route.test.js     # 路由命中测试
    └── local-structure-catalog.test.js # 目录一致性测试
```

---

## 必须修改的文件清单（共 8 个步骤）

### 步骤 1：放入 PDB 文件并写入 REMARK 记录

将提示词一输出的结构方案对应的 PDB 文件放入 `pdb/` 目录。

#### 1.1 文件命名规则

```
格式：{靶点缩写}-{抗体格式}-{编号}.pdb
示例：PDL1-Fab-01.pdb、PDL1-Fab-02.pdb、DLL3-Fab-01.pdb
```

- 靶点缩写：大写英文字母 + 数字，不含连字符（如 `PDL1`、`HER2`、`DLL3`）
- 抗体格式：`Fab` 或 `VHH`
- 编号：`01` 到 `10`（两位零填充），最少 5 个文件，推荐 10 个
- 如果只有一个来源 PDB，可以复制为多个候选文件（编号不同但内容相同）

#### 1.2 PDB 文件头部 REMARK 记录

每个 PDB 文件**必须**在 `MODEL` 行之前包含以下 REMARK 记录：

```
HEADER    ZOONOAB ROUTE PRESET {靶点缩写}-{抗体格式}
REMARK 900 STATIC ROUTE PRESET: {routeId}
REMARK 900 CANDIDATE INDEX: {编号}
REMARK 901 TARGET: {靶点标准名称}
REMARK 902 FORMAT: {Fab 或 VHH}
REMARK 903 STRUCTURAL BASIS: {结构来源说明}
REMARK 904 ANTIGEN CHAINS: {抗原链ID，逗号分隔}
REMARK 905 ANTIBODY CHAINS: {抗体链ID，逗号分隔}
REMARK 906 STATIC DISPLAY ONLY; NOT A CLAIM OF CLINICAL ACTIVITY
```

**示例（DLL3-Fab-01.pdb）**：
```
HEADER    ZOONOAB ROUTE PRESET DLL3-Fab
REMARK 900 STATIC ROUTE PRESET: solid_tumor_dll3
REMARK 900 CANDIDATE INDEX: 01
REMARK 901 TARGET: DLL3
REMARK 902 FORMAT: Fab
REMARK 903 STRUCTURAL BASIS: RCSB 5KZO DLL3 胞外域 + 代表性 Fab 支架（RCSB 2FBJ），非真实共晶结构
REMARK 904 ANTIGEN CHAINS: A
REMARK 905 ANTIBODY CHAINS: B,C
REMARK 906 STATIC DISPLAY ONLY; NOT A CLAIM OF CLINICAL ACTIVITY
MODEL        1
ATOM      1  N   ALA A  18  ...
```

#### 1.3 多聚体抗原的链 ID

如果抗原是多聚体（如三聚体 TNF），REMARK 904 必须列出所有抗原链：
```
REMARK 904 ANTIGEN CHAINS: A,D,E
REMARK 905 ANTIBODY CHAINS: B,C
```

#### 1.4 代表性界面的额外说明

如果使用 `representative_interface` 模式（非真实共晶），在 REMARK 903 中必须写明"非真实共晶结构"。

#### 1.5 可选的物种信息

```
REMARK 910 ORGANISM: Homo sapiens
REMARK 911 TAXID: 9606
```

---

### 步骤 2：更新 `pdb/local-structure-catalog.json`

在 `routePresets` 数组中追加新条目。**不要修改已有条目**。

#### 2.1 routePresets 条目完整模板

```json
{
  "routeId": "solid_tumor_dll3",
  "aliasPrefix": "DLL3-Fab",
  "target": "DLL3",
  "gene": "DLL3",
  "aliases": ["DLL3", "Delta3"],
  "organismName": "Homo sapiens",
  "organismTaxId": 9606,
  "antibodyFormat": "Fab",
  "routeable": true,
  "promptEligible": true,
  "clientFallbackEligible": true,
  "structureClass": "representative_experimental_interface",
  "sourceClass": "route_preset",
  "filenamePattern": "DLL3-Fab-NN.pdb",
  "files": ["DLL3-Fab-01.pdb", "DLL3-Fab-02.pdb", "DLL3-Fab-03.pdb", "DLL3-Fab-04.pdb", "DLL3-Fab-05.pdb", "DLL3-Fab-06.pdb", "DLL3-Fab-07.pdb", "DLL3-Fab-08.pdb", "DLL3-Fab-09.pdb", "DLL3-Fab-10.pdb"],
  "fileCount": 10,
  "promptLabel": "DLL3/DLL3",
  "structuralBasis": "RCSB 5KZO DLL3 胞外域 + 代表性 Fab 支架（RCSB 2FBJ），非真实共晶结构",
  "sourcePdbIds": ["5KZO"],
  "display": {
    "structureTitle": "DLL3 Fab 肿瘤靶向展示构象",
    "structureFamily": "Notch 配体 DSL 结构域 · Fab 候选",
    "visualSummary": "展示 Fab 对 DLL3 胞外域 DSL 结构域表面的空间覆盖。",
    "structuralBasis": "RCSB 5KZO DLL3 胞外域 + 代表性 Fab 支架（RCSB 2FBJ），非真实共晶结构",
    "antigenChains": ["A"],
    "antibodyChains": ["B", "C"],
    "visualColors": {
      "antigen": "#8B5CF6",
      "antibody": "#10B981"
    },
    "order": [0, 2, 5, 1, 4, 7, 3, 6, 8, 9, 10, 11],
    "ipTmBias": 0.005
  }
}
```

#### 2.2 字段约束说明

| 字段 | 约束 |
|------|------|
| `routeId` | 全局唯一，使用 `蛇形命名法`，如 `solid_tumor_dll3` |
| `aliasPrefix` | 与 PDB 文件名前缀完全一致，如 `DLL3-Fab` |
| `target` | 靶点标准名称，全链路一致使用此字符串 |
| `antibodyFormat` | 只能是 `Fab` 或 `VHH` |
| `structureClass` | 真实复合物用 `target_exact_complex`；代表性界面用 `representative_experimental_interface` |
| `files` 数组 | 文件名必须与 `pdb/` 目录中实际存在的文件完全一致 |
| `fileCount` | 必须等于 `files` 数组长度 |
| `display.antigenChains` | 必须与 PDB REMARK 904 一致 |
| `display.antibodyChains` | 必须与 PDB REMARK 905 一致；Fab = 2 条链，VHH = 1 条链 |
| `display.order` | 12 个数字的排列，控制候选展示顺序 |
| `display.visualColors` | antigen 和 antibody 各一个 hex 颜色 |

#### 2.3 真实复合物的 structureClass 选取

| 场景 | structureClass |
|------|----------------|
| 真实抗原-抗体共晶复合物 | `target_exact_complex` |
| 真实抗原 + 纳米抗体共晶 | `target_exact_nanobody_complex` |
| 真实抗原 + 表位标签共晶 | `target_exact_epitope_complex` |
| 真实抗原 + 代表性 Fab 支架（非共晶） | `representative_experimental_interface` |
| 通用 VHH 展示支架 | `generic_vhh_display_scaffold` |

#### 2.4 多聚体抗原的额外字段

如果抗原是多聚体且从 biological assembly 中截取了部分链展示：

```json
{
  "display": {
    "antigenChains": ["A", "D"],
    "antibodyChains": ["B", "C"],
    "sourceAntigenChains": ["A", "D", "E", "F", "G", "H"],
    "sourceAntibodyChains": ["B", "C"],
    "displayMode": "representative_interface"
  }
}
```

- `sourceAntigenChains`：完整 biological assembly 的抗原链
- `sourceAntibodyChains`：完整 biological assembly 的抗体链
- `displayMode: "representative_interface"`：标记为代表性界面展示

---

### 步骤 3：更新 `server.js` — DEMO_ROUTE_RULES

在 `DEMO_ROUTE_RULES` 数组中追加新 route 对象。**不要修改或删除已有 route**。

#### 3.1 完整模板

```javascript
{
  id: 'solid_tumor_dll3',
  disease: '小细胞肺癌',
  systemUnderstanding: 'Notch 信号通路',
  target: 'DLL3',
  blockTarget: null,              // 如有阻断伙伴则填写，如 'Notch receptor'
  abType: 'Fab',
  count: 10,
  printable: true,
  displayStory: '围绕 DLL3 胞外域 DSL 结构域设计靶向抗体...',
  keywords: ['dll3', 'delta3', '小细胞肺癌', 'sclc', 'notch']
}
```

#### 3.2 字段约束

| 字段 | 约束 |
|------|------|
| `id` | 必须与 `ROUTE_3D_PRESETS` 的键、catalog 的 `routeId` 完全一致 |
| `target` | 必须与 catalog 的 `target`、`buildRouteProfile` 的 key 一致 |
| `abType` | 只能是 `Fab`、`VHH`、`scFv`、`IgG`、`mAb` 之一 |
| `count` | 通常为 10，必须 ≤ PDB 文件数量（不足时循环复用） |
| `keywords` | 小写英文 + 中文关键词，用于 `detectDemoRoute` 匹配 |

---

### 步骤 4：更新 `server.js` — ROUTE_3D_PRESETS

在 `ROUTE_3D_PRESETS` 对象中追加新 preset。键名必须与 `DEMO_ROUTE_RULES[].id` 完全一致。

#### 4.1 完整模板

```javascript
solid_tumor_dll3: {
  aliasPrefix: 'DLL3-Fab',
  title: 'DLL3 Fab 肿瘤靶向展示构象',
  structureFamily: 'Notch 配体 DSL 结构域 · Fab 候选',
  visualSummary: '展示 Fab 对 DLL3 胞外域 DSL 结构域表面的空间覆盖。',
  structuralBasis: 'RCSB 5KZO DLL3 胞外域 + 代表性 Fab 支架（RCSB 2FBJ），非真实共晶结构',
  antigenChains: ['A'],
  antibodyChains: ['B', 'C'],
  antigenColor: '#8B5CF6',
  antibodyColor: '#10B981',
  order: [0, 2, 5, 1, 4, 7, 3, 6, 8, 9, 10, 11],
  ipTmBias: 0.005
}
```

#### 4.2 字段约束

| 字段 | 约束 |
|------|------|
| 键名 | 必须与 `DEMO_ROUTE_RULES[].id` 完全一致 |
| `aliasPrefix` | 必须与 catalog 的 `aliasPrefix`、PDB 文件名前缀一致 |
| `antigenChains` | 必须与 catalog `display.antigenChains`、PDB REMARK 904 一致 |
| `antibodyChains` | 必须与 catalog `display.antibodyChains`、PDB REMARK 905 一致；**Fab = 2 条链，VHH = 1 条链** |
| `antigenColor` / `antibodyColor` | hex 格式，与 catalog `display.visualColors` 一致 |

#### 4.3 多聚体/代表性界面的可选字段

```javascript
infectious_example: {
  // ... 基本字段 ...
  sourceAntigenChains: ['A', 'D', 'E', 'F', 'G', 'H'],  // 完整 assembly 链
  sourceAntibodyChains: ['B', 'C'],
  displayMode: 'representative_interface',
  interfaceDetail: false  // 可选：禁用界面细节展示
}
```

---

### 步骤 5：更新 `server.js` — buildRouteProfile

在 `buildRouteProfile` 函数的 `profiles` 对象中追加新靶点 profile。

#### 5.1 key 归一化映射

如果靶点有别名，在 `buildRouteProfile` 的 key 归一化区域追加别名映射：

```javascript
// 在已有的 if 链中追加
if (normalizedKey === 'DLL3' || normalizedKey === 'DELTA3' || normalizedKey === 'DELTA-LIKE3') {
  key = 'DLL3';
}
```

#### 5.2 完整 profile 模板

```javascript
'DLL3': {
  routeLabel: 'DLL3 / Notch 信号',
  disease: '小细胞肺癌',
  targetDisplay: 'DLL3',
  partnerDisplay: '',
  domain: 'DLL3 胞外域 DSL 结构域 + EGF 重复序列',
  mechanism: '靶向 DLL3 胞外域，阻断 Notch 信号通路或介导 ADC 毒素递送',
  evidence: 'DLL3 在小细胞肺癌高表达的证据包',
  evidenceSources: ['小细胞肺癌转录组数据', 'DLL3 胞外域结构注释', 'Notch 信号通路机制'],
  referenceEntries: 'UniProt Q9NYJ7 DLL3 靶点条目',
  structure: 'DLL3 胞外域结构与代表性 Fab 结合模式参考集合',
  structureRef: 'DLL3 DSL 结构域参考模型',
  antibodies: ['Rovalpituzumab (Rova-T)'],
  interfaceFocus: 'DLL3 DSL 结构域表面',
  selectedEpitope: 'DSL 结构域功能性表位',
  epitopeRowsZh: [
    ['Site A', 'DSL 结构域表面', '直接阻断 Notch 受体结合', '优先'],
    ['Site B', 'EGF 重复序列近膜区', '辅助结合，增强亲和力', '备选'],
    ['Site C', 'DSL-EGD 连接区', '适配 ADC linker 空间', '备选']
  ],
  epitopeRowsEn: [
    ['Site A', 'DSL domain surface', 'Direct blockade of Notch receptor binding', 'Primary'],
    ['Site B', 'EGF repeat juxtamembrane', 'Auxiliary binding, enhanced affinity', 'Alternative'],
    ['Site C', 'DSL-EGD linker', 'ADC linker spatial accommodation', 'Alternative']
  ],
  riskSummaryZh: 'DLL3 在小细胞肺癌高表达，正常组织表达受限；需关注 Notch 通路相关毒性。',
  riskSummaryEn: 'DLL3 is highly expressed in SCLC with limited normal tissue expression; monitor Notch pathway toxicity.',
  structurePrepZh: '加载 DLL3 DSL 结构域参考界面...',
  structurePrepEn: 'Loading DLL3 DSL domain interface...',
  scaffold: abType === 'Fab' ? 'Fab 片段抗体骨架' : abType + ' 抗体骨架',
  designMode: '肿瘤靶向设计'
}
```

#### 5.3 必填字段清单

以下字段必须非空：

`routeLabel`、`disease`、`targetDisplay`、`domain`、`mechanism`、`evidence`、`evidenceSources`（至少 1 项）、`referenceEntries`、`structure`、`structureRef`、`antibodies`（至少 1 项）、`interfaceFocus`、`selectedEpitope`、`epitopeRowsZh`（至少 1 行）、`epitopeRowsEn`（至少 1 行）、`riskSummaryZh`、`riskSummaryEn`、`structurePrepZh`、`structurePrepEn`、`scaffold`、`designMode`

---

### 步骤 6：更新 `server.js` — getRoute3DPreset 的 targetPresetMap

在 `getRoute3DPreset` 函数内的 `targetPresetMap` 字典中追加靶点到 routeId 的映射：

```javascript
const targetPresetMap = {
  // ... 已有条目保持不变 ...
  'DLL3': 'solid_tumor_dll3',
};
```

#### 同时检查 `ROUTE_3D_PRESET_ORGANISMS_FALLBACK`

如果是非人类靶点（如病毒、犬源），在 `ROUTE_3D_PRESET_ORGANISMS_FALLBACK` 中追加：

```javascript
solid_tumor_dll3: { organismName: 'Homo sapiens', organismTaxId: 9606 },
```

---

### 步骤 7：更新 `public/index.html` — FALLBACK_3D_PRESETS

在 `FALLBACK_3D_PRESETS` 对象中追加前端兜底预设。键名必须与 `ROUTE_3D_PRESETS` 一致。

#### 7.1 完整模板

```javascript
solid_tumor_dll3: {
  aliasPrefix: 'DLL3-Fab',
  structureTitle: 'DLL3 Fab 肿瘤靶向展示构象',
  structureFamily: 'Notch 配体 DSL 结构域 · Fab 候选',
  visualSummary: '展示 Fab 对 DLL3 胞外域 DSL 结构域表面的空间覆盖。',
  structuralBasis: 'RCSB 5KZO DLL3 胞外域 + 代表性 Fab 支架（RCSB 2FBJ），非真实共晶结构',
  antigenChains: ['A'],
  antibodyChains: ['B', 'C'],
  visualColors: { antigen: '#8B5CF6', antibody: '#10B981' },
  order: [0, 2, 5, 1, 4, 7, 3, 6, 8, 9, 10, 11]
}
```

#### 7.2 字段对应关系

前端 `FALLBACK_3D_PRESETS` 字段与后端 `ROUTE_3D_PRESETS` 字段的映射：

| 前端字段 | 后端字段 | 说明 |
|----------|----------|------|
| `aliasPrefix` | `aliasPrefix` | 完全一致 |
| `structureTitle` | `title` | 完全一致 |
| `structureFamily` | `structureFamily` | 完全一致 |
| `visualSummary` | `visualSummary` | 完全一致 |
| `structuralBasis` | `structuralBasis` | 完全一致 |
| `antigenChains` | `antigenChains` | 完全一致 |
| `antibodyChains` | `antibodyChains` | 完全一致 |
| `visualColors.antigen` | `antigenColor` | 完全一致 |
| `visualColors.antibody` | `antibodyColor` | 完全一致 |
| `order` | `order` | 完全一致 |

#### 7.3 代表性界面的额外字段

```javascript
infectious_example: {
  // ... 基本字段 ...
  sourceAntigenChains: ['A', 'D', 'E', 'F', 'G', 'H'],
  sourceAntibodyChains: ['B', 'C'],
  displayMode: 'representative_interface',
  interfaceDetail: false  // 可选
}
```

---

### 步骤 8：更新 `public/index.html` — 快速设计向导（如需在快速设计中暴露）

**注意**：如果新靶点不需要在快速设计弹窗中展示，可跳过此步骤。

#### 8.1 qdDemoRoutes — 追加路线

```javascript
const qdDemoRoutes = {
  // ... 已有路线保持不变 ...
  solid_tumor_dll3: {
    disease: '小细胞肺癌',
    systemUnderstanding: 'Notch 信号通路',
    target: 'DLL3',
    blockTarget: null,
    abType: 'Fab',
    count: 10,
    printable: true,
    routeLabel: 'DLL3 / Notch 信号通路',
    triggerHint: '小细胞肺癌、DLL3、Notch'
  }
};
```

#### 8.2 qdTargetOptions — 追加靶点卡片

在对应疾病分类下追加：

```javascript
const qdTargetOptions = {
  oncology: [
    // ... 已有选项保持不变 ...
    { id: 'DLL3', routeId: 'solid_tumor_dll3', title: 'DLL3', desc: '小细胞肺癌相关 Notch 配体靶点' }
  ]
};
```

#### 8.3 qdMechanismOptions — 追加机制卡片

```javascript
const qdMechanismOptions = {
  // ... 已有选项保持不变 ...
  'DLL3': [
    { id: 'block-notch', title: '阻断 DLL3 / Notch 相互作用', desc: '阻止 Notch 信号通路激活', recommended: true, block: 'Notch receptor' },
    { id: 'adc-targeting', title: '介导 ADC 毒素递送', desc: '利用 DLL3 高表达递送细胞毒性 payload' },
    { id: 'high-affinity', title: '生成高亲和力结合抗体', desc: '提高肿瘤靶向选择性' }
  ]
};
```

#### 8.4 qdWorkflowTriggers — 追加触发句

```javascript
const qdWorkflowTriggers = {
  // ... 已有触发句保持不变 ...
  solid_tumor_dll3: '靶向 DLL3，设计 10 个高亲和力 Fab'
};
```

---

## 可选更新（按需）

### 9. 疾病→靶点自动解析

如果希望用户输入疾病名称时自动命中新靶点，在 `server.js` 的 `BUILTIN_DISEASE_TARGET_RESOLVERS` 中追加：

```javascript
const DLL3_TARGET_RESOLUTION = {
  selectedTarget: 'DLL3',
  selectedGene: 'DLL3',
  designLabel: 'DLL3 / Notch 信号通路',
  confidence: 0.82,
  reason: 'DLL3 在小细胞肺癌中高表达，正常组织表达受限，是 SCLC 靶向治疗的重要靶点',
  candidates: [
    { target: 'DLL3', gene: 'DLL3', reason: 'SCLC 高表达，已有 ADC 药物开发' },
    { target: 'Notch2', gene: 'NOTCH2', reason: 'DLL3 的下游受体，但选择性风险较高' }
  ]
};

// 在 BUILTIN_DISEASE_TARGET_RESOLVERS 中追加
'小细胞肺癌': DLL3_TARGET_RESOLUTION,
'sclc': DLL3_TARGET_RESOLUTION,
```

### 10. 靶点别名归一化

如果靶点有别名需要在自然语言中被识别，在 `lib/design-routing.js` 的 `KNOWN_TARGET_ALIASES` 和 `normalizeTargetAlias` 中追加。

### 11. 病毒库清单（仅病毒靶点）

如果是流感/病毒靶点，需要在 `pdb/virus-library-manifest.json` 的 `models` 数组中追加新条目，并遵循 `VIRUSLIB-{病毒}-{蛋白}-{亚型}-{PDBID}.pdb` 命名规则。

---

## 重建目录与验证

### 12. 重建 local-structure-catalog.json

如果手动修改了 catalog，或添加了新的 manifest 文件，运行重建脚本：

```bash
node scripts/build_local_structure_catalog.js
```

这会自动从 `server.js`（ROUTE_3D_PRESETS）、`public/index.html`（FALLBACK_3D_PRESETS）和各 manifest 文件重新生成完整的 catalog。

### 13. 运行测试

```bash
# 路由命中测试
node test/server-design-route.test.js

# 目录一致性测试
node test/local-structure-catalog.test.js
```

### 14. 更新版本号

在 `public/index.html` 中更新 `APP_BUILD_VERSION` 为新的纯数字版本号（递增）。

### 15. 验证检查清单

完成后逐项确认：

#### PDB 文件检查
- [ ] 所有新 PDB 文件已放入 `pdb/` 目录
- [ ] 文件名格式为 `{靶点缩写}-{抗体格式}-{编号}.pdb`
- [ ] 每个 PDB 文件头部包含 REMARK 900-906 记录
- [ ] REMARK 904 抗原链与 REMARK 905 抗体链正确
- [ ] 抗体链数为 2（Fab）或 1（VHH）
- [ ] 多聚体抗原链集合完整

#### catalog 检查
- [ ] `routePresets` 中新增条目的 `routeId` 全局唯一
- [ ] `files` 数组中的文件名在 `pdb/` 目录中实际存在
- [ ] `display.antigenChains` 与 PDB REMARK 904 一致
- [ ] `display.antibodyChains` 与 PDB REMARK 905 一致
- [ ] `structureClass` 正确选择

#### server.js 检查
- [ ] `DEMO_ROUTE_RULES` 新条目的 `id` 与 `ROUTE_3D_PRESETS` 键一致
- [ ] `DEMO_ROUTE_RULES` 新条目的 `target` 与 `buildRouteProfile` key 一致
- [ ] `ROUTE_3D_PRESETS` 新条目的 `aliasPrefix` 与 catalog 一致
- [ ] `ROUTE_3D_PRESETS` 新条目的 `antigenChains`/`antibodyChains` 与 catalog 一致
- [ ] `getRoute3DPreset` 的 `targetPresetMap` 已追加映射
- [ ] **已有条目未被修改**

#### index.html 检查
- [ ] `FALLBACK_3D_PRESETS` 新条目键名与 `ROUTE_3D_PRESETS` 一致
- [ ] `FALLBACK_3D_PRESETS` 新条目的 `antigenChains`/`antibodyChains` 与后端一致
- [ ] `FALLBACK_3D_PRESETS` 新条目的 `visualColors` 与后端 `antigenColor`/`antibodyColor` 一致
- [ ] 快速设计向导的 `qdDemoRoutes`/`qdTargetOptions`/`qdMechanismOptions`/`qdWorkflowTriggers` 已同步（如需暴露）
- [ ] `APP_BUILD_VERSION` 已更新
- [ ] **已有条目未被修改**

#### 一致性总检
- [ ] `routeId` 在所有文件中完全一致（server.js、catalog、index.html）
- [ ] `target` 名称在所有文件中完全一致（server.js、catalog、index.html）
- [ ] `aliasPrefix` 在所有文件中完全一致（server.js、catalog、index.html、PDB文件名）
- [ ] `antigenChains` 在所有文件中完全一致（PDB REMARK、catalog、server.js、index.html）
- [ ] `antibodyChains` 在所有文件中完全一致（PDB REMARK、catalog、server.js、index.html）
- [ ] 新增条目未导致已有靶点的 `targetPresetMap` 映射被覆盖
- [ ] 新增的 `buildRouteProfile` key 归一化逻辑未影响已有靶点的别名映射

---

## 常见错误与防范

### 错误 1：修改了已有条目导致旧靶点失效

**防范**：所有修改只追加新条目。如果必须修改已有条目（如修正别名冲突），需要明确说明修改原因并确保不影响原有路由。

### 错误 2：antibodyChains 包含过多链

**防范**：`antibodyChains` 只包含 1 个抗体的链。Fab = `["B", "C"]`（重链+轻链），VHH = `["B"]`。如果 PDB 文件中有多个抗体分子，只取第一个的链。**不要设置 `keepAllAntibodyChains: true`**，这会导致展示多个抗体。

### 错误 3：多聚体抗原只取了一条链

**防范**：TNF 三聚体必须 `["A", "D", "E"]`，AQP4 四聚体必须 `["A", "B", "C", "D"]`。从 PDB biological assembly 确认所有抗原链。

### 错误 4：routeId 与已有重复

**防范**：新增前在整个项目中搜索 `grep -r "新routeId" server.js public/index.html pdb/local-structure-catalog.json`。

### 错误 5：target 名称在不同文件中不一致

**防范**：使用统一的 target 标准名称。例如 `PD-L1` 不要在某个文件写成 `PDL1` 或 `CD274`。`buildRouteProfile` 中的别名归一化会处理别名映射，但 catalog/preset/route 中的 `target` 字段必须用标准名。

### 错误 6：PDB REMARK 缺失导致靶点身份无法识别

**防范**：`readLocalPDBRemarks` 依次从 PDB REMARK → virus-manifest → catalog 三个来源推断靶点身份。如果 PDB REMARK 缺失且文件不在 virus-manifest 中，则只能依赖 catalog。为确保可靠性，**PDB REMARK 901 TARGET 和 904/905 链信息必须写入**。

### 错误 7：新增 buildRouteProfile key 归一化影响已有靶点

**防范**：新增的 `if (normalizedKey === 'XXX')` 分支必须只匹配新靶点的别名，不能意外匹配已有靶点的别名。添加后检查已有的别名映射是否仍指向正确的 key。

---

## 输入示例

将提示词一输出的 JSON 作为输入，附在此提示词后面：

```
请根据以下结构方案，按照上述规则将新靶点接入项目：

[粘贴提示词一输出的 JSON]
```

大模型应输出：
1. 每个需要修改的文件名
2. 每个文件中需要追加的完整代码/JSON 块
3. 追加位置（在哪个函数/对象/数组中）
4. 验证检查清单的完成情况
