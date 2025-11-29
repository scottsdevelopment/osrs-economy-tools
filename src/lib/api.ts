import { ItemMapping, ProcessedItem, PriceData, TimeSeriesData } from "./types";
import { findItemBySlugOrId } from "./slug";

const API_BASE = "https://prices.runescape.wiki/api/v1/osrs";
const API_LATEST = `${API_BASE}/latest`;
const API_5M = `${API_BASE}/5m`;
const API_1H = `${API_BASE}/1h`;
const API_6H = `${API_BASE}/6h`;
const API_24H = `${API_BASE}/24h`;
const API_MAPPING = `${API_BASE}/mapping`;
const API_VOLUMES = `${API_BASE}/volumes`;
const API_TIMESERIES = `${API_BASE}/timeseries`;

// Module-level cache for mappings (they never change)
let cachedMappings: ItemMapping[] | null = null;
let mappingsFetchPromise: Promise<ItemMapping[]> | null = null;

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

export async function fetchAllMappings(): Promise<ItemMapping[]> {
    // Return cached mappings if available
    if (cachedMappings) {
        return cachedMappings;
    }

    // Return existing promise if fetch is in progress
    if (mappingsFetchPromise) {
        return mappingsFetchPromise;
    }

    // Start new fetch
    mappingsFetchPromise = (async () => {
        try {
            const res = await fetch(API_MAPPING, { next: { revalidate: 3600 } });
            const data = (await res.json()) as ItemMapping[];
            cachedMappings = data;
            return data;
        } catch (err) {
            console.error("Error fetching mappings:", err);
            return [];
        } finally {
            mappingsFetchPromise = null;
        }
    })();

    return mappingsFetchPromise;
}

export async function fetchItemDataBySlug(slug: string): Promise<{ mapping: ItemMapping; price: PriceData; volume: number } | null> {
    try {
        console.log(`Fetching item data for slug: ${slug}`);
        // 1. Fetch all mappings to find the ID from the slug
        const mappings = await fetchAllMappings();
        const item = findItemBySlugOrId(slug, mappings);

        if (!item) {
            console.log(`Item not found for slug: ${slug}`);
            return null;
        }

        console.log(`Found item for slug ${slug}: ${item.name} (ID: ${item.id})`);

        // 2. Once we have the ID, fetch the specific data
        // We can reuse fetchItemData since we now have the ID
        return fetchItemData(item.id);
    } catch (err) {
        console.error("Error fetching item data by slug:", err);
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

export async function fetchFlippingData(): Promise<{ items: ProcessedItem[] }> {
    try {
        const [latestRes, fiveMRes, oneHRes, sixHRes, twentyFourHRes, volumesRes] = await Promise.all([
            fetch(API_LATEST, { next: { revalidate: 60 } }),
            fetch(API_5M, { next: { revalidate: 300 } }),
            fetch(API_1H, { next: { revalidate: 300 } }),
            fetch(API_6H, { next: { revalidate: 3600 } }),
            fetch(API_24H, { next: { revalidate: 3600 } }),
            fetch(API_VOLUMES, { next: { revalidate: 3600 } }),
        ]);

        const latest = (await latestRes.json()).data as Record<string, PriceData>;
        const fiveM = (await fiveMRes.json()).data as Record<string, TimeSeriesData>;
        const oneH = (await oneHRes.json()).data as Record<string, TimeSeriesData>;
        const sixH = (await sixHRes.json()).data as Record<string, TimeSeriesData>;
        const twentyFourH = (await twentyFourHRes.json()).data as Record<string, TimeSeriesData>;
        const volumes = (await volumesRes.json()).data as Record<string, number>;

        // Get mappings (cached at module level)
        const mapping = await fetchAllMappings();

        const results: ProcessedItem[] = [];

        for (const item of mapping) {
            const id = item.id;
            const price = latest[id];
            const volume = volumes[id];
            const limit = item.limit;

            if (!price || !price.high || !price.low || !volume) continue;

            const low = price.low;
            const lowTime = price.lowTime;
            const high = price.high;
            const highTime = price.highTime;

            // 5m Data
            const item5m = fiveM[id];
            const avg5m = item5m?.avgHighPrice || 0;
            const highVol5m = item5m?.highPriceVolume || 0;
            const lowVol5m = item5m?.lowPriceVolume || 0;

            // 1h Data
            const item1h = oneH[id];
            const avg1h = item1h?.avgHighPrice || 0;
            const highVol1h = item1h?.highPriceVolume || 0;
            const lowVol1h = item1h?.lowPriceVolume || 0;

            // 6h Data
            const item6h = sixH[id];
            const avg6h = item6h?.avgHighPrice || 0;
            const highVol6h = item6h?.highPriceVolume || 0;
            const lowVol6h = item6h?.lowPriceVolume || 0;

            // 24h Data
            const item24h = twentyFourH[id];
            const avg24h = item24h?.avgHighPrice || 0;
            const highVol24h = item24h?.highPriceVolume || 0;
            const lowVol24h = item24h?.lowPriceVolume || 0;

            // Only include raw data from API
            results.push({
                id,
                name: item.name,
                members: item.members,
                limit: limit !== undefined ? limit : 0,
                highalch: item.highalch || 0,
                low,
                lowTime,
                high,
                highTime,
                volume,
                avg5m,
                highVol5m,
                lowVol5m,
                avg1h,
                highVol1h,
                lowVol1h,
                avg6h,
                highVol6h,
                lowVol6h,
                avg24h,
                highVol24h,
                lowVol24h,
            });
        }

        return { items: results };
    } catch (err) {
        console.error("Error fetching flipping data:", err);
        return { items: [] };
    }
}

export function getItemImageUrl(name: string): string {
    const encoded = encodeURIComponent(name.replace(/ /g, "_"));
    return `https://oldschool.runescape.wiki/images/${encoded}_detail.png`;
}

export async function fetchTimeseriesForSMA(ids: number[], timestep: "24h" = "24h"): Promise<Record<number, TimeSeriesData[]>> {
    const BATCH_SIZE = 20;
    const results: Record<number, TimeSeriesData[]> = {};

    for (let i = 0; i < ids.length; i += BATCH_SIZE) {
        const batch = ids.slice(i, i + BATCH_SIZE);
        try {
            const promises = batch.map(id =>
                fetch(`${API_TIMESERIES}?timestep=${timestep}&id=${id}`, { next: { revalidate: 3600 } })
                    .then(res => res.json())
                    .then(json => ({ id, data: json.data }))
                    .catch(err => {
                        console.error(`Error fetching timeseries for ${id}:`, err);
                        return { id, data: [] };
                    })
            );

            const batchResults = await Promise.all(promises);
            batchResults.forEach(res => {
                if (res.data) {
                    results[res.id] = res.data;
                }
            });

        } catch (err) {
            console.error("Error fetching batch timeseries:", err);
        }
    }

    return results;
}
