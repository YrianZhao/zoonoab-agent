# 靶点注册表与分子模型匹配指南

> 本文档描述从大模型返回靶点名到展示本地分子模型的完整流程，以及如何规范地添加新靶点。

## 1. 架构总览

### 匹配流程

```
大模型返回靶点名 (如 "HIV-1 gp120")
        │
        ▼
┌─────────────────────────┐
│  1. 路线预设查找         │  server.js: ROUTE_3D_PRESETS
│  按 routeId 或靶点名      │  → 精确匹配，返回预设文件列表
│  精确匹配预设            │
└────────┬────────────────┘
         │ 找到？
         ├─ 是 → 使用预设 PDB 文件 + 预设展示信息
         │
         │ 否
         ▼
┌─────────────────────────┐
│  2. 目录库资产查找       │  local-structure-catalog.json: libraryAssets
│  按靶点别名精确匹配      │  → 别名精确匹配或 ≥6 字符子串匹配
│  libraryAssets 条目      │
└────────┬────────────────┘
         │ 找到？
         ├─ 是 → 使用匹配的 PDB 文件 + 资产元信息
         │
         │ 否
         ▼
┌─────────────────────────┐
│  3. 文件名推断 (兜底)    │  server.js: inferLocalPDBTargetFromFilename
│  按文件名模式匹配        │  → 仅对历史遗留文件生效
└─────────────────────────┘
```

### 关键原则

- **配置是唯一信息来源**：靶点身份、别名、文件路径都从配置读取，不靠文件名猜测
- **精确匹配优先**：别名匹配要求精确命中或 ≥6 字符子串匹配，杜绝短别名误匹配
- **别必须干净**：别名只包含靶点自身的名称和同义词，不包含复合物中其他蛋白链的名称

## 2. 目录结构与命名规范

### 目录划分

| 目录 | 用途 | 文件数量 |
|------|------|----------|
| `pdb/` | 设计候选 PDB（Fab/VHH 候选结构） | ~1264 |
| `pdb/antigen-display-pose/` | 展示姿态 PDB（实验复合物展示用） | ~160 |
| `pdb/antigen-only-sweep/` | 纯抗原结构 PDB（无抗体链） | ~195 |

**不需要合并目录**，三类文件用途不同，分开存放有助于维护。

### 命名规范

#### 设计候选文件（`pdb/` 根目录）

```
{TARGET}-{FORMAT}-{NN}.pdb
```

- `TARGET`：靶点标准名，全大写，无空格（如 `PDL1`、`HER2`、`IL33`）
- `FORMAT`：抗体格式（`Fab` 或 `VHH`）
- `NN`：两位序号（`01`、`02`、...）

示例：
```
PDL1-Fab-01.pdb
PDL1-Fab-02.pdb
HER2-VHH-01.pdb
IL33-Fab-01.pdb
```

#### 展示姿态文件（`pdb/antigen-display-pose/`）

```
{TARGET}-{FORMAT}-{PDBID}.pdb
```

- `TARGET`：靶点标准名
- `FORMAT`：抗体格式
- `PDBID`：来源 RCSB PDB 编号（如 `6K41`）

示例：
```
ADRA2B-VHH-6K41.pdb
DRD2-Fab-6CM4.pdb
```

#### 纯抗原结构文件（`pdb/antigen-only-sweep/`）

```
{PDBID}.pdb
```

示例：
```
6K41.pdb
4KC3.pdb
```

### 不规范的命名（需要避免）

```
❌ BONELIB-HUMAN-DKK1-RCSB-5GJE.pdb   → 前缀太长，包含库名
❌ SCAFFOLD-Fab-bevacizumab.pdb        → 用药物名而非靶点名
❌ NEUROLIB-HUMAN-TRKA-RCSB-1HE7.pdb   → 包含库名和物种前缀
```

## 3. 配置文件体系

### 3.1 源清单文件（Source Manifests）

位于 `pdb/` 目录，每个清单文件对应一个靶点库：

| 文件 | 覆盖范围 |
|------|----------|
| `virus-library-manifest.json` | 病毒靶点（流感、RSV、SARS-CoV-2 等） |
| `antigen-display-pose-manifest.json` | 展示姿态结构（GPCR、激酶等） |
| `neuro-library-manifest.json` | 神经系统靶点 |
| `solid-tumor-library-manifest.json` | 实体瘤靶点 |
| `inflammation-library-manifest.json` | 炎症靶点 |
| `endocrine-library-manifest.json` | 内分泌靶点 |
| `metabolic-library-manifest.json` | 代谢靶点 |
| `bone-library-manifest.json` | 骨科靶点 |
| `veterinary-library-manifest.json` | 兽用靶点 |

