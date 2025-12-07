import mapboxgl from "mapbox-gl";
import colors from "../theme/colors";
import loadMapDefaults from "./loadMapDefaults";
import oklchToHex from "../../helpers/oklchToHex";
import Peak from "@/typeDefs/Peak";
import PeakPopup from "@/components/app/peaks/PeakPopup";
import renderPopup from "./renderPopup";
import { useRouter } from "next/navigation";
import { parse, oklch, formatHex } from "culori";

const addMapConfiguration = (
    map: mapboxgl.Map | null,
    router: ReturnType<typeof useRouter>,
    isFirstLoad: boolean,
    isSatellite: boolean = false
) => {
    if (map !== null) {
        loadMapDefaults(map, isFirstLoad, "all");

        // SOURCES
        map?.addSource("peaks", {
            type: "geojson",
            data: {
                type: "FeatureCollection",
                features: [],
            },
            cluster: true,
            clusterMaxZoom: 14,
            clusterRadius: 35,
        });
        map?.addSource("selectedPeaks", {
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
            id: "activities-border",
            type: "line",
            source: "activities",
            layout: {
                "line-join": "round",
                "line-cap": "round",
            },
            paint: {
                "line-color": isSatellite
                    ? "rgba(0, 0, 0, 0.8)"
                    : "rgba(255, 255, 255, 0.8)",
                "line-width": 5,
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
                "line-color": isSatellite
                    ? formatHex(parse(colors.primaryForeground))
                    : formatHex(parse(colors.primaryDim)),
                "line-width": 3,
            },
        });

        map.addLayer({
            id: "activityStarts",
            type: "circle",
            source: "activityStarts",
            paint: {
                "circle-color": formatHex(parse(colors.primaryForegroundDim)),
                "circle-radius": 8,
                "circle-stroke-color": formatHex(parse(colors.primaryDim)),
                "circle-stroke-width": 1,
            },
        });

        map?.addLayer({
            id: "peaks",
            type: "symbol",
            source: "peaks",
            filter: ["!", ["has", "point_count"]],
            paint: {
                "text-color": isSatellite
                    ? "#ffffff"
                    : formatHex(parse(colors.primaryDim)),
                "text-halo-color": isSatellite
                    ? "rgba(0, 0, 0, 0.8)"
                    : "rgba(255, 255, 255, 0.8)",
                "text-halo-width": 1.5,
            },
            layout: {
                "text-field": ["get", "name"],
                "text-font": isSatellite
                    ? ["DIN Offc Pro Bold", "Arial Unicode MS Bold"]
                    : ["DIN Offc Pro Medium", "Arial Unicode MS Regular"],
                "text-anchor": "top",
                "text-offset": [0, 1],
                "text-size": 12,
                "text-optional": true,
                "icon-image": [
                    "case",
                    ["all", ["has", "summits"], [">", ["get", "summits"], 0]],
                    "marker-secondary",
                    "marker-primary",
                ],
                "icon-size": [
                    "case",
                    ["all", ["has", "summits"], [">", ["get", "summits"], 0]],
                    0.25,
                    0.2,
                ],
                "icon-allow-overlap": true,
                "icon-anchor": "bottom",
            },
        });

        map?.addLayer({
            id: "selectedPeaks",
            type: "symbol",
            source: "selectedPeaks",
            paint: {
                "text-color": isSatellite
                    ? "#ffffff"
                    : formatHex(parse(colors.primaryDim)),
                "text-halo-color": isSatellite
                    ? "rgba(0, 0, 0, 0.8)"
                    : "rgba(255, 255, 255, 0.8)",
                "text-halo-width": 1.5,
            },
            layout: {
                "text-field": ["get", "name"],
                "text-font": isSatellite
                    ? ["DIN Offc Pro Bold", "Arial Unicode MS Bold"]
                    : ["DIN Offc Pro Medium", "Arial Unicode MS Regular"],
                "text-anchor": "top",
                "text-offset": [0, 1],
                "text-size": 12,
                "text-optional": true,
                "icon-image": [
                    "case",
                    ["all", ["has", "summits"], [">", ["get", "summits"], 0]],
                    "marker-secondary",
                    "marker-primary",
                ],
                "icon-size": 0.4,
                "icon-allow-overlap": true,
                "icon-anchor": "bottom",
            },
        });

        map?.addLayer({
            id: "clusters",
            type: "circle",
            source: "peaks",
            filter: ["has", "point_count"],
            paint: {
                "circle-color": oklchToHex(colors.primaryDim),
                "circle-radius": 14,
            },
        });

        map?.addLayer({
            id: "cluster-count",
            type: "symbol",
            source: "peaks",
            filter: ["has", "point_count"],
            paint: {
                "text-color": formatHex(parse(colors.primaryForeground)),
                // "text-halo-color": isSatellite
                //     ? "rgba(0, 0, 0, 0.6)"
                //     : "rgba(255, 255, 255, 0.6)",
                // "text-halo-width": 1,
            },
            layout: {
                "text-field": ["get", "point_count_abbreviated"],
                "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
                "text-size": 10,
            },
        });

        // map?.addLayer({
        //     id: "favoritePeaks",
        //     type: "symbol",
        //     source: "favoritePeaks",
        //     filter: ["!", ["has", "point_count"]],
        //     layout: {
        //         "icon-image": "marker-tertiary",
        //         "icon-size": 0.2,
        //         "icon-allow-overlap": true,
        //         "icon-anchor": "bottom",
        //     },
        // });
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

        map?.on("click", "peaks", (e) => {
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
                            router.push(`/m/peaks/${peak.id}`);
                            document
                                .querySelectorAll(".mapboxgl-popup")
                                .forEach((p) => p.remove());
                        }}
                    />
                );

                renderPopup(map, coordinates as [number, number], popup);
            }
        });

        map?.on("click", "clusters", (e) => {
            const features = map?.queryRenderedFeatures(e.point, {
                layers: ["clusters"],
            });
            const clusterId = features?.[0].properties?.cluster_id;
            (
                map?.getSource("peaks") as mapboxgl.GeoJSONSource
            )?.getClusterExpansionZoom(clusterId, (err, zoom) => {
                if (err) return;

                if (features?.[0].geometry.type === "Point") {
                    map?.easeTo({
                        center: features?.[0].geometry.coordinates as [
                            number,
                            number
                        ],
                        zoom: zoom ?? undefined,
                    });
                }
            });
        });
    }
};

export default addMapConfiguration;
