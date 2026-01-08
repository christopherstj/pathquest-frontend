import { createStore } from "zustand/vanilla";
import Summit from "@/typeDefs/Summit";
import type { SummitType } from "@pathquest/shared/types";

export interface SummitReportData {
    summit: Summit;
    peakId: string;
    peakName: string;
    /**
     * Whether this summit is from a Strava activity ("activity") or manually entered ("manual").
     * Used to determine the correct photo API endpoint.
     */
    summitType: SummitType;
}

export interface SummitReportState {
    isOpen: boolean;
    data: SummitReportData | null;
    openSummitReport: (data: SummitReportData) => void;
    closeSummitReport: () => void;
}

export const createSummitReportStore = () =>
    createStore<SummitReportState>((set) => ({
        isOpen: false,
        data: null,
        openSummitReport: (data: SummitReportData) =>
            set({ isOpen: true, data }),
        closeSummitReport: () => set({ isOpen: false, data: null }),
    }));

