const{Client}=require('ssh2');
const c=new Client();
c.on('ready',()=>{
  const cmd1='rm -f /home/y2k1/.openclaw/agents/main/sessions/72e6f8f3-77c3-4f51-86a0-5fae291de5e7.jsonl /home/y2k1/.openclaw/agents/main/sessions/73507b92-1c3d-4637-883f-f0206e28efa7.jsonl /home/y2k1/.openclaw/agents/main/sessions/9de286ad-697d-4371-bbbe-7f77d320e83b.jsonl';
  c.exec(cmd1,(e,s)=>{
    s.on('close',()=>{
      c.exec('openclaw sessions',(e2,s2)=>{
        let out='';
        s2.on('data',d=>out+=d);
        s2.on('close',()=>{console.log(out);c.end();});
      });
    });
  });
}).on('error',e=>console.error(e)).connect({host:'192.168.10.203',port:22,username:'y2k1',password:'Qpzm1357',readyTimeout:10000});
