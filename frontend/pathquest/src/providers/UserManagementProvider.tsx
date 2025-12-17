"use client";
import React, { createContext, useContext, useRef } from "react";
import { useStore } from "zustand";
import {
    createUserManagementStore,
    type UserManagementStore,
} from "@/store/userManagementStore";

export type UserManagementStoreApi = ReturnType<typeof createUserManagementStore>;

export const UserManagementStoreContext = createContext<UserManagementStoreApi | undefined>(
    undefined
);

type Props = {
    children: React.ReactNode;
};

const UserManagementProvider = ({ children }: Props) => {
    const storeRef = useRef<UserManagementStoreApi | null>(null);
    if (storeRef.current === null) {
        storeRef.current = createUserManagementStore();
    }

    return (
        <UserManagementStoreContext.Provider value={storeRef.current}>
            {children}
        </UserManagementStoreContext.Provider>
    );
};

export default UserManagementProvider;

export const useUserManagementStore = <T,>(
    selector: (store: UserManagementStore) => T
): T => {
    const userManagementStoreContext = useContext(UserManagementStoreContext);

    if (!userManagementStoreContext) {
        throw new Error(
            `useUserManagementStore must be used within UserManagementProvider`
        );
    }

    return useStore(userManagementStoreContext, selector);
};

