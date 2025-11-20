"use client";
import { useMapStore } from "@/providers/MapProvider";
import React, { useCallback } from "react";
import PeaksSearchInput from "./PeaksSearchInput";
import Peak from "@/typeDefs/Peak";
import PeaksList from "./PeaksList";
import dynamic from "next/dynamic";
import mapboxgl from "mapbox-gl";
import getNewData from "@/helpers/getNewData";

const SearchBox = dynamic(
    // @ts-expect-error - Dynamic import of SearchBox has type issues with ForwardRef
    () =>
        import("@mapbox/search-js-react").then((mod) => ({
            default: mod.SearchBox,
        })),
    { ssr: false }
);

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

    const searchCallback = useCallback(
        () => getNewData(search, limitResultsToBbox, setPeaks, map),
        [map, search, limitResultsToBbox, setPeaks]
    );

    const onSearchChange = (value: string) => {
        if (timeout) clearTimeout(timeout);
        setSearch(value);

        const newTimeout = setTimeout(() => {
            searchCallback();
        }, 500);

        setTimeoutState(newTimeout);
    };

    React.useEffect(() => {
        if (map) {
            if (firstLoad) {
                searchCallback();
                setFirstLoad(false);
            }
            map?.on("moveend", searchCallback);
        }
        return () => {
            if (map) {
                map?.off("moveend", searchCallback);
            }
        };
    }, [map, searchCallback]);

    React.useEffect(() => {
        if (!firstLoad) searchCallback();
    }, [limitResultsToBbox]);

    return (
        <>
            <div></div> {/* spacer for grid */}
            <div className="pointer-events-auto w-full h-0">
                {!firstLoad && (
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
                {/* <BoundsToggle
                    value={limitResultsToBbox}
                    onChange={setLimitResultsToBbox}
                /> */}
                <PeaksList peaks={peaks} />
            </div>
        </>
    );
};

export default PeakSearch;
