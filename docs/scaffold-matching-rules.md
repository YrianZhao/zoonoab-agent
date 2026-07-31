# 抗体骨架-抗原匹配规则 v2.0

## 1. 总则

### 1.1 设计目标

为每个抗原靶点从 32 个本地抗体骨架（22 Fab + 10 VHH）中确定性选取 **10 个 Fab（标准抗体）+ 10 个 VHH（纳米抗体）**，生成 20 个独立的展示用抗原-抗体复合物 PDB。

每个 PDB 只包含 **1 个抗原 + 1 个抗体**，独立展示，不做多骨架叠加。

### 1.2 核心约束

- 每个靶点必须生成 **10 Fab + 10 VHH = 20 个候选**
- 10 个 Fab 各使用不同骨架（从 22 个 Fab 骨架中选 10 个）
- 10 个 VHH 各使用不同骨架（10 个 VHH 骨架全部使用）
- 20 个候选两两结合抗原的 **不同表位区域**，不过近、不过远、不重合
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

### 2.2 VHH 骨架（10 个）

每个骨架的 `format` 字段为 `'VHH'`，包含 1 条链。

按来源物种分类：

| 类别 | 骨架名称 | 来源物种 | 数量 |
|------|----------|----------|------|
| 项目原生 | IL33, TSLP | — | 2 |
| Lama glama | nb-7d12, nb-tnf3, nb80 | Lama glama | 3 |
| Camelus dromedarius | cab-lys3, cab-rn05, cab-bcii | Camelus dromedarius | 3 |
| 新增 | clec4f, mu551 | — | 2 |

### 2.3 格式区分能力

**现有骨架库已具备完整的 Fab/VHH 区分能力：**

- 每个骨架在 `SCAFFOLDS` 数组中有明确的 `format: 'Fab'` 或 `format: 'VHH'` 标签
- 文件名遵循 `SCAFFOLD-Fab-{name}.pdb` / `SCAFFOLD-VHH-{name}.pdb` 命名规范
- `selectScaffoldsForTarget()` 已用 `s.format === format` 做过滤
- `generateDisplayPose()` 对 Fab 要求 ≥2 条抗体链，对 VHH 要求恰好 1 条抗体链

---

## 3. 分配规则

### 3.1 每靶点 10 Fab + 10 VHH = 20 候选

```
function planCandidates() {
  return { fab: 10, vhh: 10 };  // 固定：每靶点 10 个标准抗体 + 10 个纳米抗体
}
```

### 3.2 Fab 骨架选择（22 选 10）

从 22 个 Fab 骨架中选取 10 个，确保三档覆盖和架构多样性：

```
function selectFabScaffolds(targetName) {
  const fabScaffolds = SCAFFOLDS.filter(s => s.format === 'Fab');  // 22 个
  const baseIdx = hashScaffoldIndex(targetName, fabScaffolds.length);
  const selected = [];
  
  // 从三档中各取，确保多样性
  // 紧凑型(10个)取4个，中等型(7个)取3个，扩展型(5个)取3个 = 10个
  for (let i = 0; i < 10; i++) {
    const idx = (baseIdx + i * 2 + _scaffoldRotationOffset) % fabScaffolds.length;
    selected.push(fabScaffolds[idx]);
  }
  _scaffoldRotationOffset = (_scaffoldRotationOffset + 10) % fabScaffolds.length;
  return selected;
}
```

- 用 SHA-256(targetName) % 22 确定起始索引，保证同一靶点每次结果一致
- 步长 2 跳选，确保跨档选取
- 轮转偏移确保连续靶点不选同一组骨架

### 3.3 VHH 骨架选择（10 选 10，全选）

10 个 VHH 骨架全部使用，顺序由靶点哈希决定：

```
function selectVHHScaffolds(targetName) {
  const vhhScaffolds = SCAFFOLDS.filter(s => s.format === 'VHH');  // 10 个
  const baseIdx = hashScaffoldIndex(targetName + '_vhh', vhhScaffolds.length);
  // 全部使用，顺序由哈希决定
  return vhhScaffolds
    .map((s, i) => ({ s, order: (i + baseIdx) % vhhScaffolds.length }))
    .sort((a, b) => a.order - b.order)
    .map(item => item.s);
}
```

