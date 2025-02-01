import { ChallengeDetailState } from "@/state/ChallengeDetailContext";
import Activity from "@/typeDefs/Activity";
import UnclimbedPeak from "@/typeDefs/UnclimbedPeak";
import setChallengeDetailFavorite from "./setChallengeDetailFavorite";
import addUncimbedPeakMarker from "./addUnclimbedPeakMarker";
import toggleFavoritePeak from "@/actions/toggleFavoritePeak";
import { Theme } from "@mui/material";

const onFavoriteClick = async (
    peaks: (UnclimbedPeak & {
        ascents: {
            id: string;
            timestamp: string;
            activityId: string;
            timezone?: string;
        }[];
    })[],
    setChallengeDetailState: React.Dispatch<
        React.SetStateAction<ChallengeDetailState>
    >,
    map: mapboxgl.Map | null,
    theme: Theme,
    units: "metric" | "imperial",
    peakId: string,
    newValue: boolean,
    flyTo: boolean = false,
    openPopup: boolean = true
) => {
    const newPeak = peaks.find((p) => p.Id === peakId);

    if (!newPeak) return;
    if (!map) return;

    if (flyTo)
        map.flyTo({
            center: [newPeak.Long, newPeak.Lat],
        });

    const newData = peaks.map((peak) => {
        if (peak.Id === peakId) {
            return {
                ...peak,
                isFavorited: newValue,
            };
        }
        return peak;
    });

    setChallengeDetailState((state) => ({
        ...state,
        peaks: newData,
    }));

    setChallengeDetailFavorite(map, peakId, newValue);

    if (openPopup)
        addUncimbedPeakMarker(
            map,
            { ...newPeak, isFavorited: newValue },
            theme,
            units,
            (newPeakId: string, newNewValue: boolean) =>
                onFavoriteClick(
                    peaks,
                    setChallengeDetailState,
                    map,
                    theme,
                    units,
                    newPeakId,
                    newNewValue
                )
        );

    const success = await toggleFavoritePeak(peakId, newValue);

    if (!success) {
        setChallengeDetailFavorite(map, peakId, !newValue);
        setChallengeDetailState((state) => ({
            ...state,
            peaks: peaks.map((peak) => {
                if (peak.Id === peakId) {
                    return {
                        ...peak,
                        isFavorited: !newValue,
                    };
                }
                return peak;
            }),
        }));

        if (openPopup)
            addUncimbedPeakMarker(
                map,
                { ...newPeak, isFavorited: !newValue },
                theme,
                units,
                (newPeakId: string, newNewValue: boolean) =>
                    onFavoriteClick(
                        peaks,
                        setChallengeDetailState,
                        map,
                        theme,
                        units,
                        newPeakId,
                        newNewValue
                    )
            );
    }
};

export default onFavoriteClick;
