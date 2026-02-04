import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, ScrollView, Alert, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useState, useEffect } from 'react';
import axios from 'axios';

import { COLORS, NEO_STYLE } from './theme';
import { API_URL } from './constants';
import { MarketItem, AnalysisResult, HistoryItem } from './types';
import { Header } from './components/Header';
import { PlaceholderView } from './components/PlaceholderView';
import { ImagePreview } from './components/ImagePreview';
import { IdentificationCard } from './components/IdentificationCard';
import { MarketValueCard } from './components/MarketValueCard';
import { FilterCard } from './components/FilterCard';
import { ListingsCard } from './components/ListingsCard';
import { saveToHistory, getHistory, updateHistoryItem } from './services/storage';
import { HistoryModal } from './components/HistoryModal';
import { EditDetailsModal } from './components/EditDetailsModal';

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);

  // Filtering States
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(10000000);
  const [currentMaxPrice, setCurrentMaxPrice] = useState<number>(10000000);
  const [currentMinPrice, setCurrentMinPrice] = useState<number>(0);

  // History States
  const [historyModalVisible, setHistoryModalVisible] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentHistoryId, setCurrentHistoryId] = useState<string | null>(null);

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
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setResult(null);
      setCurrentHistoryId(null);
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
      setCurrentHistoryId(null);
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
      const response = await axios.post<AnalysisResult>(`${API_URL}/api/analyze-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const data = response.data;
      setResult(data);

      const newId = await saveToHistory(image, data);
      setCurrentHistoryId(newId);
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
    setCurrentHistoryId(item.id);

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

  const handleManualSearch = async (make: string, model: string, type: string, year: string) => {
    setLoading(true);
    try {
      const response = await axios.get<AnalysisResult>(`${API_URL}/api/search-prices`, {
        params: {
          make,
          model,
          type,
          year
        }
      });

      const data = response.data;
      setResult(data);

      if (currentHistoryId) {
        await updateHistoryItem(currentHistoryId, data);
        loadHistory();
      }

      // Update Filter logic as usual
      if (data.market_data && data.market_data.length > 0) {
        const prices = data.market_data.map(item => item.price);
        const maxP = Math.max(...prices);
        const minP = Math.min(...prices);
        const sliderMax = Math.ceil(maxP / 10000) * 10000;
        setMaxPriceFilter(sliderMax);
        setCurrentMaxPrice(maxP);
        setCurrentMinPrice(minP);
      } else {
        Alert.alert("No Results", "Could not find listings for this model.");
      }

    } catch (error: any) {
      console.error('Search Error:', error);
      Alert.alert('Error', 'Failed to search for equipment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaProvider style={styles.container}>
      <Header onHistoryPress={() => setHistoryModalVisible(true)} />

      <HistoryModal
        visible={historyModalVisible}
        onClose={() => setHistoryModalVisible(false)}
        history={history}
        onSelectHistoryItem={handleHistorySelection}
      />

      <EditDetailsModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        onSubmit={handleManualSearch}
        initialMake={result?.make_ja || result?.make || ''}
        initialModel={result?.model || ''}
        initialType={result?.type_ja || result?.type || ''}
        initialYear={result?.year_range || ''}
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
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Identifying Equipment...</Text>
          </View>
        )}

        {result && (
          <View style={styles.resultContainer}>
            <IdentificationCard result={result} onEdit={() => setEditModalVisible(true)} />

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
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    // paddingTop handled by Header + SafeArea
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
    marginTop: 15,
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  resultContainer: {
    marginTop: 10,
    gap: 20,
  },
  resetButton: {
    alignItems: 'center',
    padding: 16,
    marginTop: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 8,
    ...NEO_STYLE.shadow,
  },
  resetButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
});