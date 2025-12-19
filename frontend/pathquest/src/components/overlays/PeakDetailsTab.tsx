"use client";

import React from "react";
import Link from "next/link";
import { Cloud, Trophy, ChevronRight } from "lucide-react";
import Peak from "@/typeDefs/Peak";
import Challenge from "@/typeDefs/Challenge";
import ChallengeProgress from "@/typeDefs/ChallengeProgress";
import CurrentConditions from "@/components/app/peaks/CurrentConditions";
import { useIsAuthenticated } from "@/hooks/useRequireAuth";

interface PeakDetailsTabProps {
    peak: Peak;
    challenges: Challenge[] | null | undefined;
}

/**
 * Peak Details tab content showing:
 * - Current weather conditions
 * - Challenges this peak is part of (with progress if authenticated)
 */
const PeakDetailsTab = ({ peak, challenges }: PeakDetailsTabProps) => {
    const { isAuthenticated } = useIsAuthenticated();

    return (
        <div className="space-y-6">
            {/* Current Conditions Section */}
            {peak.location_coords && (
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <Cloud className="w-4 h-4" />
                        Current Conditions
                    </h3>
                    <CurrentConditions
                        lat={peak.location_coords[1]}
                        lng={peak.location_coords[0]}
                    />
                </div>
            )}

            {/* Challenges Section */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    Part of {challenges?.length || 0} Challenge{challenges?.length !== 1 ? "s" : ""}
                </h3>
                {challenges && challenges.length > 0 ? (
                    <div className="space-y-2">
                        {challenges.map((challenge) => (
                            <ChallengeListItem 
                                key={challenge.id} 
                                challenge={challenge}
                                showProgress={isAuthenticated}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-6 px-4 rounded-lg bg-muted/20 border border-border/50">
                        <Trophy className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground">
                            This peak is not part of any challenges yet
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

interface ChallengeListItemProps {
    challenge: Challenge | ChallengeProgress;
    showProgress?: boolean;
}

const ChallengeListItem = ({ challenge, showProgress }: ChallengeListItemProps) => {
    const challengeProgress = challenge as ChallengeProgress;
    const hasProgressFields = 'completed' in challenge && 'total' in challenge;
    const progressPercent = hasProgressFields && challengeProgress.total > 0 
        ? Math.round((challengeProgress.completed / challengeProgress.total) * 100) 
        : 0;
    const hasProgress = showProgress && hasProgressFields && challengeProgress.completed > 0;

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
                            {challenge.num_peaks || ('total' in challenge ? challenge.total : 0)} peaks
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
                            {hasProgressFields ? `${challengeProgress.completed}/${challengeProgress.total}` : '0/0'}
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

export default PeakDetailsTab;

