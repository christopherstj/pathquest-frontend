"use client";
import { useMapStore } from "@/providers/MapProvider";
import React, { useCallback } from "react";
import PeaksSearchInput from "./PeaksSearchInput";
import Peak from "@/typeDefs/Peak";
import PeaksList from "./PeaksList";
import dynamic from "next/dynamic";
import mapboxgl from "mapbox-gl";
import getNewData from "@/helpers/getNewData";
import BoundsToggle from "./BoundsToggle";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
    const disablePeaksSearch = useMapStore((state) => state.disablePeaksSearch);

    const [search, setSearch] = React.useState("");
    const [limitResultsToBbox, setLimitResultsToBbox] = React.useState(true);
    const [firstLoad, setFirstLoad] = React.useState(true);
    const [timeout, setTimeoutState] = React.useState<NodeJS.Timeout | null>(
        null
    );
    const [peaks, setPeaks] = React.useState<Peak[]>([]);
    const [mapboxSearch, setMapboxSearch] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(false);
    const [status, setStatus] = React.useState<
        "idle" | "loading" | "zoomedOut" | "empty" | "ready"
    >("idle");

    const handleFetch = useCallback(async () => {
        if (!map) return;
        setIsLoading(true);
        setStatus("loading");

        const result = await getNewData(
            search,
            limitResultsToBbox,
            setPeaks,
            map,
            undefined,
            disablePeaksSearch
        );

        if (result.status === "disabled") {
            setStatus("idle");
            setIsLoading(false);
            return;
        }

        if (result.status === "zoomedOut") {
            setStatus("zoomedOut");
            setIsLoading(false);
            return;
        }

        if (result.status === "ok" && result.count === 0) {
            setStatus("empty");
        } else if (result.status === "ok") {
            setStatus("ready");
        }
        setIsLoading(false);
    }, [map, limitResultsToBbox, search, disablePeaksSearch]);

    const onSearchChange = (value: string) => {
        if (timeout) clearTimeout(timeout);
        setSearch(value);

        const newTimeout = setTimeout(() => {
            handleFetch();
        }, 500);

        setTimeoutState(newTimeout);
    };

    React.useEffect(() => {
        if (map) {
            if (firstLoad) {
                handleFetch();
                setFirstLoad(false);
            }
            map?.on("moveend", handleFetch);
        }
        return () => {
            if (map) {
                map?.off("moveend", handleFetch);
            }
        };
    }, [map, handleFetch, firstLoad]);

    React.useEffect(() => {
        if (!firstLoad) handleFetch();
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
                <div className="flex flex-col gap-2 rounded-lg bg-primary/80 p-2 shadow-lg backdrop-blur">
                    <PeaksSearchInput value={search} onChange={onSearchChange} />
                    <div className="flex flex-wrap gap-2 items-center">
                        <BoundsToggle
                            value={limitResultsToBbox}
                            onChange={setLimitResultsToBbox}
                        />
                        <Badge variant="outline" className="text-xs">
                            Live results update as you move the map
                        </Badge>
                    </div>
                    {status === "zoomedOut" && (
                        <p className="text-xs text-primary-foreground-dim">
                            Zoom in closer to load peaks in this area.
                        </p>
                    )}
                </div>
                {isLoading && (
                    <div className="rounded-lg bg-primary-dim p-3 text-primary-foreground text-sm shadow-md">
                        Loading peaks…
                    </div>
                )}
                {!isLoading && status === "empty" && (
                    <div className="rounded-lg bg-primary-dim p-3 text-primary-foreground text-sm shadow-md">
                        No peaks found here. Try widening the map bounds or
                        clearing filters.
                    </div>
                )}
                <div
                    className={cn(
                        "w-full flex-1 min-h-0",
                        status === "zoomedOut" ? "opacity-60" : "opacity-100"
                    )}
                >
                    <PeaksList peaks={peaks} />
                </div>
            </div>
        </>
    );
};

export default PeakSearch;