每个清单中的 model 条目包含：
```json
{
  "filename": "ADRA2B-VHH-6K41.pdb",
  "target": "ADRA2B",
  "gene": "ADRA2B",
  "aliases": ["ADRA2B", "ADRA2A", "ADRA2L1"],
  "antibodyFormat": "VHH",
  "structureClass": "target_exact_nanobody_complex",
  "antigenChains": ["A"],
  "antibodyChains": ["B"]
}
```

### 3.2 路线预设（Route Presets）

定义在 `server.js` 的 `ROUTE_3D_PRESETS` 常量中。每个预设包含：
- 靶点身份（target、gene、aliases）
- 展示信息（标题、颜色、结构来源）
- 文件模式（aliasPrefix → 匹配文件名）
- 链角色（antigenChains、antibodyChains）

### 3.3 生成的目录文件

运行 `node scripts/build_local_structure_catalog.js` 生成：
- `pdb/local-structure-catalog.json` — 完整目录（路线预设 + 库资产）
- `public/local-structure-catalog.generated.js` — 前端可用的目录
- `pdb/local-structure-catalog.md` — 人类可读的目录摘要

### 3.4 别名清理安全网

构建脚本 (`build_local_structure_catalog.js`) 内置了别名自动清理功能：
- 移除复合物中其他蛋白链的名称（如 GNAO1、GNB1 等）
- 移除已知的污染模式（GUANINE NUCLEOTIDE、TRANSDUCIN 等）
- 移除过短的别名（≤5 字符且不匹配靶点身份）
- 对新生成和已存在的库资产都执行清理

## 4. 添加新靶点：完整步骤

### 场景：添加一个新靶点 "CD79B"（Fab 格式，5 个候选）

#### 步骤 1：准备 PDB 文件

将 5 个候选 PDB 文件放入 `pdb/` 目录，按命名规范命名：
```
pdb/CD79B-Fab-01.pdb
pdb/CD79B-Fab-02.pdb
pdb/CD79B-Fab-03.pdb
pdb/CD79B-Fab-04.pdb
pdb/CD79B-Fab-05.pdb
```

每个 PDB 文件的头部应包含 REMARK 元数据：
```
REMARK  TARGET CD79B
REMARK  GENE CD79B
REMARK  FORMAT Fab
REMARK  ANTIGEN_CHAINS A
REMARK  ANTIBODY_CHAINS H L
```

#### 步骤 2：添加路线预设

在 `server.js` 的 `ROUTE_3D_PRESETS` 中添加：
```javascript
'CD79B-Fab': {
  aliasPrefix: 'CD79B-Fab',
  target: 'CD79B',
  gene: 'CD79B',
  aliases: ['CD79B', 'B29'],
  antibodyFormat: 'Fab',
  organismName: 'HOMO SAPIENS',
  organismTaxId: 9606,
  files: ['CD79B-Fab-01.pdb', 'CD79B-Fab-02.pdb', 'CD79B-Fab-03.pdb', 'CD79B-Fab-04.pdb', 'CD79B-Fab-05.pdb'],
  structuralBasis: 'RCSB [PDBID] CD79B antigen / representative Fab complex',
  display: {
    structureTitle: 'CD79B Fab 候选结构',
    structureFamily: 'B 细胞表面靶点 · Fab 展示候选',
    visualSummary: '基于 CD79B 抗原结构的代表性 Fab 展示姿态',
    antigenChains: ['A'],
    antibodyChains: ['H', 'L'],
    antigenColor: '#4A90D9',
    antibodyColor: '#E8A838'
  }
}
```

#### 步骤 3：更新前端断线 Fallback

在 `public/index.html` 的 `FALLBACK_3D_PRESETS` 中添加对应的 fallback 预设。

#### 步骤 4：更新快速设计路由（如需要）

如果新靶点需要出现在快速设计弹窗中，在以下位置同步更新：
- `qdDemoRoutes` / `qdTargetOptions` / `qdMechanismOptions` / `qdWorkflowTriggers`
- 后端 `DEMO_ROUTE_RULES` / `buildRouteProfile`

#### 步骤 5：重建目录

```bash
node scripts/build_local_structure_catalog.js
```

#### 步骤 6：更新版本号

在 `public/index.html` 中递增 `APP_BUILD_VERSION`。

#### 步骤 7：验证

