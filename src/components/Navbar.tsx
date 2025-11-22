"use client";

import Link from "next/link";
import "./Navbar.scss";
import { usePathname } from "next/navigation";

export default function Navbar() {
    const pathname = usePathname();

    return (
        <div className="tabs">
            <Link
                href="/"
                className={`tab-btn ${pathname === "/" ? "active" : ""}`}
            >
                Flipping Finder
            </Link>
            <Link
                href="/alchemy"
                className={`tab-btn ${pathname === "/alchemy" ? "active" : ""}`}
            >
                Alchemy Calculator
            </Link>
            <Link
                href="/decanting"
                className={`tab-btn ${pathname === "/decanting" ? "active" : ""}`}
            >
                Decanting Calculator
            </Link>
        </div>
    );
}
