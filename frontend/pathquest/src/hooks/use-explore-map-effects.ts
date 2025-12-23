"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import Peak from "@/typeDefs/Peak";
import Summit from "@/typeDefs/Summit";
import Activity from "@/typeDefs/Activity";
import { ExploreContentType } from "@/hooks/use-explore-route";
import { ExploreSubTab } from "@/store/tabStore";
import { useMapStore } from "@/providers/MapProvider";
import { setPeaksSearchDisabled } from "@/helpers/peaksSearchState";
import convertPeaksToGeoJSON from "@/helpers/convertPeaksToGeoJSON";
import convertActivitiesToGeoJSON from "@/helpers/convertActivitiesToGeoJSON";
import { waitForMapSource, waitForMapSources, clearMapSource, clearMapSources } from "@/lib/map/waitForMapSource";
import { useActivityMapEffects } from "@/hooks/use-activity-map-effects";
import { useProfileMapEffects } from "@/hooks/use-profile-map-effects";

interface UseExploreMapEffectsParams {
    contentType: ExploreContentType;
    exploreSubTab: ExploreSubTab;
    isAuthenticated: boolean;

    // Peak
    peakId: string | null;
    peak: Peak | null;
    peakActivities: Activity[] | null;
    publicSummits: Summit[] | null;
    setHighlightedActivityId: (id: string | null) => void;

    // Challenge
    challengeId: number | null;
    challengePeaks: Peak[] | null;

    // User challenge
    userChallengeUserId: string | null;
    userChallengeChallengeId: string | null;
    userChallengePeaks: Array<Peak & { is_summited?: boolean }> | null;

    // Activity
    activity: Activity | null;
    activityPeakSummits: Peak[];
    activityHoverCoords: [number, number] | null;

    // Profile
    userId: string | null;
    profilePeaksForMap: Peak[];
}

export function useExploreMapEffects(params: UseExploreMapEffectsParams) {
    const map = useMapStore((state) => state.map);
    const setDisablePeaksSearch = useMapStore((state) => state.setDisablePeaksSearch);
    const setSelectedPeakUserData = useMapStore((state) => state.setSelectedPeakUserData);
    const setSelectedPeakCommunityData = useMapStore((state) => state.setSelectedPeakCommunityData);

    const hasChallengeFitBoundsRef = useRef(false);
    const lastChallengeIdRef = useRef<number | null>(null);
    const hasUserChallengeFitBoundsRef = useRef(false);
    const lastUserChallengeKeyRef = useRef<string | null>(null);

    const {
        contentType,
        exploreSubTab,
        isAuthenticated,
        peakId,
        peak,
        peakActivities,
        publicSummits,
        setHighlightedActivityId,
        challengeId,
        challengePeaks,
        userChallengeUserId,
        userChallengeChallengeId,
        userChallengePeaks,
        activity,
        activityPeakSummits,
        activityHoverCoords,
        userId,
        profilePeaksForMap,
    } = params;

    // Activity map effects
    // Note: padding is controlled by MapBackground based on drawer height
    const { flyToActivity } = useActivityMapEffects({
        activity,
        peakSummits: activityPeakSummits,
        hoverCoords: activityHoverCoords,
        flyToOnLoad: true,
    });

    // Profile map effects
    // Only show peaks on map when on the "peaks" subtab
    useProfileMapEffects({
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
    }, [peak, peakActivities, isAuthenticated, peakId, setSelectedPeakUserData, setHighlightedActivityId]);

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
            const sources = await waitForMapSources(map, ["activities", "activityStarts"]);
            if (sources.activities && sources.activityStarts) {
                const [lineStrings, starts] = convertActivitiesToGeoJSON(peakActivities);
                sources.activities.setData(lineStrings);
                sources.activityStarts.setData(starts);
            }
        };

        setActivitiesOnMap();

        return () => {
            clearMapSources(map, ["activities", "activityStarts"]);
        };
    }, [map, peakActivities]);

    // Handle peak map effects - fly to peak
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
            const peaksSource = await waitForMapSource(map, "selectedPeaks");
            if (peaksSource) {
                peaksSource.setData(convertPeaksToGeoJSON([peak]));
            }
        };

        setSelectedPeakSource();

        return () => {
            if (!peakId) return;
            clearMapSource(map, "selectedPeaks");
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
            const selectedPeaksSource = await waitForMapSource(map, "selectedPeaks");
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
            if (!challengeId) return;
            clearMapSource(map, "selectedPeaks");
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
            const selectedPeaksSource = await waitForMapSource(map, "selectedPeaks");
            if (selectedPeaksSource) {
                // convertPeaksToGeoJSON handles is_summited → summits normalization
                selectedPeaksSource.setData(convertPeaksToGeoJSON(userChallengePeaks));
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
            if (contentType !== "userChallenge") return;
            clearMapSource(map, "selectedPeaks");
        };
    }, [map, userChallengePeaks, userChallengeUserId, userChallengeChallengeId, contentType]);

    return {
        flyToActivity,
    };
}


