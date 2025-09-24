import Activity from "@/typeDefs/Activity";
import PeakSummit from "@/typeDefs/PeakSummit";
import { Theme } from "@mui/material";
import mapboxgl from "mapbox-gl";
import primaryMarker from "@/public/images/marker-primary.png";
import loadMapDefaults from "@/helpers/loadMapDefaults";

const addActivityDetailMarkers = (
    map: mapboxgl.Map | null,
    theme: Theme,
    activity: Activity,
    peakSummits: PeakSummit[]
) => {
    if (!map) return;

    const bounds = new mapboxgl.LngLatBounds();

    const coords =
        typeof activity.coords === "string"
            ? (JSON.parse(activity.coords) as [number, number][])
            : activity.coords;

    for (const coord of coords) {
        bounds.extend([coord[1], coord[0]]);
    }

    map.fitBounds(bounds, {
        padding: 20,
    });

    loadMapDefaults(map, theme, "markers");

    map.addSource("activities", {
        type: "geojson",
        data: {
            type: "FeatureCollection",
            features: [
                {
                    type: "Feature",
                    geometry: {
                        type: "LineString",
                        coordinates: coords.map((c) => [c[1], c[0]]),
                    },
                    properties: {
                        id: activity.id,
                    },
                },
            ],
        },
    });

    map.addSource("activityStarts", {
        type: "geojson",
        data: {
            type: "FeatureCollection",
            features: [
                {
                    type: "Feature",
                    geometry: {
                        type: "Point",
                        coordinates: [activity.startLong, activity.startLat],
                    },
                    properties: {
                        id: activity.id,
                    },
                },
            ],
        },
    });

    map.addSource("peaks", {
        type: "geojson",
        data: {
            type: "FeatureCollection",
            features: peakSummits.map((peak) => ({
                type: "Feature",
                geometry: {
                    type: "Point",
                    coordinates: [peak.Long, peak.Lat],
                },
                properties: {
                    id: peak.Id,
                    ...peak,
                },
            })),
        },
    });

    map.addSource("coordinatePoints", {
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
        id: "coordinatePoints",
        type: "circle",
        source: "coordinatePoints",
        paint: {
            "circle-color": theme.palette.secondary.onContainerDim,
            "circle-radius": 4,
            "circle-stroke-color": theme.palette.secondary.containerDim,
            "circle-stroke-width": 1,
        },
    });

    map.addLayer({
        id: "peaks",
        type: "symbol",
        source: "peaks",
        paint: {
            "text-color": theme.palette.primary.container,
        },
        layout: {
            "text-field": ["get", "Name"],
            "text-anchor": "top",
            "text-offset": [0, 1],
            "text-size": 12,
            "icon-image": "marker-primary",
            "icon-size": 0.2,
            "icon-allow-overlap": true,
            "icon-anchor": "bottom",
            "icon-ignore-placement": true,
            "text-optional": true,
        },
    });
};

export default addActivityDetailMarkers;
