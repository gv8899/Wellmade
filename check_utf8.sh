#!/bin/bash

# Define directories to check - exclude node_modules and .git
DIRECTORIES=("frontend/src" "backend/src" ".")
EXCLUDE_DIRS=("node_modules" ".git" ".next" "dist" "build")

# Create exclude arguments
EXCLUDE_ARGS=""
for dir in "${EXCLUDE_DIRS[@]}"; do
  EXCLUDE_ARGS="$EXCLUDE_ARGS -not -path \"*/$dir/*\""
done

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Scanning for files with invalid UTF-8 characters...${NC}"

# File counter
INVALID_COUNT=0

# Process each directory
for dir in "${DIRECTORIES[@]}"; do
  if [ -d "$dir" ]; then
    echo -e "\n${YELLOW}Scanning directory: $dir${NC}"
    
    # Find all text files
    find_cmd="find \"$dir\" -type f -not -path \"*/node_modules/*\" -not -path \"*/.git/*\" -not -path \"*/.next/*\" -not -path \"*/dist/*\" -not -path \"*/build/*\""
    
    # Exclude binary files
    eval "$find_cmd" | while read file; do
      # Skip files that are likely binary
      if file "$file" | grep -q "image\|executable\|binary\|archive\|compressed"; then
        continue
      fi
      
      # Check for invalid UTF-8
      if ! iconv -f UTF-8 -t UTF-8 < "$file" &>/dev/null; then
        INVALID_COUNT=$((INVALID_COUNT + 1))
        echo -e "${RED}Invalid UTF-8:${NC} $file"
        
        # Try to identify problematic lines
        LC_ALL=C grep -n "[^[:print:][:space:]]" "$file" | head -5 | while read -r line; do
          line_num=$(echo "$line" | cut -d: -f1)
          echo -e "  Line ${line_num}: contains non-printable characters"
        done
      fi
    done
  fi
done

if [ "$INVALID_COUNT" -eq 0 ]; then
  echo -e "\n${GREEN}No files with invalid UTF-8 encoding were found.${NC}"
else
  echo -e "\n${RED}Found $INVALID_COUNT files with invalid UTF-8 encoding.${NC}"
  echo -e "\n${YELLOW}To fix these files, you can run:${NC}"
  echo "  iconv -f ISO-8859-1 -t UTF-8 file_with_issues.txt > file_fixed.txt"
  echo "  # Then replace the original file with the fixed version"
fi
