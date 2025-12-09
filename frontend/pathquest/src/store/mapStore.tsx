import { createStore } from "zustand/vanilla";
import { Map } from "mapbox-gl";
import Peak from "@/typeDefs/Peak";
import ChallengeProgress from "@/typeDefs/ChallengeProgress";

export type MapState = {
    map: Map | null;
    visiblePeaks: Peak[];
    visibleChallenges: ChallengeProgress[];
    isSatellite: boolean;
    disablePeaksSearch: boolean;
};

export type MapActions = {
    setMap: (map: Map | null) => void;
    setVisiblePeaks: (peaks: Peak[]) => void;
    setVisibleChallenges: (challenges: ChallengeProgress[]) => void;
    setIsSatellite: (isSatellite: boolean) => void;
    setDisablePeaksSearch: (disable: boolean) => void;
};

export type MapStore = MapState & MapActions;

export const createMapStore = (
    preloadedState: MapState = {
        map: null,
        visiblePeaks: [],
        visibleChallenges: [],
        isSatellite: false,
        disablePeaksSearch: false,
    }
) => {
    return createStore<MapStore>((set) => ({
        ...preloadedState,
        setMap: (map) => set({ map }),
        setVisiblePeaks: (visiblePeaks) => set({ visiblePeaks }),
        setVisibleChallenges: (visibleChallenges) => set({ visibleChallenges }),
        setIsSatellite: (isSatellite) => set({ isSatellite }),
        setDisablePeaksSearch: (disablePeaksSearch) => set({ disablePeaksSearch }),
    }));
};
