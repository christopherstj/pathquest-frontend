"use client";
import FavoritedPeak from "@/typeDefs/FavoritedPeak";
import Peak from "@/typeDefs/Peak";
import PeakSummit from "@/typeDefs/PeakSummit";
import UnclimbedPeak from "@/typeDefs/UnclimbedPeak";
import React, { createContext, useState } from "react";

interface PeaksState {
    peakSummits: PeakSummit[] | null;
    unclimbedPeaks: UnclimbedPeak[] | null;
    favoritePeaks: FavoritedPeak[] | null;
    map: mapboxgl.Map | null;
    peakSelection:
        | {
              type: "completed";
              data: PeakSummit[];
          }
        | {
              type: "unclimbed";
              data: UnclimbedPeak[];
          };
    showSummittedPeaks: boolean;
    search: string;
    limitResultsToBbox: boolean;
}

const usePeaksState = (
    peakSummits: PeakSummit[] | null,
    unclimbedPeaks: UnclimbedPeak[] | null,
    favoritePeaks: FavoritedPeak[] | null
) =>
    useState<PeaksState>({
        peakSummits,
        unclimbedPeaks,
        favoritePeaks,
        map: null,
        peakSelection: {
            type: "completed",
            data: peakSummits ?? [],
        },
        showSummittedPeaks: true,
        search: "",
        limitResultsToBbox: true,
    });

export const PeaksContext = createContext<ReturnType<
    typeof usePeaksState
> | null>(null);

export const usePeaks = () => {
    const context = React.useContext(PeaksContext);
    if (!context) {
        throw new Error("usePeaks must be used within a PeaksProvider");
    }
    return context;
};

const PeaksProvider = ({
    peakSummits,
    unclimbedPeaks,
    favoritePeaks,
    children,
}: {
    peakSummits: PeakSummit[] | null;
    unclimbedPeaks: UnclimbedPeak[] | null;
    favoritePeaks: FavoritedPeak[] | null;
    children: React.ReactNode;
}) => {
    const [state, setState] = usePeaksState(
        peakSummits,
        unclimbedPeaks,
        favoritePeaks
    );

    return (
        <PeaksContext.Provider value={[state, setState]}>
            {children}
        </PeaksContext.Provider>
    );
};

export default PeaksProvider;
