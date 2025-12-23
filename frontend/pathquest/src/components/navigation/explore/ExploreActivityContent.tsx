"use client";

import React from "react";
import { Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import Activity from "@/typeDefs/Activity";
import ActivityDetailsMobile from "@/components/overlays/mobile/activity-details-mobile";
import ActivitySummitsList from "@/components/app/activities/ActivitySummitsList";
import ActivityAnalytics from "@/components/app/activities/ActivityAnalytics";
import { ExploreSubTab } from "@/store/tabStore";

interface ExploreActivityContentProps {
    activity: Activity | null;
    activityId: string | null;
    activitySummits: any[];
    isActivityOwner: boolean;
    exploreSubTab: ExploreSubTab;
    onBack: () => void;
    onClose: () => void;
    onShowOnMap: () => void;
    onSummitHover: (peakId: string | null) => void;
    onHoverCoords: (coords: [number, number] | null) => void;
}

export const ExploreActivityContent = ({
    activity,
    activityId,
    activitySummits,
    isActivityOwner,
    exploreSubTab,
    onBack,
    onClose,
    onShowOnMap,
    onSummitHover,
    onHoverCoords,
}: ExploreActivityContentProps) => {
    // Show error state if activity not found (404/unauthorized)
    if (!activity) {
        return (
            <div className="text-center py-10 px-4">
                <Route className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-foreground font-medium">Activity Not Found</p>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                    This activity may be private or doesn&apos;t exist.
                </p>
                <Button variant="outline" onClick={onBack}>
                    Go Back
                </Button>
            </div>
        );
    }

    if (exploreSubTab === "summits") {
        return (
            <div className="p-4">
                <ActivitySummitsList
                    summits={activitySummits}
                    activityId={activityId!}
                    onSummitHover={onSummitHover}
                    isOwner={isActivityOwner}
                />
            </div>
        );
    }

    if (exploreSubTab === "analytics") {
        return (
            <div className="p-4">
                <ActivityAnalytics activity={activity} />
            </div>
        );
    }

    // Default to details view
    return (
        <div className="p-4">
            <ActivityDetailsMobile
                activity={activity}
                summits={activitySummits}
                onClose={onClose}
                onShowOnMap={onShowOnMap}
                onHover={onHoverCoords}
            />
        </div>
    );
};


