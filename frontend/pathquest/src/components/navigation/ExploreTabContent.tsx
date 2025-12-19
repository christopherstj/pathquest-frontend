"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mountain, Users, Route, Trophy, BarChart3, BookOpen, ArrowLeft, Compass, CheckCircle, LogIn, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMapStore } from "@/providers/MapProvider";
import { useTabStore, ExploreSubTab } from "@/store/tabStore";
import useRequireAuth, { useIsAuthenticated } from "@/hooks/useRequireAuth";
import mapboxgl from "mapbox-gl";

// Data fetching actions
import getPeakDetails from "@/actions/peaks/getPeakDetails";
import getPublicChallengeDetails from "@/actions/challenges/getPublicChallengeDetails";
import getActivityDetails from "@/actions/activities/getActivityDetails";
import getUserProfile from "@/actions/users/getUserProfile";
import addChallengeFavorite from "@/actions/challenges/addChallengeFavorite";
import deleteChallengeFavorite from "@/actions/challenges/deleteChallengeFavorite";

// Mobile detail components
import PeakDetailsMobile from "@/components/overlays/mobile/peak-details-mobile";
import ChallengeDetailsMobile from "@/components/overlays/mobile/challenge-details-mobile";
import ActivityDetailsMobile from "@/components/overlays/mobile/activity-details-mobile";
import ProfileDetailsMobile from "@/components/overlays/mobile/profile-details-mobile";
import DiscoveryContentMobile from "@/components/overlays/mobile/discovery-content-mobile";

// Content components
import PeakUserActivity from "@/components/overlays/PeakUserActivity";
import PeakCommunity from "@/components/overlays/PeakCommunity";
import ProfileSummitsList from "@/components/overlays/ProfileSummitsList";
import ProfileJournal from "@/components/overlays/ProfileJournal";
import ProfileChallenges from "@/components/overlays/ProfileChallenges";
import ActivitySummitsList from "@/components/app/activities/ActivitySummitsList";
import ActivityAnalytics from "@/components/app/activities/ActivityAnalytics";
import PeakRow from "@/components/lists/peak-row";

// Components
import { PeakActivityIndicator } from "@/components/peaks";
import { Button } from "@/components/ui/button";
import metersToFt from "@/helpers/metersToFt";
import { useManualSummitStore } from "@/providers/ManualSummitProvider";

// Helpers
import convertPeaksToGeoJSON from "@/helpers/convertPeaksToGeoJSON";
import convertActivitiesToGeoJSON from "@/helpers/convertActivitiesToGeoJSON";
import { setPeaksSearchDisabled } from "@/helpers/peaksSearchState";
import { convertSummitsToPeaks } from "@/helpers/convertSummitsToPeaks";
import { useActivityMapEffects } from "@/hooks/use-activity-map-effects";
import { useProfileMapEffects } from "@/hooks/use-profile-map-effects";
import { usePeakHoverMapEffects } from "@/hooks/use-peak-hover-map-effects";
import { useContentSheetHeights } from "./ContentSheet";

interface SubTabButtonProps {
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}

const SubTabButton = ({ icon, label, isActive, onClick }: SubTabButtonProps) => {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                isActive
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
            )}
            aria-label={label}
            aria-selected={isActive}
            role="tab"
        >
            {icon}
            {label}
        </button>
    );
};

interface ExploreTabContentProps {
    isActive: boolean;
}

/**
 * Explore tab content - handles both discovery mode and detail views.
 * 
 * Discovery mode: Shows visible peaks and challenges on the map
 * Detail mode: Shows specific peak, challenge, activity, or user profile
 * 
 * Sub-tabs change based on what type of content is being viewed.
 */
