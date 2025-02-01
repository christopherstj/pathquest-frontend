"use client";
import dayjs from "@/helpers/dayjs";
import React, { useMemo } from "react";
import {
    Tooltip,
    TooltipWithBounds,
    useTooltip,
    useTooltipInPortal,
    defaultStyles,
} from "@visx/tooltip";
import { scaleLinear } from "@visx/scale";
import { max, min, bisector } from "@visx/vendor/d3-array";
import { AreaClosed, Line, Bar, LinePath } from "@visx/shape";
import { curveMonotoneX } from "@visx/curve";
import { GridRows, GridColumns } from "@visx/grid";
import { localPoint } from "@visx/event";
import ParentSize from "@visx/responsive/lib/components/ParentSize";
import { Group } from "@visx/group";
import { LinearGradient } from "@visx/gradient";
import { useActivityDetail } from "@/state/ActivityDetailsContext";
import { useUser } from "@/state/UserContext";
import { Box, Typography, useTheme } from "@mui/material";
import ReprocessChartButton from "./ReprocessChartButton";
import { GeoJSONSource } from "mapbox-gl";
import getDistanceString from "@/helpers/getDistanceString";
import metersToFt from "@/helpers/metersToFt";
import getElevationString from "@/helpers/getElevationString";
import SummitGlyph from "./SummitGlyph";
import numSecsToHhmmss from "@/helpers/numSecsToHhmmss";
import Activity from "@/typeDefs/Activity";
import PeakSummit from "@/typeDefs/PeakSummit";

interface ChartValue {
    elevation: number;
    distance?: number;
    time?: number;
}

export type ChartSelectProps = {
    parentWidth: number;
    parentHeight: number;
    margin?: { top: number; right: number; bottom: number; left: number };
    value: dayjs.Dayjs | null;
    onChange: (value: dayjs.Dayjs) => void;
    activity: Activity;
    peakSummits: PeakSummit[];
};

const getDistance = (value: ChartValue) => value.distance;
const getElevation = (value: ChartValue) => value.elevation;
const getTime = (value: ChartValue) => value.time;
const bisectDistance = bisector<ChartValue, number>(
    (d) => d.distance ?? 0
).left;
const bisectTime = bisector<ChartValue, number>((d) => d.time ?? 0).left;

const tz = dayjs.tz.guess();

