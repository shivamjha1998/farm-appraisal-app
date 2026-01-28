import React from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Image,
    SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HistoryItem } from '../types';

interface HistoryModalProps {
    visible: boolean;
    onClose: () => void;
    history: HistoryItem[];
    onSelectHistoryItem: (item: HistoryItem) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
    visible,
    onClose,
    history,
    onSelectHistoryItem
}) => {

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString(undefined, {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const renderItem = ({ item }: { item: HistoryItem }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => {
                onSelectHistoryItem(item);
                onClose();
            }}
        >
            <Image source={{ uri: item.imageUri }} style={styles.thumbnail} />
            <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>
                    {item.result.make} {item.result.model}
                </Text>
                <Text style={styles.cardSubtitle}>
                    {item.result.year_range} • {item.result.type}
                </Text>
                <Text style={styles.cardPrice}>
                    Avg: {item.result.price_stats?.avg
                        ? `¥${item.result.price_stats.avg.toLocaleString()}`
                        : 'N/A'}
                </Text>
                <Text style={styles.cardDate}>{formatDate(item.timestamp)}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
    );

    return (
        <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Scan History</Text>
                    <View style={{ width: 24 }} />
                </View>

                {history.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="time-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>No history yet</Text>
                    </View>
                ) : (
                    <FlatList
                        data={history}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.listContent}
                    />
                )}
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 5,
    },
    listContent: {
        padding: 15,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 10,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    thumbnail: {
        width: 70,
        height: 70,
        borderRadius: 8,
        backgroundColor: '#eee',
    },
    cardInfo: {
        flex: 1,
        marginLeft: 15,
        justifyContent: 'center',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    cardSubtitle: {
        fontSize: 13,
        color: '#666',
        marginTop: 2,
    },
    cardPrice: {
        fontSize: 14,
        color: '#2E7D32',
        fontWeight: '600',
        marginTop: 4,
    },
    cardDate: {
        fontSize: 12,
        color: '#999',
        marginTop: 4,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        marginTop: 15,
        fontSize: 16,
        color: '#999',
    }
});
