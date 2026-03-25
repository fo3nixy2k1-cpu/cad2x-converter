import subprocess

# Try different lengths
lengths = [5, 10, 15, 20, 25, 30, 31, 32, 33, 34, 35, 40]

for length in lengths:
    pwd = "a" * length
    try:
        result = subprocess.run(
            [b"C:\\Users\\y2k1\\Downloads\\crackme.exe"],
            input=pwd.encode() + b"\n",
            capture_output=True,
            timeout=3
        )
        output = result.stdout + result.stderr
        decoded = output.decode('utf-8', errors='ignore')
        if "Wrong" in decoded or "Checksum" in decoded or "Correct" in decoded:
            print(f"Length {length}: {decoded[:150]}")
    except:
        pass

# Also try the exact string from MEMORY
pwd = b"52pojie!!!_2026_Happy_new_year"
result = subprocess.run([b"C:\\Users\\y2k1\\Downloads\\crackme.exe"], input=pwd + b"\n", capture_output=True, timeout=3)
print(f"\n52pojie!!!_2026_Happy_new_year ({len(pwd)}): {result.stdout.decode('utf-8', errors='ignore')}")
