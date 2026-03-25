import subprocess

# Try different password combinations
passwords = [
    b"52pojie",
    b"2026",
    b"Happy new year",
    b"52pojie2026",
    b"202652pojie",
    b"52pojie_2026",
    b"52pojie!!!_2026_Happy_new_year",
    b"52pojie!!!_2026",
    b"52pojie!!!",
    b"52pojie2026_Happy_new_year",
    b"!!!_2026_Happy_new_year",
    b"52pojie!!!2026",
    b"happy_new_year",
    b"Happy_new_year_52pojie",
    b"52pojie!!!_2026_Happy",
]

for pwd in passwords:
    try:
        result = subprocess.run(
            [b"C:\\Users\\y2k1\\Downloads\\crackme.exe"],
            input=pwd + b"\n",
            capture_output=True,
            timeout=5
        )
        output = result.stdout + result.stderr
        if b"Correct" in output or b"correct" in output:
            print(f"FOUND: {pwd.decode()}")
            print(f"Output: {output.decode('utf-8', errors='ignore')}")
            break
        else:
            print(f"WRONG: {pwd.decode()}")
    except Exception as e:
        print(f"Error with {pwd.decode()}: {e}")
