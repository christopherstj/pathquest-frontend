import UnclimbedPeak from "@/typeDefs/UnclimbedPeak";
import mapboxgl, { GeoJSONSource, MapMouseEvent } from "mapbox-gl";
import UnclimbedPopup from "../UnclimbedPopup";
import { Theme } from "@mui/material";
import toggleFavoritePeak from "@/actions/peaks/toggleFavoritePeak";
import { PeaksState } from "@/state_old/PeaksContext";
import FavoritePopup from "../FavoritePopup";
import { DashboardState } from "@/state_old/DashboardContext";

const onFavoriteClick = async (
    peakId: string,
    newValue: boolean,
    openPopup: boolean = true,
    map: mapboxgl.Map | null,
    theme: Theme,
    units: "metric" | "imperial",
    setDashboardState: React.Dispatch<React.SetStateAction<DashboardState>>,
    dispatch: React.Dispatch<any>
) => {
    if (newValue) {
        const unclimbedPeaksSource = map?.getSource(
            "unclimbedPeaks"
        ) as GeoJSONSource;
        const unclimbedPeaksData = unclimbedPeaksSource.serialize()
            .data as GeoJSON.FeatureCollection<GeoJSON.Point>;
        const peak = unclimbedPeaksData?.features.find(
            (feature) => feature.properties?.Id === peakId
        ) as GeoJSON.Feature<GeoJSON.Point>;

        if (peak) {
            unclimbedPeaksData.features = unclimbedPeaksData.features.filter(
                (feature) => feature.properties?.Id !== peakId
            );

            unclimbedPeaksSource?.setData(unclimbedPeaksData);

            const favoritePeaksSource = map?.getSource(
                "favoritePeaks"
            ) as GeoJSONSource;

            const favoritePeaksData = favoritePeaksSource?.serialize()
                .data as GeoJSON.FeatureCollection<GeoJSON.Point>;

            favoritePeaksData.features = [peak, ...favoritePeaksData.features];

            favoritePeaksSource?.setData(favoritePeaksData);

            setDashboardState((state) => ({
                ...state,
                favoritePeaks: (state.favoritePeaks ?? []).map((p) => ({
                    ...(p as UnclimbedPeak),
                    isFavorited: p.Id === peakId ? newValue : p.isFavorited,
                })),
            }));

            if (openPopup && map) {
                const coordinates = peak.geometry.coordinates.slice();

                const lngLat = mapboxgl.LngLat.convert(
                    coordinates as [number, number]
                );

                map._popups.forEach((pop) => pop.remove());

                new mapboxgl.Popup({ offset: 25 })
                    .setLngLat(lngLat)
                    .setDOMContent(
                        FavoritePopup({
                            peak: peak.properties as UnclimbedPeak,
                            units,
                            theme,
                            onUnfavoriteClick: (peakId, newValue) => {
                                onFavoriteClick(
                                    peakId,
                                    newValue,
                                    true,
                                    map,
                                    theme,
                                    units,
                                    setDashboardState,
                                    dispatch
                                );
                            },
                        })
                    )
                    .addTo(map);
            }
        }
    } else {
        const favoritePeaksSource = map?.getSource(
            "favoritePeaks"
        ) as GeoJSONSource;
        const favoritePeaksData = favoritePeaksSource.serialize()
            .data as GeoJSON.FeatureCollection<GeoJSON.Point>;
        const peak = favoritePeaksData?.features.find(
            (feature) => feature.properties?.Id === peakId
        ) as GeoJSON.Feature<GeoJSON.Point>;

        if (peak) {
            favoritePeaksData.features = favoritePeaksData.features.filter(
                (feature) => feature.properties?.Id !== peakId
            );

            favoritePeaksSource?.setData(favoritePeaksData);

            const unclimbedPeaksSource = map?.getSource(
                "unclimbedPeaks"
            ) as GeoJSONSource;

            const unclimbedPeaksData = unclimbedPeaksSource?.serialize()
                .data as GeoJSON.FeatureCollection<GeoJSON.Point>;

            unclimbedPeaksData.features = [
                peak,
                ...unclimbedPeaksData.features,
            ];

            unclimbedPeaksSource?.setData(unclimbedPeaksData);

            setDashboardState((state) => ({
                ...state,
                favoritePeaks: (state.favoritePeaks ?? []).map((p) => ({
                    ...(p as UnclimbedPeak),
                    isFavorited: p.Id === peakId ? newValue : p.isFavorited,
                })),
            }));

            if (openPopup && map) {
                const coordinates = peak.geometry.coordinates.slice();

                const lngLat = mapboxgl.LngLat.convert(
                    coordinates as [number, number]
                );

                map._popups.forEach((pop) => pop.remove());

                new mapboxgl.Popup({ offset: 25 })
                    .setLngLat(lngLat)
                    .setDOMContent(
                        UnclimbedPopup({
                            peak: peak.properties as UnclimbedPeak,
                            units,
                            theme,
                            onFavoriteClick: (peakId, newValue) => {
                                onFavoriteClick(
                                    peakId,
                                    newValue,
                                    true,
                                    map,
                                    theme,
                                    units,
                                    setDashboardState,
                                    dispatch
                                );
                            },
                        })
                    )
                    .addTo(map);
            }
        }
    }

    const success = await toggleFavoritePeak(peakId, newValue);

    if (!success) {
        dispatch({
            type: "SET_MESSAGE",
            payload: {
                text: "Failed to update favorite status",
                type: "error",
            },
        });

        const source = newValue ? "favoritePeaks" : "unclimbedPeaks";
        const target = newValue ? "unclimbedPeaks" : "favoritePeaks";

        const sourceData = map?.getSource(source) as GeoJSONSource;

        const data = sourceData.serialize()
            .data as GeoJSON.FeatureCollection<GeoJSON.Point>;

        const targetData = map?.getSource(target) as GeoJSONSource;

        const targetDataFeatures = targetData.serialize()
            .data as GeoJSON.FeatureCollection<GeoJSON.Point>;

        const peak = data.features.find(
            (feature) => feature.properties?.Id === peakId
        );

        if (peak) {
            data.features = data.features.filter(
                (feature) => feature.properties?.Id !== peakId
            );

            sourceData.setData(data);

            targetDataFeatures.features = [
                peak,
                ...targetDataFeatures.features,
            ];

            targetData.setData(targetDataFeatures);

            if (openPopup && map) {
                const coordinates = peak.geometry.coordinates.slice();

                const lngLat = mapboxgl.LngLat.convert(
                    coordinates as [number, number]
                );

                const existingPopup = map._popups.find(
                    (pop) =>
                        pop._lngLat.lat === lngLat.lat &&
                        pop._lngLat.lng === lngLat.lng
                );

                if (existingPopup) {
                    existingPopup.remove();
                }

                new mapboxgl.Popup({ offset: 25 })
                    .setLngLat(lngLat)
                    .setDOMContent(
                        newValue
                            ? FavoritePopup({
                                  peak: peak.properties as UnclimbedPeak,
                                  units,
                                  theme,
                                  onUnfavoriteClick: (peakId, newValue) => {
                                      onFavoriteClick(
                                          peakId,
                                          newValue,
                                          true,
                                          map,
                                          theme,
                                          units,
                                          setDashboardState,
                                          dispatch
                                      );
                                  },
                              })
                            : UnclimbedPopup({
                                  peak: peak.properties as UnclimbedPeak,
                                  units,
                                  theme,
                                  onFavoriteClick: (peakId, newValue) => {
                                      onFavoriteClick(
                                          peakId,
                                          newValue,
                                          true,
                                          map,
                                          theme,
                                          units,
                                          setDashboardState,
                                          dispatch
                                      );
                                  },
                              })
                    )
                    .addTo(map);
            }
        }

        setDashboardState((state) => ({
            ...state,
            favoritePeaks: (state.favoritePeaks ?? []).map((p) => ({
                ...(p as UnclimbedPeak),
                isFavorited: p.Id === peakId ? !newValue : p.isFavorited,
            })),
        }));
    }
};

export default onFavoriteClick;
