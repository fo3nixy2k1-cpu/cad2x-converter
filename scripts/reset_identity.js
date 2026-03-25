const{Client}=require('ssh2');
const c=new Client();
c.on('ready',()=>{
  c.exec('rm -f /home/y2k1/.openclaw/identity/device-auth.json /home/y2k1/.openclaw/identity/device.json && echo deleted',(e,s)=>{
    let out='';
    s.on('data',d=>out+=d);
    s.on('close',()=>{
      console.log(out);
      c.exec('systemctl --user restart openclaw-gateway',(e2,s2)=>{
        s2.on('close',()=>{console.log('restarted');c.end();});
      });
    });
  });
}).on('error',e=>console.error(e)).connect({host:'192.168.10.203',port:22,username:'y2k1',password:'Qpzm1357',readyTimeout:10000});
