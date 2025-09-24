"use client";
import { ActivityStart } from "@/typeDefs/ActivityStart";
import React, { createContext, useState } from "react";

export interface ActivitiesState {
    activityStarts: ActivityStart[];
    map: mapboxgl.Map | null;
    search: string;
    limitToBbox: boolean;
    selectedActivities: string[];
    loading: boolean;
}

const useActivitiesState = () =>
    useState<ActivitiesState>({
        activityStarts: [],
        map: null,
        search: "",
        limitToBbox: true,
        selectedActivities: [],
        loading: false,
    });

export const ActivitiesContext = createContext<ReturnType<
    typeof useActivitiesState
> | null>(null);

export const useActivities = () => {
    const context = React.useContext(ActivitiesContext);
    if (!context) {
        throw new Error(
            "useActivities must be used within a ActivitiesProvider"
        );
    }
    return context;
};

const ActivitiesProvider = ({ children }: { children: React.ReactNode }) => {
    const [state, setState] = useActivitiesState();

    return (
        <ActivitiesContext.Provider value={[state, setState]}>
            {children}
        </ActivitiesContext.Provider>
    );
};

export default ActivitiesProvider;
