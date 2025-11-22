"use client";

import React, { useState, useEffect } from "react";
import { fetchFlippingData } from "@/lib/api";
import { ProcessedItem, FilterState } from "@/lib/types";
import Filters from "./Filters";
import FlippingTable from "./FlippingTable";
import "./FlippingFinder.scss";

interface FlippingFinderProps {
    initialData: ProcessedItem[];
}

const initialFilters: FilterState = {
    f2pOnly: false,
    showAll: false,
    buyUnder5m: false,
    minVolume: null,
    minBuyPrice: null,
    maxBuyPrice: null,
    minSellPrice: null,
    maxSellPrice: null,
    minProfit: null,
    minRoi: null,
    limitFilter: null,
    searchQuery: "",
    min5mVol: null,
    minBuyPressure5m: null,
    minSellPressure5m: null,
    min1hVol: null,
    minBuyPressure1h: null,
    minSellPressure1h: null,
};

export default function FlippingFinder({ initialData }: FlippingFinderProps) {
    const [data, setData] = useState<ProcessedItem[]>(initialData);
    const [filters, setFilters] = useState<FilterState>(initialFilters);
    const [loading, setLoading] = useState(false);

    const handleRefresh = async () => {
        setLoading(true);
        const newData = await fetchFlippingData();
        setData(newData);
        setLoading(false);
    };

    // Filter logic
    const filteredItems = data.filter((item) => {
        if (filters.f2pOnly && item.members) return false;
        if (filters.minVolume !== null && item.volume < filters.minVolume) return false;
        if (filters.minBuyPrice !== null && item.low < filters.minBuyPrice) return false;
        if (filters.maxBuyPrice !== null && item.low > filters.maxBuyPrice) return false;
        if (filters.minSellPrice !== null && item.high < filters.minSellPrice) return false;
        if (filters.maxSellPrice !== null && item.high > filters.maxSellPrice) return false;
        if (filters.minProfit !== null && item.profit < filters.minProfit) return false;
        if (filters.minRoi !== null && item.roi < filters.minRoi) return false;
        if (filters.limitFilter !== null && (typeof item.limit !== "number" || item.limit < filters.limitFilter)) return false;

        if (filters.buyUnder5m) {
            if (typeof item.avg5m !== "number" || item.low >= item.avg5m) return false;
        }

        if (filters.min5mVol !== null && item.total5mVol < filters.min5mVol) return false;
        if (filters.minBuyPressure5m !== null && item.buyPressure5m < filters.minBuyPressure5m) return false;
        if (filters.minSellPressure5m !== null && item.sellPressure5m < filters.minSellPressure5m) return false;

        if (filters.min1hVol !== null && item.total1hVol < filters.min1hVol) return false;
        if (filters.minBuyPressure1h !== null && item.buyPressure1h < filters.minBuyPressure1h) return false;
        if (filters.minSellPressure1h !== null && item.sellPressure1h < filters.minSellPressure1h) return false;

        if (filters.searchQuery) {
            const query = filters.searchQuery.toLowerCase();
            if (!item.name.toLowerCase().includes(query)) return false;
        }

        return true;
    });

    // Auto-refresh every 5 minutes
    useEffect(() => {
        const interval = setInterval(handleRefresh, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div id="flipping-tab" className="tab-content active" style={{ display: "block" }}>
            <Filters filters={filters} setFilters={setFilters} onRefresh={handleRefresh} />
            {loading ? (
                <div className="text-center p-4">Loading data...</div>
            ) : (
                <FlippingTable items={filteredItems} />
            )}
        </div>
    );
}
