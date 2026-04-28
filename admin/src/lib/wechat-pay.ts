import crypto from "node:crypto";

export interface WeChatPayConfig {
  appId: string;
  mchId: string;
  privateKey: string; // PEM format
  serialNo: string;
  apiV3Key: string;
}

export class WeChatPay {
  private config: WeChatPayConfig;

  constructor(config: WeChatPayConfig) {
    this.config = config;
  }

  /**
   * Generate WeChat Pay V3 Authorization header
   */
  generateAuthorization(
    method: string,
    url: string,
    body: string,
    nonce: string,
    timestamp: number
  ): string {
    const message = `${method}\n${url}\n${timestamp}\n${nonce}\n${body}\n`;
    const signature = crypto
      .createSign("RSA-SHA256")
      .update(message)
      .sign(this.config.privateKey, "base64");

    return `WECHATPAY2-SHA256-RSA2048 mchid="${this.config.mchId}",nonce_str="${nonce}",signature="${signature}",timestamp="${timestamp}",serial_no="${this.config.serialNo}"`;
  }

  /**
   * Verify signature from WeChat Pay notification/response
   */
  verifySignature(
    params: {
      timestamp: string;
      nonce: string;
      body: string;
      signature: string;
      serial: string;
    },
    wechatPayPublicKey: string // The public key from WeChat Pay certificate
  ): boolean {
    const message = `${params.timestamp}\n${params.nonce}\n${params.body}\n`;
    const verifier = crypto.createVerify("RSA-SHA256");
    verifier.update(message);
    return verifier.verify(wechatPayPublicKey, params.signature, "base64");
  }

  /**
   * Decrypt WeChat Pay V3 notification resource
   */
  decryptResource<T>(params: {
    ciphertext: string;
    nonce: string;
    associatedData: string;
  }): T {
    const { ciphertext, nonce, associatedData } = params;
    const ciphertextBuffer = Buffer.from(ciphertext, "base64");
    const authTag = ciphertextBuffer.subarray(ciphertextBuffer.length - 16);
    const data = ciphertextBuffer.subarray(0, ciphertextBuffer.length - 16);

    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      this.config.apiV3Key,
      nonce
    );
    decipher.setAuthTag(authTag);
    decipher.setAAD(Buffer.from(associatedData));

    const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
    return JSON.parse(decrypted.toString("utf8")) as T;
  }

  /**
   * Create a JSAPI payment signature
   */
  signJSAPI(params: {
    appId: string;
    timeStamp: string;
    nonceStr: string;
    package: string;
  }): string {
    const message = `${params.appId}\n${params.timeStamp}\n${params.nonceStr}\n${params.package}\n`;
    return crypto
      .createSign("RSA-SHA256")
      .update(message)
      .sign(this.config.privateKey, "base64");
  }
}

// Singleton helper or factory
export const getWeChatPayInstance = () => {
  const {
    WECHAT_APPID,
    WECHAT_MCH_ID,
    WECHAT_PRIVATE_KEY,
    WECHAT_SERIAL_NO,
    WECHAT_API_V3_KEY,
  } = process.env;

  if (
    !WECHAT_APPID ||
    !WECHAT_MCH_ID ||
    !WECHAT_PRIVATE_KEY ||
    !WECHAT_SERIAL_NO ||
    !WECHAT_API_V3_KEY
  ) {
    throw new Error("Missing WeChat Pay configuration in environment variables");
  }

  return new WeChatPay({
    appId: WECHAT_APPID,
    mchId: WECHAT_MCH_ID,
    privateKey: WECHAT_PRIVATE_KEY.replace(/\\n/g, "\n"),
    serialNo: WECHAT_SERIAL_NO,
    apiV3Key: WECHAT_API_V3_KEY,
  });
};
