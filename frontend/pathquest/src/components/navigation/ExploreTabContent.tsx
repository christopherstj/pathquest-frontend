"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Mountain, Users, Route, Trophy, BarChart3, BookOpen, ArrowLeft, Compass, CheckCircle, LogIn, Plus, Info, User, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMapStore } from "@/providers/MapProvider";
import { useTabStore, ExploreSubTab } from "@/store/tabStore";
import useRequireAuth, { useIsAuthenticated } from "@/hooks/useRequireAuth";
import mapboxgl from "mapbox-gl";

// Data fetching actions
import getPeakDetails from "@/actions/peaks/getPeakDetails";
import getPublicChallengeDetails from "@/actions/challenges/getPublicChallengeDetails";
import getChallengeDetails from "@/actions/challenges/getChallengeDetails";
import getNextPeakSuggestion from "@/actions/challenges/getNextPeakSuggestion";
import getChallengeActivity from "@/actions/challenges/getChallengeActivity";
import getActivityDetails from "@/actions/activities/getActivityDetails";
import getUserProfile from "@/actions/users/getUserProfile";
import getUserChallengeProgress from "@/actions/users/getUserChallengeProgress";
import addChallengeFavorite from "@/actions/challenges/addChallengeFavorite";
import deleteChallengeFavorite from "@/actions/challenges/deleteChallengeFavorite";

// Hooks
import useUserLocation from "@/hooks/use-user-location";

// Mobile detail components
import PeakDetailsMobile from "@/components/overlays/mobile/peak-details-mobile";
import ChallengeDetailsMobile from "@/components/overlays/mobile/challenge-details-mobile";
import ActivityDetailsMobile from "@/components/overlays/mobile/activity-details-mobile";
import ProfileDetailsMobile from "@/components/overlays/mobile/profile-details-mobile";
import DiscoveryContentMobile from "@/components/overlays/mobile/discovery-content-mobile";

