interface LogEntry {
  timestamp: string
  level: string
  message: string
  context?: any
  user_id?: number
  session_id: string
  url?: string
  user_agent?: string
}

class FileLogger {
  private sessionId: string
  private userId?: number
  private logs: LogEntry[] = []
  private maxLogs = 1000 // 最多保存1000條日誌

  constructor() {
    this.sessionId = this.generateSessionId()
    
    // 監聽全域錯誤
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.error('未捕獲的錯誤', {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          error: event.error?.stack
        })
      })

      window.addEventListener('unhandledrejection', (event) => {
        this.error('未處理的 Promise 拒絕', {
          reason: event.reason?.toString()
        })
      })

      // 定期保存到 localStorage
      setInterval(() => {
        this.saveToStorage()
      }, 5000) // 每5秒保存一次

      // 頁面卸載時保存
      window.addEventListener('beforeunload', () => {
        this.saveToStorage()
      })

      // 載入已保存的日誌
      this.loadFromStorage()
    }
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  public setUserId(userId: number) {
    this.userId = userId
  }

  private saveToStorage() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('frontend_logs', JSON.stringify(this.logs))
      } catch (error) {
        console.error('保存日誌到 localStorage 失敗:', error)
      }
    }
  }

  private loadFromStorage() {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('frontend_logs')
        if (saved) {
          this.logs = JSON.parse(saved)
        }
      } catch (error) {
        console.error('從 localStorage 載入日誌失敗:', error)
      }
    }
  }

  private addLog(level: string, message: string, context?: any) {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      user_id: this.userId,
      session_id: this.sessionId,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    }

    this.logs.push(logEntry)

    // 保持日誌數量在限制內
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs)
    }

    console[level as keyof Console]?.(`[${level.toUpperCase()}] ${message}`, context)
  }

  public error(message: string, context?: any) {
    this.addLog('error', message, context)
  }

  public warn(message: string, context?: any) {
    this.addLog('warn', message, context)
  }

  public info(message: string, context?: any) {
    this.addLog('info', message, context)
  }

  public debug(message: string, context?: any) {
    if (process.env.NODE_ENV === 'development') {
      this.addLog('debug', message, context)
    }
  }

  // 導出日誌到檔案
  public exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }

  // 清除日誌
  public clearLogs() {
    this.logs = []
    this.saveToStorage()
  }

  // 獲取日誌（用於檢查）
  public getLogs() {
    return this.logs
  }
}

export const fileLogger = new FileLogger()