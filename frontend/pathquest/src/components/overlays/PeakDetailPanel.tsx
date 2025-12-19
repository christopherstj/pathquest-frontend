/**
 * @deprecated This component is deprecated as of Phase 5B.
 * Desktop now uses DesktopNavLayout which renders ExploreTabContent for all detail views.
 * Peak details are now handled by PeakDetailsMobile inside ExploreTabContent.
 * This file is kept for reference but is no longer imported anywhere.
 * Safe to delete after verifying the new desktop layout is working properly.
 */
"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    Mountain,
    CheckCircle,
    Navigation,
    LogIn,
    Plus,
    X,
    Users,
    BookOpen,
    Thermometer,
    Cloud,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import getPeakDetails from "@/actions/peaks/getPeakDetails";
import { useMapStore } from "@/providers/MapProvider";
import CurrentConditions from "../app/peaks/CurrentConditions";
import metersToFt from "@/helpers/metersToFt";
import useRequireAuth, { useIsAuthenticated } from "@/hooks/useRequireAuth";
import DetailLoadingState from "@/components/ui/detail-loading-state";
import { usePeakMapEffects } from "@/hooks/use-peak-map-effects";
import { useRouter } from "next/navigation";
import { PeakActivityIndicator } from "@/components/peaks";
import PeakCommunity from "./PeakCommunity";
import PeakUserActivity from "./PeakUserActivity";
import { useManualSummitStore } from "@/providers/ManualSummitProvider";

interface Props {
    peakId: string;
    onClose: () => void;
}

