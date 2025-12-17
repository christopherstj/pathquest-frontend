"use client";

import React from "react";
import {
    User as UserIcon,
    Map as MapIcon,
    Mountain,
    Trophy,
    TrendingUp,
    Globe,
    Calendar,
    ChevronRight,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import metersToFt from "@/helpers/metersToFt";
import User from "@/typeDefs/User";
import ProfileStats from "@/typeDefs/ProfileStats";
import ChallengeProgress from "@/typeDefs/ChallengeProgress";

interface ProfileDetailsMobileProps {
    user: User;
    stats: ProfileStats;
    acceptedChallenges: ChallengeProgress[];
    onClose: () => void;
    onShowOnMap: () => void;
}

const ProfileDetailsMobile = ({
    user,
    stats,
    acceptedChallenges,
    onClose,
    onShowOnMap,
}: ProfileDetailsMobileProps) => {
    const location = [user.city, user.state, user.country].filter(Boolean).join(", ");

    // Calculate peak type that has the most
    const getPeakTypeLabel = () => {
        if (!stats?.peakTypeBreakdown) return null;
        const types = [
            { count: stats.peakTypeBreakdown.fourteeners, label: "14ers" },
            { count: stats.peakTypeBreakdown.thirteeners, label: "13ers" },
            { count: stats.peakTypeBreakdown.twelvers, label: "12ers" },
            { count: stats.peakTypeBreakdown.elevenThousanders, label: "11ers" },
            { count: stats.peakTypeBreakdown.tenThousanders, label: "10ers" },
        ].filter(t => t.count > 0);
        
        if (types.length === 0) return null;
        const top = types.sort((a, b) => b.count - a.count).slice(0, 2);
        return top.map(t => `${t.count} ${t.label}`).join(", ");
    };

    const peakTypeLabel = getPeakTypeLabel();

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="relative">
                <button
                    onClick={onClose}
                    className="absolute top-0 right-0 p-2 rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Close profile"
                    tabIndex={0}
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2 mb-2 text-primary">
                    <span className="px-2 py-1 rounded-full border border-border/70 bg-muted/60 text-[11px] font-mono uppercase tracking-[0.18em] flex items-center gap-1">
                        <UserIcon className="w-3.5 h-3.5" />
                        Profile
                    </span>
                </div>

                {/* User avatar and name */}
                <div className="flex items-center gap-3">
                    {user.pic ? (
                        <img
                            src={user.pic}
                            alt={user.name}
                            className="w-12 h-12 rounded-full border-2 border-border"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center border-2 border-border">
                            <UserIcon className="w-6 h-6 text-muted-foreground" />
                        </div>
                    )}
                    <div className="pr-8">
                        <h1
                            className="text-lg font-bold text-foreground"
                            style={{ fontFamily: "var(--font-display)" }}
                        >
                            {user.name}
                        </h1>
                        {location && (
                            <p className="text-xs text-muted-foreground">{location}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-card border border-border/70">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
                        Peaks Summited
                    </p>
                    <p className="text-lg font-mono text-foreground">{stats?.totalPeaks || 0}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-card border border-border/70">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
                        Total Summits
                    </p>
                    <p className="text-lg font-mono text-foreground">{stats?.totalSummits || 0}</p>
                </div>
            </div>

            {/* Highest Peak */}
            {stats?.highestPeak && (
                <Link
                    href={`/peaks/${stats.highestPeak.id}`}
                    className="block p-3 rounded-xl bg-gradient-to-r from-primary/10 to-transparent border border-primary/20 hover:border-primary/40 transition-colors"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <Mountain className="w-4 h-4 text-primary" />
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Highest Peak</p>
                                <p className="font-semibold text-sm text-foreground">{stats.highestPeak.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {Math.round(metersToFt(stats.highestPeak.elevation)).toLocaleString()} ft
                                </p>
                            </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                </Link>
            )}

            {/* More Stats Grid */}
            <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg bg-card border border-border/70">
                    <div className="flex items-center gap-1.5 text-secondary mb-1">
                        <Trophy className="w-3 h-3" />
                        <span className="text-[10px] uppercase tracking-wider">Challenges</span>
                    </div>
                    <p className="text-base font-bold">{stats?.challengesCompleted || 0}</p>
                    <p className="text-[10px] text-muted-foreground">completed</p>
                </div>
                <div className="p-2.5 rounded-lg bg-card border border-border/70">
                    <div className="flex items-center gap-1.5 text-summited mb-1">
                        <TrendingUp className="w-3 h-3" />
                        <span className="text-[10px] uppercase tracking-wider">Elevation</span>
                    </div>
                    <p className="text-base font-bold">
                        {stats?.totalElevationGained
                            ? Math.round(metersToFt(stats.totalElevationGained)).toLocaleString()
                            : 0}
                    </p>
                    <p className="text-[10px] text-muted-foreground">total ft</p>
                </div>
            </div>

            {/* Year over Year */}
            {(stats?.thisYearSummits || stats?.lastYearSummits) ? (
                <div className="p-2.5 rounded-lg bg-card border border-border/70">
                    <div className="flex items-center gap-1.5 text-blue-500 mb-1.5">
                        <Calendar className="w-3 h-3" />
                        <span className="text-[10px] uppercase tracking-wider">This Year vs Last</span>
                    </div>
                    <div className="flex items-baseline gap-3">
                        <div>
                            <span className="text-xl font-bold">{stats?.thisYearSummits || 0}</span>
                            <span className="text-xs text-muted-foreground ml-1">summits</span>
                        </div>
                        <span className="text-muted-foreground text-xs">vs</span>
                        <div>
                            <span className="text-base text-muted-foreground">{stats?.lastYearSummits || 0}</span>
                            <span className="text-xs text-muted-foreground ml-1">last year</span>
                        </div>
                    </div>
                </div>
            ) : null}

            {/* Locations & Peak Types */}
            <div className="space-y-1.5">
                {stats?.statesClimbed && stats.statesClimbed.length > 0 && (
                    <div className="flex items-center gap-2 text-xs">
                        <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground">
                            {stats.statesClimbed.length} state{stats.statesClimbed.length !== 1 ? "s" : ""}
                            {stats.countriesClimbed && stats.countriesClimbed.length > 1 && 
                                `, ${stats.countriesClimbed.length} countries`
                            }
                        </span>
                    </div>
                )}
                {peakTypeLabel && (
                    <div className="flex items-center gap-2 text-xs">
                        <Mountain className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground">{peakTypeLabel}</span>
                    </div>
                )}
            </div>

            {/* Actions */}
            <Button
                variant="outline"
                onClick={onShowOnMap}
                className="w-full gap-2 h-9 text-sm border-primary/20 hover:bg-primary/10 hover:text-primary"
            >
                <MapIcon className="w-3.5 h-3.5" />
                Show All Peaks on Map
            </Button>

            {/* Accepted Challenges Section */}
            {acceptedChallenges && acceptedChallenges.length > 0 && (
                <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Accepted Challenges ({acceptedChallenges.length})
                    </h3>
                    <div className="space-y-1.5 max-h-[150px] overflow-y-auto custom-scrollbar">
                        {acceptedChallenges.slice(0, 5).map((challenge) => {
                            const progress = challenge.total > 0
                                ? Math.round((challenge.completed / challenge.total) * 100)
                                : 0;
                            return (
                                <Link
                                    key={challenge.id}
                                    href={`/challenges/${challenge.id}`}
                                    className="block p-2.5 rounded-lg bg-card border border-border/70 hover:bg-card/80 transition-colors"
                                >
                                    <div className="flex items-center justify-between mb-1.5">
                                        <div className="flex items-center gap-1.5">
                                            <Trophy className="w-3 h-3 text-secondary" />
                                            <span className="text-xs font-medium text-foreground">
                                                {challenge.name}
                                            </span>
                                        </div>
                                        <span className="text-[10px] text-muted-foreground">
                                            {challenge.completed}/{challenge.total}
                                        </span>
                                    </div>
                                    <div className="h-1 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-secondary to-primary rounded-full"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileDetailsMobile;

