
"use client";

import React, { useState, useMemo } from "react";
import { ProcessedItem } from "@/lib/types";
import { getItemImageUrl } from "@/lib/api";
import { ArrowUp, ArrowDown } from "lucide-react";
import "./DecantingCalculator.scss";

interface DecantingCalculatorProps {
    items: ProcessedItem[];
}

interface DecantResult {
    name: string;
    volume1: number | null;
    volume2: number | null;
    volume3: number | null;
    volume4: number;
    price1: number | null;
    price2: number | null;
    price3: number | null;
    price4: number;
    costPerCharge1: number | null;
    costPerCharge2: number | null;
    costPerCharge3: number | null;
    costPerCharge4: number;
    profit1to4: number | null;
    profit2to4: number | null;
    profit3to4: number | null;
    profitPerDecant1: number | null;
    profitPerDecant2: number | null;
    profitPerDecant3: number | null;
}

type SortKey = keyof DecantResult;

export default function DecantingCalculator({ items }: DecantingCalculatorProps) {
    const [minVolume, setMinVolume] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [sort, setSort] = useState<{ key: SortKey; direction: "asc" | "desc" }>({
        key: "profitPerDecant1",
        direction: "desc",
    });

    // Logic from script.js
    const decantData = useMemo(() => {
        const parsePotionName = (name: string) => {
            const match = name.match(/^(.+?)\s*\((\d+)\)$/);
            if (match) {
                return {
                    baseName: match[1].trim(),
                    dose: parseInt(match[2]),
                };
            }
            return null;
        };

        const potionGroups: Record<string, Record<number, ProcessedItem>> = {};

        for (const item of items) {
            const parsed = parsePotionName(item.name);
            if (!parsed || parsed.dose < 1 || parsed.dose > 4) continue;

            if (!potionGroups[parsed.baseName]) {
                potionGroups[parsed.baseName] = {};
            }
            potionGroups[parsed.baseName][parsed.dose] = item;
        }

        const results: DecantResult[] = [];

        const calculateDecantProfit = (
            lowerDose: ProcessedItem | undefined,
            higherDose: ProcessedItem,
            numLowerDose: number
        ) => {
            if (!lowerDose || !higherDose) return null;

            const totalDoses = numLowerDose * (lowerDose.name.includes("(1)") ? 1 : lowerDose.name.includes("(2)") ? 2 : 3);
            // Actually we can just use the dose from parsing, but here we passed item.
            // Let's rely on the passed numLowerDose which implies the dose.
            // 12 (1)'s = 12 doses. 6 (2)'s = 12 doses. 4 (3)'s = 12 doses.
            // All result in 3 (4)'s.

            const numHigherDose = Math.floor(totalDoses / 4);
            if (numHigherDose === 0) return null;

            const buyCost = lowerDose.low * numLowerDose;
            const sellRevenue = higherDose.high * 0.98 * numHigherDose;
            const profit = sellRevenue - buyCost;

            return {
                profit: Math.round(profit),
                profitPerDecant: Math.round(profit / numHigherDose),
            };
        };

        for (const [baseName, doses] of Object.entries(potionGroups)) {
            const dose4 = doses[4];
            if (!dose4) continue;

            const costPerCharge1 = doses[1] ? Math.round(doses[1].low / 1) : null;
            const costPerCharge2 = doses[2] ? Math.round(doses[2].low / 2) : null;
            const costPerCharge3 = doses[3] ? Math.round(doses[3].low / 3) : null;
            const costPerCharge4 = Math.round(dose4.low / 4);

            const profit1to4 = calculateDecantProfit(doses[1], dose4, 12);
            const profit2to4 = calculateDecantProfit(doses[2], dose4, 6);
            const profit3to4 = calculateDecantProfit(doses[3], dose4, 4);

            results.push({
                name: baseName,
                volume1: doses[1]?.volume || null,
                volume2: doses[2]?.volume || null,
                volume3: doses[3]?.volume || null,
                volume4: dose4.volume,
                price1: doses[1]?.low || null,
                price2: doses[2]?.low || null,
                price3: doses[3]?.low || null,
                price4: dose4.low,
                costPerCharge1,
                costPerCharge2,
                costPerCharge3,
                costPerCharge4,
                profit1to4: profit1to4?.profit || null,
                profit2to4: profit2to4?.profit || null,
                profit3to4: profit3to4?.profit || null,
                profitPerDecant1: profit1to4?.profitPerDecant || null,
                profitPerDecant2: profit2to4?.profitPerDecant || null,
                profitPerDecant3: profit3to4?.profitPerDecant || null,
            });
        }

        return results;
    }, [items]);

    const filteredData = useMemo(() => {
        return decantData.filter((p) => {
            if (minVolume !== null && p.volume4 < minVolume) return false;
            if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
            return true;
        });
    }, [decantData, minVolume, searchQuery]);

    const sortedData = useMemo(() => {
        return [...filteredData].sort((a, b) => {
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
    }, [filteredData, sort]);

    const handleSort = (key: SortKey) => {
        setSort((prev) => ({
            key,
            direction: prev.key === key && prev.direction === "desc" ? "asc" : "desc",
        }));
    };

    const SortIcon = ({ column }: { column: SortKey }) => {
        if (sort.key !== column) return null;
        return sort.direction === "asc" ? (
            <ArrowUp className="inline w-3 h-3 ml-1" />
        ) : (
            <ArrowDown className="inline w-3 h-3 ml-1" />
        );
    };

    const formatValue = (val: number | null) => (val === null ? "-" : val.toLocaleString());
    const formatProfit = (val: number | null) => {
        if (val === null) return "-";
        return (
            <span className={val >= 0 ? "value-positive" : "value-negative"}>
                {val.toLocaleString()}
            </span>
        );
    };

    return (
        <div id="decanting-tab" className="tab-content active" style={{ display: "block" }}>
            <h2>Hot Item Decanting Calculator</h2>
            <div className="controls">
                <div className="filter-row">
                    <label>
                        Min Volume:
                        <input
                            type="number"
                            id="decant-min-volume"
                            min="0"
                            value={minVolume ?? ""}
                            onChange={(e) => setMinVolume(e.target.value ? parseInt(e.target.value) : null)}
                        />
                    </label>
                    <label>
                        <input
                            type="text"
                            id="decant-search-bar"
                            placeholder="🔍 Search potion..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </label>
                </div>
            </div>

            <table id="decant-table">
                <thead>
                    <tr>
                        <th rowSpan={2} onClick={() => handleSort("name")} data-tooltip="Name of the potion">
                            Potion <SortIcon column="name" />
                        </th>
                        <th colSpan={4} style={{ textAlign: "center" }} data-tooltip="Volume traded in the last 24 hours">
                            Volume
                        </th>
                        <th colSpan={4} style={{ textAlign: "center" }} data-tooltip="Current buy price for each dose">
                            Price
                        </th>
                        <th colSpan={4} style={{ textAlign: "center" }} data-tooltip="Cost per single dose based on current price">
                            Cost/Charge
                        </th>
                        <th
                            rowSpan={2}
                            onClick={() => handleSort("profit1to4")}
                            data-tooltip="Profit from decanting (1) dose potions into (4) dose"
                        >
                            Profit (1→4) <SortIcon column="profit1to4" />
                        </th>
                        <th
                            rowSpan={2}
                            onClick={() => handleSort("profit2to4")}
                            data-tooltip="Profit from decanting (2) dose potions into (4) dose"
                        >
                            Profit (2→4) <SortIcon column="profit2to4" />
                        </th>
                        <th
                            rowSpan={2}
                            onClick={() => handleSort("profit3to4")}
                            data-tooltip="Profit from decanting (3) dose potions into (4) dose"
                        >
                            Profit (3→4) <SortIcon column="profit3to4" />
                        </th>
                        <th
                            rowSpan={2}
                            onClick={() => handleSort("profitPerDecant1")}
                            data-tooltip="Profit per single decant operation (1→4)"
                        >
                            Profit/Decant (1→4) <SortIcon column="profitPerDecant1" />
                        </th>
                        <th
                            rowSpan={2}
                            onClick={() => handleSort("profitPerDecant2")}
                            data-tooltip="Profit per single decant operation (2→4)"
                        >
                            Profit/Decant (2→4) <SortIcon column="profitPerDecant2" />
                        </th>
                        <th
                            rowSpan={2}
                            onClick={() => handleSort("profitPerDecant3")}
                            data-tooltip="Profit per single decant operation (3→4)"
                        >
                            Profit/Decant (3→4) <SortIcon column="profitPerDecant3" />
                        </th>
                    </tr>
                    <tr>
                        <th onClick={() => handleSort("volume1")} data-tooltip="24h Volume for (1) dose">
                            (1) <SortIcon column="volume1" />
                        </th>
                        <th onClick={() => handleSort("volume2")} data-tooltip="24h Volume for (2) dose">
                            (2) <SortIcon column="volume2" />
                        </th>
                        <th onClick={() => handleSort("volume3")} data-tooltip="24h Volume for (3) dose">
                            (3) <SortIcon column="volume3" />
                        </th>
                        <th onClick={() => handleSort("volume4")} data-tooltip="24h Volume for (4) dose">
                            (4) <SortIcon column="volume4" />
                        </th>
                        <th onClick={() => handleSort("price1")} data-tooltip="Buy price for (1) dose">
                            (1) <SortIcon column="price1" />
                        </th>
                        <th onClick={() => handleSort("price2")} data-tooltip="Buy price for (2) dose">
                            (2) <SortIcon column="price2" />
                        </th>
                        <th onClick={() => handleSort("price3")} data-tooltip="Buy price for (3) dose">
                            (3) <SortIcon column="price3" />
                        </th>
                        <th onClick={() => handleSort("price4")} data-tooltip="Buy price for (4) dose">
                            (4) <SortIcon column="price4" />
                        </th>
                        <th onClick={() => handleSort("costPerCharge1")} data-tooltip="Cost per dose for (1) dose potion">
                            (1) <SortIcon column="costPerCharge1" />
                        </th>
                        <th onClick={() => handleSort("costPerCharge2")} data-tooltip="Cost per dose for (2) dose potion">
                            (2) <SortIcon column="costPerCharge2" />
                        </th>
                        <th onClick={() => handleSort("costPerCharge3")} data-tooltip="Cost per dose for (3) dose potion">
                            (3) <SortIcon column="costPerCharge3" />
                        </th>
                        <th onClick={() => handleSort("costPerCharge4")} data-tooltip="Cost per dose for (4) dose potion">
                            (4) <SortIcon column="costPerCharge4" />
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {sortedData.map((potion) => (
                        <tr key={potion.name}>
                            <td>
                                <img
                                    className="item-icon"
                                    src={getItemImageUrl(potion.name + " (4)")}
                                    alt={potion.name}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = "none";
                                    }}
                                />
                                {potion.name}
                            </td>
                            <td>{formatValue(potion.volume1)}</td>
                            <td>{formatValue(potion.volume2)}</td>
                            <td>{formatValue(potion.volume3)}</td>
                            <td>{formatValue(potion.volume4)}</td>
                            <td>{formatValue(potion.price1)}</td>
                            <td>{formatValue(potion.price2)}</td>
                            <td>{formatValue(potion.price3)}</td>
                            <td>{formatValue(potion.price4)}</td>
                            <td>{formatValue(potion.costPerCharge1)}</td>
                            <td>{formatValue(potion.costPerCharge2)}</td>
                            <td>{formatValue(potion.costPerCharge3)}</td>
                            <td>{formatValue(potion.costPerCharge4)}</td>
                            <td>{formatProfit(potion.profit1to4)}</td>
                            <td>{formatProfit(potion.profit2to4)}</td>
                            <td>{formatProfit(potion.profit3to4)}</td>
                            <td>{formatProfit(potion.profitPerDecant1)}</td>
                            <td>{formatProfit(potion.profitPerDecant2)}</td>
                            <td>{formatProfit(potion.profitPerDecant3)}</td>
                        </tr>
                    ))}
                    {sortedData.length === 0 && (
                        <tr>
                            <td colSpan={19}>No potions match the current filters.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
