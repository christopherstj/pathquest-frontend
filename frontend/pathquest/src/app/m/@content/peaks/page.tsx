import PeakSearch from "@/components/app/peaks/PeakSearch";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
    title: "PathQuest | Peaks Search",
};

const page = () => {
    return (
        <div className="absolute pointer-events-none inset-0 grid grid-cols-[152px_minmax(0,1fr)] md:grid-cols-[152px_minmax(0,1fr)_250px] lg:grid-cols-[152px_minmax(0,1fr)_300px] p-2.5 gap-2">
            <PeakSearch />
        </div>
    );
};

export default page;
