"use client";
import initiateMap from "@/lib/map/initiateMap";
import React from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import { useMapStore } from "@/providers/MapProvider";
import addMapConfiguration from "@/lib/map/addMapConfiguration";

type Props = {};

const Map = (props: Props) => {
    const setMap = useMapStore((state) => state.setMap);
    const mapRef = React.useRef<mapboxgl.Map | null>(null);
    const mapContainerRef = React.useRef<any>(null);

    React.useEffect(() => {
        initiateMap(mapContainerRef, mapRef, [-119.698189, 34.42083], 8, () =>
            addMapConfiguration(mapRef.current)
        );
        setMap(mapRef.current);
        return () => {
            mapRef.current?.remove();
        };
    }, []);

    return (
        <div
            className="h-full w-full"
            id="map-container"
            ref={mapContainerRef}
        />
    );
};

export default Map;
