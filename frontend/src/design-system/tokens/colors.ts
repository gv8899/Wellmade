import { LightTheme, DarkTheme } from 'baseui/themes';

export interface ColorToken {
  light: string;
  dark: string;
}

// === Uber Base Web 調色盤 ===
export const uberColors = {
  // Primary Colors
  primary: {
    light: LightTheme.colors.primary,
    dark: DarkTheme.colors.primary
  },
  accent: {
    light: LightTheme.colors.accent,
    dark: DarkTheme.colors.accent
  },
  
  // Semantic Colors
  positive: {
    light: LightTheme.colors.positive,
    dark: DarkTheme.colors.positive
  },
  negative: {
    light: LightTheme.colors.negative,
    dark: DarkTheme.colors.negative
  },
  warning: {
    light: LightTheme.colors.warning,
    dark: DarkTheme.colors.warning
  },
  
  // Neutrals
  mono100: {
    light: LightTheme.colors.mono100,
    dark: DarkTheme.colors.mono100
  },
  mono200: {
    light: LightTheme.colors.mono200,
    dark: DarkTheme.colors.mono200
  },
  mono300: {
    light: LightTheme.colors.mono300,
    dark: DarkTheme.colors.mono300
  },
  mono400: {
    light: LightTheme.colors.mono400,
    dark: DarkTheme.colors.mono400
  },
  mono500: {
    light: LightTheme.colors.mono500,
    dark: DarkTheme.colors.mono500
  },
  mono600: {
    light: LightTheme.colors.mono600,
    dark: DarkTheme.colors.mono600
  },
  mono700: {
    light: LightTheme.colors.mono700,
    dark: DarkTheme.colors.mono700
  },
  mono800: {
    light: LightTheme.colors.mono800,
    dark: DarkTheme.colors.mono800
  },
  mono900: {
    light: LightTheme.colors.mono900,
    dark: DarkTheme.colors.mono900
  },
  mono1000: {
    light: LightTheme.colors.mono1000,
    dark: DarkTheme.colors.mono1000
  },
  
  // Base Colors
  white: {
    light: LightTheme.colors.white,
    dark: DarkTheme.colors.white
  },
  black: {
    light: LightTheme.colors.black,
    dark: DarkTheme.colors.black
  }
} as const;

// === 語義化顏色系統 ===
export interface SemanticColors {
  primary: ColorToken;
  secondary: ColorToken;
  success: ColorToken;
  warning: ColorToken;
  danger: ColorToken;
  info: ColorToken;
  neutral: {
    label: ColorToken;
    secondaryLabel: ColorToken;
    tertiaryLabel: ColorToken;
    placeholderText: ColorToken;
  };
  background: {
    systemBackground: ColorToken;
    secondarySystemBackground: ColorToken;
  };
}

// === 主題配置 ===
export const themeConfig = {
  primary: uberColors.black,         // 🎯 黑色作為主色調
  secondary: uberColors.mono600,     // 中性灰色作為次要色調
  success: uberColors.positive,      // Uber 綠色
  warning: uberColors.warning,       // Uber 黃色
  danger: uberColors.negative,       // Uber 紅色
  info: uberColors.accent,           // 藍色作為資訊色
} as const;

// === 導出的顏色系統 ===
export const colors: SemanticColors = {
  primary: themeConfig.primary,
  secondary: themeConfig.secondary,
  success: themeConfig.success,
  warning: themeConfig.warning,
  danger: themeConfig.danger,
  info: themeConfig.info,
  neutral: {
    label: {
      light: LightTheme.colors.contentPrimary,
      dark: DarkTheme.colors.contentPrimary
    },
    secondaryLabel: {
      light: LightTheme.colors.contentSecondary,
      dark: DarkTheme.colors.contentSecondary
    },
    tertiaryLabel: {
      light: LightTheme.colors.contentTertiary,
      dark: DarkTheme.colors.contentTertiary
    },
    placeholderText: {
      light: LightTheme.colors.contentTertiary,
      dark: DarkTheme.colors.contentTertiary
    }
  },
  background: {
    systemBackground: {
      light: LightTheme.colors.backgroundPrimary,
      dark: DarkTheme.colors.backgroundPrimary
    },
    secondarySystemBackground: {
      light: LightTheme.colors.backgroundSecondary,
      dark: DarkTheme.colors.backgroundSecondary
    }
  }
};

export type ColorMode = 'light' | 'dark';

export const getColor = (colorToken: ColorToken, mode: ColorMode = 'light'): string => {
  return colorToken[mode];
};

export const getColorValue = (
  path: string,
  mode: ColorMode = 'light'
): string => {
  const pathArray = path.split('.');
  let current: any = colors;
  
  for (const key of pathArray) {
    current = current[key];
    if (!current) {
      throw new Error(`Color path "${path}" not found`);
    }
  }
  
  if (typeof current === 'object' && 'light' in current && 'dark' in current) {
    return current[mode];
  }
  
  throw new Error(`Color path "${path}" does not point to a valid color token`);
};

// === Uber 間距系統 ===
export const spacing = {
  scale0: LightTheme.sizing.scale0,
  scale100: LightTheme.sizing.scale100,
  scale200: LightTheme.sizing.scale200,
  scale300: LightTheme.sizing.scale300,
  scale400: LightTheme.sizing.scale400,
  scale500: LightTheme.sizing.scale500,
  scale550: LightTheme.sizing.scale550,
  scale600: LightTheme.sizing.scale600,
  scale650: LightTheme.sizing.scale650,
  scale700: LightTheme.sizing.scale700,
  scale750: LightTheme.sizing.scale750,
  scale800: LightTheme.sizing.scale800,
  scale850: LightTheme.sizing.scale850,
  scale900: LightTheme.sizing.scale900,
  scale950: LightTheme.sizing.scale950,
  scale1000: LightTheme.sizing.scale1000,
  scale1200: LightTheme.sizing.scale1200,
  scale1400: LightTheme.sizing.scale1400,
  scale1600: LightTheme.sizing.scale1600,
  scale2400: LightTheme.sizing.scale2400,
  scale3200: LightTheme.sizing.scale3200,
  scale4800: LightTheme.sizing.scale4800,
} as const;

// === Uber 陰影系統 ===
export const shadows = {
  shadow400: LightTheme.lighting.shadow400,
  shadow500: LightTheme.lighting.shadow500,
  shadow600: LightTheme.lighting.shadow600,
  shadow700: LightTheme.lighting.shadow700,
} as const;