const CourseProfileTimeSelect = ({
    parentHeight,
    parentWidth,
    margin = { top: 0, right: 0, bottom: 0, left: 0 },
    value,
    onChange,
    activity,
    peakSummits,
}: ChartSelectProps) => {
    const { id, vertProfile, distanceStream, timeStream, startTime } = activity;
    const [{ user }] = useUser();

    const theme = useTheme();

    const { containerRef, containerBounds } = useTooltipInPortal({
        scroll: true,
        detectBounds: false,
    });

    const {
        showTooltip,
        hideTooltip,
        tooltipData,
        tooltipLeft = 0,
        tooltipTop = 0,
    } = useTooltip<ChartValue>({
        // initial tooltip state
        tooltipOpen: false,
    });

    const units = user?.units;

    const innerWidth = parentWidth - margin.left - margin.right;
    const innerHeight = parentHeight - margin.top - margin.bottom;

    const timezone = activity.timezone
        ? activity.timezone.split(" ").slice(-1)[0]
        : tz;
    const startTimeDate = dayjs(startTime).tz(timezone);

    const data: ChartValue[] = (vertProfile ?? []).map((elevation, i) => {
        return {
            elevation,
            distance: distanceStream?.[i],
            time: timeStream?.[i],
        };
    });

    const elevationScale = useMemo(() => {
        const maxElevation = max(data, getElevation);
        const minElevation = min(data, getElevation);
        return scaleLinear({
            range: [innerHeight + margin.top, margin.top],
            domain: [
                minElevation ? minElevation! - 25 : 0,
                maxElevation
                    ? maxElevation! + (maxElevation - (minElevation ?? 0)) / 8
                    : 0,
            ],
        });
    }, [margin.top, innerHeight]);
    const distanceScale = useMemo(() => {
        const minDistance = min(data, getDistance);
        const maxDistance = max(data, getDistance);
        return scaleLinear({
            range: [margin.left, innerWidth + margin.left],
            domain: [minDistance ?? 0, maxDistance ?? 1],
        });
    }, [margin.left, innerWidth]);
    const timeScale = useMemo(() => {
        const minTime = min(data, getTime);
        const maxTime = max(data, getTime);
        return scaleLinear({
            range: [margin.left, innerWidth + margin.left],
            domain: [minTime ?? 0, maxTime ?? 1],
        });
    }, [margin.left, innerWidth]);

    const closeTooltip = () => {
        hideTooltip();
    };

    const handleTooltip = React.useCallback(
        (
            event:
                | React.TouchEvent<SVGRectElement>
                | React.MouseEvent<SVGRectElement>
        ) => {
            const { x, y } = localPoint(event) || { x: 0 };
            const x0 = distanceScale.invert(x);
            const index = bisectDistance(data, x0, 1);
            const d0 = data[index - 1];
            const d1 = data[index];
            if (d1 && getDistance(d1)) {
                const d =
                    x0 - (getDistance(d0) ?? 0) > (getDistance(d1) ?? 0) - x0
                        ? d1
                        : d0;
                showTooltip({
                    tooltipData: d,
                    tooltipLeft: x,
                    tooltipTop: y,
                });
            } else {
                showTooltip({
                    tooltipData: d0,
                    tooltipLeft: x,
                    tooltipTop: y,
                });
            }
        },
        [showTooltip, distanceScale]
    );

    const getTooltipString = () => {
        if (!tooltipData) return "";
        return (
            <>
                {getDistanceString(
                    getDistance(tooltipData) ?? 0,
                    units ?? "metric"
                )}
                <br />
                {getElevationString(
                    getElevation(tooltipData) ?? 0,
                    units ?? "metric"
                )}
            </>
        );
    };

    const onBarClick = (
        event:
            | React.TouchEvent<SVGRectElement>
            | React.MouseEvent<SVGRectElement>
    ) => {
        const { x } = localPoint(event) || { x: 0 };
        const x0 = distanceScale.invert(x);
        if (!x0) return;
        const index = bisectDistance(data, x0, 1);
        const d0 = data[index - 1];
        const d1 = data[index];
        const d = x0 - (getTime(d0) ?? 0) > (getTime(d1) ?? 0) - x0 ? d1 : d0;
        console.log(numSecsToHhmmss(getTime(d) ?? 0));
        onChange(
            dayjs(startTime)
                .tz(timezone)
                .add(getTime(d) ?? 0, "second")
        );
    };

    const tooltipStyles = {
        ...defaultStyles,
        background: theme.palette.secondary.containerDim,
        color: theme.palette.secondary.onContainer,
    };

    if (parentWidth < 10) return null;

    if (!user) {
        return null;
    }

    if (!vertProfile || !distanceStream) {
        return (
            <Typography variant="body1">
                No elevation data available for this activity.
            </Typography>
        );
    }

    return (
        <Box sx={{ position: "relative" }} ref={containerRef}>
            <svg
                width={innerWidth}
                height={innerHeight}
                style={{ overflow: "visible" }}
            >
                <Group>
                    <LinearGradient
                        id="secondary-gradient"
                        from={theme.palette.secondary.onContainerDim}
                        fromOpacity={0.8}
                        to="rgba(0, 0, 0, 0)"
                        toOpacity={0.0}
                    />
                    <GridRows
                        left={margin.left}
                        scale={elevationScale}
                        width={innerWidth}
                        strokeDasharray="1,3"
                        strokeOpacity={0}
                        pointerEvents="none"
                    />
                    <AreaClosed<ChartValue>
                        data={data}
                        x={(d) => distanceScale(getDistance(d) ?? 0) ?? 0}
                        y={(d) => elevationScale(getElevation(d) ?? 0) ?? 0}
                        yScale={elevationScale}
                        strokeWidth={1}
                        fill="url(#secondary-gradient)"
                        curve={curveMonotoneX}
                    />
                    <LinePath
                        stroke={theme.palette.secondary.onContainer}
                        strokeWidth={2}
                        opacity={0.8}
                        data={data}
                        x={(d) => distanceScale(getDistance(d) ?? 0) ?? 0}
                        y={(d) => elevationScale(getElevation(d) ?? 0) ?? 0}
                        curve={curveMonotoneX}
                    />
                    <Bar
                        x={margin.left}
                        y={margin.top}
                        width={innerWidth}
                        height={innerHeight}
                        fill="transparent"
                        rx={14}
                        onTouchStart={handleTooltip}
                        onTouchMove={handleTooltip}
                        onMouseMove={handleTooltip}
                        onMouseLeave={closeTooltip}
                        onClick={onBarClick}
                        onTouchEnd={onBarClick}
                    />
                    {peakSummits
                        .flatMap((s) => s.ascents)
                        .map((a, i) => {
                            const numSecs =
                                dayjs(a.timestamp).tz(timezone).unix() -
                                startTimeDate.unix();
                            const x1 = timeScale(numSecs);
                            if (!x1 || x1 <= 0) return null;
                            const index = bisectTime(data, numSecs, 1);
                            const x = distanceScale(
                                getDistance(data[index]) ?? 0
                            );
                            const y =
                                elevationScale(
                                    getElevation(data[index]) ?? 0
                                ) ?? 0;
                            return <SummitGlyph key={i} left={x} top={y} />;
                        })}
                    {tooltipData && (
                        <g>
                            <Line
                                from={{ x: tooltipLeft, y: margin.top }}
                                to={{
                                    x: tooltipLeft,
                                    y: innerHeight + margin.top,
                                }}
                                stroke="#FFFFFF"
                                strokeWidth={1}
                                pointerEvents="none"
                            />
                        </g>
                    )}
                    {value && (
                        <g>
                            <Line
                                from={{
                                    x: distanceScale(
                                        data[
                                            bisectTime(
                                                data,
                                                value.unix() -
                                                    startTimeDate.unix(),
                                                1
                                            )
                                        ].distance ?? 0
                                    ),
                                    y: margin.top,
                                }}
                                to={{
                                    x: distanceScale(
                                        data[
                                            bisectTime(
                                                data,
                                                value.unix() -
                                                    startTimeDate.unix(),
                                                1
                                            )
                                        ].distance ?? 0
                                    ),
                                    y: innerHeight + margin.top,
                                }}
                                stroke={theme.palette.primary.onContainer}
                                strokeWidth={2}
                                pointerEvents="none"
                            />
                        </g>
                    )}
                </Group>
            </svg>
            {tooltipData && (
                <div>
                    <TooltipWithBounds
                        key={Math.random()}
                        top={tooltipTop - 12}
                        left={tooltipLeft}
                        style={tooltipStyles}
                    >
                        <Typography
                            variant="caption"
                            color="secondary.onContainer"
                        >
                            {getTooltipString()}
                        </Typography>
                    </TooltipWithBounds>
                    <TooltipWithBounds
                        top={innerHeight + margin.top - 36}
                        left={tooltipLeft}
                        style={{
                            ...defaultStyles,
                            ...tooltipStyles,
                            minWidth: 72,
                            textAlign: "center",
                        }}
                    >
                        <Typography
                            variant="caption"
                            color="secondary.onContainer"
                        >
                            {numSecsToHhmmss(getTime(tooltipData) ?? 0)}
                        </Typography>
                    </TooltipWithBounds>
                </div>
            )}
        </Box>
    );
};

const ResponsiveActivityProfileChart = (
    props: Omit<ChartSelectProps, "parentWidth" | "parentHeight">
) => {
    return (
        <ParentSize>
            {({ width, height }) => (
                <CourseProfileTimeSelect
                    parentWidth={width}
                    parentHeight={height}
                    {...props}
                />
            )}
        </ParentSize>
    );
};

export default ResponsiveActivityProfileChart;
