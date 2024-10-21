"use client";
import { usePeaks } from "@/state/PeaksContext";
import { usePeaksMap } from "@/state/PeaksMapContext";
import { Button, ButtonGroup, SxProps, useTheme } from "@mui/material";
import mapboxgl, { GeoJSONSource } from "mapbox-gl";
import React from "react";
import PeakMarker from "../dashboard/PeakMarker";
import CompletedPopup from "../dashboard/CompletedPopup";
import { useUser } from "@/state/UserContext";
import getUnclimbedPeaks from "@/actions/getUnclimbedPeaks";
import convertUnclimbedPeaksToGEOJson from "@/helpers/convertUnclimbedPeaksToGEOJson";
import convertPeakSummitsToGeoJSON from "@/helpers/convertPeakSummitsToGeoJSON";
import getUnclimbedPeaksWithBounds from "@/actions/getUnclimbedPeaksWithBounds";

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
    const [{ peakSelection, peakSummits }, setPeaksState] = usePeaks();
    const [peaksMap, setPeaksMapState] = usePeaksMap();

    const handleCompletedClick = () => {
        setPeaksState((state) => ({
            ...state,
            peakSelection: {
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

    const getNewData = async (e?: {
        type: "moveend";
        target: mapboxgl.Map;
    }) => {
        // workaroundbecause map.off is not working
        const data = e?.target?.querySourceFeatures("peakSummits");
        if (!data || data.length === 0) {
            const bounds = peaksMap.map?.getBounds();
            const northwest = bounds?.getNorthWest();
            const southeast = bounds?.getSouthEast();
            const unclimbedPeaks = await getUnclimbedPeaksWithBounds({
                northwest: [northwest?.lat ?? 0, northwest?.lng ?? 0],
                southeast: [southeast?.lat ?? 0, southeast?.lng ?? 0],
            });
            setPeaksState((state) => ({
                ...state,
                peakSelection: {
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
    };

    React.useEffect(() => {
        if (peaksMap.map) {
            peaksMap.map?.on("moveend", getNewData);
        }
        return () => {
            peaksMap.map?.off("moveend", getNewData);
        };
    }, [peaksMap.map]);

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
                Unclimbed
            </Button>
        </ButtonGroup>
    );
};

export default PeakSelectionButtons;
