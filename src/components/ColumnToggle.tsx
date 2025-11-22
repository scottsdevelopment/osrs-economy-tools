"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export interface ColumnDefinition {
    key: string;
    label: string;
    group: string;
}

interface ColumnToggleProps {
    columns: ColumnDefinition[];
    visibleColumns: Record<string, boolean>;
    onToggleColumn: (key: string) => void;
    onToggleAll: (visible: boolean) => void;
    onResetToDefault: () => void;
}

export default function ColumnToggle({
    columns,
    visibleColumns,
    onToggleColumn,
    onToggleAll,
    onResetToDefault,
}: ColumnToggleProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Group columns by their group property
    const groupedColumns = columns.reduce((acc, col) => {
        if (!acc[col.group]) {
            acc[col.group] = [];
        }
        acc[col.group].push(col);
        return acc;
    }, {} as Record<string, ColumnDefinition[]>);

    const allVisible = Object.values(visibleColumns).every((v) => v);
    const noneVisible = Object.values(visibleColumns).every((v) => !v);

    return (
        <div className="mb-4 bg-osrs-panel border-2 border-osrs-border rounded-lg overflow-hidden shadow-lg">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-4 py-3 bg-osrs-button text-[#2c1e12] font-header font-bold flex items-center justify-between hover:bg-osrs-button-hover transition-colors"
            >
                <span>Toggle Columns</span>
                {isExpanded ? (
                    <ChevronUp className="w-5 h-5" />
                ) : (
                    <ChevronDown className="w-5 h-5" />
                )}
            </button>

            {/* Content */}
            {isExpanded && (
                <div className="p-4">
                    {/* Action buttons */}
                    <div className="flex gap-2 mb-4 pb-4 border-b-2 border-osrs-border">
                        <button
                            onClick={() => onToggleAll(true)}
                            disabled={allVisible}
                            className="px-3 py-1.5 bg-osrs-button text-[#2c1e12] font-body text-sm rounded border-2 border-osrs-border hover:bg-osrs-button-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Select All
                        </button>
                        <button
                            onClick={() => onToggleAll(false)}
                            disabled={noneVisible}
                            className="px-3 py-1.5 bg-osrs-button text-[#2c1e12] font-body text-sm rounded border-2 border-osrs-border hover:bg-osrs-button-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Deselect All
                        </button>
                        <button
                            onClick={onResetToDefault}
                            className="px-3 py-1.5 bg-osrs-button text-[#2c1e12] font-body text-sm rounded border-2 border-osrs-border hover:bg-osrs-button-hover transition-colors"
                        >
                            Reset to Default
                        </button>
                    </div>

                    {/* Column groups */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Object.entries(groupedColumns).map(([groupName, groupColumns]) => (
                            <div key={groupName} className="space-y-2">
                                <h3 className="text-sm font-header font-bold text-osrs-text border-b border-osrs-border pb-1">
                                    {groupName}
                                </h3>
                                {groupColumns.map((col) => (
                                    <label
                                        key={col.key}
                                        className="flex items-center gap-2 text-sm text-osrs-text font-body cursor-pointer hover:text-osrs-accent transition-colors"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={visibleColumns[col.key] ?? true}
                                            onChange={() => onToggleColumn(col.key)}
                                            className="w-4 h-4 cursor-pointer accent-osrs-accent"
                                        />
                                        <span>{col.label}</span>
                                    </label>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
