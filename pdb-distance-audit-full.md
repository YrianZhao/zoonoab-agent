# PDB 抗原抗体距离全量审计报告

**扫描日期:** 2026-08-05T12:41:39.614Z
**检测方法:** 实际原子坐标解析 + 质心距离 + 视觉间隙 + 最小原子对距离

---

## 总体统计

| 指标 | 数量 | 占比 |
|------|------|------|
| **总复合物** | **2056** | 100% |
| 正常 (OK) | 1128 | 54.9% |
| 警告 (WARNING) | 456 | 22.2% |
| 距离过远 (BAD_DISTANCE) | 0 | 0.0% |
| 视觉漂浮 (BAD_VISUAL) | 333 | 16.2% |
| 原子不足 | 139 | - |

---

## 问题文件清单 (333 个)

### 按目录分布

| 目录 | 问题数 |
|------|--------|
| `pdb` | 289 |
| `pdb/antigen-display-pose` | 44 |

### 按靶点分布 (Top 30)

| 靶点 | 问题数 | 最大间隙 (Å) |
|------|--------|-------------|
| unknown | 333 | 43.9 |

### 完整问题清单

| 文件 | 状态 | CoM (Å) | 间隙 (Å) | minDist (Å) | 靶点 | 格式 |
|------|------|---------|---------|------------|------|------|
| `pdb/C5-VHH-09.pdb` | BAD_VISUAL | 111.5 | 43.9 | 2.35 | - | VHH |
| `pdb/PEDV-Spike-VHH-01.pdb` | BAD_VISUAL | 92.2 | 31.2 | 1.85 | - | VHH |
| `pdb/LEPR-Fab-05.pdb` | BAD_VISUAL | 88.7 | 24 | 2.92 | - | Fab |
| `pdb/RSVF-VHH-04.pdb` | BAD_VISUAL | 70 | 23.8 | 1.77 | - | VHH |
| `pdb/IL31-VHH-03.pdb` | BAD_VISUAL | 70.1 | 23 | 1.89 | - | VHH |
| `pdb/ROR1-Fab-02.pdb` | BAD_VISUAL | 70.2 | 22.8 | 2.35 | - | Fab |
| `pdb/RSVF-VHH-08.pdb` | BAD_VISUAL | 68.9 | 22.7 | 2.35 | - | VHH |
| `pdb/CD74-VHH-08.pdb` | BAD_VISUAL | 76.2 | 22 | 2.35 | - | VHH |
| `pdb/PEDV-Spike-VHH-10.pdb` | BAD_VISUAL | 82.9 | 22 | 2.35 | - | VHH |
| `pdb/C5-VHH-06.pdb` | BAD_VISUAL | 89 | 21.4 | 2.35 | - | VHH |
| `pdb/CD123-VHH-07.pdb` | BAD_VISUAL | 87.1 | 20.9 | 2.35 | - | VHH |
| `pdb/CD123-VHH-10.pdb` | BAD_VISUAL | 86.9 | 20.7 | 2.35 | - | VHH |
| `pdb/TSHR-VHH-09.pdb` | BAD_VISUAL | 69.6 | 20.7 | 2.35 | - | VHH |
| `pdb/antigen-display-pose/MMP13-Fab-4FU4.pdb` | BAD_VISUAL | 78.8 | 20.5 | 2.35 | - | Fab |
| `pdb/PEDV-Spike-VHH-07.pdb` | BAD_VISUAL | 80.5 | 19.6 | 2.35 | - | VHH |
| `pdb/FPV-VP2-VHH-06.pdb` | BAD_VISUAL | 61.4 | 19.3 | 2.35 | - | VHH |
| `pdb/antigen-display-pose/SERPING1-Fab-5DU3.pdb` | BAD_VISUAL | 75.2 | 18.7 | 1.99 | - | Fab |
| `pdb/ADENO-HEXON-VHH-05.pdb` | BAD_VISUAL | 75.3 | 18.6 | 2.35 | - | VHH |
| `pdb/CD74-Fab-03.pdb` | BAD_VISUAL | 70.8 | 18.5 | 2.35 | - | Fab |
| `pdb/CD74-VHH-01.pdb` | BAD_VISUAL | 72.8 | 18.5 | 2.35 | - | VHH |
| `pdb/HER2-VHH-02.pdb` | BAD_VISUAL | 62.9 | 17.9 | 2.35 | - | VHH |
| `pdb/ADENO-HEXON-VHH-02.pdb` | BAD_VISUAL | 74.5 | 17.8 | 2.35 | - | VHH |
| `pdb/TSHR-VHH-03.pdb` | BAD_VISUAL | 66.7 | 17.8 | 2.35 | - | VHH |
| `pdb/HSV-GD-VHH-08.pdb` | BAD_VISUAL | 56.6 | 17.7 | 2.35 | - | VHH |
| `pdb/antigen-display-pose/DST-Fab-3GJO.pdb` | BAD_VISUAL | 67.6 | 17.3 | 2.35 | - | Fab |
| `pdb/DAT-Fab-03.pdb` | BAD_VISUAL | 65.4 | 17 | 1.71 | - | Fab |
| `pdb/IL4RA-VHH-09.pdb` | BAD_VISUAL | 50.2 | 16.8 | 2.35 | - | VHH |
| `pdb/METABOLIB-HUMAN-MSTN-FAB-RCSB-5F3H.pdb` | BAD_VISUAL | 62 | 16.7 | 2.4 | - | - |
| `pdb/MSLN-VHH-08.pdb` | BAD_VISUAL | 59.2 | 16.7 | 2.35 | - | VHH |
| `pdb/antigen-display-pose/APOA1-Fab-1AV1.pdb` | BAD_VISUAL | 90.9 | 16.6 | 2.35 | - | Fab |
| `pdb/TSHR-VHH-06.pdb` | BAD_VISUAL | 65.2 | 16.3 | 2.35 | - | VHH |
| `pdb/GITR-Fab-04.pdb` | BAD_VISUAL | 69.9 | 15.9 | 2.35 | - | Fab |
| `pdb/FGFR3-VHH-07.pdb` | BAD_VISUAL | 56.9 | 15.4 | 2.35 | - | VHH |
| `pdb/MSLN-VHH-10.pdb` | BAD_VISUAL | 57.4 | 14.9 | 1.96 | - | VHH |
| `pdb/IgE-VHH-08.pdb` | BAD_VISUAL | 60.1 | 14.7 | 2.35 | - | VHH |
| `pdb/PCSK9-VHH-04.pdb` | BAD_VISUAL | 53.3 | 14.5 | 1.95 | - | VHH |
| `pdb/CD123-VHH-02.pdb` | BAD_VISUAL | 80.6 | 14.4 | 2.35 | - | VHH |
| `pdb/MSLN-VHH-07.pdb` | BAD_VISUAL | 56.4 | 13.9 | 1.68 | - | VHH |
| `pdb/FluHA-VHH-06.pdb` | BAD_VISUAL | 103.1 | 13.8 | 1.93 | - | VHH |
| `pdb/PRLR-VHH-06.pdb` | BAD_VISUAL | 50.6 | 13.8 | 1.93 | - | VHH |
| `pdb/C5-Fab-01.pdb` | BAD_VISUAL | 92.7 | 13.7 | 1.91 | - | Fab |
| `pdb/C5-Fab-02.pdb` | BAD_VISUAL | 92.7 | 13.7 | 1.91 | - | Fab |
| `pdb/C5-Fab-03.pdb` | BAD_VISUAL | 92.7 | 13.7 | 1.91 | - | Fab |
| `pdb/C5-Fab-04.pdb` | BAD_VISUAL | 92.7 | 13.7 | 1.91 | - | Fab |
| `pdb/C5-Fab-05.pdb` | BAD_VISUAL | 92.7 | 13.7 | 1.91 | - | Fab |
| `pdb/C5-Fab-06.pdb` | BAD_VISUAL | 92.7 | 13.7 | 1.91 | - | Fab |
| `pdb/C5-Fab-07.pdb` | BAD_VISUAL | 92.7 | 13.7 | 1.91 | - | Fab |
| `pdb/C5-Fab-08.pdb` | BAD_VISUAL | 92.7 | 13.7 | 1.91 | - | Fab |
| `pdb/C5-Fab-09.pdb` | BAD_VISUAL | 92.7 | 13.7 | 1.91 | - | Fab |
| `pdb/C5-Fab-10.pdb` | BAD_VISUAL | 92.7 | 13.7 | 1.91 | - | Fab |
| `pdb/IL17RA-Fab-05.pdb` | BAD_VISUAL | 75.8 | 13.6 | 1.8 | - | Fab |
| `pdb/FOLR1-Fab-01.pdb` | BAD_VISUAL | 83.9 | 13.5 | 1.53 | - | Fab |
| `pdb/B7H6-VHH-08.pdb` | BAD_VISUAL | 51.3 | 13.3 | 2.35 | - | VHH |
| `pdb/ANGPTL3-Met-VHH-10.pdb` | BAD_VISUAL | 52.3 | 12.8 | 2.35 | - | VHH |
| `pdb/IL31-VHH-06.pdb` | BAD_VISUAL | 59.8 | 12.7 | 1.93 | - | VHH |
| `pdb/TSHR-VHH-04.pdb` | BAD_VISUAL | 61.7 | 12.7 | 2.35 | - | VHH |
| `pdb/ADENO-HEXON-VHH-10.pdb` | BAD_VISUAL | 69.3 | 12.6 | 1.94 | - | VHH |
| `pdb/C5-VHH-01.pdb` | BAD_VISUAL | 80.2 | 12.6 | 1.93 | - | VHH |
| `pdb/A4B7-Fab-01.pdb` | BAD_VISUAL | 70.6 | 12.3 | 1.97 | - | Fab |
| `pdb/HER2-VHH-06.pdb` | BAD_VISUAL | 57.3 | 12.2 | 1.85 | - | VHH |
| `pdb/IL31-VHH-04.pdb` | BAD_VISUAL | 59.1 | 12 | 1.97 | - | VHH |
| `pdb/IL23-VHH-07.pdb` | BAD_VISUAL | 53.4 | 11.9 | 1.95 | - | VHH |
| `pdb/IL23-VHH-08.pdb` | BAD_VISUAL | 53.4 | 11.9 | 2.35 | - | VHH |
| `pdb/RSVF-VHH-05.pdb` | BAD_VISUAL | 58.1 | 11.9 | 1.9 | - | VHH |
| `pdb/FGFR3-VHH-04.pdb` | BAD_VISUAL | 53.2 | 11.8 | 1.84 | - | VHH |
| `pdb/IgE-VHH-09.pdb` | BAD_VISUAL | 57.3 | 11.8 | 2.35 | - | VHH |
| `pdb/PCSK9-VHH-05.pdb` | BAD_VISUAL | 50.6 | 11.7 | 2.35 | - | VHH |
| `pdb/GITR-Fab-02.pdb` | BAD_VISUAL | 65.2 | 11.6 | 2.35 | - | Fab |
| `pdb/ANGPTL3-Met-VHH-08.pdb` | BAD_VISUAL | 51 | 11.5 | 1.94 | - | VHH |
| `pdb/ANGPTL3-Met-VHH-01.pdb` | BAD_VISUAL | 50.9 | 11.4 | 1.81 | - | VHH |
| `pdb/FOLR1-Fab-05.pdb` | BAD_VISUAL | 81 | 11.3 | 1.16 | - | Fab |
| `pdb/SSTR2-Fab-05.pdb` | BAD_VISUAL | 65.1 | 11.3 | 1.94 | - | Fab |
| `pdb/antigen-display-pose/GABRB2-Fab-6X3U.pdb` | BAD_VISUAL | 73.6 | 11.3 | 2.35 | - | Fab |
| `pdb/CD74-VHH-10.pdb` | BAD_VISUAL | 65.4 | 11.2 | 1.9 | - | VHH |
| `pdb/HSV-GD-VHH-09.pdb` | BAD_VISUAL | 50.1 | 11.2 | 1.86 | - | VHH |
| `pdb/antigen-display-pose/IMPDH1-Fab-1JCN.pdb` | BAD_VISUAL | 79.2 | 11.2 | 1.94 | - | Fab |
| `pdb/ANGPTL3-Met-VHH-07.pdb` | BAD_VISUAL | 50.6 | 11.1 | 1.87 | - | VHH |
| `pdb/BACE1-Fab-05.pdb` | BAD_VISUAL | 69.7 | 11.1 | 1.96 | - | Fab |
| `pdb/CD27-Fab-04.pdb` | BAD_VISUAL | 74.4 | 11.1 | 2.55 | - | Fab |
| `pdb/CD33-VHH-02.pdb` | BAD_VISUAL | 51.3 | 11.1 | 1.85 | - | VHH |
| `pdb/CD74-Fab-05.pdb` | BAD_VISUAL | 76.1 | 11.1 | 1.94 | - | Fab |
| `pdb/FPV-VP2-VHH-04.pdb` | BAD_VISUAL | 53.2 | 11.1 | 1.97 | - | VHH |
| `pdb/FluHA-VHH-05.pdb` | BAD_VISUAL | 100.4 | 11.1 | 1.8 | - | VHH |
| `pdb/antigen-display-pose/IL18-Fab-3WO2.pdb` | BAD_VISUAL | 65.3 | 11.1 | 1.88 | - | Fab |
| `pdb/ADENO-HEXON-VHH-04.pdb` | BAD_VISUAL | 67.7 | 11 | 1.93 | - | VHH |
| `pdb/CD22-VHH-04.pdb` | BAD_VISUAL | 58 | 11 | 1.81 | - | VHH |
| `pdb/GJB2-Fab-08.pdb` | BAD_VISUAL | 67.2 | 11 | 2.25 | - | Fab |
| `pdb/RSVF-VHH-06.pdb` | BAD_VISUAL | 57.1 | 10.9 | 1.87 | - | VHH |
| `pdb/CD74-Fab-01.pdb` | BAD_VISUAL | 75.5 | 10.8 | 1.94 | - | Fab |
| `pdb/FPV-VP2-VHH-02.pdb` | BAD_VISUAL | 52.8 | 10.8 | 1.83 | - | VHH |
| `pdb/RSVF-VHH-01.pdb` | BAD_VISUAL | 56.9 | 10.7 | 2.35 | - | VHH |
| `pdb/ANGPTL3-CV-VHH-02.pdb` | BAD_VISUAL | 50.1 | 10.6 | 1.98 | - | VHH |
| `pdb/CD123-VHH-08.pdb` | BAD_VISUAL | 76.8 | 10.6 | 1.86 | - | VHH |
| `pdb/CD74-VHH-03.pdb` | BAD_VISUAL | 64.8 | 10.6 | 2.35 | - | VHH |
| `pdb/GPC2-VHH-03.pdb` | BAD_VISUAL | 56.8 | 10.6 | 2.35 | - | VHH |
| `pdb/LEPR-Fab-03.pdb` | BAD_VISUAL | 74.8 | 10.6 | 1.95 | - | Fab |
| `pdb/LGR5-Fab-05.pdb` | BAD_VISUAL | 73.2 | 10.6 | 1.99 | - | Fab |
| `pdb/EGFR-VHH-09.pdb` | BAD_VISUAL | 59.3 | 10.5 | 1.85 | - | VHH |
| `pdb/BACE1-Fab-02.pdb` | BAD_VISUAL | 69.3 | 10.4 | 1.99 | - | Fab |
| `pdb/CD123-VHH-01.pdb` | BAD_VISUAL | 76.6 | 10.4 | 1.98 | - | VHH |
| `pdb/EGFR-VHH-05.pdb` | BAD_VISUAL | 59.2 | 10.4 | 2.35 | - | VHH |
| `pdb/FGFR3-VHH-10.pdb` | BAD_VISUAL | 51.8 | 10.4 | 1.87 | - | VHH |
| `pdb/FPV-VP2-VHH-01.pdb` | BAD_VISUAL | 52.5 | 10.4 | 2.35 | - | VHH |
| `pdb/PEDV-Spike-VHH-09.pdb` | BAD_VISUAL | 71.4 | 10.4 | 1.97 | - | VHH |
| `pdb/ADENO-HEXON-Fab-07.pdb` | BAD_VISUAL | 77.5 | 10.3 | 1.99 | - | Fab |
| `pdb/CD123-VHH-06.pdb` | BAD_VISUAL | 76.5 | 10.3 | 1.95 | - | VHH |
| `pdb/CD33-VHH-03.pdb` | BAD_VISUAL | 50.4 | 10.2 | 2 | - | VHH |
| `pdb/EGFR-VHH-08.pdb` | BAD_VISUAL | 58.9 | 10.2 | 1.96 | - | VHH |
| `pdb/FOLR1-Fab-04.pdb` | BAD_VISUAL | 80.3 | 10.2 | 1.85 | - | Fab |
| `pdb/GJB2-VHH-06.pdb` | BAD_VISUAL | 55.9 | 10.1 | 1.92 | - | VHH |
| `pdb/PEDV-Spike-VHH-05.pdb` | BAD_VISUAL | 71 | 10.1 | 1.92 | - | VHH |
| `pdb/FGFR3-VHH-08.pdb` | BAD_VISUAL | 51.4 | 10 | 2.35 | - | VHH |
| `pdb/LEPR-Fab-01.pdb` | BAD_VISUAL | 73.9 | 10 | 1.83 | - | Fab |
| `pdb/antigen-display-pose/TNNI3-Fab-1J1E.pdb` | BAD_VISUAL | 80.3 | 9.8 | 2.35 | - | Fab |
| `pdb/C5-VHH-05.pdb` | BAD_VISUAL | 77.2 | 9.6 | 1.92 | - | VHH |
| `pdb/FPV-VP2-VHH-10.pdb` | BAD_VISUAL | 51.7 | 9.6 | 2.35 | - | VHH |
| `pdb/FluHA-VHH-01.pdb` | BAD_VISUAL | 98.9 | 9.6 | 2.35 | - | VHH |
| `pdb/IL23-VHH-01.pdb` | BAD_VISUAL | 51.1 | 9.6 | 2.35 | - | VHH |
| `pdb/MSLN-VHH-02.pdb` | BAD_VISUAL | 52.1 | 9.6 | 1.5 | - | VHH |
| `pdb/IgE-VHH-04.pdb` | BAD_VISUAL | 54.8 | 9.4 | 2.35 | - | VHH |
| `pdb/PEDV-Spike-VHH-02.pdb` | BAD_VISUAL | 70.3 | 9.4 | 2 | - | VHH |
| `pdb/GJB2-VHH-03.pdb` | BAD_VISUAL | 55.1 | 9.3 | 2.35 | - | VHH |
| `pdb/PEDV-Spike-VHH-04.pdb` | BAD_VISUAL | 70.3 | 9.3 | 1.83 | - | VHH |
| `pdb/ADENO-HEXON-VHH-09.pdb` | BAD_VISUAL | 65.9 | 9.2 | 1.9 | - | VHH |
| `pdb/antigen-display-pose/BEST1-Fab-9EGT.pdb` | BAD_VISUAL | 68.9 | 9.2 | 1.82 | - | Fab |
| `pdb/ADENO-HEXON-VHH-03.pdb` | BAD_VISUAL | 65.8 | 9.1 | 1.87 | - | VHH |
| `pdb/ADENO-HEXON-VHH-07.pdb` | BAD_VISUAL | 65.8 | 9.1 | 1.81 | - | VHH |
| `pdb/PEDV-Spike-VHH-06.pdb` | BAD_VISUAL | 70 | 9.1 | 1.9 | - | VHH |
| `pdb/antigen-display-pose/TOP2A-Fab-4FM9.pdb` | BAD_VISUAL | 66.2 | 9.1 | 1.84 | - | Fab |
| `pdb/FPV-VP2-VHH-05.pdb` | BAD_VISUAL | 51 | 8.9 | 1.97 | - | VHH |
| `pdb/GJB2-Fab-01.pdb` | BAD_VISUAL | 65.2 | 8.9 | 1.9 | - | Fab |
| `pdb/GJB2-Fab-02.pdb` | BAD_VISUAL | 65.1 | 8.9 | 1.94 | - | Fab |
| `pdb/HER2-VHH-07.pdb` | BAD_VISUAL | 54 | 8.9 | 1.85 | - | VHH |
| `pdb/IL23-VHH-09.pdb` | BAD_VISUAL | 50.3 | 8.8 | 1.82 | - | VHH |
| `pdb/TSHR-VHH-08.pdb` | BAD_VISUAL | 57.7 | 8.8 | 1.6 | - | VHH |
| `pdb/IL31-VHH-09.pdb` | BAD_VISUAL | 55.7 | 8.7 | 1.92 | - | VHH |
| `pdb/IL31-Fab-05.pdb` | BAD_VISUAL | 77.2 | 8.6 | 1.81 | - | Fab |
| `pdb/GJB2-VHH-01.pdb` | BAD_VISUAL | 54.3 | 8.5 | 2.35 | - | VHH |
| `pdb/GPC2-VHH-09.pdb` | BAD_VISUAL | 54.6 | 8.5 | 1.81 | - | VHH |
| `pdb/PEDV-Spike-VHH-08.pdb` | BAD_VISUAL | 69.5 | 8.5 | 1.99 | - | VHH |
| `pdb/antigen-display-pose/CHRNA1-Fab-9GU3.pdb` | BAD_VISUAL | 68.5 | 8.5 | 1.84 | - | Fab |
| `pdb/FPV-VP2-VHH-09.pdb` | BAD_VISUAL | 50.5 | 8.4 | 1.88 | - | VHH |
| `pdb/GJB2-VHH-08.pdb` | BAD_VISUAL | 54.1 | 8.4 | 2.35 | - | VHH |
| `pdb/C5-VHH-02.pdb` | BAD_VISUAL | 75.9 | 8.3 | 1.92 | - | VHH |
| `pdb/GPC2-VHH-04.pdb` | BAD_VISUAL | 54.4 | 8.3 | 2.35 | - | VHH |
| `pdb/antigen-display-pose/DICER1-Fab-5ZAL.pdb` | BAD_VISUAL | 77 | 8.3 | 1.98 | - | Fab |
| `pdb/ENDOCRINELIB-HUMAN-GLP1R-RCSB-6LN2.pdb` | BAD_VISUAL | 60.7 | 8 | 1.81 | - | - |
| `pdb/GJB2-VHH-09.pdb` | BAD_VISUAL | 53.7 | 8 | 2.35 | - | VHH |
| `pdb/GPC2-VHH-01.pdb` | BAD_VISUAL | 54.2 | 8 | 1.96 | - | VHH |
| `pdb/RSVF-VHH-03.pdb` | BAD_VISUAL | 54.2 | 8 | 1.81 | - | VHH |
| `pdb/antigen-display-pose/ATM-Fab-6K9L.pdb` | BAD_VISUAL | 97.8 | 8 | 1.89 | - | Fab |
| `pdb/antigen-display-pose/KITLG-Fab-2E9W.pdb` | BAD_VISUAL | 84.4 | 8 | 1.94 | - | Fab |
| `pdb/antigen-display-pose/TLR7-Fab-7CYN.pdb` | BAD_VISUAL | 75 | 8 | 1.96 | - | Fab |
| `pdb/antigen-display-pose/ERBB3-Fab-1M6B.pdb` | BAD_VISUAL | 91.9 | 7.9 | 1.91 | - | Fab |
| `pdb/antigen-display-pose/GABRB3-Fab-4COF.pdb` | BAD_VISUAL | 70.4 | 7.9 | 1.83 | - | Fab |
| `pdb/antigen-display-pose/GUCY2C-Fab-8FX4.pdb` | BAD_VISUAL | 73.1 | 7.9 | 1.92 | - | Fab |
| `pdb/antigen-display-pose/HTR2A-Fab-6A93.pdb` | BAD_VISUAL | 67.4 | 7.9 | 1.81 | - | Fab |
| `pdb/antigen-display-pose/SCN1A-Fab-7DTD.pdb` | BAD_VISUAL | 69.9 | 7.9 | 1.84 | - | Fab |
| `pdb/CD70-Fab-02.pdb` | BAD_VISUAL | 116.4 | 7.8 | 1.92 | - | Fab |
| `pdb/LEPR-Fab-02.pdb` | BAD_VISUAL | 71.9 | 7.8 | 1.97 | - | Fab |
| `pdb/PEDV-Spike-VHH-03.pdb` | BAD_VISUAL | 68.8 | 7.8 | 1.95 | - | VHH |
| `pdb/PSMA-Fab-02.pdb` | BAD_VISUAL | 78.1 | 7.7 | 1.88 | - | Fab |
| `pdb/MSLN-VHH-06.pdb` | BAD_VISUAL | 50.1 | 7.6 | 1.25 | - | VHH |
| `pdb/TSHR-VHH-07.pdb` | BAD_VISUAL | 56.6 | 7.6 | 1.86 | - | VHH |
| `pdb/CD22-VHH-10.pdb` | BAD_VISUAL | 54.5 | 7.5 | 2.35 | - | VHH |
| `pdb/FluHA-VHH-10.pdb` | BAD_VISUAL | 96.8 | 7.5 | 1.9 | - | VHH |
| `pdb/SOLIDLIB-HUMAN-PSMA-VHH-RCSB-9HVL.pdb` | BAD_VISUAL | 55.8 | 7.5 | 1.92 | - | VHH |
| `pdb/CD123-VHH-09.pdb` | BAD_VISUAL | 73.6 | 7.4 | 1.96 | - | VHH |
| `pdb/LGR5-Fab-02.pdb` | BAD_VISUAL | 69.5 | 7.4 | 1.9 | - | Fab |
| `pdb/SOLIDLIB-HUMAN-PSMA-VHH-RCSB-9HVI.pdb` | BAD_VISUAL | 56.2 | 7.4 | 1.83 | - | VHH |
| `pdb/antigen-display-pose/ABCB4-Fab-6S7P.pdb` | BAD_VISUAL | 69.3 | 7.4 | 1.88 | - | Fab |
| `pdb/antigen-display-pose/NR3C1-Fab-4P6X.pdb` | BAD_VISUAL | 71.7 | 7.4 | 1.94 | - | Fab |
| `pdb/antigen-display-pose/STAG2-Fab-4PK7.pdb` | BAD_VISUAL | 71.9 | 7.4 | 1.94 | - | Fab |
| `pdb/CD22-VHH-03.pdb` | BAD_VISUAL | 54.3 | 7.3 | 1.88 | - | VHH |
| `pdb/CD22-VHH-09.pdb` | BAD_VISUAL | 54.3 | 7.3 | 1.86 | - | VHH |
| `pdb/GJB2-VHH-05.pdb` | BAD_VISUAL | 53 | 7.3 | 1.91 | - | VHH |
| `pdb/SOLIDLIB-HUMAN-MET-FAB-RCSB-6I04.pdb` | BAD_VISUAL | 53.2 | 7.3 | 1.87 | - | - |
| `pdb/ADENO-HEXON-Fab-10.pdb` | BAD_VISUAL | 74.4 | 7.2 | 1.99 | - | Fab |
| `pdb/CD74-VHH-02.pdb` | BAD_VISUAL | 61.5 | 7.2 | 1.87 | - | VHH |
| `pdb/GPC2-VHH-10.pdb` | BAD_VISUAL | 53.4 | 7.2 | 1.87 | - | VHH |
| `pdb/RSVF-VHH-09.pdb` | BAD_VISUAL | 53.4 | 7.2 | 1.98 | - | VHH |
| `pdb/BACE1-Fab-01.pdb` | BAD_VISUAL | 65.1 | 7.1 | 1.85 | - | Fab |
| `pdb/ADENO-HEXON-VHH-01.pdb` | BAD_VISUAL | 59.4 | 7 | 1.89 | - | VHH |
| `pdb/CD22-VHH-02.pdb` | BAD_VISUAL | 54 | 7 | 1.97 | - | VHH |
| `pdb/CD22-VHH-08.pdb` | BAD_VISUAL | 54 | 7 | 1.91 | - | VHH |
| `pdb/GJB2-VHH-10.pdb` | BAD_VISUAL | 52.8 | 7 | 1.93 | - | VHH |
| `pdb/HER2-VHH-01.pdb` | BAD_VISUAL | 52.1 | 7 | 1.81 | - | VHH |
| `pdb/IL17RA-Fab-03.pdb` | BAD_VISUAL | 75.4 | 7 | 1.95 | - | Fab |
| `pdb/IL31-VHH-01.pdb` | BAD_VISUAL | 54.1 | 7 | 1.8 | - | VHH |
| `pdb/IgE-VHH-06.pdb` | BAD_VISUAL | 52.4 | 7 | 1.81 | - | VHH |
| `pdb/CD74-VHH-07.pdb` | BAD_VISUAL | 61.2 | 6.9 | 1.98 | - | VHH |
| `pdb/FluHA-VHH-08.pdb` | BAD_VISUAL | 96.2 | 6.9 | 1.92 | - | VHH |
| `pdb/GPC2-VHH-08.pdb` | BAD_VISUAL | 53.1 | 6.9 | 2.35 | - | VHH |
| `pdb/HER2-VHH-03.pdb` | BAD_VISUAL | 51.9 | 6.9 | 1.96 | - | VHH |
| `pdb/M2e-VHH-03.pdb` | BAD_VISUAL | 51.1 | 6.9 | 2.35 | - | VHH |
| `pdb/TSHR-VHH-10.pdb` | BAD_VISUAL | 55.8 | 6.8 | 1.47 | - | VHH |
| `pdb/antigen-display-pose/IL21-Fab-3TGX.pdb` | BAD_VISUAL | 99.5 | 6.8 | 1.82 | - | Fab |
| `pdb/CD74-VHH-05.pdb` | BAD_VISUAL | 61 | 6.7 | 1.85 | - | VHH |
| `pdb/EGFR-VHH-04.pdb` | BAD_VISUAL | 55.5 | 6.7 | 1.89 | - | VHH |
| `pdb/FluHA-VHH-04.pdb` | BAD_VISUAL | 96 | 6.7 | 1.87 | - | VHH |
| `pdb/IL31-VHH-07.pdb` | BAD_VISUAL | 53.8 | 6.7 | 1.82 | - | VHH |
| `pdb/IL31-VHH-08.pdb` | BAD_VISUAL | 53.8 | 6.7 | 1.85 | - | VHH |
| `pdb/PSMA-Fab-05.pdb` | BAD_VISUAL | 71.2 | 6.7 | 2.35 | - | Fab |
| `pdb/antigen-display-pose/HPRT1-Fab-1Z7G.pdb` | BAD_VISUAL | 93.3 | 6.7 | 1.94 | - | Fab |
| `pdb/antigen-display-pose/JAK2-Fab-6VGL.pdb` | BAD_VISUAL | 69.4 | 6.7 | 1.82 | - | Fab |
| `pdb/C5-VHH-07.pdb` | BAD_VISUAL | 74.2 | 6.6 | 1.91 | - | VHH |
| `pdb/HER2-VHH-10.pdb` | BAD_VISUAL | 51.7 | 6.6 | 1.99 | - | VHH |
| `pdb/IL17RA-Fab-01.pdb` | BAD_VISUAL | 69.3 | 6.6 | 1.94 | - | Fab |
| `pdb/RABIES-G-Fab-01.pdb` | BAD_VISUAL | 87.4 | 6.6 | 1.95 | - | Fab |
| `pdb/TSHR-VHH-01.pdb` | BAD_VISUAL | 55.6 | 6.6 | 1.67 | - | VHH |
| `pdb/CD74-VHH-04.pdb` | BAD_VISUAL | 60.7 | 6.5 | 1.89 | - | VHH |
| `pdb/EGFR-Fab-01.pdb` | BAD_VISUAL | 65.9 | 6.5 | 1.83 | - | Fab |
| `pdb/EGFR-Fab-03.pdb` | BAD_VISUAL | 65.9 | 6.5 | 1.95 | - | Fab |
| `pdb/EGFR-Fab-04.pdb` | BAD_VISUAL | 65.9 | 6.5 | 1.89 | - | Fab |
| `pdb/EGFR-Fab-05.pdb` | BAD_VISUAL | 65.9 | 6.5 | 1.91 | - | Fab |
| `pdb/EGFR-Fab-06.pdb` | BAD_VISUAL | 65.9 | 6.5 | 1.87 | - | Fab |
| `pdb/EGFR-Fab-07.pdb` | BAD_VISUAL | 65.9 | 6.5 | 1.96 | - | Fab |
| `pdb/EGFR-Fab-08.pdb` | BAD_VISUAL | 65.9 | 6.5 | 2 | - | Fab |
| `pdb/EGFR-Fab-09.pdb` | BAD_VISUAL | 65.9 | 6.5 | 1.95 | - | Fab |
| `pdb/EGFR-Fab-10.pdb` | BAD_VISUAL | 65.9 | 6.5 | 1.86 | - | Fab |
| `pdb/IL31-VHH-05.pdb` | BAD_VISUAL | 53.6 | 6.5 | 1.89 | - | VHH |
| `pdb/IgE-VHH-10.pdb` | BAD_VISUAL | 51.9 | 6.5 | 1.81 | - | VHH |
| `pdb/M2e-VHH-01.pdb` | BAD_VISUAL | 50.7 | 6.5 | 2.35 | - | VHH |
| `pdb/RABIES-G-Fab-02.pdb` | BAD_VISUAL | 83.9 | 6.5 | 1.96 | - | Fab |
| `pdb/TSHR-VHH-02.pdb` | BAD_VISUAL | 55.5 | 6.5 | 1.98 | - | VHH |
| `pdb/antigen-display-pose/ALDH2-Fab-1ZUM.pdb` | BAD_VISUAL | 109.4 | 6.5 | 1.98 | - | Fab |
| `pdb/antigen-display-pose/CD4-Fab-1WIP.pdb` | BAD_VISUAL | 82.1 | 6.5 | 1.86 | - | Fab |
| `pdb/antigen-display-pose/KRT10-VHH-4ZRY.pdb` | BAD_VISUAL | 67.5 | 6.5 | 1.94 | - | VHH |
| `pdb/CD123-VHH-05.pdb` | BAD_VISUAL | 72.6 | 6.4 | 1.91 | - | VHH |
| `pdb/EGFR-VHH-06.pdb` | BAD_VISUAL | 55.2 | 6.4 | 1.95 | - | VHH |
| `pdb/antigen-display-pose/MEN1-Fab-3U84.pdb` | BAD_VISUAL | 79.4 | 6.4 | 1.95 | - | Fab |
| `pdb/antigen-display-pose/MYH7-Fab-6PFP.pdb` | BAD_VISUAL | 114.6 | 6.4 | 1.91 | - | Fab |
| `pdb/C5-VHH-08.pdb` | BAD_VISUAL | 73.9 | 6.3 | 1.99 | - | VHH |
| `pdb/C5-VHH-10.pdb` | BAD_VISUAL | 73.9 | 6.3 | 1.98 | - | VHH |
| `pdb/DENGUE-E-Fab-05.pdb` | BAD_VISUAL | 74.1 | 6.3 | 1.97 | - | Fab |
| `pdb/EGFR-VHH-10.pdb` | BAD_VISUAL | 55.1 | 6.3 | 1.93 | - | VHH |
| `pdb/IL17RA-Fab-02.pdb` | BAD_VISUAL | 68.6 | 6.3 | 1.93 | - | Fab |
| `pdb/antigen-display-pose/SCN5A-Fab-9P24.pdb` | BAD_VISUAL | 69.3 | 6.3 | 1.97 | - | Fab |
| `pdb/C5-VHH-04.pdb` | BAD_VISUAL | 73.8 | 6.2 | 1.86 | - | VHH |
| `pdb/CD74-VHH-09.pdb` | BAD_VISUAL | 60.5 | 6.2 | 1.97 | - | VHH |
| `pdb/GPC2-VHH-06.pdb` | BAD_VISUAL | 52.3 | 6.2 | 1.85 | - | VHH |
| `pdb/IgE-VHH-02.pdb` | BAD_VISUAL | 51.7 | 6.2 | 1.87 | - | VHH |
| `pdb/ADENO-HEXON-Fab-03.pdb` | BAD_VISUAL | 73.3 | 6.1 | 0.99 | - | Fab |
| `pdb/DENGUE-E-Fab-02.pdb` | BAD_VISUAL | 84.5 | 6.1 | 1.82 | - | Fab |
| `pdb/FluHA-VHH-03.pdb` | BAD_VISUAL | 95.4 | 6.1 | 1.89 | - | VHH |
| `pdb/FluHA-VHH-09.pdb` | BAD_VISUAL | 95.4 | 6.1 | 1.94 | - | VHH |
| `pdb/GJB2-VHH-04.pdb` | BAD_VISUAL | 51.8 | 6.1 | 1.94 | - | VHH |
| `pdb/GJB2-VHH-07.pdb` | BAD_VISUAL | 51.9 | 6.1 | 1.98 | - | VHH |
| `pdb/IgE-VHH-01.pdb` | BAD_VISUAL | 51.5 | 6.1 | 2.35 | - | VHH |
| `pdb/IgE-VHH-07.pdb` | BAD_VISUAL | 51.5 | 6.1 | 2.35 | - | VHH |
| `pdb/antigen-display-pose/PDE3A-Fab-7L28.pdb` | BAD_VISUAL | 79.4 | 6.1 | 1.87 | - | Fab |
| `pdb/ADENO-HEXON-VHH-06.pdb` | BAD_VISUAL | 62.7 | 6 | 1.8 | - | VHH |
| `pdb/ADENO-HEXON-VHH-08.pdb` | BAD_VISUAL | 62.8 | 6 | 2 | - | VHH |
| `pdb/EGFR-VHH-03.pdb` | BAD_VISUAL | 54.8 | 6 | 1.86 | - | VHH |
| `pdb/HER2-VHH-04.pdb` | BAD_VISUAL | 51 | 6 | 1.98 | - | VHH |
| `pdb/HER2-VHH-05.pdb` | BAD_VISUAL | 51 | 6 | 1.93 | - | VHH |
| `pdb/IL31-VHH-10.pdb` | BAD_VISUAL | 53.1 | 6 | 1.94 | - | VHH |
| `pdb/RSVF-VHH-07.pdb` | BAD_VISUAL | 52.2 | 6 | 1.88 | - | VHH |
| `pdb/C5-VHH-03.pdb` | BAD_VISUAL | 73.5 | 5.9 | 1.96 | - | VHH |
| `pdb/CD123-VHH-04.pdb` | BAD_VISUAL | 72.1 | 5.9 | 1.89 | - | VHH |
| `pdb/CD70-Fab-01.pdb` | BAD_VISUAL | 114.9 | 5.9 | 1.87 | - | Fab |
| `pdb/EGFR-VHH-02.pdb` | BAD_VISUAL | 54.6 | 5.9 | 1.96 | - | VHH |
| `pdb/IgE-VHH-05.pdb` | BAD_VISUAL | 51.7 | 5.9 | 1.96 | - | VHH |
| `pdb/antigen-display-pose/ATP4A-Fab-5YLU.pdb` | BAD_VISUAL | 68.7 | 5.9 | 1.99 | - | Fab |
| `pdb/antigen-display-pose/IFNG-Fab-1FG9.pdb` | BAD_VISUAL | 68.3 | 5.8 | 1.93 | - | Fab |
| `pdb/PSMA-Fab-03.pdb` | BAD_VISUAL | 70 | 5.7 | 1.89 | - | Fab |
| `pdb/antigen-display-pose/ADK-Fab-2I6A.pdb` | BAD_VISUAL | 65.7 | 5.7 | 1.95 | - | Fab |
| `pdb/antigen-display-pose/GUCY1A1-Fab-6JT0.pdb` | BAD_VISUAL | 76.6 | 5.7 | 1.95 | - | Fab |
| `pdb/antigen-display-pose/TG-Fab-6SCJ.pdb` | BAD_VISUAL | 95.9 | 5.7 | 1.96 | - | Fab |
| `pdb/HER2-VHH-08.pdb` | BAD_VISUAL | 50.7 | 5.6 | 1.87 | - | VHH |
| `pdb/LGR5-Fab-01.pdb` | BAD_VISUAL | 66.9 | 5.6 | 1.92 | - | Fab |
| `pdb/RSVF-VHH-10.pdb` | BAD_VISUAL | 51.8 | 5.6 | 1.89 | - | VHH |
| `pdb/CD22-VHH-05.pdb` | BAD_VISUAL | 52.5 | 5.5 | 1.92 | - | VHH |
| `pdb/CD22-VHH-07.pdb` | BAD_VISUAL | 52.5 | 5.5 | 2.35 | - | VHH |
| `pdb/EGFR-VHH-01.pdb` | BAD_VISUAL | 54.3 | 5.5 | 1.96 | - | VHH |
| `pdb/EGFR-VHH-07.pdb` | BAD_VISUAL | 54.3 | 5.5 | 1.85 | - | VHH |
| `pdb/LEPR-Fab-04.pdb` | BAD_VISUAL | 82.4 | 5.5 | 1.97 | - | Fab |
| `pdb/antigen-display-pose/AXL-Fab-4RA0.pdb` | BAD_VISUAL | 69.7 | 5.4 | 1.97 | - | Fab |
| `pdb/antigen-display-pose/CFTR-Fab-6MSM.pdb` | BAD_VISUAL | 66.7 | 5.4 | 1.92 | - | Fab |
| `pdb/antigen-display-pose/EGFR-Fab-1IVO.pdb` | BAD_VISUAL | 68.7 | 5.4 | 1.99 | - | Fab |
| `pdb/CD22-VHH-01.pdb` | BAD_VISUAL | 52.3 | 5.3 | 2.35 | - | VHH |
| `pdb/RSVF-VHH-02.pdb` | BAD_VISUAL | 51.3 | 5.1 | 2.35 | - | VHH |
| `pdb/ADENO-HEXON-Fab-04.pdb` | BAD_VISUAL | 71.8 | 4.6 | 1.6 | - | Fab |
| `pdb/antigen-display-pose/CRP-Fab-1GNH.pdb` | BAD_VISUAL | 102.6 | 4.5 | 2.35 | - | Fab |
| `pdb/ADENO-HEXON-Fab-01.pdb` | BAD_VISUAL | 70.8 | 3.6 | 1.47 | - | Fab |
| `pdb/CD123-VHH-03.pdb` | BAD_VISUAL | 69.3 | 3.2 | 2.35 | - | VHH |
| `pdb/ADENO-HEXON-Fab-09.pdb` | BAD_VISUAL | 69.8 | 2.6 | 1.05 | - | Fab |
| `pdb/antigen-display-pose/RET-Fab-4UX8.pdb` | BAD_VISUAL | 96.5 | 1.8 | 2.35 | - | Fab |
| `pdb/PEDV-Spike-Fab-01.pdb` | BAD_VISUAL | 72.2 | 0.8 | 3.96 | - | Fab |
| `pdb/PEDV-Spike-Fab-08.pdb` | BAD_VISUAL | 71.8 | 0.4 | 2.25 | - | Fab |
| `pdb/PEDV-Spike-Fab-09.pdb` | BAD_VISUAL | 71.8 | 0.3 | 2.25 | - | Fab |
| `pdb/PEDV-Spike-Fab-03.pdb` | BAD_VISUAL | 71.6 | 0.2 | 2.25 | - | Fab |
| `pdb/PEDV-Spike-Fab-10.pdb` | BAD_VISUAL | 71.6 | 0.2 | 2.25 | - | Fab |
| `pdb/PEDV-Spike-Fab-07.pdb` | BAD_VISUAL | 71.5 | 0 | 2.25 | - | Fab |
| `pdb/PEDV-Spike-Fab-02.pdb` | BAD_VISUAL | 71.2 | -0.2 | 2.25 | - | Fab |
| `pdb/PEDV-Spike-Fab-06.pdb` | BAD_VISUAL | 71.2 | -0.2 | 2.25 | - | Fab |
| `pdb/PEDV-Spike-Fab-05.pdb` | BAD_VISUAL | 71.1 | -0.3 | 2.25 | - | Fab |
| `pdb/CD74-VHH-06.pdb` | BAD_VISUAL | 53.9 | -0.4 | 2.35 | - | VHH |
| `pdb/PEDV-Spike-Fab-04.pdb` | BAD_VISUAL | 71 | -0.4 | 2.25 | - | Fab |
| `pdb/ADENO-HEXON-Fab-02.pdb` | BAD_VISUAL | 65.6 | -1.6 | 1.86 | - | Fab |
| `pdb/FOLR1-VHH-01.pdb` | BAD_VISUAL | 58.5 | -3.5 | 0 | - | VHH |
| `pdb/FOLR1-VHH-02.pdb` | BAD_VISUAL | 58.5 | -3.5 | 0 | - | VHH |
| `pdb/FOLR1-VHH-03.pdb` | BAD_VISUAL | 58.5 | -3.5 | 0 | - | VHH |
| `pdb/FOLR1-VHH-04.pdb` | BAD_VISUAL | 58.5 | -3.5 | 0 | - | VHH |
| `pdb/FOLR1-VHH-05.pdb` | BAD_VISUAL | 58.5 | -3.5 | 0 | - | VHH |
| `pdb/FOLR1-VHH-06.pdb` | BAD_VISUAL | 58.5 | -3.5 | 0 | - | VHH |
| `pdb/FOLR1-VHH-07.pdb` | BAD_VISUAL | 58.5 | -3.5 | 0 | - | VHH |
| `pdb/FOLR1-VHH-08.pdb` | BAD_VISUAL | 58.5 | -3.5 | 0 | - | VHH |
| `pdb/FOLR1-VHH-09.pdb` | BAD_VISUAL | 58.5 | -3.5 | 0 | - | VHH |
| `pdb/FOLR1-VHH-10.pdb` | BAD_VISUAL | 58.5 | -3.5 | 0 | - | VHH |
| `pdb/antigen-display-pose/F10-Fab-2GD4.pdb` | BAD_VISUAL | 95.9 | -3.8 | 2.35 | - | Fab |
| `pdb/ENDOCRINELIB-HUMAN-IGF1R-FV-RCSB-5U8R.pdb` | BAD_VISUAL | 54.7 | -5.2 | 2.33 | - | Fv |
| `pdb/RABIES-G-Fab-05.pdb` | BAD_VISUAL | 67 | -10.1 | 2.35 | - | Fab |
| `pdb/CD27-Fab-02.pdb` | BAD_VISUAL | 114 | -11.9 | 2.35 | - | Fab |
| `pdb/FluHA-VHH-07.pdb` | BAD_VISUAL | 75.4 | -13.9 | 2.35 | - | VHH |
| `pdb/IL31-Fab-03.pdb` | BAD_VISUAL | 71.2 | -21.2 | 2.35 | - | Fab |
| `pdb/DENGUE-E-Fab-01.pdb` | BAD_VISUAL | 82.8 | -25.3 | 2.35 | - | Fab |
| `pdb/PSMA-Fab-04.pdb` | BAD_VISUAL | 92.6 | -41.2 | 2.35 | - | Fab |
| `pdb/CD33-Fab-01.pdb` | BAD_VISUAL | 71.7 | -41.3 | 2.82 | - | Fab |
| `pdb/CMV-GB-Fab-04.pdb` | BAD_VISUAL | 82.5 | -42.4 | 2.35 | - | Fab |
| `pdb/RABIES-G-VHH-01.pdb` | BAD_VISUAL | 69 | -49.3 | 0 | - | VHH |
| `pdb/RABIES-G-VHH-02.pdb` | BAD_VISUAL | 69 | -49.3 | 0 | - | VHH |
| `pdb/RABIES-G-VHH-03.pdb` | BAD_VISUAL | 69 | -49.3 | 0 | - | VHH |
| `pdb/RABIES-G-VHH-04.pdb` | BAD_VISUAL | 69 | -49.3 | 0 | - | VHH |
| `pdb/RABIES-G-VHH-05.pdb` | BAD_VISUAL | 69 | -49.3 | 0 | - | VHH |
| `pdb/RABIES-G-VHH-06.pdb` | BAD_VISUAL | 69 | -49.3 | 0 | - | VHH |
| `pdb/RABIES-G-VHH-07.pdb` | BAD_VISUAL | 69 | -49.3 | 0 | - | VHH |
| `pdb/RABIES-G-VHH-08.pdb` | BAD_VISUAL | 69 | -49.3 | 0 | - | VHH |
| `pdb/RABIES-G-VHH-09.pdb` | BAD_VISUAL | 69 | -49.3 | 0 | - | VHH |
| `pdb/RABIES-G-VHH-10.pdb` | BAD_VISUAL | 69 | -49.3 | 0 | - | VHH |
| `pdb/IL17RA-Fab-04.pdb` | BAD_VISUAL | 66.4 | -58.8 | 2.35 | - | Fab |
| `pdb/CD27-Fab-03.pdb` | BAD_VISUAL | 74.3 | -61.1 | 2.76 | - | Fab |
| `pdb/CD70-Fab-03.pdb` | BAD_VISUAL | 96.6 | -79.7 | 2.35 | - | Fab |

