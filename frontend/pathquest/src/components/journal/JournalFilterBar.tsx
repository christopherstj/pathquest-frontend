"use client";

import React from "react";
import { Search, Filter, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface JournalFilterBarProps {
    search: string;
    onSearchChange: (value: string) => void;
    year: number | undefined;
    onYearChange: (year: number | undefined) => void;
    hasReport: boolean | undefined;
    onHasReportChange: (hasReport: boolean | undefined) => void;
    totalCount: number;
}

// Generate year options (current year down to 2010)
const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    for (let y = currentYear; y >= 2010; y--) {
        years.push(y);
    }
    return years;
};

const JournalFilterBar = ({
    search,
    onSearchChange,
    year,
    onYearChange,
    hasReport,
    onHasReportChange,
    totalCount,
}: JournalFilterBarProps) => {
    const years = generateYearOptions();
    const hasActiveFilters = year !== undefined || hasReport !== undefined;

    const clearFilters = () => {
        onYearChange(undefined);
        onHasReportChange(undefined);
    };

    return (
        <div className="space-y-3 px-4">
            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search peaks..."
                    className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
            </div>

            {/* Filter Row */}
            <div className="flex items-center gap-2 flex-wrap">
                {/* Year Filter */}
                <select
                    value={year ?? ""}
                    onChange={(e) => onYearChange(e.target.value ? parseInt(e.target.value) : undefined)}
                    className="px-3 py-1.5 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
                >
                    <option value="">All Years</option>
                    {years.map((y) => (
                        <option key={y} value={y}>
                            {y}
                        </option>
                    ))}
                </select>

                {/* Has Report Filter */}
                <div className="flex rounded-lg border border-border overflow-hidden bg-card">
                    <button
                        onClick={() => onHasReportChange(undefined)}
                        className={cn(
                            "px-3 py-1.5 text-xs font-medium transition-colors",
                            hasReport === undefined
                                ? "text-primary"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        All
                    </button>
                    <button
                        onClick={() => onHasReportChange(true)}
                        className={cn(
                            "px-3 py-1.5 text-xs font-medium transition-colors flex items-center gap-1 border-l border-border",
                            hasReport === true
                                ? "text-green-500"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <FileText className="w-3 h-3" />
                        Has Report
                    </button>
                    <button
                        onClick={() => onHasReportChange(false)}
                        className={cn(
                            "px-3 py-1.5 text-xs font-medium transition-colors border-l border-border",
                            hasReport === false
                                ? "text-orange-500"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Needs Report
                    </button>
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                    >
                        <X className="w-3 h-3" />
                        Clear
                    </button>
                )}

                {/* Result Count */}
                <span className="text-xs text-muted-foreground ml-auto">
                    {totalCount.toLocaleString()} summit{totalCount !== 1 ? "s" : ""}
                </span>
            </div>
        </div>
    );
};

export default JournalFilterBar;

