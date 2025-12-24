"use client";

import React from "react";
import { Mountain, Plus } from "lucide-react";
import SummitWithPeak from "@/typeDefs/SummitWithPeak";
import { JournalEntry } from "@/typeDefs/JournalEntry";
import { Button } from "@/components/ui/button";
import { useManualSummitStore } from "@/providers/ManualSummitProvider";
import { JournalEntryCard } from "@/components/journal";

interface ActivitySummitsListProps {
    summits: SummitWithPeak[];
    activityId: string;
    activityTitle?: string;
    onSummitHover?: (peakId: string | null) => void;
    isOwner?: boolean;
    onSummitDeleted?: () => void;
}

const ActivitySummitsList = ({ summits, activityId, activityTitle, onSummitHover, isOwner = false, onSummitDeleted }: ActivitySummitsListProps) => {
    const openManualSummit = useManualSummitStore((state) => state.openManualSummit);

    if (summits.length === 0) {
        return (
            <div className="text-center py-10">
                <Mountain className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-sm font-medium text-foreground mb-1">
                    No Summits Detected
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                    This activity didn&apos;t pass near any cataloged peaks.
                </p>
                {isOwner && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            openManualSummit({
                                peakId: "",
                                peakName: "",
                                peakCoords: [0, 0],
                                preselectedActivityId: activityId,
                            });
                        }}
                        className="gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add Manual Summit
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Mountain className="w-4 h-4 text-summited" />
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Summits ({summits.length})
                    </h3>
                </div>
            </div>

            <div className="space-y-3">
                {summits.map((summit, idx) => {
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
                        summitNumber: idx + 1,
                        temperature: summit.temperature,
                        weatherCode: summit.weather_code,
                        cloudCover: summit.cloud_cover,
                        windSpeed: summit.wind_speed,
                        peak: {
                            id: summit.peak.id,
                            name: summit.peak.name,
                            elevation: summit.peak.elevation,
                            state: summit.peak.state,
                            country: summit.peak.country,
                        },
                        // Keep activity context for owner-only report editing; hide the link icon in this view.
                        activity: {
                            id: activityId,
                            title: activityTitle ?? "Activity",
                        },
                    };

                    return (
                        <div
                            key={summit.id}
                            onMouseEnter={
                                onSummitHover
                                    ? () => onSummitHover(summit.peak.id)
                                    : undefined
                            }
                            onMouseLeave={
                                onSummitHover ? () => onSummitHover(null) : undefined
                            }
                        >
                            <JournalEntryCard
                                entry={entry}
                                isOwner={isOwner}
                                onDeleted={onSummitDeleted}
                                titleVariant="peak"
                                showActivityLinkIcon={false}
                            />
                        </div>
                    );
                })}
            </div>

            {/* Add Manual Summit Button - only shown for activity owner */}
            {isOwner && (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        openManualSummit({
                            peakId: "",
                            peakName: "",
                            peakCoords: [0, 0],
                            preselectedActivityId: activityId,
                        });
                    }}
                    className="w-full gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Log Another Summit
                </Button>
            )}
        </div>
    );
};

export default ActivitySummitsList;
