"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle, Mountain, Trophy, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import PeakRow from "@/components/lists/peak-row";
import Challenge from "@/typeDefs/Challenge";
import { ChallengePeakWithSummit, ChallengeProgressInfo } from "@/actions/users/getUserChallengeProgress";
import { ExploreSubTab } from "@/store/tabStore";

interface ExploreUserChallengeContentProps {
    isAuthenticated: boolean;
    exploreSubTab: ExploreSubTab;
    userId: string | null;
    challengeId: string | null;
    challenge: Challenge | null;
    progress: ChallengeProgressInfo | null;
    peaks: ChallengePeakWithSummit[];
    user: { id: string; name: string; pic?: string } | null;
    onBack: () => void;
    onPeakClick: (id: string, coords?: [number, number]) => void;
    onHoverStart: (peakId: string, coords: [number, number]) => void;
    onHoverEnd: () => void;
}

export const ExploreUserChallengeContent = ({
    isAuthenticated,
    exploreSubTab,
    challengeId,
    challenge,
    progress,
    peaks,
    user,
    onBack,
    onPeakClick,
    onHoverStart,
    onHoverEnd,
}: ExploreUserChallengeContentProps) => {
    // Show error state if challenge or user not found
    if (!challenge || !user) {
        return (
            <div className="text-center py-10 px-4">
                <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-foreground font-medium">Challenge Progress Not Found</p>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                    This user or challenge doesn&apos;t exist.
                </p>
                <Button variant="outline" onClick={onBack}>
                    Go Back
                </Button>
            </div>
        );
    }

    if (exploreSubTab === "peaks" && peaks) {
        // Sort peaks: summited first, then by elevation
        const sortedPeaks = [...peaks].sort((a, b) => {
            // Summited peaks first
            if (a.is_summited && !b.is_summited) return -1;
            if (!a.is_summited && b.is_summited) return 1;
            // Then by elevation
            return (b.elevation || 0) - (a.elevation || 0);
        });

        return (
            <div className="p-4 space-y-4">
                {/* User header */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-secondary/10 to-primary/10 border border-secondary/20">
                    <div className="w-10 h-10 rounded-full bg-secondary/20 border border-secondary/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {user?.pic ? (
                            <img
                                src={user.pic}
                                alt={user.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <UserIcon className="w-5 h-5 text-secondary" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                            {user?.name}&apos;s Progress
                        </p>
                        <p className="text-xs text-muted-foreground">
                            on {challenge?.name}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Mountain className="w-4 h-4 text-secondary" />
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        {peaks.length} Peaks
                    </h2>
                </div>
                <div className="space-y-1">
                    {sortedPeaks.map((p) => (
                        <PeakRow
                            key={p.id}
                            peak={{
                                ...p,
                                summits: p.is_summited ? 1 : 0,
                            }}
                            onPeakClick={onPeakClick}
                            onHoverStart={onHoverStart}
                            onHoverEnd={onHoverEnd}
                        />
                    ))}
                </div>
            </div>
        );
    }

    // Default to progress view
    const progressPercent = progress && progress.total > 0
        ? Math.round((progress.completed / progress.total) * 100)
        : 0;

    return (
        <div className="p-4 space-y-5">
            {/* User header */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-secondary/10 to-primary/10 border border-secondary/20">
                <div className="w-10 h-10 rounded-full bg-secondary/20 border border-secondary/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {user.pic ? (
                        <img
                            src={user.pic}
                            alt={user.name}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <UserIcon className="w-5 h-5 text-secondary" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                        {user.name}&apos;s Progress
                    </p>
                    <p className="text-xs text-muted-foreground">
                        on {challenge.name}
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-card border border-border/70">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
                        Total Peaks
                    </p>
                    <p className="text-lg font-mono text-foreground">
                        {progress?.total ?? peaks.length}
                    </p>
                </div>
                <div className="p-3 rounded-xl bg-card border border-border/70">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
                        Summited
                    </p>
                    <p className="text-lg font-mono text-foreground">
                        {progress?.completed ?? 0}
                        <span className="text-xs text-muted-foreground ml-1">
                            ({progressPercent}%)
                        </span>
                    </p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progress</span>
                    <span>
                        {progress?.completed ?? 0} / {progress?.total ?? peaks.length}
                    </span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                        className="h-full bg-secondary rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
                {progressPercent === 100 && (
                    <div className="flex items-center gap-2 text-sm text-summited">
                        <CheckCircle className="w-4 h-4" />
                        <span>Challenge complete!</span>
                    </div>
                )}
            </div>

            {/* Last progress */}
            {progress?.lastProgressDate && (
                <div className="text-xs text-muted-foreground">
                    Last progress: {new Date(progress.lastProgressDate).toLocaleDateString()}
                </div>
            )}

            {/* My Progress button - show for logged in users */}
            {isAuthenticated && challengeId && (
                <Link
                    href={`/challenges/${challengeId}`}
                    className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-secondary/10 hover:bg-secondary/20 border border-secondary/30 text-secondary font-medium text-sm transition-colors"
                >
                    <UserIcon className="w-4 h-4" />
                    My Progress
                </Link>
            )}
        </div>
    );
};


