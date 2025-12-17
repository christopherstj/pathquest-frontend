"use client";

import React, { useState } from "react";
import {
    Mountain,
    Calendar,
    Clock,
    Cloud,
    Thermometer,
    Wind,
    FileText,
    PenLine,
    Pencil,
    Star,
    Smile,
    Zap,
    Flame,
    ChevronRight,
    Trash2,
} from "lucide-react";
import { useSummitReportStore } from "@/providers/SummitReportProvider";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Summit, { Difficulty, ExperienceRating } from "@/typeDefs/Summit";
import SummitWithPeak from "@/typeDefs/SummitWithPeak";
import {
    extractIanaTimezone,
    celsiusToFahrenheit,
    kmhToMph,
    getWeatherDescription,
    formatTime,
} from "@/components/app/summits/SummitItem";
import deleteAscent from "@/actions/peaks/deleteAscent";

// Difficulty display config
const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; color: string; borderColor: string; bgColor: string }> = {
    easy: { label: "Easy", color: "text-emerald-500", borderColor: "border-emerald-500/30", bgColor: "bg-emerald-500/5" },
    moderate: { label: "Moderate", color: "text-amber-500", borderColor: "border-amber-500/30", bgColor: "bg-amber-500/5" },
    hard: { label: "Hard", color: "text-orange-500", borderColor: "border-orange-500/30", bgColor: "bg-orange-500/5" },
    expert: { label: "Expert", color: "text-red-500", borderColor: "border-red-500/30", bgColor: "bg-red-500/5" },
};

// Experience display config
const EXPERIENCE_CONFIG: Record<
    ExperienceRating,
    { label: string; color: string; borderColor: string; bgColor: string; icon: React.ReactNode }
