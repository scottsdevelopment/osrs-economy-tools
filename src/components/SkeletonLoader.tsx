import React from "react";

interface SkeletonLoaderProps {
    className?: string;
    width?: string | number;
    height?: string | number;
    count?: number;
    circle?: boolean;
    blur?: boolean;
}

export default function SkeletonLoader({
    className = "",
    width,
    height,
    count = 1,
    circle = false,
    blur = true,
}: SkeletonLoaderProps) {
    const skeletons = Array.from({ length: count }).map((_, index) => {
        // Default to 100% width if not provided to avoid hydration mismatches with random values
        // Convert numbers to pixel strings
        const finalWidth = width
            ? (typeof width === 'number' ? `${width}px` : width)
            : "100%";
        const finalHeight = height
            ? (typeof height === 'number' ? `${height}px` : height)
            : undefined;

        const style = {
            width: finalWidth,
            height: finalHeight,
        };

        return (
            <div
                key={index}
                className={`
                    bg-osrs-text-dark/20 
                    ${blur ? "blur-[2px]" : ""} 
                    ${circle ? "rounded-full" : "rounded"} 
                    animate-pulse
                    ${className}
                `}
                style={style}
            >
                &nbsp;
            </div>
        );
    });

    if (count === 1) {
        return skeletons[0];
    }

    return <>{skeletons}</>;
}
