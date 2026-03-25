const{Client}=require('ssh2');
const c=new Client();
c.on('ready',()=>{
  const cmd='/home/y2k1/npm-global/bin/openclaw agent --session-id memos-test --message "请查询今天的日期和天气，然后用中文简短回复。顺便告诉我你有没有连接memos或memory插件。" 2>&1';
  c.exec(cmd,(e,s)=>{
    let out='';
    s.on('data',d=>out+=d);
    s.on('close',()=>{console.log(out);c.end();});
  });
}).on('error',e=>console.error(e)).connect({host:'192.168.10.203',port:22,username:'y2k1',password:'Qpzm1357',readyTimeout:10000});
