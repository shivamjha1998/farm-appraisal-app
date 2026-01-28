import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PriceStats } from '../types';

interface MarketValueCardProps {
    stats: PriceStats;
}

export const MarketValueCard: React.FC<MarketValueCardProps> = ({ stats }) => {
    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Ionicons name="stats-chart" size={20} color="#2E7D32" />
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
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        paddingBottom: 8,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
        color: '#333',
    },
    priceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 5,
    },
    priceBox: {
        alignItems: 'center',
    },
    priceBoxHighlighted: {
        alignItems: 'center',
        backgroundColor: '#2E7D32',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
    priceLabel: {
        fontSize: 12,
        color: '#888',
        marginBottom: 2,
    },
    priceLabelLight: {
        fontSize: 12,
        color: '#E8F5E9',
        marginBottom: 2,
    },
    priceValueSmall: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    priceValueLarge: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
});
