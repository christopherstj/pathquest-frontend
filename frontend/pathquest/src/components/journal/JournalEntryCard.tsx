"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Mountain, 
    ChevronDown, 
    ChevronUp, 
    Pencil,
    Trash2,
    Thermometer,
    Wind,
    Cloud,
    FileText,
    Route,
    PenLine,
    Star,
    Smile,
    Zap,
    Flame,
} from "lucide-react";
import Link from "next/link";
import { JournalEntry } from "@/typeDefs/JournalEntry";
import { useMapStore } from "@/providers/MapProvider";
import { useSummitReportStore } from "@/providers/SummitReportProvider";
import { cn } from "@/lib/utils";
import deleteAscent from "@/actions/peaks/deleteAscent";

interface JournalEntryCardProps {
    entry: JournalEntry;
    isOwner: boolean;
    onDeleted?: () => void;
}

// Condition tag colors
const conditionTagColors: Record<string, string> = {
    dry: "bg-amber-500/20 text-amber-600 dark:text-amber-400",
    snow: "bg-sky-500/20 text-sky-600 dark:text-sky-400",
    ice: "bg-cyan-500/20 text-cyan-600 dark:text-cyan-400",
    mud: "bg-orange-500/20 text-orange-600 dark:text-orange-400",
    wet: "bg-blue-500/20 text-blue-600 dark:text-blue-400",
    windy: "bg-slate-500/20 text-slate-600 dark:text-slate-400",
    foggy: "bg-gray-500/20 text-gray-600 dark:text-gray-400",
    icy: "bg-indigo-500/20 text-indigo-600 dark:text-indigo-400",
    postholing: "bg-purple-500/20 text-purple-600 dark:text-purple-400",
    clear: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
};

// Difficulty display config
const DIFFICULTY_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
    easy: { label: "Easy", color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
    moderate: { label: "Moderate", color: "text-amber-500", bgColor: "bg-amber-500/10" },
    hard: { label: "Hard", color: "text-orange-500", bgColor: "bg-orange-500/10" },
    expert: { label: "Expert", color: "text-red-500", bgColor: "bg-red-500/10" },
};

// Experience display config
const EXPERIENCE_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: React.ReactNode }> = {
    amazing: { label: "Amazing", color: "text-yellow-500", bgColor: "bg-yellow-500/10", icon: <Star className="w-3 h-3" /> },
    good: { label: "Good", color: "text-green-500", bgColor: "bg-green-500/10", icon: <Smile className="w-3 h-3" /> },
    tough: { label: "Tough", color: "text-blue-500", bgColor: "bg-blue-500/10", icon: <Zap className="w-3 h-3" /> },
    epic: { label: "Epic", color: "text-purple-500", bgColor: "bg-purple-500/10", icon: <Flame className="w-3 h-3" /> },
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
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: ianaTimezone,
    });
};

const formatElevation = (meters?: number): string => {
    if (!meters) return "";
    const feet = Math.round(meters * 3.28084);
    return `${feet.toLocaleString()}ft`;
};

const weatherCodeDescriptions: Record<number, string> = {
    0: "Clear",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Light rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Light snow",
    73: "Moderate snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Light showers",
    81: "Moderate showers",
    82: "Heavy showers",
    85: "Light snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
};

