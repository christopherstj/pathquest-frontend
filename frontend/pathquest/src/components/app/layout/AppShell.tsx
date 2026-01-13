"use client";

import React, { Suspense } from "react";
import { usePathname } from "next/navigation";
import MapBackground from "@/components/map/MapBackground";
import GlobalNavigation from "@/components/app/layout/GlobalNavigation";
import UrlOverlayManager from "@/components/overlays/UrlOverlayManager";
import AuthModal from "@/components/auth/AuthModal";
import SummitReportModal from "@/components/overlays/SummitReportModal";
import AddManualSummitModal from "@/components/overlays/AddManualSummitModal";
import UserManagementModal from "@/components/overlays/UserManagementModal";

/**
 * Static/standalone routes that render as full-screen pages.
 * These pages don't show the map, overlay UI, or navigation.
 */
const STANDALONE_ROUTES = ["/about", "/faq", "/contact", "/privacy", "/terms"];

/**
 * Check if the current pathname is a standalone route.
 */
const isStandaloneRoute = (pathname: string): boolean => {
    return STANDALONE_ROUTES.some((route) => pathname === route);
};

interface AppShellProps {
    children: React.ReactNode;
}

/**
 * AppShell - Conditional layout wrapper for app vs standalone pages.
 * 
 * For app routes (/, /explore, /peaks/*, etc.):
 * - Renders the map background
 * - Renders the global navigation (logo, omnibar, user menu)
 * - Renders the URL overlay manager (side panel / bottom sheet)
 * - Renders modals (auth, summit report, manual summit, user management)
 * - Children are rendered as sr-only SEO content
 * 
 * For standalone routes (/about, /faq, /contact):
 * - Renders children as full-screen scrollable pages
 * - No map, no overlay UI, no navigation bar
 * - Better SEO, better reading experience
 */
const AppShell = ({ children }: AppShellProps) => {
    const pathname = usePathname();
    const isStandalone = isStandaloneRoute(pathname);

    // Standalone pages: render as traditional full-screen pages
    if (isStandalone) {
        return (
            <div className="min-h-screen overflow-auto">
                {children}
            </div>
        );
    }

    // App pages: render with map and overlay UI
    return (
        <main className="relative w-full h-screen overflow-hidden">
            <Suspense fallback={<div className="absolute inset-0 bg-background" />}>
                <MapBackground />
            </Suspense>
            <GlobalNavigation />
            {/* URL-driven overlay manager - renders discovery drawer (desktop) or bottom sheet (mobile) and detail panels */}
            <UrlOverlayManager />
            {/* SEO content from static pages (hidden from view, visible to crawlers) */}
            <div className="relative z-10 w-full h-full pointer-events-none">
                {children}
            </div>
            {/* Auth modal - triggered by useRequireAuth hook */}
            <AuthModal />
            {/* Summit report modal - for editing summit experiences */}
            <SummitReportModal />
            {/* Manual summit modal - for logging new summits */}
            <AddManualSummitModal />
            {/* User management modal - for account settings */}
            <UserManagementModal />
        </main>
    );
};

export default AppShell;

