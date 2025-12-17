"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, useAnimation, PanInfo, AnimatePresence } from "framer-motion";
import { Mountain, LayoutDashboard, Compass, RefreshCw, Route, Users, BarChart3, BookOpen, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMapStore } from "@/providers/MapProvider";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import getPeakDetails from "@/actions/peaks/getPeakDetails";
import getPublicChallengeDetails from "@/actions/challenges/getPublicChallengeDetails";
import addChallengeFavorite from "@/actions/challenges/addChallengeFavorite";
import deleteChallengeFavorite from "@/actions/challenges/deleteChallengeFavorite";
import DashboardContent from "./DashboardContent";
import PeakUserActivity from "./PeakUserActivity";
import PeakCommunity from "./PeakCommunity";
import mapboxgl from "mapbox-gl";
import convertPeaksToGeoJSON from "@/helpers/convertPeaksToGeoJSON";
import convertActivitiesToGeoJSON from "@/helpers/convertActivitiesToGeoJSON";
import { setPeaksSearchDisabled } from "@/helpers/peaksSearchState";
import useRequireAuth, { useIsAuthenticated } from "@/hooks/useRequireAuth";
import getActivitiesProcessing from "@/actions/users/getActivitiesProcessing";
import PeakDetailsMobile from "./mobile/peak-details-mobile";
import ChallengeDetailsMobile from "./mobile/challenge-details-mobile";
import DiscoveryContentMobile from "./mobile/discovery-content-mobile";
import ActivityDetailsMobile from "./mobile/activity-details-mobile";
import getActivityDetails from "@/actions/activities/getActivityDetails";
import getUserProfile from "@/actions/users/getUserProfile";
import { useActivityMapEffects } from "@/hooks/use-activity-map-effects";
import { useProfileMapEffects } from "@/hooks/use-profile-map-effects";
import { convertSummitsToPeaks } from "@/helpers/convertSummitsToPeaks";
import ActivityAnalytics from "@/components/app/activities/ActivityAnalytics";
import ProfileDetailsMobile from "./mobile/profile-details-mobile";
import ProfileSummitsList from "./ProfileSummitsList";
import ProfileJournal from "./ProfileJournal";
import ProfileChallenges from "./ProfileChallenges";
import PeakRow from "@/components/lists/peak-row";
import { usePeakHoverMapEffects } from "@/hooks/use-peak-hover-map-effects";
import ActivitySummitsList from "@/components/app/activities/ActivitySummitsList";

type DrawerHeight = "collapsed" | "halfway" | "expanded";
type TabMode = "details" | "discover" | "dashboard" | "myActivity" | "community" | "analytics" | "summits" | "profilePeaks" | "profileJournal" | "profileChallenges" | "challengePeaks";

const DRAWER_HEIGHTS = {
    collapsed: 60,
    halfway: typeof window !== "undefined" ? window.innerHeight * 0.45 : 400,
    expanded: typeof window !== "undefined" ? window.innerHeight - 80 : 600,
};

interface Props {
    peakId?: string | null;
    challengeId?: number | null;
    activityId?: string | null;
    userId?: string | null;
    onClose: () => void;
}

