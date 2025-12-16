"use client";

import React from "react";
import { Mountain, Plus } from "lucide-react";
import SummitWithPeak from "@/typeDefs/SummitWithPeak";
import { Button } from "@/components/ui/button";
import { useManualSummitStore } from "@/providers/ManualSummitProvider";
import SummitItem from "@/components/app/summits/SummitItem";

interface ActivitySummitsListProps {
    summits: SummitWithPeak[];
    activityId: string;
    onSummitHover?: (peakId: string | null) => void;
}

const ActivitySummitsList = ({ summits, activityId, onSummitHover }: ActivitySummitsListProps) => {
    const openManualSummit = useManualSummitStore((state) => state.openManualSummit);

    if (summits.length === 0) {
        return (
            <div className="text-center py-10">
                <Mountain className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-sm font-medium text-foreground mb-1">
                    No Summits Detected
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                    This activity didn&apos;t pass near any cataloged peaks.
                </p>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                        openManualSummit({
                            peakId: "",
                            peakName: "",
                            peakCoords: [0, 0],
                            preselectedActivityId: activityId,
                        });
                    }}
                    className="gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add Manual Summit
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Mountain className="w-4 h-4 text-green-500" />
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Summits ({summits.length})
                    </h3>
                </div>
            </div>

            <div className="space-y-3">
                {summits.map((summit) => (
                    <SummitItem 
                        key={summit.id} 
                        summit={summit} 
                        showPeakHeader={true}
                        onHoverStart={onSummitHover ? (peakId) => onSummitHover(peakId) : undefined}
                        onHoverEnd={onSummitHover ? () => onSummitHover(null) : undefined}
                    />
                ))}
            </div>

            {/* Add Manual Summit Button */}
            <Button
                variant="outline"
                size="sm"
                onClick={() => {
                    openManualSummit({
                        peakId: "",
                        peakName: "",
                        peakCoords: [0, 0],
                        preselectedActivityId: activityId,
                    });
                }}
                className="w-full gap-2"
            >
                <Plus className="w-4 h-4" />
                Log Another Summit
            </Button>
        </div>
    );
};

export default ActivitySummitsList;
