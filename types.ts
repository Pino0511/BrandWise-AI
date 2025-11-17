
export interface ColorInfo {
  hex: string;
  name: string;
  usage: string;
}

export interface FontPairing {
  headerFont: string;
  bodyFont: string;
}

export interface BrandBible {
  primaryLogoUrl: string;
  secondaryMarkUrls: string[];
  colorPalette: ColorInfo[];
  fontPairing: FontPairing;
  mission: string;
}

export interface BrandIdentityPlan {
  logoPrompt: string;
  secondaryMarkPrompts: string[];
  colorPalette: ColorInfo[];
  fontPairing: FontPairing;
}

export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}
