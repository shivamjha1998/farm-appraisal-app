
export const COLORS = {
    background: '#E0E7FF', // Light Indigo background
    primary: '#8B5CF6',    // Bright Violet
    secondary: '#A78BFA',  // Lighter Violet
    accent: '#FDE047',     // Bright Yellow for highlights/badges
    surface: '#FFFFFF',
    text: '#000000',
    error: '#EF4444',
    success: '#10B981',
    border: '#000000',
};

export const NEO_STYLE = {
    // Common container style for cards/buttons
    container: {
        backgroundColor: COLORS.surface,
        borderWidth: 3,
        borderColor: COLORS.border,
        borderRadius: 8, // Slightly rounded, but still blocky
    },
    // Hard shadow effect
    shadow: {
        shadowColor: COLORS.border,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 5, // Android fallback
    },
    // Hard shadow effect for pressed state (smaller offset)
    shadowPressed: {
        shadowOffset: { width: 2, height: 2 },
        transform: [{ translateX: 2 }, { translateY: 2 }],
    },
    // Typography basics
    boldText: {
        fontWeight: '800' as '800',
        color: COLORS.text,
    }
};
