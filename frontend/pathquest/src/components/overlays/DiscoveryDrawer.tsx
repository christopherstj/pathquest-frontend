"use client";

import React, { useState, useEffect } from "react";
import { motion, useAnimation, PanInfo } from "framer-motion";
import { ArrowRight, Trophy, TrendingUp, Mountain } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMapStore } from "@/providers/MapProvider";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";
import SatelliteButton from "../app/map/SatelliteButton";

type DrawerHeight = "collapsed" | "halfway" | "expanded";

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
    const isSatellite = useMapStore((state) => state.isSatellite);
    const setIsSatellite = useMapStore((state) => state.setIsSatellite);
    const router = useRouter();
    const isMobile = useIsMobile(1024);
    const controls = useAnimation();
    
    const [drawerHeight, setDrawerHeight] = useState<DrawerHeight>("halfway");
    const [heights, setHeights] = useState(DRAWER_HEIGHTS);

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
        router.push(`/peaks/${id}`);
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
        router.push(`/challenges/${id}`);
    };

    const handleSatelliteToggle = (enabled: boolean) => {
        setIsSatellite(enabled);
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

    // Desktop version - no drag functionality
    if (!isMobile) {
        return (
            <motion.div
                initial={{ x: -100, y: 0, opacity: 0 }}
                animate={{ x: 0, y: 0, opacity: 1 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed pointer-events-auto flex flex-col gap-3 z-40 top-20 left-5 bottom-6 w-full max-w-[320px] h-auto"
            >
                <div className="flex-1 bg-background/85 backdrop-blur-xl border border-border shadow-xl overflow-hidden flex flex-col rounded-2xl">
                    <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
                        {/* Featured Challenges */}
                        {visibleChallenges.length > 0 && (
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <Trophy className="w-4 h-4 text-secondary" />
                                    <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Visible Challenges</h2>
                                </div>
                                <div className="space-y-2.5">
                                    {visibleChallenges.map((challenge) => (
                                        <div 
                                            key={challenge.id} 
                                            onClick={() => handleChallengeClick(challenge.id)}
                                            onKeyDown={(e) => e.key === "Enter" && handleChallengeClick(challenge.id)}
                                            tabIndex={0}
                                            role="button"
                                            aria-label={`View challenge: ${challenge.name}`}
                                            className="group relative overflow-hidden rounded-xl bg-card border border-border/70 p-4 hover:border-primary/50 transition-colors cursor-pointer"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-medium group-hover:text-primary transition-colors">{challenge.name}</h3>
                                                    <p className="text-xs text-muted-foreground mt-1">{challenge.num_peaks} Peaks</p>
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                            </div>
                                            <div className={cn("absolute bottom-0 left-0 h-0.5 w-full opacity-50 bg-primary")} />
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Trending Peaks */}
                        {visiblePeaks.length > 0 && (
                            <section className="pb-2">
                                <div className="flex items-center gap-2 mb-4">
                                    <TrendingUp className="w-4 h-4 text-primary" />
                                    <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Visible Peaks</h2>
                                </div>
                                <div className="space-y-2.5">
                                    {visiblePeaks.map((peak) => (
                                        <div 
                                            key={peak.id} 
                                            onClick={() => handlePeakClick(peak.id, peak.location_coords)}
                                            onKeyDown={(e) => e.key === "Enter" && handlePeakClick(peak.id, peak.location_coords)}
                                            tabIndex={0}
                                            role="button"
                                            aria-label={`View peak: ${peak.name}`}
                                            className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/60 transition-colors cursor-pointer group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                    <Mountain className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm group-hover:text-primary-foreground transition-colors">{peak.name}</p>
                                                    <p className="text-xs font-mono text-muted-foreground">{peak.elevation ? `${peak.elevation} ft` : ''}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {visibleChallenges.length === 0 && visiblePeaks.length === 0 && (
                            <div className="text-center py-10 text-muted-foreground">
                                <p>No peaks or challenges visible in this area.</p>
                                <p className="text-sm mt-2">Try moving the map or zooming out.</p>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        );
    }

    // Mobile version with draggable bottom sheet
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

                <div className="px-5 py-3 border-b border-border/60 flex items-center justify-between shrink-0">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary/80">
                        PathQuest
                    </span>
                    <SatelliteButton 
                        value={isSatellite}
                        onClick={handleSatelliteToggle}
                    />
                </div>

                <div className={cn(
                    "flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar",
                    drawerHeight === "collapsed" && "overflow-hidden"
                )}>
                    {/* Featured Challenges */}
                    {visibleChallenges.length > 0 && (
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <Trophy className="w-4 h-4 text-secondary" />
                                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Visible Challenges</h2>
                            </div>
                            <div className="space-y-2.5">
                                {visibleChallenges.map((challenge) => (
                                    <div 
                                        key={challenge.id} 
                                        onClick={() => handleChallengeClick(challenge.id)}
                                        onKeyDown={(e) => e.key === "Enter" && handleChallengeClick(challenge.id)}
                                        tabIndex={0}
                                        role="button"
                                        aria-label={`View challenge: ${challenge.name}`}
                                        className="group relative overflow-hidden rounded-xl bg-card border border-border/70 p-4 hover:border-primary/50 transition-colors cursor-pointer"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-medium group-hover:text-primary transition-colors">{challenge.name}</h3>
                                                <p className="text-xs text-muted-foreground mt-1">{challenge.num_peaks} Peaks</p>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                                        </div>
                                        <div className={cn("absolute bottom-0 left-0 h-0.5 w-full opacity-50 bg-primary")} />
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Trending Peaks */}
                    {visiblePeaks.length > 0 && (
                        <section className="pb-2">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp className="w-4 h-4 text-primary" />
                                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Visible Peaks</h2>
                            </div>
                            <div className="space-y-2.5">
                                {visiblePeaks.map((peak) => (
                                    <div 
                                        key={peak.id} 
                                        onClick={() => handlePeakClick(peak.id, peak.location_coords)}
                                        onKeyDown={(e) => e.key === "Enter" && handlePeakClick(peak.id, peak.location_coords)}
                                        tabIndex={0}
                                        role="button"
                                        aria-label={`View peak: ${peak.name}`}
                                        className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/60 transition-colors cursor-pointer group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                <Mountain className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm group-hover:text-primary-foreground transition-colors">{peak.name}</p>
                                                <p className="text-xs font-mono text-muted-foreground">{peak.elevation ? `${peak.elevation} ft` : ''}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {visibleChallenges.length === 0 && visiblePeaks.length === 0 && (
                        <div className="text-center py-10 text-muted-foreground">
                            <p>No peaks or challenges visible in this area.</p>
                            <p className="text-sm mt-2">Try moving the map or zooming out.</p>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default DiscoveryDrawer;
