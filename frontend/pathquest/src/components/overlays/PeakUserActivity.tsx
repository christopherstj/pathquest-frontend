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
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import Summit from "@/typeDefs/Summit";
import ActivityWithSummits from "@/components/app/activities/ActivityWithSummits";
import { JournalEntryCard } from "@/components/journal";
import { JournalEntry } from "@/typeDefs/JournalEntry";

type PeakUserActivityProps = {
    highlightedActivityId?: string | null;
    onHighlightActivity?: (activityId: string | null) => void;
};

const PeakUserActivity = ({ highlightedActivityId, onHighlightActivity }: PeakUserActivityProps) => {
    const selectedPeakUserData = useMapStore((state) => state.selectedPeakUserData);
    const openManualSummit = useManualSummitStore((state) => state.openManualSummit);
    const queryClient = useQueryClient();

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

    // Create activity map for lookup (use string IDs)
    const activityMap = new Map(activities.map((a) => [String(a.id), a]));

    // Sort all summits by date (most recent first)
    const sortedSummits = [...ascents].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Get activities without summits
    const activitiesWithoutSummits = activities
        .filter((a) => !ascents.some((s) => String(s.activity_id) === String(a.id)))
        .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());

    const handleHighlightActivity = (activityId: string) => {
        if (onHighlightActivity) {
            if (highlightedActivityId === activityId) {
                onHighlightActivity(null);
            } else {
                onHighlightActivity(activityId);
            }
        }
    };

    const handleSummitDeleted = () => {
        // Invalidate queries to refresh the peak user data
        queryClient.invalidateQueries({ queryKey: ["peakUserData", peakId] });
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
            {/* Summary */}
            <div className="flex items-center gap-2 text-muted-foreground pb-3 border-b border-border/60">
                <Mountain className="w-4 h-4" />
                <span className="text-sm">
                    {totalSummits} summit{totalSummits !== 1 ? "s" : ""}
                    {totalActivities > 0 && ` • ${totalActivities} activit${totalActivities !== 1 ? "ies" : "y"}`}
                </span>
            </div>

            {/* Log Summit CTA */}
            <Button
                onClick={handleLogSummit}
                className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
            >
                <Plus className="w-4 h-4" />
                Log Summit
            </Button>

            {/* All Summits - Journal Style */}
            {sortedSummits.length > 0 && (
                <section className="space-y-2">
                    {sortedSummits.map((summit, idx) => {
                        const activity = summit.activity_id 
                            ? activityMap.get(String(summit.activity_id))
                            : undefined;

                        const entry: JournalEntry = {
                            id: summit.id,
                            timestamp: summit.timestamp,
                            timezone: summit.timezone,
                            notes: summit.notes,
                            difficulty: summit.difficulty,
                            experienceRating: summit.experience_rating,
                            conditionTags: summit.condition_tags,
                            customConditionTags: summit.custom_condition_tags,
                            isPublic: summit.is_public,
                            hasReport: Boolean(
                                (summit.notes && summit.notes.trim().length > 0) ||
                                    summit.difficulty ||
                                    summit.experience_rating
                            ),
                            // For peak detail, show a per-peak summit counter (newest = highest)
                            summitNumber: sortedSummits.length - idx,
                            temperature: summit.temperature,
                            weatherCode: summit.weather_code,
                            cloudCover: summit.cloud_cover,
                            windSpeed: summit.wind_speed,
                            peak: {
                                id: peakId,
                                name: peakName,
                            },
                            activity: activity
                                ? {
                                      id: String(activity.id),
                                      title: activity.title ?? "Activity",
                                      sport: activity.sport,
                                      distance: activity.distance,
                                      gain: activity.gain,
                                  }
                                : undefined,
                        };

                        return (
                            <JournalEntryCard
                                key={summit.id}
                                entry={entry}
                                isOwner={true}
                                onDeleted={handleSummitDeleted}
                                titleVariant="activity"
                            />
                        );
                    })}
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
                                isOwner={true}
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
