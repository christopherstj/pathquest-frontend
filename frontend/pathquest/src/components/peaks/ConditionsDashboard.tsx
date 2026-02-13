"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
    Cloud,
    AlertTriangle,
    Snowflake,
    Trophy,
    Flag,
    Check,
    Trees,
    Mountain,
    Shield,
    Landmark,
    Backpack,
    FileText,
} from "lucide-react";
import getPeakConditions from "@/actions/peaks/getPeakConditions";
import Peak from "@/typeDefs/Peak";
import Challenge from "@/typeDefs/Challenge";
import { useIsAuthenticated } from "@/hooks/useRequireAuth";
import ChallengeLinkItem from "@/components/lists/challenge-link-item";
import flagPeakForReview from "@/actions/peaks/flagPeakForReview";
import { MANAGER_NAMES } from "@/lib/public-land-utils";
import ConditionsSectionGroup from "./conditions/ConditionsSectionGroup";

// Condition components
import AlertsBanner from "./conditions/AlertsBanner";
import CurrentWeatherSection from "./conditions/CurrentWeatherSection";
import SummitWindowStrip from "./conditions/SummitWindowStrip";
import AvalancheSection from "./conditions/AvalancheSection";
import SnowpackSection from "./conditions/SnowpackSection";
import AirQualitySection from "./conditions/AirQualitySection";
import FireSection from "./conditions/FireSection";
import AccessSection from "./conditions/AccessSection";
import RecentWeatherSection from "./conditions/RecentWeatherSection";
import ForecastSection from "./conditions/ForecastSection";
import StreamFlowSection from "./conditions/StreamFlowSection";
import GearSection from "./conditions/GearSection";

interface ConditionsDashboardProps {
    peak: Peak;
    challenges?: Challenge[] | null;
    variant?: "full" | "inline";
}

/**
 * Get the appropriate icon for a public land type
 */
const getPublicLandIcon = (type: string) => {
    switch (type) {
        case "NP":
        case "NM":
        case "NRA":
        case "NCA":
            return Landmark;
        case "NF":
        case "NG":
        case "SF":
            return Trees;
        case "WILD":
        case "WSA":
        case "SW":
            return Shield;
        case "SP":
        case "SRA":
            return Mountain;
        default:
            return Landmark;
    }
};



// --- Loading Skeleton ---
const ConditionsLoadingSkeleton = () => (
    <div className="space-y-4 animate-pulse">
        {/* Weather hero skeleton */}
        <div className="p-4 rounded-xl bg-card border border-border/70">
            <div className="flex items-center gap-3 mb-3">
                <div className="w-6 h-6 rounded-full bg-muted" />
                <div className="h-8 w-20 rounded bg-muted" />
            </div>
            <div className="grid grid-cols-3 gap-3">
                <div className="h-4 rounded bg-muted" />
                <div className="h-4 rounded bg-muted" />
                <div className="h-4 rounded bg-muted" />
            </div>
        </div>
        {/* Summit window skeleton */}
        <div className="flex gap-1.5">
            {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex-1 h-12 rounded bg-muted" />
            ))}
        </div>
        {/* Section header skeletons */}
        <div className="border-t border-border/40 pt-3">
            <div className="h-4 w-32 rounded bg-muted" />
        </div>
        <div className="border-t border-border/40 pt-3">
            <div className="h-4 w-28 rounded bg-muted" />
        </div>
    </div>
);

