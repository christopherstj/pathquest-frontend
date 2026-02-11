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
    Thermometer,
    Wind,
    Droplets,
} from "lucide-react";
import type { WeatherForecastCurrent } from "@pathquest/shared/types";
import { cn } from "@/lib/utils";

interface CurrentWeatherSectionProps {
    current: WeatherForecastCurrent;
    className?: string;
}

const celsiusToFahrenheit = (c: number) => Math.round((c * 9) / 5 + 32);
const kmhToMph = (kmh: number) => Math.round(kmh * 0.621371);

const getWeatherIcon = (code: number | null, isDay: boolean | null) => {
    if (code === null) return <Cloud className="w-6 h-6 text-gray-400" />;
    if (code === 0)
        return isDay ? (
            <Sun className="w-6 h-6 text-amber-400" />
        ) : (
            <Moon className="w-6 h-6 text-blue-300" />
        );
    if (code <= 3)
        return isDay ? (
            <Sun className="w-6 h-6 text-amber-400" />
        ) : (
            <Moon className="w-6 h-6 text-blue-300" />
        );
    if (code >= 45 && code <= 48) return <CloudFog className="w-6 h-6 text-gray-400" />;
    if (code >= 51 && code <= 67) return <CloudRain className="w-6 h-6 text-blue-400" />;
    if (code >= 71 && code <= 77) return <CloudSnow className="w-6 h-6 text-blue-200" />;
    if (code >= 80 && code <= 82) return <CloudRain className="w-6 h-6 text-blue-400" />;
    if (code >= 85 && code <= 86) return <CloudSnow className="w-6 h-6 text-blue-200" />;
    if (code >= 95) return <CloudLightning className="w-6 h-6 text-yellow-400" />;
    return <Cloud className="w-6 h-6 text-gray-400" />;
};

const getWeatherDescription = (code: number | null): string => {
    if (code === null) return "Unknown";
    const descriptions: Record<number, string> = {
        0: "Clear sky",
        1: "Mainly clear",
        2: "Partly cloudy",
        3: "Overcast",
        45: "Foggy",
        48: "Rime fog",
        51: "Light drizzle",
        53: "Drizzle",
        55: "Dense drizzle",
        61: "Slight rain",
        63: "Moderate rain",
        65: "Heavy rain",
        66: "Freezing rain",
        67: "Heavy freezing rain",
        71: "Light snow",
        73: "Moderate snow",
        75: "Heavy snow",
        77: "Snow grains",
        80: "Rain showers",
        81: "Moderate showers",
        82: "Heavy showers",
        85: "Snow showers",
        86: "Heavy snow showers",
        95: "Thunderstorm",
        96: "Thunderstorm w/ hail",
        99: "Severe thunderstorm",
    };
    return descriptions[code] ?? "Unknown";
};

const CurrentWeatherSection = ({ current, className }: CurrentWeatherSectionProps) => {
    if (current.temperature === null) return null;

    const tempF = celsiusToFahrenheit(current.temperature);
    const feelsLikeF = current.feelsLike !== null ? celsiusToFahrenheit(current.feelsLike) : null;
    const windMph = current.windSpeed !== null ? kmhToMph(current.windSpeed) : null;

    return (
        <div className={cn("p-4 rounded-xl bg-card border border-border/70", className)}>
            {/* Main weather display */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    {getWeatherIcon(current.weatherCode, current.isDay)}
                    <div>
                        <span className="text-2xl font-mono text-foreground">
                            {tempF}°F
                        </span>
                        {feelsLikeF !== null && feelsLikeF !== tempF && (
                            <span className="text-xs text-muted-foreground ml-1.5">
                                feels {feelsLikeF}°
                            </span>
                        )}
                    </div>
                </div>
                <span className="text-sm text-muted-foreground">
                    {getWeatherDescription(current.weatherCode)}
                </span>
            </div>

            {/* Details row */}
            <div className="grid grid-cols-3 gap-3 text-sm">
                {windMph !== null && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Wind className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{windMph} mph</span>
                    </div>
                )}
                {current.humidity !== null && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Droplets className="w-3.5 h-3.5 text-blue-300" />
                        <span>{Math.round(current.humidity)}%</span>
                    </div>
                )}
                {current.precipitationProbability !== null && (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Thermometer className="w-3.5 h-3.5 text-orange-400" />
                        <span>{current.precipitationProbability}% precip</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CurrentWeatherSection;