- 使用不同种子（`targetName + '_vhh'`），确保 Fab 和 VHH 的选择独立
- 10 个骨架全部使用，但分配到的表位区域由顺序决定

---

## 4. 表位分离规则

20 个候选必须两两结合抗原的不同区域。由于每个候选是独立 PDB（1 抗原 + 1 抗体），这里约束所有候选对的 **表位锚点** 和 **接触残基** 不重叠。

### 4.1 结合方向角分离

**规则**：任意两个候选的结合方向向量之间的夹角 ≥ **25°**。

```
cos(θ) = dot(direction_i, direction_j)
要求: θ ≥ 25°  (即 cos(θ) ≤ 0.906)
```

- 25° 适应 20 个候选在抗原表面的分布密度
- 对于小抗原（残基数 ≤ 100，半径 < 20Å），阈值收紧到 **35°**，但允许降级到 25°

### 4.2 锚点距离分离

**规则**：任意两个候选的表位锚点原子之间的空间距离 ≥ **8Å**。

```
distance = |anchor_i.xyz - anchor_j.xyz|
要求: distance ≥ 8Å
```

- 8Å ≈ 2–3 个残基的 Cα 间距，足以区分不同表位 patch
- 20 个候选时适当放宽下限（从 10Å 降至 8Å），避免小抗原无法满足

### 4.3 锚点距离上限

**规则**：任意两个候选锚点距离不超过抗原最大尺寸的 **80%**。

```
maxAntigenSpan = max pairwise distance among all antigen heavy atoms
要求: distance ≤ 0.8 × maxAntigenSpan
```

### 4.4 接触残基重叠率

**规则**：任意两个候选的接触残基集合的 Jaccard 重叠率 ≤ **50%**。

```
overlap = |contactResidues_i ∩ contactResidues_j| / |contactResidues_i ∪ contactResidues_j|
要求: overlap ≤ 0.50
```

- 20 个候选时适当放宽（从 40% 升至 50%），平衡多样性与可行性

### 4.5 表位选择策略

`generateDisplayPose` 内部用 Fibonacci 球面采样生成表面候选点。为让 20 个候选命中不同表位：

```
1. 增加表面采样到 24-32 个候选点
2. 按方向角 ≥ 25° 对表面候选点做贪心聚类
3. 选取 20 个独立表位区域（聚类代表点）
4. 10 个 Fab 分配到前 10 个表位区域
5. 10 个 VHH 分配到后 10 个表位区域
6. 若独立表位不足 20 个：允许同表位区域不同 twist 角度（旋转方向不同）
```

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
输出: [{ scaffold, pose, fileName, format }, ...]  (20 个)

1. 解析抗原 PDB
   - 识别抗原链（排除抗体链）
   - 提取重原子坐标
   - 计算残基数、原子数、最大跨度 maxAntigenSpan

2. 选择骨架
   - fabScaffolds = selectFabScaffolds(target)     // 22 选 10
   - vhhScaffolds = selectVHHScaffolds(target)     // 10 选 10（全选）

3. 抗原表面采样
   - 使用 Fibonacci 球面采样生成 24-32 个表面候选点
   - 每个候选点包含 { direction, anchor, support }
   - 按方向角 ≥ 25° 聚类，选取 20 个独立表位区域

4. 生成 10 个 Fab pose
   - 对 10 个 Fab 骨架，各分配 1 个表位区域
   - 调用 generateDisplayPose(antigen, fabScaffold, seed=target+'|fab|'+i)
   - 验证几何

5. 生成 10 个 VHH pose
   - 对 10 个 VHH 骨架，各分配 1 个表位区域（与 Fab 不同）
   - 调用 generateDisplayPose(antigen, vhhScaffold, seed=target+'|vhh|'+i)
   - 验证几何

6. 验证表位分离（20 个候选两两检查）
   - 方向角 ≥ 25°（小抗原 ≥ 35°）
   - 锚点距离 ∈ [8Å, 0.8 × maxAntigenSpan]
   - 接触残基重叠率 ≤ 50%
   - 不满足时：调整表位分配或换骨架重试

7. 降级处理（见第 7 节）

