import { create } from 'zustand';
import { SavedFilter } from '@/lib/filters/types';
import { loadFilters, addFilter, updateFilter, deleteFilter, toggleFilter } from '@/lib/filters/storage';
import { PRESET_FILTERS } from '@/lib/filters/presets';

interface FiltersState {
    savedFilters: SavedFilter[];
    loading: boolean;
    loadFilters: () => Promise<void>;
    handleAddFilter: (filter: SavedFilter) => Promise<void>;
    handleUpdateFilter: (filter: SavedFilter) => Promise<void>;
    handleDeleteFilter: (id: string) => Promise<void>;
    handleToggleFilter: (id: string) => Promise<void>;
}

export const useFiltersStore = create<FiltersState>((set) => ({
    savedFilters: PRESET_FILTERS,
    loading: true,

    loadFilters: async () => {
        const filters = await loadFilters();
        set({ savedFilters: filters, loading: false });
    },

    handleAddFilter: async (filter: SavedFilter) => {
        const newFilters = await addFilter(filter);
        set({ savedFilters: newFilters });
    },

    handleUpdateFilter: async (filter: SavedFilter) => {
        const newFilters = await updateFilter(filter.id, filter);
        set({ savedFilters: newFilters });
    },

    handleDeleteFilter: async (id: string) => {
        const newFilters = await deleteFilter(id);
        set({ savedFilters: newFilters });
    },

    handleToggleFilter: async (id: string) => {
        const newFilters = await toggleFilter(id);
        set({ savedFilters: newFilters });
    },
}));

// Initialize filters on store creation
useFiltersStore.getState().loadFilters();
