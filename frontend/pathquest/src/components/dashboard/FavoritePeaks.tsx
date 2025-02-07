"use client";
import { useUser } from "@/state/UserContext";
import { Box, Divider, List, SxProps, Typography } from "@mui/material";
import React from "react";
import UnclimbedPeakRow from "./UnclimbedPeakRow";
import { useDashboard } from "@/state/DashboardContext";

const containerStyles: SxProps = {
    borderRadius: "12px",
    backgroundColor: "primary.container",
    padding: "0px 4px",
    boxShadow: 3,
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: {
        xs: "70vh",
        md: "calc(60vh - 66px)",
    },
};

const listStyles: SxProps = {
    padding: 0,
    paddingRight: "4px",
    paddingLeft: "8px",
    paddingTop: "8px",
    flex: 1,
    overflowY: "scroll",
    "&::-webkit-scrollbar": {
        width: "8px",
    },
    "&::-webkit-scrollbar-thumb": {
        backgroundColor: "primary.onContainer",
        borderRadius: "8px",
    },
    "&::-webkit-scrollbar-thumb:hover": {
        backgroundColor: "primary.onContainerDim",
    },
    "&::-webkit-scrollbar-track": {
        backgroundColor: "transparent",
    },
};

const FavoritePeaks = ({
    onFavoriteClick,
}: {
    onFavoriteClick: (
        peakId: string,
        newValue: boolean,
        openPopup: boolean
    ) => void;
}) => {
    const [{ favoritePeaks, map }] = useDashboard();
    const [{ user }] = useUser();

    if (!user) return null;

    const { units } = user;

    const onRowClick = (lat: number, long: number) => {
        map?.flyTo({
            center: [long, lat],
            zoom: 12,
        });
    };

    return (
        <>
            <Box width="100%">
                <Typography variant="h4" color="primary.onContainer">
                    Your Favorite Peaks
                </Typography>
                <Divider
                    sx={{
                        backgroundColor: "primary.onContainer",
                        height: "2px",
                        marginTop: "12px",
                    }}
                />
            </Box>
            <Box sx={containerStyles}>
                {favoritePeaks && favoritePeaks.length > 0 ? (
                    <List sx={listStyles}>
                        {favoritePeaks.map((peak, index) => (
                            <UnclimbedPeakRow
                                onFavoriteClick={(peakId, newValue) =>
                                    onFavoriteClick(peakId, newValue, false)
                                }
                                key={index}
                                peak={{
                                    ...peak,
                                    distance: 0,
                                }}
                                units={units}
                                rowColor="primary"
                                onRowClick={onRowClick}
                            />
                        ))}
                    </List>
                ) : (
                    <Typography
                        variant="body1"
                        color="primary.onContainerDim"
                        textAlign="center"
                    >
                        Looks like you haven't favorited any peaks yet!
                    </Typography>
                )}
            </Box>
        </>
    );
};

export default FavoritePeaks;
