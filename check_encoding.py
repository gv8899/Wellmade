#!/usr/bin/env python3
import os
import sys
import codecs
from pathlib import Path

def is_text_file(filepath):
    """檢查文件是否為文字文件"""
    try:
        with open(filepath, 'rb') as f:
            content = f.read(1024)
        # 檢查是否為二進制文件
        textchars = bytearray({7, 8, 9, 10, 12, 13, 27} | set(range(0x20, 0x100)) - {0x7f})
        return bool(content) and not bool(content.translate(None, textchars))
    except:
        return False

def check_file_encoding(filepath):
    """檢查文件的編碼是否正確"""
    encodings = ['utf-8', 'big5', 'gbk', 'gb2312', 'utf-16', 'utf-16le', 'utf-16be']
    
    try:
        with open(filepath, 'rb') as f:
            content = f.read()
            
        # 先檢查是否為二進制文件
        if not is_text_file(filepath):
            return True, "Binary file"
            
        # 檢查各種編碼
        for encoding in encodings:
            try:
                decoded = content.decode(encoding)
                # 檢查解碼後的內容是否包含常見的中文字符
                if any('\u4e00' <= char <= '\u9fff' for char in decoded):
                    return True, f"OK ({encoding})"
            except UnicodeDecodeError:
                continue
                
        # 如果都沒有錯誤，但可能沒有中文字符
        try:
            content.decode('utf-8')
            return True, "OK (no CJK chars detected)"
        except UnicodeDecodeError:
            return False, "Encoding issue detected"
            
    except Exception as e:
        return False, f"Error: {str(e)}"

def scan_directory(directory):
    """掃描目錄下的所有文件"""
    issues = []
    total_files = 0
    checked_files = 0
    
    for root, dirs, files in os.walk(directory):
        # 跳過 node_modules 和 .git 等目錄
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
        if '.git' in dirs:
            dirs.remove('.git')
        if '.next' in dirs:
            dirs.remove('.next')
        if 'dist' in dirs:
            dirs.remove('dist')
            
        for file in files:
            filepath = os.path.join(root, file)
            total_files += 1
            
            # 跳過非文字文件
            if not is_text_file(filepath):
                continue
                
            checked_files += 1
            is_ok, status = check_file_encoding(filepath)
            
            if not is_ok or "issue" in status.lower():
                relative_path = os.path.relpath(filepath, directory)
                issues.append((relative_path, status))
    
    return issues, total_files, checked_files

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("使用方法: python check_encoding.py <目錄路徑>")
        sys.exit(1)
    
    directory = sys.argv[1]
    if not os.path.isdir(directory):
        print(f"錯誤: {directory} 不是有效的目錄")
        sys.exit(1)
    
    print(f"正在掃描目錄: {directory}")
    print("這可能需要一些時間，請稍候...\n")
    
    issues, total_files, checked_files = scan_directory(directory)
    
    print("\n掃描完成！")
    print(f"總共掃描檔案數: {total_files}")
    print(f"已檢查文字檔案數: {checked_files}")
    print(f"發現可能問題: {len(issues)}")
    
    if issues:
        print("\n發現以下檔案可能有編碼問題:")
        for i, (filepath, status) in enumerate(issues, 1):
            print(f"{i}. {filepath} - {status}")
    else:
        print("\n恭喜！沒有發現編碼問題。")
    
    print("\n掃描完成。")
