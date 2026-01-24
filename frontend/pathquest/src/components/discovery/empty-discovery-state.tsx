"use client";

import React from "react";
import { ZoomIn } from "lucide-react";

interface EmptyDiscoveryStateProps {
    isZoomedOutTooFar: boolean;
}

const EmptyDiscoveryState = ({ isZoomedOutTooFar }: EmptyDiscoveryStateProps) => {
    if (isZoomedOutTooFar) {
        return (
            <div className="text-center py-10 text-muted-foreground">
                <ZoomIn className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
                <p className="font-medium">Zoom in to explore</p>
                <p className="text-sm mt-2">
                    Zoom in on the map to see peaks and challenges in that area.
                </p>
            </div>
        );
    }

    return (
        <div className="text-center py-10 text-muted-foreground">
            <p>No peaks or challenges visible in this area.</p>
            <p className="text-sm mt-2">Try moving the map or zooming out.</p>
        </div>
    );
};

export default EmptyDiscoveryState;









