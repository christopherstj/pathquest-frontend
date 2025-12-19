"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, useAnimation, PanInfo } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTabStore } from "@/store/tabStore";

export type DrawerHeight = "collapsed" | "halfway" | "expanded";

// Static SSR-safe defaults - will be updated on client after hydration
const SSR_SAFE_HEIGHTS = {
    collapsed: 60,
    halfway: 400,
    expanded: 600,
};

interface ContentSheetProps {
    children: React.ReactNode;
    className?: string;
    initialHeight?: DrawerHeight;
    onHeightChange?: (height: DrawerHeight) => void;
    /** Extra bottom padding to account for tab bar */
    bottomPadding?: number;
}

const ContentSheet = ({
    children,
    className,
    initialHeight = "halfway",
    onHeightChange,
    bottomPadding = 56, // Tab bar height (matches BottomTabBar min-h)
}: ContentSheetProps) => {
    const controls = useAnimation();
    const drawerHeight = useTabStore((state) => state.drawerHeight);
    const setDrawerHeight = useTabStore((state) => state.setDrawerHeight);
    // Use static SSR-safe defaults to avoid hydration mismatch
    const [heights, setHeights] = useState(SSR_SAFE_HEIGHTS);
    const [isHydrated, setIsHydrated] = useState(false);
    
    // Initialize drawer height in store on mount only
    useEffect(() => {
        setDrawerHeight(initialHeight);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run on mount

    // Update heights on mount and window resize (client-only)
    useEffect(() => {
        setIsHydrated(true);
        
        const updateHeights = () => {
            setHeights({
                collapsed: 60,
                halfway: window.innerHeight * 0.45,
                expanded: window.innerHeight - 140,
            });
        };

        updateHeights();
        window.addEventListener("resize", updateHeights);
        return () => window.removeEventListener("resize", updateHeights);
    }, []);

    // Animate to new height when drawerHeight state changes or after hydration
    useEffect(() => {
        if (isHydrated) {
            controls.start({ height: heights[drawerHeight] });
        }
    }, [drawerHeight, heights, controls, isHydrated]);

    // Notify parent of height changes
    useEffect(() => {
        onHeightChange?.(drawerHeight);
    }, [drawerHeight, onHeightChange]);

    const handleDragEnd = useCallback(
        (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
            const velocity = info.velocity.y;
            const offset = info.offset.y;
            // Lower threshold = easier to trigger swipe (was 500)
            const velocityThreshold = 250;
            // Minimum drag distance to trigger snap (in pixels)
            const dragThreshold = 50;
            const currentHeight = heights[drawerHeight];
            const newHeight = currentHeight - offset;

            // Check velocity-based swipe first
            if (velocity < -velocityThreshold) {
                // Swiping up
                if (drawerHeight === "collapsed") setDrawerHeight("halfway");
                else if (drawerHeight === "halfway") setDrawerHeight("expanded");
            } else if (velocity > velocityThreshold) {
                // Swiping down
                if (drawerHeight === "expanded") setDrawerHeight("halfway");
                else if (drawerHeight === "halfway") setDrawerHeight("collapsed");
            } else if (Math.abs(offset) > dragThreshold) {
                // If dragged far enough without velocity, still snap based on direction
                if (offset < 0) {
                    // Dragged up
                    if (drawerHeight === "collapsed") setDrawerHeight("halfway");
                    else if (drawerHeight === "halfway") setDrawerHeight("expanded");
                } else {
                    // Dragged down
                    if (drawerHeight === "expanded") setDrawerHeight("halfway");
                    else if (drawerHeight === "halfway") setDrawerHeight("collapsed");
                }
            } else {
                // Snap to nearest (small movements)
                const distanceToCollapsed = Math.abs(newHeight - heights.collapsed);
                const distanceToHalfway = Math.abs(newHeight - heights.halfway);
                const distanceToExpanded = Math.abs(newHeight - heights.expanded);
                const minDistance = Math.min(distanceToCollapsed, distanceToHalfway, distanceToExpanded);

                if (minDistance === distanceToCollapsed) setDrawerHeight("collapsed");
                else if (minDistance === distanceToHalfway) setDrawerHeight("halfway");
                else setDrawerHeight("expanded");
            }
        },
        [drawerHeight, heights]
    );

    const handleHandleClick = useCallback(() => {
        if (drawerHeight === "collapsed") setDrawerHeight("halfway");
        else if (drawerHeight === "halfway") setDrawerHeight("expanded");
        else setDrawerHeight("collapsed");
    }, [drawerHeight]);

    return (
        <motion.div
            initial={{ height: SSR_SAFE_HEIGHTS[initialHeight] }}
            animate={isHydrated ? controls : undefined}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={cn(
                "fixed left-0 right-0 w-full pointer-events-auto z-40",
                className
            )}
            style={{ 
                touchAction: "none",
                bottom: bottomPadding,
            }}
        >
            <div className="h-full bg-background/90 backdrop-blur-xl border border-border border-b-0 shadow-xl overflow-hidden flex flex-col rounded-t-2xl">
                {/* Drag Handle */}
                <div
                    className="w-full flex items-center justify-center pt-3 pb-1 shrink-0 cursor-grab active:cursor-grabbing"
                    onClick={handleHandleClick}
                    onKeyDown={(e) => e.key === "Enter" && handleHandleClick()}
                    tabIndex={0}
                    role="button"
                    aria-label="Drag handle to resize drawer"
                >
                    <div
                        className={cn(
                            "w-12 h-1.5 rounded-full transition-colors",
                            drawerHeight === "collapsed" ? "bg-primary/60" : "bg-muted-foreground/30"
                        )}
                    />
                </div>

                {/* Content */}
                <div
                    className={cn(
                        "flex-1 overflow-y-auto custom-scrollbar",
                        drawerHeight === "collapsed" && "overflow-hidden"
                    )}
                >
                    {children}
                </div>
            </div>
        </motion.div>
    );
};

export default ContentSheet;

// Export a hook to get current heights for map padding calculations
export const useContentSheetHeights = () => {
    // Use static SSR-safe defaults to avoid hydration mismatch
    const [heights, setHeights] = useState(SSR_SAFE_HEIGHTS);

    useEffect(() => {
        const updateHeights = () => {
            setHeights({
                collapsed: 60,
                halfway: window.innerHeight * 0.45,
                expanded: window.innerHeight - 140,
            });
        };

        updateHeights();
        window.addEventListener("resize", updateHeights);
        return () => window.removeEventListener("resize", updateHeights);
    }, []);

    return heights;
};

