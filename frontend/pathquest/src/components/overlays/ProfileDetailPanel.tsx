/**
 * @deprecated This component is deprecated as of Phase 5B.
 * Desktop now uses DesktopNavLayout which renders ExploreTabContent for all detail views.
 * Profile details are now handled by ProfileDetailsMobile inside ExploreTabContent.
 * This file is kept for reference but is no longer imported anywhere.
 * Safe to delete after verifying the new desktop layout is working properly.
 */
"use client";

import React from "react";
import { motion } from "framer-motion";
import {
    User as UserIcon,
    Map as MapIcon,
    Mountain,
    Trophy,
    TrendingUp,
    Globe,
    Calendar,
    ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import getUserProfile from "@/actions/users/getUserProfile";
import Link from "next/link";
import metersToFt from "@/helpers/metersToFt";
import DetailPanelHeader from "@/components/ui/detail-panel-header";
import StatsGrid from "@/components/ui/stats-grid";
import StatCard from "@/components/ui/stat-card";
import DetailLoadingState from "@/components/ui/detail-loading-state";
import { useProfileMapEffects } from "@/hooks/use-profile-map-effects";

interface Props {
    userId: string;
    onClose: () => void;
}

const ProfileDetailPanel = ({ userId, onClose }: Props) => {
    const { data, isLoading } = useQuery({
        queryKey: ["userProfile", userId],
        queryFn: async () => {
            const res = await getUserProfile(userId);
            return res;
        },
    });

    const profile = data?.success ? data.data : null;
    const user = profile?.user;
    const stats = profile?.stats;
    const peaksForMap = profile?.peaksForMap;

    // Use shared map effects hook
    const { showOnMap } = useProfileMapEffects({
        userId,
        peaks: peaksForMap,
    });

    if (isLoading) {
        return <DetailLoadingState color="primary" />;
    }

    if (!profile || !user) {
        return (
            <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 100, opacity: 0 }}
                className="fixed top-20 right-3 md:right-5 bottom-6 w-[calc(100%-1.5rem)] md:w-[340px] max-w-[340px] pointer-events-auto z-40 flex flex-col gap-3"
            >
                <div className="flex-1 rounded-2xl bg-background/85 backdrop-blur-xl border border-border shadow-xl overflow-hidden flex flex-col items-center justify-center p-6">
                    <UserIcon className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Profile not found</p>
                </div>
            </motion.div>
        );
    }

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
        <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            className="fixed top-20 right-3 md:right-5 bottom-6 w-[calc(100%-1.5rem)] md:w-[340px] max-w-[340px] pointer-events-auto z-40 flex flex-col gap-3"
        >
            <div className="flex-1 rounded-2xl bg-background/85 backdrop-blur-xl border border-border shadow-xl overflow-hidden flex flex-col">
                {/* Header with user info */}
                <div className="p-5 border-b border-border/60 bg-gradient-to-b from-primary/10 to-transparent relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Close profile"
                        tabIndex={0}
                    >
                        <span className="sr-only">Close</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    <div className="flex items-center gap-2 mb-3 text-primary">
                        <span className="px-2 py-1 rounded-full border border-border/70 bg-muted/60 text-[11px] font-mono uppercase tracking-[0.18em] flex items-center gap-1">
                            <UserIcon className="w-4 h-4" />
                            Profile
                        </span>
                    </div>

                    {/* User avatar and name */}
                    <div className="flex items-center gap-4">
                        {user.pic ? (
                            <img
                                src={user.pic}
                                alt={user.name}
                                className="w-16 h-16 rounded-full border-2 border-border"
                            />
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center border-2 border-border">
                                <UserIcon className="w-8 h-8 text-muted-foreground" />
                            </div>
                        )}
                        <div>
                            <h1
                                className="text-xl font-bold text-foreground"
                                style={{ fontFamily: "var(--font-display)" }}
                            >
                                {user.name}
                            </h1>
                            {location && (
                                <p className="text-sm text-muted-foreground">{location}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {/* Stats Grid - Main accomplishments */}
                    <StatsGrid>
                        <StatCard
                            label="Peaks Summited"
                            value={stats?.totalPeaks || 0}
                        />
                        <StatCard
                            label="Total Summits"
                            value={stats?.totalSummits || 0}
                        />
                    </StatsGrid>

                    {/* Highest Peak */}
                    {stats?.highestPeak && (
                        <Link
                            href={`/peaks/${stats.highestPeak.id}`}
                            className="block p-4 rounded-xl bg-gradient-to-r from-primary/10 to-transparent border border-primary/20 hover:border-primary/40 transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Mountain className="w-5 h-5 text-primary" />
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Highest Peak</p>
                                        <p className="font-semibold text-foreground">{stats.highestPeak.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {Math.round(metersToFt(stats.highestPeak.elevation)).toLocaleString()} ft
                                        </p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-muted-foreground" />
                            </div>
                        </Link>
                    )}

                    {/* More Stats */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 rounded-lg bg-card border border-border/70">
                            <div className="flex items-center gap-2 text-secondary mb-1">
                                <Trophy className="w-4 h-4" />
                                <span className="text-xs uppercase tracking-wider">Challenges</span>
                            </div>
                            <p className="text-lg font-bold">{stats?.challengesCompleted || 0}</p>
                            <p className="text-xs text-muted-foreground">completed</p>
                        </div>
                        <div className="p-3 rounded-lg bg-card border border-border/70">
                            <div className="flex items-center gap-2 text-summited mb-1">
                                <TrendingUp className="w-4 h-4" />
                                <span className="text-xs uppercase tracking-wider">Elevation</span>
                            </div>
                            <p className="text-lg font-bold">
                                {stats?.totalElevationGained
                                    ? Math.round(metersToFt(stats.totalElevationGained)).toLocaleString()
                                    : 0}
                            </p>
                            <p className="text-xs text-muted-foreground">total ft gained</p>
                        </div>
                    </div>

                    {/* Year over Year */}
                    {(stats?.thisYearSummits || stats?.lastYearSummits) ? (
                        <div className="p-3 rounded-lg bg-card border border-border/70">
                            <div className="flex items-center gap-2 text-blue-500 mb-2">
                                <Calendar className="w-4 h-4" />
                                <span className="text-xs uppercase tracking-wider">This Year vs Last Year</span>
                            </div>
                            <div className="flex items-baseline gap-4">
                                <div>
                                    <span className="text-2xl font-bold">{stats?.thisYearSummits || 0}</span>
                                    <span className="text-sm text-muted-foreground ml-1">summits</span>
                                </div>
                                <span className="text-muted-foreground">vs</span>
                                <div>
                                    <span className="text-lg text-muted-foreground">{stats?.lastYearSummits || 0}</span>
                                    <span className="text-sm text-muted-foreground ml-1">last year</span>
                                </div>
                            </div>
                        </div>
                    ) : null}

                    {/* Locations & Peak Types */}
                    <div className="space-y-2">
                        {stats?.statesClimbed && stats.statesClimbed.length > 0 && (
                            <div className="flex items-center gap-2 text-sm">
                                <Globe className="w-4 h-4 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                    {stats.statesClimbed.length} state{stats.statesClimbed.length !== 1 ? "s" : ""}
                                    {stats.countriesClimbed && stats.countriesClimbed.length > 1 && 
                                        `, ${stats.countriesClimbed.length} countries`
                                    }
                                </span>
                            </div>
                        )}
                        {peakTypeLabel && (
                            <div className="flex items-center gap-2 text-sm">
                                <Mountain className="w-4 h-4 text-muted-foreground" />
                                <span className="text-muted-foreground">{peakTypeLabel}</span>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <Button
                        variant="outline"
                        onClick={showOnMap}
                        className="w-full gap-2 border-primary/20 hover:bg-primary/10 hover:text-primary"
                    >
                        <MapIcon className="w-4 h-4" />
                        Show All Peaks on Map
                    </Button>
                </div>
            </div>
        </motion.div>
    );
};

export default ProfileDetailPanel;