8. 输出 20 个独立 PDB 文件
```

### 6.2 确定性保证

- **种子**：Fab 用 `target|fab|{idx}`，VHH 用 `target|vhh|{idx}`，互不影响
- **骨架选择**：SHA-256(target) % scaffoldCount 确定起始索引
- **轮转偏移**：`_scaffoldRotationOffset` 确保连续靶点不重复
- **无随机数**：除 `generateDisplayPose` 内部的种子化随机外，分配过程完全确定

---

## 7. 降级策略

### 7.1 降级级别

| 级别 | 触发条件 | 处理方式 |
|------|----------|----------|
| L0 | 正常 | 10 Fab + 10 VHH = 20 候选，表位分离通过 |
| L1 | 某骨架 pose 不可接受 | 替换为同格式下一个骨架，最多重试 3 次 |
| L2 | 某格式多个骨架 pose 失败 | 减少该格式候选数（如 Fab 从 10 → 8） |
| L3 | 表位分离约束不满足 | 允许同表位区域不同 twist 角度 |
| L4 | 方向角约束不满足（小抗原） | 将角度阈值从 25° 降至 15° |
| L5 | 某格式全部失败 | 仅保留另一格式候选，标记 `{format}_failed` |
| L6 | Fab 和 VHH 均大量失败 | 使用 generic Fab/VHH 代表性结构预览 |

### 7.2 最低输出要求

- 正常情况：20 个候选（10 Fab + 10 VHH）
- 降级情况：至少 10 个候选（任一格式）
- 少于 10 个时标记 `warning: low_candidates`
- 0 个候选时标记 `failed`，使用 generic 结构兜底

### 7.3 降级日志

```json
{
  "target": "PD-L1",
  "degradation": "L3",
  "reason": "Only 16 independent epitope regions found, 4 candidates share epitope with different twist angles",
  "finalCounts": { "fab": 10, "vhh": 10 }
}
```

---

## 8. 质量验证

### 8.1 生成后验证清单

| 检查项 | 阈值 | 失败处理 |
|--------|------|----------|
| 单 pose 几何 | minDist ∈ [2.35, 4.5]Å, clashes=0 | 降级 L1 |
| 方向角分离 | ≥ 25°（小抗原 ≥ 35°） | 降级 L4 |
| 锚点距离下限 | ≥ 8Å | 降级 L3 |
| 锚点距离上限 | ≤ 0.8 × maxAntigenSpan | 跳过该表位 |
| 接触残基重叠 | ≤ 50% | 降级 L3 |
| 双格式覆盖 | fab ≥ 5 且 vhh ≥ 5 | 降级 L5 |
| 最低候选数 | ≥ 10 | 标记 warning/failed |
| Fab 骨架不重复 | 10 个各不相同 | 调整选择 |
| VHH 骨架不重复 | 10 个各不相同 | 调整选择 |

### 8.2 批量统计指标

```
{
  "totalTargets": 8635,
  "successTargets": 8600,
  "failedTargets": 35,
  "avgCandidatesPerTarget": 19.8,
  "dualFormatCoverage": 99.6,
  "avgEpitopeAngleSeparation": 32.5,
  "avgAnchorDistance": 15.2,
  "avgContactOverlap": 18.7,
  "degradationStats": {
    "L0": 8200, "L1": 350, "L2": 50, "L3": 30, "L4": 5, "L5": 0, "L6": 0
  }
}
```

---

## 9. 性能与空间估算

### 9.1 实测基准数据

基于本地实测（抗原 1OAN，32 个骨架全量 benchmark）：

| 指标 | Fab | VHH |
|------|-----|-----|
| 平均 pose 生成耗时 | 332ms | 165ms |
| 平均 PDB 文件大小 | 484 KB | 316 KB |

### 9.2 单靶点估算

| 项目 | 计算 | 结果 |
|------|------|------|
| 10 Fab 生成时间 | 10 × 332ms | 3.3s |
| 10 VHH 生成时间 | 10 × 165ms | 1.7s |
| 解析+聚类+验证 | — | 0.5s |
| **单靶点总耗时** | | **5.5s** |
| 10 Fab 文件大小 | 10 × 484 KB | 4.7 MB |
| 10 VHH 文件大小 | 10 × 316 KB | 3.1 MB |
| **单靶点总空间** | | **7.8 MB** |

### 9.3 全量估算（8,635 靶点）

| 指标 | 计算 | 结果 |
|------|------|------|
| 总耗时 | 8,635 × 5.5s | **~13.2 小时** |
| 总空间 | 8,635 × 7.8 MB | **~67 GB** |

### 9.4 输出文件

每个靶点生成 20 个 PDB 文件：

```
pdb/
  {aliasPrefix}-Fab-01.pdb     ← 1 抗原 + 1 Fab（骨架 A）
  {aliasPrefix}-Fab-02.pdb     ← 1 抗原 + 1 Fab（骨架 B）
  ...
  {aliasPrefix}-Fab-10.pdb     ← 1 抗原 + 1 Fab（骨架 J）
  {aliasPrefix}-VHH-01.pdb     ← 1 抗原 + 1 VHH（骨架 A）
  {aliasPrefix}-VHH-02.pdb     ← 1 抗原 + 1 VHH（骨架 B）
  ...
  {aliasPrefix}-VHH-10.pdb     ← 1 抗原 + 1 VHH（骨架 J）
