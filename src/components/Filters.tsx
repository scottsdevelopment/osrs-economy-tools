"use client";

import React, { useState } from "react";
import { FilterState } from "@/lib/types";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FiltersProps {
    filters: FilterState;
    setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

export default function Filters({ filters, setFilters }: FiltersProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFilters((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value === "" ? null : Number(value),
        }));
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilters((prev) => ({ ...prev, searchQuery: e.target.value }));
    };

    return (
        <div className="mb-4 bg-osrs-panel border-2 border-osrs-border rounded-lg overflow-hidden shadow-lg">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-4 py-3 bg-osrs-button text-[#2c1e12] font-header font-bold flex items-center justify-between hover:bg-osrs-button-hover transition-colors"
            >
                <span>Filters</span>
                {isExpanded ? (
                    <ChevronUp className="w-5 h-5" />
                ) : (
                    <ChevronDown className="w-5 h-5" />
                )}
            </button>

            {/* Content */}
            {isExpanded && (
                <div className="p-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Search & Options */}
                        <fieldset className="border border-osrs-border rounded-lg p-4 bg-osrs-input lg:col-span-3 flex flex-wrap gap-4 justify-between items-center">
                            <legend className="bg-osrs-accent text-white px-3 py-1 rounded text-sm font-bold">Search & Options</legend>
                            <div className="flex flex-1 gap-2 min-w-[300px]">
                                <input
                                    type="text"
                                    placeholder="Search items..."
                                    value={filters.searchQuery}
                                    onChange={handleSearchChange}
                                    className="flex-1 p-2.5 border border-osrs-border rounded bg-white text-osrs-text focus:outline-none focus:border-osrs-primary focus:ring-2 focus:ring-osrs-primary/20 transition-all"
                                />
                            </div>
                            <div className="flex flex-wrap gap-6 items-center">
                                <label className="flex items-center gap-2 cursor-pointer text-sm select-none">
                                    <input
                                        type="checkbox"
                                        name="f2pOnly"
                                        checked={filters.f2pOnly}
                                        onChange={handleInputChange}
                                        className="w-5 h-5 accent-osrs-accent cursor-pointer"
                                    />
                                    F2P Only
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer text-sm select-none">
                                    <input
                                        type="checkbox"
                                        name="showAll"
                                        checked={filters.showAll}
                                        onChange={handleInputChange}
                                        className="w-5 h-5 accent-osrs-accent cursor-pointer"
                                    />
                                    Show All Items
                                </label>
                            </div>
                        </fieldset>

                        {/* Price Settings */}
                        <fieldset className="border border-osrs-border rounded-lg p-4 bg-osrs-input min-w-0">
                            <legend className="bg-osrs-accent text-white px-3 py-1 rounded text-sm font-bold">Price Settings</legend>
                            <div className="grid grid-cols-2 gap-4">
                                <label className="flex flex-col gap-1 text-sm text-left">
                                    Min Buy Price
                                    <input
                                        type="number"
                                        name="minBuyPrice"
                                        value={filters.minBuyPrice ?? ""}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-osrs-border rounded bg-white focus:outline-none focus:border-osrs-accent focus:ring-2 focus:ring-osrs-accent/20"
                                    />
                                </label>
                                <label className="flex flex-col gap-1 text-sm text-left">
                                    Max Buy Price
                                    <input
                                        type="number"
                                        name="maxBuyPrice"
                                        value={filters.maxBuyPrice ?? ""}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-osrs-border rounded bg-white focus:outline-none focus:border-osrs-accent focus:ring-2 focus:ring-osrs-accent/20"
                                    />
                                </label>
                                <label className="flex flex-col gap-1 text-sm text-left">
                                    Min Sell Price
                                    <input
                                        type="number"
                                        name="minSellPrice"
                                        value={filters.minSellPrice ?? ""}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-osrs-border rounded bg-white focus:outline-none focus:border-osrs-accent focus:ring-2 focus:ring-osrs-accent/20"
                                    />
                                </label>
                                <label className="flex flex-col gap-1 text-sm text-left">
                                    Max Sell Price
                                    <input
                                        type="number"
                                        name="maxSellPrice"
                                        value={filters.maxSellPrice ?? ""}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-osrs-border rounded bg-white focus:outline-none focus:border-osrs-accent focus:ring-2 focus:ring-osrs-accent/20"
                                    />
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer text-sm select-none col-span-2 mt-2">
                                    <input
                                        type="checkbox"
                                        name="buyUnder5m"
                                        checked={filters.buyUnder5m}
                                        onChange={handleInputChange}
                                        className="w-5 h-5 accent-osrs-accent cursor-pointer"
                                    />
                                    Buy &lt; 5m Avg
                                </label>
                            </div>
                        </fieldset>

                        {/* Profit & Volume */}
                        <fieldset className="border border-osrs-border rounded-lg p-4 bg-osrs-input min-w-0">
                            <legend className="bg-osrs-accent text-white px-3 py-1 rounded text-sm font-bold">Profit & Volume</legend>
                            <div className="grid grid-cols-2 gap-4">
                                <label className="flex flex-col gap-1 text-sm text-left">
                                    Min Profit
                                    <input
                                        type="number"
                                        name="minProfit"
                                        value={filters.minProfit ?? ""}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-osrs-border rounded bg-white focus:outline-none focus:border-osrs-accent focus:ring-2 focus:ring-osrs-accent/20"
                                    />
                                </label>
                                <label className="flex flex-col gap-1 text-sm text-left">
                                    Min ROI %
                                    <input
                                        type="number"
                                        name="minRoi"
                                        value={filters.minRoi ?? ""}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-osrs-border rounded bg-white focus:outline-none focus:border-osrs-accent focus:ring-2 focus:ring-osrs-accent/20"
                                    />
                                </label>
                                <label className="flex flex-col gap-1 text-sm text-left">
                                    Min Daily Vol
                                    <input
                                        type="number"
                                        name="minVolume"
                                        value={filters.minVolume ?? ""}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-osrs-border rounded bg-white focus:outline-none focus:border-osrs-accent focus:ring-2 focus:ring-osrs-accent/20"
                                    />
                                </label>
                                <label className="flex flex-col gap-1 text-sm text-left">
                                    Min Limit
                                    <input
                                        type="number"
                                        name="limitFilter"
                                        value={filters.limitFilter ?? ""}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-osrs-border rounded bg-white focus:outline-none focus:border-osrs-accent focus:ring-2 focus:ring-osrs-accent/20"
                                    />
                                </label>
                            </div>
                        </fieldset>

                        {/* Pressure Filters */}
                        <fieldset className="border border-osrs-border rounded-lg p-4 bg-osrs-input min-w-0">
                            <legend className="bg-osrs-accent text-white px-3 py-1 rounded text-sm font-bold">Pressure Filters</legend>
                            <div className="grid grid-cols-2 gap-4">
                                <label className="flex flex-col gap-1 text-sm text-left">
                                    Min 5m Vol
                                    <input
                                        type="number"
                                        name="min5mVol"
                                        value={filters.min5mVol ?? ""}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-osrs-border rounded bg-white focus:outline-none focus:border-osrs-accent focus:ring-2 focus:ring-osrs-accent/20"
                                    />
                                </label>
                                <label className="flex flex-col gap-1 text-sm text-left">
                                    Min 1h Vol
                                    <input
                                        type="number"
                                        name="min1hVol"
                                        value={filters.min1hVol ?? ""}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-osrs-border rounded bg-white focus:outline-none focus:border-osrs-accent focus:ring-2 focus:ring-osrs-accent/20"
                                    />
                                </label>
                                <label className="flex flex-col gap-1 text-sm text-left">
                                    Min Buy Pres (5m)
                                    <input
                                        type="number"
                                        name="minBuyPressure5m"
                                        value={filters.minBuyPressure5m ?? ""}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-osrs-border rounded bg-white focus:outline-none focus:border-osrs-accent focus:ring-2 focus:ring-osrs-accent/20"
                                    />
                                </label>
                                <label className="flex flex-col gap-1 text-sm text-left">
                                    Min Sell Pres (5m)
                                    <input
                                        type="number"
                                        name="minSellPressure5m"
                                        value={filters.minSellPressure5m ?? ""}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-osrs-border rounded bg-white focus:outline-none focus:border-osrs-accent focus:ring-2 focus:ring-osrs-accent/20"
                                    />
                                </label>
                                <label className="flex flex-col gap-1 text-sm text-left">
                                    Min Buy Pres (1h)
                                    <input
                                        type="number"
                                        name="minBuyPressure1h"
                                        value={filters.minBuyPressure1h ?? ""}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-osrs-border rounded bg-white focus:outline-none focus:border-osrs-accent focus:ring-2 focus:ring-osrs-accent/20"
                                    />
                                </label>
                                <label className="flex flex-col gap-1 text-sm text-left">
                                    Min Sell Pres (1h)
                                    <input
                                        type="number"
                                        name="minSellPressure1h"
                                        value={filters.minSellPressure1h ?? ""}
                                        onChange={handleInputChange}
                                        className="w-full p-2 border border-osrs-border rounded bg-white focus:outline-none focus:border-osrs-accent focus:ring-2 focus:ring-osrs-accent/20"
                                    />
                                </label>
                            </div>
                        </fieldset>
                    </div>
                </div>
            )}
        </div>
    );
}
