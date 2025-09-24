import PeakSearch from "@/components/app/peaks/PeakSearch";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
    title: "PathQuest | Peaks Search",
};

const page = () => {
    return <PeakSearch />;
    // return <div className="absolute inset-0">page</div>;
};

export default page;
