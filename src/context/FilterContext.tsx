"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { SavedFilter } from "@/lib/filters/types";
import { loadFilters, addFilter, updateFilter, deleteFilter, toggleFilter } from "@/lib/filters/storage";
import { PRESET_FILTERS } from "@/lib/filters/presets";

interface FilterContextType {
    savedFilters: SavedFilter[];
    handleAddFilter: (filter: SavedFilter) => Promise<void>;
    handleUpdateFilter: (filter: SavedFilter) => Promise<void>;
    handleDeleteFilter: (id: string) => Promise<void>;
    handleToggleFilter: (id: string) => Promise<void>;
    loading: boolean;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: React.ReactNode }) {
    const [savedFilters, setSavedFilters] = useState<SavedFilter[]>(PRESET_FILTERS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadFilters().then((filters) => {
            setSavedFilters(filters);
            setLoading(false);
        });
    }, []);

    const handleAddFilter = useCallback(async (filter: SavedFilter) => {
        const newFilters = await addFilter(filter);
        setSavedFilters(newFilters);
    }, []);

    const handleUpdateFilter = useCallback(async (filter: SavedFilter) => {
        const newFilters = await updateFilter(filter.id, filter);
        setSavedFilters(newFilters);
    }, []);

    const handleDeleteFilter = useCallback(async (id: string) => {
        const newFilters = await deleteFilter(id);
        setSavedFilters(newFilters);
    }, []);

    const handleToggleFilter = useCallback(async (id: string) => {
        const newFilters = await toggleFilter(id);
        setSavedFilters(newFilters);
    }, []);

    return (
        <FilterContext.Provider
            value={{
                savedFilters,
                handleAddFilter,
                handleUpdateFilter,
                handleDeleteFilter,
                handleToggleFilter,
                loading,
            }}
        >
            {children}
        </FilterContext.Provider>
    );
}

export function useFilters() {
    const context = useContext(FilterContext);
    if (context === undefined) {
        throw new Error("useFilters must be used within a FilterProvider");
    }
    return context;
}
