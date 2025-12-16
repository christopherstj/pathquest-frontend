"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    Mountain,
    Route,
    Plus,
} from "lucide-react";
import { useMapStore } from "@/providers/MapProvider";
import { useManualSummitStore } from "@/providers/ManualSummitProvider";
import { Button } from "@/components/ui/button";
import Summit from "@/typeDefs/Summit";
import ActivityWithSummits from "@/components/app/activities/ActivityWithSummits";
import OrphanSummitCard from "@/components/app/summits/OrphanSummitCard";

type PeakUserActivityProps = {
    highlightedActivityId?: string | null;
    onHighlightActivity?: (activityId: string | null) => void;
};

const PeakUserActivity = ({ highlightedActivityId, onHighlightActivity }: PeakUserActivityProps) => {
    const selectedPeakUserData = useMapStore((state) => state.selectedPeakUserData);
    const openManualSummit = useManualSummitStore((state) => state.openManualSummit);

    if (!selectedPeakUserData) {
        return (
            <div className="text-center py-10 text-muted-foreground">
                <Mountain className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium">Select a peak</p>
                <p className="text-xs mt-1">
                    Your activity and summit history will appear here
                </p>
            </div>
        );
    }

    const { peakId, peakName, peakCoords, ascents, activities } = selectedPeakUserData;

    const handleLogSummit = () => {
        openManualSummit({
            peakId,
            peakName,
            peakCoords,
        });
    };

    // Debug logging
    console.log("Activities:", activities.map(a => ({ id: a.id, title: a.title })));
    console.log("Ascents:", ascents.map(s => ({ id: s.id, activity_id: s.activity_id })));

    // Group summits by activity_id (convert to string for safe comparison)
    const summitsByActivity = new Map<string, Summit[]>();
    const orphanSummits: Summit[] = [];

    ascents.forEach((summit) => {
        if (summit.activity_id) {
            const activityIdStr = String(summit.activity_id);
            const existing = summitsByActivity.get(activityIdStr) || [];
            summitsByActivity.set(activityIdStr, [...existing, summit]);
        } else {
            orphanSummits.push(summit);
        }
    });

    console.log("SummitsByActivity keys:", Array.from(summitsByActivity.keys()));

    // Create activity map for lookup (use string IDs)
    const activityMap = new Map(activities.map((a) => [String(a.id), a]));

    // Get activities that have summits, sorted by date (most recent first)
    const activitiesWithSummits = activities
        .filter((a) => summitsByActivity.has(String(a.id)))
        .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());

    console.log("Activities with summits:", activitiesWithSummits.map(a => a.id));

    // Get activities without summits
    const activitiesWithoutSummits = activities
        .filter((a) => !summitsByActivity.has(String(a.id)))
        .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());

    // Sort orphan summits by date
    const sortedOrphanSummits = orphanSummits.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    const handleHighlightActivity = (activityId: string) => {
        if (onHighlightActivity) {
            if (highlightedActivityId === activityId) {
                onHighlightActivity(null);
            } else {
                onHighlightActivity(activityId);
            }
        }
    };

    const totalSummits = ascents.length;
    const totalActivities = activities.length;

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
            className="space-y-5"
        >
            {/* Header */}
            <div className="pb-3 border-b border-border/60">
                <div className="flex items-center gap-2 text-primary mb-1">
                    <Mountain className="w-4 h-4" />
                    <span className="text-xs font-mono uppercase tracking-wider">
                        My Activity
                    </span>
                </div>
                <h2
                    className="text-lg font-bold text-foreground"
                    style={{ fontFamily: "var(--font-display)" }}
                >
                    {peakName}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    {totalSummits} summit{totalSummits !== 1 ? "s" : ""}
                    {totalActivities > 0 && ` • ${totalActivities} activit${totalActivities !== 1 ? "ies" : "y"}`}
                </p>
            </div>

            {/* Log Summit CTA */}
            <Button
                onClick={handleLogSummit}
                className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
            >
                <Plus className="w-4 h-4" />
                Log Summit
            </Button>

            {/* Activities with Summits */}
            {activitiesWithSummits.length > 0 && (
                <section className="space-y-3">
                    {activitiesWithSummits.map((activity) => (
                        <ActivityWithSummits
                            key={activity.id}
                            activity={activity}
                            summits={summitsByActivity.get(String(activity.id)) || []}
                            isHighlighted={highlightedActivityId === activity.id}
                            onHighlight={handleHighlightActivity}
                            peakId={peakId}
                            peakName={peakName}
                        />
                    ))}
                </section>
            )}

            {/* Orphan Summits (without activity) */}
            {sortedOrphanSummits.length > 0 && (
                <section>
                    <div className="flex items-center gap-2 mb-3">
                        <Mountain className="w-4 h-4 text-green-500" />
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                            Manual Summits
                        </h3>
                    </div>
                    <div className="space-y-3">
                        {sortedOrphanSummits.map((summit) => (
                            <OrphanSummitCard key={summit.id} summit={summit} peakId={peakId} peakName={peakName} />
                        ))}
                    </div>
                </section>
            )}

            {/* Activities without summits */}
            {activitiesWithoutSummits.length > 0 && (
                <section>
                    <div className="flex items-center gap-2 mb-3">
                        <Route className="w-4 h-4 text-primary" />
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                            Other Activities
                        </h3>
                    </div>
                    <div className="space-y-3">
                        {activitiesWithoutSummits.map((activity) => (
                            <ActivityWithSummits
                                key={activity.id}
                                activity={activity}
                                summits={[]}
                                isHighlighted={highlightedActivityId === activity.id}
                                onHighlight={handleHighlightActivity}
                                peakId={peakId}
                                peakName={peakName}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Empty State */}
            {totalSummits === 0 && totalActivities === 0 && (
                <div className="p-6 rounded-lg bg-card/50 border border-border/50 text-center">
                    <Mountain className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                        No activity recorded
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Your summit and activity history will appear here
                    </p>
                </div>
            )}
        </motion.div>
    );
};

export default PeakUserActivity;
