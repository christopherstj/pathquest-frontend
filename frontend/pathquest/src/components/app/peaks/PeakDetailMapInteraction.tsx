"use client";
import convertPeaksToGeoJSON from "@/helpers/convertPeaksToGeoJSON";
import getNewData from "@/helpers/getNewData";
import { useMapStore } from "@/providers/MapProvider";
import Peak from "@/typeDefs/Peak";
import React, { useCallback } from "react";

type Props = {
    peak?: Peak;
};

const PeakDetailMapInteraction = ({ peak }: Props) => {
    const map = useMapStore((state) => state.map);

    const [peaks, setPeaks] = React.useState<Peak[]>([]);
    const [firstLoad, setFirstLoad] = React.useState(true);

    const resizeCallback = useCallback(
        () =>
            getNewData(
                "",
                true,
                setPeaks,
                map,
                (p) => !peak || p.id.toString() !== peak.id.toString()
            ),
        [map, setPeaks]
    );

    const zoomMap = () => {
        if (!map || !peak) return;
        if (peak.location_coords) {
            map.flyTo({ center: peak.location_coords, zoom: 13 });
        }
    };

    const setDataSource = async () => {
        if (!map) return;

        console.log("Setting data source for selectedPeaks");

        let source = map.getSource("selectedPeaks") as
            | mapboxgl.GeoJSONSource
            | undefined;

        let attempts = 0;
        const maxAttempts = 5;

        while (!source && attempts < maxAttempts) {
            console.log(
                `selectedPeaks source not found. Retrying... (${
                    attempts + 1
                }/${maxAttempts})`
            );
            attempts++;
            await new Promise((resolve) => setTimeout(resolve, 500));
            source = map.getSource("selectedPeaks") as
                | mapboxgl.GeoJSONSource
                | undefined;
        }

        if (source) {
            source.setData(
                peak
                    ? convertPeaksToGeoJSON([peak])
                    : {
                          type: "FeatureCollection",
                          features: [],
                      }
            );
        } else {
            console.log("No source found for selectedPeaks");
        }
    };

    const removeDataSource = () => {
        if (!map) return;
        const source = map.getSource("selectedPeaks") as
            | mapboxgl.GeoJSONSource
            | undefined;

        if (source) {
            source.setData({
                type: "FeatureCollection",
                features: [],
            });
        }
    };

    React.useEffect(() => {
        if (!map) return;
        zoomMap();
        if (firstLoad) {
            setFirstLoad(false);
            resizeCallback();
        } else {
            setDataSource();
        }
        map?.on("moveend", resizeCallback);

        return () => {
            removeDataSource();
            map?.off("moveend", resizeCallback);
        };
    }, [map, firstLoad]);

    return <div />;
};

export default PeakDetailMapInteraction;
