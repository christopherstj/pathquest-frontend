import React from "react";
import ChallengesProvider from "./ChallengesContext";
import getIncompleteChallenges from "@/actions/getIncompleteChallenges";

type Props = {
    children: React.ReactNode;
};

const PeaksData = async ({ children }: Props) => {
    const incompleteChallenges = await getIncompleteChallenges();

    return (
        <ChallengesProvider incompleteChallenges={incompleteChallenges}>
            {children}
        </ChallengesProvider>
    );
};

export default PeaksData;
