"use client";
import ChallengeProgress from "@/typeDefs/ChallengeProgress";
import React, { createContext, useState } from "react";

interface ChallengeDashboardState {
    map: mapboxgl.Map | null;
    challenges: ChallengeProgress[];
    search: string;
    limitToBbox: boolean;
    type: "completed" | "in-progress" | "not-started";
}

const useChallengeDashboardState = () =>
    useState<ChallengeDashboardState>({
        map: null,
        challenges: [],
        search: "",
        limitToBbox: false,
        type: "in-progress",
    });

export const ChallengeDashboardContext = createContext<ReturnType<
    typeof useChallengeDashboardState
> | null>(null);

export const useChallengeDashboard = () => {
    const context = React.useContext(ChallengeDashboardContext);
    if (!context) {
        throw new Error(
            "useChallengeDashboard must be used within a ChallengeDashboardProvider"
        );
    }
    return context;
};

const ChallengeDashboardProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [state, setState] = useChallengeDashboardState();

    return (
        <ChallengeDashboardContext.Provider value={[state, setState]}>
            {children}
        </ChallengeDashboardContext.Provider>
    );
};

export default ChallengeDashboardProvider;
