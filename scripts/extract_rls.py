import zipfile
import re
import json

pbix_path = r"C:\Users\MARIA.ALMEIDA\OneDrive - Minerva S.A\Área de Trabalho\painel GGO Digital V6 - com RLS.pbix"

with zipfile.ZipFile(pbix_path, 'r') as z:
    raw = z.read('DataModel')

print(f"Read {len(raw)} bytes.")

# Search for RLS / Roles in unicode text
# ABF files often contain utf-16le XML / JSON or UTF-8 metadata
text_utf16 = ""
try:
    # Let's decode slices or find strings
    matches = re.findall(rb'(?:[\x20-\x7e]\x00){4,}', raw)
    print(f"Found {len(matches)} ascii-like utf-16 sequences.")
except Exception as e:
    print(e)

# Let's find patterns like "roles" or "UserPrincipalName" or "filterExpression"
patterns = [
    b'UserPrincipalName',
    b'userprincipalname',
    b'roles',
    b'tablePermissions',
    b'filterExpression',
    b'Expression',
    b'USERPRINCIPALNAME'
]

for p in patterns:
    p16 = p.decode('ascii').encode('utf-16le')
    count8 = raw.count(p)
    count16 = raw.count(p16)
    print(f"Pattern '{p.decode('ascii')}': UTF-8 count = {count8}, UTF-16 count = {count16}")

# Let's write a finder to locate occurrences of USERPRINCIPALNAME or role definitions
idx = 0
found_contexts = []
while True:
    idx = raw.find(b'USERPRINCIPALNAME', idx)
    if idx == -1:
        break
    start = max(0, idx - 200)
    end = min(len(raw), idx + 300)
    found_contexts.append(raw[start:end])
    idx += 17

print(f"\nFound {len(found_contexts)} occurrences of USERPRINCIPALNAME in raw bytes.")
for i, ctx in enumerate(found_contexts[:5]):
    # Try decode
    print(f"--- Context {i+1} ---")
    print(repr(ctx))
