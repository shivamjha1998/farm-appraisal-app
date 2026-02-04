import React from 'react';
import {
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Image
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { HistoryItem } from '../types';
import { COLORS, NEO_STYLE } from '../theme';

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
    const insets = useSafeAreaInsets();


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
                    Median: {item.result.price_stats?.median
                        ? `¥${item.result.price_stats.median.toLocaleString()}`
                        : 'N/A'}
                </Text>
                <Text style={styles.cardDate}>{formatDate(item.timestamp)}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.text} />
        </TouchableOpacity>
    );

    return (
        <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
            <SafeAreaProvider style={styles.container}>
                <View style={[styles.header, { paddingTop: insets.top + 15 }]}>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Ionicons name="close" size={28} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Scan History</Text>
                    <View style={{ width: 40 }} />
                </View>

                {history.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="time-outline" size={80} color={COLORS.secondary} />
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
            </SafeAreaProvider>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        backgroundColor: COLORS.surface,
        borderBottomWidth: 3,
        borderBottomColor: COLORS.border,
    },
    title: {
        fontSize: 20,
        fontWeight: '900',
        textTransform: 'uppercase',
        color: COLORS.text,
    },
    closeButton: {
        padding: 5,
    },
    listContent: {
        padding: 20,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        ...NEO_STYLE.container, // Border radius 8, border width 3, border color black
        padding: 10,
        marginBottom: 15,
        ...NEO_STYLE.shadow,
    },
    thumbnail: {
        width: 80,
        height: 80,
        borderRadius: 4,
        backgroundColor: '#eee',
        borderWidth: 2,
        borderColor: COLORS.border,
    },
    cardInfo: {
        flex: 1,
        marginLeft: 15,
        justifyContent: 'center',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '900',
        color: COLORS.text,
        textTransform: 'uppercase',
    },
    cardSubtitle: {
        fontSize: 14,
        color: COLORS.text,
        marginTop: 4,
        fontWeight: '500',
    },
    cardPrice: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: '800',
        marginTop: 4,
    },
    cardDate: {
        fontSize: 12,
        color: COLORS.text,
        opacity: 0.6,
        marginTop: 4,
        fontWeight: '700',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        marginTop: 20,
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.text,
    }
});
