import pbixray
import pandas as pd
import json
import os

pbix_path = r"C:\Users\MARIA.ALMEIDA\OneDrive - Minerva S.A\Área de Trabalho\painel GGO Digital V6 - com RLS.pbix"
web_data_dir = r"C:\Users\MARIA.ALMEIDA\.gemini\antigravity\scratch\painel-ggo-digital-minervafoods\web\src\data"
os.makedirs(web_data_dir, exist_ok=True)

print("Loading PBIX model...")
model = pbixray.PBIXRay(pbix_path)

# 1. Admins & Gestores RLS
admins = [
    "lilian.nascimento@minervafoods.com",
    "maria.almeida@minervafoods.com",
    "jeanderson.borba@minervafoods.com",
    "roberto.mendonca@minervafoods.com",
    "thatiana.freire@minervafoods.com",
    "gustavo.franco@minervafoods.com",
    "francielle.justino@minervafoods.com",
    "ana.palazzo@minervafoods.com",
    "luiza.bessa@minervafoods.com",
    "laura.masalskiene@minervafoods.com"
]

gestores_df = model.get_table('Gestores_TabEmp')
# Clean and group
gestores_map = {}
for _, row in gestores_df.iterrows():
    email = str(row.get('E-mail', '')).strip().lower()
    cc = str(row.get('Centro de Custo', '')).strip()
    nome = str(row.get('Colaborador', '')).strip()
    negocio = str(row.get('Negcio', '')).strip()
    macro = str(row.get('Macrorea', '')).strip()
    hierarquia = str(row.get('Hierarquia', '')).strip()
    
    if email and email not in ['nan', 'none', '']:
        if email not in gestores_map:
            gestores_map[email] = {
                "name": nome,
                "email": email,
                "role": hierarquia,
                "macro": macro,
                "negocio": negocio,
                "cost_centers": []
            }
        if cc and cc not in gestores_map[email]["cost_centers"]:
            gestores_map[email]["cost_centers"].append(cc)

print(f"Processed {len(gestores_map)} gestores for RLS.")

# 2. Get Fato and Dimensions
fato = model.get_table('@fato')
dim_conta = model.get_table('dim_conta_contabil')
dim_centro = model.get_table('dim_desc_centro')
dim_pacote = model.get_table('dim_pacote')

print("Fato loaded:", len(fato), "rows")

# Save metadata for frontend
metadata = {
    "admins": admins,
    "gestores": list(gestores_map.values())[:100], # top active
    "all_gestor_emails": list(gestores_map.keys())
}

with open(os.path.join(web_data_dir, "metadata.json"), "w", encoding="utf-8") as f:
    json.dump(metadata, f, indent=2, ensure_ascii=False)

print("Saved metadata.json")
