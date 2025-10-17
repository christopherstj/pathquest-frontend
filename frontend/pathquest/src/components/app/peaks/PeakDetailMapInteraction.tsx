"use client";
import { useMapStore } from "@/providers/MapProvider";
import Peak from "@/typeDefs/Peak";
import React from "react";

type Props = {
    peak?: Peak;
};

const PeakDetailMapInteraction = ({ peak }: Props) => {
    const map = useMapStore((state) => state.map);

    const zoomMap = () => {
        if (!map || !peak) return;
        if (peak.Lat && peak.Long) {
            map.flyTo({ center: [peak.Long, peak.Lat], zoom: 13 });
        }
    };

    const setDataSource = () => {
        if (!map) return;
    };

    React.useEffect(() => {
        if (!map) return;
        zoomMap();
    }, [map]);

    return <div />;
};

export default PeakDetailMapInteraction;
