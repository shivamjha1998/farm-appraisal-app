import AsyncStorage from '@react-native-async-storage/async-storage';
import { HistoryItem, AnalysisResult } from '../types';

const STORAGE_KEY = '@agrivalue_history';
const MAX_HISTORY_ITEMS = 50;

export const saveToHistory = async (imageUri: string, result: AnalysisResult): Promise<void> => {
    try {
        const newItem: HistoryItem = {
            id: Date.now().toString(),
            timestamp: Date.now(),
            imageUri,
            result,
        };

        const currentHistory = await getHistory();
        const updatedHistory = [newItem, ...currentHistory].slice(0, MAX_HISTORY_ITEMS);

        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
        console.error('Failed to save history:', error);
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

export const clearHistory = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error('Failed to clear history:', error);
    }
}
