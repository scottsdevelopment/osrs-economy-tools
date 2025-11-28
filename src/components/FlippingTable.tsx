"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ProcessedItem } from "@/lib/types";
import { ArrowUp, ArrowDown } from "lucide-react";
import Tooltip from "./Tooltip";
import Pagination from "./Pagination";
import CustomColumnManager from "./CustomColumnManager";
import TableRow from "./TableRow";
import { CustomColumn } from "@/lib/columns/types";
import { loadColumns, addColumn, updateColumn, deleteColumn, toggleColumn, saveColumns } from "@/lib/columns/storage";
import { PRESET_COLUMNS } from "@/lib/columns/presets";
import { evaluateColumn } from "@/lib/columns/engine";
import { TimeseriesCache } from "@/lib/timeseries/cache";
import { useItemData } from "@/context/ItemDataContext";
import { loadFilters } from "@/lib/filters/storage";
import { SavedFilter } from "@/lib/filters/types";
import { evaluateFilters } from "@/lib/filters/engine";
import { PRESET_FILTERS } from "@/lib/filters/presets";
import { BUY_ICON, SELL_ICON } from "@/lib/constants/icons";
import { FavoritesProvider, useFavorites } from "@/context/FavoritesContext";

interface FlippingTableProps {
    items: ProcessedItem[];
    searchQuery?: string;
    onSearchChange?: (query: string) => void;
    filters?: SavedFilter[]; // Add filters as a prop
}

type SortDirection = "asc" | "desc";

interface SortState {
    key: string;
    direction: SortDirection;
}

const DEFAULT_PAGE_SIZE = 50;

export default function FlippingTable(props: FlippingTableProps) {
    return (
        <FavoritesProvider>
            <FlippingTableContent {...props} />
        </FavoritesProvider>
    );
}

