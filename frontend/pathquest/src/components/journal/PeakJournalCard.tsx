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
    Clock,
} from "lucide-react";
import Link from "next/link";
import Summit, { ConditionTag } from "@/typeDefs/Summit";
import { useSummitReportStore } from "@/providers/SummitReportProvider";
import { cn } from "@/lib/utils";
import deleteAscent from "@/actions/peaks/deleteAscent";
import getSummitType from "@/helpers/getSummitType";

interface PeakJournalCardProps {
    summit: Summit;
    peakId: string;
    peakName: string;
    activityTitle?: string;
    isOwner: boolean;
    onDeleted?: () => void;
    index?: number; // Position in list (1-based)
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
    postholing: "bg-purple-500/20 text-purple-600 dark:text-purple-400",
    clear: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
    rocky: "bg-stone-500/20 text-stone-600 dark:text-stone-400",
    slippery: "bg-rose-500/20 text-rose-600 dark:text-rose-400",
    overgrown: "bg-green-600/20 text-green-700 dark:text-green-500",
    bushwhack: "bg-lime-600/20 text-lime-700 dark:text-lime-500",
    exposed: "bg-red-500/20 text-red-600 dark:text-red-400",
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

const formatTime = (timestamp: string, timezone?: string) => {
    const date = new Date(timestamp);
    const ianaTimezone = extractIanaTimezone(timezone);
    return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        timeZone: ianaTimezone,
    });
};

// Convert Celsius to Fahrenheit
const celsiusToFahrenheit = (celsius: number): number => {
    return (celsius * 9) / 5 + 32;
};

// Convert km/h to mph
const kmhToMph = (kmh: number): number => {
    return kmh * 0.621371;
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

const PeakJournalCard = ({ summit, peakId, peakName, activityTitle, isOwner, onDeleted, index }: PeakJournalCardProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const openSummitReport = useSummitReportStore((state) => state.openSummitReport);

    const hasReport = Boolean(
        (summit.notes && summit.notes.trim().length > 0) ||
        summit.difficulty ||
        summit.experience_rating
    );

    const hasTags = 
        (summit.condition_tags && summit.condition_tags.length > 0) ||
        (summit.custom_condition_tags && summit.custom_condition_tags.length > 0) ||
        summit.difficulty ||
        summit.experience_rating;

    const hasWeather = 
        summit.temperature !== undefined || 
        summit.weather_code !== undefined ||
        summit.wind_speed !== undefined;

    const hasExpandedContent = summit.notes || hasWeather || isOwner;

    const handleEditReport = (e: React.MouseEvent) => {
        e.stopPropagation();
        openSummitReport({
            summit,
            peakId,
            peakName,
            summitType: getSummitType(summit.activity_id),
        });
    };

    const handleDelete = async (e: React.MouseEvent) => {
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
                {/* Date Info with Index Badge */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        {index !== undefined && (
                            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-summited/10 text-summited rounded">
                                #{index}
                            </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                            {formatDate(summit.timestamp, summit.timezone)}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>Summit at {formatTime(summit.timestamp, summit.timezone)}</span>
                    </div>
                </div>

                {/* Right Side: Indicators */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Report Indicator or Add Report CTA */}
                    {hasReport ? (
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
                    {summit.activity_id && (
                        <Link
                            href={`/activities/${summit.activity_id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors"
                            title={activityTitle || "View Activity"}
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
                    {summit.difficulty && DIFFICULTY_CONFIG[summit.difficulty] && (
                        <span
                            className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1",
                                DIFFICULTY_CONFIG[summit.difficulty].bgColor,
                                DIFFICULTY_CONFIG[summit.difficulty].color
                            )}
                        >
                            <Mountain className="w-2.5 h-2.5" />
                            {DIFFICULTY_CONFIG[summit.difficulty].label}
                        </span>
                    )}
                    
                    {/* Experience Tag */}
                    {summit.experience_rating && EXPERIENCE_CONFIG[summit.experience_rating] && (
                        <span
                            className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1",
                                EXPERIENCE_CONFIG[summit.experience_rating].bgColor,
                                EXPERIENCE_CONFIG[summit.experience_rating].color
                            )}
                        >
                            {EXPERIENCE_CONFIG[summit.experience_rating].icon}
                            {EXPERIENCE_CONFIG[summit.experience_rating].label}
                        </span>
                    )}
                    
                    {/* Condition Tags */}
                    {summit.condition_tags?.map((tag) => (
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
                    {/* Custom Condition Tags */}
                    {summit.custom_condition_tags?.map((tag) => (
                        <span
                            key={`custom-${tag}`}
                            className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/20 text-primary"
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
                            {hasWeather && (
                                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                                    {summit.temperature !== undefined && (
                                        <div className="flex items-center gap-1">
                                            <Thermometer className="w-3 h-3" />
                                            <span>{Math.round(celsiusToFahrenheit(summit.temperature))}°F</span>
                                        </div>
                                    )}
                                    {summit.weather_code !== undefined && (
                                        <div className="flex items-center gap-1">
                                            <Cloud className="w-3 h-3" />
                                            <span>{weatherCodeDescriptions[summit.weather_code] || "Unknown"}</span>
                                        </div>
                                    )}
                                    {summit.wind_speed !== undefined && (
                                        <div className="flex items-center gap-1">
                                            <Wind className="w-3 h-3" />
                                            <span>{Math.round(kmhToMph(summit.wind_speed))} mph</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Notes */}
                            {summit.notes && (
                                <div className="text-sm text-foreground/80 whitespace-pre-wrap">
                                    {summit.notes}
                                </div>
                            )}

                            {/* Action Buttons for Owner */}
                            {isOwner && (
                                <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                                    {hasReport && (
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

export default PeakJournalCard;

