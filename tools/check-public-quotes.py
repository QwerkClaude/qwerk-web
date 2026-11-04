#!/usr/bin/env python3
"""Fail if public pages or content sources expose a fixed monetary price."""
from html import unescape
from pathlib import Path
from urllib.parse import unquote
import json
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
AMOUNT = re.compile(r'\$\s*\d[\d,.]*|\b\d[\d,.]*\s*(?:MXN|pesos)\b', re.I)
OFFER = re.compile(r'"(?:offers|price|lowPrice|highPrice|priceRange|priceCurrency)"\s*:')
files = subprocess.check_output(['git', 'ls-files', '*.html', 'tools/*.content.json'], cwd=ROOT, text=True).splitlines()
failures = []
for name in files:
    text = unescape(unquote((ROOT / name).read_text()))
    if AMOUNT.search(text):
        failures.append(f'{name}: contiene un importe público')
    if OFFER.search(text):
        failures.append(f'{name}: contiene datos estructurados de precio/oferta')
    for target in re.findall(r'href=[\'\"](/assets/docs/[^\'\"?#]+)', text):
        if not (ROOT / target.lstrip('/')).is_file():
            failures.append(f'{name}: documento no disponible: {target}')
    for body in re.findall(r'<script type="application/ld\+json">(.*?)</script>', text, re.S):
        try:
            json.loads(body)
        except json.JSONDecodeError:
            failures.append(f'{name}: JSON-LD inválido')
if failures:
    print('\n'.join(failures), file=sys.stderr)
    sys.exit(1)
print(f'OK: {len(files)} páginas y fuentes sin importes; JSON-LD y enlaces a documentos válidos.')
