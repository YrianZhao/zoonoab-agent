# 抗体骨架-抗原匹配规则 v1.1

## 1. 总则

### 1.1 设计目标

为每个抗原靶点从 30 个本地抗体骨架（22 Fab + 8 VHH）中确定性选取 **1 个 Fab（标准抗体）+ 1 个 VHH（纳米抗体）**，生成 2 个独立的展示用抗原-抗体复合物 PDB。

每个 PDB 只包含 **1 个抗原 + 1 个抗体**，独立展示，不做多骨架叠加。

### 1.2 核心约束

- 每个靶点必须同时拥有 1 个 Fab 候选和 1 个 VHH 候选
- Fab 和 VHH 必须结合抗原的 **不同表位区域**，不重叠
- 骨架选择确定性、可复现，支持 8,000+ 靶点批量处理
- 不涉及亲和力预测或实验验证，仅用于路演展示

### 1.3 术语定义

| 术语 | 定义 |
|------|------|
| Fab | 标准抗体片段，含重链 + 轻链 = 2 条抗体链 |
| VHH | 纳米抗体，单域抗体 = 1 条抗体链 |
| 骨架 (Scaffold) | 预提取的纯抗体结构文件（`SCAFFOLD-Fab-*.pdb` 或 `SCAFFOLD-VHH-*.pdb`） |
| 表位锚点 (Epitope Anchor) | `generateDisplayPose` 中抗原表面采样点 `surface.anchor` |
| 结合方向 (Binding Direction) | `surface.direction`，从抗原质心指向表位锚点的单位向量 |
| 接触残基集合 (Contact Residues) | 抗原上与抗体原子距离 ≤4.5Å 的残基集合 |

---

## 2. 骨架库分类

### 2.1 Fab 骨架（22 个）

每个骨架的 `format` 字段为 `'Fab'`，包含 2 条链（重链 + 轻链）。

按原子数分为三档，覆盖不同 CDR 架构：

| 档位 | 原子数范围 | 骨架名称 | 数量 |
|------|-----------|----------|------|
| 紧凑型 | < 1550 | trastuzumab, cetuximab, bevacizumab, certolizumab, nivolumab, ipilimumab, daratumumab, tozorakimab, fluha, bcma | 10 |
| 中等型 | 1550–1620 | il13, fcrn, gipr, her3, cd47, cgrpr, il6r | 7 |
| 扩展型 | > 1620 | b7h6, cd19, tigit, gprc5d, rsvf | 5 |

### 2.2 VHH 骨架（8 个）

每个骨架的 `format` 字段为 `'VHH'`，包含 1 条链。

按来源物种分类：

| 类别 | 骨架名称 | 来源物种 | 数量 |
|------|----------|----------|------|
| 项目原生 | IL33, TSLP | — | 2 |
| Lama glama | nb-7d12, nb-tnf3, nb80 | Lama glama | 3 |
| Camelus dromedarius | cab-lys3, cab-rn05, cab-bcii | Camelus dromedarius | 3 |

### 2.3 格式区分能力

**现有骨架库已具备完整的 Fab/VHH 区分能力：**

- 每个骨架在 `SCAFFOLDS` 数组中有明确的 `format: 'Fab'` 或 `format: 'VHH'` 标签
- 文件名遵循 `SCAFFOLD-Fab-{name}.pdb` / `SCAFFOLD-VHH-{name}.pdb` 命名规范
- `selectScaffoldsForTarget()` 已用 `s.format === format` 做过滤
- `generateDisplayPose()` 对 Fab 要求 ≥2 条抗体链，对 VHH 要求恰好 1 条抗体链

**当前缺失的环节**：`chooseGeneratedFormat()` 只返回单一格式，需改为同时分配 Fab 和 VHH 两个骨架。

---

## 3. 分配规则

### 3.1 每靶点 1 Fab + 1 VHH

```
function planCandidates() {
  return { fab: 1, vhh: 1 };  // 固定：每靶点 1 个标准抗体 + 1 个纳米抗体
}
```

无需根据抗原大小调整数量。如果某种格式 pose 生成失败，走降级流程（见第 7 节）。

### 3.2 Fab 骨架选择

**确定性选择 + 轮转分散：**

