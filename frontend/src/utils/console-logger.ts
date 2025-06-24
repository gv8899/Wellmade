/**
 * 前端 Console Log 增強系統
 * 為調試和問題排查提供結構化的日誌輸出
 */

interface LogEntry {
  timestamp: string;
  level: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG' | 'TRACE';
  category: string;
  message: string;
  data?: any;
  source?: string;
  stack?: string;
}

class ConsoleLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // 最多保存1000條日誌
  private isClient = typeof window !== 'undefined';
  
  // 日誌等級顏色配置
  private styles = {
    ERROR: 'color: #ff4444; font-weight: bold',
    WARN: 'color: #ffaa00; font-weight: bold',
    INFO: 'color: #00aaff; font-weight: bold',
    DEBUG: 'color: #888888',
    TRACE: 'color: #bbbbbb'
  };

  // 分類圖標
  private icons = {
    cart: '🛒',
    api: '🌐',
    auth: '🔐',
    product: '📦',
    variant: '🎯',
    error: '❌',
    success: '✅',
    warning: '⚠️',
    info: 'ℹ️',
    debug: '🐛',
    performance: '⏱️',
    user: '👤'
  };

  constructor() {
    if (this.isClient) {
      this.setupConsoleEnhancement();
      this.info('console-logger', 'Console Logger 初始化完成', {
        maxLogs: this.maxLogs,
        environment: process.env.NODE_ENV
      });
    }
  }

  /**
   * 增強原生 console 方法
   */
  private setupConsoleEnhancement(): void {
    // 保存原始方法
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalInfo = console.info;
    const originalLog = console.log;

    // 重寫 console.error
    console.error = (...args: any[]) => {
      originalError.apply(console, args);
      this.captureConsoleCall('ERROR', args);
    };

    // 重寫 console.warn
    console.warn = (...args: any[]) => {
      originalWarn.apply(console, args);
      this.captureConsoleCall('WARN', args);
    };

    // 重寫 console.info
    console.info = (...args: any[]) => {
      originalInfo.apply(console, args);
      this.captureConsoleCall('INFO', args);
    };

    // 重寫 console.log
    console.log = (...args: any[]) => {
      originalLog.apply(console, args);
      this.captureConsoleCall('DEBUG', args);
    };
  }

  /**
   * 捕獲原生 console 調用
   */
  private captureConsoleCall(level: LogEntry['level'], args: any[]): void {
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ');

    this.addLog({
      timestamp: new Date().toISOString(),
      level,
      category: 'console',
      message,
      source: this.getCallStack()
    });
  }

  /**
   * 獲取調用堆棧
   */
  private getCallStack(): string {
    try {
      const stack = new Error().stack;
      if (stack) {
        const lines = stack.split('\n').slice(3, 6); // 取相關的幾行
        return lines.join('\n');
      }
    } catch (e) {
      // 忽略獲取堆棧失敗
    }
    return '';
  }

  /**
   * 添加日誌條目
   */
  private addLog(entry: LogEntry): void {
    this.logs.push(entry);
    
    // 限制日誌數量
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs + 100); // 保留最新的記錄
    }
  }

  /**
   * 創建格式化的日誌輸出
   */
  private formatLog(level: LogEntry['level'], category: string, message: string, data?: any): string {
    const timestamp = new Date().toLocaleTimeString();
    const icon = this.icons[category as keyof typeof this.icons] || this.icons.info;
    
    return `${icon} [${timestamp}] [${level}] [${category.toUpperCase()}] ${message}`;
  }

  /**
   * 錯誤日誌
   */
  error(category: string, message: string, data?: any): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      category,
      message,
      data,
      source: this.getCallStack(),
      stack: data?.error?.stack || (new Error()).stack
    };

    this.addLog(entry);

    if (this.isClient) {
      const formattedMessage = this.formatLog('ERROR', category, message);
      console.error(`%c${formattedMessage}`, this.styles.ERROR, data);
    }
  }

  /**
   * 警告日誌
   */
  warn(category: string, message: string, data?: any): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'WARN',
      category,
      message,
      data,
      source: this.getCallStack()
    };

    this.addLog(entry);

    if (this.isClient) {
      const formattedMessage = this.formatLog('WARN', category, message);
      console.warn(`%c${formattedMessage}`, this.styles.WARN, data);
    }
  }

  /**
   * 信息日誌
   */
  info(category: string, message: string, data?: any): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      category,
      message,
      data,
      source: this.getCallStack()
    };

    this.addLog(entry);

    if (this.isClient) {
      const formattedMessage = this.formatLog('INFO', category, message);
      console.info(`%c${formattedMessage}`, this.styles.INFO, data);
    }
  }

  /**
   * 調試日誌
   */
  debug(category: string, message: string, data?: any): void {
    if (process.env.NODE_ENV !== 'development') return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'DEBUG',
      category,
      message,
      data,
      source: this.getCallStack()
    };

    this.addLog(entry);

    if (this.isClient) {
      const formattedMessage = this.formatLog('DEBUG', category, message);
      console.log(`%c${formattedMessage}`, this.styles.DEBUG, data);
    }
  }

  /**
   * 追蹤日誌（僅開發環境）
   */
  trace(category: string, message: string, data?: any): void {
    if (process.env.NODE_ENV !== 'development') return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'TRACE',
      category,
      message,
      data,
      source: this.getCallStack()
    };

    this.addLog(entry);

    if (this.isClient) {
      const formattedMessage = this.formatLog('TRACE', category, message);
      console.log(`%c${formattedMessage}`, this.styles.TRACE, data);
    }
  }

  /**
   * 分組日誌開始
   */
  group(category: string, title: string): void {
    if (this.isClient) {
      const icon = this.icons[category as keyof typeof this.icons] || this.icons.info;
      console.group(`${icon} ${title}`);
    }
  }

  /**
   * 分組日誌結束
   */
  groupEnd(): void {
    if (this.isClient) {
      console.groupEnd();
    }
  }

  /**
   * 記錄 API 調用
   */
  apiCall(method: string, url: string, status?: number, duration?: number, data?: any): void {
    const message = `${method.toUpperCase()} ${url}`;
    const logData = {
      method,
      url,
      status,
      duration: duration ? `${duration}ms` : undefined,
      ...data
    };

    if (status && status >= 400) {
      this.error('api', `${message} - ${status}`, logData);
    } else if (status && status >= 300) {
      this.warn('api', `${message} - ${status}`, logData);
    } else {
      this.debug('api', `${message} - ${status || 'pending'}`, logData);
    }
  }

  /**
   * 記錄購物車操作
   */
  cartAction(action: string, details?: any): void {
    this.info('cart', `購物車操作: ${action}`, details);
  }

  /**
   * 記錄認證事件
   */
  authEvent(event: string, details?: any): void {
    this.info('auth', `認證事件: ${event}`, details);
  }

  /**
   * 記錄產品相關操作
   */
  productAction(action: string, productId?: string, details?: any): void {
    this.debug('product', `產品操作: ${action}`, { productId, ...details });
  }

  /**
   * 記錄變體相關操作
   */
  variantAction(action: string, variantId?: string, details?: any): void {
    this.debug('variant', `變體操作: ${action}`, { variantId, ...details });
  }

  /**
   * 記錄性能指標
   */
  performance(operation: string, duration: number, threshold = 1000): void {
    const level = duration > threshold ? 'WARN' : 'DEBUG';
    const message = `${operation} 耗時 ${duration}ms`;
    
    if (level === 'WARN') {
      this.warn('performance', message, { duration, threshold });
    } else {
      this.debug('performance', message, { duration });
    }
  }

  /**
   * 獲取所有日誌
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * 根據等級過濾日誌
   */
  getLogsByLevel(level: LogEntry['level']): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  /**
   * 根據分類過濾日誌
   */
  getLogsByCategory(category: string): LogEntry[] {
    return this.logs.filter(log => log.category === category);
  }

  /**
   * 清空日誌
   */
  clear(): void {
    this.logs = [];
    if (this.isClient) {
      console.clear();
      this.info('console-logger', '日誌已清空');
    }
  }

  /**
   * 導出日誌為 JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * 顯示日誌統計
   */
  showStats(): void {
    if (!this.isClient) return;

    const stats = this.logs.reduce((acc, log) => {
      acc[log.level] = (acc[log.level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    this.group('debug', '📊 日誌統計');
    console.table(stats);
    console.log(`總計: ${this.logs.length} 條日誌`);
    this.groupEnd();
  }

  /**
   * 在 window 上暴露調試方法
   */
  exposeGlobalDebugMethods(): void {
    if (!this.isClient) return;

    (window as any).consoleLogger = {
      getLogs: () => this.getLogs(),
      getErrors: () => this.getLogsByLevel('ERROR'),
      getWarnings: () => this.getLogsByLevel('WARN'),
      getByCategory: (category: string) => this.getLogsByCategory(category),
      clear: () => this.clear(),
      stats: () => this.showStats(),
      export: () => this.exportLogs(),
      logger: this
    };

    this.info('console-logger', '全域調試方法已暴露到 window.consoleLogger');
  }
}

// 創建全域實例
export const consoleLogger = new ConsoleLogger();

// 在開發環境中暴露全域方法
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  consoleLogger.exposeGlobalDebugMethods();
}

export default consoleLogger;