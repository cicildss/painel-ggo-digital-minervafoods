import ctypes
from ctypes import wintypes
import zipfile

# Windows Compression API (Cabinet.dll)
# COMPRESS_ALGORITHM_XPRESS = 3
# COMPRESS_ALGORITHM_XPRESS_HUFF = 4 (XPress9)

COMPRESS_ALGORITHM_XPRESS_HUFF = 4

cabinet = ctypes.windll.cabinet

CreateDecompressor = cabinet.CreateDecompressor
CreateDecompressor.argtypes = [wintypes.DWORD, ctypes.c_void_p, ctypes.POINTER(ctypes.c_void_p)]
CreateDecompressor.restype = wintypes.BOOL

CloseDecompressor = cabinet.CloseDecompressor
CloseDecompressor.argtypes = [ctypes.c_void_p]
CloseDecompressor.restype = wintypes.BOOL

Decompress = cabinet.Decompress
Decompress.argtypes = [
    ctypes.c_void_p,
    ctypes.c_void_p,
    ctypes.c_size_t,
    ctypes.c_void_p,
    ctypes.c_size_t,
    ctypes.POINTER(ctypes.c_size_t)
]
Decompress.restype = wintypes.BOOL

h_decompressor = ctypes.c_void_p()
success = CreateDecompressor(COMPRESS_ALGORITHM_XPRESS_HUFF, None, ctypes.byref(h_decompressor))
print("CreateDecompressor success:", success, "handle:", h_decompressor.value)
if success:
    CloseDecompressor(h_decompressor)
