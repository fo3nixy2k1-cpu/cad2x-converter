const {Client}=require('ssh2');
const fs=require('fs');
const c=new Client();
c.on('ready',()=>{
  const pyCode = fs.readFileSync('C:\\Users\\y2k1\\relay_system\\relay_sidecar.py', 'utf8');
  // Write via cat heredoc
  const escaped = pyCode.replace(/'/g, "'\\''").replace(/\\/g, '\\\\');
  const cmd = `cat > /home/y2k1/relay_sidecar.py << 'PYEOF'\n${pyCode}\nPYEOF`;
  c.exec(cmd, (e2,s2)=>{
    let o=''; s2.on('data',d=>o+=d); s2.on('close',()=>{
      console.log('Write result:', o);
      // Kill old and start python
      c.exec('pkill -f "relay_sidecar" 2>/dev/null; sleep 1; cd ~ && nohup python3 relay_sidecar.py > relay_sidecar.log 2>&1 &', (e3,s3)=>{
        let o3=''; s3.on('data',d=>o3+=d); s3.on('close',()=>{ console.log('Start:', o3); c.end(); });
      });
    });
  });
}).on('error',e=>console.error(e)).connect({host:'192.168.10.203',port:22,username:'y2k1',password:'Qpzm1357',readyTimeout:10000});
