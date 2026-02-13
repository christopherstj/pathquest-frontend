"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X, MapPin, Mountain, Trophy, Loader2, Users, User } from "lucide-react";
import { useIsAuthenticated } from "@/hooks/useRequireAuth";
import { useRouterRef } from "@/hooks/use-stable-ref";
import { cn } from "@/lib/utils";
import { useMapStore } from "@/providers/MapProvider";
import { useQuery } from "@tanstack/react-query";
import { useRouter, usePathname } from "next/navigation";
import { unifiedSearchClient } from "@/lib/client/unifiedSearchClient";
import type { PeakSearchResult, ChallengeSearchResult, UnifiedSearchResult } from "@pathquest/shared/types";
import metersToFt from "@/helpers/metersToFt";
import { getMapboxToken } from "@/lib/map/getMapboxToken";

interface SearchResult {
    id: string;
    type: "peak" | "challenge" | "place";
    title: string;
    subtitle?: string;
    coords?: [number, number];
    data?: any;
}

// Maximum results per category to prevent one type from dominating
const MAX_CHALLENGES = 4;
const MAX_PEAKS = 6;
const MAX_PLACES = 3;

// Debounce delay in milliseconds
const SEARCH_DEBOUNCE_MS = 300;

const Omnibar = () => {
    const [query, setQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const map = useMapStore((state) => state.map);
    const router = useRouter();
    const routerRef = useRouterRef(router);
    const pathname = usePathname();
    const { isAuthenticated } = useIsAuthenticated();

    // Debounce the search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(query);
        }, SEARCH_DEBOUNCE_MS);

        return () => clearTimeout(timer);
    }, [query]);

    const { data: results, isLoading } = useQuery({
        queryKey: ["search", debouncedQuery, isAuthenticated],
        queryFn: async (): Promise<SearchResult[]> => {
            if (debouncedQuery.length < 2) return [];

            const bounds = map?.getBounds();
            const center = map?.getCenter();
            
            // Build bounds array for viewport boosting [minLng, minLat, maxLng, maxLat]
            const boundsArray = bounds ? [
                bounds.getWest(),
                bounds.getSouth(),
                bounds.getEast(),
                bounds.getNorth(),
            ] as [number, number, number, number] : undefined;

            // Run unified search and Mapbox places search in parallel
            const [unifiedResults, places] = await Promise.all([
                // Unified search - handles peaks and challenges with relevancy scoring
                // The API now matches against name + state + country, so "mt washington nh" works naturally
                unifiedSearchClient({
                    query: debouncedQuery,
                    lat: center?.lat,
                    lng: center?.lng,
                    bounds: boundsArray,
                    limit: 15,
                    includePeaks: true,
                    includeChallenges: true,
                }),
                // Mapbox places search for geographic locations
                fetch(
                    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(debouncedQuery)}.json?access_token=${getMapboxToken()}&types=region,place,poi,locality&country=us`
                ).then(res => res.json()),
            ]);

            // Separate peaks and challenges from unified results
            const peaks = unifiedResults.results.filter(
                (r): r is PeakSearchResult => r.type === "peak"
            );
            const challenges = unifiedResults.results.filter(
                (r): r is ChallengeSearchResult => r.type === "challenge"
            );

            // Convert to SearchResult format
            const challengeResults: SearchResult[] = challenges
                .slice(0, MAX_CHALLENGES)
                .map((c) => ({
                    id: `challenge-${c.id}`,
                    type: "challenge" as const,
                    title: c.name,
                    subtitle: `${c.numPeaks} Peaks${c.region ? ` • ${c.region}` : ''}`,
                    data: c
                }));

            const peakResults: SearchResult[] = peaks
                .slice(0, MAX_PEAKS)
                .map((p) => ({
                    id: `peak-${p.id}`,
                    type: "peak" as const,
                    title: p.name || "Unknown Peak",
                    subtitle: `${p.elevation ? `${Math.round(metersToFt(p.elevation)).toLocaleString()} ft` : ''}${p.state ? ` • ${p.state}` : ''}`,
                    coords: p.location_coords,
                    data: {
                        id: p.id,
                        name: p.name,
                        elevation: p.elevation,
                        state: p.state,
                        country: p.country,
                        location_coords: p.location_coords,
                        public_summits: p.publicSummits,
                        summits: p.userSummits,
                    }
                }));

            // Filter places to prioritize outdoor-relevant results
            const placeFeatures = (places.features || []).filter((f: any) => {
                // Always include regions (states) and places (cities)
                if (f.place_type?.includes('region') || f.place_type?.includes('place')) {
                    return true;
                }
                // For POIs, only include outdoor-relevant categories
                if (f.place_type?.includes('poi')) {
                    const categories = f.properties?.category || '';
                    const outdoorCategories = ['park', 'forest', 'mountain', 'trail', 'nature', 'recreation', 'outdoor'];
                    return outdoorCategories.some(cat => categories.toLowerCase().includes(cat));
                }
                return true;
            });

            const placeResults: SearchResult[] = placeFeatures
                .slice(0, MAX_PLACES)
                .map((f: any) => ({
                    id: f.id,
                    type: "place" as const,
                    title: f.text,
                    subtitle: f.place_name,
                    coords: f.center,
                    data: f
                }));

            // Prioritize: Challenges first, then Peaks, then Places
            return [...challengeResults, ...peakResults, ...placeResults];
        },
        enabled: debouncedQuery.length >= 2,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    useEffect(() => {
        setIsOpen(debouncedQuery.length >= 2 && !!results && results.length > 0);
    }, [results, debouncedQuery]);

    const getZoomForResult = (result: SearchResult): number => {
        if (result.type === 'peak') return 14;
        if (result.type === 'challenge') return 10;
        
        // For places, use place_type from Mapbox to determine appropriate zoom
        if (result.type === 'place' && result.data?.place_type) {
            const placeTypes = result.data.place_type as string[];
            
            // Check place types in order of specificity
            if (placeTypes.includes('poi')) return 15;           // Points of interest (parks, etc.)
            if (placeTypes.includes('address')) return 16;       // Specific addresses
            if (placeTypes.includes('neighborhood')) return 14;  // Neighborhoods
            if (placeTypes.includes('locality')) return 13;      // Small towns/localities
            if (placeTypes.includes('place')) return 11;         // Cities
            if (placeTypes.includes('district')) return 10;      // Districts
            if (placeTypes.includes('region')) return 6;         // States/regions
            if (placeTypes.includes('country')) return 4;        // Countries
        }
        
        return 10; // Default fallback
    };

    const handleSelect = (result: SearchResult) => {
        setQuery("");
        setIsOpen(false);
        inputRef.current?.blur();
        
        // Navigate to peak/challenge detail pages
        // Use requestAnimationFrame to defer navigation to next frame,
        // ensuring all React state updates and map cleanup are complete
        if (result.type === 'peak') {
            const peakId = result.data?.id || result.data?.peak_id;
            if (peakId) {
                const url = `/peaks/${peakId}`;
                if (pathname === url) return;
                requestAnimationFrame(() => {
                    routerRef.current.push(url);
                });
            }
            return;
        }
        
        if (result.type === 'challenge' && result.data?.id) {
            const url = `/challenges/${result.data.id}`;
            if (pathname === url) return;
            requestAnimationFrame(() => {
                routerRef.current.push(url);
            });
            return;
        }
        
        // Only do map operations for places (which don't have detail pages)
        try {
            if (result.type === 'place' && result.coords && map) {
                const zoom = getZoomForResult(result);
                
                if (result.data?.bbox) {
                    const [minLng, minLat, maxLng, maxLat] = result.data.bbox;
                    map.fitBounds(
                        [[minLng, minLat], [maxLng, maxLat]],
                        {
                            padding: 50,
                            duration: 2000
                        }
                    );
                } else {
                    map.flyTo({
                        center: result.coords,
                        zoom,
                        duration: 2000,
                        essential: true
                    });
                }
            }
        } catch (e) {
            console.error("Map operation failed:", e);
        }
    };

    const clearSearch = () => {
        setQuery("");
        setIsOpen(false);
        inputRef.current?.focus();
    };

    return (
        <div className="relative w-full max-w-lg mx-auto pointer-events-auto">
            <div className={cn(
                "relative flex items-center w-full h-12 px-4 rounded-xl transition-all duration-300",
                "bg-card/90 backdrop-blur-md border border-primary/20 shadow-lg shadow-primary/5",
                "focus-within:border-primary/60 focus-within:shadow-primary/20 focus-within:ring-1 focus-within:ring-primary/60"
            )}>
                <Search className="w-5 h-5 text-muted-foreground mr-3" />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search peaks, challenges, or places..."
                    className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/70 font-sans text-sm"
                    aria-label="Search peaks, challenges, or places"
                    tabIndex={0}
                />
                {isLoading && (
                    <Loader2 className="w-4 h-4 text-primary animate-spin mr-2" />
                )}
                {query && (
                    <button 
                        onClick={clearSearch} 
                        className="p-1 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Clear search"
                        tabIndex={0}
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
                <div className="hidden sm:flex ml-2 items-center gap-1">
                    <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-medium text-muted-foreground bg-muted/50 rounded border border-border">Ctrl</kbd>
                    <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-medium text-muted-foreground bg-muted/50 rounded border border-border">K</kbd>
                </div>
            </div>

            {/* Results Dropdown */}
            {isOpen && results && results.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-card/95 backdrop-blur-xl border border-border rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="py-2">
                        {results.map((result) => {
                            // Check summit status for peaks
                            const peakData = result.type === 'peak' ? result.data : null;
                            const hasSummited = peakData && isAuthenticated && (peakData.summits ?? 0) > 0;
                            const hasPublicSummits = peakData && (peakData.public_summits ?? 0) > 0;
                            
                            return (
                                <button
                                    key={result.id}
                                    onClick={() => handleSelect(result)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSelect(result)}
                                    className="w-full px-4 py-3 flex items-center gap-3 hover:bg-primary/10 transition-colors group text-left"
                                    tabIndex={0}
                                    aria-label={`${result.type}: ${result.title}`}
                                >
                                    <div className={cn(
                                        "p-2 rounded-lg transition-colors",
                                        result.type === 'peak' 
                                            ? hasSummited 
                                                ? "bg-summited/20 text-summited" 
                                                : "bg-primary/10 text-primary group-hover:bg-primary/20"
                                            : result.type === 'challenge' 
                                                ? "bg-muted/50 text-secondary group-hover:bg-primary/20" 
                                                : "bg-muted/50 text-muted-foreground group-hover:bg-primary/20"
                                    )}>
                                        {result.type === 'peak' && <Mountain className="w-4 h-4" />}
                                        {result.type === 'challenge' && <Trophy className="w-4 h-4" />}
                                        {result.type === 'place' && <MapPin className="w-4 h-4" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-foreground text-sm truncate">{result.title}</div>
                                        {result.subtitle && (
                                            <div className="text-xs text-muted-foreground font-mono mt-0.5 truncate">{result.subtitle}</div>
                                        )}
                                        {/* Summit info for peaks */}
                                        {result.type === 'peak' && (hasPublicSummits || hasSummited) && (
                                            <div className="flex items-center gap-3 mt-0.5">
                                                {hasPublicSummits && (
                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        <Users className="w-3 h-3" />
                                                        <span>
                                                            {peakData?.public_summits} {peakData?.public_summits === 1 ? "summit" : "summits"}
                                                        </span>
                                                    </div>
                                                )}
                                                {hasSummited && (
                                                    <div className="flex items-center gap-1 text-xs text-summited font-medium">
                                                        <User className="w-3 h-3" />
                                                        <span>
                                                            {peakData?.summits} {peakData?.summits === 1 ? "summit" : "summits"}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
            {debouncedQuery.length >= 2 && results && results.length === 0 && !isLoading && (
                <div className="absolute top-full mt-2 w-full bg-card/95 backdrop-blur-xl border border-border rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="py-3 px-4 text-sm text-muted-foreground">
                        No results found. Try searching for a peak, challenge, or location.
                    </div>
                </div>
            )}
        </div>
    );
};

export default Omnibar;
