const {Client}=require('ssh2');
const c=new Client();
c.on('ready',()=>{
  c.exec('pkill -9 -f "relay_sidecar" 2>/dev/null; sleep 2; cd ~ && nohup python3 relay_sidecar.py > relay_sidecar.log 2>&1 &',(e,s)=>{
    let o=''; s.on('data',d=>o+=d); s.on('close',()=>{
      console.log('Restart:', o);
      setTimeout(()=>{
        c.exec('ss -tlnp | grep 18081 && cat relay_sidecar.log | tail -3',(e2,s2)=>{
          let o2=''; s2.on('data',d=>o2+=d); s2.on('close',()=>{console.log(o2);c.end();});
        });
      },3000);
    });
  });
}).on('error',e=>console.error(e)).connect({host:'192.168.10.203',port:22,username:'y2k1',password:'Qpzm1357',readyTimeout:10000});
