"use client";

import React from "react";
import { Mountain, BookOpen, Trophy, ClipboardCheck, BarChart3, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTabStore, ProfileSubTab } from "@/store/tabStore";
import { useIsAuthenticated } from "@/hooks/useRequireAuth";
import { useAuthModalStore } from "@/providers/AuthModalProvider";
import ProfileSummitsList from "@/components/overlays/ProfileSummitsList";
import ProfileJournal from "@/components/overlays/ProfileJournal";
import ProfileChallenges from "@/components/overlays/ProfileChallenges";
import ProfileReviewContent from "./ProfileReviewContent";
import ProfileStatsContent from "./ProfileStatsContent";

interface SubTabButtonProps {
    tab: ProfileSubTab;
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}

const SubTabButton = ({ tab, icon, label, isActive, onClick }: SubTabButtonProps) => {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap flex-shrink-0",
                isActive
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
            )}
            aria-label={label}
            aria-selected={isActive}
            role="tab"
        >
            {icon}
            {label}
        </button>
    );
};

interface ProfileTabContentProps {
    isActive: boolean;
}

/**
 * Profile tab content - shows the current user's aggregate data.
 * Sub-tabs: Stats, Peaks, Journal, Challenges, Review
 * 
 * Note: This is for YOUR profile. Other users' profiles are viewed
 * in the Explore tab via /users/[id] routes.
 */
const ProfileTabContent = ({ isActive }: ProfileTabContentProps) => {
    const activeSubTab = useTabStore((state) => state.profileSubTab);
    const setProfileSubTab = useTabStore((state) => state.setProfileSubTab);
    const { isAuthenticated, isLoading, user } = useIsAuthenticated();
    const openLoginModal = useAuthModalStore((state) => state.openLoginModal);

    // Get current user's ID for profile queries
    const userId = user?.id ? String(user.id) : null;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-10">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated || !userId) {
        return (
            <div className="text-center py-10 px-4">
                <Mountain className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-foreground font-medium">Sign in to view your profile</p>
                <p className="text-sm text-muted-foreground mt-1">
                    Track your peaks, summit journal, and challenges
                </p>
                <button
                    onClick={() => openLoginModal()}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
                >
                    <LogIn className="w-4 h-4" />
                    Sign In
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Sub-tab bar */}
            <div className="py-2 border-b border-border/60 shrink-0">
                <div className="overflow-x-auto px-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    <div className="flex gap-0.5 bg-muted/50 p-0.5 rounded-lg w-fit min-w-full">
                        <SubTabButton
                            tab="stats"
                            icon={<BarChart3 className="w-3.5 h-3.5" />}
                            label="Stats"
                            isActive={activeSubTab === "stats"}
                            onClick={() => setProfileSubTab("stats")}
                        />
                        <SubTabButton
                            tab="peaks"
                            icon={<Mountain className="w-3.5 h-3.5" />}
                            label="Peaks"
                            isActive={activeSubTab === "peaks"}
                            onClick={() => setProfileSubTab("peaks")}
                        />
                        <SubTabButton
                            tab="journal"
                            icon={<BookOpen className="w-3.5 h-3.5" />}
                            label="Journal"
                            isActive={activeSubTab === "journal"}
                            onClick={() => setProfileSubTab("journal")}
                        />
                        <SubTabButton
                            tab="challenges"
                            icon={<Trophy className="w-3.5 h-3.5" />}
                            label="Challenges"
                            isActive={activeSubTab === "challenges"}
                            onClick={() => setProfileSubTab("challenges")}
                        />
                        <SubTabButton
                            tab="review"
                            icon={<ClipboardCheck className="w-3.5 h-3.5" />}
                            label="Review"
                            isActive={activeSubTab === "review"}
                            onClick={() => setProfileSubTab("review")}
                        />
                    </div>
                </div>
            </div>

            {/* Content based on active sub-tab */}
            <div className="flex-1 overflow-y-auto">
                {activeSubTab === "stats" && (
                    <ProfileStatsContent userId={userId} />
                )}
                {activeSubTab === "peaks" && (
                    <ProfileSummitsList 
                        userId={userId} 
                        compact={true} 
                        isActive={isActive}
                    />
                )}
                {activeSubTab === "journal" && (
                    <ProfileJournal userId={userId} />
                )}
                {activeSubTab === "challenges" && (
                    <ProfileChallenges userId={userId} />
                )}
                {activeSubTab === "review" && (
                    <div className="p-4">
                        <ProfileReviewContent />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileTabContent;

