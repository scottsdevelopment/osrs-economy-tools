"use client";

import Link from "next/link";
import { getItemImageUrl } from "@/lib/api";
import { ItemMapping, PriceData } from "@/lib/types";
import ItemCharts from "./ItemCharts";

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
        <div className="max-w-[1000px] mx-auto bg-[#d8ccb4] p-8 rounded-lg shadow-[0_0_10px_rgba(0,0,0,0.3)] text-left">
            <div className="flex justify-between items-center mb-4">
                <Link href="/" className="text-osrs-accent hover:underline">
                    ← Back to List
                </Link>
            </div>

            <div className="flex items-center gap-4 mb-4 border-b-2 border-osrs-border pb-4">
                <img
                    id="item-icon"
                    src={getItemImageUrl(item.name)}
                    alt={item.name}
                    className="w-16 h-16"
                    onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                    }}
                />
                <div className="flex-1">
                    <h2 className="m-0 text-osrs-accent text-3xl font-header font-bold">{item.name}</h2>
                    <span className="text-[#666] text-sm">(Item ID: {item.id})</span>
                </div>
                <div className="flex gap-2">
                    {item.members ? (
                        <span className="px-3 py-1 rounded-xl text-xs font-bold text-white bg-[#d9534f]">Members</span>
                    ) : (
                        <span className="px-3 py-1 rounded-xl text-xs font-bold text-white bg-[#5bc0de]">F2P</span>
                    )}
                </div>
            </div>

            <p className="italic text-[#555] mb-8">{item.examine}</p>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-6 mb-8">
                {/* Buy Side */}
                <div className="bg-osrs-input p-6 rounded-lg border border-osrs-border flex items-center gap-4 border-l-4 border-l-[#014cc0]">
                    <div className="flex-1">
                        <h3 className="m-0 mb-2 text-base text-[#014cc0]">Buy Price</h3>
                        <p className="text-2xl font-bold m-0">{formatNumber(price.low)}</p>
                        <p className="text-sm text-[#666] mt-1">Last trade: {timeAgo(price.lowTime)}</p>
                    </div>
                </div>

                {/* Sell Side */}
                <div className="bg-osrs-input p-6 rounded-lg border border-osrs-border flex items-center gap-4 border-l-4 border-l-[#c02614]">
                    <div className="flex-1">
                        <h3 className="m-0 mb-2 text-base text-[#c02614]">Sell Price</h3>
                        <p className="text-2xl font-bold m-0">{formatNumber(price.high)}</p>
                        <p className="text-sm text-[#666] mt-1">Last trade: {timeAgo(price.highTime)}</p>
                    </div>
                </div>

                {/* Margin */}
                <div className="bg-osrs-input p-6 rounded-lg border border-osrs-border flex items-center gap-4 border-l-4 border-l-[#936039]">
                    <div className="flex-1">
                        <h3 className="m-0 mb-2 text-base text-[#936039]">Margin</h3>
                        <p className={`text-xl font-bold m-0 ${margin > 0 ? "text-[#014cc0]" : "text-[#c02614]"}`}>
                            {Math.round(margin).toLocaleString()}
                        </p>
                        <p className="text-sm text-[#666] mt-1">ROI: {roi.toFixed(2)}%</p>
                    </div>
                </div>

                {/* Profit Potential */}
                <div className="bg-osrs-input p-6 rounded-lg border border-osrs-border flex items-center gap-4 border-l-4 border-l-[#28a745]">
                    <div className="flex-1">
                        <h3 className="m-0 mb-2 text-base text-[#28a745]">Potential Profit</h3>
                        <p className={`text-2xl font-bold m-0 text-osrs-accent ${potentialProfit > 0 ? "text-[#014cc0]" : "text-[#c02614]"}`}>
                            {Math.round(potentialProfit).toLocaleString()}
                        </p>
                        <p className="text-sm text-[#666] mt-1">Limit: {formatNumber(item.limit)}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-4 bg-osrs-panel p-6 rounded-lg mb-8">
                <div className="flex flex-col gap-1">
                    <strong className="text-sm text-[#666] font-bold">Daily Volume: </strong>
                    <span className="text-lg">{formatNumber(volume)}</span>
                </div>
                <div className="flex flex-col gap-1">
                    <strong className="text-sm text-[#666] font-bold">High Alch: </strong>
                    <span className="text-lg">{formatNumber(item.highalch)}</span>
                </div>
                <div className="flex flex-col gap-1">
                    <strong className="text-sm text-[#666] font-bold">Low Alch: </strong>
                    <span className="text-lg">{formatNumber(item.lowalch)}</span>
                </div>
                <div className="flex flex-col gap-1">
                    <strong className="text-sm text-[#666] font-bold">Alch Profit: </strong>
                    <span className={`text-lg ${alchProfit > 0 ? "text-[#014cc0]" : "text-[#c02614]"}`}>
                        {formatNumber(alchProfit)} <span className="text-sm text-[#666]">(excl. nat)</span>
                    </span>
                </div>
            </div>

            <ItemCharts itemId={item.id} />
        </div>
    );
}
