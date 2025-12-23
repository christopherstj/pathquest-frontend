"use client";

import React from "react";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProfileStatsContent from "@/components/navigation/ProfileStatsContent";
import ProfileSummitsList from "@/components/overlays/ProfileSummitsList";
import ProfileJournal from "@/components/overlays/ProfileJournal";
import ProfileChallenges from "@/components/overlays/ProfileChallenges";
import User from "@/typeDefs/User";
import { ExploreSubTab } from "@/store/tabStore";

interface ExploreProfileContentProps {
    userId: string | null;
    profileUser: User | null;
    profileStats: any | null;
    exploreSubTab: ExploreSubTab;
    onBack: () => void;
}

export const ExploreProfileContent = ({
    userId,
    profileUser,
    profileStats,
    exploreSubTab,
    onBack,
}: ExploreProfileContentProps) => {
    // Show error state if profile not found (404/private)
    if (!profileUser || !profileStats) {
        return (
            <div className="text-center py-10 px-4">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-foreground font-medium">Profile Not Found</p>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                    This profile may be private or doesn&apos;t exist.
                </p>
                <Button variant="outline" onClick={onBack}>
                    Go Back
                </Button>
            </div>
        );
    }

    if (!userId) return null;

    if (exploreSubTab === "stats") {
        return <ProfileStatsContent userId={userId} />;
    }
    if (exploreSubTab === "peaks") {
        return <ProfileSummitsList userId={userId} compact />;
    }
    if (exploreSubTab === "details") {
        return <ProfileJournal userId={userId} />;
    }
    if (exploreSubTab === "summits") {
        return <ProfileChallenges userId={userId} />;
    }
    // Default to stats view
    return <ProfileStatsContent userId={userId} />;
};


