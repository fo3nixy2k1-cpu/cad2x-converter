const{Client}=require('ssh2');
const fs=require('fs');

// Create empty sessions.json
const empty={};
fs.writeFileSync('/tmp/empty_sessions.json',JSON.stringify(empty));

const c=new Client();
c.on('ready',()=>{
  c.sftp((err,sftp)=>{
    sftp.fastPut('/tmp/empty_sessions.json','/home/y2k1/.openclaw/agents/main/sessions/sessions.json',(e)=>{
      if(e){console.error(e);c.end();return;}
      console.log('sessions.json cleared');
      c.end();
    });
  });
}).on('error',e=>console.error(e)).connect({host:'192.168.10.203',port:22,username:'y2k1',password:'Qpzm1357',readyTimeout:10000});
