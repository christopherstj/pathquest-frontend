"use client";

import React from "react";
import { Shield, CheckCircle, Info, Snowflake, Sun, Compass, Shirt, Footprints, Wrench } from "lucide-react";
import type { GearRecommendations, GearItem, GearPriority } from "@pathquest/shared/types";
import { cn } from "@/lib/utils";

interface GearSectionProps {
    gear: GearRecommendations;
    className?: string;
}

const priorityConfig: Record<GearPriority, {
    icon: typeof Shield;
    color: string;
    bg: string;
    borderColor: string;
    label: string;
}> = {
    required: {
        icon: Shield,
        color: "text-red-400",
        bg: "bg-red-500/8",
        borderColor: "border-red-500/25",
        label: "Required",
    },
    recommended: {
        icon: CheckCircle,
        color: "text-amber-400",
        bg: "bg-amber-500/8",
        borderColor: "border-amber-500/20",
        label: "Recommended",
    },
    optional: {
        icon: Info,
        color: "text-blue-400",
        bg: "bg-blue-500/8",
        borderColor: "border-blue-500/15",
        label: "Optional",
    },
};

const priorityOrder: GearPriority[] = ["required", "recommended", "optional"];

/** Pick a contextual icon based on gear category */
const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes("snow") || cat.includes("ice") || cat.includes("traction")) return Snowflake;
    if (cat.includes("sun") || cat.includes("protect")) return Sun;
    if (cat.includes("nav")) return Compass;
    if (cat.includes("cloth") || cat.includes("layer") || cat.includes("insul")) return Shirt;
    if (cat.includes("foot") || cat.includes("boot")) return Footprints;
    return Wrench;
};

const GearItemCard = ({ item }: { item: GearItem }) => {
    const config = priorityConfig[item.priority];
    const CategoryIcon = getCategoryIcon(item.category);

    return (
        <div className={cn(
            "flex items-start gap-2.5 p-2 rounded-md border",
            config.bg, config.borderColor
        )}>
            <CategoryIcon className={cn("w-3.5 h-3.5 mt-0.5 shrink-0", config.color)} />
            <div className="flex-1 min-w-0">
                <span className="text-xs font-medium text-foreground">
                    {item.name}
                </span>
                <p className="text-[10px] text-foreground/60 leading-snug mt-0.5">
                    {item.reason}
                </p>
            </div>
        </div>
    );
};

const GearSection = ({ gear, className }: GearSectionProps) => {
    if (!gear.items || gear.items.length === 0) return null;

    const grouped = priorityOrder
        .map((p) => ({ priority: p, items: gear.items.filter((i) => i.priority === p) }))
        .filter((g) => g.items.length > 0);

    return (
        <div className={cn("rounded-lg bg-card border border-border/70 overflow-hidden", className)}>
            {/* Header with count */}
            <div className="flex items-center justify-between px-3 pt-3 pb-2">
                <h4 className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    Gear Recommendations
                </h4>
                <div className="flex items-center gap-1.5">
                    {grouped.map(({ priority, items }) => {
                        const config = priorityConfig[priority];
                        return (
                            <span
                                key={priority}
                                className={cn(
                                    "text-[9px] font-mono px-1.5 py-0.5 rounded-full",
                                    config.bg, config.color, "border", config.borderColor
                                )}
                                title={`${items.length} ${config.label.toLowerCase()}`}
                            >
                                {items.length}
                            </span>
                        );
                    })}
                </div>
            </div>

            {/* Gear items grouped by priority */}
            <div className="px-3 pb-3 space-y-3">
                {grouped.map(({ priority, items }) => {
                    const config = priorityConfig[priority];
                    return (
                        <div key={priority}>
                            <div className="flex items-center gap-1.5 mb-1.5">
                                <config.icon className={cn("w-3 h-3", config.color)} />
                                <span className={cn("text-[9px] font-medium uppercase tracking-wider", config.color)}>
                                    {config.label}
                                </span>
                            </div>
                            <div className="space-y-1.5">
                                {items.map((item, i) => (
                                    <GearItemCard key={i} item={item} />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

        </div>
    );
};

export default GearSection;
