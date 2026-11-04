import pbixray
import pandas as pd

pbix_path = r"C:\Users\MARIA.ALMEIDA\OneDrive - Minerva S.A\Área de Trabalho\painel GGO Digital V6 - com RLS.pbix"
model = pbixray.PBIXRay(pbix_path)

fato = model.get_table('@fato')
print("Fato shape:", fato.shape)
print("Fato columns:", fato.columns.tolist())
print("\nSample Fato:")
print(fato.head(5))

gestores = model.get_table('Gestores_TabEmp')
print("\nGestores shape:", gestores.shape)
print("Gestores columns:", gestores.columns.tolist())
print("\nSample Gestores:")
print(gestores.head(5))