```
function selectFabScaffold(targetName) {
  const fabScaffolds = SCAFFOLDS.filter(s => s.format === 'Fab');  // 22 个
  const baseIdx = hashScaffoldIndex(targetName, fabScaffolds.length);
  const idx = (baseIdx + _scaffoldRotationOffset) % fabScaffolds.length;
  _scaffoldRotationOffset = (_scaffoldRotationOffset + 1) % fabScaffolds.length;
  return fabScaffolds[idx];
}
```

- 用 SHA-256(targetName) % 22 确定起始索引，保证同一靶点每次结果一致
- 轮转偏移确保连续靶点不选同一骨架

### 3.3 VHH 骨架选择

**确定性选择 + 与 Fab 不同的表位：**

```
function selectVHHScaffold(targetName) {
  const vhhScaffolds = SCAFFOLDS.filter(s => s.format === 'VHH');  // 8 个
  const baseIdx = hashScaffoldIndex(targetName + '_vhh', vhhScaffolds.length);
  const idx = (baseIdx + _scaffoldRotationOffset) % vhhScaffolds.length;
  return vhhScaffolds[idx];
}
```

- 使用不同的种子（`targetName + '_vhh'`），确保 Fab 和 VHH 的选择独立
- 8 个 VHH 骨架覆盖 3 种来源（项目原生 / Lama / Camelus），轮转自然分散物种

---

## 4. 表位分离规则

Fab 和 VHH 必须结合抗原的不同区域。由于每个候选是独立 PDB（1 抗原 + 1 抗体），这里只需约束两者的 **表位锚点** 和 **接触残基** 不重叠。

### 4.1 结合方向角分离

**规则**：Fab 和 VHH 的结合方向向量之间的夹角 ≥ **35°**。

```
cos(θ) = dot(direction_fab, direction_vhh)
要求: θ ≥ 35°  (即 cos(θ) ≤ 0.819)
```

- < 35° 意味着 Fab 和 VHH 从同一方向接近抗原，表位高度重叠
- 对于小抗原（残基数 ≤ 100，半径 < 20Å），阈值收紧到 **45°**

### 4.2 锚点距离分离

**规则**：Fab 和 VHH 的表位锚点原子之间的空间距离 ≥ **10Å**。

```
distance = |anchor_fab.xyz - anchor_vhh.xyz|
要求: distance ≥ 10Å
```

- 10Å ≈ 3–4 个残基的 Cα 间距，足以区分不同表位 patch

### 4.3 锚点距离上限

**规则**：锚点距离不超过抗原最大尺寸的 **80%**。

```
maxAntigenSpan = max pairwise distance among all antigen heavy atoms
要求: distance ≤ 0.8 × maxAntigenSpan
```

- 超过 80% 意味着 Fab 和 VHH 分别结合在抗原极端对侧，视觉上像两个独立靶点

### 4.4 接触残基重叠率

**规则**：Fab 和 VHH 的接触残基集合的 Jaccard 重叠率 ≤ **40%**。

```
overlap = |contactResidues_fab ∩ contactResidues_vhh| / |contactResidues_fab ∪ contactResidues_vhh|
要求: overlap ≤ 0.40
```

- 这是"表位重合"的最终防线，即使方向角和锚点距离通过，残基级重合仍需排除

### 4.5 表位选择策略

`generateDisplayPose` 内部用 Fibonacci 球面采样生成 12–24 个表面候选点。为让 Fab 和 VHH 命中不同表位：

```
1. 先为 Fab 生成 pose，记录其使用的 surfaceIndex 和 direction
2. 为 VHH 生成 pose 时，在表面候选点中排除与 Fab 方向角 < 35° 的点
3. 从剩余候选点中选支持度最高的作为 VHH 的表位
```

这不需要修改 `generateDisplayPose` 本身，只需在调用层控制传入的 `candidateIndex` 和表面候选点过滤。

---

## 5. 单骨架界面几何约束

每个骨架生成的 display pose 必须满足现有 `poseIsAcceptable` 阈值（保持不变）：

| 参数 | Fab | VHH | 说明 |
|------|-----|-----|------|
| hardClashes (< 2.0Å) | 0 | 0 | 绝对不允许原子穿模 |
| minDistance | [2.35Å, 4.5Å] | [2.35Å, 4.5Å] | 抗原-抗体最近原子距离 |
| contactPairs (≤4.5Å) | ≥ 8 | ≥ 6 | 接触原子对数 |
| nearPairs (≤6.0Å) | ≥ 40 | ≥ 24 | 近距离原子对数 |

