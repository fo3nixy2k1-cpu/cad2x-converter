import struct

with open(r'C:\Users\y2k1\Downloads\crackme.exe', 'rb') as f:
    dos = f.read(64)
    
# PE header offset
pe_offset = struct.unpack('<I', dos[60:64])[0]
print(f'PE offset: {hex(pe_offset)}')

# Read PE header
f.seek(pe_offset)
pe_sig = f.read(4)
print(f'PE signature: {pe_sig}')

# COFF header
coff = f.read(20)
num_sections = struct.unpack('<H', coff[2:4])[0]
opt_hdr_size = struct.unpack('<H', coff[16:18])[0]
print(f'Number of sections: {num_sections}')
print(f'Optional header size: {opt_hdr_size}')

# Optional header - Entry point
opt_offset = pe_offset + 4 + 20  # PE sig + COFF
f.seek(opt_offset + 16)
entry_rva = struct.unpack('<I', f.read(4))[0]
print(f'Entry RVA: {hex(entry_rva)}')

# Image base
f.seek(opt_offset + 28)
image_base = struct.unpack('<I', f.read(4))[0]
print(f'Image base: {hex(image_base)}')

# Section headers
f.seek(pe_offset + 4 + 20 + opt_hdr_size)
print('\nSections:')
for i in range(num_sections):
    sec = f.read(40)
    name = sec[:8].rstrip(b'\x00').decode()
    virtual_size = struct.unpack('<I', sec[8:12])[0]
    virtual_addr = struct.unpack('<I', sec[12:16])[0]
    raw_size = struct.unpack('<I', sec[16:20])[0]
    raw_offset = struct.unpack('<I', sec[20:24])[0]
    print(f'  {name}: VSize={hex(virtual_size)}, VAddr={hex(virtual_addr)}, RSize={raw_size},ROffset={hex(raw_offset)}')

# Find which section contains entry point
f.seek(pe_offset + 4 + 20 + opt_hdr_size)
for i in range(num_sections):
    sec = f.read(40)
    virtual_addr = struct.unpack('<I', sec[12:16])[0]
    virtual_size = struct.unpack('<I', sec[8:12])[0]
    if entry_rva >= virtual_addr and entry_rva < virtual_addr + virtual_size:
        raw_offset = struct.unpack('<I', sec[20:24])[0]
        file_offset = raw_offset + (entry_rva - virtual_addr)
        print(f'\nEntry point file offset: {hex(file_offset)}')
        break
