"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import getPeakConditions from "@/actions/peaks/getPeakConditions";
import SummitWindowStrip from "./conditions/SummitWindowStrip";
import CurrentWeatherSection from "./conditions/CurrentWeatherSection";
import RecentWeatherSection from "./conditions/RecentWeatherSection";
import ForecastSection from "./conditions/ForecastSection";

interface EnhancedConditionsProps {
    peakId: string;
    className?: string;
}

const EnhancedConditions = ({ peakId, className }: EnhancedConditionsProps) => {
    const { data: conditions, isLoading, error } = useQuery({
        queryKey: ["peakConditions", peakId],
        queryFn: () => getPeakConditions(peakId),
        staleTime: 15 * 60 * 1000, // 15 minutes
        gcTime: 60 * 60 * 1000, // 1 hour
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-4">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                <span className="ml-2 text-xs text-muted-foreground">Loading conditions...</span>
            </div>
        );
    }

    if (error || !conditions) {
        return null; // Silently fail — weather is not critical
    }

    return (
        <div className={className}>
            <div className="space-y-4">
                {/* Current Weather */}
                {conditions.weather?.current && (
                    <CurrentWeatherSection current={conditions.weather.current} />
                )}

                {/* Summit Window Strip */}
                {conditions.summitWindow && (
                    <SummitWindowStrip summitWindow={conditions.summitWindow} />
                )}

                {/* Recent Weather Summary */}
                {conditions.recentWeather && (
                    <RecentWeatherSection recentWeather={conditions.recentWeather} />
                )}

                {/* 7-Day Forecast */}
                {conditions.weather?.daily && conditions.weather.daily.length > 0 && (
                    <div className="space-y-2">
                        <h4 className="text-[10px] text-muted-foreground uppercase tracking-wider">
                            7-Day Forecast
                        </h4>
                        <ForecastSection daily={conditions.weather.daily} />
                    </div>
                )}

                {/* Updated timestamp */}
                {conditions.weatherUpdatedAt && (
                    <div className="text-[10px] text-muted-foreground/50 text-right">
                        Updated {new Date(conditions.weatherUpdatedAt).toLocaleTimeString([], {
                            hour: "numeric",
                            minute: "2-digit",
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EnhancedConditions;
