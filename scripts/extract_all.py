import pbixray
import json
import os

pbix_path = r"C:\Users\MARIA.ALMEIDA\OneDrive - Minerva S.A\Área de Trabalho\painel GGO Digital V6 - com RLS.pbix"
out_dir = r"C:\Users\MARIA.ALMEIDA\.gemini\antigravity\scratch\painel-ggo-digital-minervafoods\extracted_model"
os.makedirs(out_dir, exist_ok=True)

model = pbixray.PBIXRay(pbix_path)

# 1. RLS
print("--- EXTRACTING RLS ---")
rls_info = []
if hasattr(model, 'rls'):
    print("RLS type:", type(model.rls))
    try:
        rls_df = model.rls
        print(rls_df)
        rls_df.to_csv(os.path.join(out_dir, "rls.csv"), index=False)
    except Exception as e:
        print("Error saving rls:", e)

# 2. DAX Measures
print("\n--- EXTRACTING DAX MEASURES ---")
try:
    measures_df = model.dax_measures
    print(f"Total measures: {len(measures_df)}")
    print(measures_df.head(10))
    measures_df.to_csv(os.path.join(out_dir, "dax_measures.csv"), index=False)
except Exception as e:
    print("Error saving measures:", e)

# 3. Power Query
print("\n--- EXTRACTING POWER QUERY ---")
try:
    pq_df = model.power_query
    print(pq_df)
    pq_df.to_csv(os.path.join(out_dir, "power_query.csv"), index=False)
except Exception as e:
    print("Error saving power_query:", e)

# 4. Relationships
print("\n--- EXTRACTING RELATIONSHIPS ---")
try:
    rel_df = model.relationships
    print(rel_df)
    rel_df.to_csv(os.path.join(out_dir, "relationships.csv"), index=False)
except Exception as e:
    print("Error saving relationships:", e)

# 5. Schema / Tables summary
print("\n--- EXTRACTING TABLES ---")
table_summaries = {}
for t in model.tables:
    try:
        df = model.get_table(t)
        table_summaries[t] = {
            "columns": list(df.columns),
            "row_count": len(df),
            "dtypes": {c: str(d) for c, d in df.dtypes.items()}
        }
        print(f"Table '{t}': {len(df)} rows, cols: {list(df.columns)[:5]}")
    except Exception as e:
        table_summaries[t] = {"error": str(e)}
        print(f"Table '{t}': error ({e})")

with open(os.path.join(out_dir, "table_summaries.json"), "w", encoding="utf-8") as f:
    json.dump(table_summaries, f, indent=2, ensure_ascii=False)

print("\nExtraction complete!")
