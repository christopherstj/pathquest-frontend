import dayjs from "@/helpers/dayjs";
import getDistanceString from "@/helpers/getDistanceString";
import hexToRgb from "@/helpers/hexToRgb";
import { ActivityStart } from "@/typeDefs/ActivityStart";
import { DirectionsBike, DirectionsRun } from "@mui/icons-material";
import {
    Avatar,
    Box,
    Button,
    ButtonBase,
    SxProps,
    Theme,
    Typography,
} from "@mui/material";
import Link from "next/link";
import React from "react";
import DataRow from "../common/DataRow";
import getVerticalGainString from "@/helpers/getVerticalGainString";

const rowStyles: SxProps<Theme> = (theme) => ({
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "8px 16px",
    // borderRadius: "12px",
    // backgroundColor: "primary.container",
    height: "100%",
    borderRight: `1px solid ${theme.palette.primary.onContainerDim}`,
    position: "relative",
    overflow: "hidden",
    minHeight: "54px",
    transition: "box-shadow 0.2s",
    cursor: "pointer",
    marginBottom: "8px",
    "&:hover": {
        boxShadow: `0px 3px 3px -2px rgba(${hexToRgb(
            theme.palette.primary.base
        )}, 0.2), 0px 3px 4px 0px rgba(${hexToRgb(
            theme.palette.primary.base
        )}, 0.14), 0px 1px 8px 0px rgba(${hexToRgb(
            theme.palette.primary.base
        )}, 0.12);`,
    },
});

const stravaButtonStyles: SxProps = {
    borderRadius: "24px",
    backgroundColor: "transparent",
    borderColor: "primary.onContainer",
    color: "#FC4C02",
    paddingLeft: "12px",
    paddingRight: "12px",
    "&:hover": {
        backgroundColor: "primary.containerDim",
    },
};

const buttonStyles: SxProps = {
    borderRadius: "24px",
    backgroundColor: "transparent",
    borderColor: "primary.onContainer",
    color: "primary.onContainer",
    "&:hover": {
        backgroundColor: "primary.containerDim",
    },
};

type Props = {
    activity: ActivityStart;
    units: "metric" | "imperial";
    onHover: (activityId: string) => void;
    onUnhover: () => void;
    onClick: (activityId: string) => void;
};

const tz = dayjs.tz.guess();

const ActivityStartListItem = ({
    activity,
    units,
    onClick,
    onHover,
    onUnhover,
}: Props) => {
    const getIcon = () => {
        if (activity.sport === "Run") {
            return <DirectionsRun sx={{ color: "primary.onContainerDim" }} />;
        } else if (activity.sport === "Ride") {
            return <DirectionsBike sx={{ color: "primary.onContainerDim" }} />;
        } else {
            return null;
        }
    };

    const timezone = activity.timezone
        ? activity.timezone.split(" ").slice(-1)[0]
        : tz;

    return (
        <ButtonBase
            sx={rowStyles}
            onMouseEnter={() => onHover(activity.id)}
            onMouseLeave={onUnhover}
            onClick={() => onClick(activity.id)}
        >
            {/* <Avatar
                sx={{
                    backgroundColor: "primary.containerDim",
                    color: "primary.onContainerDim",
                }}
            >
                {getIcon()}
            </Avatar> */}
            <Box display="flex" flexDirection="column" flex="1" gap="4px">
                <Typography
                    variant="body1"
                    fontWeight="bold"
                    color="primary.onContainerDim"
                >
                    {activity.name}
                </Typography>
                <Typography variant="caption" color="primary.onContainerDim">
                    {dayjs(activity.startTime)
                        .tz(timezone, true)
                        .format("MMM D, YYYY h:mm A")}
                </Typography>
                <DataRow
                    label="Distance:"
                    value={getDistanceString(activity.distance, units)}
                />
                {activity.gain !== null && activity.gain !== undefined && (
                    <DataRow
                        label="Gain:"
                        value={getVerticalGainString(activity.gain, units)}
                    />
                )}
                {activity.peakSummits !== null &&
                    activity.peakSummits !== undefined && (
                        <DataRow
                            label="Peak Summits:"
                            value={activity.peakSummits}
                        />
                    )}
                <Box
                    width="100%"
                    display="flex"
                    flexDirection="column"
                    justifyContent="space-between"
                >
                    {/* <Button
                        sx={stravaButtonStyles}
                        size="small"
                        LinkComponent={Link}
                        href={`https://www.strava.com/activities/${activity.id}`}
                        target="_blank"
                        onClick={(e) => e.stopPropagation()}
                    >
                        View on Strava
                    </Button> */}
                    <Button
                        sx={buttonStyles}
                        LinkComponent={Link}
                        href={`/app/activites/${activity.id}`}
                        size="small"
                        fullWidth
                    >
                        Details
                    </Button>
                </Box>
            </Box>
        </ButtonBase>
    );
};

export default ActivityStartListItem;
