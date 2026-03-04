
// Ported from frontend/src/index.css
export const COLORS = {
    background: '#FFFFFF',
    foreground: '#111827', // hsl(222 25% 12%)

    primary: '#0891b2', // hsl(190 95% 42%) - Teal/Cyan
    primaryForeground: '#f0f9ff',

    secondary: '#f1f5f9', // hsl(210 16% 96%)
    secondaryForeground: '#111827',

    accent: '#10b981', // hsl(165 85% 55%) - Emerald
    accentForeground: '#f0f9ff',

    muted: '#f1f5f9',
    mutedForeground: '#64748b',

    destructive: '#ef4444',
    destructiveForeground: '#FFFFFF',

    border: '#e2e8f0',
    input: '#e2e8f0',

    card: '#FFFFFF',
    cardShadow: 'rgba(15, 23, 42, 0.08)',
};

export const GRADIENTS = {
    primary: ['#0891b2', '#10b981'], // Teal -> Emerald
    subtle: ['#ffffff', '#f8fafc'],
};

export const SHADOWS = {
    card: {
        shadowColor: COLORS.foreground,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    glow: {
        shadowColor: COLORS.accent,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 10,
    }
};
