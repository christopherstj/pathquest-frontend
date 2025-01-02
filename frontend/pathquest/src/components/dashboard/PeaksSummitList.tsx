"use client";
import { Divider, List, SxProps, Typography } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";
import PeakSummtRow from "./PeakSummitRow";
import { useUser } from "@/state/UserContext";
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

const PeaksSummitList = () => {
    const [{ peakSummits, map }] = useDashboard();
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
                    Your Most Summitted Peaks
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
                {peakSummits && peakSummits.length > 0 ? (
                    <List sx={listStyles}>
                        {peakSummits.map((peak) => (
                            <PeakSummtRow
                                key={peak.Id}
                                peakSummit={peak}
                                units={units}
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
                        Looks like you haven't summited any peaks yet! Get out
                        there and start climbing!
                    </Typography>
                )}
            </Box>
        </>
    );
};

export default PeaksSummitList;
