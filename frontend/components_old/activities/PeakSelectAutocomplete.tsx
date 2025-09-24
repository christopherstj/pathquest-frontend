"use client";
import searchNearestPeaks from "@/actions/searchNearestPeaks";
import { useActivityDetail } from "@/state_old/ActivityDetailsContext";
import { useUser } from "@/state_old/UserContext";
import { ActivityStart } from "@/typeDefs/ActivityStart";
import UnclimbedPeak from "@/typeDefs/UnclimbedPeak";
import { Check, Star, StarBorder } from "@mui/icons-material";
import {
    Autocomplete,
    Avatar,
    Box,
    Button,
    ListItem,
    ListItemAvatar,
    ListItemText,
    SxProps,
    Typography,
} from "@mui/material";
import React from "react";
import TextField, { textFieldStyles } from "../common/TextField";
import metersToFt from "@/helpers/metersToFt";

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

type Props = {
    value: UnclimbedPeak | undefined;
    onValueChange: (value: UnclimbedPeak | null) => void;
};

const PeakSelectAutocomplete = ({ value, onValueChange }: Props) => {
    const [{ user }] = useUser();
    const [
        {
            activity: { startLat, startLong },
        },
    ] = useActivityDetail();

    const [peaks, setPeaks] = React.useState<UnclimbedPeak[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [search, setSearch] = React.useState<string>("");
    const [open, setOpen] = React.useState(false);
    const [timeoutId, setTimeoutId] = React.useState<NodeJS.Timeout | null>(
        null
    );
    const [page, setPage] = React.useState(1);

    if (!user) return null;

    const units = user.units;

    const getIcon = (peak: UnclimbedPeak) => {
        if (peak.isSummitted) {
            return (
                <Check
                    sx={{
                        color: "primary.onContainerDim",
                        width: "16px",
                        height: "16px",
                    }}
                />
            );
        } else if (peak.isFavorited) {
            return (
                <Star
                    sx={{
                        color: "tertiary.base",
                        width: "16px",
                        height: "16px",
                    }}
                />
            );
        } else {
            return (
                <StarBorder
                    sx={{
                        color: "primary.onContainerDim",
                        width: "16px",
                        height: "16px",
                    }}
                />
            );
        }
    };

    const onInputChange = async (newValue: string | null) => {
        setLoading(true);
        setPage(1);
        setSearch(newValue ?? "");

        if (timeoutId) clearTimeout(timeoutId);

        const newTimeoutId = setTimeout(async () => {
            const data = await searchNearestPeaks(
                startLat,
                startLong,
                1,
                newValue ?? ""
            );

            setPeaks(data);

            setLoading(false);
        }, 500);

        setTimeoutId(newTimeoutId);
    };

    const getNext = async () => {
        const data = await searchNearestPeaks(
            startLat,
            startLong,
            page + 1,
            search
        );

        setPeaks([...peaks, ...data]);
        setPage(page + 1);
    };

    const handleOpen = async () => {
        setOpen(true);
        const data = await searchNearestPeaks(startLat, startLong, 1);
        setPeaks(data);
    };

    const handleClose = () => {
        setOpen(false);
        setPeaks([]);
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
            isOptionEqualToValue={(option, value) => option.Id === value.Id}
            getOptionLabel={(option) => option.Name ?? "Peak"}
            options={peaks}
            loading={loading}
            value={value}
            onChange={(e, newValue) => onValueChange(newValue)}
            inputValue={search}
            onInputChange={(_, newValue) => onInputChange(newValue)}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="What peak did you summit?"
                    sx={textFieldStyles("primary")}
                />
            )}
            filterOptions={(options) => {
                const result = [...options];
                result.push({
                    Id: "loadMore",
                    Name: "Load More",
                    Lat: -1, // This is a hack to prevent the filter from breaking
                    Long: -1, // This is a hack to prevent the filter from breaking
                    isFavorited: false,
                    isSummitted: false,
                });

                return result;
            }}
            renderOption={(props, option) => {
                if (option.Id === "loadMore") {
                    return (
                        <ListItem
                            key={option.Id}
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
                                variant="text"
                            >
                                Load More
                            </Button>
                        </ListItem>
                    );
                }
                const color =
                    (option.Altitude ?? 0) < 1000
                        ? "primary"
                        : (option.Altitude ?? 0) < 3000
                        ? "secondary"
                        : "tertiary";
                return (
                    <ListItem
                        {...props}
                        key={option.Id}
                        sx={{ pl: "6px !important", pr: "8px !important" }}
                    >
                        <ListItemAvatar sx={{ minWidth: "0px", pr: "6px" }}>
                            <Avatar
                                sx={{
                                    backgroundColor: "primary.containerDim",
                                    color: "primary.onContainerDim",
                                    width: "24px",
                                    height: "24px",
                                }}
                            >
                                {getIcon(option)}
                            </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                            primary={
                                <Typography
                                    variant="body2"
                                    color="primary.onContainer"
                                >
                                    {option.Name}
                                </Typography>
                            }
                            secondary={
                                <Typography
                                    variant="caption"
                                    color="primary.onContainerDim"
                                >
                                    {option.Country ? `${option.Country}` : ""}
                                    {option.State ? ` | ${option.State}` : ""}
                                    {option.County ? ` | ${option.County}` : ""}
                                </Typography>
                            }
                        />
                        <Box display="flex" flexDirection="column">
                            {option.Altitude && (
                                <Box
                                    sx={{
                                        backgroundColor: `${color}.onContainerDim`,
                                        padding: "4px",
                                        borderRadius: "8px",
                                        flexShrink: 0,
                                        alignSelf: "flex-start",
                                        marginTop: "12px",
                                    }}
                                >
                                    <Typography
                                        variant="caption"
                                        color={`${color}.containerDim`}
                                        fontWeight="bold"
                                    >
                                        {Math.round(
                                            units === "metric"
                                                ? option.Altitude
                                                : metersToFt(option.Altitude)
                                        )
                                            .toString()
                                            .replace(
                                                /\B(?=(\d{3})+(?!\d))/g,
                                                ","
                                            )}
                                        {units === "metric" ? "m" : "ft"}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </ListItem>
                );
            }}
        />
    );
};

export default PeakSelectAutocomplete;
