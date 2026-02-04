import AsyncStorage from '@react-native-async-storage/async-storage';
import { Directory, File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';
import { HistoryItem, AnalysisResult } from '../types';

const STORAGE_KEY = '@agrivalue_history';
const MAX_HISTORY_ITEMS = 50;

// 1. Use Directory object instead of a raw string
const historyDir = new Directory(Paths.document, 'history');

const ensureDirExists = async () => {
    if (Platform.OS === 'web') return;
    if (!historyDir.exists) {
        historyDir.create();
    }
};

// Returns Promise<string> (the ID of the saved item)
export const saveToHistory = async (imageUri: string, result: AnalysisResult): Promise<string> => {
    try {
        let savedImageUri = imageUri;

        if (Platform.OS !== 'web' && imageUri) {
            await ensureDirExists();

            const filename = `scan_${Date.now()}.jpg`;
            const destinationFile = new File(historyDir, filename);
            const sourceFile = new File(imageUri);

            // Only copy if source isn't already in history
            if (sourceFile.uri !== destinationFile.uri) {
                sourceFile.copy(destinationFile);
            }

            savedImageUri = destinationFile.uri;
        }

        const newId = Date.now().toString(); // Generate ID here to return it
        const newItem: HistoryItem = {
            id: newId,
            timestamp: Date.now(),
            imageUri: savedImageUri,
            result,
        };

        const currentHistory = await getHistory();
        const updatedHistory = [newItem, ...currentHistory].slice(0, MAX_HISTORY_ITEMS);

        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));

        return newId; // Return the ID
    } catch (error) {
        console.error('Failed to save history:', error);
        return "";
    }
};

export const getHistory = async (): Promise<HistoryItem[]> => {
    try {
        const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
        return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (error) {
        console.error('Failed to load history:', error);
        return [];
    }
};

// Updates a specific history item
export const updateHistoryItem = async (id: string, newResult: AnalysisResult): Promise<void> => {
    try {
        const currentHistory = await getHistory();
        const index = currentHistory.findIndex(item => item.id === id);

        if (index !== -1) {
            // Update the result
            currentHistory[index].result = newResult;
            // Save back to storage
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(currentHistory));
        }
    } catch (error) {
        console.error('Failed to update history item:', error);
    }
};

export const clearHistory = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(STORAGE_KEY);

        if (Platform.OS !== 'web') {
            if (historyDir.exists) {
                historyDir.delete();
            }
        }
    } catch (error) {
        console.error('Failed to clear history:', error);
    }
};