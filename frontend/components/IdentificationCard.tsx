import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AnalysisResult } from '../types';

interface IdentificationCardProps {
    result: AnalysisResult;
    onEdit?: () => void; // Optional prop
}

export const IdentificationCard: React.FC<IdentificationCardProps> = ({ result, onEdit }) => {
    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.headerLeft}>
                    <MaterialCommunityIcons name="tractor" size={20} color="#2E7D32" />
                    <Text style={styles.cardTitle}>Identification</Text>
                </View>

                {onEdit && (
                    <TouchableOpacity onPress={onEdit} style={styles.editButton}>
                        <MaterialCommunityIcons name="pencil" size={16} color="#2E7D32" />
                        <Text style={styles.editText}>Edit</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.cardContent}>
                <View style={styles.row}>
                    <Text style={styles.label}>Make:</Text>
                    <Text style={styles.value}>{result.make_ja || result.make}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Model:</Text>
                    <Text style={styles.value}>{result.model}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Type:</Text>
                    <Text style={styles.value}>{result.type_ja || result.type}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Year:</Text>
                    <Text style={styles.value}>{result.year_range}</Text>
                </View>

                {/* Only show confidence if it's not a manual correction (100%) */}
                {result.confidence !== 1.1 && (
                    <View style={styles.confidenceBadge}>
                        <Text style={styles.confidenceText}>
                            {Math.round(result.confidence * 100)}% Match
                        </Text>
                    </View>
                )}
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
        justifyContent: 'space-between', // Push Edit button to right
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        paddingBottom: 8,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
        color: '#333',
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F8E9',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 15,
    },
    editText: {
        color: '#2E7D32',
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
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