function FlippingTableContent({ items, searchQuery = "", onSearchChange, filters: externalFilters }: FlippingTableProps) {
    const [columns, setColumns] = useState<CustomColumn[]>(PRESET_COLUMNS);
    const [filters, setFilters] = useState<SavedFilter[]>([]);
    const [sort, setSort] = useState<SortState>({ key: "profit", direction: "desc" });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_PAGE_SIZE);
    const [cache] = useState(() => new TimeseriesCache());
    const [updateTrigger, setUpdateTrigger] = useState(0);
    const { lastUpdated } = useItemData();
    const { isFavorite } = useFavorites();

    // Load columns on mount, but use external filters if provided
    useEffect(() => {
        loadColumns().then(setColumns);
    }, []);

    // Update filters when external filters change
    useEffect(() => {
        if (externalFilters) {
            setFilters(externalFilters);
        } else {
            // Only load filters if not provided externally
            Promise.all([loadFilters()]).then(([loadedFilters]) => {
                // Combine loaded filters with presets and strategies
                const savedIds = new Set(loadedFilters.map(f => f.id));
                const presets = PRESET_FILTERS.filter(f => !savedIds.has(f.id));

                setFilters([...presets, ...loadedFilters]);
            });
        }
    }, [externalFilters]);

    // Subscribe to cache updates
    useEffect(() => {
        return cache.subscribe(() => {
            setUpdateTrigger(prev => prev + 1);
        });
    }, [cache]);

    // Pre-fetch timeseries logic (unchanged)
    const timeseriesIntervals = useMemo(() => {
        const intervals = new Set<string>();
        const enabledCols = columns.filter(c => c.enabled);
        const hasTimeseries = enabledCols.some(col => col.expression.includes('timeseries('));

        if (hasTimeseries) {
            enabledCols.forEach(col => {
                const matches = col.expression.matchAll(/timeseries\([^,]+,\s*['"]([^'"]+)['"]/g);
                for (const match of matches) {
                    intervals.add(match[1]);
                }
            });
        }
        return Array.from(intervals);
    }, [columns]); // Simplified dependency

    useEffect(() => {
        if (timeseriesIntervals.length > 0 && items.length > 0) {
            timeseriesIntervals.forEach(interval => {
                cache.prefetch(items.map(item => item.id), interval, 0);
            });
        }
    }, [timeseriesIntervals, items, cache]);

    // Column Management Handlers
    const handleAddColumn = async (col: CustomColumn) => {
        const newCols = await addColumn(col);
        setColumns(newCols);
    };

    const handleUpdateColumn = async (col: CustomColumn) => {
        const newCols = await updateColumn(col.id, col);
        setColumns(newCols);
    };

    const handleDeleteColumn = async (id: string) => {
        const newCols = await deleteColumn(id);
        setColumns(newCols);
    };

    const handleToggleColumn = async (id: string) => {
        const newCols = await toggleColumn(id);
        setColumns(newCols);
    };

    const handleColumnReorder = async (draggedId: string, targetId: string) => {
        if (draggedId === targetId) return;

        const draggedIndex = columns.findIndex(c => c.id === draggedId);
        const targetIndex = columns.findIndex(c => c.id === targetId);

        if (draggedIndex === -1 || targetIndex === -1) return;

        const newColumns = [...columns];
        const [draggedItem] = newColumns.splice(draggedIndex, 1);
        newColumns.splice(targetIndex, 0, draggedItem);

        setColumns(newColumns);
        await saveColumns(newColumns);
    };

    // Filter and Transform Items
    const processedItems = useMemo(() => {
        if (items.length === 0) return [];

        // 1. Filter by search query first (optimization)
        let candidateItems = items;
        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            candidateItems = items.filter(item => item.name.toLowerCase().includes(lowerQuery));
        }

        // 2. Apply Filters & Strategies
        // We flatMap because one item might produce multiple results (independent filters)
        return candidateItems.flatMap(item => {
            // Inject favorite status for evaluation
            const itemWithFav = { ...item, favorite: isFavorite(item.id) };
            const results = evaluateFilters(itemWithFav, filters, columns, items);

            if (results.length === 0) return []; // Filtered out

            return results.map(res => {
                // If highlightItem is present, we use that as the base item for display
                // But we attach the action to it.
                const displayItem = res.highlightItem || itemWithFav;

                // Attach action to the item (we might need to cast or extend type)
                return {
                    ...displayItem,
                    _action: res.action,
                    _sourceId: item.id // Keep track of source if needed
                };
            });
        });
    }, [items, searchQuery, filters, columns, updateTrigger, isFavorite]); // updateTrigger re-runs filters if cache updates (might change math results)

    // Sorting
    const handleSort = useCallback((key: string) => {
        setSort((prev) => ({
            key,
            direction: prev.key === key && prev.direction === "desc" ? "asc" : "desc",
        }));
        setCurrentPage(1);
    }, []);

    const sortedItems = useMemo(() => {
        const sortCol = columns.find(c => c.id === sort.key);

        return [...processedItems].sort((a, b) => {
            let aVal: any;
            let bVal: any;

            if (sortCol) {
                // Pass the FULL items list for context if needed, though evaluateColumn currently doesn't use it for sorting context 
                // (it uses it for getItem, which we added). 
                // We should probably pass 'items' to evaluateColumn if we want sorting to work with cross-item columns.
                // But evaluateColumn signature in engine.ts was updated to accept allItems.
                aVal = evaluateColumn(sortCol, { item: a, cache }, columns, cache, undefined, 0, items);
                bVal = evaluateColumn(sortCol, { item: b, cache }, columns, cache, undefined, 0, items);
            } else {
                // Handle special _action column or standard props
                if (sort.key === "_action") {
                    aVal = (a as any)._action;
                    bVal = (b as any)._action;
                } else {
                    aVal = (a as any)[sort.key];
                    bVal = (b as any)[sort.key];
                }
            }

            // Handle null/undefined values - always push to bottom
            if ((aVal === null || aVal === undefined) && (bVal === null || bVal === undefined)) return 0;
            if (aVal === null || aVal === undefined) return 1;
            if (bVal === null || bVal === undefined) return -1;

            if (typeof aVal === "string" && typeof bVal === "string") {
                return sort.direction === "asc"
                    ? aVal.localeCompare(bVal)
                    : bVal.localeCompare(aVal);
            }

            if (typeof aVal === "boolean" && typeof bVal === "boolean") {
                const aNum = aVal ? 1 : 0;
                const bNum = bVal ? 1 : 0;
                return sort.direction === "asc" ? aNum - bNum : bNum - aNum;
            }

            if (typeof aVal === "number" && typeof bVal === "number") {
                return sort.direction === "asc" ? aVal - bVal : bVal - aVal;
            }

            return 0;
        });
    }, [processedItems, sort, columns, cache, items]);

    // Pagination
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
        setCurrentPage(1);
    }, []);

    // Reset page if we are out of bounds (e.g. after filtering)
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        } else if (totalPages === 0 && currentPage !== 1) {
            setCurrentPage(1);
        }
    }, [currentPage, totalPages]);

    const SortIcon = ({ columnId }: { columnId: string }) => {
        if (sort.key !== columnId) return null;
        return sort.direction === "asc" ? (
            <ArrowUp className="inline w-3 h-3 ml-1" />
        ) : (
            <ArrowDown className="inline w-3 h-3 ml-1" />
        );
    };



    const enabledColumns = columns.filter(c => c.enabled);
    // Check if any visible item has an action
    const showActionColumn = processedItems.some((i: any) => i._action);

    return (
        <div>
            {/* Column Manager */}
            <CustomColumnManager
                columns={columns}
                onAddColumn={handleAddColumn}
                onUpdateColumn={handleUpdateColumn}
                onDeleteColumn={handleDeleteColumn}
                onToggleColumn={handleToggleColumn}
            />

            {/* Table and Pagination Container */}
            <div className="w-full">
                {/* Sticky Header Container for Search and Pagination */}
                <div className="sticky top-14 z-30 bg-osrs-bg pt-2 shadow-sm">
                    {/* Search Bar */}
                    <div className="mb-4">
                        <input
                            type="text"
                            placeholder="Search items..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange?.(e.target.value)}
                            className="w-full p-3 border border-osrs-border rounded bg-osrs-input text-osrs-text focus:outline-none focus:border-osrs-accent focus:ring-2 focus:ring-osrs-accent/20 transition-all font-bold"
                        />
                    </div>

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={sortedItems.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={handlePageChange}
                        onItemsPerPageChange={handleItemsPerPageChange}
                    />
                </div>

                <div className="overflow-auto relative max-h-[75vh] scrollbar-thin scrollbar-thumb-osrs-accent scrollbar-track-osrs-panel">
                    <table className="w-full border-separate border-spacing-0 bg-osrs-panel shadow-lg overflow-hidden border border-osrs-border">
                        <thead>
                            <tr>


                                {showActionColumn && (
                                    <th
                                        onClick={() => handleSort("_action")}
                                        className="sticky top-0 z-20 p-3 text-left bg-osrs-button text-[#2c1e12] font-header font-bold cursor-pointer border-b-2 border-osrs-border hover:bg-osrs-button-hover transition-colors relative whitespace-nowrap shadow-sm"
                                    >
                                        Action <SortIcon columnId="_action" />
                                    </th>
                                )}

                                {enabledColumns.map((col) => (
                                    <th
                                        key={col.id}
                                        draggable
                                        onDragStart={(e) => {
                                            e.dataTransfer.setData("text/plain", col.id);
                                            e.dataTransfer.effectAllowed = "move";
                                        }}
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            e.dataTransfer.dropEffect = "move";
                                        }}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            const draggedId = e.dataTransfer.getData("text/plain");
                                            handleColumnReorder(draggedId, col.id);
                                        }}
                                        onClick={() => handleSort(col.id)}
                                        colSpan={col.id === "name" ? 2 : 1}
                                        className={`sticky top-0 z-20 p-3 text-left bg-osrs-button text-[#2c1e12] font-header font-bold cursor-pointer border-b-2 border-osrs-border hover:bg-osrs-button-hover transition-colors relative whitespace-nowrap shadow-sm ${sort.key === col.id ? "bg-osrs-button-hover" : ""
                                            }`}
                                    >
                                        <Tooltip content={col.description || ""}>
                                            <div className="flex items-center gap-1">
                                                {col.id === "low" && (
                                                    <img src={BUY_ICON} alt="Buy" className="w-3 h-3 object-contain" />
                                                )}
                                                {col.id === "high" && (
                                                    <img src={SELL_ICON} alt="Sell" className="w-3 h-3 object-contain" />
                                                )}
                                                <span>{col.name}</span>
                                                <SortIcon columnId={col.id} />
                                            </div>
                                        </Tooltip>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedItems.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={enabledColumns.length + 1 + (showActionColumn ? 1 : 0)}
                                        className="text-center p-8 text-osrs-text bg-osrs-panel"
                                    >
                                        {searchQuery ? (
                                            <div>
                                                <p className="text-lg font-bold mb-2">No items found</p>
                                                <p className="text-sm opacity-75">No items match "{searchQuery}"</p>
                                            </div>
                                        ) : (
                                            <div>
                                                <p className="text-lg font-bold mb-2">No items found</p>
                                                <p className="text-sm opacity-75">No items match the current filters</p>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                paginatedItems.map((item: any, index) => (
                                    <TableRow
                                        key={`${item.id}-${index}`} // Use index to handle duplicate items (independent filters)
                                        item={item}
                                        columns={columns}
                                        cache={cache}
                                        action={item._action}
                                        showActionColumn={showActionColumn}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
