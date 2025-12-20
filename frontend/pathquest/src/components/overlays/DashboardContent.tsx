"use client";

import React from "react";
import {
    Mountain,
    Trophy,
    Loader2,
    Calendar,
    LogIn,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useIsAuthenticated } from "@/hooks/useRequireAuth";
import { useAuthModalStore } from "@/providers/AuthModalProvider";
import dayjs from "@/helpers/dayjs";
import ManualPeakSummit from "@/typeDefs/ManualPeakSummit";
import Peak from "@/typeDefs/Peak";
import ChallengeProgress from "@/typeDefs/ChallengeProgress";
import DashboardStats from "@/typeDefs/DashboardStats";
import UnconfirmedSummit from "@/typeDefs/UnconfirmedSummit";
import { QuickStatsBar, HeroSummitCard, UnreviewedSummitsQueue, ProcessingToast, UnconfirmedSummitsCard, ImportProgressCard, ImportStatus } from "@/components/dashboard";

// Fetch recent summits from API route instead of server action
const fetchRecentSummits = async (): Promise<(Peak & ManualPeakSummit)[] | null> => {
    const res = await fetch("/api/dashboard/recent-summits", {
        credentials: "include",
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
        credentials: "include",
    });
    if (!res.ok) {
        console.error("Failed to fetch favorite challenges:", res.status);
        return [];
    }
    return res.json();
};

// Fetch queue status (activities waiting to be processed)
const fetchQueueStatus = async (): Promise<{ numProcessing: number }> => {
    const res = await fetch("/api/dashboard/queue-status", {
        credentials: "include",
    });
    if (!res.ok) {
        console.error("Failed to fetch queue status:", res.status);
        return { numProcessing: 0 };
    }
    return res.json();
};

// Fetch import status (detailed progress for historical import)
const fetchImportStatus = async (): Promise<ImportStatus | null> => {
    const res = await fetch("/api/dashboard/import-status", {
        credentials: "include",
    });
    if (!res.ok) {
        console.error("Failed to fetch import status:", res.status);
        return null;
    }
    return res.json();
};

// Fetch dashboard stats
const fetchDashboardStats = async (): Promise<DashboardStats | null> => {
    const res = await fetch("/api/dashboard/stats", {
        credentials: "include",
    });
    if (!res.ok) {
        console.error("Failed to fetch dashboard stats:", res.status);
        return null;
    }
    return res.json();
};

// Fetch unconfirmed summits (limit to 3 for dashboard card)
const fetchUnconfirmedSummits = async (): Promise<UnconfirmedSummit[]> => {
    const res = await fetch("/api/summits/unconfirmed?limit=10", {
        credentials: "include",
    });
    if (!res.ok) {
        console.error("Failed to fetch unconfirmed summits:", res.status);
        return [];
    }
    return res.json();
};

type DashboardContentProps = {
    isActive?: boolean;
    showHeader?: boolean;
};

