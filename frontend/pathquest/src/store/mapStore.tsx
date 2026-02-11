import { createStore } from "zustand/vanilla";
import { Map } from "mapbox-gl";
import Peak from "@/typeDefs/Peak";
import ChallengeProgress from "@/typeDefs/ChallengeProgress";
import Summit from "@/typeDefs/Summit";
import Activity from "@/typeDefs/Activity";
import Challenge from "@/typeDefs/Challenge";

export type SelectedPeakUserData = {
    peakId: string;
    peakName: string;
    peakCoords: [number, number];
    ascents: Summit[];
    activities: Activity[];
} | null;

export type SelectedPeakCommunityData = {
    peakId: string;
    peakName: string;
    publicSummits: Summit[];
} | null;

export type SelectedChallengeData = {
    challengeId: number;
    challengeName: string;
    peaks: Peak[];
} | null;

export type MapState = {
    map: Map | null;
    visiblePeaks: Peak[];
    visibleChallenges: ChallengeProgress[];
    isSatellite: boolean;
    is3D: boolean;
    disablePeaksSearch: boolean;
    summitHistoryPeakId: string | null;
    isZoomedOutTooFar: boolean;
    selectedPeakUserData: SelectedPeakUserData;
    selectedPeakCommunityData: SelectedPeakCommunityData;
    selectedChallengeData: SelectedChallengeData;
    hoveredPeakId: string | null;
};

export type MapActions = {
    setMap: (map: Map | null) => void;
    setVisiblePeaks: (peaks: Peak[]) => void;
    setVisibleChallenges: (challenges: ChallengeProgress[]) => void;
    setIsSatellite: (isSatellite: boolean) => void;
    setIs3D: (is3D: boolean) => void;
    setDisablePeaksSearch: (disable: boolean) => void;
    setSummitHistoryPeakId: (peakId: string | null) => void;
    setIsZoomedOutTooFar: (isZoomedOut: boolean) => void;
    setSelectedPeakUserData: (data: SelectedPeakUserData) => void;
    setSelectedPeakCommunityData: (data: SelectedPeakCommunityData) => void;
    setSelectedChallengeData: (data: SelectedChallengeData) => void;
    setHoveredPeakId: (peakId: string | null) => void;
};

export type MapStore = MapState & MapActions;

export const createMapStore = (
    preloadedState: MapState = {
        map: null,
        visiblePeaks: [],
        visibleChallenges: [],
        isSatellite: false,
        is3D: false, // Default to 2D
        disablePeaksSearch: false,
        summitHistoryPeakId: null,
        isZoomedOutTooFar: false,
        selectedPeakUserData: null,
        selectedPeakCommunityData: null,
        selectedChallengeData: null,
        hoveredPeakId: null,
    }
) => {
    return createStore<MapStore>((set) => ({
        ...preloadedState,
        setMap: (map) => set({ map }),
        setVisiblePeaks: (visiblePeaks) => set({ visiblePeaks }),
        setVisibleChallenges: (visibleChallenges) => set({ visibleChallenges }),
        setIsSatellite: (isSatellite) => set({ isSatellite }),
        setIs3D: (is3D) => set({ is3D }),
        setDisablePeaksSearch: (disablePeaksSearch) => set({ disablePeaksSearch }),
        setSummitHistoryPeakId: (summitHistoryPeakId) => set({ summitHistoryPeakId }),
        setIsZoomedOutTooFar: (isZoomedOutTooFar) => set({ isZoomedOutTooFar }),
        setSelectedPeakUserData: (selectedPeakUserData) => set({ selectedPeakUserData }),
        setSelectedPeakCommunityData: (selectedPeakCommunityData) => set({ selectedPeakCommunityData }),
        setSelectedChallengeData: (selectedChallengeData) => set({ selectedChallengeData }),
        setHoveredPeakId: (hoveredPeakId) => set({ hoveredPeakId }),
    }));
};
