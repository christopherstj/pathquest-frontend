import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

type MapState = {
    is3D?: boolean;
    isSatellite?: boolean;
    pitch?: number;
    bearing?: number;
};

const updateMapStateInURL = (
    state: MapState,
    router: AppRouterInstance
) => {
    // Read current params from window.location to avoid stale closure
    const params = new URLSearchParams(window.location.search);

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

export default updateMapStateInURL;
