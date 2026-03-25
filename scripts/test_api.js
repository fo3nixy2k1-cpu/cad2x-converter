const{Client}=require('ssh2');
const c=new Client();
c.on('ready',()=>{
  const cmd='curl -s -X POST https://api.minimax.chat/v1/chat/completions -H "Authorization: Bearer sk-cp-bCPMm-IjvthmhMttaC9-gKDOfVfNRVVBOBxnZtR3hnOyzhJE51oslGk9NfmOJ3a69-aLbGIvTG5vslbmhmlKoiMh7n-uf18m02XkbqDhZBrogJR5OugbovA" -H "Content-Type: application/json" -d \'{"model":"MiniMax-M2.7-highspeed","messages":[{"role":"user","content":"hi"}]}\'';
  c.exec(cmd,(e,s)=>{
    let out='';
    s.on('data',d=>out+=d);
    s.on('close',()=>{console.log(out.substring(0,500));c.end();});
  });
}).on('error',e=>console.error(e)).connect({host:'192.168.10.203',port:22,username:'y2k1',password:'Qpzm1357',readyTimeout:10000});
