import * as crypto from 'crypto';

/**
 * 藍新金流物流 API 加密工具類別
 * 實作 AES-256-CBC 加密與 SHA256 簽章功能
 */
export class NewebpayCryptoUtil {
  
  /**
   * AES-256-CBC 加密
   * @param data - 要加密的資料
   * @param key - 加密金鑰
   * @param iv - 初始化向量
   * @returns 加密後的十六進位字串
   */
  static encrypt(data: string, key: string, iv: string): string {
    try {
      const cipher = crypto.createCipher('aes-256-cbc', key);
      cipher.setAutoPadding(true);
      
      // 設定初始化向量
      const keyBuffer = Buffer.from(key, 'utf8');
      const ivBuffer = Buffer.from(iv, 'utf8');
      
      // 使用正確的 AES-256-CBC 加密
      const cipherCorrect = crypto.createCipheriv('aes-256-cbc', keyBuffer, ivBuffer);
      let encrypted = cipherCorrect.update(data, 'utf8', 'hex');
      encrypted += cipherCorrect.final('hex');
      
      return encrypted.toUpperCase();
    } catch (error) {
      throw new Error(`加密失敗: ${error.message}`);
    }
  }

  /**
   * AES-256-CBC 解密
   * @param encryptedData - 加密的十六進位字串
   * @param key - 解密金鑰
   * @param iv - 初始化向量
   * @returns 解密後的原始資料
   */
  static decrypt(encryptedData: string, key: string, iv: string): string {
    try {
      const keyBuffer = Buffer.from(key, 'utf8');
      const ivBuffer = Buffer.from(iv, 'utf8');
      
      const decipher = crypto.createDecipheriv('aes-256-cbc', keyBuffer, ivBuffer);
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      throw new Error(`解密失敗: ${error.message}`);
    }
  }

  /**
   * 生成 SHA256 簽章
   * @param data - 要簽章的資料
   * @param key - 簽章金鑰
   * @param iv - 初始化向量
   * @returns SHA256 簽章的大寫十六進位字串
   */
  static generateHash(data: string, key: string, iv: string): string {
    try {
      // 按照藍新金流規範：HashKey={key}&{data}&HashIV={iv}
      const hashString = `HashKey=${key}&${data}&HashIV=${iv}`;
      const hash = crypto.createHash('sha256').update(hashString).digest('hex');
      return hash.toUpperCase();
    } catch (error) {
      throw new Error(`簽章生成失敗: ${error.message}`);
    }
  }

  /**
   * 驗證 SHA256 簽章
   * @param data - 原始資料
   * @param receivedHash - 接收到的簽章
   * @param key - 簽章金鑰
   * @param iv - 初始化向量
   * @returns 簽章是否正確
   */
  static verifyHash(data: string, receivedHash: string, key: string, iv: string): boolean {
    try {
      const expectedHash = this.generateHash(data, key, iv);
      return expectedHash === receivedHash.toUpperCase();
    } catch (error) {
      throw new Error(`簽章驗證失敗: ${error.message}`);
    }
  }

  /**
   * 生成時間戳記
   * @returns Unix 時間戳記
   */
  static generateTimestamp(): number {
    return Math.floor(Date.now() / 1000);
  }

  /**
   * 生成隨機字串
   * @param length - 字串長度
   * @returns 隨機字串
   */
  static generateRandomString(length: number = 16): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * 準備 API 請求的加密資料
   * @param params - API 參數物件
   * @param key - 加密金鑰
   * @param iv - 初始化向量
   * @returns 包含加密資料和簽章的物件
   */
  static prepareApiData(params: any, key: string, iv: string): { 
    encryptedData: string; 
    hashData: string; 
    originalData: string 
  } {
    try {
      // 將參數轉為 JSON 字串
      const jsonData = JSON.stringify(params);
      
      // 加密資料
      const encryptedData = this.encrypt(jsonData, key, iv);
      
      // 生成簽章
      const hashData = this.generateHash(encryptedData, key, iv);
      
      return {
        encryptedData,
        hashData,
        originalData: jsonData
      };
    } catch (error) {
      throw new Error(`準備 API 資料失敗: ${error.message}`);
    }
  }

  /**
   * 解析 API 回應的加密資料
   * @param encryptedData - 加密的回應資料
   * @param hashData - 回應簽章
   * @param key - 解密金鑰
   * @param iv - 初始化向量
   * @returns 解密後的資料物件
   */
  static parseApiResponse(
    encryptedData: string, 
    hashData: string, 
    key: string, 
    iv: string
  ): any {
    try {
      // 驗證簽章
      if (!this.verifyHash(encryptedData, hashData, key, iv)) {
        throw new Error('回應資料簽章驗證失敗');
      }
      
      // 解密資料
      const decryptedData = this.decrypt(encryptedData, key, iv);
      
      // 解析 JSON
      return JSON.parse(decryptedData);
    } catch (error) {
      throw new Error(`解析 API 回應失敗: ${error.message}`);
    }
  }
}