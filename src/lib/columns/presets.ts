import { CustomColumn } from "./types";

export const PRESET_COLUMNS: CustomColumn[] = [
    // Core Item Data
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
        id: "low",
        name: "Buy (Low)",
        expression: "item.low",
        type: "number",
        format: "currency",
        enabled: true,
        group: "Core",
        description: "Current lowest price someone is selling for (instant buy)"
    },
    {
        id: "high",
        name: "Sell (High)",
        expression: "item.high",
        type: "number",
        format: "currency",
        enabled: true,
        group: "Core",
        description: "Current highest price someone is buying for (instant sell)"
    },
    {
        id: "limit",
        name: "Limit",
        expression: "item.limit",
        type: "number",
        format: "currency",
        enabled: true,
        group: "Core",
        description: "Grand Exchange buy limit every 4 hours"
    },
    {
        id: "highTime",
        name: "High Time",
        expression: "item.highTime",
        type: "number",
        format: "relativeTime",
        enabled: false,
        group: "Core",
        description: "Time of the latest high price update"
    },
    {
        id: "lowTime",
        name: "Low Time",
        expression: "item.lowTime",
        type: "number",
        format: "relativeTime",
        enabled: false,
        group: "Core",
        description: "Time of the latest low price update"
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

    // Calculated Columns - Profit & ROI
    {
        id: "profit",
        name: "Profit (GP)",
        expression: "round((item.high * 0.98) - item.low)",
        type: "number",
        format: "currency",
        enabled: true,
        group: "Core",
        description: "Potential profit per item after 2% GE tax"
    },
    {
        id: "roi",
        name: "ROI %",
        expression: "(((item.high * 0.98) - item.low) / item.low) * 100",
        type: "number",
        format: "percentage",
        enabled: true,
        group: "Core",
        description: "Return on Investment percentage after tax"
    },

    // Volume
    {
        id: "volume",
        name: "Vol (24h)",
        expression: "item.volume",
        type: "number",
        format: "currency",
        enabled: true,
        group: "Volume",
        description: "Total number of items traded in the last 24 hours"
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
        id: "volRatio",
        name: "Vol Ratio",
        expression: "((item.highVol1h + item.lowVol1h) > 0) ? ((item.highVol5m + item.lowVol5m) / (item.highVol1h + item.lowVol1h)) : 0",
        type: "number",
        format: "decimal",
        enabled: false,
        group: "Volume",
        description: "Ratio of 5-minute to 1-hour volume"
    },

    // Averages
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

    // Pressure Indicators
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

    // Alchemy
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

    // Technical Indicators - Using utility functions
    // {
    //     id: "sma7_high",
    //     name: "SMA(7) High",
    //     expression: "round(avg(slice(field(timeseries(item.id, '24h'), 'avgHighPrice'), 0, 7)))",
    //     type: "number",
    //     format: "currency",
    //     enabled: false,
    //     isPreset: true,
    //     group: "Technical",
    //     description: "7-day Simple Moving Average of high prices"
    // },
    // {
    //     id: "sma7_low",
    //     name: "SMA(7) Low",
    //     expression: "round(avg(slice(field(timeseries(item.id, '24h'), 'avgLowPrice'), 0, 7)))",
    //     type: "number",
    //     format: "currency",
    //     enabled: false,
    //     isPreset: true,
    //     group: "Technical",
    //     description: "7-day Simple Moving Average of low prices"
    // },
    // {
    //     id: "sma14",
    //     name: "SMA(14)",
    //     expression: "round(avg(slice(field(timeseries(item.id, '24h'), 'avgHighPrice'), 0, 14)))",
    //     type: "number",
    //     format: "currency",
    //     enabled: false,
    //     isPreset: true,
    //     group: "Technical",
    //     description: "14-day Simple Moving Average of high prices"
    // },
    // {
    //     id: "price_vs_sma7",
    //     name: "Price vs SMA(7)",
    //     expression: "((item.high - avg(slice(field(timeseries(item.id, '24h'), 'avgHighPrice'), 0, 7))) / avg(slice(field(timeseries(item.id, '24h'), 'avgHighPrice'), 0, 7))) * 100",
    //     type: "number",
    //     format: "percentage",
    //     enabled: false,
    //     isPreset: true,
    //     group: "Technical",
    //     description: "Current price percentage difference from 7-day SMA"
    // }
];
