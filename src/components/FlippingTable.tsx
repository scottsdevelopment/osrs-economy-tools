"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ProcessedItem } from "@/lib/types";
import { ArrowUp, ArrowDown } from "lucide-react";
import Tooltip from "./Tooltip";
import Pagination from "./Pagination";
import ColumnToggle, { ColumnDefinition } from "./ColumnToggle";
import TableRow from "./TableRow";

interface FlippingTableProps {
    items: ProcessedItem[];
}

type SortKey = keyof ProcessedItem;
type SortDirection = "asc" | "desc";

interface SortState {
    key: SortKey;
    direction: SortDirection;
}

const STORAGE_KEY = "osrs-flipper-columns";
const DEFAULT_PAGE_SIZE = 50;

// Define default visible columns
const DEFAULT_VISIBLE_COLUMNS: Record<string, boolean> = {
    name: true,
    low: true,
    high: true,
    profit: true,
    limit: true,
    roi: true,
    volume: true,
    avg5m: false,
    total5mVol: false,
    avg1h: false,
    total1hVol: false,
    buyPressure5m: false,
    sellPressure5m: false,
    buyPressure1h: false,
    sellPressure1h: false,
    volRatio: false,
    alchValue: false,
    alchMargin: false,
};

export default function FlippingTable({ items }: FlippingTableProps) {
    const [sort, setSort] = useState<SortState>({ key: "profit", direction: "desc" });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_PAGE_SIZE);
    const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(DEFAULT_VISIBLE_COLUMNS);

    // Load column preferences from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed.version === 1 && parsed.columns) {
                    setVisibleColumns(parsed.columns);
                }
            }
        } catch (error) {
            console.error("Failed to load column preferences:", error);
        }
    }, []);

    // Save column preferences to localStorage
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                version: 1,
                columns: visibleColumns,
            }));
        } catch (error) {
            console.error("Failed to save column preferences:", error);
        }
    }, [visibleColumns]);

    const handleSort = useCallback((key: SortKey) => {
        setSort((prev) => ({
            key,
            direction: prev.key === key && prev.direction === "desc" ? "asc" : "desc",
        }));
        setCurrentPage(1); // Reset to first page when sorting
    }, []);

    // Memoize sorted items
    const sortedItems = useMemo(() => {
        return [...items].sort((a, b) => {
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
    }, [items, sort]);

    // Memoize paginated items
    const paginatedItems = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return sortedItems.slice(startIndex, endIndex);
    }, [sortedItems, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(sortedItems.length / itemsPerPage);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
    }, []);

    const handleItemsPerPageChange = useCallback((newItemsPerPage: number) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1); // Reset to first page
    }, []);

    const handleToggleColumn = useCallback((key: string) => {
        setVisibleColumns((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    }, []);

    const handleToggleAll = useCallback((visible: boolean) => {
        setVisibleColumns((prev) => {
            const updated = { ...prev };
            Object.keys(updated).forEach((key) => {
                updated[key] = visible;
            });
            return updated;
        });
    }, []);

    const handleResetToDefault = useCallback(() => {
        setVisibleColumns(DEFAULT_VISIBLE_COLUMNS);
    }, []);

    const SortIcon = ({ column }: { column: SortKey }) => {
        if (sort.key !== column) return null;
        return sort.direction === "asc" ? (
            <ArrowUp className="inline w-3 h-3 ml-1" />
        ) : (
            <ArrowDown className="inline w-3 h-3 ml-1" />
        );
    };

    const headers: { key: SortKey; label: string; tooltip?: string; group: string }[] = [
        { key: "name", label: "Item", tooltip: "The name of the item", group: "Core" },
        { key: "low", label: "Buy (Low)", tooltip: "Current lowest price someone is selling for (instant buy)", group: "Core" },
        { key: "high", label: "Sell (High)", tooltip: "Current highest price someone is buying for (instant sell)", group: "Core" },
        { key: "profit", label: "Profit (GP)", tooltip: "Potential profit per item after tax (High * 0.98 - Low)", group: "Core" },
        { key: "limit", label: "Limit", tooltip: "Grand Exchange buy limit every 4 hours", group: "Core" },
        { key: "roi", label: "ROI %", tooltip: "Return on Investment percentage", group: "Core" },
        { key: "volume", label: "Vol (24h)", tooltip: "Total number of items traded in the last 24 hours", group: "Volume" },
        { key: "avg5m", label: "5m Avg", tooltip: "Average price over the last 5 minutes", group: "Averages" },
        { key: "total5mVol", label: "5m Vol", tooltip: "Total volume traded in the last 5 minutes", group: "Volume" },
        { key: "avg1h", label: "1h Avg", tooltip: "Average price over the last hour", group: "Averages" },
        { key: "total1hVol", label: "1h Vol", tooltip: "Total volume traded in the last hour", group: "Volume" },
        { key: "buyPressure5m", label: "5m Buy %", tooltip: "% of 5m volume that was bought (indicates demand)", group: "Pressure" },
        { key: "sellPressure5m", label: "5m Sell %", tooltip: "% of 5m volume that was sold (indicates supply)", group: "Pressure" },
        { key: "buyPressure1h", label: "1h Buy %", tooltip: "% of 1h volume that was bought", group: "Pressure" },
        { key: "sellPressure1h", label: "1h Sell %", tooltip: "% of 1h volume that was sold", group: "Pressure" },
        { key: "volRatio", label: "5m/1h Ratio", tooltip: "Ratio of 5m volume to 1h volume (higher means spiking activity)", group: "Volume" },
        { key: "alchValue", label: "High Alch", tooltip: "Value of the item when cast with High Level Alchemy", group: "Alchemy" },
        { key: "alchMargin", label: "Alch Margin", tooltip: "Profit from High Alchemy (Alch Value - Buy Price - Nature Rune cost)", group: "Alchemy" },
    ];

    // Convert headers to column definitions for ColumnToggle
    const columnDefinitions: ColumnDefinition[] = headers.map((h) => ({
        key: h.key,
        label: h.label,
        group: h.group,
    }));

    if (items.length === 0) {
        return (
            <div className="text-center p-4 text-osrs-text">
                No items match the current filters.
            </div>
        );
    }

    return (
        <div>
            {/* Column Toggle */}
            <ColumnToggle
                columns={columnDefinitions}
                visibleColumns={visibleColumns}
                onToggleColumn={handleToggleColumn}
                onToggleAll={handleToggleAll}
                onResetToDefault={handleResetToDefault}
            />

            {/* Table and Pagination Container */}
            <div className="w-full">
                {/* Pagination */}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={sortedItems.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={handlePageChange}
                    onItemsPerPageChange={handleItemsPerPageChange}
                />

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full border-separate border-spacing-0 bg-osrs-panel shadow-lg rounded-lg overflow-hidden border border-osrs-border">
                        <thead>
                            <tr>
                                <th className="p-3 text-left bg-osrs-button text-[#2c1e12] font-header font-bold border-b-2 border-osrs-border w-10"></th>
                                {headers.filter(h => visibleColumns[h.key] ?? true).map((h) => (
                                    <th
                                        key={h.key}
                                        data-sort={h.key}
                                        onClick={() => handleSort(h.key)}
                                        className={`p-3 text-left bg-osrs-button text-[#2c1e12] font-header font-bold cursor-pointer border-b-2 border-osrs-border hover:bg-osrs-button-hover transition-colors relative whitespace-nowrap ${sort.key === h.key ? "bg-osrs-button-hover" : ""
                                            }`}
                                    >
                                        <Tooltip content={h.tooltip || ""}>
                                            <div className="flex items-center gap-1 w-full h-full">
                                                {h.label}
                                                <SortIcon column={h.key} />
                                            </div>
                                        </Tooltip>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedItems.map((item) => (
                                <TableRow
                                    key={item.id}
                                    item={item}
                                    visibleColumns={visibleColumns}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
