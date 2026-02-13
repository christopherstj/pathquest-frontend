import searchTrailheads from "@/actions/trails/searchTrailheads";

const EMPTY_FC = { type: "FeatureCollection" as const, features: [] };

const MIN_ZOOM_TRAILHEADS = 11;

const getTrailData = async (map: mapboxgl.Map | null) => {
    if (!map) return;

    const bounds = map.getBounds();
    if (!bounds) return;

    const zoom = map.getZoom();

    if (zoom >= MIN_ZOOM_TRAILHEADS) {
        const nw = bounds.getNorthWest();
        const se = bounds.getSouthEast();

        try {
            const data = await searchTrailheads(
                nw.lat.toString(),
                nw.lng.toString(),
                se.lat.toString(),
                se.lng.toString()
            );
            const source = map.getSource("trailheads") as mapboxgl.GeoJSONSource | undefined;
            if (source) source.setData(data as any);
        } catch (err) {
            console.error("[getTrailData] trailheads:", err);
        }
    } else {
        const source = map.getSource("trailheads") as mapboxgl.GeoJSONSource | undefined;
        if (source) source.setData(EMPTY_FC);
    }
};

export default getTrailData;
