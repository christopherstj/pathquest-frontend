"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, useAnimation, PanInfo, AnimatePresence } from "framer-motion";
import { ArrowRight, Trophy, TrendingUp, Mountain, X, MapPin, CheckCircle, Navigation, ChevronRight, Heart, Map as MapIcon, LayoutDashboard, Compass, ZoomIn, RefreshCw, Route, Users, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMapStore } from "@/providers/MapProvider";
import { useRouter, usePathname } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import getPeakDetails from "@/actions/peaks/getPeakDetails";
import getPublicChallengeDetails from "@/actions/challenges/getPublicChallengeDetails";
import addChallengeFavorite from "@/actions/challenges/addChallengeFavorite";
import deleteChallengeFavorite from "@/actions/challenges/deleteChallengeFavorite";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import DashboardContent from "./DashboardContent";
import PeakUserActivity from "./PeakUserActivity";
import PeakCommunity from "./PeakCommunity";
import mapboxgl from "mapbox-gl";
import convertPeaksToGeoJSON from "@/helpers/convertPeaksToGeoJSON";
import convertActivitiesToGeoJSON from "@/helpers/convertActivitiesToGeoJSON";
import { setPeaksSearchDisabled } from "@/helpers/peaksSearchState";
import metersToFt from "@/helpers/metersToFt";
import useRequireAuth, { useIsAuthenticated } from "@/hooks/useRequireAuth";
import getActivitiesProcessing from "@/actions/users/getActivitiesProcessing";
import CurrentConditions from "../app/peaks/CurrentConditions";

type DrawerHeight = "collapsed" | "halfway" | "expanded";
type TabMode = "details" | "discover" | "dashboard" | "myActivity" | "community";

const DRAWER_HEIGHTS = {
    collapsed: 60,
    halfway: typeof window !== "undefined" ? window.innerHeight * 0.45 : 400,
    expanded: typeof window !== "undefined" ? window.innerHeight - 80 : 600,
};

interface Props {
    peakId?: string | null;
    challengeId?: number | null;
    onClose: () => void;
}

