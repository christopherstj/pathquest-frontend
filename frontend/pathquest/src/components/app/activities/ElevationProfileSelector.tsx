"use client";

import React, { useMemo, useCallback } from "react";
import { scaleLinear } from "@visx/scale";
import { max, min, bisector } from "@visx/vendor/d3-array";
import { AreaClosed, LinePath, Bar, Line } from "@visx/shape";
import { curveMonotoneX } from "@visx/curve";
import { Group } from "@visx/group";
import { LinearGradient } from "@visx/gradient";
import { localPoint } from "@visx/event";
import ParentSize from "@visx/responsive/lib/components/ParentSize";
import dayjs from "@/helpers/dayjs";
import metersToFt from "@/helpers/metersToFt";
import Activity from "@/typeDefs/Activity";
import { Mountain } from "lucide-react";

interface ChartValue {
    elevation: number;
    distance?: number;
    time?: number;
}

type ElevationProfileSelectorProps = {
    activity: Activity;
    value: dayjs.Dayjs | null;
    onChange: (value: dayjs.Dayjs) => void;
    existingSummitTimes?: string[];
};

const getDistance = (value: ChartValue) => value.distance;
const getElevation = (value: ChartValue) => value.elevation;
const getTime = (value: ChartValue) => value.time;
const bisectDistance = bisector<ChartValue, number>(
    (d) => d.distance ?? 0
).left;
const bisectTime = bisector<ChartValue, number>((d) => d.time ?? 0).left;

type ChartProps = {
    parentWidth: number;
    parentHeight: number;
    margin?: { top: number; right: number; bottom: number; left: number };
    value: dayjs.Dayjs | null;
    onChange: (value: dayjs.Dayjs) => void;
    activity: Activity;
    existingSummitTimes?: string[];
};

const ElevationChart = ({
    parentHeight,
    parentWidth,
    margin = { top: 8, right: 8, bottom: 8, left: 8 },
    value,
    onChange,
    activity,
    existingSummitTimes = [],
}: ChartProps) => {
    const { vert_profile, distance_stream, time_stream, start_time, timezone } =
        activity;

    const innerWidth = parentWidth - margin.left - margin.right;
    const innerHeight = parentHeight - margin.top - margin.bottom;

    const tz = timezone?.split(" ").slice(-1)[0] || dayjs.tz.guess();
    const startTimeDate = dayjs(start_time).tz(tz);

    const data: ChartValue[] = useMemo(
        () =>
            (vert_profile ?? []).map((elevation, i) => ({
                elevation,
                distance: distance_stream?.[i],
                time: time_stream?.[i],
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

    const timeScale = useMemo(() => {
        const minTime = min(data, getTime) ?? 0;
        const maxTime = max(data, getTime) ?? 1;
        return scaleLinear({
            range: [margin.left, innerWidth + margin.left],
            domain: [minTime, maxTime],
        });
    }, [data, margin.left, innerWidth]);

    const handleBarClick = useCallback(
        (
            event:
                | React.TouchEvent<SVGRectElement>
                | React.MouseEvent<SVGRectElement>
        ) => {
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

            const selectedTime = dayjs(start_time)
                .tz(tz)
                .add(getTime(d) ?? 0, "second");

            onChange(selectedTime);
        },
        [distanceScale, data, start_time, tz, onChange]
    );

    // Get x position for selected value
    const selectedX = useMemo(() => {
        if (!value) return null;
        const numSecs = value.unix() - startTimeDate.unix();
        if (numSecs < 0) return null;
        const index = bisectTime(data, numSecs, 1);
        if (!data[index]) return null;
        return distanceScale(getDistance(data[index]) ?? 0);
    }, [value, startTimeDate, data, distanceScale]);

    // Get positions for existing summit markers
    const summitMarkers = useMemo(() => {
        return existingSummitTimes
            .map((timestamp) => {
                const numSecs = dayjs(timestamp).tz(tz).unix() - startTimeDate.unix();
                if (numSecs < 0) return null;
                const index = bisectTime(data, numSecs, 1);
                if (!data[index]) return null;
                const x = distanceScale(getDistance(data[index]) ?? 0);
                const y = elevationScale(getElevation(data[index]) ?? 0);
                return { x, y };
            })
            .filter(Boolean) as { x: number; y: number }[];
    }, [existingSummitTimes, tz, startTimeDate, data, distanceScale, elevationScale]);

    if (parentWidth < 10 || !vert_profile || !distance_stream) {
        return (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                No elevation data available
            </div>
        );
    }

    return (
        <div className="relative w-full h-full">
            <svg
                width={parentWidth}
                height={parentHeight}
                className="overflow-visible cursor-crosshair"
            >
                <Group>
                    <LinearGradient
                        id="elevation-gradient"
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
                        fill="url(#elevation-gradient)"
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

                    {/* Clickable overlay */}
                    <Bar
                        x={margin.left}
                        y={margin.top}
                        width={innerWidth}
                        height={innerHeight}
                        fill="transparent"
                        onClick={handleBarClick}
                        onTouchEnd={handleBarClick}
                    />

                    {/* Existing summit markers */}
                    {summitMarkers.map((marker, i) => (
                        <g key={i} transform={`translate(${marker.x}, ${marker.y})`}>
                            <circle
                                r={6}
                                fill="hsl(var(--muted))"
                                stroke="hsl(var(--muted-foreground))"
                                strokeWidth={1.5}
                                opacity={0.6}
                            />
                        </g>
                    ))}

                    {/* Selected position line */}
                    {selectedX && (
                        <g>
                            <Line
                                from={{ x: selectedX, y: margin.top }}
                                to={{ x: selectedX, y: innerHeight + margin.top }}
                                stroke="hsl(var(--primary))"
                                strokeWidth={2}
                                pointerEvents="none"
                            />
                            <circle
                                cx={selectedX}
                                cy={elevationScale(
                                    getElevation(
                                        data[
                                            bisectTime(
                                                data,
                                                (value?.unix() ?? 0) - startTimeDate.unix(),
                                                1
                                            )
                                        ]
                                    ) ?? 0
                                )}
                                r={5}
                                fill="hsl(var(--primary))"
                                stroke="hsl(var(--background))"
                                strokeWidth={2}
                            />
                        </g>
                    )}
                </Group>
            </svg>

            {/* Elevation label */}
            {selectedX && value && (
                <div
                    className="absolute top-1 px-2 py-0.5 rounded bg-primary/90 text-primary-foreground text-xs font-mono pointer-events-none"
                    style={{ left: selectedX, transform: "translateX(-50%)" }}
                >
                    {Math.round(
                        metersToFt(
                            getElevation(
                                data[
                                    bisectTime(
                                        data,
                                        value.unix() - startTimeDate.unix(),
                                        1
                                    )
                                ]
                            ) ?? 0
                        )
                    ).toLocaleString()}{" "}
                    ft
                </div>
            )}
        </div>
    );
};

const ElevationProfileSelector = (
    props: ElevationProfileSelectorProps
) => {
    return (
        <div className="w-full h-[120px] rounded-lg bg-card/50 border border-border/50 overflow-hidden">
            <ParentSize>
                {({ width, height }) => (
                    <ElevationChart
                        parentWidth={width}
                        parentHeight={height}
                        {...props}
                    />
                )}
            </ParentSize>
        </div>
    );
};

export default ElevationProfileSelector;

