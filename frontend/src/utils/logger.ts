enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

interface LogContext {
  [key: string]: any
}

interface LogData {
  level: string
  message: string
  context?: LogContext
  error_stack?: string
  user_id?: number
  session_id?: string
  url?: string
  user_agent?: string
}

class Logger {
  private sessionId: string
  private userId?: number
  private apiUrl: string
  private isSending: boolean = false
  
  // 開發環境常見的無害錯誤模式
  private developmentNoisePatterns = [
    /hydration/i,
    /webpack/i,
    /hot.reload/i,
    /module.hot/i,
    /turbopack/i,
    /next.js/i,
    /_next\/static/i,
    /non-passive event listener/i,
    /propTypes/i,
    /react-hot-toast/i,
    /chrome-extension/i,
    /Script error/i
  ]

  constructor() {
    this.sessionId = this.generateSessionId()
    this.apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Logger 初始化:')
      console.log('  📍 Session ID:', this.sessionId)
      console.log('  🌐 API URL:', this.apiUrl)
      console.log('  🔐 環境變數 NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL)
    }
    
    // 監聽全域錯誤
    if (typeof window !== 'undefined') {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔧 設置全域錯誤監聽器')
      }
      
      // 捕獲 JavaScript 運行時錯誤和資源加載錯誤
      window.addEventListener('error', (event) => {
        if (event.target !== window) {
          // 資源加載錯誤 - 只在生產環境記錄，或開發環境的重要資源
          const source = event.target?.src || event.target?.href || ''
          const isImportantResource = !source.includes('_next/static') && !source.includes('chrome-extension')
          
          if (process.env.NODE_ENV === 'production' || isImportantResource) {
            if (process.env.NODE_ENV === 'development') {
              console.log('🚨 捕獲到資源加載錯誤:', event)
            }
            this.error('資源加載錯誤', {
              element: event.target?.tagName,
              source: source,
              type: 'resource_error',
              timestamp: new Date().toISOString()
            })
          }
        } else {
          // JavaScript 運行時錯誤
          if (process.env.NODE_ENV === 'development') {
            console.log('🚨 捕獲到 JavaScript 錯誤:', event)
          }
          this.error('未捕獲的 JavaScript 錯誤', {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            stack: event.error?.stack,
            timestamp: new Date().toISOString()
          })
        }
      }, true) // 使用捕獲階段

      // 捕獲未處理的 Promise 拒絕
      window.addEventListener('unhandledrejection', (event) => {
        if (process.env.NODE_ENV === 'development') {
          console.log('🚨 捕獲到未處理的 Promise 拒絕:', event)
        }
        this.error('未處理的 Promise 拒絕', {
          reason: event.reason?.toString(),
          stack: event.reason?.stack,
          timestamp: new Date().toISOString()
        })
      })

      // 注意：暫時移除 console.error 重寫以避免無限循環
    }
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  public setUserId(userId: number) {
    this.userId = userId
  }

  // 檢查是否為開發環境噪音
  private isDevelopmentNoise(message: string, context?: any): boolean {
    if (process.env.NODE_ENV !== 'development') {
      return false
    }

    // 如果是手動測試錯誤，不要過濾
    if (message.includes('測試') || context?.test === true || context?.testType) {
      return false
    }

    // 檢查錯誤訊息是否匹配噪音模式
    const fullText = `${message} ${JSON.stringify(context || {})}`.toLowerCase()
    
    return this.developmentNoisePatterns.some(pattern => 
      pattern.test(fullText)
    )
  }

  // 檢查是否為重要錯誤
  private isImportantError(message: string, context?: any): boolean {
    // 在生產環境中，所有錯誤都被認為是重要的
    if (process.env.NODE_ENV === 'production') {
      return true
    }

    // 在開發環境中，過濾掉噪音
    return !this.isDevelopmentNoise(message, context)
  }

