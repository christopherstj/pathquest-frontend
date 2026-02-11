"use client";

import React from "react";
import Link from "next/link";
import {
    Calendar,
    Mountain,
    User,
    FileText,
    MapPin,
    ArrowLeft,
} from "lucide-react";
import { format } from "date-fns";
import type { PublicActivity } from "@pathquest/shared/types";
import metersToFt from "@/helpers/metersToFt";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const CONDITION_TAG_LABELS: Record<string, { label: string; emoji: string }> = {
    clear: { label: "Clear", emoji: "☀️" },
    dry: { label: "Dry", emoji: "🏜️" },
    wet: { label: "Wet", emoji: "💧" },
    mud: { label: "Muddy", emoji: "🌧️" },
    snow: { label: "Snowy", emoji: "❄️" },
    ice: { label: "Icy", emoji: "🧊" },
    windy: { label: "Windy", emoji: "💨" },
    foggy: { label: "Foggy", emoji: "🌫️" },
    rocky: { label: "Rocky", emoji: "🪨" },
    slippery: { label: "Slippery", emoji: "⚠️" },
    exposed: { label: "Exposed", emoji: "🏔️" },
    overgrown: { label: "Overgrown", emoji: "🌿" },
    bushwhack: { label: "Bushwhack", emoji: "🌲" },
    postholing: { label: "Postholing", emoji: "🦶" },
};

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface PublicActivityPageProps {
    activity: PublicActivity;
}

const PublicActivityPage = ({ activity }: PublicActivityPageProps) => {
    // Format the date
    const formattedDate = React.useMemo(() => {
        try {
            return format(new Date(activity.start_time), "MMMM d, yyyy");
        } catch {
            return "";
        }
    }, [activity.start_time]);

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">PathQuest</span>
                    </Link>
                    
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <FileText className="w-4 h-4 text-summited" />
                        <span className="text-xs font-medium uppercase tracking-wider">Trip Report</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-3xl mx-auto px-4 py-8">
                <article className="space-y-8">
                    {/* Title & Meta */}
                    <div className="space-y-4">
                        {activity.display_title && (
                            <h1 
                                className="text-3xl md:text-4xl font-bold text-foreground"
                                style={{ fontFamily: "var(--font-display)" }}
                            >
                                {activity.display_title}
                            </h1>
                        )}

                        {/* Meta info */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            {formattedDate && (
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4" />
                                    <span>{formattedDate}</span>
                                </div>
                            )}
                            
                            {activity.user && (
                                <Link 
                                    href={`/users/${activity.user.id}`}
                                    className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                                >
                                    {activity.user.avatar ? (
                                        <img 
                                            src={activity.user.avatar} 
                                            alt={activity.user.name}
                                            className="w-5 h-5 rounded-full"
                                        />
                                    ) : (
                                        <User className="w-4 h-4" />
                                    )}
                                    <span>{activity.user.name}</span>
                                </Link>
                            )}
                        </div>

                        {/* Condition tags */}
                        {activity.condition_tags && activity.condition_tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {activity.condition_tags.map((tag) => {
                                    const tagInfo = CONDITION_TAG_LABELS[tag] || { label: tag, emoji: "📍" };
                                    return (
                                        <span
                                            key={tag}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-summited/10 text-summited text-sm"
                                        >
                                            <span>{tagInfo.emoji}</span>
                                            <span>{tagInfo.label}</span>
                                        </span>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Trip Report */}
                    {activity.trip_report && (
                        <div className="prose prose-neutral dark:prose-invert max-w-none">
                            <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                                {activity.trip_report}
                            </p>
                        </div>
                    )}

                    {/* Summits */}
                    {activity.summits && activity.summits.length > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Mountain className="w-5 h-5 text-summited" />
                                <h2 className="text-lg font-semibold text-foreground">
                                    Summits ({activity.summits.length})
                                </h2>
                            </div>

                            <div className="grid gap-3">
                                {activity.summits.map((summit) => (
                                    <Link
                                        key={summit.id}
                                        href={`/peaks/${summit.peak.id}`}
                                        className={cn(
                                            "p-4 rounded-xl border border-border bg-card",
                                            "hover:bg-card/80 hover:border-summited/30 transition-colors"
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-1">
                                                <h3 className="font-semibold text-foreground">
                                                    {summit.peak.name}
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                                    {summit.peak.elevation && (
                                                        <span>{Math.round(metersToFt(summit.peak.elevation)).toLocaleString()} ft</span>
                                                    )}
                                                    {summit.peak.state && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="flex items-center gap-1">
                                                                <MapPin className="w-3 h-3" />
                                                                {summit.peak.state}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                                
                                                {/* Summit notes */}
                                                {summit.notes && (
                                                    <p className="mt-2 text-sm text-muted-foreground">
                                                        {summit.notes}
                                                    </p>
                                                )}
                                                
                                                {/* Difficulty badge */}
                                                {summit.difficulty && (
                                                    <span className={cn(
                                                        "inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium",
                                                        summit.difficulty === "easy" && "bg-green-500/10 text-green-600",
                                                        summit.difficulty === "moderate" && "bg-amber-500/10 text-amber-600",
                                                        summit.difficulty === "hard" && "bg-orange-500/10 text-orange-600",
                                                        summit.difficulty === "expert" && "bg-red-500/10 text-red-600",
                                                    )}>
                                                        {summit.difficulty.charAt(0).toUpperCase() + summit.difficulty.slice(1)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* CTA */}
                    <div className="pt-8 border-t border-border">
                        <div className="text-center space-y-4">
                            <p className="text-muted-foreground">
                                Track your own summits and share trip reports with PathQuest
                            </p>
                            <Button asChild>
                                <Link href="/">
                                    Get Started
                                </Link>
                            </Button>
                        </div>
                    </div>
                </article>
            </main>

            {/* Footer */}
            <footer className="border-t border-border mt-16 py-8">
                <div className="max-w-3xl mx-auto px-4 text-center text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} PathQuest. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default PublicActivityPage;
