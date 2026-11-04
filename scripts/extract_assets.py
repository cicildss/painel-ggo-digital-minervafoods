import zipfile
import os
import shutil

pbix_path = r"C:\Users\MARIA.ALMEIDA\OneDrive - Minerva S.A\Área de Trabalho\painel GGO Digital V6 - com RLS.pbix"
proj_dir = r"C:\Users\MARIA.ALMEIDA\.gemini\antigravity\scratch\painel-ggo-digital-minervafoods"
assets_dir = os.path.join(proj_dir, "assets", "powerbi_resources")
os.makedirs(assets_dir, exist_ok=True)

with zipfile.ZipFile(pbix_path, 'r') as z:
    for name in z.namelist():
        if 'RegisteredResources' in name or 'BaseThemes' in name:
            filename = os.path.basename(name)
            if filename:
                out_path = os.path.join(assets_dir, filename)
                with open(out_path, 'wb') as f:
                    f.write(z.read(name))
                print(f"Extracted: {filename}")

print("Extraction of visual resources complete!")
