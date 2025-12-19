"use client";

import React from "react";
import { Home, Compass, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTabStore, TabType } from "@/store/tabStore";

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

const BottomTabBar = ({ className }: BottomTabBarProps) => {
    const activeTab = useTabStore((state) => state.activeTab);
    const setActiveTab = useTabStore((state) => state.setActiveTab);
    const clearExploreHistory = useTabStore((state) => state.clearExploreHistory);

    const handleTabChange = (tab: TabType) => {
        if (tab !== activeTab) {
            // Clear explore history when switching tabs
            if (activeTab === "explore") {
                clearExploreHistory();
            }
            setActiveTab(tab);
        }
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

