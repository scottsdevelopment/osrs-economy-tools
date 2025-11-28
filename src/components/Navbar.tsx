"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import { Search, Menu, Heart, ChevronDown, RefreshCw, FlaskConical } from "lucide-react";
import { useItemData } from "@/context/ItemDataContext";
import { useFilters } from "@/context/FilterContext";
import ItemSearch from "@/components/ItemSearch";

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const { items, autoRefresh, timeLeft, refreshData, toggleAutoRefresh, loading } = useItemData();
    const { savedFilters, handleToggleFilter } = useFilters();
    const [showMoreDropdown, setShowMoreDropdown] = useState(false);

    const isFavoritesEnabled = savedFilters.find(f => f.id === "favorites_only")?.enabled || false;

    return (
        <nav className="sticky top-0 z-50 bg-osrs-primary text-[#f5e6d3] h-14 flex items-center justify-between px-4 shadow-md border-b border-osrs-border">
            {/* Left Section: Logo */}
            <div className="flex items-center gap-2 shrink-0">
                <Link href="/" className="flex items-center gap-2 hover:text-white transition-colors">
                    <div className="w-8 h-8 bg-osrs-accent rounded-full flex items-center justify-center border border-osrs-border">
                        <Image src="/icon.png" alt="GE Flip Icon" width={18} height={18} className="object-contain" />
                    </div>
                    <span className="font-header font-bold text-lg tracking-wide text-[#f5e6d3] hidden sm:inline">GE Flip</span>
                </Link>
            </div>

            {/* Center Section: Search Bar (50% width) */}
            <div className="flex-1 max-w-[50%] mx-4 hidden md:block">
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

            {/* Center-Right Section: Navigation Buttons */}
            <div className="flex items-center gap-2 shrink-0">
                {/* All Items Button */}
                <Link
                    href="/"
                    className={`flex items-center gap-2 px-3 py-1.5 rounded hover:bg-osrs-accent transition-colors ${pathname === "/" ? "text-[#f5e6d3] bg-osrs-accent shadow-inner" : "text-[#d1c6a6] hover:text-[#f5e6d3]"}`}
                >
                    <Menu size={18} />
                    <span className="text-sm font-medium">All Items</span>
                </Link>

                {/* Favourites Button */}
                {/* Favourites Button */}
                <button
                    onClick={() => handleToggleFilter("favorites_only")}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded hover:bg-osrs-accent transition-colors ${isFavoritesEnabled ? "text-[#f5e6d3] bg-osrs-accent shadow-inner" : "text-[#d1c6a6] hover:text-[#f5e6d3]"}`}
                >
                    <Heart size={18} className={isFavoritesEnabled ? "fill-current" : ""} />
                    <span className="text-sm font-medium">Favourites</span>
                </button>

                {/* More Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setShowMoreDropdown(!showMoreDropdown)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-osrs-accent text-[#d1c6a6] hover:text-[#f5e6d3] transition-colors"
                    >
                        <span className="text-sm font-medium">More</span>
                        <ChevronDown size={16} />
                    </button>

                    {/* Dropdown Menu */}
                    {showMoreDropdown && (
                        <>
                            {/* Backdrop to close dropdown when clicking outside */}
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setShowMoreDropdown(false)}
                            />
                            <div className="absolute top-full left-0 mt-2 w-48 bg-[#2b2520] border border-osrs-border rounded shadow-lg z-50">
                                <Link
                                    href="/alchemy"
                                    className="flex items-center gap-2 px-4 py-3 hover:bg-osrs-accent transition-colors text-[#f5e6d3] border-b border-osrs-border"
                                    onClick={() => setShowMoreDropdown(false)}
                                >
                                    <FlaskConical size={16} className="text-[#c5a465]" />
                                    <span className="text-sm font-medium">Alchemy</span>
                                </Link>
                                <a
                                    href="#"
                                    className="flex items-center gap-2 px-4 py-3 hover:bg-osrs-accent transition-colors text-[#f5e6d3] border-b border-osrs-border"
                                    onClick={(e) => { e.preventDefault(); setShowMoreDropdown(false); }}
                                >
                                    <span className="text-sm font-medium">Changelog</span>
                                </a>
                                <a
                                    href="#"
                                    className="flex items-center gap-2 px-4 py-3 hover:bg-osrs-accent transition-colors text-[#f5e6d3] border-b border-osrs-border"
                                    onClick={(e) => { e.preventDefault(); setShowMoreDropdown(false); }}
                                >
                                    <span className="text-sm font-medium">API</span>
                                </a>
                                <a
                                    href="#"
                                    className="flex items-center gap-2 px-4 py-3 hover:bg-osrs-accent transition-colors text-[#f5e6d3]"
                                    onClick={(e) => { e.preventDefault(); setShowMoreDropdown(false); }}
                                >
                                    <span className="text-sm font-medium">FAQs</span>
                                </a>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Right Section: Refresh Controls */}
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3">
                    <input
                        type="checkbox"
                        id="auto-refresh"
                        className="accent-osrs-accent"
                        checked={autoRefresh}
                        onChange={toggleAutoRefresh}
                    />
                    <label htmlFor="auto-refresh" className="text-xs text-[#d1c6a6] cursor-pointer select-none whitespace-nowrap hidden lg:inline">
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
