import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MarketItem } from '../types';
import { COLORS, NEO_STYLE } from '../theme';

interface ListingsCardProps {
    items: MarketItem[];
}

export const ListingsCard: React.FC<ListingsCardProps> = ({ items }) => {
    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Ionicons name="list" size={24} color={COLORS.text} />
                <Text style={styles.cardTitle}>Recent Sales (Yahoo Japan)</Text>
            </View>
            {items
                .slice(0, 50)
                .map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.listingItem}
                        onPress={() => {
                            if (item.url) {
                                Linking.openURL(item.url).catch(err => Alert.alert("Error", "Could not open link"));
                            }
                        }}
                    >
                        <View style={{ flex: 1, paddingRight: 10 }}>
                            <Text numberOfLines={2} style={styles.listingTitle}>{item.title}</Text>

                            <View style={styles.metaRow}>
                                {item.date && (
                                    <View style={styles.dateContainer}>
                                        <Ionicons name="calendar-outline" size={12} color={COLORS.text} />
                                        <Text style={styles.dateText}>{item.date}</Text>
                                    </View>
                                )}

                                <View style={styles.sourceContainer}>
                                    <Ionicons name="open-outline" size={12} color={COLORS.primary} />
                                    <Text style={styles.listingSource}>View</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.priceColumn}>
                            <Text style={styles.listingPrice}>¥{item.price.toLocaleString()}</Text>
                            <Text style={styles.soldLabel}>Sold Price</Text>
                        </View>
                    </TouchableOpacity>
                ))}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        ...NEO_STYLE.container,
        ...NEO_STYLE.shadow,
        padding: 5, // Reduce padding as items have their own borders
        marginBottom: 15,
        backgroundColor: COLORS.surface,
        gap: 10,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        padding: 10,
        borderBottomWidth: 3,
        borderBottomColor: COLORS.border,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '900',
        marginLeft: 8,
        color: COLORS.text,
        textTransform: 'uppercase',
    },
    listingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        backgroundColor: COLORS.background, // Alternating background feeling
        borderWidth: 2,
        borderColor: COLORS.border,
        borderRadius: 6,
        marginBottom: 5,
        ...NEO_STYLE.shadowPressed, // Subtle shadow for items
    },
    listingTitle: {
        fontSize: 14,
        color: COLORS.text,
        marginBottom: 6,
        lineHeight: 20,
        fontWeight: '700',
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    dateText: {
        fontSize: 12,
        color: COLORS.text,
        marginLeft: 4,
        fontWeight: '500',
    },
    sourceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    listingSource: {
        fontSize: 12,
        color: COLORS.primary,
        marginLeft: 2,
        fontWeight: '700',
        textDecorationLine: 'underline',
    },
    priceColumn: {
        alignItems: 'flex-end',
        minWidth: 90,
    },
    listingPrice: {
        fontSize: 16,
        fontWeight: '900',
        color: COLORS.primary,
    },
    soldLabel: {
        fontSize: 10,
        color: COLORS.text,
        fontWeight: '600',
        marginTop: 2,
        textTransform: 'uppercase',
    }
});