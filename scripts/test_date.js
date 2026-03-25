const{Client}=require('ssh2');
const c=new Client();
c.on('ready',()=>{
  const cmd='/home/y2k1/npm-global/bin/openclaw agent --session-id date-test --message "今天是哪年哪月哪日？用中文回答。" 2>&1';
  c.exec(cmd,(e,s)=>{
    let out='';
    s.on('data',d=>out+=d);
    s.on('close',()=>{console.log(out);c.end();});
  });
}).on('error',e=>console.error(e)).connect({host:'192.168.10.203',port:22,username:'y2k1',password:'Qpzm1357',readyTimeout:10000});
