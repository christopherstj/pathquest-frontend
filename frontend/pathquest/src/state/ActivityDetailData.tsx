import getActivityDetails from "@/actions/getActivityDetails";
import React from "react";
import ActivityDetailProvider from "./ActivityDetailsContext";

type Props = {
    id: string;
    children: React.ReactNode;
};

const ActivityDetailData = async ({ id, children }: Props) => {
    const details = await getActivityDetails(id);

    return details === null ? null : (
        <ActivityDetailProvider
            activity={details.activity}
            peakSummits={details.peakSummits}
        >
            {children}
        </ActivityDetailProvider>
    );
};

export default ActivityDetailData;
