import { useRouter } from "next/navigation";
import mapboxgl from "mapbox-gl";

type MapURLState = {
    bounds?: mapboxgl.LngLatBounds;
    is3D?: boolean;
    isSatellite?: boolean;
    pitch?: number;
    bearing?: number;
};

const updateMapURL = (
    state: MapURLState,
    router: ReturnType<typeof useRouter>
) => {
    // Read current params from window.location to avoid stale closure
    const params = new URLSearchParams(window.location.search);

    // Update bounds if provided
    if (state.bounds) {
        const sw = state.bounds.getSouthWest();
        const ne = state.bounds.getNorthEast();
        params.set("sw", `${sw.lng},${sw.lat}`);
        params.set("ne", `${ne.lng},${ne.lat}`);
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

    router.replace(`?${params.toString()}`, { scroll: false });
};

export default updateMapURL;
