"use client";
import { Box, Typography, useTheme } from "@mui/material";
import React, { useMemo } from "react";
import { ParentSize } from "@visx/responsive";
import { scaleLinear } from "@visx/scale";
import { max, min } from "d3-array";
import { Bar } from "@visx/shape";
import { Group } from "@visx/group";

type Props = {
    total: number;
    completed: number;
    width: number;
    height: number;
    margin?: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
};

const ChallengeCompletionBar = ({
    total,
    completed,
    width,
    height,
    margin = {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
    },
}: Props) => {
    const theme = useTheme();

    const innerWidth = width - margin.left - margin.right;
    const barHeight = 12;

    const color =
        total === completed
            ? "primary"
            : completed === 0
            ? "secondary"
            : "tertiary";

    const xScale = useMemo(
        () =>
            scaleLinear({
                range: [margin.left, innerWidth - margin.right],
                domain: [0, max([total, completed]) ?? 0],
            }),
        [margin.left, innerWidth, total, completed]
    );

    return (
        <Box marginBottom={"8px"}>
            <svg
                width={innerWidth}
                height={barHeight}
                style={{ borderRadius: "4px" }}
            >
                <Group top={0} left={0}>
                    <Bar
                        x={xScale(0)}
                        y={0}
                        width={
                            xScale(min([total, completed]) ?? 0) === 0
                                ? 0
                                : xScale(min([total, completed]) ?? 0) - 1
                        }
                        height={barHeight}
                        fill={theme.palette[color].onContainerDim}
                        style={{
                            borderRight: `1px solid ${theme.palette[color].containerDim}`,
                        }}
                    />
                    <Bar
                        x={xScale(min([total, completed]) ?? 0)}
                        y={0}
                        width={
                            xScale(max([total, completed]) ?? 0) -
                            xScale(min([total, completed]) ?? 0)
                        }
                        height={barHeight}
                        fill={theme.palette[color].onContainer}
                    />
                </Group>
            </svg>
        </Box>
    );
};

const ResponsiveCompletionBar = (props: Omit<Props, "width" | "height">) => (
    <ParentSize>
        {({ width, height }) => (
            <ChallengeCompletionBar width={width} height={height} {...props} />
        )}
    </ParentSize>
);

export default ResponsiveCompletionBar;
