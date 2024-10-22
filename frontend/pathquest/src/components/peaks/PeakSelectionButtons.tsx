"use client";
import { usePeaks } from "@/state/PeaksContext";
import { usePeaksMap } from "@/state/PeaksMapContext";
import { Button, ButtonGroup, SxProps, useTheme } from "@mui/material";
import mapboxgl, { GeoJSONSource } from "mapbox-gl";
import React, { useCallback } from "react";
import PeakMarker from "../dashboard/PeakMarker";
import CompletedPopup from "../dashboard/CompletedPopup";
import { useUser } from "@/state/UserContext";
import getUnclimbedPeaks from "@/actions/getUnclimbedPeaks";
import convertUnclimbedPeaksToGEOJson from "@/helpers/convertUnclimbedPeaksToGEOJson";
import convertPeakSummitsToGeoJSON from "@/helpers/convertPeakSummitsToGeoJSON";
import getUnclimbedPeaksWithBounds from "@/actions/getUnclimbedPeaksWithBounds";
import UnclimbedPeak from "@/typeDefs/UnclimbedPeak";
import { useMessage } from "@/state/MessageContext";

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
            peakSelection,
            peakSummits,
            showSummittedPeaks,
            search,
            limitResultsToBbox,
        },
        setPeaksState,
    ] = usePeaks();
    const [peaksMap, setPeaksMapState] = usePeaksMap();
    const [, dispatch] = useMessage();

    const [refreshList, setRefreshList] = React.useState(false);

    const handleCompletedClick = () => {
        setPeaksState((state) => ({
            ...state,
            peakSelection: {
                ...state.peakSelection,
                type: "completed",
                data: peakSummits ?? [],
            },
        }));
        (peaksMap.map?.getSource("peakSummits") as GeoJSONSource)?.setData(
            convertPeakSummitsToGeoJSON(peakSummits ?? [])
        );
        (peaksMap.map?.getSource("unclimbedPeaks") as GeoJSONSource)?.setData({
            type: "FeatureCollection",
            features: [],
        });
        (peaksMap.map?.getSource("favoritePeaks") as GeoJSONSource)?.setData({
            type: "FeatureCollection",
            features: [],
        });
    };

    const handleUnclimbedClick = async () => {
        setPeaksState((state) => ({
            ...state,
            peakSelection: {
                ...state.peakSelection,
                type: "unclimbed",
                data: [],
            },
        }));
        (peaksMap.map?.getSource("peakSummits") as GeoJSONSource)?.setData({
            type: "FeatureCollection",
            features: [],
        });
        getNewData();
    };

    const getNewData = useCallback(
        async (e?: { type: "moveend"; target: mapboxgl.Map }) => {
            // workaround because map.off is not working
            const data = e?.target?.querySourceFeatures("peakSummits");
            if (!data || data.length === 0) {
                const bounds = peaksMap.map?.getBounds();
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
                        ...state.peakSelection,
                        type: "unclimbed",
                        data: unclimbedPeaks,
                    },
                }));
                (
                    peaksMap.map?.getSource("unclimbedPeaks") as GeoJSONSource
                )?.setData(
                    convertUnclimbedPeaksToGEOJson(
                        unclimbedPeaks.filter((peak) => !peak.isFavorited)
                    )
                );
                (
                    peaksMap.map?.getSource("favoritePeaks") as GeoJSONSource
                )?.setData(
                    convertUnclimbedPeaksToGEOJson(
                        unclimbedPeaks.filter((peak) => peak.isFavorited)
                    )
                );
            }
        },
        [peaksMap.map, showSummittedPeaks, search, limitResultsToBbox, dispatch]
    );

    // React.useEffect(() => {
    //     if (peakSelection.type === "unclimbed" && peakSelection.search === "") {
    //         const unclimbedData =
    //             peaksMap.map?.querySourceFeatures("unclimbedPeaks") ?? [];
    //         const favoritePeaks =
    //             peaksMap.map?.querySourceFeatures("favoritePeaks") ?? [];
    //         setPeaksState((state) => ({
    //             ...state,
    //             peakSelection: {
    //                 ...state.peakSelection,
    //                 type: "unclimbed",
    //                 data: [...unclimbedData, ...favoritePeaks]
    //                     .map((feature) => feature.properties as UnclimbedPeak)
    //                     .sort((a, b) => (b.Altitude ?? 0) - (a.Altitude ?? 0)),
    //             },
    //         }));
    //     }
    // }, [refreshList]);

    React.useEffect(() => {
        if (peaksMap.map) {
            peaksMap.map?.on("moveend", getNewData);
        }
        return () => {
            peaksMap.map?.off("moveend", getNewData);
        };
    }, [peaksMap.map, getNewData]);

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
