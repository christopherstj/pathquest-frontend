"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Flame, TrendingUp, Loader2 } from "lucide-react";
import PeakActivity from "@/typeDefs/PeakActivity";

interface PeakActivityIndicatorProps {
    peakId: string;
    compact?: boolean;
}

const fetchPeakActivity = async (peakId: string): Promise<PeakActivity> => {
    const res = await fetch(`/api/peaks/${peakId}/activity`);
    if (!res.ok) {
        throw new Error("Failed to fetch peak activity");
    }
    return res.json();
};

const PeakActivityIndicator: React.FC<PeakActivityIndicatorProps> = ({
    peakId,
    compact = false,
}) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ["peakActivity", peakId],
        queryFn: () => fetchPeakActivity(peakId),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    if (isLoading) {
        return (
            <span className="inline-flex items-center gap-1 text-muted-foreground text-xs">
                <Loader2 className="w-3 h-3 animate-spin" />
            </span>
        );
    }

    if (error || !data) {
        return null;
    }

    const { summitsThisWeek, summitsThisMonth } = data;

    // Display logic: show week if > 0, otherwise month, otherwise encouraging message
    if (summitsThisWeek > 0) {
        return compact ? (
            <span className="inline-flex items-center gap-1 text-orange-500 text-xs font-medium">
                <Flame className="w-3.5 h-3.5" />
                <span>{summitsThisWeek} this week</span>
            </span>
        ) : (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20">
                <Flame className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-xs font-medium text-orange-500">
                    {summitsThisWeek} summit{summitsThisWeek !== 1 ? "s" : ""} this week
                </span>
            </div>
        );
    }

    if (summitsThisMonth > 0) {
        return compact ? (
            <span className="inline-flex items-center gap-1 text-amber-500 text-xs font-medium">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{summitsThisMonth} this month</span>
            </span>
        ) : (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-xs font-medium text-amber-500">
                    {summitsThisMonth} summit{summitsThisMonth !== 1 ? "s" : ""} this month
                </span>
            </div>
        );
    }

    // No recent summits - show encouraging message
    return compact ? (
        <span className="text-muted-foreground text-xs">
            Be the first this week!
        </span>
    ) : (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/30 border border-border/50">
            <span className="text-xs text-muted-foreground">
                Be the first this week!
            </span>
        </div>
    );
};

export default PeakActivityIndicator;

