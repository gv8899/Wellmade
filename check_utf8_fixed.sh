#!/bin/bash

# Define directories to check - exclude node_modules and .git
DIRECTORIES=("frontend/src" "backend/src" ".")
EXCLUDE_DIRS=("node_modules" ".git" ".next" "dist" "build")

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}檢查 UTF-8 編碼有效性...${NC}"

# File counter
INVALID_COUNT=0

# Process each directory
for dir in "${DIRECTORIES[@]}"; do
  if [ -d "$dir" ]; then
    echo -e "\n${YELLOW}掃描目錄: $dir${NC}"
    
    # Find all text files, excluding binary files and specified directories
    find "$dir" -type f \
      -not -path "*/node_modules/*" \
      -not -path "*/.git/*" \
      -not -path "*/.next/*" \
      -not -path "*/dist/*" \
      -not -path "*/build/*" | while read file; do
      
      # Skip files that are likely binary
      if file "$file" | grep -q "image\|executable\|binary\|archive\|compressed"; then
        continue
      fi
      
      # Check for invalid UTF-8 using only iconv
      if ! iconv -f UTF-8 -t UTF-8 < "$file" &>/dev/null; then
        INVALID_COUNT=$((INVALID_COUNT + 1))
        echo -e "${RED}無效 UTF-8 編碼:${NC} $file"
      fi
    done
  fi
done

if [ "$INVALID_COUNT" -eq 0 ]; then
  echo -e "\n${GREEN}沒有找到任何包含無效 UTF-8 編碼的檔案。${NC}"
else
  echo -e "\n${RED}找到 $INVALID_COUNT 個包含無效 UTF-8 編碼的檔案。${NC}"
  echo -e "\n${YELLOW}要修復這些檔案，您可以執行:${NC}"
  echo "  iconv -f ISO-8859-1 -t UTF-8 file_with_issues.txt > file_fixed.txt"
  echo "  # 然後用修復的版本替換原始檔案"
fi
