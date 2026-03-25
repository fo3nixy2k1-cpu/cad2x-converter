const {Client}=require('ssh2');
const c=new Client();
c.on('ready',()=>{
  c.exec('ss -tlnp | grep -E "8080|8081|18080|18081"; echo "---"; ps aux | grep -E "node|relay" | grep -v grep; echo "---"; systemctl --user status openclaw-gateway 2>&1 | head -10',(e,s)=>{
    let o=''; s.on('data',d=>o+=d); s.on('close',()=>{console.log(o);c.end();});
  });
}).on('error',e=>console.error(e)).connect({host:'192.168.10.203',port:22,username:'y2k1',password:'Qpzm1357',readyTimeout:10000});