const DetailBottomSheet = ({ peakId, challengeId, onClose }: Props) => {
    const visiblePeaks = useMapStore((state) => state.visiblePeaks);
    const visibleChallenges = useMapStore((state) => state.visibleChallenges);
    const map = useMapStore((state) => state.map);
    const setDisablePeaksSearch = useMapStore((state) => state.setDisablePeaksSearch);
    const isZoomedOutTooFar = useMapStore((state) => state.isZoomedOutTooFar);
    const setSelectedPeakUserData = useMapStore((state) => state.setSelectedPeakUserData);
    const setSelectedPeakCommunityData = useMapStore((state) => state.setSelectedPeakCommunityData);
    const router = useRouter();
    const routerRef = useRef(router);
    const controls = useAnimation();
    const requireAuth = useRequireAuth();
    const queryClient = useQueryClient();
    const { isAuthenticated, isLoading: authLoading } = useIsAuthenticated();
    
    const hasDetail = Boolean(peakId || challengeId);
    const hasPeakSelected = Boolean(peakId);
    const [activeTab, setActiveTab] = useState<TabMode>("discover");
    const [drawerHeight, setDrawerHeight] = useState<DrawerHeight>("halfway");
    const [heights, setHeights] = useState(DRAWER_HEIGHTS);
    const [hasInitializedTab, setHasInitializedTab] = useState(false);
    const [highlightedActivityId, setHighlightedActivityId] = useState<string | null>(null);

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

    // Fetch sync status (only when authenticated and on dashboard tab)
    const { data: processingResult } = useQuery({
        queryKey: ["activitiesProcessing"],
        queryFn: getActivitiesProcessing,
        enabled: isAuthenticated && activeTab === "dashboard",
        refetchInterval: activeTab === "dashboard" ? 10000 : false,
    });

    const syncCount = processingResult?.success ? processingResult.data : 0;

    const peak = peakData?.success ? peakData.data?.peak : null;
    const peakChallenges = peakData?.success ? peakData.data?.challenges : null;
    const publicSummits = peakData?.success ? peakData.data?.publicSummits : null;
    const peakActivities = peakData?.success ? peakData.data?.activities : null;
    
    const challenge = challengeData?.success ? challengeData.data?.challenge : null;
    const challengePeaks = challengeData?.success ? challengeData.data?.peaks : null;

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
            const activitiesSource = map.getSource("activities") as mapboxgl.GeoJSONSource | undefined;
            const activityStartsSource = map.getSource("activityStarts") as mapboxgl.GeoJSONSource | undefined;

            if (activitiesSource) {
                activitiesSource.setData({
                    type: "FeatureCollection",
                    features: [],
                });
            }
            if (activityStartsSource) {
                activityStartsSource.setData({
                    type: "FeatureCollection",
                    features: [],
                });
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
                // For peaks: authenticated users go to myActivity, others go to community
                setActiveTab(isAuthenticated ? "myActivity" : "community");
            } else {
                // For challenges: always go to details
                setActiveTab("details");
            }
            // If drawer is full-screen, bring it down to half-height
            // If already at halfway or collapsed, keep it as-is
            if (drawerHeight === "expanded") {
                setDrawerHeight("halfway");
            }
        }
    }, [hasDetail, peakId, challengeId, hasInitializedTab, hasPeakSelected, isAuthenticated]);

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
            const peaksSource = map.getSource("selectedPeaks") as mapboxgl.GeoJSONSource | undefined;
            if (peaksSource) {
                peaksSource.setData({ type: "FeatureCollection", features: [] });
            }
        };
    }, [map, peak]);

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

        // Fit map to challenge bounds
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

        return () => {
            const selectedPeaksSource = map.getSource("selectedPeaks") as mapboxgl.GeoJSONSource | undefined;
            if (selectedPeaksSource) {
                selectedPeaksSource.setData({ type: "FeatureCollection", features: [] });
            }
        };
    }, [map, challengePeaks, heights.halfway]);

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

    const isFavorited = challenge?.is_favorited ?? false;

    const handleToggleFavorite = () => {
        if (!challengeId) return;
        
        requireAuth(async () => {
            if (isFavorited) {
                await deleteChallengeFavorite(String(challengeId));
            } else {
                await addChallengeFavorite(String(challengeId));
            }
            // Invalidate queries to refresh data
            queryClient.invalidateQueries({
                queryKey: ["challengeDetails", challengeId],
            });
            queryClient.invalidateQueries({
                queryKey: ["favoriteChallenges"],
            });
        });
    };

    const handleTabChange = (tab: TabMode) => {
        setActiveTab(tab);
        // Expand drawer when switching tabs if collapsed
        if (drawerHeight === "collapsed") {
            setDrawerHeight("halfway");
        }
    };

    const isLoading = (peakId && peakLoading) || (challengeId && challengeLoading);

    // Render peak details content
    const renderPeakDetails = () => {
        if (!peak) return null;
        
        const location = [peak.county, peak.state, peak.country].filter(Boolean).join(", ");
        
        return (
            <div className="space-y-5">
                {/* Header */}
                <div className="relative">
                    <button 
                        onClick={onClose}
                        className="absolute top-0 right-0 p-2 rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Close peak details"
                        tabIndex={0}
                    >
                        <X className="w-4 h-4" />
                    </button>
                    
                    <div className="flex items-center gap-2 mb-2 text-primary">
                        <span className="px-2 py-1 rounded-full border border-border/70 bg-muted/60 text-[11px] font-mono uppercase tracking-[0.18em] flex items-center gap-1">
                            <Mountain className="w-3.5 h-3.5" />
                            Peak
                        </span>
                    </div>
                    
                    <h1 className="text-xl font-bold text-foreground pr-8" style={{ fontFamily: "var(--font-display)" }}>{peak.name}</h1>
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
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Elevation</p>
                        <p className="text-lg font-mono text-foreground">{peak.elevation ? Math.round(metersToFt(peak.elevation)).toLocaleString() : 0} ft</p>
                    </div>
                    <div className="p-3 rounded-xl bg-card border border-border/70">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Summits</p>
                        <p className="text-lg font-mono text-foreground">{peak.public_summits || publicSummits?.length || 0}</p>
                    </div>
                </div>

                {/* Current Conditions */}
                {peak.location_coords && (
                    <CurrentConditions
                        lat={peak.location_coords[1]}
                        lng={peak.location_coords[0]}
                    />
                )}

                {/* Actions */}
                <div className="flex gap-2">
                    {!isAuthenticated && (
                        <Button 
                            onClick={() => requireAuth()}
                            className="flex-1 gap-2 h-9 text-sm bg-green-600 hover:bg-green-700 text-white"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Log Summit
                        </Button>
                    )}
                    <Button variant="outline" onClick={handleFlyToPeak} className={cn("gap-2 h-9 text-sm border-primary/20 hover:bg-primary/10", isAuthenticated ? "flex-1" : "")}>
                        <Navigation className="w-3.5 h-3.5" />
                        Fly to Peak
                    </Button>
                </div>

                {/* Challenges */}
                {peakChallenges && peakChallenges.length > 0 && (
                    <div className="space-y-2">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Part of {peakChallenges.length} Challenge{peakChallenges.length !== 1 ? "s" : ""}
                        </h3>
                        <div className="space-y-1.5">
                            {peakChallenges.slice(0, 3).map((ch) => (
                                <Link
                                    key={ch.id}
                                    href={`/challenges/${ch.id}`}
                                    className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border/70 hover:bg-card/80 transition-colors group"
                                >
                                    <span className="text-sm font-medium text-foreground">{ch.name}</span>
                                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // Render challenge details content
    const renderChallengeDetails = () => {
        if (!challenge) return null;
        
        const summittedPeaks = challengePeaks?.filter((p) => p.summits && p.summits > 0).length || 0;
        const totalPeaks = challengePeaks?.length || challenge.num_peaks || 0;
        const progressPercent = totalPeaks > 0 ? Math.round((summittedPeaks / totalPeaks) * 100) : 0;

        return (
            <div className="space-y-5">
                {/* Header */}
                <div className="relative">
                    <button 
                        onClick={onClose}
                        className="absolute top-0 right-0 p-2 rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Close challenge details"
                        tabIndex={0}
                    >
                        <X className="w-4 h-4" />
                    </button>
                    
                    <div className="flex items-center gap-2 mb-2 text-secondary">
                        <span className="px-2 py-1 rounded-full border border-border/70 bg-muted/60 text-[11px] font-mono uppercase tracking-[0.18em] flex items-center gap-1">
                            <Trophy className="w-3.5 h-3.5" />
                            Challenge
                        </span>
                    </div>
                    
                    <h1 className="text-xl font-bold text-foreground pr-8" style={{ fontFamily: "var(--font-display)" }}>{challenge.name}</h1>
                    {challenge.region && (
                        <div className="mt-1 text-xs text-muted-foreground">{challenge.region}</div>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-xl bg-card border border-border/70">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Total Peaks</p>
                        <p className="text-lg font-mono text-foreground">{totalPeaks}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-card border border-border/70">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Summitted</p>
                        <p className="text-lg font-mono text-foreground">
                            {summittedPeaks}
                            <span className="text-xs text-muted-foreground ml-1">({progressPercent}%)</span>
                        </p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Progress</span>
                        <span>{summittedPeaks} / {totalPeaks}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                            className="h-full bg-secondary rounded-full transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <Button
                        onClick={handleToggleFavorite}
                        className={`flex-1 gap-2 h-9 text-sm ${
                            isFavorited
                                ? "bg-secondary/20 text-secondary hover:bg-secondary/30 border border-secondary/30"
                                : "bg-secondary text-secondary-foreground hover:bg-secondary/90"
                        }`}
                        variant={isFavorited ? "outline" : "default"}
                    >
                        <Heart className={`w-3.5 h-3.5 ${isFavorited ? "fill-current" : ""}`} />
                        {isFavorited ? "Accepted" : "Accept"}
                    </Button>
                    <Button variant="outline" onClick={handleShowChallengeOnMap} className="flex-1 gap-2 h-9 text-sm border-secondary/20 hover:bg-secondary/10">
                        <MapIcon className="w-3.5 h-3.5" />
                        Show on Map
                    </Button>
                </div>

                {/* Peaks List */}
                {challengePeaks && challengePeaks.length > 0 && (
                    <div className="space-y-2">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Peaks in Challenge
                        </h3>
                        <div className="space-y-1.5 max-h-[200px] overflow-y-auto custom-scrollbar">
                            {[...challengePeaks].sort((a, b) => (b.elevation || 0) - (a.elevation || 0)).map((pk) => (
                                <Link
                                    key={pk.id}
                                    href={`/peaks/${pk.id}`}
                                    className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border/70 hover:bg-card/80 transition-colors group"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <Mountain
                                            className={`w-3.5 h-3.5 ${
                                                pk.summits && pk.summits > 0 ? "text-green-500" : "text-muted-foreground"
                                            }`}
                                        />
                                        <div>
                                            <span className="text-sm font-medium text-foreground block">{pk.name}</span>
                                            <span className="text-xs text-muted-foreground">{pk.elevation ? Math.round(metersToFt(pk.elevation)).toLocaleString() : 0} ft</span>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    // Render discovery content
    const renderDiscoveryContent = () => (
        <div className="space-y-5">
            {/* Challenges */}
            {visibleChallenges.length > 0 && (
                <section>
                    <div className="flex items-center gap-2 mb-3">
                        <Trophy className="w-4 h-4 text-secondary" />
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Visible Challenges</h2>
                    </div>
                    <div className="space-y-2">
                        {visibleChallenges.map((ch) => (
                            <div 
                                key={ch.id} 
                                onClick={() => handleChallengeClick(ch.id)}
                                onKeyDown={(e) => e.key === "Enter" && handleChallengeClick(ch.id)}
                                tabIndex={0}
                                role="button"
                                aria-label={`View challenge: ${ch.name}`}
                                className="group relative overflow-hidden rounded-xl bg-card border border-border/70 p-3 hover:border-primary/50 transition-colors cursor-pointer"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-medium text-sm group-hover:text-primary transition-colors">{ch.name}</h3>
                                        <p className="text-xs text-muted-foreground mt-0.5">{ch.num_peaks} Peaks</p>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                </div>
                                <div className={cn("absolute bottom-0 left-0 h-0.5 w-full opacity-50 bg-primary")} />
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Peaks */}
            {visiblePeaks.length > 0 && (
                <section>
                    <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Visible Peaks</h2>
                    </div>
                    <div className="space-y-1.5">
                        {visiblePeaks.map((pk) => (
                            <div 
                                key={pk.id} 
                                onClick={() => handlePeakClick(pk.id, pk.location_coords)}
                                onKeyDown={(e) => e.key === "Enter" && handlePeakClick(pk.id, pk.location_coords)}
                                tabIndex={0}
                                role="button"
                                aria-label={`View peak: ${pk.name}`}
                                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/60 transition-colors cursor-pointer group"
                            >
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <Mountain className="w-3.5 h-3.5" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm group-hover:text-primary-foreground transition-colors">{pk.name}</p>
                                        <p className="text-xs font-mono text-muted-foreground">{pk.elevation ? `${Math.round(metersToFt(pk.elevation)).toLocaleString()} ft` : ''}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {visibleChallenges.length === 0 && visiblePeaks.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                    {isZoomedOutTooFar ? (
                        <>
                            <ZoomIn className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                            <p className="text-sm font-medium">Zoom in to explore</p>
                            <p className="text-xs mt-1">Zoom in on the map to see peaks and challenges in that area.</p>
                        </>
                    ) : (
                        <>
                            <p className="text-sm">No peaks or challenges visible in this area.</p>
                            <p className="text-xs mt-1">Try moving the map or zooming out.</p>
                        </>
                    )}
                </div>
            )}
        </div>
    );

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
                                {peakId ? renderPeakDetails() : challengeId ? renderChallengeDetails() : (
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
                                {renderDiscoveryContent()}
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
