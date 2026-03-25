const{Client}=require('ssh2');
const fs=require('fs');
const c=new Client();
c.on('ready',()=>{
  console.log('connected');
  c.sftp((err,sftp)=>{
    if(err){console.error('sftp error:',err);c.end();return;}
    // Backup first
    sftp.fastGet('/home/y2k1/.openclaw/openclaw.json','/tmp/203_backup.json',(e1)=>{
      if(e1)console.error('backup error:',e1);
      else console.log('backup done');
    });
    sftp.fastPut('C:/Users/y2k1/.openclaw/workspace/scripts/203_new_config.json','/home/y2k1/.openclaw/openclaw.json',(e2)=>{
      if(e2){console.error('put error:',e2);c.end();return;}
      console.log('upload done, verifying...');
      sftp.fastGet('/home/y2k1/.openclaw/openclaw.json','/tmp/203_verify.json',(e3,res)=>{
        const data=fs.readFileSync('/tmp/203_verify.json','utf8');
        console.log('verified:',data);
        c.end();
      });
    });
  });
}).on('error',e=>console.error('error:',e)).connect({host:'192.168.10.203',port:22,username:'y2k1',password:'Qpzm1357',readyTimeout:10000});
