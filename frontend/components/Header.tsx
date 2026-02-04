import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, NEO_STYLE } from '../theme';

interface HeaderProps {
    onHistoryPress: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onHistoryPress }) => {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
            <View style={styles.titleContainer}>
                <Ionicons name="leaf" size={28} color={COLORS.primary} />
                <Text style={styles.headerTitle}>AgriValue</Text>
            </View>

            <TouchableOpacity
                style={styles.historyButton}
                onPress={onHistoryPress}
                activeOpacity={0.7}
            >
                <Ionicons name="time" size={20} color={COLORS.text} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        backgroundColor: COLORS.surface,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: 3,
        borderBottomColor: COLORS.border,
        zIndex: 10,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: COLORS.text,
        letterSpacing: -1,
        textTransform: 'uppercase',
    },
    historyButton: {
        padding: 8,
        backgroundColor: COLORS.accent,
        borderWidth: 2,
        borderColor: COLORS.border,
        borderRadius: 8,
        ...NEO_STYLE.shadow,
        shadowOffset: { width: 2, height: 2 },
    },
});