"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/app/components/UserContext";
import { signIn } from "next-auth/react";
import GoogleLoginButton from "../components/GoogleLoginButton";
import toast from "react-hot-toast";

// 🎯 導入設計系統
import { Text, Button, FormField, Card } from "@/design-system";
import { colors } from "@/design-system";
import type { ColorMode } from "@/design-system";

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [colorMode, setColorMode] = useState<ColorMode>('light');
  const router = useRouter();
  const { login } = useUser();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      if (mode === 'login') {
        // 呼叫登入 API
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: form.email,
            password: form.password,
          }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          setError(data.message || '登入失敗，請檢查帳號密碼');
          return;
        }
        
        // 登入成功
        login({ 
          name: data.user.email, // 可以從 API 回傳的用戶資料取得名稱
          email: data.user.email,
          token: data.access_token
        });
        toast.success('登入成功');
        router.push('/');
      } else {
        // 呼叫註冊 API
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: form.email,
            password: form.password,
          }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          setError(data.message || '註冊失敗，請檢查輸入資訊');
          return;
        }
        
        // 註冊成功後自動登入
        login({
          name: data.user.email, 
          email: data.user.email,
          token: data.access_token
        });
        toast.success('註冊成功');
        router.push('/');
      }
    } catch (err) {
      console.error('API 請求錯誤:', err);
      setError('連線伺服器失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      // 使用 NextAuth 的 signIn 方法進行 Google 登入
      await signIn('google', { callbackUrl: '/' });
      // Note: For Google login, the toast will not show here because the page redirects
      // The toast would need to be shown on the callback page
    } catch (err) {
      console.error('Google 登入失敗:', err);
      setError('Google 登入失敗，請稍後再試');
      setLoading(false);
    }
  };

  // 🎯 使用設計系統的主容器樣式
  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colorMode === 'light' 
      ? colors.background.systemBackground.light 
      : colors.background.systemBackground.dark,
    padding: '3rem 1rem',
  };

  // 🎯 標籤切換按鈕樣式
  const getTabButtonStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '12px 24px',
    border: 'none',
    background: 'transparent',
    borderBottom: `2px solid ${isActive 
      ? (colorMode === 'light' ? colors.primary.light : colors.primary.dark) 
      : 'transparent'}`,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    outline: 'none',
  });

  return (
    <div style={containerStyle}>
      <div style={{ maxWidth: '400px', width: '100%' }}>
        <Card
          variant="elevated"
          padding="large"
          colorMode={colorMode}
          style={{ minHeight: '520px' }}
        >
          {/* 🎯 使用設計系統的 Text 組件 */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <Text variant="title1" colorMode={colorMode} style={{ marginBottom: '0.5rem' }}>
              歡迎回來
            </Text>
            <Text variant="body" color={colors.neutral.secondaryLabel} colorMode={colorMode}>
              {mode === 'login' ? '請登入您的帳戶' : '建立您的新帳戶'}
            </Text>
          </div>

          {/* 🎯 標籤切換 - 保持原有樣式但使用 Text 組件 */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
            <button
              type="button"
              style={getTabButtonStyle(mode === 'login')}
              onClick={() => setMode('login')}
            >
              <Text 
                variant="headline" 
                color={mode === 'login' ? colors.primary : colors.neutral.secondaryLabel}
                colorMode={colorMode}
              >
                登入
              </Text>
            </button>
            <button
              type="button"
              style={getTabButtonStyle(mode === 'register')}
              onClick={() => setMode('register')}
            >
              <Text 
                variant="headline" 
                color={mode === 'register' ? colors.primary : colors.neutral.secondaryLabel}
                colorMode={colorMode}
              >
                註冊
              </Text>
            </button>
          </div>
          
          {/* 🎯 使用設計系統的表單 */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* 🎯 使用 FormField 分子組件 */}
              <FormField
                label="電子郵件"
                name="email"
                type="email"
                placeholder="請輸入信箱"
                value={form.email}
                onChange={handleChange}
                required
                helpText="我們會使用此郵件地址與您聯繫"
                colorMode={colorMode}
              />

              <FormField
                label="密碼"
                name="password"
                type="password"
                placeholder="請輸入密碼"
                value={form.password}
                onChange={handleChange}
                required
                helpText={mode === 'register' ? "密碼長度至少需要 6 個字元" : undefined}
                colorMode={colorMode}
              />

              {/* 🎯 忘記密碼連結 - 使用 Text 組件 */}
              {mode === 'login' && (
                <div style={{ textAlign: 'right' }}>
                  <a 
                    href="/forgot-password" 
                    style={{ textDecoration: 'none' }}
                  >
                    <Text 
                      variant="subhead" 
                      color={colors.primary}
                      colorMode={colorMode}
                      style={{ cursor: 'pointer' }}
                    >
                      忘記密碼？
                    </Text>
                  </a>
                </div>
              )}
            </div>

            {/* 🎯 錯誤訊息 - 使用 Text 組件 */}
            {error && (
              <div style={{ textAlign: 'center' }}>
                <Text variant="subhead" color={colors.danger} colorMode={colorMode}>
                  {error}
                </Text>
              </div>
            )}

            {/* 🎯 使用設計系統的 Button */}
            <Button
              type="submit"
              variant="primary"
              size="large"
              disabled={loading}
              colorMode={colorMode}
              style={{ width: '100%' }}
            >
              {loading ? (mode === 'login' ? "登入中..." : "註冊中...") : (mode === 'login' ? "登入" : "註冊")}
            </Button>
          </form>

          {/* 🎯 分隔線 */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            margin: '2rem 0',
            gap: '1rem'
          }}>
            <div style={{ 
              flex: 1, 
              height: '1px', 
              backgroundColor: colorMode === 'light' 
                ? colors.neutral.tertiaryLabel.light 
                : colors.neutral.tertiaryLabel.dark 
            }} />
            <Text variant="subhead" color={colors.neutral.secondaryLabel} colorMode={colorMode}>
              或
            </Text>
            <div style={{ 
              flex: 1, 
              height: '1px', 
              backgroundColor: colorMode === 'light' 
                ? colors.neutral.tertiaryLabel.light 
                : colors.neutral.tertiaryLabel.dark 
            }} />
          </div>

          {/* 🎯 Google 登入按鈕 */}
          <GoogleLoginButton colorMode={colorMode} />

          {/* 🎯 底部提示 - 使用 Text 組件 */}
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <Text variant="footnote" color={colors.neutral.secondaryLabel} colorMode={colorMode}>
              {mode === 'login' 
                ? '還沒有帳戶？' 
                : '已經有帳戶？'
              }
              <span 
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                style={{ 
                  marginLeft: '0.25rem',
                  cursor: 'pointer',
                  color: colors.primary.light 
                }}
              >
                {mode === 'login' ? '立即註冊' : '立即登入'}
              </span>
            </Text>
          </div>
        </Card>
      </div>
    </div>
  );
}
