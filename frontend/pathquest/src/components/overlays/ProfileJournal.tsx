"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Mountain, Route, Calendar, BookOpen } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import searchUserSummits from "@/actions/users/searchUserSummits";
import getActivityDetails from "@/actions/activities/getActivityDetails";
import ActivityWithSummits from "@/components/app/activities/ActivityWithSummits";
import OrphanSummitCard from "@/components/app/summits/OrphanSummitCard";
import SummitWithPeak from "@/typeDefs/SummitWithPeak";
import Activity from "@/typeDefs/Activity";
import { useIsAuthenticated } from "@/hooks/useRequireAuth";

interface ProfileJournalProps {
    userId: string;
}

const ProfileJournal = ({ userId }: ProfileJournalProps) => {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const queryClient = useQueryClient();
    
    // Determine if current user is the owner of this profile
    const { user } = useIsAuthenticated();
    const isOwner = user?.id === userId;
    
    // Callback to refresh data when a summit is deleted
    const handleSummitDeleted = () => {
        queryClient.invalidateQueries({ queryKey: ["userSummitsJournal", userId] });
    };

    // Debounce search
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    // Fetch all summits (with large page size to get all)
    const { data: summitsData, isLoading: summitsLoading } = useQuery({
        queryKey: ["userSummitsJournal", userId, debouncedSearch],
        queryFn: async () => {
            const res = await searchUserSummits(userId, debouncedSearch || undefined, 1, 500);
            return res.success ? res.data : null;
        },
    });

    // Group summits by activity_id
    const { activityIds, summitsByActivity, orphanSummits } = useMemo(() => {
        const summits = summitsData?.summits ?? [];
        const summitsByActivity = new Map<string, SummitWithPeak[]>();
        const orphanSummits: SummitWithPeak[] = [];
        const activityIds = new Set<string>();

        summits.forEach((summit) => {
            if (summit.activity_id) {
                const activityIdStr = String(summit.activity_id);
                activityIds.add(activityIdStr);
                const existing = summitsByActivity.get(activityIdStr) || [];
                summitsByActivity.set(activityIdStr, [...existing, summit]);
            } else {
                orphanSummits.push(summit);
            }
        });

        return { activityIds: Array.from(activityIds), summitsByActivity, orphanSummits };
    }, [summitsData]);

    // Fetch activity details for all activity IDs
    const { data: activitiesData, isLoading: activitiesLoading } = useQuery({
        queryKey: ["profileJournalActivities", activityIds],
        queryFn: async () => {
            if (activityIds.length === 0) return new Map<string, Activity>();

            // Fetch activity details in parallel (batch of 10 at a time)
            const activityMap = new Map<string, Activity>();
            const batchSize = 10;

            for (let i = 0; i < activityIds.length; i += batchSize) {
                const batch = activityIds.slice(i, i + batchSize);
                const results = await Promise.all(
                    batch.map(async (id) => {
                        try {
                            const result = await getActivityDetails(id);
                            return { id, activity: result?.activity };
                        } catch {
                            return { id, activity: null };
                        }
                    })
                );
                results.forEach((r) => {
                    if (r.activity) {
                        activityMap.set(r.id, r.activity);
                    }
                });
            }

            return activityMap;
        },
        enabled: activityIds.length > 0,
    });

    // Sort activities by date (most recent first)
    const sortedActivities = useMemo(() => {
        if (!activitiesData) return [];
        return Array.from(activitiesData.values()).sort(
            (a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
        );
    }, [activitiesData]);

    // Sort orphan summits by date (most recent first)
    const sortedOrphanSummits = useMemo(() => {
        return orphanSummits.sort(
            (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
    }, [orphanSummits]);

    const isLoading = summitsLoading || activitiesLoading;
    const totalSummits = summitsData?.totalCount ?? 0;
    const totalActivities = sortedActivities.length;

    return (
        <div className="flex flex-col h-full gap-4">
            {/* Search Input */}
            <div className="relative px-4">
                <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search summits..."
                    className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-lg text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : totalSummits === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <BookOpen className="w-12 h-12 text-muted-foreground/50 mb-3" />
                        <p className="text-sm text-muted-foreground">
                            {debouncedSearch
                                ? "No summits match your search"
                                : "No summit journal entries yet"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Summit records will appear here
                        </p>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Activities with Summits */}
                        {sortedActivities.length > 0 && (
                            <section className="space-y-3">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Route className="w-3.5 h-3.5 text-primary" />
                                    <span className="font-medium uppercase tracking-wider">
                                        Activities ({totalActivities})
                                    </span>
                                </div>
                                {sortedActivities.map((activity) => {
                                    const summits = summitsByActivity.get(String(activity.id)) || [];
                                    return (
                                        <ActivityWithSummits
                                            key={activity.id}
                                            activity={activity}
                                            summits={[]}
                                            summitsWithPeak={summits}
                                            showPeakHeaders={true}
                                            isOwner={isOwner}
                                            onSummitDeleted={handleSummitDeleted}
                                        />
                                    );
                                })}
                            </section>
                        )}

                        {/* Manual Summits (without activity) */}
                        {sortedOrphanSummits.length > 0 && (
                            <section className="space-y-3">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Mountain className="w-3.5 h-3.5 text-summited" />
                                    <span className="font-medium uppercase tracking-wider">
                                        Manual Summits ({sortedOrphanSummits.length})
                                    </span>
                                </div>
                                {sortedOrphanSummits.map((summit) => (
                                    <OrphanSummitCard
                                        key={summit.id}
                                        summit={summit}
                                        showPeakHeader={true}
                                        isOwner={isOwner}
                                        onDeleted={handleSummitDeleted}
                                    />
                                ))}
                            </section>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default ProfileJournal;

