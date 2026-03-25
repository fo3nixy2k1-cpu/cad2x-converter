const{Client}=require('ssh2');
const c=new Client();
c.on('ready',()=>{
  const cmd='openclaw agent --session-id test-qq-fix --message "你好，今天是2026年3月22日，请问现在几点了？简单回答即可。" 2>&1';
  c.exec(cmd,(e,s)=>{
    let out='';
    s.on('data',d=>out+=d);
    s.on('close',()=>{console.log(out);c.end();});
  });
}).on('error',e=>console.error(e)).connect({host:'192.168.10.203',port:22,username:'y2k1',password:'Qpzm1357',readyTimeout:10000});
