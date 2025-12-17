"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import {
    Mountain,
    CheckCircle,
    Navigation,
    LogIn,
    Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import getPeakDetails from "@/actions/peaks/getPeakDetails";
import { useMapStore } from "@/providers/MapProvider";
import CurrentConditions from "../app/peaks/CurrentConditions";
import metersToFt from "@/helpers/metersToFt";
import useRequireAuth, { useIsAuthenticated } from "@/hooks/useRequireAuth";
import DetailPanelHeader from "@/components/ui/detail-panel-header";
import StatsGrid from "@/components/ui/stats-grid";
import StatCard from "@/components/ui/stat-card";
import DetailLoadingState from "@/components/ui/detail-loading-state";
import { usePeakMapEffects } from "@/hooks/use-peak-map-effects";
import DiscoveryChallengesList from "@/components/discovery/discovery-challenges-list";
import ChallengeProgress from "@/typeDefs/ChallengeProgress";
import { useRouter } from "next/navigation";

interface Props {
    peakId: string;
    onClose: () => void;
}

const PeakDetailPanel = ({ peakId, onClose }: Props) => {
    const map = useMapStore((state) => state.map);
    const router = useRouter();
    const setSelectedPeakUserData = useMapStore(
        (state) => state.setSelectedPeakUserData
    );
    const setSelectedPeakCommunityData = useMapStore(
        (state) => state.setSelectedPeakCommunityData
    );
    const { isAuthenticated } = useIsAuthenticated();
    const requireAuth = useRequireAuth();
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ["peakDetails", peakId],
        queryFn: async () => {
            const res = await getPeakDetails(peakId);
            return res;
        },
    });

    const peak = data?.success ? data.data?.peak : null;
    const challenges = data?.success ? data.data?.challenges : null;
    const publicSummits = data?.success ? data.data?.publicSummits : null;
    const activities = data?.success ? data.data?.activities : null;
    const userSummits = peak?.summits ?? 0;

    // Convert Challenge[] to ChallengeProgress[] for DiscoveryChallengesList
    // The API returns num_completed for logged-in users, but it's not in the Challenge type
    const challengesWithProgress: ChallengeProgress[] = challenges
        ? challenges.map((challenge) => ({
              ...challenge,
              total: challenge.num_peaks || 0,
              completed: (challenge as any).num_completed || 0,
          }))
        : [];

    const handleChallengeClick = (id: string) => {
        router.push(`/challenges/${id}`);
    };

    // Use shared map effects hook
    const { flyToPeak } = usePeakMapEffects({
        peak,
        activities,
        flyToOnLoad: true,
    });

    // Share user's ascents and activities with the map store for DiscoveryDrawer (only for authenticated users)
    useEffect(() => {
        if (peak && isAuthenticated && peak.location_coords) {
            setSelectedPeakUserData({
                peakId: peakId,
                peakName: peak.name || "Unknown Peak",
                peakCoords: peak.location_coords,
                ascents: peak.ascents || [],
                activities: activities || [],
            });
        }

        return () => {
            setSelectedPeakUserData(null);
        };
    }, [peak, activities, isAuthenticated, peakId, setSelectedPeakUserData]);

    // Share community/public summits data with the map store (for all users)
    useEffect(() => {
        if (peak) {
            setSelectedPeakCommunityData({
                peakId: peakId,
                peakName: peak.name || "Unknown Peak",
                publicSummits: publicSummits || [],
            });
        }

        return () => {
            setSelectedPeakCommunityData(null);
        };
    }, [peak, publicSummits, peakId, setSelectedPeakCommunityData]);

    const handleLogSummit = () => {
        requireAuth(() => {
            // TODO: Open manual summit logging modal
            console.log("Log summit for peak:", peakId);
        });
    };

    if (isLoading) {
        return <DetailLoadingState color="primary" />;
    }

    if (!peak) return null;

    const location = [peak.county, peak.state, peak.country].filter(Boolean).join(", ");

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
                    badge={{ icon: Mountain, label: "Peak" }}
                    title={peak.name || "Unknown Peak"}
                    location={location}
                    onClose={onClose}
                    gradientColorClass="from-accent/10"
                />

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {/* Stats Grid */}
                    <StatsGrid>
                        <StatCard
                            label="Elevation"
                            value={`${peak.elevation ? Math.round(metersToFt(peak.elevation)).toLocaleString() : 0} ft`}
                        />
                        <StatCard
                            label={isAuthenticated ? "Your Summits" : "Total Summits"}
                            value={
                                isAuthenticated ? (
                                    userSummits > 0 ? (
                                        <span className="text-summited">{userSummits}</span>
                                    ) : (
                                        "0"
                                    )
                                ) : (
                                    peak.public_summits || publicSummits?.length || 0
                                )
                            }
                        />
                    </StatsGrid>

                    {/* User summit status */}
                    {isAuthenticated && userSummits > 0 && (
                        <div className="p-3 rounded-xl bg-summited/10 border border-summited/30 flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-summited" />
                            <div>
                                <p className="text-sm font-medium text-foreground">
                                    You&apos;ve summited this peak!
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {userSummits} time{userSummits > 1 ? "s" : ""}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Login prompt for unauthenticated users */}
                    {!isAuthenticated && (
                        <button
                            onClick={() => requireAuth(() => {})}
                            className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center gap-3 w-full text-left hover:bg-primary/10 transition-colors"
                        >
                            <LogIn className="w-5 h-5 text-primary" />
                            <div>
                                <p className="text-sm font-medium text-foreground">
                                    Track your summits
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Log in to see if you&apos;ve climbed this peak
                                </p>
                            </div>
                        </button>
                    )}

                    {/* Current Conditions */}
                    {peak.location_coords && (
                        <CurrentConditions
                            lat={peak.location_coords[1]}
                            lng={peak.location_coords[0]}
                        />
                    )}

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                        {!isAuthenticated && (
                            <Button
                                onClick={handleLogSummit}
                                className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
                            >
                                <Plus className="w-4 h-4" />
                                Log Summit
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            onClick={flyToPeak}
                            className="w-full gap-2 border-primary/20 hover:bg-primary/10 hover:text-primary"
                        >
                            <Navigation className="w-4 h-4" />
                            Fly to Peak
                        </Button>
                    </div>

                    {/* Challenges Section */}
                    {challenges && challenges.length > 0 && (
                        <DiscoveryChallengesList
                            challenges={challengesWithProgress}
                            onChallengeClick={handleChallengeClick}
                            title={`Part of ${challenges.length} Challenge${challenges.length !== 1 ? "s" : ""}`}
                        />
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default PeakDetailPanel;
