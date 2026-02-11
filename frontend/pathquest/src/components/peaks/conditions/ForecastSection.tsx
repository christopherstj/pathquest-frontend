"use client";

import React from "react";
import {
    Cloud,
    Sun,
    Moon,
    CloudRain,
    CloudSnow,
    CloudFog,
    CloudLightning,
    Wind,
    Droplets,
} from "lucide-react";
import type { WeatherForecastDaily } from "@pathquest/shared/types";
import { cn } from "@/lib/utils";

interface ForecastSectionProps {
    daily: WeatherForecastDaily[];
    className?: string;
}

import { celsiusToFahrenheit, kmhToMph } from "@/components/app/summits/SummitItem";

const getWeatherIcon = (code: number | null, size = "w-4 h-4") => {
    if (code === null) return <Cloud className={cn(size, "text-gray-400")} />;
    if (code === 0) return <Sun className={cn(size, "text-amber-400")} />;
    if (code <= 3) return <Sun className={cn(size, "text-amber-400")} />;
    if (code >= 45 && code <= 48) return <CloudFog className={cn(size, "text-gray-400")} />;
    if (code >= 51 && code <= 67) return <CloudRain className={cn(size, "text-blue-400")} />;
    if (code >= 71 && code <= 77) return <CloudSnow className={cn(size, "text-blue-200")} />;
    if (code >= 80 && code <= 82) return <CloudRain className={cn(size, "text-blue-400")} />;
    if (code >= 85 && code <= 86) return <CloudSnow className={cn(size, "text-blue-200")} />;
    if (code >= 95) return <CloudLightning className={cn(size, "text-yellow-400")} />;
    return <Cloud className={cn(size, "text-gray-400")} />;
};

const getDayLabel = (dateStr: string): string => {
    const date = new Date(dateStr + "T12:00:00");
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const diffDays = Math.round(
        (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
};

const ForecastSection = ({ daily, className }: ForecastSectionProps) => {
    if (!daily || daily.length === 0) return null;

    return (
        <div className={cn("space-y-1.5", className)}>
            {daily.map((day) => (
                <div
                    key={day.date}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg bg-card border border-border/50 text-sm"
                >
                    {/* Day label */}
                    <span className="w-16 text-xs text-muted-foreground truncate">
                        {getDayLabel(day.date)}
                    </span>

                    {/* Weather icon */}
                    {getWeatherIcon(day.weatherCode)}

                    {/* Temp range */}
                    <div className="flex items-baseline gap-1 min-w-[4.5rem]">
                        <span className="font-mono text-foreground">
                            {day.tempHigh !== null ? Math.round(celsiusToFahrenheit(day.tempHigh)) : "--"}°
                        </span>
                        <span className="text-xs text-muted-foreground">/</span>
                        <span className="font-mono text-muted-foreground text-xs">
                            {day.tempLow !== null ? Math.round(celsiusToFahrenheit(day.tempLow)) : "--"}°
                        </span>
                    </div>

                    {/* Precip probability */}
                    {day.precipProbability !== null && day.precipProbability > 0 && (
                        <div className="flex items-center gap-0.5 text-xs text-blue-400">
                            <Droplets className="w-3 h-3" />
                            {day.precipProbability}%
                        </div>
                    )}

                    {/* Wind */}
                    {day.windSpeed !== null && (
                        <div className="flex items-center gap-0.5 text-xs text-muted-foreground ml-auto">
                            <Wind className="w-3 h-3" />
                            {Math.round(kmhToMph(day.windSpeed))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default ForecastSection;
