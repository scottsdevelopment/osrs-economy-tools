import { ItemMapping } from "./types";

export function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export function findItemBySlug(slug: string, items: ItemMapping[]): ItemMapping | null {
    return items.find((item) => generateSlug(item.name) === slug) || null;
}

export function findItemBySlugOrId(param: string, items: ItemMapping[]): ItemMapping | null {
    // Try to find by slug first
    const bySlug = findItemBySlug(param, items);
    if (bySlug) return bySlug;

    // Fallback to ID if param is a number
    const id = parseInt(param);
    if (!isNaN(id)) {
        return items.find((item) => item.id === id) || null;
    }

    return null;
}
