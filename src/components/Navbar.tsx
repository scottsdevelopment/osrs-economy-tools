"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, List, Heart, MoreHorizontal, RefreshCw, Coins, FlaskConical, Droplets } from "lucide-react";
import { useItemData } from "@/context/ItemDataContext";
import ItemSearch from "@/components/ItemSearch";

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { items, autoRefresh, timeLeft, refreshData, toggleAutoRefresh, loading } = useItemData();

    return (
        <nav className="bg-osrs-primary text-[#f5e6d3] h-14 flex items-center justify-between px-4 shadow-md border-b border-osrs-border">
            {/* Left Section: Logo & Title */}
            <div className="flex items-center gap-4">
                <Link href="/" className="flex items-center gap-2 hover:text-white transition-colors">
                    <div className="w-8 h-8 bg-osrs-accent rounded-full flex items-center justify-center border border-osrs-border">
                        <Coins size={18} className="text-[#f5e6d3]" />
                    </div>
                    <span className="font-header font-bold text-lg tracking-wide text-[#f5e6d3]">OSRS Tools</span>
                </Link>

                <div className="h-6 w-px bg-osrs-border mx-2 hidden md:block"></div>

                <span className="text-xs text-[#d1c6a6] hidden md:block">from the OSRS Wiki</span>
            </div>

            {/* Center Section: Search Bar */}
            <div className="flex-1 max-w-2xl mx-8 hidden md:block">
                <div className="relative">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none z-10">
                        <Search size={16} className="text-osrs-primary" />
                    </div>
                    <ItemSearch
                        items={items}
                        placeholder="Search for an item..."
                        onSelect={(item) => router.push(`/item/${item.id}`)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Right Section: Navigation & Actions */}
            <div className="flex items-center gap-1">
                <Link
                    href="/"
                    className={`flex items-center gap-2 px-3 py-1.5 rounded hover:bg-osrs-accent transition-colors ${pathname === "/" ? "text-[#f5e6d3] bg-osrs-accent shadow-inner" : "text-[#d1c6a6] hover:text-[#f5e6d3]"}`}
                >
                    <List size={16} />
                    <span className="text-sm font-medium">Prices</span>
                </Link>

                <Link
                    href="/alchemy"
                    className={`flex items-center gap-2 px-3 py-1.5 rounded hover:bg-osrs-accent transition-colors ${pathname === "/alchemy" ? "text-[#f5e6d3] bg-osrs-accent shadow-inner" : "text-[#d1c6a6] hover:text-[#f5e6d3]"}`}
                >
                    <FlaskConical size={16} />
                    <span className="text-sm font-medium hidden lg:inline">Alchemy</span>
                </Link>

                <Link
                    href="/decanting"
                    className={`flex items-center gap-2 px-3 py-1.5 rounded hover:bg-osrs-accent transition-colors ${pathname === "/decanting" ? "text-[#f5e6d3] bg-osrs-accent shadow-inner" : "text-[#d1c6a6] hover:text-[#f5e6d3]"}`}
                >
                    <Droplets size={16} />
                    <span className="text-sm font-medium hidden lg:inline">Decanting</span>
                </Link>

                <button className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-osrs-accent text-[#d1c6a6] hover:text-[#f5e6d3] transition-colors">
                    <Heart size={16} />
                    <span className="text-sm font-medium hidden xl:inline">Favourites</span>
                </button>

                <div className="h-6 w-px bg-osrs-border mx-2"></div>

                <div className="flex items-center gap-2 px-3">
                    <input
                        type="checkbox"
                        id="auto-refresh"
                        className="accent-osrs-accent"
                        checked={autoRefresh}
                        onChange={toggleAutoRefresh}
                    />
                    <label htmlFor="auto-refresh" className="text-xs text-[#d1c6a6] cursor-pointer select-none whitespace-nowrap">
                        Auto-refresh (<span className="tabular-nums inline-block w-[2ch] text-right">{timeLeft}</span>s)
                    </label>
                </div>

                <button
                    className="p-2 rounded hover:bg-osrs-accent text-[#d1c6a6] hover:text-[#f5e6d3] transition-colors"
                    title="Refresh"
                    onClick={refreshData}
                    disabled={loading}
                >
                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                </button>
            </div>
        </nav>
    );
}
