"use client";

import React from "react";
import Challenge from "@/typeDefs/Challenge";
import ChallengeProgress from "@/typeDefs/ChallengeProgress";
import Peak from "@/typeDefs/Peak";
import Activity from "@/typeDefs/Activity";
import User from "@/typeDefs/User";
import { ExploreContentType } from "@/hooks/use-explore-route";
import { ExploreSubTab } from "@/store/tabStore";
import { ExploreLoadingState } from "@/components/navigation/explore/ExploreLoadingState";
import { ExploreDiscoveryContent } from "@/components/navigation/explore/ExploreDiscoveryContent";
import { ExplorePeakContent } from "@/components/navigation/explore/ExplorePeakContent";
import { ExploreChallengeContent } from "@/components/navigation/explore/ExploreChallengeContent";
import { ExploreUserChallengeContent } from "@/components/navigation/explore/ExploreUserChallengeContent";
import { ExploreActivityContent } from "@/components/navigation/explore/ExploreActivityContent";
import { ExploreProfileContent } from "@/components/navigation/explore/ExploreProfileContent";
import { ExploreEmptyContent } from "@/components/navigation/explore/ExploreEmptyContent";
import { ChallengeProgressInfo as ChallengeProgressInfoAuthenticated } from "@/actions/challenges/getChallengeDetails";
import { NextPeakSuggestion } from "@/actions/challenges/getNextPeakSuggestion";
import { ChallengeActivity } from "@/actions/challenges/getChallengeActivity";
import { ChallengePeakWithSummit, ChallengeProgressInfo as UserChallengeProgressInfo } from "@/actions/users/getUserChallengeProgress";

interface ExploreContentProps {
    isLoading: boolean;
    contentType: ExploreContentType;
    exploreSubTab: ExploreSubTab;

    // Discovery
    visibleChallenges: ChallengeProgress[];
    visiblePeaks: Peak[];
    isZoomedOutTooFar: boolean;
    onPeakClick: (id: string, coords?: [number, number]) => void;
    onChallengeClick: (id: string) => void;

    // Peak
    peak: Peak | null;
    peakId: string | null;
    peakChallenges: Challenge[] | null | undefined;
    setExploreSubTab: (tab: ExploreSubTab) => void;
    isAuthenticated: boolean;
    requireAuth: (fn: () => void) => void;
    highlightedActivityId: string | null;
    setHighlightedActivityId: (id: string | null) => void;

    // Challenge
    challenge: Challenge | null;
    challengePeaks: Peak[] | null;
    challengeProgress: ChallengeProgressInfoAuthenticated | null | undefined;
    nextPeakSuggestion: NextPeakSuggestion | null;
    communityActivity: ChallengeActivity | null;
    isFavorited: boolean;
    onBack: () => void;
    onClose: () => void;
    onToggleFavorite: () => void;
    onShowChallengeOnMap: () => void;
    onHoverStart: (peakId: string, coords: [number, number]) => void;
    onHoverEnd: () => void;

    // User challenge
    userChallengeChallengeId: string | null;
    userChallengeChallenge: Challenge | null;
    userChallengeProgress: UserChallengeProgressInfo | null;
    userChallengePeaks: ChallengePeakWithSummit[];
    userChallengeUser: { id: string; name: string; pic?: string } | null;

    // Activity
    activity: Activity | null;
    activityId: string | null;
    activitySummits: any[];
    isActivityOwner: boolean;
    onSummitHover: (peakId: string | null) => void;
    onShowActivityOnMap: () => void;
    onHoverCoords: (coords: [number, number] | null) => void;

    // Profile
    userId: string | null;
    profileUser: User | null;
    profileStats: any | null;
}

export const ExploreContent = (props: ExploreContentProps) => {
    if (props.isLoading) {
        return <ExploreLoadingState />;
    }

    if (props.contentType === "discovery") {
        return (
            <ExploreDiscoveryContent
                visibleChallenges={props.visibleChallenges}
                visiblePeaks={props.visiblePeaks}
                isZoomedOutTooFar={props.isZoomedOutTooFar}
                onPeakClick={props.onPeakClick}
                onChallengeClick={props.onChallengeClick}
            />
        );
    }

    if (props.contentType === "peak") {
        return (
            <ExplorePeakContent
                peak={props.peak}
                peakId={props.peakId}
                peakChallenges={props.peakChallenges}
                exploreSubTab={props.exploreSubTab}
                setExploreSubTab={props.setExploreSubTab}
                isAuthenticated={props.isAuthenticated}
                requireAuth={props.requireAuth}
                highlightedActivityId={props.highlightedActivityId}
                setHighlightedActivityId={props.setHighlightedActivityId}
            />
        );
    }

    if (props.contentType === "challenge") {
        return (
            <ExploreChallengeContent
                challenge={props.challenge}
                challengePeaks={props.challengePeaks}
                challengeProgress={props.challengeProgress}
                nextPeakSuggestion={props.nextPeakSuggestion}
                communityActivity={props.communityActivity}
                isFavorited={props.isFavorited}
                exploreSubTab={props.exploreSubTab}
                onBack={props.onBack}
                onClose={props.onClose}
                onToggleFavorite={props.onToggleFavorite}
                onShowOnMap={props.onShowChallengeOnMap}
                onPeakClick={props.onPeakClick}
                onHoverStart={props.onHoverStart}
                onHoverEnd={props.onHoverEnd}
            />
        );
    }

    if (props.contentType === "userChallenge") {
        return (
            <ExploreUserChallengeContent
                isAuthenticated={props.isAuthenticated}
                exploreSubTab={props.exploreSubTab}
                userId={props.userId}
                challengeId={props.userChallengeChallengeId}
                challenge={props.userChallengeChallenge}
                progress={props.userChallengeProgress}
                peaks={props.userChallengePeaks}
                user={props.userChallengeUser}
                onBack={props.onBack}
                onPeakClick={props.onPeakClick}
                onHoverStart={props.onHoverStart}
                onHoverEnd={props.onHoverEnd}
            />
        );
    }

    if (props.contentType === "activity") {
        return (
            <ExploreActivityContent
                activity={props.activity}
                activityId={props.activityId}
                activitySummits={props.activitySummits}
                isActivityOwner={props.isActivityOwner}
                exploreSubTab={props.exploreSubTab}
                onBack={props.onBack}
                onClose={props.onClose}
                onShowOnMap={props.onShowActivityOnMap}
                onSummitHover={props.onSummitHover}
                onHoverCoords={props.onHoverCoords}
            />
        );
    }

    if (props.contentType === "profile") {
        return (
            <ExploreProfileContent
                userId={props.userId}
                profileUser={props.profileUser}
                profileStats={props.profileStats}
                exploreSubTab={props.exploreSubTab}
                onBack={props.onBack}
            />
        );
    }

    return <ExploreEmptyContent />;
};


