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
6. **JSON/JS 语法必须正确**：每新增一个对象或数组，必须确保大括号和方括号正确闭合。这是最高优先级——一个缺失的闭合括号会导致后续所有条目嵌套错误，打乱所有已有靶点

---

## 之前发生过的严重错误（必须避免）

以下错误在实际项目中真实发生过，导致了大量已有靶点失效。新增靶点时必须逐条检查：

| 错误 | 后果 | 防范措施 |
|------|------|----------|
| **profile 对象缺少闭合大括号** | 后续所有 profile 条目被嵌套在该 profile 内部，导致 152 个靶点全部失效 | 每个新 profile 的 `{` 必须有对应的 `}`，末尾逗号后接下一个 key |
| **在 profiles 对象末尾多加了 `}`** | 整个 profiles 对象提前结束，后续代码语法错误 | 确认新增 profile 后，profiles 对象的闭合 `}` 仍在原位 |
| **设置了 `keepAllAntibodyChains: true`** | 展示了 PDB 中所有抗体链，导致出现多个抗体分子（如 3 个 Fab） | **永远不要设置 `keepAllAntibodyChains: true`** |
| **硬编码了抗体链数为 4** | 展示了 2 个 Fab 分子 | `antibodyChains` 数组长度必须为 2（Fab）或 1（VHH） |
| **多聚体抗原只取了第一条链** | 抗原形态不完整，如 TNF 三聚体只展示了一个单体 | 多聚体抗原的所有亚基链 ID 都必须在 `antigenChains` 中 |
| **target 名称在不同文件中不一致** | 路由匹配失败，3D 展示使用错误的预设 | 全链路使用完全相同的 target 字符串 |
| **routeId 与已有重复** | 新条目覆盖已有条目 | 新增前搜索整个项目确认唯一性 |
| **修改已有 aliasPrefix 映射** | 已有靶点的 PDB 文件匹配失效 | 只追加新映射，不修改已有映射 |
| **PDB REMARK 缺失** | 系统无法识别 PDB 文件的靶点身份，3D 展示为空白 | 每个 PDB 文件必须包含 REMARK 900-906 |

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
│   ├── {靶点缩写}-Fab-01.pdb           # 路线预设 PDB 文件（根目录）
│   ├── {靶点缩写}-Fab-02.pdb
│   ├── antigen-display-pose/          # 展示姿态子目录（真实抗原 + 代表性抗体支架）
│   │   └── {靶点缩写}-Fab-{PDBID}.pdb
│   └── antigen-only-sweep/            # 纯抗原扫描子目录
├── scripts/
│   └── build_local_structure_catalog.js  # 目录重建脚本
├── lib/
│   ├── design-routing.js              # 靶点别名归一化与路由
│   ├── local-structure-catalog.js     # 目录加载器
│   ├── structure-resolver.js          # 在线结构解析（默认关闭）
│   └── display-pose.js                # 展示姿态几何生成
└── test/
    ├── server-design-route.test.js     # 路由命中测试
    └── local-structure-catalog.test.js # 目录一致性测试
