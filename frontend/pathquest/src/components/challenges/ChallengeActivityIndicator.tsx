"use client";

import React from "react";
import { Users, TrendingUp, Award } from "lucide-react";
import Link from "next/link";
import { ChallengeActivity } from "@/actions/challenges/getChallengeActivity";

interface ChallengeActivityIndicatorProps {
    activity: ChallengeActivity;
    compact?: boolean;
}

const ChallengeActivityIndicator = ({ activity, compact = false }: ChallengeActivityIndicatorProps) => {
    const hasActivity = activity.weeklyActiveUsers > 0 || activity.recentCompletions.length > 0;

    if (!hasActivity) {
        return null;
    }

    // Format relative time for completions
    const formatRelativeTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return "today";
        if (diffDays === 1) return "yesterday";
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 14) return "last week";
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return "this month";
    };

    if (compact) {
        return (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="w-3 h-3" />
                <span>
                    {activity.weeklyActiveUsers > 0 && (
                        <>
                            {activity.weeklyActiveUsers} active this week
                        </>
                    )}
                </span>
            </div>
        );
    }

    return (
        <div className="p-3 rounded-xl bg-card border border-border/70 space-y-3">
            <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Community Activity
                </span>
            </div>

            {/* Weekly Stats */}
            {activity.weeklyActiveUsers > 0 && (
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                        <span className="text-sm text-foreground">
                            <span className="font-semibold">{activity.weeklyActiveUsers}</span> climber{activity.weeklyActiveUsers !== 1 ? "s" : ""} active this week
                        </span>
                    </div>
                    {activity.weeklySummits > 0 && (
                        <span className="text-xs text-muted-foreground">
                            ({activity.weeklySummits} summit{activity.weeklySummits !== 1 ? "s" : ""})
                        </span>
                    )}
                </div>
            )}

            {/* Recent Completions */}
            {activity.recentCompletions.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Award className="w-3.5 h-3.5 text-secondary" />
                        <span>Recent completions</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {activity.recentCompletions.slice(0, 3).map((completion) => (
                            <Link
                                key={completion.userId}
                                href={`/users/${completion.userId}`}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-secondary/10 border border-secondary/20 hover:border-secondary/40 transition-colors text-xs"
                            >
                                <span className="font-medium text-foreground">
                                    {completion.userName || "Climber"}
                                </span>
                                <span className="text-muted-foreground">
                                    {formatRelativeTime(completion.completedAt)}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChallengeActivityIndicator;

