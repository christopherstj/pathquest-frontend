import { createStore } from "zustand/vanilla";

export type UserManagementState = {
    isOpen: boolean;
};

export type UserManagementActions = {
    openModal: () => void;
    closeModal: () => void;
};

export type UserManagementStore = UserManagementState & UserManagementActions;

export const defaultUserManagementState: UserManagementState = {
    isOpen: false,
};

export const createUserManagementStore = (
    preloadedState: UserManagementState = defaultUserManagementState
) => {
    return createStore<UserManagementStore>((set) => ({
        ...preloadedState,
        openModal: () => set({ isOpen: true }),
        closeModal: () => set({ isOpen: false }),
    }));
};

// Create a singleton store instance for use across the app
export const userManagementStore = createUserManagementStore();

