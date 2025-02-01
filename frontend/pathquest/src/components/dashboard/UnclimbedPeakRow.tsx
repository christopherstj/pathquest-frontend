"use client";
import dayjs from "@/helpers/dayjs";
import metersToFt from "@/helpers/metersToFt";
import Ascent from "@/typeDefs/Ascent";
import UnclimbedPeak from "@/typeDefs/UnclimbedPeak";
import {
    Check,
    Edit,
    Launch,
    MoreVert,
    Star,
    StarBorder,
} from "@mui/icons-material";
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
    onFavoriteClick?: (peakId: string, newValue: boolean) => void;
    onRowClick: (lat: number, long: number) => void;
    rowColor: "primary" | "secondary";
    ascents?: Ascent[];
    useAscentRedirect?: boolean;
    onSummitControlDetailClick?: (ascentId: string) => void;
};

const timezone = dayjs.tz.guess();

const UnclimbedPeakRow = ({
    peak,
    units,
    onFavoriteClick,
    onRowClick,
    rowColor,
    ascents,
    useAscentRedirect = true,
    onSummitControlDetailClick,
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
                            if (onFavoriteClick)
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
                secondaryTypographyProps={{
                    component: "div",
                }}
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
                                        .tz(
                                            b.timezone
                                                ? b.timezone
                                                      .split(" ")
                                                      .slice(-1)[0]
                                                : timezone
                                        )
                                        .isBefore(
                                            dayjs(a.timestamp).tz(
                                                a.timezone
                                                    ? a.timezone
                                                          .split(" ")
                                                          .slice(-1)[0]
                                                    : timezone
                                            )
                                        )
                                        ? -1
                                        : 1
                                )
                                .map((ascent, index) => (
                                    <Box
                                        key={index}
                                        display="flex"
                                        flexWrap="wrap"
                                        gap="4px"
                                    >
                                        <Typography
                                            variant="caption"
                                            color={`${rowColor}.onContainerDim`}
                                            {...(useAscentRedirect && {
                                                component: Link,
                                                onClick: (e: any) =>
                                                    e.stopPropagation(),
                                                href: `/app/activities/${ascent.activityId}`,
                                            })}
                                            sx={{
                                                opacity: 0.75,
                                                ...(useAscentRedirect
                                                    ? {
                                                          cursor: "pointer",
                                                          "&:hover": {
                                                              opacity: 1,
                                                          },
                                                      }
                                                    : {}),
                                            }}
                                        >
                                            {dayjs(ascent.timestamp)
                                                .tz(
                                                    ascent.timezone
                                                        ? ascent.timezone
                                                              .split(" ")
                                                              .slice(-1)[0]
                                                        : timezone
                                                )
                                                .format(
                                                    "MMM D, YYYY h:mm A"
                                                )}{" "}
                                            {useAscentRedirect && (
                                                <Launch
                                                    sx={{
                                                        fontSize: "0.75rem",
                                                        verticalAlign: "middle",
                                                        marginLeft: "4px",
                                                    }}
                                                />
                                            )}
                                        </Typography>
                                        {onSummitControlDetailClick && (
                                            <>
                                                <IconButton
                                                    sx={{
                                                        ...buttonStyles,
                                                        padding: "0",
                                                        fontSize: "0.75rem",
                                                        marginLeft: "4px",
                                                    }}
                                                    size="small"
                                                    color="primary"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onSummitControlDetailClick(
                                                            ascent.id
                                                        );
                                                    }}
                                                >
                                                    <MoreVert fontSize="small" />
                                                </IconButton>
                                            </>
                                        )}
                                        {ascent.notes && (
                                            <Typography
                                                flexBasis="100%"
                                                variant="caption"
                                                color={`${rowColor}.onContainerDim`}
                                                sx={{
                                                    display: "-webkit-box",
                                                    WebkitLineClamp: "1",
                                                    WebkitBoxOrient: "vertical",
                                                    overflow: "hidden",
                                                }}
                                            >
                                                {ascent.notes}
                                            </Typography>
                                        )}
                                    </Box>
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
                    variant="text"
                >
                    Details
                </Button>
            </Box>
        </ListItem>
    );
};

export default UnclimbedPeakRow;