```

---

## 核心架构：Catalog 驱动一切

本项目的 `pdb/local-structure-catalog.json` 是单一事实来源（single source of truth）。在 catalog 中正确注册一个 `routePreset` 条目后，以下内容会**自动生成**，无需手动配置：

1. **靶点 → routeId 映射**（`ROUTE_3D_PRESET_TARGET_ROUTE_MAP`）：由 `buildTargetRouteMapFromCatalog` 从 catalog 的 `target`/`gene`/`aliases`/`promptLabel` 自动构建
2. **大模型提示词靶点清单**（`STRUCTURE_SUPPORT_TARGETS_FOR_PROMPT`）：由 `buildStructureSupportPromptList` 从 catalog 的 `promptEligible !== false` 条目自动生成
3. **3D 预设叠加**（`applyCatalogRoutePresetOverlay`）：catalog 的 `display` 字段会自动叠加到 `ROUTE_3D_PRESETS` 上
4. **自然语言兜底路由**（`buildPreparedDiseaseFallbackIntent`）：catalog 注册的靶点在大模型 API 不可用时也能自动路由
5. **客户端目录副本**（`toClientStructureCatalog`）：自动生成前端可用的 catalog 数据

因此，**最重要的一步是正确编写 catalog 条目**。但 `server.js` 中的 `buildRouteProfile` profile 和 `ROUTE_3D_PRESETS` 条目仍需手动添加（因为 profile 包含大量展示文案，无法从 catalog 自动生成）。

---

## 必须修改的文件清单（按执行顺序）

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
- **如果使用展示姿态子目录**（真实抗原 + 代表性抗体支架），文件放在 `pdb/antigen-display-pose/` 下，命名格式为 `{靶点缩写}-{抗体格式}-{PDBID}.pdb`，并在 catalog 中设置 `localPath` 字段

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

#### 1.6 展示姿态子目录的文件

如果文件放在 `pdb/antigen-display-pose/` 子目录，REMARK 格式相同，但 `CANDIDATE INDEX` 可省略（单文件场景）。

---

### 步骤 2：更新 `pdb/local-structure-catalog.json`

在 `routePresets` 数组中追加新条目。**不要修改已有条目**。

#### 2.1 routePresets 条目完整模板（文件在 pdb/ 根目录）

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

#### 2.2 routePresets 条目完整模板（文件在子目录，使用 localPath）

```json
{
  "routeId": "display_pose_kras_200",
  "aliasPrefix": "KRAS-Fab",
  "target": "KRAS",
  "gene": "KRAS",
  "aliases": ["KRAS", "K-Ras"],
  "organismName": "Homo sapiens",
  "organismTaxId": 9606,
  "antibodyFormat": "Fab",
  "routeable": true,
  "promptEligible": true,
  "clientFallbackEligible": true,
  "structureClass": "target_exact_display_pose",
  "sourceClass": "catalog_manual",
  "filenamePattern": "KRAS-Fab-{PDBID}.pdb",
  "files": ["KRAS-Fab-4OBE.pdb"],
  "fileCount": 1,
  "localPath": "antigen-display-pose/KRAS-Fab-4OBE.pdb",
  "promptLabel": "KRAS/KRAS",
  "structuralBasis": "RCSB 4OBE KRAS 抗原 + 代表性 Fab 展示支架",
  "sourcePdbIds": ["4OBE"],
  "display": {
    "structureTitle": "KRAS Fab 肿瘤靶向展示构象",
    "structureFamily": "RAS 家族 GTPase · Fab 候选",
    "visualSummary": "展示 Fab 对 KRAS 蛋白表面的空间覆盖。",
    "structuralBasis": "RCSB 4OBE KRAS 抗原 + 代表性 Fab 展示支架",
    "antigenChains": ["A"],
    "antibodyChains": ["B", "C"],
    "displayMode": "representative_display_pose",
    "interfaceDetail": false,
    "visualColors": {
      "antigen": "#60A5FA",
      "antibody": "#F472B6"
    }
  }
}
```

#### 2.3 字段约束说明

| 字段 | 约束 |
|------|------|
| `routeId` | 全局唯一，使用 `蛇形命名法`，如 `solid_tumor_dll3`；展示姿态用 `display_pose_{gene}_{n}` |
| `aliasPrefix` | 与 PDB 文件名前缀完全一致，如 `DLL3-Fab` |
| `target` | 靶点标准名称，全链路一致使用此字符串 |
| `antibodyFormat` | 只能是 `Fab` 或 `VHH` |
| `routeable` | `true` 使该靶点可被路由命中 |
| `promptEligible` | `true` 使该靶点出现在大模型提示词靶点清单中 |
| `structureClass` | 见下方选取表 |
| `files` 数组 | 文件名必须与 `pdb/` 目录中实际存在的文件完全一致 |
| `fileCount` | 必须等于 `files` 数组长度 |
| `localPath` | 仅当 PDB 文件在子目录时使用，相对 `pdb/` 的路径；根目录文件不需要此字段 |
| `display.antigenChains` | 必须与 PDB REMARK 904 一致 |
| `display.antibodyChains` | 必须与 PDB REMARK 905 一致；Fab = 2 条链，VHH = 1 条链 |
| `display.order` | 候选排序数组；单文件场景可省略 |
| `display.visualColors` | antigen 和 antibody 各一个 hex 颜色 |
| `display.interfaceDetail` | 代表性界面设为 `false`；真实复合物设为 `true` 或省略 |
| `display.displayMode` | 代表性界面用 `"representative_interface"` 或 `"representative_display_pose"`；真实复合物省略 |

#### 2.4 真实复合物的 structureClass 选取

| 场景 | structureClass |
|------|----------------|
| 真实抗原-抗体共晶复合物 | `target_exact_complex` |
| 真实抗原 + 纳米抗体共晶 | `target_exact_nanobody_complex` |
| 真实抗原 + 表位标签共晶 | `target_exact_epitope_complex` |
| 真实抗原 + 代表性 Fab 支架（非共晶） | `representative_experimental_interface` |
| 真实抗原 + 代表性 VHH 支架（非共晶） | `target_exact_display_pose` |
| 通用 VHH 展示支架 | `generic_vhh_display_scaffold` |

#### 2.5 多聚体抗原的额外字段

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

#### 2.6 绝对禁止的字段

| 禁止字段 | 原因 |
|----------|------|
| `keepAllAntibodyChains: true` | 会导致展示 PDB 中所有抗体链，出现多个抗体分子 |
| 在 `antibodyChains` 中放入超过 2 条链（Fab）或 1 条链（VHH） | 会展示多个抗体分子 |

---

### 步骤 3：更新 `server.js` — buildRouteProfile

在 `buildRouteProfile` 函数的 `profiles` 对象中追加新靶点 profile。

**关键语法安全规则**：
- 每个新 profile 是 `profiles` 对象中的一个 key-value 对
- profile 对象的 `{` 必须有对应的 `}`
- 末尾的 `,` 后接下一个 profile 的 key，或者如果是最后一个，不加 `,`
- **添加后必须检查 `profiles` 对象的闭合 `}` 仍在原位**

#### 3.1 key 归一化映射

如果靶点有别名，在 `buildRouteProfile` 的 key 归一化区域追加别名映射：

```javascript
// 在已有的 if 链中追加
if (normalizedKey === 'DLL3' || normalizedKey === 'DELTA3' || normalizedKey === 'DELTA-LIKE3') {
  key = 'DLL3';
}
```

**注意**：新的归一化分支必须只匹配新靶点的别名，不能意外匹配已有靶点的别名。

#### 3.2 完整 profile 模板

```javascript
'DLL3': {
  routeLabel: 'DLL3 / Notch 信号',
  disease: '小细胞肺癌',
  targetDisplay: 'DLL3',
  targetGene: 'DLL3',
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
  scaffold: 'Fab 片段抗体骨架',
  designMode: '肿瘤靶向设计',
  routeId: 'solid_tumor_dll3'
}
```

#### 3.3 必填字段清单

以下字段必须非空：

`routeLabel`、`disease`、`targetDisplay`、`targetGene`、`domain`、`mechanism`、`evidence`、`evidenceSources`（至少 1 项）、`referenceEntries`、`structure`、`structureRef`、`antibodies`（至少 1 项）、`interfaceFocus`、`selectedEpitope`、`epitopeRowsZh`（至少 1 行）、`epitopeRowsEn`（至少 1 行）、`riskSummaryZh`、`riskSummaryEn`、`structurePrepZh`、`structurePrepEn`、`scaffold`、`designMode`、`routeId`

#### 3.4 语法安全验证

添加新 profile 后，在 `profiles` 对象闭合 `}` 之前，确认：
- 新 profile 的 `{` 和 `}` 数量匹配
- 新 profile 末尾有 `,`（如果不是最后一个）或没有 `,`（如果是最后一个）
- `profiles` 对象的闭合 `}` 仍在正确位置

**验证方法**：在 `server.js` 中搜索 `profiles` 对象的开始和结束位置，确认闭合括号未被移动。

---

### 步骤 4：更新 `server.js` — DEMO_ROUTE_RULES

在 `DEMO_ROUTE_RULES` 数组中追加新 route 对象。**不要修改或删除已有 route**。

#### 4.1 完整模板

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

#### 4.2 字段约束

| 字段 | 约束 |
|------|------|
| `id` | 必须与 `ROUTE_3D_PRESETS` 的键、catalog 的 `routeId` 完全一致 |
| `target` | 必须与 catalog 的 `target`、`buildRouteProfile` 的 key 一致 |
| `abType` | 只能是 `Fab`、`VHH`、`scFv`、`IgG`、`mAb` 之一 |
| `count` | 通常为 10，必须 ≤ PDB 文件数量（不足时循环复用） |
| `keywords` | 小写英文 + 中文关键词，用于 `detectDemoRoute` 匹配 |

---

### 步骤 5：更新 `server.js` — ROUTE_3D_PRESETS

在 `ROUTE_3D_PRESETS` 对象中追加新 preset。键名必须与 `DEMO_ROUTE_RULES[].id` 完全一致。

**注意**：catalog 的 `display` 字段会通过 `applyCatalogRoutePresetOverlay` 自动叠加到此对象上，但手动添加基础预设仍是必需的（因为 overlay 只补充缺失字段，不替换已有字段；且前端断线时需要 `FALLBACK_3D_PRESETS` 作为独立兜底）。

#### 5.1 完整模板

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

#### 5.2 字段约束

| 字段 | 约束 |
|------|------|
| 键名 | 必须与 `DEMO_ROUTE_RULES[].id` 完全一致 |
| `aliasPrefix` | 必须与 catalog 的 `aliasPrefix`、PDB 文件名前缀一致 |
| `antigenChains` | 必须与 catalog `display.antigenChains`、PDB REMARK 904 一致 |
| `antibodyChains` | 必须与 catalog `display.antibodyChains`、PDB REMARK 905 一致；**Fab = 2 条链，VHH = 1 条链** |
| `antigenColor` / `antibodyColor` | hex 格式，与 catalog `display.visualColors` 一致 |

#### 5.3 代表性界面的额外字段

```javascript
display_pose_example: {
  // ... 基本字段 ...
  interfaceDetail: false  // 代表性界面禁用界面细节
}
```

---

### 步骤 6：更新 `server.js` — getRoute3DPreset 的 targetPresetMap

在 `getRoute3DPreset` 函数内的 `targetPresetMap` 字典中追加靶点到 routeId 的映射：

```javascript
const targetPresetMap = {
  // ... 已有条目保持不变 ...
  'DLL3': 'solid_tumor_dll3',
};
```

**注意**：如果靶点已在 catalog 中正确注册（`routeable: true`），`ROUTE_3D_PRESET_TARGET_ROUTE_MAP` 会自动生成映射，`targetPresetMap` 作为硬编码兜底。两者都添加可确保最大可靠性。

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
display_pose_example: {
  // ... 基本字段 ...
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

### 步骤 9：更新 `lib/design-routing.js`（如需自然语言识别）

如果靶点有别名需要在自然语言中被识别，在 `lib/design-routing.js` 的 `KNOWN_TARGET_ALIASES` 中追加：

```javascript
const KNOWN_TARGET_ALIASES = [
  // ... 已有别名保持不变 ...
  { canonical: 'DLL3', patterns: [/\bdll\s*-?\s*3\b/i, /\bdll3\b/i, /delta[-\s]*like\s*protein\s*3/i] },
];
```

**注意**：catalog 注册的靶点会自动通过 `PREPARED_TARGET_CANONICAL_MAP` 和 `PREPARED_TARGET_TEXT_ALIASES` 被识别，`KNOWN_TARGET_ALIASES` 作为额外兜底。如果靶点别名已在 catalog 的 `aliases` 数组中列出，通常不需要再修改 `KNOWN_TARGET_ALIASES`。

---

## 可选更新（按需）

### 10. 疾病→靶点自动解析

如果希望用户输入疾病名称时自动命中新靶点，在 `server.js` 的 `BUILTIN_DISEASE_TARGET_RESOLVERS` 中追加。

### 11. 病毒库清单（仅病毒靶点）

如果是流感/病毒靶点，需要在 `pdb/virus-library-manifest.json` 的 `models` 数组中追加新条目，并遵循 `VIRUSLIB-{病毒}-{蛋白}-{亚型}-{PDBID}.pdb` 命名规则。

---

## 重建目录与验证

### 12. 重新生成前端 catalog 副本

如果手动修改了 `pdb/local-structure-catalog.json`，需要重新生成前端可用的 catalog 文件：

```bash
node scripts/build_local_structure_catalog.js
```

这会从 `server.js`（ROUTE_3D_PRESETS）、`public/index.html`（FALLBACK_3D_PRESETS）、`pdb/local-structure-catalog.json` 和各 manifest 文件重新生成完整的 catalog 和前端副本。

**重要**：如果你手动修改了 `pdb/local-structure-catalog.json`，运行此脚本可能会覆盖手动添加的条目。因此建议先运行脚本生成基础 catalog，然后手动追加新条目，或确保脚本不会删除已有手动条目。

### 13. 验证 JSON 语法

```bash
# 验证 catalog JSON 语法
node -e "JSON.parse(require('fs').readFileSync('pdb/local-structure-catalog.json','utf8')); console.log('catalog JSON OK')"

