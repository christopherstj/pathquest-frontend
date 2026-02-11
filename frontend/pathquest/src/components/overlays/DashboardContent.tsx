"use client";

import React, { useEffect } from "react";
import {
    Trophy,
    Loader2,
    Calendar,
    LogIn,
    Users,
    BarChart3,
} from "lucide-react";
import Logo from "@/components/brand/Logo";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useIsAuthenticated } from "@/hooks/useRequireAuth";
import { useAuthModalStore } from "@/providers/AuthModalProvider";
import { useOnboardingStore } from "@/providers/OnboardingProvider";
import dayjs from "@/helpers/dayjs";
import ManualPeakSummit from "@/typeDefs/ManualPeakSummit";
import Peak from "@/typeDefs/Peak";
import ChallengeProgress from "@/typeDefs/ChallengeProgress";
import DashboardStats from "@/typeDefs/DashboardStats";
import UnconfirmedSummit from "@/typeDefs/UnconfirmedSummit";
import { QuickStatsBar, HeroSummitCard, UnreviewedSummitsQueue, ProcessingToast, UnconfirmedSummitsCard, ImportProgressCard, ImportStatus } from "@/components/dashboard";
import UnreviewedActivitiesCard from "@/components/dashboard/UnreviewedActivitiesCard";
import type { UnreviewedActivity } from "@pathquest/shared/types";
import { OnboardingModal } from "@/components/onboarding";
import PublicSummitCard, { PublicSummitCardSummit } from "@/components/summits/PublicSummitCard";
import ChallengeLinkItem from "@/components/lists/challenge-link-item";

// Fetch recent summits from API route instead of server action
const fetchRecentSummits = async (): Promise<(Peak & ManualPeakSummit)[] | null> => {
    const res = await fetch("/api/dashboard/recent-summits", {
        credentials: "include",
    });
    if (!res.ok) {
        console.error("Failed to fetch recent summits:", res.status);
        return null;
    }
    return res.json();
};

// Fetch favorite challenges from API route instead of server action
const fetchFavoriteChallenges = async (): Promise<ChallengeProgress[]> => {
    const res = await fetch("/api/dashboard/favorite-challenges", {
        credentials: "include",
    });
    if (!res.ok) {
        console.error("Failed to fetch favorite challenges:", res.status);
        return [];
    }
    return res.json();
};

// Fetch queue status (activities waiting to be processed)
const fetchQueueStatus = async (): Promise<{ numProcessing: number }> => {
    const res = await fetch("/api/dashboard/queue-status", {
        credentials: "include",
    });
    if (!res.ok) {
        console.error("Failed to fetch queue status:", res.status);
        return { numProcessing: 0 };
    }
    return res.json();
};

// Fetch import status (detailed progress for historical import)
const fetchImportStatus = async (): Promise<ImportStatus | null> => {
    const res = await fetch("/api/dashboard/import-status", {
        credentials: "include",
    });
    if (!res.ok) {
        console.error("Failed to fetch import status:", res.status);
        return null;
    }
    return res.json();
};

// Fetch dashboard stats
const fetchDashboardStats = async (): Promise<DashboardStats | null> => {
    const res = await fetch("/api/dashboard/stats", {
        credentials: "include",
    });
    if (!res.ok) {
        console.error("Failed to fetch dashboard stats:", res.status);
        return null;
    }
    return res.json();
};

// Fetch unconfirmed summits (limit to 3 for dashboard card)
const fetchUnconfirmedSummits = async (): Promise<UnconfirmedSummit[]> => {
    const res = await fetch("/api/summits/unconfirmed?limit=10", {
        credentials: "include",
    });
    if (!res.ok) {
        console.error("Failed to fetch unconfirmed summits:", res.status);
        return [];
    }
    return res.json();
};

