"use client";

import React, { useMemo, useCallback, useRef, useState } from "react";
import { scaleLinear } from "@visx/scale";
import { max, min, bisector } from "@visx/vendor/d3-array";
import { AreaClosed, LinePath, Bar, Line } from "@visx/shape";
import { curveMonotoneX } from "@visx/curve";
import { Group } from "@visx/group";
import { LinearGradient } from "@visx/gradient";
import { localPoint } from "@visx/event";
import ParentSize from "@visx/responsive/lib/components/ParentSize";
import metersToFt from "@/helpers/metersToFt";
import Activity from "@/typeDefs/Activity";
import Peak from "@/typeDefs/Peak";
import { Mountain } from "lucide-react";

interface ChartValue {
    elevation: number;
    distance: number;
    time: number;
    index: number;
}

type ActivityElevationProfileProps = {
    activity: Activity;
    peakSummits?: Peak[];
    onHover?: (coords: [number, number] | null) => void;
    height?: number;
};

const getDistance = (value: ChartValue) => value.distance;
const getElevation = (value: ChartValue) => value.elevation;
const bisectDistance = bisector<ChartValue, number>(
    (d) => d.distance ?? 0
).left;

// Convert meters to miles
const metersToMiles = (meters: number): number => {
    return meters / 1609.344;
};

// Format elapsed time from seconds
const formatElapsedTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

type ChartProps = {
    parentWidth: number;
    parentHeight: number;
    margin?: { top: number; right: number; bottom: number; left: number };
    activity: Activity;
    peakSummits?: Peak[];
    onHover?: (coords: [number, number] | null) => void;
};

