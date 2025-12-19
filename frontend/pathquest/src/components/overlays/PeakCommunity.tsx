"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    Mountain,
    Calendar,
    User,
    Cloud,
    Thermometer,
    Wind,
    Droplets,
    Users,
    Star,
    Smile,
    Zap,
    Flame,
    ExternalLink,
} from "lucide-react";
import { useMapStore } from "@/providers/MapProvider";
import Link from "next/link";
import Summit, { ConditionTag, Difficulty, ExperienceRating } from "@/typeDefs/Summit";

// Difficulty display config
const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; color: string; borderColor: string; bgColor: string }> = {
    easy: { label: "Easy", color: "text-emerald-500", borderColor: "border-emerald-500/30", bgColor: "bg-emerald-500/5" },
    moderate: { label: "Moderate", color: "text-amber-500", borderColor: "border-amber-500/30", bgColor: "bg-amber-500/5" },
    hard: { label: "Hard", color: "text-orange-500", borderColor: "border-orange-500/30", bgColor: "bg-orange-500/5" },
    expert: { label: "Expert", color: "text-red-500", borderColor: "border-red-500/30", bgColor: "bg-red-500/5" },
};

// Experience display config
const EXPERIENCE_CONFIG: Record<ExperienceRating, { label: string; color: string; borderColor: string; bgColor: string; icon: React.ReactNode }> = {
    amazing: { label: "Amazing", color: "text-yellow-500", borderColor: "border-yellow-500/30", bgColor: "bg-yellow-500/5", icon: <Star className="w-3.5 h-3.5" /> },
    good: { label: "Good", color: "text-green-500", borderColor: "border-green-500/30", bgColor: "bg-green-500/5", icon: <Smile className="w-3.5 h-3.5" /> },
    tough: { label: "Tough", color: "text-blue-500", borderColor: "border-blue-500/30", bgColor: "bg-blue-500/5", icon: <Zap className="w-3.5 h-3.5" /> },
    epic: { label: "Epic", color: "text-purple-500", borderColor: "border-purple-500/30", bgColor: "bg-purple-500/5", icon: <Flame className="w-3.5 h-3.5" /> },
};

// Condition tag display config
const CONDITION_CONFIG: Record<ConditionTag, { label: string; color: string; borderColor: string; bgColor: string }> = {
    clear: { label: "Clear", color: "text-sky-500", borderColor: "border-sky-500/30", bgColor: "bg-sky-500/5" },
    dry: { label: "Dry", color: "text-amber-500", borderColor: "border-amber-500/30", bgColor: "bg-amber-500/5" },
    wet: { label: "Wet", color: "text-blue-500", borderColor: "border-blue-500/30", bgColor: "bg-blue-500/5" },
    mud: { label: "Muddy", color: "text-orange-700", borderColor: "border-orange-700/30", bgColor: "bg-orange-700/5" },
    snow: { label: "Snow", color: "text-slate-400", borderColor: "border-slate-400/30", bgColor: "bg-slate-400/5" },
    ice: { label: "Icy", color: "text-cyan-400", borderColor: "border-cyan-400/30", bgColor: "bg-cyan-400/5" },
    postholing: { label: "Postholing", color: "text-indigo-400", borderColor: "border-indigo-400/30", bgColor: "bg-indigo-400/5" },
    windy: { label: "Windy", color: "text-teal-500", borderColor: "border-teal-500/30", bgColor: "bg-teal-500/5" },
    foggy: { label: "Foggy", color: "text-gray-400", borderColor: "border-gray-400/30", bgColor: "bg-gray-400/5" },
    rocky: { label: "Rocky", color: "text-stone-500", borderColor: "border-stone-500/30", bgColor: "bg-stone-500/5" },
    slippery: { label: "Slippery", color: "text-rose-400", borderColor: "border-rose-400/30", bgColor: "bg-rose-400/5" },
    overgrown: { label: "Overgrown", color: "text-green-600", borderColor: "border-green-600/30", bgColor: "bg-green-600/5" },
    bushwhack: { label: "Bushwhack", color: "text-lime-600", borderColor: "border-lime-600/30", bgColor: "bg-lime-600/5" },
    exposed: { label: "Exposed", color: "text-red-400", borderColor: "border-red-400/30", bgColor: "bg-red-400/5" },
};

// Extended summit type that includes user info from the API
interface PublicSummit extends Summit {
    user_id?: string;
    user_name?: string;
}

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

// Extract IANA timezone from format like "(GMT-07:00) America/Boise"
const extractIanaTimezone = (timezone?: string): string | undefined => {
    if (!timezone) return undefined;
    // Split by space and take the last part to get the IANA identifier
    // This handles both "America/Boise" and "(GMT-07:00) America/Boise" formats
    return timezone.split(" ").slice(-1)[0];
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

const formatTime = (timestamp: string, timezone?: string) => {
    const date = new Date(timestamp);
    const ianaTimezone = extractIanaTimezone(timezone);
    return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        timeZone: ianaTimezone,
    });
};

