export interface ItemMapping {
    id: number;
    name: string;
    members: boolean;
    limit?: number;
    value?: number;
    highalch?: number;
    lowalch?: number;
    examine?: string;
    icon?: string;
}

export interface PriceData {
    high: number;
    highTime: number;
    low: number;
    lowTime: number;
}

export interface TimeSeriesData {
    avgHighPrice: number | null;
    highPriceVolume: number;
    avgLowPrice: number | null;
    lowPriceVolume: number;
    timestamp?: number;
}

// Simplified ProcessedItem - only contains raw API data
export interface ProcessedItem {
    // Core item data from mapping
    id: number;
    name: string;
    members: boolean;
    limit: number;
    highalch: number;

    // Latest price data
    low: number;
    lowTime: number;
    high: number;
    highTime: number;

    // Volume data
    volume: number; // 24h volume

    // 5m data
    avg5m: number;
    highVol5m: number;
    lowVol5m: number;

    // 1h data
    avg1h: number;
    highVol1h: number;
    lowVol1h: number;

    // 6h data
    avg6h: number;
    highVol6h: number;
    lowVol6h: number;

    // 24h data
    avg24h: number;
    highVol24h: number;
    lowVol24h: number;
}
