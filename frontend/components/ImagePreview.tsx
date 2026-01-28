import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { AnalysisResult } from '../types';

interface ImagePreviewProps {
    imageUri: string;
    onRetake: () => void;
    onAnalyze: () => void;
    loading: boolean;
    result: AnalysisResult | null;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
    imageUri,
    onRetake,
    onAnalyze,
    loading,
    result,
}) => {
    return (
        <View style={styles.previewSection}>
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
            {!result && !loading && (
                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.retryButton} onPress={onRetake}>
                        <Text style={styles.retryButtonText}>Retake</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.analyzeButton} onPress={onAnalyze}>
                        <Text style={styles.buttonText}>Analyze Now</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    previewSection: {
        alignItems: 'center',
    },
    previewImage: {
        width: '100%',
        height: 300,
        borderRadius: 15,
        marginBottom: 20,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 15,
    },
    retryButton: {
        paddingVertical: 14,
        paddingHorizontal: 20,
    },
    retryButtonText: {
        color: '#666',
        fontSize: 16,
    },
    analyzeButton: {
        backgroundColor: '#2E7D32',
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderRadius: 30,
        elevation: 5,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        marginLeft: 8,
        fontSize: 16,
    },
});
