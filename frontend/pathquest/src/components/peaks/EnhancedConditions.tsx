"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import getPeakConditions from "@/actions/peaks/getPeakConditions";
import SummitWindowStrip from "./conditions/SummitWindowStrip";
import CurrentWeatherSection from "./conditions/CurrentWeatherSection";
import RecentWeatherSection from "./conditions/RecentWeatherSection";
import ForecastSection from "./conditions/ForecastSection";
import AlertsBanner from "./conditions/AlertsBanner";
import AvalancheSection from "./conditions/AvalancheSection";
import SnowpackSection from "./conditions/SnowpackSection";
import AirQualitySection from "./conditions/AirQualitySection";
import FireSection from "./conditions/FireSection";
import AccessSection from "./conditions/AccessSection";
import StreamFlowSection from "./conditions/StreamFlowSection";
import GearSection from "./conditions/GearSection";

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
                {/* Safety alerts first */}
                {conditions.nwsAlerts && conditions.nwsAlerts.activeCount > 0 && (
                    <AlertsBanner alerts={conditions.nwsAlerts} />
                )}

                {/* Current Weather */}
                {conditions.weather?.current && (
                    <CurrentWeatherSection current={conditions.weather.current} />
                )}

                {/* Summit Window Strip */}
                {conditions.summitWindow && (
                    <SummitWindowStrip summitWindow={conditions.summitWindow} />
                )}

                {/* Avalanche */}
                {conditions.avalanche && (
                    <AvalancheSection avalanche={conditions.avalanche} />
                )}

                {/* Snowpack */}
                {conditions.snotel && (
                    <SnowpackSection snotel={conditions.snotel} />
                )}

                {/* Air Quality - only show if notable */}
                {conditions.airQuality && (conditions.airQuality.current.aqi > 50 || conditions.airQuality.smokeImpact !== "none") && (
                    <AirQualitySection airQuality={conditions.airQuality} />
                )}

                {/* Fire Proximity */}
                {conditions.fireProximity && conditions.fireProximity.nearbyFires.length > 0 && (
                    <FireSection fireProximity={conditions.fireProximity} />
                )}

                {/* Access */}
                {((conditions.roadAccess && (conditions.roadAccess.anyClosures || conditions.roadAccess.anyChainLaw)) ||
                  (conditions.trailConditions && conditions.trailConditions.activeAlertCount > 0)) && (
                    <AccessSection roadAccess={conditions.roadAccess} trailConditions={conditions.trailConditions} />
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

                {/* Stream Flow - only if crossing alert */}
                {conditions.streamFlow && conditions.streamFlow.crossingAlert && (
                    <StreamFlowSection streamFlow={conditions.streamFlow} />
                )}

                {/* Gear Recommendations */}
                {conditions.gearRecommendations && conditions.gearRecommendations.items.length > 0 && (
                    <GearSection gear={conditions.gearRecommendations} />
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
