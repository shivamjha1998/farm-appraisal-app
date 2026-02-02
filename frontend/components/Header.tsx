import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HeaderProps {
    onHistoryPress: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onHistoryPress }) => {
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.header, { paddingTop: insets.top + 15 }]}>
            <View style={{ width: 40 }} />

            <View style={styles.titleContainer}>
                <Ionicons name="leaf" size={24} color="#2E7D32" />
                <Text style={styles.headerTitle}>AgriValue</Text>
            </View>

            <TouchableOpacity onPress={onHistoryPress} style={styles.historyButton}>
                <Ionicons name="time-outline" size={24} color="#333" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        paddingHorizontal: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        elevation: 2,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 8,
        color: '#333',
    },
    historyButton: {
        width: 40,
        alignItems: 'flex-end',
    }
});