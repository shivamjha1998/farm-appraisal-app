import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, NEO_STYLE } from '../theme';

interface PlaceholderViewProps {
    onPickImage: () => void;
    onTakePhoto: () => void;
}

export const PlaceholderView: React.FC<PlaceholderViewProps> = ({ onPickImage, onTakePhoto }) => {
    return (
        <View style={styles.placeholderContainer}>
            <View style={styles.iconContainer}>
                <Ionicons name="scan-outline" size={100} color={COLORS.text} />
            </View>
            <Text style={styles.headline}>Appraise Your Farm Equipment</Text>
            <Text style={styles.subtext}>Scan now to get instant market value estimation.</Text>

            <View style={styles.buttonStack}>
                <TouchableOpacity style={[styles.actionButton, styles.cameraButton]} onPress={onTakePhoto}>
                    <Ionicons name="camera" size={28} color="#000" />
                    <Text style={styles.buttonText}>TAKE PHOTO</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionButton, styles.galleryButton]} onPress={onPickImage}>
                    <Ionicons name="images" size={28} color="#000" />
                    <Text style={styles.buttonText}>UPLOAD FROM GALLERY</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    placeholderContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40,
        padding: 20,
    },
    iconContainer: {
        marginBottom: 20,
        backgroundColor: COLORS.accent,
        padding: 20,
        borderRadius: 100,
        borderWidth: 3,
        borderColor: COLORS.border,
        ...NEO_STYLE.shadow,
    },
    headline: {
        fontSize: 28,
        fontWeight: '900',
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: 10,
        textTransform: 'uppercase',
    },
    subtext: {
        fontSize: 16,
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: 40,
        fontWeight: '500',
        maxWidth: 280,
    },
    buttonStack: {
        width: '100%',
        gap: 20,
    },
    actionButton: {
        flexDirection: 'row',
        paddingVertical: 18,
        paddingHorizontal: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: COLORS.border,
        ...NEO_STYLE.shadow,
    },
    cameraButton: {
        backgroundColor: COLORS.primary,
    },
    galleryButton: {
        backgroundColor: COLORS.surface,
    },
    buttonText: {
        color: COLORS.text,
        fontWeight: '800',
        marginLeft: 12,
        fontSize: 18,
        letterSpacing: 1,
    },
});
