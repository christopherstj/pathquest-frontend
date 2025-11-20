"use client";
import convertActivitiesToGeoJSON from "@/helpers/convertActivitiesToGeoJSON";
import convertPeaksToGeoJSON from "@/helpers/convertPeaksToGeoJSON";
import getNewData from "@/helpers/getNewData";
import { useMapStore } from "@/providers/MapProvider";
import Activity from "@/typeDefs/Activity";
import Peak from "@/typeDefs/Peak";
import React, { useCallback } from "react";

type Props = {
    peak?: Peak;
    activities?: Activity[];
};

const PeakDetailMapInteraction = ({ peak, activities }: Props) => {
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

        let peaksSource = map.getSource("selectedPeaks") as
            | mapboxgl.GeoJSONSource
            | undefined;

        let attempts = 0;
        const maxAttempts = 5;

        while (!peaksSource && attempts < maxAttempts) {
            console.log(
                `selectedPeaks source not found. Retrying... (${
                    attempts + 1
                }/${maxAttempts})`
            );
            attempts++;
            await new Promise((resolve) => setTimeout(resolve, 500));
            peaksSource = map.getSource("selectedPeaks") as
                | mapboxgl.GeoJSONSource
                | undefined;
        }

        if (peaksSource) {
            peaksSource.setData(
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

        if (!activities) return;

        let activitiesSource = map.getSource("activities") as
            | mapboxgl.GeoJSONSource
            | undefined;

        let activityStartsSource = map.getSource("activityStarts") as
            | mapboxgl.GeoJSONSource
            | undefined;

        attempts = 0;

        while (
            (!activitiesSource || !activityStartsSource) &&
            attempts < maxAttempts
        ) {
            console.log(
                `activities sources not found. Retrying... (${
                    attempts + 1
                }/${maxAttempts})`
            );
            attempts++;
            await new Promise((resolve) => setTimeout(resolve, 500));
            activitiesSource = map.getSource("activities") as
                | mapboxgl.GeoJSONSource
                | undefined;
            activityStartsSource = map.getSource("activityStarts") as
                | mapboxgl.GeoJSONSource
                | undefined;
        }

        if (activitiesSource && activityStartsSource) {
            const [lineStrings, starts] =
                convertActivitiesToGeoJSON(activities);

            activitiesSource.setData(lineStrings);
            activityStartsSource.setData(starts);
        } else {
            console.log("No source found for activities");
        }
    };

    const removeDataSource = () => {
        if (!map) return;
        const peaksSource = map.getSource("selectedPeaks") as
            | mapboxgl.GeoJSONSource
            | undefined;
        const activitiesSource = map.getSource("activities") as
            | mapboxgl.GeoJSONSource
            | undefined;

        const activityStartsSource = map.getSource("activityStarts") as
            | mapboxgl.GeoJSONSource
            | undefined;

        if (peaksSource) {
            peaksSource.setData({
                type: "FeatureCollection",
                features: [],
            });
        }

        if (activitiesSource) {
            activitiesSource.setData({
                type: "FeatureCollection",
                features: [],
            });
        }

        if (activityStartsSource) {
            activityStartsSource.setData({
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
