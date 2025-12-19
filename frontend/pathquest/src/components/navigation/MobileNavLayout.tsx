"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTabStore } from "@/store/tabStore";
import BottomTabBar from "./BottomTabBar";
import ContentSheet from "./ContentSheet";
import HomeTabContent from "./HomeTabContent";
import ExploreTabContent from "./ExploreTabContent";
import ProfileTabContent from "./ProfileTabContent";

/**
 * MobileNavLayout - Main mobile navigation orchestrator
 * 
 * This component manages:
 * 1. Fixed bottom tab bar (Home, Explore, Profile)
 * 2. Draggable content sheet that changes based on active tab
 * 3. URL-driven tab switching (e.g., /peaks/abc -> Explore tab)
 * 
 * The map always remains visible in the background.
 */
const MobileNavLayout = () => {
    const pathname = usePathname();
    const activeTab = useTabStore((state) => state.activeTab);
    const setActiveTab = useTabStore((state) => state.setActiveTab);

    // URL-driven tab switching
    // When URL contains detail routes, switch to Explore tab
    useEffect(() => {
        const isDetailRoute = 
            pathname.startsWith("/peaks/") ||
            pathname.startsWith("/challenges/") ||
            pathname.startsWith("/activities/") ||
            pathname.startsWith("/users/");

        if (isDetailRoute && activeTab !== "explore") {
            setActiveTab("explore");
        }
    }, [pathname, activeTab, setActiveTab]);

    // Render content based on active tab
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

