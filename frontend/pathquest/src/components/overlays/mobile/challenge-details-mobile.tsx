"use client";

import React from "react";
import { Trophy, Heart, Map as MapIcon, Mountain, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import metersToFt from "@/helpers/metersToFt";
import Challenge from "@/typeDefs/Challenge";
import Peak from "@/typeDefs/Peak";

interface ChallengeDetailsMobileProps {
    challenge: Challenge;
    peaks?: Peak[] | null;
    isFavorited: boolean;
    onClose: () => void;
    onToggleFavorite: () => void;
    onShowOnMap: () => void;
}

const ChallengeDetailsMobile = ({
    challenge,
    peaks,
    isFavorited,
    onClose,
    onToggleFavorite,
    onShowOnMap,
}: ChallengeDetailsMobileProps) => {
    const summittedPeaks = peaks?.filter((p) => p.summits && p.summits > 0).length || 0;
    const totalPeaks = peaks?.length || challenge.num_peaks || 0;
    const progressPercent = totalPeaks > 0 ? Math.round((summittedPeaks / totalPeaks) * 100) : 0;

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

            {/* Peaks List */}
            {peaks && peaks.length > 0 && (
                <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Peaks in Challenge
                    </h3>
                    <div className="space-y-1.5 max-h-[200px] overflow-y-auto custom-scrollbar">
                        {[...peaks]
                            .sort((a, b) => (b.elevation || 0) - (a.elevation || 0))
                            .map((pk) => (
                                <Link
                                    key={pk.id}
                                    href={`/peaks/${pk.id}`}
                                    className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border/70 hover:bg-card/80 transition-colors group"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <Mountain
                                            className={`w-3.5 h-3.5 ${
                                                pk.summits && pk.summits > 0
                                                    ? "text-green-500"
                                                    : "text-muted-foreground"
                                            }`}
                                        />
                                        <div>
                                            <span className="text-sm font-medium text-foreground block">
                                                {pk.name}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {pk.elevation
                                                    ? Math.round(metersToFt(pk.elevation)).toLocaleString()
                                                    : 0}{" "}
                                                ft
                                            </span>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                </Link>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChallengeDetailsMobile;


