import Peak from "@/typeDefs/Peak";

/**
 * Peak-like type that includes optional summit status fields from various sources
 * - is_summited: used by user challenge peaks (boolean)
 * - summit_count: used by searchUserPeaks (UserPeakWithSummitCount)
 */
type PeakLike = Peak & { 
    is_summited?: boolean;
    summit_count?: number;
};

/**
 * Normalizes summit status to a numeric value for consistent map styling.
 * Priority:
 * 1. If peak.summits exists (number) → use it
 * 2. Else if peak.summit_count exists (number) → use it (from UserPeakWithSummitCount)
 * 3. Else if peak.ascents exists (array) → use ascents.length
 * 4. Else if peak.is_summited exists (boolean) → use 1/0
 * 5. Else → 0 (unknown/unsummited)
 */
const getSummitsForMap = (peak: PeakLike): number => {
    if (typeof peak.summits === "number") return peak.summits;
    if (typeof peak.summit_count === "number") return peak.summit_count;
    if (Array.isArray(peak.ascents)) return peak.ascents.length;
    if (typeof peak.is_summited === "boolean") return peak.is_summited ? 1 : 0;
    return 0;
};

const convertPeaksToGeoJSON = (peaks: PeakLike[]): GeoJSON.FeatureCollection => {
    return {
        type: "FeatureCollection",
        features: peaks.map((peak) => ({
            type: "Feature" as const,
            // Feature ID is required for Mapbox setFeatureState to work
            id: peak.id,
            geometry: {
                type: "Point" as const,
                coordinates: peak.location_coords || [0, 0],
            },
            properties: {
                ...peak,
                // Canonical field for map layer styling (blue if > 0, green otherwise)
                summits: getSummitsForMap(peak),
            },
        })),
    };
};

export default convertPeaksToGeoJSON;
