"use client";

import React, { useState, memo, useEffect } from "react";
import Link from "next/link";
import { ProcessedItem } from "@/lib/types";
import { getItemImageUrl } from "@/lib/api";
import { ImageOff } from "lucide-react";
import { CustomColumn } from "@/lib/columns/types";
import { evaluateColumn, formatColumnValue } from "@/lib/columns/engine";
import { TimeseriesCache } from "@/lib/timeseries/cache";
import { Spinner } from "./Spinner";

interface ItemImageProps {
    name: string;
}

const ItemImage = memo(({ name }: ItemImageProps) => {
    const [error, setError] = useState(false);
    const src = getItemImageUrl(name);

    if (error) {
        return (
            <div className="w-6 h-6 flex items-center justify-center bg-[#c0a886] rounded-full" title={name}>
                <ImageOff className="w-4 h-4 text-[#5a3820] opacity-60" />
            </div>
        );
    }

    return (
        <img
            className="w-6 h-6 inline-block align-middle"
            src={src}
            alt={name}
            onError={() => setError(true)}
        />
    );
});

ItemImage.displayName = "ItemImage";

export interface TableRowProps {
    item: ProcessedItem;
    columns: CustomColumn[];
    cache?: TimeseriesCache;
}

const TableRow = memo(({ item, columns, cache }: TableRowProps) => {
    const enabledColumns = React.useMemo(() => columns.filter(c => c.enabled), [columns]);
    const [loadingColumns, setLoadingColumns] = useState<Set<string>>(new Set());
    const [updateTrigger, setUpdateTrigger] = useState(0);

    // Subscribe to this item's timeseries updates
    useEffect(() => {
        if (!cache) return;

        return cache.subscribeToItem(item.id, (interval, data) => {
            // When data for this item arrives, trigger re-evaluation
            const affectedCols = columns.filter(col =>
                col.expression.includes(`timeseries(item.id, '${interval}')`)
            );

            if (affectedCols.length > 0) {
                // Remove loading state for affected columns
                setLoadingColumns(prev => {
                    const next = new Set(prev);
                    affectedCols.forEach(col => next.delete(col.id));
                    return next;
                });

                // Trigger re-render
                setUpdateTrigger(prev => prev + 1);
            }
        });
    }, [item.id, cache, columns]);

    // Check which columns are loading on mount and when columns change
    useEffect(() => {
        if (!cache) return;

        const checkLoading = async () => {
            const timeseriesCols = enabledColumns.filter(c =>
                c.expression.includes('timeseries(')
            );

            const loading = new Set<string>();

            for (const col of timeseriesCols) {
                // Extract interval from expression
                const match = col.expression.match(/timeseries\([^,]+,\s*['"]([^'"]+)['"]/);
                if (match) {
                    const interval = match[1];
                    const data = await cache.get(item.id, interval);

                    if (data === null) {
                        // Mark as loading - pre-fetch from FlippingTable will request it
                        loading.add(col.id);
                    }
                }
            }

            setLoadingColumns(loading);
        };

        checkLoading();
    }, [item.id, cache, enabledColumns]);

    return (
        <tr className="even:bg-[#dfd5c1] hover:bg-[#f0e6d2] transition-colors">
            {/* Fixed Image Column */}
            <td className="p-3 border-b border-[#c9bca0]">
                <Link
                    href={`/item/${item.id}`}
                    target="_blank"
                    className="w-6 h-6 flex items-center justify-center text-inherit no-underline"
                >
                    <ItemImage name={item.name} />
                </Link>
            </td>

            {enabledColumns.map((col) => {
                const value = evaluateColumn(col, { item, cache }, columns, cache);
                const formatted = formatColumnValue(value, col);
                const isLoading = loadingColumns.has(col.id) && value === null;

                if (col.id === "name") {
                    return (
                        <td key={col.id} className="p-3 border-b border-[#c9bca0]">
                            <Link
                                href={`/item/${item.id}`}
                                target="_blank"
                                className="text-inherit no-underline hover:underline font-medium"
                            >
                                {formatted}
                            </Link>
                        </td>
                    );
                }

                if (col.id === "profit" || col.id === "alchMargin") {
                    const numVal = Number(value);
                    const colorClass = numVal >= 0 ? "text-green-700 font-bold" : "text-red-700 font-bold";
                    return (
                        <td key={col.id} className="p-3 border-b border-[#c9bca0]">
                            {isLoading ? (
                                <Spinner size="sm" />
                            ) : (
                                <span className={colorClass}>{formatted}</span>
                            )}
                        </td>
                    );
                }

                return (
                    <td key={col.id} className="p-3 border-b border-[#c9bca0]">
                        {isLoading ? <Spinner size="sm" /> : formatted}
                    </td>
                );
            })}
        </tr>
    );
}, (prevProps, nextProps) => {
    // Only re-render if item ID changes or columns change
    if (prevProps.item.id !== nextProps.item.id) return false;

    const prevEnabled = prevProps.columns.filter(c => c.enabled).map(c => c.id).join(",");
    const nextEnabled = nextProps.columns.filter(c => c.enabled).map(c => c.id).join(",");
    if (prevEnabled !== nextEnabled) return false;

    if (prevProps.item !== nextProps.item) return false;
    if (prevProps.cache !== nextProps.cache) return false;

    return true;
});

TableRow.displayName = "TableRow";

export default TableRow;
