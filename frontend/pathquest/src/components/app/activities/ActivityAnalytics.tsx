"use client";

import React, { useMemo } from "react";
import { scaleLinear } from "@visx/scale";
import { max, min } from "@visx/vendor/d3-array";
import { AreaClosed, LinePath } from "@visx/shape";
import { curveNatural } from "@visx/curve";
import { Group } from "@visx/group";
import { LinearGradient } from "@visx/gradient";
import ParentSize from "@visx/responsive/lib/components/ParentSize";
import Activity from "@/typeDefs/Activity";
import metersToFt from "@/helpers/metersToFt";
import { TrendingUp, Clock, Gauge, BarChart3, Mountain, ArrowUp } from "lucide-react";

interface ActivityAnalyticsProps {
    activity: Activity;
}

// Convert meters to miles
const metersToMiles = (meters: number): number => {
    return meters / 1609.344;
};

// Format duration from seconds
const formatDuration = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

// Format pace (min/mile)
const formatPace = (metersPerSecond: number): string => {
    if (metersPerSecond <= 0) return "—";
    const minutesPerMile = 26.8224 / metersPerSecond; // 1609.344 meters/mile / 60 seconds
    const mins = Math.floor(minutesPerMile);
    const secs = Math.round((minutesPerMile - mins) * 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
};

// Climbing segment interface
interface ClimbingSegment {
    id: number;
    startDistance: number;
    endDistance: number;
    startElevation: number;
    endElevation: number;
    elevationGain: number;
    distance: number;
    avgGrade: number;
    time: number;
}

// Cumulative elevation point interface
interface CumulativeElevationPoint {
    distance: number;
    elevation: number;
    cumulativeGain: number;
    cumulativeLoss: number;
}

const ActivityAnalytics = ({ activity }: ActivityAnalyticsProps) => {
    const { vert_profile, distance_stream, time_stream, gain, distance } = activity;

    // Calculate derived stats
    const stats = useMemo(() => {
        if (!vert_profile || !distance_stream || !time_stream) {
            return null;
        }

        const totalTime = time_stream[time_stream.length - 1] || 0;
        const totalDistance = distance_stream[distance_stream.length - 1] || 0;
        const avgSpeed = totalTime > 0 ? totalDistance / totalTime : 0; // m/s

        // Calculate grade data
        const gradeData: { distance: number; grade: number }[] = [];
        for (let i = 1; i < vert_profile.length; i++) {
            const elevChange = vert_profile[i] - vert_profile[i - 1];
            const distChange = distance_stream[i] - distance_stream[i - 1];
            if (distChange > 0) {
                const grade = (elevChange / distChange) * 100;
                gradeData.push({
                    distance: distance_stream[i],
                    grade: Math.max(-50, Math.min(50, grade)), // Clamp to reasonable range
                });
            }
        }

        // Calculate climbing segments (grade > 2% for at least 0.25 miles)
        // With grace period: brief flat/downhill sections (<200m) don't break the climb
        const MIN_GRADE = 2; // %
        const MIN_DISTANCE = 400; // meters (~0.25 miles)
        const GRACE_DISTANCE = 200; // meters (~0.12 miles) - flat sections shorter than this don't break the climb
        const climbingSegments: ClimbingSegment[] = [];
        
        let segmentStart: number | null = null;
        let segmentStartElev = 0;
        let segmentStartTime = 0;
        let segmentId = 1;
        let flatSectionStart: number | null = null; // Track when we enter a flat/downhill section
        let lastClimbingIdx = 0; // Track the last point that was actually climbing

        for (let i = 1; i < vert_profile.length; i++) {
            const elevChange = vert_profile[i] - vert_profile[i - 1];
            const distChange = distance_stream[i] - distance_stream[i - 1];
            const grade = distChange > 0 ? (elevChange / distChange) * 100 : 0;

            if (grade >= MIN_GRADE) {
                // Climbing section
                if (segmentStart === null) {
                    // Start a new climb
                    segmentStart = i - 1;
                    segmentStartElev = vert_profile[i - 1];
                    segmentStartTime = time_stream[i - 1];
                }
                // Reset flat section tracking - we're climbing again
                flatSectionStart = null;
                lastClimbingIdx = i;
            } else {
                // Flat or downhill section
                if (segmentStart !== null) {
                    // We're in a climb - check if this flat section should end it
                    if (flatSectionStart === null) {
                        // Just started a flat section
                        flatSectionStart = i - 1;
                    }
                    
                    // Check if flat section has exceeded grace distance
                    const flatDistance = distance_stream[i] - distance_stream[flatSectionStart];
                    
                    if (flatDistance >= GRACE_DISTANCE) {
                        // Flat section too long - end the climb at the last climbing point
                        const segmentDistance = distance_stream[lastClimbingIdx] - distance_stream[segmentStart];
                        
                        if (segmentDistance >= MIN_DISTANCE) {
                            const segmentElevGain = vert_profile[lastClimbingIdx] - segmentStartElev;
                            const segmentTime = time_stream[lastClimbingIdx] - segmentStartTime;
                            const avgGrade = segmentDistance > 0 ? (segmentElevGain / segmentDistance) * 100 : 0;
                            
                            // Only add segments with positive elevation gain and positive average grade
                            if (segmentElevGain > 0 && avgGrade > 0) {
                                climbingSegments.push({
                                    id: segmentId++,
                                    startDistance: distance_stream[segmentStart],
                                    endDistance: distance_stream[lastClimbingIdx],
                                    startElevation: segmentStartElev,
                                    endElevation: vert_profile[lastClimbingIdx],
                                    elevationGain: segmentElevGain,
                                    distance: segmentDistance,
                                    avgGrade,
                                    time: segmentTime,
                                });
                            }
                        }
                        segmentStart = null;
                        flatSectionStart = null;
                    }
                }
            }
        }

        // Handle segment that ends at the end of the activity
        if (segmentStart !== null) {
            // Use lastClimbingIdx if we ended in a flat section, otherwise use the last point
            const segmentEndIdx = flatSectionStart !== null ? lastClimbingIdx : vert_profile.length - 1;
            const segmentDistance = distance_stream[segmentEndIdx] - distance_stream[segmentStart];
            
            if (segmentDistance >= MIN_DISTANCE) {
                const segmentElevGain = vert_profile[segmentEndIdx] - segmentStartElev;
                const segmentTime = time_stream[segmentEndIdx] - segmentStartTime;
                const avgGrade = segmentDistance > 0 ? (segmentElevGain / segmentDistance) * 100 : 0;
                
                // Only add segments with positive elevation gain and positive average grade
                if (segmentElevGain > 0 && avgGrade > 0) {
                    climbingSegments.push({
                        id: segmentId++,
                        startDistance: distance_stream[segmentStart],
                        endDistance: distance_stream[segmentEndIdx],
                        startElevation: segmentStartElev,
                        endElevation: vert_profile[segmentEndIdx],
                        elevationGain: segmentElevGain,
                        distance: segmentDistance,
                        avgGrade,
                        time: segmentTime,
                    });
                }
            }
        }

        // Sort by elevation gain (largest first)
        climbingSegments.sort((a, b) => b.elevationGain - a.elevationGain);

        // Calculate cumulative elevation data
        const cumulativeElevation: CumulativeElevationPoint[] = [];
        let cumulativeGain = 0;
        let cumulativeLoss = 0;

        for (let i = 0; i < vert_profile.length; i++) {
            if (i > 0) {
                const elevChange = vert_profile[i] - vert_profile[i - 1];
                if (elevChange > 0) {
                    cumulativeGain += elevChange;
                } else {
                    cumulativeLoss += Math.abs(elevChange);
                }
            }
            
            cumulativeElevation.push({
                distance: distance_stream[i],
                elevation: vert_profile[i],
                cumulativeGain,
                cumulativeLoss,
            });
        }

        // Calculate splits (per mile)
        const splits: { mile: number; time: number; pace: string }[] = [];
        let currentMile = 1;
        let lastMileTime = 0;
        
        for (let i = 0; i < distance_stream.length; i++) {
            const miles = metersToMiles(distance_stream[i]);
            if (miles >= currentMile) {
                const splitTime = time_stream[i] - lastMileTime;
                splits.push({
                    mile: currentMile,
                    time: splitTime,
                    pace: formatDuration(splitTime),
                });
                lastMileTime = time_stream[i];
                currentMile++;
            }
        }

        // Add partial last mile if exists
        const finalMiles = metersToMiles(totalDistance);
        if (finalMiles > splits.length) {
            const partialDistance = finalMiles - splits.length;
            const partialTime = totalTime - lastMileTime;
            if (partialDistance > 0.1) {
                splits.push({
                    mile: splits.length + 1,
                    time: partialTime / partialDistance, // Normalize to full mile equivalent
                    pace: formatDuration(partialTime / partialDistance),
                });
            }
        }

        return {
            totalTime,
            totalDistance,
            avgSpeed,
            avgPace: formatPace(avgSpeed),
            gradeData,
            climbingSegments,
            cumulativeElevation,
            splits,
        };
    }, [vert_profile, distance_stream, time_stream]);

    if (!stats) {
        return (
            <div className="text-center py-10">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-sm font-medium text-foreground mb-1">
                    No Analytics Available
                </h3>
                <p className="text-xs text-muted-foreground">
                    This activity doesn&apos;t have enough data for analytics.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-card border border-border/70">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <Clock className="w-3.5 h-3.5" />
                        Moving Time
                    </div>
                    <p className="text-lg font-mono text-foreground">
                        {formatDuration(stats.totalTime)}
                    </p>
                </div>
                <div className="p-3 rounded-xl bg-card border border-border/70">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <Gauge className="w-3.5 h-3.5" />
                        Avg Pace
                    </div>
                    <p className="text-lg font-mono text-foreground">
                        {stats.avgPace} /mi
                    </p>
                </div>
            </div>

            {/* Grade Chart */}
            {stats.gradeData.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-orange-500" />
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Grade Analysis
                        </h3>
                    </div>
                    <GradeChart data={stats.gradeData} />
                </div>
            )}

            {/* Cumulative Elevation Chart */}
            {stats.cumulativeElevation.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <ArrowUp className="w-4 h-4 text-summited" />
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Cumulative Elevation
                        </h3>
                    </div>
                    <CumulativeElevationChart data={stats.cumulativeElevation} />
                </div>
            )}

            {/* Climbing Segments */}
            {stats.climbingSegments.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Mountain className="w-4 h-4 text-orange-500" />
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Major Climbs ({stats.climbingSegments.length})
                        </h3>
                    </div>
                    <ClimbingSegments segments={stats.climbingSegments} />
                </div>
            )}

            {/* Splits Table */}
            {stats.splits.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Mile Splits
                        </h3>
                    </div>
                    <SplitsTable splits={stats.splits} avgTime={stats.totalTime / metersToMiles(stats.totalDistance)} />
                </div>
            )}
        </div>
    );
};

