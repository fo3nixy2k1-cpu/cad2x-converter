import subprocess

# 30 chars: 52pojie!!!_2026_Happy_new_year
# Try adding various chars to make it 31
base = "52pojie!!!_2026_Happy_new_year"
print(f"Base length: {len(base)}")

# Try with prefix/suffix
candidates = [
    base + "!",  # 31
    base + "1",  # 31
    base + "a",  # 31
    "!" + base,  # 31
    "1" + base,  # 31
    "a" + base,  # 31
    base + "_",  # 31
    "_" + base,  # 31
]

for pwd in candidates:
    try:
        result = subprocess.run(
            [b"C:\\Users\\y2k1\\Downloads\\crackme.exe"],
            input=pwd.encode() + b"\n",
            capture_output=True,
            timeout=3
        )
        output = result.stdout + result.stderr
        decoded = output.decode('utf-8', errors='ignore')
        if "Correct" in decoded or "[+]" in decoded:
            print(f"FOUND: {pwd}")
            print(decoded)
        else:
            print(f"{pwd} ({len(pwd)}): Wrong hint")
    except Exception as e:
        print(f"Error: {e}")
