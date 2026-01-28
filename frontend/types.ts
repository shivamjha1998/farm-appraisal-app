export interface MarketItem {
    title: string;
    price: number;
    currency: string;
    url: string;
    image_url: string | null;
    source: string;
}

export interface PriceStats {
    min: number;
    max: number;
    avg: number;
    median: number;
    currency: string;
}

export interface AnalysisResult {
    make: string;
    model: string;
    type: string;
    year_range: string;
    confidence: number;
    price_stats?: PriceStats;
    market_data?: MarketItem[];
}
