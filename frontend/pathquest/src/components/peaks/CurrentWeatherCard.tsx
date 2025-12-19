"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Cloud, Thermometer, Wind, Droplets, Sun, Moon, CloudRain, CloudSnow, CloudFog, CloudLightning, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import getPeakWeather from "@/actions/peaks/getPeakWeather";
import { celsiusToFahrenheit, getWeatherDescription } from "@/components/app/summits/SummitItem";

// Convert km/h to mph
const kmhToMph = (kmh: number): number => kmh * 0.621371;

// Get weather icon based on weather code and day/night
const getWeatherIcon = (code: number | null, isDay: boolean | null) => {
    if (code === null) return <Cloud className="w-5 h-5" />;
    
    // Clear sky
    if (code === 0) {
        return isDay ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-blue-300" />;
    }
    
    // Mainly clear, partly cloudy
    if (code <= 3) {
        return isDay ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-blue-300" />;
    }
    
    // Fog
    if (code >= 45 && code <= 48) {
        return <CloudFog className="w-5 h-5 text-gray-400" />;
    }
    
    // Drizzle and rain
    if (code >= 51 && code <= 67) {
        return <CloudRain className="w-5 h-5 text-blue-400" />;
    }
    
    // Snow
    if (code >= 71 && code <= 77) {
        return <CloudSnow className="w-5 h-5 text-blue-200" />;
    }
    
    // Rain showers
    if (code >= 80 && code <= 82) {
        return <CloudRain className="w-5 h-5 text-blue-400" />;
    }
    
    // Snow showers
    if (code >= 85 && code <= 86) {
        return <CloudSnow className="w-5 h-5 text-blue-200" />;
    }
    
    // Thunderstorm
    if (code >= 95 && code <= 99) {
        return <CloudLightning className="w-5 h-5 text-yellow-400" />;
    }
    
    return <Cloud className="w-5 h-5 text-gray-400" />;
};

interface CurrentWeatherCardProps {
    peakId: string;
    className?: string;
    compact?: boolean;
}

/**
 * Displays current weather conditions for a peak.
 * Fetches data from Open-Meteo API via backend endpoint.
 * Caches data for 30 minutes.
 */
const CurrentWeatherCard = ({ peakId, className, compact = false }: CurrentWeatherCardProps) => {
    const { data: weather, isLoading, error } = useQuery({
        queryKey: ["peakWeather", peakId],
        queryFn: () => getPeakWeather(peakId),
        staleTime: 30 * 60 * 1000, // 30 minutes
        gcTime: 60 * 60 * 1000, // 1 hour
    });

    if (isLoading) {
        return (
            <div className={cn(
                "flex items-center justify-center p-3 rounded-lg bg-card border border-border/70",
                className
            )}>
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                <span className="ml-2 text-xs text-muted-foreground">Loading weather...</span>
            </div>
        );
    }

    if (error || !weather || weather.temperature === null) {
        return null; // Don't show anything if weather unavailable
    }

    const tempF = Math.round(celsiusToFahrenheit(weather.temperature));
    const feelsLikeF = weather.feelsLike !== null ? Math.round(celsiusToFahrenheit(weather.feelsLike)) : null;
    const windMph = weather.windSpeed !== null ? Math.round(kmhToMph(weather.windSpeed)) : null;
    const description = getWeatherDescription(weather.weatherCode ?? undefined);

    if (compact) {
        return (
            <div className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg bg-card border border-border/70",
                className
            )}>
                {getWeatherIcon(weather.weatherCode, weather.isDay)}
                <span className="text-sm font-medium">{tempF}°F</span>
                {description && (
                    <span className="text-xs text-muted-foreground">{description}</span>
                )}
                {windMph !== null && windMph > 0 && (
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Wind className="w-3 h-3" />
                        {windMph}mph
                    </span>
                )}
            </div>
        );
    }

    return (
        <div className={cn(
            "p-3 rounded-lg bg-card border border-border/70 space-y-2",
            className
        )}>
            {/* Header with main temp and conditions */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {getWeatherIcon(weather.weatherCode, weather.isDay)}
                    <div>
                        <span className="text-lg font-semibold">{tempF}°F</span>
                        {feelsLikeF !== null && feelsLikeF !== tempF && (
                            <span className="text-xs text-muted-foreground ml-1">
                                (feels {feelsLikeF}°)
                            </span>
                        )}
                    </div>
                </div>
                {description && (
                    <span className="text-sm text-muted-foreground">{description}</span>
                )}
            </div>

            {/* Details row */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {windMph !== null && (
                    <div className="flex items-center gap-1">
                        <Wind className="w-3 h-3 text-primary/60" />
                        <span>{windMph} mph</span>
                    </div>
                )}
                {weather.humidity !== null && (
                    <div className="flex items-center gap-1">
                        <Droplets className="w-3 h-3 text-primary/60" />
                        <span>{Math.round(weather.humidity)}%</span>
                    </div>
                )}
                {weather.cloudCover !== null && (
                    <div className="flex items-center gap-1">
                        <Cloud className="w-3 h-3 text-primary/60" />
                        <span>{Math.round(weather.cloudCover)}% cover</span>
                    </div>
                )}
            </div>

            <div className="text-[10px] text-muted-foreground/60 pt-1">
                Current conditions • Updates every 30 min
            </div>
        </div>
    );
};

export default CurrentWeatherCard;

