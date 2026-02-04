import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { AnalysisResult } from '../types';
import { COLORS, NEO_STYLE } from '../theme';

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
        padding: 5,
    },
    previewImage: {
        width: '100%',
        height: 300,
        borderRadius: 12,
        marginBottom: 20,
        borderWidth: 3,
        borderColor: COLORS.border,
        ...NEO_STYLE.shadow,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 15,
        width: '100%',
    },
    retryButton: {
        paddingVertical: 14,
        paddingHorizontal: 20,
        backgroundColor: COLORS.surface,
        borderWidth: 3,
        borderColor: COLORS.border,
        borderRadius: 8,
        ...NEO_STYLE.shadow,
        flex: 1,
        alignItems: 'center',
    },
    retryButtonText: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    analyzeButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 8,
        borderWidth: 3,
        borderColor: COLORS.border,
        ...NEO_STYLE.shadow,
        flex: 1,
        alignItems: 'center',
    },
    buttonText: {
        color: COLORS.text,
        fontWeight: '900',
        fontSize: 16,
        textTransform: 'uppercase',
    },
});
