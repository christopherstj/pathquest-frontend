import { useRouter } from "next/navigation";

const updateURLWithBounds = (
    bounds: mapboxgl.LngLatBounds,
    router: ReturnType<typeof useRouter>
) => {
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();

    // Read current params from window.location to avoid stale closure
    const params = new URLSearchParams(window.location.search);
    params.set("sw", `${sw.lng},${sw.lat}`);
    params.set("ne", `${ne.lng},${ne.lat}`);
    router.replace(`?${params.toString()}`, { scroll: false });
};

export default updateURLWithBounds;
