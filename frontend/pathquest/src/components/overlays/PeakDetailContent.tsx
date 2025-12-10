"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { X, Mountain, MapPin, CheckCircle, Navigation, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Peak from "@/typeDefs/Peak";
import Summit from "@/typeDefs/Summit";
import Challenge from "@/typeDefs/Challenge";
import Activity from "@/typeDefs/Activity";
import { useMapStore } from "@/providers/MapProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useRequireAuth, { useIsAuthenticated } from "@/hooks/useRequireAuth";

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

    const handleClose = () => {
        router.back();
    };

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
                        onClick={handleClose}
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

                    <h1
                        className="text-2xl md:text-3xl font-bold text-foreground"
                        style={{ fontFamily: "var(--font-display)" }}
                    >
                        {peak.name}
                    </h1>
                    <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">
                            {[peak.county, peak.state, peak.country].filter(Boolean).join(", ")}
                        </span>
                    </div>
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
                                {peak.elevation?.toLocaleString()} ft
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-card border border-border/70 shadow-sm">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                                Summits
                            </p>
                            <p className="text-xl font-mono text-foreground">
                                {peak.public_summits || publicSummits?.length || 0}
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                        {!isAuthenticated && (
                            <Button 
                                onClick={() => requireAuth()}
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
                                            {summit.user_name || "Anonymous"}
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

