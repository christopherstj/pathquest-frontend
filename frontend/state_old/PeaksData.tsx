import getPeakSummits from "@/actions/peaks/getPeakSummits";
import React from "react";
import PeaksProvider from "./PeaksContext";
import getUnclimbedPeaks from "@/actions/peaks/getUnclimbedPeaks";
import getFavoritePeaks from "@/actions/peaks/getFavoritePeaks";

type Props = {
    children: React.ReactNode;
};

const PeaksData = async ({ children }: Props) => {
    const peakSummits = await getPeakSummits();

    return <PeaksProvider peakSummits={peakSummits}>{children}</PeaksProvider>;
};

export default PeaksData;
