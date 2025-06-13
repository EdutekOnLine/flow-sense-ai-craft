
export interface ColorPalette {
  id: string;
  name: string;
  colors: {
    primary: string;
    'primary-foreground': string;
    secondary: string;
    'secondary-foreground': string;
    accent: string;
    'accent-foreground': string;
    muted: string;
    'muted-foreground': string;
    background: string;
    foreground: string;
    border: string;
    input: string;
    ring: string;
    card: string;
    'card-foreground': string;
    popover: string;
    'popover-foreground': string;
    destructive: string;
    'destructive-foreground': string;
  };
}

export interface VisualPreferences {
  borderRadius: 'sharp' | 'rounded' | 'very-rounded' | 'pill' | 'asymmetric' | 'beveled' | 'hexagonal' | 'diamond' | 'skewed' | 'notched';
  cardShadows: 'none' | 'subtle' | 'pronounced';
  sidebarStyle: 'compact' | 'standard' | 'spacious';
  animationStyle: 'full' | 'reduced';
}

export interface ThemeSettings {
  colorPalette: string;
  visualPreferences: VisualPreferences;
  isDarkMode: boolean;
}

export const defaultThemeSettings: ThemeSettings = {
  colorPalette: 'default',
  visualPreferences: {
    borderRadius: 'rounded',
    cardShadows: 'subtle',
    sidebarStyle: 'standard',
    animationStyle: 'full'
  },
  isDarkMode: false
};
