"use client";
import HourlyWeather from "@/typeDefs/HourlyWeather";
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
import dayjs from "@/helpers/dayjs";
import { useUser } from "@/state/UserContext";
import { Box, SxProps, Typography, useTheme } from "@mui/material";
import { LinearGradient } from "@visx/gradient";

const tooltipStringStyles: SxProps = {
    ".tertiary": {
        color: "tertiary.base",
    },
    ".primary": {
        color: "primary.onContainerDim",
    },
    ".secondary": {
        color: "secondary.onContainerDim",
    },
};

type ChartProps = {
    parentWidth: number;
    parentHeight: number;
    margin?: { top: number; right: number; bottom: number; left: number };
    data: HourlyWeather[];
};

const getTime = (d: HourlyWeather) => dayjs(d.time).unix();
const getTemp = (d: HourlyWeather) => d.temp;
const getDewPoint = (d: HourlyWeather) => d.dewPoint;
const getWindChill = (d: HourlyWeather) => d.windChill;
const getPrecipProb = (d: HourlyWeather) => d.precipProb;
const getWindSpeed = (d: HourlyWeather) => d.windSpeed;
const getWindGust = (d: HourlyWeather) => d.windGust;
const getWindDirection = (d: HourlyWeather) => d.windDirection;
const getCloudCover = (d: HourlyWeather) => d.cloudCover;
const getHumidity = (d: HourlyWeather) => d.humidity;
const getWeather = (d: HourlyWeather) => d.weather;

const bisectDate = bisector<HourlyWeather, number>((d) =>
    dayjs(d.time).unix()
).left;

