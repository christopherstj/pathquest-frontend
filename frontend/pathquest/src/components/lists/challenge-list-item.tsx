"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Mountain } from "lucide-react";
import metersToFt from "@/helpers/metersToFt";
import Peak from "@/typeDefs/Peak";

interface ChallengeListItemProps {
    peak: Peak;
    showCompletionStatus?: boolean;
}

/**
 * A peak list item used in challenge detail views.
 * Shows peak name, elevation, and optional completion status.
 */
const ChallengeListItem = ({ peak, showCompletionStatus = true }: ChallengeListItemProps) => {
    const isCompleted = peak.summits && peak.summits > 0;

    return (
        <Link
            href={`/peaks/${peak.id}`}
            className="flex items-center justify-between p-3 rounded-lg bg-card border border-border/70 hover:bg-card/80 transition-colors group"
        >
            <div className="flex items-center gap-3">
                {showCompletionStatus && (
                    <Mountain
                        className={`w-4 h-4 ${
                            isCompleted ? "text-green-500" : "text-muted-foreground"
                        }`}
                    />
                )}
                <div>
                    <span className="text-sm font-medium text-foreground block">
                        {peak.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {peak.elevation
                            ? Math.round(metersToFt(peak.elevation)).toLocaleString()
                            : 0}{" "}
                        ft
                    </span>
                </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </Link>
    );
};

export default ChallengeListItem;


