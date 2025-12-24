"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Mountain, Navigation, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Peak from "@/typeDefs/Peak";
import Summit from "@/typeDefs/Summit";
import Challenge from "@/typeDefs/Challenge";
import Activity from "@/typeDefs/Activity";
import { useMapStore } from "@/providers/MapProvider";
import { useRouter } from "next/navigation";
import useRequireAuth, { useIsAuthenticated } from "@/hooks/useRequireAuth";
import DetailPanelHeader from "@/components/ui/detail-panel-header";
import StatsGrid from "@/components/ui/stats-grid";
import StatCard from "@/components/ui/stat-card";
import DiscoveryChallengesList from "@/components/discovery/discovery-challenges-list";
import ChallengeProgress from "@/typeDefs/ChallengeProgress";

interface Props {
    peak: Peak;
    publicSummits?: Summit[];
    challenges?: Challenge[];
    activities?: Activity[];
}

const PeakDetailContent = ({ peak, publicSummits, challenges, activities }: Props) => {
    const map = useMapStore((state) => state.map);
    const router = useRouter();
    const { isAuthenticated } = useIsAuthenticated();
    const requireAuth = useRequireAuth();

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

    // Fly to peak on mount
    useEffect(() => {
        if (peak.location_coords && map) {
            map.flyTo({
                center: peak.location_coords,
                zoom: 13,
                pitch: 50,
                bearing: 20,
                essential: true,
            });
        }
    }, [peak.location_coords, map]);

    const handleFlyToPeak = () => {
        if (peak.location_coords && map) {
            map.flyTo({
                center: peak.location_coords,
                zoom: 14,
                pitch: 60,
                bearing: 30,
                essential: true,
            });
        }
    };

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
                    gradientColorClass="from-accent/10"
                />

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {/* Stats Grid */}
                    <StatsGrid>
                        <StatCard
                            label="Elevation"
                            value={`${peak.elevation?.toLocaleString()} ft`}
                        />
                        <StatCard
                            label="Summits"
                            value={peak.public_summits || publicSummits?.length || 0}
                        />
                    </StatsGrid>

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                        {!isAuthenticated && (
                            <Button 
                                onClick={() => requireAuth(() => {})}
                                className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
                            >
                                <Plus className="w-4 h-4" />
                                Log Summit
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            onClick={handleFlyToPeak}
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

                    {/* Recent Summits */}
                    {publicSummits && publicSummits.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                Recent Summits
                            </h3>
                            <div className="space-y-2">
                                {publicSummits.slice(0, 5).map((summit, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between p-3 rounded-lg bg-card border border-border/70"
                                    >
                                        <span className="text-sm text-foreground">
                                            Anonymous
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {summit.timestamp
                                                ? new Date(summit.timestamp).toLocaleDateString()
                                                : ""}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    <div className="text-sm text-muted-foreground leading-relaxed">
                        Track your ascents and compete with others on the leaderboard.
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default PeakDetailContent;
