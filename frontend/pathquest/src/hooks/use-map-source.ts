"use client";

import { useEffect, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import { useMapStore } from "@/providers/MapProvider";

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

        let source = map.getSource(sourceName) as mapboxgl.GeoJSONSource | undefined;
        let attempts = 0;

        // Retry logic to wait for source to be available
        while (!source && attempts < maxAttempts) {
            attempts++;
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
            source = map.getSource(sourceName) as mapboxgl.GeoJSONSource | undefined;
        }

        if (source && dataRef.current) {
            source.setData(convertToGeoJSON(dataRef.current));
        }
    }, [map, sourceName, convertToGeoJSON, maxAttempts, retryDelay]);

    useEffect(() => {
        if (data) {
            setSourceData();
        }

        // Cleanup: clear source data when unmounting or data changes
        return () => {
            if (!map) return;

            try {
                const source = map.getSource(sourceName) as mapboxgl.GeoJSONSource | undefined;
                if (source) {
                    source.setData({
                        type: "FeatureCollection",
                        features: [],
                    });
                }
            } catch (error) {
                // Map may be in invalid state (being destroyed, not loaded, etc.)
                // Silently ignore cleanup errors as they're non-critical
                console.debug(`Failed to cleanup ${sourceName} map source:`, error);
            }
        };
    }, [map, data, sourceName, setSourceData]);

    return { setSourceData };
}

/**
 * Hook to clear a map source.
 */
export function useClearMapSource(sourceName: string) {
    const map = useMapStore((state) => state.map);

    const clearSource = useCallback(() => {
        if (!map) return;

        try {
            const source = map.getSource(sourceName) as mapboxgl.GeoJSONSource | undefined;
            if (source) {
                source.setData({
                    type: "FeatureCollection",
                    features: [],
                });
            }
        } catch (error) {
            console.debug(`Failed to clear ${sourceName} map source:`, error);
        }
    }, [map, sourceName]);

    return clearSource;
}