const JournalEntryCard = ({ entry, isOwner, onDeleted }: JournalEntryCardProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const setSelectedPeakId = useMapStore((state) => state.setSelectedPeakId);
    const openSummitReport = useSummitReportStore((state) => state.openSummitReport);

    const handlePeakClick = () => {
        setSelectedPeakId(entry.peak.id);
    };

    const hasTags = 
        (entry.conditionTags && entry.conditionTags.length > 0) ||
        entry.difficulty ||
        entry.experienceRating;

    const hasExpandedContent = 
        entry.notes || 
        entry.temperature !== undefined || 
        entry.weatherCode !== undefined ||
        entry.windSpeed !== undefined ||
        isOwner; // Always show expanded for owner (to access actions)

    const handleEditReport = (e: React.MouseEvent) => {
        e.stopPropagation();
        openSummitReport({
            summit: {
                id: entry.id,
                timestamp: entry.timestamp,
                timezone: entry.timezone,
                activity_id: entry.activity?.id || "",
                notes: entry.notes,
                difficulty: entry.difficulty,
                experience_rating: entry.experienceRating,
                condition_tags: entry.conditionTags,
                temperature: entry.temperature,
                weather_code: entry.weatherCode,
                cloud_cover: entry.cloudCover,
                wind_speed: entry.windSpeed,
            },
            peakId: entry.peak.id,
            peakName: entry.peak.name,
        });
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        
        if (!confirm("Are you sure you want to delete this summit? This action cannot be undone.")) {
            return;
        }
        
        setIsDeleting(true);
        try {
            const result = await deleteAscent(entry.id);
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

    return (
        <motion.div
            layout
            className="bg-card border border-border rounded-lg overflow-hidden"
        >
            {/* Main Row - Always Visible */}
            <div 
                className={cn(
                    "p-3 flex items-center gap-3 cursor-pointer hover:bg-muted/50 transition-colors",
                    isExpanded && "border-b border-border"
                )}
                onClick={() => hasExpandedContent && setIsExpanded(!isExpanded)}
            >
                {/* Peak Info with Summit Number Badge */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-primary/10 text-primary rounded">
                            #{entry.summitNumber}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {formatDate(entry.timestamp, entry.timezone)}
                        </span>
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handlePeakClick();
                        }}
                        className="font-semibold text-sm text-foreground hover:text-primary transition-colors truncate block text-left w-full"
                    >
                        {entry.peak.name}
                    </button>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        {entry.peak.elevation && (
                            <span>{formatElevation(entry.peak.elevation)}</span>
                        )}
                        {(entry.peak.state || entry.peak.country) && (
                            <>
                                {entry.peak.elevation && <span>•</span>}
                                <span>
                                    {[entry.peak.state, entry.peak.country].filter(Boolean).join(", ")}
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* Right Side: Tags & Indicators */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Report Indicator or Add Report CTA */}
                    {entry.hasReport ? (
                        <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center" title="Has trip report">
                            <FileText className="w-3 h-3 text-green-600 dark:text-green-400" />
                        </div>
                    ) : isOwner ? (
                        <button
                            onClick={handleEditReport}
                            className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium bg-primary/10 text-primary hover:bg-primary/20 rounded-full transition-colors"
                        >
                            <PenLine className="w-3 h-3" />
                            Add Report
                        </button>
                    ) : null}

                    {/* Activity Link */}
                    {entry.activity && (
                        <Link
                            href={`/activities/${entry.activity.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors"
                            title={entry.activity.title}
                        >
                            <Route className="w-3 h-3 text-primary" />
                        </Link>
                    )}

                    {/* Expand Button */}
                    {hasExpandedContent && (
                        <button 
                            className="w-6 h-6 rounded-full bg-muted flex items-center justify-center"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsExpanded(!isExpanded);
                            }}
                        >
                            {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
                            ) : (
                                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                            )}
                        </button>
                    )}
                </div>
            </div>

            {/* Tags Row - Condition + Difficulty + Experience */}
            {hasTags && (
                <div className="px-3 py-2 flex flex-wrap gap-1.5 border-b border-border bg-muted/30">
                    {/* Difficulty Tag */}
                    {entry.difficulty && DIFFICULTY_CONFIG[entry.difficulty] && (
                        <span
                            className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1",
                                DIFFICULTY_CONFIG[entry.difficulty].bgColor,
                                DIFFICULTY_CONFIG[entry.difficulty].color
                            )}
                        >
                            <Mountain className="w-2.5 h-2.5" />
                            {DIFFICULTY_CONFIG[entry.difficulty].label}
                        </span>
                    )}
                    
                    {/* Experience Tag */}
                    {entry.experienceRating && EXPERIENCE_CONFIG[entry.experienceRating] && (
                        <span
                            className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1",
                                EXPERIENCE_CONFIG[entry.experienceRating].bgColor,
                                EXPERIENCE_CONFIG[entry.experienceRating].color
                            )}
                        >
                            {EXPERIENCE_CONFIG[entry.experienceRating].icon}
                            {EXPERIENCE_CONFIG[entry.experienceRating].label}
                        </span>
                    )}
                    
                    {/* Condition Tags */}
                    {entry.conditionTags?.map((tag) => (
                        <span
                            key={tag}
                            className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] font-medium capitalize",
                                conditionTagColors[tag] || "bg-muted text-muted-foreground"
                            )}
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            {/* Expanded Content */}
            <AnimatePresence>
                {isExpanded && hasExpandedContent && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="p-3 space-y-3 bg-muted/20">
                            {/* Weather Data */}
                            {(entry.temperature !== undefined || entry.weatherCode !== undefined || entry.windSpeed !== undefined) && (
                                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                                    {entry.temperature !== undefined && (
                                        <div className="flex items-center gap-1">
                                            <Thermometer className="w-3 h-3" />
                                            <span>{Math.round(entry.temperature)}°F</span>
                                        </div>
                                    )}
                                    {entry.weatherCode !== undefined && (
                                        <div className="flex items-center gap-1">
                                            <Cloud className="w-3 h-3" />
                                            <span>{weatherCodeDescriptions[entry.weatherCode] || "Unknown"}</span>
                                        </div>
                                    )}
                                    {entry.windSpeed !== undefined && (
                                        <div className="flex items-center gap-1">
                                            <Wind className="w-3 h-3" />
                                            <span>{Math.round(entry.windSpeed)} mph</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Notes */}
                            {entry.notes && (
                                <div className="text-sm text-foreground/80 whitespace-pre-wrap">
                                    {entry.notes}
                                </div>
                            )}

                            {/* Activity Details */}
                            {entry.activity && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Route className="w-3 h-3" />
                                    <span>{entry.activity.title}</span>
                                    {entry.activity.distance && (
                                        <>
                                            <span>•</span>
                                            <span>{(entry.activity.distance / 1609.34).toFixed(1)} mi</span>
                                        </>
                                    )}
                                    {entry.activity.gain && (
                                        <>
                                            <span>•</span>
                                            <span>{Math.round(entry.activity.gain * 3.28084).toLocaleString()}ft gain</span>
                                        </>
                                    )}
                                </div>
                            )}

                            {/* Action Buttons for Owner */}
                            {isOwner && (
                                <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                                    {entry.hasReport && (
                                        <button
                                            onClick={handleEditReport}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 rounded-md transition-colors"
                                        >
                                            <Pencil className="w-3 h-3" />
                                            Edit Report
                                        </button>
                                    )}
                                    
                                    <button
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors disabled:opacity-50 ml-auto"
                                    >
                                        {isDeleting ? (
                                            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <Trash2 className="w-3 h-3" />
                                        )}
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default JournalEntryCard;
