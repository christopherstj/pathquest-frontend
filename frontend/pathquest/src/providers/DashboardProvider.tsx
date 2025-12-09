"use client";
import React, { createContext, useContext, useRef } from "react";
import { useStore } from "zustand";
import {
    createDashboardStore,
    type DashboardStore,
} from "@/store/dashboardStore";

export type DashboardStoreApi = ReturnType<typeof createDashboardStore>;

export const DashboardStoreContext = createContext<DashboardStoreApi | undefined>(
    undefined
);

type Props = {
    children: React.ReactNode;
};

const DashboardProvider = ({ children }: Props) => {
    const storeRef = useRef<DashboardStoreApi | null>(null);
    if (storeRef.current === null) {
        storeRef.current = createDashboardStore();
    }

    return (
        <DashboardStoreContext.Provider value={storeRef.current}>
            {children}
        </DashboardStoreContext.Provider>
    );
};

export default DashboardProvider;

export const useDashboardStore = <T,>(
    selector: (store: DashboardStore) => T
): T => {
    const dashboardStoreContext = useContext(DashboardStoreContext);

    if (!dashboardStoreContext) {
        throw new Error(
            `useDashboardStore must be used within DashboardProvider`
        );
    }

    return useStore(dashboardStoreContext, selector);
};

