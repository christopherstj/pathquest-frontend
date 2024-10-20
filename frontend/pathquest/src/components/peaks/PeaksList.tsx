"use client";
import React from "react";

const PeaksList = () => {
    const [displayedPeaks, setDisplayedPeaks] = React.useState<
        "favorite" | "completed" | "unclimbed"
    >("completed");

    return <div>PeaksList</div>;
};

export default PeaksList;
