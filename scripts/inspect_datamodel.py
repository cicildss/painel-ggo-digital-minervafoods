import zipfile
import re

pbix_path = r"C:\Users\MARIA.ALMEIDA\OneDrive - Minerva S.A\Área de Trabalho\painel GGO Digital V6 - com RLS.pbix"

with zipfile.ZipFile(pbix_path, 'r') as z:
    dm_info = z.getinfo('DataModel')
    print("DataModel size:", dm_info.file_size)
    # Read the first few bytes
    with z.open('DataModel') as f:
        header = f.read(100)
        print("Header:", header[:20])
