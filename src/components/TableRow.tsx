"use client";

import React, { useState, memo } from "react";
import Link from "next/link";
import { ProcessedItem } from "@/lib/types";
import { getItemImageUrl } from "@/lib/api";
import { ImageOff } from "lucide-react";

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
    visibleColumns: Record<string, boolean>;
}

const TableRow = memo(({ item, visibleColumns }: TableRowProps) => {
    const isVisible = (key: string) => visibleColumns[key] ?? true;

    return (
        <tr className="even:bg-[#dfd5c1] hover:bg-[#f0e6d2] transition-colors">
            {/* Item Image */}
            <td className="p-3 border-b border-[#c9bca0]">
                <Link
                    href={`/item/${item.id}`}
                    target="_blank"
                    className="w-6 h-6 flex items-center justify-center text-inherit no-underline"
                >
                    <ItemImage name={item.name} />
                </Link>
            </td>

            {/* Item Name */}
            {isVisible("name") && (
                <td className="p-3 border-b border-[#c9bca0]">
                    <Link
                        href={`/item/${item.id}`}
                        target="_blank"
                        className="text-inherit no-underline hover:underline font-medium"
                    >
                        {item.name}
                    </Link>
                </td>
            )}

            {/* Buy (Low) */}
            {isVisible("low") && (
                <td className="p-3 border-b border-[#c9bca0]">{item.low.toLocaleString()}</td>
            )}

            {/* Sell (High) */}
            {isVisible("high") && (
                <td className="p-3 border-b border-[#c9bca0]">{item.high.toLocaleString()}</td>
            )}

            {/* Profit */}
            {isVisible("profit") && (
                <td className="p-3 border-b border-[#c9bca0]">
                    <span className={item.profit >= 0 ? "text-green-700 font-bold" : "text-red-700 font-bold"}>
                        {item.profit.toLocaleString()}
                    </span>
                </td>
            )}

            {/* Limit */}
            {isVisible("limit") && (
                <td className="p-3 border-b border-[#c9bca0]">{item.limit}</td>
            )}

            {/* ROI */}
            {isVisible("roi") && (
                <td className="p-3 border-b border-[#c9bca0]">{item.roi}%</td>
            )}

            {/* Volume (24h) */}
            {isVisible("volume") && (
                <td className="p-3 border-b border-[#c9bca0]">{item.volume.toLocaleString()}</td>
            )}

            {/* 5m Avg */}
            {isVisible("avg5m") && (
                <td className="p-3 border-b border-[#c9bca0]">
                    {typeof item.avg5m === "number" ? item.avg5m.toLocaleString() : "-"}
                </td>
            )}

            {/* 5m Vol */}
            {isVisible("total5mVol") && (
                <td className="p-3 border-b border-[#c9bca0]">{item.total5mVol.toLocaleString()}</td>
            )}

            {/* 1h Avg */}
            {isVisible("avg1h") && (
                <td className="p-3 border-b border-[#c9bca0]">
                    {typeof item.avg1h === "number" ? item.avg1h.toLocaleString() : "-"}
                </td>
            )}

            {/* 1h Vol */}
            {isVisible("total1hVol") && (
                <td className="p-3 border-b border-[#c9bca0]">{item.total1hVol.toLocaleString()}</td>
            )}

            {/* 5m Buy % */}
            {isVisible("buyPressure5m") && (
                <td className="p-3 border-b border-[#c9bca0]">{Math.round(item.buyPressure5m)}%</td>
            )}

            {/* 5m Sell % */}
            {isVisible("sellPressure5m") && (
                <td className="p-3 border-b border-[#c9bca0]">{Math.round(item.sellPressure5m)}%</td>
            )}

            {/* 1h Buy % */}
            {isVisible("buyPressure1h") && (
                <td className="p-3 border-b border-[#c9bca0]">{Math.round(item.buyPressure1h)}%</td>
            )}

            {/* 1h Sell % */}
            {isVisible("sellPressure1h") && (
                <td className="p-3 border-b border-[#c9bca0]">{Math.round(item.sellPressure1h)}%</td>
            )}

            {/* 5m/1h Ratio */}
            {isVisible("volRatio") && (
                <td className="p-3 border-b border-[#c9bca0]">{item.volRatio.toFixed(3)}</td>
            )}

            {/* High Alch */}
            {isVisible("alchValue") && (
                <td className="p-3 border-b border-[#c9bca0]">
                    {item.alchValue ? item.alchValue.toLocaleString() : "-"}
                </td>
            )}

            {/* Alch Margin */}
            {isVisible("alchMargin") && (
                <td className="p-3 border-b border-[#c9bca0]">
                    {item.alchMargin !== null ? (
                        <span className={item.alchMargin >= 0 ? "text-green-700 font-bold" : "text-red-700 font-bold"}>
                            {item.alchMargin.toLocaleString()}
                        </span>
                    ) : (
                        "-"
                    )}
                </td>
            )}
        </tr>
    );
}, (prevProps, nextProps) => {
    // Only re-render if the actual item data values changed
    // Compare all relevant properties that are displayed in the row
    const prevItem = prevProps.item;
    const nextItem = nextProps.item;

    // First check if it's the same item by ID
    if (prevItem.id !== nextItem.id) {
        return false; // Different item, need to re-render
    }

    // Check if any displayed values changed
    const valuesEqual =
        prevItem.name === nextItem.name &&
        prevItem.low === nextItem.low &&
        prevItem.high === nextItem.high &&
        prevItem.profit === nextItem.profit &&
        prevItem.limit === nextItem.limit &&
        prevItem.roi === nextItem.roi &&
        prevItem.volume === nextItem.volume &&
        prevItem.avg5m === nextItem.avg5m &&
        prevItem.total5mVol === nextItem.total5mVol &&
        prevItem.avg1h === nextItem.avg1h &&
        prevItem.total1hVol === nextItem.total1hVol &&
        prevItem.buyPressure5m === nextItem.buyPressure5m &&
        prevItem.sellPressure5m === nextItem.sellPressure5m &&
        prevItem.buyPressure1h === nextItem.buyPressure1h &&
        prevItem.sellPressure1h === nextItem.sellPressure1h &&
        prevItem.volRatio === nextItem.volRatio &&
        prevItem.alchValue === nextItem.alchValue &&
        prevItem.alchMargin === nextItem.alchMargin;

    // Check if visible columns changed
    const columnsEqual = JSON.stringify(prevProps.visibleColumns) === JSON.stringify(nextProps.visibleColumns);

    // Only skip re-render if both values and columns are equal
    return valuesEqual && columnsEqual;
});

TableRow.displayName = "TableRow";

export default TableRow;
