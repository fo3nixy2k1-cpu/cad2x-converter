const{Client}=require('ssh2');
const c=new Client();
c.on('ready',()=>{
  const cmd='curl -s -X POST http://127.0.0.1:18789/v1/messages -H "Authorization: Bearer sk-b669c76c4ec27a7b8d2892303063873b" -H "Content-Type: application/json" -d "{\\\"channel\\\":\\\"qqbot\\\",\\\"target\\\":\\\"3021701\\\",\\\"message\\\":\\\"模型测试：你好！这是从203发出的消息，模型运行正常 👋\\\"}"';
  c.exec(cmd,(e,s)=>{
    let out='';
    s.on('data',d=>out+=d);
    s.on('close',()=>{console.log(out);c.end();});
  });
}).on('error',e=>console.error(e)).connect({host:'192.168.10.203',port:22,username:'y2k1',password:'Qpzm1357',readyTimeout:10000});