// Fetch unreviewed activities (activities needing trip reports)
const fetchUnreviewedActivities = async (): Promise<UnreviewedActivity[]> => {
    const res = await fetch("/api/activities/unreviewed?limit=5", {
        credentials: "include",
    });
    if (!res.ok) {
        console.error("Failed to fetch unreviewed activities:", res.status);
        return [];
    }
    return res.json();
};

// Fetch recent public summits for guest landing
const fetchRecentPublicSummits = async (): Promise<PublicSummitCardSummit[]> => {
    const res = await fetch("/api/landing/recent-public-summits?limit=5", {
        credentials: "include",
    });
    if (!res.ok) {
        console.error("Failed to fetch recent public summits:", res.status);
        return [];
    }
    return res.json();
};

type PopularChallenge = {
    id: string | number;
    name: string;
    region?: string;
    num_peaks?: number;
};

// Fetch popular challenges for guest landing
const fetchPopularChallenges = async (): Promise<PopularChallenge[]> => {
    const res = await fetch("/api/landing/popular-challenges?limit=6", {
        credentials: "include",
    });
    if (!res.ok) {
        console.error("Failed to fetch popular challenges:", res.status);
        return [];
    }
    return res.json();
};

type DashboardContentProps = {
    isActive?: boolean;
    showHeader?: boolean;
};

type HomeSubTab = "dashboard" | "recent";

const HOME_SUBTAB_STORAGE_KEY = "pathquest:homeSubTab";

type RecentFeedContentProps = {
    recentPublicSummits: PublicSummitCardSummit[] | undefined;
    publicSummitsLoading: boolean;
    popularChallenges: PopularChallenge[] | undefined;
    popularChallengesLoading: boolean;
};

const RecentFeedContent = ({
    recentPublicSummits,
    publicSummitsLoading,
    popularChallenges,
    popularChallengesLoading,
}: RecentFeedContentProps) => {
    return (
        <>
            {/* Community feed */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-secondary" />
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Recent community summits
                    </h3>
                </div>

                {publicSummitsLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="h-28 rounded-xl bg-card/50 animate-pulse"
                            />
                        ))}
                    </div>
                ) : recentPublicSummits && recentPublicSummits.length > 0 ? (
                    <div className="space-y-3">
                        {recentPublicSummits.slice(0, 5).map((summit) => (
                            <PublicSummitCard
                                key={summit.id}
                                summit={summit}
                                showPeakHeader
                            />
                        ))}
                    </div>
                ) : (
                    <div className="p-6 rounded-lg bg-card/50 border border-border/50 text-center">
                        <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                            No public summits yet
                        </p>
                    </div>
                )}
            </div>

            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-secondary" />
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Popular challenges
                    </h3>
                </div>

                {popularChallengesLoading ? (
                    <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="h-16 rounded-lg bg-card/50 animate-pulse"
                            />
                        ))}
                    </div>
                ) : popularChallenges && popularChallenges.length > 0 ? (
                    <div className="space-y-2">
                        {popularChallenges.slice(0, 6).map((challenge) => (
                            <ChallengeLinkItem
                                key={String(challenge.id)}
                                challenge={challenge}
                                showProgress={false}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="p-6 rounded-lg bg-card/50 border border-border/50 text-center">
                        <Trophy className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                            No challenges yet
                        </p>
                    </div>
                )}
            </div>
        </>
    );
};

