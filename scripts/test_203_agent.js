const{Client}=require('ssh2');
const c=new Client();
c.on('ready',()=>{
  const cmd='openclaw agent --session-id test-session --message "你好，简单的自我介绍下" 2>&1';
  c.exec(cmd,(e,s)=>{
    let out='';
    s.on('data',d=>out+=d);
    s.on('close',()=>{console.log(out);c.end();});
  });
}).on('error',e=>console.error(e)).connect({host:'192.168.10.203',port:22,username:'y2k1',password:'Qpzm1357',readyTimeout:10000});
