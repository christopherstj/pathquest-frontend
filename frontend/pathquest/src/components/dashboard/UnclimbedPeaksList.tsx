"use client";
import { Box, Divider, List, SxProps, Typography } from "@mui/material";
import React from "react";
import UnclimbedPeakRow from "./UnclimbedPeakRow";
import { useUser } from "@/state/UserContext";
import { useDashboard } from "@/state/DashboardContext";

const containerStyles: SxProps = {
    borderRadius: "12px",
    backgroundColor: "secondary.container",
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
    flex: 1,
    overflowY: "scroll",
    "&::-webkit-scrollbar": {
        width: "8px",
    },
    "&::-webkit-scrollbar-thumb": {
        backgroundColor: "secondary.onContainer",
        borderRadius: "8px",
    },
    "&::-webkit-scrollbar-thumb:hover": {
        backgroundColor: "secondary.onContainerDim",
    },
    "&::-webkit-scrollbar-track": {
        backgroundColor: "transparent",
    },
};

const UnclimbedPeaksList = ({
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
                <Typography variant="h4" color="secondary.onContainer">
                    Nearby Goals
                </Typography>
                <Divider
                    sx={{
                        backgroundColor: "secondary.onContainer",
                        height: "2px",
                        marginTop: "12px",
                    }}
                />
            </Box>
            <Box sx={containerStyles}>
                {favoritePeaks && favoritePeaks.length > 0 ? (
                    <List sx={listStyles}>
                        {favoritePeaks.map((peak) => (
                            <UnclimbedPeakRow
                                onFavoriteClick={(peakId, newValue) =>
                                    onFavoriteClick(peakId, newValue, false)
                                }
                                onRowClick={onRowClick}
                                key={peak.Id}
                                peak={peak}
                                units={units}
                                rowColor="secondary"
                            />
                        ))}
                    </List>
                ) : (
                    <Typography
                        variant="body1"
                        color="secondary.onContainerDim"
                        textAlign="center"
                    >
                        Looks like something went wrong. Please try again later.
                    </Typography>
                )}
            </Box>
        </>
    );
};

export default UnclimbedPeaksList;
