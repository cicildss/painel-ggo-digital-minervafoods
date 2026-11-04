import pandas as pd
import json

base_dir = r"C:\Users\MARIA.ALMEIDA\.gemini\antigravity\scratch\painel-ggo-digital-minervafoods\extracted_model"

print("=== RLS DETAILS ===")
rls = pd.read_csv(f"{base_dir}/rls.csv")
print(rls.to_string())

print("\n=== DAX MEASURES ===")
dax = pd.read_csv(f"{base_dir}/dax_measures.csv")
for idx, row in dax.iterrows():
    print(f"[{row['TableName']}] {row['Name']}:\n  {row['Expression']}\n")

print("\n=== POWER QUERY QUERIES ===")
pq = pd.read_csv(f"{base_dir}/power_query.csv")
for idx, row in pq.iterrows():
    print(f"[{row['TableName']}]:\n{row['Expression']}\n" + "-"*40)
