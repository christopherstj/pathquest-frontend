"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
    Trees, MapPin, ChevronLeft, ChevronRight, LocateFixed,
    Thermometer, Wind, Snowflake, Mountain, Flame, AlertTriangle,
    CloudRain, Droplets, TrendingUp, TrendingDown, Minus,
    Users, User,
} from "lucide-react";
import type { PublicLandDetail, PublicLandConditions } from "@pathquest/shared/types";
import type { AvalancheDangerLevel } from "@pathquest/shared/types";
import { useQuery } from "@tanstack/react-query";
import getPublicLandPeaks from "@/actions/conditions/getPublicLandPeaks";
import metersToFt from "@/helpers/metersToFt";
import { cn } from "@/lib/utils";
import { dangerConfig } from "@/lib/avalanche-utils";

interface ExplorePublicLandContentProps {
    publicLandDetail: PublicLandDetail;
    publicLandConditions: PublicLandConditions | null;
    onPeakClick: (id: string) => void;
    onRecenter: () => void;
}

const DESIGNATION_NAMES: Record<string, string> = {
    NP: "National Park", NM: "National Monument", WILD: "Wilderness Area",
    WSA: "Wilderness Study Area", NRA: "National Recreation Area",
    NCA: "National Conservation Area", NWR: "National Wildlife Refuge",
    NF: "National Forest", NG: "National Grassland", SP: "State Park",
    SW: "State Wilderness", SRA: "State Recreation Area", SF: "State Forest",
};

const MANAGER_NAMES: Record<string, string> = {
    NPS: "National Park Service",
    USFS: "US Forest Service",
    BLM: "Bureau of Land Management",
    FWS: "US Fish & Wildlife Service",
};

const cToF = (c: number) => Math.round(c * 9 / 5 + 32);
const kmhToMph = (k: number) => Math.round(k * 0.621371);

const getAqiColor = (aqi: number) => {
    if (aqi <= 50) return "text-emerald-400";
    if (aqi <= 100) return "text-yellow-400";
    if (aqi <= 150) return "text-orange-400";
    return "text-red-400";
};

const getAqiBg = (aqi: number) => {
    if (aqi <= 50) return "bg-emerald-500/15";
    if (aqi <= 100) return "bg-yellow-500/15";
    if (aqi <= 150) return "bg-orange-500/15";
    return "bg-red-500/15";
};

const SnowTrendIcon = ({ trend }: { trend: string }) => {
    if (trend === "increasing") return <TrendingUp className="w-3 h-3 text-blue-400" />;
    if (trend === "decreasing") return <TrendingDown className="w-3 h-3 text-orange-400" />;
    return <Minus className="w-3 h-3 text-muted-foreground" />;
};