// Grade Chart Component
interface GradeChartProps {
    data: { distance: number; grade: number }[];
}

const GradeChart = ({ data }: GradeChartProps) => {
    return (
        <div className="w-full h-[100px] rounded-lg bg-card/50 border border-border/50 overflow-hidden">
            <ParentSize>
                {({ width, height }) => (
                    <GradeChartInner data={data} width={width} height={height} />
                )}
            </ParentSize>
        </div>
    );
};

const GradeChartInner = ({ data, width, height }: { data: { distance: number; grade: number }[]; width: number; height: number }) => {
    const margin = { top: 8, right: 8, bottom: 8, left: 8 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const xScale = useMemo(() => scaleLinear({
        range: [margin.left, innerWidth + margin.left],
        domain: [min(data, d => d.distance) ?? 0, max(data, d => d.distance) ?? 1],
    }), [data, margin.left, innerWidth]);

    const yScale = useMemo(() => {
        const maxGrade = Math.max(Math.abs(min(data, d => d.grade) ?? 0), Math.abs(max(data, d => d.grade) ?? 0), 15);
        return scaleLinear({
            range: [innerHeight + margin.top, margin.top],
            domain: [-maxGrade, maxGrade],
        });
    }, [data, margin.top, innerHeight]);

    const zeroY = yScale(0);

    return (
        <svg width={width} height={height}>
            <Group>
                {/* Zero line */}
                <line
                    x1={margin.left}
                    x2={innerWidth + margin.left}
                    y1={zeroY}
                    y2={zeroY}
                    stroke="hsl(var(--border))"
                    strokeWidth={1}
                    strokeDasharray="4,4"
                />

                {/* Positive gradient */}
                <LinearGradient
                    id="grade-positive"
                    from="#f97316"
                    fromOpacity={0.6}
                    to="#f97316"
                    toOpacity={0.1}
                />

                {/* Negative gradient */}
                <LinearGradient
                    id="grade-negative"
                    from="#3b82f6"
                    fromOpacity={0.1}
                    to="#3b82f6"
                    toOpacity={0.6}
                />

                {/* Area for positive grades */}
                <AreaClosed
                    data={data.map(d => ({ ...d, grade: Math.max(0, d.grade) }))}
                    x={(d) => xScale(d.distance)}
                    y={(d) => yScale(d.grade)}
                    y0={zeroY}
                    yScale={yScale}
                    fill="url(#grade-positive)"
                    curve={curveNatural}
                />

                {/* Area for negative grades */}
                <AreaClosed
                    data={data.map(d => ({ ...d, grade: Math.min(0, d.grade) }))}
                    x={(d) => xScale(d.distance)}
                    y={(d) => yScale(d.grade)}
                    y0={zeroY}
                    yScale={yScale}
                    fill="url(#grade-negative)"
                    curve={curveNatural}
                />

                {/* Line */}
                <LinePath
                    data={data}
                    x={(d) => xScale(d.distance)}
                    y={(d) => yScale(d.grade)}
                    stroke="hsl(var(--foreground))"
                    strokeWidth={1.5}
                    strokeOpacity={0.5}
                    curve={curveNatural}
                />
            </Group>
        </svg>
    );
};

// Cumulative Elevation Chart Component
interface CumulativeElevationChartProps {
    data: CumulativeElevationPoint[];
}

const CumulativeElevationChart = ({ data }: CumulativeElevationChartProps) => {
    return (
        <div className="w-full h-[120px] rounded-lg bg-card/50 border border-border/50 overflow-hidden">
            <ParentSize>
                {({ width, height }) => (
                    <CumulativeElevationChartInner data={data} width={width} height={height} />
                )}
            </ParentSize>
        </div>
    );
};

const CumulativeElevationChartInner = ({ data, width, height }: { data: CumulativeElevationPoint[]; width: number; height: number }) => {
    const margin = { top: 12, right: 8, bottom: 8, left: 8 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const xScale = useMemo(() => scaleLinear({
        range: [margin.left, innerWidth + margin.left],
        domain: [min(data, d => d.distance) ?? 0, max(data, d => d.distance) ?? 1],
    }), [data, margin.left, innerWidth]);

    const maxCumulativeGain = max(data, d => d.cumulativeGain) ?? 0;

    const yScale = useMemo(() => scaleLinear({
        range: [innerHeight + margin.top, margin.top],
        domain: [0, maxCumulativeGain * 1.1],
    }), [maxCumulativeGain, margin.top, innerHeight]);

    const finalGain = data[data.length - 1]?.cumulativeGain ?? 0;
    const finalLoss = data[data.length - 1]?.cumulativeLoss ?? 0;

    return (
        <svg width={width} height={height}>
            <Group>
                {/* Cumulative gain gradient */}
                <LinearGradient
                    id="cumulative-gain"
                    from="#22c55e"
                    fromOpacity={0.5}
                    to="#22c55e"
                    toOpacity={0.1}
                />

                {/* Cumulative loss gradient */}
                <LinearGradient
                    id="cumulative-loss"
                    from="#ef4444"
                    fromOpacity={0.3}
                    to="#ef4444"
                    toOpacity={0.05}
                />

                {/* Area for cumulative gain */}
                <AreaClosed
                    data={data}
                    x={(d) => xScale(d.distance)}
                    y={(d) => yScale(d.cumulativeGain)}
                    yScale={yScale}
                    fill="url(#cumulative-gain)"
                    curve={curveNatural}
                />

                {/* Line for cumulative gain */}
                <LinePath
                    data={data}
                    x={(d) => xScale(d.distance)}
                    y={(d) => yScale(d.cumulativeGain)}
                    stroke="#22c55e"
                    strokeWidth={2}
                    curve={curveNatural}
                />

                {/* Final values labels */}
                <text
                    x={innerWidth + margin.left - 4}
                    y={margin.top + 4}
                    textAnchor="end"
                    fontSize={10}
                    fontFamily="var(--font-mono)"
                    fill="#22c55e"
                >
                    +{Math.round(metersToFt(finalGain)).toLocaleString()} ft
                </text>
                <text
                    x={innerWidth + margin.left - 4}
                    y={margin.top + 16}
                    textAnchor="end"
                    fontSize={10}
                    fontFamily="var(--font-mono)"
                    fill="#ef4444"
                    opacity={0.8}
                >
                    -{Math.round(metersToFt(finalLoss)).toLocaleString()} ft
                </text>
            </Group>
        </svg>
    );
};

// Climbing Segments Component
interface ClimbingSegmentsProps {
    segments: ClimbingSegment[];
}

const ClimbingSegments = ({ segments }: ClimbingSegmentsProps) => {
    return (
        <div className="space-y-2">
            {segments.slice(0, 5).map((segment, idx) => (
                <div
                    key={segment.id}
                    className="p-3 rounded-lg bg-card border border-border/70"
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center">
                                <span className="text-xs font-bold text-orange-500">{idx + 1}</span>
                            </div>
                            <div className="text-sm font-medium text-foreground">
                                Climb {idx + 1}
                            </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-mono text-orange-500">
                            <TrendingUp className="w-3 h-3" />
                            {segment.avgGrade.toFixed(1)}%
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                            <p className="text-muted-foreground mb-0.5">Gain</p>
                            <p className="font-mono text-summited">
                                +{Math.round(metersToFt(segment.elevationGain)).toLocaleString()} ft
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground mb-0.5">Distance</p>
                            <p className="font-mono text-foreground">
                                {metersToMiles(segment.distance).toFixed(2)} mi
                            </p>
                        </div>
                        <div>
                            <p className="text-muted-foreground mb-0.5">Time</p>
                            <p className="font-mono text-foreground">
                                {formatDuration(segment.time)}
                            </p>
                        </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-border/50 flex justify-between text-[10px] text-muted-foreground">
                        <span>
                            {Math.round(metersToFt(segment.startElevation)).toLocaleString()} ft →{" "}
                            {Math.round(metersToFt(segment.endElevation)).toLocaleString()} ft
                        </span>
                        <span>
                            mi {metersToMiles(segment.startDistance).toFixed(1)} - {metersToMiles(segment.endDistance).toFixed(1)}
                        </span>
                    </div>
                </div>
            ))}
            {segments.length > 5 && (
                <p className="text-xs text-muted-foreground text-center py-1">
                    +{segments.length - 5} more climb{segments.length - 5 > 1 ? "s" : ""}
                </p>
            )}
        </div>
    );
};

// Splits Table Component
interface SplitsTableProps {
    splits: { mile: number; time: number; pace: string }[];
    avgTime: number;
}

const SplitsTable = ({ splits, avgTime }: SplitsTableProps) => {
    return (
        <div className="rounded-lg border border-border/50 overflow-hidden">
            <table className="w-full text-xs">
                <thead>
                    <tr className="bg-muted/30">
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">Mile</th>
                        <th className="px-3 py-2 text-right font-medium text-muted-foreground">Pace</th>
                        <th className="px-3 py-2 text-right font-medium text-muted-foreground">+/-</th>
                    </tr>
                </thead>
                <tbody>
                    {splits.map((split, i) => {
                        const diff = split.time - avgTime;
                        const diffStr = diff > 0 
                            ? `+${Math.round(diff)}s` 
                            : diff < 0 
                                ? `${Math.round(diff)}s`
                                : "—";
                        const isLast = i === splits.length - 1 && splits.length > 1;
                        
                        return (
                            <tr 
                                key={split.mile} 
                                className={`border-t border-border/30 ${isLast ? "text-muted-foreground" : ""}`}
                            >
                                <td className="px-3 py-2 font-mono">
                                    {isLast ? `${split.mile}*` : split.mile}
                                </td>
                                <td className="px-3 py-2 text-right font-mono">
                                    {split.pace}
                                </td>
                                <td className={`px-3 py-2 text-right font-mono ${
                                    diff < -10 ? "text-green-500" : 
                                    diff > 10 ? "text-red-500" : 
                                    "text-muted-foreground"
                                }`}>
                                    {isLast ? "—" : diffStr}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            {splits.length > 1 && (
                <div className="px-3 py-1.5 bg-muted/20 border-t border-border/30 text-[10px] text-muted-foreground">
                    * Partial mile
                </div>
            )}
        </div>
    );
};

export default ActivityAnalytics;
