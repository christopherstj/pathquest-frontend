"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Map as MapIcon, Heart, Mountain, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import Challenge from "@/typeDefs/Challenge";
import Peak from "@/typeDefs/Peak";
import Activity from "@/typeDefs/Activity";
import { useRouter } from "next/navigation";
import Link from "next/link";
import metersToFt from "@/helpers/metersToFt";
import addChallengeFavorite from "@/actions/challenges/addChallengeFavorite";
import deleteChallengeFavorite from "@/actions/challenges/deleteChallengeFavorite";
import useRequireAuth from "@/hooks/useRequireAuth";
import DetailPanelHeader from "@/components/ui/detail-panel-header";
import StatsGrid from "@/components/ui/stats-grid";
import StatCard from "@/components/ui/stat-card";
import { useChallengeMapEffects } from "@/hooks/use-challenge-map-effects";

interface Props {
    challenge: Challenge;
    peaks?: Peak[];
    activityCoords?: {
        id: string;
        coords: Activity["coords"];
    }[];
}

const ChallengeDetailContent = ({ challenge, peaks, activityCoords }: Props) => {
    const router = useRouter();
    const requireAuth = useRequireAuth();
    const queryClient = useQueryClient();
    const [isFavorited, setIsFavorited] = useState(challenge.is_favorited ?? false);

    // Sync local state with prop changes
    useEffect(() => {
        setIsFavorited(challenge.is_favorited ?? false);
    }, [challenge.is_favorited]);

    // Use shared map effects hook
    const { showOnMap } = useChallengeMapEffects({
        challenge,
        peaks,
    });

    const handleClose = () => {
        router.back();
    };

    const handleToggleFavorite = () => {
        requireAuth(async () => {
            // Optimistically update UI
            setIsFavorited(!isFavorited);
            
            if (isFavorited) {
                const result = await deleteChallengeFavorite(challenge.id);
                if (!result.success) {
                    // Revert on error
                    setIsFavorited(true);
                }
            } else {
                const result = await addChallengeFavorite(challenge.id);
                if (!result.success) {
                    // Revert on error
                    setIsFavorited(false);
                }
            }
            // Invalidate queries to refresh data elsewhere
            queryClient.invalidateQueries({
                queryKey: ["challengeDetails", Number(challenge.id)],
            });
            queryClient.invalidateQueries({
                queryKey: ["favoriteChallenges"],
            });
        });
    };

    // Count summitted peaks
    const summittedPeaks = peaks?.filter((p) => p.summits && p.summits > 0).length || 0;
    const totalPeaks = peaks?.length || challenge.num_peaks || 0;
    const progressPercent = totalPeaks > 0 ? Math.round((summittedPeaks / totalPeaks) * 100) : 0;

    return (
        <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            className="fixed top-20 right-3 md:right-5 bottom-6 w-[calc(100%-1.5rem)] md:w-[340px] max-w-[340px] pointer-events-auto z-40 flex flex-col gap-3"
        >
            <div className="flex-1 rounded-2xl bg-background/85 backdrop-blur-xl border border-border shadow-xl overflow-hidden flex flex-col">
                {/* Header */}
                <DetailPanelHeader
                    badge={{ icon: Trophy, label: "Challenge", colorClass: "text-secondary" }}
                    title={challenge.name}
                    subtitle={challenge.region}
                    onClose={handleClose}
                    gradientColorClass="from-secondary/10"
                />

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {/* Stats Grid */}
                    <StatsGrid>
                        <StatCard label="Total Peaks" value={totalPeaks} />
                        <StatCard
                            label="Summitted"
                            value={
                                <>
                                    {summittedPeaks}
                                    <span className="text-sm text-muted-foreground ml-1">
                                        ({progressPercent}%)
                                    </span>
                                </>
                            }
                        />
                    </StatsGrid>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Progress</span>
                            <span>
                                {summittedPeaks} / {totalPeaks}
                            </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-secondary rounded-full transition-all duration-500"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                        <Button
                            onClick={handleToggleFavorite}
                            className={`w-full gap-2 ${
                                isFavorited
                                    ? "bg-secondary/20 text-secondary hover:bg-secondary/30 border border-secondary/30"
                                    : "bg-secondary text-secondary-foreground hover:bg-secondary/90"
                            }`}
                            variant={isFavorited ? "outline" : "default"}
                        >
                            <Heart
                                className={`w-4 h-4 ${isFavorited ? "fill-current" : ""}`}
                            />
                            {isFavorited ? "Challenge Accepted" : "Accept Challenge"}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={showOnMap}
                            className="w-full gap-2 border-secondary/20 hover:bg-secondary/10 hover:text-secondary"
                        >
                            <MapIcon className="w-4 h-4" />
                            Show on Map
                        </Button>
                    </div>

                    {/* Peaks List */}
                    {peaks && peaks.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                Peaks in Challenge
                            </h3>
                            <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                                {[...peaks].sort((a, b) => (b.elevation || 0) - (a.elevation || 0)).map((peak) => (
                                    <Link
                                        key={peak.id}
                                        href={`/peaks/${peak.id}`}
                                        className="flex items-center justify-between p-3 rounded-lg bg-card border border-border/70 hover:bg-card/80 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Mountain
                                                className={`w-4 h-4 ${
                                                    peak.summits && peak.summits > 0
                                                        ? "text-summited"
                                                        : "text-muted-foreground"
                                                }`}
                                            />
                                            <div>
                                                <span className="text-sm font-medium text-foreground block">
                                                    {peak.name}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {peak.elevation ? Math.round(metersToFt(peak.elevation)).toLocaleString() : 0} ft
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
            </div>
        </motion.div>
    );
};

export default ChallengeDetailContent;
