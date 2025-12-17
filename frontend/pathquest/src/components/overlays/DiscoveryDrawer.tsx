"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useAnimation, PanInfo, AnimatePresence } from "framer-motion";
import { Trophy, TrendingUp, Compass, LayoutDashboard, ZoomIn, Route, Users, BookOpen, Mountain } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMapStore } from "@/providers/MapProvider";
import { useRouter, usePathname } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery } from "@tanstack/react-query";
import DashboardContent from "./DashboardContent";
import PeakUserActivity from "./PeakUserActivity";
import PeakCommunity from "./PeakCommunity";
import ActivitySummitsList from "@/components/app/activities/ActivitySummitsList";
import ProfileSummitsList from "./ProfileSummitsList";
import ProfileJournal from "./ProfileJournal";
import ProfileChallenges from "./ProfileChallenges";
import PeakRow from "@/components/lists/peak-row";
import DiscoveryChallengesList from "@/components/discovery/discovery-challenges-list";
import getActivityDetails from "@/actions/activities/getActivityDetails";
import { useIsAuthenticated } from "@/hooks/useRequireAuth";
import { usePeakHoverMapEffects } from "@/hooks/use-peak-hover-map-effects";

type DrawerHeight = "collapsed" | "halfway" | "expanded";
type MobileTab = "discover" | "dashboard";
type DesktopTab = "discover" | "myActivity" | "community" | "summits" | "profilePeaks" | "profileJournal" | "profileChallenges" | "challengePeaks";

// Height values in pixels for mobile drawer snap points
const DRAWER_HEIGHTS = {
    collapsed: 60,
    halfway: typeof window !== "undefined" ? window.innerHeight * 0.45 : 400,
    expanded: typeof window !== "undefined" ? window.innerHeight - 80 : 600,
};

