"use client";

import React from "react";
import { motion } from "framer-motion";
import { Mountain, Users } from "lucide-react";
import { useMapStore } from "@/providers/MapProvider";
import Summit from "@/typeDefs/Summit";
import PublicSummitCard, { PublicSummitCardSummit } from "@/components/summits/PublicSummitCard";

// Extended summit type that includes user info from the API
interface PublicSummit extends Summit {
    user_id?: string;
    user_name?: string;
}

const PeakCommunity = () => {
    const selectedPeakCommunityData = useMapStore((state) => state.selectedPeakCommunityData);

    if (!selectedPeakCommunityData) {
        return (
            <div className="text-center py-10 text-muted-foreground">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium">Select a peak</p>
                <p className="text-xs mt-1">
                    Community summit history will appear here
                </p>
            </div>
        );
    }

    const { publicSummits } = selectedPeakCommunityData;

    // Sort summits by date (most recent first)
    const sortedSummits = [...(publicSummits || [])].sort((a, b) => {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    }) as PublicSummit[];

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
            className="space-y-5"
        >
            {/* Summary */}
            <div className="flex items-center gap-2 text-muted-foreground pb-3 border-b border-border/60">
                <Users className="w-4 h-4" />
                <span className="text-sm">
                    {sortedSummits.length} recorded summit{sortedSummits.length !== 1 ? "s" : ""}
                </span>
            </div>

            {/* Summit List */}
            {sortedSummits.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                    <Mountain className="w-8 h-8 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No public summits recorded yet.</p>
                    <p className="text-xs mt-1">Be the first to summit!</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {sortedSummits.map((summit, idx) => {
                        return (
                            <PublicSummitCard
                                key={summit.id || idx}
                                summit={summit as PublicSummitCardSummit}
                            />
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
};

export default PeakCommunity;

