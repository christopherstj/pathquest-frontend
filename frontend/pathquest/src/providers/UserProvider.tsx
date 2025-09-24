"use client";
import React, { createContext, useContext, useRef } from "react";
import { useStore } from "zustand";
import { createUserStore, type UserStore } from "@/store/userStore";
import { User } from "@/typeDefs/User";

export type UserStoreApi = ReturnType<typeof createUserStore>;

export const UserStoreContext = createContext<UserStoreApi | undefined>(
    undefined
);

type Props = {
    children: React.ReactNode;
    user: User | null;
};

const UserProvider = ({ children, user }: Props) => {
    const storeRef = useRef<UserStoreApi | null>(null);
    if (storeRef.current === null) {
        storeRef.current = createUserStore({ user });
    }

    return (
        <UserStoreContext.Provider value={storeRef.current}>
            {children}
        </UserStoreContext.Provider>
    );
};

export default UserProvider;

export const useUserStore = <T,>(selector: (store: UserStore) => T): T => {
    const userStoreContext = useContext(UserStoreContext);

    if (!userStoreContext) {
        throw new Error(`useUserStore must be used within UserStoreProvider`);
    }

    return useStore(userStoreContext, selector);
};
