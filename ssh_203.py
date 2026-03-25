import paramiko
import time

host = '192.168.10.203'
port = 22
user = 'y2k1'
pw = 'Qpzm1357'

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(host, port=port, username=user, password=pw, timeout=10)

# Kill existing
transport = client.get_transport()
ch = transport.open_session()
ch.exec_command('pkill -f relay_sidecar_203.py 2>/dev/null; sleep 0.5; echo done')
time.sleep(2)

# Start in background
ch = transport.open_session()
ch.exec_command('cd ~ && nohup python3 relay_sidecar_203.py >> relay_sidecar_203.log 2>&1 &')
time.sleep(3)

# Check port
ch = transport.open_session()
ch.exec_command('ss -tlnp | grep 18081 || echo "port not found"')
time.sleep(1)
print("Port:", ch.recv(4096).decode())

# Check log
ch = transport.open_session()
ch.exec_command('tail -5 ~/relay_sidecar_203.log')
time.sleep(1)
print("Log:", ch.recv(4096).decode())

# Check process
ch = transport.open_session()
ch.exec_command('pgrep -a python3 | grep relay || echo "no process"')
time.sleep(1)
print("Process:", ch.recv(4096).decode())

client.close()
