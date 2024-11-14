import FavoritePopup from "@/components/dashboard/FavoritePopup";
import UnclimbedPopup from "@/components/dashboard/UnclimbedPopup";
import UnclimbedPeak from "@/typeDefs/UnclimbedPeak";
import { Theme } from "@mui/material";
import mapboxgl from "mapbox-gl";

const addUncimbedPeakMarker = (
    map: mapboxgl.Map | null,
    peak: UnclimbedPeak,
    theme: Theme,
    units: "metric" | "imperial",
    onFavoriteClick: (peakId: string, newValue: boolean) => Promise<void>
) => {
    if (!map) return;

    map._popups.forEach((popup) => popup.remove());

    const popup = peak.isFavorited
        ? FavoritePopup({
              peak,
              units,
              theme,
              onUnfavoriteClick: (peakId, newValue) => {
                  onFavoriteClick(peakId, newValue);
              },
          })
        : UnclimbedPopup({
              peak,
              units,
              theme,
              onFavoriteClick: (peakId, newValue) => {
                  onFavoriteClick(peakId, newValue);
              },
          });

    new mapboxgl.Popup({ offset: 25 })
        .setLngLat([peak.Long, peak.Lat])
        .setDOMContent(popup)
        .addTo(map);
};

export default addUncimbedPeakMarker;
