"use client";

import React from "react";
import { Compass } from "lucide-react";

export const ExploreEmptyContent = () => {
    return (
        <div className="text-center py-10 px-4">
            <Compass className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-foreground font-medium">Explore the map</p>
            <p className="text-sm text-muted-foreground mt-1">
                Pan and zoom to discover peaks and challenges
            </p>
        </div>
    );
};


