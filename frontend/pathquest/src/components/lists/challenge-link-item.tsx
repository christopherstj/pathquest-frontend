"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Trophy } from "lucide-react";

type ChallengeLike = {
    id: string | number;
    name: string;
    region?: string;
    num_peaks?: number;
    total?: number;
    completed?: number;
};

export type ChallengeLinkItemProps = {
    challenge: ChallengeLike;
    showProgress?: boolean;
};

const ChallengeLinkItem = ({ challenge, showProgress }: ChallengeLinkItemProps) => {
    const hasProgressFields = typeof challenge.total === "number" && typeof challenge.completed === "number";
    const progressPercent =
        hasProgressFields && (challenge.total ?? 0) > 0
            ? Math.round(((challenge.completed ?? 0) / (challenge.total ?? 0)) * 100)
            : 0;
    const hasProgress = Boolean(showProgress && hasProgressFields && (challenge.completed ?? 0) > 0);

    return (
        <Link
            href={`/challenges/${challenge.id}`}
            className="block p-3 rounded-lg bg-card border border-border/70 hover:bg-card/80 hover:border-primary/30 transition-colors group"
        >
            <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-secondary flex-shrink-0" />
                        <p className="text-sm font-medium text-foreground truncate">
                            {challenge.name}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                            {(challenge.num_peaks ?? challenge.total ?? 0)} peaks
                        </span>
                        {challenge.region && (
                            <>
                                <span className="text-muted-foreground/50">•</span>
                                <span className="text-xs text-muted-foreground">
                                    {challenge.region}
                                </span>
                            </>
                        )}
                    </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
            </div>

            {/* Progress bar (only show if authenticated and has progress) */}
            {hasProgress && (
                <div className="mt-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">
                            {progressPercent}% complete
                        </span>
                        <span className="font-mono text-muted-foreground">
                            {challenge.completed}/{challenge.total}
                        </span>
                    </div>
                    <div className="relative h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>
            )}
        </Link>
    );
};

export default ChallengeLinkItem;


