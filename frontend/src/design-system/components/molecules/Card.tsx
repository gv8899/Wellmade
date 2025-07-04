import React from 'react';
import { Text } from '../atoms/Text';
import { colors, ColorMode } from '../../tokens/colors';

export interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  colorMode?: ColorMode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'small' | 'medium' | 'large';
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  children,
  colorMode = 'light',
  variant = 'default',
  padding = 'medium',
  className,
  style,
  onClick,
  ...props
}) => {
  const getCardStyles = () => {
    const baseStyles: React.CSSProperties = {
      borderRadius: '12px',
      transition: 'all 0.2s ease',
      cursor: onClick ? 'pointer' : 'default',
    };

    const paddingStyles = {
      none: { padding: '0' },
      small: { padding: '12px' },
      medium: { padding: '20px' },
      large: { padding: '24px' },
    };

    const variantStyles = {
      default: {
        backgroundColor: colorMode === 'light' 
          ? colors.background.secondarySystemBackground.light 
          : colors.background.secondarySystemBackground.dark,
        border: 'none',
      },
      elevated: {
        backgroundColor: colorMode === 'light' 
          ? colors.background.systemBackground.light 
          : colors.background.systemBackground.dark,
        border: 'none',
        boxShadow: colorMode === 'light'
          ? '0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)'
          : '0 4px 6px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.4)',
      },
      outlined: {
        backgroundColor: 'transparent',
        border: `1px solid ${colorMode === 'light' 
          ? 'rgba(60, 60, 67, 0.1)' 
          : 'rgba(235, 235, 245, 0.1)'}`,
      },
    };

    return {
      ...baseStyles,
      ...paddingStyles[padding],
      ...variantStyles[variant],
    };
  };

  const headerStyle: React.CSSProperties = {
    marginBottom: (title || subtitle) ? '16px' : '0',
  };

  const titleStyle: React.CSSProperties = {
    marginBottom: subtitle ? '4px' : '0',
  };

  const combinedStyle = {
    ...getCardStyles(),
    ...style,
  };

  const handleClick = () => {
    if (onClick) onClick();
  };

  return (
    <div
      className={className}
      style={combinedStyle}
      onClick={handleClick}
      {...props}
    >
      {(title || subtitle) && (
        <div style={headerStyle}>
          {title && (
            <div style={titleStyle}>
              <Text variant="headline" colorMode={colorMode}>
                {title}
              </Text>
            </div>
          )}
          {subtitle && (
            <Text 
              variant="subhead" 
              color={colors.neutral.secondaryLabel}
              colorMode={colorMode}
            >
              {subtitle}
            </Text>
          )}
        </div>
      )}
      {children}
    </div>
  );
};