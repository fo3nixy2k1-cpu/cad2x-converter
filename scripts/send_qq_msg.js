const{Client}=require('ssh2');
const c=new Client();
c.on('ready',()=>{
  const cmd='openclaw message send --channel qqbot --target 3021701 --message "模型测试：你好！这是从203发出的消息，模型运行正常" 2>&1';
  c.exec(cmd,(e,s)=>{
    let out='';
    s.on('data',d=>out+=d);
    s.on('close',()=>{console.log(out);c.end();});
  });
}).on('error',e=>console.error(e)).connect({host:'192.168.10.203',port:22,username:'y2k1',password:'Qpzm1357',readyTimeout:10000});
