"use client";

import React from "react";
import { Trophy, Heart, Map as MapIcon, X, TrendingUp, Calendar, Sparkles, Award, Navigation, Mountain, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Challenge from "@/typeDefs/Challenge";
import Peak from "@/typeDefs/Peak";
import { ChallengeProgressInfo } from "@/actions/challenges/getChallengeDetails";
import { NextPeakSuggestion } from "@/actions/challenges/getNextPeakSuggestion";
import { ChallengeActivity } from "@/actions/challenges/getChallengeActivity";
import ChallengeActivityIndicator from "@/components/challenges/ChallengeActivityIndicator";
import metersToFt from "@/helpers/metersToFt";

interface ChallengeDetailsMobileProps {
    challenge: Challenge;
    peaks?: Peak[] | null;
    progress?: ChallengeProgressInfo | null;
    nextPeakSuggestion?: NextPeakSuggestion | null;
    communityActivity?: ChallengeActivity | null;
    isFavorited: boolean;
    onClose: () => void;
    onToggleFavorite: () => void;
    onShowOnMap: () => void;
}

const ChallengeDetailsMobile = ({
    challenge,
    peaks,
    progress,
    nextPeakSuggestion,
    communityActivity,
    isFavorited,
    onClose,
    onToggleFavorite,
    onShowOnMap,
}: ChallengeDetailsMobileProps) => {
    const summittedPeaks = progress?.completed || peaks?.filter((p) => p.summits && p.summits > 0).length || 0;
    const totalPeaks = progress?.total || peaks?.length || challenge.num_peaks || 0;
    const progressPercent = totalPeaks > 0 ? Math.round((summittedPeaks / totalPeaks) * 100) : 0;
    const remainingPeaks = totalPeaks - summittedPeaks;
    const isCompleted = summittedPeaks >= totalPeaks && totalPeaks > 0;

    // Format last progress date
    const formatLastProgress = () => {
        if (!progress?.lastProgressDate) return null;
        const date = new Date(progress.lastProgressDate);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Yesterday";
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${diffDays >= 14 ? "s" : ""} ago`;
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    // Get milestone celebration
    const getMilestone = () => {
        if (progressPercent >= 100) return { label: "Complete! 🎉", color: "text-secondary" };
        if (progressPercent >= 75) return { label: "Almost there!", color: "text-amber-500" };
        if (progressPercent >= 50) return { label: "Halfway!", color: "text-blue-500" };
        if (progressPercent >= 25) return { label: "Great start!", color: "text-emerald-500" };
        return null;
    };

    const milestone = getMilestone();
    const lastProgressText = formatLastProgress();

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="relative">
                <button
                    onClick={onClose}
                    className="absolute top-0 right-0 p-2 rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Close challenge details"
                    tabIndex={0}
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2 mb-2 text-secondary">
                    <span className="px-2 py-1 rounded-full border border-border/70 bg-muted/60 text-[11px] font-mono uppercase tracking-[0.18em] flex items-center gap-1">
                        <Trophy className="w-3.5 h-3.5" />
                        Challenge
                    </span>
                </div>

                <h1
                    className="text-xl font-bold text-foreground pr-8"
                    style={{ fontFamily: "var(--font-display)" }}
                >
                    {challenge.name}
                </h1>
                {challenge.region && (
                    <div className="mt-1 text-xs text-muted-foreground">
                        {challenge.region}
                    </div>
                )}
            </div>

            {/* Momentum Messaging */}
            {summittedPeaks > 0 && (
                <div className="p-3 rounded-xl bg-gradient-to-r from-secondary/10 to-primary/10 border border-secondary/20">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                            {/* Progress summary */}
                            <div className="flex items-center gap-2 mb-1">
                                <TrendingUp className="w-4 h-4 text-secondary" />
                                <span className="text-sm font-semibold text-foreground">
                                    {isCompleted ? (
                                        "Challenge Complete!"
                                    ) : (
                                        <>
                                            {progressPercent}% done
                                            <span className="text-muted-foreground font-normal">
                                                {" "}— {remainingPeaks} peak{remainingPeaks !== 1 ? "s" : ""} to go
                                            </span>
                                        </>
                                    )}
                                </span>
                            </div>

                            {/* Last progress */}
                            {lastProgressText && progress?.lastProgressCount && (
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Calendar className="w-3 h-3" />
                                    <span>
                                        Last progress: {lastProgressText}
                                        {progress.lastProgressCount > 0 && (
                                            <span className="text-secondary font-medium">
                                                {" "}(+{progress.lastProgressCount} peak{progress.lastProgressCount !== 1 ? "s" : ""})
                                            </span>
                                        )}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Milestone badge */}
                        {milestone && (
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-full bg-background/80 ${milestone.color}`}>
                                {isCompleted ? (
                                    <Award className="w-3.5 h-3.5" />
                                ) : (
                                    <Sparkles className="w-3.5 h-3.5" />
                                )}
                                <span className="text-xs font-medium">{milestone.label}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Next Peak Suggestion */}
            {nextPeakSuggestion && (nextPeakSuggestion.closestPeak || nextPeakSuggestion.easiestPeak) && !isCompleted && (
                <div className="space-y-2">
                    {/* Closest Peak */}
                    {nextPeakSuggestion.closestPeak && (
                        <Link
                            href={`/peaks/${nextPeakSuggestion.closestPeak.id}`}
                            className="block p-3 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 hover:border-blue-500/40 transition-colors group"
                        >
                            <div className="flex items-center gap-2 mb-1.5">
                                <Navigation className="w-4 h-4 text-blue-500" />
                                <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                                    Closest Unclimbed
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {nextPeakSuggestion.closestPeak.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {Math.round(metersToFt(nextPeakSuggestion.closestPeak.elevation)).toLocaleString()} ft
                                        <span className="mx-1">•</span>
                                        {nextPeakSuggestion.closestPeak.distance < 1
                                            ? `${(nextPeakSuggestion.closestPeak.distance * 1000).toFixed(0)}m away`
                                            : `${(nextPeakSuggestion.closestPeak.distance * 0.621371).toFixed(1)} mi away`}
                                    </p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                            </div>
                        </Link>
                    )}

                    {/* Easiest Peak (only show if different from closest) */}
                    {nextPeakSuggestion.easiestPeak && 
                     nextPeakSuggestion.closestPeak?.id !== nextPeakSuggestion.easiestPeak.id && (
                        <Link
                            href={`/peaks/${nextPeakSuggestion.easiestPeak.id}`}
                            className="block p-3 rounded-xl bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20 hover:border-emerald-500/40 transition-colors group"
                        >
                            <div className="flex items-center gap-2 mb-1.5">
                                <Mountain className="w-4 h-4 text-emerald-500" />
                                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                    Easiest Remaining
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                        {nextPeakSuggestion.easiestPeak.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {Math.round(metersToFt(nextPeakSuggestion.easiestPeak.elevation)).toLocaleString()} ft
                                    </p>
                                </div>
                                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
                            </div>
                        </Link>
                    )}
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-card border border-border/70">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
                        Total Peaks
                    </p>
                    <p className="text-lg font-mono text-foreground">{totalPeaks}</p>
                </div>
                <div className="p-3 rounded-xl bg-card border border-border/70">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
                        Summitted
                    </p>
                    <p className="text-lg font-mono text-foreground">
                        {summittedPeaks}
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
                        {summittedPeaks} / {totalPeaks}
                    </span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                        className="h-full bg-secondary rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            {/* Community Activity */}
            {communityActivity && (
                <ChallengeActivityIndicator activity={communityActivity} />
            )}

            {/* Actions */}
            <div className="flex gap-2">
                <Button
                    onClick={onToggleFavorite}
                    className={`flex-1 gap-2 h-9 text-sm ${
                        isFavorited
                            ? "bg-secondary/20 text-secondary hover:bg-secondary/30 border border-secondary/30"
                            : "bg-secondary text-secondary-foreground hover:bg-secondary/90"
                    }`}
                    variant={isFavorited ? "outline" : "default"}
                >
                    <Heart className={`w-3.5 h-3.5 ${isFavorited ? "fill-current" : ""}`} />
                    {isFavorited ? "Accepted" : "Accept"}
                </Button>
                <Button
                    variant="outline"
                    onClick={onShowOnMap}
                    className="flex-1 gap-2 h-9 text-sm border-secondary/20 hover:bg-secondary/10"
                >
                    <MapIcon className="w-3.5 h-3.5" />
                    Show on Map
                </Button>
            </div>
        </div>
    );
};

export default ChallengeDetailsMobile;


