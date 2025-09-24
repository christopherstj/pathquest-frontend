import { Theme } from "@mui/material";
import mapboxgl from "mapbox-gl";
import primaryMarker from "@/public/images/marker-primary.png";

const addActivitiesMarkers = (map: mapboxgl.Map | null, theme: Theme) => {
    if (!map) return;

    map.addControl(new mapboxgl.NavigationControl(), "top-left");

    map.loadImage(primaryMarker.src, (error, image) => {
        if (error) throw error;
        if (image) map?.addImage("marker-primary", image);
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
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
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
            "line-color": theme.palette.primary.containerDim,
            "line-width": 3,
        },
    });

    map.addLayer({
        id: "activityStarts",
        type: "circle",
        source: "activityStarts",
        paint: {
            "circle-color": theme.palette.primary.onContainerDim,
            "circle-radius": 8,
            "circle-stroke-color": theme.palette.primary.containerDim,
            "circle-stroke-width": 1,
        },
    });

    map.addLayer({
        id: "clusters",
        type: "circle",
        source: "activityStarts",
        filter: ["has", "point_count"],
        paint: {
            "circle-color": theme.palette.primary.onContainerDim,
            "circle-radius": 20,
        },
    });

    map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "activityStarts",
        filter: ["has", "point_count"],
        layout: {
            "text-field": ["get", "point_count_abbreviated"],
            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
            "text-size": 12,
        },
    });
};

export default addActivitiesMarkers;
