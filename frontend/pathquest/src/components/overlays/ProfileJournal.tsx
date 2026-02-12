"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import dayjs from "@/helpers/dayjs";
import Link from "next/link";
import { BookOpen, Loader2, LayoutList, Layers, Mountain, FileText, Plus, Calendar, ChevronRight } from "lucide-react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { JournalEntry, JournalResult } from "@/typeDefs/JournalEntry";
import { JournalEntryCard, JournalFilterBar } from "@/components/journal";
import { useIsAuthenticated } from "@/hooks/useRequireAuth";

type ViewMode = "summit" | "activity";

interface ProfileJournalProps {
    userId: string;
}

// Fetch journal entries from the API
const fetchJournal = async (
    userId: string,
    cursor?: string,
    search?: string,
    year?: number,
    hasReport?: boolean
): Promise<JournalResult> => {
    const params = new URLSearchParams();
    params.set("limit", "20");
    if (cursor) params.set("cursor", cursor);
    if (search) params.set("search", search);
    if (year) params.set("year", String(year));
    if (hasReport !== undefined) params.set("hasReport", String(hasReport));

    const res = await fetch(`/api/users/${userId}/journal?${params.toString()}`);
    if (!res.ok) {
        throw new Error("Failed to fetch journal");
    }
    return res.json();
};

