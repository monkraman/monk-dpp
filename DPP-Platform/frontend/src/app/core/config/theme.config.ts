export interface ThemeColors {
  primary: string;
  primaryHover: string;
  primaryLight: string;
  accent: string;
  accentHover: string;
  accentGlow: string;
  bgPage: string;
  bgSurface: string;
  bgSidebar: string;
  bgCard: string;
  bgCardHover: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  borderColor: string;
  borderLight: string;
  statusPublishedBg: string;
  statusPublishedText: string;
  statusReviewBg: string;
  statusReviewText: string;
  statusDraftBg: string;
  statusDraftText: string;
  gradientPrimary: string;
  gradientBadge: string;
}

export interface ThemePreset {
  id: string;
  name: string;
  tagline: string;
  colors: ThemeColors;
}

export const THEME_PRESETS: Record<string, ThemePreset> = {
  'emerald-sustainability': {
    id: 'emerald-sustainability',
    name: 'Emerald Sustainability (European Clean-Tech)',
    tagline: 'Tailored for EU Battery Regulation & Circularity compliance',
    colors: {
      primary: '#064e3b',
      primaryHover: '#022c22',
      primaryLight: '#ecfdf5',
      accent: '#10b981',
      accentHover: '#059669',
      accentGlow: 'rgba(16, 185, 129, 0.25)',
      bgPage: '#f8fafc',
      bgSurface: '#ffffff',
      bgSidebar: '#0b1f17',
      bgCard: '#ffffff',
      bgCardHover: '#f9fcfb',
      textPrimary: '#0f172a',
      textSecondary: '#334155',
      textMuted: '#64748b',
      borderColor: '#e2e8f0',
      borderLight: '#f1f5f9',
      statusPublishedBg: '#dcfce7',
      statusPublishedText: '#15803d',
      statusReviewBg: '#fef3c7',
      statusReviewText: '#b45309',
      statusDraftBg: '#f1f5f9',
      statusDraftText: '#475569',
      gradientPrimary: 'linear-gradient(135deg, #064e3b 0%, #065f46 60%, #047857 100%)',
      gradientBadge: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    },
  },

  'monk-sapphire': {
    id: 'monk-sapphire',
    name: 'Enterprise Sapphire (Global Supply Chain)',
    tagline: 'High-contrast institutional corporate ERP styling',
    colors: {
      primary: '#1e3a8a',
      primaryHover: '#172554',
      primaryLight: '#eff6ff',
      accent: '#2563eb',
      accentHover: '#1d4ed8',
      accentGlow: 'rgba(37, 99, 235, 0.22)',
      bgPage: '#f8fafc',
      bgSurface: '#ffffff',
      bgSidebar: '#0f172a',
      bgCard: '#ffffff',
      bgCardHover: '#f8fafc',
      textPrimary: '#0f172a',
      textSecondary: '#334155',
      textMuted: '#64748b',
      borderColor: '#e2e8f0',
      borderLight: '#f1f5f9',
      statusPublishedBg: '#dbeafe',
      statusPublishedText: '#1e40af',
      statusReviewBg: '#fef3c7',
      statusReviewText: '#b45309',
      statusDraftBg: '#f1f5f9',
      statusDraftText: '#475569',
      gradientPrimary: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 60%, #2563eb 100%)',
      gradientBadge: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    },
  },

  'nordic-cyber': {
    id: 'nordic-cyber',
    name: 'Nordic Cyber (Advanced Battery & EV Tech)',
    tagline: 'Sleek, futuristic telemetry styling with cyan accents',
    colors: {
      primary: '#0f172a',
      primaryHover: '#020617',
      primaryLight: '#f0fdfa',
      accent: '#06b6d4',
      accentHover: '#0891b2',
      accentGlow: 'rgba(6, 182, 212, 0.25)',
      bgPage: '#f8fafc',
      bgSurface: '#ffffff',
      bgSidebar: '#020617',
      bgCard: '#ffffff',
      bgCardHover: '#f8fafc',
      textPrimary: '#020617',
      textSecondary: '#1e293b',
      textMuted: '#64748b',
      borderColor: '#e2e8f0',
      borderLight: '#f1f5f9',
      statusPublishedBg: '#cffafe',
      statusPublishedText: '#0e7490',
      statusReviewBg: '#ffedd5',
      statusReviewText: '#c2410c',
      statusDraftBg: '#f1f5f9',
      statusDraftText: '#475569',
      gradientPrimary: 'linear-gradient(135deg, #0f172a 0%, #1e293b 70%, #0e7490 100%)',
      gradientBadge: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    },
  },

  'minimal-luxe': {
    id: 'minimal-luxe',
    name: 'Minimalist Luxe (Linear & Stripe Style)',
    tagline: 'Ultra-clean monochromatic design with micro-accents',
    colors: {
      primary: '#18181b',
      primaryHover: '#09090b',
      primaryLight: '#f4f4f5',
      accent: '#27272a',
      accentHover: '#09090b',
      accentGlow: 'rgba(0, 0, 0, 0.1)',
      bgPage: '#fafafa',
      bgSurface: '#ffffff',
      bgSidebar: '#18181b',
      bgCard: '#ffffff',
      bgCardHover: '#fafafa',
      textPrimary: '#09090b',
      textSecondary: '#27272a',
      textMuted: '#71717a',
      borderColor: '#e4e4e7',
      borderLight: '#f4f4f5',
      statusPublishedBg: '#ecfdf5',
      statusPublishedText: '#047857',
      statusReviewBg: '#fffbeb',
      statusReviewText: '#b45309',
      statusDraftBg: '#f4f4f5',
      statusDraftText: '#52525b',
      gradientPrimary: 'linear-gradient(135deg, #18181b 0%, #27272a 100%)',
      gradientBadge: 'linear-gradient(135deg, #27272a 0%, #09090b 100%)',
    },
  },
};

/**
 * DEFAULT APP CONFIGURATION
 * Changing defaultThemeId here instantly changes the entire platform design!
 */
export const DEFAULT_THEME_ID = 'emerald-sustainability';
