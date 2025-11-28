"use client";

import { TimeSeriesData } from "../types";
import { saveTimeseries, getTimeseries, isExpired as checkExpired, cleanup, getLastCleanup, setLastCleanup } from "./indexeddb";

const API_BASE = "https://prices.runescape.wiki/api/v1/osrs";
const API_TIMESERIES = `${API_BASE}/timeseries`;

interface TimeseriesCacheEntry {
    data: TimeSeriesData[];
    fetchedAt: number;
    expiresAt: number;
}

interface QueueEntry {
    itemId: number;
    interval: string;
    priority: number;
    resolve: (data: TimeSeriesData[]) => void;
    reject: (error: Error) => void;
}

type UpdateCallback = (itemId: number, interval: string, data: TimeSeriesData[]) => void;
type ItemCallback = (interval: string, data: TimeSeriesData[]) => void;

export class TimeseriesCache {
    private cache: Map<string, TimeseriesCacheEntry> = new Map();
    private queue: Map<string, QueueEntry[]> = new Map();
    private flushTimer: NodeJS.Timeout | null = null;
    private subscribers: UpdateCallback[] = [];
    private itemSubscribers: Map<number, Set<ItemCallback>> = new Map();
    private readonly FLUSH_DELAY = 50; // ms
    private readonly BATCH_SIZE = 20;
    private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
    private readonly VALID_INTERVALS = ['5m', '1h', '6h', '24h'] as const;
    private cleanupTimer: NodeJS.Timeout | null = null;

    constructor() {
        if (typeof window !== 'undefined') {
            this.scheduleCleanup();
        }
    }

    private getCacheKey(itemId: number, interval: string): string {
        return `${itemId}:${interval}`;
    }

    private validateInterval(interval: string): void {
        if (!this.VALID_INTERVALS.includes(interval as any)) {
            throw new Error(`Invalid interval: ${interval}. Valid options are: ${this.VALID_INTERVALS.join(', ')}`);
        }
    }

    /** Get from in‑memory cache if present and fresh */
    private async get(itemId: number, interval: string): Promise<TimeSeriesData[] | null> {
        const key = this.getCacheKey(itemId, interval);
        const entry = this.cache.get(key);
        if (entry && Date.now() < entry.expiresAt) {
            return entry.data;
        }
        return null;
    }

    /** Synchronous getter used by column engine */
    public getSync(itemId: number, interval: string): TimeSeriesData[] | null {
        const key = this.getCacheKey(itemId, interval);
        const entry = this.cache.get(key);
        if (entry && Date.now() < entry.expiresAt) {
            return entry.data;
        }
        return null;
    }

    /** Request data, using cache, IndexedDB throttling, then queue */
    public async request(itemId: number, interval: string, priority: number = 0): Promise<TimeSeriesData[]> {
        this.validateInterval(interval);
        const cached = await this.get(itemId, interval);
        if (cached !== null) {
            return cached;
        }
        // Check IndexedDB (5‑minute throttling)
        if (typeof window !== 'undefined' && window.indexedDB) {
            try {
                const expired = await checkExpired(itemId, interval);
                if (!expired) {
                    const stored = await getTimeseries(itemId, interval);
                    if (stored) {
                        const key = this.getCacheKey(itemId, interval);
                        this.cache.set(key, {
                            data: stored.data,
                            fetchedAt: stored.fetchedAt,
                            expiresAt: stored.expiresAt,
                        });
                        return stored.data;
                    }
                }
            } catch (e) {
                console.error(`Error checking expiry for ${itemId}:${interval}:`, e);
            }
        }
        const key = this.getCacheKey(itemId, interval);
        return new Promise<TimeSeriesData[]>((resolve, reject) => {
            if (!this.queue.has(key)) this.queue.set(key, []);
            this.queue.get(key)!.push({ itemId, interval, priority, resolve, reject });
            if (!this.flushTimer) this.flushTimer = setTimeout(() => this.flush(), this.FLUSH_DELAY);
        });
    }

    public subscribe(callback: UpdateCallback): () => void {
        this.subscribers.push(callback);
        return () => {
            const idx = this.subscribers.indexOf(callback);
            if (idx > -1) this.subscribers.splice(idx, 1);
        };
    }

    public subscribeToItem(itemId: number, callback: ItemCallback): () => void {
        if (!this.itemSubscribers.has(itemId)) this.itemSubscribers.set(itemId, new Set());
        this.itemSubscribers.get(itemId)!.add(callback);
        return () => {
            const set = this.itemSubscribers.get(itemId);
            if (set) {
                set.delete(callback);
                if (set.size === 0) this.itemSubscribers.delete(itemId);
            }
        };
    }

