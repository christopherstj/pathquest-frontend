import getFavoritePeaks from "@/actions/getFavoritePeaks";
import getIncompleteChallenges from "@/actions/getIncompleteChallenges";
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
    const incompleteChallenges = await getIncompleteChallenges();
    const activities = await getRecentActivities();

    return (
        <DashboardProvider
            {...{
                peakSummits,
                favoritePeaks,
                incompleteChallenges,
                activities,
            }}
        >
            {children}
        </DashboardProvider>
    );
};

export default DashboardData;
