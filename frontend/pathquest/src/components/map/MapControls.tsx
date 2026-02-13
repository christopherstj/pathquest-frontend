"use client";

import React from "react";
import { Mountain, Map } from "lucide-react";
import { useMapStore } from "@/providers/MapProvider";
import { cn } from "@/lib/utils";

/**
 * MapControls - 2D/3D toggle button for the map.
 *
 * Rendered inline (not absolutely positioned) so it can be placed
 * inside GlobalNavigation beneath the search bar.
 */
const MapControls = () => {
    const is3D = useMapStore((state) => state.is3D);
    const setIs3D = useMapStore((state) => state.setIs3D);

    return (
        <button
            onClick={() => setIs3D(!is3D)}
            className={cn(
                "w-[30px] h-[30px] rounded-lg flex items-center justify-center",
                "bg-card/80 backdrop-blur-md border border-border shadow-lg",
                "hover:border-primary/30 transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-ring"
            )}
            title={is3D ? "Switch to 2D view" : "Switch to 3D view"}
            aria-label={is3D ? "Switch to 2D view" : "Switch to 3D view"}
        >
            {is3D ? (
                <Map className="w-4 h-4 text-muted-foreground" />
            ) : (
                <Mountain className="w-4 h-4 text-muted-foreground" />
            )}
        </button>
    );
};

export default MapControls;
