import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { COLORS, NEO_STYLE } from '../theme';

interface FilterCardProps {
    min: number;
    max: number;
    currentMin: number;
    currentMax: number;
    onChange: (min: number, max: number) => void;
}

export const FilterCard: React.FC<FilterCardProps> = ({
    min,
    max,
    currentMin,
    currentMax,
    onChange,
}) => {
    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Ionicons name="filter" size={24} color={COLORS.text} />
                <Text style={styles.cardTitle}>Filter by Price</Text>
            </View>
            <View style={styles.filterContainer}>
                <View style={styles.row}>
                    <Text style={styles.filterLabel}>¥{currentMin.toLocaleString()}</Text>
                    <Text style={styles.filterLabel}>¥{currentMax.toLocaleString()}</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                    <MultiSlider
                        values={[currentMin, currentMax]}
                        min={min}
                        max={max}
                        step={1000}
                        sliderLength={280}
                        onValuesChange={(values) => {
                            onChange(values[0], values[1]);
                        }}
                        selectedStyle={{
                            backgroundColor: COLORS.primary, // Theme primary
                        }}
                        unselectedStyle={{
                            backgroundColor: '#e0e0e0',
                        }}
                        containerStyle={{
                            height: 40,
                        }}
                        trackStyle={{
                            height: 6, // Thicker track
                            backgroundColor: COLORS.border,
                            borderRadius: 0, // Square ends
                        }}
                        markerStyle={{
                            backgroundColor: COLORS.success,
                            height: 24,
                            width: 24,
                            borderWidth: 2,
                            borderColor: COLORS.border,
                            borderRadius: 0, // Square marker
                        }}
                    />
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
    filterContainer: {
        paddingVertical: 10,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    filterLabel: {
        fontSize: 16,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: 5,
        backgroundColor: COLORS.accent, // Highlighting labels
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderWidth: 2,
        borderColor: COLORS.border,
        overflow: 'hidden',
    },
});
