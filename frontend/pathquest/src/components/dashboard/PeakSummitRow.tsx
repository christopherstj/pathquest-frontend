import metersToFt from "@/helpers/metersToFt";
import PeakSummit from "@/typeDefs/PeakSummit";
import {
    Avatar,
    Box,
    IconButton,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Typography,
} from "@mui/material";
import React from "react";

type Props = {
    peakSummit: PeakSummit;
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
                        backgroundColor: "primary.containerDim",
                        color: "primary.onContainerDim",
                    }}
                >
                    {peakSummit.ascents.length}
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
                secondary={
                    <Typography
                        variant="caption"
                        color="primary.onContainerDim"
                    >
                        {peakSummit.Country ? `${peakSummit.Country}` : ""}
                        {peakSummit.State ? ` | ${peakSummit.State}` : ""}
                        {peakSummit.County ? ` | ${peakSummit.County}` : ""}
                    </Typography>
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