const DashboardContent = ({ isActive = true, showHeader = false }: DashboardContentProps) => {
    const { isAuthenticated, isLoading: authLoading, user } = useIsAuthenticated();
    const openLoginModal = useAuthModalStore((state) => state.openLoginModal);

    // Only fetch when authenticated and content is active
    const shouldFetch = isAuthenticated && isActive;

    const { data: recentSummits } = useQuery({
        queryKey: ["recentSummits"],
        queryFn: fetchRecentSummits,
        enabled: shouldFetch,
        staleTime: 30000,
    });

    const { data: favoriteChallenges, isLoading: challengesLoading } = useQuery({
        queryKey: ["favoriteChallenges"],
        queryFn: fetchFavoriteChallenges,
        enabled: shouldFetch,
        staleTime: 30000,
    });

    const { data: dashboardStats, isLoading: statsLoading } = useQuery({
        queryKey: ["dashboardStats"],
        queryFn: fetchDashboardStats,
        enabled: shouldFetch,
        staleTime: 30000,
    });

    // Queue status with polling - refetch every 10 seconds when there are items processing
    const { data: queueStatus } = useQuery({
        queryKey: ["queueStatus"],
        queryFn: fetchQueueStatus,
        enabled: shouldFetch,
        staleTime: 5000,
        refetchInterval: (query) => {
            // Poll every 10 seconds if there are activities processing
            const numProcessing = query.state.data?.numProcessing ?? 0;
            return numProcessing > 0 ? 10000 : 30000;
        },
    });

    // Import status with polling - detailed progress for historical imports
    const { data: importStatus } = useQuery({
        queryKey: ["importStatus"],
        queryFn: fetchImportStatus,
        enabled: shouldFetch,
        staleTime: 10000,
        refetchInterval: (query) => {
            // Poll every 15 seconds if there are activities being imported
            const status = query.state.data?.status;
            return status === "processing" ? 15000 : 60000;
        },
    });

    // Fetch unconfirmed summits that need review
    const { data: unconfirmedSummits } = useQuery({
        queryKey: ["unconfirmedSummits"],
        queryFn: fetchUnconfirmedSummits,
        enabled: shouldFetch,
        staleTime: 30000,
    });

    // Find the most recent unreviewed summit (for hero card)
    const heroSummit = React.useMemo(() => {
        if (!recentSummits || recentSummits.length === 0) return null;
        // Find the first summit without a report
        const unreviewed = recentSummits.find(summit => {
            const hasReport = summit.hasReport || 
                (summit.notes && summit.notes.trim() !== "") || 
                summit.difficulty || 
                summit.experience_rating;
            return !hasReport;
        });
        return unreviewed || null;
    }, [recentSummits]);

    // Show loading state while auth is loading
    if (authLoading) {
        return (
            <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
        );
    }

    // Show login prompt if not authenticated
    if (!isAuthenticated) {
        return (
            <div className="text-center py-10">
                <Mountain className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-foreground font-medium">Sign in to view your dashboard</p>
                <p className="text-sm text-muted-foreground mt-1">
                    Track your summits and challenge progress
                </p>
                <button
                    onClick={() => openLoginModal()}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
                >
                    <LogIn className="w-4 h-4" />
                    Sign In
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {/* Optional Header */}
            {showHeader && (
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Mountain className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h1
                            className="text-xl font-bold text-foreground"
                            style={{ fontFamily: "var(--font-display)" }}
                        >
                            Your Dashboard
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {user?.name || "Explorer"}
                        </p>
                    </div>
                </div>
            )}

            {/* Processing Toast (fixed position, doesn't take up layout space) */}
            <ProcessingToast count={queueStatus?.numProcessing ?? 0} />

            {/* Import Progress Card (shows when importing historical data) */}
            {importStatus && importStatus.status === "processing" && (
                <ImportProgressCard status={importStatus} />
            )}

            {/* Quick Stats Bar */}
            <QuickStatsBar stats={dashboardStats ?? null} isLoading={statsLoading} />

            {/* Hero Summit Card (if there's an unreviewed summit) */}
            {heroSummit && <HeroSummitCard summit={heroSummit} />}

            {/* Unreviewed Summits Queue (older summits without reports) */}
            {recentSummits && recentSummits.length > 0 && (
                <UnreviewedSummitsQueue summits={recentSummits} />
            )}

            {/* Challenge Progress */}
            <ChallengeProgressSection
                challenges={favoriteChallenges}
                isLoading={challengesLoading}
            />

            {/* Unconfirmed Summits Card (summits needing user review) - lower priority */}
            {unconfirmedSummits && unconfirmedSummits.length > 0 && (
                <UnconfirmedSummitsCard 
                    summits={unconfirmedSummits.slice(0, 3)} 
                    totalCount={unconfirmedSummits.length}
                />
            )}
        </div>
    );
};

type ChallengeProgressSectionProps = {
    challenges: ChallengeProgress[] | undefined;
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
                                <div className="flex items-center justify-between mt-1.5">
                                    <p className="text-xs text-muted-foreground">
                                        {progressPercent}% complete
                                        {challenge.region && ` • ${challenge.region}`}
                                    </p>
                                    {/* Last progress indicator */}
                                    {challenge.lastProgressDate && challenge.lastProgressCount && challenge.lastProgressCount > 0 && (
                                        <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                                            <Calendar className="w-3 h-3" />
                                            <span>
                                                +{challenge.lastProgressCount} on {dayjs(challenge.lastProgressDate).format("MMM D")}
                                            </span>
                                        </div>
                                    )}
                                </div>
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

export default DashboardContent;
