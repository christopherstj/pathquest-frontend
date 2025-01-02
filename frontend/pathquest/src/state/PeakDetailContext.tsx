"use client";
import Activity from "@/typeDefs/Activity";
import UnclimbedPeak from "@/typeDefs/UnclimbedPeak";
import React, { createContext, useState } from "react";

interface PeakDetailState {
    peak: UnclimbedPeak;
    activities: Activity[];
    summits: {
        timestamp: string;
        activityId: string;
    }[];
    map: mapboxgl.Map | null;
}

const usePeakDetailState = (
    peak: UnclimbedPeak,
    activities: Activity[],
    summits: {
        timestamp: string;
        activityId: string;
    }[]
) =>
    useState<PeakDetailState>({
        map: null,
        peak,
        activities,
        summits,
    });

export const PeakDetailContext = createContext<ReturnType<
    typeof usePeakDetailState
> | null>(null);

export const usePeakDetail = () => {
    const context = React.useContext(PeakDetailContext);
    if (!context) {
        throw new Error(
            "usePeakDetail must be used within a PeakDetailProvider"
        );
    }
    return context;
};

const PeakDetailProvider = ({
    peak,
    activities,
    summits,
    children,
}: {
    peak: UnclimbedPeak;
    activities: Activity[];
    summits: {
        timestamp: string;
        activityId: string;
    }[];
    children: React.ReactNode;
}) => {
    const [state, setState] = usePeakDetailState(peak, activities, summits);

    return (
        <PeakDetailContext.Provider value={[state, setState]}>
            {children}
        </PeakDetailContext.Provider>
    );
};

export default PeakDetailProvider;
