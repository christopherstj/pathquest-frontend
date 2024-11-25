import dayjs from "@/helpers/dayjs";
import getDistanceString from "@/helpers/getDistanceString";
import hexToRgb from "@/helpers/hexToRgb";
import Activity from "@/typeDefs/Activity";
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
import { useRouter } from "next/navigation";
import React, { act } from "react";
import ActivityIcon from "../common/customIcons/Activity";
import getVerticalGainString from "@/helpers/getVerticalGainString";
import DataRow from "../common/DataRow";

const rowStyles: SxProps<Theme> = (theme) => ({
    display: "flex",
    alignItems: "stretch",
    gap: "12px",
    padding: "8px",
    // borderRadius: "12px",
    // backgroundColor: "primary.container",
    borderBottom: `1px solid ${theme.palette.primary.onContainerDim}`,
    position: "relative",
    overflow: "hidden",
    minHeight: "54px",
    width: "100%",
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
    activity:
        | (Activity & {
              summits: {
                  timestamp: string;
                  activityId: string;
              }[];
          })
        | ActivityStart;
    units: "metric" | "imperial";
    onMouseOver: (activityId: string) => void;
    onMouseOut: () => void;
    onClick?: (activityId: string) => void;
};

const tz = dayjs.tz.guess();

const ActivityRow = ({
    activity,
    units,
    onMouseOver,
    onMouseOut,
    onClick,
}: Props) => {
    const getIcon = () => {
        if (activity.sport === "Run") {
            return <DirectionsRun sx={{ color: "primary.onContainerDim" }} />;
        } else if (activity.sport === "Ride") {
            return <DirectionsBike sx={{ color: "primary.onContainerDim" }} />;
        } else {
            return <ActivityIcon sx={{ color: "primary.onContainerDim" }} />;
        }
    };

    const timezone = activity.timezone
        ? activity.timezone.split(" ").slice(-1)[0]
        : tz;

    return (
        <ButtonBase
            sx={rowStyles}
            onMouseEnter={() => onMouseOver(activity.id)}
            onMouseLeave={onMouseOut}
            onClick={() => {
                if (onClick) {
                    onClick(activity.id);
                } else {
                    onMouseOver(activity.id);
                }
            }}
        >
            <Avatar
                sx={{
                    backgroundColor: "primary.containerDim",
                    color: "primary.onContainerDim",
                }}
            >
                {getIcon()}
            </Avatar>
            <Box
                display="flex"
                flexDirection="column"
                flex="1"
                gap="4px"
                alignItems="flex-start"
            >
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
                <Button
                    sx={stravaButtonStyles}
                    size="small"
                    LinkComponent={Link}
                    href={`https://www.strava.com/activities/${activity.id}`}
                    target="_blank"
                    onClick={(e) => e.stopPropagation()}
                >
                    View on Strava
                </Button>
            </Box>
            <Box
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
                alignItems="center"
            >
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
                {"summits" in activity && activity.summits.length > 0 ? (
                    <Typography
                        variant="caption"
                        color="primary.onContainerDim"
                    >
                        Summit{activity.summits.length > 1 ? "s" : ""}:{" "}
                        {activity.summits.length > 1 ? <br /> : ""}
                        {activity.summits.map((summit) => (
                            <React.Fragment key={summit.timestamp}>
                                {dayjs(summit.timestamp)
                                    .tz(timezone, true)
                                    .format("h:mm A")}
                                {/* {new Date(summit.timestamp).toLocaleTimeString()} */}
                                <br />
                            </React.Fragment>
                        ))}
                    </Typography>
                ) : (
                    activity.peakSummits !== null &&
                    activity.peakSummits !== undefined && (
                        <DataRow
                            label="Peak Summits:"
                            value={activity.peakSummits}
                        />
                        // <Typography
                        //     variant="caption"
                        //     color="primary.onContainerDim"
                        // >
                        //     {activity.peakSummits} peak summit
                        //     {activity.peakSummits === 1 ? "" : "s"}
                        // </Typography>
                    )
                )}
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
        </ButtonBase>
    );
};

export default ActivityRow;
