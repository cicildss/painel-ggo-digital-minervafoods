import pbixray

pbix_path = r"C:\Users\MARIA.ALMEIDA\OneDrive - Minerva S.A\Área de Trabalho\painel GGO Digital V6 - com RLS.pbix"

model = pbixray.PBIXRay(pbix_path)

print("model.tables:")
for t in model.tables:
    print(" -", t)

print("\nModel properties and methods:")
for prop in dir(model):
    if not prop.startswith('_'):
        print(" -", prop)
