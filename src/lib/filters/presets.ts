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
        name: "High Volume (>1M)",
        expressions: [{ code: "columns.volume >= 1000000" }],
        enabled: false,
        category: "Volume",
        description: "Daily volume greater than 1,000,000"
    },
    {
        id: "high_roi",
        name: "High ROI (>5%)",
        expressions: [{ code: "columns.roi >= 0.05" }],
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
        id: "volume_flip",
        name: "Volume Flip",
        expressions: [{ code: "columns.roi > 0.01 and columns.volume > 1000000" }],
        enabled: false,
        category: "Strategy",
        description: "ROI > 1%, Vol > 1M"
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
                highlightItem: "139"
            },
            // 2->4 (Source: 141, Target: 2434)
            {
                code: "item.id == 141 and item.volume > 100000 and ((getItem(2434, 'high') * 0.98) - (2 * item.low)) > ((2 * item.low) * 0.01)",
                action: "Decant 2→4",
                highlightItem: "141"
            },
            // 1->4 (Source: 143, Target: 2434)
            {
                code: "item.id == 143 and item.volume > 100000 and ((getItem(2434, 'high') * 0.98) - (4 * item.low)) > ((4 * item.low) * 0.01)",
                action: "Decant 1→4",
                highlightItem: "143"
            },
            // Stamina Potions
            // 3->4 (Source: 12627, Target: 12625)
            {
                code: "item.id == 12627 and item.volume > 100000 and ((3 * getItem(12625, 'high') * 0.98) - (4 * item.low)) > ((4 * item.low) * 0.01)",
                action: "Decant 3→4",
                highlightItem: "12627"
            },
            // 2->4 (Source: 12629, Target: 12625)
            {
                code: "item.id == 12629 and item.volume > 100000 and ((getItem(12625, 'high') * 0.98) - (2 * item.low)) > ((2 * item.low) * 0.01)",
                action: "Decant 2→4",
                highlightItem: "12629"
            },
            // 1->4 (Source: 12631, Target: 12625)
            {
                code: "item.id == 12631 and item.volume > 100000 and ((getItem(12625, 'high') * 0.98) - (4 * item.low)) > ((4 * item.low) * 0.01)",
                action: "Decant 1→4",
                highlightItem: "12631"
            }
        ],
        enabled: false,
        independent: true,
        category: "Strategy",
        description: "Find profitable decanting opportunities for Prayer and Stamina potions"
    },
    {
        id: "mid_tier_items",
        name: "Mid Tier Items",
        expressions: [{ code: "columns.roi > 0.01 and columns.high > 1000000 and columns.high < 5000000" }],
        enabled: false,
        category: "Strategy",
        description: "Items with ROI > 1%, High > 1M, High < 5M"
    },
    {
        id: "dumping_now",
        name: "Dumping Now",
        expressions: [{ code: "columns.priceDropStrength > 0.05 and columns.sellPressureDelta > 0.2 and columns.volatilityRatio > 0.1" }],
        enabled: false,
        category: "Market Signals",
        description: "Price dropping with significant sell pressure and multi-timeframe confirmation"
    },
    {
        id: "spiking_now",
        name: "Spiking Now",
        expressions: [{ code: "columns.priceSpikeStrength > 0.05 and columns.buyPressureDelta > 0.2 and columns.volatilityRatio > 0.1" }],
        enabled: false,
        category: "Market Signals",
        description: "Price rising with significant buy pressure and multi-timeframe confirmation"
    }
];
