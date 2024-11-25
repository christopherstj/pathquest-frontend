"use client";
import dayjs from "@/helpers/dayjs";
import metersToFt from "@/helpers/metersToFt";
import UnclimbedPeak from "@/typeDefs/UnclimbedPeak";
import { Check, Star, StarBorder } from "@mui/icons-material";
import {
    ListItem,
    ListItemAvatar,
    Avatar,
    ListItemText,
    Typography,
    Box,
    IconButton,
    Button,
    SxProps,
} from "@mui/material";
import Link from "next/link";
import React from "react";

const buttonStyles: SxProps = {
    borderRadius: "24px",
    backgroundColor: "transparent",
    borderColor: "primary.onContainer",
    color: "primary.onContainer",
    marginTop: "auto",
    "&:hover": {
        backgroundColor: "primary.containerDim",
    },
};

type Props = {
    peak: UnclimbedPeak;
    units: "metric" | "imperial";
    onFavoriteClick: (peakId: string, newValue: boolean) => void;
    onRowClick: (lat: number, long: number) => void;
    rowColor: "primary" | "secondary";
    ascents?: {
        timestamp: string;
        activityId: string;
        timezone?: string;
    }[];
};

const timezone = dayjs.tz.guess();

const UnclimbedPeakRow = ({
    peak,
    units,
    onFavoriteClick,
    onRowClick,
    rowColor,
    ascents,
}: Props) => {
    const color =
        (peak.Altitude ?? 0) < 1000
            ? "primary"
            : (peak.Altitude ?? 0) < 3000
            ? "secondary"
            : "tertiary";

    return (
        <ListItem
            sx={{
                paddingLeft: "0",
                paddingRight: "0",
                gap: "8px",
                cursor: "pointer",
                alignItems: "stretch",
            }}
            onClick={() => onRowClick(peak.Lat, peak.Long)}
        >
            <ListItemAvatar
                sx={{
                    minWidth: "32px",
                    alignSelf: "flex-start",
                    marginTop: "12px",
                }}
            >
                {!peak.isSummitted ? (
                    <IconButton
                        color={rowColor}
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation();
                            onFavoriteClick(peak.Id, !peak.isFavorited);
                        }}
                    >
                        {peak.isFavorited ? (
                            <Star
                                sx={{
                                    color: "tertiary.onContainerDim",
                                }}
                            />
                        ) : (
                            <StarBorder
                                sx={{
                                    color: `${rowColor}.onContainerDim`,
                                }}
                            />
                        )}
                    </IconButton>
                ) : (
                    <Avatar
                        sx={{
                            backgroundColor: `${rowColor}.containerDim`,
                            color: `${rowColor}.onContainerDim`,
                            width: "32px",
                            height: "32px",
                        }}
                    >
                        <Check sx={{ color: `${rowColor}.onContainerDim` }} />
                    </Avatar>
                )}
            </ListItemAvatar>
            <ListItemText
                sx={{
                    flex: 1,
                }}
                primary={
                    <Box
                        width="100%"
                        display="flex"
                        gap="16px"
                        alignItems="center"
                    >
                        <Typography
                            variant="body1"
                            fontWeight="bold"
                            color={`${rowColor}.onContainer`}
                        >
                            {peak.Name}
                        </Typography>
                    </Box>
                }
                secondary={
                    <Box width="100%" display="flex" flexDirection="column">
                        <Typography
                            variant="body2"
                            // fontWeight="bold"
                            color={`${rowColor}.onContainerDim`}
                            gutterBottom
                        >
                            {peak.Country ? `${peak.Country}` : ""}
                            {peak.State ? ` | ${peak.State}` : ""}
                            {peak.County ? ` | ${peak.County}` : ""}
                        </Typography>
                        {ascents &&
                            ascents
                                .sort((a, b) =>
                                    dayjs(b.timestamp)
                                        .tz(b.timezone ?? timezone, true)
                                        .isBefore(
                                            dayjs(a.timestamp).tz(
                                                a.timezone ?? timezone,
                                                true
                                            )
                                        )
                                        ? -1
                                        : 1
                                )
                                .map((ascent, index) => (
                                    <Typography
                                        key={index}
                                        variant="caption"
                                        color={`${rowColor}.onContainerDim`}
                                        component={Link}
                                        onClick={(e) => e.stopPropagation()}
                                        href={`/app/activities/${ascent.activityId}`}
                                        sx={{
                                            opacity: 0.75,
                                            cursor: "pointer",
                                            "&:hover": {
                                                opacity: 1,
                                            },
                                        }}
                                    >
                                        {dayjs(ascent.timestamp)
                                            .tz(
                                                ascent.timezone ?? timezone,
                                                true
                                            )
                                            .format("MMM D, YYYY h:mm A")}
                                    </Typography>
                                ))}
                    </Box>
                }
            />
            <Box display="flex" flexDirection="column">
                {peak.Altitude && (
                    <Box
                        sx={{
                            backgroundColor: `${color}.onContainerDim`,
                            padding: {
                                xs: "4px",
                                md: "8px",
                            },
                            borderRadius: "8px",
                            flexShrink: 0,
                            alignSelf: "flex-start",
                            marginTop: "12px",
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
                                    ? peak.Altitude
                                    : metersToFt(peak.Altitude)
                            )
                                .toString()
                                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                            {units === "metric" ? " m" : " ft"}
                        </Typography>
                    </Box>
                )}
                <Button
                    sx={buttonStyles}
                    size="small"
                    color="primary"
                    LinkComponent={Link}
                    href={`/app/peaks/${peak.Id}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    Details
                </Button>
            </Box>
        </ListItem>
    );
};

export default UnclimbedPeakRow;
