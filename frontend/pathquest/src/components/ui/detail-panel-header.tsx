"use client";

import React from "react";
import { X, MapPin, LucideIcon } from "lucide-react";

interface Badge {
    icon: LucideIcon;
    label: string;
    colorClass?: string; // e.g., "text-primary", "text-secondary"
}

interface DetailPanelHeaderProps {
    badge: Badge;
    title: string;
    subtitle?: string;
    location?: string;
    onClose?: () => void;
    showCloseButton?: boolean;
    gradientColorClass?: string; // e.g., "from-accent/10", "from-secondary/10"
    compact?: boolean;
}

const DetailPanelHeader = ({
    badge,
    title,
    subtitle,
    location,
    onClose,
    showCloseButton = true,
    gradientColorClass = "from-accent/10",
    compact = false,
}: DetailPanelHeaderProps) => {
    const BadgeIcon = badge.icon;
    const colorClass = badge.colorClass || "text-primary";

    if (compact) {
        return (
            <div className="relative">
                {showCloseButton && onClose && (
                    <button
                        onClick={onClose}
                        className="absolute top-0 right-0 p-2 rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Close details"
                        tabIndex={0}
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}

                <div className={`flex items-center gap-2 mb-2 ${colorClass}`}>
                    <span className="px-2 py-1 rounded-full border border-border/70 bg-muted/60 text-[11px] font-mono uppercase tracking-[0.18em] flex items-center gap-1">
                        <BadgeIcon className="w-3.5 h-3.5" />
                        {badge.label}
                    </span>
                </div>

                <h1
                    className="text-xl font-bold text-foreground pr-8"
                    style={{ fontFamily: "var(--font-display)" }}
                >
                    {title}
                </h1>
                {location && (
                    <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="text-xs">{location}</span>
                    </div>
                )}
                {subtitle && !location && (
                    <div className="mt-1 text-xs text-muted-foreground">{subtitle}</div>
                )}
            </div>
        );
    }

    return (
        <div className={`p-5 border-b border-border/60 bg-gradient-to-b ${gradientColorClass} to-transparent relative`}>
            {showCloseButton && onClose && (
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Close details"
                    tabIndex={0}
                >
                    <X className="w-4 h-4" />
                </button>
            )}

            <div className={`flex items-center gap-2 mb-2 ${colorClass}`}>
                <span className="px-2 py-1 rounded-full border border-border/70 bg-muted/60 text-[11px] font-mono uppercase tracking-[0.18em] flex items-center gap-1">
                    <BadgeIcon className="w-4 h-4" />
                    {badge.label}
                </span>
            </div>

            <h1
                className="text-2xl md:text-3xl font-bold text-foreground"
                style={{ fontFamily: "var(--font-display)" }}
            >
                {title}
            </h1>
            {location && (
                <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{location}</span>
                </div>
            )}
            {subtitle && !location && (
                <div className="mt-2 text-sm text-muted-foreground">{subtitle}</div>
            )}
        </div>
    );
};

export default DetailPanelHeader;








