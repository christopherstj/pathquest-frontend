import metersToFt from "@/helpers/metersToFt";
import UnclimbedPeak from "@/typeDefs/UnclimbedPeak";
import { Star, StarBorder } from "@mui/icons-material";
import {
    ListItem,
    ListItemAvatar,
    Avatar,
    ListItemText,
    Typography,
    Box,
    IconButton,
} from "@mui/material";
import React from "react";

type Props = {
    peak: UnclimbedPeak;
    units: "metric" | "imperial";
    onFavoriteClick: (peakId: string, newValue: boolean) => void;
    rowColor: "primary" | "secondary";
};

const UnclimbedPeakRow = ({
    peak,
    units,
    onFavoriteClick,
    rowColor,
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
            }}
        >
            <ListItemAvatar sx={{ minWidth: "32px" }}>
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
            </ListItemAvatar>
            <ListItemText
                sx={{
                    flex: 1,
                }}
                primary={
                    <Typography
                        variant="body1"
                        fontWeight="bold"
                        color={`${rowColor}.onContainerDim`}
                    >
                        {peak.Name}
                    </Typography>
                }
                secondary={
                    <Typography
                        variant="caption"
                        color={`${rowColor}.onContainerDim`}
                    >
                        {peak.Country ? `${peak.Country}` : ""}
                        {peak.State ? ` | ${peak.State}` : ""}
                        {peak.County ? ` | ${peak.County}` : ""}
                    </Typography>
                }
            />
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
        </ListItem>
    );
};

export default UnclimbedPeakRow;
