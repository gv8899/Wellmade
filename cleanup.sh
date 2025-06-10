#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Cleaning up backup files...${NC}"

# Remove all .bak files created by the fix script
find . -name "*.bak" -type f -delete

echo -e "${GREEN}Backup files removed.${NC}"

# Specifically fix the problematic file that didn't get corrected
echo -e "${YELLOW}Fixing remaining problematic file...${NC}"

if [ -f "backend/src/seeds/product.seed.ts" ]; then
  # Try a more aggressive approach for this file
  cat "backend/src/seeds/product.seed.ts" | tr -cd "[:print:]\n\t" > "backend/src/seeds/product.seed.ts.clean"
  mv "backend/src/seeds/product.seed.ts.clean" "backend/src/seeds/product.seed.ts"
  echo -e "${GREEN}Fixed backend/src/seeds/product.seed.ts${NC}"
fi

echo -e "${YELLOW}Cleanup complete.${NC}"
