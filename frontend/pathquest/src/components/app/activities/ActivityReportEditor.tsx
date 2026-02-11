"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
    FileText,
    Globe,
    Lock,
    Pencil,
    X,
    Check,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import Activity from "@/typeDefs/Activity";
import updateActivityReport from "@/actions/activities/updateActivityReport";
import dismissActivityReview from "@/actions/activities/dismissActivityReview";
import type { ConditionTag } from "@pathquest/shared/types";

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const CONDITION_TAGS: { tag: ConditionTag; label: string; emoji: string }[] = [
    { tag: "clear", label: "Clear", emoji: "☀️" },
    { tag: "dry", label: "Dry", emoji: "🏜️" },
    { tag: "wet", label: "Wet", emoji: "💧" },
    { tag: "mud", label: "Muddy", emoji: "🌧️" },
    { tag: "snow", label: "Snowy", emoji: "❄️" },
    { tag: "ice", label: "Icy", emoji: "🧊" },
    { tag: "windy", label: "Windy", emoji: "💨" },
    { tag: "foggy", label: "Foggy", emoji: "🌫️" },
    { tag: "rocky", label: "Rocky", emoji: "🪨" },
    { tag: "slippery", label: "Slippery", emoji: "⚠️" },
    { tag: "exposed", label: "Exposed", emoji: "🏔️" },
    { tag: "overgrown", label: "Overgrown", emoji: "🌿" },
    { tag: "bushwhack", label: "Bushwhack", emoji: "🌲" },
    { tag: "postholing", label: "Postholing", emoji: "🦶" },
];

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface ActivityReportEditorProps {
    activity: Activity;
    peakNames?: string[];
    isOwner: boolean;
    onReportSaved?: () => void;
}

