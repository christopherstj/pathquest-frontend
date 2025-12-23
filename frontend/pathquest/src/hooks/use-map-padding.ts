"use client";

import { useEffect } from "react";
import mapboxgl from "mapbox-gl";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTabStore, type DrawerHeight } from "@/store/tabStore";

// Heights for drawer (same as ContentSheet) - used for map padding on mobile
const DRAWER_HEIGHTS = {
    collapsed: 60,
    halfway: typeof window !== "undefined" ? window.innerHeight * 0.45 : 400,
    expanded: typeof window !== "undefined" ? window.innerHeight - 140 : 600,
};

// Desktop panel widths (same as DesktopNavLayout) - used for map padding on desktop
const DESKTOP_PANEL_WIDTH_EXPANDED = 380;
const DESKTOP_PANEL_WIDTH_COLLAPSED = 64;
const DESKTOP_PANEL_MARGIN = 16; // left margin of panel (left-4 = 16px)

/**
 * Get the pixel height for a drawer height value.
 */
function getDrawerPixelHeight(height: DrawerHeight): number {
    if (typeof window === "undefined") return DRAWER_HEIGHTS[height];
    switch (height) {
        case "collapsed": return 60;
        case "halfway": return window.innerHeight * 0.45;
        case "expanded": return window.innerHeight - 140;
    }
}

interface UseMapPaddingOptions {
    /** The Mapbox map instance */
    map: mapboxgl.Map | null;
}

/**
 * Hook to manage map padding based on UI layout.
 * 
 * This is the ONLY place that should control map padding:
 * - Mobile: bottom padding for drawer
 * - Desktop: left padding for side panel
 * 
 * The hook automatically responds to:
 * - Mobile/desktop viewport changes
 * - Drawer height changes (mobile)
 * - Panel collapsed state (desktop)
 */
export function useMapPadding({ map }: UseMapPaddingOptions): void {
    const isMobile = useIsMobile(1024);
    const drawerHeight = useTabStore((state) => state.drawerHeight);
    const isDesktopPanelCollapsed = useTabStore((state) => state.isDesktopPanelCollapsed);

    useEffect(() => {
        if (!map) return;
        
        if (isMobile) {
            // Mobile: bottom padding for drawer
            const bottomPadding = getDrawerPixelHeight(drawerHeight) + 20; // Add small buffer
            map.setPadding({
                top: 20,
                bottom: bottomPadding,
                left: 0,
                right: 0,
            });
        } else {
            // Desktop: left padding for side panel
            const panelWidth = isDesktopPanelCollapsed 
                ? DESKTOP_PANEL_WIDTH_COLLAPSED 
                : DESKTOP_PANEL_WIDTH_EXPANDED;
            const leftPadding = panelWidth + DESKTOP_PANEL_MARGIN + 20; // panel + margin + buffer
            
            map.setPadding({
                top: 20,
                bottom: 20,
                left: leftPadding,
                right: 20,
            });
        }
    }, [map, isMobile, drawerHeight, isDesktopPanelCollapsed]);
}

