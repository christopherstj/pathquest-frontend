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
import Summit, { Difficulty, ExperienceRating, ConditionTag } from "@/typeDefs/Summit";
import SummitWithPeak from "@/typeDefs/SummitWithPeak";
import Link from "next/link";
import deleteAscent from "@/actions/peaks/deleteAscent";
import { cn } from "@/lib/utils";

// Difficulty display config
const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; color: string; borderColor: string; bgColor: string }> = {
    easy: { label: "Easy", color: "text-emerald-500", borderColor: "border-emerald-500/30", bgColor: "bg-emerald-500/5" },
    moderate: { label: "Moderate", color: "text-amber-500", borderColor: "border-amber-500/30", bgColor: "bg-amber-500/5" },
    hard: { label: "Hard", color: "text-orange-500", borderColor: "border-orange-500/30", bgColor: "bg-orange-500/5" },
    expert: { label: "Expert", color: "text-red-500", borderColor: "border-red-500/30", bgColor: "bg-red-500/5" },
};

// Experience display config
const EXPERIENCE_CONFIG: Record<ExperienceRating, { label: string; color: string; borderColor: string; bgColor: string; icon: React.ReactNode }> = {
    amazing: { label: "Amazing", color: "text-yellow-500", borderColor: "border-yellow-500/30", bgColor: "bg-yellow-500/5", icon: <Star className="w-3 h-3" /> },
    good: { label: "Good", color: "text-green-500", borderColor: "border-green-500/30", bgColor: "bg-green-500/5", icon: <Smile className="w-3 h-3" /> },
    tough: { label: "Tough", color: "text-blue-500", borderColor: "border-blue-500/30", bgColor: "bg-blue-500/5", icon: <Zap className="w-3 h-3" /> },
    epic: { label: "Epic", color: "text-purple-500", borderColor: "border-purple-500/30", bgColor: "bg-purple-500/5", icon: <Flame className="w-3 h-3" /> },
};

// Condition tag display config
const CONDITION_TAG_CONFIG: Record<ConditionTag, { bgColor: string; textColor: string }> = {
    dry: { bgColor: "bg-amber-500/20", textColor: "text-amber-600 dark:text-amber-400" },
    snow: { bgColor: "bg-sky-500/20", textColor: "text-sky-600 dark:text-sky-400" },
    ice: { bgColor: "bg-cyan-500/20", textColor: "text-cyan-600 dark:text-cyan-400" },
    mud: { bgColor: "bg-orange-500/20", textColor: "text-orange-600 dark:text-orange-400" },
    wet: { bgColor: "bg-blue-500/20", textColor: "text-blue-600 dark:text-blue-400" },
    windy: { bgColor: "bg-slate-500/20", textColor: "text-slate-600 dark:text-slate-400" },
    foggy: { bgColor: "bg-gray-500/20", textColor: "text-gray-600 dark:text-gray-400" },
    icy: { bgColor: "bg-indigo-500/20", textColor: "text-indigo-600 dark:text-indigo-400" },
    postholing: { bgColor: "bg-purple-500/20", textColor: "text-purple-600 dark:text-purple-400" },
    clear: { bgColor: "bg-emerald-500/20", textColor: "text-emerald-600 dark:text-emerald-400" },
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
    index?: number; // Position in list (1-based)
};

