"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import {
    X,
    Mountain,
    MapPin,
    CheckCircle,
    Navigation,
    ChevronRight,
    Users,
    Heart,
    LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import getPeakDetails from "@/actions/peaks/getPeakDetails";
import toggleFavoritePeak from "@/actions/peaks/toggleFavoritePeak";
import { useMapStore } from "@/providers/MapProvider";
import Link from "next/link";
import convertPeaksToGeoJSON from "@/helpers/convertPeaksToGeoJSON";
import mapboxgl from "mapbox-gl";
import CurrentConditions from "../app/peaks/CurrentConditions";
import metersToFt from "@/helpers/metersToFt";
import useRequireAuth, { useIsAuthenticated } from "@/hooks/useRequireAuth";

interface Props {
    peakId: string;
    onClose: () => void;
}

const PeakDetailPanel = ({ peakId, onClose }: Props) => {
    const map = useMapStore((state) => state.map);
    const setSummitHistoryPeakId = useMapStore(
        (state) => state.setSummitHistoryPeakId
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
    const isFavorited = peak?.is_favorited ?? false;
    const userSummits = peak?.summits ?? 0;

    // Fly to peak location when data loads
    useEffect(() => {
        if (peak?.location_coords && map) {
            map.flyTo({
                center: peak.location_coords,
                zoom: 13,
                pitch: 50,
                bearing: 20,
                essential: true,
            });
        }
    }, [peak?.location_coords, map]);

    // Set selected peak on map with larger icon
    useEffect(() => {
        if (!map || !peak) return;

        const setSelectedPeakSource = async () => {
            let peaksSource = map.getSource("selectedPeaks") as mapboxgl.GeoJSONSource | undefined;

            // Retry a few times if source isn't ready yet
            let attempts = 0;
            const maxAttempts = 5;

            while (!peaksSource && attempts < maxAttempts) {
                attempts++;
                await new Promise((resolve) => setTimeout(resolve, 300));
                peaksSource = map.getSource("selectedPeaks") as mapboxgl.GeoJSONSource | undefined;
            }

            if (peaksSource) {
                peaksSource.setData(convertPeaksToGeoJSON([peak]));
            }
        };

        setSelectedPeakSource();

        // Cleanup: clear selected peak when unmounting
        return () => {
            const peaksSource = map.getSource("selectedPeaks") as mapboxgl.GeoJSONSource | undefined;
            if (peaksSource) {
                peaksSource.setData({
                    type: "FeatureCollection",
                    features: [],
                });
            }
        };
    }, [map, peak]);

    const handleFlyToPeak = () => {
        if (peak?.location_coords && map) {
            map.flyTo({
                center: peak.location_coords,
                zoom: 14,
                pitch: 60,
                bearing: 30,
                essential: true,
            });
        }
    };

    const handleToggleFavorite = () => {
        requireAuth(async () => {
            await toggleFavoritePeak(peakId);
            // Refetch peak details
            queryClient.invalidateQueries({
                queryKey: ["peakDetails", peakId],
            });
        });
    };

    const handleLogSummit = () => {
        requireAuth(() => {
            // TODO: Open manual summit logging modal
            // For now, just show that auth is required
            console.log("Log summit for peak:", peakId);
        });
    };

    if (isLoading) {
        return (
            <motion.div 
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 100, opacity: 0 }}
                className="fixed top-20 right-3 md:right-5 bottom-6 w-[calc(100%-1.5rem)] md:w-[340px] max-w-[340px] pointer-events-auto z-40"
            >
                <div className="w-full h-full rounded-2xl bg-background/85 backdrop-blur-xl border border-border shadow-xl p-6 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </motion.div>
        );
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
                <div className="p-5 border-b border-border/60 bg-gradient-to-b from-accent/10 to-transparent relative">
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Close peak details"
                        tabIndex={0}
                    >
                        <X className="w-4 h-4" />
                    </button>
                    
                    <div className="flex items-center gap-2 mb-2 text-primary">
                        <span className="px-2 py-1 rounded-full border border-border/70 bg-muted/60 text-[11px] font-mono uppercase tracking-[0.18em] flex items-center gap-1">
                            <Mountain className="w-4 h-4" />
                            Peak
                        </span>
                    </div>
                    
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>{peak.name}</h1>
                    {location && (
                        <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span className="text-sm">{location}</span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 rounded-xl bg-card border border-border/70 shadow-sm">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                                Elevation
                            </p>
                            <p className="text-xl font-mono text-foreground">
                                {peak.elevation
                                    ? Math.round(
                                          metersToFt(peak.elevation)
                                      ).toLocaleString()
                                    : 0}{" "}
                                ft
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-card border border-border/70 shadow-sm">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                                {isAuthenticated ? "Your Summits" : "Total Summits"}
                            </p>
                            <p className="text-xl font-mono text-foreground">
                                {isAuthenticated ? (
                                    userSummits > 0 ? (
                                        <span className="text-green-500">
                                            {userSummits}
                                        </span>
                                    ) : (
                                        "0"
                                    )
                                ) : (
                                    peak.public_summits ||
                                    publicSummits?.length ||
                                    0
                                )}
                            </p>
                        </div>
                    </div>

                    {/* User summit status */}
                    {isAuthenticated && userSummits > 0 && (
                        <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500" />
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
                        <Button
                            onClick={handleLogSummit}
                            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                        >
                            <CheckCircle className="w-4 h-4" />
                            Log Summit
                        </Button>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={handleToggleFavorite}
                                className={`flex-1 gap-2 ${
                                    isFavorited
                                        ? "border-red-500/30 text-red-500 hover:bg-red-500/10"
                                        : "border-primary/20 hover:bg-primary/10 hover:text-primary"
                                }`}
                            >
                                <Heart
                                    className={`w-4 h-4 ${
                                        isFavorited ? "fill-current" : ""
                                    }`}
                                />
                                {isFavorited ? "Saved" : "Save"}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleFlyToPeak}
                                className="flex-1 gap-2 border-primary/20 hover:bg-primary/10 hover:text-primary"
                            >
                                <Navigation className="w-4 h-4" />
                                Fly to
                            </Button>
                        </div>
                    </div>

                    {/* Challenges Section */}
                    {challenges && challenges.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                Part of {challenges.length} Challenge{challenges.length !== 1 ? "s" : ""}
                            </h3>
                            <div className="space-y-2">
                                {challenges.slice(0, 3).map((challenge) => (
                                    <Link
                                        key={challenge.id}
                                        href={`/challenges/${challenge.id}`}
                                        className="flex items-center justify-between p-3 rounded-lg bg-card border border-border/70 hover:bg-card/80 transition-colors group"
                                    >
                                        <span className="text-sm font-medium text-foreground">
                                            {challenge.name}
                                        </span>
                                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recent Summits */}
                    {publicSummits && publicSummits.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                    Recent Summits
                                </h3>
                                <button
                                    onClick={() => setSummitHistoryPeakId(peakId)}
                                    className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                                    aria-label="View all summits"
                                    tabIndex={0}
                                >
                                    <Users className="w-3.5 h-3.5" />
                                    View all {publicSummits.length}
                                </button>
                            </div>
                            <div className="space-y-2">
                                {publicSummits.slice(0, 3).map((summit, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between p-3 rounded-lg bg-card border border-border/70"
                                    >
                                        <span className="text-sm text-foreground">
                                            {(summit as any).user_name || "Anonymous"}
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

export default PeakDetailPanel;

