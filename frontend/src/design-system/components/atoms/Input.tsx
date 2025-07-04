import React from 'react';
import { getTypographyStyle } from '../../tokens/typography';
import { getColor, ColorMode } from '../../tokens/colors';

export interface InputProps {
  colorMode?: ColorMode;
  placeholder?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  error?: boolean;
  className?: string;
  style?: React.CSSProperties;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
}

export const Input: React.FC<InputProps> = ({
  colorMode = 'light',
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  disabled = false,
  error = false,
  className,
  style,
  type = 'text',
  ...props
}) => {
  const getInputStyles = () => {
    const baseStyles = {
      fontFamily: '-apple-system, BlinkMacSystemFont, SF Pro Display, SF Pro Text, Helvetica Neue, Helvetica, Arial, sans-serif',
      fontSize: '17px',
      lineHeight: '22px',
      fontWeight: '400',
      padding: '12px 16px',
      borderRadius: '8px',
      border: `1px solid ${colorMode === 'light' ? '#E5E5E7' : '#38383A'}`,
      backgroundColor: colorMode === 'light' ? '#FFFFFF' : '#1C1C1E',
      color: colorMode === 'light' ? '#000000' : '#FFFFFF',
      outline: 'none',
      transition: 'all 0.2s ease',
      width: '100%',
      boxSizing: 'border-box' as const,
    };

    const stateStyles = {
      '&:focus': {
        borderColor: colorMode === 'light' ? '#007AFF' : '#0A84FF',
        boxShadow: `0 0 0 3px ${colorMode === 'light' ? 'rgba(0, 122, 255, 0.1)' : 'rgba(10, 132, 255, 0.1)'}`,
      },
      '&:disabled': {
        opacity: 0.6,
        cursor: 'not-allowed',
      },
    };

    const errorStyles = error ? {
      borderColor: colorMode === 'light' ? '#FF3B30' : '#FF453A',
      boxShadow: `0 0 0 3px ${colorMode === 'light' ? 'rgba(255, 59, 48, 0.1)' : 'rgba(255, 69, 58, 0.1)'}`,
    } : {};

    return {
      ...baseStyles,
      ...errorStyles,
    };
  };

  const placeholderColor = colorMode === 'light' 
    ? 'rgba(60, 60, 67, 0.3)' 
    : 'rgba(235, 235, 245, 0.3)';

  const combinedStyle = {
    ...getInputStyles(),
    ...style,
    '::placeholder': {
      color: placeholderColor,
    },
  };

  return (
    <input
      type={type}
      className={className}
      style={combinedStyle}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      onFocus={onFocus}
      disabled={disabled}
      {...props}
    />
  );
};