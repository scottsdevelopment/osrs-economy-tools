import { create } from 'zustand';

type SortDirection = 'asc' | 'desc';

interface UIState {
    // Search
    searchQuery: string;
    setSearchQuery: (query: string) => void;

    // Pagination
    currentPage: number;
    itemsPerPage: number;
    setCurrentPage: (page: number) => void;
    setItemsPerPage: (count: number) => void;

    // Sorting
    sortKey: string;
    sortDirection: SortDirection;
    setSort: (key: string, direction?: SortDirection) => void;

    // Panel expansion states
    expandedPanels: Record<string, boolean>;
    togglePanel: (panelId: string) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
    // Search
    searchQuery: '',
    setSearchQuery: (query: string) => set({ searchQuery: query }),

    // Pagination
    currentPage: 1,
    itemsPerPage: 50,
    setCurrentPage: (page: number) => set({ currentPage: page }),
    setItemsPerPage: (count: number) => set({ itemsPerPage: count, currentPage: 1 }),

    // Sorting
    sortKey: 'profit',
    sortDirection: 'desc',
    setSort: (key: string, direction?: SortDirection) => {
        const currentState = get();
        const newDirection = direction ||
            (currentState.sortKey === key && currentState.sortDirection === 'desc' ? 'asc' : 'desc');
        set({ sortKey: key, sortDirection: newDirection, currentPage: 1 });
    },

    // Panel expansion
    expandedPanels: {},
    togglePanel: (panelId: string) => {
        set((state) => ({
            expandedPanels: {
                ...state.expandedPanels,
                [panelId]: !state.expandedPanels[panelId],
            },
        }));
    },
}));
