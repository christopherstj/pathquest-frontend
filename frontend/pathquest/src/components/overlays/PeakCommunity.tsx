"use client";

import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Mountain, Users, Loader2 } from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useMapStore } from "@/providers/MapProvider";
import Summit from "@/typeDefs/Summit";
import PublicSummitCard, { PublicSummitCardSummit } from "@/components/summits/PublicSummitCard";
import PeakPhotosGallery from "@/components/photos/PeakPhotosGallery";

// Extended summit type that includes user info from the API
interface PublicSummit extends Summit {
    user_id?: string;
    user_name?: string;
}

interface PublicSummitsResult {
    summits: PublicSummit[];
    nextCursor: string | null;
    totalCount: number;
}

// Fetch public summits from the API with cursor pagination
const fetchPublicSummits = async (
    peakId: string,
    cursor?: string
): Promise<PublicSummitsResult> => {
    const params = new URLSearchParams();
    params.set("limit", "20");
    if (cursor) params.set("cursor", cursor);

    const res = await fetch(`/api/peaks/${peakId}/public-summits?${params.toString()}`);
    if (!res.ok) {
        throw new Error("Failed to fetch public summits");
    }
    return res.json();
};

const PeakCommunity = () => {
    const selectedPeakCommunityData = useMapStore((state) => state.selectedPeakCommunityData);
    const loadMoreRef = useRef<HTMLDivElement>(null);
    const peakId = selectedPeakCommunityData?.peakId;

    // Infinite query for public summits
    // Must be called unconditionally to follow Rules of Hooks
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
        error,
    } = useInfiniteQuery({
        queryKey: ["publicSummits", peakId],
        queryFn: ({ pageParam }) => fetchPublicSummits(peakId!, pageParam),
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
        initialPageParam: undefined as string | undefined,
        enabled: Boolean(peakId), // Only fetch when peakId is available
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // Flatten all summits from all pages
    const allSummits = data?.pages.flatMap((page) => page.summits) ?? [];
    const totalCount = data?.pages[0]?.totalCount ?? 0;

    // Use IntersectionObserver to load more when sentinel element is visible
    // Must be called unconditionally to follow Rules of Hooks
    useEffect(() => {
        const element = loadMoreRef.current;
        if (!element || !peakId) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 0.1, rootMargin: "200px" }
        );

        observer.observe(element);
        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage, peakId]);

    // Handle empty state (no peak selected)
    if (!selectedPeakCommunityData) {
        return (
            <div className="text-center py-10 text-muted-foreground">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium">Select a peak</p>
                <p className="text-xs mt-1">
                    Community summit history will appear here
                </p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
            className="space-y-5"
        >
            {/* Community Photos Section */}
            {peakId && (
                <div className="border-b border-border/60">
                    <PeakPhotosGallery peakId={peakId} compactLimit={6} />
                </div>
            )}

            {/* Summary */}
            <div className="flex items-center gap-2 text-muted-foreground pb-3 border-b border-border/60">
                <Users className="w-4 h-4" />
                <span className="text-sm">
                    {totalCount > 0 ? totalCount : allSummits.length} recorded summit{totalCount !== 1 && allSummits.length !== 1 ? "s" : ""}
                </span>
            </div>

            {/* Summit List */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
            ) : isError ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-sm text-destructive">
                        {error?.message || "Failed to load summits"}
                    </p>
                </div>
            ) : allSummits.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                    <Mountain className="w-8 h-8 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No public summits recorded yet.</p>
                    <p className="text-xs mt-1">Be the first to summit!</p>
                </div>
            ) : (
                <>
                    <div className="space-y-3">
                        {allSummits.map((summit, idx) => {
                            return (
                                <PublicSummitCard
                                    key={summit.id || idx}
                                    summit={summit as PublicSummitCardSummit}
                                />
                            );
                        })}
                    </div>

                    {/* Sentinel element for infinite scroll */}
                    <div ref={loadMoreRef} className="h-1" />

                    {/* Loading More Indicator */}
                    {isFetchingNextPage && (
                        <div className="flex items-center justify-center py-4">
                            <Loader2 className="w-5 h-5 animate-spin text-primary" />
                            <span className="ml-2 text-sm text-muted-foreground">Loading more...</span>
                        </div>
                    )}

                    {/* End of List */}
                    {!hasNextPage && allSummits.length > 0 && (
                        <div className="text-center py-4 text-xs text-muted-foreground">
                            You&apos;ve reached the end
                        </div>
                    )}
                </>
            )}
        </motion.div>
    );
};

export default PeakCommunity;

