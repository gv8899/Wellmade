#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# List of files to fix (only text files)
FILES_TO_FIX=(
  # Frontend files
  "frontend/src/app/product/[id]/ProductPurchaseOptions.tsx"
  "frontend/src/services/api.ts"
  "frontend/src/app/product/[id]/ProductDetailClient.tsx"
  
  # Backend files
  "backend/src/products/product.entity.ts"
  "backend/src/seeds/product.seed.ts"
  "backend/migrations/1749546100000-ProductBrandRelation.ts"
  
  # Documentation
  "TODO.md"
  "README.md"
  "wellmade-old-version/TODO.md"
  "wellmade-old-version/README.md"
  "wellmade-old-version/frontend/src/app/product/[id]/ProductDetailClient.tsx"
)

echo -e "${YELLOW}Starting to fix files with invalid UTF-8 characters...${NC}"

# File counters
FIXED_COUNT=0
ERROR_COUNT=0

for file in "${FILES_TO_FIX[@]}"; do
  if [ -f "$file" ]; then
    echo -e "\n${YELLOW}Processing: $file${NC}"
    
    # Create a backup
    cp "$file" "${file}.bak"
    
    # Try to fix the file by converting from likely encodings to UTF-8
    # First try ISO-8859-1 (Latin-1), a common encoding that handles most byte sequences
    if iconv -f ISO-8859-1 -t UTF-8 "${file}.bak" > "${file}.fixed" 2>/dev/null; then
      mv "${file}.fixed" "$file"
      echo -e "${GREEN}✓ Fixed: $file (converted from ISO-8859-1 to UTF-8)${NC}"
      FIXED_COUNT=$((FIXED_COUNT + 1))
    # If that fails, try with CP1252, another common encoding
    elif iconv -f CP1252 -t UTF-8 "${file}.bak" > "${file}.fixed" 2>/dev/null; then
      mv "${file}.fixed" "$file"
      echo -e "${GREEN}✓ Fixed: $file (converted from CP1252 to UTF-8)${NC}"
      FIXED_COUNT=$((FIXED_COUNT + 1))
    else
      echo -e "${RED}✗ Failed to fix: $file${NC}"
      # Restore the backup
      mv "${file}.bak" "$file"
      ERROR_COUNT=$((ERROR_COUNT + 1))
    fi
  else
    echo -e "${RED}File not found: $file${NC}"
    ERROR_COUNT=$((ERROR_COUNT + 1))
  fi
done

echo -e "\n${YELLOW}Summary:${NC}"
echo -e "${GREEN}Successfully fixed: $FIXED_COUNT files${NC}"
echo -e "${RED}Failed to fix: $ERROR_COUNT files${NC}"

if [ "$ERROR_COUNT" -gt 0 ]; then
  echo -e "\n${YELLOW}For files that couldn't be fixed automatically, you may need to:${NC}"
  echo "  1. Open them in a text editor that shows encoding problems"
  echo "  2. Re-save them with UTF-8 encoding"
  echo "  3. Manually fix any remaining issues"
fi
