import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import getMapStateFromURL from "@/helpers/getMapStateFromURL";

export type LocationSource = "url" | "browser" | "ip" | "profile" | "default";

export interface InitialMapLocation {
    center: [number, number]; // [lng, lat]
    zoom: number;
    source: LocationSource;
    isLoading: boolean;
}

// Default: Boulder, CO
const DEFAULT_CENTER: [number, number] = [-105.2705, 40.015];
const DEFAULT_ZOOM = 11;

/**
 * Hook for resolving initial map location with fallback chain.
 * 
 * Priority:
 * 1. URL params (respect shared links)
 * 2. Browser geolocation (with 5s timeout)
 * 3. IP geolocation via Vercel (via /api/geolocation)
 * 4. User profile location_coords
 * 5. Default: Boulder, CO
 * 
 * @param userLocationCoords - User's stored location from profile [lng, lat]
 * @returns { center, zoom, source, isLoading }
 */
export function useInitialMapLocation(
    userLocationCoords?: [number, number] | null
): InitialMapLocation {
    const searchParams = useSearchParams();
    const [location, setLocation] = useState<InitialMapLocation>({
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        source: "default",
        isLoading: true,
    });

    const resolveLocation = useCallback(async () => {
        // 1. Check URL params first (respect shared links)
        const mapState = getMapStateFromURL(searchParams);
        if (mapState.center && mapState.zoom) {
            setLocation({
                center: mapState.center,
                zoom: mapState.zoom,
                source: "url",
                isLoading: false,
            });
            return;
        }

        // 2. Try browser geolocation
        if (typeof navigator !== "undefined" && navigator.geolocation) {
            try {
                const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: false,
                        timeout: 5000,
                        maximumAge: 300000, // Cache for 5 minutes
                    });
                });
                setLocation({
                    center: [position.coords.longitude, position.coords.latitude],
                    zoom: DEFAULT_ZOOM,
                    source: "browser",
                    isLoading: false,
                });
                return;
            } catch {
                // Geolocation denied or failed, continue to next fallback
            }
        }

        // 3. Try IP geolocation via Vercel
        try {
            const response = await fetch("/api/geolocation");
            if (response.ok) {
                const data = await response.json();
                if (data?.lat && data?.lng) {
                    setLocation({
                        center: [data.lng, data.lat],
                        zoom: DEFAULT_ZOOM,
                        source: "ip",
                        isLoading: false,
                    });
                    return;
                }
            }
        } catch {
            // IP geolocation failed, continue to next fallback
        }

        // 4. Use user profile location
        if (userLocationCoords && userLocationCoords.length === 2) {
            setLocation({
                center: userLocationCoords, // Already [lng, lat]
                zoom: DEFAULT_ZOOM,
                source: "profile",
                isLoading: false,
            });
            return;
        }

        // 5. Default to Boulder, CO
        setLocation({
            center: DEFAULT_CENTER,
            zoom: DEFAULT_ZOOM,
            source: "default",
            isLoading: false,
        });
    }, [searchParams, userLocationCoords]);

    useEffect(() => {
        resolveLocation();
    }, [resolveLocation]);

    return location;
}

export default useInitialMapLocation;

