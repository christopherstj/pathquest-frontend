"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Cloud, Thermometer, Wind, Droplets, ArrowUp } from "lucide-react";
import type { WeatherData } from "@/app/api/weather/route";

interface Props {
    lat: number;
    lng: number;
    className?: string;
}

const getWindDirectionLabel = (degrees: number): string => {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
};

const CurrentConditions = ({ lat, lng, className = "" }: Props) => {
    const { data: weather, isLoading, error } = useQuery<WeatherData>({
        queryKey: ["weather", lat, lng],
        queryFn: async () => {
            const res = await fetch(`/api/weather?lat=${lat}&lng=${lng}`);
            if (!res.ok) throw new Error("Failed to fetch weather");
            return res.json();
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
        retry: 1,
    });

    if (isLoading) {
        return (
            <div className={`p-4 rounded-xl bg-card border border-border/70 animate-pulse ${className}`}>
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-4 h-4 bg-muted rounded" />
                    <div className="w-24 h-3 bg-muted rounded" />
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-16 h-10 bg-muted rounded" />
                    <div className="w-20 h-4 bg-muted rounded" />
                </div>
            </div>
        );
    }

    if (error || !weather) {
        return null; // Silently fail - weather is not critical
    }

    return (
        <div className={`p-4 rounded-xl bg-card border border-border/70 ${className}`}>
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <Cloud className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                    Current Conditions
                </span>
            </div>

            {/* Main weather display */}
            <div className="flex items-center gap-4 mb-3">
                <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-mono text-foreground">
                        {weather.temperature}
                    </span>
                    <span className="text-lg text-muted-foreground">°F</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-2xl">{weather.weatherIcon}</span>
                    <span className="text-xs text-muted-foreground">
                        {weather.weatherDescription}
                    </span>
                </div>
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-3 text-sm">
                {/* Feels like */}
                <div className="flex items-center gap-2">
                    <Thermometer className="w-3.5 h-3.5 text-orange-400" />
                    <span className="text-muted-foreground">Feels like</span>
                    <span className="text-foreground ml-auto font-mono">
                        {weather.temperatureFeelsLike}°
                    </span>
                </div>

                {/* Wind */}
                <div className="flex items-center gap-2">
                    <Wind className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-muted-foreground">Wind</span>
                    <span className="text-foreground ml-auto font-mono">
                        {weather.windSpeed}
                        <span className="text-xs text-muted-foreground ml-0.5">mph</span>
                    </span>
                </div>

                {/* Humidity */}
                <div className="flex items-center gap-2">
                    <Droplets className="w-3.5 h-3.5 text-blue-300" />
                    <span className="text-muted-foreground">Humidity</span>
                    <span className="text-foreground ml-auto font-mono">
                        {weather.humidity}%
                    </span>
                </div>

                {/* Wind direction */}
                <div className="flex items-center gap-2">
                    <ArrowUp
                        className="w-3.5 h-3.5 text-cyan-400"
                        style={{
                            transform: `rotate(${weather.windDirection}deg)`,
                        }}
                    />
                    <span className="text-muted-foreground">Direction</span>
                    <span className="text-foreground ml-auto font-mono">
                        {getWindDirectionLabel(weather.windDirection)}
                    </span>
                </div>
            </div>

            {/* Wind gusts warning (if significant) */}
            {weather.windGusts > weather.windSpeed + 10 && (
                <div className="mt-3 pt-3 border-t border-border/50">
                    <div className="flex items-center gap-2 text-amber-400 text-xs">
                        <Wind className="w-3.5 h-3.5" />
                        <span>
                            Gusts up to {weather.windGusts} mph
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CurrentConditions;

