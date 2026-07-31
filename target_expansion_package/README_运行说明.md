# ZoonoAI 靶点结构扩充包（2026-07-30）

## 1. 交付内容

本包用于把现有本地目录（269 个去重靶点标签、273 个结构资产）扩充为可持续更新的疾病–靶点–结构清单。

### 可立即执行
- `ZoonoAI_靶点扩充与PDB下载清单_20260730.xlsx`：人工核验的总览与清单。
- `immediate_priority_targets.csv`：25 个首批靶点/抗原条目。
- `immediate_download_manifest.csv`：22 个去重结构文件；默认启用 21 个，BIRC5/Survivin 为 P2 可选。
- `download_structures.py`：断点续传、重试、SHA256 校验的下载器。
- `local_route_promotions_unique.csv`：11 个本地已有结构、只需提升路由的靶点，不应重复下载。
- `disease_gap_corrections.csv`：对原 11 类未覆盖疾病的靶点规范化与纠错。

### 全量动态生成
- `build_full_target_manifest.py`：从 Open Targets Platform 26.06 公共数据生成“全部直接疾病–人类蛋白靶点关联”，与本地目录比较，并用 RCSB/AlphaFold 自动补结构。
- `resolve_external_targets.py`：处理 Open Targets 之外的病原体抗原或其他外部靶点。
- `pathogen_antigen_seed.csv`：破伤风、疟疾、HPV16 的首批病原体抗原模板。
- `run_all.sh` / `run_all.ps1`：Codex 可直接运行的流水线。

## 2. “覆盖所有已知疾病靶点”的操作性定义

不存在一个静态、永久且无争议的“所有疾病靶点”清单。为了使结果可复现，本包采用两条数据流：

1. **人类蛋白靶点主干**  
   以 Open Targets Platform 26.06 的 `association_overall_direct` 为疾病–靶点全集，保留有直接关联分数的全部人类蛋白编码靶点；有 UniProt 映射时自动解析结构，无映射者仍保留并明确标为未解析。程序同时保留：
   - 全量 target–disease pair（Parquet）
   - 每个靶点的高分适应症摘要（CSV）
   - 与本地路由/资产的差集
   - RCSB 实验结构及 AlphaFold 预测结构回退

2. **病原体抗原扩展**  
   病原体蛋白不是 Open Targets 人类靶点主干的一部分，应从 IEDB/UniProt 等抗原数据流单独导入，再用 `resolve_external_targets.py` 解析结构。`pathogen_antigen_seed.csv` 先覆盖原报告中的 9 个抗原条目。

这一定义可随 Open Targets、RCSB、AlphaFold、IEDB 更新而重跑，优于一次性静态列表。

## 3. 立即下载

### Windows PowerShell

```powershell
python download_structures.py `
  --manifest immediate_download_manifest.csv `
  --outdir downloads/immediate_reviewed `
  --workers 6
```

默认下载 21 个经人工核验的 mmCIF 文件；P2 的 BIRC5/Survivin 默认关闭。若确需包括：

```powershell
python download_structures.py `
  --manifest immediate_download_manifest.csv `
  --outdir downloads/immediate_reviewed `
  --workers 6 `
  --include-optional
```

### Linux/macOS

```bash
python3 download_structures.py \
  --manifest immediate_download_manifest.csv \
  --outdir downloads/immediate_reviewed \
  --workers 6
```

下载器会：
- 自动重试 429/5xx 与网络中断
- 使用 `.part` 临时文件，成功后原子替换
- 跳过已存在文件
- 记录 SHA256、字节数、状态和错误
- 输出 `download_audit.jsonl` 与 `download_summary.json`

## 4. 全量人类疾病–靶点生成

```bash
python -m pip install -r requirements.txt

python build_full_target_manifest.py \
  --local-md input_snapshot/local-targets-export.md \
  --release 26.06 \
  --outdir generated/full_human_targets \
  --workers 6 \
  --max-pdb-candidates 5
