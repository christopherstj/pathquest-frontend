"use client";

import React, { useState } from "react";
import {
    Mountain,
    Clock,
    Cloud,
    Thermometer,
    Wind,
    Droplets,
    FileText,
    PenLine,
    Pencil,
    Star,
    Smile,
    Zap,
    Flame,
    Trash2,
} from "lucide-react";
import { useSummitReportStore } from "@/providers/SummitReportProvider";
import { Button } from "@/components/ui/button";
import Summit, { Difficulty, ExperienceRating } from "@/typeDefs/Summit";
import SummitWithPeak from "@/typeDefs/SummitWithPeak";
import Link from "next/link";
import deleteAscent from "@/actions/peaks/deleteAscent";

// Difficulty display config
const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; color: string }> = {
    easy: { label: "Easy", color: "text-emerald-500" },
    moderate: { label: "Moderate", color: "text-amber-500" },
    hard: { label: "Hard", color: "text-orange-500" },
    expert: { label: "Expert", color: "text-red-500" },
};

// Experience display config
const EXPERIENCE_CONFIG: Record<ExperienceRating, { label: string; color: string; icon: React.ReactNode }> = {
    amazing: { label: "Amazing", color: "text-yellow-500", icon: <Star className="w-3 h-3" /> },
    good: { label: "Good", color: "text-green-500", icon: <Smile className="w-3 h-3" /> },
    tough: { label: "Tough", color: "text-blue-500", icon: <Zap className="w-3 h-3" /> },
    epic: { label: "Epic", color: "text-purple-500", icon: <Flame className="w-3 h-3" /> },
};

// Weather code to description mapping (WMO codes)
export const getWeatherDescription = (code: number | undefined): string => {
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
export const celsiusToFahrenheit = (celsius: number): number => {
    return (celsius * 9) / 5 + 32;
};

// Convert km/h to mph
export const kmhToMph = (kmh: number): number => {
    return kmh * 0.621371;
};

// Extract IANA timezone from format like "(GMT-07:00) America/Boise"
export const extractIanaTimezone = (timezone?: string): string | undefined => {
    if (!timezone) return undefined;
    return timezone.split(" ").slice(-1)[0];
};

export const formatTime = (timestamp: string, timezone?: string) => {
    const date = new Date(timestamp);
    const ianaTimezone = extractIanaTimezone(timezone);
    return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        timeZone: ianaTimezone,
    });
};

// Helper type guard to check if summit has nested peak
function isSummitWithPeak(summit: Summit | SummitWithPeak): summit is SummitWithPeak {
    return "peak" in summit;
}

export type SummitItemProps = {
    summit: Summit | SummitWithPeak;
    peakId?: string;
    peakName?: string;
    showPeakHeader?: boolean;
    onHoverStart?: (peakId: string) => void;
    onHoverEnd?: (peakId: string) => void;
    isOwner?: boolean;
    onDeleted?: () => void;
};

