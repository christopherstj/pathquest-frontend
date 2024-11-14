import FavoritePopup from "@/components/dashboard/FavoritePopup";
import UnclimbedPeak from "@/typeDefs/UnclimbedPeak";
import { GeoJSONFeature, GeoJSONSource } from "mapbox-gl";

const setChallengeDetailFavorite = (
    map: mapboxgl.Map | null,
    peakId: string,
    newValue: boolean
) => {
    if (!map) return;

    const data = map.querySourceFeatures("peaks", {
        sourceLayer: "peaks",
    });

    const newData = data
        .filter(
            (value, index, self) =>
                self.findIndex(
                    (t) => t.properties?.Id === value.properties?.Id
                ) === index
        )
        .map((p): GeoJSONFeature => {
            if (p.properties?.Id === peakId) {
                return {
                    ...p,
                    properties: {
                        ...p.properties,
                        isFavorited: +newValue,
                    },
                    geometry: {
                        type: "Point",
                        coordinates: [p.properties.Long, p.properties.Lat],
                    },
                };
            }
            return p;
        });

    const source = map.getSource("peaks") as GeoJSONSource;
    source.setData({
        type: "FeatureCollection",
        features: newData,
    });
};

export default setChallengeDetailFavorite;
