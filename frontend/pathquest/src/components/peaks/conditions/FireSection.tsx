"use client";

import React from "react";
import { Flame } from "lucide-react";
import type { FireProximity, NearbyFire } from "@pathquest/shared/types";
import { cn } from "@/lib/utils";

interface FireSectionProps {
    fireProximity: FireProximity;
    className?: string;
}

const getProximityStyle = (km: number | null) => {
    if (km === null) return null;
    if (km < 25) return "bg-red-900/40 border-red-500/40 text-red-200";
    if (km < 50) return "bg-orange-900/40 border-orange-500/40 text-orange-200";
    return null;
};

const FireCard = ({ fire }: { fire: NearbyFire }) => (
    <div className="flex items-start gap-2 py-1.5">
        <Flame className="w-3.5 h-3.5 text-orange-400 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-foreground truncate">{fire.name}</span>
                <span className="text-[10px] text-muted-foreground shrink-0">
                    {fire.distanceKm.toFixed(1)} km {fire.direction}
                </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                {fire.acres !== null && <span>{fire.acres.toLocaleString()} acres</span>}
                {fire.containmentPercent !== null && (
                    <span>{fire.containmentPercent}% contained</span>
                )}
            </div>
        </div>
    </div>
);

const FireSection = ({ fireProximity, className }: FireSectionProps) => {
    if (!fireProximity.nearbyFires || fireProximity.nearbyFires.length === 0) return null;

    const sorted = [...fireProximity.nearbyFires].sort((a, b) => a.distanceKm - b.distanceKm);
    const warningStyle = getProximityStyle(fireProximity.closestFireKm);

    return (
        <div className={cn("p-3 rounded-lg bg-card border border-border/70", className)}>
            <h4 className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                Nearby Fires
            </h4>

            {warningStyle && (
                <div className={cn("rounded-md p-2 mb-2 border", warningStyle)}>
                    <div className="flex items-center gap-1.5">
                        <Flame className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-xs font-medium">
                            Active fire {fireProximity.closestFireKm!.toFixed(1)} km away
                        </span>
                    </div>
                </div>
            )}

            <div className="divide-y divide-border/50">
                {sorted.map((fire, i) => (
                    <FireCard key={i} fire={fire} />
                ))}
            </div>
        </div>
    );
};

export default FireSection;
