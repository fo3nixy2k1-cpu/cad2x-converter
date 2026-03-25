const {Client}=require('ssh2');
const c=new Client();
c.on('ready',()=>{
  c.exec('ps aux | grep -E "node|relay" | grep -v grep; echo "---"; curl -s http://localhost:18081/health || echo no_health',(e,s)=>{
    let o=''; s.on('data',d=>o+=d); s.on('close',()=>{console.log(o);c.end();});
  });
}).on('error',e=>console.error(e)).connect({host:'192.168.10.203',port:22,username:'y2k1',password:'Qpzm1357',readyTimeout:10000});