    private notifySubscribers(itemId: number, interval: string, data: TimeSeriesData[]) {
        this.subscribers.forEach(cb => {
            try { cb(itemId, interval, data); } catch (e) { console.error('Subscriber error:', e); }
        });
        const itemSet = this.itemSubscribers.get(itemId);
        if (itemSet) {
            itemSet.forEach(cb => {
                try { cb(interval, data); } catch (e) { console.error(`Item ${itemId} subscriber error:`, e); }
            });
        }
    }

    private async flush(): Promise<void> {
        this.flushTimer = null;
        const all: QueueEntry[] = [];
        this.queue.forEach(entries => { if (entries.length > 0) all.push(entries[0]); });
        if (all.length === 0) return;
        const batch = all.sort((a, b) => b.priority - a.priority).slice(0, this.BATCH_SIZE);
        const byInterval = new Map<string, QueueEntry[]>();
        batch.forEach(e => {
            if (!byInterval.has(e.interval)) byInterval.set(e.interval, []);
            byInterval.get(e.interval)!.push(e);
        });
        const promises: Promise<void>[] = [];
        byInterval.forEach((entries, interval) => {
            entries.forEach(entry => {
                const p = this.fetchSingle(entry.itemId, interval)
                    .then(async data => {
                        const key = this.getCacheKey(entry.itemId, interval);
                        const fetchedAt = Date.now();
                        const expiresAt = fetchedAt + this.DEFAULT_TTL;
                        this.cache.set(key, { data, fetchedAt, expiresAt });
                        if (typeof window !== 'undefined' && window.indexedDB) {
                            try { await saveTimeseries(entry.itemId, interval, data, fetchedAt); } catch (e) { console.error('IndexedDB save error:', e); }
                        }
                        const queued = this.queue.get(key) || [];
                        queued.forEach(q => q.resolve(data));
                        this.queue.delete(key);
                        this.notifySubscribers(entry.itemId, interval, data);
                    })
                    .catch(err => {
                        console.error(`Fetch error for ${entry.itemId}:${interval}`, err);
                        const key = this.getCacheKey(entry.itemId, interval);
                        const queued = this.queue.get(key) || [];
                        queued.forEach(q => q.reject(err));
                        this.queue.delete(key);
                    });
                promises.push(p);
            });
        });
        await Promise.all(promises);
        if (this.queue.size > 0) this.flushTimer = setTimeout(() => this.flush(), this.FLUSH_DELAY);
    }

    private async fetchSingle(itemId: number, interval: string): Promise<TimeSeriesData[]> {
        const response = await fetch(`${API_TIMESERIES}?timestep=${interval}&id=${itemId}`, { cache: 'force-cache' });
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        const json = await response.json();
        return json.data || [];
    }

    public prefetch(itemIds: number[], interval: string, priority: number = 0): void {
        this.validateInterval(interval);
        itemIds.forEach(id => {
            const key = this.getCacheKey(id, interval);
            if (!this.cache.has(key) && !this.queue.has(key)) {
                this.request(id, interval, priority).catch(() => {/* ignore */ });
            }
        });
    }

    public async refresh(itemId: number, interval: string): Promise<TimeSeriesData[]> {
        this.validateInterval(interval);
        const key = this.getCacheKey(itemId, interval);
        this.cache.delete(key);
        return this.request(itemId, interval, 100);
    }

    public clear(): void {
        this.cache.clear();
        this.queue.clear();
        if (this.flushTimer) { clearTimeout(this.flushTimer); this.flushTimer = null; }
    }

    private async scheduleCleanup(): Promise<void> {
        if (typeof window === 'undefined' || !window.indexedDB) return;
        try {
            const last = await getLastCleanup();
            const now = Date.now();
            const hour = 60 * 60 * 1000;
            if (!last || now - last > hour) {
                const deleted = await cleanup();
                console.log(`Cleaned up ${deleted} expired timeseries entries`);
                await setLastCleanup(now);
            }
        } catch (e) { console.error('Cleanup error:', e); }
        this.cleanupTimer = setTimeout(() => this.scheduleCleanup(), 60 * 60 * 1000);
    }

    public getStats() {
        return {
            memoryCacheSize: this.cache.size,
            queueSize: this.queue.size,
            subscriberCount: this.subscribers.length,
            itemSubscriberCount: this.itemSubscribers.size,
        };
    }

    public destroy(): void {
        if (this.flushTimer) clearTimeout(this.flushTimer);
        if (this.cleanupTimer) clearTimeout(this.cleanupTimer);
    }
}
