export const Theme = {
    colors: {
        primary: '#1C1C1E', // Stark Black for primary active state
        background: '#FFFFFF', // Pure White for main app background
        surface: '#F9F9F9', // Off-White for cards and sections
        surfaceDarker: '#F5F5F5', // Slightly darker for inputs/secondary areas
        textPrimary: '#1C1C1E', // Charcoal Black
        textSecondary: '#757575', // Medium Gray
        textTertiary: '#A1A1AA', // Lighter Gray
        success: '#4CAF50', // Safe/Verified green
        star: '#FFD700', // Yellow/Gold for ratings
        danger: '#FF3B30', // Red for destructive actions
        border: '#E5E5EA', // Light border
    },
    typography: {
        fontFamily: 'System', // Use default system font (San Francisco on iOS, Roboto on Android)
        h1: {
            fontSize: 28,
            fontWeight: '700' as const,
            color: '#1C1C1E',
            letterSpacing: -0.5,
        },
        h2: {
            fontSize: 24,
            fontWeight: '700' as const,
            color: '#1C1C1E',
            letterSpacing: -0.3,
        },
        h3: {
            fontSize: 20,
            fontWeight: '600' as const,
            color: '#1C1C1E',
        },
        bodyLarge: {
            fontSize: 16,
            fontWeight: '400' as const,
            color: '#757575',
            lineHeight: 24,
        },
        body: {
            fontSize: 14,
            fontWeight: '400' as const,
            color: '#757575',
            lineHeight: 20,
        },
        caption: {
            fontSize: 12,
            fontWeight: '500' as const,
            color: '#A1A1AA',
        },
    },
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 20, // Generous padding
        xl: 24,
        xxl: 32,
        xxxl: 48,
    },
    layout: {
        paddingHorizontal: 20, // Breathable whitespace around edges
        borderRadiusCard: 16, // Soft rounded borders for cards
        borderRadiusPill: 999, // Fully rounded for small actions
        borderRadiusIcon: 12, // Distinct circular/square backgrounds for icons
    },
    shadows: {
        sm: {
            // Very soft elegant drop shadow
            shadowColor: '#1C1C1E',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
        },
        md: {
            shadowColor: '#1C1C1E',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 4,
        },
    },
};
