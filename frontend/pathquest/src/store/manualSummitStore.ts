import { createStore } from "zustand/vanilla";

export interface ManualSummitData {
    peakId: string;
    peakName: string;
    peakCoords: [number, number];
}

export interface ManualSummitState {
    isOpen: boolean;
    data: ManualSummitData | null;
    openManualSummit: (data: ManualSummitData) => void;
    closeManualSummit: () => void;
}

export const createManualSummitStore = () =>
    createStore<ManualSummitState>((set) => ({
        isOpen: false,
        data: null,
        openManualSummit: (data: ManualSummitData) =>
            set({ isOpen: true, data }),
        closeManualSummit: () => set({ isOpen: false, data: null }),
    }));

