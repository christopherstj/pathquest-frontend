"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Trophy, TrendingUp, Mountain } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useMapStore } from "@/providers/MapProvider";
import { useRouter } from "next/navigation";

const DiscoveryDrawer = () => {
    const visiblePeaks = useMapStore((state) => state.visiblePeaks);
    const visibleChallenges = useMapStore((state) => state.visibleChallenges);
    const map = useMapStore((state) => state.map);
    const router = useRouter();

    const handlePeakClick = (id: string, coords?: [number, number]) => {
        router.push(`?peakId=${id}`);
        if (map && coords) {
            map.flyTo({
                center: coords,
                zoom: 14,
                pitch: 60,
                essential: true
            });
        }
    };

    const handleChallengeClick = (id: string) => {
        router.push(`?challengeId=${id}`);
    };

    return (
        <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="fixed top-20 left-3 md:left-5 bottom-6 w-full max-w-[320px] pointer-events-auto flex flex-col gap-3 z-40"
        >
            {/* Main Card */}
            <div className="flex-1 rounded-2xl bg-background/85 backdrop-blur-xl border border-border shadow-xl overflow-hidden flex flex-col">
                <div className="p-5 border-b border-border/60 bg-gradient-to-b from-accent/10 to-transparent">
                    <h1 className="text-2xl font-bold font-display bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-accent">
                        PathQuest
                    </h1>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
                    {/* Featured Challenges */}
                    {visibleChallenges.length > 0 && (
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <Trophy className="w-4 h-4 text-secondary" />
                                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Visible Challenges</h2>
                            </div>
                            <div className="space-y-2.5">
                                {visibleChallenges.map((challenge) => (
                                    <div 
                                        key={challenge.id} 
                                        onClick={() => handleChallengeClick(challenge.id)}
                                        className="group relative overflow-hidden rounded-xl bg-card border border-border/70 p-4 hover:border-primary/50 transition-colors cursor-pointer"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-medium group-hover:text-primary transition-colors">{challenge.name}</h3>
                                                <p className="text-xs text-muted-foreground mt-1">{challenge.num_peaks} Peaks</p>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                        </div>
                                        <div className={cn("absolute bottom-0 left-0 h-0.5 w-full opacity-50 bg-primary")} />
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Trending Peaks */}
                    {visiblePeaks.length > 0 && (
                        <section className="pb-2">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp className="w-4 h-4 text-primary" />
                                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Visible Peaks</h2>
                            </div>
                            <div className="space-y-2.5">
                                {visiblePeaks.map((peak) => (
                                    <div 
                                        key={peak.id} 
                                        onClick={() => handlePeakClick(peak.id, peak.location_coords)}
                                        className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/60 transition-colors cursor-pointer group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                <Mountain className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm group-hover:text-primary-foreground transition-colors">{peak.name}</p>
                                                <p className="text-xs font-mono text-muted-foreground">{peak.elevation ? `${peak.elevation} ft` : ''}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {visibleChallenges.length === 0 && visiblePeaks.length === 0 && (
                        <div className="text-center py-10 text-muted-foreground">
                            <p>No peaks or challenges visible in this area.</p>
                            <p className="text-sm mt-2">Try moving the map or zooming out.</p>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-border/70 bg-muted/60">
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium shadow-sm">
                        Explore Map
                    </Button>
                </div>
            </div>
        </motion.div>
    );
};

export default DiscoveryDrawer;

