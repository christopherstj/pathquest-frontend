"use client";
import ChallengeProgress from "@/typeDefs/ChallengeProgress";
import FavoritedPeak from "@/typeDefs/FavoritedPeak";
import Peak from "@/typeDefs/Peak";
import PeakSummit from "@/typeDefs/PeakSummit";
import UnclimbedPeak from "@/typeDefs/UnclimbedPeak";
import React, { createContext, useState } from "react";

interface ChallengesState {
    incompleteChallenges: ChallengeProgress[] | null;
}

const useChallengesState = (incompleteChallenges: ChallengeProgress[] | null) =>
    useState<ChallengesState>({
        incompleteChallenges,
    });

export const ChallengesContext = createContext<ReturnType<
    typeof useChallengesState
> | null>(null);

export const useChallenges = () => {
    const context = React.useContext(ChallengesContext);
    if (!context) {
        throw new Error(
            "useChallenges must be used within a ChallengesProvider"
        );
    }
    return context;
};

const ChallengesProvider = ({
    children,
    incompleteChallenges,
}: {
    children: React.ReactNode;
    incompleteChallenges: ChallengeProgress[] | null;
}) => {
    const [state, setState] = useChallengesState(incompleteChallenges);

    return (
        <ChallengesContext.Provider value={[state, setState]}>
            {children}
        </ChallengesContext.Provider>
    );
};

export default ChallengesProvider;
