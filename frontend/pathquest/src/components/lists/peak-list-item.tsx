"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface Challenge {
    id: string;
    name: string;
}

interface PeakListItemProps {
    challenge: Challenge;
}

/**
 * A challenge list item used in peak detail views.
 * Shows challenge name with navigation arrow.
 */
const PeakListItem = ({ challenge }: PeakListItemProps) => {
    return (
        <Link
            href={`/challenges/${challenge.id}`}
            className="flex items-center justify-between p-3 rounded-lg bg-card border border-border/70 hover:bg-card/80 transition-colors group"
        >
            <span className="text-sm font-medium text-foreground">{challenge.name}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </Link>
    );
};

export default PeakListItem;








