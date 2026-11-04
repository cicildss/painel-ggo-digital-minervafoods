import zipfile
import json
import os

pbix_path = r"C:\Users\MARIA.ALMEIDA\OneDrive - Minerva S.A\Área de Trabalho\painel GGO Digital V6 - com RLS.pbix"

with zipfile.ZipFile(pbix_path, 'r') as z:
    print("=== PAGES IN REPORT ===")
    for name in z.namelist():
        if name.startswith('Report/definition/pages/') and name.endswith('/page.json'):
            raw = z.read(name).decode('utf-8', errors='ignore')
            data = json.loads(raw)
            print(f"- Name: {data.get('name')} | Title: {data.get('displayName')} | Hidden: {data.get('visibility')}")

    print("\n=== CONNECTIONS / SETTINGS ===")
    for conn_file in ['Connections', 'Settings', 'Metadata']:
        if conn_file in z.namelist():
            print(f"-- {conn_file} --")
            try:
                print(z.read(conn_file).decode('utf-8', errors='ignore')[:500])
            except Exception as e:
                print("Error reading:", e)

    print("\n=== REGISTERED RESOURCES (IMAGES / THEMES) ===")
    for name in z.namelist():
        if 'RegisteredResources' in name:
            print(f"- {name} ({len(z.read(name))} bytes)")
