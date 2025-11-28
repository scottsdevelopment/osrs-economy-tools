"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { loadFavorites, saveFavorites } from "@/lib/favorites/storage";

interface FavoritesContextType {
    favorites: Set<number>;
    toggleFavorite: (id: number) => void;
    isFavorite: (id: number) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
    const [favorites, setFavorites] = useState<Set<number>>(new Set());

    useEffect(() => {
        loadFavorites().then((ids) => {
            setFavorites(new Set(ids));
        });
    }, []);

    const toggleFavorite = useCallback((id: number) => {
        setFavorites((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            // Persist
            saveFavorites(Array.from(next));
            return next;
        });
    }, []);

    const isFavorite = useCallback((id: number) => {
        return favorites.has(id);
    }, [favorites]);

    return (
        <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
}

export function useFavorites() {
    const context = useContext(FavoritesContext);
    if (context === undefined) {
        throw new Error("useFavorites must be used within a FavoritesProvider");
    }
    return context;
}
