#!/usr/bin/env python3
import sys
import os

def fix_double_utf8_encoding(input_file_path):
    # Read the file as binary
    with open(input_file_path, 'rb') as f:
        content = f.read()
    
    # Try to decode as UTF-8 (this gets us back to the bytes that were originally there)
    try:
        # First decode as UTF-8 (which is what the file is currently saved as)
        utf8_decoded = content.decode('utf-8')
        
        # Now encode as Latin-1 (to get the raw bytes)
        latin1_bytes = utf8_decoded.encode('latin-1')
        
        # Finally decode as UTF-8 again (to properly interpret the bytes)
        fixed_content = latin1_bytes.decode('utf-8')
        
        # Create backup of original file
        backup_path = input_file_path + '.bak'
        with open(backup_path, 'wb') as f:
            f.write(content)
        print(f"Backup created at {backup_path}")
        
        # Write the fixed content back to the original file
        with open(input_file_path, 'w', encoding='utf-8') as f:
            f.write(fixed_content)
        print(f"Fixed encoding in {input_file_path}")
        return True
    except Exception as e:
        print(f"Error processing {input_file_path}: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python fix_encoding.py <file_path1> [file_path2] ...")
        sys.exit(1)
    
    success = True
    for file_path in sys.argv[1:]:
        if not os.path.isfile(file_path):
            print(f"Error: {file_path} is not a valid file")
            success = False
            continue
        
        if not fix_double_utf8_encoding(file_path):
            success = False
    
    sys.exit(0 if success else 1)
