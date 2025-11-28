import { CustomColumn } from "./types";

export const PRESET_COLUMNS: CustomColumn[] = [
    // Core Item Data
    {
        id: "favorite",
        name: "Fav",
        expression: "item.favorite",
        type: "boolean",
        enabled: true,
        group: "Core",
        description: "Favorite items"
    },
    {
        id: "name",
        name: "Item",
        expression: "item.name",
        type: "string",
        enabled: true,
        group: "Core",
        description: "The name of the item"
    },
    {
        id: "limit",
        name: "Buy Limit",
        expression: "item.limit",
        type: "number",
        format: "currency",
        enabled: true,
        group: "Core",
        description: "Grand Exchange buy limit every 4 hours"
    },
    {
        id: "members",
        name: "Members",
        expression: "item.members",
        type: "boolean",
        enabled: true,
        group: "Core",
        description: "Whether the item is members only"
    },
    {
        id: "low",
        name: "Buy Price",
        expression: "item.low",
        type: "number",
        format: "currency",
        enabled: true,
        group: "Core",
        description: "Current lowest price someone is selling for (instant buy)"
    },
    {
        id: "lowTime",
        name: "Most Recent Buy",
        expression: "item.lowTime",
        type: "number",
        format: "relativeTime",
        enabled: true,
        group: "Core",
        description: "Time of the latest low price update"
    },
    {
        id: "high",
        name: "Sell Price",
        expression: "item.high",
        type: "number",
        format: "currency",
        enabled: true,
        group: "Core",
        description: "Current highest price someone is buying for (instant sell)"
    },
    {
        id: "highTime",
        name: "Most Recent Sell",
        expression: "item.highTime",
        type: "number",
        format: "relativeTime",
        enabled: true,
        group: "Core",
        description: "Time of the latest high price update"
    },
    {
        id: "roi",
        name: "ROI %",
        expression: "(((item.high * 0.98) - item.low) / item.low)",
        type: "number",
        format: "percentage",
        enabled: true,
        group: "Profit",
        description: "Return on Investment percentage after tax"
    },
    {
        id: "profit",
        name: "Margin",
        expression: "round((item.high * 0.98) - item.low)",
        type: "number",
        format: "currency",
        enabled: true,
        group: "Profit",
        description: "Potential profit per item after 2% GE tax"
    },
    {
        id: "volume",
        name: "Daily Volume",
        expression: "item.volume",
        type: "number",
        format: "currency",
        enabled: true,
        group: "Volume",
        description: "Total number of items traded in the last 24 hours"
    },
    {
        id: "potentialProfit",
        name: "Potential Profit",
        expression: "item.limit * round((item.high * 0.98) - item.low)",
        type: "number",
        format: "currency",
        enabled: true,
        group: "Profit",
        description: "Max potential profit per 4 hours (Limit * Margin)"
    },
    {
        id: "marginVolume",
        name: "Margin * Volume",
        expression: "item.volume * round((item.high * 0.98) - item.low)",
        type: "number",
        format: "currency",
        enabled: true,
        group: "Profit",
        description: "Potential daily profit (Volume * Margin)"
    },

    // Disabled / Other Columns
    {
        id: "itemId",
        name: "ID",
        expression: "item.id",
        type: "number",
        format: "decimal",
        enabled: false,
        group: "Core",
        description: "The unique item ID"
    },
    {
        id: "highTimeDelta",
        name: "High Time Delta",
        expression: "now - item.highTime",
        type: "number",
        format: "decimal",
        enabled: false,
        group: "Core",
        description: "Seconds since last high price update"
    },
    {
        id: "lowTimeDelta",
        name: "Low Time Delta",
        expression: "now - item.lowTime",
        type: "number",
        format: "decimal",
        enabled: false,
        group: "Core",
        description: "Seconds since last low price update"
    },
    {
        id: "total5mVol",
        name: "5m Vol",
        expression: "item.highVol5m + item.lowVol5m",
        type: "number",
        format: "currency",
        enabled: false,
        group: "Volume",
        description: "Total volume traded in the last 5 minutes"
    },
    {
        id: "total1hVol",
        name: "1h Vol",
        expression: "item.highVol1h + item.lowVol1h",
        type: "number",
        format: "currency",
        enabled: false,
        group: "Volume",
        description: "Total volume traded in the last hour"
    },
    {
        id: "total6hVol",
        name: "6h Vol",
        expression: "item.highVol6h + item.lowVol6h",
        type: "number",
        format: "currency",
        enabled: false,
        group: "Volume",
        description: "Total volume traded in the last 6 hours"
    },
    {
        id: "total24hVol",
        name: "24h Vol (Calc)",
        expression: "item.highVol24h + item.lowVol24h",
        type: "number",
        format: "currency",
        enabled: false,
        group: "Volume",
        description: "Total volume traded in the last 24 hours (calculated from high/low)"
    },
    {
        id: "volRatio",
        name: "Vol Ratio",
        expression: "((item.highVol1h + item.lowVol1h) > 0) ? ((item.highVol5m + item.lowVol5m) / (item.highVol1h + item.lowVol1h)) : 0",
        type: "number",
        format: "decimal",
        enabled: false,
        group: "Volume",
        description: "Ratio of 5-minute to 1-hour volume"
    },
    {
        id: "avg5m",
        name: "5m Avg",
        expression: "item.avg5m",
        type: "number",
        format: "currency",
        enabled: false,
        group: "Averages",
        description: "Average price over the last 5 minutes"
    },
    {
        id: "avg1h",
        name: "1h Avg",
        expression: "item.avg1h",
        type: "number",
        format: "currency",
        enabled: false,
        group: "Averages",
        description: "Average price over the last hour"
    },
    {
        id: "avg6h",
        name: "6h Avg",
        expression: "item.avg6h",
        type: "number",
        format: "currency",
        enabled: false,
        group: "Averages",
        description: "Average price over the last 6 hours"
    },
    {
        id: "avg24h",
        name: "24h Avg",
        expression: "item.avg24h",
        type: "number",
        format: "currency",
        enabled: false,
        group: "Averages",
        description: "Average price over the last 24 hours"
    },
    {
        id: "buyPressure5m",
        name: "Buy Pressure (5m)",
        expression: "((item.highVol5m + item.lowVol5m) > 0) ? (item.highVol5m / (item.highVol5m + item.lowVol5m)) * 100 : 0",
        type: "number",
        format: "percentage",
        enabled: false,
        group: "Pressure",
        description: "Percentage of 5m volume that was buy orders"
    },
    {
        id: "sellPressure5m",
        name: "Sell Pressure (5m)",
        expression: "((item.highVol5m + item.lowVol5m) > 0) ? (item.lowVol5m / (item.highVol5m + item.lowVol5m)) * 100 : 0",
        type: "number",
        format: "percentage",
        enabled: false,
        group: "Pressure",
        description: "Percentage of 5m volume that was sell orders"
    },
    {
        id: "buyPressure1h",
        name: "Buy Pressure (1h)",
        expression: "((item.highVol1h + item.lowVol1h) > 0) ? (item.highVol1h / (item.highVol1h + item.lowVol1h)) * 100 : 0",
        type: "number",
        format: "percentage",
        enabled: false,
        group: "Pressure",
        description: "Percentage of 1h volume that was buy orders"
    },
    {
        id: "sellPressure1h",
        name: "Sell Pressure (1h)",
        expression: "((item.highVol1h + item.lowVol1h) > 0) ? (item.lowVol1h / (item.highVol1h + item.lowVol1h)) * 100 : 0",
        type: "number",
        format: "percentage",
        enabled: false,
        group: "Pressure",
        description: "Percentage of 1h volume that was sell orders"
    },
    {
        id: "buyPressure6h",
        name: "Buy Pressure (6h)",
        expression: "((item.highVol6h + item.lowVol6h) > 0) ? (item.highVol6h / (item.highVol6h + item.lowVol6h)) * 100 : 0",
        type: "number",
        format: "percentage",
        enabled: false,
        group: "Pressure",
        description: "Percentage of 6h volume that was buy orders"
    },
    {
        id: "sellPressure6h",
        name: "Sell Pressure (6h)",
        expression: "((item.highVol6h + item.lowVol6h) > 0) ? (item.lowVol6h / (item.highVol6h + item.lowVol6h)) * 100 : 0",
        type: "number",
        format: "percentage",
        enabled: false,
        group: "Pressure",
        description: "Percentage of 6h volume that was sell orders"
    },
    {
        id: "buyPressure24h",
        name: "Buy Pressure (24h)",
        expression: "((item.highVol24h + item.lowVol24h) > 0) ? (item.highVol24h / (item.highVol24h + item.lowVol24h)) * 100 : 0",
        type: "number",
        format: "percentage",
        enabled: false,
        group: "Pressure",
        description: "Percentage of 24h volume that was buy orders"
    },
    {
        id: "sellPressure24h",
        name: "Sell Pressure (24h)",
        expression: "((item.highVol24h + item.lowVol24h) > 0) ? (item.lowVol24h / (item.highVol24h + item.lowVol24h)) * 100 : 0",
        type: "number",
        format: "percentage",
        enabled: false,
        group: "Pressure",
        description: "Percentage of 24h volume that was sell orders"
    },
    {
        id: "alchValue",
        name: "High Alch",
        expression: "item.highalch",
        type: "number",
        format: "currency",
        enabled: false,
        group: "Alchemy",
        description: "High alchemy value of the item"
    },
    {
        id: "alchMargin",
        name: "Alch Margin",
        expression: "item.highalch > 0 ? round(item.highalch - item.low) : 0",
        type: "number",
        format: "currency",
        enabled: false,
        group: "Alchemy",
        description: "Profit from high alching after buying at current price"
    },
    {
        id: "priceDropStrength",
        name: "Price Drop Strength",
        expression: "(item.avg5m > 0 and item.avg1h > 0 ? max(0, (item.avg1h - item.avg5m) / item.avg1h) : 0)",
        type: "number",
        format: "decimal",
        enabled: false,
        group: "Market Signals",
        description: "Combined short-term price drop + sell pressure surge"
    },
    {
        id: "priceSpikeStrength",
        name: "Price Spike Strength",
        expression: "(item.avg5m > 0 and item.avg1h > 0 ? max(0, (item.avg5m - item.avg1h) / item.avg1h) : 0)",
        type: "number",
        format: "decimal",
        enabled: false,
        group: "Market Signals",
        description: "Combined short-term price drop + sell pressure surge"
    },
    {
        id: "currentPriceDrop",
        name: "Current Price Drop",
        expression: "(item.high > 0 and item.low > 0 ? max(0, (item.high - item.low) / item.high) : 0)",
        type: "number",
        format: "decimal",
        enabled: false,
        group: "Market Signals",
        description: "Combined short-term price drop + sell pressure surge"
    },
    {
        id: "currentPriceSpike",
        name: "Current Price Spike",
        expression: "(item.high > 0 and item.low > 0 ? max(0, (item.low - item.high) / item.low) : 0)",
        type: "number",
        format: "decimal",
        enabled: false,
        group: "Market Signals",
        description: "Combined short-term price drop + sell pressure surge"
    },
    {
        id: "sellPressureDelta",
        name: "Sell Pressure Delta",
        expression: "(item.lowVol1h > 0 ? ((item.lowVol5m - item.lowVol1h) / item.lowVol1h) : 0)",
        type: "number",
        format: "decimal",
        enabled: false,
        group: "Market Signals",
        description: "Combined short-term price drop + sell pressure surge"
    },
    {
        id: "buyPressureDelta",
        name: "Buy Pressure Delta",
        expression: "(item.highVol1h > 0 ? ((item.highVol5m - item.highVol1h) / item.highVol1h) : 0)",
        type: "number",
        format: "decimal",
        enabled: false,
        group: "Market Signals",
        description: "Combined short-term price drop + sell pressure surge"
    },
    {
        id: "volatilityRatio",
        name: "Volatility Ratio",
        expression: "(item.avg1h > 0 and item.avg24h > 0 ? abs((item.avg1h - item.avg24h) / item.avg24h) : 0)",
        type: "number",
        format: "decimal",
        enabled: false,
        group: "Market Signals",
        description: "Combined short-term price drop + sell pressure surge"
    },
    {
        id: "supplyShockRisk",
        name: "Supply Shock Risk",
        expression: "(item.lowVol5m > 0 and item.lowVol1h > 0 and item.avg5m == item.avg1h ? max(0, (item.lowVol5m / item.lowVol1h) - 1) : 0)",
        type: "number",
        format: "decimal",
        enabled: false,
        group: "Market Signals",
        description: "Combined short-term price drop + sell pressure surge"
    },
    {
        id: "flipScore",
        name: "2h Flip Score",
        expression: "max(0, ((item.avg24h > 0 ? abs((item.avg1h - item.avg24h)/item.avg24h) : 0) * 0.5) + (item.avg1h > 0 ? abs((item.avg5m - item.avg1h)/item.avg1h) : 0) + (item.low > 0 and item.high > 0 ? abs((item.low - item.high)/item.high) : 0) + ((item.highVol5m + item.lowVol5m) > 0 ? ((item.highVol5m - item.highVol1h)/max(1,item.highVol1h)) : 0)))",
        type: "number",
        format: "decimal",
        group: "Market Signals",
        description: "Predictive score for 2-hour flip potential (higher = more likely profitable)",
        enabled: false
    },
    {
        id: "suggestedQuantity",
        name: "Suggested Quantity",
        expression: "min(item.limit, max(1, floor(((item.volume / 24) + (item.highVol1h + item.lowVol1h)/2) * 0.5)))",
        type: "number",
        format: "decimal",
        group: "Market Signals",
        description: "Recommended buy quantity based on item limit and recent trading volume",
        enabled: false
    }
];
