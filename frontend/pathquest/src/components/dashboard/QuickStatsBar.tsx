"use client";

import React from "react";
import { Mountain, TrendingUp, Calendar, Trophy, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import DashboardStats from "@/typeDefs/DashboardStats";

interface StatItemProps {
    icon: React.ReactNode;
    value: string | number;
    label: string;
    trend?: {
        direction: "up" | "down" | "same";
        value: number;
    };
    className?: string;
}

const StatItem = ({ icon, value, label, trend, className }: StatItemProps) => {
    // Only show trend if there's an actual difference
    const showTrend = trend && trend.direction !== "same" && trend.value > 0;
    
    return (
        <div className={cn(
            "flex flex-col items-center justify-center py-3 px-2 min-w-0",
            className
        )}>
            <div className="flex items-center gap-1 text-muted-foreground/70 mb-1">
                {icon}
            </div>
            <div className="flex items-center gap-0.5">
                <span 
                    className="text-lg font-bold text-foreground tabular-nums"
                    style={{ fontFamily: "var(--font-mono)" }}
                >
                    {value}
                </span>
                {showTrend && (
                    <span className={cn(
                        "flex items-center text-[10px] font-semibold",
                        trend.direction === "up" && "text-green-500",
                        trend.direction === "down" && "text-red-400"
                    )}>
                        {trend.direction === "up" && <ArrowUp className="w-3 h-3" />}
                        {trend.direction === "down" && <ArrowDown className="w-3 h-3" />}
                        {trend.value}
                    </span>
                )}
            </div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                {label}
            </span>
        </div>
    );
};

interface QuickStatsBarProps {
    stats: DashboardStats | null;
    isLoading?: boolean;
}

const QuickStatsBar = ({ stats, isLoading }: QuickStatsBarProps) => {
    // Calculate trend for this month vs last month
    const monthTrend = React.useMemo(() => {
        if (!stats) return undefined;
        const diff = stats.summitsThisMonth - stats.summitsLastMonth;
        return {
            direction: diff > 0 ? "up" : diff < 0 ? "down" : "same",
            value: Math.abs(diff),
        } as const;
    }, [stats]);

    // Format elevation to feet with K suffix for thousands
    const formatElevation = (meters: number) => {
        const feet = Math.round(meters * 3.28084);
        if (feet >= 1000) {
            return `${(feet / 1000).toFixed(feet >= 100000 ? 0 : 1)}K`;
        }
        return feet.toLocaleString();
    };

    // Calculate challenge progress percentage
    const challengeProgress = React.useMemo(() => {
        if (!stats?.primaryChallengeProgress) return null;
        const { completed, total } = stats.primaryChallengeProgress;
        if (total === 0) return 0;
        return Math.round((completed / total) * 100);
    }, [stats]);

    if (isLoading) {
        return (
            <div className="grid grid-cols-4 divide-x divide-border/50 rounded-xl bg-card/50 border border-border/60 overflow-hidden animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="py-4 px-2">
                        <div className="h-4 w-4 bg-muted rounded mx-auto mb-2" />
                        <div className="h-5 w-10 bg-muted rounded mx-auto mb-1" />
                        <div className="h-2 w-12 bg-muted rounded mx-auto" />
                    </div>
                ))}
            </div>
        );
    }

    if (!stats) {
        return null;
    }

    return (
        <div className="grid grid-cols-4 divide-x divide-border/50 rounded-xl bg-gradient-to-br from-card/80 to-card/40 border border-border/60 overflow-hidden backdrop-blur-sm">
            <StatItem
                icon={<Mountain className="w-3.5 h-3.5" />}
                value={stats.totalPeaks}
                label="Peaks"
            />
            <StatItem
                icon={<TrendingUp className="w-3.5 h-3.5" />}
                value={formatElevation(stats.totalElevationGained)}
                label="Elevation"
            />
            <StatItem
                icon={<Calendar className="w-3.5 h-3.5" />}
                value={stats.summitsThisMonth}
                label="This Mo."
                trend={monthTrend}
            />
            <StatItem
                icon={<Trophy className="w-3.5 h-3.5" />}
                value={challengeProgress !== null ? `${challengeProgress}%` : "—"}
                label={stats.primaryChallengeProgress?.name 
                    ? stats.primaryChallengeProgress.name.split(" ")[0]
                    : "Challenge"
                }
            />
        </div>
    );
};

export default QuickStatsBar;

