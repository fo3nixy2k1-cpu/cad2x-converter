const{Client}=require('ssh2');
const fs=require('fs');
const b64=Buffer.from(fs.readFileSync('C:/Users/y2k1/.openclaw/workspace/scripts/203_new_config.json','utf8')).toString('base64');
const c=new Client();
c.on('ready',()=>{
  c.exec('echo "'+b64+'" | base64 -d > /home/y2k1/.openclaw/openclaw.json',(err,s)=>{
    s.on('close',()=>{
      c.exec('cat /home/y2k1/.openclaw/openclaw.json',(e2,s2)=>{let d='';s2.on('data',x=>d+=x);s2.on('close',()=>{console.log(d);c.end();});});
    });
  });
}).on('error',e=>console.error(e)).connect({host:'192.168.10.203',port:22,username:'y2k1',password:'Qpzm1357'});
