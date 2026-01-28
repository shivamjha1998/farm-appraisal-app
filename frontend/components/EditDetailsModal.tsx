import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';

interface EditDetailsModalProps {
    visible: boolean;
    onClose: () => void;
    // Updated callback signature
    onSubmit: (make: string, model: string, type: string, year: string) => void;
    initialMake: string;
    initialModel: string;
    initialType: string;
    initialYear: string;
}

export const EditDetailsModal: React.FC<EditDetailsModalProps> = ({
    visible,
    onClose,
    onSubmit,
    initialMake,
    initialModel,
    initialType,
    initialYear
}) => {
    const [make, setMake] = useState(initialMake);
    const [model, setModel] = useState(initialModel);
    const [type, setType] = useState(initialType);
    const [year, setYear] = useState(initialYear);

    useEffect(() => {
        if (visible) {
            setMake(initialMake || '');
            setModel(initialModel || '');
            setType(initialType || '');
            setYear(initialYear || '');
        }
    }, [visible, initialMake, initialModel, initialType, initialYear]);

    const handleSubmit = () => {
        onSubmit(make, model, type, year);
        onClose();
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.centeredView}
            >
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>Edit Equipment Details</Text>

                    <ScrollView style={{ maxHeight: 400 }}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Make (Manufacturer)</Text>
                            <TextInput
                                style={styles.input}
                                value={make}
                                onChangeText={setMake}
                                placeholder="e.g. Kubota"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Model</Text>
                            <TextInput
                                style={styles.input}
                                value={model}
                                onChangeText={setModel}
                                placeholder="e.g. L2000"
                            />
                        </View>

                        <View style={styles.rowContainer}>
                            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                                <Text style={styles.label}>Type</Text>
                                <TextInput
                                    style={styles.input}
                                    value={type}
                                    onChangeText={setType}
                                    placeholder="e.g. Tractor"
                                />
                            </View>

                            <View style={[styles.inputGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Year</Text>
                                <TextInput
                                    style={styles.input}
                                    value={year}
                                    onChangeText={setYear}
                                    placeholder="e.g. 2015"
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>
                    </ScrollView>

                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={[styles.button, styles.buttonCancel]}
                            onPress={onClose}
                        >
                            <Text style={styles.textCancel}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.buttonSubmit]}
                            onPress={handleSubmit}
                        >
                            <Text style={styles.textSubmit}>Search</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        width: '85%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#333',
    },
    inputGroup: {
        marginBottom: 15,
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#F9F9F9',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    button: {
        flex: 1,
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    buttonCancel: {
        backgroundColor: '#f0f0f0',
    },
    buttonSubmit: {
        backgroundColor: '#2E7D32',
    },
    textCancel: {
        color: '#333',
        fontWeight: '600',
    },
    textSubmit: {
        color: 'white',
        fontWeight: 'bold',
    },
});