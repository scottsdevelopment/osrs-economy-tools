import { create } from 'zustand';
import { TimeSeriesData } from '@/lib/types';
import { fetchTimeSeries } from '@/lib/api';

interface TimeseriesCacheEntry {
    data: TimeSeriesData[];
    timestamp: number;
}

interface TimeseriesState {
    cache: Record<string, TimeseriesCacheEntry>;
    promises: Record<string, Promise<TimeSeriesData[]> | undefined>;
    getTimeseries: (itemId: number, timestep: string) => Promise<TimeSeriesData[]>;
    invalidateCache: (itemId?: number) => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useTimeseriesStore = create<TimeseriesState>((set, get) => ({
    cache: {},
    promises: {},
    getTimeseries: async (itemId: number, timestep: string) => {
        const key = `${itemId}-${timestep}`;
        const now = Date.now();
        const state = get();
        const cached = state.cache[key];

        if (cached && (now - cached.timestamp < CACHE_DURATION)) {
            return cached.data;
        }

        // Check for in-flight request
        const existingPromise = state.promises[key];
        if (existingPromise) {
            return existingPromise;
        }

        const promise = (async () => {
            try {
                const data = await fetchTimeSeries(itemId, timestep);
                set((state) => {
                    const { [key]: _, ...remainingPromises } = state.promises;
                    return {
                        cache: {
                            ...state.cache,
                            [key]: {
                                data,
                                timestamp: Date.now()
                            }
                        },
                        promises: remainingPromises
                    };
                });
                return data;
            } catch (error) {
                console.error('Error fetching timeseries:', error);
                set((state) => {
                    const { [key]: _, ...remainingPromises } = state.promises;
                    return {
                        promises: remainingPromises
                    };
                });
                return [];
            }
        })();

        set((state) => ({
            promises: {
                ...state.promises,
                [key]: promise
            }
        }));

        return promise;
    },
    invalidateCache: (itemId?: number) => {
        if (itemId) {
            // Clear cache for specific item
            set((state) => {
                const newCache = { ...state.cache };
                Object.keys(newCache).forEach(key => {
                    if (key.startsWith(`${itemId}-`)) {
                        delete newCache[key];
                    }
                });
                return { cache: newCache };
            });
        } else {
            // Clear all cache
            set({ cache: {} });
        }
    }
}));
