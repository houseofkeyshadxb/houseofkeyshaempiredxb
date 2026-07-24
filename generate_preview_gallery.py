#!/usr/bin/env python3
"""Generate preview gallery for empire sites"""

import os
import json
from datetime import datetime
from pathlib import Path

print(f"{datetime.now()}: Generating preview gallery...")

empire_dir = Path.home() / "empire-sites"
preview_file = empire_dir / "preview-gallery.html"

# Simple gallery generation
try:
    html = f"""<!DOCTYPE html>
<html>
<head>
    <title>Empire Sites Preview Gallery</title>
    <style>
        body {{ font-family: sans-serif; padding: 20px; }}
        h1 {{ color: #333; }}
        .gallery {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }}
        .card {{ border: 1px solid #ddd; padding: 15px; border-radius: 8px; }}
    </style>
</head>
<body>
    <h1>Empire Sites Preview</h1>
    <p>Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
    <div class="gallery">
        <div class="card"><h3>Mistress Keysha DXB</h3><p>Main landing page</p></div>
        <div class="card"><h3>Cum Slut Becky</h3><p>Secondary persona</p></div>
    </div>
</body>
</html>"""
    
    with open(preview_file, 'w') as f:
        f.write(html)
    
    print(f"{datetime.now()}: Gallery generated at {preview_file}")
except Exception as e:
    print(f"Error generating gallery: {e}")
