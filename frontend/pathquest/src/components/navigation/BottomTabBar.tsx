"use client";

import React, { useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Home, Compass, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTabStore, type TabType } from "@/store/tabStore";

interface TabButtonProps {
    tab: TabType;
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}

const TabButton = ({ tab, icon, label, isActive, onClick }: TabButtonProps) => {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 py-2 min-h-[56px] transition-colors",
                isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
            )}
            aria-label={label}
            aria-selected={isActive}
            role="tab"
        >
            <div className={cn(
                "p-1.5 rounded-lg transition-colors",
                isActive && "bg-primary/10"
            )}>
                {icon}
            </div>
            <span className={cn(
                "text-[10px] font-medium",
                isActive && "font-semibold"
            )}>
                {label}
            </span>
        </button>
    );
};

interface BottomTabBarProps {
    className?: string;
}

// Check if a path is an Explore detail route (not just /explore)
const isExploreDetailPath = (path: string): boolean => {
    return (
        path.startsWith("/peaks/") ||
        path.startsWith("/challenges/") ||
        path.startsWith("/activities/") ||
        path.startsWith("/users/")
    );
};

const BottomTabBar = ({ className }: BottomTabBarProps) => {
    const router = useRouter();
    const pathname = usePathname();
    
    // Tab memory: remember last Explore detail path
    const lastExplorePath = useTabStore((state) => state.lastExplorePath);
    const setLastExplorePath = useTabStore((state) => state.setLastExplorePath);

    // Derive active tab from URL - URL is the source of truth
    const activeTab: TabType = useMemo(() => {
        if (pathname === "/profile") return "profile";
        if (pathname === "/explore" || isExploreDetailPath(pathname)) {
            return "explore";
        }
        return "home";
    }, [pathname]);

    const handleTabChange = (tab: TabType) => {
        // If leaving Explore, save the current path (or clear if on discovery mode)
        if (activeTab === "explore" && tab !== "explore") {
            if (isExploreDetailPath(pathname)) {
                // Save detail path for later restoration
                setLastExplorePath(pathname);
            } else {
                // On discovery mode (/explore), clear any saved path
                setLastExplorePath(null);
            }
        }
        
        // Determine where to navigate
        let targetUrl: string;
        if (tab === "explore" && lastExplorePath) {
            // Restore saved Explore path
            targetUrl = lastExplorePath;
        } else if (tab === "home") {
            targetUrl = "/";
        } else if (tab === "profile") {
            targetUrl = "/profile";
        } else {
            targetUrl = "/explore";
        }
        
        router.push(targetUrl);
    };

    return (
        <nav
            className={cn(
                "fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-t border-border",
                "safe-area-pb", // Handle safe area on iOS
                className
            )}
            role="tablist"
            aria-label="Main navigation"
        >
            <div className="flex items-stretch">
                <TabButton
                    tab="home"
                    icon={<Home className="w-5 h-5" />}
                    label="Home"
                    isActive={activeTab === "home"}
                    onClick={() => handleTabChange("home")}
                />
                <TabButton
                    tab="explore"
                    icon={<Compass className="w-5 h-5" />}
                    label="Explore"
                    isActive={activeTab === "explore"}
                    onClick={() => handleTabChange("explore")}
                />
                <TabButton
                    tab="profile"
                    icon={<User className="w-5 h-5" />}
                    label="Profile"
                    isActive={activeTab === "profile"}
                    onClick={() => handleTabChange("profile")}
                />
            </div>
        </nav>
    );
};

export default BottomTabBar;

