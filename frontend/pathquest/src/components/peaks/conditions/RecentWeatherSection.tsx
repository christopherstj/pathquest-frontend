"use client";

import React from "react";
import { CloudRain, Snowflake } from "lucide-react";
import type { RecentWeather } from "@pathquest/shared/types";
import { cn } from "@/lib/utils";

interface RecentWeatherSectionProps {
    recentWeather: RecentWeather;
    className?: string;
}

const mmToInches = (mm: number) => (mm / 25.4).toFixed(2);
const cmToInches = (cm: number) => (cm / 2.54).toFixed(1);

const RecentWeatherSection = ({ recentWeather, className }: RecentWeatherSectionProps) => {
    if (!recentWeather.days || recentWeather.days.length === 0) return null;

    const hasPrecip = recentWeather.totalPrecipMm !== null && recentWeather.totalPrecipMm > 0;
    const hasSnow = recentWeather.totalSnowfallCm !== null && recentWeather.totalSnowfallCm > 0;

    if (!hasPrecip && !hasSnow) return null;

    return (
        <div className={cn("p-3 rounded-lg bg-card border border-border/70", className)}>
            <h4 className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                Last 7 Days
            </h4>
            <div className="flex gap-4">
                {hasPrecip && (
                    <div className="flex items-center gap-2">
                        <CloudRain className="w-4 h-4 text-blue-400" />
                        <div>
                            <span className="text-sm font-mono text-foreground">
                                {mmToInches(recentWeather.totalPrecipMm!)}
                            </span>
                            <span className="text-xs text-muted-foreground ml-1">
                                in precip
                            </span>
                        </div>
                    </div>
                )}
                {hasSnow && (
                    <div className="flex items-center gap-2">
                        <Snowflake className="w-4 h-4 text-sky-300" />
                        <div>
                            <span className="text-sm font-mono text-foreground">
                                {cmToInches(recentWeather.totalSnowfallCm!)}
                            </span>
                            <span className="text-xs text-muted-foreground ml-1">
                                in snow
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecentWeatherSection;