  private async sendLog(logData: LogData) {
    // 防止在日誌發送過程中產生無限循環
    if (this.isSending) {
      return
    }
    
    this.isSending = true
    
    try {
      // 建立基本 payload
      const payload: any = {
        level: logData.level,
        message: logData.message,
        session_id: this.sessionId,
      }

      // 只有當值存在且有效時才添加到 payload
      if (logData.context !== null && logData.context !== undefined) {
        payload.context = logData.context
      }

      if (logData.error_stack && typeof logData.error_stack === 'string') {
        payload.error_stack = logData.error_stack
      }

      if (this.userId && typeof this.userId === 'number') {
        payload.user_id = this.userId
      }

      if (typeof window !== 'undefined' && window.location.href) {
        payload.url = window.location.href
      }

      if (typeof navigator !== 'undefined' && navigator.userAgent) {
        payload.user_agent = navigator.userAgent
      }

      // 在生產環境中減少日誌輸出
      if (process.env.NODE_ENV === 'development') {
        console.log('📤 發送日誌到後端:', payload)
      }

      const response = await fetch(`${this.apiUrl}/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (process.env.NODE_ENV === 'development') {
        console.log('📥 後端響應狀態:', response.status, response.statusText)
      }

      if (!response.ok && process.env.NODE_ENV === 'development') {
        const errorText = await response.text()
        console.warn('❌ 日誌發送失敗:', response.status, response.statusText, errorText)
      } else if (response.ok && process.env.NODE_ENV === 'development') {
        const result = await response.json()
        console.log('✅ 日誌發送成功:', result.id)
      }
    } catch (error) {
      // 靜默處理日誌發送錯誤，避免產生更多錯誤
      if (process.env.NODE_ENV === 'development') {
        console.warn('💥 日誌發送錯誤:', error?.message || error)
      }
    } finally {
      this.isSending = false
    }
  }

  public error(message: string, context?: LogContext) {
    const logData: LogData = {
      level: LogLevel.ERROR,
      message,
      context,
      error_stack: context?.error || new Error().stack
    }

    console.error(`[ERROR] ${message}`, context)
    
    // 只有重要錯誤才發送到後端
    if (this.isImportantError(message, context)) {
      this.sendLog(logData)
    } else if (process.env.NODE_ENV === 'development') {
      console.log('🔇 已過濾開發環境噪音:', message)
    }
  }

  public warn(message: string, context?: LogContext) {
    const logData: LogData = {
      level: LogLevel.WARN,
      message,
      context
    }

    console.warn(`[WARN] ${message}`, context)
    // WARN 級別不發送到後端，只在本地顯示
  }

  public info(message: string, context?: LogContext) {
    const logData: LogData = {
      level: LogLevel.INFO,
      message,
      context
    }

    console.info(`[INFO] ${message}`, context)
    // INFO 級別不發送到後端，只在本地顯示
  }

  public debug(message: string, context?: LogContext) {
    const logData: LogData = {
      level: LogLevel.DEBUG,
      message,
      context
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${message}`, context)
      // DEBUG 級別不發送到後端，只在本地顯示
    }
  }

  // 記錄用戶操作 - 只在開發環境記錄，不發送到後端
  public trackUserAction(action: string, data?: any) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`👤 用戶操作: ${action}`, data)
    }
    // 不發送到後端，用戶操作不是錯誤
  }

  // 記錄 API 調用 - 只記錄嚴重錯誤 (5xx)
  public trackApiCall(method: string, url: string, duration: number, status?: number) {
    const message = `API ${method} ${url} - ${duration}ms - ${status || 'unknown'}`
    
    if (status && status >= 500) {
      // 只記錄服務器錯誤 (5xx)
      this.error(message, { method, url, duration, status, type: 'api_server_error' })
    } else if (process.env.NODE_ENV === 'development') {
      // 開發環境中顯示所有 API 調用
      console.log(`🌐 ${message}`, { method, url, duration, status })
    }
  }

  // 記錄效能問題 - 只記錄嚴重的效能問題
  public trackPerformance(operation: string, duration: number, threshold = 3000) {
    if (duration > threshold) {
      // 只有非常慢的操作才記錄為錯誤 (超過3秒)
      this.error(`嚴重效能問題: ${operation}`, { 
        duration: `${duration}ms`, 
        threshold: `${threshold}ms`,
        type: 'performance_issue'
      })
    } else if (process.env.NODE_ENV === 'development') {
      // 開發環境中顯示所有效能資訊
      console.log(`⏱️ 操作完成: ${operation} - ${duration}ms`)
    }
  }
}

export const logger = new Logger()
export { LogLevel }