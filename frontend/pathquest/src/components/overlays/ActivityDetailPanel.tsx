/**
 * @deprecated This component is deprecated as of Phase 5B.
 * Desktop now uses DesktopNavLayout which renders ExploreTabContent for all detail views.
 * Activity details are now handled by ActivityDetailsMobile inside ExploreTabContent.
 * This file is kept for reference but is no longer imported anywhere.
 * Safe to delete after verifying the new desktop layout is working properly.
 */
"use client";

import React, { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
    Route,
    Navigation,
    ExternalLink,
    Share2,
    BarChart3,
    FileText,
    Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import getActivityDetails from "@/actions/activities/getActivityDetails";
import metersToFt from "@/helpers/metersToFt";
import DetailPanelHeader from "@/components/ui/detail-panel-header";
import StatsGrid from "@/components/ui/stats-grid";
import StatCard from "@/components/ui/stat-card";
import DetailLoadingState from "@/components/ui/detail-loading-state";
import { useActivityMapEffects } from "@/hooks/use-activity-map-effects";
import { cn } from "@/lib/utils";
import ActivityElevationProfile from "@/components/app/activities/ActivityElevationProfile";
import ActivityAnalytics from "@/components/app/activities/ActivityAnalytics";
import { convertSummitsToPeaks } from "@/helpers/convertSummitsToPeaks";

type TabMode = "details" | "analytics";

interface Props {
    activityId: string;
    onClose: () => void;
}

// Convert meters to miles
const metersToMiles = (meters: number): number => {
    return meters / 1609.344;
};

// Format duration from seconds
const formatDuration = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
};

// Extract IANA timezone from format like "(GMT-07:00) America/Boise"
const extractIanaTimezone = (timezone?: string): string | undefined => {
    if (!timezone) return undefined;
    return timezone.split(" ").slice(-1)[0];
};

const formatDate = (timestamp: string, timezone?: string) => {
    const date = new Date(timestamp);
    const ianaTimezone = extractIanaTimezone(timezone);
    return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: ianaTimezone,
    });
};

const formatTime = (timestamp: string, timezone?: string) => {
    const date = new Date(timestamp);
    const ianaTimezone = extractIanaTimezone(timezone);
    return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        timeZone: ianaTimezone,
    });
};

