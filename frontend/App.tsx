// frontend/App.tsx
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, ScrollView, Alert, Platform, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useState, useEffect } from 'react';
import axios from 'axios';

import { API_URL } from './constants';
import { MarketItem, AnalysisResult, HistoryItem } from './types';
import { Header } from './components/Header';
import { PlaceholderView } from './components/PlaceholderView';
import { ImagePreview } from './components/ImagePreview';
import { IdentificationCard } from './components/IdentificationCard';
import { MarketValueCard } from './components/MarketValueCard';
import { FilterCard } from './components/FilterCard';
import { ListingsCard } from './components/ListingsCard';
import { saveToHistory, getHistory } from './services/storage';
import { HistoryModal } from './components/HistoryModal';

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  // Filtering States
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(10000000);
  const [currentMaxPrice, setCurrentMaxPrice] = useState<number>(10000000);
  const [currentMinPrice, setCurrentMinPrice] = useState<number>(0);

  // History States
  const [historyModalVisible, setHistoryModalVisible] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load history on startup
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const data = await getHistory();
    setHistory(data);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setResult(null);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required to take photos.');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setResult(null);
    }
  };

  const analyzeImage = async () => {
    if (!image) return;

    setLoading(true);
    setResult(null);

    const formData = new FormData();
    // @ts-ignore
    formData.append('file', {
      uri: image,
      name: 'photo.jpg',
      type: 'image/jpeg',
    });

    try {
      const response = await axios.post<AnalysisResult>(`${API_URL}/analyze`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const data = response.data;
      setResult(data);

      await saveToHistory(image, data);
      loadHistory();

      if (data.market_data && data.market_data.length > 0) {
        const prices = data.market_data.map(item => item.price);
        const maxP = Math.max(...prices);
        const minP = Math.min(...prices);

        const sliderMax = Math.ceil(maxP / 10000) * 10000;
        setMaxPriceFilter(sliderMax);
        setCurrentMaxPrice(maxP);
        setCurrentMinPrice(minP);
      }

    } catch (error: any) {
      console.error('Error:', error);
      let errorMsg = 'Failed to analyze image.';
      if (error.response) {
        errorMsg = error.response.status === 503
          ? "Service Unavailable (Check API Key)"
          : `Server Error: ${error.response.status}`;
      } else if (error.request) {
        errorMsg = "Network Error. Is the backend running?";
      }
      Alert.alert('Error', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleHistorySelection = (item: HistoryItem) => {
    setImage(item.imageUri);
    setResult(item.result);

    if (item.result.market_data && item.result.market_data.length > 0) {
      const prices = item.result.market_data.map(i => i.price);
      const maxP = Math.max(...prices);
      const minP = Math.min(...prices);
      const sliderMax = Math.ceil(maxP / 10000) * 10000;

      setMaxPriceFilter(sliderMax);
      setCurrentMaxPrice(maxP);
      setCurrentMinPrice(minP);
    }
  };

  const getFilteredItems = () => {
    if (!result || !result.market_data) return [];
    return result.market_data.filter(
      item => item.price >= currentMinPrice && item.price <= currentMaxPrice
    );
  };

  const calculateStats = (items: MarketItem[]) => {
    if (!items || items.length === 0) return null;
    const prices = items.map(i => i.price).sort((a, b) => a - b);
    const min = prices[0];
    const max = prices[prices.length - 1];
    const sum = prices.reduce((a, b) => a + b, 0);
    const avg = sum / prices.length;
    const mid = Math.floor(prices.length / 2);
    const median = prices.length % 2 !== 0 ? prices[mid] : (prices[mid - 1] + prices[mid]) / 2;

    return { min, max, avg, median, currency: 'JPY' };
  };

  const filteredItems = getFilteredItems();
  const dynamicStats = calculateStats(filteredItems);

  return (
    <SafeAreaView style={styles.container}>
      <Header onHistoryPress={() => setHistoryModalVisible(true)} />

      <HistoryModal
        visible={historyModalVisible}
        onClose={() => setHistoryModalVisible(false)}
        history={history}
        onSelectHistoryItem={handleHistorySelection}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {!image ? (
          <PlaceholderView onPickImage={pickImage} onTakePhoto={takePhoto} />
        ) : (
          <ImagePreview
            imageUri={image}
            onRetake={() => setImage(null)}
            onAnalyze={analyzeImage}
            loading={loading}
            result={result}
          />
        )}

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2E7D32" />
            <Text style={styles.loadingText}>Identifying Equipment...</Text>
          </View>
        )}

        {result && (
          <View style={styles.resultContainer}>
            <IdentificationCard result={result} />

            {dynamicStats && <MarketValueCard stats={dynamicStats} />}

            {result.market_data && result.market_data.length > 0 && (
              <FilterCard
                min={0}
                max={maxPriceFilter}
                currentMin={currentMinPrice}
                currentMax={currentMaxPrice}
                onChange={(min, max) => {
                  setCurrentMinPrice(min);
                  setCurrentMaxPrice(max);
                }}
              />
            )}

            {result.market_data && result.market_data.length > 0 && (
              <ListingsCard items={filteredItems} />
            )}

            <TouchableOpacity style={styles.resetButton} onPress={() => { setImage(null); setResult(null); }}>
              <Text style={styles.resetButtonText}>Scan Another</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#2E7D32',
    fontSize: 16,
  },
  resultContainer: {
    marginTop: 10,
  },
  resetButton: {
    alignItems: 'center',
    padding: 15,
    marginTop: 10,
  },
  resetButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});