const DashboardContent = ({ isActive = true, showHeader = false }: DashboardContentProps) => {
    const { isAuthenticated, isLoading: authLoading, user } = useIsAuthenticated();
    const openLoginModal = useAuthModalStore((state) => state.openLoginModal);
    
    // Onboarding state
    const hasSeenOnboarding = useOnboardingStore((s) => s.hasSeenOnboarding);
    const showOnboardingModal = useOnboardingStore((s) => s.showOnboardingModal);
    const isOnboardingInitialized = useOnboardingStore((s) => s.isInitialized);
    const openOnboarding = useOnboardingStore((s) => s.openOnboarding);
    const completeOnboarding = useOnboardingStore((s) => s.completeOnboarding);

    const [homeSubTab, setHomeSubTab] = React.useState<HomeSubTab>("dashboard");

    React.useEffect(() => {
        if (!isAuthenticated) return;
        try {
            const stored = window.localStorage.getItem(HOME_SUBTAB_STORAGE_KEY);
            if (stored === "dashboard" || stored === "recent") {
                setHomeSubTab(stored);
            } else {
                setHomeSubTab("dashboard");
            }
        } catch {
            setHomeSubTab("dashboard");
        }
    }, [isAuthenticated]);

    React.useEffect(() => {
        if (!isAuthenticated) return;
        try {
            window.localStorage.setItem(HOME_SUBTAB_STORAGE_KEY, homeSubTab);
        } catch {
            // ignore
        }
    }, [isAuthenticated, homeSubTab]);

    // Only fetch when active; gate authed dashboard fetches behind the Dashboard sub-tab.
    const shouldFetchDashboard = isAuthenticated && isActive && homeSubTab === "dashboard";

    // Recent feed should load for guests and for authed users on the Recent sub-tab.
    const shouldFetchRecentFeed =
        isActive &&
        !authLoading &&
        (!isAuthenticated || (isAuthenticated && homeSubTab === "recent"));

    const { data: recentSummits } = useQuery({
        queryKey: ["recentSummits"],
        queryFn: fetchRecentSummits,
        enabled: shouldFetchDashboard,
        staleTime: 30000,
    });

    const { data: favoriteChallenges, isLoading: challengesLoading } = useQuery({
        queryKey: ["favoriteChallenges"],
        queryFn: fetchFavoriteChallenges,
        enabled: shouldFetchDashboard,
        staleTime: 30000,
    });

    const { data: dashboardStats, isLoading: statsLoading } = useQuery({
        queryKey: ["dashboardStats"],
        queryFn: fetchDashboardStats,
        enabled: shouldFetchDashboard,
        staleTime: 30000,
    });

    // Queue status with polling - refetch every 10 seconds when there are items processing
    const { data: queueStatus } = useQuery({
        queryKey: ["queueStatus"],
        queryFn: fetchQueueStatus,
        enabled: shouldFetchDashboard,
        staleTime: 5000,
        refetchInterval: (query) => {
            // Poll every 10 seconds if there are activities processing
            const numProcessing = query.state.data?.numProcessing ?? 0;
            return numProcessing > 0 ? 10000 : 30000;
        },
    });

    // Import status with polling - detailed progress for historical imports
    const { data: importStatus } = useQuery({
        queryKey: ["importStatus"],
        queryFn: fetchImportStatus,
        enabled: shouldFetchDashboard,
        staleTime: 10000,
        refetchInterval: (query) => {
            // Poll every 15 seconds if there are activities being imported
            const status = query.state.data?.status;
            return status === "processing" ? 15000 : 60000;
        },
    });

    // Fetch unconfirmed summits that need review
    const { data: unconfirmedSummits } = useQuery({
        queryKey: ["unconfirmedSummits"],
        queryFn: fetchUnconfirmedSummits,
        enabled: shouldFetchDashboard,
        staleTime: 30000,
    });

    // Fetch unreviewed activities that need trip reports
    const { data: unreviewedActivities } = useQuery({
        queryKey: ["unreviewedActivities"],
        queryFn: fetchUnreviewedActivities,
        enabled: shouldFetchDashboard,
        staleTime: 30000,
    });

    const { data: recentPublicSummits, isLoading: publicSummitsLoading } = useQuery({
        queryKey: ["landingRecentPublicSummits"],
        queryFn: fetchRecentPublicSummits,
        enabled: shouldFetchRecentFeed,
        staleTime: 60000,
    });

    const { data: popularChallenges, isLoading: popularChallengesLoading } = useQuery({
        queryKey: ["landingPopularChallenges"],
        queryFn: fetchPopularChallenges,
        enabled: shouldFetchRecentFeed,
        staleTime: 60000,
    });

    // Find the most recent unreviewed summit (for hero card)
    const heroSummit = React.useMemo(() => {
        if (!recentSummits || recentSummits.length === 0) return null;
        // Find the first summit without a report
        const unreviewed = recentSummits.find(summit => {
            const hasReport = summit.hasReport || 
                (summit.notes && summit.notes.trim() !== "") || 
                summit.difficulty || 
                summit.experience_rating;
            return !hasReport;
        });
        return unreviewed || null;
    }, [recentSummits]);

    // Show onboarding modal when:
    // - User is authenticated
    // - Has not seen onboarding before
    // - Import is in progress (first time user)
    // - Onboarding store is initialized
    useEffect(() => {
        if (
            isAuthenticated &&
            !hasSeenOnboarding &&
            isOnboardingInitialized &&
            importStatus?.status === "processing"
        ) {
            openOnboarding();
        }
    }, [isAuthenticated, hasSeenOnboarding, isOnboardingInitialized, importStatus?.status, openOnboarding]);

    // Calculate time estimate for onboarding modal
    const estimatedMinutes = importStatus?.estimatedHoursRemaining 
        ? importStatus.estimatedHoursRemaining * 60 
        : undefined;

    // Show loading state while auth is loading
    if (authLoading) {
        return (
            <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
        );
    }

    // Show login prompt if not authenticated
    if (!isAuthenticated) {
        return (
            <div className="space-y-6">
                <div className="text-center py-8">
                    <Logo size={48} className="text-muted-foreground mx-auto mb-3" />
                    <p className="text-foreground font-medium">
                        Sign in to track your summits
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                        Connect Strava to log peaks and join challenges
                    </p>
                    <button
                        onClick={() => openLoginModal()}
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
                    >
                        <LogIn className="w-4 h-4" />
                        Sign In
                    </button>
                </div>

                <RecentFeedContent
                    recentPublicSummits={recentPublicSummits}
                    publicSummitsLoading={publicSummitsLoading}
                    popularChallenges={popularChallenges}
                    popularChallengesLoading={popularChallengesLoading}
                />
            </div>
        );
    }

    return (
        <div className="space-y-5">
            {/* Onboarding Modal */}
            <OnboardingModal
                open={showOnboardingModal}
                onComplete={completeOnboarding}
                totalActivities={importStatus?.totalActivities}
                estimatedMinutes={estimatedMinutes}
            />

            {/* Optional Header */}
            {showHeader && (
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Logo size={20} className="text-primary" />
                    </div>
                    <div>
                        <h1
                            className="text-xl font-bold text-foreground"
                            style={{ fontFamily: "var(--font-display)" }}
                        >
                            Your Dashboard
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {user?.name || "Explorer"}
                        </p>
                    </div>
                </div>
            )}

            {/* Home sub-tabs (authenticated) */}
            <div className="flex items-center justify-between">
                <div className="flex gap-0.5 bg-muted/50 p-0.5 rounded-lg">
                    <button
                        type="button"
                        onClick={() => setHomeSubTab("dashboard")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                            homeSubTab === "dashboard"
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                        aria-label="Dashboard"
                        aria-selected={homeSubTab === "dashboard"}
                        role="tab"
                    >
                        <BarChart3 className="w-3.5 h-3.5" />
                        Dashboard
                    </button>
                    <button
                        type="button"
                        onClick={() => setHomeSubTab("recent")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                            homeSubTab === "recent"
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                        aria-label="Recent"
                        aria-selected={homeSubTab === "recent"}
                        role="tab"
                    >
                        <Users className="w-3.5 h-3.5" />
                        Recent
                    </button>
                </div>
            </div>

            {homeSubTab === "dashboard" ? (
                <>
                    {/* Processing Toast (fixed position, doesn't take up layout space) */}
                    <ProcessingToast count={queueStatus?.numProcessing ?? 0} />

                    {/* Import Progress Card (shows when importing historical data) */}
                    {importStatus && importStatus.status === "processing" && (
                        <ImportProgressCard status={importStatus} />
                    )}

                    {/* Quick Stats Bar */}
                    <QuickStatsBar stats={dashboardStats ?? null} isLoading={statsLoading} />

                    {/* Hero Summit Card (if there's an unreviewed summit) */}
                    {heroSummit && <HeroSummitCard summit={heroSummit} />}

                    {/* Unreviewed Summits Queue (older summits without reports) */}
                    {recentSummits && recentSummits.length > 0 && (
                        <UnreviewedSummitsQueue summits={recentSummits} />
                    )}

                    {/* Unreviewed Activities Card (activities needing trip reports) */}
                    {unreviewedActivities && unreviewedActivities.length > 0 && (
                        <UnreviewedActivitiesCard activities={unreviewedActivities} />
                    )}

                    {/* Challenge Progress */}
                    <ChallengeProgressSection
                        challenges={favoriteChallenges}
                        isLoading={challengesLoading}
                    />

                    {/* Unconfirmed Summits Card (summits needing user review) - lower priority */}
                    {unconfirmedSummits && unconfirmedSummits.length > 0 && (
                        <UnconfirmedSummitsCard 
                            summits={unconfirmedSummits.slice(0, 3)} 
                            totalCount={unconfirmedSummits.length}
                        />
                    )}
                </>
            ) : (
                <RecentFeedContent
                    recentPublicSummits={recentPublicSummits}
                    publicSummitsLoading={publicSummitsLoading}
                    popularChallenges={popularChallenges}
                    popularChallengesLoading={popularChallengesLoading}
                />
            )}
        </div>
    );
};

type ChallengeProgressSectionProps = {
    challenges: ChallengeProgress[] | undefined;
    isLoading: boolean;
};

const ChallengeProgressSection = ({
    challenges,
    isLoading,
}: ChallengeProgressSectionProps) => {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-secondary" />
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Your Challenges
                </h3>
            </div>

            {isLoading ? (
                <div className="space-y-2">
                    {[1, 2].map((i) => (
                        <div
                            key={i}
                            className="h-20 rounded-lg bg-card/50 animate-pulse"
                        />
                    ))}
                </div>
            ) : challenges && challenges.length > 0 ? (
                <div className="space-y-2">
                    {challenges.slice(0, 4).map((challenge) => {
                        const progressPercent =
                            challenge.total > 0
                                ? Math.round(
                                      (challenge.completed / challenge.total) *
                                          100
                                  )
                                : 0;

                        return (
                            <Link
                                key={challenge.id}
                                href={`/challenges/${challenge.id}`}
                                className="block p-3 rounded-lg bg-card border border-border/70 hover:bg-card/80 transition-colors group"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm font-medium text-foreground truncate flex-1 mr-2">
                                        {challenge.name}
                                    </p>
                                    <span className="text-xs font-mono text-muted-foreground">
                                        {challenge.completed}/{challenge.total}
                                    </span>
                                </div>
                                <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                                    <div
                                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-500"
                                        style={{ width: `${progressPercent}%` }}
                                    />
                                </div>
                                <div className="flex items-center justify-between mt-1.5">
                                    <p className="text-xs text-muted-foreground">
                                        {progressPercent}% complete
                                        {challenge.region && ` • ${challenge.region}`}
                                    </p>
                                    {/* Last progress indicator */}
                                    {challenge.lastProgressDate && challenge.lastProgressCount && challenge.lastProgressCount > 0 && (
                                        <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                                            <Calendar className="w-3 h-3" />
                                            <span>
                                                +{challenge.lastProgressCount} on {dayjs(challenge.lastProgressDate).format("MMM D")}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            ) : (
                <div className="p-6 rounded-lg bg-card/50 border border-border/50 text-center">
                    <Trophy className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                        No challenges yet
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Favorite challenges to track your progress
                    </p>
                </div>
            )}
        </div>
    );
};

export default DashboardContent;
