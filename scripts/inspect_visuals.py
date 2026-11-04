import zipfile
import json
import os

pbix_path = r"C:\Users\MARIA.ALMEIDA\OneDrive - Minerva S.A\Área de Trabalho\painel GGO Digital V6 - com RLS.pbix"

with zipfile.ZipFile(pbix_path, 'r') as z:
    # Check all files inside
    names = z.namelist()
    print("Files in root:", [n for n in names if '/' not in n])
    
    # Let's inspect a few visual.json files to see tables, measures and fields referenced
    fields = set()
    tables = set()
    measures = set()
    
    for n in names:
        if n.endswith('/visual.json'):
            try:
                data = json.loads(z.read(n).decode('utf-8', errors='ignore'))
                # scan visual query/projections
                visual = data.get('visual', {})
                query = visual.get('query', {})
                # Look for Query, Projections, visualContainerObjects
                query_str = json.dumps(data)
                # extract simple table / field references
                import re
                # Look for Entity / Property
                entities = re.findall(r'"Entity":\s*"([^"]+)"', query_str)
                properties = re.findall(r'"Property":\s*"([^"]+)"', query_str)
                tables.update(entities)
                fields.update(properties)
            except Exception as e:
                pass

    print(f"\nTables identified ({len(tables)}):")
    for t in sorted(tables):
        print(f"  - {t}")
        
    print(f"\nSample Fields/Measures identified ({len(fields)}):")
    for f in sorted(list(fields))[:40]:
        print(f"  - {f}")
