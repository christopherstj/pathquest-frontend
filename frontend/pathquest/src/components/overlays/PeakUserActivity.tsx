"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    Mountain,
    Calendar,
    Cloud,
    Thermometer,
    Wind,
    Droplets,
    FileText,
    PenLine,
    Route,
    Clock,
    ExternalLink,
    TrendingUp,
} from "lucide-react";
import { useMapStore } from "@/providers/MapProvider";
import { Button } from "@/components/ui/button";
import Activity from "@/typeDefs/Activity";
import Summit from "@/typeDefs/Summit";

// Weather code to description mapping (WMO codes)
const getWeatherDescription = (code: number | undefined): string => {
    if (code === undefined) return "";
    const descriptions: Record<number, string> = {
        0: "Clear sky",
        1: "Mainly clear",
        2: "Partly cloudy",
        3: "Overcast",
        45: "Foggy",
        48: "Depositing rime fog",
        51: "Light drizzle",
        53: "Moderate drizzle",
        55: "Dense drizzle",
        61: "Slight rain",
        63: "Moderate rain",
        65: "Heavy rain",
        71: "Slight snow",
        73: "Moderate snow",
        75: "Heavy snow",
        77: "Snow grains",
        80: "Slight rain showers",
        81: "Moderate rain showers",
        82: "Violent rain showers",
        85: "Slight snow showers",
        86: "Heavy snow showers",
        95: "Thunderstorm",
        96: "Thunderstorm with slight hail",
        99: "Thunderstorm with heavy hail",
    };
    return descriptions[code] || "Unknown";
};

// Convert Celsius to Fahrenheit
const celsiusToFahrenheit = (celsius: number): number => {
    return (celsius * 9) / 5 + 32;
};

// Convert km/h to mph
const kmhToMph = (kmh: number): number => {
    return kmh * 0.621371;
};

// Convert meters to miles
const metersToMiles = (meters: number): number => {
    return meters / 1609.344;
};

const formatDate = (timestamp: string, timezone?: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: timezone || undefined,
    });
};

const formatTime = (timestamp: string, timezone?: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        timeZone: timezone || undefined,
    });
};

// Inline Summit Item (used inside activity cards)
type SummitItemProps = {
    summit: Summit;
};

