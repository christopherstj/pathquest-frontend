"use client";

import React, { useState, useCallback, useMemo } from "react";
import {
    Route,
    Navigation,
    ExternalLink,
    Share2,
    FileText,
    Check,
    X,
    Mountain,
    Sparkles,
    Cloud,
    Thermometer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Activity from "@/typeDefs/Activity";
import SummitWithPeak from "@/typeDefs/SummitWithPeak";
import metersToFt from "@/helpers/metersToFt";
import StatsGrid from "@/components/ui/stats-grid";
import StatCard from "@/components/ui/stat-card";
import ActivityElevationProfile from "@/components/app/activities/ActivityElevationProfile";
import { cn } from "@/lib/utils";
import { convertSummitsToPeaks } from "@/helpers/convertSummitsToPeaks";

// No tabs needed - Analytics is now in the top-level tab bar

interface ActivityDetailsMobileProps {
    activity: Activity;
    summits: SummitWithPeak[];
    onClose: () => void;
    onShowOnMap: () => void;
    onHover?: (coords: [number, number] | null) => void;
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
        weekday: "short",
        month: "short",
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

// Weather code to description mapping (WMO codes)
const getWeatherDescription = (code: number | undefined): string => {
    if (code === undefined) return "";
    const descriptions: Record<number, string> = {
        0: "Clear sky",
        1: "Mainly clear",
        2: "Partly cloudy",
        3: "Overcast",
        45: "Foggy",
        48: "Rime fog",
        51: "Light drizzle",
        53: "Drizzle",
        55: "Dense drizzle",
        61: "Light rain",
        63: "Rain",
        65: "Heavy rain",
        71: "Light snow",
        73: "Snow",
        75: "Heavy snow",
        77: "Snow grains",
        80: "Light showers",
        81: "Showers",
        82: "Heavy showers",
        85: "Light snow showers",
        86: "Heavy snow showers",
        95: "Thunderstorm",
        96: "T-storm w/ hail",
        99: "T-storm heavy hail",
    };
    return descriptions[code] || "Unknown";
};

// Convert Celsius to Fahrenheit
const celsiusToFahrenheit = (celsius: number): number => {
    return (celsius * 9) / 5 + 32;
};

const ActivityDetailsMobile = ({
    activity,
    summits,
    onClose,
    onShowOnMap,
    onHover,
}: ActivityDetailsMobileProps) => {
    const [copied, setCopied] = useState(false);
    
    // Convert summits to peaks for elevation profile
    const peakSummits = useMemo(() => convertSummitsToPeaks(summits), [summits]);

    // Calculate duration from time_stream
    const duration = activity?.time_stream && activity.time_stream.length > 0
        ? activity.time_stream[activity.time_stream.length - 1]
        : null;

    // Activity highlight callouts
    const isMultiSummitDay = summits.length >= 2;
    
    // Get weather from first summit (if available)
    const summitWeather = useMemo(() => {
        const summitWithWeather = summits.find(s => s.temperature !== undefined || s.weather_code !== undefined);
        if (!summitWithWeather) return null;
        return {
            temperature: summitWithWeather.temperature,
            weatherCode: summitWithWeather.weather_code,
        };
    }, [summits]);

    const handleViewOnStrava = () => {
        window.open(`https://www.strava.com/activities/${activity.id}`, "_blank");
    };

    const handleShare = useCallback(async () => {
        const url = `${window.location.origin}/activities/${activity.id}`;
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy URL:", err);
        }
    }, [activity.id]);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="relative">
                <button
                    onClick={onClose}
                    className="absolute top-0 right-0 p-2 rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Close activity details"
                    tabIndex={0}
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2 mb-2 text-primary">
                    <span className="px-2 py-1 rounded-full border border-border/70 bg-muted/60 text-[11px] font-mono uppercase tracking-[0.18em] flex items-center gap-1">
                        <Route className="w-3.5 h-3.5" />
                        Activity
                    </span>
                </div>

                <h1
                    className="text-xl font-bold text-foreground pr-8"
                    style={{ fontFamily: "var(--font-display)" }}
                >
                    {activity.title || "Untitled Activity"}
                </h1>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span>{formatDate(activity.start_time, activity.timezone)}</span>
                    <span>•</span>
                    <span>{formatTime(activity.start_time, activity.timezone)}</span>
                </div>

                {/* Activity Highlight Callouts */}
                {(isMultiSummitDay || summitWeather || summits.length > 0) && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {/* Multi-summit callout */}
                        {isMultiSummitDay && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30">
                                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                                    Multi-summit day! 🎉
                                </span>
                            </div>
                        )}
                        {/* Summit count pill */}
                        {summits.length > 0 && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-summited/10 border border-summited/30">
                                <Mountain className="w-3.5 h-3.5 text-summited" />
                                <span className="text-xs font-medium text-summited">
                                    {summits.length} summit{summits.length !== 1 ? "s" : ""}
                                </span>
                            </div>
                        )}
                        {/* Weather conditions */}
                        {summitWeather && (
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/30">
                                {summitWeather.temperature !== undefined && (
                                    <>
                                        <Thermometer className="w-3.5 h-3.5 text-sky-500" />
                                        <span className="text-xs font-medium text-sky-600 dark:text-sky-400">
                                            {Math.round(celsiusToFahrenheit(summitWeather.temperature))}°F
                                        </span>
                                    </>
                                )}
                                {summitWeather.weatherCode !== undefined && (
                                    <>
                                        {summitWeather.temperature !== undefined && <span className="text-sky-400">•</span>}
                                        <Cloud className="w-3.5 h-3.5 text-sky-500" />
                                        <span className="text-xs font-medium text-sky-600 dark:text-sky-400">
                                            {getWeatherDescription(summitWeather.weatherCode)}
                                        </span>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="space-y-4">
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
                                onHover={onHover}
                                height={120}
                            />
                        </div>
                    )}

                    {/* Actions */}
                    <div className="space-y-2">
                        <Button
                            variant="outline"
                            onClick={handleViewOnStrava}
                            className="w-full gap-2 border-orange-500/30 text-orange-600 hover:bg-orange-500/10 hover:text-orange-600 h-9 text-sm"
                        >
                            <ExternalLink className="w-4 h-4" />
                            View on Strava
                        </Button>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={onShowOnMap}
                                className="flex-1 gap-2 border-primary/20 hover:bg-primary/10 hover:text-primary h-9 text-sm"
                            >
                                <Navigation className="w-4 h-4" />
                                Show on Map
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleShare}
                                className="flex-1 gap-2 border-primary/20 hover:bg-primary/10 hover:text-primary h-9 text-sm"
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
                </div>
        </div>
    );
};

export default ActivityDetailsMobile;

