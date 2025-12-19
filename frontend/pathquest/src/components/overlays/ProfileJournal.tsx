"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { BookOpen, Loader2 } from "lucide-react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { JournalResult } from "@/typeDefs/JournalEntry";
import { JournalEntryCard, JournalFilterBar } from "@/components/journal";
import { useIsAuthenticated } from "@/hooks/useRequireAuth";

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
    
    const scrollRef = useRef<HTMLDivElement>(null);
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

    // Load more when scrolling near the bottom
    const handleScroll = useCallback(() => {
        if (!scrollRef.current) return;
        
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        const scrolledToBottom = scrollTop + clientHeight >= scrollHeight - 200;
        
        if (scrolledToBottom && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    // Attach scroll listener
    useEffect(() => {
        const element = scrollRef.current;
        if (!element) return;
        
        element.addEventListener("scroll", handleScroll);
        return () => element.removeEventListener("scroll", handleScroll);
    }, [handleScroll]);

    // Handle summit deletion - invalidate query to refresh
    const handleDeleted = () => {
        queryClient.invalidateQueries({ queryKey: ["userJournal", userId] });
    };

    return (
        <div className="flex flex-col h-full gap-4">
            {/* Filter Bar */}
            <JournalFilterBar
                search={search}
                onSearchChange={setSearch}
                year={year}
                onYearChange={setYear}
                hasReport={hasReport}
                onHasReportChange={setHasReport}
                totalCount={totalCount}
            />

            {/* Content */}
            <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar"
            >
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
                ) : (
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
                )}

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
