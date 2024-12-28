"use client";
import FavoritedPeak from "@/typeDefs/FavoritedPeak";
import Peak from "@/typeDefs/Peak";
import PeakSummit from "@/typeDefs/PeakSummit";
import UnclimbedPeak from "@/typeDefs/UnclimbedPeak";
import React, { createContext, useState } from "react";

export interface PeaksState {
    map: mapboxgl.Map | null;
    peakSummits: PeakSummit[];
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

const usePeaksState = (peakSummits: PeakSummit[] | null) =>
    useState<PeaksState>({
        map: null,
        peakSummits: peakSummits ?? [],
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
    children,
}: {
    peakSummits: PeakSummit[] | null;
    children: React.ReactNode;
}) => {
    const [state, setState] = usePeaksState(peakSummits);

    return (
        <PeaksContext.Provider value={[state, setState]}>
            {children}
        </PeaksContext.Provider>
    );
};

export default PeaksProvider;
