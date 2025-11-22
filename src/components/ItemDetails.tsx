import Link from "next/link";
import { getItemImageUrl } from "@/lib/api";
import { ItemMapping, PriceData } from "@/lib/types";
import ItemCharts from "./ItemCharts";
import "./ItemDetails.scss";

interface ItemDetailsProps {
    item: ItemMapping;
    price: PriceData;
    volume: number;
}

export default function ItemDetails({ item, price, volume }: ItemDetailsProps) {
    const formatNumber = (num: number | undefined) => (num ? num.toLocaleString() : "-");

    const timeAgo = (timestamp: number | undefined) => {
        if (!timestamp) return "-";
        const seconds = Math.floor(Date.now() / 1000 - timestamp);
        if (seconds < 60) return `${seconds}s ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    const margin = price.high && price.low ? price.high * 0.98 - price.low : 0;
    const roi = price.low ? (margin / price.low) * 100 : 0;
    const potentialProfit = margin * (item.limit || 0);

    const alchProfit = item.highalch && price.low ? item.highalch - price.low : 0;

    return (
        <div className="item-details-container">
            <div className="nav-header">
                <Link href="/" className="back-btn">
                    ← Back to List
                </Link>
                <h1>💰 OSRS Economy Tools</h1>
            </div>

            <div className="item-header">
                <img
                    id="item-icon"
                    src={getItemImageUrl(item.name)}
                    alt={item.name}
                    onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                    }}
                />
                <div className="item-title">
                    <h2>{item.name}</h2>
                    <span className="item-id">(Item ID: {item.id})</span>
                </div>
                <div className="item-badges">
                    {item.members ? (
                        <span className="badge members">Members</span>
                    ) : (
                        <span className="badge f2p">F2P</span>
                    )}
                </div>
            </div>

            <p className="item-examine">{item.examine}</p>

            <div className="stats-grid">
                {/* Buy Side */}
                <div className="stat-card buy-card" style={{ background: "#e2dbc8", padding: "1em", borderRadius: "8px", borderLeft: "4px solid #014cc0" }}>
                    <div className="stat-content">
                        <h3 style={{ color: "#014cc0", marginBottom: "0.5em" }}>Buy Price</h3>
                        <p className="price-large" style={{ fontSize: "1.5em", fontWeight: "bold" }}>{formatNumber(price.low)}</p>
                        <p className="sub-text" style={{ fontSize: "0.9em", color: "#666" }}>Last trade: {timeAgo(price.lowTime)}</p>
                    </div>
                </div>

                {/* Sell Side */}
                <div className="stat-card sell-card" style={{ background: "#e2dbc8", padding: "1em", borderRadius: "8px", borderLeft: "4px solid #c02614" }}>
                    <div className="stat-content">
                        <h3 style={{ color: "#c02614", marginBottom: "0.5em" }}>Sell Price</h3>
                        <p className="price-large" style={{ fontSize: "1.5em", fontWeight: "bold" }}>{formatNumber(price.high)}</p>
                        <p className="sub-text" style={{ fontSize: "0.9em", color: "#666" }}>Last trade: {timeAgo(price.highTime)}</p>
                    </div>
                </div>

                {/* Margin */}
                <div className="stat-card margin-card" style={{ background: "#e2dbc8", padding: "1em", borderRadius: "8px", borderLeft: "4px solid #936039" }}>
                    <div className="stat-content">
                        <h3 style={{ color: "#936039", marginBottom: "0.5em" }}>Margin</h3>
                        <p className={`price-medium ${margin > 0 ? "value-positive" : "value-negative"}`} style={{ fontSize: "1.2em", fontWeight: "bold" }}>
                            {Math.round(margin).toLocaleString()}
                        </p>
                        <p className="sub-text" style={{ fontSize: "0.9em", color: "#666" }}>ROI: {roi.toFixed(2)}%</p>
                    </div>
                </div>

                {/* Profit Potential */}
                <div className="stat-card profit-card" style={{ background: "#e2dbc8", padding: "1em", borderRadius: "8px", borderLeft: "4px solid #28a745" }}>
                    <div className="stat-content">
                        <h3 style={{ color: "#28a745", marginBottom: "0.5em" }}>Potential Profit</h3>
                        <p className={`price-large highlight ${potentialProfit > 0 ? "value-positive" : "value-negative"}`} style={{ fontSize: "1.5em", fontWeight: "bold" }}>
                            {Math.round(potentialProfit).toLocaleString()}
                        </p>
                        <p className="sub-text" style={{ fontSize: "0.9em", color: "#666" }}>Limit: {formatNumber(item.limit)}</p>
                    </div>
                </div>
            </div>

            <div className="details-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1em", marginTop: "2em", padding: "1em", background: "#d1c6a6", borderRadius: "8px" }}>
                <div className="detail-row">
                    <strong>Daily Volume: </strong>
                    <span>{formatNumber(volume)}</span>
                </div>
                <div className="detail-row">
                    <strong>High Alch: </strong>
                    <span>{formatNumber(item.highalch)}</span>
                </div>
                <div className="detail-row">
                    <strong>Low Alch: </strong>
                    <span>{formatNumber(item.lowalch)}</span>
                </div>
                <div className="detail-row">
                    <strong>Alch Profit: </strong>
                    <span className={alchProfit > 0 ? "value-positive" : "value-negative"}>
                        {formatNumber(alchProfit)} <span style={{ fontSize: "0.8em", color: "#666" }}>(excl. nat)</span>
                    </span>
                </div>
            </div>

            <ItemCharts itemId={item.id} />
        </div>
    );
}
