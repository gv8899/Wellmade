import { LightTheme } from 'baseui/themes';

export type FontWeight = 
  | 'normal'
  | 'bold'
  | '100'
  | '200'
  | '300'
  | '400'
  | '500'
  | '600'
  | '700'
  | '800'
  | '900';

export interface TypographyToken {
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  letterSpacing?: string;
}

export interface TypographyScale {
  title1: TypographyToken;
  title2: TypographyToken;
  title3: TypographyToken;
  headline: TypographyToken;
  body: TypographyToken;
  callout: TypographyToken;
  subhead: TypographyToken;
  footnote: TypographyToken;
  caption1: TypographyToken;
  caption2: TypographyToken;
  small: TypographyToken; // 新增 14px 字級
}

// === Uber 字體系統 ===
export const uberTypography = {
  // Display sizes (largest)
  displayLarge: LightTheme.typography.DisplayLarge,
  displayMedium: LightTheme.typography.DisplayMedium,
  displaySmall: LightTheme.typography.DisplaySmall,
  displayXSmall: LightTheme.typography.DisplayXSmall,
  
  // Heading sizes
  headingXXLarge: LightTheme.typography.HeadingXXLarge,
  headingXLarge: LightTheme.typography.HeadingXLarge,
  headingLarge: LightTheme.typography.HeadingLarge,
  headingMedium: LightTheme.typography.HeadingMedium,
  headingSmall: LightTheme.typography.HeadingSmall,
  headingXSmall: LightTheme.typography.HeadingXSmall,
  
  // Label sizes
  labelLarge: LightTheme.typography.LabelLarge,
  labelMedium: LightTheme.typography.LabelMedium,
  labelSmall: LightTheme.typography.LabelSmall,
  labelXSmall: LightTheme.typography.LabelXSmall,
  
  // Paragraph sizes
  paragraphLarge: LightTheme.typography.ParagraphLarge,
  paragraphMedium: LightTheme.typography.ParagraphMedium,
  paragraphSmall: LightTheme.typography.ParagraphSmall,
  paragraphXSmall: LightTheme.typography.ParagraphXSmall,
} as const;

// === Uber 字體家族 ===
export const fontFamily = {
  uberMove: LightTheme.typography.ParagraphMedium.fontFamily,
  primary: LightTheme.typography.ParagraphMedium.fontFamily,
  secondary: LightTheme.typography.MonoParagraphMedium.fontFamily,
};

// === 映射到原有的設計系統結構 ===
export const typography: TypographyScale = {
  // 對應 HeadingXLarge  
  title1: {
    fontFamily: uberTypography.headingXLarge.fontFamily,
    fontSize: uberTypography.headingXLarge.fontSize,
    fontWeight: uberTypography.headingXLarge.fontWeight,
    lineHeight: uberTypography.headingXLarge.lineHeight,
  },
  
  // 對應 HeadingLarge
  title2: {
    fontFamily: uberTypography.headingLarge.fontFamily,
    fontSize: uberTypography.headingLarge.fontSize,
    fontWeight: uberTypography.headingLarge.fontWeight,
    lineHeight: uberTypography.headingLarge.lineHeight,
  },
  
  // 對應 HeadingXSmall (20px - 符合設計需求)
  title3: {
    fontFamily: uberTypography.headingXSmall.fontFamily,
    fontSize: uberTypography.headingXSmall.fontSize,
    fontWeight: uberTypography.headingXSmall.fontWeight,
    lineHeight: uberTypography.headingXSmall.lineHeight,
  },
  
  // 自定義 17px (商品名稱用)
  headline: {
    fontFamily: uberTypography.headingSmall.fontFamily,
    fontSize: '17px',
    fontWeight: '600', // 使其更粗
    lineHeight: '22px',
  },
  
  // 對應 ParagraphLarge (18px - 最接近設計需求的 17px)
  body: {
    fontFamily: uberTypography.paragraphLarge.fontFamily,
    fontSize: uberTypography.paragraphLarge.fontSize,
    fontWeight: uberTypography.paragraphLarge.fontWeight,
    lineHeight: uberTypography.paragraphLarge.lineHeight,
  },
  
  // 對應 ParagraphSmall
  callout: {
    fontFamily: uberTypography.paragraphSmall.fontFamily,
    fontSize: uberTypography.paragraphSmall.fontSize,
    fontWeight: uberTypography.paragraphSmall.fontWeight,
    lineHeight: uberTypography.paragraphSmall.lineHeight,
  },
  
  // 對應 LabelMedium
  subhead: {
    fontFamily: uberTypography.labelMedium.fontFamily,
    fontSize: uberTypography.labelMedium.fontSize,
    fontWeight: uberTypography.labelMedium.fontWeight,
    lineHeight: uberTypography.labelMedium.lineHeight,
  },
  
  // 對應 LabelSmall
  footnote: {
    fontFamily: uberTypography.labelSmall.fontFamily,
    fontSize: uberTypography.labelSmall.fontSize,
    fontWeight: uberTypography.labelSmall.fontWeight,
    lineHeight: uberTypography.labelSmall.lineHeight,
  },
  
  // 對應 ParagraphXSmall
  caption1: {
    fontFamily: uberTypography.paragraphXSmall.fontFamily,
    fontSize: uberTypography.paragraphXSmall.fontSize,
    fontWeight: uberTypography.paragraphXSmall.fontWeight,
    lineHeight: uberTypography.paragraphXSmall.lineHeight,
  },
  
  // 對應 LabelXSmall
  caption2: {
    fontFamily: uberTypography.labelXSmall.fontFamily,
    fontSize: uberTypography.labelXSmall.fontSize,
    fontWeight: uberTypography.labelXSmall.fontWeight,
    lineHeight: uberTypography.labelXSmall.lineHeight,
  },
  
  // 自定義 14px (計數器和價格用)
  small: {
    fontFamily: uberTypography.paragraphMedium.fontFamily,
    fontSize: '14px',
    fontWeight: '400',
    lineHeight: '18px',
  }
};

export type TypographyVariant = keyof TypographyScale;

export const getTypographyCSS = (variant: TypographyVariant): string => {
  const token = typography[variant];
  return `
    font-family: ${token.fontFamily};
    font-size: ${token.fontSize};
    line-height: ${token.lineHeight};
    font-weight: ${token.fontWeight};
    ${token.letterSpacing ? `letter-spacing: ${token.letterSpacing};` : ''}
  `;
};

export const getTypographyStyle = (variant: TypographyVariant): React.CSSProperties => {
  const token = typography[variant];
  return {
    fontFamily: token.fontFamily,
    fontSize: token.fontSize,
    lineHeight: token.lineHeight,
    fontWeight: token.fontWeight,
    ...(token.letterSpacing && { letterSpacing: token.letterSpacing })
  };
};

// === 額外的 Uber 字體工具 ===
export const getUberTypographyStyle = (variant: keyof typeof uberTypography): React.CSSProperties => {
  const token = uberTypography[variant];
  return {
    fontFamily: token.fontFamily,
    fontSize: token.fontSize,
    lineHeight: token.lineHeight,
    fontWeight: token.fontWeight,
  };
};