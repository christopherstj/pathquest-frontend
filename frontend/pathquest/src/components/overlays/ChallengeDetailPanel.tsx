"use client";

import React from "react";
import { motion } from "framer-motion";
import { X, Trophy, Map as MapIcon, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import getChallengeDetails from "@/actions/challenges/getChallengeDetails";
import { useMapStore } from "@/providers/MapProvider";
import Challenge from "@/typeDefs/Challenge";
import mapboxgl from "mapbox-gl";

interface Props {
    challengeId: number;
    onClose: () => void;
}

const ChallengeDetailPanel = ({ challengeId, onClose }: Props) => {
    const map = useMapStore(state => state.map);

    const { data: challenge, isLoading } = useQuery({
        queryKey: ["challenge", challengeId],
        queryFn: async () => {
            // Need to convert string/number types if mismatch
            const res = await getChallengeDetails(challengeId);
            return res;
        }
    });

    const showOnMap = () => {
        // Logic to fit bounds of challenge peaks would go here
        // For now just fly to a central point if available or just close panel
        onClose();
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
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
                </div>
            </motion.div>
        );
    }

    if (!challenge) return null;

    return (
        <motion.div 
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className="fixed top-20 right-3 md:right-5 bottom-6 w-full max-w-[340px] pointer-events-auto z-40 flex flex-col gap-3"
        >
            <div className="flex-1 rounded-2xl bg-background/85 backdrop-blur-xl border border-border shadow-xl overflow-hidden flex flex-col">
                <div className="p-5 border-b border-border/60 bg-gradient-to-b from-accent/10 to-transparent relative">
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
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
                    <div className="mt-2 flex items-center gap-4">
                        <div className="bg-secondary/10 text-secondary px-2 py-1 rounded text-xs font-mono border border-secondary/30">
                            {challenge.num_peaks} Peaks
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    <div className="prose prose-invert prose-sm">
                        <p>{challenge.description}</p>
                    </div>

                    <div className="flex flex-col gap-3">
                         <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 gap-2">
                            <PlayCircle className="w-4 h-4" />
                            Start Challenge
                        </Button>
                         <Button variant="outline" onClick={showOnMap} className="w-full gap-2 border-secondary/20 hover:bg-secondary/10 hover:text-secondary">
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

