
"use client";

import React, { useState, useEffect } from "react";
import { ProcessedItem } from "@/lib/types";
import "./AlchemyCalculator.scss";

interface AlchemyCalculatorProps {
    items: ProcessedItem[];
}

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

export default function AlchemyCalculator({ items }: AlchemyCalculatorProps) {
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
            // Logic from script.js: itemPriceInput.value = alchValue - 500;
            // But we only want to do this if the user is manually changing alch value?
            // script.js did it on 'input' event.
            // We'll leave it manual or triggered by lookup for now to avoid overwriting user input too aggressively.
            // Actually script.js: alchValueInput.addEventListener("input", handleAlchValueChange);
            // handleAlchValueChange calls updatePriceFromAlch which sets itemPrice = alchValue - 500.
            // So yes, we should update it.
            setItemPrice(alchValue - 500);
        }
    }, [alchValue]);

    const handleLookup = () => {
        const query = itemName.trim().toLowerCase();
        if (!query) {
            alert("Please enter an item name");
            return;
        }

        const foundItem = items.find((i) => i.name.toLowerCase() === query);
        if (foundItem) {
            if (foundItem.alchValue !== null) {
                setAlchValue(foundItem.alchValue);
                // useEffect will update price
                alert(
                    `Found item: ${foundItem.name} \nAlch value: ${foundItem.alchValue.toLocaleString()} GP\nPrice set to: ${(foundItem.alchValue - 500).toLocaleString()} GP`
                );
            } else {
                setItemPrice(foundItem.low);
                alert(
                    `Found item: ${foundItem.name} \nCurrent buy price: ${foundItem.low.toLocaleString()} GP\nNo alch value available. Please enter the alch value manually.`
                );
            }
        } else {
            const partialMatch = items.find((i) => i.name.toLowerCase().includes(query));
            if (partialMatch) {
                const use = confirm(
                    `Did you mean "${partialMatch.name}" ?\nCurrent buy price: ${partialMatch.low.toLocaleString()} GP`
                );
                if (use) {
                    setItemName(partialMatch.name);
                    if (partialMatch.alchValue !== null) {
                        setAlchValue(partialMatch.alchValue);
                    } else {
                        setItemPrice(partialMatch.low);
                    }
                }
            } else {
                alert("Item not found in price data. Please check spelling or enter values manually.");
            }
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
        <div id="alchemy-tab" className="tab-content active" style={{ display: "block" }}>
            <h2>Alchemy Trade Calculator</h2>
            <div className="calculator-container">
                <div className="calculator-inputs">
                    <h3>Trade Details</h3>
                    <label>
                        Starting Capital (GP):
                        <input
                            type="number"
                            value={startingCapital}
                            onChange={(e) => setStartingCapital(parseFloat(e.target.value) || 0)}
                            min="0"
                        />
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            checked={autoUpdateCapital}
                            onChange={(e) => setAutoUpdateCapital(e.target.checked)}
                        />
                        Auto-update starting capital after calculation
                    </label>
                    <label>
                        Item Price (GP):
                        <input
                            type="number"
                            value={itemPrice}
                            onChange={(e) => setItemPrice(parseFloat(e.target.value) || 0)}
                            min="0"
                        />
                    </label>
                    <label>
                        Item Name (for lookup):
                        <div style={{ display: "flex", gap: "0.5em" }}>
                            <input
                                type="text"
                                value={itemName}
                                onChange={(e) => setItemName(e.target.value)}
                                placeholder="e.g., Rune 2h sword"
                                onKeyDown={(e) => e.key === "Enter" && handleLookup()}
                                style={{ flex: 1 }}
                            />
                            <button id="lookup-item-btn" onClick={handleLookup} style={{ marginTop: 0 }}>
                                🔍 Lookup
                            </button>
                        </div>
                    </label>
                    <label>
                        Alch Value (GP):
                        <input
                            type="number"
                            value={alchValue}
                            onChange={(e) => setAlchValue(parseFloat(e.target.value) || 0)}
                            min="0"
                        />
                    </label>
                    <label>
                        Quantity (optional):
                        <input
                            type="number"
                            value={quantity ?? ""}
                            onChange={(e) => setQuantity(e.target.value ? parseFloat(e.target.value) : null)}
                            placeholder="Leave blank for auto-calculate"
                            min="1"
                        />
                    </label>
                    <button type="button" id="calculate-btn" onClick={handleCalculate}>
                        Calculate
                    </button>
                </div>

                <div className="calculator-results">
                    <h3>Calculation Results</h3>
                    <div id="results-display">
                        <p><strong>Starting Capital:</strong> <span>{results ? results.startingCapital.toLocaleString() : "-"}</span> GP</p>
                        <p><strong>Item Price:</strong> <span>{results ? results.itemPrice.toLocaleString() : "-"}</span> GP</p>
                        <p><strong>Alch Value:</strong> <span>{results ? results.alchValue.toLocaleString() : "-"}</span> GP</p>
                        <p><strong>Quantity:</strong> <span>{results ? results.quantity.toLocaleString() : "-"}</span></p>
                        <p><strong>Cost Paid:</strong> <span>{results ? results.costPaid.toLocaleString() : "-"}</span> GP</p>
                        <p><strong>Leftover:</strong> <span>{results ? results.leftoverCapital.toLocaleString() : "-"}</span> GP</p>
                        <p>
                            <strong>Profit:</strong>{" "}
                            <span className={results ? (results.profit >= 0 ? "value-positive" : "value-negative") : ""}>
                                {results ? results.profit.toLocaleString() : "-"}
                            </span>{" "}
                            GP
                        </p>
                        <p><strong>Ending Capital:</strong> <span>{results ? results.endingCapital.toLocaleString() : "-"}</span> GP</p>
                    </div>
                </div>

                <div className="calculator-log">
                    <h3>Trade Log</h3>
                    <div id="trade-log">
                        {log.map((entry) => (
                            <div key={entry.id} className="log-entry">
                                <p><strong>Trade #{entry.id}</strong></p>
                                <p>Starting Capital: {entry.startingCapital.toLocaleString()} GP</p>
                                <p>Item Price: {entry.itemPrice.toLocaleString()} GP</p>
                                <p>Alch Value: {entry.alchValue.toLocaleString()} GP</p>
                                <p>Quantity: {entry.quantity.toLocaleString()}</p>
                                <p>Cost Paid: {entry.costPaid.toLocaleString()} GP</p>
                                <p>Leftover: {entry.leftoverCapital.toLocaleString()} GP</p>
                                <p>
                                    Profit:{" "}
                                    <span className={entry.profit >= 0 ? "value-positive" : "value-negative"}>
                                        {entry.profit.toLocaleString()} GP
                                    </span>
                                </p>
                                <p>Ending Capital: {entry.endingCapital.toLocaleString()} GP</p>
                                <hr />
                            </div>
                        ))}
                    </div>
                    <button type="button" id="clear-log-btn" onClick={() => setLog([])}>
                        Clear Log
                    </button>
                </div>
            </div>
        </div>
    );
}
