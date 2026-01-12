"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Home, Compass, User, PanelLeftClose, PanelLeft } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTabStore, getTabStore, type TabType } from "@/store/tabStore";
import HomeTabContent from "./HomeTabContent";
import ExploreTabContent from "./ExploreTabContent";
import ProfileTabContent from "./ProfileTabContent";
import Footer from "@/components/app/layout/Footer";

const PANEL_WIDTH_EXPANDED = 380;
const PANEL_WIDTH_COLLAPSED = 64;
const STORAGE_KEY = "pathquest-desktop-panel-collapsed";

interface TabButtonProps {
    tab: TabType;
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    isCollapsed: boolean;
    onClick: () => void;
}

const TabButton = ({ tab, icon, label, isActive, isCollapsed, onClick }: TabButtonProps) => {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-2 transition-all rounded-lg",
                isCollapsed 
                    ? "flex-col justify-center p-2 w-full" 
                    : "px-3 py-2 flex-1 justify-center",
                isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
            aria-label={label}
            aria-selected={isActive}
            role="tab"
        >
            <div className={cn(
                "transition-colors",
                isActive && "text-primary"
            )}>
                {icon}
            </div>
            {!isCollapsed && (
                <span className={cn(
                    "text-xs font-medium whitespace-nowrap",
                    isActive && "font-semibold"
                )}>
                    {label}
                </span>
            )}
        </button>
    );
};

// Check if a path is an Explore detail route (not just /explore)
const isExploreDetailPath = (path: string): boolean => {
    return (
        path.startsWith("/peaks/") ||
        path.startsWith("/challenges/") ||
        path.startsWith("/activities/") ||
        path.startsWith("/users/")
    );
};

/**
 * DesktopNavLayout - Desktop navigation with collapsible side panel
 * 
 * This component mirrors the mobile MobileNavLayout but renders as a
 * left-side panel instead of a bottom drawer. It reuses the same
 * content components for consistency.
 * 
 * Features:
 * - Collapsible to icon rail (~64px) or expanded (~380px)
 * - Tab bar at top: Home, Explore, Profile
 * - Same URL-driven tab selection as mobile
 * - Collapse state persisted in localStorage
 */
