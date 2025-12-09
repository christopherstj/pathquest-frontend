"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Mountain,
    Trophy,
    Loader2,
    MapPin,
    ChevronRight,
    RefreshCw,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useDashboardStore } from "@/providers/DashboardProvider";
import { useIsAuthenticated } from "@/hooks/useRequireAuth";
import getActivitiesProcessing from "@/actions/users/getActivitiesProcessing";
import metersToFt from "@/helpers/metersToFt";
import dayjs from "@/helpers/dayjs";
import ManualPeakSummit from "@/typeDefs/ManualPeakSummit";
import Peak from "@/typeDefs/Peak";
import ChallengeProgress from "@/typeDefs/ChallengeProgress";

// Fetch recent summits from API route instead of server action
const fetchRecentSummits = async (): Promise<(Peak & ManualPeakSummit)[] | null> => {
    const res = await fetch("/api/dashboard/recent-summits", {
        credentials: "include", // Include cookies for auth
    });
    if (!res.ok) {
        console.error("Failed to fetch recent summits:", res.status);
        return null;
    }
    return res.json();
};

// Fetch favorite challenges from API route instead of server action
const fetchFavoriteChallenges = async (): Promise<ChallengeProgress[]> => {
    const res = await fetch("/api/dashboard/favorite-challenges", {
        credentials: "include", // Include cookies for auth
    });
    if (!res.ok) {
        console.error("Failed to fetch favorite challenges:", res.status);
        return [];
    }
    return res.json();
};

