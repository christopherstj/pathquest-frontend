"use client";
import dayjs from "@/helpers/dayjs";
import metersToFt from "@/helpers/metersToFt";
import ManualPeakSummit from "@/typeDefs/ManualPeakSummit";
import Peak from "@/typeDefs/Peak";
import PeakSummit from "@/typeDefs/PeakSummit";
import { Check } from "@mui/icons-material";
import {
    Avatar,
    Box,
    IconButton,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Typography,
} from "@mui/material";
import Link from "next/link";
import React from "react";

const timezone = dayjs.tz.guess();

type Props = {
    peakSummit: Peak & ManualPeakSummit;
    units: "metric" | "imperial";
    onRowClick: (lat: number, long: number) => void;
};

const PeakSummitRow = ({ peakSummit, units, onRowClick }: Props) => {
    const color =
        (peakSummit.Altitude ?? 0) < 1000
            ? "primary"
            : (peakSummit.Altitude ?? 0) < 3000
            ? "secondary"
            : "tertiary";

    return (
        <ListItem
            sx={{
                paddingLeft: "0",
                paddingRight: "0",
                gap: "8px",
            }}
            onClick={() => onRowClick(peakSummit.Lat, peakSummit.Long)}
        >
            <ListItemAvatar>
                <Avatar
                    sx={{
                        backgroundColor: `primary.containerDim`,
                        color: `primary.onContainerDim`,
                        width: "32px",
                        height: "32px",
                    }}
                >
                    <Check sx={{ color: `primary.onContainerDim` }} />
                </Avatar>
            </ListItemAvatar>
            <ListItemText
                sx={{
                    flex: 1,
                }}
                primary={
                    <Typography
                        variant="body1"
                        fontWeight="bold"
                        color="primary.onContainerDim"
                    >
                        {peakSummit.Name}
                    </Typography>
                }
                secondaryTypographyProps={{
                    component: "div",
                }}
                secondary={
                    <Box width="100%" display="flex" flexDirection="column">
                        <Typography
                            variant="body2"
                            // fontWeight="bold"
                            color={`primary.onContainerDim`}
                            gutterBottom
                        >
                            {peakSummit.Country ? `${peakSummit.Country}` : ""}
                            {peakSummit.State ? ` | ${peakSummit.State}` : ""}
                            {peakSummit.County ? ` | ${peakSummit.County}` : ""}
                        </Typography>

                        <Typography
                            variant="caption"
                            color={`primary.onContainerDim`}
                            {...(peakSummit.activityId && {
                                component: Link,
                                onClick: (e: any) => e.stopPropagation(),
                                href: `/app/activities/${peakSummit.activityId}`,
                            })}
                            sx={{
                                opacity: 0.75,
                                ...(peakSummit.activityId
                                    ? {
                                          cursor: "pointer",
                                          "&:hover": {
                                              opacity: 1,
                                          },
                                      }
                                    : {}),
                            }}
                        >
                            {dayjs(peakSummit.timestamp)
                                .tz(
                                    peakSummit.timezone
                                        ? peakSummit.timezone
                                              .split(" ")
                                              .slice(-1)[0]
                                        : timezone,
                                    true
                                )
                                .format("MMM D, YYYY h:mm A")}
                        </Typography>
                    </Box>
                }
            />
            {peakSummit.Altitude && (
                <Box
                    sx={{
                        backgroundColor: `${color}.onContainerDim`,
                        padding: {
                            xs: "4px",
                            md: "8px",
                        },
                        borderRadius: "8px",
                        flexShrink: 0,
                    }}
                >
                    <Typography
                        variant="body1"
                        color={`${color}.containerDim`}
                        fontWeight="bold"
                        sx={{
                            fontSize: {
                                xs: "0.825rem",
                                md: "1rem",
                            },
                        }}
                    >
                        {Math.round(
                            units === "metric"
                                ? peakSummit.Altitude
                                : metersToFt(peakSummit.Altitude)
                        )
                            .toString()
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        {units === "metric" ? " m" : " ft"}
                    </Typography>
                </Box>
            )}
        </ListItem>
    );
};

export default PeakSummitRow;
