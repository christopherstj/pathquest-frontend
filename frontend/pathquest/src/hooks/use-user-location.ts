import { useState, useEffect, useCallback } from "react";

export interface UserLocation {
    lat: number;
    lng: number;
    source: "browser" | "profile" | "default";
}

interface UseUserLocationOptions {
    /** Fallback coordinates from user profile */
    fallbackCoords?: [number, number] | null;
    /** Whether to request browser geolocation on mount */
    requestOnMount?: boolean;
}

interface UseUserLocationReturn {
    location: UserLocation | null;
    isLoading: boolean;
    error: string | null;
    requestLocation: () => Promise<void>;
}

// Default location (center of contiguous US)
const DEFAULT_LOCATION: UserLocation = {
    lat: 39.8283,
    lng: -98.5795,
    source: "default",
};

/**
 * Hook for getting user location.
 * Priority:
 * 1. Browser geolocation (if available and permitted)
 * 2. User profile location_coords (if provided)
 * 3. Default fallback (center of US)
 */
const useUserLocation = (options: UseUserLocationOptions = {}): UseUserLocationReturn => {
    const { fallbackCoords, requestOnMount = false } = options;
    const [location, setLocation] = useState<UserLocation | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Get location from profile coords or default
    const getProfileOrDefault = useCallback((): UserLocation => {
        if (fallbackCoords && fallbackCoords.length === 2) {
            return {
                lat: fallbackCoords[1], // [lng, lat] -> lat
                lng: fallbackCoords[0], // [lng, lat] -> lng
                source: "profile",
            };
        }
        return DEFAULT_LOCATION;
    }, [fallbackCoords]);

    // Request browser geolocation
    const requestLocation = useCallback(async () => {
        if (!navigator.geolocation) {
            setLocation(getProfileOrDefault());
            setError("Geolocation not supported");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: false,
                    timeout: 5000,
                    maximumAge: 300000, // Cache for 5 minutes
                });
            });

            setLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                source: "browser",
            });
        } catch (err) {
            const errorMessage = err instanceof GeolocationPositionError
                ? err.code === 1
                    ? "Location permission denied"
                    : err.code === 2
                    ? "Location unavailable"
                    : "Location request timed out"
                : "Failed to get location";
            
            setError(errorMessage);
            setLocation(getProfileOrDefault());
        } finally {
            setIsLoading(false);
        }
    }, [getProfileOrDefault]);

    // Initialize with profile/default location
    useEffect(() => {
        if (!location) {
            setLocation(getProfileOrDefault());
        }
    }, [location, getProfileOrDefault]);

    // Request browser location on mount if enabled
    useEffect(() => {
        if (requestOnMount && !location) {
            requestLocation();
        }
    }, [requestOnMount, location, requestLocation]);

    return {
        location,
        isLoading,
        error,
        requestLocation,
    };
};

export default useUserLocation;