const ProfileJournal = ({ userId }: ProfileJournalProps) => {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [year, setYear] = useState<number | undefined>(undefined);
    const [hasReport, setHasReport] = useState<boolean | undefined>(undefined);
    const [viewMode, setViewMode] = useState<ViewMode>("summit");
    
    const loadMoreRef = useRef<HTMLDivElement>(null);
    const queryClient = useQueryClient();
    
    // Determine if current user is the owner of this profile
    const { user } = useIsAuthenticated();
    const isOwner = Boolean(user?.id && String(user.id) === String(userId));

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    // Infinite query for journal entries
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
        error,
    } = useInfiniteQuery({
        queryKey: ["userJournal", userId, debouncedSearch, year, hasReport],
        queryFn: ({ pageParam }) => 
            fetchJournal(userId, pageParam, debouncedSearch || undefined, year, hasReport),
        getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
        initialPageParam: undefined as string | undefined,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    // Flatten all entries from all pages
    const allEntries = data?.pages.flatMap((page) => page.entries) ?? [];
    const totalCount = data?.pages[0]?.totalCount ?? 0;

    // Group entries by activity for activity view
    const groupedByActivity = useMemo(() => {
        const groups: Map<string | null, JournalEntry[]> = new Map();
        
        allEntries.forEach((entry) => {
            const activityId = entry.activity?.id ?? null;
            if (!groups.has(activityId)) {
                groups.set(activityId, []);
            }
            groups.get(activityId)!.push(entry);
        });
        
        // Convert to array and sort by most recent summit in each group
        return Array.from(groups.entries())
            .map(([activityId, entries]) => ({
                activityId,
                entries: entries.sort((a, b) => 
                    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                ),
                mostRecentTimestamp: entries.reduce((latest, e) => {
                    const ts = new Date(e.timestamp).getTime();
                    return ts > latest ? ts : latest;
                }, 0),
            }))
            .sort((a, b) => b.mostRecentTimestamp - a.mostRecentTimestamp);
    }, [allEntries]);

    // Use IntersectionObserver to load more when sentinel element is visible
    useEffect(() => {
        const element = loadMoreRef.current;
        if (!element) return;

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
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    // Handle summit deletion - invalidate query to refresh
    const handleDeleted = () => {
        queryClient.invalidateQueries({ queryKey: ["userJournal", userId] });
    };

    return (
        <div className="flex flex-col h-full gap-4">
            {/* Filter Bar with View Toggle */}
            <div className="px-4 flex items-center justify-between gap-4">
                <JournalFilterBar
                    search={search}
                    onSearchChange={setSearch}
                    year={year}
                    onYearChange={setYear}
                    hasReport={hasReport}
                    onHasReportChange={setHasReport}
                    totalCount={totalCount}
                />
                
                {/* View mode toggle */}
                <div className="flex rounded-md border border-border overflow-hidden flex-shrink-0">
                    <button
                        onClick={() => setViewMode("summit")}
                        className={cn(
                            "flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium transition-colors",
                            viewMode === "summit"
                                ? "bg-summited/15 text-summited"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <LayoutList className="w-3.5 h-3.5" />
                        Summits
                    </button>
                    <button
                        onClick={() => setViewMode("activity")}
                        className={cn(
                            "flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium transition-colors border-l border-border",
                            viewMode === "activity"
                                ? "bg-summited/15 text-summited"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Layers className="w-3.5 h-3.5" />
                        Activities
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="px-4 pb-4">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : isError ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <p className="text-sm text-destructive">
                            {error?.message || "Failed to load journal"}
                        </p>
                        <button
                            onClick={() => queryClient.invalidateQueries({ queryKey: ["userJournal", userId] })}
                            className="mt-2 text-xs text-primary hover:underline"
                        >
                            Try again
                        </button>
                    </div>
                ) : allEntries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <BookOpen className="w-12 h-12 text-muted-foreground/50 mb-3" />
                        <p className="text-sm text-muted-foreground">
                            {debouncedSearch || year || hasReport !== undefined
                                ? "No summits match your filters"
                                : "No summit journal entries yet"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {debouncedSearch || year || hasReport !== undefined
                                ? "Try adjusting your filters"
                                : "Summit records will appear here"}
                        </p>
                    </div>
                ) : viewMode === "summit" ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-2"
                    >
                        {allEntries.map((entry) => (
                            <JournalEntryCard
                                key={entry.id}
                                entry={entry}
                                isOwner={isOwner}
                                onDeleted={handleDeleted}
                            />
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3"
                    >
                        {groupedByActivity.map((group) => {
                            const isManual = group.activityId === null;
                            const firstEntry = group.entries[0];
                            
                            const formattedDate = (() => {
                                try {
                                    return dayjs(firstEntry.timestamp).format("MMM D, YYYY");
                                } catch {
                                    return "";
                                }
                            })();

                            return (
                                <div 
                                    key={group.activityId ?? "manual"} 
                                    className="rounded-lg border border-border bg-card overflow-hidden"
                                >
                                    {/* Activity header */}
                                    {isManual ? (
                                        <div className="p-3 border-b border-border bg-muted/30">
                                            <div className="flex items-center gap-2">
                                                <Plus className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-sm font-medium text-foreground">Manual Summits</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {group.entries.length} summit{group.entries.length !== 1 ? "s" : ""}
                                            </p>
                                        </div>
                                    ) : (
                                        <Link
                                            href={`/activities/${group.activityId}`}
                                            className="block p-3 border-b border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-muted-foreground" />
                                                        <span className="text-sm font-medium text-foreground">
                                                            {formattedDate}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-0.5">
                                                        {group.entries.length} summit{group.entries.length !== 1 ? "s" : ""} · Tap to view activity
                                                    </p>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                            </div>
                                        </Link>
                                    )}
                                    
                                    {/* Summits in this group */}
                                    <div className="divide-y divide-border">
                                        {group.entries.map((entry) => {
                                            const hasReport = !!(entry.notes || entry.difficulty || entry.experienceRating);
                                            
                                            return (
                                                <Link 
                                                    key={entry.id} 
                                                    href={`/peaks/${entry.peak.id}`}
                                                    className="p-3 flex items-center gap-3 hover:bg-muted/30 transition-colors"
                                                >
                                                    <div className="w-8 h-8 rounded-md bg-summited/15 flex items-center justify-center flex-shrink-0">
                                                        <Mountain className="w-4 h-4 text-summited" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-foreground truncate">
                                                            {entry.peak.name}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {hasReport ? "Has trip report" : "No report yet"}
                                                        </p>
                                                    </div>
                                                    {hasReport ? (
                                                        <FileText className="w-4 h-4 text-summited flex-shrink-0" />
                                                    ) : (
                                                        <Plus className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                                    )}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </motion.div>
                )}

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
                {!hasNextPage && allEntries.length > 0 && (
                    <div className="text-center py-4 text-xs text-muted-foreground">
                        You&apos;ve reached the end
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileJournal;
