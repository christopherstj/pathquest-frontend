"use client";
import getUnclimbedPeaksWithBounds from "@/actions/peaks/getUnclimbedPeaksWithBounds";
import searchPeaks from "@/actions/peaks/searchPeaks";
import convertUnclimbedPeaksToGEOJson from "@/helpers/convertUnclimbedPeaksToGEOJson";
import { useMapStore } from "@/providers/MapProvider";
import React, { useCallback } from "react";
import PeaksSearchInput from "./PeaksSearchInput";
import BoundsToggle from "./BoundsToggle";
import Peak from "@/typeDefs/Peak";
import PeaksList from "./PeaksList";
import { SearchBox } from "@mapbox/search-js-react";
import mapboxgl from "mapbox-gl";

const PeakSearch = () => {
    const map = useMapStore((state) => state.map);

    const [search, setSearch] = React.useState("");
    const [limitResultsToBbox, setLimitResultsToBbox] = React.useState(true);
    const [firstLoad, setFirstLoad] = React.useState(true);
    const [timeout, setTimeoutState] = React.useState<NodeJS.Timeout | null>(
        null
    );
    const [peaks, setPeaks] = React.useState<Peak[]>([]);
    const [mapboxSearch, setMapboxSearch] = React.useState("");

    const getNewData = useCallback(async () => {
        if (!map) return;

        const bounds = map.getBounds();

        if (!bounds) return;

        const nw = bounds.getNorthWest();
        const se = bounds.getSouthEast();

        const unclimbedPeaks = await searchPeaks(
            limitResultsToBbox ? nw.lat.toString() : undefined,
            limitResultsToBbox ? nw.lng.toString() : undefined,
            limitResultsToBbox ? se.lat.toString() : undefined,
            limitResultsToBbox ? se.lng.toString() : undefined,
            search,
            undefined,
            undefined,
            "true"
        );

        setPeaks(unclimbedPeaks);

        map.getSource("unclimbedPeaks") &&
            (map.getSource("unclimbedPeaks") as mapboxgl.GeoJSONSource).setData(
                convertUnclimbedPeaksToGEOJson(unclimbedPeaks)
            );
    }, [map, search, limitResultsToBbox, setPeaks]);

    const onSearchChange = (value: string) => {
        if (timeout) clearTimeout(timeout);
        setSearch(value);

        const newTimeout = setTimeout(() => {
            getNewData();
        }, 500);

        setTimeoutState(newTimeout);
    };

    React.useEffect(() => {
        if (map) {
            if (firstLoad) {
                getNewData();
                setFirstLoad(false);
            }
            map?.on("moveend", getNewData);
        }
        return () => {
            if (map) {
                map?.off("moveend", getNewData);
            }
        };
    }, [map, getNewData]);

    React.useEffect(() => {
        if (!firstLoad) getNewData();
    }, [limitResultsToBbox]);

    return (
        <>
            <div></div> {/* spacer for grid */}
            <div className="pointer-events-auto w-full h-0">
                {!firstLoad && (
                    // @ts-expect-error Bug in the mapbox search library, this works
                    <SearchBox
                        accessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? ""}
                        map={map ?? undefined}
                        mapboxgl={mapboxgl}
                        value={mapboxSearch}
                        onChange={setMapboxSearch}
                    />
                )}
            </div>
            <div className="w-full flex flex-col gap-2 pointer-events-auto">
                <PeaksSearchInput value={search} onChange={onSearchChange} />
                <BoundsToggle
                    value={limitResultsToBbox}
                    onChange={setLimitResultsToBbox}
                />
                <PeaksList peaks={peaks} />
            </div>
        </>
    );
};

export default PeakSearch;
