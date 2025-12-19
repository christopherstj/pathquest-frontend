import { useState, useEffect, useCallback, useRef } from "react";
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
 * 2. Browser geolocation (with 10s timeout)
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
    
    // Prevent running resolution multiple times (React Strict Mode, remounts, etc.)
    const hasResolved = useRef(false);
    const isResolving = useRef(false);

    const resolveLocation = useCallback(async () => {
        // Skip if already resolved or currently resolving
        if (hasResolved.current || isResolving.current) {
            console.log("[useInitialMapLocation] Skipping - already resolved or resolving");
            return;
        }
        
        isResolving.current = true;
        console.log("[useInitialMapLocation] Starting location resolution...");
        
        // 1. Check URL params first (respect shared links)
        const mapState = getMapStateFromURL(searchParams);
        if (mapState.center && mapState.zoom) {
            console.log("[useInitialMapLocation] Using URL params");
            hasResolved.current = true;
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
                console.log("[useInitialMapLocation] Requesting browser geolocation...");
                const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: false,
                        timeout: 10000, // Increased to 10s to give user time to respond to prompt
                        maximumAge: 300000, // Cache for 5 minutes
                    });
                });
                console.log("[useInitialMapLocation] Got browser geolocation:", position.coords.latitude, position.coords.longitude);
                hasResolved.current = true;
                setLocation({
                    center: [position.coords.longitude, position.coords.latitude],
                    zoom: DEFAULT_ZOOM,
                    source: "browser",
                    isLoading: false,
                });
                return;
            } catch (err) {
                // Geolocation denied or failed, continue to next fallback
                console.log("[useInitialMapLocation] Browser geolocation failed:", err);
            }
        }

        // 3. Try IP geolocation via Vercel
        try {
            console.log("[useInitialMapLocation] Trying IP geolocation...");
            const response = await fetch("/api/geolocation");
            if (response.ok) {
                const data = await response.json();
                console.log("[useInitialMapLocation] IP geolocation response:", data);
                if (data?.lat && data?.lng) {
                    hasResolved.current = true;
                    setLocation({
                        center: [data.lng, data.lat],
                        zoom: DEFAULT_ZOOM,
                        source: "ip",
                        isLoading: false,
                    });
                    return;
                }
            }
        } catch (err) {
            // IP geolocation failed, continue to next fallback
            console.log("[useInitialMapLocation] IP geolocation failed:", err);
        }

        // 4. Use user profile location
        if (userLocationCoords && userLocationCoords.length === 2) {
            console.log("[useInitialMapLocation] Using profile location");
            hasResolved.current = true;
            setLocation({
                center: userLocationCoords, // Already [lng, lat]
                zoom: DEFAULT_ZOOM,
                source: "profile",
                isLoading: false,
            });
            return;
        }

        // 5. Default to Boulder, CO
        console.log("[useInitialMapLocation] Falling back to Boulder default");
        hasResolved.current = true;
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

