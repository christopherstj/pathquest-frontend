import { createStore } from "zustand/vanilla";

export type DashboardState = {
    isOpen: boolean;
};

export type DashboardActions = {
    openDashboard: () => void;
    closeDashboard: () => void;
    toggleDashboard: () => void;
};

export type DashboardStore = DashboardState & DashboardActions;

export const defaultDashboardState: DashboardState = {
    isOpen: false,
};

export const createDashboardStore = (
    preloadedState: DashboardState = defaultDashboardState
) => {
    return createStore<DashboardStore>((set) => ({
        ...preloadedState,
        openDashboard: () => set({ isOpen: true }),
        closeDashboard: () => set({ isOpen: false }),
        toggleDashboard: () => set((state) => ({ isOpen: !state.isOpen })),
    }));
};

