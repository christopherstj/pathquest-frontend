"use client";

import React, { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { X, Trophy, Map as MapIcon, PlayCircle, Mountain, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Challenge from "@/typeDefs/Challenge";
import Peak from "@/typeDefs/Peak";
import Activity from "@/typeDefs/Activity";
import { useMapStore } from "@/providers/MapProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import mapboxgl from "mapbox-gl";

interface Props {
    challenge: Challenge;
    peaks?: Peak[];
    activityCoords?: {
        id: string;
        coords: Activity["coords"];
    }[];
}

const ChallengeDetailContent = ({ challenge, peaks, activityCoords }: Props) => {
    const map = useMapStore((state) => state.map);
    const router = useRouter();

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

    // Fit map to challenge bounds on mount
    useEffect(() => {
        if (bounds && map) {
            map.fitBounds(bounds, {
                padding: { top: 100, bottom: 100, left: 50, right: 400 },
                maxZoom: 12,
            });
        } else if (challenge.location_coords && map) {
            map.flyTo({
                center: challenge.location_coords,
                zoom: 10,
                essential: true,
            });
        }
    }, [bounds, challenge.location_coords, map]);

    const handleClose = () => {
        router.back();
    };

    const handleShowOnMap = () => {
        if (bounds && map) {
            map.fitBounds(bounds, {
                padding: { top: 100, bottom: 100, left: 50, right: 400 },
                maxZoom: 12,
            });
        }
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
                <div className="p-5 border-b border-border/60 bg-gradient-to-b from-secondary/10 to-transparent relative">
                    <button
                        onClick={handleClose}
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

                    <h1
                        className="text-2xl md:text-3xl font-bold text-foreground"
                        style={{ fontFamily: "var(--font-display)" }}
                    >
                        {challenge.name}
                    </h1>
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
                            <p className="text-xl font-mono text-foreground">{totalPeaks}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-card border border-border/70 shadow-sm">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                                Summitted
                            </p>
                            <p className="text-xl font-mono text-foreground">
                                {summittedPeaks}
                                <span className="text-sm text-muted-foreground ml-1">
                                    ({progressPercent}%)
                                </span>
                            </p>
                        </div>
                    </div>

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
                        <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 gap-2">
                            <PlayCircle className="w-4 h-4" />
                            Start Challenge
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
                                {peaks.map((peak) => (
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
                                                    {peak.elevation?.toLocaleString()} ft
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

