"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Mountain, Calendar, User, Cloud, Thermometer, Wind, Droplets } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import getPeakDetails from "@/actions/peaks/getPeakDetails";
import Summit from "@/typeDefs/Summit";

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

// Convert Celsius to Fahrenheit (stored summit temperatures are in Celsius)
const celsiusToFahrenheit = (celsius: number): number => {
    return (celsius * 9/5) + 32;
};

// Convert km/h to mph (stored wind speeds are in km/h)
const kmhToMph = (kmh: number): number => {
    return kmh * 0.621371;
};

interface Props {
    peakId: string;
    onBack: () => void;
}

const SummitHistoryPanel = ({ peakId, onBack }: Props) => {
    const { data, isLoading } = useQuery({
        queryKey: ["peakDetails", peakId],
        queryFn: async () => {
            const res = await getPeakDetails(peakId);
            return res;
        },
    });

    const peak = data?.success ? data.data?.peak : null;
    const publicSummits = (data?.success ? data.data?.publicSummits : []) as PublicSummit[];
    const peakName = peak?.name || "Unknown Peak";

    // Sort summits by date (most recent first)
    const sortedSummits = [...(publicSummits || [])].sort((a, b) => {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    const formatDate = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
        });
    };

    return (
        <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            className="flex flex-col h-full"
        >
            {/* Header */}
            <div className="shrink-0 border-b border-border/60 pb-4 mb-4">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-3 group"
                    aria-label="Back to discovery"
                    tabIndex={0}
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    <span className="text-sm">Back to Discovery</span>
                </button>
                
                <div className="flex items-center gap-2 text-primary mb-1">
                    <Mountain className="w-4 h-4" />
                    <span className="text-xs font-mono uppercase tracking-wider">Summit History</span>
                </div>
                
                <h2 
                    className="text-xl font-bold text-foreground"
                    style={{ fontFamily: "var(--font-display)" }}
                >
                    {peakName}
                </h2>
                
                <p className="text-sm text-muted-foreground mt-1">
                    {sortedSummits.length} recorded summit{sortedSummits.length !== 1 ? "s" : ""}
                </p>
            </div>

            {/* Summit List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar -mx-1 px-1">
                {isLoading ? (
                    <div className="flex items-center justify-center py-10">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                ) : sortedSummits.length === 0 ? (
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
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                            <User className="w-4 h-4 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-foreground text-sm">
                                                {summit.user_name || "Anonymous Hiker"}
                                            </p>
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Calendar className="w-3 h-3" />
                                                <span>{formatDate(summit.timestamp)}</span>
                                                <span className="opacity-50">•</span>
                                                <span>{formatTime(summit.timestamp)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

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
            </div>
        </motion.div>
    );
};

export default SummitHistoryPanel;

