"use client";

import React from "react";
import { Trophy, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import ChallengeProgress from "@/typeDefs/ChallengeProgress";
import { useIsAuthenticated } from "@/hooks/useRequireAuth";

interface DiscoveryChallengesListProps {
    challenges: ChallengeProgress[];
    onChallengeClick: (id: string) => void;
    compact?: boolean;
    title?: string;
}

const DiscoveryChallengesList = ({
    challenges,
    onChallengeClick,
    compact = false,
    title,
}: DiscoveryChallengesListProps) => {
    const { isAuthenticated } = useIsAuthenticated();
    
    if (challenges.length === 0) return null;

    const displayTitle = title ?? "Visible Challenges";

    return (
        <section>
            <div className={cn("flex items-center gap-2", compact ? "mb-3" : "mb-4")}>
                <Trophy className="w-4 h-4 text-secondary" />
                <h2 className={cn(
                    "font-semibold uppercase tracking-wider text-muted-foreground",
                    compact ? "text-xs" : "text-sm"
                )}>
                    {displayTitle}
                </h2>
            </div>
            <div className={cn("space-y-2", compact ? "space-y-2" : "space-y-2.5")}>
                {challenges.map((challenge) => (
                    <div
                        key={challenge.id}
                        onClick={() => onChallengeClick(challenge.id)}
                        onKeyDown={(e) => e.key === "Enter" && onChallengeClick(challenge.id)}
                        tabIndex={0}
                        role="button"
                        aria-label={`View challenge: ${challenge.name}`}
                        className={cn(
                            "group relative overflow-hidden rounded-xl bg-card border border-border/70 hover:border-primary/50 transition-colors cursor-pointer",
                            compact ? "p-3" : "p-4"
                        )}
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex-1 min-w-0">
                                <h3 className={cn(
                                    "font-medium group-hover:text-primary transition-colors",
                                    compact ? "text-sm" : ""
                                )}>
                                    {challenge.name}
                                </h3>
                                <div className="mt-1.5">
                                    {isAuthenticated && challenge.total > 0 ? (
                                        <>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="text-xs text-muted-foreground">
                                                    {challenge.completed}/{challenge.total} peaks
                                                </span>
                                            </div>
                                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-secondary to-primary rounded-full transition-all"
                                                    style={{ 
                                                        width: `${Math.round((challenge.completed / challenge.total) * 100)}%` 
                                                    }}
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <span className="text-xs text-muted-foreground">
                                            0/{challenge.total || challenge.num_peaks || 0} peaks
                                        </span>
                                    )}
                                </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all ml-2 shrink-0" />
                        </div>
                        <div className="absolute bottom-0 left-0 h-0.5 w-full opacity-50 bg-primary" />
                    </div>
                ))}
            </div>
        </section>
    );
};

export default DiscoveryChallengesList;


