import SummitWithPeak from "@/typeDefs/SummitWithPeak";
import Peak from "@/typeDefs/Peak";
import Summit from "@/typeDefs/Summit";

/**
 * Converts an array of SummitWithPeak objects to Peak objects with nested ascents.
 * This is useful for components that expect Peak[] with ascents (like map effects and elevation profile).
 */
export function convertSummitsToPeaks(summits: SummitWithPeak[]): Peak[] {
    // Group summits by peak ID
    const peakMap = new Map<string, Peak>();

    for (const summit of summits) {
        const existingPeak = peakMap.get(summit.peak.id);
        
        const ascent: Summit = {
            id: summit.id,
            timestamp: summit.timestamp,
            timezone: summit.timezone,
            activity_id: "", // Will be set by caller if needed
            notes: summit.notes,
            temperature: summit.temperature,
            precipitation: summit.precipitation,
            weather_code: summit.weather_code,
            cloud_cover: summit.cloud_cover,
            humidity: summit.humidity,
            wind_speed: summit.wind_speed,
            wind_direction: summit.wind_direction,
            difficulty: summit.difficulty,
            experience_rating: summit.experience_rating,
        };

        if (existingPeak) {
            // Add this summit to the existing peak's ascents
            existingPeak.ascents = [...(existingPeak.ascents || []), ascent];
        } else {
            // Create new peak entry
            const peak: Peak = {
                id: summit.peak.id,
                name: summit.peak.name,
                elevation: summit.peak.elevation,
                location_coords: summit.peak.location_coords,
                county: summit.peak.county,
                state: summit.peak.state,
                country: summit.peak.country,
                ascents: [ascent],
            };
            peakMap.set(summit.peak.id, peak);
        }
    }

    return Array.from(peakMap.values());
}

