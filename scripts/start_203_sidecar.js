const {Client}=require('ssh2');
const c=new Client();
c.on('ready',()=>{
  console.log('SSH connected');
  c.exec('ls -la ~/relay_sidecar.js && ss -tlnp | grep 18081',(e,s)=>{
    let o=''; s.on('data',d=>o+=d);
    s.on('close',()=>{ console.log(o||'no output'); c.end(); });
  });
}).on('error',e=>{ console.error('SSH error:', e.message); process.exit(1); }).connect({host:'192.168.10.203',port:22,username:'y2k1',password:'Qpzm1357',readyTimeout:10000});
