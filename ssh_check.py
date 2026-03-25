import subprocess

result = subprocess.run(
    ["ssh", "y2k1@192.168.10.203", "free -h && ps aux --sort=-%mem | head -10"],
    capture_output=True,
    text=True,
    timeout=15
)
print(result.stdout)
if result.stderr:
    print("STDERR:", result.stderr)
