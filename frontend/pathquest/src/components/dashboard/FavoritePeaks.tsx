"use client";
import { usePeaks } from "@/state/PeaksContext";
import { useUser } from "@/state/UserContext";
import { Box, Divider, List, SxProps, Typography } from "@mui/material";
import React from "react";
import UnclimbedPeakRow from "./UnclimbedPeakRow";
import toggleFavoritePeak from "@/actions/toggleFavoritePeak";
import { useMessage } from "@/state/MessageContext";

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
    onRowClick,
    onFavoriteClick,
}: {
    onRowClick: (lat: number, long: number) => void;
    onFavoriteClick: (
        peakId: string,
        newValue: boolean,
        openPopup: boolean
    ) => void;
}) => {
    const [{ favoritePeaks }, setPeaksState] = usePeaks();
    const [{ user }] = useUser();
    const [, dispatch] = useMessage();

    if (!user) return null;

    const { units } = user;

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
                        Looks like something went wrong. Please try again later.
                    </Typography>
                )}
            </Box>
        </>
    );
};

export default FavoritePeaks;
