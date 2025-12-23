"use client";

import { useEffect, useRef, useCallback } from "react";
import { useMapStore } from "@/providers/MapProvider";
import { waitForMapSource, clearMapSource } from "@/lib/map/waitForMapSource";

interface UseMapSourceOptions {
    maxAttempts?: number;
    retryDelay?: number;
}

/**
 * Hook to manage Mapbox GeoJSON source data with retry logic.
 * Handles waiting for source to be available and cleanup on unmount.
 */
export function useMapSource<T>(
    sourceName: string,
    data: T | null | undefined,
    convertToGeoJSON: (data: T) => GeoJSON.FeatureCollection,
    options: UseMapSourceOptions = {}
) {
    const map = useMapStore((state) => state.map);
    const { maxAttempts = 5, retryDelay = 300 } = options;
    const dataRef = useRef(data);
    dataRef.current = data;

    const setSourceData = useCallback(async () => {
        if (!map || !dataRef.current) return;

        const source = await waitForMapSource(map, sourceName, { maxAttempts, retryDelay });
        if (source && dataRef.current) {
            source.setData(convertToGeoJSON(dataRef.current));
        }
    }, [map, sourceName, convertToGeoJSON, maxAttempts, retryDelay]);

    useEffect(() => {
        if (data) {
            setSourceData();
        }

        return () => {
            clearMapSource(map, sourceName);
        };
    }, [map, data, sourceName, setSourceData]);

    return { setSourceData };
}

/**
 * Hook to clear a map source.
 */
export function useClearMapSource(sourceName: string) {
    const map = useMapStore((state) => state.map);

    const clear = useCallback(() => {
        clearMapSource(map, sourceName);
    }, [map, sourceName]);

    return clear;
}


