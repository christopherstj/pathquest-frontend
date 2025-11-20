import User from "@/typeDefs/User";
import { createStore } from "zustand/vanilla";

export type UserState = {
    user: User | null;
};

export type UserActions = {
    setUser: (user: User | null) => void;
};

export type UserStore = UserState & UserActions;

export const defaultUserState: UserState = {
    user: null,
};

export const createUserStore = (
    preloadedState: UserState = defaultUserState
) => {
    return createStore<UserStore>((set) => ({
        ...preloadedState,
        setUser: (user) => set({ user }),
    }));
};
