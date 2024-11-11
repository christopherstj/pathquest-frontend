"use client";
import Activity from "@/typeDefs/Activity";
import Challenge from "@/typeDefs/Challenge";
import UnclimbedPeak from "@/typeDefs/UnclimbedPeak";
import React, { createContext, useState } from "react";

interface ChallengeDetailState {
    map: mapboxgl.Map | null;
    challenge: Challenge;
    peaks: {
        peak: UnclimbedPeak;
        activity?: Activity;
    }[];
}

const useChallengeDetailState = (data: {
    challenge: Challenge;
    peaks: {
        peak: UnclimbedPeak;
        activity?: Activity;
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
