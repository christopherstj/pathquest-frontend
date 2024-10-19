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
    const unclimbedPeaks = await getUnclimbedPeaks();
    const favoritePeaks = await getFavoritePeaks();

    return (
        <PeaksProvider
            peakSummits={peakSummits}
            unclimbedPeaks={unclimbedPeaks}
            favoritePeaks={favoritePeaks}
        >
            {children}
        </PeaksProvider>
    );
};

export default PeaksData;
