import FavoritedPeak from "@/typeDefs/FavoritedPeak";

const convertFavoritePeaksToGEOJson = (favoritePeaks: FavoritedPeak[]) => {
    return {
        type: "FeatureCollection",
        features: favoritePeaks.map((peak) => ({
            type: "Feature",
            geometry: {
                type: "Point",
                coordinates: [peak.Long, peak.Lat],
            },
            properties: {
                ...peak,
            },
        })),
    };
};

export default convertFavoritePeaksToGEOJson;
