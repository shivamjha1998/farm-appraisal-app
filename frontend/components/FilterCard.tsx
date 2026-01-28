import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MultiSlider from '@ptomasroos/react-native-multi-slider';

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
                <Ionicons name="filter" size={20} color="#2E7D32" />
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
                            backgroundColor: '#2E7D32',
                        }}
                        unselectedStyle={{
                            backgroundColor: '#e0e0e0',
                        }}
                        containerStyle={{
                            height: 40,
                        }}
                        trackStyle={{
                            height: 4,
                        }}
                        markerStyle={{
                            backgroundColor: '#2E7D32',
                            height: 20,
                            width: 20,
                        }}
                    />
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
    filterContainer: {
        paddingVertical: 10,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    filterLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 5,
    },
});
