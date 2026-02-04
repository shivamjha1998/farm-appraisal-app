
export const COLORS = {
    background: '#E0E7FF',
    primary: '#8B5CF6',
    secondary: '#A78BFA',
    accent: '#FDE047',
    surface: '#FFFFFF',
    text: '#000000',
    error: '#EF4444',
    success: '#10B981',
    border: '#000000',
};

export const NEO_STYLE = {
    container: {
        backgroundColor: COLORS.surface,
        borderWidth: 3,
        borderColor: COLORS.border,
        borderRadius: 8,
    },
    shadow: {
        shadowColor: COLORS.border,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 5,
    },
    shadowPressed: {
        shadowOffset: { width: 2, height: 2 },
        transform: [{ translateX: 2 }, { translateY: 2 }],
    },
    boldText: {
        fontWeight: '800' as '800',
        color: COLORS.text,
    }
};
