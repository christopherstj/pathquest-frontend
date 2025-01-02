"use client";
import toggleFavoritePeak from "@/actions/toggleFavoritePeak";
import { usePeakDetail } from "@/state/PeakDetailContext";
import { Box, Button, ButtonBase, SxProps } from "@mui/material";
import { GeoJSONSource } from "mapbox-gl";
import React from "react";
import ManualSummitModal from "./ManualSummitModal";

const containerStyles: SxProps = {
    display: "flex",
    gap: "12px",
    marginTop: "auto",
    width: "100%",
};

const buttonStyles: SxProps = {
    borderRadius: "12px",
    padding: "12px",
    flex: 1,
    textAlign: "center",
};

const PeakButtons = () => {
    const [{ peak, map }, setPeakDetailState] = usePeakDetail();

    const [open, setOpen] = React.useState(false);

    if (!peak) return null;

    const { isFavorited } = peak;

    const handleFavoriteClick = async () => {
        setPeakDetailState((state) => ({
            ...state,
            peak: {
                ...state.peak,
                isFavorited: !isFavorited,
            },
        }));

        if (map) {
            const source = map.getSource("peaks") as GeoJSONSource;

            if (source) {
                source.setData({
                    type: "FeatureCollection",
                    features: [
                        {
                            type: "Feature",
                            geometry: {
                                type: "Point",
                                coordinates: [
                                    peak.Long ?? -111.651302,
                                    peak.Lat ?? 35.198284,
                                ],
                            },
                            properties: {
                                ...peak,
                                isFavorited: !isFavorited,
                            },
                        },
                    ],
                });
            }

            const success = await toggleFavoritePeak(peak.Id, !isFavorited);

            if (!success) {
                setPeakDetailState((state) => ({
                    ...state,
                    peak: {
                        ...state.peak,
                        isFavorited,
                    },
                }));

                source.setData({
                    type: "FeatureCollection",
                    features: [
                        {
                            type: "Feature",
                            geometry: {
                                type: "Point",
                                coordinates: [
                                    peak.Long ?? -111.651302,
                                    peak.Lat ?? 35.198284,
                                ],
                            },
                            properties: {
                                ...peak,
                                isFavorited,
                            },
                        },
                    ],
                });
            }
        }
    };

    return (
        <Box sx={containerStyles}>
            <ButtonBase
                sx={buttonStyles}
                color="primary"
                onClick={handleFavoriteClick}
            >
                {isFavorited ? "Unfavorite" : "Favorite"}
            </ButtonBase>
            <ButtonBase
                sx={buttonStyles}
                color="primary"
                onClick={() => setOpen(true)}
            >
                Manual Summit Log
            </ButtonBase>
            <ManualSummitModal
                open={open}
                onClose={() => setOpen(false)}
                peak={peak}
            />
        </Box>
    );
};

export default PeakButtons;