const ElevationChart = ({
    parentHeight,
    parentWidth,
    margin = { top: 16, right: 8, bottom: 8, left: 8 },
    activity,
    peakSummits = [],
    onHover,
    onHoverPointChange,
}: ChartProps) => {
    const { vert_profile, distance_stream, time_stream, coords, start_time, timezone } = activity;
    const hoverRef = useRef<number | null>(null);
    const [hoveredPoint, setHoveredPoint] = React.useState<ChartValue | null>(null);

    const innerWidth = parentWidth - margin.left - margin.right;
    const innerHeight = parentHeight - margin.top - margin.bottom;

    const data: ChartValue[] = useMemo(
        () =>
            (vert_profile ?? []).map((elevation, i) => ({
                elevation,
                distance: distance_stream?.[i] ?? 0,
                time: time_stream?.[i] ?? 0,
                index: i,
            })),
        [vert_profile, distance_stream, time_stream]
    );

    const elevationScale = useMemo(() => {
        const maxElevation = max(data, getElevation) ?? 0;
        const minElevation = min(data, getElevation) ?? 0;
        return scaleLinear({
            range: [innerHeight + margin.top, margin.top],
            domain: [
                minElevation - 25,
                maxElevation + (maxElevation - minElevation) / 8,
            ],
        });
    }, [data, margin.top, innerHeight]);

    const distanceScale = useMemo(() => {
        const minDistance = min(data, getDistance) ?? 0;
        const maxDistance = max(data, getDistance) ?? 1;
        return scaleLinear({
            range: [margin.left, innerWidth + margin.left],
            domain: [minDistance, maxDistance],
        });
    }, [data, margin.left, innerWidth]);

    // Get positions for summit markers based on timestamps from peakSummits
    const summitMarkers = useMemo(() => {
        if (!peakSummits || peakSummits.length === 0 || !coords) return [];

        return peakSummits.flatMap((peak) => {
            if (!peak.ascents) return [];
            
            return peak.ascents.map((ascent) => {
                // Find the closest point in the activity based on timestamp
                if (!ascent.timestamp || !time_stream || !start_time) return null;

                const summitTime = new Date(ascent.timestamp).getTime();
                const activityStart = new Date(start_time).getTime();
                const elapsedSeconds = (summitTime - activityStart) / 1000;

                // Find closest index
                let closestIndex = 0;
                let minDiff = Infinity;
                for (let i = 0; i < time_stream.length; i++) {
                    const diff = Math.abs(time_stream[i] - elapsedSeconds);
                    if (diff < minDiff) {
                        minDiff = diff;
                        closestIndex = i;
                    }
                }

                const d = data[closestIndex];
                if (!d) return null;

                return {
                    x: distanceScale(d.distance),
                    y: elevationScale(d.elevation),
                    peakName: peak.name,
                };
            }).filter(Boolean);
        }) as { x: number; y: number; peakName: string }[];
    }, [peakSummits, coords, time_stream, start_time, data, distanceScale, elevationScale]);

    const handleMouseMove = useCallback(
        (
            event:
                | React.TouchEvent<SVGRectElement>
                | React.MouseEvent<SVGRectElement>
        ) => {
            if (!onHover || !coords) return;

            const point = localPoint(event);
            if (!point) return;

            const x0 = distanceScale.invert(point.x);
            const index = bisectDistance(data, x0, 1);
            const d0 = data[index - 1];
            const d1 = data[index];

            if (!d0) return;

            const d =
                d1 && getDistance(d1)
                    ? x0 - (getDistance(d0) ?? 0) > (getDistance(d1) ?? 0) - x0
                        ? d1
                        : d0
                    : d0;

            // Get the corresponding coordinates from the activity
            if (coords[d.index]) {
                hoverRef.current = d.index;
                setHoveredPoint(d);
                onHoverPointChange?.(d);
                onHover(coords[d.index] as [number, number]);
            }
        },
        [distanceScale, data, coords, onHover]
    );

    const handleMouseLeave = useCallback(() => {
        hoverRef.current = null;
        setHoveredPoint(null);
        onHoverPointChange?.(null);
        if (onHover) {
            onHover(null);
        }
    }, [onHover, onHoverPointChange]);

    if (parentWidth < 10 || !vert_profile || !distance_stream) {
        return (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                No elevation data available
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-col">
            <div className="relative flex-1">
                <svg
                    width={parentWidth}
                    height={parentHeight}
                    className="overflow-visible cursor-crosshair"
                >
                    <Group>
                        <LinearGradient
                            id="elevation-gradient-activity"
                            from="#22c55e"
                            fromOpacity={0.6}
                            to="#22c55e"
                            toOpacity={0.1}
                        />

                        {/* Area fill */}
                        <AreaClosed<ChartValue>
                            data={data}
                            x={(d) => distanceScale(getDistance(d) ?? 0)}
                            y={(d) => elevationScale(getElevation(d) ?? 0)}
                            yScale={elevationScale}
                            strokeWidth={0}
                            fill="url(#elevation-gradient-activity)"
                            curve={curveMonotoneX}
                        />

                        {/* Line stroke */}
                        <LinePath
                            stroke="#22c55e"
                            strokeWidth={2.5}
                            data={data}
                            x={(d) => distanceScale(getDistance(d) ?? 0)}
                            y={(d) => elevationScale(getElevation(d) ?? 0)}
                            curve={curveMonotoneX}
                        />

                        {/* Hoverable/clickable overlay */}
                        <Bar
                            x={margin.left}
                            y={margin.top}
                            width={innerWidth}
                            height={innerHeight}
                            fill="transparent"
                            onMouseMove={handleMouseMove}
                            onMouseLeave={handleMouseLeave}
                            onTouchMove={handleMouseMove}
                            onTouchEnd={handleMouseLeave}
                        />

                        {/* Hover dot - snaps to the line at mouse X coordinate */}
                        {hoveredPoint && (
                            <circle
                                cx={distanceScale(getDistance(hoveredPoint))}
                                cy={elevationScale(getElevation(hoveredPoint))}
                                r={6}
                                fill="hsl(var(--primary))"
                                stroke="hsl(var(--background))"
                                strokeWidth={2}
                                pointerEvents="none"
                            />
                        )}

                        {/* Summit markers */}
                        {summitMarkers.map((marker, i) => (
                            <g key={i} transform={`translate(${marker.x}, ${marker.y})`}>
                                <circle
                                    r={8}
                                    fill="hsl(var(--primary))"
                                    stroke="hsl(var(--background))"
                                    strokeWidth={2}
                                />
                                <g transform="translate(-6, -6)">
                                    <Mountain className="w-3 h-3 text-primary-foreground" />
                                </g>
                            </g>
                        ))}
                    </Group>
                </svg>

                {/* Min/Max elevation labels */}
                <div className="absolute bottom-1 left-2 text-[10px] text-muted-foreground font-mono">
                    {Math.round(metersToFt(min(data, getElevation) ?? 0)).toLocaleString()} ft
                </div>
                <div className="absolute top-1 left-2 text-[10px] text-muted-foreground font-mono">
                    {Math.round(metersToFt(max(data, getElevation) ?? 0)).toLocaleString()} ft
                </div>
            </div>

        </div>
    );
};

const ActivityElevationProfile = ({
    activity,
    peakSummits,
    onHover,
    height = 160,
}: ActivityElevationProfileProps) => {
    const [hoveredPoint, setHoveredPoint] = useState<ChartValue | null>(null);

    return (
        <div 
            className="w-full rounded-lg bg-card/50 border border-border/50 flex flex-col overflow-hidden"
            style={{ height: height + 40 }} // Add space for info bar
        >
            <div style={{ height }} className="shrink-0">
                <ParentSize>
                    {({ width, height: chartHeight }) => (
                        <ElevationChart
                            parentWidth={width}
                            parentHeight={chartHeight}
                            activity={activity}
                            peakSummits={peakSummits}
                            onHover={onHover}
                            onHoverPointChange={setHoveredPoint}
                        />
                    )}
                </ParentSize>
            </div>
            
            {/* Info display - always visible to prevent layout shift */}
            <div className="flex items-center justify-center gap-4 py-2 bg-background/80 backdrop-blur-sm border-t border-border/50 text-xs shrink-0 h-10">
                {hoveredPoint ? (
                    <>
                        <div className="flex items-center gap-1">
                            <span className="font-mono font-medium text-foreground">
                                {Math.round(metersToFt(getElevation(hoveredPoint))).toLocaleString()} ft
                            </span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                            <span className="font-mono">
                                {metersToMiles(getDistance(hoveredPoint)).toFixed(2)} mi
                            </span>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                            <span className="font-mono">
                                {formatElapsedTime(hoveredPoint.time)}
                            </span>
                        </div>
                    </>
                ) : (
                    <span className="text-muted-foreground text-xs">
                        Hover over the chart
                    </span>
                )}
            </div>
        </div>
    );
};

export default ActivityElevationProfile;

