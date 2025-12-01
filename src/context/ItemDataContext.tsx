"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { ProcessedItem } from "@/lib/types";
import { fetchFlippingData } from "@/lib/api";

interface ItemDataContextType {
    items: ProcessedItem[];
    loading: boolean;
    lastUpdated: Date | null;
    autoRefresh: boolean;
    timeLeft: number;
    refreshData: () => Promise<void>;
    toggleAutoRefresh: () => void;
}

const ItemDataContext = createContext<ItemDataContextType | undefined>(undefined);

export function ItemDataProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<ProcessedItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [timeLeft, setTimeLeft] = useState(60); // 60 seconds default

    const refreshData = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchFlippingData();
            setItems(data.items);
            setLastUpdated(new Date());
            setTimeLeft(60); // Reset timer
        } catch (error) {
            console.error("Failed to refresh data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const toggleAutoRefresh = () => {
        setAutoRefresh((prev) => !prev);
    };

    // Initial fetch
    useEffect(() => {
        refreshData();
    }, [refreshData]);

    // Timer and Auto-refresh logic
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (autoRefresh) {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        refreshData();
                        return 60;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [autoRefresh, refreshData]);

    return (
        <ItemDataContext.Provider
            value={{
                items,
                loading,
                lastUpdated,
                autoRefresh,
                timeLeft,
                refreshData,
                toggleAutoRefresh,
            }}
        >
            {children}
        </ItemDataContext.Provider>
    );
}

export function useItemData() {
    const context = useContext(ItemDataContext);
    if (context === undefined) {
        throw new Error("useItemData must be used within an ItemDataProvider");
    }
    return context;
}
