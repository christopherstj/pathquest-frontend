import mapboxgl from "mapbox-gl";
import primaryMarker from "@/public/images/marker-primary.png";
import secondaryMarker from "@/public/images/marker-secondary.png";
import tertiaryMarker from "@/public/images/marker-tertiary.png";
import primaryChallenge from "@/public/images/challenge-primary.png";
import secondaryChallenge from "@/public/images/challenge-secondary.png";
import tertiaryChallenge from "@/public/images/challenge-tertiary.png";
import colors from "../theme/colors";

const loadMapDefaults = (
    map: mapboxgl.Map,
    isFirstLoad: boolean,
    imagesToLoad: "markers" | "challenges" | "all" = "markers"
) => {
    if (isFirstLoad)
        map.addControl(new mapboxgl.NavigationControl(), "bottom-left");

    map.addLayer({
        id: "countours",
        type: "line",
        source: {
            type: "vector",
            url: "mapbox://mapbox.mapbox-terrain-v2",
        },
        "source-layer": "contour",
        layout: {
            visibility: "visible",
            "line-join": "round",
            "line-cap": "round",
        },
        paint: {
            "line-color": colors.primaryDim,
            "line-opacity": 0.4,
            "line-width": 1,
        },
    });

    if (imagesToLoad === "markers" || imagesToLoad === "all") {
        map.loadImage(primaryMarker.src, (error, image) => {
            if (error) throw error;
            if (image) map.addImage("marker-primary", image);
        });
        map.loadImage(secondaryMarker.src, (error, image) => {
            if (error) throw error;
            if (image) map.addImage("marker-secondary", image);
        });
        map.loadImage(tertiaryMarker.src, (error, image) => {
            if (error) throw error;
            if (image) map.addImage("marker-tertiary", image);
        });
    }

    if (imagesToLoad === "challenges" || imagesToLoad === "all") {
        map.loadImage(primaryChallenge.src, (error, image) => {
            if (error) throw error;
            if (image) map.addImage("challenge-primary", image);
        });
        map.loadImage(secondaryChallenge.src, (error, image) => {
            if (error) throw error;
            if (image) map.addImage("challenge-secondary", image);
        });
        map.loadImage(tertiaryChallenge.src, (error, image) => {
            if (error) throw error;
            if (image) map.addImage("challenge-tertiary", image);
        });
    }
};

export default loadMapDefaults;
