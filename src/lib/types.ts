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

export interface ProcessedItem {
    id: number;
    name: string;
    members: boolean;
    low: number;
    high: number;
    profit: number;
    roi: number;
    avg5m: number | string;
    avg1h: number | string;
    volume: number;
    limit: number | string;
    alchValue: number | null;
    alchMargin: number | null;
    total5mVol: number;
    buyPressure5m: number;
    sellPressure5m: number;
    total1hVol: number;
    buyPressure1h: number;
    sellPressure1h: number;
    volRatio: number;
}

export interface FilterState {
    f2pOnly: boolean;
    showAll: boolean;
    buyUnder5m: boolean;
    minVolume: number | null;
    minBuyPrice: number | null;
    maxBuyPrice: number | null;
    minSellPrice: number | null;
    maxSellPrice: number | null;
    minProfit: number | null;
    minRoi: number | null;
    limitFilter: number | null;
    searchQuery: string;
    min5mVol: number | null;
    minBuyPressure5m: number | null;
    minSellPressure5m: number | null;
    min1hVol: number | null;
    minBuyPressure1h: number | null;
    minSellPressure1h: number | null;
}
