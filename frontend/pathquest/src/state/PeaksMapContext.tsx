// "use client";
// import { User } from "@/typeDefs/User";
// import React, { createContext, useState } from "react";

// interface PeaksMapState {
//     map: mapboxgl.Map | null;
//     completed: {
//         peakId: string;
//         marker: mapboxgl.Marker;
//     }[];
//     unclimbed: {
//         peakId: string;
//         marker: mapboxgl.Marker;
//     }[];
//     favorite: {
//         peakId: string;
//         marker: mapboxgl.Marker;
//     }[];
//     popups: {
//         peakId: string;
//         popup: mapboxgl.Popup;
//     }[];
// }

// const usePeaksMapState = () =>
//     useState<PeaksMapState>({
//         map: null,
//         completed: [],
//         unclimbed: [],
//         favorite: [],
//         popups: [],
//     });

// export const PeaksMapContext = createContext<ReturnType<
//     typeof usePeaksMapState
// > | null>(null);

// export const usePeaksMap = () => {
//     const context = React.useContext(PeaksMapContext);
//     if (!context) {
//         throw new Error("usePeaksMap must be used within a PeaksMapProvider");
//     }
//     return context;
// };

// const PeaksMapProvider = ({ children }: { children: React.ReactNode }) => {
//     const [state, setState] = usePeaksMapState();

//     return (
//         <PeaksMapContext.Provider value={[state, setState]}>
//             {children}
//         </PeaksMapContext.Provider>
//     );
// };

// export default PeaksMapProvider;
