"use client";
import { usePeaks } from "@/state_old/PeaksContext";
import { Button, ButtonGroup, SxProps } from "@mui/material";
import { GeoJSONSource } from "mapbox-gl";
import React, { useCallback } from "react";
import convertUnclimbedPeaksToGEOJson from "@/helpers/convertUnclimbedPeaksToGEOJson";
import convertPeakSummitsToGeoJSON from "@/helpers/convertPeakSummitsToGeoJSON";
import getUnclimbedPeaksWithBounds from "@/actions/peaks/getUnclimbedPeaksWithBounds";
import { useMessage } from "@/state_old/MessageContext";

const buttonGroupStyles: SxProps = {
    borderRadius: "24px",
    borderColor: "primary.onContainer",
};

const buttonStyles = (selected: boolean): SxProps => ({
    borderRadius: "24px",
    borderColor: "primary.onContainer",
    backgroundColor: selected ? "primary.onContainer" : "transparent",
    color: selected ? "primary.container" : "primary.onContainer",
});

const PeakSelectionButtons = () => {
    const [
        {
            peakSummits,
            peakSelection,
            showSummittedPeaks,
            search,
            limitResultsToBbox,
            map,
        },
        setPeaksState,
    ] = usePeaks();
    const [, dispatch] = useMessage();

    const handleCompletedClick = () => {
        setPeaksState((state) => ({
            ...state,
            peakSelection: {
                type: "completed",
                data: peakSummits ?? [],
            },
        }));
        (map?.getSource("peakSummits") as GeoJSONSource)?.setData(
            convertPeakSummitsToGeoJSON(peakSummits ?? [])
        );
        (map?.getSource("unclimbedPeaks") as GeoJSONSource)?.setData({
            type: "FeatureCollection",
            features: [],
        });
        (map?.getSource("favoritePeaks") as GeoJSONSource)?.setData({
            type: "FeatureCollection",
            features: [],
        });
    };

    const handleUnclimbedClick = async () => {
        setPeaksState((state) => ({
            ...state,
            peakSelection: {
                type: "unclimbed",
                data: [],
            },
        }));
        (map?.getSource("peakSummits") as GeoJSONSource)?.setData({
            type: "FeatureCollection",
            features: [],
        });
    };

    const getNewData = useCallback(async () => {
        console.log("getting new data", peakSelection.type);
        if (peakSelection.type === "unclimbed") {
            const bounds = map?.getBounds();
            if (!limitResultsToBbox && search === "") {
                dispatch({
                    type: "SET_MESSAGE",
                    payload: {
                        text: "Either enter a search term or limit results to map bounds",
                        type: "error",
                    },
                });
                return;
            }
            const unclimbedPeaks = await getUnclimbedPeaksWithBounds(
                limitResultsToBbox
                    ? {
                          northwest: [
                              bounds?.getNorthWest().lat ?? 0,
                              bounds?.getNorthWest().lng ?? 0,
                          ],
                          southeast: [
                              bounds?.getSouthEast().lat ?? 0,
                              bounds?.getSouthEast().lng ?? 0,
                          ],
                      }
                    : undefined,
                search,
                showSummittedPeaks
            );
            setPeaksState((state) => ({
                ...state,
                peakSelection: {
                    type: "unclimbed",
                    data: unclimbedPeaks,
                },
            }));
            (map?.getSource("unclimbedPeaks") as GeoJSONSource)?.setData(
                convertUnclimbedPeaksToGEOJson(
                    unclimbedPeaks.filter(
                        (peak) =>
                            (!peak.isFavorited && !peak.isSummitted) ||
                            peak.isSummitted
                    )
                )
            );
            (map?.getSource("favoritePeaks") as GeoJSONSource)?.setData(
                convertUnclimbedPeaksToGEOJson(
                    unclimbedPeaks.filter(
                        (peak) => peak.isFavorited && !peak.isSummitted
                    )
                )
            );
        }
    }, [
        map,
        showSummittedPeaks,
        search,
        limitResultsToBbox,
        dispatch,
        peakSelection.type,
    ]);

    React.useEffect(() => {
        console.log("use effect", peakSelection.type);
        if (peakSelection.type === "unclimbed") {
            getNewData();
        }
    }, [peakSelection.type]);

    React.useEffect(() => {
        if (map) {
            map?.on("moveend", getNewData);
        }
        return () => {
            map?.off("moveend", getNewData);
        };
    }, [map, getNewData]);

    return (
        <ButtonGroup
            variant="outlined"
            fullWidth
            aria-label="Basic button group"
            sx={buttonGroupStyles}
        >
            <Button
                sx={buttonStyles(peakSelection.type === "completed")}
                onClick={handleCompletedClick}
            >
                Completed
            </Button>
            <Button
                sx={buttonStyles(peakSelection.type === "unclimbed")}
                onClick={handleUnclimbedClick}
            >
                All
            </Button>
        </ButtonGroup>
    );
};

export default PeakSelectionButtons;
