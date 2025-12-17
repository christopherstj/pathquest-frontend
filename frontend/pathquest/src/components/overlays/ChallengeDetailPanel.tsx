"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import {
    Trophy,
    Map as MapIcon,
    Heart,
    LogIn,
    CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import getPublicChallengeDetails from "@/actions/challenges/getPublicChallengeDetails";
import addChallengeFavorite from "@/actions/challenges/addChallengeFavorite";
import deleteChallengeFavorite from "@/actions/challenges/deleteChallengeFavorite";
import useRequireAuth, { useIsAuthenticated } from "@/hooks/useRequireAuth";
import DetailPanelHeader from "@/components/ui/detail-panel-header";
import StatsGrid from "@/components/ui/stats-grid";
import StatCard from "@/components/ui/stat-card";
import DetailLoadingState from "@/components/ui/detail-loading-state";
import { useChallengeMapEffects } from "@/hooks/use-challenge-map-effects";
import { useMapStore } from "@/providers/MapProvider";

interface Props {
    challengeId: number;
    onClose: () => void;
}

const ChallengeDetailPanel = ({ challengeId, onClose }: Props) => {
    const { isAuthenticated } = useIsAuthenticated();
    const requireAuth = useRequireAuth();
    const queryClient = useQueryClient();
    const setSelectedChallengeData = useMapStore((state) => state.setSelectedChallengeData);

    const { data, isLoading } = useQuery({
        queryKey: ["challengeDetails", challengeId],
        queryFn: async () => {
            const res = await getPublicChallengeDetails(String(challengeId));
            return res;
        },
    });

    const challenge = data?.success ? data.data?.challenge : null;
    const peaks = data?.success ? data.data?.peaks : null;
    const isFavorited = challenge?.is_favorited ?? false;

    // Use shared map effects hook
    const { showOnMap } = useChallengeMapEffects({
        challenge,
        peaks,
    });

    // Share challenge data with mapStore for DiscoveryDrawer
    useEffect(() => {
        if (challenge && peaks) {
            setSelectedChallengeData({
                challengeId: challengeId,
                challengeName: challenge.name,
                peaks: peaks,
            });
        }

        return () => {
            setSelectedChallengeData(null);
        };
    }, [challenge, peaks, challengeId, setSelectedChallengeData]);

    const handleToggleFavorite = () => {
        requireAuth(async () => {
            if (isFavorited) {
                await deleteChallengeFavorite(String(challengeId));
            } else {
                await addChallengeFavorite(String(challengeId));
            }
            // Refetch challenge details and favorites
            queryClient.invalidateQueries({
                queryKey: ["challengeDetails", challengeId],
            });
            queryClient.invalidateQueries({
                queryKey: ["favoriteChallenges"],
            });
        });
    };

    if (isLoading) {
        return <DetailLoadingState color="secondary" />;
    }

    if (!challenge) return null;

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
                    onClose={onClose}
                    gradientColorClass="from-secondary/10"
                />

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {/* Stats Grid */}
                    <StatsGrid>
                        <StatCard label="Total Peaks" value={totalPeaks} />
                        <StatCard
                            label={isAuthenticated ? "Your Progress" : "Summitted"}
                            value={
                                isAuthenticated ? (
                                    <>
                                        {summittedPeaks}
                                        <span className="text-sm text-muted-foreground ml-1">
                                            / {totalPeaks}
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-sm text-muted-foreground">
                                        Log in to track
                                    </span>
                                )
                            }
                        />
                    </StatsGrid>

                    {/* Progress Bar - Only show for authenticated users */}
                    {isAuthenticated ? (
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Progress</span>
                                <span>
                                    {summittedPeaks} / {totalPeaks} ({progressPercent}%)
                                </span>
                            </div>
                            <div className="h-3 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-secondary to-primary rounded-full transition-all duration-500"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                            {progressPercent === 100 && (
                                <div className="flex items-center gap-2 text-sm text-summited">
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Challenge completed!</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={() => requireAuth(() => {})}
                            className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-3 w-full text-left hover:bg-primary/10 transition-colors"
                        >
                            <LogIn className="w-5 h-5 text-primary" />
                            <div>
                                <p className="text-sm font-medium text-foreground">
                                    Track your progress
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Log in to see which peaks you&apos;ve summitted
                                </p>
                            </div>
                        </button>
                    )}

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
                </div>
            </div>
        </motion.div>
    );
};

export default ChallengeDetailPanel;
