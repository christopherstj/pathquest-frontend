import mapboxgl from "mapbox-gl";

const DEFAULT_MAX_ATTEMPTS = 5;
const DEFAULT_RETRY_DELAY = 300;

interface WaitForSourceOptions {
    maxAttempts?: number;
    retryDelay?: number;
}

/**
 * Wait for a single Mapbox GeoJSON source to be available.
 * Returns the source if found within max attempts, or undefined.
 */
export async function waitForMapSource(
    map: mapboxgl.Map,
    sourceName: string,
    options: WaitForSourceOptions = {}
): Promise<mapboxgl.GeoJSONSource | undefined> {
    const { maxAttempts = DEFAULT_MAX_ATTEMPTS, retryDelay = DEFAULT_RETRY_DELAY } = options;
    
    let source = map.getSource(sourceName) as mapboxgl.GeoJSONSource | undefined;
    let attempts = 0;

    while (!source && attempts < maxAttempts) {
        attempts++;
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        source = map.getSource(sourceName) as mapboxgl.GeoJSONSource | undefined;
    }

    return source;
}

/**
 * Wait for multiple Mapbox GeoJSON sources to be available.
 * Returns an object mapping source names to sources.
 * If any source is not found, its value will be undefined.
 */
export async function waitForMapSources(
    map: mapboxgl.Map,
    sourceNames: string[],
    options: WaitForSourceOptions = {}
): Promise<Record<string, mapboxgl.GeoJSONSource | undefined>> {
    const { maxAttempts = DEFAULT_MAX_ATTEMPTS, retryDelay = DEFAULT_RETRY_DELAY } = options;
    
    const result: Record<string, mapboxgl.GeoJSONSource | undefined> = {};
    let attempts = 0;

    // Check if all sources are available
    const checkSources = () => {
        let allFound = true;
        for (const name of sourceNames) {
            result[name] = map.getSource(name) as mapboxgl.GeoJSONSource | undefined;
            if (!result[name]) allFound = false;
        }
        return allFound;
    };

    // Initial check
    if (checkSources()) return result;

    // Retry loop
    while (attempts < maxAttempts) {
        attempts++;
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
        if (checkSources()) break;
    }

    return result;
}

/**
 * Clear a map source by setting empty FeatureCollection.
 * Handles errors gracefully (map may be in invalid state).
 */
export function clearMapSource(map: mapboxgl.Map | null, sourceName: string): void {
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
}

/**
 * Clear multiple map sources.
 */
export function clearMapSources(map: mapboxgl.Map | null, sourceNames: string[]): void {
    for (const name of sourceNames) {
        clearMapSource(map, name);
    }
}