```

主要输出：
- `association_pairs_all_protein_targets.parquet`
- `association_pairs_missing_targets.parquet`
- `target_expansion_full.csv`
- `download_manifest.csv`
- `local_asset_route_actions.csv`
- `unresolved_targets.csv`
- `structure_cache.json`
- `run_metadata.json`

然后只下载每个靶点排名第一的实验结构：

```bash
python download_structures.py \
  --manifest generated/full_human_targets/download_manifest.csv \
  --outdir downloads/full_human_rank1 \
  --max-rank 1 \
  --sources RCSB \
  --workers 6
```

## 5. 病原体抗原扩展

```bash
python resolve_external_targets.py \
  --input pathogen_antigen_seed.csv \
  --outdir generated/pathogen_antigen_seed \
  --workers 6
```

将来从 IEDB 导出抗原时，整理为以下列即可：
`target_id,target_name,uniprot,organism,disease_indications,priority,preferred_pdb,preferred_scope,action,notes`

IEDB 推荐筛选：
- 阳性 B-cell/antibody assay
- 抗原类型为 protein/peptide
- 明确 source organism
- 优先有 UniProt accession
- 保留疾病/宿主/表位/实验方法字段
- 同一 UniProt + 疾病去重

## 6. 结构文件策略

- **默认下载 mmCIF (`.cif.gz`)**：RCSB 已将 PDBx/mmCIF 作为规范格式，传统 `.pdb` 仅保留兼容链接。
- **RCSB 优先**：实验结构。
- **AlphaFold 回退**：无 RCSB 时使用预测结构，必须保留 pLDDT/PAE 信息，不得标为实验结构。
- **每个结构都需 scope review**：自动检索可能返回高分辨率结构域、突变体、配体复合物或抗体复合物，而非完整天然抗原。
- **大型多域/跨膜蛋白**：建模前必须检查链、残基覆盖、构建体、突变、寡聚状态和 biological assembly。
- **病原体株系**：同一抗原不同毒株/型别不可混用。
- **表位复合物**：例如 HPV16 E7 的 6APN 是 E7 肽–HLA 复合物，不是完整 E7 折叠结构。
- **无可靠结构**：PfHRP2 为低复杂度富组氨酸重复蛋白，本包明确标为无实验 PDB，避免伪造。

## 7. 本次纠错与去重重点

- `Cethrin` 是候选治疗蛋白/药物名称，不是疾病靶点；脊髓损伤条目改为 `RHOA`。
- `RTN4/Nogo-66` 配体结构采用 `2KO2`；`1P8T/1OZN` 属于 `RTN4R/NgR1` 受体，不得混用。
- `TDP-43` 官方基因符号为 `TARDBP`。
- `GBA/GCase` 官方基因符号为 `GBA1`，且本地已有 1OGS。
- `BIRC5/Survivin` 不是 SMA 核心致病靶点，降为 P2 探索项。
- HPV16 E7 不使用 HPV1a E7 的 2B9D 冒充；保存 HPV16 E7 表位–HLA 结构并明确范围。
- 11 个 `asset_only` 真缺路由靶点只需提升，不下载。
- `TNFSF7` 与现有 `CD70` 为同一靶点别名，不重复新增。

## 8. 权威来源

- Open Targets 26.06 release: https://blog.opentargets.org/26.06/
- Open Targets public S3: s3://open-targets-public-data-releases/platform/26.06/output
- Open Targets GraphQL/API docs: https://platform-docs.opentargets.org/data-access/graphql-api
- RCSB Search API: https://search.rcsb.org/
- RCSB file download: https://files.rcsb.org/download/
- RCSB Data API: https://data.rcsb.org/
- AlphaFold DB API: https://alphafold.ebi.ac.uk/api/prediction/{UniProt}
- AlphaFold DB downloads: https://alphafold.ebi.ac.uk/download
- IEDB database downloads: https://www.iedb.org/database_export_v3.php

## 9. 验收建议

Codex 下载完成后，不应只看“HTTP 成功”。建议至少输出：
1. 文件存在与非零字节
2. gzip 可解压
3. mmCIF 可解析
4. 目标 UniProt/物种/链匹配
5. 残基覆盖率
6. 突变与缺失残基
7. biological assembly
8. 是否为表位肽/结构域/完整抗原
9. SHA256
10. 本地路由别名与去重结果
