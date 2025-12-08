"use client";

import React from "react";
import { motion } from "framer-motion";
import { X, Mountain, MapPin, Calendar, CheckCircle, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import Peak from "@/typeDefs/Peak";
import { useQuery } from "@tanstack/react-query";
import getPeakDetails from "@/actions/peaks/getPeakDetails";
import { useMapStore } from "@/providers/MapProvider";

interface Props {
    peakId: string;
    onClose: () => void;
}

const PeakDetailPanel = ({ peakId, onClose }: Props) => {
    const map = useMapStore(state => state.map);

    const { data: peak, isLoading } = useQuery({
        queryKey: ["peak", peakId],
        queryFn: async () => {
            const res = await getPeakDetails(peakId);
            return res;
        }
    });

    const flyToPeak = () => {
        if (peak && peak.location_coords && map) {
            map.flyTo({
                center: peak.location_coords,
                zoom: 14,
                pitch: 60,
                bearing: 30,
                essential: true
            });
        }
    };

    if (isLoading) {
        return (
            <motion.div 
                initial={{ x: 400, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 400, opacity: 0 }}
                className="fixed top-20 right-3 md:right-5 bottom-6 w-full max-w-[340px] pointer-events-auto z-40"
            >
                <div className="w-full h-full rounded-2xl bg-background/85 backdrop-blur-xl border border-border shadow-xl p-6 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </motion.div>
        );
    }

    if (!peak) return null;

    return (
        <motion.div 
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className="fixed top-20 right-3 md:right-5 bottom-6 w-full max-w-[340px] pointer-events-auto z-40 flex flex-col gap-3"
        >
            <div className="flex-1 rounded-2xl bg-background/85 backdrop-blur-xl border border-border shadow-xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-5 border-b border-border/60 bg-gradient-to-b from-accent/10 to-transparent relative">
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
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
                    <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{peak.county}, {peak.state}</span>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 rounded-xl bg-card border border-border/70 shadow-sm">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Elevation</p>
                            <p className="text-xl font-mono text-foreground">{peak.elevation?.toLocaleString()} ft</p>
                        </div>
                        <div className="p-4 rounded-xl bg-card border border-border/70 shadow-sm">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Summits</p>
                            <p className="text-xl font-mono text-foreground">{peak.summits || 0}</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Log Summit
                        </Button>
                        <Button variant="outline" onClick={flyToPeak} className="w-full gap-2 border-primary/20 hover:bg-primary/10 hover:text-primary">
                            <Navigation className="w-4 h-4" />
                            Fly to Peak
                        </Button>
                    </div>

                    {/* Description or extra data */}
                    <div className="text-sm text-muted-foreground leading-relaxed">
                        Part of the local landscape. Track your ascents and compete with others on the leaderboard.
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default PeakDetailPanel;

