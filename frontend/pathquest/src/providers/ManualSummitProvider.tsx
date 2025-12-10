"use client";
import React, { createContext, useContext, useRef } from "react";
import { useStore } from "zustand";
import {
    createManualSummitStore,
    type ManualSummitState,
} from "@/store/manualSummitStore";

export type ManualSummitStoreApi = ReturnType<typeof createManualSummitStore>;

export const ManualSummitStoreContext = createContext<ManualSummitStoreApi | undefined>(
    undefined
);

type Props = {
    children: React.ReactNode;
};

const ManualSummitProvider = ({ children }: Props) => {
    const storeRef = useRef<ManualSummitStoreApi | null>(null);
    if (storeRef.current === null) {
        storeRef.current = createManualSummitStore();
    }

    return (
        <ManualSummitStoreContext.Provider value={storeRef.current}>
            {children}
        </ManualSummitStoreContext.Provider>
    );
};

export default ManualSummitProvider;

export const useManualSummitStore = <T,>(
    selector: (store: ManualSummitState) => T
): T => {
    const manualSummitStoreContext = useContext(ManualSummitStoreContext);

    if (!manualSummitStoreContext) {
        throw new Error(
            `useManualSummitStore must be used within ManualSummitProvider`
        );
    }

    return useStore(manualSummitStoreContext, selector);
};