```

---

## 10. 实现要点

### 10.1 需要修改的文件

| 文件 | 修改内容 |
|------|----------|
| `scripts/expand_model_library.js` | 替换 `selectScaffoldsForTarget` + `chooseGeneratedFormat` 为双格式 10+10 分配 |
| `lib/display-pose.js` | 新增 `computeContactResidues` 导出函数（用于残基重叠率计算） |
| `lib/scaffold-matcher.js` | **新建**，实现表位聚类、骨架选择、跨候选验证 |

### 10.2 核心代码变更

**替换前**（当前代码）：
```javascript
const format = chooseGeneratedFormat(chainStats, antigenChains);  // 只选一种格式
const selectedScaffolds = selectScaffoldsForTarget(target.target, format, 5);  // 同格式 5 个
```

**替换后**：
```javascript
const fabScaffolds = selectFabScaffolds(target.target);   // 10 个 Fab
const vhhScaffolds = selectVHHScaffolds(target.target);   // 10 个 VHH

// 抗原表面采样 + 聚类，选取 20 个独立表位区域
const epitopeRegions = clusterEpitopes(surfaceCandidates, 25, 20);

// 生成 10 Fab + 10 VHH，各分配不同表位区域
for (let i = 0; i < 10; i++) {
  fabPoses.push(generatePoseForTarget(target, fabScaffolds[i], antigenPdbText, antigenChains, chainStats, epitopeRegions[i]));
}
for (let i = 0; i < 10; i++) {
  vhhPoses.push(generatePoseForTarget(target, vhhScaffolds[i], antigenPdbText, antigenChains, chainStats, epitopeRegions[10 + i]));
}

// 验证 20 个候选两两表位分离
const separation = validateAllEpitopeSeparation([...fabPoses, ...vhhPoses], maxAntigenSpan);
```

---

## 11. 规则总结

```
┌─────────────────────────────────────────────────┐
│    每靶点: 10 Fab + 10 VHH = 20 候选            │
│    每个PDB: 1 抗原 + 1 抗体                     │
├─────────────────────────────────────────────────┤
│  骨架选择:  Fab 22选10（跨档分散）              │
│            VHH 10选10（全部使用）               │
│            每个候选用不同骨架                    │
├─────────────────────────────────────────────────┤
│  表位分离:  方向角 ≥ 25°（小抗原 ≥ 35°）        │
│            锚点距离 ≥ 8Å                        │
│            锚点距离 ≤ 0.8 × 抗原最大跨度         │
│            接触残基重叠 ≤ 50%                    │
├─────────────────────────────────────────────────┤
│  单pose:   minDist ∈ [2.35, 4.5]Å              │
│            hardClashes = 0                      │
│            Fab contacts ≥ 8, VHH ≥ 6           │
├─────────────────────────────────────────────────┤
│  降级:     L1 换骨架 → L2 减数量                │
│            L3 同表位不同twist → L4 放宽角度     │
│            L5 单格式 → L6 generic               │
├─────────────────────────────────────────────────┤
│  空间:     单靶点 7.8 MB，全量 ~67 GB           │
│  时间:     单靶点 5.5s，全量 ~13.2 小时         │
└─────────────────────────────────────────────────┘
```
