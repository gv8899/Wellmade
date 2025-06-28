import * as crypto from 'crypto';

export class NewebpayUtils {
  /**
   * AES-256-CBC 加密
   */
  static encrypt(data: string, key: string, iv: string): string {
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    const encrypted = cipher.update(data, 'utf8', 'hex') + cipher.final('hex');
    return encrypted;
  }

  /**
   * AES-256-CBC 解密
   */
  static decrypt(encryptedData: string, key: string, iv: string): string {
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    const decrypted =
      decipher.update(encryptedData, 'hex', 'utf8') + decipher.final('utf8');
    return decrypted;
  }

  /**
   * SHA256 雜湊
   */
  static hash(data: string, key: string, iv: string): string {
    const hashString = `HashKey=${key}&${data}&HashIV=${iv}`;
    return crypto
      .createHash('sha256')
      .update(hashString)
      .digest('hex')
      .toUpperCase();
  }

  /**
   * 建立查詢字串
   */
  static buildQueryString(data: Record<string, any>): string {
    return Object.keys(data)
      .sort()
      .map((key) => `${key}=${encodeURIComponent(data[key])}`)
      .join('&');
  }

  /**
   * 驗證回調資料
   */
  static verifyCallback(
    encryptedTradeInfo: string,
    tradeSha: string,
    key: string,
    iv: string,
  ): boolean {
    const expectedSha = this.hash(encryptedTradeInfo, key, iv);
    return expectedSha === tradeSha.toUpperCase();
  }

  /**
   * 解析回調資料
   */
  static parseCallbackData(
    encryptedTradeInfo: string,
    key: string,
    iv: string,
  ): any {
    const decryptedData = this.decrypt(encryptedTradeInfo, key, iv);
    return JSON.parse(decryptedData);
  }

  /**
   * 產生訂單編號
   * 格式：ORD + 時間戳 + 隨機數
   */
  static generateOrderNo(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return `ORD${timestamp}${random}`;
  }

  /**
   * 取得當前時間戳（秒）
   */
  static getTimestamp(): number {
    return Math.floor(Date.now() / 1000);
  }
}
