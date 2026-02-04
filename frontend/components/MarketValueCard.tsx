import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PriceStats } from '../types';
import { COLORS, NEO_STYLE } from '../theme';

interface MarketValueCardProps {
    stats: PriceStats;
}

export const MarketValueCard: React.FC<MarketValueCardProps> = ({ stats }) => {
    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Ionicons name="stats-chart" size={24} color={COLORS.text} />
                <Text style={styles.cardTitle}>Market Estimate</Text>
            </View>
            <View style={styles.priceContainer}>
                <View style={styles.priceBox}>
                    <Text style={styles.priceLabel}>Min</Text>
                    <Text style={styles.priceValueSmall}>¥{stats.min.toLocaleString()}</Text>
                </View>
                <View style={styles.priceBoxHighlighted}>
                    <Text style={styles.priceLabelLight}>Median</Text>
                    <Text style={styles.priceValueLarge}>¥{Math.round(stats.median).toLocaleString()}</Text>
                </View>
                <View style={styles.priceBox}>
                    <Text style={styles.priceLabel}>Max</Text>
                    <Text style={styles.priceValueSmall}>¥{stats.max.toLocaleString()}</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        ...NEO_STYLE.container,
        ...NEO_STYLE.shadow,
        padding: 15,
        marginBottom: 15,
        backgroundColor: COLORS.secondary, // Make this card stand out
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        borderBottomWidth: 3,
        borderBottomColor: COLORS.border,
        paddingBottom: 8,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '900',
        marginLeft: 8,
        color: COLORS.text,
        textTransform: 'uppercase',
    },
    priceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 5,
        gap: 10,
    },
    priceBox: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderWidth: 2,
        borderColor: COLORS.border,
        padding: 8,
        borderRadius: 8,
    },
    priceBoxHighlighted: {
        flex: 1.2, // Slightly larger
        alignItems: 'center',
        backgroundColor: COLORS.accent,
        borderWidth: 3, // Thicker border
        borderColor: COLORS.border,
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderRadius: 8,
        ...NEO_STYLE.shadow,
    },
    priceLabel: {
        fontSize: 12,
        color: COLORS.text,
        marginBottom: 4,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    priceLabelLight: {
        fontSize: 14,
        color: COLORS.text, // Dark text on yellow background
        marginBottom: 4,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    priceValueSmall: {
        fontSize: 14,
        fontWeight: '800',
        color: COLORS.text,
    },
    priceValueLarge: {
        fontSize: 18,
        fontWeight: '900',
        color: COLORS.text,
    },
});
