import mapboxgl from "mapbox-gl";
import colors from "../theme/colors";
import loadMapDefaults from "./loadMapDefaults";
import oklchToHex from "../utils/oklchToHex";
import Peak from "@/typeDefs/Peak";
import PeakPopup from "@/components/app/peaks/PeakPopup";
import renderPopup from "./renderPopup";
import { useRouter } from "next/navigation";
import { parse, oklch, formatHex } from "culori";

const addMapConfiguration = (
    map: mapboxgl.Map | null,
    router: ReturnType<typeof useRouter>
) => {
    if (map !== null) {
        loadMapDefaults(map, "all");

        // SOURCES

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
        map?.addSource("selectedPeaks", {
            type: "geojson",
            data: {
                type: "FeatureCollection",
                features: [],
            },
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

        // LAYERS

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
            paint: {
                "text-color": formatHex(parse(colors.secondaryDim)),
            },
            layout: {
                "text-field": ["get", "Name"],
                "text-anchor": "top",
                "text-offset": [0, 1],
                "text-size": 12,
                "text-optional": true,
                "icon-image": "marker-secondary",
                "icon-size": 0.2,
                "icon-allow-overlap": true,
                "icon-anchor": "bottom",
            },
        });
        map?.addLayer({
            id: "selectedPeaks",
            type: "symbol",
            source: "selectedPeaks",
            paint: {
                "text-color": formatHex(parse(colors.secondaryDim)),
            },
            layout: {
                "text-field": ["get", "Name"],
                "text-anchor": "top",
                "text-offset": [0, 1],
                "text-size": 16,
                "text-optional": true,
                "icon-image": "marker-secondary",
                "icon-size": 0.6,
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

        // INTERACTIONS

        map?.on("click", "unclimbedPeaks", (e) => {
            e.originalEvent?.stopPropagation();
            const feature = e.features?.[0];

            if (feature?.geometry.type === "Point" && map) {
                const coordinates = feature.geometry.coordinates.slice();

                while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] +=
                        e.lngLat.lng > coordinates[0] ? 360 : -360;
                }

                const peak = feature.properties as Peak;

                const popup = (
                    <PeakPopup
                        peak={peak}
                        onRouteChange={() => {
                            router.push(`/m/peaks/${peak.Id}`);
                            document
                                .querySelectorAll(".mapboxgl-popup")
                                .forEach((p) => p.remove());
                        }}
                    />
                );

                renderPopup(map, coordinates as [number, number], popup);
            }
        });
    }
};

export default addMapConfiguration;
