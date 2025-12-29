"use server";

import getSessionToken from "@/auth/getSessionToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import { createApiClient, endpoints } from "@pathquest/shared/api";
import type { Peak } from "@pathquest/shared/types";
import getActivityDetails from "@/actions/activities/getActivityDetails";

const backendUrl = getBackendUrl();

export interface PeakWithDistance extends Peak {
    distanceFromRoute?: number; // Distance in meters
}

/**
 * Search for peaks along an activity route.
 * This fetches the activity coordinates, calculates a bounding box,
 * and searches for peaks within that area.
 * 
 * @param activityId - The activity ID to search along
 * @param search - Optional search term to filter peaks by name
 * @returns Array of peaks with optional distance from route
 */
const searchPeaksAlongRoute = async (
    activityId: string,
    search?: string
): Promise<PeakWithDistance[]> => {
    const session = await useAuth();

    if (!session) {
        return [];
    }

    // First, get the activity details to get the coordinates
    const activityData = await getActivityDetails(activityId);
    
    if (!activityData?.activity?.coords) {
        return [];
    }

    const coords = activityData.activity.coords;
    
    if (coords.length === 0) {
        return [];
    }

    // Calculate bounding box from activity coordinates
    let minLng = Infinity, maxLng = -Infinity;
    let minLat = Infinity, maxLat = -Infinity;

    for (const coord of coords) {
        const [lng, lat] = coord;
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
    }

    // Add some padding to the bounding box (about 1km in each direction)
    const padding = 0.01; // ~1km at mid-latitudes
    minLng -= padding;
    maxLng += padding;
    minLat -= padding;
    maxLat += padding;

    // Search for peaks within this bounding box
    // Always generate token for Google IAM authentication (required at infrastructure level)
    const token = await getSessionToken().catch((err) => {
        console.error("[searchPeaksAlongRoute] Failed to get Google ID token:", err);
        return null;
    });

    const client = createApiClient({
        baseUrl: backendUrl,
        getAuthHeaders: async () => {
            const headers: Record<string, string> = {};
            if (token) headers.Authorization = `Bearer ${token}`;
            return headers;
        },
    });

    let peaks: Peak[];
    try {
        peaks = await endpoints.searchPeaks(client, {
            northWestLat: maxLat.toString(),
            northWestLng: minLng.toString(),
            southEastLat: minLat.toString(),
            southEastLng: maxLng.toString(),
            search,
            perPage: "50",
        });
    } catch (err: any) {
        console.error("[searchPeaksAlongRoute]", err?.bodyText ?? err);
        return [];
    }

    // Calculate distance from route for each peak and sort by distance
    const peaksWithDistance: PeakWithDistance[] = peaks.map((peak) => {
        if (!peak.location_coords) return { ...peak };
        
        const peakLng = peak.location_coords[0];
        const peakLat = peak.location_coords[1];
        
        // Find minimum distance to route
        let minDistance = Infinity;
        for (const coord of coords) {
            const distance = haversineDistance(peakLat, peakLng, coord[1], coord[0]);
            if (distance < minDistance) {
                minDistance = distance;
            }
        }
        
        return {
            ...peak,
            distanceFromRoute: minDistance,
        };
    });

    // Sort by distance from route (closest first)
    peaksWithDistance.sort((a, b) => {
        const distA = a.distanceFromRoute ?? Infinity;
        const distB = b.distanceFromRoute ?? Infinity;
        return distA - distB;
    });

    return peaksWithDistance;
};

/**
 * Calculate the haversine distance between two points in meters.
 */
const haversineDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371000; // Earth's radius in meters
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const toRad = (deg: number): number => {
    return deg * (Math.PI / 180);
};

export default searchPeaksAlongRoute;

