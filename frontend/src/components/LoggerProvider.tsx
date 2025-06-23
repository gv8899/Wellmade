"use client";

import { useEffect } from 'react';
import { logger } from '@/utils/logger';

export default function LoggerProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // 確保 logger 在客戶端初始化
    console.log('🔧 LoggerProvider: 初始化全域錯誤監聽');
    
    // 手動觸發初始化（logger 會在構造函數中設置監聽器）
    // 但為了確保，我們也可以重新設置
    
    return () => {
      console.log('🔧 LoggerProvider: 清理');
    };
  }, []);

  return <>{children}</>;
}