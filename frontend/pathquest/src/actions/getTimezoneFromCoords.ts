"use server";

import { find } from "geo-tz";

/**
 * Server action to get the timezone for a given set of coordinates
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns The IANA timezone string (e.g., "America/New_York")
 */
const getTimezoneFromCoords = async (lat: number, lng: number): Promise<string> => {
    try {
        const timezones = find(lat, lng);
        if (timezones && timezones.length > 0) {
            return timezones[0];
        }
    } catch (error) {
        console.error("Error getting timezone from coordinates:", error);
    }
    
    // Fallback to a reasonable default
    return "America/New_York";
};

export default getTimezoneFromCoords;

