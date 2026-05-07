#!/usr/bin/env python3
"""Fix all isoformat() calls to handle string dates"""

import os
import re

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Pattern to find .isoformat() calls without hasattr check
    # Replace: obj.date.isoformat() if obj.date else None
    # With: obj.date.isoformat() if hasattr(obj.date, 'isoformat') else str(obj.date) if obj.date else None
    
    original = content
    
    # Fix pattern 1: .isoformat() if . else None
    pattern1 = r'(\w+)\.(\w+)\.isoformat\(\) if \1\.\2 else None'
    replacement1 = r'\1.\2.isoformat() if hasattr(\1.\2, \'isoformat\') else str(\1.\2) if \1.\2 else None'
    content = re.sub(pattern1, replacement1, content)
    
    # Fix pattern 2: .isoformat() without if condition (like datetime.utcnow().isoformat())
    # These are usually fine since they're actual datetime objects
    
    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"✅ Fixed: {filepath}")
        return True
    return False

# Fix all Python files in app/routes
routes_dir = "/Users/abhaysinghrana/Downloads/stitch_nexus_team_task_suite 2/backend/app/routes"
fixed_count = 0

for filename in os.listdir(routes_dir):
    if filename.endswith('.py'):
        filepath = os.path.join(routes_dir, filename)
        if fix_file(filepath):
            fixed_count += 1

print(f"\n🎉 Fixed {fixed_count} files")