```bash
# 启动服务
PORT=8080 node server.js

# 检查健康
curl http://127.0.0.1:8080/api/health

# 在页面中测试靶点匹配
```

### 场景：添加展示姿态结构（已有实验复合物）

#### 步骤 1：将 PDB 文件放入展示姿态目录

```
pdb/antigen-display-pose/CD79B-Fab-7ZXY.pdb
```

#### 步骤 2：更新展示姿态清单

在 `pdb/antigen-display-pose-manifest.json` 的 `models` 数组中添加：
```json
{
  "filename": "CD79B-Fab-7ZXY.pdb",
  "localPath": "pdb/antigen-display-pose/CD79B-Fab-7ZXY.pdb",
  "sourceAccession": "7ZXY",
  "target": "CD79B",
  "gene": "CD79B",
  "aliases": ["CD79B", "B29"],
  "antibodyFormat": "Fab",
  "structureClass": "target_exact_display_pose",
  "antigenChains": ["A"],
  "antibodyChains": ["H", "L"]
}
```

#### 步骤 3：重建目录并验证

```bash
node scripts/build_local_structure_catalog.js
```

## 5. 别名编写规范

### 应该包含的别名

- 靶点标准名：`CD79B`
- 基因符号：`CD79B`
- 常见同义词：`B29`
- 用户可能输入的变体：`CD79-B`、`CD79 beta`

### 不应包含的别名

- 复合物中其他蛋白的名称（如 G 蛋白亚基 GNAO1、GNB1）
- 抗体链名称（如 "HEAVY CHAIN"、"LIGHT CHAIN"）
- 单字母或极短别名（如 "E"、"G"）
- 与靶点无关的蛋白名称

### 别名清理规则

构建脚本会自动移除：
1. 与靶点身份不匹配且 ≤5 字符的别名
2. 匹配已知污染模式的别名（GUANINE NUCLEOTIDE、TRANSDUCIN 等）
3. 已知污染基因符号（GNAO1、GNB1、B2M、ALB 等）
4. 抗体相关词汇（FAB HEAVY、LIGHT CHAIN、NANOBODY、SCFV 等）

## 6. 匹配逻辑详解

### 路线预设匹配（第一优先级）

```
profile.routeId → ROUTE_3D_PRESETS[routeId]
或
profile.targetDisplay → ROUTE_3D_PRESETS 中 aliasPrefix 匹配
```

匹配方式：精确匹配 routeId 或通过 `aliasPrefix` 前缀匹配文件名。

### 库资产别名匹配（第二优先级）

```
profile.targetDisplay → normalizePreparedStructureTarget()
对比 libraryAssets 中每个条目的 aliases
```

匹配规则：
1. **精确匹配**：归一化后完全相同
2. **长子串匹配**：双方都 ≥6 字符时，一方包含另一方

归一化：大写、去除非字母数字、ALPHA→A、BETA→B

### 文件名推断（兜底，仅历史遗留）

```
filename → inferLocalPDBTargetFromFilename()
```

仅对以下历史模式生效：
- `4KC3_` → PD-L1
- `IL33` → IL-33
- `PDL1` → PD-L1
- `PD1` → PD-1
- `HER2` → HER2
- 等

**新靶点不应依赖此方式**，应通过路线预设或清单配置提供靶点身份。

## 7. 常见问题排查

### Q: 大模型返回靶点后，展示的分子模型不对

**排查步骤**：
1. 检查 `pdb/local-structure-catalog.json` 中该靶点的路线预设是否存在
2. 检查该靶点的 `aliases` 是否包含大模型可能返回的名称变体
3. 检查 `aliases` 是否被污染（包含其他蛋白的名称）
4. 运行 `node scripts/build_local_structure_catalog.js` 重建目录

### Q: 重建目录后别名又变脏了

**原因**：源清单文件中的 aliases 被污染。

**解决**：
1. 清理源清单文件中的 aliases（使用 `clean-source-manifests.js` 脚本）
2. 构建脚本内置了别名清理安全网，会自动过滤污染别名
3. 如果仍有问题，检查 `ALIAS_POLLUTION_PATTERNS` 和 `ALIAS_POLLUTED_GENES` 是否需要补充

### Q: 新增的 PDB 文件没有被系统识别

**排查步骤**：
1. 确认文件命名符合规范（`{TARGET}-{FORMAT}-{NN}.pdb`）
2. 确认路线预设中的 `aliasPrefix` 与文件名前缀匹配
3. 确认路线预设中的 `files` 数组包含文件名
4. 运行 `node scripts/build_local_structure_catalog.js` 重建目录
5. 重启服务
