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
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
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
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
    });

    map.addLayer({
        id: "clusters",
        type: "circle",
        source: "peaks",
        filter: ["has", "point_count"],
        paint: {
            "circle-color": theme.palette.primary.containerDim,
            "circle-radius": 20,
        },
    });

    map.on("click", "clusters", (e) => {
        const features = e.target.queryRenderedFeatures(e.point, {
            layers: ["clusters"],
        });
        const clusterId = features?.[0].properties?.cluster_id;
        (
            e.target.getSource("peaks") as mapboxgl.GeoJSONSource
        )?.getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err) return;

            if (features?.[0].geometry.type === "Point") {
                e.target.easeTo({
                    center: features?.[0].geometry.coordinates as [
                        number,
                        number
                    ],
                    zoom: zoom ?? undefined,
                });
            }
        });
    });

    map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "peaks",
        filter: ["has", "point_count"],
        paint: {
            "text-color": theme.palette.primary.onContainer,
        },
        layout: {
            "text-field": ["get", "point_count_abbreviated"],
            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
            "text-size": 16,
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
        id: "peaks",
        type: "symbol",
        source: "peaks",
        filter: ["!", ["has", "point_count"]],
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
        },
    });
};

export default addActivityDetailMarkers;