const HourlyWeatherChart = ({
    parentWidth,
    parentHeight,
    margin = { top: 0, right: 0, bottom: 0, left: 0 },
    data,
}: ChartProps) => {
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
    } = useTooltip<HourlyWeather>({
        // initial tooltip state
        tooltipOpen: false,
    });

    const innerWidth = parentWidth - margin.left - margin.right;
    const innerHeight = parentHeight - margin.top - margin.bottom;

    const innerMargin = 8;

    const chartHeight = innerHeight / 4 - innerMargin * 2;

    const timeScale = useMemo(() => {
        const minTime = min(data, getTime) ?? 0;
        const maxTime = max(data, getTime) ?? 0;
        return scaleLinear({
            domain: [minTime, maxTime],
            range: [0, innerWidth],
        });
    }, [data, innerWidth]);
    const tempScale = useMemo(() => {
        const minTemp = Math.min(
            min(data, getTemp) ?? 0,
            min(data, getDewPoint) ?? 0,
            min(data, getWindChill) ?? 0
        );
        const maxTemp = Math.max(
            max(data, getTemp) ?? 0,
            max(data, getDewPoint) ?? 0,
            max(data, getWindChill) ?? 0
        );
        return scaleLinear({
            domain: [minTemp, maxTemp],
            range: [chartHeight, 0],
        });
    }, [data, chartHeight]);
    const percentScale = useMemo(() => {
        return scaleLinear({
            domain: [0, 100],
            range: [chartHeight, 0],
        });
    }, [data, chartHeight]);
    const speedScale = useMemo(() => {
        const maxSpeed = Math.max(
            max(data, getWindSpeed) ?? 0,
            max(data, getWindGust) ?? 0
        );
        return scaleLinear({
            domain: [0, maxSpeed],
            range: [chartHeight, 0],
        });
    }, [data, chartHeight]);

    const handleTooltip = React.useCallback(
        (
            event:
                | React.TouchEvent<SVGRectElement>
                | React.MouseEvent<SVGRectElement>
        ) => {
            const { x, y } = localPoint(event) || { x: 0 };
            const x0 = timeScale.invert(x);
            const index = bisectDate(data, x0, 1);
            const d0 = data[index - 1];
            const d1 = data[index];
            if (d1 && getTime(d1)) {
                const d = x0 - getTime(d0) > getTime(d1) - x0 ? d1 : d0;
                showTooltip({
                    tooltipData: d,
                    tooltipLeft: timeScale(getTime(d) ?? 0) ?? 0,
                    tooltipTop: y,
                });
            } else {
                showTooltip({
                    tooltipData: d0,
                    tooltipLeft: timeScale(getTime(d0) ?? 0) ?? 0,
                    tooltipTop: y,
                });
            }
        },
        [showTooltip, timeScale, data]
    );

    const getTooltipString = () => {
        if (!tooltipData) return "";
        return (
            <>
                {dayjs(tooltipData.time).format("MMM D, YYYY h:mm A")}
                <br />
                <span className="tertiary">Temp: {tooltipData.temp}°F</span>
                <br />
                <span className="secondary">
                    Wind Chill:{" "}
                    {tooltipData.windChill
                        ? `${tooltipData.windChill}°F`
                        : "Not forecasted"}
                </span>
                <br />
                <span className="primary">
                    Dew Point:{" "}
                    {tooltipData.dewPoint
                        ? `${tooltipData.dewPoint}°F`
                        : "Not forecasted"}
                </span>
            </>
        );
    };

    const tooltipStyles = {
        ...defaultStyles,
        background: theme.palette.secondary.containerDim,
        color: theme.palette.secondary.onContainer,
    };

    if (parentWidth < 10) return null;

    return (
        <Box sx={{ position: "relative" }} ref={containerRef}>
            <svg
                width={innerWidth}
                height={innerHeight}
                style={{ overflow: "visible" }}
            >
                <LinearGradient
                    id="secondary-gradient"
                    from={theme.palette.secondary.onContainerDim}
                    fromOpacity={0.5}
                    to="rgba(0, 0, 0, 0)"
                    toOpacity={0.3}
                />
                <Group left={margin.left} top={margin.top}>
                    <Line
                        from={{
                            x: margin.left,
                            y: chartHeight + margin.top + innerMargin * 2,
                        }}
                        to={{
                            x: innerWidth + margin.left,
                            y: chartHeight + margin.top + innerMargin * 2,
                        }}
                        stroke={theme.palette.secondary.onContainerDim}
                        strokeWidth={1}
                        pointerEvents="none"
                        opacity={0.3}
                    />
                </Group>
                <Group
                    left={margin.left}
                    top={chartHeight + innerMargin * 3 + margin.top}
                >
                    <LinePath
                        stroke={theme.palette.tertiary.base}
                        strokeWidth={2}
                        data={data.filter((d) => d.temp !== null)}
                        x={(d) => timeScale(getTime(d))}
                        y={(d) => tempScale(getTemp(d) ?? 0)}
                        curve={curveMonotoneX}
                    />
                    <LinePath
                        stroke={theme.palette.primary.onContainerDim}
                        strokeWidth={2}
                        data={data.filter((d) => d.dewPoint !== null)}
                        x={(d) => timeScale(getTime(d) ?? 0) ?? 0}
                        y={(d) => tempScale(getDewPoint(d) ?? 0) ?? 0}
                        curve={curveMonotoneX}
                    />
                    <LinePath
                        stroke={theme.palette.secondary.onContainerDim}
                        strokeWidth={2}
                        data={data.filter((d) => d.windChill !== null)}
                        x={(d) => timeScale(getTime(d) ?? 0) ?? 0}
                        y={(d) => tempScale(getWindChill(d) ?? 0) ?? 0}
                        curve={curveMonotoneX}
                    />
                    <Line
                        from={{
                            x: margin.left,
                            y: chartHeight + margin.top + innerMargin * 2,
                        }}
                        to={{
                            x: innerWidth + margin.left,
                            y: chartHeight + margin.top + innerMargin * 2,
                        }}
                        stroke={theme.palette.secondary.onContainerDim}
                        strokeWidth={1}
                        pointerEvents="none"
                        opacity={0.3}
                    />
                </Group>
                <Group
                    left={margin.left}
                    top={
                        (chartHeight + innerMargin * 2) * 2 +
                        innerMargin +
                        margin.top
                    }
                >
                    <Line
                        from={{
                            x: margin.left,
                            y: chartHeight + margin.top + innerMargin * 2,
                        }}
                        to={{
                            x: innerWidth + margin.left,
                            y: chartHeight + margin.top + innerMargin * 2,
                        }}
                        stroke={theme.palette.secondary.onContainerDim}
                        strokeWidth={1}
                        pointerEvents="none"
                        opacity={0.3}
                    />
                </Group>
                <Group
                    left={margin.left}
                    top={
                        (chartHeight + innerMargin * 2) * 3 +
                        innerMargin +
                        margin.top
                    }
                ></Group>
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
                    onMouseLeave={hideTooltip}
                />
                {data.map(
                    (d, i) =>
                        dayjs(d.time).hour() === 0 && (
                            <Line
                                key={i}
                                from={{
                                    x: timeScale(getTime(d) ?? 0) ?? 0,
                                    y: margin.top,
                                }}
                                to={{
                                    x: timeScale(getTime(d) ?? 0) ?? 0,
                                    y: innerHeight + margin.top,
                                }}
                                stroke={theme.palette.secondary.onContainer}
                                strokeWidth={1}
                                pointerEvents="none"
                                strokeDasharray="5,2"
                            />
                        )
                )}
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
                            // strokeDasharray="5,2"
                        />
                    </g>
                )}
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
                            sx={tooltipStringStyles}
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
                            {dayjs(tooltipData.time).format("h:mm A")}
                        </Typography>
                    </TooltipWithBounds>
                </div>
            )}
        </Box>
    );
};

const ResponsiveHourlyWeatherChart = (
    props: Omit<ChartProps, "parentWidth" | "parentHeight">
) => {
    return (
        <ParentSize>
            {({ width, height }) => (
                <HourlyWeatherChart
                    parentWidth={width}
                    parentHeight={height}
                    {...props}
                />
            )}
        </ParentSize>
    );
};

export default ResponsiveHourlyWeatherChart;
