"use client";

import React, { useState, useEffect } from "react";
import { ProcessedItem } from "@/lib/types";
import ItemSearch from "@/components/ItemSearch";
import { useItemsStore } from "@/stores/useItemsStore";

interface TradeLogEntry {
    id: number;
    startingCapital: number;
    itemPrice: number;
    alchValue: number;
    quantity: number;
    costPaid: number;
    leftoverCapital: number;
    profit: number;
    endingCapital: number;
}

export default function AlchemyCalculator() {
    const items = useItemsStore(state => state.items);

    const [startingCapital, setStartingCapital] = useState<number>(0);
    const [autoUpdateCapital, setAutoUpdateCapital] = useState(true);
    const [itemPrice, setItemPrice] = useState<number>(9525);
    const [itemName, setItemName] = useState("");
    const [alchValue, setAlchValue] = useState<number>(9984);
    const [quantity, setQuantity] = useState<number | null>(null);

    const [results, setResults] = useState<TradeLogEntry | null>(null);
    const [log, setLog] = useState<TradeLogEntry[]>([]);

    // Auto-update price when alch value changes
    useEffect(() => {
        if (alchValue > 500) {
            setItemPrice(alchValue - 500);
        }
    }, [alchValue]);

    const handleItemSelect = (item: ProcessedItem) => {
        setItemName(item.name);
        setItemPrice(item.low);
        if (item.highalch) {
            setAlchValue(item.highalch);
        }
    };

    const handleCalculate = () => {
        if (startingCapital <= 0 || itemPrice <= 0 || alchValue <= 0) {
            alert("Please enter valid values for all fields");
            return;
        }

        let calcQuantity: number;
        if (quantity !== null && quantity > 0) {
            const maxQuantity = Math.floor(startingCapital / itemPrice);
            calcQuantity = Math.min(quantity, maxQuantity);

            if (quantity > maxQuantity) {
                alert(`Warning: Insufficient capital for ${quantity.toLocaleString()} items. Using maximum quantity of ${calcQuantity.toLocaleString()}.`);
            }
        } else {
            calcQuantity = Math.floor(startingCapital / itemPrice);
        }

        if (calcQuantity === 0) {
            alert("Starting capital is too low to buy even one item");
            return;
        }

        const costPaid = calcQuantity * itemPrice;
        const leftoverCapital = startingCapital - costPaid;
        const totalFromAlching = calcQuantity * alchValue;
        const endingCapital = totalFromAlching + leftoverCapital;
        const profit = endingCapital - startingCapital;

        const resultEntry: TradeLogEntry = {
            id: log.length + 1,
            startingCapital,
            itemPrice,
            alchValue,
            quantity: calcQuantity,
            costPaid,
            leftoverCapital,
            profit,
            endingCapital,
        };

        setResults(resultEntry);
        setLog((prev) => [...prev, resultEntry]);
        setQuantity(null); // Reset quantity input

        if (autoUpdateCapital) {
            setStartingCapital(endingCapital);
        }
    };

    return (
        <div id="alchemy-tab" className="block">
            <h2>Alchemy Trade Calculator</h2>
            <div className="max-w-[900px] mx-auto my-8 p-4 bg-osrs-secondary-hover rounded-lg shadow-[0_0_8px_rgba(0,0,0,0.3)]">
                <div className="flex flex-col gap-4 mb-8 p-4 bg-osrs-panel rounded">
                    <h3 className="text-osrs-accent mb-4">Trade Details</h3>
                    <label className="flex flex-col gap-2 text-base">
                        Starting Capital (GP):
                        <input
                            type="number"
                            value={startingCapital}
                            onChange={(e) => setStartingCapital(parseFloat(e.target.value) || 0)}
                            min="0"
                            className="p-2.5 bg-osrs-input border border-osrs-border rounded text-black text-base focus:outline-none focus:border-osrs-accent"
                        />
                    </label>
                    <label className="flex flex-row items-center gap-2 cursor-pointer text-base">
                        <input
                            type="checkbox"
                            checked={autoUpdateCapital}
                            onChange={(e) => setAutoUpdateCapital(e.target.checked)}
                            className="w-5 h-5 cursor-pointer accent-osrs-accent"
                        />
                        Auto-update starting capital after calculation
                    </label>
                    <label className="flex flex-col gap-2 text-base">
                        Item Price (GP):
                        <input
                            type="number"
                            value={itemPrice}
                            onChange={(e) => setItemPrice(parseFloat(e.target.value) || 0)}
                            min="0"
                            className="p-2.5 bg-osrs-input border border-osrs-border rounded text-black text-base focus:outline-none focus:border-osrs-accent"
                        />
                    </label>
                    <label className="flex flex-col gap-2 text-base">
                        Search for Item:
                        <ItemSearch
                            items={items}
                            placeholder="e.g., Rune 2h sword"
                            onSelect={handleItemSelect}
                        />
                        {itemName && (
                            <div className="text-sm text-osrs-accent mt-1">
                                Selected: {itemName}
                            </div>
                        )}
                    </label>
                    <label className="flex flex-col gap-2 text-base">
                        Alch Value (GP):
                        <input
                            type="number"
                            value={alchValue}
                            onChange={(e) => setAlchValue(parseFloat(e.target.value) || 0)}
                            min="0"
                            className="p-2.5 bg-osrs-input border border-osrs-border rounded text-black text-base focus:outline-none focus:border-osrs-accent"
                        />
                    </label>
                    <label className="flex flex-col gap-2 text-base">
                        Quantity (optional):
                        <input
                            type="number"
                            value={quantity ?? ""}
                            onChange={(e) => setQuantity(e.target.value ? parseFloat(e.target.value) : null)}
                            placeholder="Leave blank for auto-calculate"
                            min="1"
                            className="p-2.5 bg-osrs-input border border-osrs-border rounded text-black text-base focus:outline-none focus:border-osrs-accent"
                        />
                    </label>
                    <button
                        type="button"
                        id="calculate-btn"
                        onClick={handleCalculate}
                        className="mt-4 btn-primary text-lg w-full md:w-auto"
                    >
                        Calculate
                    </button>
                </div>

                <div className="mb-8 p-4 bg-osrs-panel rounded">
                    <h3 className="text-osrs-accent mb-4">Calculation Results</h3>
                    <div id="results-display" className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
                        <p className="my-2 p-2 bg-osrs-input rounded"><strong className="text-osrs-accent">Starting Capital:</strong> <span>{results ? results.startingCapital.toLocaleString() : "-"}</span> GP</p>
                        <p className="my-2 p-2 bg-osrs-input rounded"><strong className="text-osrs-accent">Item Price:</strong> <span>{results ? results.itemPrice.toLocaleString() : "-"}</span> GP</p>
                        <p className="my-2 p-2 bg-osrs-input rounded"><strong className="text-osrs-accent">Alch Value:</strong> <span>{results ? results.alchValue.toLocaleString() : "-"}</span> GP</p>
                        <p className="my-2 p-2 bg-osrs-input rounded"><strong className="text-osrs-accent">Quantity:</strong> <span>{results ? results.quantity.toLocaleString() : "-"}</span></p>
                        <p className="my-2 p-2 bg-osrs-input rounded"><strong className="text-osrs-accent">Cost Paid:</strong> <span>{results ? results.costPaid.toLocaleString() : "-"}</span> GP</p>
                        <p className="my-2 p-2 bg-osrs-input rounded"><strong className="text-osrs-accent">Leftover:</strong> <span>{results ? results.leftoverCapital.toLocaleString() : "-"}</span> GP</p>
                        <p className="my-2 p-2 bg-osrs-input rounded">
                            <strong className="text-osrs-accent">Profit:</strong>{" "}
                            <span className={results ? (results.profit >= 0 ? "text-osrs-profit" : "text-osrs-loss") : ""}>
                                {results ? results.profit.toLocaleString() : "-"}
                            </span>{" "}
                            GP
                        </p>
                        <p className="my-2 p-2 bg-osrs-input rounded"><strong className="text-osrs-accent">Ending Capital:</strong> <span>{results ? results.endingCapital.toLocaleString() : "-"}</span> GP</p>
                    </div>
                </div>

                <div className="p-4 bg-osrs-panel rounded">
                    <h3 className="text-osrs-accent mb-4">Trade Log</h3>
                    <div id="trade-log" className="max-h-[400px] overflow-y-auto mb-4 p-4 bg-osrs-input rounded">
                        {log.map((entry) => (
                            <div key={entry.id} className="mb-4 p-4 bg-osrs-secondary-hover rounded border-l-[3px] border-l-osrs-accent">
                                <p><strong className="text-osrs-accent">Trade #{entry.id}</strong></p>
                                <p className="my-1">Starting Capital: {entry.startingCapital.toLocaleString()} GP</p>
                                <p className="my-1">Item Price: {entry.itemPrice.toLocaleString()} GP</p>
                                <p className="my-1">Alch Value: {entry.alchValue.toLocaleString()} GP</p>
                                <p className="my-1">Quantity: {entry.quantity.toLocaleString()}</p>
                                <p className="my-1">Cost Paid: {entry.costPaid.toLocaleString()} GP</p>
                                <p className="my-1">Leftover: {entry.leftoverCapital.toLocaleString()} GP</p>
                                <p className="my-1">
                                    Profit:{" "}
                                    <span className={entry.profit >= 0 ? "text-osrs-profit" : "text-osrs-loss"}>
                                        {entry.profit.toLocaleString()} GP
                                    </span>
                                </p>
                                <p className="my-1">Ending Capital: {entry.endingCapital.toLocaleString()} GP</p>
                                <hr className="border-t border-osrs-border mt-2" />
                            </div>
                        ))}
                    </div>
                    <button
                        type="button"
                        id="clear-log-btn"
                        onClick={() => setLog([])}
                        className="bg-osrs-loss text-osrs-text-light px-5 py-2 border border-osrs-border-dark rounded font-header font-bold cursor-pointer hover:bg-osrs-loss shadow-sm"
                    >
                        Clear Log
                    </button>
                </div>
            </div>
        </div>
    );
}
