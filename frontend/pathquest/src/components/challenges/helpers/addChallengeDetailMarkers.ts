import Activity from "@/typeDefs/Activity";
import UnclimbedPeak from "@/typeDefs/UnclimbedPeak";
import mapboxgl from "mapbox-gl";
import primaryMarker from "@/public/images/marker-primary.png";
import secondaryMarker from "@/public/images/marker-secondary.png";
import tertiaryMarker from "@/public/images/marker-tertiary.png";
import convertUnclimbedPeaksToGEOJson from "@/helpers/convertUnclimbedPeaksToGEOJson";
import { Theme } from "@mui/material";
import FavoritePopup from "@/components/dashboard/FavoritePopup";
import UnclimbedPopup from "@/components/dashboard/UnclimbedPopup";

let hoveredPolygonId: number | null = null;

const addChallengeDetailMarkers = (
    map: mapboxgl.Map | null,
    data: {
        peak: UnclimbedPeak;
        activity?: Activity;
    }[],
    theme: Theme,
    units: "metric" | "imperial",
    onFavoriteClick: (peakId: string, newValue: boolean) => Promise<void>
) => {
    const bounds = new mapboxgl.LngLatBounds();

    map?.addControl(new mapboxgl.NavigationControl(), "top-left");

    map?.loadImage(primaryMarker.src, (error, image) => {
        if (error) throw error;
        if (image) map?.addImage("marker-primary", image);
    });
    map?.loadImage(secondaryMarker.src, (error, image) => {
        if (error) throw error;
        if (image) map?.addImage("marker-secondary", image);
    });
    map?.loadImage(tertiaryMarker.src, (error, image) => {
        if (error) throw error;
        if (image) map?.addImage("marker-tertiary", image);
    });

    const geoJson = convertUnclimbedPeaksToGEOJson(data.map((p) => p.peak));

    geoJson.features.forEach((peak) => {
        bounds.extend((peak.geometry as any).coordinates);
    });

    map?.fitBounds(bounds, {
        padding: 50,
    });

    map?.addSource("peaks", {
        type: "geojson",
        data: geoJson,
    });
    map?.addSource("activities", {
        type: "geojson",
        data: {
            type: "FeatureCollection",
            features: data
                .filter((p) => p.activity !== undefined)
                .map(({ activity }) => ({
                    id: activity!.id,
                    type: "Feature",
                    geometry: {
                        type: "LineString",
                        coordinates: (
                            activity!.coords as [number, number][]
                        ).map((c) => [c[1], c[0]]),
                    },
                    properties: {
                        ...activity,
                    },
                })),
        },
    });

    map?.addLayer({
        id: "peaks",
        type: "symbol",
        source: "peaks",
        layout: {
            "icon-image": [
                "image",
                [
                    "case",
                    [
                        "any",
                        ["==", ["get", "isSummitted"], 1],
                        ["==", ["get", "isSummitted"], true],
                    ],
                    "marker-primary",
                    [
                        "any",
                        ["==", ["get", "isFavorited"], 1],
                        ["==", ["get", "isFavorited"], true],
                    ],
                    "marker-tertiary",
                    "marker-secondary",
                ],
            ],
            "icon-size": 0.2,
            "icon-allow-overlap": true,
            "icon-anchor": "bottom",
        },
    });

    map?.addLayer({
        id: "activities",
        type: "line",
        source: "activities",
        layout: {
            "line-join": "round",
            "line-cap": "round",
        },
        paint: {
            "line-color": [
                "case",
                ["boolean", ["feature-state", "hover"], false],
                theme.palette.tertiary.base,
                theme.palette.primary.containerDim,
            ],
            "line-width": 3,
        },
    });

    map?.on("click", "peaks", (e) => {
        e.originalEvent.preventDefault();
        e.originalEvent.stopPropagation();

        const feature = e.features?.[0];

        if (feature?.geometry.type === "Point" && map) {
            const coordinates = feature.geometry.coordinates.slice();

            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            const peak = feature.properties as UnclimbedPeak;

            const popup = peak.isFavorited
                ? FavoritePopup({
                      peak,
                      units,
                      theme,
                      onUnfavoriteClick: onFavoriteClick,
                  })
                : UnclimbedPopup({
                      peak,
                      units,
                      theme,
                      color: peak.isSummitted ? "primary" : "secondary",
                      onFavoriteClick: onFavoriteClick,
                  });

            new mapboxgl.Popup({ offset: 25 })
                .setLngLat(coordinates as [number, number])
                .setDOMContent(popup)
                .addTo(map);
        }
    });

    map?.on("mousemove", "activities", (e) => {
        if ((e.features ?? []).length > 0) {
            if (hoveredPolygonId !== null) {
                map?.setFeatureState(
                    { source: "activities", id: hoveredPolygonId },
                    { hover: false }
                );
            }
            hoveredPolygonId = (e.features?.[0].id as number) ?? null;
            map?.setFeatureState(
                { source: "activities", id: hoveredPolygonId },
                { hover: true }
            );
        }
    });

    map?.on("mouseleave", "activities", () => {
        if (hoveredPolygonId !== null) {
            map?.setFeatureState(
                { source: "activities", id: hoveredPolygonId },
                { hover: false }
            );
        }
        hoveredPolygonId = null;
    });
};

export default addChallengeDetailMarkers;