import getPeakSummits from "@/actions/getPeakSummits";
import React from "react";
import PeaksProvider from "./PeaksContext";
import getUnclimbedPeaks from "@/actions/getUnclimbedPeaks";
import getFavoritePeaks from "@/actions/getFavoritePeaks";

type Props = {
    children: React.ReactNode;
};

const PeaksData = async ({ children }: Props) => {
    const peakSummits = await getPeakSummits();

    return <PeaksProvider peakSummits={peakSummits}>{children}</PeaksProvider>;
};

export default PeaksData;
