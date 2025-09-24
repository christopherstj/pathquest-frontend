"use client";
import { User } from "@/typeDefs/User";
import React, { createContext, useState } from "react";

interface UserState {
    user: User | null;
}

const useUserState = (user: User | null) =>
    useState<UserState>({
        user,
    });

export const UserContext = createContext<ReturnType<
    typeof useUserState
> | null>(null);

export const useUser = () => {
    const context = React.useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
};

const UserProvider = ({
    userDetails,
    children,
}: {
    userDetails: User | null;
    children: React.ReactNode;
}) => {
    const [state, setState] = useUserState(userDetails);

    return (
        <UserContext.Provider value={[state, setState]}>
            {children}
        </UserContext.Provider>
    );
};

export default UserProvider;