const DesktopNavLayout = () => {
    const router = useRouter();
    const pathname = usePathname();
    
    // Collapse state - initialize from localStorage
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [hasHydrated, setHasHydrated] = useState(false);
    
    // Tab memory for Explore
    // Note: We read lastExplorePath from store directly in handleTabChange to avoid stale closure issues
    const setLastExplorePath = useTabStore((state) => state.setLastExplorePath);
    const clearExploreHistory = useTabStore((state) => state.clearExploreHistory);
    const setDesktopPanelCollapsed = useTabStore((state) => state.setDesktopPanelCollapsed);

    // Hydrate collapse state from localStorage
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored !== null) {
            setIsCollapsed(stored === "true");
        }
        setHasHydrated(true);
    }, []);

    // Persist collapse state to localStorage and update store
    useEffect(() => {
        if (hasHydrated) {
            localStorage.setItem(STORAGE_KEY, String(isCollapsed));
            setDesktopPanelCollapsed(isCollapsed);
        }
    }, [isCollapsed, hasHydrated, setDesktopPanelCollapsed]);

    // Keyboard shortcut to toggle panel (Cmd/Ctrl + B)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "b") {
                e.preventDefault();
                setIsCollapsed((prev) => !prev);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    // Derive active tab from URL - URL is the source of truth
    const activeTab: TabType = useMemo(() => {
        if (pathname === "/profile") return "profile";
        if (pathname === "/explore" || isExploreDetailPath(pathname)) {
            return "explore";
        }
        return "home";
    }, [pathname]);

    // If the user is back in Explore discovery mode, clear any cached Explore detail path
    // (prevents stale restoration when switching away and back).
    useEffect(() => {
        if (pathname === "/explore") {
            setLastExplorePath(null);
            clearExploreHistory();
        }
    }, [pathname, setLastExplorePath, clearExploreHistory]);

    const handleTabChange = (tab: TabType) => {
        // Read the current store state at click time to avoid stale closure issues
        // This ensures we always get the most up-to-date lastExplorePath value
        const currentLastExplorePath = getTabStore().getState().lastExplorePath;
        
        // If leaving Explore, save the current path (or clear if on discovery mode)
        if (activeTab === "explore" && tab !== "explore") {
            if (isExploreDetailPath(pathname)) {
                setLastExplorePath(pathname);
            } else {
                setLastExplorePath(null);
            }
        }
        
        // Determine where to navigate
        let targetUrl: string;
        if (tab === "explore" && currentLastExplorePath) {
            targetUrl = currentLastExplorePath;
        } else if (tab === "home") {
            targetUrl = "/";
        } else if (tab === "profile") {
            targetUrl = "/profile";
        } else {
            targetUrl = "/explore";
        }
        
        router.push(targetUrl);
    };

    const toggleCollapse = () => {
        setIsCollapsed((prev) => !prev);
    };

    // Render content based on active tab
    const renderContent = () => {
        if (isCollapsed) return null;
        
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

    const panelWidth = isCollapsed ? PANEL_WIDTH_COLLAPSED : PANEL_WIDTH_EXPANDED;

    return (
        <motion.div
            initial={false}
            animate={{ width: panelWidth }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed left-4 top-20 bottom-4 z-40 flex flex-col bg-background/90 backdrop-blur-xl border border-border shadow-xl rounded-2xl overflow-hidden"
        >
            {/* Header with Tabs and Collapse Toggle */}
            <div className={cn(
                "border-b border-border/60 shrink-0",
                isCollapsed ? "p-2" : "p-3"
            )}>
                {/* Collapse Toggle Button */}
                <div className={cn(
                    "flex items-center mb-2",
                    isCollapsed ? "justify-center" : "justify-end"
                )}>
                    <button
                        onClick={toggleCollapse}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                        aria-label={isCollapsed ? "Expand panel" : "Collapse panel"}
                        title={isCollapsed ? "Expand (⌘B)" : "Collapse (⌘B)"}
                    >
                        {isCollapsed ? (
                            <PanelLeft className="w-4 h-4" />
                        ) : (
                            <PanelLeftClose className="w-4 h-4" />
                        )}
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className={cn(
                    "flex gap-1 bg-muted/50 p-1 rounded-lg",
                    isCollapsed && "flex-col"
                )}>
                    <TabButton
                        tab="home"
                        icon={<Home className="w-4 h-4" />}
                        label="Home"
                        isActive={activeTab === "home"}
                        isCollapsed={isCollapsed}
                        onClick={() => handleTabChange("home")}
                    />
                    <TabButton
                        tab="explore"
                        icon={<Compass className="w-4 h-4" />}
                        label="Explore"
                        isActive={activeTab === "explore"}
                        isCollapsed={isCollapsed}
                        onClick={() => handleTabChange("explore")}
                    />
                    <TabButton
                        tab="profile"
                        icon={<User className="w-4 h-4" />}
                        label="Profile"
                        isActive={activeTab === "profile"}
                        isCollapsed={isCollapsed}
                        onClick={() => handleTabChange("profile")}
                    />
                </div>
            </div>

            {/* Content Area */}
            {!isCollapsed && (
                <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar">
                    <div className="flex min-h-full flex-col">
                        {renderContent()}
                        {/* Pane footer (visible when scrolled to bottom) */}
                        <Footer />
                    </div>
                </div>
            )}

            {/* Collapsed state hint */}
            {isCollapsed && (
                <div className="flex-1 flex items-center justify-center">
                    <span className="text-muted-foreground/50 text-xs rotate-[-90deg] whitespace-nowrap">
                        ⌘B to expand
                    </span>
                </div>
            )}
        </motion.div>
    );
};

export default DesktopNavLayout;