这些阈值已在 `lib/display-pose.js` 的 `FORMAT_DEFAULTS` 和 `BASE_GEOMETRY` 中定义，无需修改。

---

## 6. 确定性分配算法

### 6.1 完整流程

```
输入: antigen PDB text, target name
输出: { fab: { scaffold, pose, fileName }, vhh: { scaffold, pose, fileName } }

1. 解析抗原 PDB
   - 识别抗原链（排除抗体链）
   - 提取重原子坐标
   - 计算残基数、原子数、最大跨度 maxAntigenSpan

2. 选择骨架
   - fabScaffold = selectFabScaffold(target)     // 从 22 个 Fab 中确定性选 1
   - vhhScaffold = selectVHHScaffold(target)     // 从 8 个 VHH 中确定性选 1

3. 抗原表面采样
   - 使用 Fibonacci 球面采样生成 12-24 个表面候选点
   - 每个候选点包含 { direction, anchor, support }

4. 生成 Fab pose
   - 调用 generateDisplayPose(antigen, fabScaffold, seed=target+'|fab')
   - 记录 Fab 的 bindingDirection 和 anchor

5. 生成 VHH pose（表位分离）
   - 过滤表面候选点：排除与 Fab 方向角 < 35° 的点
   - 从剩余点中选支持度最高的
   - 调用 generateDisplayPose(antigen, vhhScaffold, seed=target+'|vhh')

6. 验证表位分离
   - 检查方向角 ≥ 35°（小抗原 ≥ 45°）
   - 检查锚点距离 ∈ [10Å, 0.8 × maxAntigenSpan]
   - 检查接触残基重叠率 ≤ 40%
   - 不满足时：换下一个 VHH 骨架重试，最多 3 次

7. 降级处理（见第 7 节）

8. 输出 2 个独立 PDB 文件
```

### 6.2 确定性保证

- **种子**：Fab 用 `target|fab`，VHH 用 `target|vhh`，互不影响
- **骨架选择**：SHA-256(target) % scaffoldCount 确定起始索引
- **轮转偏移**：`_scaffoldRotationOffset` 确保连续靶点不重复
- **无随机数**：除 `generateDisplayPose` 内部的种子化随机外，分配过程完全确定

---

## 7. 降级策略

### 7.1 降级级别

| 级别 | 触发条件 | 处理方式 |
|------|----------|----------|
| L0 | 正常 | 1 Fab + 1 VHH，表位分离通过 |
| L1 | 某 VHH 骨架 pose 不可接受 | 替换为下一个 VHH 骨架，最多重试 3 次 |
| L2 | 所有 VHH 骨架均 pose 失败 | 该靶点仅保留 Fab 候选，标记 `vhh_failed` |
| L3 | Fab 骨架 pose 不可接受 | 替换为下一个 Fab 骨架，最多重试 3 次 |
| L4 | 所有 Fab 骨架均 pose 失败 | 该靶点仅保留 VHH 候选，标记 `fab_failed` |
| L5 | Fab 和 VHH 均失败 | 使用 generic Fab/VHH 代表性结构预览，标记 `fallback` |
| L6 | 表位分离约束不满足（小抗原） | 将方向角阈值从 35° 降至 25°，最多降至 15° |

### 7.2 最低输出要求

- 正常情况：2 个候选（1 Fab + 1 VHH）
- 降级情况：至少 1 个候选（Fab 或 VHH 任一）
- 0 个候选时标记 `failed`，使用 generic 结构兜底

### 7.3 降级日志

```json
{
  "target": "PD-L1",
  "degradation": "L1",
  "reason": "VHH scaffold nb-7d12 pose failed, replaced with cab-lys3",
  "finalCounts": { "fab": 1, "vhh": 1 }
}
```

---

## 8. 质量验证

### 8.1 生成后验证清单

