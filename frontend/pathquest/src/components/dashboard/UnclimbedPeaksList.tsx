"use client";
import { usePeaks } from "@/state/PeaksContext";
import { Box, Divider, List, SxProps, Typography } from "@mui/material";
import React from "react";
import UnclimbedPeakRow from "./UnclimbedPeakRow";
import { useUser } from "@/state/UserContext";
import toggleFavoritePeak from "@/actions/toggleFavoritePeak";
import { useMessage } from "@/state/MessageContext";
import FavoritedPeak from "@/typeDefs/FavoritedPeak";

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
    onRowClick,
}: {
    onRowClick: (lat: number, long: number) => void;
}) => {
    const [{ unclimbedPeaks }, setPeaksState] = usePeaks();
    const [{ user }] = useUser();
    const [, dispatch] = useMessage();

    if (!user) return null;

    const { units } = user;

    const onFavoriteClick = async (peakId: string, newValue: boolean) => {
        setPeaksState((state) => {
            if (!state.unclimbedPeaks) return state;
            const newPeaks = state.unclimbedPeaks.map((peak) => {
                if (peak.Id === peakId) {
                    return { ...peak, isFavorited: newValue };
                }
                return peak;
            });

            if (state.favoritePeaks) {
                const newfavoritePeaks = newValue
                    ? [
                          newPeaks.find(
                              (peak) => peak.Id === peakId
                          ) as FavoritedPeak,
                          ...state.favoritePeaks,
                      ]
                    : state.favoritePeaks.filter((peak) => peak.Id !== peakId);
                return {
                    ...state,
                    unclimbedPeaks: newPeaks,
                    favoritePeaks: newfavoritePeaks,
                };
            }
            return {
                ...state,
                unclimbedPeaks: newPeaks,
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
                if (!state.unclimbedPeaks) return state;
                const newPeaks = state.unclimbedPeaks.map((peak) => {
                    if (peak.Id === peakId) {
                        return { ...peak, favorite: !newValue };
                    }
                    return peak;
                });

                if (state.favoritePeaks) {
                    const newfavoritePeaks = !newValue
                        ? [
                              newPeaks.find(
                                  (peak) => peak.Id === peakId
                              ) as FavoritedPeak,
                              ...state.favoritePeaks,
                          ]
                        : state.favoritePeaks.filter(
                              (peak) => peak.Id !== peakId
                          );
                    return {
                        ...state,
                        unclimbedPeaks: newPeaks,
                        favoritePeaks: newfavoritePeaks,
                    };
                }
                return {
                    ...state,
                    unclimbedPeaks: newPeaks,
                };
            });
        }
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
                {unclimbedPeaks && unclimbedPeaks.length > 0 ? (
                    <List sx={listStyles}>
                        {unclimbedPeaks
                            .sort((a, b) => a.distance - b.distance)
                            .map((peak) => (
                                <UnclimbedPeakRow
                                    onFavoriteClick={onFavoriteClick}
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