const PeakCommunity = () => {
    const selectedPeakCommunityData = useMapStore((state) => state.selectedPeakCommunityData);

    if (!selectedPeakCommunityData) {
        return (
            <div className="text-center py-10 text-muted-foreground">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium">Select a peak</p>
                <p className="text-xs mt-1">
                    Community summit history will appear here
                </p>
            </div>
        );
    }

    const { peakName, publicSummits } = selectedPeakCommunityData;

    // Sort summits by date (most recent first)
    const sortedSummits = [...(publicSummits || [])].sort((a, b) => {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    }) as PublicSummit[];

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
            className="space-y-5"
        >
            {/* Summary */}
            <div className="flex items-center gap-2 text-muted-foreground pb-3 border-b border-border/60">
                <Users className="w-4 h-4" />
                <span className="text-sm">
                    {sortedSummits.length} recorded summit{sortedSummits.length !== 1 ? "s" : ""}
                </span>
            </div>

            {/* Summit List */}
            {sortedSummits.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                    <Mountain className="w-8 h-8 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No public summits recorded yet.</p>
                    <p className="text-xs mt-1">Be the first to summit!</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {sortedSummits.map((summit, idx) => {
                        const hasActivity = Boolean(summit.activity_id);
                        
                        // User section - no link to profile (profiles don't exist yet)
                        const userSection = (
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                                        <User className="w-4 h-4 text-secondary" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground text-sm">
                                            {summit.user_name || "Anonymous Hiker"}
                                        </p>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                            <Calendar className="w-3 h-3" />
                                            <span>{formatDate(summit.timestamp, summit.timezone)}</span>
                                            <span className="opacity-50">•</span>
                                            <span>{formatTime(summit.timestamp, summit.timezone)}</span>
                                        </div>
                                    </div>
                                </div>
                                {hasActivity && (
                                    <div className="text-muted-foreground">
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </div>
                                )}
                            </div>
                        );

                        // Rest of card content (without user section)
                        const cardContent = (
                            <>
                                {/* Difficulty & Experience Ratings (if available) */}
                                {(summit.difficulty || summit.experience_rating) && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {summit.difficulty && (
                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs ${DIFFICULTY_CONFIG[summit.difficulty].color} ${DIFFICULTY_CONFIG[summit.difficulty].borderColor} ${DIFFICULTY_CONFIG[summit.difficulty].bgColor}`}>
                                                <Mountain className="w-3.5 h-3.5" />
                                                <span className="font-medium">{DIFFICULTY_CONFIG[summit.difficulty].label}</span>
                                            </div>
                                        )}
                                        {summit.experience_rating && (
                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs ${EXPERIENCE_CONFIG[summit.experience_rating].color} ${EXPERIENCE_CONFIG[summit.experience_rating].borderColor} ${EXPERIENCE_CONFIG[summit.experience_rating].bgColor}`}>
                                                {EXPERIENCE_CONFIG[summit.experience_rating].icon}
                                                <span className="font-medium">{EXPERIENCE_CONFIG[summit.experience_rating].label}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Condition Tags (if available) */}
                                {((summit.condition_tags && summit.condition_tags.length > 0) || (summit.custom_condition_tags && summit.custom_condition_tags.length > 0)) && (
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {summit.condition_tags?.map((tag) => {
                                            const config = CONDITION_CONFIG[tag];
                                            if (!config) return null;
                                            return (
                                                <span
                                                    key={tag}
                                                    className={`inline-flex px-2 py-0.5 rounded-full border text-[10px] font-medium ${config.color} ${config.borderColor} ${config.bgColor}`}
                                                >
                                                    {config.label}
                                                </span>
                                            );
                                        })}
                                        {summit.custom_condition_tags?.map((tag) => (
                                            <span
                                                key={`custom-${tag}`}
                                                className="inline-flex px-2 py-0.5 rounded-full border text-[10px] font-medium bg-primary/10 text-primary border-primary/30"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Weather Conditions (if available) */}
                                {(summit.temperature !== undefined ||
                                    summit.weather_code !== undefined ||
                                    summit.wind_speed !== undefined) && (
                                    <div className="mt-3 pt-3 border-t border-border/50">
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                                            <Cloud className="w-3 h-3" />
                                            <span>Conditions at summit</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            {summit.temperature !== undefined && (
                                                <div className="flex items-center gap-1.5">
                                                    <Thermometer className="w-3.5 h-3.5 text-primary/60" />
                                                    <span className="text-sm text-foreground">
                                                        {Math.round(celsiusToFahrenheit(summit.temperature))}°F
                                                    </span>
                                                </div>
                                            )}
                                            {summit.weather_code !== undefined && (
                                                <div className="flex items-center gap-1.5">
                                                    <Cloud className="w-3.5 h-3.5 text-primary/60" />
                                                    <span className="text-sm text-foreground truncate">
                                                        {getWeatherDescription(summit.weather_code)}
                                                    </span>
                                                </div>
                                            )}
                                            {summit.wind_speed !== undefined && (
                                                <div className="flex items-center gap-1.5">
                                                    <Wind className="w-3.5 h-3.5 text-primary/60" />
                                                    <span className="text-sm text-foreground">
                                                        {Math.round(kmhToMph(summit.wind_speed))} mph
                                                    </span>
                                                </div>
                                            )}
                                            {summit.humidity !== undefined && (
                                                <div className="flex items-center gap-1.5">
                                                    <Droplets className="w-3.5 h-3.5 text-primary/60" />
                                                    <span className="text-sm text-foreground">
                                                        {Math.round(summit.humidity)}%
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Notes (if available) */}
                                {summit.notes && (
                                    <div className="mt-3 pt-3 border-t border-border/50">
                                        <p className="text-sm text-muted-foreground italic">
                                            "{summit.notes}"
                                        </p>
                                    </div>
                                )}
                            </>
                        );

                        return hasActivity ? (
                            <div
                                key={summit.id || idx}
                                className="p-4 rounded-xl bg-card border border-border/70 hover:border-primary/50 transition-colors"
                            >
                                {userSection}
                                <Link
                                    href={`/activities/${summit.activity_id}`}
                                    className="block"
                                >
                                    {cardContent}
                                </Link>
                            </div>
                        ) : (
                            <div
                                key={summit.id || idx}
                                className="p-4 rounded-xl bg-card border border-border/70"
                            >
                                {userSection}
                                {cardContent}
                            </div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
};

export default PeakCommunity;