# 验证 server.js 语法
node -c server.js

# 验证 index.html 中的 JS 语法（提取 script 标签内容检查）
node -e "const html = require('fs').readFileSync('public/index.html','utf8'); const scripts = html.match(/<script[^>]*>([\s\S]*?)<\/script>/g); scripts.forEach((s,i) => { const code = s.replace(/<[^>]+>/g,''); try { new Function(code); } catch(e) { console.log('Script '+i+' has syntax error: '+e.message); } }); console.log('JS syntax check done')"
```

### 14. 运行测试

```bash
# 路由命中测试
node test/server-design-route.test.js

# 目录一致性测试
node test/local-structure-catalog.test.js
```

### 15. 更新版本号

在 `public/index.html` 中更新 `APP_BUILD_VERSION` 为新的纯数字版本号（递增）。

### 16. 回归验证（最重要）

完成所有修改后，**必须验证已有靶点仍然正常工作**。启动本地服务器后，用 WebSocket 发送以下测试请求：

```
# 测试已有靶点 PD-L1
请帮我设计针对 PD-L1 的抗体

# 测试已有靶点 HER2
请帮我设计针对 HER2 的抗体

# 测试已有靶点 IL-33
请帮我设计针对 IL-33 的抗体

# 测试新加入的靶点
请帮我设计针对 DLL3 的抗体
```

每个请求都应正常启动工作流、展示 3D 结构。如果已有靶点失败，说明新增条目影响了已有路由，需要回退检查。

---

## 最终验证检查清单

### PDB 文件检查
- [ ] 所有新 PDB 文件已放入 `pdb/` 目录（或 `pdb/antigen-display-pose/` 子目录）
- [ ] 文件名格式为 `{靶点缩写}-{抗体格式}-{编号}.pdb`
- [ ] 每个 PDB 文件头部包含 REMARK 900-906 记录
- [ ] REMARK 904 抗原链与 REMARK 905 抗体链正确
- [ ] 抗体链数为 2（Fab）或 1（VHH）
- [ ] 多聚体抗原链集合完整
- [ ] 抗原-抗体最小距离 ≤ 5Å（真实复合物时）

### catalog 检查
- [ ] `routePresets` 中新增条目的 `routeId` 全局唯一
- [ ] `files` 数组中的文件名在 `pdb/` 目录中实际存在
- [ ] 子目录文件已设置 `localPath` 字段
- [ ] `display.antigenChains` 与 PDB REMARK 904 一致
- [ ] `display.antibodyChains` 与 PDB REMARK 905 一致
- [ ] `display.antibodyChains` 长度为 2（Fab）或 1（VHH）
- [ ] `structureClass` 正确选择
- [ ] **未设置 `keepAllAntibodyChains: true`**
- [ ] catalog JSON 语法正确（可通过 `JSON.parse` 验证）

### server.js 检查
- [ ] `DEMO_ROUTE_RULES` 新条目的 `id` 与 `ROUTE_3D_PRESETS` 键一致
- [ ] `DEMO_ROUTE_RULES` 新条目的 `target` 与 `buildRouteProfile` key 一致
- [ ] `ROUTE_3D_PRESETS` 新条目的 `aliasPrefix` 与 catalog 一致
- [ ] `ROUTE_3D_PRESETS` 新条目的 `antigenChains`/`antibodyChains` 与 catalog 一致
- [ ] `getRoute3DPreset` 的 `targetPresetMap` 已追加映射
- [ ] `buildRouteProfile` 中新 profile 的 `{` 和 `}` 正确闭合
- [ ] `buildRouteProfile` 中 `profiles` 对象的闭合 `}` 仍在正确位置
- [ ] `buildRouteProfile` 中新 profile 包含 `routeId` 字段
- [ ] **已有条目未被修改**
- [ ] `node -c server.js` 语法检查通过

### index.html 检查
- [ ] `FALLBACK_3D_PRESETS` 新条目键名与 `ROUTE_3D_PRESETS` 一致
- [ ] `FALLBACK_3D_PRESETS` 新条目的 `antigenChains`/`antibodyChains` 与后端一致
- [ ] `FALLBACK_3D_PRESETS` 新条目的 `visualColors` 与后端 `antigenColor`/`antibodyColor` 一致
- [ ] 快速设计向导的 `qdDemoRoutes`/`qdTargetOptions`/`qdMechanismOptions`/`qdWorkflowTriggers` 已同步（如需暴露）
- [ ] `APP_BUILD_VERSION` 已更新
- [ ] **已有条目未被修改**

### 一致性总检
- [ ] `routeId` 在所有文件中完全一致（server.js、catalog、index.html）
- [ ] `target` 名称在所有文件中完全一致（server.js、catalog、index.html）
- [ ] `aliasPrefix` 在所有文件中完全一致（server.js、catalog、index.html、PDB文件名）
- [ ] `antigenChains` 在所有文件中完全一致（PDB REMARK、catalog、server.js、index.html）
- [ ] `antibodyChains` 在所有文件中完全一致（PDB REMARK、catalog、server.js、index.html）
- [ ] 新增条目未导致已有靶点的 `targetPresetMap` 映射被覆盖
- [ ] 新增的 `buildRouteProfile` key 归一化逻辑未影响已有靶点的别名映射
- [ ] 新增 profile 未导致 `profiles` 对象语法错误
- [ ] 已有靶点（PD-L1、HER2、IL-33 等）回归测试通过

---

## 常见错误与防范

### 错误 1：profile 缺少闭合大括号导致后续所有靶点失效

**原因**：在 `buildRouteProfile` 的 `profiles` 对象中新增 profile 时，忘记闭合 `{`，导致后续所有 profile 被嵌套在该 profile 内部。

**防范**：每个新 profile 必须是 `'KEY': { ... },` 的格式。添加后用 `node -c server.js` 检查语法。搜索 `profiles` 对象的闭合 `}` 确认位置未变。

### 错误 2：antibodyChains 包含过多链

**原因**：PDB 文件中有多个抗体分子，`antibodyChains` 列出了所有抗体链。

**防范**：`antibodyChains` 只包含 1 个抗体的链。Fab = `["B", "C"]`（重链+轻链），VHH = `["B"]`。如果 PDB 文件中有多个抗体分子，只取第一个的链。**永远不要设置 `keepAllAntibodyChains: true`**。

### 错误 3：多聚体抗原只取了一条链

**原因**：只看了第一条链就填写 `antigenChains`。

**防范**：TNF 三聚体必须 `["A", "D", "E"]`，AQP4 四聚体必须 `["A", "B", "C", "D"]`。从 PDB biological assembly 确认所有抗原链。

### 错误 4：routeId 与已有重复

**防范**：新增前在整个项目中搜索：`grep -r "新routeId" server.js public/index.html pdb/local-structure-catalog.json`

### 错误 5：target 名称在不同文件中不一致

**防范**：使用统一的 target 标准名称。例如 `PD-L1` 不要在某个文件写成 `PDL1` 或 `CD274`。`buildRouteProfile` 中的别名归一化会处理别名映射，但 catalog/preset/route 中的 `target` 字段必须用标准名。

### 错误 6：PDB REMARK 缺失导致靶点身份无法识别

**防范**：`readLocalPDBRemarks` 依次从 PDB REMARK → virus-manifest → catalog 三个来源推断靶点身份。为确保可靠性，**PDB REMARK 901 TARGET 和 904/905 链信息必须写入**。

### 错误 7：新增 buildRouteProfile key 归一化影响已有靶点

**防范**：新增的 `if (normalizedKey === 'XXX')` 分支必须只匹配新靶点的别名，不能意外匹配已有靶点的别名。添加后检查已有的别名映射是否仍指向正确的 key。

### 错误 8：子目录 PDB 文件未被扫描

**原因**：`listLocalPDBFiles` 只扫描 `pdb/` 根目录和 `antigen-display-pose`、`antigen-only-sweep` 两个已知子目录。

**防范**：如果使用了新的子目录，需要在 `listLocalPDBFiles` 的 `knownSubdirs` 数组中追加目录名。或者在 catalog 中设置 `localPath` 字段。

### 错误 9：catalog 重建脚本覆盖手动条目

**原因**：运行 `node scripts/build_local_structure_catalog.js` 后，手动添加的 catalog 条目被覆盖。

**防范**：先运行脚本生成基础 catalog，然后手动追加新条目。或者确保脚本保留已有手动条目。修改 catalog 后运行 `node -e "JSON.parse(require('fs').readFileSync('pdb/local-structure-catalog.json','utf8'))"` 验证 JSON 语法。

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
5. 已有靶点回归测试结果