const DiscoveryDrawer = () => {
    const visiblePeaks = useMapStore((state) => state.visiblePeaks);
    const visibleChallenges = useMapStore((state) => state.visibleChallenges);
    const map = useMapStore((state) => state.map);
    const isZoomedOutTooFar = useMapStore((state) => state.isZoomedOutTooFar);
    const selectedPeakUserData = useMapStore((state) => state.selectedPeakUserData);
    const selectedPeakCommunityData = useMapStore((state) => state.selectedPeakCommunityData);
    const selectedChallengeData = useMapStore((state) => state.selectedChallengeData);
    const setHoveredPeakId = useMapStore((state) => state.setHoveredPeakId);
    const router = useRouter();
    const pathname = usePathname();
    const routerRef = useRef(router);
    const isMobile = useIsMobile(1024);
    const controls = useAnimation();
    const { isAuthenticated, isLoading: authLoading } = useIsAuthenticated();
    
    const [drawerHeight, setDrawerHeight] = useState<DrawerHeight>("halfway");
    const [heights, setHeights] = useState(DRAWER_HEIGHTS);
    const [activeTab, setActiveTab] = useState<MobileTab>("discover");
    const [desktopActiveTab, setDesktopActiveTab] = useState<DesktopTab>("discover");
    const [hasInitializedTab, setHasInitializedTab] = useState(false);
    const [highlightedActivityId, setHighlightedActivityId] = useState<string | null>(null);
    const [hoveredPeakCoords, setHoveredPeakCoords] = useState<[number, number] | null>(null);

    // Hook to handle peak hover map effects (show dot on map when hovering)
    usePeakHoverMapEffects({ hoverCoords: hoveredPeakCoords });

    // Detect activity from URL
    const activityMatch = pathname.match(/^\/activities\/([^\/]+)$/);
    const activityId = activityMatch?.[1] ?? null;
    const hasActivitySelected = Boolean(activityId);

    // Detect profile from URL
    const profileMatch = pathname.match(/^\/users\/([^\/]+)$/);
    const profileUserId = profileMatch?.[1] ?? null;
    const hasProfileSelected = Boolean(profileUserId);

    // Fetch activity details when activity is selected
    const { data: activityData } = useQuery({
        queryKey: ["activityDetails", activityId],
        queryFn: async () => {
            if (!activityId) return null;
            return await getActivityDetails(activityId);
        },
        enabled: Boolean(activityId),
    });

    const activitySummits = activityData?.summits ?? [];
    const isActivityOwner = activityData?.isOwner ?? false;

    // Keep router ref updated to avoid stale closure issues
    useEffect(() => {
        routerRef.current = router;
    }, [router]);

    // Check if a peak is selected (has community data - this is set for all users)
    const hasPeakSelected = Boolean(selectedPeakCommunityData);
    // Check if user has activity data (only for authenticated users)
    const hasUserActivityData = Boolean(selectedPeakUserData);
    // Check if a challenge is selected
    const hasChallengeSelected = Boolean(selectedChallengeData);

    // Set default tab to dashboard if user is authenticated (only once on mount)
    useEffect(() => {
        if (!authLoading && !hasInitializedTab) {
            if (isAuthenticated) {
                setActiveTab("dashboard");
            }
            setHasInitializedTab(true);
        }
    }, [isAuthenticated, authLoading, hasInitializedTab]);

    // Auto-switch to appropriate tab when a peak, activity, profile, or challenge is selected
    // - Profile selected: open Profile Peaks tab
    // - Peak selected + authenticated: open My Activity tab
    // - Peak selected + not authenticated: open Community tab
    // - Activity selected: open Summits tab
    // - Challenge selected: open Challenge Peaks tab
    useEffect(() => {
        if (hasProfileSelected && !isMobile) {
            setDesktopActiveTab("profilePeaks");
        } else if (hasActivitySelected && !isMobile) {
            setDesktopActiveTab("summits");
        } else if (hasChallengeSelected && !isMobile) {
            setDesktopActiveTab("challengePeaks");
        } else if (hasPeakSelected && !isMobile) {
            if (isAuthenticated) {
                setDesktopActiveTab("myActivity");
            } else {
                setDesktopActiveTab("community");
            }
        } else if (!hasPeakSelected && !hasActivitySelected && !hasProfileSelected && !hasChallengeSelected && !isMobile) {
            setDesktopActiveTab("discover");
            setHighlightedActivityId(null);
        }
    }, [hasPeakSelected, hasActivitySelected, hasProfileSelected, hasChallengeSelected, isAuthenticated, isMobile]);

    // Update heights on window resize
    useEffect(() => {
        const updateHeights = () => {
            setHeights({
                collapsed: 60,
                halfway: window.innerHeight * 0.45,
                expanded: window.innerHeight - 80,
            });
        };
        
        updateHeights();
        window.addEventListener("resize", updateHeights);
        return () => window.removeEventListener("resize", updateHeights);
    }, []);

    // Animate to new height when drawerHeight state changes
    useEffect(() => {
        if (isMobile) {
            controls.start({ height: heights[drawerHeight] });
        }
    }, [drawerHeight, heights, isMobile, controls]);

    const handlePeakClick = (id: string, coords?: [number, number]) => {
        routerRef.current.push(`/peaks/${id}`);
        if (map && coords) {
            map.flyTo({
                center: coords,
                zoom: 14,
                pitch: 60,
                essential: true
            });
        }
    };

    const handleChallengeClick = (id: string) => {
        routerRef.current.push(`/challenges/${id}`);
    };

    const handlePeakHoverStart = (peakId: string, coords: [number, number]) => {
        setHoveredPeakCoords(coords);
    };

    const handlePeakHoverEnd = () => {
        setHoveredPeakCoords(null);
    };

    const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const velocity = info.velocity.y;
        const offset = info.offset.y;
        
        // Velocity threshold for quick swipes
        const velocityThreshold = 500;
        
        // Get current height value
        const currentHeight = heights[drawerHeight];
        
        // Calculate the new height after drag
        const newHeight = currentHeight - offset;
        
        // Determine next state based on velocity and position
        if (velocity < -velocityThreshold) {
            // Quick swipe up - go to next higher state
            if (drawerHeight === "collapsed") {
                setDrawerHeight("halfway");
            } else if (drawerHeight === "halfway") {
                setDrawerHeight("expanded");
            }
        } else if (velocity > velocityThreshold) {
            // Quick swipe down - go to next lower state
            if (drawerHeight === "expanded") {
                setDrawerHeight("halfway");
            } else if (drawerHeight === "halfway") {
                setDrawerHeight("collapsed");
            }
        } else {
            // Slow drag - snap to nearest height
            const distanceToCollapsed = Math.abs(newHeight - heights.collapsed);
            const distanceToHalfway = Math.abs(newHeight - heights.halfway);
            const distanceToExpanded = Math.abs(newHeight - heights.expanded);
            
            const minDistance = Math.min(distanceToCollapsed, distanceToHalfway, distanceToExpanded);
            
            if (minDistance === distanceToCollapsed) {
                setDrawerHeight("collapsed");
            } else if (minDistance === distanceToHalfway) {
                setDrawerHeight("halfway");
            } else {
                setDrawerHeight("expanded");
            }
        }
    };

    const handleHandleClick = () => {
        // Cycle through states on tap
        if (drawerHeight === "collapsed") {
            setDrawerHeight("halfway");
        } else if (drawerHeight === "halfway") {
            setDrawerHeight("expanded");
        } else {
            setDrawerHeight("collapsed");
        }
    };

    const handleTabChange = (tab: MobileTab) => {
        setActiveTab(tab);
        // Expand drawer when switching tabs if collapsed
        if (drawerHeight === "collapsed") {
            setDrawerHeight("halfway");
        }
    };

    const handleDesktopTabChange = (tab: DesktopTab) => {
        setDesktopActiveTab(tab);
    };

    // Desktop version with tabs
    if (!isMobile) {
        // Show tabs when a peak, activity, profile, or challenge is selected
        // My Activity tab: only for authenticated users when peak selected
        // Community tab: for all users when peak selected
        // Summits tab: when activity is selected
        // Profile tabs: when profile is selected
        // Challenge Peaks tab: when challenge is selected
        const showMyActivityTab = hasPeakSelected && isAuthenticated;
        const showCommunityTab = hasPeakSelected;
        const showSummitsTab = hasActivitySelected;
        const showProfilePeaksTab = hasProfileSelected;
        const showProfileJournalTab = hasProfileSelected;
        const showProfileChallengesTab = hasProfileSelected;
        const showChallengePeaksTab = hasChallengeSelected;
        const showTabs = hasPeakSelected || hasActivitySelected || hasProfileSelected || hasChallengeSelected;
        
        // Count visible tabs to determine if we should show the tab navigation
        const visibleTabCount = [
            showMyActivityTab,
            showCommunityTab,
            showSummitsTab,
            showProfilePeaksTab,
            showProfileJournalTab,
            showProfileChallengesTab,
            showChallengePeaksTab,
        ].filter(Boolean).length;
        const hasExploreTab = !hasProfileSelected && !hasChallengeSelected;
        const totalTabs = visibleTabCount + (hasExploreTab ? 1 : 0);
        // Hide tab navigation when only challenge peaks tab is showing
        const shouldShowTabNavigation = showTabs && !(hasChallengeSelected && totalTabs === 1);

        return (
            <motion.div
                initial={{ x: -100, y: 0, opacity: 0 }}
                animate={{ x: 0, y: 0, opacity: 1 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed pointer-events-auto flex flex-col gap-3 z-40 top-20 left-5 bottom-6 w-full max-w-[320px] h-auto"
            >
                <div className="flex-1 bg-background/85 backdrop-blur-xl border border-border shadow-xl overflow-hidden flex flex-col rounded-2xl">
                    {/* Tab Header - show when a peak, activity, profile, or challenge is selected */}
                    {shouldShowTabNavigation && (
                        <div className="px-3 py-2 border-b border-border/60 shrink-0">
                            <div className="flex gap-1 bg-muted/50 p-1 rounded-lg">
                                {!hasProfileSelected && !hasChallengeSelected && (
                                    <button
                                        onClick={() => handleDesktopTabChange("discover")}
                                        onKeyDown={(e) => e.key === "Enter" && handleDesktopTabChange("discover")}
                                        tabIndex={0}
                                        aria-label="Explore tab"
                                        aria-selected={desktopActiveTab === "discover"}
                                        role="tab"
                                        className={cn(
                                            "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-md text-[10px] font-medium transition-all flex-1 justify-center",
                                            desktopActiveTab === "discover"
                                                ? "bg-background text-foreground shadow-sm"
                                                : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <Compass className="w-4 h-4" />
                                        Explore
                                    </button>
                                )}
                                {showChallengePeaksTab && (
                                    <button
                                        onClick={() => handleDesktopTabChange("challengePeaks")}
                                        onKeyDown={(e) => e.key === "Enter" && handleDesktopTabChange("challengePeaks")}
                                        tabIndex={0}
                                        aria-label="Challenge Peaks tab"
                                        aria-selected={desktopActiveTab === "challengePeaks"}
                                        role="tab"
                                        className={cn(
                                            "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-md text-[10px] font-medium transition-all flex-1 justify-center",
                                            desktopActiveTab === "challengePeaks"
                                                ? "bg-background text-foreground shadow-sm"
                                                : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <Mountain className="w-4 h-4" />
                                        Peaks
                                    </button>
                                )}
                                {showMyActivityTab && (
                                    <button
                                        onClick={() => handleDesktopTabChange("myActivity")}
                                        onKeyDown={(e) => e.key === "Enter" && handleDesktopTabChange("myActivity")}
                                        tabIndex={0}
                                        aria-label="Journal tab"
                                        aria-selected={desktopActiveTab === "myActivity"}
                                        role="tab"
                                        className={cn(
                                            "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-md text-[10px] font-medium transition-all flex-1 justify-center",
                                            desktopActiveTab === "myActivity"
                                                ? "bg-background text-foreground shadow-sm"
                                                : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <Route className="w-4 h-4" />
                                        Journal
                                    </button>
                                )}
                                {showCommunityTab && (
                                    <button
                                        onClick={() => handleDesktopTabChange("community")}
                                        onKeyDown={(e) => e.key === "Enter" && handleDesktopTabChange("community")}
                                        tabIndex={0}
                                        aria-label="Community tab"
                                        aria-selected={desktopActiveTab === "community"}
                                        role="tab"
                                        className={cn(
                                            "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-md text-[10px] font-medium transition-all flex-1 justify-center",
                                            desktopActiveTab === "community"
                                                ? "bg-background text-foreground shadow-sm"
                                                : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <Users className="w-4 h-4" />
                                        Community
                                    </button>
                                )}
                                {showSummitsTab && (
                                    <button
                                        onClick={() => handleDesktopTabChange("summits")}
                                        onKeyDown={(e) => e.key === "Enter" && handleDesktopTabChange("summits")}
                                        tabIndex={0}
                                        aria-label="Summits tab"
                                        aria-selected={desktopActiveTab === "summits"}
                                        role="tab"
                                        className={cn(
                                            "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-md text-[10px] font-medium transition-all flex-1 justify-center",
                                            desktopActiveTab === "summits"
                                                ? "bg-background text-foreground shadow-sm"
                                                : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <Mountain className="w-4 h-4" />
                                        Summits
                                    </button>
                                )}
                                {showProfilePeaksTab && (
                                    <button
                                        onClick={() => handleDesktopTabChange("profilePeaks")}
                                        onKeyDown={(e) => e.key === "Enter" && handleDesktopTabChange("profilePeaks")}
                                        tabIndex={0}
                                        aria-label="Peaks tab"
                                        aria-selected={desktopActiveTab === "profilePeaks"}
                                        role="tab"
                                        className={cn(
                                            "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-md text-[10px] font-medium transition-all flex-1 justify-center",
                                            desktopActiveTab === "profilePeaks"
                                                ? "bg-background text-foreground shadow-sm"
                                                : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <Mountain className="w-4 h-4" />
                                        Peaks
                                    </button>
                                )}
                                {showProfileJournalTab && (
                                    <button
                                        onClick={() => handleDesktopTabChange("profileJournal")}
                                        onKeyDown={(e) => e.key === "Enter" && handleDesktopTabChange("profileJournal")}
                                        tabIndex={0}
                                        aria-label="Journal tab"
                                        aria-selected={desktopActiveTab === "profileJournal"}
                                        role="tab"
                                        className={cn(
                                            "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-md text-[10px] font-medium transition-all flex-1 justify-center",
                                            desktopActiveTab === "profileJournal"
                                                ? "bg-background text-foreground shadow-sm"
                                                : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <BookOpen className="w-4 h-4" />
                                        Journal
                                    </button>
                                )}
                                {showProfileChallengesTab && (
                                    <button
                                        onClick={() => handleDesktopTabChange("profileChallenges")}
                                        onKeyDown={(e) => e.key === "Enter" && handleDesktopTabChange("profileChallenges")}
                                        tabIndex={0}
                                        aria-label="Challenges tab"
                                        aria-selected={desktopActiveTab === "profileChallenges"}
                                        role="tab"
                                        className={cn(
                                            "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-md text-[10px] font-medium transition-all flex-1 justify-center",
                                            desktopActiveTab === "profileChallenges"
                                                ? "bg-background text-foreground shadow-sm"
                                                : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <Trophy className="w-4 h-4" />
                                        Challenges
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
                        <AnimatePresence mode="wait">
                            {desktopActiveTab === "challengePeaks" && showChallengePeaksTab && selectedChallengeData ? (
                                <motion.div
                                    key="challenge-peaks"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <div className="flex items-center gap-2">
                                        <Trophy className="w-4 h-4 text-secondary" />
                                        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                                            {selectedChallengeData.peaks.length} Peaks
                                        </h2>
                                    </div>
                                    <div className="space-y-1">
                                        {[...selectedChallengeData.peaks]
                                            .sort((a, b) => (b.elevation || 0) - (a.elevation || 0))
                                            .map((peak) => (
                                                <PeakRow
                                                    key={peak.id}
                                                    peak={peak}
                                                    onPeakClick={handlePeakClick}
                                                    onHoverStart={handlePeakHoverStart}
                                                    onHoverEnd={handlePeakHoverEnd}
                                                />
                                            ))}
                                    </div>
                                </motion.div>
                            ) : desktopActiveTab === "profilePeaks" && showProfilePeaksTab && profileUserId ? (
                                <motion.div
                                    key="profile-peaks"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="h-full -m-5"
                                >
                                    <ProfileSummitsList userId={profileUserId} compact />
                                </motion.div>
                            ) : desktopActiveTab === "profileJournal" && showProfileJournalTab && profileUserId ? (
                                <motion.div
                                    key="profile-journal"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="h-full -m-5"
                                >
                                    <ProfileJournal userId={profileUserId} />
                                </motion.div>
                            ) : desktopActiveTab === "profileChallenges" && showProfileChallengesTab && profileUserId ? (
                                <motion.div
                                    key="profile-challenges"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="h-full -m-5"
                                >
                                    <ProfileChallenges userId={profileUserId} />
                                </motion.div>
                            ) : desktopActiveTab === "summits" && showSummitsTab && activityId ? (
                                <motion.div
                                    key="summits"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                >
                                    <ActivitySummitsList
                                        summits={activitySummits}
                                        activityId={activityId}
                                        onSummitHover={setHoveredPeakId}
                                        isOwner={isActivityOwner}
                                    />
                                </motion.div>
                            ) : desktopActiveTab === "myActivity" && showMyActivityTab ? (
                                <div className="-mx-2">
                                    <PeakUserActivity
                                        key="my-activity"
                                        highlightedActivityId={highlightedActivityId}
                                        onHighlightActivity={setHighlightedActivityId}
                                    />
                                </div>
                            ) : desktopActiveTab === "community" && showCommunityTab ? (
                                <div className="-mx-2">
                                    <PeakCommunity key="community" />
                                </div>
                            ) : (
                                <motion.div
                                    key="discovery"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    {/* Featured Challenges */}
                                    <DiscoveryChallengesList 
                                        challenges={visibleChallenges} 
                                        onChallengeClick={handleChallengeClick} 
                                    />

                                    {/* Trending Peaks */}
                                    {visiblePeaks.length > 0 && (
                                        <section className="pb-2">
                                            <div className="flex items-center gap-2 mb-4">
                                                <TrendingUp className="w-4 h-4 text-primary" />
                                                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Visible Peaks</h2>
                                            </div>
                                            <div className="space-y-1">
                                                {visiblePeaks.map((peak) => (
                                                    <PeakRow
                                                        key={peak.id}
                                                        peak={peak}
                                                        onPeakClick={handlePeakClick}
                                                        onHoverStart={handlePeakHoverStart}
                                                        onHoverEnd={handlePeakHoverEnd}
                                                    />
                                                ))}
                                            </div>
                                        </section>
                                    )}

                                    {visibleChallenges.length === 0 && visiblePeaks.length === 0 && (
                                        <div className="text-center py-10 text-muted-foreground">
                                            {isZoomedOutTooFar ? (
                                                <>
                                                    <ZoomIn className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
                                                    <p className="font-medium">Zoom in to explore</p>
                                                    <p className="text-sm mt-2">Zoom in on the map to see peaks and challenges in that area.</p>
                                                </>
                                            ) : (
                                                <>
                                                    <p>No peaks or challenges visible in this area.</p>
                                                    <p className="text-sm mt-2">Try moving the map or zooming out.</p>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        );
    }

    // Mobile version with draggable bottom sheet and tabs
    return (
        <motion.div
            initial={{ height: heights.halfway }}
            animate={controls}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 w-full pointer-events-auto z-40"
            style={{ touchAction: "none" }}
        >
            <div className="h-full bg-background/85 backdrop-blur-xl border border-border border-b-0 shadow-xl overflow-hidden flex flex-col rounded-t-2xl">
                {/* Drag Handle */}
                <div 
                    className="w-full flex items-center justify-center pt-3 pb-1 shrink-0 cursor-grab active:cursor-grabbing"
                    onClick={handleHandleClick}
                    onKeyDown={(e) => e.key === "Enter" && handleHandleClick()}
                    tabIndex={0}
                    role="button"
                    aria-label="Drag handle to resize drawer"
                >
                    <div className={cn(
                        "w-12 h-1.5 rounded-full transition-colors",
                        drawerHeight === "collapsed" ? "bg-primary/60" : "bg-muted-foreground/30"
                    )} />
                </div>

                {/* Header with Tabs */}
                <div className="px-4 py-2 border-b border-border/60 shrink-0">
                    <div className="flex items-center justify-between">
                        {/* Tab Navigation */}
                        <div className="flex gap-1 bg-muted/50 p-1 rounded-lg">
                            <button
                                onClick={() => handleTabChange("discover")}
                                onKeyDown={(e) => e.key === "Enter" && handleTabChange("discover")}
                                tabIndex={0}
                                aria-label="Discover tab"
                                aria-selected={activeTab === "discover"}
                                role="tab"
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                                    activeTab === "discover"
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <Compass className="w-3.5 h-3.5" />
                                Discover
                            </button>
                            <button
                                onClick={() => handleTabChange("dashboard")}
                                onKeyDown={(e) => e.key === "Enter" && handleTabChange("dashboard")}
                                tabIndex={0}
                                aria-label="Dashboard tab"
                                aria-selected={activeTab === "dashboard"}
                                role="tab"
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                                    activeTab === "dashboard"
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <LayoutDashboard className="w-3.5 h-3.5" />
                                Dashboard
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tab Content */}
                <div className={cn(
                    "flex-1 overflow-y-auto p-5 custom-scrollbar",
                    drawerHeight === "collapsed" && "overflow-hidden"
                )}>
                    <AnimatePresence mode="wait">
                        {activeTab === "discover" ? (
                            <motion.div
                                key="discover"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.15 }}
                                className="space-y-6"
                            >
                                {/* Featured Challenges */}
                                <DiscoveryChallengesList 
                                    challenges={visibleChallenges} 
                                    onChallengeClick={handleChallengeClick} 
                                />

                                {/* Trending Peaks */}
                                {visiblePeaks.length > 0 && (
                                    <section className="pb-2">
                                        <div className="flex items-center gap-2 mb-4">
                                            <TrendingUp className="w-4 h-4 text-primary" />
                                            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Visible Peaks</h2>
                                        </div>
                                        <div className="space-y-1">
                                            {visiblePeaks.map((peak) => (
                                                <PeakRow
                                                    key={peak.id}
                                                    peak={peak}
                                                    onPeakClick={handlePeakClick}
                                                    onHoverStart={handlePeakHoverStart}
                                                    onHoverEnd={handlePeakHoverEnd}
                                                />
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {visibleChallenges.length === 0 && visiblePeaks.length === 0 && (
                                    <div className="text-center py-10 text-muted-foreground">
                                        {isZoomedOutTooFar ? (
                                            <>
                                                <ZoomIn className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
                                                <p className="font-medium">Zoom in to explore</p>
                                                <p className="text-sm mt-2">Zoom in on the map to see peaks and challenges in that area.</p>
                                            </>
                                        ) : (
                                            <>
                                                <p>No peaks or challenges visible in this area.</p>
                                                <p className="text-sm mt-2">Try moving the map or zooming out.</p>
                                            </>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="dashboard"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ duration: 0.15 }}
                            >
                                <DashboardContent isActive={activeTab === "dashboard"} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};

export default DiscoveryDrawer;
