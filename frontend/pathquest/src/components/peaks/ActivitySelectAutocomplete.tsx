import { ActivityStart } from "@/typeDefs/ActivityStart";
import { DirectionsBike, DirectionsRun } from "@mui/icons-material";
import {
    Autocomplete,
    Avatar,
    Button,
    ListItem,
    ListItemAvatar,
    ListItemText,
    SxProps,
    Typography,
} from "@mui/material";
import React from "react";
import ActivityIcon from "../common/customIcons/Activity";
import searchNearestActivities from "@/actions/searchNearestActivities";
import UnclimbedPeak from "@/typeDefs/UnclimbedPeak";
import TextField, { textFieldStyles } from "../common/TextField";
import dayjs from "@/helpers/dayjs";
import getDistanceString from "@/helpers/getDistanceString";
import getVerticalGainString from "@/helpers/getVerticalGainString";
import { useUser } from "@/state/UserContext";

const buttonStyles: SxProps = {
    borderRadius: "24px",
    backgroundColor: "transparent",
    borderColor: "primary.onContainer",
    color: "primary.onContainer",
    "&:hover": {
        backgroundColor: "primary.containerDim",
    },
};

const listItemStyles: SxProps = {
    borderRadius: "12px",
    color: "primary.onContainer",
    "&:hover": {
        backgroundColor: "primary.containerDim",
    },
    "&.MuiListItemText-root": {
        padding: "8px",
    },
};

const tz = dayjs.tz.guess();

type Props = {
    value: ActivityStart | undefined;
    onValueChange: (value: ActivityStart | null) => void;
    peak: UnclimbedPeak;
};

const ActivitySelectAutocomplete = ({ value, onValueChange, peak }: Props) => {
    const [{ user }] = useUser();

    const [activities, setActivities] = React.useState<ActivityStart[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [search, setSearch] = React.useState<string>("");
    const [open, setOpen] = React.useState(false);
    const [timeoutId, setTimeoutId] = React.useState<NodeJS.Timeout | null>(
        null
    );
    const [page, setPage] = React.useState(1);

    if (!user) return null;

    const units = user.units;

    const getIcon = (sport: string) => {
        if (sport === "Run") {
            return <DirectionsRun sx={{ color: "primary.onContainerDim" }} />;
        } else if (sport === "Ride") {
            return <DirectionsBike sx={{ color: "primary.onContainerDim" }} />;
        } else {
            return <ActivityIcon sx={{ color: "primary.onContainerDim" }} />;
        }
    };

    const onInputChange = async (newValue: string | null) => {
        setLoading(true);
        setPage(1);
        setSearch(newValue ?? "");

        if (timeoutId) clearTimeout(timeoutId);

        const newTimeoutId = setTimeout(async () => {
            const data = await searchNearestActivities(
                peak.Lat,
                peak.Long,
                1,
                newValue ?? ""
            );

            setActivities(data);

            setLoading(false);
        }, 500);

        setTimeoutId(newTimeoutId);
    };

    const getNext = async () => {
        const data = await searchNearestActivities(
            peak.Lat,
            peak.Long,
            page + 1,
            search
        );

        setActivities([...activities, ...data]);
        setPage(page + 1);
    };

    const handleOpen = async () => {
        setOpen(true);
        const data = await searchNearestActivities(peak.Lat, peak.Long, 1);
        setActivities(data);
    };

    const handleClose = () => {
        setOpen(false);
        setActivities([]);
    };

    return (
        <Autocomplete
            open={open}
            sx={{
                flexBasis: {
                    xs: "100%",
                    md: "calc(50% - 6px)",
                },
                mt: "8px",
            }}
            onOpen={handleOpen}
            onClose={handleClose}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            getOptionLabel={(option) => option.name ?? "Activity"}
            options={activities}
            loading={loading}
            value={value}
            onChange={(e, newValue) => onValueChange(newValue)}
            inputValue={search}
            onInputChange={(_, newValue) => onInputChange(newValue)}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Link to an activity"
                    sx={textFieldStyles("primary")}
                />
            )}
            filterOptions={(options) => {
                const result = [...options];
                result.push({
                    id: "loadMore",
                    name: "Load More",
                    startTime: -1,
                    distance: -1,
                    gain: -1,
                    timezone: "",
                    userId: "",
                    sport: "",
                    startLat: -91,
                    startLong: -181,
                });

                return result;
            }}
            renderOption={(props, option) => {
                if (option.id === "loadMore") {
                    return (
                        <ListItem
                            key={option.id}
                            sx={{
                                ...listItemStyles,
                                justifyContent: "center",
                            }}
                        >
                            <Button
                                onClick={getNext}
                                sx={buttonStyles}
                                disabled={loading}
                                fullWidth
                                size="small"
                            >
                                Load More
                            </Button>
                        </ListItem>
                    );
                }
                const timezone = option.timezone
                    ? option.timezone.split(" ").slice(-1)[0]
                    : tz;
                return (
                    <ListItem {...props} key={option.id}>
                        <ListItemAvatar>
                            <Avatar
                                sx={{
                                    backgroundColor: "primary.containerDim",
                                    color: "primary.onContainerDim",
                                }}
                            >
                                {getIcon(option.sport ?? "")}
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                            primary={
                                <Typography
                                    variant="body1"
                                    color="primary.onContainer"
                                >
                                    {option.name}
                                </Typography>
                            }
                            secondary={
                                <Typography
                                    variant="body2"
                                    color="primary.onContainerDim"
                                >
                                    {dayjs(option.startTime)
                                        .tz(timezone)
                                        .format("MMM D, YYYY h:mm A")}{" "}
                                    |{" "}
                                    {getDistanceString(option.distance, units)}
                                    {option.gain
                                        ? ` | ${getVerticalGainString(
                                              option.gain,
                                              units
                                          )}`
                                        : ""}
                                </Typography>
                            }
                        />
                    </ListItem>
                );
            }}
        />
    );
};

export default ActivitySelectAutocomplete;
