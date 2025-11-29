import { SavedFilter } from "./types";

export const PRESET_FILTERS: SavedFilter[] = [
    {
        id: "favorites_only",
        name: "Favorites Only",
        enabled: false,
        independent: false,
        category: "General",
        description: "Show only favorite items",
        expressions: [
            {
                code: "item.favorite == true"
            }
        ]
    },
    {
        id: "f2p_only",
        name: "F2P Only",
        expressions: [{ code: "item.members == false" }],
        enabled: false,
        category: "Restrictions",
        description: "Show only Free-to-Play items"
    }
];