const DashboardPanel = () => {
    const isOpen = useDashboardStore((state) => state.isOpen);
    const closeDashboard = useDashboardStore((state) => state.closeDashboard);
    const { isAuthenticated, isLoading: authLoading, user } = useIsAuthenticated();

    // Only fetch when authenticated and panel is open
    const shouldFetch = isAuthenticated && isOpen;

    const { data: recentSummits, isLoading: summitsLoading } = useQuery({
        queryKey: ["recentSummits"],
        queryFn: fetchRecentSummits,
        enabled: shouldFetch,
        staleTime: 30000, // 30 seconds
    });

    const { data: favoriteChallenges, isLoading: challengesLoading } = useQuery(
        {
            queryKey: ["favoriteChallenges"],
            queryFn: fetchFavoriteChallenges,
            enabled: shouldFetch,
            staleTime: 30000,
        }
    );

    const { data: processingResult, isLoading: processingLoading } = useQuery({
        queryKey: ["activitiesProcessing"],
        queryFn: getActivitiesProcessing,
        enabled: shouldFetch,
        refetchInterval: isOpen ? 10000 : false, // Refetch every 10s when open
    });

    const processingCount = processingResult?.success
        ? processingResult.data
        : 0;

    // Don't render if auth is still loading or user is not authenticated
    if (authLoading || !isAuthenticated) {
        return null;
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 100, opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="fixed top-20 right-3 md:right-5 bottom-6 w-[calc(100%-1.5rem)] md:w-[360px] max-w-[360px] pointer-events-auto z-40 flex flex-col"
                >
                    <div className="flex-1 rounded-2xl bg-background/85 backdrop-blur-xl border border-border shadow-xl overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="p-5 border-b border-border/60 bg-gradient-to-b from-primary/5 to-transparent relative">
                            <button
                                onClick={closeDashboard}
                                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                                aria-label="Close dashboard"
                                tabIndex={0}
                            >
                                <X className="w-4 h-4" />
                            </button>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Mountain className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h1
                                        className="text-xl font-bold text-foreground"
                                        style={{
                                            fontFamily: "var(--font-display)",
                                        }}
                                    >
                                        Your Dashboard
                                    </h1>
                                    <p className="text-sm text-muted-foreground">
                                        {user?.name || "Explorer"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
                            {/* Sync Status */}
                            {(processingLoading || processingCount > 0) && (
                                <SyncStatus
                                    count={processingCount}
                                    isLoading={processingLoading}
                                />
                            )}

                            {/* Recent Summits */}
                            <RecentSummitsSection
                                summits={recentSummits}
                                isLoading={summitsLoading}
                            />

                            {/* Challenge Progress */}
                            <ChallengeProgressSection
                                challenges={favoriteChallenges}
                                isLoading={challengesLoading}
                            />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

type SyncStatusProps = {
    count: number;
    isLoading: boolean;
};

const SyncStatus = ({ count, isLoading }: SyncStatusProps) => {
    if (isLoading) {
        return (
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                <div>
                    <p className="text-sm font-medium text-foreground">
                        Checking sync status...
                    </p>
                </div>
            </div>
        );
    }

    if (count === 0) {
        return null;
    }

    return (
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-primary animate-spin" />
            <div>
                <p className="text-sm font-medium text-foreground">
                    Syncing activities
                </p>
                <p className="text-xs text-muted-foreground">
                    {count} {count === 1 ? "activity" : "activities"} processing
                </p>
            </div>
        </div>
    );
};

type RecentSummitsSectionProps = {
    summits: (Peak & ManualPeakSummit)[] | null | undefined;
    isLoading: boolean;
};

const RecentSummitsSection = ({
    summits,
    isLoading,
}: RecentSummitsSectionProps) => {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <Mountain className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Recent Summits
                </h3>
            </div>

            {isLoading ? (
                <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="h-16 rounded-lg bg-card/50 animate-pulse"
                        />
                    ))}
                </div>
            ) : summits && summits.length > 0 ? (
                <div className="space-y-2">
                    {summits.slice(0, 5).map((summit) => (
                        <Link
                            key={summit.id}
                            href={`/peaks/${summit.peak_id || summit.id}`}
                            className="flex items-center justify-between p-3 rounded-lg bg-card border border-border/70 hover:bg-card/80 transition-colors group"
                        >
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                    {summit.name}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    {summit.elevation && (
                                        <span>
                                            {Math.round(
                                                metersToFt(summit.elevation)
                                            ).toLocaleString()}{" "}
                                            ft
                                        </span>
                                    )}
                                    {summit.timestamp && (
                                        <>
                                            <span>•</span>
                                            <span>
                                                {dayjs(
                                                    summit.timestamp
                                                ).fromNow()}
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="p-6 rounded-lg bg-card/50 border border-border/50 text-center">
                    <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                        No summits yet
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Your summit history will appear here
                    </p>
                </div>
            )}
        </div>
    );
};

type ChallengeProgressSectionProps = {
    challenges: Awaited<ReturnType<typeof getFavoriteChallenges>> | undefined;
    isLoading: boolean;
};

const ChallengeProgressSection = ({
    challenges,
    isLoading,
}: ChallengeProgressSectionProps) => {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-secondary" />
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Your Challenges
                </h3>
            </div>

            {isLoading ? (
                <div className="space-y-2">
                    {[1, 2].map((i) => (
                        <div
                            key={i}
                            className="h-20 rounded-lg bg-card/50 animate-pulse"
                        />
                    ))}
                </div>
            ) : challenges && challenges.length > 0 ? (
                <div className="space-y-2">
                    {challenges.slice(0, 4).map((challenge) => {
                        const progressPercent =
                            challenge.total > 0
                                ? Math.round(
                                      (challenge.completed / challenge.total) *
                                          100
                                  )
                                : 0;

                        return (
                            <Link
                                key={challenge.id}
                                href={`/challenges/${challenge.id}`}
                                className="block p-3 rounded-lg bg-card border border-border/70 hover:bg-card/80 transition-colors group"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-medium text-foreground truncate flex-1 mr-2">
                                        {challenge.name}
                                    </p>
                                    <span className="text-xs font-mono text-muted-foreground">
                                        {challenge.completed}/{challenge.total}
                                    </span>
                                </div>
                                <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                                    <div
                                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                                        style={{ width: `${progressPercent}%` }}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {progressPercent}% complete
                                    {challenge.region && ` • ${challenge.region}`}
                                </p>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                <div className="p-6 rounded-lg bg-card/50 border border-border/50 text-center">
                    <Trophy className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                        No challenges yet
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Favorite challenges to track your progress
                    </p>
                </div>
            )}
        </div>
    );
};

export default DashboardPanel;