const ConditionsDashboard = ({
    peak,
    challenges,
    variant = "full",
}: ConditionsDashboardProps) => {
    const { isAuthenticated } = useIsAuthenticated();
    const [flagging, setFlagging] = useState(false);
    const [flagged, setFlagged] = useState(false);

    const {
        data: conditions,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["peakConditions", peak.id],
        queryFn: () => getPeakConditions(peak.id),
        staleTime: 2 * 60 * 60 * 1000,
        gcTime: 4 * 60 * 60 * 1000,
    });

    const handleFlagForReview = async () => {
        if (flagging || flagged) return;
        setFlagging(true);
        const success = await flagPeakForReview(peak.id);
        setFlagging(false);
        if (success) {
            setFlagged(true);
        }
    };

    // --- Hazard detection ---
    const hasActiveAlerts =
        conditions?.nwsAlerts && conditions.nwsAlerts.activeCount > 0;
    const hasAvalanche = !!conditions?.avalanche;
    const hasNotableAir =
        conditions?.airQuality &&
        (conditions.airQuality.current.aqi > 50 ||
            conditions.airQuality.smokeImpact !== "none");
    const hasFire =
        conditions?.fireProximity &&
        conditions.fireProximity.nearbyFires.length > 0;
    const hasAccess =
        (conditions?.roadAccess &&
            (conditions.roadAccess.anyClosures ||
                conditions.roadAccess.anyChainLaw)) ||
        (conditions?.trailConditions &&
            conditions.trailConditions.activeAlertCount > 0);
    const hasAnySafety =
        hasAvalanche || hasNotableAir || hasFire || hasAccess;
    const hasSafetyHazardActive =
        hasNotableAir || hasFire || hasAccess;

    const hasSnowpack = !!conditions?.snotel;
    const hasStreamFlow =
        conditions?.streamFlow && conditions.streamFlow.crossingAlert;
    const hasAnySnowWater = hasSnowpack || hasStreamFlow;

    const hasForecast =
        conditions?.weather?.daily && conditions.weather.daily.length > 0;
    const hasRecentWeather = !!conditions?.recentWeather;
    const hasAnyForecast = hasForecast || hasRecentWeather;

    const hasGear =
        conditions?.gearRecommendations &&
        conditions.gearRecommendations.items.length > 0;

    const showPublicLand = variant === "full" && peak.publicLand;

    return (
        <div className="space-y-4 py-3">
            {isLoading ? (
                <ConditionsLoadingSkeleton />
            ) : error || !conditions ? (
                <div className="text-center py-8">
                    <Cloud className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
                    <p className="text-sm text-muted-foreground">
                        Conditions unavailable
                    </p>
                </div>
            ) : (
                <>
                    {/* Alerts Banner - top priority */}
                    {hasActiveAlerts && (
                        <AlertsBanner alerts={conditions.nwsAlerts!} />
                    )}

                    {/* Current Weather - hero card */}
                    {conditions.weather?.current && (
                        <CurrentWeatherSection
                            current={conditions.weather.current}
                            className="bg-gradient-to-br from-card to-accent/5"
                        />
                    )}

                    {/* Summit Window */}
                    {conditions.summitWindow && (
                        <SummitWindowStrip
                            summitWindow={conditions.summitWindow}
                        />
                    )}

                    {/* Conditions Report */}
                    {conditions.gearRecommendations?.conditionsSummary && (
                        <div className="p-3 rounded-lg bg-card border border-border/70 border-l-2 border-l-primary/50">
                            <div className="flex items-center gap-2 mb-2">
                                <FileText className="w-3.5 h-3.5 text-primary" />
                                <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                                    Conditions Report
                                </h4>
                            </div>
                            <p className="text-sm text-foreground/90 leading-relaxed">
                                {conditions.gearRecommendations.conditionsSummary}
                            </p>
                        </div>
                    )}

                    {/* Safety & Hazards */}
                    {hasAnySafety && (
                        <ConditionsSectionGroup
                            title="Safety & Hazards"
                            icon={
                                <AlertTriangle className="w-3.5 h-3.5" />
                            }
                            defaultOpen
                            badge={
                                hasSafetyHazardActive ? (
                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-destructive/10 text-destructive border border-destructive/20">
                                        Active
                                    </span>
                                ) : undefined
                            }
                            className={
                                hasSafetyHazardActive
                                    ? "bg-destructive/5 rounded-lg -mx-2 px-2"
                                    : undefined
                            }
                        >
                            {hasAvalanche && (
                                <AvalancheSection
                                    avalanche={conditions.avalanche!}
                                />
                            )}
                            {hasFire && (
                                <FireSection
                                    fireProximity={
                                        conditions.fireProximity!
                                    }
                                />
                            )}
                            {hasNotableAir && (
                                <AirQualitySection
                                    airQuality={conditions.airQuality!}
                                />
                            )}
                            {hasAccess && (
                                <AccessSection
                                    roadAccess={conditions.roadAccess}
                                    trailConditions={
                                        conditions.trailConditions
                                    }
                                />
                            )}
                        </ConditionsSectionGroup>
                    )}

                    {/* 7-Day Forecast */}
                    {hasAnyForecast && (
                        <ConditionsSectionGroup
                            title="7-Day Forecast"
                            icon={<Cloud className="w-3.5 h-3.5" />}
                            defaultOpen
                        >
                            {hasRecentWeather && (
                                <RecentWeatherSection
                                    recentWeather={
                                        conditions.recentWeather!
                                    }
                                />
                            )}
                            {hasForecast && (
                                <ForecastSection
                                    daily={conditions.weather!.daily!}
                                />
                            )}
                        </ConditionsSectionGroup>
                    )}

                    {/* Snowpack & Water */}
                    {hasAnySnowWater && (
                        <ConditionsSectionGroup
                            title="Snowpack & Water"
                            icon={<Snowflake className="w-3.5 h-3.5" />}
                            defaultOpen
                        >
                            {hasSnowpack && (
                                <SnowpackSection
                                    snotel={conditions.snotel!}
                                />
                            )}
                            {hasStreamFlow && (
                                <StreamFlowSection
                                    streamFlow={conditions.streamFlow!}
                                />
                            )}
                        </ConditionsSectionGroup>
                    )}

                    {/* Gear Recommendations */}
                    {hasGear && (
                        <ConditionsSectionGroup
                            title="Gear"
                            icon={<Backpack className="w-3.5 h-3.5" />}
                            defaultOpen
                        >
                            <GearSection
                                gear={conditions.gearRecommendations!}
                            />
                        </ConditionsSectionGroup>
                    )}

                    {/* Updated timestamp */}
                    {conditions.weatherUpdatedAt && (
                        <div className="text-center text-[9px] font-mono text-muted-foreground/40 uppercase tracking-widest pt-1">
                            Updated{" "}
                            {new Date(
                                conditions.weatherUpdatedAt
                            ).toLocaleTimeString([], {
                                hour: "numeric",
                                minute: "2-digit",
                            })}
                        </div>
                    )}
                </>
            )}

            {/* --- Full variant footer sections --- */}
            {variant === "full" && (
                <>
                    {/* Public Land */}
                    {showPublicLand && peak.publicLand && (
                        <div className="border-t border-border/40 pt-3 space-y-2">
                            <h3 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                {React.createElement(
                                    getPublicLandIcon(peak.publicLand.type),
                                    { className: "w-3.5 h-3.5 text-primary/70" }
                                )}
                                Public Land
                            </h3>
                            <div className="p-4 rounded-lg bg-card border border-border/70">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                        {React.createElement(
                                            getPublicLandIcon(
                                                peak.publicLand.type
                                            ),
                                            {
                                                className:
                                                    "w-5 h-5 text-primary",
                                            }
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-foreground leading-tight">
                                            {peak.publicLand.objectId ? (
                                                <Link
                                                    href={`/lands/${peak.publicLand.objectId}`}
                                                    className="hover:text-primary transition-colors"
                                                >
                                                    {peak.publicLand.name}
                                                </Link>
                                            ) : (
                                                peak.publicLand.name
                                            )}
                                        </h4>
                                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                                                {peak.publicLand.typeName}
                                            </span>
                                            {peak.publicLand.manager !== "UNK" && (
                                                <span className="text-xs text-muted-foreground">
                                                    {MANAGER_NAMES[peak.publicLand.manager] || peak.publicLand.manager}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Challenges */}
                    <div className="border-t border-border/40 pt-3 space-y-2">
                        <h3 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <Trophy className="w-3.5 h-3.5 text-primary/70" />
                            Part of {challenges?.length || 0} Challenge
                            {challenges?.length !== 1 ? "s" : ""}
                        </h3>
                        {challenges && challenges.length > 0 ? (
                            <div className="space-y-2">
                                {challenges.map((challenge) => (
                                    <ChallengeLinkItem
                                        key={challenge.id}
                                        challenge={challenge}
                                        showProgress={isAuthenticated}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-4 px-4 rounded-lg bg-muted/20 border border-border/50">
                                <Trophy className="w-6 h-6 mx-auto mb-1.5 text-muted-foreground/50" />
                                <p className="text-xs text-muted-foreground">
                                    Not part of any challenges yet
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Flag for Review */}
                    {isAuthenticated && (
                        <div className="pt-2 border-t border-border/30">
                            <button
                                onClick={handleFlagForReview}
                                disabled={flagging || flagged}
                                className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                                    flagged
                                        ? "bg-primary/10 text-primary cursor-default"
                                        : "bg-muted/30 hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                                } disabled:opacity-50`}
                            >
                                {flagged ? (
                                    <>
                                        <Check className="w-4 h-4" />
                                        Flagged for Review
                                    </>
                                ) : flagging ? (
                                    <>
                                        <Flag className="w-4 h-4 animate-pulse" />
                                        Flagging...
                                    </>
                                ) : (
                                    <>
                                        <Flag className="w-4 h-4" />
                                        Flag Coordinates for Review
                                    </>
                                )}
                            </button>
                            <p className="text-xs text-muted-foreground/70 text-center mt-1">
                                If this peak&apos;s location seems off, let
                                us know
                            </p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ConditionsDashboard;
