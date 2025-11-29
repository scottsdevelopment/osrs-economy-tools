"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
    content: string;
    children: React.ReactNode;
}

export default function Tooltip({ content, children }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [coords, setCoords] = useState({ left: 0, top: 0 });
    const [mounted, setMounted] = useState(false);
    const triggerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleMouseEnter = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setCoords({
                left: rect.left + rect.width / 2,
                top: rect.top,
            });
            setIsVisible(true);
        }
    };

    const handleMouseLeave = () => {
        setIsVisible(false);
    };

    return (
        <>
            <div
                ref={triggerRef}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="inline-flex items-center"
            >
                {children}
            </div>
            {mounted && isVisible && createPortal(
                <div
                    className="fixed z-[9999] px-3 py-2 text-sm text-osrs-text-light bg-osrs-tooltip-bg rounded shadow-lg border border-osrs-primary pointer-events-none transform -translate-x-1/2 -translate-y-full"
                    style={{ left: coords.left, top: coords.top - 8 }}
                >
                    {content}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-osrs-tooltip-bg"></div>
                </div>,
                document.body
            )}
        </>
    );
}
