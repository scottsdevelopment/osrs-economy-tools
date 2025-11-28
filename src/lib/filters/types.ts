import { ProcessedItem } from "../types";

export interface FilterExpression {
    code: string;        // JS expression returning boolean
    action?: string;     // e.g., "Decant", "Buy"
    highlightItem?: string; // Expression or ID to show in table
}

export interface SavedFilter {
    id: string;
    name: string;
    expressions: FilterExpression[];
    enabled: boolean;
    isPreset?: boolean;
    category: string;
    description?: string;
    independent?: boolean; // If true, items matching this filter are considered separately
}

export interface FilterResult {
    match: boolean;
    action?: string;
    highlightItem?: ProcessedItem; // The actual item object to display/highlight
}
