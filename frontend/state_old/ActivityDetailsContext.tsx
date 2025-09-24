"use client";
import Activity from "@/typeDefs/Activity";
import Challenge from "@/typeDefs/Challenge";
import PeakSummit from "@/typeDefs/PeakSummit";
import UnclimbedPeak from "@/typeDefs/UnclimbedPeak";
import React, { createContext, useState } from "react";

export interface ActivityDetailState {
    map: mapboxgl.Map | null;
    activity: Activity;
    peakSummits: PeakSummit[];
}

const useActivityDetailState = (
    activity: Activity,
    peakSummits: PeakSummit[]
) =>
    useState<ActivityDetailState>({
        map: null,
        activity,
        peakSummits,
    });

export const ActivityDetailContext = createContext<ReturnType<
    typeof useActivityDetailState
> | null>(null);

export const useActivityDetail = () => {
    const context = React.useContext(ActivityDetailContext);
    if (!context) {
        throw new Error(
            "useActivityDetail must be used within a ActivityDetailProvider"
        );
    }
    return context;
};

const ActivityDetailProvider = ({
    children,
    activity,
    peakSummits,
}: {
    children: React.ReactNode;
    activity: Activity;
    peakSummits: PeakSummit[];
}) => {
    const [state, setState] = useActivityDetailState(activity, peakSummits);

    return (
        <ActivityDetailContext.Provider value={[state, setState]}>
            {children}
        </ActivityDetailContext.Provider>
    );
};

export default ActivityDetailProvider;
