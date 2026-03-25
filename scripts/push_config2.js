const{Client}=require('ssh2');
const fs=require('fs');
const content=fs.readFileSync('C:/Users/y2k1/.openclaw/workspace/scripts/203_new_config.json','utf8');
const b64=Buffer.from(content).toString('base64');
const c=new Client();
c.on('ready',()=>{
  console.log('connected');
  c.exec('cp /home/y2k1/.openclaw/openclaw.json /home/y2k1/.openclaw/openclaw.json.bak.20260322',(err,s)=>{
    s.on('data',d=>process.stdout.write(d));
    s.on('close',()=>{
      console.log('backup done');
      c.exec('echo "'+b64+'" | base64 -d > /home/y2k1/.openclaw/openclaw.json',(e2,s2)=>{
        s2.on('close',()=>{
          c.exec('cat /home/y2k1/.openclaw/openclaw.json',(e3,s3)=>{
            let d='';
            s3.on('data',x=>d+=x);
            s3.on('close',()=>{console.log('result:');console.log(d);c.end();});
          });
        });
      });
    });
  });
}).on('error',e=>{console.error('error:',e);}).on('timeout',()=>{console.error('timeout');c.end();}).connect({host:'192.168.10.203',port:22,username:'y2k1',password:'Qpzm1357',readyTimeout:10000});
