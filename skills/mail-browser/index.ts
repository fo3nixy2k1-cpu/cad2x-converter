/**
 * Mail Browser Skill - 密钥派生版
 * 通过浏览器自动化操作 126 邮箱
 * 安全机制：密码不存储，用密钥派生
 */

// A的密钥 (Base64) - 从 SKILL.md 获取
const A_KEY_BASE64 = "Gy48PyAlIzJhei4=";

/**
 * 从密钥派生密码
 * @param myKey 用户提供的密钥（如 "OK"）
 * @returns 解密后的密码
 */
function derivePassword(myKey: string): string {
  // 1. Base64 解码
  const aKeyBytes = Buffer.from(A_KEY_BASE64, "base64");

  // 2. 扩展密钥到与 A 密钥相同长度
  const extendedKey = myKey
    .repeat(Math.ceil(aKeyBytes.length / myKey.length))
    .slice(0, aKeyBytes.length);

  // 3. XOR 还原密码
  const password = aKeyBytes
    .map((b, i) => b ^ extendedKey.charCodeAt(i))
    .toString();

  return password;
}

/**
 * 主函数 - 被 OpenClaw 调用
 * 
 * 使用方式：
 * - 首次需要登录时，会询问用户密钥
 * - 用户告知密钥后，用此函数解密得到密码
 * - 然后自动填写密码登录
 */
export async function mail_browser(params: {
  action: "login" | "list" | "send";
  myKey?: string; // 用户提供的密钥
  to?: string;
  subject?: string;
  body?: string;
}): Promise<any> {
  const { action, myKey, to, subject, body } = params;

  try {
    switch (action) {
      case "login":
        if (!myKey) {
          return {
            success: false,
            needKey: true,
            message: "请提供密钥以解密密码",
            hint: "告诉我你的密钥（如 'OK'），我将解密并登录",
          };
        }
        const password = derivePassword(myKey);
        return {
          success: true,
          action: "login",
          username: "cnxgx@126.com",
          password: password, // 解密后的密码（临时使用，不存储）
          url: "https://mail.126.com/",
        };

      case "list":
        return {
          success: true,
          action: "list",
          message: "已登录126邮箱，请继续操作获取邮件列表",
        };

      case "send":
        return {
          success: true,
          action: "send",
          to,
          subject,
          body,
          message: `准备发送到 ${to}`,
        };

      default:
        return { success: false, error: `Unknown action: ${action}` };
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Mail browser operation failed",
    };
  }
}

export default { mail_browser };
