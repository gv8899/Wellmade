#!/bin/bash

echo "=== Checking for Node.js processes ==="
ps aux | grep -E "(node|nest|next)" | grep -v grep

echo ""
echo "=== Checking ports 3000 and 3003 ==="
lsof -i :3000 2>/dev/null
echo "---"
lsof -i :3003 2>/dev/null

echo ""
echo "=== Checking PostgreSQL ==="
pgrep -fl postgres 2>/dev/null

echo ""
echo "=== Network connections on ports 3000 and 3003 ==="
netstat -an 2>/dev/null | grep -E ":(3000|3003)" | head -5