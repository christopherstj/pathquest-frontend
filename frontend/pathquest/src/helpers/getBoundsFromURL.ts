const getBoundsFromURL = (
    searchParams: URLSearchParams
): mapboxgl.LngLatBoundsLike | null => {
    const sw = searchParams.get("sw");
    const ne = searchParams.get("ne");

    if (sw && ne) {
        const [swLng, swLat] = sw.split(",").map(Number);
        const [neLng, neLat] = ne.split(",").map(Number);
        return [
            [swLng, swLat],
            [neLng, neLat],
        ];
    }

    return null;
};
export default getBoundsFromURL;
