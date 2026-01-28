import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PlaceholderViewProps {
    onPickImage: () => void;
    onTakePhoto: () => void;
}

export const PlaceholderView: React.FC<PlaceholderViewProps> = ({ onPickImage, onTakePhoto }) => {
    return (
        <View style={styles.placeholderContainer}>
            <Ionicons name="camera-outline" size={80} color="#ccc" />
            <Text style={styles.placeholderText}>Scan equipment to get an instant appraisal.</Text>

            <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.actionButton} onPress={onPickImage}>
                    <Ionicons name="images" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Gallery</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButtonPrimary} onPress={onTakePhoto}>
                    <Ionicons name="camera" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Camera</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    placeholderContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
    },
    placeholderText: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 40,
        paddingHorizontal: 20,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 15,
    },
    actionButton: {
        flexDirection: 'row',
        backgroundColor: '#555',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 25,
        alignItems: 'center',
    },
    actionButtonPrimary: {
        flexDirection: 'row',
        backgroundColor: '#2E7D32',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 25,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        marginLeft: 8,
        fontSize: 16,
    },
});
