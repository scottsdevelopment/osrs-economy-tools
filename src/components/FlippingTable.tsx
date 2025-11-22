"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ProcessedItem } from "@/lib/types";
import { getItemImageUrl } from "@/lib/api";
import { ArrowUp, ArrowDown } from "lucide-react";
import "./FlippingTable.scss";

interface FlippingTableProps {
    items: ProcessedItem[];
}

type SortKey = keyof ProcessedItem;
type SortDirection = "asc" | "desc";

interface SortState {
    key: SortKey;
    direction: SortDirection;
}

export default function FlippingTable({ items }: FlippingTableProps) {
    const [sort, setSort] = useState<SortState>({ key: "profit", direction: "desc" });

    const handleSort = (key: SortKey) => {
        setSort((prev) => ({
            key,
            direction: prev.key === key && prev.direction === "desc" ? "asc" : "desc",
        }));
    };

    const sortedItems = [...items].sort((a, b) => {
        const aVal = a[sort.key];
        const bVal = b[sort.key];

        if (aVal === null && bVal === null) return 0;
        if (aVal === null) return 1;
        if (bVal === null) return -1;

        if (typeof aVal === "string" && typeof bVal === "string") {
            return sort.direction === "asc"
                ? aVal.localeCompare(bVal)
                : bVal.localeCompare(aVal);
        }

        if (typeof aVal === "number" && typeof bVal === "number") {
            return sort.direction === "asc" ? aVal - bVal : bVal - aVal;
        }

        return 0;
    });

    const displayedItems = sortedItems.slice(0, 50);

    const SortIcon = ({ column }: { column: SortKey }) => {
        if (sort.key !== column) return null;
        return sort.direction === "asc" ? (
            <ArrowUp className="inline w-3 h-3 ml-1" />
        ) : (
            <ArrowDown className="inline w-3 h-3 ml-1" />
        );
    };

    const headers: { key: SortKey; label: string; tooltip?: string }[] = [
        { key: "name", label: "Item", tooltip: "The name of the item" },
        { key: "low", label: "Buy (Low)", tooltip: "Current lowest price someone is selling for (instant buy)" },
        { key: "high", label: "Sell (High)", tooltip: "Current highest price someone is buying for (instant sell)" },
        { key: "profit", label: "Profit (GP)", tooltip: "Potential profit per item after tax (High * 0.98 - Low)" },
        { key: "limit", label: "Limit", tooltip: "Grand Exchange buy limit every 4 hours" },
        { key: "roi", label: "ROI %", tooltip: "Return on Investment percentage" },
        { key: "volume", label: "Vol (24h)", tooltip: "Total number of items traded in the last 24 hours" },
        { key: "avg5m", label: "5m Avg", tooltip: "Average price over the last 5 minutes" },
        { key: "total5mVol", label: "5m Vol", tooltip: "Total volume traded in the last 5 minutes" },
        { key: "avg1h", label: "1h Avg", tooltip: "Average price over the last hour" },
        { key: "total1hVol", label: "1h Vol", tooltip: "Total volume traded in the last hour" },
        { key: "buyPressure5m", label: "5m Buy %", tooltip: "% of 5m volume that was bought (indicates demand)" },
        { key: "sellPressure5m", label: "5m Sell %", tooltip: "% of 5m volume that was sold (indicates supply)" },
        { key: "buyPressure1h", label: "1h Buy %", tooltip: "% of 1h volume that was bought" },
        { key: "sellPressure1h", label: "1h Sell %", tooltip: "% of 1h volume that was sold" },
        { key: "volRatio", label: "5m/1h Ratio", tooltip: "Ratio of 5m volume to 1h volume (higher means spiking activity)" },
        { key: "alchValue", label: "High Alch", tooltip: "Value of the item when cast with High Level Alchemy" },
        { key: "alchMargin", label: "Alch Margin", tooltip: "Profit from High Alchemy (Alch Value - Buy Price - Nature Rune cost)" },
    ];

    if (items.length === 0) {
        return (
            <div className="text-center p-4">
                No items match the current filters.
            </div>
        );
    }

    return (
        <table id="flip-table">
            <thead>
                <tr>
                    <th style={{ width: "40px" }}></th>
                    {headers.map((h) => (
                        <th
                            key={h.key}
                            data-sort={h.key}
                            data-tooltip={h.tooltip}
                            onClick={() => handleSort(h.key)}
                            className={sort.key === h.key ? (sort.direction === "asc" ? "sorted-asc" : "sorted-desc") : ""}
                        >
                            {h.label}
                            <SortIcon column={h.key} />
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {displayedItems.map((item) => (
                    <tr key={item.id}>
                        <td>
                            <Link
                                href={`/item/${item.id}`}
                                target="_blank"
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "inherit",
                                    textDecoration: "none",
                                }}
                            >
                                <img
                                    className="item-icon"
                                    src={getItemImageUrl(item.name)}
                                    alt={item.name}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = "none";
                                    }}
                                />
                            </Link>
                        </td>
                        <td>
                            <Link
                                href={`/item/${item.id}`}
                                target="_blank"
                                style={{ color: "inherit", textDecoration: "none" }}
                            >
                                {item.name}
                            </Link>
                        </td>
                        <td>{item.low.toLocaleString()}</td>
                        <td>{item.high.toLocaleString()}</td>
                        <td>
                            <span className={item.profit >= 0 ? "value-positive" : "value-negative"}>
                                {item.profit.toLocaleString()}
                            </span>
                        </td>
                        <td>{item.limit}</td>
                        <td>{item.roi}%</td>
                        <td>{item.volume.toLocaleString()}</td>
                        <td>{typeof item.avg5m === "number" ? item.avg5m.toLocaleString() : "-"}</td>
                        <td>{item.total5mVol.toLocaleString()}</td>
                        <td>{typeof item.avg1h === "number" ? item.avg1h.toLocaleString() : "-"}</td>
                        <td>{item.total1hVol.toLocaleString()}</td>
                        <td>{Math.round(item.buyPressure5m)}%</td>
                        <td>{Math.round(item.sellPressure5m)}%</td>
                        <td>{Math.round(item.buyPressure1h)}%</td>
                        <td>{Math.round(item.sellPressure1h)}%</td>
                        <td>{item.volRatio.toFixed(3)}</td>
                        <td>{item.alchValue ? item.alchValue.toLocaleString() : "-"}</td>
                        <td>
                            {item.alchMargin !== null ? (
                                <span className={item.alchMargin >= 0 ? "value-positive" : "value-negative"}>
                                    {item.alchMargin.toLocaleString()}
                                </span>
                            ) : (
                                "-"
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