const ActivityReportEditor = ({
    activity,
    peakNames = [],
    isOwner,
    onReportSaved,
}: ActivityReportEditorProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [displayTitle, setDisplayTitle] = useState(activity.display_title || "");
    const [tripReport, setTripReport] = useState(activity.trip_report || "");
    const [conditionTags, setConditionTags] = useState<ConditionTag[]>(
        (activity.condition_tags as ConditionTag[]) || []
    );
    const [isPublic, setIsPublic] = useState(activity.trip_report_is_public ?? true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDismissing, setIsDismissing] = useState(false);

    // Reset form when activity changes
    useEffect(() => {
        setDisplayTitle(activity.display_title || "");
        setTripReport(activity.trip_report || "");
        setConditionTags((activity.condition_tags as ConditionTag[]) || []);
        setIsPublic(activity.trip_report_is_public ?? true);
        setIsEditing(false);
    }, [activity.id]);

    // Track changes
    const hasChanges =
        displayTitle !== (activity.display_title || "") ||
        tripReport !== (activity.trip_report || "") ||
        JSON.stringify(conditionTags) !== JSON.stringify((activity.condition_tags as ConditionTag[]) || []) ||
        isPublic !== (activity.trip_report_is_public ?? true);

    // Generate placeholder title
    const placeholderTitle = peakNames.length > 0
        ? `${getSportVerb(activity.sport)} up ${formatPeakNames(peakNames)}`
        : activity.title || "Add a title...";

    const toggleConditionTag = useCallback((tag: ConditionTag) => {
        setConditionTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    }, []);

    const handleSave = useCallback(async () => {
        setIsSaving(true);
        try {
            const result = await updateActivityReport(activity.id, {
                displayTitle: displayTitle || undefined,
                tripReport: tripReport || undefined,
                conditionTags: conditionTags.length > 0 ? conditionTags : undefined,
                tripReportIsPublic: isPublic,
            });

            if (result) {
                setIsEditing(false);
                onReportSaved?.();
            }
        } catch (error) {
            console.error("Failed to save activity report:", error);
        } finally {
            setIsSaving(false);
        }
    }, [activity.id, displayTitle, tripReport, conditionTags, isPublic, onReportSaved]);

    const handleDismiss = useCallback(async () => {
        setIsDismissing(true);
        try {
            const result = await dismissActivityReview(activity.id);
            if (result?.success) {
                onReportSaved?.();
            }
        } catch (error) {
            console.error("Failed to dismiss activity review:", error);
        } finally {
            setIsDismissing(false);
        }
    }, [activity.id, onReportSaved]);

    const handleCancel = useCallback(() => {
        setDisplayTitle(activity.display_title || "");
        setTripReport(activity.trip_report || "");
        setConditionTags((activity.condition_tags as ConditionTag[]) || []);
        setIsPublic(activity.trip_report_is_public ?? true);
        setIsEditing(false);
    }, [activity]);

    // Only show for owner with summits
    if (!isOwner) {
        return null;
    }

    const needsReview = !activity.is_reviewed;
    const hasExistingReport = !!(activity.trip_report || activity.display_title || (activity.condition_tags && activity.condition_tags.length > 0));

    // Collapsed view
    if (!isEditing) {
        return (
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-summited" />
                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Trip Report
                        </span>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        className="h-7 px-2.5 text-xs gap-1.5 text-summited hover:text-summited hover:bg-summited/10"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                        {hasExistingReport ? "Edit" : "Add"}
                    </Button>
                </div>

                {hasExistingReport ? (
                    <div className="space-y-2">
                        {activity.display_title && (
                            <p className="font-medium text-foreground">
                                {activity.display_title}
                            </p>
                        )}
                        {activity.trip_report && (
                            <p className="text-sm text-muted-foreground line-clamp-3">
                                {activity.trip_report}
                            </p>
                        )}
                        {activity.condition_tags && activity.condition_tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                                {activity.condition_tags.map((tag) => {
                                    const tagInfo = CONDITION_TAGS.find((t) => t.tag === tag);
                                    return (
                                        <span
                                            key={tag}
                                            className="px-2 py-0.5 rounded-md bg-summited/10 text-summited text-xs"
                                        >
                                            {tagInfo?.emoji} {tagInfo?.label || tag}
                                        </span>
                                    );
                                })}
                            </div>
                        )}
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
                            {activity.trip_report_is_public ? (
                                <>
                                    <Globe className="w-3 h-3" />
                                    Public
                                </>
                            ) : (
                                <>
                                    <Lock className="w-3 h-3" />
                                    Private
                                </>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                            {needsReview
                                ? "Add a trip report to share your experience."
                                : "No trip report yet."}
                        </p>
                        {needsReview && (
                            <Button
                                variant="link"
                                size="sm"
                                onClick={handleDismiss}
                                disabled={isDismissing}
                                className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                            >
                                {isDismissing ? (
                                    <Loader2 className="w-3 h-3 animate-spin mr-1" />
                                ) : null}
                                Skip for now
                            </Button>
                        )}
                    </div>
                )}
            </div>
        );
    }

    // Expanded editing view
    return (
        <div className="rounded-xl border border-border bg-card p-4 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-summited" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Edit Trip Report
                    </span>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCancel}
                    className="h-7 w-7"
                >
                    <X className="w-4 h-4" />
                </Button>
            </div>

            {/* Title */}
            <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Title</Label>
                <Input
                    placeholder={placeholderTitle}
                    value={displayTitle}
                    onChange={(e) => setDisplayTitle(e.target.value)}
                    maxLength={255}
                    className="h-9 text-sm"
                />
            </div>

            {/* Trip Report */}
            <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Trip Report</Label>
                <Textarea
                    placeholder="Share the story of your adventure..."
                    value={tripReport}
                    onChange={(e) => setTripReport(e.target.value)}
                    className="min-h-[120px] text-sm resize-none"
                />
            </div>

            {/* Condition Tags */}
            <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Conditions</Label>
                <div className="flex flex-wrap gap-1.5">
                    {CONDITION_TAGS.map(({ tag, label, emoji }) => {
                        const isSelected = conditionTags.includes(tag);
                        return (
                            <button
                                key={tag}
                                onClick={() => toggleConditionTag(tag)}
                                className={cn(
                                    "px-2 py-1 rounded-md border text-xs font-medium transition-colors",
                                    "flex items-center gap-1",
                                    isSelected
                                        ? "bg-summited/15 border-summited/40 text-summited"
                                        : "bg-muted/30 border-border text-foreground hover:bg-muted/50"
                                )}
                            >
                                {isSelected && <Check className="w-3 h-3" />}
                                <span>{emoji}</span>
                                <span>{label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Privacy Toggle */}
            <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                    {isPublic ? (
                        <Globe className="w-4 h-4 text-muted-foreground" />
                    ) : (
                        <Lock className="w-4 h-4 text-muted-foreground" />
                    )}
                    <div>
                        <p className="text-sm font-medium">Share publicly</p>
                        <p className="text-xs text-muted-foreground">
                            {isPublic ? "Visible on public activity page" : "Only visible to you"}
                        </p>
                    </div>
                </div>
                <Switch
                    checked={isPublic}
                    onCheckedChange={setIsPublic}
                />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
                <Button
                    variant="outline"
                    onClick={handleCancel}
                    className="flex-1"
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSave}
                    disabled={isSaving || !hasChanges}
                    className="flex-1 bg-summited hover:bg-summited/90"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Saving...
                        </>
                    ) : (
                        "Save"
                    )}
                </Button>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function getSportVerb(sport?: string | null): string {
    const mapping: Record<string, string> = {
        Run: "Run",
        TrailRun: "Run",
        Hike: "Hike",
        Ride: "Ride",
        MountainBikeRide: "Ride",
        GravelRide: "Ride",
        BackcountrySki: "Ski",
        NordicSki: "Ski",
        Snowshoe: "Snowshoe",
        Walk: "Walk",
    };
    return mapping[sport ?? ""] ?? "Hike";
}

function formatPeakNames(peakNames: string[]): string {
    if (peakNames.length === 0) return "";
    if (peakNames.length === 1) return peakNames[0];
    if (peakNames.length === 2) return `${peakNames[0]} and ${peakNames[1]}`;

    const allButLast = peakNames.slice(0, -1).join(", ");
    const last = peakNames[peakNames.length - 1];
    return `${allButLast} and ${last}`;
}

export default ActivityReportEditor;
