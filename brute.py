import itertools
import subprocess

keywords = ["52pojie", "2026", "Happy", "new", "year", "!!!", "_"]

# Try different combinations
candidates = []
# 2-char combos
for p in itertools.permutations(keywords, 2):
    candidates.append("".join(p))
# 3-char combos  
for p in itertools.permutations(keywords, 3):
    candidates.append("".join(p))
# 4-char combos
for p in itertools.permutations(keywords, 4):
    candidates.append("".join(p))

# Also try with explicit strings from the binary
candidates.extend([
    b"52pojie!!!_2026_Happy_new_year",
    b"52pojie!!!_2026",
    b"52pojie2026",
    b"52pojie_2026",
    b"!!!_2026",
    b"52pojie!!!",
])

# Dedupe
candidates = list(set(candidates))[:50]

for pwd in candidates:
    try:
        result = subprocess.run(
            [b"C:\\Users\\y2k1\\Downloads\\crackme.exe"],
            input=pwd + b"\n",
            capture_output=True,
            timeout=3
        )
        output = result.stdout + result.stderr
        if b"Correct" in output or b"[+]" in output:
            print(f"FOUND: {pwd}")
            print(output.decode('utf-8', errors='ignore'))
            exit(0)
    except:
        pass

print("Not found in these combinations")
