const API_BASE = "https://prices.runescape.wiki/api/v1/osrs";
const API_LATEST = `${API_BASE}/latest`;
const API_MAPPING = `${API_BASE}/mapping`;
const API_TIMESERIES = `${API_BASE}/timeseries`;

// DOM Elements
const itemNameEl = document.getElementById("item-name");
const itemIdEl = document.getElementById("item-id");
const itemIconEl = document.getElementById("item-icon");
const itemExamineEl = document.getElementById("item-examine");
const membersBadge = document.getElementById("members-badge");
const f2pBadge = document.getElementById("f2p-badge");

const buyPriceEl = document.getElementById("buy-price");
const buyTimeEl = document.getElementById("buy-time");
const sellPriceEl = document.getElementById("sell-price");
const sellTimeEl = document.getElementById("sell-time");
const marginEl = document.getElementById("margin");
const roiEl = document.getElementById("roi");
const potentialProfitEl = document.getElementById("potential-profit");
const buyLimitEl = document.getElementById("buy-limit");
const dailyVolumeEl = document.getElementById("daily-volume");

const highAlchEl = document.getElementById("high-alch");
const lowAlchEl = document.getElementById("low-alch");
const alchProfitEl = document.getElementById("alch-profit");

const timeButtons = document.querySelectorAll(".time-btn");

// Chart instances
let priceChart = null;
let volumeChart = null;

// State
let currentItemId = null;
let currentItemData = null;
let currentMapping = null;

// Helper: Format number with commas
const formatNumber = (num) => num ? num.toLocaleString() : "-";

// Helper: Format time ago
const timeAgo = (timestamp) => {
    if (!timestamp) return "-";
    const seconds = Math.floor((Date.now() / 1000) - timestamp);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
};

// Initialize
async function init() {
    const urlParams = new URLSearchParams(window.location.search);
    currentItemId = urlParams.get("id");

    if (!currentItemId) {
        alert("No item ID specified");
        window.location.href = "index.html";
        return;
    }

    try {
        await fetchItemDetails();
        setupCharts();
        loadTimeSeries("1d"); // Default to 1 day
    } catch (err) {
        console.error("Error initializing item page:", err);
        itemNameEl.textContent = "Error loading item";
    }
}

// Fetch Item Details (Mapping + Latest Price)
async function fetchItemDetails() {
    // 1. Fetch Mapping to get static info (name, limit, alch, etc.)
    const mappingRes = await fetch(API_MAPPING);
    const mappingData = await mappingRes.json();
    currentMapping = mappingData.find(i => i.id == currentItemId);

    if (!currentMapping) {
        throw new Error("Item not found in mapping");
    }

    // 2. Fetch Latest Price
    const latestRes = await fetch(`${API_LATEST}?id=${currentItemId}`);
    const latestData = (await latestRes.json()).data[currentItemId];

    // 3. Fetch 24h Volume (using the volumes endpoint for simplicity or just display N/A if not easily available per item without full fetch)
    // For better performance, we might want to pass this or fetch the full volumes list. 
    // Let's fetch the full volumes list for now as it's cached by browser usually.
    const volumesRes = await fetch(`${API_BASE}/volumes`);
    const volumesData = (await volumesRes.json()).data;
    const volume24h = volumesData[currentItemId];

    renderItemDetails(currentMapping, latestData, volume24h);
}

function renderItemDetails(item, price, volume) {
    // Header
    itemNameEl.textContent = item.name;
    itemIdEl.textContent = `(Item ID: ${item.id})`;
    itemIconEl.src = `https://oldschool.runescape.wiki/images/${encodeURIComponent(item.name.replace(/ /g, "_"))}_detail.png`;
    itemExamineEl.textContent = item.examine;

    if (item.members) {
        membersBadge.style.display = "inline-block";
        f2pBadge.style.display = "none";
    } else {
        membersBadge.style.display = "none";
        f2pBadge.style.display = "inline-block";
    }

    // Prices
    const high = price?.high;
    const low = price?.low;
    const highTime = price?.highTime;
    const lowTime = price?.lowTime;

    buyPriceEl.textContent = formatNumber(low) + " coins";
    buyTimeEl.textContent = timeAgo(lowTime);

    sellPriceEl.textContent = formatNumber(high) + " coins";
    sellTimeEl.textContent = timeAgo(highTime);

    // Calculations
    if (high && low) {
        const margin = (high * 0.98) - low; // 2% tax
        const roi = (margin / low) * 100;
        const limit = item.limit || 0;
        const potentialProfit = margin * limit;

        marginEl.textContent = Math.round(margin).toLocaleString();
        roiEl.textContent = roi.toFixed(2) + "%";
        potentialProfitEl.textContent = Math.round(potentialProfit).toLocaleString();

        // Color coding
        marginEl.className = margin > 0 ? "price-medium value-positive" : "price-medium value-negative";
        potentialProfitEl.className = potentialProfit > 0 ? "price-large highlight value-positive" : "price-large highlight value-negative";
    }

    buyLimitEl.textContent = formatNumber(item.limit);
    dailyVolumeEl.textContent = formatNumber(volume);

    // Alch
    const highAlch = item.highalch || 0;
    const lowAlch = item.lowalch || 0;
    const natureRunePrice = 0; // Ideally fetch this, but for now we can omit or assume standard
    // Actually, let's just show the value. Calculating profit needs nat price.
    // We can try to find nature rune price from the latestData if we fetched all, but we only fetched one.
    // For now, just show values.

    highAlchEl.textContent = formatNumber(highAlch);
    lowAlchEl.textContent = formatNumber(lowAlch);

    if (low && highAlch) {
        // Assuming nature rune cost ~100gp for rough estimate or just show raw difference
        // The user prompt asked for "High alch 270 (-1,334,797)" format.
        // Let's just show High Alch Value and maybe the difference from Buy Price (without nat cost for now unless we fetch nat)
        const diff = highAlch - low;
        alchProfitEl.innerHTML = `${formatNumber(diff)} <span class="sub-text">(excl. nat)</span>`;
        alchProfitEl.className = diff > 0 ? "value-positive" : "value-negative";
    }
}

