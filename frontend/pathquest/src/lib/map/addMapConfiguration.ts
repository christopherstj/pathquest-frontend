import mapboxgl from "mapbox-gl";
import colors from "../theme/colors";
import loadMapDefaults from "./loadMapDefaults";
import oklchToHex from "../utils/oklchToHex";

const addMapConfiguration = (map: mapboxgl.Map | null) => {
    if (map !== null) {
        loadMapDefaults(map, "all");

        map?.addSource("peakSummits", {
            type: "geojson",
            data: {
                type: "FeatureCollection",
                features: [],
            },
        });
        map?.addSource("unclimbedPeaks", {
            type: "geojson",
            data: {
                type: "FeatureCollection",
                features: [],
            },
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 50,
        });
        map?.addSource("favoritePeaks", {
            type: "geojson",
            data: {
                type: "FeatureCollection",
                features: [],
            },
        });
        map?.addSource("challenges", {
            type: "geojson",
            data: {
                type: "FeatureCollection",
                features: [],
            },
        });
        map.addSource("activities", {
            type: "geojson",
            data: {
                type: "FeatureCollection",
                features: [],
            },
        });
        map.addSource("activityStarts", {
            type: "geojson",
            data: {
                type: "FeatureCollection",
                features: [],
            },
        });

        map.addLayer({
            id: "activities",
            type: "line",
            source: "activities",
            layout: {
                "line-join": "round",
                "line-cap": "round",
            },
            paint: {
                "line-color": colors.primaryDim,
                "line-width": 3,
            },
        });

        map.addLayer({
            id: "activityStarts",
            type: "circle",
            source: "activityStarts",
            paint: {
                "circle-color": colors.primaryForegroundDim,
                "circle-radius": 8,
                "circle-stroke-color": colors.primaryDim,
                "circle-stroke-width": 1,
            },
        });

        map?.addLayer({
            id: "peakSummits",
            type: "symbol",
            source: "peakSummits",
            layout: {
                "icon-image": "marker-primary",
                "icon-size": 0.2,
                "icon-allow-overlap": true,
                "icon-anchor": "bottom",
            },
        });
        map?.addLayer({
            id: "unclimbedPeaks",
            type: "symbol",
            source: "unclimbedPeaks",
            filter: ["!", ["has", "point_count"]],
            layout: {
                "icon-image": "marker-secondary",
                "icon-size": 0.2,
                "icon-allow-overlap": true,
                "icon-anchor": "bottom",
            },
        });

        map?.addLayer({
            id: "clusters",
            type: "circle",
            source: "unclimbedPeaks",
            filter: ["has", "point_count"],
            paint: {
                "circle-color": oklchToHex(colors.secondaryForegroundDim),
                "circle-radius": 20,
            },
        });

        map?.addLayer({
            id: "cluster-count",
            type: "symbol",
            source: "unclimbedPeaks",
            filter: ["has", "point_count"],
            layout: {
                "text-field": ["get", "point_count_abbreviated"],
                "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
                "text-size": 12,
            },
        });

        map?.addLayer({
            id: "favoritePeaks",
            type: "symbol",
            source: "favoritePeaks",
            filter: ["!", ["has", "point_count"]],
            layout: {
                "icon-image": "marker-tertiary",
                "icon-size": 0.2,
                "icon-allow-overlap": true,
                "icon-anchor": "bottom",
            },
        });
        map?.addLayer({
            id: "challenges",
            type: "symbol",
            source: "challenges",
            layout: {
                "icon-image": [
                    "image",
                    [
                        "case",
                        ["==", ["get", "total"], ["get", "completed"]],
                        "challenge-primary",
                        ["==", ["get", "completed"], 0],
                        "challenge-secondary",
                        "challenge-tertiary",
                    ],
                ],
                "icon-size": 0.2,
                "icon-allow-overlap": true,
                "icon-anchor": "bottom",
            },
        });
    }
};

export default addMapConfiguration;
