import getFavoritePeaks from "@/actions/getFavoritePeaks";
import getFavoriteChallenges from "@/actions/getFavoriteChallenges";
import getPeakSummits from "@/actions/getPeakSummits";
import getRecentActivities from "@/actions/getRecentActivities";
import React from "react";
import DashboardProvider from "./DashboardContext";
import getRecentSummits from "@/actions/getRecentSummits";

type Props = {
    children: React.ReactNode;
};

const DashboardData = async ({ children }: Props) => {
    const peakSummits = await getRecentSummits();
    const favoritePeaks = await getFavoritePeaks();
    const favoriteChallenges = await getFavoriteChallenges();
    const activities = await getRecentActivities(true);

    return (
        <DashboardProvider
            {...{
                peakSummits,
                favoritePeaks,
                favoriteChallenges,
                activities,
            }}
        >
            {children}
        </DashboardProvider>
    );
};

export default DashboardData;
