"use client";
import Activity from "@/typeDefs/Activity";
import Challenge from "@/typeDefs/Challenge";
import UnclimbedPeak from "@/typeDefs/UnclimbedPeak";
import React, { createContext, useState } from "react";

export interface ChallengeDetailState {
    map: mapboxgl.Map | null;
    challenge: Challenge;
    peaks: {
        peak: UnclimbedPeak;
        activity?: Activity;
        ascents: { timestamp: string; activityId: string; timezone?: string }[];
    }[];
}

const useChallengeDetailState = (data: {
    challenge: Challenge;
    peaks: {
        peak: UnclimbedPeak;
        activity?: Activity;
        ascents: { timestamp: string; activityId: string; timezone?: string }[];
    }[];
}) =>
    useState<ChallengeDetailState>({
        map: null,
        ...data,
    });

export const ChallengeDetailContext = createContext<ReturnType<
    typeof useChallengeDetailState
> | null>(null);

export const useChallengeDetail = () => {
    const context = React.useContext(ChallengeDetailContext);
    if (!context) {
        throw new Error(
            "useChallengeDetail must be used within a ChallengeDetailProvider"
        );
    }
    return context;
};

const ChallengeDetailProvider = ({
    children,
    data,
}: {
    children: React.ReactNode;
    data: {
        challenge: Challenge;
        peaks: {
            peak: UnclimbedPeak;
            activity?: Activity;
            ascents: {
                timestamp: string;
                activityId: string;
                timezone?: string;
            }[];
        }[];
    };
}) => {
    const [state, setState] = useChallengeDetailState(data);

    return (
        <ChallengeDetailContext.Provider value={[state, setState]}>
            {children}
        </ChallengeDetailContext.Provider>
    );
};

export default ChallengeDetailProvider;
