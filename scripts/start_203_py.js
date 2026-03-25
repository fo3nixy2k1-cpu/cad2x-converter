const {Client}=require('ssh2');
const c=new Client();
c.on('ready',()=>{
  c.exec('cd ~ && nohup python3 relay_sidecar.py > relay_sidecar.log 2>&1 &',(e,s)=>{
    let o=''; s.on('data',d=>o+=d); s.on('close',()=>{
      console.log('Start:', o);
      setTimeout(()=>{
        c.exec('ss -tlnp | grep 18081',(e2,s2)=>{
          let o2=''; s2.on('data',d=>o2+=d); s2.on('close',()=>{console.log(o2||'not listening');c.end();});
        });
      },3000);
    });
  });
}).on('error',e=>console.error(e)).connect({host:'192.168.10.203',port:22,username:'y2k1',password:'Qpzm1357',readyTimeout:10000});