const ActivityDetailPanel = ({ activityId, onClose }: Props) => {
    const [activeTab, setActiveTab] = useState<TabMode>("details");
    const [hoverCoords, setHoverCoords] = useState<[number, number] | null>(null);
    const [copied, setCopied] = useState(false);

    const { data, isLoading, error } = useQuery({
        queryKey: ["activityDetails", activityId],
        queryFn: async () => {
            const res = await getActivityDetails(activityId);
            return res;
        },
    });

    const activity = data?.activity ?? null;
    const summits = data?.summits ?? [];
    
    // Convert summits to peaks for map effects and elevation profile
    const peakSummits = useMemo(() => convertSummitsToPeaks(summits), [summits]);

    // Use map effects hook
    const { flyToActivity } = useActivityMapEffects({
        activity,
        peakSummits,
        hoverCoords,
        flyToOnLoad: true,
    });

    // Calculate duration from time_stream
    const duration = activity?.time_stream && activity.time_stream.length > 0
        ? activity.time_stream[activity.time_stream.length - 1]
        : null;

    const handleViewOnStrava = () => {
        window.open(`https://www.strava.com/activities/${activityId}`, "_blank");
    };

    const handleShare = useCallback(async () => {
        const url = `${window.location.origin}/activities/${activityId}`;
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy URL:", err);
        }
    }, [activityId]);

    const handleTabChange = (tab: TabMode) => {
        setActiveTab(tab);
    };

    if (isLoading) {
        return <DetailLoadingState color="primary" />;
    }

    if (error || !activity) {
        return (
            <motion.div 
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 100, opacity: 0 }}
                className="fixed top-20 right-3 md:right-5 bottom-6 w-[calc(100%-1.5rem)] md:w-[400px] max-w-[400px] pointer-events-auto z-40 flex flex-col gap-3"
            >
                <div className="flex-1 rounded-2xl bg-background/85 backdrop-blur-xl border border-border shadow-xl overflow-hidden flex flex-col items-center justify-center p-6">
                    <Route className="w-12 h-12 text-muted-foreground mb-4" />
                    <h2 className="text-lg font-semibold text-foreground mb-2">Activity Not Found</h2>
                    <p className="text-sm text-muted-foreground text-center mb-4">
                        This activity may be private or doesn&apos;t exist.
                    </p>
                    <Button variant="outline" onClick={onClose}>
                        Go Back
                    </Button>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div 
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            className="fixed top-20 right-3 md:right-5 bottom-6 w-[calc(100%-1.5rem)] md:w-[400px] max-w-[400px] pointer-events-auto z-40 flex flex-col gap-3"
        >
            <div className="flex-1 rounded-2xl bg-background/85 backdrop-blur-xl border border-border shadow-xl overflow-hidden flex flex-col">
                {/* Header */}
                <DetailPanelHeader
                    badge={{ icon: Route, label: "Activity" }}
                    title={activity.title || "Untitled Activity"}
                    subtitle={formatDate(activity.start_time, activity.timezone)}
                    onClose={onClose}
                    gradientColorClass="from-primary/10"
                />

                {/* Tab Bar */}
                <div className="px-4 py-2 border-b border-border/60 shrink-0">
                    <div className="flex gap-0.5 bg-muted/50 p-0.5 rounded-lg">
                        <button
                            onClick={() => handleTabChange("details")}
                            className={cn(
                                "flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all flex-1",
                                activeTab === "details"
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <FileText className="w-3.5 h-3.5" />
                            Details
                        </button>
                        <button
                            onClick={() => handleTabChange("analytics")}
                            className={cn(
                                "flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all flex-1",
                                activeTab === "analytics"
                                    ? "bg-background text-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <BarChart3 className="w-3.5 h-3.5" />
                            Analytics
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
                    {activeTab === "details" && (
                        <>
                            {/* Stats Grid */}
                            <StatsGrid>
                                <StatCard
                                    label="Distance"
                                    value={`${metersToMiles(activity.distance).toFixed(1)} mi`}
                                />
                                <StatCard
                                    label="Elevation Gain"
                                    value={activity.gain ? `${Math.round(metersToFt(activity.gain)).toLocaleString()} ft` : "—"}
                                />
                                <StatCard
                                    label="Duration"
                                    value={duration ? formatDuration(duration) : "—"}
                                />
                                <StatCard
                                    label="Start Time"
                                    value={formatTime(activity.start_time, activity.timezone)}
                                />
                            </StatsGrid>

                            {/* Sport Type Badge */}
                            {activity.sport && (
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary">
                                        {activity.sport}
                                    </span>
                                </div>
                            )}

                            {/* Elevation Profile */}
                            {activity.vert_profile && activity.vert_profile.length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        Elevation Profile
                                    </h3>
                                    <ActivityElevationProfile
                                        activity={activity}
                                        peakSummits={peakSummits}
                                        onHover={setHoverCoords}
                                    />
                                </div>
                            )}

                            {/* Actions */}
                            <div className="space-y-2">
                                <Button
                                    variant="outline"
                                    onClick={handleViewOnStrava}
                                    className="w-full gap-2 border-orange-500/30 text-orange-600 hover:bg-orange-500/10 hover:text-orange-600"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    View on Strava
                                </Button>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={flyToActivity}
                                        className="flex-1 gap-2 border-primary/20 hover:bg-primary/10 hover:text-primary"
                                    >
                                        <Navigation className="w-4 h-4" />
                                        Show on Map
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handleShare}
                                        className="flex-1 gap-2 border-primary/20 hover:bg-primary/10 hover:text-primary"
                                    >
                                        {copied ? (
                                            <>
                                                <Check className="w-4 h-4 text-summited" />
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <Share2 className="w-4 h-4" />
                                                Share
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === "analytics" && (
                        <ActivityAnalytics activity={activity} />
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default ActivityDetailPanel;

