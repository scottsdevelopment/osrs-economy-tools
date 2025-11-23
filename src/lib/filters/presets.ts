import { SavedFilter } from "./types";

export const PRESET_FILTERS: SavedFilter[] = [
    {
        id: "f2p_only",
        name: "F2P Only",
        expressions: [{ code: "item.members == false" }],
        enabled: false,
        category: "Restrictions",
        description: "Show only Free-to-Play items"
    },
    {
        id: "buy_under_5m",
        name: "Buy < 5m Avg",
        expressions: [{ code: "columns.low < columns.avg5m" }],
        enabled: false,
        category: "Price",
        description: "Current buy price is lower than 5 minute average"
    },
    {
        id: "high_volume",
        name: "High Volume (>10k)",
        expressions: [{ code: "columns.volume >= 10000" }],
        enabled: false,
        category: "Volume",
        description: "Daily volume greater than 10,000"
    },
    {
        id: "high_roi",
        name: "High ROI (>5%)",
        expressions: [{ code: "columns.roi >= 5" }],
        enabled: false,
        category: "Profit",
        description: "Return on Investment greater than 5%"
    },
    {
        id: "high_profit",
        name: "High Profit (>10k)",
        expressions: [{ code: "columns.profit >= 10000" }],
        enabled: false,
        category: "Profit",
        description: "Profit per item greater than 10,000 GP"
    },
    {
        id: "potential_flip",
        name: "Potential Flip",
        expressions: [{ code: "columns.roi > 2 and columns.volume > 1000 and columns.profit > 1000" }],
        enabled: false,
        category: "Strategy",
        description: "ROI > 2%, Vol > 1000, Profit > 1000"
    },
    {
        id: "decanting_opportunities",
        name: "Decanting Opportunities",
        expressions: [
            // Prayer Potions
            // 3->4 (Source: 139, Target: 2434)
            {
                code: "item.id == 139 and item.volume > 100000 and ((3 * getItem(2434, 'high') * 0.98) - (4 * item.low)) > ((4 * item.low) * 0.01)",
                action: "Decant 3→4",
                highlightItem: "2434"
            },
            // 2->4 (Source: 141, Target: 2434)
            {
                code: "item.id == 141 and item.volume > 100000 and ((getItem(2434, 'high') * 0.98) - (2 * item.low)) > ((2 * item.low) * 0.01)",
                action: "Decant 2→4",
                highlightItem: "2434"
            },
            // 1->4 (Source: 143, Target: 2434)
            {
                code: "item.id == 143 and item.volume > 100000 and ((getItem(2434, 'high') * 0.98) - (4 * item.low)) > ((4 * item.low) * 0.01)",
                action: "Decant 1→4",
                highlightItem: "2434"
            },
            // Stamina Potions
            // 3->4 (Source: 12627, Target: 12625)
            {
                code: "item.id == 12627 and item.volume > 100000 and ((3 * getItem(12625, 'high') * 0.98) - (4 * item.low)) > ((4 * item.low) * 0.01)",
                action: "Decant 3→4",
                highlightItem: "12625"
            },
            // 2->4 (Source: 12629, Target: 12625)
            {
                code: "item.id == 12629 and item.volume > 100000 and ((getItem(12625, 'high') * 0.98) - (2 * item.low)) > ((2 * item.low) * 0.01)",
                action: "Decant 2→4",
                highlightItem: "12625"
            },
            // 1->4 (Source: 12631, Target: 12625)
            {
                code: "item.id == 12631 and item.volume > 100000 and ((getItem(12625, 'high') * 0.98) - (4 * item.low)) > ((4 * item.low) * 0.01)",
                action: "Decant 1→4",
                highlightItem: "12625"
            }
        ],
        enabled: false,
        independent: true,
        category: "Strategy",
        description: "Find profitable decanting opportunities for Prayer and Stamina potions"
    }
];