const SummitItem = ({ summit }: SummitItemProps) => {
    const hasNotes = Boolean(summit.notes && summit.notes.trim().length > 0);
    const hasWeather =
        summit.temperature !== undefined ||
        summit.weather_code !== undefined ||
        summit.wind_speed !== undefined;

    const handleAddTripReport = () => {
        // Dummy CTA for now - will be implemented later
        console.log("Add trip report for summit:", summit.id);
    };

    return (
        <div className="p-3 rounded-lg bg-background/60 border border-border/50">
            {/* Summit Time */}
            <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Mountain className="w-3 h-3 text-green-500" />
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>Summit at {formatTime(summit.timestamp, summit.timezone)}</span>
                </div>
            </div>

            {/* Weather Conditions */}
            {hasWeather && (
                <div className="mb-2 flex flex-wrap gap-3 text-xs">
                    {summit.temperature !== undefined && (
                        <div className="flex items-center gap-1">
                            <Thermometer className="w-3 h-3 text-orange-400" />
                            <span className="text-foreground">
                                {Math.round(celsiusToFahrenheit(summit.temperature))}°F
                            </span>
                        </div>
                    )}
                    {summit.weather_code !== undefined && (
                        <div className="flex items-center gap-1">
                            <Cloud className="w-3 h-3 text-blue-400" />
                            <span className="text-foreground">
                                {getWeatherDescription(summit.weather_code)}
                            </span>
                        </div>
                    )}
                    {summit.wind_speed !== undefined && (
                        <div className="flex items-center gap-1">
                            <Wind className="w-3 h-3 text-cyan-400" />
                            <span className="text-foreground">
                                {Math.round(kmhToMph(summit.wind_speed))} mph
                            </span>
                        </div>
                    )}
                    {summit.humidity !== undefined && (
                        <div className="flex items-center gap-1">
                            <Droplets className="w-3 h-3 text-blue-300" />
                            <span className="text-foreground">
                                {Math.round(summit.humidity)}%
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Trip Notes or Add Trip Report CTA */}
            {hasNotes ? (
                <div className="p-2.5 rounded-md bg-primary/5 border border-primary/20">
                    <div className="flex items-center gap-1.5 text-xs text-primary mb-1">
                        <FileText className="w-3 h-3" />
                        <span className="font-medium">Trip Notes</span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">
                        {summit.notes}
                    </p>
                </div>
            ) : (
                <Button
                    size="sm"
                    onClick={handleAddTripReport}
                    className="w-full h-9 gap-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 shadow-sm text-xs font-medium"
                >
                    <PenLine className="w-3.5 h-3.5" />
                    Add Trip Report
                </Button>
            )}
        </div>
    );
};

// Activity Card with nested summits
type ActivityWithSummitsProps = {
    activity: Activity;
    summits: Summit[];
    isHighlighted?: boolean;
    onHighlight?: (activityId: string) => void;
};

const ActivityWithSummits = ({ activity, summits, isHighlighted, onHighlight }: ActivityWithSummitsProps) => {
    const handleHighlight = () => {
        if (onHighlight) {
            onHighlight(activity.id);
        }
    };

    const handleViewOnStrava = (e: React.MouseEvent) => {
        e.stopPropagation();
        // Activity IDs from Strava are typically the Strava activity ID
        window.open(`https://www.strava.com/activities/${activity.id}`, "_blank");
    };

    return (
        <div 
            className={`rounded-xl overflow-hidden border transition-colors ${
                isHighlighted
                    ? "border-primary/50 bg-primary/5"
                    : "border-border/70 bg-card"
            }`}
        >
            {/* Activity Header */}
            <button
                onClick={handleHighlight}
                className="w-full p-4 text-left hover:bg-muted/30 transition-colors"
                aria-label={`View activity: ${activity.title || "Activity"}`}
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && handleHighlight()}
            >
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                            isHighlighted ? "bg-primary/20" : "bg-primary/10"
                        }`}>
                            <Route className={`w-5 h-5 ${isHighlighted ? "text-primary" : "text-primary/70"}`} />
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
                        <span className="font-mono">{metersToMiles(activity.distance).toFixed(1)} mi</span>
                    </div>
                    {activity.gain && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span className="font-mono">{activity.gain.toLocaleString()} ft</span>
                        </div>
                    )}
                </div>
            </button>

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
            {summits.length > 0 && (
                <div className="px-4 pb-4 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                        <Mountain className="w-3 h-3 text-green-500" />
                        <span>{summits.length} summit{summits.length !== 1 ? "s" : ""} on this activity</span>
                    </div>
                    {summits.map((summit) => (
                        <SummitItem key={summit.id} summit={summit} />
                    ))}
                </div>
            )}
        </div>
    );
};

// Orphan Summit Card (summits without an activity)
type OrphanSummitCardProps = {
    summit: Summit;
};

const OrphanSummitCard = ({ summit }: OrphanSummitCardProps) => {
    const hasNotes = Boolean(summit.notes && summit.notes.trim().length > 0);
    const hasWeather =
        summit.temperature !== undefined ||
        summit.weather_code !== undefined ||
        summit.wind_speed !== undefined;

    const handleAddTripReport = () => {
        console.log("Add trip report for summit:", summit.id);
    };

    return (
        <div className="p-4 rounded-xl bg-card border border-border/70">
            {/* Date Header */}
            <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Mountain className="w-4 h-4 text-green-500" />
                </div>
                <div>
                    <div className="flex items-center gap-1 text-sm font-medium text-foreground">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>{formatDate(summit.timestamp, summit.timezone)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{formatTime(summit.timestamp, summit.timezone)}</span>
                    </div>
                </div>
            </div>

            {/* Weather */}
            {hasWeather && (
                <div className="mb-3 flex flex-wrap gap-3 text-xs">
                    {summit.temperature !== undefined && (
                        <div className="flex items-center gap-1">
                            <Thermometer className="w-3 h-3 text-orange-400" />
                            <span>{Math.round(celsiusToFahrenheit(summit.temperature))}°F</span>
                        </div>
                    )}
                    {summit.weather_code !== undefined && (
                        <div className="flex items-center gap-1">
                            <Cloud className="w-3 h-3 text-blue-400" />
                            <span>{getWeatherDescription(summit.weather_code)}</span>
                        </div>
                    )}
                    {summit.wind_speed !== undefined && (
                        <div className="flex items-center gap-1">
                            <Wind className="w-3 h-3 text-cyan-400" />
                            <span>{Math.round(kmhToMph(summit.wind_speed))} mph</span>
                        </div>
                    )}
                </div>
            )}

            {/* Notes or CTA */}
            {hasNotes ? (
                <div className="p-2.5 rounded-md bg-primary/5 border border-primary/20">
                    <div className="flex items-center gap-1.5 text-xs text-primary mb-1">
                        <FileText className="w-3 h-3" />
                        <span className="font-medium">Trip Notes</span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">
                        {summit.notes}
                    </p>
                </div>
            ) : (
                <Button
                    size="sm"
                    onClick={handleAddTripReport}
                    className="w-full h-9 gap-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 shadow-sm font-medium"
                >
                    <PenLine className="w-3.5 h-3.5" />
                    Add Trip Report
                </Button>
            )}
        </div>
    );
};

type PeakUserActivityProps = {
    highlightedActivityId?: string | null;
    onHighlightActivity?: (activityId: string | null) => void;
};

const PeakUserActivity = ({ highlightedActivityId, onHighlightActivity }: PeakUserActivityProps) => {
    const selectedPeakUserData = useMapStore((state) => state.selectedPeakUserData);

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

    const { peakName, ascents, activities } = selectedPeakUserData;

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
                            <OrphanSummitCard key={summit.id} summit={summit} />
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
