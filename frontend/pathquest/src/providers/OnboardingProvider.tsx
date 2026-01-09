"use client";

import React, { createContext, useContext, useRef, useEffect } from "react";
import { useStore } from "zustand";
import {
    createOnboardingStore,
    type OnboardingStore,
} from "@/store/onboardingStore";

export type OnboardingStoreApi = ReturnType<typeof createOnboardingStore>;

export const OnboardingStoreContext = createContext<OnboardingStoreApi | undefined>(
    undefined
);

type Props = {
    children: React.ReactNode;
};

const OnboardingProvider = ({ children }: Props) => {
    const storeRef = useRef<OnboardingStoreApi | null>(null);
    if (storeRef.current === null) {
        storeRef.current = createOnboardingStore();
    }

    // Initialize from localStorage on mount
    useEffect(() => {
        storeRef.current?.getState().initialize();
    }, []);

    return (
        <OnboardingStoreContext.Provider value={storeRef.current}>
            {children}
        </OnboardingStoreContext.Provider>
    );
};

export default OnboardingProvider;

export const useOnboardingStore = <T,>(
    selector: (store: OnboardingStore) => T
): T => {
    const onboardingStoreContext = useContext(OnboardingStoreContext);

    if (!onboardingStoreContext) {
        throw new Error(
            `useOnboardingStore must be used within OnboardingProvider`
        );
    }

    return useStore(onboardingStoreContext, selector);
};

