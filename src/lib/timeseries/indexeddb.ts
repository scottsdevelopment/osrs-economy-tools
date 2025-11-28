"use client";

import { TimeSeriesData } from "../types";

const DB_NAME = "osrs-timeseries-cache";
const DB_VERSION = 1;
const STORE_TIMESERIES = "timeseries";
const STORE_METADATA = "metadata";

interface TimeseriesEntry {
    key: string; // `${itemId}:${interval}`
    itemId: number;
    interval: string;
    data: TimeSeriesData[];
    fetchedAt: number;
    expiresAt: number;
}

let dbInstance: IDBDatabase | null = null;

/**
 * Open or create the IndexedDB database
 */
export async function openDB(): Promise<IDBDatabase> {
    if (typeof window === 'undefined' || !window.indexedDB) {
        throw new Error("IndexedDB is not available");
    }
    if (dbInstance) return dbInstance;

    return new Promise((resolve, reject) => {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            dbInstance = request.result;
            resolve(request.result);
        };

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;

            // Create timeseries store
            if (!db.objectStoreNames.contains(STORE_TIMESERIES)) {
                const timeseriesStore = db.createObjectStore(STORE_TIMESERIES, { keyPath: "key" });
                timeseriesStore.createIndex("itemId", "itemId", { unique: false });
                timeseriesStore.createIndex("expiresAt", "expiresAt", { unique: false });
            }

            // Create metadata store
            if (!db.objectStoreNames.contains(STORE_METADATA)) {
                db.createObjectStore(STORE_METADATA, { keyPath: "key" });
            }
        };
    });
}

/**
 * Save timeseries data to IndexedDB
 */
export async function saveTimeseries(
    itemId: number,
    interval: string,
    data: TimeSeriesData[],
    fetchedAt: number = Date.now()
): Promise<void> {
    const db = await openDB();
    const key = `${itemId}:${interval}`;
    const expiresAt = fetchedAt + 5 * 60 * 1000; // 5 minutes

    const entry: TimeseriesEntry = {
        key,
        itemId,
        interval,
        data,
        fetchedAt,
        expiresAt,
    };

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_TIMESERIES], "readwrite");
        const store = transaction.objectStore(STORE_TIMESERIES);
        const request = store.put(entry);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
}

/**
 * Get timeseries data from IndexedDB
 */
export async function getTimeseries(itemId: number, interval: string): Promise<TimeseriesEntry | null> {
    const db = await openDB();
    const key = `${itemId}:${interval}`;

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_TIMESERIES], "readonly");
        const store = transaction.objectStore(STORE_TIMESERIES);
        const request = store.get(key);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const result = request.result as TimeseriesEntry | undefined;
            resolve(result || null);
        };
    });
}

/**
 * Check if timeseries data is expired
 */
export async function isExpired(itemId: number, interval: string): Promise<boolean> {
    const entry = await getTimeseries(itemId, interval);
    if (!entry) return true; // No data = expired

    return Date.now() > entry.expiresAt;
}

/**
 * Delete expired entries from IndexedDB
 */
export async function cleanup(): Promise<number> {
    const db = await openDB();
    const now = Date.now();
    let deletedCount = 0;

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_TIMESERIES], "readwrite");
        const store = transaction.objectStore(STORE_TIMESERIES);
        const index = store.index("expiresAt");

        // Get all entries that have expired
        const range = IDBKeyRange.upperBound(now);
        const request = index.openCursor(range);

        request.onerror = () => reject(request.error);
        request.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest).result;
            if (cursor) {
                cursor.delete();
                deletedCount++;
                cursor.continue();
            } else {
                resolve(deletedCount);
            }
        };
    });
}

/**
 * Clear all timeseries data
 */
export async function clearAll(): Promise<void> {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_TIMESERIES], "readwrite");
        const store = transaction.objectStore(STORE_TIMESERIES);
        const request = store.clear();

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
}

/**
 * Get last cleanup time
 */
export async function getLastCleanup(): Promise<number | null> {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_METADATA], "readonly");
        const store = transaction.objectStore(STORE_METADATA);
        const request = store.get("lastCleanup");

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            const result = request.result;
            resolve(result?.value || null);
        };
    });
}

/**
 * Update last cleanup time
 */
export async function setLastCleanup(timestamp: number): Promise<void> {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_METADATA], "readwrite");
        const store = transaction.objectStore(STORE_METADATA);
        const request = store.put({ key: "lastCleanup", value: timestamp });

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
}
