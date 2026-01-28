import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MarketItem } from '../types';

interface ListingsCardProps {
    items: MarketItem[];
}

export const ListingsCard: React.FC<ListingsCardProps> = ({ items }) => {
    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Ionicons name="list" size={20} color="#2E7D32" />
                <Text style={styles.cardTitle}>Recent Listings (Yahoo Japan)</Text>
            </View>
            {items
                .slice(0, 100) // Show more items now that we can filter
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
                            <View style={styles.sourceRow}>
                                <Ionicons name="open-outline" size={12} color="#999" />
                                <Text style={styles.listingSource}>View on Yahoo Auctions</Text>
                            </View>
                        </View>
                        <Text style={styles.listingPrice}>¥{item.price.toLocaleString()}</Text>
                    </TouchableOpacity>
                ))}
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
    listingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
    },
    listingTitle: {
        fontSize: 14,
        color: '#333',
        marginBottom: 2,
    },
    listingSource: {
        fontSize: 12,
        color: '#999',
    },
    sourceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    listingPrice: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#2E7D32',
    },
});
