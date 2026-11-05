import pbixray
import pandas as pd
import json
import os
import numpy as np

import glob
import time

onedrive_dir = r"C:\Users\MARIA.ALMEIDA\OneDrive - Minerva S.A\Área de Trabalho"
default_pbix = os.path.join(onedrive_dir, "painel GGO Digital V6 - com RLS.pbix")

# Procura dinamicamente a versão mais recente do arquivo PBIX no OneDrive
pbix_candidates = glob.glob(os.path.join(onedrive_dir, "*GGO*.pbix")) + glob.glob(os.path.join(onedrive_dir, "painel*.pbix"))
pbix_candidates = list(set(pbix_candidates))

if pbix_candidates:
    # Ordena pelo arquivo com data de modificação mais recente
    pbix_candidates.sort(key=lambda x: os.path.getmtime(x), reverse=True)
    pbix_path = pbix_candidates[0]
else:
    pbix_path = default_pbix

pbix_filename = os.path.basename(pbix_path)
pbix_mtime_str = time.strftime('%d/%m/%Y %H:%M:%S', time.localtime(os.path.getmtime(pbix_path))) if os.path.exists(pbix_path) else "Desconhecido"
current_sync_time = time.strftime('%d/%m/%Y %H:%M:%S')

web_data_dir = r"C:\Users\MARIA.ALMEIDA\.gemini\antigravity\scratch\painel-ggo-digital-minervafoods\web\src\data"
os.makedirs(web_data_dir, exist_ok=True)

print(f"Arquivo Power BI selecionado no OneDrive: {pbix_filename}")
print(f"Data de modificação no OneDrive: {pbix_mtime_str}")
print("Carregando modelo do Power BI via pbixray...")
model = pbixray.PBIXRay(pbix_path)

# Carrega tabelas
fato = model.get_table('@fato')
gestores_df = model.get_table('Gestores_TabEmp')
dim_conta = model.get_table('dim_conta_contabil')
dim_centro = model.get_table('dim_desc_centro')
dim_cal = model.get_table('dim_calendario')

print(f"Linhas carregadas: Fato={len(fato)}, Gestores={len(gestores_df)}, Contas={len(dim_conta)}, Centros={len(dim_centro)}")

# Normaliza colunas
fato['Tipo Lancamento'] = pd.to_numeric(fato['Tipo Lancamento'], errors='coerce')
fato['Valor Reais'] = pd.to_numeric(fato['Valor Reais'], errors='coerce').fillna(0)
fato['Cod Objeto Custo'] = fato['Cod Objeto Custo'].astype(str).str.strip()
fato['Cod Conta Contabil'] = fato['Cod Conta Contabil'].astype(str).str.strip()

# Trata datas
fato['Data Contabilizacao'] = pd.to_datetime(fato['Data Contabilizacao'], errors='coerce')
fato['Ano'] = fato['Data Contabilizacao'].dt.year.fillna(2026).astype(int)
fato['Mes'] = fato['Data Contabilizacao'].dt.month.fillna(1).astype(int)

# Dicionários de mapeamento
conta_pacote_map = {}
conta_desc_map = {}
for _, row in dim_conta.iterrows():
    c_cod = str(row.get('cod_conta_contabil', '')).strip()
    c_desc = str(row.get('desc_conta_contabil', '')).strip()
    c_pac = str(row.get('pacote_conta_contabil', '')).strip()
    if c_cod:
        conta_desc_map[c_cod] = c_desc
        conta_pacote_map[c_cod] = c_pac

centro_desc_map = {}
for _, row in dim_centro.iterrows():
    c_id = str(row.get('centro_custos', '')).strip()
    c_name = str(row.get('desc_centro_custos', '')).strip()
    if c_id:
        centro_desc_map[c_id] = c_name

# Mapeamento Gestores
gestores_map = {}
cc_to_gestor = {}
for _, row in gestores_df.iterrows():
    email = str(row.get('E-mail', '')).strip().lower()
    cc = str(row.get('Centro de Custo', '')).strip()
    nome = str(row.get('Colaborador', '')).strip()
    negocio = str(row.get('Negcio', row.get('Negocio', ''))).strip()
    macro = str(row.get('Macrorea', row.get('Macroarea', ''))).strip()
    hierarquia = str(row.get('Hierarquia', 'Gestor')).strip()
    sap_desc = str(row.get('Denominao SAP', row.get('Denominacao SAP', ''))).strip()
    
    if cc and cc not in ['nan', '']:
        cc_to_gestor[cc] = {
            "email": email,
            "colaborador": nome,
            "negocio": negocio,
            "macroarea": macro,
            "sap_desc": sap_desc
        }
    
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

# 1. Metadata
meses_nomes = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
anos_disponiveis = sorted(list(fato['Ano'].dropna().unique()))

metadata = {
    "admins": admins,
    "gestores": list(gestores_map.values()),
    "years": [int(y) for y in anos_disponiveis if y >= 2023],
    "months": [{"id": i+1, "name": m} for i, m in enumerate(meses_nomes)],
    "total_records": len(fato),
    "sync_info": {
        "source_file": pbix_filename,
        "source_mtime": pbix_mtime_str,
        "last_sync": current_sync_time,
        "total_records": len(fato)
    }
}

with open(os.path.join(web_data_dir, "metadata.json"), "w", encoding="utf-8") as f:
    json.dump(metadata, f, indent=2, ensure_ascii=False)
print("Metadata salvo com sucesso.")

