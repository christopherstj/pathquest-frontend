"use client";

import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { Mountain, ChevronRight, Calendar, Loader2 } from "lucide-react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useMapStore } from "@/providers/MapProvider";
import searchUserPeaks, { SearchUserPeaksFilters } from "@/actions/users/searchUserPeaks";
import searchUserSummits from "@/actions/users/searchUserSummits";
import getUserSummitStates from "@/actions/users/getUserSummitStates";
import SummitItem from "@/components/app/summits/SummitItem";
import { PeaksFilterBar, ELEVATION_PRESETS, type PeaksFilters } from "@/components/peaks";
import { useProfilePeaksMapEffects } from "@/hooks/use-profile-peaks-map-effects";
import metersToFt from "@/helpers/metersToFt";
import Link from "next/link";
import { cn } from "@/lib/utils";
import mapboxgl from "mapbox-gl";

type Tab = "peaks" | "summits";

interface ProfileSummitsListProps {
    userId: string;
    compact?: boolean;
    isActive?: boolean; // Whether the Profile Peaks tab is currently active
}

const PAGE_SIZE = 50;

const ProfileSummitsList = ({ userId, compact = false, isActive = true }: ProfileSummitsListProps) => {
    // When compact, force peaks tab only (no tabs shown, tabs are in DiscoveryDrawer)
    const [activeTab, setActiveTab] = useState<Tab>("peaks");
    const effectiveTab = compact ? "peaks" : activeTab;
    const setHoveredPeakId = useMapStore((state) => state.setHoveredPeakId);
    const map = useMapStore((state) => state.map);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Filter state
    const [filters, setFilters] = useState<PeaksFilters>({
        search: "",
        state: "",
        elevationPreset: null,
        hasMultipleSummits: false,
        sortBy: "summits",
    });

    // Debounced search
    const [debouncedSearch, setDebouncedSearch] = useState("");
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(filters.search);
        }, 300);
        return () => clearTimeout(timer);
    }, [filters.search]);

    // Convert filters to API format
    const apiFilters: SearchUserPeaksFilters = useMemo(() => {
        const preset = filters.elevationPreset !== null ? ELEVATION_PRESETS[filters.elevationPreset] : null;
        return {
            search: debouncedSearch || undefined,
            state: filters.state || undefined,
            minElevation: preset?.minElevation,
            maxElevation: preset?.maxElevation,
            hasMultipleSummits: filters.hasMultipleSummits || undefined,
            sortBy: filters.sortBy,
        };
    }, [debouncedSearch, filters.state, filters.elevationPreset, filters.hasMultipleSummits, filters.sortBy]);

    // Query for states (for dropdown)
    const { data: statesData, isLoading: statesLoading } = useQuery({
        queryKey: ["userSummitStates", userId],
        queryFn: async () => {
            const res = await getUserSummitStates(userId);
            return res.success && res.data ? res.data.states : [];
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // Determine if we should show peaks on map
    const shouldShowPeaksOnMap = effectiveTab === "peaks" && isActive;

    // Query to fetch ALL peaks for map display (no pagination)
    // We fetch all peaks upfront since there typically aren't too many
    const { data: allPeaksData } = useQuery({
        queryKey: ["userPeaksAll", userId, apiFilters],
        queryFn: async () => {
            // Fetch with a very large pageSize to get all peaks at once
            const res = await searchUserPeaks(userId, apiFilters, 1, 10000);
            return res.success && res.data ? res.data.peaks : [];
        },
        enabled: shouldShowPeaksOnMap,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // Infinite query for peaks (for list display with pagination)
    const {
        data: peaksData,
        fetchNextPage: fetchNextPeaksPage,
        hasNextPage: hasNextPeaksPage,
        isFetchingNextPage: isFetchingNextPeaksPage,
        isLoading: peaksLoading,
    } = useInfiniteQuery({
        queryKey: ["userPeaks", userId, apiFilters],
        queryFn: async ({ pageParam = 1 }) => {
            const res = await searchUserPeaks(userId, apiFilters, pageParam, PAGE_SIZE);
            return res.success ? { ...res.data, page: pageParam } : null;
        },
        getNextPageParam: (lastPage) => {
            if (!lastPage || !lastPage.totalCount) return undefined;
            const totalPages = Math.ceil(lastPage.totalCount / PAGE_SIZE);
            return lastPage.page < totalPages ? lastPage.page + 1 : undefined;
        },
        initialPageParam: 1,
        enabled: effectiveTab === "peaks",
    });

    // Query for summits (only when not compact) - keeping simple for now
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

    // Load more when scrolling near the bottom
    const handleScroll = useCallback(() => {
        if (!scrollRef.current || effectiveTab !== "peaks") return;
        
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        const scrolledToBottom = scrollTop + clientHeight >= scrollHeight - 200;
        
        if (scrolledToBottom && hasNextPeaksPage && !isFetchingNextPeaksPage) {
            fetchNextPeaksPage();
        }
    }, [effectiveTab, hasNextPeaksPage, isFetchingNextPeaksPage, fetchNextPeaksPage]);

    // Attach scroll listener
    useEffect(() => {
        const element = scrollRef.current;
        if (!element) return;
        
        element.addEventListener("scroll", handleScroll);
        return () => element.removeEventListener("scroll", handleScroll);
    }, [handleScroll]);

    // Flatten all peaks from all pages
    const peaks = peaksData?.pages.flatMap((page) => page?.peaks ?? []) ?? [];
    const peaksTotalCount = peaksData?.pages[0]?.totalCount ?? 0;
    const summits = summitsData?.summits || [];

    const isLoading = effectiveTab === "peaks" ? peaksLoading : summitsLoading;

    // Use all peaks for map display, but paginated peaks for list display
    const peaksForMap = shouldShowPeaksOnMap ? (allPeaksData || peaks) : null;
    useProfilePeaksMapEffects({
        peaks: peaksForMap,
        isActive: shouldShowPeaksOnMap,
    });

    // Show all peaks on map
    const handleShowAllOnMap = useCallback(() => {
        if (!map || peaks.length === 0) return;

        // Get all peak coordinates
        const coords = peaks
            .filter((p) => p.location_coords)
            .map((p) => p.location_coords as [number, number]);

        if (coords.length === 0) return;

        // Calculate bounds
        const bounds = coords.reduce(
            (acc, coord) => {
                return acc.extend(coord as [number, number]);
            },
            new mapboxgl.LngLatBounds(coords[0], coords[0])
        );

        // Fit map to bounds
        map.fitBounds(bounds, {
            padding: { top: 50, bottom: 200, left: 50, right: 50 },
            maxZoom: 10,
            duration: 1000,
        });
    }, [map, peaks]);

    return (
        <div className={cn("flex flex-col h-full", compact ? "gap-2 pt-2" : "gap-4")}>
            {/* Filter Bar - only show in peaks tab */}
            {effectiveTab === "peaks" && (
                <PeaksFilterBar
                    filters={filters}
                    onFiltersChange={setFilters}
                    states={statesData ?? []}
                    statesLoading={statesLoading}
                    totalCount={peaksTotalCount}
                    onShowAllOnMap={peaks.length > 0 ? handleShowAllOnMap : undefined}
                />
            )}

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
                        {peaksTotalCount > 0 && (
                            <span className="ml-1.5 text-xs opacity-70">({peaksTotalCount})</span>
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
            <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar"
            >
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : effectiveTab === "peaks" ? (
                    peaks.length > 0 ? (
                        <>
                            <div className="space-y-2">
                                {peaks.map((peak) => (
                                    <Link
                                        key={peak.id}
                                        href={`/peaks/${peak.id}`}
                                        className="flex items-center justify-between p-3 rounded-lg bg-card border border-border/70 hover:bg-card/80 transition-colors"
                                        onMouseEnter={() => handlePeakHoverStart(peak.id)}
                                        onMouseLeave={handlePeakHoverEnd}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-8 h-8 rounded-full bg-summited/10 flex items-center justify-center flex-shrink-0">
                                                <Mountain className="w-4 h-4 text-summited" />
                                            </div>
                                            <div className="min-w-0">
                                                <span className="text-sm font-medium text-foreground block truncate">
                                                    {peak.name}
                                                </span>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <span>
                                                        {peak.elevation ? Math.round(metersToFt(peak.elevation)).toLocaleString() : 0} ft
                                                    </span>
                                                    {peak.state && (
                                                        <>
                                                            <span>•</span>
                                                            <span>{peak.state}</span>
                                                        </>
                                                    )}
                                                    {peak.summit_count > 1 && (
                                                        <>
                                                            <span>•</span>
                                                            <span>{peak.summit_count}×</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                    </Link>
                                ))}
                            </div>

                            {/* Loading More Indicator */}
                            {isFetchingNextPeaksPage && (
                                <div className="flex items-center justify-center py-4">
                                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                    <span className="ml-2 text-sm text-muted-foreground">Loading more...</span>
                                </div>
                            )}

                            {/* End of List */}
                            {!hasNextPeaksPage && peaks.length > 0 && (
                                <div className="text-center py-4 text-xs text-muted-foreground">
                                    Showing all {peaks.length} peak{peaks.length !== 1 ? "s" : ""}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Mountain className="w-12 h-12 text-muted-foreground/50 mb-3" />
                            <p className="text-sm text-muted-foreground">
                                {debouncedSearch || filters.state || filters.elevationPreset !== null || filters.hasMultipleSummits
                                    ? "No peaks match your filters"
                                    : "No peaks summited yet"}
                            </p>
                        </div>
                    )
                ) : summits.length > 0 ? (
                    <div className="space-y-3">
                        {summits.map((summit, idx) => (
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
                                    index={idx + 1}
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
