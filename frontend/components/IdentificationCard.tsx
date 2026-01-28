import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AnalysisResult } from '../types';

interface IdentificationCardProps {
    result: AnalysisResult;
}

export const IdentificationCard: React.FC<IdentificationCardProps> = ({ result }) => {
    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <MaterialCommunityIcons name="tractor" size={20} color="#2E7D32" />
                <Text style={styles.cardTitle}>Identification</Text>
            </View>
            <View style={styles.cardContent}>
                <View style={styles.row}>
                    <Text style={styles.label}>Make:</Text>
                    <Text style={styles.value}>{result.make}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Model:</Text>
                    <Text style={styles.value}>{result.model}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Type:</Text>
                    <Text style={styles.value}>{result.type}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Year:</Text>
                    <Text style={styles.value}>{result.year_range}</Text>
                </View>
                <View style={styles.confidenceBadge}>
                    <Text style={styles.confidenceText}>
                        {Math.round(result.confidence * 100)}% Match
                    </Text>
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
    cardContent: {
        gap: 8,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    label: {
        color: '#666',
        fontSize: 15,
    },
    value: {
        fontWeight: '600',
        color: '#333',
        fontSize: 15,
    },
    confidenceBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginTop: 5,
    },
    confidenceText: {
        color: '#2E7D32',
        fontSize: 12,
        fontWeight: 'bold',
    },
});
