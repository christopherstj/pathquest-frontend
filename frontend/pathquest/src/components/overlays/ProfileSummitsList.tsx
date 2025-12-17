"use client";

import React, { useState, useCallback } from "react";
import { Search, Mountain, ChevronRight, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useMapStore } from "@/providers/MapProvider";
import searchUserPeaks from "@/actions/users/searchUserPeaks";
import searchUserSummits from "@/actions/users/searchUserSummits";
import SummitItem from "@/components/app/summits/SummitItem";
import metersToFt from "@/helpers/metersToFt";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Tab = "peaks" | "summits";

interface ProfileSummitsListProps {
    userId: string;
    compact?: boolean;
}

const ProfileSummitsList = ({ userId, compact = false }: ProfileSummitsListProps) => {
    // When compact, force peaks tab only (no tabs shown, tabs are in DiscoveryDrawer)
    const [activeTab, setActiveTab] = useState<Tab>("peaks");
    const effectiveTab = compact ? "peaks" : activeTab;
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const setHoveredPeakId = useMapStore((state) => state.setHoveredPeakId);

    // Debounce search
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    // Query for peaks
    const { data: peaksData, isLoading: peaksLoading } = useQuery({
        queryKey: ["userPeaks", userId, debouncedSearch],
        queryFn: async () => {
            const res = await searchUserPeaks(userId, debouncedSearch || undefined);
            return res.success ? res.data : null;
        },
        enabled: effectiveTab === "peaks",
    });

    // Query for summits (only when not compact)
    const { data: summitsData, isLoading: summitsLoading } = useQuery({
        queryKey: ["userSummits", userId, debouncedSearch],
        queryFn: async () => {
            const res = await searchUserSummits(userId, debouncedSearch || undefined);
            return res.success ? res.data : null;
        },
        enabled: !compact && effectiveTab === "summits",
    });

    const handlePeakHoverStart = useCallback((peakId: string) => {
        setHoveredPeakId(peakId);
    }, [setHoveredPeakId]);

    const handlePeakHoverEnd = useCallback(() => {
        setHoveredPeakId(null);
    }, [setHoveredPeakId]);

    const isLoading = effectiveTab === "peaks" ? peaksLoading : summitsLoading;
    const peaks = peaksData?.peaks || [];
    const summits = summitsData?.summits || [];

    return (
        <div className={cn("flex flex-col h-full", compact ? "gap-2 pt-4" : "gap-4")}>
            {/* Search Input */}
            <div className="relative px-4">
                <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search peaks..."
                    className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
            </div>

            {/* Tabs - only show when not compact (tabs are in DiscoveryDrawer in compact mode) */}
            {!compact && (
                <div className="flex gap-2 px-4">
                    <button
                        onClick={() => setActiveTab("peaks")}
                        className={cn(
                            "flex-1 py-2 text-sm font-medium rounded-lg transition-colors",
                            effectiveTab === "peaks"
                                ? "bg-primary text-primary-foreground"
                                : "bg-card border border-border text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Peaks
                        {peaksData && (
                            <span className="ml-1.5 text-xs opacity-70">({peaksData.totalCount})</span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab("summits")}
                        className={cn(
                            "flex-1 py-2 text-sm font-medium rounded-lg transition-colors",
                            effectiveTab === "summits"
                                ? "bg-primary text-primary-foreground"
                                : "bg-card border border-border text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Summits
                        {summitsData && (
                            <span className="ml-1.5 text-xs opacity-70">({summitsData.totalCount})</span>
                        )}
                    </button>
                </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : effectiveTab === "peaks" ? (
                    peaks.length > 0 ? (
                        <div className="space-y-2">
                            {peaks.map((peak) => (
                                <Link
                                    key={peak.id}
                                    href={`/peaks/${peak.id}`}
                                    className="flex items-center justify-between p-3 rounded-lg bg-card border border-border/70 hover:bg-card/80 transition-colors"
                                    onMouseEnter={() => handlePeakHoverStart(peak.id)}
                                    onMouseLeave={handlePeakHoverEnd}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-summited/10 flex items-center justify-center">
                                            <Mountain className="w-4 h-4 text-summited" />
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-foreground block">
                                                {peak.name}
                                            </span>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <span>
                                                    {peak.elevation ? Math.round(metersToFt(peak.elevation)).toLocaleString() : 0} ft
                                                </span>
                                                {peak.summit_count > 1 && (
                                                    <>
                                                        <span>•</span>
                                                        <span>{peak.summit_count} summits</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Mountain className="w-12 h-12 text-muted-foreground/50 mb-3" />
                            <p className="text-sm text-muted-foreground">
                                {debouncedSearch ? "No peaks match your search" : "No peaks summited yet"}
                            </p>
                        </div>
                    )
                ) : summits.length > 0 ? (
                    <div className="space-y-3">
                        {summits.map((summit) => (
                            <div key={summit.id}>
                                {/* Date header if needed */}
                                <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                                    <Calendar className="w-3 h-3" />
                                    <span>
                                        {new Date(summit.timestamp).toLocaleDateString("en-US", {
                                            weekday: "long",
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </span>
                                </div>
                                <SummitItem
                                    summit={summit}
                                    showPeakHeader={true}
                                    onHoverStart={handlePeakHoverStart}
                                    onHoverEnd={handlePeakHoverEnd}
                                />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Calendar className="w-12 h-12 text-muted-foreground/50 mb-3" />
                        <p className="text-sm text-muted-foreground">
                            {debouncedSearch ? "No summits match your search" : "No summits recorded yet"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileSummitsList;

