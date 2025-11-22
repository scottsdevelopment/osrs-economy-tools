import { FilterState } from "@/lib/types";

interface FiltersProps {
    filters: FilterState;
    setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
    onRefresh: () => void;
}

export default function Filters({ filters, setFilters, onRefresh }: FiltersProps) {
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        key: keyof FilterState,
        type: "text" | "number" | "checkbox" = "text"
    ) => {
        let value: any;
        if (type === "checkbox") {
            value = e.target.checked;
        } else if (type === "number") {
            value = e.target.value === "" ? null : parseFloat(e.target.value);
        } else {
            value = e.target.value;
        }
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <div className="controls">
            {/* Search & Options */}
            <div className="filter-group full-width">
                <div className="search-container">
                    <input
                        type="text"
                        id="search-bar"
                        placeholder="🔍 Search item..."
                        value={filters.searchQuery}
                        onChange={(e) => handleChange(e, "searchQuery")}
                    />
                    <button id="refresh-btn" onClick={onRefresh}>
                        🔄 Refresh
                    </button>
                </div>
                <div className="checkbox-container">
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            id="f2p-filter"
                            checked={filters.f2pOnly}
                            onChange={(e) => handleChange(e, "f2pOnly", "checkbox")}
                        />
                        <span>F2P Only</span>
                    </label>
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            id="show-all"
                            checked={filters.showAll}
                            onChange={(e) => handleChange(e, "showAll", "checkbox")}
                        />
                        <span>Show Full List</span>
                    </label>
                </div>
            </div>

            {/* Price Settings */}
            <fieldset className="filter-group">
                <legend>Price Settings</legend>
                <div className="input-grid">
                    <label>
                        <span>Min Buy Price</span>
                        <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={filters.minBuyPrice ?? ""}
                            onChange={(e) => handleChange(e, "minBuyPrice", "number")}
                        />
                    </label>
                    <label>
                        <span>Max Buy Price</span>
                        <input
                            type="number"
                            min="0"
                            placeholder="∞"
                            value={filters.maxBuyPrice ?? ""}
                            onChange={(e) => handleChange(e, "maxBuyPrice", "number")}
                        />
                    </label>
                    <label>
                        <span>Min Sell Price</span>
                        <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={filters.minSellPrice ?? ""}
                            onChange={(e) => handleChange(e, "minSellPrice", "number")}
                        />
                    </label>
                    <label>
                        <span>Max Sell Price</span>
                        <input
                            type="number"
                            min="0"
                            placeholder="∞"
                            value={filters.maxSellPrice ?? ""}
                            onChange={(e) => handleChange(e, "maxSellPrice", "number")}
                        />
                    </label>
                    <label className="checkbox-label">
                        <input
                            type="checkbox"
                            id="buy-under-5m"
                            checked={filters.buyUnder5m}
                            onChange={(e) => handleChange(e, "buyUnder5m", "checkbox")}
                        />
                        <span>Buy &lt; 5m Avg</span>
                    </label>
                </div>
            </fieldset>

            {/* Profitability */}
            <fieldset className="filter-group">
                <legend>Profitability</legend>
                <div className="input-grid">
                    <label>
                        <span>Min Profit</span>
                        <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={filters.minProfit ?? ""}
                            onChange={(e) => handleChange(e, "minProfit", "number")}
                        />
                    </label>
                    <label>
                        <span>Min ROI %</span>
                        <input
                            type="number"
                            min="0"
                            step="0.1"
                            placeholder="0"
                            value={filters.minRoi ?? ""}
                            onChange={(e) => handleChange(e, "minRoi", "number")}
                        />
                    </label>
                    <label>
                        <span>Limit</span>
                        <input
                            type="number"
                            min="0"
                            placeholder="Any"
                            value={filters.limitFilter ?? ""}
                            onChange={(e) => handleChange(e, "limitFilter", "number")}
                        />
                    </label>
                    <label>
                        <span>Min Volume (24h)</span>
                        <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={filters.minVolume ?? ""}
                            onChange={(e) => handleChange(e, "minVolume", "number")}
                        />
                    </label>
                </div>
            </fieldset>

            {/* Short-Term (5m) */}
            <fieldset className="filter-group">
                <legend>Short-Term (5m)</legend>
                <div className="input-grid">
                    <label>
                        <span>Min 5m Vol</span>
                        <input
                            type="number"
                            min="0"
                            placeholder="50"
                            value={filters.min5mVol ?? ""}
                            onChange={(e) => handleChange(e, "min5mVol", "number")}
                        />
                    </label>
                    <label>
                        <span>Min Buy Pressure %</span>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="0"
                            value={filters.minBuyPressure5m ?? ""}
                            onChange={(e) => handleChange(e, "minBuyPressure5m", "number")}
                        />
                    </label>
                    <label>
                        <span>Min Sell Pressure %</span>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="0"
                            value={filters.minSellPressure5m ?? ""}
                            onChange={(e) => handleChange(e, "minSellPressure5m", "number")}
                        />
                    </label>
                </div>
            </fieldset>

            {/* Long-Term (1h) */}
            <fieldset className="filter-group">
                <legend>Long-Term (1h)</legend>
                <div className="input-grid">
                    <label>
                        <span>Min 1h Vol</span>
                        <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={filters.min1hVol ?? ""}
                            onChange={(e) => handleChange(e, "min1hVol", "number")}
                        />
                    </label>
                    <label>
                        <span>Min Buy Pressure %</span>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="0"
                            value={filters.minBuyPressure1h ?? ""}
                            onChange={(e) => handleChange(e, "minBuyPressure1h", "number")}
                        />
                    </label>
                    <label>
                        <span>Min Sell Pressure %</span>
                        <input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="0"
                            value={filters.minSellPressure1h ?? ""}
                            onChange={(e) => handleChange(e, "minSellPressure1h", "number")}
                        />
                    </label>
                </div>
            </fieldset>
        </div>
    );
}
