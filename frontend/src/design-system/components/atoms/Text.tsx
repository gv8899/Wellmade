import React from 'react';
import { getTypographyStyle, TypographyVariant } from '../../tokens/typography';
import { getColor, ColorToken, ColorMode } from '../../tokens/colors';

export interface TextProps {
  variant?: TypographyVariant;
  color?: ColorToken;
  colorMode?: ColorMode;
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  style?: React.CSSProperties;
}

export const Text: React.FC<TextProps> = ({
  variant = 'body',
  color,
  colorMode = 'light',
  children,
  as = 'span',
  className,
  style,
  ...props
}) => {
  const Component = as;
  
  const typographyStyle = getTypographyStyle(variant);
  const colorStyle = color ? { color: getColor(color, colorMode) } : {};
  
  const combinedStyle = {
    ...typographyStyle,
    ...colorStyle,
    ...style
  };

  return (
    <Component
      className={className}
      style={combinedStyle}
      {...props}
    >
      {children}
    </Component>
  );
};