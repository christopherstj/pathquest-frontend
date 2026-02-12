"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import type { AirQuality } from "@pathquest/shared/types";
import { cn } from "@/lib/utils";

interface AirQualitySectionProps {
    airQuality: AirQuality;
    className?: string;
}

const getAqiConfig = (aqi: number): { label: string; color: string; bg: string } => {
    if (aqi <= 50) return { label: "Good", color: "text-emerald-500", bg: "bg-emerald-500/20" };
    if (aqi <= 100) return { label: "Moderate", color: "text-yellow-500", bg: "bg-yellow-500/20" };
    if (aqi <= 150) return { label: "USG", color: "text-orange-500", bg: "bg-orange-500/20" };
    if (aqi <= 200) return { label: "Unhealthy", color: "text-red-500", bg: "bg-red-500/20" };
    if (aqi <= 300) return { label: "Very Unhealthy", color: "text-purple-500", bg: "bg-purple-500/20" };
    return { label: "Hazardous", color: "text-rose-200", bg: "bg-rose-900/40" };
};

const AirQualitySection = ({ airQuality, className }: AirQualitySectionProps) => {
    const config = getAqiConfig(airQuality.current.aqi);
    const showSmoke = airQuality.smokeImpact === "likely" || airQuality.smokeImpact === "active";

    return (
        <div className={cn("p-3 rounded-lg bg-card border border-border/70", className)}>
            <h4 className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                Air Quality
            </h4>

            <div className="flex items-center gap-3">
                <span className="text-2xl font-mono text-foreground">
                    {airQuality.current.aqi}
                </span>
                <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", config.color, config.bg)}>
                    {config.label}
                </span>
            </div>

            {airQuality.current.pm25 !== null && (
                <span className="text-xs text-muted-foreground mt-1 block">
                    PM2.5: {airQuality.current.pm25.toFixed(1)} &micro;g/m&sup3;
                </span>
            )}

            {showSmoke && (
                <div className="flex items-center gap-2 mt-2 p-2 rounded-md bg-orange-900/30 border border-orange-500/30">
                    <AlertTriangle className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                    <span className="text-xs text-orange-300">
                        Wildfire smoke may be affecting air quality
                    </span>
                </div>
            )}
        </div>
    );
};

export default AirQualitySection;
