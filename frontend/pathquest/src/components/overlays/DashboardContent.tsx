"use client";

import React from "react";
import {
    Mountain,
    Trophy,
    Loader2,
    MapPin,
    ChevronRight,
    PenLine,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useIsAuthenticated } from "@/hooks/useRequireAuth";
import metersToFt from "@/helpers/metersToFt";
import dayjs from "@/helpers/dayjs";
import ManualPeakSummit from "@/typeDefs/ManualPeakSummit";
import Peak from "@/typeDefs/Peak";
import ChallengeProgress from "@/typeDefs/ChallengeProgress";

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

type DashboardContentProps = {
    isActive?: boolean;
    showHeader?: boolean;
};

const DashboardContent = ({ isActive = true, showHeader = false }: DashboardContentProps) => {
    const { isAuthenticated, isLoading: authLoading, user } = useIsAuthenticated();

    // Only fetch when authenticated and content is active
    const shouldFetch = isAuthenticated && isActive;

    const { data: recentSummits, isLoading: summitsLoading } = useQuery({
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
            </div>
        );
    }

    return (
        <div className="space-y-6">
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
    const handleAddTripReport = (e: React.MouseEvent, summitId: string) => {
        e.preventDefault();
        e.stopPropagation();
        // TODO: Open trip report modal
        console.log("Add trip report for summit:", summitId);
    };

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
                    {summits.slice(0, 5).map((summit) => {
                        const hasNotes = summit.notes && summit.notes.trim().length > 0;
                        
                        return (
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
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {!hasNotes && (
                                        <button
                                            onClick={(e) => handleAddTripReport(e, summit.id)}
                                            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary/90 rounded-md transition-colors cursor-pointer shadow-sm"
                                            aria-label="Add trip report"
                                            tabIndex={0}
                                        >
                                            <PenLine className="w-3.5 h-3.5" />
                                            Add Report
                                        </button>
                                    )}
                                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                </div>
                            </Link>
                        );
                    })}
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

export default DashboardContent;

