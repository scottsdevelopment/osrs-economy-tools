import { storage, STORAGE_KEYS } from "../persistence/storage";

export async function loadFavorites(): Promise<number[]> {
    const saved = await storage.get<number[]>(STORAGE_KEYS.FAVORITES);
    return saved || [];
}

export async function saveFavorites(favorites: number[]): Promise<void> {
    await storage.set(STORAGE_KEYS.FAVORITES, favorites);
}
