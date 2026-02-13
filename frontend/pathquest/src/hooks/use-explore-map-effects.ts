"use client";

import { useEffect, useRef, useCallback } from "react";
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
import type { FireDetail, AvalancheZoneDetail, PublicLandDetail } from "@pathquest/shared/types";

/** Extract LngLatBounds from a GeoJSON geometry. */
function boundsFromGeometry(geojson: any): mapboxgl.LngLatBounds | null {
    const bounds = new mapboxgl.LngLatBounds();
    let count = 0;

    const extendRing = (coords: number[][]) => {
        for (const c of coords) {
            bounds.extend([c[0], c[1]] as [number, number]);
            count++;
        }
    };

    const processGeometry = (g: any) => {
        if (!g?.type) return;
        if (g.type === "Polygon") {
            for (const ring of g.coordinates) extendRing(ring);
        } else if (g.type === "MultiPolygon") {
            for (const poly of g.coordinates)
                for (const ring of poly) extendRing(ring);
        } else if (g.type === "GeometryCollection" && g.geometries) {
            for (const sub of g.geometries) processGeometry(sub);
        }
    };

    try {
        processGeometry(geojson);
    } catch {
        return null;
    }

    return count > 0 ? bounds : null;
}

/** Wrap a raw GeoJSON geometry in a Feature so Mapbox always gets a valid object. */
function toFeature(geometry: any): any {
    if (!geometry) return geometry;
    if (geometry.type === "Feature" || geometry.type === "FeatureCollection") return geometry;
    return { type: "Feature", properties: {}, geometry };
}

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

    // Fire
    fireDetail: FireDetail | null;

    // Avalanche Zone
    avalancheZoneDetail: AvalancheZoneDetail | null;

    // Public Land
    publicLandDetail: PublicLandDetail | null;
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
        fireDetail,
        avalancheZoneDetail,
        publicLandDetail,
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

    // Share community data with map store (only peakId and peakName needed for PeakCommunity)
    // PeakCommunity now fetches public summits directly via cursor pagination
    useEffect(() => {
        if (peak && peakId) {
            setSelectedPeakCommunityData({
                peakId: peakId,
                peakName: peak.name || "Unknown Peak",
                publicSummits: [], // No longer used - PeakCommunity fetches via cursor pagination
            });
        } else if (!peakId) {
            // Only clear if we're not viewing a peak anymore
            setSelectedPeakCommunityData(null);
        }
        // Note: We don't clear in cleanup to avoid race conditions when navigating between peaks
    }, [peak, peakId, setSelectedPeakCommunityData]);

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

    // Fire detail: highlight perimeter and fit to bounds
    useEffect(() => {
        if (!map || contentType !== "fire" || !fireDetail?.geometry) return;

        const sourceId = "fire-highlight";
        const layerId = "fire-highlight-fill";
        let cancelled = false;
        let hasFitBounds = false;

        const addLayers = () => {
            if (cancelled) return;
            try {
                if (!map.getSource(sourceId)) {
                    map.addSource(sourceId, {
                        type: "geojson",
                        data: toFeature(fireDetail.geometry),
                    });
                }
                if (!map.getLayer(layerId)) {
                    map.addLayer({
                        id: layerId,
                        type: "fill",
                        source: sourceId,
                        paint: { "fill-color": "#ef4444", "fill-opacity": 0.25 },
                    });
                }
                if (!map.getLayer(`${layerId}-outline`)) {
                    map.addLayer({
                        id: `${layerId}-outline`,
                        type: "line",
                        source: sourceId,
                        paint: { "line-color": "#ef4444", "line-width": 2, "line-opacity": 0.7 },
                    });
                }
            } catch {
                return; // Map not ready — will retry via style.load or idle
            }

            if (!hasFitBounds) {
                hasFitBounds = true;
                const geoBounds = boundsFromGeometry(fireDetail.geometry);
                if (geoBounds) {
                    map.fitBounds(geoBounds, { padding: 60, maxZoom: 14, essential: true });
                } else {
                    const zoom = fireDetail.acres && fireDetail.acres > 50000 ? 9 :
                                  fireDetail.acres && fireDetail.acres > 10000 ? 10 :
                                  fireDetail.acres && fireDetail.acres > 1000 ? 11 : 12;
                    map.flyTo({ center: fireDetail.centroid, zoom, essential: true });
                }
            }
        };

        if (map.isStyleLoaded()) addLayers();
        map.on("style.load", addLayers);
        map.once("idle", addLayers);

        return () => {
            cancelled = true;
            map.off("style.load", addLayers);
            map.off("idle", addLayers);
            if (map.getLayer(`${layerId}-outline`)) map.removeLayer(`${layerId}-outline`);
            if (map.getLayer(layerId)) map.removeLayer(layerId);
            if (map.getSource(sourceId)) map.removeSource(sourceId);
        };
    }, [map, contentType, fireDetail]);

    // Avalanche zone: highlight zone and fit to bounds
    useEffect(() => {
        if (!map || contentType !== "avalancheZone" || !avalancheZoneDetail?.geometry) return;

        const sourceId = "avy-zone-highlight";
        const layerId = "avy-zone-highlight-fill";
        let cancelled = false;
        let hasFitBounds = false;

        const todayDanger = avalancheZoneDetail.danger?.[0];
        const maxDanger = todayDanger
            ? Math.max(todayDanger.upper, todayDanger.middle, todayDanger.lower)
            : 0;
        const fillColor = maxDanger >= 4 ? "#ef4444" :
                          maxDanger >= 3 ? "#f97316" :
                          maxDanger >= 2 ? "#eab308" :
                          maxDanger >= 1 ? "#22c55e" : "#6b7280";

        const addLayers = () => {
            if (cancelled) return;
            try {
                if (!map.getSource(sourceId)) {
                    map.addSource(sourceId, {
                        type: "geojson",
                        data: toFeature(avalancheZoneDetail.geometry),
                    });
                }
                if (!map.getLayer(layerId)) {
                    map.addLayer({
                        id: layerId,
                        type: "fill",
                        source: sourceId,
                        paint: { "fill-color": fillColor, "fill-opacity": 0.2 },
                    });
                }
                if (!map.getLayer(`${layerId}-outline`)) {
                    map.addLayer({
                        id: `${layerId}-outline`,
                        type: "line",
                        source: sourceId,
                        paint: { "line-color": fillColor, "line-width": 2, "line-opacity": 0.6 },
                    });
                }
            } catch {
                return; // Map not ready — will retry via style.load or idle
            }

            if (!hasFitBounds) {
                hasFitBounds = true;
                const geoBounds = boundsFromGeometry(avalancheZoneDetail.geometry);
                if (geoBounds) {
                    map.fitBounds(geoBounds, { padding: 60, maxZoom: 12, essential: true });
                } else if (avalancheZoneDetail.centroid) {
                    map.flyTo({ center: avalancheZoneDetail.centroid, zoom: 9, essential: true });
                }
            }
        };

        if (map.isStyleLoaded()) addLayers();
        map.on("style.load", addLayers);
        map.once("idle", addLayers);

        return () => {
            cancelled = true;
            map.off("style.load", addLayers);
            map.off("idle", addLayers);
            if (map.getLayer(`${layerId}-outline`)) map.removeLayer(`${layerId}-outline`);
            if (map.getLayer(layerId)) map.removeLayer(layerId);
            if (map.getSource(sourceId)) map.removeSource(sourceId);
        };
    }, [map, contentType, avalancheZoneDetail]);

    // Public land: highlight boundary and fit to bounds
    useEffect(() => {
        if (!map || contentType !== "publicLand" || !publicLandDetail?.geometry) return;

        const sourceId = "public-land-highlight";
        const layerId = "public-land-highlight-fill";
        let cancelled = false;
        let hasFitBounds = false;

        const addLayers = () => {
            if (cancelled) return;
            try {
                if (!map.getSource(sourceId)) {
                    map.addSource(sourceId, {
                        type: "geojson",
                        data: toFeature(publicLandDetail.geometry),
                    });
                }
                if (!map.getLayer(layerId)) {
                    map.addLayer({
                        id: layerId,
                        type: "fill",
                        source: sourceId,
                        paint: { "fill-color": "#059669", "fill-opacity": 0.2 },
                    });
                }
                if (!map.getLayer(`${layerId}-outline`)) {
                    map.addLayer({
                        id: `${layerId}-outline`,
                        type: "line",
                        source: sourceId,
                        paint: { "line-color": "#059669", "line-width": 2, "line-opacity": 0.7 },
                    });
                }
            } catch {
                return; // Map not ready — will retry via style.load or idle
            }

            if (!hasFitBounds) {
                hasFitBounds = true;
                const geoBounds = boundsFromGeometry(publicLandDetail.geometry);
                if (geoBounds) {
                    map.fitBounds(geoBounds, { padding: 60, maxZoom: 14, essential: true });
                } else if (publicLandDetail.centroid) {
                    map.flyTo({ center: publicLandDetail.centroid, zoom: 10, essential: true });
                }
            }
        };

        if (map.isStyleLoaded()) addLayers();
        map.on("style.load", addLayers);
        map.once("idle", addLayers);

        return () => {
            cancelled = true;
            map.off("style.load", addLayers);
            map.off("idle", addLayers);
            if (map.getLayer(`${layerId}-outline`)) map.removeLayer(`${layerId}-outline`);
            if (map.getLayer(layerId)) map.removeLayer(layerId);
            if (map.getSource(sourceId)) map.removeSource(sourceId);
        };
    }, [map, contentType, publicLandDetail]);

    const recenterFire = useCallback(() => {
        if (!map || !fireDetail?.geometry) return;
        const geoBounds = boundsFromGeometry(fireDetail.geometry);
        if (geoBounds) {
            map.fitBounds(geoBounds, { padding: 60, maxZoom: 14, essential: true });
        } else {
            map.flyTo({ center: fireDetail.centroid, essential: true });
        }
    }, [map, fireDetail]);

    const recenterAvalancheZone = useCallback(() => {
        if (!map || !avalancheZoneDetail?.geometry) return;
        const geoBounds = boundsFromGeometry(avalancheZoneDetail.geometry);
        if (geoBounds) {
            map.fitBounds(geoBounds, { padding: 60, maxZoom: 12, essential: true });
        } else if (avalancheZoneDetail.centroid) {
            map.flyTo({ center: avalancheZoneDetail.centroid, zoom: 9, essential: true });
        }
    }, [map, avalancheZoneDetail]);

    const recenterPublicLand = useCallback(() => {
        if (!map || !publicLandDetail?.geometry) return;
        const geoBounds = boundsFromGeometry(publicLandDetail.geometry);
        if (geoBounds) {
            map.fitBounds(geoBounds, { padding: 60, maxZoom: 14, essential: true });
        } else if (publicLandDetail.centroid) {
            map.flyTo({ center: publicLandDetail.centroid, zoom: 10, essential: true });
        }
    }, [map, publicLandDetail]);

    return {
        flyToActivity,
        recenterFire,
        recenterAvalancheZone,
        recenterPublicLand,
    };
}