const DetailBottomSheet = ({ peakId, challengeId, activityId, userId, onClose }: Props) => {
    const visiblePeaks = useMapStore((state) => state.visiblePeaks);
    const visibleChallenges = useMapStore((state) => state.visibleChallenges);
    const map = useMapStore((state) => state.map);
    const setDisablePeaksSearch = useMapStore((state) => state.setDisablePeaksSearch);
    const isZoomedOutTooFar = useMapStore((state) => state.isZoomedOutTooFar);
    const setSelectedPeakUserData = useMapStore((state) => state.setSelectedPeakUserData);
    const setSelectedPeakCommunityData = useMapStore((state) => state.setSelectedPeakCommunityData);
    const setHoveredPeakId = useMapStore((state) => state.setHoveredPeakId);
    const router = useRouter();
    const routerRef = useRef(router);
    const controls = useAnimation();
    const requireAuth = useRequireAuth();
    const queryClient = useQueryClient();
    const { isAuthenticated, isLoading: authLoading } = useIsAuthenticated();
    
    const hasDetail = Boolean(peakId || challengeId || activityId || userId);
    const hasPeakSelected = Boolean(peakId);
    const hasActivitySelected = Boolean(activityId);
    const hasProfileSelected = Boolean(userId);
    const hasChallengeSelected = Boolean(challengeId);
    const [activeTab, setActiveTab] = useState<TabMode>("discover");
    const [hoveredPeakCoords, setHoveredPeakCoords] = useState<[number, number] | null>(null);

    // Hook to handle peak hover map effects (show dot on map when hovering)
    usePeakHoverMapEffects({ hoverCoords: hoveredPeakCoords });
    const [drawerHeight, setDrawerHeight] = useState<DrawerHeight>("halfway");
    const [heights, setHeights] = useState(DRAWER_HEIGHTS);
    const [hasInitializedTab, setHasInitializedTab] = useState(false);
    const [highlightedActivityId, setHighlightedActivityId] = useState<string | null>(null);
    
    // Track if we've already performed the initial fitBounds for challenge
    const hasChallengeFitBoundsRef = useRef(false);
    const lastChallengeIdRef = useRef<number | null>(null);

    // Keep router ref updated to avoid stale closure issues
    useEffect(() => {
        routerRef.current = router;
    }, [router]);

    // Set default tab based on auth state and whether there's a detail open
    useEffect(() => {
        if (!authLoading && !hasInitializedTab) {
            if (hasDetail) {
                setActiveTab("details");
            } else if (isAuthenticated) {
                setActiveTab("dashboard");
            } else {
                setActiveTab("discover");
            }
            setHasInitializedTab(true);
        }
    }, [isAuthenticated, authLoading, hasInitializedTab, hasDetail]);

    // Fetch peak details
    const { data: peakData, isLoading: peakLoading } = useQuery({
        queryKey: ["peakDetails", peakId],
        queryFn: async () => {
            if (!peakId) return null;
            const res = await getPeakDetails(peakId);
            return res;
        },
        enabled: Boolean(peakId),
    });

    // Fetch challenge details
    const { data: challengeData, isLoading: challengeLoading } = useQuery({
        queryKey: ["challengeDetails", challengeId],
        queryFn: async () => {
            if (!challengeId) return null;
            const res = await getPublicChallengeDetails(String(challengeId));
            return res;
        },
        enabled: Boolean(challengeId),
    });

    // Fetch activity details
    const { data: activityData, isLoading: activityLoading } = useQuery({
        queryKey: ["activityDetails", activityId],
        queryFn: async () => {
            if (!activityId) return null;
            const res = await getActivityDetails(activityId);
            return res;
        },
        enabled: Boolean(activityId),
    });

    // Fetch profile details
    const { data: profileData, isLoading: profileLoading } = useQuery({
        queryKey: ["userProfile", userId],
        queryFn: async () => {
            if (!userId) return null;
            const res = await getUserProfile(userId);
            return res;
        },
        enabled: Boolean(userId),
    });

    const profileResult = profileData?.success ? profileData.data : null;
    const profileUser = profileResult?.user ?? null;
    const profileStats = profileResult?.stats ?? null;
    const profileAcceptedChallenges = profileResult?.acceptedChallenges ?? [];
    const profilePeaksForMap = profileResult?.peaksForMap ?? [];

    const activity = activityData?.activity ?? null;
    const activitySummits = activityData?.summits ?? [];
    const isActivityOwner = activityData?.isOwner ?? false;
    const activityPeakSummits = useMemo(() => convertSummitsToPeaks(activitySummits), [activitySummits]);
    const [activityHoverCoords, setActivityHoverCoords] = useState<[number, number] | null>(null);

    // Activity map effects
    const { flyToActivity } = useActivityMapEffects({
        activity,
        peakSummits: activityPeakSummits,
        hoverCoords: activityHoverCoords,
        flyToOnLoad: true,
        padding: { top: 100, bottom: heights.halfway + 50, left: 50, right: 50 },
    });

    // Profile map effects
    const { showOnMap: showProfileOnMap } = useProfileMapEffects({
        userId,
        peaks: profilePeaksForMap,
        padding: { top: 100, bottom: heights.halfway + 50, left: 50, right: 50 },
    });

    // Fetch sync status (only when authenticated and on dashboard tab)
    const { data: processingResult } = useQuery({
        queryKey: ["activitiesProcessing"],
        queryFn: getActivitiesProcessing,
        enabled: isAuthenticated && activeTab === "dashboard",
        refetchInterval: activeTab === "dashboard" ? 10000 : false,
    });

    const syncCount = processingResult?.success ? (processingResult.data ?? 0) : 0;

    const peak = peakData?.success ? peakData.data?.peak : null;
    const peakChallenges = peakData?.success ? peakData.data?.challenges : null;
    const publicSummits = peakData?.success ? peakData.data?.publicSummits : null;
    const peakActivities = peakData?.success ? peakData.data?.activities : null;
    
    const challenge = challengeData?.success ? challengeData.data?.challenge : null;
    const challengePeaks = challengeData?.success ? challengeData.data?.peaks : null;
    const isFavorited = challenge?.is_favorited ?? false;

    // Share user's ascents and activities with the map store (for My Activity tab - authenticated users only)
    useEffect(() => {
        if (peak && isAuthenticated && peakId && peak.location_coords) {
            setSelectedPeakUserData({
                peakId: peakId,
                peakName: peak.name || "Unknown Peak",
                peakCoords: peak.location_coords,
                ascents: peak.ascents || [],
                activities: peakActivities || [],
            });
        }

        return () => {
            setSelectedPeakUserData(null);
            setHighlightedActivityId(null);
        };
    }, [peak, peakActivities, isAuthenticated, peakId, setSelectedPeakUserData]);

    // Share community/public summits data with the map store (for Community tab - all users)
    useEffect(() => {
        if (peak && peakId) {
            setSelectedPeakCommunityData({
                peakId: peakId,
                peakName: peak.name || "Unknown Peak",
                publicSummits: publicSummits || [],
            });
        }

        return () => {
            setSelectedPeakCommunityData(null);
        };
    }, [peak, publicSummits, peakId, setSelectedPeakCommunityData]);

    // Display activity GPX lines on the map when viewing a peak
    useEffect(() => {
        if (!map || !peakActivities || peakActivities.length === 0) return;

        const setActivitiesOnMap = async () => {
            let activitiesSource = map.getSource("activities") as mapboxgl.GeoJSONSource | undefined;
            let activityStartsSource = map.getSource("activityStarts") as mapboxgl.GeoJSONSource | undefined;

            let attempts = 0;
            const maxAttempts = 5;

            while ((!activitiesSource || !activityStartsSource) && attempts < maxAttempts) {
                attempts++;
                await new Promise((resolve) => setTimeout(resolve, 300));
                activitiesSource = map.getSource("activities") as mapboxgl.GeoJSONSource | undefined;
                activityStartsSource = map.getSource("activityStarts") as mapboxgl.GeoJSONSource | undefined;
            }

            if (activitiesSource && activityStartsSource) {
                const [lineStrings, starts] = convertActivitiesToGeoJSON(peakActivities);
                activitiesSource.setData(lineStrings);
                activityStartsSource.setData(starts);
            }
        };

        setActivitiesOnMap();

        return () => {
            if (!map) return;
            
            try {
                const activitiesSource = map.getSource("activities") as mapboxgl.GeoJSONSource | undefined;
                const activityStartsSource = map.getSource("activityStarts") as mapboxgl.GeoJSONSource | undefined;

                if (activitiesSource) {
                    activitiesSource.setData({ type: "FeatureCollection", features: [] });
                }
                if (activityStartsSource) {
                    activityStartsSource.setData({ type: "FeatureCollection", features: [] });
                }
            } catch (error) {
                console.debug("Failed to cleanup activities map source:", error);
            }
        };
    }, [map, peakActivities]);

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

    // Switch to appropriate tab when a detail is selected
    useEffect(() => {
        if (hasDetail && hasInitializedTab) {
            if (hasPeakSelected) {
                setActiveTab(isAuthenticated ? "myActivity" : "community");
            } else {
                // For both challenges and activities, default to details tab
                setActiveTab("details");
            }
            if (drawerHeight === "expanded") {
                setDrawerHeight("halfway");
            }
        }
    }, [hasDetail, peakId, challengeId, activityId, hasInitializedTab, hasPeakSelected, isAuthenticated, drawerHeight]);

    // Animate to new height when drawerHeight state changes
    useEffect(() => {
        controls.start({ height: heights[drawerHeight] });
    }, [drawerHeight, heights, controls]);

    // Handle peak map effects
    useEffect(() => {
        if (!peak?.location_coords || !map) return;
        
        map.flyTo({
            center: peak.location_coords,
            zoom: 13,
            pitch: 50,
            bearing: 20,
            padding: { top: 20, bottom: heights[drawerHeight] + 20, left: 0, right: 0 },
            essential: true,
        });
    }, [peak?.location_coords, map, heights, drawerHeight]);

    // Set selected peak on map
    useEffect(() => {
        if (!map || !peak) return;

        const setSelectedPeakSource = async () => {
            let peaksSource = map.getSource("selectedPeaks") as mapboxgl.GeoJSONSource | undefined;
            let attempts = 0;
            const maxAttempts = 5;

            while (!peaksSource && attempts < maxAttempts) {
                attempts++;
                await new Promise((resolve) => setTimeout(resolve, 300));
                peaksSource = map.getSource("selectedPeaks") as mapboxgl.GeoJSONSource | undefined;
            }

            if (peaksSource) {
                peaksSource.setData(convertPeaksToGeoJSON([peak]));
            }
        };

        setSelectedPeakSource();

        return () => {
            // Only cleanup if we're actually viewing a peak (not a challenge)
            if (!map || !peakId) return;
            
            try {
                const peaksSource = map.getSource("selectedPeaks") as mapboxgl.GeoJSONSource | undefined;
                if (peaksSource) {
                    peaksSource.setData({ type: "FeatureCollection", features: [] });
                }
            } catch (error) {
                console.debug("Failed to cleanup selectedPeaks map source:", error);
            }
        };
    }, [map, peak, peakId]);

    // Handle challenge map effects
    useEffect(() => {
        if (!challengeId) return;
        
        setPeaksSearchDisabled(true);
        setDisablePeaksSearch(true);
        
        if (map) {
            const peaksSource = map.getSource("peaks") as mapboxgl.GeoJSONSource | undefined;
            if (peaksSource) {
                peaksSource.setData({ type: "FeatureCollection", features: [] });
            }
        }
        
        return () => {
            setPeaksSearchDisabled(false);
            setDisablePeaksSearch(false);
            if (map) {
                map.setPadding({ top: 0, bottom: 0, left: 0, right: 0 });
                setTimeout(() => map.fire("moveend"), 50);
            }
        };
    }, [challengeId, setDisablePeaksSearch, map]);

    // Set challenge peaks on map
    useEffect(() => {
        if (!map || !challengePeaks || challengePeaks.length === 0) return;

        // Reset fitBounds flag when viewing a different challenge
        if (challengeId !== lastChallengeIdRef.current) {
            hasChallengeFitBoundsRef.current = false;
            lastChallengeIdRef.current = challengeId ?? null;
        }

        const setChallengePeaksOnMap = async () => {
            let selectedPeaksSource = map.getSource("selectedPeaks") as mapboxgl.GeoJSONSource | undefined;
            let attempts = 0;
            const maxAttempts = 5;

            while (!selectedPeaksSource && attempts < maxAttempts) {
                attempts++;
                await new Promise((resolve) => setTimeout(resolve, 300));
                selectedPeaksSource = map.getSource("selectedPeaks") as mapboxgl.GeoJSONSource | undefined;
            }

            if (selectedPeaksSource) {
                selectedPeaksSource.setData(convertPeaksToGeoJSON(challengePeaks));
            }

            if (map.getLayer("selectedPeaks")) {
                map.moveLayer("selectedPeaks");
            }
        };

        setChallengePeaksOnMap();

        // Fit map to challenge bounds (only once per challenge)
        if (!hasChallengeFitBoundsRef.current) {
            const peakCoords = challengePeaks
                .filter((p) => p.location_coords)
                .map((p) => p.location_coords as [number, number]);

            if (peakCoords.length > 0) {
                hasChallengeFitBoundsRef.current = true;
                const bounds = new mapboxgl.LngLatBounds();
                peakCoords.forEach((coord) => bounds.extend(coord));
                map.fitBounds(bounds, {
                    padding: { top: 100, bottom: heights.halfway + 20, left: 50, right: 50 },
                    maxZoom: 12,
                });
            }
        }

        return () => {
            // Only cleanup if we're actually viewing a challenge (not a peak)
            if (!map || !challengeId) return;
            
            try {
                const selectedPeaksSource = map.getSource("selectedPeaks") as mapboxgl.GeoJSONSource | undefined;
                if (selectedPeaksSource) {
                    selectedPeaksSource.setData({ type: "FeatureCollection", features: [] });
                }
            } catch (error) {
                console.debug("Failed to cleanup selectedPeaks map source:", error);
            }
        };
    }, [map, challengePeaks, challengeId, heights.halfway]);

    const handlePeakClick = (id: string, coords?: [number, number]) => {
        routerRef.current.push(`/peaks/${id}`);
        if (map && coords) {
            map.flyTo({
                center: coords,
                zoom: 14,
                pitch: 60,
                padding: { top: 20, bottom: heights[drawerHeight] + 20, left: 0, right: 0 },
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
        const velocityThreshold = 500;
        const currentHeight = heights[drawerHeight];
        const newHeight = currentHeight - offset;
        
        if (velocity < -velocityThreshold) {
            if (drawerHeight === "collapsed") setDrawerHeight("halfway");
            else if (drawerHeight === "halfway") setDrawerHeight("expanded");
        } else if (velocity > velocityThreshold) {
            if (drawerHeight === "expanded") setDrawerHeight("halfway");
            else if (drawerHeight === "halfway") setDrawerHeight("collapsed");
        } else {
            const distanceToCollapsed = Math.abs(newHeight - heights.collapsed);
            const distanceToHalfway = Math.abs(newHeight - heights.halfway);
            const distanceToExpanded = Math.abs(newHeight - heights.expanded);
            const minDistance = Math.min(distanceToCollapsed, distanceToHalfway, distanceToExpanded);
            
            if (minDistance === distanceToCollapsed) setDrawerHeight("collapsed");
            else if (minDistance === distanceToHalfway) setDrawerHeight("halfway");
            else setDrawerHeight("expanded");
        }
    };

    const handleHandleClick = () => {
        if (drawerHeight === "collapsed") setDrawerHeight("halfway");
        else if (drawerHeight === "halfway") setDrawerHeight("expanded");
        else setDrawerHeight("collapsed");
    };

    const handleFlyToPeak = () => {
        if (peak?.location_coords && map) {
            map.flyTo({
                center: peak.location_coords,
                zoom: 14,
                pitch: 60,
                bearing: 30,
                padding: { top: 20, bottom: heights[drawerHeight] + 20, left: 0, right: 0 },
                essential: true
            });
        }
    };

    const handleShowChallengeOnMap = () => {
        if (!challengePeaks || challengePeaks.length === 0 || !map) return;
        
        const peakCoords = challengePeaks
            .filter((p) => p.location_coords)
            .map((p) => p.location_coords as [number, number]);

        if (peakCoords.length > 0) {
            const bounds = new mapboxgl.LngLatBounds();
            peakCoords.forEach((coord) => bounds.extend(coord));
            map.fitBounds(bounds, {
                padding: { top: 100, bottom: heights.halfway + 20, left: 50, right: 50 },
                maxZoom: 12,
            });
        }
    };

    const handleToggleFavorite = () => {
        if (!challengeId) return;
        
        requireAuth(async () => {
            if (isFavorited) {
                await deleteChallengeFavorite(String(challengeId));
            } else {
                await addChallengeFavorite(String(challengeId));
            }
            queryClient.invalidateQueries({ queryKey: ["challengeDetails", challengeId] });
            queryClient.invalidateQueries({ queryKey: ["favoriteChallenges"] });
        });
    };

    const handleTabChange = (tab: TabMode) => {
        setActiveTab(tab);
        if (drawerHeight === "collapsed") {
            setDrawerHeight("halfway");
        }
    };

    const isLoading = (peakId && peakLoading) || (challengeId && challengeLoading) || (activityId && activityLoading) || (userId && profileLoading);

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

                {/* Tab Bar */}
                <div className="px-3 py-2 border-b border-border/60 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className="flex gap-0.5 bg-muted/50 p-0.5 rounded-lg flex-1">
                            {hasDetail && (
                                <button
                                    onClick={() => handleTabChange("details")}
                                    onKeyDown={(e) => e.key === "Enter" && handleTabChange("details")}
                                    tabIndex={0}
                                    aria-label="Details tab"
                                    aria-selected={activeTab === "details"}
                                    role="tab"
                                    className={cn(
                                        "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-md text-[10px] font-medium transition-all flex-1 justify-center min-w-0",
                                        activeTab === "details"
                                            ? "bg-background text-foreground shadow-sm"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <Mountain className="w-4 h-4" />
                                    Details
                                </button>
                            )}
                            {hasPeakSelected && isAuthenticated && (
                                <button
                                    onClick={() => handleTabChange("myActivity")}
                                    onKeyDown={(e) => e.key === "Enter" && handleTabChange("myActivity")}
                                    tabIndex={0}
                                    aria-label="Journal tab"
                                    aria-selected={activeTab === "myActivity"}
                                    role="tab"
                                    className={cn(
                                        "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-md text-[10px] font-medium transition-all flex-1 justify-center min-w-0",
                                        activeTab === "myActivity"
                                            ? "bg-background text-foreground shadow-sm"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <Route className="w-4 h-4" />
                                    Journal
                                </button>
                            )}
                            {hasPeakSelected && (
                                <button
                                    onClick={() => handleTabChange("community")}
                                    onKeyDown={(e) => e.key === "Enter" && handleTabChange("community")}
                                    tabIndex={0}
                                    aria-label="Community tab"
                                    aria-selected={activeTab === "community"}
                                    role="tab"
                                    className={cn(
                                        "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-md text-[10px] font-medium transition-all flex-1 justify-center min-w-0",
                                        activeTab === "community"
                                            ? "bg-background text-foreground shadow-sm"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <Users className="w-4 h-4" />
                                    Community
                                </button>
                            )}
                            {hasActivitySelected && (
                                <>
                                    <button
                                        onClick={() => handleTabChange("summits")}
                                        onKeyDown={(e) => e.key === "Enter" && handleTabChange("summits")}
                                        tabIndex={0}
                                        aria-label="Summits tab"
                                        aria-selected={activeTab === "summits"}
                                        role="tab"
                                        className={cn(
                                            "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-md text-[10px] font-medium transition-all flex-1 justify-center min-w-0",
                                            activeTab === "summits"
                                                ? "bg-background text-foreground shadow-sm"
                                                : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <Mountain className="w-4 h-4" />
                                        Summits
                                    </button>
                                    <button
                                        onClick={() => handleTabChange("analytics")}
                                        onKeyDown={(e) => e.key === "Enter" && handleTabChange("analytics")}
                                        tabIndex={0}
                                        aria-label="Analytics tab"
                                        aria-selected={activeTab === "analytics"}
                                        role="tab"
                                        className={cn(
                                            "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-md text-[10px] font-medium transition-all flex-1 justify-center min-w-0",
                                            activeTab === "analytics"
                                                ? "bg-background text-foreground shadow-sm"
                                                : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <BarChart3 className="w-4 h-4" />
                                        Analytics
                                    </button>
                                </>
                            )}
                            {hasProfileSelected && (
                                <>
                                    <button
                                        onClick={() => handleTabChange("profilePeaks")}
                                        onKeyDown={(e) => e.key === "Enter" && handleTabChange("profilePeaks")}
                                        tabIndex={0}
                                        aria-label="Peaks tab"
                                        aria-selected={activeTab === "profilePeaks"}
                                        role="tab"
                                        className={cn(
                                            "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-md text-[10px] font-medium transition-all flex-1 justify-center min-w-0",
                                            activeTab === "profilePeaks"
                                                ? "bg-background text-foreground shadow-sm"
                                                : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <Mountain className="w-4 h-4" />
                                        Peaks
                                    </button>
                                    <button
                                        onClick={() => handleTabChange("profileJournal")}
                                        onKeyDown={(e) => e.key === "Enter" && handleTabChange("profileJournal")}
                                        tabIndex={0}
                                        aria-label="Journal tab"
                                        aria-selected={activeTab === "profileJournal"}
                                        role="tab"
                                        className={cn(
                                            "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-md text-[10px] font-medium transition-all flex-1 justify-center min-w-0",
                                            activeTab === "profileJournal"
                                                ? "bg-background text-foreground shadow-sm"
                                                : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <BookOpen className="w-4 h-4" />
                                        Journal
                                    </button>
                                    <button
                                        onClick={() => handleTabChange("profileChallenges")}
                                        onKeyDown={(e) => e.key === "Enter" && handleTabChange("profileChallenges")}
                                        tabIndex={0}
                                        aria-label="Challenges tab"
                                        aria-selected={activeTab === "profileChallenges"}
                                        role="tab"
                                        className={cn(
                                            "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-md text-[10px] font-medium transition-all flex-1 justify-center min-w-0",
                                            activeTab === "profileChallenges"
                                                ? "bg-background text-foreground shadow-sm"
                                                : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <Trophy className="w-4 h-4" />
                                        Challenges
                                    </button>
                                </>
                            )}
                            {hasChallengeSelected && (
                                <button
                                    onClick={() => handleTabChange("challengePeaks")}
                                    onKeyDown={(e) => e.key === "Enter" && handleTabChange("challengePeaks")}
                                    tabIndex={0}
                                    aria-label="Challenge Peaks tab"
                                    aria-selected={activeTab === "challengePeaks"}
                                    role="tab"
                                    className={cn(
                                        "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-md text-[10px] font-medium transition-all flex-1 justify-center min-w-0",
                                        activeTab === "challengePeaks"
                                            ? "bg-background text-foreground shadow-sm"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <Mountain className="w-4 h-4" />
                                    Peaks
                                </button>
                            )}
                            {!hasChallengeSelected && (
                                <button
                                    onClick={() => handleTabChange("discover")}
                                    onKeyDown={(e) => e.key === "Enter" && handleTabChange("discover")}
                                    tabIndex={0}
                                    aria-label="Explore tab"
                                    aria-selected={activeTab === "discover"}
                                    role="tab"
                                    className={cn(
                                        "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-md text-[10px] font-medium transition-all flex-1 justify-center min-w-0",
                                        activeTab === "discover"
                                            ? "bg-background text-foreground shadow-sm"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <Compass className="w-4 h-4" />
                                    Explore
                                </button>
                            )}
                            <button
                                onClick={() => handleTabChange("dashboard")}
                                onKeyDown={(e) => e.key === "Enter" && handleTabChange("dashboard")}
                                tabIndex={0}
                                aria-label="Dashboard tab"
                                aria-selected={activeTab === "dashboard"}
                                role="tab"
                                className={cn(
                                    "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-md text-[10px] font-medium transition-all flex-1 justify-center min-w-0",
                                    activeTab === "dashboard"
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <LayoutDashboard className="w-4 h-4" />
                                Home
                            </button>
                        </div>
                        {/* Sync Status */}
                        {syncCount > 0 && (
                            <div className="flex items-center gap-1 text-[10px] text-primary shrink-0">
                                <RefreshCw className="w-3 h-3 animate-spin" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className={cn(
                    "flex-1 overflow-y-auto p-4 custom-scrollbar",
                    drawerHeight === "collapsed" && "overflow-hidden"
                )}>
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex items-center justify-center py-10"
                            >
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                            </motion.div>
                        ) : activeTab === "details" ? (
                            <motion.div
                                key="details"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.15 }}
                            >
                                {peakId && peak ? (
                                    <PeakDetailsMobile
                                        peak={peak}
                                        challenges={peakChallenges}
                                        publicSummits={publicSummits}
                                        onClose={onClose}
                                        onFlyToPeak={handleFlyToPeak}
                                    />
                                ) : activityId && activity ? (
                                    <ActivityDetailsMobile
                                        activity={activity}
                                        summits={activitySummits}
                                        onClose={onClose}
                                        onShowOnMap={flyToActivity}
                                        onHover={setActivityHoverCoords}
                                    />
                                ) : challengeId && challenge ? (
                                    <ChallengeDetailsMobile
                                        challenge={challenge}
                                        peaks={challengePeaks}
                                        isFavorited={isFavorited}
                                        onClose={onClose}
                                        onToggleFavorite={handleToggleFavorite}
                                        onShowOnMap={handleShowChallengeOnMap}
                                    />
                                ) : userId && profileUser && profileStats ? (
                                    <ProfileDetailsMobile
                                        user={profileUser}
                                        stats={profileStats}
                                        onClose={onClose}
                                        onShowOnMap={showProfileOnMap}
                                    />
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <p className="text-sm">Select a peak or challenge to view details.</p>
                                    </div>
                                )}
                            </motion.div>
                        ) : activeTab === "myActivity" ? (
                            <motion.div
                                key="myActivity"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.15 }}
                                className="-mx-2"
                            >
                                <PeakUserActivity
                                    highlightedActivityId={highlightedActivityId}
                                    onHighlightActivity={setHighlightedActivityId}
                                />
                            </motion.div>
                        ) : activeTab === "community" ? (
                            <motion.div
                                key="community"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.15 }}
                                className="-mx-2"
                            >
                                <PeakCommunity />
                            </motion.div>
                        ) : activeTab === "discover" ? (
                            <motion.div
                                key="discover"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.15 }}
                            >
                                <DiscoveryContentMobile
                                    visibleChallenges={visibleChallenges}
                                    visiblePeaks={visiblePeaks}
                                    isZoomedOutTooFar={isZoomedOutTooFar}
                                    onPeakClick={handlePeakClick}
                                    onChallengeClick={handleChallengeClick}
                                />
                            </motion.div>
                        ) : activeTab === "summits" && activityId && activitySummits ? (
                            <motion.div
                                key="summits"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.15 }}
                            >
                                <ActivitySummitsList
                                    summits={activitySummits}
                                    activityId={activityId}
                                    onSummitHover={setHoveredPeakId}
                                    isOwner={isActivityOwner}
                                />
                            </motion.div>
                        ) : activeTab === "analytics" && activityId && activity ? (
                            <motion.div
                                key="analytics"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.15 }}
                            >
                                <ActivityAnalytics activity={activity} />
                            </motion.div>
                        ) : activeTab === "profilePeaks" && userId ? (
                            <motion.div
                                key="profilePeaks"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.15 }}
                            >
                                <ProfileSummitsList userId={userId} compact />
                            </motion.div>
                        ) : activeTab === "profileJournal" && userId ? (
                            <motion.div
                                key="profileJournal"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.15 }}
                            >
                                <ProfileJournal userId={userId} />
                            </motion.div>
                        ) : activeTab === "profileChallenges" && userId ? (
                            <motion.div
                                key="profileChallenges"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.15 }}
                            >
                                <ProfileChallenges userId={userId} />
                            </motion.div>
                        ) : activeTab === "challengePeaks" && challengeId && challengePeaks ? (
                            <motion.div
                                key="challengePeaks"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.15 }}
                                className="space-y-4"
                            >
                                <div className="flex items-center gap-2">
                                    <Mountain className="w-4 h-4 text-secondary" />
                                    <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                                        {challengePeaks.length} Peaks
                                    </h2>
                                </div>
                                <div className="space-y-1">
                                    {[...challengePeaks]
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

export default DetailBottomSheet;