const SummitItem = ({ summit, peakId, peakName, showPeakHeader = false, onHoverStart, onHoverEnd, isOwner = false, onDeleted }: SummitItemProps) => {
    const openSummitReport = useSummitReportStore((state) => state.openSummitReport);
    const [isDeleting, setIsDeleting] = useState(false);
    
    // Resolve peak info from either prop or nested peak
    const resolvedPeakId = isSummitWithPeak(summit) ? summit.peak.id : peakId || "";
    const resolvedPeakName = isSummitWithPeak(summit) ? summit.peak.name : peakName || "";
    
    const hasNotes = Boolean(summit.notes && summit.notes.trim().length > 0);
    const hasWeather =
        summit.temperature !== undefined ||
        summit.weather_code !== undefined ||
        summit.wind_speed !== undefined;
    const hasRatings = summit.difficulty || summit.experience_rating;
    const hasReport = hasNotes || hasRatings;

    // Convert SummitWithPeak to Summit type for the report store
    const summitForReport: Summit = isSummitWithPeak(summit) 
        ? {
            id: summit.id,
            timestamp: summit.timestamp,
            timezone: summit.timezone,
            activity_id: "", // Not available in SummitWithPeak
            notes: summit.notes,
            temperature: summit.temperature,
            precipitation: summit.precipitation,
            weather_code: summit.weather_code,
            cloud_cover: summit.cloud_cover,
            humidity: summit.humidity,
            wind_speed: summit.wind_speed,
            wind_direction: summit.wind_direction,
            difficulty: summit.difficulty,
            experience_rating: summit.experience_rating,
          }
        : summit;

    const handleOpenReport = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        openSummitReport({ summit: summitForReport, peakId: resolvedPeakId, peakName: resolvedPeakName });
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!confirm("Are you sure you want to delete this summit? This action cannot be undone.")) {
            return;
        }
        
        setIsDeleting(true);
        try {
            const result = await deleteAscent(summit.id);
            if (result.success) {
                onDeleted?.();
            } else {
                alert(result.error || "Failed to delete summit");
            }
        } catch (error) {
            alert("Failed to delete summit");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleMouseEnter = () => {
        if (onHoverStart && resolvedPeakId) {
            onHoverStart(resolvedPeakId);
        }
    };

    const handleMouseLeave = () => {
        if (onHoverEnd && resolvedPeakId) {
            onHoverEnd(resolvedPeakId);
        }
    };

    const content = (
        <div 
            className="p-3 rounded-lg bg-card border border-border/70 transition-colors"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Peak Header (optional - for Activity Summits tab) */}
            {showPeakHeader && isSummitWithPeak(summit) && (
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/50">
                    <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center">
                        <Mountain className="w-3 h-3 text-green-500" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                        {summit.peak.name}
                    </span>
                </div>
            )}

            {/* Summit Time */}
            <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                    {!showPeakHeader && (
                        <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center">
                            <Mountain className="w-3 h-3 text-green-500" />
                        </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>Summit at {formatTime(summit.timestamp, summit.timezone)}</span>
                    </div>
                </div>
                {isOwner && (
                    <div className="flex items-center gap-1">
                        {hasReport && (
                            <button
                                onClick={handleOpenReport}
                                className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                                aria-label="Edit summit report"
                                tabIndex={0}
                            >
                                <Pencil className="w-3.5 h-3.5" />
                            </button>
                        )}
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                            aria-label="Delete summit"
                            tabIndex={0}
                        >
                            {isDeleting ? (
                                <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                            )}
                        </button>
                    </div>
                )}
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

            {/* Difficulty & Experience Ratings */}
            {hasRatings && (
                <div className="mb-2 flex flex-wrap gap-3 text-xs">
                    {summit.difficulty && (
                        <div className={`flex items-center gap-1 ${DIFFICULTY_CONFIG[summit.difficulty].color}`}>
                            <Mountain className="w-3 h-3" />
                            <span className="font-medium">{DIFFICULTY_CONFIG[summit.difficulty].label}</span>
                        </div>
                    )}
                    {summit.experience_rating && (
                        <div className={`flex items-center gap-1 ${EXPERIENCE_CONFIG[summit.experience_rating].color}`}>
                            {EXPERIENCE_CONFIG[summit.experience_rating].icon}
                            <span className="font-medium">{EXPERIENCE_CONFIG[summit.experience_rating].label}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Trip Notes or Add Trip Report CTA */}
            {hasNotes ? (
                <div className="p-2.5 rounded-md bg-background border border-primary/20">
                    <div className="flex items-center gap-1.5 text-xs text-primary mb-1">
                        <FileText className="w-3 h-3" />
                        <span className="font-medium">Trip Notes</span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">
                        {summit.notes}
                    </p>
                </div>
            ) : !hasReport && isOwner ? (
                <Button
                    size="sm"
                    onClick={handleOpenReport}
                    className="w-full h-9 gap-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 shadow-sm text-xs font-medium"
                >
                    <PenLine className="w-3.5 h-3.5" />
                    Add Trip Report
                </Button>
            ) : null}
        </div>
    );

    // Wrap in Link if showing peak header (for Activity Summits tab)
    if (showPeakHeader && resolvedPeakId) {
        return (
            <Link href={`/peaks/${resolvedPeakId}`} className="block hover:opacity-90 transition-opacity">
                {content}
            </Link>
        );
    }

    return content;
};

export default SummitItem;

