"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Mountain,
    TrendingUp,
    Globe,
    Trophy,
    Calendar,
    ChevronRight,
    Sparkles,
    Flame,
} from "lucide-react";
import Link from "next/link";
import getUserProfile from "@/actions/users/getUserProfile";
import metersToFt from "@/helpers/metersToFt";
import { cn } from "@/lib/utils";

interface ProfileStatsContentProps {
    userId: string;
}

const ProfileStatsContent = ({ userId }: ProfileStatsContentProps) => {
    const { data, isLoading } = useQuery({
        queryKey: ["userProfile", userId],
        queryFn: async () => {
            const res = await getUserProfile(userId);
            return res;
        },
    });

    const profile = data?.success ? data.data : null;
    const stats = profile?.stats;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-10">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="text-center py-10 px-4">
                <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-foreground font-medium">No stats yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                    Start climbing to build your profile!
                </p>
            </div>
        );
    }

    // Calculate peak type breakdown label
    const getPeakTypeBreakdown = () => {
        if (!stats.peakTypeBreakdown) return null;
        const types = [
            { count: stats.peakTypeBreakdown.fourteeners, label: "14ers" },
            { count: stats.peakTypeBreakdown.thirteeners, label: "13ers" },
            { count: stats.peakTypeBreakdown.twelvers, label: "12ers" },
            { count: stats.peakTypeBreakdown.elevenThousanders, label: "11ers" },
            { count: stats.peakTypeBreakdown.tenThousanders, label: "10ers" },
        ].filter((t) => t.count > 0);

        if (types.length === 0) return null;
        return types.sort((a, b) => b.count - a.count).slice(0, 3);
    };

    const peakTypes = getPeakTypeBreakdown();

    // Geographic diversity
    const hasGeographicDiversity =
        (stats.statesClimbed && stats.statesClimbed.length > 1) ||
        (stats.countriesClimbed && stats.countriesClimbed.length > 1);

    return (
        <div className="p-4 space-y-4">
            {/* Hero Section - Highest Peak */}
            {stats.highestPeak && (
                <Link
                    href={`/peaks/${stats.highestPeak.id}`}
                    className="block p-4 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/30 hover:border-primary/50 transition-all group"
                >
                    <div className="flex items-center gap-2 mb-2 text-primary">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-xs font-semibold uppercase tracking-wider">
                            Highest Peak
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <h2
                                className="text-xl font-bold text-foreground group-hover:text-primary transition-colors"
                                style={{ fontFamily: "var(--font-display)" }}
                            >
                                {stats.highestPeak.name}
                            </h2>
                            <p className="text-2xl font-mono font-bold text-primary mt-1">
                                {Math.round(metersToFt(stats.highestPeak.elevation)).toLocaleString()} ft
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Mountain className="w-6 h-6 text-primary" />
                        </div>
                    </div>
                </Link>
            )}

            {/* Climbing Streak */}
            {stats.climbingStreak && stats.climbingStreak.currentStreak > 0 && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Flame className="w-5 h-5 text-orange-500" />
                                <span className="text-xs font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                                    Climbing Streak
                                </span>
                            </div>
                            <p
                                className="text-lg font-bold text-foreground"
                                style={{ fontFamily: "var(--font-display)" }}
                            >
                                {stats.climbingStreak.currentStreak} month{stats.climbingStreak.currentStreak !== 1 ? "s" : ""} in a row!
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {stats.climbingStreak.isActive
                                    ? "Keep it going! You've summited this month."
                                    : "Summit this month to extend your streak!"}
                            </p>
                        </div>
                        <div className="flex items-center justify-center">
                            <span className="text-4xl font-mono font-bold text-orange-500">
                                {stats.climbingStreak.currentStreak}
                            </span>
                            <Flame className="w-8 h-8 text-orange-500 animate-pulse ml-1" />
                        </div>
                    </div>
                </div>
            )}

            {/* Geographic Diversity */}
            {hasGeographicDiversity && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                    <div className="flex items-center gap-2 mb-2">
                        <Globe className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                            Geographic Reach
                        </span>
                    </div>
                    <p
                        className="text-lg font-bold text-foreground"
                        style={{ fontFamily: "var(--font-display)" }}
                    >
                        {stats.totalPeaks} peaks across{" "}
                        {stats.statesClimbed.length > 1 && (
                            <span className="text-emerald-600 dark:text-emerald-400">
                                {stats.statesClimbed.length} states
                            </span>
                        )}
                        {stats.statesClimbed.length > 1 && stats.countriesClimbed.length > 1 && (
                            <span className="text-muted-foreground">, </span>
                        )}
                        {stats.countriesClimbed.length > 1 && (
                            <span className="text-emerald-600 dark:text-emerald-400">
                                {stats.countriesClimbed.length} countries
                            </span>
                        )}
                    </p>
                </div>
            )}

            {/* Peak Type Breakdown */}
            {peakTypes && peakTypes.length > 0 && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                    <div className="flex items-center gap-2 mb-3">
                        <Mountain className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                            Peak Categories
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {peakTypes.map((type) => (
                            <div
                                key={type.label}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20"
                            >
                                <span className="text-xl font-mono font-bold text-amber-600 dark:text-amber-400">
                                    {type.count}
                                </span>
                                <span className="text-sm font-medium text-foreground">
                                    {type.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
                {/* Total Elevation */}
                <div className="p-3 rounded-xl bg-card border border-border/70">
                    <div className="flex items-center gap-1.5 text-summited mb-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span className="text-[10px] uppercase tracking-wider font-semibold">
                            Total Elevation
                        </span>
                    </div>
                    <p className="text-xl font-mono font-bold text-foreground">
                        {stats.totalElevationGained
                            ? Math.round(metersToFt(stats.totalElevationGained)).toLocaleString()
                            : 0}
                    </p>
                    <p className="text-[10px] text-muted-foreground">feet gained</p>
                </div>

                {/* Challenges Completed */}
                <div className="p-3 rounded-xl bg-card border border-border/70">
                    <div className="flex items-center gap-1.5 text-secondary mb-1">
                        <Trophy className="w-3.5 h-3.5" />
                        <span className="text-[10px] uppercase tracking-wider font-semibold">
                            Challenges
                        </span>
                    </div>
                    <p className="text-xl font-mono font-bold text-foreground">
                        {stats.challengesCompleted}
                    </p>
                    <p className="text-[10px] text-muted-foreground">completed</p>
                </div>

                {/* Total Peaks */}
                <div className="p-3 rounded-xl bg-card border border-border/70">
                    <div className="flex items-center gap-1.5 text-primary mb-1">
                        <Mountain className="w-3.5 h-3.5" />
                        <span className="text-[10px] uppercase tracking-wider font-semibold">
                            Unique Peaks
                        </span>
                    </div>
                    <p className="text-xl font-mono font-bold text-foreground">
                        {stats.totalPeaks}
                    </p>
                    <p className="text-[10px] text-muted-foreground">summited</p>
                </div>

                {/* Total Summits */}
                <div className="p-3 rounded-xl bg-card border border-border/70">
                    <div className="flex items-center gap-1.5 text-blue-500 mb-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="text-[10px] uppercase tracking-wider font-semibold">
                            Total Summits
                        </span>
                    </div>
                    <p className="text-xl font-mono font-bold text-foreground">
                        {stats.totalSummits}
                    </p>
                    <p className="text-[10px] text-muted-foreground">all-time</p>
                </div>
            </div>

            {/* Year over Year */}
            {(stats.thisYearSummits > 0 || stats.lastYearSummits > 0) && (
                <div className="p-4 rounded-xl bg-card border border-border/70">
                    <div className="flex items-center gap-2 text-blue-500 mb-3">
                        <Calendar className="w-4 h-4" />
                        <span className="text-xs font-semibold uppercase tracking-wider">
                            This Year vs Last Year
                        </span>
                    </div>
                    <div className="flex items-baseline gap-4">
                        <div>
                            <span className="text-3xl font-mono font-bold text-foreground">
                                {stats.thisYearSummits}
                            </span>
                            <span className="text-sm text-muted-foreground ml-1">summits</span>
                        </div>
                        <span className="text-muted-foreground">vs</span>
                        <div>
                            <span className="text-xl text-muted-foreground font-mono">
                                {stats.lastYearSummits}
                            </span>
                            <span className="text-sm text-muted-foreground ml-1">last year</span>
                        </div>
                        {stats.thisYearSummits > stats.lastYearSummits && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                                +{stats.thisYearSummits - stats.lastYearSummits}
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileStatsContent;

