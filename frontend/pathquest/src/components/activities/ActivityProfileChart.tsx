"use client";
import { useActivityDetail } from "@/state/ActivityDetailsContext";
import React from "react";

interface ChartValue {
    elevation: number;
}

const ActivityProfileChart = () => {
    const [
        {
            activity: { vertProfile, coords },
            map,
        },
    ] = useActivityDetail();

    return <div>ActivityProfile</div>;
};

export default ActivityProfileChart;
