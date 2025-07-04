'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { colors, spacing } from '@/design-system';

interface GoogleLoginButtonProps {
  className?: string;
  colorMode?: 'light' | 'dark';
}

export default function GoogleLoginButton({ 
  className = '', 
  colorMode = 'light' 
}: GoogleLoginButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await signIn('google', { callbackUrl: '/' });
    } catch (error) {
      console.error('Google 登入失敗:', error);
      setLoading(false);
    }
  };

  // 🎯 使用設計系統的樣式
  const buttonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.scale300,
    width: '100%',
    backgroundColor: colorMode === 'light' 
      ? colors.background.systemBackground.light 
      : colors.background.systemBackground.dark,
    color: colorMode === 'light' 
      ? colors.neutral.label.light 
      : colors.neutral.label.dark,
    border: `1px solid ${colorMode === 'light' 
      ? colors.neutral.tertiaryLabel.light 
      : colors.neutral.tertiaryLabel.dark}`,
    borderRadius: '8px',
    padding: `${spacing.scale400} ${spacing.scale500}`,
    fontFamily: 'UberMoveText, system-ui, "Helvetica Neue", Helvetica, Arial, sans-serif',
    fontSize: '16px',
    fontWeight: '500',
    lineHeight: '24px',
    cursor: loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    opacity: loading ? 0.6 : 1,
    outline: 'none',
    
    // Hover 效果
    ':hover': !loading ? {
      backgroundColor: colorMode === 'light' 
        ? colors.background.secondarySystemBackground.light 
        : colors.background.secondarySystemBackground.dark,
    } : {},
    
    // Focus 效果
    ':focus': {
      borderColor: colors.primary.light,
      boxShadow: `0 0 0 3px ${colors.primary.light}20`,
    }
  };

  return (
    <button
      onClick={handleGoogleLogin}
      disabled={loading}
      style={buttonStyle}
      className={className}
      onMouseEnter={(e) => {
        if (!loading) {
          e.currentTarget.style.backgroundColor = colorMode === 'light' 
            ? colors.background.secondarySystemBackground.light 
            : colors.background.secondarySystemBackground.dark;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = colorMode === 'light' 
          ? colors.background.systemBackground.light 
          : colors.background.systemBackground.dark;
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = colors.primary.light;
        e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.primary.light}20`;
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = colorMode === 'light' 
          ? colors.neutral.tertiaryLabel.light 
          : colors.neutral.tertiaryLabel.dark;
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 48 48" 
        width="24px" 
        height="24px"
      >
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
      </svg>
      {loading ? '登入中...' : '使用 Google 登入'}
    </button>
  );
}