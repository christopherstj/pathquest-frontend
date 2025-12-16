"use client";

import React from "react";
import {
    Mountain,
    Calendar,
    Route,
    ExternalLink,
    TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Activity from "@/typeDefs/Activity";
import Summit from "@/typeDefs/Summit";
import SummitWithPeak from "@/typeDefs/SummitWithPeak";
import metersToFt from "@/helpers/metersToFt";
import SummitItem from "@/components/app/summits/SummitItem";
import { extractIanaTimezone } from "@/components/app/summits/SummitItem";

// Convert meters to miles
const metersToMiles = (meters: number): number => {
    return meters / 1609.344;
};

const formatDate = (timestamp: string, timezone?: string) => {
    const date = new Date(timestamp);
    const ianaTimezone = extractIanaTimezone(timezone);
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: ianaTimezone,
    });
};

export type ActivityWithSummitsProps = {
    activity: Activity;
    summits: Summit[];
    summitsWithPeak?: SummitWithPeak[];
    isHighlighted?: boolean;
    onHighlight?: (activityId: string) => void;
    peakId?: string;
    peakName?: string;
    showPeakHeaders?: boolean;
    isOwner?: boolean;
    onSummitDeleted?: () => void;
};

const ActivityWithSummits = ({
    activity,
    summits,
    summitsWithPeak,
    isHighlighted,
    onHighlight,
    peakId,
    peakName,
    showPeakHeaders = false,
    isOwner = false,
    onSummitDeleted,
}: ActivityWithSummitsProps) => {
    const handleHighlight = () => {
        if (onHighlight) {
            onHighlight(activity.id);
        }
    };

    const handleViewOnStrava = (e: React.MouseEvent) => {
        e.stopPropagation();
        window.open(`https://www.strava.com/activities/${activity.id}`, "_blank");
    };

    const summitCount = summitsWithPeak?.length ?? summits.length;

    return (
        <div
            className={`rounded-xl overflow-hidden border transition-colors ${
                isHighlighted
                    ? "border-primary/50 bg-primary/5"
                    : "border-border/70 bg-card"
            }`}
        >
            {/* Activity Header */}
            <Link
                href={`/activities/${activity.id}`}
                onClick={handleHighlight}
                className="block w-full p-4 text-left hover:bg-muted/30 transition-colors"
                aria-label={`View activity: ${activity.title || "Activity"}`}
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                                isHighlighted ? "bg-primary/20" : "bg-primary/10"
                            }`}
                        >
                            <Route
                                className={`w-5 h-5 ${
                                    isHighlighted ? "text-primary" : "text-primary/70"
                                }`}
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">
                                {activity.title || "Activity"}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                <Calendar className="w-3 h-3" />
                                <span>{formatDate(activity.start_time)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Activity Stats */}
                <div className="flex items-center gap-4 mt-3 text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Route className="w-3.5 h-3.5" />
                        <span className="font-mono">
                            {metersToMiles(activity.distance).toFixed(1)} mi
                        </span>
                    </div>
                    {activity.gain && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span className="font-mono">
                                {Math.round(metersToFt(activity.gain)).toLocaleString()} ft
                            </span>
                        </div>
                    )}
                </div>
            </Link>

            {/* View on Strava Button */}
            <div className="px-4 pb-3">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleViewOnStrava}
                    className="w-full h-8 gap-2 text-xs border-orange-500/30 text-orange-600 hover:bg-orange-500/10 hover:text-orange-600"
                >
                    <ExternalLink className="w-3 h-3" />
                    View on Strava
                </Button>
            </div>

            {/* Nested Summits */}
            {summitCount > 0 && (
                <div className="px-4 pb-4 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                        <Mountain className="w-3 h-3 text-green-500" />
                        <span>
                            {summitCount} summit{summitCount !== 1 ? "s" : ""} on this activity
                        </span>
                    </div>
                    {summitsWithPeak
                        ? summitsWithPeak.map((summit) => (
                              <SummitItem
                                  key={summit.id}
                                  summit={summit}
                                  showPeakHeader={showPeakHeaders}
                                  isOwner={isOwner}
                                  onDeleted={onSummitDeleted}
                              />
                          ))
                        : summits.map((summit) => (
                              <SummitItem
                                  key={summit.id}
                                  summit={summit}
                                  peakId={peakId}
                                  peakName={peakName}
                                  isOwner={isOwner}
                                  onDeleted={onSummitDeleted}
                              />
                          ))}
                </div>
            )}
        </div>
    );
};

export default ActivityWithSummits;

