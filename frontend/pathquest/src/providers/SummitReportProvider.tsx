"use client";
import React, { createContext, useContext, useRef } from "react";
import { useStore } from "zustand";
import {
    createSummitReportStore,
    type SummitReportState,
} from "@/store/summitReportStore";

export type SummitReportStoreApi = ReturnType<typeof createSummitReportStore>;

export const SummitReportStoreContext = createContext<SummitReportStoreApi | undefined>(
    undefined
);

type Props = {
    children: React.ReactNode;
};

const SummitReportProvider = ({ children }: Props) => {
    const storeRef = useRef<SummitReportStoreApi | null>(null);
    if (storeRef.current === null) {
        storeRef.current = createSummitReportStore();
    }

    return (
        <SummitReportStoreContext.Provider value={storeRef.current}>
            {children}
        </SummitReportStoreContext.Provider>
    );
};

export default SummitReportProvider;

export const useSummitReportStore = <T,>(
    selector: (store: SummitReportState) => T
): T => {
    const summitReportStoreContext = useContext(SummitReportStoreContext);

    if (!summitReportStoreContext) {
        throw new Error(
            `useSummitReportStore must be used within SummitReportProvider`
        );
    }

    return useStore(summitReportStoreContext, selector);
};

