"use client";

import React, { useMemo } from "react";
import { usePathname } from "next/navigation";
import BottomTabBar from "./BottomTabBar";
import ContentSheet from "./ContentSheet";
import HomeTabContent from "./HomeTabContent";
import ExploreTabContent from "./ExploreTabContent";
import ProfileTabContent from "./ProfileTabContent";
import type { TabType } from "@/store/tabStore";

/**
 * MobileNavLayout - Main mobile navigation orchestrator
 * 
 * This component manages:
 * 1. Fixed bottom tab bar (Home, Explore, Profile)
 * 2. Draggable content sheet that changes based on active tab
 * 3. URL-driven tab selection (tab is derived from URL, not stored in state)
 * 
 * Route structure:
 * - `/` → Home tab
 * - `/explore` → Explore tab (discovery mode)
 * - `/profile` → Profile tab
 * - `/peaks/[id]`, `/challenges/[id]`, etc. → Explore tab (detail mode)
 * 
 * The map always remains visible in the background.
 */
const MobileNavLayout = () => {
    const pathname = usePathname();

    // Derive active tab from URL - URL is the source of truth
    const activeTab: TabType = useMemo(() => {
        if (pathname === "/profile") return "profile";
        if (
            pathname === "/explore" ||
            pathname.startsWith("/peaks/") ||
            pathname.startsWith("/challenges/") ||
            pathname.startsWith("/activities/") ||
            pathname.startsWith("/users/")
        ) {
            return "explore";
        }
        return "home";
    }, [pathname]);

    // Render content based on active tab (derived from URL)
    const renderContent = () => {
        switch (activeTab) {
            case "home":
                return <HomeTabContent isActive={activeTab === "home"} />;
            case "explore":
                return <ExploreTabContent isActive={activeTab === "explore"} />;
            case "profile":
                return <ProfileTabContent isActive={activeTab === "profile"} />;
            default:
                return <HomeTabContent isActive={false} />;
        }
    };

    return (
        <>
            {/* Content Sheet - draggable, positioned above tab bar */}
            <ContentSheet bottomPadding={56}>
                {renderContent()}
            </ContentSheet>

            {/* Fixed Bottom Tab Bar */}
            <BottomTabBar />
        </>
    );
};

export default MobileNavLayout;

