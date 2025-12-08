"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, X, MapPin, Mountain, Trophy, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMapStore } from "@/providers/MapProvider";
import { useQuery } from "@tanstack/react-query";
import Peak from "@/typeDefs/Peak";
import ChallengeProgress from "@/typeDefs/ChallengeProgress";
import { useRouter, useSearchParams } from "next/navigation";
import { searchPeaksClient } from "@/lib/client/searchPeaksClient";
import { searchChallengesClient } from "@/lib/client/searchChallengesClient";

interface SearchResult {
    id: string;
    type: "peak" | "challenge" | "place";
    title: string;
    subtitle?: string;
    coords?: [number, number];
    data?: any;
}

const Omnibar = () => {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const map = useMapStore((state) => state.map);
    const router = useRouter();
    const searchParams = useSearchParams();

    const { data: results, isLoading } = useQuery({
        queryKey: ["search", query],
        queryFn: async (): Promise<SearchResult[]> => {
            if (query.length < 2) return [];

            const bounds = map?.getBounds();
            const nw = bounds?.getNorthWest();
            const se = bounds?.getSouthEast();
            
            const boundsParams = nw && se ? {
                 nw: { lat: nw.lat, lng: nw.lng },
                 se: { lat: se.lat, lng: se.lng },
            } : undefined;

            const [
                visiblePeaks,
                globalPeaks,
                visibleChallenges,
                globalChallenges,
                places
            ] = await Promise.all([
                // Visible Peaks
                boundsParams ? searchPeaksClient({
                    search: query,
                    bounds: boundsParams,
                    perPage: "5",
                    showSummitted: true,
                }) : Promise.resolve([]),
                // Global Peaks
                searchPeaksClient({
                    search: query,
                    perPage: "5",
                    showSummitted: true,
                }),
                // Visible Challenges
                boundsParams ? searchChallengesClient({
                    search: query,
                    bounds: boundsParams,
                }) : Promise.resolve([]),
                // Global Challenges
                searchChallengesClient({
                    search: query,
                }),
                // Places
                fetch(
                    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&types=place,locality,neighborhood`
                ).then(res => res.json())
            ]);

            // Deduplicate Peaks
            const peakMap = new Map();
            (visiblePeaks as Peak[]).forEach((p: Peak) => peakMap.set(p.id, p));
            (globalPeaks as Peak[]).forEach((p: Peak) => {
                if (!peakMap.has(p.id)) peakMap.set(p.id, p);
            });
            const peaks = Array.from(peakMap.values());

            // Deduplicate Challenges
            const challengeMap = new Map();
            (visibleChallenges as ChallengeProgress[]).forEach((c: ChallengeProgress) => challengeMap.set(c.id, c));
            (globalChallenges as ChallengeProgress[]).forEach((c: ChallengeProgress) => {
                if (!challengeMap.has(c.id)) challengeMap.set(c.id, c);
            });
            const challenges = Array.from(challengeMap.values());

            const peakResults: SearchResult[] = peaks.map((p: Peak) => ({
                id: `peak-${p.id}`,
                type: "peak",
                title: p.name || "Unknown Peak",
                subtitle: `${p.elevation ? `${p.elevation} ft` : ''} • ${p.state || ''}`,
                coords: p.location_coords,
                data: p
            }));

            const challengeResults: SearchResult[] = challenges.map((c: ChallengeProgress) => ({
                id: `challenge-${c.id}`,
                type: "challenge",
                title: c.name,
                subtitle: `${c.num_peaks} Peaks`,
                data: c
            }));

            const placeResults: SearchResult[] = (places.features || []).map((f: any) => ({
                id: f.id,
                type: "place",
                title: f.text,
                subtitle: f.place_name,
                coords: f.center,
                data: f
            }));

            return [...peakResults, ...challengeResults, ...placeResults].slice(0, 8);
        },
        enabled: query.length >= 2,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    useEffect(() => {
        setIsOpen(query.length >= 2 && !!results && results.length > 0);
    }, [results, query]);

    const handleSelect = (result: SearchResult) => {
        setQuery(result.title);
        setIsOpen(false);
        
        if (result.coords && map) {
            map.flyTo({
                center: result.coords,
                zoom: result.type === 'peak' ? 14 : 10,
                pitch: 60,
                duration: 2000,
                essential: true
            });
        }
        
        const params = new URLSearchParams(searchParams.toString());
        if (result.type === 'peak' && result.data?.id) {
            params.set('peakId', result.data.id);
            params.delete('challengeId');
            router.push(`?${params.toString()}`);
        } else if (result.type === 'challenge' && result.data?.id) {
            params.set('challengeId', result.data.id);
            params.delete('peakId');
            router.push(`?${params.toString()}`);
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
                />
                {isLoading && (
                    <Loader2 className="w-4 h-4 text-primary animate-spin mr-2" />
                )}
                {query && (
                    <button onClick={clearSearch} className="p-1 hover:bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors">
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
                        {results.map((result) => (
                            <button
                                key={result.id}
                                onClick={() => handleSelect(result)}
                                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-primary/10 transition-colors group text-left"
                            >
                                <div className={cn(
                                    "p-2 rounded-lg bg-muted/50 group-hover:bg-primary/20 transition-colors",
                                    result.type === 'peak' ? "text-primary" : result.type === 'challenge' ? "text-secondary" : "text-muted-foreground"
                                )}>
                                    {result.type === 'peak' && <Mountain className="w-4 h-4" />}
                                    {result.type === 'challenge' && <Trophy className="w-4 h-4" />}
                                    {result.type === 'place' && <MapPin className="w-4 h-4" />}
                                </div>
                                <div>
                                    <div className="font-medium text-foreground text-sm">{result.title}</div>
                                    {result.subtitle && (
                                        <div className="text-xs text-muted-foreground font-mono mt-0.5">{result.subtitle}</div>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
            {query.length >= 2 && results && results.length === 0 && !isLoading && (
                <div className="absolute top-full mt-2 w-full bg-card/95 backdrop-blur-xl border border-border rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="py-3 px-4 text-sm text-muted-foreground">
                        No results found in this area.
                    </div>
                </div>
            )}
        </div>
    );
};

export default Omnibar;

