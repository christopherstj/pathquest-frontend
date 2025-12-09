import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

type MapURLState = {
    center?: { lng: number; lat: number };
    zoom?: number;
    is3D?: boolean;
    isSatellite?: boolean;
    pitch?: number;
    bearing?: number;
};

// Debounce timer reference
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
const DEBOUNCE_MS = 300;

const updateMapURL = (
    state: MapURLState,
    router: AppRouterInstance,
    immediate: boolean = false
) => {
    const doUpdate = () => {
        // Read current params from window.location to avoid stale closure
        const params = new URLSearchParams(window.location.search);

        // Remove old bounds params if present (migrating to center/zoom)
        params.delete("sw");
        params.delete("ne");

        // Update center coordinates if provided
        if (state.center) {
            params.set("lat", state.center.lat.toFixed(5));
            params.set("lng", state.center.lng.toFixed(5));
        }

        // Update zoom if provided
        if (state.zoom !== undefined) {
            params.set("z", state.zoom.toFixed(2));
        }

        // Update map state if provided
        if (state.is3D !== undefined) {
            params.set("3d", String(state.is3D));
        }
        if (state.isSatellite !== undefined) {
            params.set("satellite", String(state.isSatellite));
        }
        if (state.pitch !== undefined) {
            params.set("pitch", state.pitch.toFixed(1));
        }
        if (state.bearing !== undefined) {
            params.set("bearing", state.bearing.toFixed(1));
        }

        // Use replace for soft navigation (doesn't clog history)
        router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
    };

    // Clear any pending debounce
    if (debounceTimer) {
        clearTimeout(debounceTimer);
        debounceTimer = null;
    }

    if (immediate) {
        doUpdate();
    } else {
        debounceTimer = setTimeout(doUpdate, DEBOUNCE_MS);
    }
};

export default updateMapURL;
export type { MapURLState };
