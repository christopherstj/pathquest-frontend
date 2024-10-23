import dayjs from "@/helpers/dayjs";
import getDistanceString from "@/helpers/getDistanceString";
import hexToRgb from "@/helpers/hexToRgb";
import Activity from "@/typeDefs/Activity";
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
import React from "react";

const rowStyles: SxProps<Theme> = (theme) => ({
    display: "flex",
    alignItems: "center",
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

const buttonStyles: SxProps = {
    borderRadius: "24px",
    backgroundColor: "transparent",
    borderColor: "primary.onContainer",
    color: "#FC4C02",
    "&:hover": {
        backgroundColor: "primary.containerDim",
    },
};

type Props = {
    activity: Activity & {
        summits: {
            timestamp: string;
            activityId: string;
        }[];
    };
    units: "metric" | "imperial";
    onMouseOver: (activityId: string) => void;
    onMouseOut: () => void;
};

const timezone = dayjs.tz.guess();

const ActivityRow = ({ activity, units, onMouseOver, onMouseOut }: Props) => {
    const router = useRouter();

    const redirect = () => {
        router.push(`/app/activities/${activity.id}`);
    };

    const getIcon = () => {
        if (activity.sport === "Run") {
            return <DirectionsRun sx={{ color: "primary.onContainerDim" }} />;
        } else if (activity.sport === "Ride") {
            return <DirectionsBike sx={{ color: "primary.onContainerDim" }} />;
        } else {
            return null;
        }
    };

    return (
        <ButtonBase
            sx={rowStyles}
            onMouseEnter={() => onMouseOver(activity.id)}
            onMouseLeave={onMouseOut}
            onClick={redirect}
        >
            <Avatar
                sx={{
                    backgroundColor: "primary.containerDim",
                    color: "primary.onContainerDim",
                }}
            >
                {getIcon()}
            </Avatar>
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
                        .tz(activity.timezone ?? timezone, true)
                        .format("MMM D, YYYY h:mm A")}
                </Typography>
            </Box>
            <Box
                display="flex"
                flexDirection="column"
                gap="8px"
                justifyContent="space-between"
            >
                <Typography variant="caption" color="primary.onContainerDim">
                    Distance: {getDistanceString(activity.distance, units)}
                </Typography>
                <Typography variant="caption" color="primary.onContainerDim">
                    Summit{activity.summits.length > 1 ? "s" : ""}:{" "}
                    {activity.summits.length > 1 ? <br /> : ""}
                    {activity.summits.map((summit) => (
                        <React.Fragment key={summit.timestamp}>
                            {dayjs(summit.timestamp)
                                .tz(activity.timezone ?? timezone, true)
                                .format("h:mm A")}
                            {/* {new Date(summit.timestamp).toLocaleTimeString()} */}
                            <br />
                        </React.Fragment>
                    ))}
                </Typography>
                <Button
                    sx={buttonStyles}
                    size="small"
                    LinkComponent={Link}
                    href={`https://www.strava.com/activities/${activity.id}`}
                    target="_blank"
                    onClick={(e) => e.stopPropagation()}
                >
                    View on Strava
                </Button>
            </Box>
        </ButtonBase>
    );
};

export default ActivityRow;
