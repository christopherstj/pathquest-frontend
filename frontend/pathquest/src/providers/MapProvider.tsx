"use client";
import React, { createContext, useContext, useRef } from "react";
import { useStore } from "zustand";
import { createMapStore, type MapStore } from "@/store/mapStore";

export type MapStoreApi = ReturnType<typeof createMapStore>;

export const MapStoreContext = createContext<MapStoreApi | undefined>(
    undefined
);

type Props = {
    children: React.ReactNode;
};

const MapProvider = ({ children }: Props) => {
    const storeRef = useRef<MapStoreApi | null>(null);
    if (storeRef.current === null) {
        storeRef.current = createMapStore();
    }

    return (
        <MapStoreContext.Provider value={storeRef.current}>
            {children}
        </MapStoreContext.Provider>
    );
};

export default MapProvider;

export const useMapStore = <T,>(selector: (store: MapStore) => T): T => {
    const userStoreContext = useContext(MapStoreContext);

    if (!userStoreContext) {
        throw new Error(`useMapStore must be used within MapStoreProvider`);
    }

    return useStore(userStoreContext, selector);
};
