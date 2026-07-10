# 病毒分子展示库摘要

用途：本目录新增的 `VIRUSLIB-*.pdb` 文件仅作为分子模型展示素材使用，来源于公开结构数据库，不包含实验设计、医学建议或生物研究流程。

数据清单：`pdb/virus-library-manifest.json`

主要来源：
- RCSB PDB: https://www.rcsb.org/
- RCSB Data API: https://data.rcsb.org/
- RCSB file downloads: https://files.rcsb.org/

## 已下载模型

| 类别 | 覆盖内容 | PDB ID |
| --- | --- | --- |
| 流感 | HA H1-H15 | 7MFG, 7L0L, 9EI8, 5XL8, 4K64, 4WSR, 8TNL, 6V46, 1JSD, 4CYV, 6V47, 7A9D, 4KPQ, 6V48, 6V49 |
| 新冠 SARS-CoV-2 | Wuhan, D614G, Alpha, Beta, Gamma, Delta, Omicron BA.1, Omicron BA.2 Spike | 7Z3Z, 7WZ2, 7LWT, 7LYN, 7V79, 7TOU, 8DZH, 7UB0 |
| SARS one / SARS-CoV-1 | Spike | 8H16 |
| MERS | Spike | 5X5C |
| 尼帕病毒 | G attachment oligomer, prefusion F | 8K0C, 8DO4 |
| 埃博拉病毒 | Zaire GP, Sudan GP, Bundibugyo GP | 9MHA, 9N8F, 6DZM |
| 呼吸道合胞病毒 RSV | RSV A prefusion F, RSV A/B postfusion F | 5W23, 3RRR |
| HIV | HIV-1 BG505 Env, HIV-1 ConC Env, HIV-1 ZM233 Env | 4NCO, 8F7T, 9CV7 |
| 诺如病毒 | GI.1 VP1 shell, GII.1/GII.4/GII.17 VP1 P-domain | 7KJP, 6GVZ, 5IYN, 5F4O |
| 人偏肺病毒 hMPV | prefusion F, hMPV A F, postfusion F | 5WB0, 4DAG, 5L1X |
| 人副流感病毒 HPIV | HPIV3 HN, HPIV3 prefusion F | 4MZA, 8DG8 |

## 当前缺口

| 类别 | 缺口 | 说明 |
| --- | --- | --- |
| 埃博拉病毒 | Reston / Tai Forest GP | 本轮未找到可靠的 RCSB GP 展示结构；没有使用 VP24 等内部蛋白冒充 GP。 |
| 人副流感病毒 | HPIV1 / HPIV2 / HPIV4 表面蛋白 | RCSB 检索结果反复落到 HPIV3 或非人源 rubulavirus 结构；未下载错误替代物。 |
| HIV | HIV-2 Env trimer | 本轮未找到可靠的 RCSB HIV-2 Env trimer 展示结构；已下载 HIV-1 Env 代表结构。 |

## 使用说明

这些 PDB 文件位于 `pdb/` 根目录，文件名均以 `VIRUSLIB-` 开头。现有本地 PDB 接口可按文件名读取，例如：

```text
/api/pdb/local/VIRUSLIB-FLU-HA-H01-7MFG.pdb
```

## 形态和距离校验

- 流感 H9 已从 `1JSD.pdb1` 单个 HA1/HA2 原聚体改为 `1JSD.pdb2` biological assembly，表现为 Hetero 6-mer（三聚体级 HA 装配）。
- 尼帕病毒 G 已从 `2VWD` 单体头部替换为 `8K0C` oligomeric G-antibody assembly，表现为 Hetero 8-mer。
- RCSB biological assembly 中的 `MODEL/ENDMDL` 块已在本地 PDB 中展平成单一坐标集合，避免 3Dmol 只显示第一帧。
- 带抗体/Fab 的病毒复合物已做抗原-抗体最小距离检查，接触距离约 2.1-2.9 Å，未发现远离或明显穿模的展示结构。
