import { User } from "@/typeDefs/User";
import { createStore } from "zustand/vanilla";
import { useStore } from "zustand";
import { Map } from "mapbox-gl";

export type MapState = {
    map: Map | null;
};

export type MapActions = {
    setMap: (map: Map | null) => void;
};

export type MapStore = MapState & MapActions;

export const createMapStore = (preloadedState: MapState = { map: null }) => {
    return createStore<MapStore>((set) => ({
        ...preloadedState,
        setMap: (map) => set({ map }),
    }));
};
