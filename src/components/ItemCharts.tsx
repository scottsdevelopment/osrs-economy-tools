"use client";

import { useEffect, useState } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    TimeScale,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import "chartjs-adapter-date-fns";
import { fetchTimeSeries } from "@/lib/api";
import { TimeSeriesData } from "@/lib/types";
import "./ItemCharts.scss";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    TimeScale
);

interface ItemChartsProps {
    itemId: number;
}

export default function ItemCharts({ itemId }: ItemChartsProps) {
    const [timeRange, setTimeRange] = useState("1d");
    const [data, setData] = useState<TimeSeriesData[]>([]);

    useEffect(() => {
        const loadData = async () => {
            let timestep = "5m";
            if (timeRange === "7d") timestep = "1h";
            if (timeRange === "30d") timestep = "6h";
            if (timeRange === "1y") timestep = "24h";

            const timeSeries = await fetchTimeSeries(itemId, timestep);

            // Filter based on range
            const now = Math.floor(Date.now() / 1000);
            let startTime = now;
            if (timeRange === "1d") startTime = now - 24 * 60 * 60;
            else if (timeRange === "7d") startTime = now - 7 * 24 * 60 * 60;
            else if (timeRange === "30d") startTime = now - 30 * 24 * 60 * 60;
            else if (timeRange === "1y") startTime = now - 365 * 24 * 60 * 60;

            const filtered = timeSeries.filter((d) => (d.timestamp || 0) >= startTime);
            setData(filtered);
        };

        loadData();
    }, [itemId, timeRange]);

    const labels = data.map((d) => (d.timestamp || 0) * 1000);

    const priceData = {
        labels,
        datasets: [
            {
                label: "Avg Sell Price",
                data: data.map((d) => d.avgHighPrice),
                borderColor: "#c02614",
                backgroundColor: "rgba(192, 38, 20, 0.1)",
                borderWidth: 2,
                pointRadius: 0,
                tension: 0.1,
            },
            {
                label: "Avg Buy Price",
                data: data.map((d) => d.avgLowPrice),
                borderColor: "#014cc0",
                backgroundColor: "rgba(1, 76, 192, 0.1)",
                borderWidth: 2,
                pointRadius: 0,
                tension: 0.1,
            },
        ],
    };

    const volumeData = {
        labels,
        datasets: [
            {
                label: "Sell Volume",
                data: data.map((d) => d.highPriceVolume),
                backgroundColor: "#c02614",
            },
            {
                label: "Buy Volume",
                data: data.map((d) => d.lowPriceVolume),
                backgroundColor: "#014cc0",
            },
        ],
    };

    const options: any = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: "index",
            intersect: false,
        },
        plugins: {
            legend: {
                labels: { color: "#000" },
            },
        },
        scales: {
            x: {
                type: "time",
                time: {
                    tooltipFormat: "PPpp",
                    displayFormats: {
                        hour: "MMM d, h:mm a",
                        day: "MMM d",
                    },
                },
                grid: { color: "#94866d" },
                ticks: { color: "#000" },
            },
            y: {
                grid: { color: "#94866d" },
                ticks: { color: "#000" },
            },
        },
    };

    return (
        <div className="charts-section">
            <div className="chart-controls">
                {["1d", "7d", "30d", "1y"].map((range) => (
                    <button
                        key={range}
                        className={`time-btn ${timeRange === range ? "active" : ""}`}
                        onClick={() => setTimeRange(range)}
                    >
                        {range === "1d" ? "1 Day" : range === "7d" ? "7 Days" : range === "30d" ? "30 Days" : "1 Year"}
                    </button>
                ))}
            </div>

            <div className="chart-container" style={{ height: "400px" }}>
                <h3>Price History</h3>
                <p className="chart-subtitle">Click and drag to zoom in. Double-click to zoom out.</p>
                <Line data={priceData} options={options} />
            </div>

            <div className="chart-container" style={{ height: "400px" }}>
                <h3>Volume History</h3>
                <p className="chart-subtitle">Click and drag to zoom in. Double-click to zoom out.</p>
                <Bar data={volumeData} options={options} />
            </div>
        </div>
    );
}
