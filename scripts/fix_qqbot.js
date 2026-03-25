const{Client}=require('ssh2');
const c=new Client();
c.on('ready',()=>{
  c.exec('rm -rf /usr/lib/node_modules/openclaw-cn/extensions/qqbot',(e,s)=>{
    s.on('close',()=>{
      c.exec('systemctl --user restart openclaw-gateway',(e2,s2)=>{
        s2.on('close',()=>{console.log('done');c.end();});
      });
    });
  });
}).on('error',e=>console.error(e)).connect({host:'192.168.10.203',port:22,username:'y2k1',password:'Qpzm1357',readyTimeout:10000});
