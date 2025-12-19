"use client";

import React from "react";
import { Search, Map, ChevronDown, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { PeakSortBy } from "@/actions/users/searchUserPeaks";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Elevation presets in meters (for API) and feet (for display)
// null = no filter (show all), 0-2 = specific presets
export const ELEVATION_PRESETS = [
    { label: "14ers", minElevation: 4267.2, maxElevation: undefined }, // 14,000+ ft
    { label: "13ers", minElevation: 3962.4, maxElevation: 4267.2 }, // 13,000-13,999 ft
    { label: "12ers", minElevation: 3657.6, maxElevation: 3962.4 }, // 12,000-12,999 ft
] as const;

export const SORT_OPTIONS: { value: PeakSortBy; label: string }[] = [
    { value: "summits", label: "Most Summits" },
    { value: "elevation", label: "Highest" },
    { value: "recent", label: "Most Recent" },
    { value: "oldest", label: "First Climbed" },
    { value: "name", label: "A-Z" },
];

export interface PeaksFilters {
    search: string;
    state: string;
    elevationPreset: number | null; // Index into ELEVATION_PRESETS, null = no filter (all elevations)
    hasMultipleSummits: boolean;
    sortBy: PeakSortBy;
}

interface PeaksFilterBarProps {
    filters: PeaksFilters;
    onFiltersChange: (filters: PeaksFilters) => void;
    states: string[];
    statesLoading: boolean;
    totalCount: number;
    onShowAllOnMap?: () => void;
}

const PeaksFilterBar = ({
    filters,
    onFiltersChange,
    states,
    statesLoading,
    totalCount,
    onShowAllOnMap,
}: PeaksFilterBarProps) => {
    const updateFilter = <K extends keyof PeaksFilters>(key: K, value: PeaksFilters[K]) => {
        onFiltersChange({ ...filters, [key]: value });
    };

    const hasActiveFilters = 
        filters.state !== "" || 
        filters.elevationPreset !== null || 
        filters.hasMultipleSummits;

    const clearFilters = () => {
        onFiltersChange({
            ...filters,
            state: "",
            elevationPreset: null,
            hasMultipleSummits: false,
        });
    };

    const currentSortLabel = SORT_OPTIONS.find(o => o.value === filters.sortBy)?.label ?? "Sort";

    return (
        <div className="space-y-3 px-4">
            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => updateFilter("search", e.target.value)}
                    placeholder="Search peaks..."
                    className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
            </div>

            {/* Filters Row */}
            <div className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {/* State Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            disabled={statesLoading}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition-colors flex-shrink-0",
                                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                                filters.state
                                    ? "bg-primary/10 border-primary/30 text-primary"
                                    : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-border/80"
                            )}
                        >
                            <span>{filters.state || "All States"}</span>
                            <ChevronDown className="w-3 h-3 opacity-60" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                        align="start" 
                        className="max-h-[280px] overflow-y-auto min-w-[140px]"
                    >
                        <DropdownMenuItem
                            onClick={() => updateFilter("state", "")}
                            className="text-xs"
                        >
                            <Check className={cn("w-3 h-3 mr-2", filters.state === "" ? "opacity-100" : "opacity-0")} />
                            All States
                        </DropdownMenuItem>
                        {states.map((state) => (
                            <DropdownMenuItem
                                key={state}
                                onClick={() => updateFilter("state", state)}
                                className="text-xs"
                            >
                                <Check className={cn("w-3 h-3 mr-2", filters.state === state ? "opacity-100" : "opacity-0")} />
                                {state}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Elevation Presets */}
                {ELEVATION_PRESETS.map((preset, idx) => (
                    <button
                        key={preset.label}
                        onClick={() => updateFilter("elevationPreset", filters.elevationPreset === idx ? null : idx)}
                        className={cn(
                            "px-3 py-1.5 text-xs font-medium rounded-full border transition-colors flex-shrink-0",
                            filters.elevationPreset === idx
                                ? "bg-primary/10 border-primary/30 text-primary"
                                : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-border/80"
                        )}
                    >
                        {preset.label}
                    </button>
                ))}

                {/* Multiple Summits Toggle */}
                <button
                    onClick={() => updateFilter("hasMultipleSummits", !filters.hasMultipleSummits)}
                    className={cn(
                        "px-3 py-1.5 text-xs font-medium rounded-full border transition-colors flex-shrink-0",
                        filters.hasMultipleSummits
                            ? "bg-primary/10 border-primary/30 text-primary"
                            : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-border/80"
                    )}
                >
                    Repeat Peaks
                </button>
            </div>

            {/* Sort & Actions Row */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    {/* Sort Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-card border border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
                                <span>{currentSortLabel}</span>
                                <ChevronDown className="w-3 h-3 opacity-60" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="min-w-[140px]">
                            {SORT_OPTIONS.map((option) => (
                                <DropdownMenuItem
                                    key={option.value}
                                    onClick={() => updateFilter("sortBy", option.value)}
                                    className="text-xs"
                                >
                                    <Check className={cn("w-3 h-3 mr-2", filters.sortBy === option.value ? "opacity-100" : "opacity-0")} />
                                    {option.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Clear Filters */}
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="w-3 h-3" />
                            Clear
                        </button>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    {/* Total Count */}
                    <span className="text-xs text-muted-foreground">
                        {totalCount} peak{totalCount !== 1 ? "s" : ""}
                    </span>

                    {/* Show All on Map Button */}
                    {onShowAllOnMap && (
                        <button
                            onClick={onShowAllOnMap}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors"
                        >
                            <Map className="w-3.5 h-3.5" />
                            Show All
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PeaksFilterBar;