> = {
    amazing: {
        label: "Amazing",
        color: "text-yellow-500",
        borderColor: "border-yellow-500/30",
        bgColor: "bg-yellow-500/5",
        icon: <Star className="w-3 h-3" />,
    },
    good: {
        label: "Good",
        color: "text-green-500",
        borderColor: "border-green-500/30",
        bgColor: "bg-green-500/5",
        icon: <Smile className="w-3 h-3" />,
    },
    tough: {
        label: "Tough",
        color: "text-blue-500",
        borderColor: "border-blue-500/30",
        bgColor: "bg-blue-500/5",
        icon: <Zap className="w-3 h-3" />,
    },
    epic: {
        label: "Epic",
        color: "text-purple-500",
        borderColor: "border-purple-500/30",
        bgColor: "bg-purple-500/5",
        icon: <Flame className="w-3 h-3" />,
    },
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

export type OrphanSummitCardProps = {
    summit: Summit | SummitWithPeak;
    peakId?: string;
    peakName?: string;
    showPeakHeader?: boolean;
    isOwner?: boolean;
    onDeleted?: () => void;
};

const OrphanSummitCard = ({
    summit,
    peakId,
    peakName,
    showPeakHeader = false,
    isOwner = false,
    onDeleted,
}: OrphanSummitCardProps) => {
    const openSummitReport = useSummitReportStore((state) => state.openSummitReport);
    const [isDeleting, setIsDeleting] = useState(false);
    const hasNotes = Boolean(summit.notes && summit.notes.trim().length > 0);
    const hasWeather =
        summit.temperature !== undefined ||
        summit.weather_code !== undefined ||
        summit.wind_speed !== undefined;
    const hasRatings = summit.difficulty || summit.experience_rating;
    const hasReport = hasNotes || hasRatings;

    // Check if it's a SummitWithPeak
    const isSummitWithPeak = "peak" in summit;
    const resolvedPeakId = peakId ?? (isSummitWithPeak ? summit.peak.id : undefined);
    const resolvedPeakName = peakName ?? (isSummitWithPeak ? summit.peak.name : undefined);

    // Convert SummitWithPeak to Summit type for the report store
    const summitForReport: Summit = isSummitWithPeak
        ? {
              id: summit.id,
              timestamp: summit.timestamp,
              timezone: summit.timezone,
              activity_id: summit.activity_id ?? "", // Not always available in SummitWithPeak
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
              is_public: summit.is_public,
          }
        : summit;

    const handleOpenReport = () => {
        if (resolvedPeakId && resolvedPeakName) {
            openSummitReport({ summit: summitForReport, peakId: resolvedPeakId, peakName: resolvedPeakName });
        }
    };

    const handleDelete = async () => {
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
        <div className="p-4 rounded-xl bg-card border border-border/70">
            {/* Peak Header (optional, for profile journal) */}
            {showPeakHeader && isSummitWithPeak && (
                <Link
                    href={`/peaks/${summit.peak.id}`}
                    className="flex items-center justify-between mb-3 pb-3 border-b border-border/50 hover:bg-muted/30 -m-4 p-4 rounded-t-xl transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-summited/10 flex items-center justify-center">
                            <Mountain className="w-3.5 h-3.5 text-summited" />
                        </div>
                        <span className="text-sm font-semibold text-foreground">
                            {summit.peak.name}
                        </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Link>
            )}

            {/* Date Header */}
            <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-summited/10 flex items-center justify-center">
                        <Mountain className="w-4 h-4 text-summited" />
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

            {/* Weather */}
            {hasWeather && (
                <div className="mb-3 flex flex-wrap gap-3 text-xs">
                    {summit.temperature !== undefined && (
                        <div className="flex items-center gap-1">
                            <Thermometer className="w-3 h-3 text-primary/60" />
                            <span>{Math.round(celsiusToFahrenheit(summit.temperature))}°F</span>
                        </div>
                    )}
                    {summit.weather_code !== undefined && (
                        <div className="flex items-center gap-1">
                            <Cloud className="w-3 h-3 text-primary/60" />
                            <span>{getWeatherDescription(summit.weather_code)}</span>
                        </div>
                    )}
                    {summit.wind_speed !== undefined && (
                        <div className="flex items-center gap-1">
                            <Wind className="w-3 h-3 text-primary/60" />
                            <span>{Math.round(kmhToMph(summit.wind_speed))} mph</span>
                        </div>
                    )}
                </div>
            )}

            {/* Difficulty & Experience Ratings */}
            {hasRatings && (
                <div className="mb-3 flex flex-wrap gap-2 text-xs">
                    {summit.difficulty && (
                        <div
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${DIFFICULTY_CONFIG[summit.difficulty].color} ${DIFFICULTY_CONFIG[summit.difficulty].borderColor} ${DIFFICULTY_CONFIG[summit.difficulty].bgColor}`}
                        >
                            <Mountain className="w-3 h-3" />
                            <span className="font-medium">
                                {DIFFICULTY_CONFIG[summit.difficulty].label}
                            </span>
                        </div>
                    )}
                    {summit.experience_rating && (
                        <div
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${EXPERIENCE_CONFIG[summit.experience_rating].color} ${EXPERIENCE_CONFIG[summit.experience_rating].borderColor} ${EXPERIENCE_CONFIG[summit.experience_rating].bgColor}`}
                        >
                            {EXPERIENCE_CONFIG[summit.experience_rating].icon}
                            <span className="font-medium">
                                {EXPERIENCE_CONFIG[summit.experience_rating].label}
                            </span>
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
                    <p className="text-sm text-foreground leading-relaxed">{summit.notes}</p>
                </div>
            ) : !hasReport && resolvedPeakId && resolvedPeakName && isOwner ? (
                <Button
                    size="sm"
                    onClick={handleOpenReport}
                    className="w-full h-9 gap-2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 shadow-sm font-medium"
                >
                    <PenLine className="w-3.5 h-3.5" />
                    Add Trip Report
                </Button>
            ) : null}
        </div>
    );
};

export default OrphanSummitCard;

