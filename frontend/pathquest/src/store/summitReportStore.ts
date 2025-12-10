import { createStore } from "zustand/vanilla";
import Summit from "@/typeDefs/Summit";

export interface SummitReportData {
    summit: Summit;
    peakId: string;
    peakName: string;
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

