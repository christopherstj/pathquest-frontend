"use client";
import Activity from "@/typeDefs/Activity";
import Challenge from "@/typeDefs/Challenge";
import UnclimbedPeak from "@/typeDefs/UnclimbedPeak";
import React, { createContext, useState } from "react";

export interface ChallengeDetailState {
    map: mapboxgl.Map | null;
    challenge: Challenge;
    peaks: (UnclimbedPeak & {
        ascents: {
            id: string;
            timestamp: string;
            activityId: string;
            timezone?: string;
        }[];
    })[];
    activityCoords: {
        id: string;
        coords: Activity["coords"];
    }[];
}

const useChallengeDetailState = (data: {
    challenge: Challenge;
    peaks: (UnclimbedPeak & {
        ascents: {
            id: string;
            timestamp: string;
            activityId: string;
            timezone?: string;
        }[];
    })[];
    activityCoords: {
        id: string;
        coords: Activity["coords"];
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
        peaks: (UnclimbedPeak & {
            ascents: {
                id: string;
                timestamp: string;
                activityId: string;
                timezone?: string;
            }[];
        })[];
        activityCoords: {
            id: string;
            coords: Activity["coords"];
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