const SummitItem = ({ summit, peakId, peakName, showPeakHeader = false, onHoverStart, onHoverEnd, isOwner = false, onDeleted, index }: SummitItemProps) => {
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
    const hasConditionTags = summit.condition_tags && summit.condition_tags.length > 0;
    const hasReport = hasNotes || hasRatings || hasConditionTags;

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
            condition_tags: summit.condition_tags,
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
            className={cn(
                "p-3 rounded-lg transition-colors bg-card border border-border/70"
            )}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Peak Header (optional - for Activity Summits tab) */}
            {showPeakHeader && isSummitWithPeak(summit) && (
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/50">
                    {index !== undefined && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-summited/10 text-summited rounded flex-shrink-0">
                            #{index}
                        </span>
                    )}
                    <span className="text-sm font-semibold text-foreground truncate">
                        {summit.peak.name}
                    </span>
                </div>
            )}

            {/* Summit Time */}
            <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                    {!showPeakHeader && index !== undefined && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-summited/10 text-summited rounded flex-shrink-0">
                            #{index}
                        </span>
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

            {/* Prominent Add Trip Report CTA - shown when no report exists */}
            {!hasReport && isOwner && (
                <div className="mb-3">
                    <Button
                        size="sm"
                        onClick={handleOpenReport}
                        className="w-full h-10 gap-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 shadow-sm text-sm font-medium"
                    >
                        <PenLine className="w-4 h-4" />
                        Add Trip Report
                    </Button>
                </div>
            )}

            {/* Weather Conditions */}
            {hasWeather && (
                <div className="mb-2 flex flex-wrap gap-3 text-xs">
                    {summit.temperature !== undefined && (
                        <div className="flex items-center gap-1">
                            <Thermometer className="w-3 h-3 text-primary/60" />
                            <span className="text-foreground">
                                {Math.round(celsiusToFahrenheit(summit.temperature))}°F
                            </span>
                        </div>
                    )}
                    {summit.weather_code !== undefined && (
                        <div className="flex items-center gap-1">
                            <Cloud className="w-3 h-3 text-primary/60" />
                            <span className="text-foreground">
                                {getWeatherDescription(summit.weather_code)}
                            </span>
                        </div>
                    )}
                    {summit.wind_speed !== undefined && (
                        <div className="flex items-center gap-1">
                            <Wind className="w-3 h-3 text-primary/60" />
                            <span className="text-foreground">
                                {Math.round(kmhToMph(summit.wind_speed))} mph
                            </span>
                        </div>
                    )}
                    {summit.humidity !== undefined && (
                        <div className="flex items-center gap-1">
                            <Droplets className="w-3 h-3 text-primary/60" />
                            <span className="text-foreground">
                                {Math.round(summit.humidity)}%
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Difficulty & Experience Ratings */}
            {hasRatings && (
                <div className="mb-2 flex flex-wrap gap-2 text-xs">
                    {summit.difficulty && (
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${DIFFICULTY_CONFIG[summit.difficulty].color} ${DIFFICULTY_CONFIG[summit.difficulty].borderColor} ${DIFFICULTY_CONFIG[summit.difficulty].bgColor}`}>
                            <Mountain className="w-3 h-3" />
                            <span className="font-medium">{DIFFICULTY_CONFIG[summit.difficulty].label}</span>
                        </div>
                    )}
                    {summit.experience_rating && (
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${EXPERIENCE_CONFIG[summit.experience_rating].color} ${EXPERIENCE_CONFIG[summit.experience_rating].borderColor} ${EXPERIENCE_CONFIG[summit.experience_rating].bgColor}`}>
                            {EXPERIENCE_CONFIG[summit.experience_rating].icon}
                            <span className="font-medium">{EXPERIENCE_CONFIG[summit.experience_rating].label}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Condition Tags */}
            {hasConditionTags && (
                <div className="mb-2 flex flex-wrap gap-1.5">
                    {summit.condition_tags!.map((tag) => {
                        const config = CONDITION_TAG_CONFIG[tag];
                        return (
                            <span
                                key={tag}
                                className={`px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${config?.bgColor || "bg-muted"} ${config?.textColor || "text-muted-foreground"}`}
                            >
                                {tag}
                            </span>
                        );
                    })}
                </div>
            )}

            {/* Trip Notes */}
            {hasNotes && (
                <div className="p-2.5 rounded-md bg-background border border-primary/20">
                    <div className="flex items-center gap-1.5 text-xs text-primary mb-1">
                        <FileText className="w-3 h-3" />
                        <span className="font-medium">Trip Notes</span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">
                        {summit.notes}
                    </p>
                </div>
            )}
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

