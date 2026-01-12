"use client";

import React, { Suspense } from "react";
import { usePathname } from "next/navigation";
import MobileNavLayout from "@/components/navigation/MobileNavLayout";
import DesktopNavLayout from "@/components/navigation/DesktopNavLayout";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * Static/standalone routes that should NOT show the map overlay UI.
 * These pages render as full-screen standalone pages for better SEO and UX.
 */
const STANDALONE_ROUTES = ["/about", "/faq", "/contact"];

/**
 * Check if the current pathname is a standalone route (no overlay UI).
 */
const isStandaloneRoute = (pathname: string): boolean => {
    return STANDALONE_ROUTES.some((route) => pathname === route);
};

/**
 * URL-driven overlay manager that renders the appropriate navigation layout
 * based on device size.
 * 
 * This pattern allows:
 * - Map to persist across all navigations (no remounting)
 * - SEO-friendly static pages with generateStaticParams
 * - Smooth client-side navigation between all routes
 * - Consistent UX across mobile and desktop
 * 
 * Mobile (<1024px): Uses MobileNavLayout with fixed bottom tab bar and draggable content sheet
 * Desktop (>=1024px): Uses DesktopNavLayout with collapsible left side panel
 * 
 * Both layouts use the same tab content components (HomeTabContent, ExploreTabContent, ProfileTabContent)
 * ensuring feature parity and consistent behavior across platforms.
 * 
 * The overlays are rendered via this component (in root layout),
 * not via parallel routes or page content, ensuring the map never reloads.
 * 
 * **Standalone routes** (about, faq, contact) render as full-screen pages
 * without the overlay UI or map for better SEO and reading experience.
 */
const UrlOverlayManagerContent = () => {
    const pathname = usePathname();
    const isMobile = useIsMobile(1024);

    // Don't render overlay UI for standalone pages (about, faq, contact)
    if (isStandaloneRoute(pathname)) {
        return null;
    }

    if (isMobile) {
        return <MobileNavLayout />;
    }

    return <DesktopNavLayout />;
};

const UrlOverlayManager = () => {
    return (
        <Suspense fallback={null}>
            <UrlOverlayManagerContent />
        </Suspense>
    );
};

export default UrlOverlayManager;
