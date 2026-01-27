import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, Image, ActivityIndicator, ScrollView, Alert, Platform, SafeAreaView, Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import axios from 'axios';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import MultiSlider from '@ptomasroos/react-native-multi-slider';



// Replace with your computer's IP if running on Android device/emulator (e.g., http://192.168.1.5:8000)
// For iOS Simulator, localhost usually works.
// Using detected local IP for physical device connectivity
const API_URL = 'http://192.168.123.3:8000';

interface MarketItem {
  title: string;
  price: number;
  currency: string;
  url: string;
  image_url: string | null;
  source: string;
}

interface PriceStats {
  min: number;
  max: number;
  avg: number;
  median: number;
  currency: string;
}

interface AnalysisResult {
  make: string;
  model: string;
  type: string;
  year_range: string;
  confidence: number;
  price_stats?: PriceStats;
  market_data?: MarketItem[];
}

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(10000000); // Default high
  const [currentMaxPrice, setCurrentMaxPrice] = useState<number>(10000000); // For slider UI
  const [currentMinPrice, setCurrentMinPrice] = useState<number>(0); // Min Price Slider



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

      // Initialize slider with max price found
      if (data.market_data && data.market_data.length > 0) {
        const prices = data.market_data.map(item => item.price);
        const maxP = Math.max(...prices);
        const minP = Math.min(...prices);

        // Set slider range max slightly higher than max price for headroom
        const sliderMax = Math.ceil(maxP / 10000) * 10000;
        setMaxPriceFilter(sliderMax);

        // Initialize knobs to existing data bounds
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

    // Median
    const mid = Math.floor(prices.length / 2);
    const median = prices.length % 2 !== 0 ? prices[mid] : (prices[mid - 1] + prices[mid]) / 2;

    return { min, max, avg, median, currency: 'JPY' };
  };

  const filteredItems = getFilteredItems();
  const dynamicStats = calculateStats(filteredItems);

  return (

    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="leaf" size={24} color="#2E7D32" />
        <Text style={styles.headerTitle}>AgriValue</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {!image ? (
          <View style={styles.placeholderContainer}>
            <Ionicons name="camera-outline" size={80} color="#ccc" />
            <Text style={styles.placeholderText}>Scan equipment to get an instant appraisal.</Text>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.actionButton} onPress={pickImage}>
                <Ionicons name="images" size={20} color="#fff" />
                <Text style={styles.buttonText}>Gallery</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButtonPrimary} onPress={takePhoto}>
                <Ionicons name="camera" size={20} color="#fff" />
                <Text style={styles.buttonText}>Camera</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.previewSection}>
            <Image source={{ uri: image }} style={styles.previewImage} />
            {!result && !loading && (
              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.retryButton} onPress={() => setImage(null)}>
                  <Text style={styles.retryButtonText}>Retake</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.analyzeButton} onPress={analyzeImage}>
                  <Text style={styles.buttonText}>Analyze Now</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2E7D32" />
            <Text style={styles.loadingText}>Identifying Equipment...</Text>
          </View>
        )}

        {result && (
          <View style={styles.resultContainer}>
            {/* ID Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons name="tractor" size={20} color="#2E7D32" />
                <Text style={styles.cardTitle}>Identification</Text>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.row}>
                  <Text style={styles.label}>Make:</Text>
                  <Text style={styles.value}>{result.make}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Model:</Text>
                  <Text style={styles.value}>{result.model}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Type:</Text>
                  <Text style={styles.value}>{result.type}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Year:</Text>
                  <Text style={styles.value}>{result.year_range}</Text>
                </View>
                <View style={styles.confidenceBadge}>
                  <Text style={styles.confidenceText}>
                    {Math.round(result.confidence * 100)}% Match
                  </Text>
                </View>
              </View>
            </View>

            {/* Market Value Card */}
            {dynamicStats && (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Ionicons name="stats-chart" size={20} color="#2E7D32" />
                  <Text style={styles.cardTitle}>Market Estimate (Filtered)</Text>
                </View>
                <View style={styles.priceContainer}>
                  <View style={styles.priceBox}>
                    <Text style={styles.priceLabel}>Min</Text>
                    <Text style={styles.priceValueSmall}>¥{dynamicStats.min.toLocaleString()}</Text>
                  </View>
                  <View style={styles.priceBoxHighlighted}>
                    <Text style={styles.priceLabelLight}>Median</Text>
                    <Text style={styles.priceValueLarge}>¥{Math.round(dynamicStats.median).toLocaleString()}</Text>
                  </View>
                  <View style={styles.priceBox}>
                    <Text style={styles.priceLabel}>Max</Text>
                    <Text style={styles.priceValueSmall}>¥{dynamicStats.max.toLocaleString()}</Text>
                  </View>
                </View>
              </View>
            )}


            {/* Listings Card */}
            {result.market_data && result.market_data.length > 0 && (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Ionicons name="filter" size={20} color="#2E7D32" />
                  <Text style={styles.cardTitle}>Filter by Price</Text>
                </View>
                <View style={styles.filterContainer}>
                  <View style={styles.row}>
                    <Text style={styles.filterLabel}>¥{currentMinPrice.toLocaleString()}</Text>
                    <Text style={styles.filterLabel}>¥{currentMaxPrice.toLocaleString()}</Text>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <MultiSlider
                      values={[currentMinPrice, currentMaxPrice]}
                      min={0}
                      max={maxPriceFilter}
                      step={1000}
                      sliderLength={280}
                      onValuesChange={(values) => {
                        setCurrentMinPrice(values[0]);
                        setCurrentMaxPrice(values[1]);
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
            )}

            {/* Listings Card */}
            {result.market_data && result.market_data.length > 0 && (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Ionicons name="list" size={20} color="#2E7D32" />
                  <Text style={styles.cardTitle}>Recent Listings (Yahoo Japan)</Text>
                </View>
                {filteredItems
                  .slice(0, 100) // Show more items now that we can filter
                  .map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.listingItem}
                      onPress={() => {
                        if (item.url) {
                          Linking.openURL(item.url).catch(err => Alert.alert("Error", "Could not open link"));
                        }
                      }}
                    >
                      <View style={{ flex: 1, paddingRight: 10 }}>
                        <Text numberOfLines={2} style={styles.listingTitle}>{item.title}</Text>
                        <View style={styles.sourceRow}>
                          <Ionicons name="open-outline" size={12} color="#999" />
                          <Text style={styles.listingSource}>View on Yahoo Auctions</Text>
                        </View>
                      </View>
                      <Text style={styles.listingPrice}>¥{item.price.toLocaleString()}</Text>
                    </TouchableOpacity>
                  ))}
              </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#333',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
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
  previewSection: {
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: 300,
    borderRadius: 15,
    marginBottom: 20,
  },
  analyzeButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    elevation: 5,
  },
  retryButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  retryButtonText: {
    color: '#666',
    fontSize: 16,
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
  cardContent: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: '#666',
    fontSize: 15,
  },
  value: {
    fontWeight: '600',
    color: '#333',
    fontSize: 15,
  },
  confidenceBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 5,
  },
  confidenceText: {
    color: '#2E7D32',
    fontSize: 12,
    fontWeight: 'bold',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  priceBox: {
    alignItems: 'center',
  },
  priceBoxHighlighted: {
    alignItems: 'center',
    backgroundColor: '#2E7D32',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  priceLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  priceLabelLight: {
    fontSize: 12,
    color: '#E8F5E9',
    marginBottom: 2,
  },
  priceValueSmall: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  priceValueLarge: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  listingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  listingTitle: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  listingSource: {
    fontSize: 12,
    color: '#999',
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  listingPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2E7D32',
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
  filterContainer: {
    paddingVertical: 10,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },

});
