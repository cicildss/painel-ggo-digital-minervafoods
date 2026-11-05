import pbixray
import pandas as pd
import json
import os
import numpy as np
import glob
import time
import sys

# Ensure UTF-8 output on Windows console
if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

onedrive_dir = r"C:\Users\MARIA.ALMEIDA\OneDrive - Minerva S.A\Área de Trabalho"
default_pbix = os.path.join(onedrive_dir, "painel GGO Digital V6 - com RLS.pbix")

# Procura dinamicamente a versão mais recente do arquivo PBIX no OneDrive
pbix_candidates = glob.glob(os.path.join(onedrive_dir, "*GGO*.pbix")) + glob.glob(os.path.join(onedrive_dir, "painel*.pbix"))
pbix_candidates = list(set(pbix_candidates))

if pbix_candidates:
    pbix_candidates.sort(key=lambda x: os.path.getmtime(x), reverse=True)
    pbix_path = pbix_candidates[0]
else:
    pbix_path = default_pbix

pbix_filename = os.path.basename(pbix_path)
pbix_mtime_str = time.strftime('%d/%m/%Y %H:%M:%S', time.localtime(os.path.getmtime(pbix_path))) if os.path.exists(pbix_path) else "Desconhecido"
current_sync_time = time.strftime('%d/%m/%Y %H:%M:%S')

web_data_dir = r"C:\Users\MARIA.ALMEIDA\.gemini\antigravity\scratch\painel-ggo-digital-minervafoods\web\src\data"
os.makedirs(web_data_dir, exist_ok=True)

print(f"[ETL] Arquivo Power BI: {pbix_filename}")
print(f"[ETL] Modificacao: {pbix_mtime_str}")
print("[ETL] Carregando modelo PBIX...")
model = pbixray.PBIXRay(pbix_path)

# Carrega tabelas fundamentais
fato = model.get_table('@fato')
gestores_df = model.get_table('Gestores_TabEmp')
dim_conta = model.get_table('dim_conta_contabil')
dim_centro = model.get_table('dim_desc_centro')
dim_cal = model.get_table('dim_calendario')

# Carrega tabelas de hierarquia e estrutura organizacional
p_table = model.get_table('dim_pessoas')
f_gest = model.get_table('fato_gestor_centro_custo')
b_table = model.get_table('dim_negocio')
macro_table = model.get_table('dim_macro_area')

def clean_text(val):
    if not isinstance(val, str):
        return ''
    val = val.strip()
    if val.upper() in ['TBD', 'NAN', 'NONE', 'NULL', '']:
        return ''
    replacements = {
        'Distribuio': 'Distribuição',
        'Crdito': 'Crédito',
        'Logstica': 'Logística',
        'Gesto': 'Gestão',
        'Operaes': 'Operações',
        'Inovao': 'Inovação',
        'Direo': 'Direção',
        'Comunicao': 'Comunicação',
        'Jurdico': 'Jurídico',
        'Tcnica': 'Técnica',
        'Negcio': 'Negócio',
        'Macrorea': 'Macroárea'
    }
    for k, v in replacements.items():
        val = val.replace(k, v)
    return val

person_map = {k: clean_text(v) for k, v in zip(p_table['id_person'], p_table['name_person'])}
business_map = {k: clean_text(v) for k, v in zip(b_table['id_business'], b_table['desc_business'])}
macro_map = {k: clean_text(v) for k, v in zip(macro_table['id_macro_area'], macro_table['desc_macro_area'])}

# Normaliza colunas fato
fato['Tipo Lancamento'] = pd.to_numeric(fato['Tipo Lancamento'], errors='coerce')
fato['Valor Reais'] = pd.to_numeric(fato['Valor Reais'], errors='coerce').fillna(0)
fato['Cod Objeto Custo'] = fato['Cod Objeto Custo'].astype(str).str.strip()
fato['Cod Conta Contabil'] = fato['Cod Conta Contabil'].astype(str).str.strip()

# Trata datas
fato['Data Contabilizacao'] = pd.to_datetime(fato['Data Contabilizacao'], errors='coerce')
fato['Ano'] = fato['Data Contabilizacao'].dt.year.fillna(2026).astype(int)
fato['Mes'] = fato['Data Contabilizacao'].dt.month.fillna(1).astype(int)

# Dicionários de contas e centros
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

# Mapeamento Completo de Hierarquia Organizacional por Centro de Custo
# 1. Base estrutural de fato_gestor_centro_custo
cc_hierarchy = {}
for _, row in f_gest.iterrows():
    cc = str(row['cost_center']).strip()
    if not cc:
        continue
    cc_hierarchy[cc] = {
        'diretor': person_map.get(row.get('id_director'), ''),
        'gerente': person_map.get(row.get('id_executive_manager'), ''),
        'gestor': person_map.get(row.get('id_manager'), ''),
        'clevel': person_map.get(row.get('id_clevel'), ''),
        'negocio': business_map.get(row.get('id_business'), ''),
        'macroarea': macro_map.get(row.get('id_macroarea'), ''),
        'email': '',
        'sap_desc': ''
    }

