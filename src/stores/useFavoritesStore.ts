import { create } from 'zustand';
import { loadFavorites, saveFavorites } from '@/lib/favorites/storage';

interface FavoritesState {
    favorites: Set<number>;
    loadFavorites: () => Promise<void>;
    toggleFavorite: (id: number) => void;
    isFavorite: (id: number) => boolean;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
    favorites: new Set<number>(),

    loadFavorites: async () => {
        const ids = await loadFavorites();
        set({ favorites: new Set(ids) });
    },

    toggleFavorite: (id: number) => {
        set((state) => {
            const next = new Set(state.favorites);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            // Persist
            saveFavorites(Array.from(next));
            return { favorites: next };
        });
    },

    isFavorite: (id: number) => {
        return get().favorites.has(id);
    },
}));

// Initialize favorites on store creation
useFavoritesStore.getState().loadFavorites();
