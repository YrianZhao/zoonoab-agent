#!/bin/bash
# copy-expanded-pdbs.sh
# 使用符号链接将隔离工作目录的 complexes 链接到项目 pdb/expanded/
# 不复制文件（99GB → 0GB 额外空间）
#
# 用法:
#   bash scripts/copy-expanded-pdbs.sh

set -e

COMPLEXES_DIR="/Users/ryan/.trae-cn/work/6a6b5f0283052dfa200e13ce/target_expansion_isolated/complexes"
TARGET_DIR="pdb/expanded"

# 切换到项目根目录
cd "$(dirname "$0")/.."

echo "=== copy-expanded-pdbs.sh ==="
echo "Source: $COMPLEXES_DIR"
echo "Target: $TARGET_DIR"
echo ""

# 检查源目录
if [ ! -d "$COMPLEXES_DIR" ]; then
  echo "ERROR: Source directory not found: $COMPLEXES_DIR"
  exit 1
fi

# 检查源目录中有多少靶点
SOURCE_COUNT=$(ls "$COMPLEXES_DIR" | grep -v manifest.json | wc -l | tr -d ' ')
echo "Source targets: $SOURCE_COUNT"

# 如果目标已存在，先处理
if [ -L "$TARGET_DIR" ]; then
  echo "Existing symlink found, removing..."
  rm "$TARGET_DIR"
elif [ -d "$TARGET_DIR" ]; then
  echo "WARNING: $TARGET_DIR is a real directory (not symlink)."
  echo "This should not happen in normal operation."
  echo "Remove it manually if you want to create a symlink."
  exit 1
fi

# 创建符号链接
echo "Creating symlink: $TARGET_DIR -> $COMPLEXES_DIR"
ln -s "$COMPLEXES_DIR" "$TARGET_DIR"

# 验证
if [ ! -d "$TARGET_DIR" ]; then
  echo "ERROR: Symlink creation failed"
  exit 1
fi

TARGET_COUNT=$(ls "$TARGET_DIR" | grep -v manifest.json | wc -l | tr -d ' ')
echo ""
echo "=== Verification ==="
echo "Target targets accessible: $TARGET_COUNT"
echo "Symlink: $(ls -la $TARGET_DIR | head -1)"

if [ "$SOURCE_COUNT" -eq "$TARGET_COUNT" ]; then
  echo "SUCCESS: All $TARGET_COUNT targets accessible"
else
  echo "WARNING: Count mismatch (source=$SOURCE_COUNT, target=$TARGET_COUNT)"
fi

# 抽样验证几个靶点的 PDB 文件
echo ""
echo "=== Sample verification ==="
for gene in A1CF MSH2 ERBB2 TP53 EGFR; do
  if [ -d "$TARGET_DIR/$gene" ]; then
    PDB_COUNT=$(ls "$TARGET_DIR/$gene"/*.pdb 2>/dev/null | wc -l | tr -d ' ')
    echo "  $gene: $PDB_COUNT PDB files"
  else
    echo "  $gene: NOT FOUND"
  fi
done

echo ""
echo "Done!"
