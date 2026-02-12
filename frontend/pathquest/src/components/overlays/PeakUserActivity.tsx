"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
    Mountain,
    Route,
    Plus,
    LayoutList,
    Layers,
    FileText,
    Calendar,
    ChevronRight,
} from "lucide-react";
import Link from "next/link";
import dayjs from "@/helpers/dayjs";
import { useMapStore } from "@/providers/MapProvider";
import { useManualSummitStore } from "@/providers/ManualSummitProvider";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Summit from "@/typeDefs/Summit";
import ActivityWithSummits from "@/components/app/activities/ActivityWithSummits";
import { JournalEntryCard } from "@/components/journal";
import { JournalEntry } from "@/typeDefs/JournalEntry";

type ViewMode = "summit" | "activity";

type PeakUserActivityProps = {
    highlightedActivityId?: string | null;
    onHighlightActivity?: (activityId: string | null) => void;
};

const PeakUserActivity = ({ highlightedActivityId, onHighlightActivity }: PeakUserActivityProps) => {
    const selectedPeakUserData = useMapStore((state) => state.selectedPeakUserData);
    const openManualSummit = useManualSummitStore((state) => state.openManualSummit);
    const queryClient = useQueryClient();
    const [viewMode, setViewMode] = useState<ViewMode>("summit");

    // Group ascents by activity for activity view
    const groupedByActivity = useMemo(() => {
        if (!selectedPeakUserData) return [];
        
        const groups: Map<string | null, Summit[]> = new Map();
        
        selectedPeakUserData.ascents.forEach((ascent) => {
            const activityId = ascent.activity_id ? String(ascent.activity_id) : null;
            if (!groups.has(activityId)) {
                groups.set(activityId, []);
            }
            groups.get(activityId)!.push(ascent);
        });
        
        // Convert to array and sort by most recent summit in each group
        return Array.from(groups.entries())
            .map(([activityId, summits]) => ({
                activityId,
                summits: summits.sort((a, b) => 
                    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                ),
                mostRecentTimestamp: summits.reduce((latest, s) => {
                    const ts = new Date(s.timestamp).getTime();
                    return ts > latest ? ts : latest;
                }, 0),
            }))
            .sort((a, b) => b.mostRecentTimestamp - a.mostRecentTimestamp);
    }, [selectedPeakUserData]);

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
            {/* Summary with view toggle */}
            <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Mountain className="w-4 h-4" />
                    <span className="text-sm">
                        {totalSummits} summit{totalSummits !== 1 ? "s" : ""}
                    </span>
                </div>
                
                {/* View mode toggle */}
                {totalSummits > 0 && (
                    <div className="flex rounded-md border border-border overflow-hidden">
                        <button
                            onClick={() => setViewMode("summit")}
                            className={cn(
                                "flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium transition-colors",
                                viewMode === "summit"
                                    ? "bg-summited/15 text-summited"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <LayoutList className="w-3.5 h-3.5" />
                            Summits
                        </button>
                        <button
                            onClick={() => setViewMode("activity")}
                            className={cn(
                                "flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium transition-colors border-l border-border",
                                viewMode === "activity"
                                    ? "bg-summited/15 text-summited"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Layers className="w-3.5 h-3.5" />
                            Activities
                        </button>
                    </div>
                )}
            </div>

            {/* Log Summit CTA */}
            <Button
                onClick={handleLogSummit}
                className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
            >
                <Plus className="w-4 h-4" />
                Log Summit
            </Button>

            {/* Summit View - Individual summit cards */}
            {viewMode === "summit" && sortedSummits.length > 0 && (
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

            {/* Activity View - Grouped by activity */}
            {viewMode === "activity" && groupedByActivity.length > 0 && (
                <section className="space-y-3">
                    {groupedByActivity.map((group) => {
                        const isManual = group.activityId === null;
                        const activity = group.activityId 
                            ? activityMap.get(group.activityId) 
                            : undefined;
                        const firstSummit = group.summits[0];
                        
                        const formattedDate = (() => {
                            try {
                                return dayjs(firstSummit.timestamp).format("MMM D, YYYY");
                            } catch {
                                return "";
                            }
                        })();

                        return (
                            <div 
                                key={group.activityId ?? "manual"} 
                                className="rounded-lg border border-border bg-card overflow-hidden"
                            >
                                {/* Activity header */}
                                {isManual ? (
                                    <div className="p-3 border-b border-border bg-muted/30">
                                        <div className="flex items-center gap-2">
                                            <Plus className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-sm font-medium text-foreground">Manual Summits</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {group.summits.length} summit{group.summits.length !== 1 ? "s" : ""}
                                        </p>
                                    </div>
                                ) : (
                                    <Link
                                        href={`/activities/${group.activityId}`}
                                        className="block p-3 border-b border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                                    <span className="text-sm font-medium text-foreground">
                                                        {formattedDate}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    {group.summits.length} summit{group.summits.length !== 1 ? "s" : ""} · Tap to view activity
                                                </p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                    </Link>
                                )}
                                
                                {/* Summits in this group */}
                                <div className="divide-y divide-border">
                                    {group.summits.map((summit) => {
                                        const hasReport = !!(summit.notes || summit.difficulty || summit.experience_rating || (summit.condition_tags && summit.condition_tags.length > 0));
                                        
                                        return (
                                            <div key={summit.id} className="p-3 flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-md bg-summited/15 flex items-center justify-center flex-shrink-0">
                                                    <Mountain className="w-4 h-4 text-summited" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-foreground truncate">
                                                        {peakName}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {hasReport ? "Has trip report" : "No report yet"}
                                                    </p>
                                                </div>
                                                {hasReport ? (
                                                    <FileText className="w-4 h-4 text-summited flex-shrink-0" />
                                                ) : (
                                                    <Plus className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </section>
            )}

            {/* Activities without summits (only show in summit view) */}
            {viewMode === "summit" && activitiesWithoutSummits.length > 0 && (
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
