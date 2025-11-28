"use client";

import React, { useState, useEffect } from "react";
import { ProcessedItem } from "@/lib/types";
import FlippingTable from "./FlippingTable";
import { useItemData } from "@/context/ItemDataContext";
import SavedFilterManager from "./SavedFilterManager";
import { SavedFilter } from "@/lib/filters/types";
import { useFilters } from "@/context/FilterContext";
import { evaluateFilters } from "@/lib/filters/engine";

import { CustomColumn } from "@/lib/columns/types";
import { loadColumns } from "@/lib/columns/storage";
import { PRESET_COLUMNS } from "@/lib/columns/presets";

export default function FlippingFinder() {
    const { items, loading } = useItemData();
    const { savedFilters, handleAddFilter, handleUpdateFilter, handleDeleteFilter, handleToggleFilter } = useFilters();
    const [searchQuery, setSearchQuery] = useState("");
    const [customColumns, setCustomColumns] = useState<CustomColumn[]>(PRESET_COLUMNS);
    const [previewFilter, setPreviewFilter] = useState<SavedFilter | null>(null);

    useEffect(() => {
        loadColumns().then(setCustomColumns);
    }, []);



    const handlePreviewFilter = (filter: SavedFilter | null) => {
        setPreviewFilter(filter);
    };

    // Combine saved filters with preview filter for table display
    const effectiveFilters = previewFilter
        ? [...savedFilters, { ...previewFilter, enabled: true }]
        : savedFilters;

    // Filter logic
    const filteredItems = items.filter((item) => {
        // 1. Apply Saved Filters
        const results = evaluateFilters(item, effectiveFilters, customColumns, items);
        if (results.length === 0) return false;

        // 2. Apply Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            if (!item.name.toLowerCase().includes(query)) return false;
        }

        return true;
    });

    return (
        <div id="flipping-tab" className="block w-full">
            <SavedFilterManager
                filters={savedFilters}
                onAddFilter={handleAddFilter}
                onUpdateFilter={handleUpdateFilter}
                onDeleteFilter={handleDeleteFilter}
                onToggleFilter={handleToggleFilter}
                items={items}
                columns={customColumns}
                onPreviewFilter={handlePreviewFilter}
            />
            {loading && items.length === 0 ? (
                <div className="text-center p-4 text-osrs-text">Loading data...</div>
            ) : (
                <FlippingTable
                    items={items}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    filters={effectiveFilters}
                />
            )}
        </div>
    );
}