// Charts
function setupCharts() {
    const ctxPrice = document.getElementById('price-chart').getContext('2d');
    const ctxVolume = document.getElementById('volume-chart').getContext('2d');

    // Common options
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                display: true,
                labels: { color: '#000' }
            },
            tooltip: {
                enabled: true
            },
            zoom: {
                zoom: {
                    wheel: { enabled: true },
                    pinch: { enabled: true },
                    mode: 'x',
                },
                pan: {
                    enabled: true,
                    mode: 'x',
                }
            }
        },
        scales: {
            x: {
                type: 'time',
                time: {
                    tooltipFormat: 'PPpp',
                    displayFormats: {
                        hour: 'MMM d, h:mm a',
                        day: 'MMM d'
                    }
                },
                grid: { color: '#94866d' },
                ticks: { color: '#000' }
            },
            y: {
                grid: { color: '#94866d' },
                ticks: { color: '#000' }
            }
        }
    };

    priceChart = new Chart(ctxPrice, {
        type: 'line',
        data: { datasets: [] },
        options: {
            ...commonOptions,
            plugins: {
                ...commonOptions.plugins,
                title: { display: false }
            }
        }
    });

    volumeChart = new Chart(ctxVolume, {
        type: 'bar',
        data: { datasets: [] },
        options: {
            ...commonOptions,
            plugins: {
                ...commonOptions.plugins,
                title: { display: false }
            }
        }
    });
}

async function loadTimeSeries(range) {
    // Determine timestep based on range
    let timestep = "5m";
    let points = 288; // Default 1d (24h * 12)

    switch (range) {
        case "1d":
            timestep = "5m";
            break;
        case "7d":
            timestep = "1h";
            break;
        case "30d":
            timestep = "6h";
            break;
        case "1y":
            timestep = "24h";
            break;
    }

    // Update buttons
    timeButtons.forEach(btn => {
        btn.classList.toggle("active", btn.dataset.range === range);
    });

    try {
        const res = await fetch(`${API_TIMESERIES}?timestep=${timestep}&id=${currentItemId}`);
        const json = await res.json();
        const data = json.data;

        // Process data
        // Filter data based on range if needed, but the timestep usually gives us what we need.
        // However, the API returns *all* available data for that timestep usually?
        // Actually, wiki api timeseries returns limited data or we might need to slice it.
        // Let's just use what it returns, but slice if it's too much for the requested range.
        // 1d = last 24h. 7d = last 7d.

        const now = Math.floor(Date.now() / 1000);
        let startTime = now;

        if (range === "1d") startTime = now - (24 * 60 * 60);
        else if (range === "7d") startTime = now - (7 * 24 * 60 * 60);
        else if (range === "30d") startTime = now - (30 * 24 * 60 * 60);
        else if (range === "1y") startTime = now - (365 * 24 * 60 * 60);

        const filteredData = data.filter(d => d.timestamp >= startTime);

        const labels = filteredData.map(d => d.timestamp * 1000);
        const avgHighPrices = filteredData.map(d => d.avgHighPrice);
        const avgLowPrices = filteredData.map(d => d.avgLowPrice);
        const highVolumes = filteredData.map(d => d.highPriceVolume);
        const lowVolumes = filteredData.map(d => d.lowPriceVolume);

        // Update Price Chart
        priceChart.data = {
            labels: labels,
            datasets: [
                {
                    label: 'Avg Sell Price',
                    data: avgHighPrices,
                    borderColor: '#c02614', // Redish
                    backgroundColor: 'rgba(192, 38, 20, 0.1)',
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.1
                },
                {
                    label: 'Avg Buy Price',
                    data: avgLowPrices,
                    borderColor: '#014cc0', // Blueish
                    backgroundColor: 'rgba(1, 76, 192, 0.1)',
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.1
                }
            ]
        };
        priceChart.update();

        // Update Volume Chart
        volumeChart.data = {
            labels: labels,
            datasets: [
                {
                    label: 'Sell Volume',
                    data: highVolumes,
                    backgroundColor: '#c02614',
                },
                {
                    label: 'Buy Volume',
                    data: lowVolumes,
                    backgroundColor: '#014cc0',
                }
            ]
        };
        volumeChart.update();

    } catch (err) {
        console.error("Error loading timeseries:", err);
    }
}

// Event Listeners
timeButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
        loadTimeSeries(e.target.dataset.range);
    });
});

// Start
init();
