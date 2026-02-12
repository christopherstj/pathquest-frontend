"use client";

import React from "react";
import { Mountain, Plus, Navigation, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import metersToFt from "@/helpers/metersToFt";
import Peak from "@/typeDefs/Peak";
import Challenge from "@/typeDefs/Challenge";
import Summit from "@/typeDefs/Summit";
import ConditionsDashboard from "@/components/peaks/ConditionsDashboard";
import DiscoveryChallengesList from "@/components/discovery/discovery-challenges-list";
import ChallengeProgress from "@/typeDefs/ChallengeProgress";
import { useRouter } from "next/navigation";
import useRequireAuth, { useIsAuthenticated } from "@/hooks/useRequireAuth";
import { useManualSummitStore } from "@/providers/ManualSummitProvider";

interface PeakDetailsMobileProps {
    peak: Peak;
    challenges?: Challenge[] | null;
    publicSummits?: Summit[] | null;
    onClose: () => void;
    onFlyToPeak: () => void;
}

const PeakDetailsMobile = ({
    peak,
    challenges,
    publicSummits,
    onFlyToPeak,
}: PeakDetailsMobileProps) => {
    const router = useRouter();
    const { isAuthenticated } = useIsAuthenticated();
    const requireAuth = useRequireAuth();
    const openManualSummit = useManualSummitStore((state) => state.openManualSummit);
    const location = [peak.county, peak.state, peak.country].filter(Boolean).join(", ");

    const handleLogSummit = () => {
        if (!isAuthenticated) {
            requireAuth(() => {});
            return;
        }
        openManualSummit({
            peakId: peak.id,
            peakName: peak.name || "Unknown Peak",
            peakCoords: peak.location_coords || [0, 0],
        });
    };

    // Convert Challenge[] to ChallengeProgress[] for DiscoveryChallengesList
    // The API returns num_completed for logged-in users, but it's not in the Challenge type
    const challengesWithProgress: ChallengeProgress[] = challenges
        ? challenges.map((challenge) => ({
              ...challenge,
              total: challenge.num_peaks || 0,
              completed: (challenge as any).num_completed || 0,
          }))
        : [];

    const handleChallengeClick = (id: string) => {
        router.push(`/challenges/${id}`);
    };

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="relative">
                <div className="flex items-center gap-2 mb-2 text-primary">
                    <span className="px-2 py-1 rounded-full border border-border/70 bg-muted/60 text-[11px] font-mono uppercase tracking-[0.18em] flex items-center gap-1">
                        <Mountain className="w-3.5 h-3.5" />
                        Peak
                    </span>
                </div>

                <h1
                    className="text-xl font-bold text-foreground"
                    style={{ fontFamily: "var(--font-display)" }}
                >
                    {peak.name}
                </h1>
                {location && (
                    <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5" />
                        <span className="text-xs">{location}</span>
                    </div>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-card border border-border/70">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
                        Elevation
                    </p>
                    <p className="text-lg font-mono text-foreground">
                        {peak.elevation
                            ? Math.round(metersToFt(peak.elevation)).toLocaleString()
                            : 0}{" "}
                        ft
                    </p>
                </div>
                <div className="p-3 rounded-xl bg-card border border-border/70">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
                        Summits
                    </p>
                    <p className="text-lg font-mono text-foreground">
                        {peak.public_summits || publicSummits?.length || 0}
                    </p>
                </div>
            </div>

            {/* Conditions */}
            <ConditionsDashboard peak={peak} variant="inline" />

            {/* Actions */}
            <div className="flex gap-2">
                <Button 
                    onClick={handleLogSummit}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-2 h-9 text-sm"
                >
                    <Plus className="w-3.5 h-3.5" />
                    Log Summit
                </Button>
                <Button
                    variant="outline"
                    onClick={onFlyToPeak}
                    className="flex-1 gap-2 h-9 text-sm border-primary/20 hover:bg-primary/10"
                >
                    <Navigation className="w-3.5 h-3.5" />
                    Fly to Peak
                </Button>
            </div>

            {/* Challenges */}
            {challenges && challenges.length > 0 && (
                <DiscoveryChallengesList
                    challenges={challengesWithProgress}
                    onChallengeClick={handleChallengeClick}
                    title={`Part of ${challenges.length} Challenge${challenges.length !== 1 ? "s" : ""}`}
                    compact
                />
            )}
        </div>
    );
};

export default PeakDetailsMobile;


