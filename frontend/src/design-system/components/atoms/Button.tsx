import React from 'react';
import { getTypographyStyle } from '../../tokens/typography';
import { getColor, colors, ColorMode } from '../../tokens/colors';

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'small' | 'medium' | 'large';
  colorMode?: ColorMode;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  type?: 'button' | 'submit' | 'reset';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  colorMode = 'light',
  disabled = false,
  children,
  onClick,
  className,
  style,
  type = 'button',
  ...props
}) => {
  const getVariantStyles = () => {
    const baseStyles = {
      border: 'none',
      borderRadius: '8px',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s ease',
      outline: 'none',
      fontFamily: '-apple-system, BlinkMacSystemFont, SF Pro Display, SF Pro Text, Helvetica Neue, Helvetica, Arial, sans-serif',
      opacity: disabled ? 0.6 : 1,
    };

    const sizeStyles = {
      small: {
        padding: '8px 16px',
        fontSize: '15px',
        lineHeight: '20px',
        fontWeight: '600',
      },
      medium: {
        padding: '12px 20px',
        fontSize: '17px',
        lineHeight: '22px',
        fontWeight: '600',
      },
      large: {
        padding: '16px 24px',
        fontSize: '17px',
        lineHeight: '22px',
        fontWeight: '600',
      },
    };

    const variantStyles = {
      primary: {
        backgroundColor: getColor(colors.primary, colorMode),
        color: '#FFFFFF',
      },
      secondary: {
        backgroundColor: getColor(colors.background.secondarySystemBackground, colorMode),
        color: getColor(colors.primary, colorMode),
      },
      success: {
        backgroundColor: getColor(colors.success, colorMode),
        color: '#FFFFFF',
      },
      warning: {
        backgroundColor: getColor(colors.warning, colorMode),
        color: '#FFFFFF',
      },
      danger: {
        backgroundColor: getColor(colors.danger, colorMode),
        color: '#FFFFFF',
      },
      info: {
        backgroundColor: getColor(colors.info, colorMode),
        color: '#FFFFFF',
      },
    };

    return {
      ...baseStyles,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  const combinedStyle = {
    ...getVariantStyles(),
    ...style,
  };

  return (
    <button
      type={type}
      className={className}
      style={combinedStyle}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};