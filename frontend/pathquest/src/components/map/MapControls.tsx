"use client";

import React from "react";
import { Mountain, Map } from "lucide-react";
import { useMapStore } from "@/providers/MapProvider";
import { cn } from "@/lib/utils";

/**
 * MapControls - Floating controls for map view options
 * 
 * Provides a 2D/3D toggle button positioned in the bottom-left corner
 * near the default Mapbox navigation controls.
 */
const MapControls = () => {
    const is3D = useMapStore((state) => state.is3D);
    const setIs3D = useMapStore((state) => state.setIs3D);

    return (
        <div className="absolute bottom-24 left-3 z-10 flex flex-col gap-2">
            {/* 2D/3D Toggle */}
            <button
                onClick={() => setIs3D(!is3D)}
                className={cn(
                    "w-[30px] h-[30px] rounded-md flex items-center justify-center",
                    "bg-white shadow-md border border-gray-200",
                    "hover:bg-gray-50 transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-primary/50"
                )}
                title={is3D ? "Switch to 2D view" : "Switch to 3D view"}
                aria-label={is3D ? "Switch to 2D view" : "Switch to 3D view"}
            >
                {is3D ? (
                    <Map className="w-4 h-4 text-gray-700" />
                ) : (
                    <Mountain className="w-4 h-4 text-gray-700" />
                )}
            </button>
        </div>
    );
};

export default MapControls;
