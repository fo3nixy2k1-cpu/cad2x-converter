const{Client}=require('ssh2');
const c=new Client();
c.on('ready',()=>{
  const cmd='/home/y2k1/npm-global/bin/openclaw agent --session-id fresh-test --message "请用QQ给 qqbot:c2c:E3E50CD7DD1D7D095CBE478722B53079 发一条消息，内容是：老郑好！这是openclaw版启明的测试消息，版本已升级到2026.3.13！" 2>&1';
  c.exec(cmd,(e,s)=>{
    let out='';
    s.on('data',d=>out+=d);
    s.on('close',()=>{console.log(out);c.end();});
  });
}).on('error',e=>console.error(e)).connect({host:'192.168.10.203',port:22,username:'y2k1',password:'Qpzm1357',readyTimeout:10000});