const ExploreTabContent = ({ isActive }: ExploreTabContentProps) => {
    const pathname = usePathname();
    const router = useRouter();
    const routerRef = useRef(router);
    const queryClient = useQueryClient();
    const requireAuth = useRequireAuth();
    const { isAuthenticated } = useIsAuthenticated();
    const heights = useContentSheetHeights();

    // Map store
    const visiblePeaks = useMapStore((state) => state.visiblePeaks);
    const visibleChallenges = useMapStore((state) => state.visibleChallenges);
    const map = useMapStore((state) => state.map);
    const setDisablePeaksSearch = useMapStore((state) => state.setDisablePeaksSearch);
    const isZoomedOutTooFar = useMapStore((state) => state.isZoomedOutTooFar);
    const setSelectedPeakUserData = useMapStore((state) => state.setSelectedPeakUserData);
    const setSelectedPeakCommunityData = useMapStore((state) => state.setSelectedPeakCommunityData);
    const setHoveredPeakId = useMapStore((state) => state.setHoveredPeakId);

    // Tab store
    const exploreSubTab = useTabStore((state) => state.exploreSubTab);
    const setExploreSubTab = useTabStore((state) => state.setExploreSubTab);
    const pushExploreHistory = useTabStore((state) => state.pushExploreHistory);
    const popExploreHistory = useTabStore((state) => state.popExploreHistory);
    const exploreBackStack = useTabStore((state) => state.exploreBackStack);

    // Local state
    const [hoveredPeakCoords, setHoveredPeakCoords] = useState<[number, number] | null>(null);
    const [highlightedActivityId, setHighlightedActivityId] = useState<string | null>(null);
    const [activityHoverCoords, setActivityHoverCoords] = useState<[number, number] | null>(null);
    const hasChallengeFitBoundsRef = useRef(false);
    const lastChallengeIdRef = useRef<number | null>(null);

    // Peak hover effects
    usePeakHoverMapEffects({ hoverCoords: hoveredPeakCoords });

    // Keep router ref updated
    useEffect(() => {
        routerRef.current = router;
    }, [router]);

    // Parse pathname to determine what to show
    const peakMatch = pathname.match(/^\/peaks\/([^\/]+)$/);
    const challengeMatch = pathname.match(/^\/challenges\/([^\/]+)$/);
    const activityMatch = pathname.match(/^\/activities\/([^\/]+)$/);
    const userMatch = pathname.match(/^\/users\/([^\/]+)$/);

    const peakId = peakMatch?.[1] ?? null;
    const challengeId = challengeMatch?.[1] ? parseInt(challengeMatch[1], 10) : null;
    const activityId = activityMatch?.[1] ?? null;
    const userId = userMatch?.[1] ?? null;

    const hasDetail = Boolean(peakId || challengeId || activityId || userId);
    const contentType = peakId ? "peak" : challengeId ? "challenge" : activityId ? "activity" : userId ? "profile" : "discovery";

    // Set appropriate default sub-tab when content type changes
    // Community is now the default for peaks (core value prop)
    useEffect(() => {
        if (contentType === "peak") {
            setExploreSubTab("community");
        } else if (contentType === "challenge") {
            setExploreSubTab("progress");
        } else if (contentType === "activity") {
            setExploreSubTab("details");
        } else if (contentType === "profile") {
            setExploreSubTab("peaks");
        } else {
            setExploreSubTab("discovery");
        }
    }, [contentType, setExploreSubTab]);

    // Data fetching queries
    const { data: peakData, isLoading: peakLoading } = useQuery({
        queryKey: ["peakDetails", peakId],
        queryFn: async () => {
            if (!peakId) return null;
            return await getPeakDetails(peakId);
        },
        enabled: Boolean(peakId) && isActive,
    });

    const { data: challengeData, isLoading: challengeLoading } = useQuery({
        queryKey: ["challengeDetails", challengeId],
        queryFn: async () => {
            if (!challengeId) return null;
            return await getPublicChallengeDetails(String(challengeId));
        },
        enabled: Boolean(challengeId) && isActive,
    });

    const { data: activityData, isLoading: activityLoading } = useQuery({
        queryKey: ["activityDetails", activityId],
        queryFn: async () => {
            if (!activityId) return null;
            return await getActivityDetails(activityId);
        },
        enabled: Boolean(activityId) && isActive,
    });

    const { data: profileData, isLoading: profileLoading } = useQuery({
        queryKey: ["userProfile", userId],
        queryFn: async () => {
            if (!userId) return null;
            return await getUserProfile(userId);
        },
        enabled: Boolean(userId) && isActive,
    });

    // Extract data from queries
    const peak = peakData?.success ? peakData.data?.peak : null;
    const peakChallenges = peakData?.success ? peakData.data?.challenges : null;
    const publicSummits = peakData?.success ? peakData.data?.publicSummits : null;
    const peakActivities = peakData?.success ? peakData.data?.activities : null;

    const challenge = challengeData?.success ? challengeData.data?.challenge : null;
    const challengePeaks = challengeData?.success ? challengeData.data?.peaks : null;
    const isFavorited = challenge?.is_favorited ?? false;

    const activity = activityData?.activity ?? null;
    const activitySummits = activityData?.summits ?? [];
    const isActivityOwner = activityData?.isOwner ?? false;
    const activityPeakSummits = useMemo(() => convertSummitsToPeaks(activitySummits), [activitySummits]);

    const profileResult = profileData?.success ? profileData.data : null;
    const profileUser = profileResult?.user ?? null;
    const profileStats = profileResult?.stats ?? null;
    const profilePeaksForMap = profileResult?.peaksForMap ?? [];

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

    // Share user's ascents and activities with map store for peak details
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

    // Share community data with map store
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

    // Display activity GPX lines on map for peak details
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

    // Handle peak map effects
    useEffect(() => {
        if (!peak?.location_coords || !map) return;
        map.flyTo({
            center: peak.location_coords,
            zoom: 13,
            pitch: 50,
            bearing: 20,
            padding: { top: 20, bottom: heights.halfway + 20, left: 0, right: 0 },
            essential: true,
        });
    }, [peak?.location_coords, map, heights.halfway]);

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

        if (challengeId !== lastChallengeIdRef.current) {
            hasChallengeFitBoundsRef.current = false;
            lastChallengeIdRef.current = challengeId;
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

    // Navigation handlers
    const handlePeakClick = useCallback((id: string, coords?: [number, number]) => {
        if (pathname !== "/") {
            pushExploreHistory(pathname);
        }
        routerRef.current.push(`/peaks/${id}`);
        if (map && coords) {
            map.flyTo({
                center: coords,
                zoom: 14,
                pitch: 60,
                padding: { top: 20, bottom: heights.halfway + 20, left: 0, right: 0 },
                essential: true,
            });
        }
    }, [pathname, pushExploreHistory, map, heights.halfway]);

    const handleChallengeClick = useCallback((id: string) => {
        if (pathname !== "/") {
            pushExploreHistory(pathname);
        }
        routerRef.current.push(`/challenges/${id}`);
    }, [pathname, pushExploreHistory]);

    const handlePeakHoverStart = useCallback((peakId: string, coords: [number, number]) => {
        setHoveredPeakCoords(coords);
    }, []);

    const handlePeakHoverEnd = useCallback(() => {
        setHoveredPeakCoords(null);
    }, []);

    const handleBack = useCallback(() => {
        const previousUrl = popExploreHistory();
        if (previousUrl) {
            routerRef.current.push(previousUrl);
        } else {
            routerRef.current.push("/");
        }
    }, [popExploreHistory]);

    const handleClose = useCallback(() => {
        routerRef.current.push("/");
    }, []);

    const handleFlyToPeak = useCallback(() => {
        if (peak?.location_coords && map) {
            map.flyTo({
                center: peak.location_coords,
                zoom: 14,
                pitch: 60,
                bearing: 30,
                padding: { top: 20, bottom: heights.halfway + 20, left: 0, right: 0 },
                essential: true,
            });
        }
    }, [peak, map, heights.halfway]);

    const handleShowChallengeOnMap = useCallback(() => {
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
    }, [challengePeaks, map, heights.halfway]);

    const handleToggleFavorite = useCallback(() => {
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
    }, [challengeId, isFavorited, requireAuth, queryClient]);

    const isLoading = (peakId && peakLoading) || (challengeId && challengeLoading) || (activityId && activityLoading) || (userId && profileLoading);

    // Render sub-tabs based on content type
    const renderSubTabs = () => {
        if (contentType === "peak") {
            return (
                <div className="flex gap-0.5 bg-muted/50 p-0.5 rounded-lg">
                    <SubTabButton
                        icon={<Users className="w-3.5 h-3.5" />}
                        label="Community"
                        isActive={exploreSubTab === "community"}
                        onClick={() => setExploreSubTab("community")}
                    />
                    <SubTabButton
                        icon={<BookOpen className="w-3.5 h-3.5" />}
                        label="My Journal"
                        isActive={exploreSubTab === "myActivity"}
                        onClick={() => setExploreSubTab("myActivity")}
                    />
                </div>
            );
        }

        if (contentType === "challenge") {
            return (
                <div className="flex gap-0.5 bg-muted/50 p-0.5 rounded-lg">
                    <SubTabButton
                        icon={<Trophy className="w-3.5 h-3.5" />}
                        label="Progress"
                        isActive={exploreSubTab === "progress"}
                        onClick={() => setExploreSubTab("progress")}
                    />
                    <SubTabButton
                        icon={<Mountain className="w-3.5 h-3.5" />}
                        label="Peaks"
                        isActive={exploreSubTab === "peaks"}
                        onClick={() => setExploreSubTab("peaks")}
                    />
                </div>
            );
        }

        if (contentType === "activity") {
            return (
                <div className="flex gap-0.5 bg-muted/50 p-0.5 rounded-lg">
                    <SubTabButton
                        icon={<Mountain className="w-3.5 h-3.5" />}
                        label="Details"
                        isActive={exploreSubTab === "details"}
                        onClick={() => setExploreSubTab("details")}
                    />
                    <SubTabButton
                        icon={<Mountain className="w-3.5 h-3.5" />}
                        label="Summits"
                        isActive={exploreSubTab === "summits"}
                        onClick={() => setExploreSubTab("summits")}
                    />
                    <SubTabButton
                        icon={<BarChart3 className="w-3.5 h-3.5" />}
                        label="Analytics"
                        isActive={exploreSubTab === "analytics"}
                        onClick={() => setExploreSubTab("analytics")}
                    />
                </div>
            );
        }

        if (contentType === "profile") {
            return (
                <div className="flex gap-0.5 bg-muted/50 p-0.5 rounded-lg">
                    <SubTabButton
                        icon={<Mountain className="w-3.5 h-3.5" />}
                        label="Peaks"
                        isActive={exploreSubTab === "peaks"}
                        onClick={() => setExploreSubTab("peaks")}
                    />
                    <SubTabButton
                        icon={<BookOpen className="w-3.5 h-3.5" />}
                        label="Journal"
                        isActive={exploreSubTab === "details"}
                        onClick={() => setExploreSubTab("details")}
                    />
                    <SubTabButton
                        icon={<Trophy className="w-3.5 h-3.5" />}
                        label="Challenges"
                        isActive={exploreSubTab === "summits"}
                        onClick={() => setExploreSubTab("summits")}
                    />
                </div>
            );
        }

        return null;
    };

    // Render content based on content type and sub-tab
    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex items-center justify-center py-10">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                </div>
            );
        }

        // Discovery mode
        if (contentType === "discovery") {
            return (
                <div className="p-4">
                    <DiscoveryContentMobile
                        visibleChallenges={visibleChallenges}
                        visiblePeaks={visiblePeaks}
                        isZoomedOutTooFar={isZoomedOutTooFar}
                        onPeakClick={handlePeakClick}
                        onChallengeClick={handleChallengeClick}
                    />
                </div>
            );
        }

        // Peak detail
        if (contentType === "peak" && peak) {
            const userSummits = peak.summits ?? 0;
            const hasUnreportedSummits = peak.ascents?.some(
                (a) => !a.notes && !a.difficulty && !a.experience_rating
            );

            return (
                <div className="flex flex-col h-full">
                    {/* Compact Header */}
                    <div className="px-4 py-3 border-b border-border/60">
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-lg font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
                                    {peak.name}
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    {peak.elevation ? `${Math.round(metersToFt(peak.elevation)).toLocaleString()} ft` : ""}
                                </p>
                            </div>
                            {peakId && <PeakActivityIndicator peakId={peakId} compact />}
                        </div>
                        {/* Summit status badge */}
                        <div className="mt-2 flex items-center gap-2">
                            {isAuthenticated ? (
                                userSummits > 0 ? (
                                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-summited/10 border border-summited/30">
                                        <CheckCircle className="w-3 h-3 text-summited" />
                                        <span className="text-xs font-medium text-summited">
                                            Summited {userSummits}x
                                        </span>
                                    </div>
                                ) : (
                                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted/30 border border-border/50">
                                        <Mountain className="w-3 h-3 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">
                                            Not summited
                                        </span>
                                    </div>
                                )
                            ) : (
                                <button
                                    onClick={() => requireAuth(() => {})}
                                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/5 border border-primary/20 hover:bg-primary/10"
                                >
                                    <LogIn className="w-3 h-3 text-primary" />
                                    <span className="text-xs text-primary">Log in</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-y-auto px-2">
                        {exploreSubTab === "myActivity" ? (
                            isAuthenticated ? (
                                <PeakUserActivity
                                    highlightedActivityId={highlightedActivityId}
                                    onHighlightActivity={setHighlightedActivityId}
                                />
                            ) : (
                                <div className="text-center py-10">
                                    <BookOpen className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-50" />
                                    <p className="text-sm font-medium text-muted-foreground mb-3">
                                        Log in to see your summit history
                                    </p>
                                    <Button
                                        onClick={() => requireAuth(() => {})}
                                        variant="outline"
                                        className="gap-2"
                                    >
                                        <LogIn className="w-4 h-4" />
                                        Log In
                                    </Button>
                                </div>
                            )
                        ) : (
                            <PeakCommunity />
                        )}
                    </div>

                    {/* CTA Footer */}
                    {isAuthenticated && hasUnreportedSummits && exploreSubTab === "community" && (
                        <div className="p-3 border-t border-border/60 bg-gradient-to-t from-primary/5 to-transparent">
                            <Button
                                onClick={() => setExploreSubTab("myActivity")}
                                className="w-full gap-2 bg-primary hover:bg-primary/90 text-sm"
                                size="sm"
                            >
                                <Plus className="w-4 h-4" />
                                Share Your Experience
                            </Button>
                        </div>
                    )}
                </div>
            );
        }

        // Challenge detail
        if (contentType === "challenge" && challenge) {
            if (exploreSubTab === "peaks" && challengePeaks) {
                return (
                    <div className="p-4 space-y-4">
                        <div className="flex items-center gap-2">
                            <Mountain className="w-4 h-4 text-secondary" />
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                                {challengePeaks.length} Peaks
                            </h2>
                        </div>
                        <div className="space-y-1">
                            {[...challengePeaks]
                                .sort((a, b) => (b.elevation || 0) - (a.elevation || 0))
                                .map((p) => (
                                    <PeakRow
                                        key={p.id}
                                        peak={p}
                                        onPeakClick={handlePeakClick}
                                        onHoverStart={handlePeakHoverStart}
                                        onHoverEnd={handlePeakHoverEnd}
                                    />
                                ))}
                        </div>
                    </div>
                );
            }
            // Default to progress/details view
            return (
                <div className="p-4">
                    <ChallengeDetailsMobile
                        challenge={challenge}
                        peaks={challengePeaks}
                        isFavorited={isFavorited}
                        onClose={handleClose}
                        onToggleFavorite={handleToggleFavorite}
                        onShowOnMap={handleShowChallengeOnMap}
                    />
                </div>
            );
        }

        // Activity detail
        if (contentType === "activity" && activity) {
            if (exploreSubTab === "summits") {
                return (
                    <div className="p-4">
                        <ActivitySummitsList
                            summits={activitySummits}
                            activityId={activityId!}
                            onSummitHover={setHoveredPeakId}
                            isOwner={isActivityOwner}
                        />
                    </div>
                );
            }
            if (exploreSubTab === "analytics") {
                return (
                    <div className="p-4">
                        <ActivityAnalytics activity={activity} />
                    </div>
                );
            }
            // Default to details view
            return (
                <div className="p-4">
                    <ActivityDetailsMobile
                        activity={activity}
                        summits={activitySummits}
                        onClose={handleClose}
                        onShowOnMap={flyToActivity}
                        onHover={setActivityHoverCoords}
                    />
                </div>
            );
        }

        // Profile detail (other users)
        if (contentType === "profile" && profileUser && profileStats) {
            if (exploreSubTab === "peaks") {
                return <ProfileSummitsList userId={userId!} compact />;
            }
            if (exploreSubTab === "details") {
                return <ProfileJournal userId={userId!} />;
            }
            if (exploreSubTab === "summits") {
                return <ProfileChallenges userId={userId!} />;
            }
            // Default to profile view
            return (
                <div className="p-4">
                    <ProfileDetailsMobile
                        user={profileUser}
                        stats={profileStats}
                        onClose={handleClose}
                        onShowOnMap={showProfileOnMap}
                    />
                </div>
            );
        }

        return (
            <div className="text-center py-10 px-4">
                <Compass className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-foreground font-medium">Explore the map</p>
                <p className="text-sm text-muted-foreground mt-1">
                    Pan and zoom to discover peaks and challenges
                </p>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full">
            {/* Sub-tab bar (only show when detail is open) */}
            {hasDetail && (
                <div className="px-4 py-2 border-b border-border/60 shrink-0 flex items-center gap-2">
                    <button
                        onClick={handleBack}
                        className="p-1.5 rounded-md hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={exploreBackStack.length > 0 ? "Go back" : "Back to discovery"}
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    {renderSubTabs()}
                </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={`${contentType}-${exploreSubTab}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.15 }}
                    >
                        {renderContent()}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ExploreTabContent;

