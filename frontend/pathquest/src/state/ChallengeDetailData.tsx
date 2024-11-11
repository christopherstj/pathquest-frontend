import getChallengeDetails from "@/actions/getChallengeDetails";
import React from "react";
import ChallengeDetailProvider from "./ChallengeDetailContext";

type Props = {
    children: React.ReactNode;
    id: string;
};

const ChallengeDetailData = async ({ children, id }: Props) => {
    const data = await getChallengeDetails(id);

    if (!data) {
        return null;
    }

    return (
        <ChallengeDetailProvider data={data}>
            {children}
        </ChallengeDetailProvider>
    );
};

export default ChallengeDetailData;
