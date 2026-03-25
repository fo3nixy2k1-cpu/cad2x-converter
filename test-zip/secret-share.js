/**
 * 密钥派生算法 - XOR + Base64
 * 
 * 用法:
 *   node secret-share.js <password> <myKey>
 *   
 * 示例:
 *   node secret-share.js Testonly.1a OK
 */

function generateKey(password, myKey) {
  // 1. 把我的密钥扩展到和密码一样长度
  const extendedKey = myKey.repeat(Math.ceil(password.length / myKey.length)).slice(0, password.length);
  
  // 2. XOR 运算
  const aKeyBytes = Buffer.from(password).map((b, i) => b ^ extendedKey.charCodeAt(i));
  
  // 3. Base64 编码（变成可读字符）
  const aKey = aKeyBytes.toString('base64');
  
  return aKey;
}

function derivePassword(aKey, myKey) {
  // 1. Base64 解码
  const aKeyBytes = Buffer.from(aKey, 'base64');
  
  // 2. 扩展密钥
  const extendedKey = myKey.repeat(Math.ceil(aKeyBytes.length / myKey.length)).slice(0, aKeyBytes.length);
  
  // 3. XOR 还原
  const password = aKeyBytes.map((b, i) => b ^ extendedKey.charCodeAt(i)).toString();
  
  return password;
}

// 测试
if (require.main === module) {
  const password = process.argv[2] || 'Testonly.1a';
  const myKey = process.argv[3] || 'OK';
  
  console.log('=== 密钥派生算法 (XOR + Base64) ===\n');
  
  // 生成 A 的密钥
  const aKey = generateKey(password, myKey);
  console.log('密码:', password);
  console.log('我的密钥:', myKey);
  console.log('A的密钥(Base64):', aKey);
  
  // 验证还原
  const verify = derivePassword(aKey, myKey);
  console.log('验证还原:', verify);
  console.log('还原成功:', verify === password ? '✅' : '❌');
}

module.exports = { generateKey, derivePassword };