# 2. Enriquecimento com Gestores_TabEmp (para e-mails e colaboradores diretos)
gestores_map = {}
for _, row in gestores_df.iterrows():
    cc = str(row.get('Centro de Custo', '')).strip()
    if not cc or cc.lower() == 'nan':
        continue
    email = str(row.get('E-mail', '')).strip().lower()
    nome = clean_text(str(row.get('Colaborador', '')))
    negocio = clean_text(str(row.get('Negcio', row.get('Negocio', ''))))
    macro = clean_text(str(row.get('Macrorea', row.get('Macroarea', ''))))
    hierarquia = str(row.get('Hierarquia', 'Gestor')).strip()
    sap_desc = clean_text(str(row.get('Denominao SAP', row.get('Denominacao SAP', ''))))

    if cc not in cc_hierarchy:
        cc_hierarchy[cc] = {
            'diretor': '',
            'gerente': '',
            'gestor': nome,
            'clevel': '',
            'negocio': negocio,
            'macroarea': macro,
            'email': email,
            'sap_desc': sap_desc
        }
    else:
        if not cc_hierarchy[cc]['gestor'] and nome:
            cc_hierarchy[cc]['gestor'] = nome
        if not cc_hierarchy[cc]['negocio'] and negocio:
            cc_hierarchy[cc]['negocio'] = negocio
        if not cc_hierarchy[cc]['macroarea'] and macro:
            cc_hierarchy[cc]['macroarea'] = macro
        if email:
            cc_hierarchy[cc]['email'] = email
        if sap_desc:
            cc_hierarchy[cc]['sap_desc'] = sap_desc

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

# Listas únicas para filtros globais
diretores_list = sorted(list(set(v['diretor'] for v in cc_hierarchy.values() if v.get('diretor'))))
gerentes_list = sorted(list(set(v['gerente'] for v in cc_hierarchy.values() if v.get('gerente'))))
gestores_list = sorted(list(set(v['gestor'] for v in cc_hierarchy.values() if v.get('gestor'))))
negocios_list = sorted(list(set(v['negocio'] for v in cc_hierarchy.values() if v.get('negocio'))))
macroareas_list = sorted(list(set(v['macroarea'] for v in cc_hierarchy.values() if v.get('macroarea'))))

# 1. Metadata
meses_nomes = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
anos_disponiveis = sorted(list(fato['Ano'].dropna().unique()))

metadata = {
    "admins": admins,
    "gestores": list(gestores_map.values()),
    "years": [int(y) for y in anos_disponiveis if y >= 2023],
    "months": [{"id": i+1, "name": m} for i, m in enumerate(meses_nomes)],
    "total_records": len(fato),
    "directors": diretores_list,
    "executive_managers": gerentes_list,
    "managers": gestores_list,
    "businesses": negocios_list,
    "macroareas": macroareas_list,
    "sync_info": {
        "source_file": pbix_filename,
        "source_mtime": pbix_mtime_str,
        "last_sync": current_sync_time,
        "total_records": len(fato)
    }
}

with open(os.path.join(web_data_dir, "metadata.json"), "w", encoding="utf-8") as f:
    json.dump(metadata, f, indent=2, ensure_ascii=False)
print(f"[ETL] metadata.json salvo ({len(diretores_list)} Diretores, {len(gerentes_list)} Gerentes, {len(negocios_list)} BUs).")

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
print("[ETL] monthly_summary.json salvo.")

# 3. Resumo por Centros de Custo com Hierarquia Completa
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
    hier = cc_hierarchy.get(cc_code, {})
    desc = centro_desc_map.get(cc_code, hier.get("sap_desc", f"Centro {cc_code}"))
    
    cost_centers_list.append({
        "code": str(cc_code),
        "description": desc,
        "orcado": round(orc, 2),
        "realizado": round(real, 2),
        "desvio": round(desv, 2),
        "desvio_pct": round(desv_pct, 2),
        "gestor": hier.get("gestor") or "Não mapeado",
        "email_gestor": hier.get("email", ""),
        "gerente": hier.get("gerente") or "Não mapeado",
        "diretor": hier.get("diretor") or "Não mapeado",
        "clevel": hier.get("clevel") or "",
        "macroarea": hier.get("macroarea") or "Geral",
        "negocio": hier.get("negocio") or "Corporativo"
    })

cost_centers_list.sort(key=lambda x: x["realizado"], reverse=True)

with open(os.path.join(web_data_dir, "cost_centers.json"), "w", encoding="utf-8") as f:
    json.dump(cost_centers_list, f, indent=2, ensure_ascii=False)
print(f"[ETL] cost_centers.json salvo com {len(cost_centers_list)} centros.")

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
print(f"[ETL] packages.json salvo com {len(packages_list)} pacotes.")

# 5. Amostra Analítica para Auditoria e Base Analítica
sample_rows = fato_latest.tail(2500)
analytics_records = []
for _, row in sample_rows.iterrows():
    cc = str(row.get('Cod Objeto Custo', '')).strip()
    hier = cc_hierarchy.get(cc, {})
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
        "desc_centro": centro_desc_map.get(cc, hier.get("sap_desc", cc)),
        "gestor": hier.get("gestor", "-"),
        "gerente": hier.get("gerente", "-"),
        "diretor": hier.get("diretor", "-"),
        "email_gestor": hier.get("email", ""),
        "macroarea": hier.get("macroarea", "Geral"),
        "negocio": hier.get("negocio", "Corporativo"),
        "tipo": tipo,
        "valor": round(float(row.get('Valor Reais', 0)), 2)
    })

with open(os.path.join(web_data_dir, "analytics_sample.json"), "w", encoding="utf-8") as f:
    json.dump(analytics_records, f, indent=2, ensure_ascii=False)
print(f"[ETL] analytics_sample.json salvo com {len(analytics_records)} registros.")
print("[ETL] Concluido com sucesso!")
