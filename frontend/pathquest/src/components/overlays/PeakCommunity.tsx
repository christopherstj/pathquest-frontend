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
} from "lucide-react";
import { useMapStore } from "@/providers/MapProvider";
import Summit, { Difficulty, ExperienceRating } from "@/typeDefs/Summit";

// Difficulty display config
const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; color: string }> = {
    easy: { label: "Easy", color: "text-emerald-500" },
    moderate: { label: "Moderate", color: "text-amber-500" },
    hard: { label: "Hard", color: "text-orange-500" },
    expert: { label: "Expert", color: "text-red-500" },
};

// Experience display config
const EXPERIENCE_CONFIG: Record<ExperienceRating, { label: string; color: string; icon: React.ReactNode }> = {
    amazing: { label: "Amazing", color: "text-yellow-500", icon: <Star className="w-3.5 h-3.5" /> },
    good: { label: "Good", color: "text-green-500", icon: <Smile className="w-3.5 h-3.5" /> },
    tough: { label: "Tough", color: "text-blue-500", icon: <Zap className="w-3.5 h-3.5" /> },
    epic: { label: "Epic", color: "text-purple-500", icon: <Flame className="w-3.5 h-3.5" /> },
};

// Extended summit type that includes user_name from the API
interface PublicSummit extends Summit {
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
            {/* Header */}
            <div className="pb-3 border-b border-border/60">
                <div className="flex items-center gap-2 text-secondary mb-1">
                    <Users className="w-4 h-4" />
                    <span className="text-xs font-mono uppercase tracking-wider">
                        Community
                    </span>
                </div>
                <h2
                    className="text-lg font-bold text-foreground"
                    style={{ fontFamily: "var(--font-display)" }}
                >
                    {peakName}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    {sortedSummits.length} recorded summit{sortedSummits.length !== 1 ? "s" : ""}
                </p>
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
                    {sortedSummits.map((summit, idx) => (
                        <div
                            key={summit.id || idx}
                            className="p-4 rounded-xl bg-card border border-border/70 hover:border-border transition-colors"
                        >
                            {/* User and Date */}
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
                            </div>

                            {/* Difficulty & Experience Ratings (if available) */}
                            {(summit.difficulty || summit.experience_rating) && (
                                <div className="flex flex-wrap gap-3 mt-3">
                                    {summit.difficulty && (
                                        <div className={`flex items-center gap-1.5 ${DIFFICULTY_CONFIG[summit.difficulty].color}`}>
                                            <Mountain className="w-3.5 h-3.5" />
                                            <span className="text-sm font-medium">{DIFFICULTY_CONFIG[summit.difficulty].label}</span>
                                        </div>
                                    )}
                                    {summit.experience_rating && (
                                        <div className={`flex items-center gap-1.5 ${EXPERIENCE_CONFIG[summit.experience_rating].color}`}>
                                            {EXPERIENCE_CONFIG[summit.experience_rating].icon}
                                            <span className="text-sm font-medium">{EXPERIENCE_CONFIG[summit.experience_rating].label}</span>
                                        </div>
                                    )}
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
                                                <Thermometer className="w-3.5 h-3.5 text-orange-400" />
                                                <span className="text-sm text-foreground">
                                                    {Math.round(celsiusToFahrenheit(summit.temperature))}°F
                                                </span>
                                            </div>
                                        )}
                                        {summit.weather_code !== undefined && (
                                            <div className="flex items-center gap-1.5">
                                                <Cloud className="w-3.5 h-3.5 text-blue-400" />
                                                <span className="text-sm text-foreground truncate">
                                                    {getWeatherDescription(summit.weather_code)}
                                                </span>
                                            </div>
                                        )}
                                        {summit.wind_speed !== undefined && (
                                            <div className="flex items-center gap-1.5">
                                                <Wind className="w-3.5 h-3.5 text-cyan-400" />
                                                <span className="text-sm text-foreground">
                                                    {Math.round(kmhToMph(summit.wind_speed))} mph
                                                </span>
                                            </div>
                                        )}
                                        {summit.humidity !== undefined && (
                                            <div className="flex items-center gap-1.5">
                                                <Droplets className="w-3.5 h-3.5 text-blue-300" />
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
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};

export default PeakCommunity;

