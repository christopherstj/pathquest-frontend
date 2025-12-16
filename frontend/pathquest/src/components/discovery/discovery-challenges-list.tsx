"use client";

import React from "react";
import { Trophy, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Challenge from "@/typeDefs/Challenge";

interface DiscoveryChallengesListProps {
    challenges: Challenge[];
    onChallengeClick: (id: string) => void;
    compact?: boolean;
}

const DiscoveryChallengesList = ({
    challenges,
    onChallengeClick,
    compact = false,
}: DiscoveryChallengesListProps) => {
    if (challenges.length === 0) return null;

    return (
        <section>
            <div className={cn("flex items-center gap-2", compact ? "mb-3" : "mb-4")}>
                <Trophy className="w-4 h-4 text-secondary" />
                <h2 className={cn(
                    "font-semibold uppercase tracking-wider text-muted-foreground",
                    compact ? "text-xs" : "text-sm"
                )}>
                    Visible Challenges
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
                            <div>
                                <h3 className={cn(
                                    "font-medium group-hover:text-primary transition-colors",
                                    compact ? "text-sm" : ""
                                )}>
                                    {challenge.name}
                                </h3>
                                <p className={cn(
                                    "text-xs text-muted-foreground",
                                    compact ? "mt-0.5" : "mt-1"
                                )}>
                                    {challenge.num_peaks} Peaks
                                </p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                        </div>
                        <div className="absolute bottom-0 left-0 h-0.5 w-full opacity-50 bg-primary" />
                    </div>
                ))}
            </div>
        </section>
    );
};

export default DiscoveryChallengesList;


