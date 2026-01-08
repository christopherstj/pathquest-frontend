"use client";

import { useState, useEffect, useCallback } from "react";
import { useAnimation, PanInfo } from "framer-motion";

export type DrawerHeight = "collapsed" | "halfway" | "expanded";

interface UseDrawerHeightOptions {
    initialHeight?: DrawerHeight;
    collapsedHeight?: number;
    halfwayRatio?: number;
    expandedOffset?: number;
}

interface DrawerHeights {
    collapsed: number;
    halfway: number;
    expanded: number;
}

/**
 * Hook to manage draggable drawer height with snap points.
 */
export function useDrawerHeight(options: UseDrawerHeightOptions = {}) {
    const {
        initialHeight = "halfway",
        collapsedHeight = 60,
        halfwayRatio = 0.45,
        expandedOffset = 80,
    } = options;

    const controls = useAnimation();
    const [drawerHeight, setDrawerHeight] = useState<DrawerHeight>(initialHeight);
    const [heights, setHeights] = useState<DrawerHeights>({
        collapsed: collapsedHeight,
        halfway: typeof window !== "undefined" ? window.innerHeight * halfwayRatio : 400,
        expanded: typeof window !== "undefined" ? window.innerHeight - expandedOffset : 600,
    });

    // Update heights on window resize
    useEffect(() => {
        const updateHeights = () => {
            setHeights({
                collapsed: collapsedHeight,
                halfway: window.innerHeight * halfwayRatio,
                expanded: window.innerHeight - expandedOffset,
            });
        };

        updateHeights();
        window.addEventListener("resize", updateHeights);
        return () => window.removeEventListener("resize", updateHeights);
    }, [collapsedHeight, halfwayRatio, expandedOffset]);

    // Animate to new height when drawerHeight state changes
    useEffect(() => {
        controls.start({ height: heights[drawerHeight] });
    }, [drawerHeight, heights, controls]);

    const handleDragEnd = useCallback(
        (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
            const velocity = info.velocity.y;
            const offset = info.offset.y;
            const velocityThreshold = 500;
            const currentHeight = heights[drawerHeight];
            const newHeight = currentHeight - offset;

            // Quick swipe up - go to next higher state
            if (velocity < -velocityThreshold) {
                if (drawerHeight === "collapsed") setDrawerHeight("halfway");
                else if (drawerHeight === "halfway") setDrawerHeight("expanded");
            } 
            // Quick swipe down - go to next lower state
            else if (velocity > velocityThreshold) {
                if (drawerHeight === "expanded") setDrawerHeight("halfway");
                else if (drawerHeight === "halfway") setDrawerHeight("collapsed");
            } 
            // Slow drag - snap to nearest height
            else {
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
        // Cycle through states on tap
        if (drawerHeight === "collapsed") setDrawerHeight("halfway");
        else if (drawerHeight === "halfway") setDrawerHeight("expanded");
        else setDrawerHeight("collapsed");
    }, [drawerHeight]);

    const expandIfCollapsed = useCallback(() => {
        if (drawerHeight === "collapsed") {
            setDrawerHeight("halfway");
        }
    }, [drawerHeight]);

    const collapseToHalfway = useCallback(() => {
        if (drawerHeight === "expanded") {
            setDrawerHeight("halfway");
        }
    }, [drawerHeight]);

    return {
        drawerHeight,
        setDrawerHeight,
        heights,
        controls,
        handleDragEnd,
        handleHandleClick,
        expandIfCollapsed,
        collapseToHalfway,
    };
}






