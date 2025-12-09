"use client";
import React, { createContext, useContext, useRef } from "react";
import { useStore } from "zustand";
import {
    createAuthModalStore,
    type AuthModalStore,
} from "@/store/authModalStore";

export type AuthModalStoreApi = ReturnType<typeof createAuthModalStore>;

export const AuthModalStoreContext = createContext<AuthModalStoreApi | undefined>(
    undefined
);

type Props = {
    children: React.ReactNode;
};

const AuthModalProvider = ({ children }: Props) => {
    const storeRef = useRef<AuthModalStoreApi | null>(null);
    if (storeRef.current === null) {
        storeRef.current = createAuthModalStore();
    }

    return (
        <AuthModalStoreContext.Provider value={storeRef.current}>
            {children}
        </AuthModalStoreContext.Provider>
    );
};

export default AuthModalProvider;

export const useAuthModalStore = <T,>(
    selector: (store: AuthModalStore) => T
): T => {
    const authModalStoreContext = useContext(AuthModalStoreContext);

    if (!authModalStoreContext) {
        throw new Error(
            `useAuthModalStore must be used within AuthModalProvider`
        );
    }

    return useStore(authModalStoreContext, selector);
};