# 2. Resumo Mensal por Ano
monthly_summary = []
for ano in metadata["years"]:
    fato_ano = fato[fato['Ano'] == ano]
    for mes_idx in range(1, 13):
        fato_mes = fato_ano[fato_ano['Mes'] == mes_idx]
        orcado = float(fato_mes[fato_mes['Tipo Lancamento'] == 1]['Valor Reais'].sum())
        realizado = float(fato_mes[fato_mes['Tipo Lancamento'] == 2]['Valor Reais'].sum())
        desvio = realizado - orcado
        desvio_pct = (desvio / orcado * 100) if orcado > 0 else 0
        monthly_summary.append({
            "year": int(ano),
            "month": mes_idx,
            "month_name": meses_nomes[mes_idx - 1],
            "orcado": round(orcado, 2),
            "realizado": round(realizado, 2),
            "desvio": round(desvio, 2),
            "desvio_pct": round(desvio_pct, 2)
        })

with open(os.path.join(web_data_dir, "monthly_summary.json"), "w", encoding="utf-8") as f:
    json.dump(monthly_summary, f, indent=2, ensure_ascii=False)
print("monthly_summary salvo.")

# 3. Resumo por Centros de Custo (Ano mais recente / geral)
latest_year = max(metadata["years"]) if metadata["years"] else 2026
fato_latest = fato[fato['Ano'] == latest_year]

cc_grouped = fato_latest.groupby(['Cod Objeto Custo', 'Tipo Lancamento'])['Valor Reais'].sum().unstack(fill_value=0)
if 1 not in cc_grouped.columns: cc_grouped[1] = 0
if 2 not in cc_grouped.columns: cc_grouped[2] = 0

cost_centers_list = []
for cc_code, row in cc_grouped.iterrows():
    orc = float(row[1])
    real = float(row[2])
    desv = real - orc
    desv_pct = (desv / orc * 100) if orc > 0 else 0
    gestor_info = cc_to_gestor.get(cc_code, {})
    desc = centro_desc_map.get(cc_code, gestor_info.get("sap_desc", f"Centro {cc_code}"))
    
    cost_centers_list.append({
        "code": str(cc_code),
        "description": desc,
        "orcado": round(orc, 2),
        "realizado": round(real, 2),
        "desvio": round(desv, 2),
        "desvio_pct": round(desv_pct, 2),
        "gestor": gestor_info.get("colaborador", "Não mapeado"),
        "email_gestor": gestor_info.get("email", ""),
        "macroarea": gestor_info.get("macroarea", "Geral"),
        "negocio": gestor_info.get("negocio", "Minerva Foods")
    })

cost_centers_list.sort(key=lambda x: x["realizado"], reverse=True)

with open(os.path.join(web_data_dir, "cost_centers.json"), "w", encoding="utf-8") as f:
    json.dump(cost_centers_list, f, indent=2, ensure_ascii=False)
print(f"cost_centers salvo com {len(cost_centers_list)} centros.")

# 4. Resumo por Pacotes
fato_latest['Pacote'] = fato_latest['Cod Conta Contabil'].map(conta_pacote_map).fillna("Outros")
pkg_grouped = fato_latest.groupby(['Pacote', 'Tipo Lancamento'])['Valor Reais'].sum().unstack(fill_value=0)
if 1 not in pkg_grouped.columns: pkg_grouped[1] = 0
if 2 not in pkg_grouped.columns: pkg_grouped[2] = 0

packages_list = []
for pkg_name, row in pkg_grouped.iterrows():
    orc = float(row[1])
    real = float(row[2])
    desv = real - orc
    desv_pct = (desv / orc * 100) if orc > 0 else 0
    is_folha = any(term in str(pkg_name).upper() for term in ['FOLHA', 'PESSOAL', 'BENEF', 'SALAR', 'ENCARG'])
    packages_list.append({
        "package": str(pkg_name),
        "type": "Folha" if is_folha else "Não Folha",
        "orcado": round(orc, 2),
        "realizado": round(real, 2),
        "desvio": round(desv, 2),
        "desvio_pct": round(desv_pct, 2)
    })

packages_list.sort(key=lambda x: x["realizado"], reverse=True)

with open(os.path.join(web_data_dir, "packages.json"), "w", encoding="utf-8") as f:
    json.dump(packages_list, f, indent=2, ensure_ascii=False)
print(f"packages salvo com {len(packages_list)} pacotes.")

# 5. Amostra Analítica para Auditoria e Base Analítica (2000 lançamentos recentes)
sample_rows = fato_latest.tail(2500)
analytics_records = []
for _, row in sample_rows.iterrows():
    cc = str(row.get('Cod Objeto Custo', '')).strip()
    cc_info = cc_to_gestor.get(cc, {})
    conta = str(row.get('Cod Conta Contabil', '')).strip()
    tipo = "Orçado" if row.get('Tipo Lancamento') == 1 else "Realizado"
    data_str = str(row.get('Data Contabilizacao'))[:10] if pd.notnull(row.get('Data Contabilizacao')) else ""
    
    analytics_records.append({
        "data": data_str,
        "documento": str(row.get('Documento', '')),
        "conta": conta,
        "desc_conta": conta_desc_map.get(conta, str(row.get('Denominacao', ''))),
        "pacote": conta_pacote_map.get(conta, "Outros"),
        "centro_custo": cc,
        "desc_centro": centro_desc_map.get(cc, cc_info.get("sap_desc", cc)),
        "gestor": cc_info.get("colaborador", "-"),
        "email_gestor": cc_info.get("email", ""),
        "macroarea": cc_info.get("macroarea", "-"),
        "tipo": tipo,
        "valor": round(float(row.get('Valor Reais', 0)), 2)
    })

with open(os.path.join(web_data_dir, "analytics_sample.json"), "w", encoding="utf-8") as f:
    json.dump(analytics_records, f, indent=2, ensure_ascii=False)
print("analytics_sample salvo.")

print("\nProcessamento completo para o frontend!")
