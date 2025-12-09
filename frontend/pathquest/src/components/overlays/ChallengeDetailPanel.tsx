"use client";

import React, { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
    X,
    Trophy,
    Map as MapIcon,
    Heart,
    Mountain,
    ChevronRight,
    LogIn,
    CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import getPublicChallengeDetails from "@/actions/challenges/getPublicChallengeDetails";
import addChallengeFavorite from "@/actions/challenges/addChallengeFavorite";
import deleteChallengeFavorite from "@/actions/challenges/deleteChallengeFavorite";
import { useMapStore } from "@/providers/MapProvider";
import mapboxgl from "mapbox-gl";
import Link from "next/link";
import convertPeaksToGeoJSON from "@/helpers/convertPeaksToGeoJSON";
import { setPeaksSearchDisabled } from "@/helpers/peaksSearchState";
import metersToFt from "@/helpers/metersToFt";
import useRequireAuth, { useIsAuthenticated } from "@/hooks/useRequireAuth";

interface Props {
    challengeId: number;
    onClose: () => void;
}

const ChallengeDetailPanel = ({ challengeId, onClose }: Props) => {
    const map = useMapStore((state) => state.map);
    const setDisablePeaksSearch = useMapStore(
        (state) => state.setDisablePeaksSearch
    );
    const { isAuthenticated } = useIsAuthenticated();
    const requireAuth = useRequireAuth();
    const queryClient = useQueryClient();

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

    // Calculate bounds of all peaks to fit them on the map
    const bounds = useMemo(() => {
        if (!peaks || peaks.length === 0) return null;

        const peakCoords = peaks
            .filter((p) => p.location_coords)
            .map((p) => p.location_coords as [number, number]);

        if (peakCoords.length === 0) return null;

        const lngLat = new mapboxgl.LngLatBounds();
        peakCoords.forEach((coord) => {
            lngLat.extend(coord);
        });

        return lngLat;
    }, [peaks]);

    // Disable peaks search and clear existing peaks when challenge detail opens
    useEffect(() => {
        // Set both the module-level flag (immediate, avoids React timing) and store flag
        setPeaksSearchDisabled(true);
        setDisablePeaksSearch(true);
        
        // Also immediately clear the peaks source to remove any already-loaded peaks
        if (map) {
            const peaksSource = map.getSource("peaks") as mapboxgl.GeoJSONSource | undefined;
            if (peaksSource) {
                peaksSource.setData({
                    type: "FeatureCollection",
                    features: [],
                });
            }
        }
        
        return () => {
            setPeaksSearchDisabled(false);
            setDisablePeaksSearch(false);
            
            // Reset map padding and trigger peaks refresh when panel closes
            if (map) {
                // Reset any padding that was applied by fitBounds
                // This ensures getBounds() returns the full visible area
                map.setPadding({ top: 0, bottom: 0, left: 0, right: 0 });
                
                // Small delay to ensure the disabled flag and padding are updated before the fetch runs
                setTimeout(() => {
                    map.fire("moveend");
                }, 50);
            }
        };
    }, [setDisablePeaksSearch, map]);

    // Fit map to challenge bounds on mount
    useEffect(() => {
        if (bounds && map) {
            map.fitBounds(bounds, {
                padding: { top: 100, bottom: 100, left: 50, right: 400 },
                maxZoom: 12,
            });
        } else if (challenge?.location_coords && map) {
            map.flyTo({
                center: challenge.location_coords,
                zoom: 10,
                essential: true,
            });
        }
    }, [bounds, challenge?.location_coords, map]);

    // Show challenge peaks on the map
    useEffect(() => {
        if (!map || !peaks || peaks.length === 0) return;

        const setChallengePeaksOnMap = async () => {
            // Wait for the source to be available
            let selectedPeaksSource = map.getSource("selectedPeaks") as mapboxgl.GeoJSONSource | undefined;
            
            let attempts = 0;
            const maxAttempts = 10;

            while (!selectedPeaksSource && attempts < maxAttempts) {
                attempts++;
                await new Promise((resolve) => setTimeout(resolve, 300));
                selectedPeaksSource = map.getSource("selectedPeaks") as mapboxgl.GeoJSONSource | undefined;
            }

            // Set challenge peaks in the selectedPeaks source
            if (selectedPeaksSource) {
                selectedPeaksSource.setData(convertPeaksToGeoJSON(peaks));
            }

            // Move selectedPeaks layer to the top
            if (map.getLayer("selectedPeaks")) {
                map.moveLayer("selectedPeaks");
            }
        };

        setChallengePeaksOnMap();

        // Cleanup: clear selected peaks
        return () => {
            const selectedPeaksSource = map.getSource("selectedPeaks") as mapboxgl.GeoJSONSource | undefined;
            if (selectedPeaksSource) {
                selectedPeaksSource.setData({
                    type: "FeatureCollection",
                    features: [],
                });
            }
        };
    }, [map, peaks]);

    const handleShowOnMap = () => {
        if (bounds && map) {
            map.fitBounds(bounds, {
                padding: { top: 100, bottom: 100, left: 50, right: 400 },
                maxZoom: 12,
            });
        }
    };

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
        return (
            <motion.div 
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 100, opacity: 0 }}
                className="fixed top-20 right-3 md:right-5 bottom-6 w-[calc(100%-1.5rem)] md:w-[340px] max-w-[340px] pointer-events-auto z-40"
            >
                <div className="w-full h-full rounded-2xl bg-background/85 backdrop-blur-xl border border-border shadow-xl p-6 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
                </div>
            </motion.div>
        );
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
                <div className="p-5 border-b border-border/60 bg-gradient-to-b from-secondary/10 to-transparent relative">
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Close challenge details"
                        tabIndex={0}
                    >
                        <X className="w-4 h-4" />
                    </button>
                    
                    <div className="flex items-center gap-2 mb-2 text-secondary">
                        <span className="px-2 py-1 rounded-full border border-border/70 bg-muted/60 text-[11px] font-mono uppercase tracking-[0.18em] flex items-center gap-1">
                            <Trophy className="w-4 h-4" />
                            Challenge
                        </span>
                    </div>
                    
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>{challenge.name}</h1>
                    {challenge.region && (
                        <div className="mt-2 text-sm text-muted-foreground">{challenge.region}</div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 rounded-xl bg-card border border-border/70 shadow-sm">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                                Total Peaks
                            </p>
                            <p className="text-xl font-mono text-foreground">
                                {totalPeaks}
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-card border border-border/70 shadow-sm">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                                {isAuthenticated ? "Your Progress" : "Summitted"}
                            </p>
                            <p className="text-xl font-mono text-foreground">
                                {isAuthenticated ? (
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
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Progress Bar - Only show for authenticated users */}
                    {isAuthenticated ? (
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Progress</span>
                                <span>
                                    {summittedPeaks} / {totalPeaks} (
                                    {progressPercent}%)
                                </span>
                            </div>
                            <div className="h-3 bg-muted rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-secondary to-primary rounded-full transition-all duration-500"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                            {progressPercent === 100 && (
                                <div className="flex items-center gap-2 text-sm text-green-500">
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
                                className={`w-4 h-4 ${
                                    isFavorited ? "fill-current" : ""
                                }`}
                            />
                            {isFavorited
                                ? "Challenge Accepted"
                                : "Accept Challenge"}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleShowOnMap}
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
                                                        ? "text-green-500"
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

export default ChallengeDetailPanel;

