"use client";
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
  onClose?: () => void;
}

// 用來管理所有 Toast 的 Context
export const toastEvents = {
  listeners: new Set<(props: ToastProps) => void>(),
  
  showToast(props: ToastProps) {
    this.listeners.forEach(listener => listener(props));
  },
  
  subscribe(listener: (props: ToastProps) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
};

// 導出一個方便使用的方法來顯示 Toast
export const showToast = (props: ToastProps) => {
  toastEvents.showToast(props);
};

// Toast 組件
export default function Toast({ message, type, duration = 3000, onClose }: ToastProps) {
  const [visible, setVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) {
        onClose();
      }
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, onClose]);
  
  // 根據類型定義不同的背景顏色
  let bgColor;
  switch (type) {
    case 'success':
      bgColor = 'bg-green-500';
      break;
    case 'error':
      bgColor = 'bg-red-500';
      break;
    case 'info':
    default:
      bgColor = 'bg-blue-500';
      break;
  }
  
  return visible ? (
    <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 ${bgColor} text-white px-4 py-2 rounded-md shadow-lg z-50 min-w-[200px] text-center`}>
      {message}
    </div>
  ) : null;
}

// Toast 容器，需要放在應用的根組件中
export function ToastContainer() {
  const [toasts, setToasts] = useState<(ToastProps & { id: number })[]>([]);
  const [counter, setCounter] = useState(0);
  
  useEffect(() => {
    const unsubscribe = toastEvents.subscribe((props) => {
      const id = counter;
      setCounter(prev => prev + 1);
      
      setToasts(prev => [...prev, { ...props, id }]);
      
      setTimeout(() => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
      }, props.duration || 3000);
    });
    
    return () => {
      unsubscribe();
    };
  }, [counter]);
  
  if (typeof document === 'undefined') {
    return null;
  }
  
  return createPortal(
    <div className="fixed bottom-4 left-0 right-0 flex flex-col items-center gap-2 z-50">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
        />
      ))}
    </div>,
    document.body
  );
}