---

## 警告文件 (456 个)

| 文件 | CoM (Å) | 间隙 (Å) | minDist (Å) |
|------|---------|---------|------------|
| `pdb/TIM3-Fab-03.pdb` | 62 | 19.7 | 2.35 |
| `pdb/FLT3-Fab-03.pdb` | 64.6 | 19.1 | 2.35 |
| `pdb/MSTN-Fab-01.pdb` | 62.2 | 16.8 | 2.4 |
| `pdb/ROR1-Fab-05.pdb` | 62.2 | 15.1 | 2.35 |
| `pdb/CD47-VHH-04.pdb` | 42.9 | 14.8 | 2.35 |
| `pdb/BAFFR-Fab-04.pdb` | 58.1 | 14.5 | 1.11 |
| `pdb/IL36A-Fab-02.pdb` | 58.3 | 14.5 | 1.92 |
| `pdb/IL36A-Fab-05.pdb` | 58.2 | 14.4 | 1.85 |
| `pdb/antigen-display-pose/IL2RA-VHH-1Z92.pdb` | 48.8 | 14.4 | 2.35 |
| `pdb/antigen-display-pose/TLR9-VHH-8AR3.pdb` | 44.5 | 13.4 | 1.36 |
| `pdb/SC2RBD-VHH-08.pdb` | 45.1 | 13.3 | 2.35 |
| `pdb/TMV-CP-VHH-09.pdb` | 46.6 | 13.3 | 2.35 |
| `pdb/CANINE-NGF-Fab-01.pdb` | 57.3 | 13 | 2.35 |
| `pdb/PRLR-VHH-04.pdb` | 49.8 | 12.9 | 2.35 |
| `pdb/CD19-VHH-04.pdb` | 47 | 12.8 | 2.35 |
| `pdb/F3-VHH-10.pdb` | 48.7 | 12.8 | 2.35 |
| `pdb/IL36A-VHH-01.pdb` | 46.2 | 12.8 | 2.35 |
| `pdb/PCSK9-Fab-09.pdb` | 62.1 | 12.8 | 2.57 |
| `pdb/PCSK9-Fab-10.pdb` | 62.1 | 12.8 | 2.38 |
| `pdb/PCSK9-Fab-04.pdb` | 62.1 | 12.7 | 2.58 |
| `pdb/CGRPR-VHH-08.pdb` | 43.6 | 12.6 | 2.35 |
| `pdb/DAT-Fab-10.pdb` | 60.9 | 12.6 | 2.35 |
| `pdb/PCSK9-Fab-03.pdb` | 61.9 | 12.6 | 2.26 |
| `pdb/PCSK9-Fab-08.pdb` | 61.9 | 12.6 | 2.33 |
| `pdb/PRRSV-NSP10-Fab-03.pdb` | 57.2 | 12.6 | 2.25 |
| `pdb/CLDN6-Fab-03.pdb` | 53.7 | 12.5 | 1.99 |
| `pdb/PCSK9-Fab-02.pdb` | 61.8 | 12.5 | 2.29 |
| `pdb/PCSK9-Fab-07.pdb` | 61.8 | 12.5 | 2.38 |
| `pdb/CD25-VHH-05.pdb` | 42.8 | 12.3 | 2.35 |
| `pdb/BAFFR-VHH-09.pdb` | 45.6 | 12.1 | 2.35 |
| `pdb/CMV-GB-Fab-02.pdb` | 60.7 | 12.1 | 1.93 |
| `pdb/CLDN18.2-VHH-07.pdb` | 45.5 | 12 | 2.35 |
| `pdb/HER3-VHH-10.pdb` | 41.6 | 12 | 2.35 |
| `pdb/antigen-display-pose/KIT-Fab-1T45.pdb` | 56.2 | 12 | 2.35 |
| `pdb/CEACAM5-VHH-08.pdb` | 49.7 | 11.8 | 2.35 |
| `pdb/LAG3-VHH-02.pdb` | 45.8 | 11.8 | 2.35 |
| `pdb/B7H6-VHH-02.pdb` | 49.7 | 11.7 | 1.99 |
| `pdb/CD19-VHH-07.pdb` | 45.9 | 11.7 | 1.86 |
| `pdb/DAT-Fab-07.pdb` | 60 | 11.7 | 1.88 |
| `pdb/antigen-display-pose/IDH1-Fab-5DE1.pdb` | 64.9 | 11.7 | 1.9 |
| `pdb/antigen-display-pose/REN-Fab-2REN.pdb` | 55.7 | 11.7 | 1.81 |
| `pdb/CANINE-NGF-VHH-07.pdb` | 45.3 | 11.5 | 2.35 |
| `pdb/DLL3-Fab-03.pdb` | 56.1 | 11.5 | 1.9 |
| `pdb/HER3-VHH-04.pdb` | 41.1 | 11.5 | 2.35 |
| `pdb/HER3-VHH-08.pdb` | 41.1 | 11.5 | 2.35 |
| `pdb/LAG3-VHH-03.pdb` | 45.5 | 11.5 | 2.35 |
| `pdb/PCV2-Cap-VHH-05.pdb` | 44.5 | 11.5 | 2.35 |
| `pdb/PRLR-VHH-03.pdb` | 48.3 | 11.5 | 1.8 |
| `pdb/PRRSV-NSP10-Fab-06.pdb` | 56.1 | 11.5 | 2.25 |
| `pdb/PRRSV-NSP10-Fab-09.pdb` | 56.1 | 11.5 | 2.25 |

*(共 456 个，仅显示前 50)*

---

## 判定标准

| 状态 | 条件 |
|------|------|
| OK | minDist ≤ 5Å 且 Visual Gap ≤ 15Å |
| WARNING | minDist ≤ 5Å 但 Visual Gap > 15Å，或 minDist 5-10Å |
| BAD_DISTANCE | minDist > 10Å |
| BAD_VISUAL | minDist ≤ 5Å 但 Visual Gap > 25Å |

- **Visual Gap** = 质心距离 - 抗原Rg - 抗体Rg
- **CoM 距离** = 抗原质心到抗体质心的欧氏距离
- **minDist** = 抗原和抗体最近原子对距离