// Content components
import PeakUserActivity from "@/components/overlays/PeakUserActivity";
import PeakCommunity from "@/components/overlays/PeakCommunity";
import PeakDetailsTab from "@/components/overlays/PeakDetailsTab";
import ProfileSummitsList from "@/components/overlays/ProfileSummitsList";
import ProfileJournal from "@/components/overlays/ProfileJournal";
import ProfileChallenges from "@/components/overlays/ProfileChallenges";
import ProfileStatsContent from "@/components/navigation/ProfileStatsContent";
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
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap flex-shrink-0",
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
    const hasUserChallengeFitBoundsRef = useRef(false);
    const lastUserChallengeKeyRef = useRef<string | null>(null);

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
    const userChallengeMatch = pathname.match(/^\/users\/([^\/]+)\/challenges\/([^\/]+)$/);

    const peakId = peakMatch?.[1] ?? null;
    const challengeId = challengeMatch?.[1] ? parseInt(challengeMatch[1], 10) : null;
    const activityId = activityMatch?.[1] ?? null;
    const userId = userMatch?.[1] ?? null;
    
    // User challenge page: /users/:userId/challenges/:challengeId
    const userChallengeUserId = userChallengeMatch?.[1] ?? null;
    const userChallengeChallengeId = userChallengeMatch?.[2] ?? null;

    const hasDetail = Boolean(peakId || challengeId || activityId || userId || userChallengeUserId);
    const contentType = peakId ? "peak" 
        : challengeId ? "challenge" 
        : activityId ? "activity" 
        : userChallengeUserId ? "userChallenge"
        : userId ? "profile" 
        : "discovery";

    // Set appropriate default sub-tab when content type changes
    // Community is now the default for peaks (core value prop)
    useEffect(() => {
        if (contentType === "peak") {
            setExploreSubTab("community");
        } else if (contentType === "challenge" || contentType === "userChallenge") {
            setExploreSubTab("progress");
        } else if (contentType === "activity") {
            setExploreSubTab("details");
        } else if (contentType === "profile") {
            setExploreSubTab("stats");
        } else {
            setExploreSubTab("discovery");
        }
    }, [contentType, peakId, challengeId, activityId, userId, userChallengeUserId, setExploreSubTab]);

    // Data fetching queries
    // placeholderData keeps previous data visible while refetching
    // This prevents empty states when switching tabs
    const { data: peakData, isLoading: peakLoading } = useQuery({
        queryKey: ["peakDetails", peakId],
        queryFn: async () => {
            if (!peakId) return null;
            return await getPeakDetails(peakId);
        },
        enabled: Boolean(peakId) && isActive,
        placeholderData: (previousData) => previousData,
    });

    const { data: challengeData, isLoading: challengeLoading } = useQuery({
        queryKey: ["challengeDetails", challengeId, isAuthenticated],
        queryFn: async () => {
            if (!challengeId) return null;
            // Use authenticated endpoint when logged in to get progress data
            if (isAuthenticated) {
                const data = await getChallengeDetails(String(challengeId));
                // Convert to ServerActionResult format for consistency
                return data ? { success: true, data } : { success: false, error: "Failed to fetch challenge details" };
            } else {
                // Use public endpoint for unauthenticated users
                return await getPublicChallengeDetails(String(challengeId));
            }
        },
        enabled: Boolean(challengeId) && isActive,
        placeholderData: (previousData) => previousData,
    });

    // User location for next peak suggestions
    const { location: userLocation } = useUserLocation({ requestOnMount: Boolean(challengeId) });

    // Next peak suggestion query
    const { data: nextPeakData } = useQuery({
        queryKey: ["nextPeakSuggestion", challengeId, userLocation?.lat, userLocation?.lng],
        queryFn: async () => {
            if (!challengeId) return null;
            return await getNextPeakSuggestion(
                String(challengeId),
                userLocation?.lat,
                userLocation?.lng
            );
        },
        enabled: Boolean(challengeId) && isActive && Boolean(userLocation),
        placeholderData: (previousData) => previousData,
    });

    // Challenge community activity query
    const { data: challengeActivityData } = useQuery({
        queryKey: ["challengeActivity", challengeId],
        queryFn: async () => {
            if (!challengeId) return null;
            return await getChallengeActivity(String(challengeId));
        },
        enabled: Boolean(challengeId) && isActive,
        placeholderData: (previousData) => previousData,
    });

    const { data: activityData, isLoading: activityLoading } = useQuery({
        queryKey: ["activityDetails", activityId],
        queryFn: async () => {
            if (!activityId) return null;
            return await getActivityDetails(activityId);
        },
        enabled: Boolean(activityId) && isActive,
        placeholderData: (previousData) => previousData,
    });

    const { data: profileData, isLoading: profileLoading } = useQuery({
        queryKey: ["userProfile", userId],
        queryFn: async () => {
            if (!userId) return null;
            return await getUserProfile(userId);
        },
        enabled: Boolean(userId) && isActive,
        placeholderData: (previousData) => previousData,
    });

    // User challenge progress query (for /users/:userId/challenges/:challengeId)
    const { data: userChallengeData, isLoading: userChallengeLoading } = useQuery({
        queryKey: ["userChallengeProgress", userChallengeUserId, userChallengeChallengeId],
        queryFn: async () => {
            if (!userChallengeUserId || !userChallengeChallengeId) return null;
            return await getUserChallengeProgress(userChallengeUserId, userChallengeChallengeId);
        },
        enabled: Boolean(userChallengeUserId && userChallengeChallengeId) && isActive,
        placeholderData: (previousData) => previousData,
    });

    // Refetch queries when tab becomes active again
    // This ensures data is fresh when returning to the Explore tab
    useEffect(() => {
        if (!isActive) return;

        // Refetch active queries when tab becomes active
        if (peakId) {
            queryClient.refetchQueries({ queryKey: ["peakDetails", peakId] });
        }
        if (challengeId) {
            queryClient.refetchQueries({ queryKey: ["challengeDetails", challengeId] });
        }
        if (activityId) {
            queryClient.refetchQueries({ queryKey: ["activityDetails", activityId] });
        }
        if (userId) {
            queryClient.refetchQueries({ queryKey: ["userProfile", userId] });
        }
        if (userChallengeUserId && userChallengeChallengeId) {
            queryClient.refetchQueries({ queryKey: ["userChallengeProgress", userChallengeUserId, userChallengeChallengeId] });
        }
    }, [isActive, peakId, challengeId, activityId, userId, userChallengeUserId, userChallengeChallengeId, queryClient]);

    // Extract data from queries
    const peak = peakData?.success ? peakData.data?.peak : null;
    const peakChallenges = peakData?.success ? peakData.data?.challenges : null;
    const publicSummits = peakData?.success ? peakData.data?.publicSummits : null;
    const peakActivities = peakData?.success ? peakData.data?.activities : null;

    const challenge = challengeData?.success ? challengeData.data?.challenge : null;
    const challengePeaks = challengeData?.success ? challengeData.data?.peaks : null;
    const challengeProgress = challengeData?.success ? challengeData.data?.progress : null;
    const nextPeakSuggestion = nextPeakData?.success ? nextPeakData.data : null;
    const communityActivity = challengeActivityData?.success ? challengeActivityData.data : null;
    const isFavorited = challenge?.is_favorited ?? false;

    const activity = activityData?.activity ?? null;
    const activitySummits = activityData?.summits ?? [];
    const isActivityOwner = activityData?.isOwner ?? false;
    const activityPeakSummits = useMemo(() => convertSummitsToPeaks(activitySummits), [activitySummits]);

    const profileResult = profileData?.success ? profileData.data : null;
    const profileUser = profileResult?.user ?? null;
    const profileStats = profileResult?.stats ?? null;
    const profilePeaksForMap = profileResult?.peaksForMap ?? [];

    // User challenge data
    const userChallengeResult = userChallengeData?.success ? userChallengeData.data : null;
    const userChallengeChallenge = userChallengeResult?.challenge ?? null;
    const userChallengeProgress = userChallengeResult?.progress ?? null;
    const userChallengePeaks = userChallengeResult?.peaks ?? [];
    const userChallengeUser = userChallengeResult?.user ?? null;

    // Activity map effects
    // Note: padding is now controlled by MapBackground based on drawer height
    const { flyToActivity } = useActivityMapEffects({
        activity,
        peakSummits: activityPeakSummits,
        hoverCoords: activityHoverCoords,
        flyToOnLoad: true,
    });

    // Profile map effects
    // Note: padding is now controlled by MapBackground based on drawer height
    // Only show peaks on map when on the "peaks" subtab
    const { showOnMap: showProfileOnMap } = useProfileMapEffects({
        userId,
        peaks: profilePeaksForMap,
        showPeaksOnMap: contentType === "profile" && exploreSubTab === "peaks",
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
        } else if (!peakId || !isAuthenticated) {
            // Only clear if we're not viewing a peak anymore or user logged out
            setSelectedPeakUserData(null);
            setHighlightedActivityId(null);
        }
    }, [peak, peakActivities, isAuthenticated, peakId, setSelectedPeakUserData]);

    // Share community data with map store
    useEffect(() => {
        if (peak && peakId) {
            // Set data immediately when peak is available, even if publicSummits is still loading
            setSelectedPeakCommunityData({
                peakId: peakId,
                peakName: peak.name || "Unknown Peak",
                publicSummits: publicSummits || [],
            });
        } else if (!peakId) {
            // Only clear if we're not viewing a peak anymore
            setSelectedPeakCommunityData(null);
        }
        // Note: We don't clear in cleanup to avoid race conditions when navigating between peaks
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

    // Handle peak map effects - fly to peak (padding is controlled by MapBackground based on drawer height)
    useEffect(() => {
        if (!peak?.location_coords || !map || !peakId) return;
        
        map.flyTo({
            center: peak.location_coords,
            zoom: 13,
            pitch: 50,
            bearing: 20,
            essential: true,
        });
    }, [peakId, peak?.location_coords, map]);

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
            // Note: Don't reset map padding here - it's controlled by MapBackground based on drawer height
            if (map) {
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
    }, [map, challengePeaks, challengeId]);

    // Set user challenge peaks on map (with summited peaks marked)
    useEffect(() => {
        if (!map || !userChallengePeaks || userChallengePeaks.length === 0 || contentType !== "userChallenge") return;

        const userChallengeKey = `${userChallengeUserId}-${userChallengeChallengeId}`;
        if (userChallengeKey !== lastUserChallengeKeyRef.current) {
            hasUserChallengeFitBoundsRef.current = false;
            lastUserChallengeKeyRef.current = userChallengeKey;
        }

        const setUserChallengePeaksOnMap = async () => {
            let selectedPeaksSource = map.getSource("selectedPeaks") as mapboxgl.GeoJSONSource | undefined;
            let attempts = 0;
            const maxAttempts = 5;

            while (!selectedPeaksSource && attempts < maxAttempts) {
                attempts++;
                await new Promise((resolve) => setTimeout(resolve, 300));
                selectedPeaksSource = map.getSource("selectedPeaks") as mapboxgl.GeoJSONSource | undefined;
            }

            if (selectedPeaksSource) {
                // Convert peaks with summits property set based on is_summited
                const peaksForMap = userChallengePeaks.map(p => ({
                    ...p,
                    summits: p.is_summited ? 1 : 0,
                }));
                selectedPeaksSource.setData(convertPeaksToGeoJSON(peaksForMap));
            }

            if (map.getLayer("selectedPeaks")) {
                map.moveLayer("selectedPeaks");
            }
        };

        setUserChallengePeaksOnMap();

        if (!hasUserChallengeFitBoundsRef.current) {
            const peakCoords = userChallengePeaks
                .filter((p) => p.location_coords)
                .map((p) => p.location_coords as [number, number]);

            if (peakCoords.length > 0) {
                hasUserChallengeFitBoundsRef.current = true;
                const bounds = new mapboxgl.LngLatBounds();
                peakCoords.forEach((coord) => bounds.extend(coord));
                map.fitBounds(bounds, {
                    maxZoom: 12,
                });
            }
        }

        return () => {
            if (!map || contentType !== "userChallenge") return;
            try {
                const selectedPeaksSource = map.getSource("selectedPeaks") as mapboxgl.GeoJSONSource | undefined;
                if (selectedPeaksSource) {
                    selectedPeaksSource.setData({ type: "FeatureCollection", features: [] });
                }
            } catch (error) {
                console.debug("Failed to cleanup selectedPeaks map source:", error);
            }
        };
    }, [map, userChallengePeaks, userChallengeUserId, userChallengeChallengeId, contentType]);

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
                essential: true,
            });
        }
    }, [pathname, pushExploreHistory, map]);

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
                essential: true,
            });
        }
    }, [peak, map]);

    const handleShowChallengeOnMap = useCallback(() => {
        if (!challengePeaks || challengePeaks.length === 0 || !map) return;

        const peakCoords = challengePeaks
            .filter((p) => p.location_coords)
            .map((p) => p.location_coords as [number, number]);

        if (peakCoords.length > 0) {
            const bounds = new mapboxgl.LngLatBounds();
            peakCoords.forEach((coord) => bounds.extend(coord));
            map.fitBounds(bounds, {
                maxZoom: 12,
            });
        }
    }, [challengePeaks, map]);

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

    const isLoading = (peakId && peakLoading) || (challengeId && challengeLoading) || (activityId && activityLoading) || (userId && profileLoading) || (userChallengeUserId && userChallengeLoading);

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
                        label="Journal"
                        isActive={exploreSubTab === "myActivity"}
                        onClick={() => setExploreSubTab("myActivity")}
                    />
                    <SubTabButton
                        icon={<Info className="w-3.5 h-3.5" />}
                        label="Details"
                        isActive={exploreSubTab === "details"}
                        onClick={() => setExploreSubTab("details")}
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

        if (contentType === "userChallenge") {
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
                <div className="flex gap-0.5 bg-muted/50 p-0.5 rounded-lg overflow-x-auto scrollbar-none">
                    <SubTabButton
                        icon={<BarChart3 className="w-3.5 h-3.5" />}
                        label="Stats"
                        isActive={exploreSubTab === "stats"}
                        onClick={() => setExploreSubTab("stats")}
                    />
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
        if (contentType === "peak") {
            // Show loading state if peak data isn't ready yet
            if (!peak) {
                return (
                    <div className="flex items-center justify-center py-10">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                    </div>
                );
            }
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
                        ) : exploreSubTab === "details" ? (
                            <PeakDetailsTab 
                                peak={peak} 
                                challenges={peakChallenges}
                            />
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
        if (contentType === "challenge") {
            // Show error state if challenge not found
            if (!challenge) {
                return (
                    <div className="text-center py-10 px-4">
                        <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                        <p className="text-foreground font-medium">Challenge Not Found</p>
                        <p className="text-sm text-muted-foreground mt-1 mb-4">
                            This challenge doesn&apos;t exist.
                        </p>
                        <Button variant="outline" onClick={handleBack}>
                            Go Back
                        </Button>
                    </div>
                );
            }

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
                        progress={challengeProgress}
                        nextPeakSuggestion={nextPeakSuggestion}
                        communityActivity={communityActivity}
                        isFavorited={isFavorited}
                        onClose={handleClose}
                        onToggleFavorite={handleToggleFavorite}
                        onShowOnMap={handleShowChallengeOnMap}
                    />
                </div>
            );
        }

        // User challenge detail (viewing another user's progress)
        if (contentType === "userChallenge") {
            // Show error state if challenge or user not found
            if (!userChallengeChallenge || !userChallengeUser) {
                return (
                    <div className="text-center py-10 px-4">
                        <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                        <p className="text-foreground font-medium">Challenge Progress Not Found</p>
                        <p className="text-sm text-muted-foreground mt-1 mb-4">
                            This user or challenge doesn&apos;t exist.
                        </p>
                        <Button variant="outline" onClick={handleBack}>
                            Go Back
                        </Button>
                    </div>
                );
            }

            if (exploreSubTab === "peaks" && userChallengePeaks) {
                // Sort peaks: summited first, then by elevation
                const sortedPeaks = [...userChallengePeaks].sort((a, b) => {
                    // Summited peaks first
                    if (a.is_summited && !b.is_summited) return -1;
                    if (!a.is_summited && b.is_summited) return 1;
                    // Then by elevation
                    return (b.elevation || 0) - (a.elevation || 0);
                });

                return (
                    <div className="p-4 space-y-4">
                        {/* User header */}
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-secondary/10 to-primary/10 border border-secondary/20">
                            <div className="w-10 h-10 rounded-full bg-secondary/20 border border-secondary/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                                {userChallengeUser?.pic ? (
                                    <img
                                        src={userChallengeUser.pic}
                                        alt={userChallengeUser.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User className="w-5 h-5 text-secondary" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-foreground truncate">
                                    {userChallengeUser?.name}&apos;s Progress
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    on {userChallengeChallenge?.name}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Mountain className="w-4 h-4 text-secondary" />
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                                {userChallengePeaks.length} Peaks
                            </h2>
                        </div>
                        <div className="space-y-1">
                            {sortedPeaks.map((p) => (
                                <PeakRow
                                    key={p.id}
                                    peak={{
                                        ...p,
                                        summits: p.is_summited ? 1 : 0,
                                    }}
                                    onPeakClick={handlePeakClick}
                                    onHoverStart={handlePeakHoverStart}
                                    onHoverEnd={handlePeakHoverEnd}
                                />
                            ))}
                        </div>
                    </div>
                );
            }

            // Default to progress view - reuse ChallengeDetailsMobile but hide favorite button
            const progressPercent = userChallengeProgress && userChallengeProgress.total > 0 
                ? Math.round((userChallengeProgress.completed / userChallengeProgress.total) * 100) 
                : 0;

            return (
                <div className="p-4 space-y-5">
                    {/* User header */}
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-secondary/10 to-primary/10 border border-secondary/20">
                        <div className="w-10 h-10 rounded-full bg-secondary/20 border border-secondary/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {userChallengeUser.pic ? (
                                <img
                                    src={userChallengeUser.pic}
                                    alt={userChallengeUser.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <User className="w-5 h-5 text-secondary" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">
                                {userChallengeUser.name}&apos;s Progress
                            </p>
                            <p className="text-xs text-muted-foreground">
                                on {userChallengeChallenge.name}
                            </p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="p-3 rounded-xl bg-card border border-border/70">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
                                Total Peaks
                            </p>
                            <p className="text-lg font-mono text-foreground">
                                {userChallengeProgress?.total ?? userChallengePeaks.length}
                            </p>
                        </div>
                        <div className="p-3 rounded-xl bg-card border border-border/70">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">
                                Summited
                            </p>
                            <p className="text-lg font-mono text-foreground">
                                {userChallengeProgress?.completed ?? 0}
                                <span className="text-xs text-muted-foreground ml-1">
                                    ({progressPercent}%)
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Progress</span>
                            <span>
                                {userChallengeProgress?.completed ?? 0} / {userChallengeProgress?.total ?? userChallengePeaks.length}
                            </span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                                className="h-full bg-secondary rounded-full transition-all duration-500"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                        {progressPercent === 100 && (
                            <div className="flex items-center gap-2 text-sm text-summited">
                                <CheckCircle className="w-4 h-4" />
                                <span>Challenge complete!</span>
                            </div>
                        )}
                    </div>

                    {/* Last progress */}
                    {userChallengeProgress?.lastProgressDate && (
                        <div className="text-xs text-muted-foreground">
                            Last progress: {new Date(userChallengeProgress.lastProgressDate).toLocaleDateString()}
                        </div>
                    )}

                    {/* My Progress button - show for logged in users */}
                    {isAuthenticated && userChallengeChallengeId && (
                        <Link
                            href={`/challenges/${userChallengeChallengeId}`}
                            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg bg-secondary/10 hover:bg-secondary/20 border border-secondary/30 text-secondary font-medium text-sm transition-colors"
                        >
                            <User className="w-4 h-4" />
                            My Progress
                        </Link>
                    )}
                </div>
            );
        }

        // Activity detail
        if (contentType === "activity") {
            // Show error state if activity not found (404/unauthorized)
            if (!activity) {
                return (
                    <div className="text-center py-10 px-4">
                        <Route className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                        <p className="text-foreground font-medium">Activity Not Found</p>
                        <p className="text-sm text-muted-foreground mt-1 mb-4">
                            This activity may be private or doesn&apos;t exist.
                        </p>
                        <Button variant="outline" onClick={handleBack}>
                            Go Back
                        </Button>
                    </div>
                );
            }

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
        if (contentType === "profile") {
            // Show error state if profile not found (404/private)
            if (!profileUser || !profileStats) {
                return (
                    <div className="text-center py-10 px-4">
                        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                        <p className="text-foreground font-medium">Profile Not Found</p>
                        <p className="text-sm text-muted-foreground mt-1 mb-4">
                            This profile may be private or doesn&apos;t exist.
                        </p>
                        <Button variant="outline" onClick={handleBack}>
                            Go Back
                        </Button>
                    </div>
                );
            }

            if (exploreSubTab === "stats") {
                return <ProfileStatsContent userId={userId!} />;
            }
            if (exploreSubTab === "peaks") {
                return <ProfileSummitsList userId={userId!} compact />;
            }
            if (exploreSubTab === "details") {
                return <ProfileJournal userId={userId!} />;
            }
            if (exploreSubTab === "summits") {
                return <ProfileChallenges userId={userId!} />;
            }
            // Default to stats view
            return <ProfileStatsContent userId={userId!} />;
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

    // Render profile header for public profiles
    const renderProfileHeader = () => {
        if (contentType !== "profile" || !profileUser) return null;

        const location = [profileUser.city, profileUser.state, profileUser.country]
            .filter(Boolean)
            .join(", ");

        return (
            <div className="px-4 py-3 border-b border-border/60 bg-gradient-to-b from-primary/5 to-transparent">
                <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {profileUser.pic ? (
                            <img
                                src={profileUser.pic}
                                alt={profileUser.name || "User"}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <User className="w-6 h-6 text-primary" />
                        )}
                    </div>
                    
                    {/* Name and location */}
                    <div className="flex-1 min-w-0">
                        <h1 
                            className="text-lg font-bold text-foreground truncate"
                            style={{ fontFamily: "var(--font-display)" }}
                        >
                            {profileUser.name || "Anonymous"}
                        </h1>
                        {location && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <MapPin className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{location}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full">
            {/* Profile header (only for profile views) */}
            {renderProfileHeader()}

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

