import zipfile
import struct

pbix_path = r"C:\Users\MARIA.ALMEIDA\OneDrive - Minerva S.A\Área de Trabalho\painel GGO Digital V6 - com RLS.pbix"

with zipfile.ZipFile(pbix_path, 'r') as z:
    raw = z.read('DataModel')

header_str = "This backup was created using XPress9 compression.".encode('utf-16le')
idx = raw.find(header_str)
print("Header pos:", idx)
start_pos = idx + len(header_str)
print("After header bytes (hex):", raw[start_pos:start_pos+64].hex())

# Let's inspect integers at start_pos
print("Unpacked ints after header:")
for i in range(0, 48, 4):
    val = struct.unpack('<I', raw[start_pos+i:start_pos+i+4])[0]
    print(f"offset +{i}: {val} (0x{val:08x})")
