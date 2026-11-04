import zipfile

pbix_path = r"C:\Users\MARIA.ALMEIDA\OneDrive - Minerva S.A\Área de Trabalho\painel GGO Digital V6 - com RLS.pbix"

with zipfile.ZipFile(pbix_path, 'r') as z:
    with z.open('DataModel') as f:
        header = f.read(512)
        print("Repr:", repr(header))
        print("UTF-16LE ascii only:", ''.join(chr(c) for c in header if 32 <= c <= 126))
