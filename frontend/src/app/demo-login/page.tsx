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

export default function DemoLoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
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
    
    // 模擬 API 請求
    setTimeout(() => {
      if (form.email && form.password) {
        toast.success(`${mode === 'login' ? '登入' : '註冊'}成功！（設計系統示範）`);
        setLoading(false);
        // router.push('/');
      } else {
        setError('請填寫所有欄位');
        setLoading(false);
      }
    }, 1500);
  };

  const handleGoogleLogin = async () => {
    toast.success('Google 登入示範（設計系統版本）');
  };

  // 🎯 使用設計系統的主容器樣式
  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background.systemBackground.light,
    padding: '3rem 1rem',
  };

  // 🎯 標籤切換按鈕樣式
  const getTabButtonStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '12px 24px',
    border: 'none',
    background: 'transparent',
    borderBottom: `2px solid ${isActive ? colors.primary.light : 'transparent'}`,
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
          style={{ minHeight: '520px' }}
        >
          {/* 🎯 使用設計系統的 Text 組件 */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <Text variant="title1" style={{ marginBottom: '0.5rem' }}>
              歡迎回來
            </Text>
            <Text variant="body" color={colors.neutral.secondaryLabel}>
              {mode === 'login' ? '請登入您的帳戶' : '建立您的新帳戶'}
            </Text>
            <div style={{ 
              padding: '8px 16px', 
              backgroundColor: colors.info.light,
              borderRadius: '8px',
              marginTop: '1rem'
            }}>
              <Text variant="caption1" style={{ color: '#FFFFFF' }}>
                🎯 這是使用設計系統重建的登入頁面示範
              </Text>
            </div>
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
                <Text variant="subhead" color={colors.danger}>
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
              backgroundColor: colors.neutral.tertiaryLabel.light 
            }} />
            <Text variant="subhead" color={colors.neutral.secondaryLabel}>
              或
            </Text>
            <div style={{ 
              flex: 1, 
              height: '1px', 
              backgroundColor: colors.neutral.tertiaryLabel.light 
            }} />
          </div>

          {/* 🎯 Google 登入按鈕 */}
          <Button
            variant="secondary"
            size="large"
            onClick={handleGoogleLogin}
            style={{ width: '100%' }}
          >
            Google 登入 (示範)
          </Button>

          {/* 🎯 底部提示 - 使用 Text 組件 */}
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <Text variant="footnote" color={colors.neutral.secondaryLabel}>
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

          {/* 🎯 返回按鈕 */}
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Button 
              variant="secondary" 
              onClick={() => window.history.back()}
            >
              返回原版登入頁面
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}