export const ExplorePublicLandContent = ({
    publicLandDetail,
    publicLandConditions,
    onPeakClick,
    onRecenter,
}: ExplorePublicLandContentProps) => {
    const [page, setPage] = useState(1);
    const detail = publicLandDetail;
    const conditions = publicLandConditions;

    const { data: peaksData } = useQuery({
        queryKey: ["publicLandPeaks", detail.objectId, page],
        queryFn: () => getPublicLandPeaks(detail.objectId, page, 20),
        placeholderData: (prev) => prev,
    });

    const typeName = DESIGNATION_NAMES[detail.designationType] || detail.designationType;
    const managerName = MANAGER_NAMES[detail.manager] || detail.manager;

    return (
        <div className="space-y-4 px-4 py-3">
            {/* Header */}
            <div className="px-1">
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                        <Trees className="w-5 h-5 text-emerald-400 shrink-0" />
                        <h2 className="text-lg font-semibold text-foreground truncate">{detail.name}</h2>
                    </div>
                    <button
                        onClick={onRecenter}
                        className="p-1.5 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors shrink-0"
                        aria-label="Show on map"
                        title="Show on map"
                    >
                        <LocateFixed className="w-4 h-4" />
                    </button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                        {typeName}
                    </span>
                    <span className="text-xs text-muted-foreground">{managerName}</span>
                    {conditions && (
                        <span className="text-xs text-muted-foreground">
                            &middot; {conditions.peakCount} peaks tracked
                        </span>
                    )}
                </div>
            </div>

            {/* Weather conditions */}
            {conditions?.weather && (
                <div className="space-y-2">
                    <h3 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-1">
                        Weather
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                        {conditions.weather.tempRangeCelsius && (
                            <div className="p-2.5 rounded-lg bg-card border border-border/70">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <Thermometer className="w-3 h-3 text-blue-400" />
                                    <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Temperature</span>
                                </div>
                                <div className="text-sm font-medium text-foreground">
                                    {cToF(conditions.weather.tempRangeCelsius.min)}° to {cToF(conditions.weather.tempRangeCelsius.max)}°F
                                </div>
                            </div>
                        )}
                        {conditions.weather.maxWindSpeedKmh !== null && (
                            <div className="p-2.5 rounded-lg bg-card border border-border/70">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <Wind className="w-3 h-3 text-cyan-400" />
                                    <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Max Wind</span>
                                </div>
                                <div className="text-sm font-medium text-foreground">
                                    {kmhToMph(conditions.weather.maxWindSpeedKmh)} mph
                                </div>
                            </div>
                        )}
                        {conditions.weather.maxPrecipProbability !== null && (
                            <div className="p-2.5 rounded-lg bg-card border border-border/70 col-span-2">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <CloudRain className="w-3 h-3 text-blue-400" />
                                    <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Precip Chance</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 h-2 rounded-full bg-muted/30 overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-blue-500 transition-all"
                                            style={{ width: `${conditions.weather.maxPrecipProbability}%` }}
                                        />
                                    </div>
                                    <span className="text-xs font-medium text-foreground w-8 text-right">
                                        {conditions.weather.maxPrecipProbability}%
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Snowpack */}
            {conditions?.snotel && (
                <div className="p-3 rounded-lg bg-card border border-border/70">
                    <div className="flex items-center gap-1.5 mb-2">
                        <Snowflake className="w-3.5 h-3.5 text-blue-300" />
                        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Snowpack</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <div className="text-lg font-semibold text-foreground">{conditions.snotel.maxSnowDepthIn.toFixed(0)}"</div>
                            <div className="text-[9px] text-muted-foreground">Max depth</div>
                        </div>
                        <div>
                            <div className="text-lg font-semibold text-foreground">{conditions.snotel.avgSnowDepthIn.toFixed(0)}"</div>
                            <div className="text-[9px] text-muted-foreground">Avg depth</div>
                        </div>
                        <div>
                            <div className="flex items-center gap-1">
                                <SnowTrendIcon trend={conditions.snotel.snowTrend} />
                                <span className="text-sm font-medium text-foreground capitalize">{conditions.snotel.snowTrend}</span>
                            </div>
                            <div className="text-[9px] text-muted-foreground">Trend</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Avalanche zones */}
            {conditions?.avalanche && conditions.avalanche.zones.length > 0 && (
                <div className="space-y-2">
                    <h3 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 px-1">
                        <Mountain className="w-3.5 h-3.5 text-orange-400/70" />
                        Avalanche Zones
                    </h3>
                    <div className="space-y-1.5">
                        {conditions.avalanche.zones.map((zone) => {
                            const config = dangerConfig[zone.maxDanger as AvalancheDangerLevel] ?? dangerConfig[0];
                            const barWidth = zone.maxDanger === 0 ? 8 : Math.max(15, (zone.maxDanger / 5) * 100);
                            return (
                                <Link
                                    key={`${zone.centerId}-${zone.zoneId}`}
                                    href={`/avalanche/${zone.centerId}/${zone.zoneId}`}
                                    className="block p-2.5 rounded-lg bg-card border border-border/70 hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-center justify-between gap-2 mb-1.5">
                                        <span className="text-xs font-medium text-foreground">{zone.zoneName}</span>
                                        <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0", config.color, config.bg)}>
                                            {config.label}
                                        </span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
                                        <div
                                            className={cn("h-full rounded-full transition-all", config.barColor)}
                                            style={{ width: `${barWidth}%` }}
                                        />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* NWS Alerts */}
            {conditions?.nwsAlerts && conditions.nwsAlerts.totalActiveAlerts > 0 && (
                <div className="space-y-2">
                    <h3 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 px-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-yellow-400/70" />
                        Active Alerts ({conditions.nwsAlerts.totalActiveAlerts})
                    </h3>
                    <div className="space-y-1.5">
                        {conditions.nwsAlerts.events.map((event, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-2 rounded-lg border",
                                    conditions.nwsAlerts!.maxSeverity === "Extreme"
                                        ? "bg-red-500/8 border-red-500/20"
                                        : conditions.nwsAlerts!.maxSeverity === "Severe"
                                        ? "bg-orange-500/8 border-orange-500/20"
                                        : "bg-yellow-500/8 border-yellow-500/20"
                                )}
                            >
                                <AlertTriangle className={cn(
                                    "w-3.5 h-3.5 shrink-0",
                                    conditions.nwsAlerts!.maxSeverity === "Extreme" ? "text-red-400" :
                                    conditions.nwsAlerts!.maxSeverity === "Severe" ? "text-orange-400" :
                                    "text-yellow-400"
                                )} />
                                <span className="text-xs font-medium text-foreground">{event}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Active fires */}
            {conditions?.fireProximity && conditions.fireProximity.fires && conditions.fireProximity.fires.length > 0 && (
                <div className="space-y-2">
                    <h3 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 px-1">
                        <Flame className="w-3.5 h-3.5 text-orange-400/70" />
                        Nearby Fires ({conditions.fireProximity.fires.length})
                    </h3>
                    <div className="space-y-1.5">
                        {conditions.fireProximity.fires.map((fire) => (
                            <Link
                                key={fire.incidentId}
                                href={`/fires/${fire.incidentId}`}
                                className={cn(
                                    "block p-2.5 rounded-lg border hover:bg-muted/50 transition-colors",
                                    fire.distanceKm <= 50 ? "bg-orange-500/8 border-orange-500/20" : "bg-card border-border/70"
                                )}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-medium text-foreground">{fire.name}</span>
                                    <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                                        {fire.distanceKm.toFixed(0)} km
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                                    {fire.acres != null && (
                                        <span>{fire.acres >= 1000 ? `${(fire.acres / 1000).toFixed(1)}k` : fire.acres.toFixed(0)} acres</span>
                                    )}
                                    {fire.percentContained != null && (
                                        <span>{fire.percentContained.toFixed(0)}% contained</span>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Air quality */}
            {conditions?.airQuality && (
                <div className={cn("p-2.5 rounded-lg border", getAqiBg(conditions.airQuality.worstAqi), "border-border/70")}>
                    <div className="flex items-center gap-1.5 mb-1">
                        <Wind className={cn("w-3 h-3", getAqiColor(conditions.airQuality.worstAqi))} />
                        <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Air Quality</span>
                    </div>
                    <div className={cn("text-sm font-medium", getAqiColor(conditions.airQuality.worstAqi))}>
                        AQI {conditions.airQuality.worstAqi}
                    </div>
                    <div className="text-[9px] text-muted-foreground">{conditions.airQuality.worstCategory}</div>
                </div>
            )}

            {/* Stream flow */}
            {conditions?.streamFlow && (conditions.streamFlow.anyHighWater || conditions.streamFlow.anyCrossingAlert) && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/8 border border-blue-500/20">
                    <Droplets className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="text-xs font-medium text-foreground">
                        {conditions.streamFlow.anyCrossingAlert ? "Stream crossing alerts active" : "High water detected in area"}
                    </span>
                </div>
            )}

            {/* Peaks list */}
            <div className="border-t border-border/40 pt-3">
                <h3 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-2 px-1">
                    <MapPin className="w-3.5 h-3.5 text-primary/70" />
                    Peaks {peaksData ? `(${peaksData.total})` : ""}
                </h3>
                {peaksData && peaksData.peaks.length > 0 ? (
                    <>
                        <div className="space-y-1">
                            {peaksData.peaks.map((peak) => {
                                const hasSummited = (peak.summits ?? 0) > 0;
                                const hasPublicSummits = (peak.public_summits ?? 0) > 0;
                                return (
                                    <button
                                        key={peak.id}
                                        onClick={() => onPeakClick(peak.id)}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors text-left"
                                    >
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                            hasSummited ? "bg-summited/20 text-summited" : "bg-primary/10 text-primary"
                                        )}>
                                            <Mountain className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-foreground truncate">{peak.name}</span>
                                                <span className="text-xs font-mono text-muted-foreground shrink-0 ml-2">
                                                    {peak.elevation ? `${Math.round(metersToFt(parseFloat(String(peak.elevation)))).toLocaleString()} ft` : ""}
                                                </span>
                                            </div>
                                            {peak.state && (
                                                <span className="text-[10px] text-muted-foreground">{peak.state}</span>
                                            )}
                                            {(hasPublicSummits || hasSummited) && (
                                                <div className="flex items-center gap-3 mt-0.5">
                                                    {hasPublicSummits && (
                                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                            <Users className="w-3 h-3" />
                                                            <span>{peak.public_summits} {peak.public_summits === 1 ? "summit" : "summits"}</span>
                                                        </div>
                                                    )}
                                                    {hasSummited && (
                                                        <div className="flex items-center gap-1 text-xs text-summited font-medium">
                                                            <User className="w-3 h-3" />
                                                            <span>{peak.summits} {peak.summits === 1 ? "summit" : "summits"}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                        {peaksData.totalPages > 1 && (
                            <div className="flex items-center justify-center gap-3 pt-3">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page <= 1}
                                    className="p-1.5 rounded-md hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="text-xs text-muted-foreground">
                                    Page {peaksData.page} of {peaksData.totalPages}
                                </span>
                                <button
                                    onClick={() => setPage((p) => Math.min(peaksData.totalPages, p + 1))}
                                    disabled={page >= peaksData.totalPages}
                                    className="p-1.5 rounded-md hover:bg-muted/50 disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </>
                ) : peaksData ? (
                    <div className="text-center py-4">
                        <p className="text-xs text-muted-foreground">No peaks found in this area</p>
                    </div>
                ) : (
                    <div className="text-center py-4">
                        <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
                    </div>
                )}
            </div>

            {/* Source */}
            <div className="text-center pt-2">
                <span className="text-[9px] font-mono text-muted-foreground/40 uppercase tracking-widest">
                    Data from PAD-US &middot; USGS
                </span>
            </div>
        </div>
    );
};
