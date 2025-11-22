import { ItemMapping, ProcessedItem, PriceData, TimeSeriesData } from "./types";

const API_BASE = "https://prices.runescape.wiki/api/v1/osrs";
const API_LATEST = `${API_BASE}/latest`;
const API_5M = `${API_BASE}/5m`;
const API_1H = `${API_BASE}/1h`;
const API_MAPPING = `${API_BASE}/mapping`;
const API_VOLUMES = `${API_BASE}/volumes`;
const API_TIMESERIES = `${API_BASE}/timeseries`;

export async function fetchItemData(id: number): Promise<{ mapping: ItemMapping; price: PriceData; volume: number } | null> {
    try {
        const [mappingRes, latestRes, volumesRes] = await Promise.all([
            fetch(API_MAPPING, { next: { revalidate: 3600 } }),
            fetch(`${API_LATEST}?id=${id}`, { next: { revalidate: 60 } }),
            fetch(API_VOLUMES, { next: { revalidate: 3600 } }),
        ]);

        const mapping = (await mappingRes.json()) as ItemMapping[];
        const latest = (await latestRes.json()).data as Record<string, PriceData>;
        const volumes = (await volumesRes.json()).data as Record<string, number>;

        const itemMapping = mapping.find((i) => i.id === id);
        const itemPrice = latest[id];
        const itemVolume = volumes[id];

        if (!itemMapping) return null;

        return {
            mapping: itemMapping,
            price: itemPrice || { high: 0, highTime: 0, low: 0, lowTime: 0 },
            volume: itemVolume || 0,
        };
    } catch (err) {
        console.error("Error fetching item data:", err);
        return null;
    }
}

export async function fetchTimeSeries(id: number, timestep: string): Promise<TimeSeriesData[]> {
    try {
        const res = await fetch(`${API_TIMESERIES}?timestep=${timestep}&id=${id}`, {
            next: { revalidate: 300 },
        });
        const json = await res.json();
        return json.data || [];
    } catch (err) {
        console.error("Error fetching time series:", err);
        return [];
    }
}

export async function fetchFlippingData(): Promise<ProcessedItem[]> {
    try {
        const [latestRes, mappingRes, fiveMRes, oneHRes, volumesRes] = await Promise.all([
            fetch(API_LATEST, { next: { revalidate: 60 } }),
            fetch(API_MAPPING, { next: { revalidate: 3600 } }),
            fetch(API_5M, { next: { revalidate: 300 } }),
            fetch(API_1H, { next: { revalidate: 300 } }),
            fetch(API_VOLUMES, { next: { revalidate: 3600 } }),
        ]);

        const latest = (await latestRes.json()).data as Record<string, PriceData>;
        const mapping = (await mappingRes.json()) as ItemMapping[];
        const fiveM = (await fiveMRes.json()).data as Record<string, TimeSeriesData>;
        const oneH = (await oneHRes.json()).data as Record<string, TimeSeriesData>;
        const volumes = (await volumesRes.json()).data as Record<string, number>;

        const results: ProcessedItem[] = [];

        for (const item of mapping) {
            const id = item.id;
            const price = latest[id];
            const volume = volumes[id];
            const limit = item.limit;

            if (!price || !price.high || !price.low || !volume) continue;

            const low = price.low;
            const high = price.high;

            const highAfterFee = high * 0.98; // 2% sell tax
            const netProfit = highAfterFee - low;
            const roi = (netProfit / low) * 100;

            // 5m Data
            const item5m = fiveM[id];
            const avg5m = item5m?.avgHighPrice || "-";
            const highVol5m = item5m?.highPriceVolume || 0;
            const lowVol5m = item5m?.lowPriceVolume || 0;
            const total5mVol = highVol5m + lowVol5m;
            const buyPressure5m = total5mVol > 0 ? (highVol5m / total5mVol) * 100 : 0;
            const sellPressure5m = total5mVol > 0 ? (lowVol5m / total5mVol) * 100 : 0;

            // 1h Data
            const item1h = oneH[id];
            const avg1h = item1h?.avgHighPrice || "-";
            const highVol1h = item1h?.highPriceVolume || 0;
            const lowVol1h = item1h?.lowPriceVolume || 0;
            const total1hVol = highVol1h + lowVol1h;
            const buyPressure1h = total1hVol > 0 ? (highVol1h / total1hVol) * 100 : 0;
            const sellPressure1h = total1hVol > 0 ? (lowVol1h / total1hVol) * 100 : 0;

            // Volume Ratio
            const volRatio = total1hVol > 0 ? (total5mVol / total1hVol) : 0;

            // Alch
            const alchValue = item.highalch || null;
            const alchMargin = alchValue !== null ? alchValue - low : null;

            results.push({
                id,
                name: item.name,
                members: item.members,
                low,
                high,
                profit: Math.round(netProfit),
                roi: parseFloat(roi.toFixed(2)),
                avg5m,
                avg1h,
                volume,
                limit: limit !== undefined ? limit : "-",
                alchValue,
                alchMargin: alchMargin !== null ? Math.round(alchMargin) : null,
                total5mVol,
                buyPressure5m,
                sellPressure5m,
                total1hVol,
                buyPressure1h,
                sellPressure1h,
                volRatio,
            });
        }

        return results;
    } catch (err) {
        console.error("Error fetching flipping data:", err);
        return [];
    }
}

export function getItemImageUrl(name: string): string {
    const encoded = encodeURIComponent(name.replace(/ /g, "_"));
    return `https://oldschool.runescape.wiki/images/${encoded}_detail.png`;
}
