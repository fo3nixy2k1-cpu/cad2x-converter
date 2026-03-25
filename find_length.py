import subprocess

# Try different lengths more systematically
for length in range(1, 50):
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
        # Look for any success or different message
        if "Correct" in decoded or "[+]" in decoded:
            print(f"*** SUCCESS Length {length}! ***")
            print(decoded)
            break
        elif "Checksum" in decoded:
            print(f"Length {length}: Checksum failed")
        elif "Wrong" in decoded:
            print(f"Length {length}: Wrong")
        else:
            # Check if there's any other message
            lines = [l for l in decoded.split('\n') if l.strip()]
            if len(lines) > 5:
                print(f"Length {length}: {lines[4] if len(lines) > 4 else 'other'}")
    except Exception as e:
        print(f"Length {length}: Error - {e}")