type PeakTab = "community" | "journal";

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
    const openManualSummit = useManualSummitStore((state) => state.openManualSummit);

    const [activeTab, setActiveTab] = useState<PeakTab>("community");
    const [showWeather, setShowWeather] = useState(false);
    const [highlightedActivityId, setHighlightedActivityId] = useState<string | null>(null);

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

    // Use shared map effects hook
    const { flyToPeak } = usePeakMapEffects({
        peak,
        activities,
        flyToOnLoad: true,
    });

    // Share user's ascents and activities with the map store for tabs (only for authenticated users)
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
        if (peak && peak.location_coords) {
            openManualSummit({
                peakId,
                peakName: peak.name || "Unknown Peak",
                peakCoords: peak.location_coords,
            });
        }
    };

    if (isLoading) {
        return <DetailLoadingState color="primary" />;
    }

    if (!peak) return null;

    const hasUnreportedSummits = peak.ascents?.some(
        (a) => !a.notes && !a.difficulty && !a.experience_rating
    );

    return (
        <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            className="fixed top-20 right-3 md:right-5 bottom-6 w-[calc(100%-1.5rem)] md:w-[380px] max-w-[380px] pointer-events-auto z-40 flex flex-col"
        >
            <div className="flex-1 rounded-2xl bg-background/85 backdrop-blur-xl border border-border shadow-xl overflow-hidden flex flex-col">
                {/* Compact Header */}
                <div className="p-4 border-b border-border/60 bg-gradient-to-b from-primary/5 to-transparent">
                    {/* Top row: Close button and fly to peak */}
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Mountain className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                                <h1
                                    className="text-lg font-bold text-foreground leading-tight"
                                    style={{ fontFamily: "var(--font-display)" }}
                                >
                                    {peak.name || "Unknown Peak"}
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    {peak.elevation
                                        ? `${Math.round(metersToFt(peak.elevation)).toLocaleString()} ft`
                                        : ""}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={flyToPeak}
                                className="h-8 w-8 text-muted-foreground hover:text-primary"
                                title="Fly to peak"
                            >
                                <Navigation className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Status row: Summit status + Activity indicator */}
                    <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            {isAuthenticated ? (
                                userSummits > 0 ? (
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-summited/10 border border-summited/30">
                                        <CheckCircle className="w-3.5 h-3.5 text-summited" />
                                        <span className="text-xs font-medium text-summited">
                                            Summited {userSummits}x
                                        </span>
                                    </div>
                                ) : (
                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/30 border border-border/50">
                                        <Mountain className="w-3.5 h-3.5 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">
                                            Not summited yet
                                        </span>
                                    </div>
                                )
                            ) : (
                                <button
                                    onClick={() => requireAuth(() => {})}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-colors"
                                >
                                    <LogIn className="w-3.5 h-3.5 text-primary" />
                                    <span className="text-xs text-primary">
                                        Log in to track
                                    </span>
                                </button>
                            )}
                        </div>
                        <PeakActivityIndicator peakId={peakId} compact />
                    </div>

                    {/* Weather toggle (collapsed by default) */}
                    {peak.location_coords && (
                        <button
                            onClick={() => setShowWeather(!showWeather)}
                            className="mt-3 w-full flex items-center justify-between p-2 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors text-xs text-muted-foreground"
                        >
                            <div className="flex items-center gap-2">
                                <Cloud className="w-3.5 h-3.5" />
                                <span>Current Conditions</span>
                            </div>
                            {showWeather ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                            )}
                        </button>
                    )}

                    {/* Weather content (when expanded) */}
                    {showWeather && peak.location_coords && (
                        <div className="mt-2">
                            <CurrentConditions
                                lat={peak.location_coords[1]}
                                lng={peak.location_coords[0]}
                            />
                        </div>
                    )}
                </div>

                {/* Tab Bar */}
                <div className="flex border-b border-border/60">
                    <button
                        onClick={() => setActiveTab("community")}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors relative ${
                            activeTab === "community"
                                ? "text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <Users className="w-4 h-4" />
                        Community
                        {activeTab === "community" && (
                            <motion.div
                                layoutId="peak-tab-indicator"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                            />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab("journal")}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors relative ${
                            activeTab === "journal"
                                ? "text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <BookOpen className="w-4 h-4" />
                        My Journal
                        {activeTab === "journal" && (
                            <motion.div
                                layoutId="peak-tab-indicator"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                            />
                        )}
                    </button>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {activeTab === "community" ? (
                        <PeakCommunity />
                    ) : isAuthenticated ? (
                        <PeakUserActivity
                            highlightedActivityId={highlightedActivityId}
                            onHighlightActivity={setHighlightedActivityId}
                        />
                    ) : (
                        <div className="text-center py-10">
                            <BookOpen className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-50" />
                            <p className="text-sm font-medium text-muted-foreground mb-3">
                                Log in to see your summit history
                            </p>
                            <Button
                                onClick={() => requireAuth(() => {})}
                                variant="outline"
                                className="gap-2"
                            >
                                <LogIn className="w-4 h-4" />
                                Log In
                            </Button>
                        </div>
                    )}
                </div>

                {/* Add Report CTA - shows when user has unreported summits on Community tab */}
                {isAuthenticated && hasUnreportedSummits && activeTab === "community" && (
                    <div className="p-4 border-t border-border/60 bg-gradient-to-t from-primary/5 to-transparent">
                        <Button
                            onClick={() => setActiveTab("journal")}
                            className="w-full gap-2 bg-primary hover:bg-primary/90"
                        >
                            <Plus className="w-4 h-4" />
                            Share Your Experience
                        </Button>
                        <p className="text-xs text-center text-muted-foreground mt-2">
                            Your report helps others plan their trip!
                        </p>
                    </div>
                )}

                {/* Log Summit CTA - shows on Journal tab when authenticated */}
                {isAuthenticated && activeTab === "journal" && (
                    <div className="p-4 border-t border-border/60">
                        <Button
                            onClick={handleLogSummit}
                            className="w-full gap-2 bg-summited hover:bg-summited/90 text-white"
                        >
                            <Plus className="w-4 h-4" />
                            Log Summit
                        </Button>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default PeakDetailPanel;
