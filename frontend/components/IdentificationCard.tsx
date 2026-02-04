import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AnalysisResult } from '../types';
import { COLORS, NEO_STYLE } from '../theme';

interface IdentificationCardProps {
    result: AnalysisResult;
    onEdit?: () => void; // Optional prop
}

export const IdentificationCard: React.FC<IdentificationCardProps> = ({ result, onEdit }) => {
    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.headerLeft}>
                    <MaterialCommunityIcons name="tractor" size={24} color={COLORS.text} />
                    <Text style={styles.cardTitle}>Identification</Text>
                </View>

                {onEdit && (
                    <TouchableOpacity onPress={onEdit} style={styles.editButton}>
                        <MaterialCommunityIcons name="pencil" size={16} color={COLORS.text} />
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
        ...NEO_STYLE.container,
        ...NEO_STYLE.shadow,
        padding: 15,
        marginBottom: 15,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
        borderBottomWidth: 3,
        borderBottomColor: COLORS.border,
        paddingBottom: 8,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '900',
        marginLeft: 8,
        color: COLORS.text,
        textTransform: 'uppercase',
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.accent,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: COLORS.border,
    },
    editText: {
        color: COLORS.text,
        fontSize: 12,
        fontWeight: '700',
        marginLeft: 4,
        textTransform: 'uppercase',
    },
    cardContent: {
        gap: 8,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    label: {
        color: COLORS.text,
        fontSize: 15,
        fontWeight: '600',
    },
    value: {
        fontWeight: '800',
        color: COLORS.text,
        fontSize: 16,
    },
    confidenceBadge: {
        alignSelf: 'flex-start',
        backgroundColor: COLORS.success,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        marginTop: 5,
        borderWidth: 2,
        borderColor: COLORS.border,
    },
    confidenceText: {
        color: COLORS.surface,
        fontSize: 12,
        fontWeight: 'bold',
    },
});