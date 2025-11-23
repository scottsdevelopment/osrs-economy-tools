import { Parser } from "expr-eval";
import { CustomColumn, ColumnContext } from "./types";
import { TimeseriesCache } from "../timeseries/cache";

const parser = new Parser();
// Cache parsed expressions to avoid re-parsing for every item
const expressionCache = new Map<string, any>();

// Array utility functions for building custom indicators
parser.functions.slice = (arr: any[], start: number, end?: number) => {
    if (!Array.isArray(arr)) return [];
    return arr.slice(start, end);
};

parser.functions.sum = (arr: any[]) => {
    if (!Array.isArray(arr)) return 0;
    return arr.reduce((a, b) => a + (Number(b) || 0), 0);
};

parser.functions.avg = (arr: any[]) => {
    if (!Array.isArray(arr) || arr.length === 0) return null;
    const values = arr.filter(v => v !== null && v !== undefined);
    if (values.length === 0) return null;
    return parser.functions.sum(values) / values.length;
};

parser.functions.length = (arr: any[]) => {
    if (!Array.isArray(arr)) return 0;
    return arr.length;
};

parser.functions.field = (arr: any[], fieldName: string) => {
    if (!Array.isArray(arr)) return [];
    return arr.map(item => item?.[fieldName]).filter(v => v !== null && v !== undefined);
};

// Helper to safely evaluate with async timeseries support
export function evaluateColumn(
    column: CustomColumn,
    context: ColumnContext,
    allColumns: CustomColumn[] = [],
    cache?: TimeseriesCache,
    onUpdate?: () => void,
    depth = 0
): any {
    if (depth > 10) {
        console.warn(`Circular dependency detected for column ${column.name}`);
        return null;
    }

    try {
        let expr = expressionCache.get(column.expression);
        if (!expr) {
            expr = parser.parse(column.expression);
            expressionCache.set(column.expression, expr);
        }

        // Create a proxy for 'columns' to lazily evaluate dependencies
        const columnsProxy = new Proxy({}, {
            get: (target, prop) => {
                if (typeof prop === "string") {
                    const depCol = allColumns.find(c => c.id === prop);
                    if (depCol) {
                        return evaluateColumn(depCol, context, allColumns, cache, onUpdate, depth + 1);
                    }
                }
                return undefined;
            }
        });

        // Register timeseries function - SYNC ONLY (checks memory cache)
        const timeseriesFunc = (itemId: number, interval: string) => {
            if (!cache) return null;
            return cache.getSync(itemId, interval);
        };

        // Extend context with columns proxy and timeseries function
        const evalContext = {
            ...context,
            columns: columnsProxy,
            timeseries: timeseriesFunc,
            now: Math.floor(Date.now() / 1000)
        };

        return expr.evaluate(evalContext);
    } catch (error) {
        console.warn(`Error evaluating column ${column.name}:`, error);
        return null;
    }
}

export function validateExpression(expression: string): boolean {
    try {
        parser.parse(expression);
        return true;
    } catch (e) {
        return false;
    }
}

export function formatColumnValue(value: any, column: CustomColumn): string {
    if (value === null || value === undefined) return "-";

    if (column.type === "number") {
        const num = Number(value);
        if (isNaN(num)) return "-";

        switch (column.format) {
            case "currency":
                return num.toLocaleString();
            case "percentage":
                return `${num.toFixed(2)}%`;
            case "decimal":
                return num.toFixed(2);
            case "relativeTime": {
                const now = Math.floor(Date.now() / 1000);
                const diff = now - num;
                if (diff < 60) return `${diff}s ago`;
                if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
                if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
                return `${Math.floor(diff / 86400)}d ago`;
            }
            default:
                return num.toLocaleString();
        }
    }

    return String(value);
}