| 检查项 | 阈值 | 失败处理 |
|--------|------|----------|
| Fab pose 几何 | minDist ∈ [2.35, 4.5]Å, clashes=0 | 降级 L3 |
| VHH pose 几何 | minDist ∈ [2.35, 4.5]Å, clashes=0 | 降级 L1 |
| 方向角分离 | ≥ 35°（小抗原 ≥ 45°） | 降级 L6 |
| 锚点距离下限 | ≥ 10Å | 换 VHH 骨架 |
| 锚点距离上限 | ≤ 0.8 × maxAntigenSpan | 换 VHH 骨架 |
| 接触残基重叠 | ≤ 40% | 换 VHH 骨架 |
| 双格式覆盖 | fab=1 且 vhh=1 | 降级 L2/L4 |

### 8.2 批量统计指标

```
{
  "totalTargets": 8635,
  "successTargets": 8600,
  "failedTargets": 35,
  "dualFormatCoverage": 99.6,    // % targets with both Fab and VHH
  "avgEpitopeAngleSeparation": 47.3,
  "avgAnchorDistance": 18.6,
  "avgContactOverlap": 12.3,
  "degradationStats": {
    "L0": 8200, "L1": 350, "L2": 50, "L3": 30, "L4": 5, "L5": 0, "L6": 5
  }
}
```

---

## 9. 实现要点

### 9.1 需要修改的文件

| 文件 | 修改内容 |
|------|----------|
| `scripts/expand_model_library.js` | 替换 `selectScaffoldsForTarget` + `chooseGeneratedFormat` 为双格式分配 |
| `lib/display-pose.js` | 新增 `computeContactResidues` 导出函数（用于残基重叠率计算） |
| `lib/scaffold-matcher.js` | **新建**，实现表位分离验证和骨架选择逻辑 |

### 9.2 核心代码变更

**替换前**（当前代码）：
```javascript
const format = chooseGeneratedFormat(chainStats, antigenChains);  // 只选一种格式
const selectedScaffolds = selectScaffoldsForTarget(target.target, format, 5);  // 同格式 5 个
```

**替换后**：
```javascript
const fabScaffold = selectFabScaffold(target.target);      // 1 个 Fab
const vhhScaffold = selectVHHScaffold(target.target);      // 1 个 VHH

// 先生成 Fab pose
const fabPose = generatePoseForTarget(target, fabScaffold, antigenPdbText, antigenChains, chainStats);

// 生成 VHH pose，排除 Fab 已用的表位区域
const vhhPose = generateVHHPoseWithEpitopeSeparation(target, vhhScaffold, antigenPdbText, antigenChains, chainStats, fabPose);

// 验证表位分离
const separation = validateEpitopeSeparation(fabPose, vhhPose, maxAntigenSpan);
if (!separation.valid) {
  // 降级 L1：换 VHH 骨架重试
}
```

### 9.3 性能预估

| 步骤 | 单靶点耗时 | 8,635 靶点总耗时 |
|------|-----------|-----------------|
| 抗原 PDB 解析 | ~5ms | ~43s |
| 骨架选择 | ~1ms | ~9s |
| Fab pose 生成 | ~100ms | ~14min |
| VHH pose 生成 | ~80ms | ~11min |
| 表位分离验证 | ~5ms | ~43s |
| **总计** | ~190ms | **~26min** |

### 9.4 输出文件

每个靶点生成 2 个 PDB 文件：

```
pdb/
  {aliasPrefix}-Fab-01.pdb     ← 1 抗原 + 1 Fab（重链+轻链）
  {aliasPrefix}-VHH-01.pdb     ← 1 抗原 + 1 VHH（单域）
```

文件内 REMARK 头记录骨架来源、表位锚点、几何参数，便于追溯。

---

## 10. 规则总结

```
┌───────────────────────────────────────────┐
│     每靶点: 1 Fab + 1 VHH = 2 候选        │
│     每个PDB: 1 抗原 + 1 抗体              │
├───────────────────────────────────────────┤
│  表位分离:  方向角 ≥ 35°                   │
│            锚点距离 ≥ 10Å                  │
│            锚点距离 ≤ 0.8 × 抗原最大跨度    │
│            接触残基重叠 ≤ 40%              │
├───────────────────────────────────────────┤
│  单pose:   minDist ∈ [2.35, 4.5]Å        │
│            hardClashes = 0                │
│            Fab contacts ≥ 8, VHH ≥ 6     │
├───────────────────────────────────────────┤
│  降级:     L1 换VHH → L2 仅Fab            │
│            L3 换Fab → L4 仅VHH            │
│            L5 generic → L6 放宽角度       │
└───────────────────────────────────────────┘
```
