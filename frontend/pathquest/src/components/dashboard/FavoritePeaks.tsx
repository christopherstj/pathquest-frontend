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

const FavoritePeaks = () => {
    const [{ favoritePeaks }, setPeaksState] = usePeaks();
    const [{ user }] = useUser();
    const [, dispatch] = useMessage();

    if (!user) return null;

    const { units } = user;

    const onFavoriteClick = async (peakId: string, newValue: boolean) => {
        setPeaksState((state) => {
            if (!state.favoritePeaks) return state;
            const newPeaks = state.favoritePeaks.map((peak) => {
                if (peak.Id === peakId) {
                    return { ...peak, isFavorited: newValue };
                }
                return peak;
            });
            return {
                ...state,
                favoritePeaks: newPeaks,
                unclimbedPeaks: (state.unclimbedPeaks ?? []).map((peak) => ({
                    ...peak,
                    isFavorited: newPeaks.some(
                        (favoritePeak) =>
                            favoritePeak.Id === peak.Id &&
                            favoritePeak.isFavorited
                    ),
                })),
            };
        });

        const success = await toggleFavoritePeak(peakId, newValue);

        if (!success) {
            dispatch({
                type: "SET_MESSAGE",
                payload: {
                    text: "Failed to update favorite status",
                    type: "error",
                },
            });

            setPeaksState((state) => {
                if (!state.favoritePeaks) return state;
                const newPeaks = state.favoritePeaks.map((peak) => {
                    if (peak.Id === peakId) {
                        return { ...peak, isFavorited: !newValue };
                    }
                    return peak;
                });
                return {
                    ...state,
                    favoritePeaks: newPeaks,
                    unclimbedPeaks: (state.unclimbedPeaks ?? []).map(
                        (peak) => ({
                            ...peak,
                            isFavorited: newPeaks.some(
                                (favoritePeak) =>
                                    favoritePeak.Id === peak.Id &&
                                    favoritePeak.isFavorited
                            ),
                        })
                    ),
                };
            });
        }
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
                        {favoritePeaks.map((peak) => (
                            <UnclimbedPeakRow
                                onFavoriteClick={onFavoriteClick}
                                key={peak.Id}
                                peak={{
                                    ...peak,
                                    distance: 0,
                                }}
                                units={units}
                                rowColor="primary"
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
