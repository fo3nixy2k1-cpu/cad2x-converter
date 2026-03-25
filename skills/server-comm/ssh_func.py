import paramiko
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def ssh_cmd(host, port, user, password, cmd, timeout=20):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(host, port=port, username=user, password=password, timeout=timeout, banner_timeout=timeout)
    stdin, stdout, stderr = client.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    client.close()
    return out, err

if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: python ssh_func.py <host> <command> [port] [user] [password]")
        sys.exit(1)
    host = sys.argv[1]
    cmd = sys.argv[2]
    port = int(sys.argv[3]) if len(sys.argv) > 3 else 22
    user = sys.argv[4] if len(sys.argv) > 4 else 'y2k1'
    password = sys.argv[5] if len(sys.argv) > 5 else 'Qpzm1357'
    
    out, err = ssh_cmd(host, port, user, password, cmd)
    print(out)
    if err:
        print('STDERR:', err)
