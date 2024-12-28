"use client";
import Activity from "@/typeDefs/Activity";
import { ActivityStart } from "@/typeDefs/ActivityStart";
import Challenge from "@/typeDefs/Challenge";
import ChallengeProgress from "@/typeDefs/ChallengeProgress";
import FavoritedPeak from "@/typeDefs/FavoritedPeak";
import PeakSummit from "@/typeDefs/PeakSummit";
import UnclimbedPeak from "@/typeDefs/UnclimbedPeak";
import React, { createContext, useState } from "react";

export interface DashboardState {
    map: mapboxgl.Map | null;
    activities: ActivityStart[] | null;
    peakSummits: PeakSummit[] | null;
    favoritePeaks: FavoritedPeak[] | null;
    incompleteChallenges: ChallengeProgress[] | null;
}

const useDashboardState = (
    peakSummits: PeakSummit[] | null,
    favoritePeaks: FavoritedPeak[] | null,
    activities: ActivityStart[] | null,
    incompleteChallenges: ChallengeProgress[] | null
) =>
    useState<DashboardState>({
        map: null,
        activities,
        peakSummits,
        favoritePeaks,
        incompleteChallenges,
    });

export const DashboardContext = createContext<ReturnType<
    typeof useDashboardState
> | null>(null);

export const useDashboard = () => {
    const context = React.useContext(DashboardContext);
    if (!context) {
        throw new Error("useDashboard must be used within a DashboardProvider");
    }
    return context;
};

const DashboardProvider = ({
    children,
    activities,
    peakSummits,
    favoritePeaks,
    incompleteChallenges,
}: {
    children: React.ReactNode;
    peakSummits: PeakSummit[];
    activities: ActivityStart[];
    favoritePeaks: FavoritedPeak[];
    incompleteChallenges: ChallengeProgress[];
}) => {
    const [state, setState] = useDashboardState(
        peakSummits,
        favoritePeaks,
        activities,
        incompleteChallenges
    );

    return (
        <DashboardContext.Provider value={[state, setState]}>
            {children}
        </DashboardContext.Provider>
    );
};

export default DashboardProvider;
