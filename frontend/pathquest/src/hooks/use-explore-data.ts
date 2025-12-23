"use client";

import { useCallback, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useUserLocation from "@/hooks/use-user-location";
import { convertSummitsToPeaks } from "@/helpers/convertSummitsToPeaks";

import getPeakDetails from "@/actions/peaks/getPeakDetails";
import getPublicChallengeDetails from "@/actions/challenges/getPublicChallengeDetails";
import getChallengeDetails from "@/actions/challenges/getChallengeDetails";
import getNextPeakSuggestion from "@/actions/challenges/getNextPeakSuggestion";
import getChallengeActivity from "@/actions/challenges/getChallengeActivity";
import getActivityDetails from "@/actions/activities/getActivityDetails";
import getUserProfile from "@/actions/users/getUserProfile";
import getUserChallengeProgress from "@/actions/users/getUserChallengeProgress";

export interface UseExploreDataParams {
    isActive: boolean;
    isAuthenticated: boolean;
    peakId: string | null;
    challengeId: number | null;
    activityId: string | null;
    userId: string | null;
    userChallengeUserId: string | null;
    userChallengeChallengeId: string | null;
}

export function useExploreData(params: UseExploreDataParams) {
    const {
        isActive,
        isAuthenticated,
        peakId,
        challengeId,
        activityId,
        userId,
        userChallengeUserId,
        userChallengeChallengeId,
    } = params;

    const queryClient = useQueryClient();

    // Data fetching queries
    // placeholderData keeps previous data visible while refetching
    // This prevents empty states when switching tabs
    const { data: peakData, isLoading: peakLoading } = useQuery({
        queryKey: ["peakDetails", peakId],
        queryFn: async () => {
            if (!peakId) return null;
            return await getPeakDetails(peakId);
        },
        enabled: Boolean(peakId) && isActive,
        placeholderData: (previousData) => previousData,
    });

    const { data: challengeData, isLoading: challengeLoading } = useQuery({
        queryKey: ["challengeDetails", challengeId, isAuthenticated],
        queryFn: async () => {
            if (!challengeId) return null;
            // Use authenticated endpoint when logged in to get progress data
            if (isAuthenticated) {
                const data = await getChallengeDetails(String(challengeId));
                // Convert to ServerActionResult format for consistency
                return data ? { success: true, data } : { success: false, error: "Failed to fetch challenge details" };
            } else {
                // Use public endpoint for unauthenticated users
                return await getPublicChallengeDetails(String(challengeId));
            }
        },
        enabled: Boolean(challengeId) && isActive,
        placeholderData: (previousData) => previousData,
    });

    // User location for next peak suggestions
    const { location: userLocation } = useUserLocation({ requestOnMount: Boolean(challengeId) });

    // Next peak suggestion query
    const { data: nextPeakData } = useQuery({
        queryKey: ["nextPeakSuggestion", challengeId, userLocation?.lat, userLocation?.lng],
        queryFn: async () => {
            if (!challengeId) return null;
            return await getNextPeakSuggestion(
                String(challengeId),
                userLocation?.lat,
                userLocation?.lng
            );
        },
        enabled: Boolean(challengeId) && isActive && Boolean(userLocation),
        placeholderData: (previousData) => previousData,
    });

    // Challenge community activity query
    const { data: challengeActivityData } = useQuery({
        queryKey: ["challengeActivity", challengeId],
        queryFn: async () => {
            if (!challengeId) return null;
            return await getChallengeActivity(String(challengeId));
        },
        enabled: Boolean(challengeId) && isActive,
        placeholderData: (previousData) => previousData,
    });

    const { data: activityData, isLoading: activityLoading } = useQuery({
        queryKey: ["activityDetails", activityId],
        queryFn: async () => {
            if (!activityId) return null;
            return await getActivityDetails(activityId);
        },
        enabled: Boolean(activityId) && isActive,
        placeholderData: (previousData) => previousData,
    });

    const { data: profileData, isLoading: profileLoading } = useQuery({
        queryKey: ["userProfile", userId],
        queryFn: async () => {
            if (!userId) return null;
            return await getUserProfile(userId);
        },
        enabled: Boolean(userId) && isActive,
        placeholderData: (previousData) => previousData,
    });

    // User challenge progress query (for /users/:userId/challenges/:challengeId)
    const { data: userChallengeData, isLoading: userChallengeLoading } = useQuery({
        queryKey: ["userChallengeProgress", userChallengeUserId, userChallengeChallengeId],
        queryFn: async () => {
            if (!userChallengeUserId || !userChallengeChallengeId) return null;
            return await getUserChallengeProgress(userChallengeUserId, userChallengeChallengeId);
        },
        enabled: Boolean(userChallengeUserId && userChallengeChallengeId) && isActive,
        placeholderData: (previousData) => previousData,
    });

    // Refetch queries when tab becomes active again
    // This ensures data is fresh when returning to the Explore tab
    useEffect(() => {
        if (!isActive) return;

        // Refetch active queries when tab becomes active
        if (peakId) {
            queryClient.refetchQueries({ queryKey: ["peakDetails", peakId] });
        }
        if (challengeId) {
            queryClient.refetchQueries({ queryKey: ["challengeDetails", challengeId] });
        }
        if (activityId) {
            queryClient.refetchQueries({ queryKey: ["activityDetails", activityId] });
        }
        if (userId) {
            queryClient.refetchQueries({ queryKey: ["userProfile", userId] });
        }
        if (userChallengeUserId && userChallengeChallengeId) {
            queryClient.refetchQueries({ queryKey: ["userChallengeProgress", userChallengeUserId, userChallengeChallengeId] });
        }
    }, [isActive, peakId, challengeId, activityId, userId, userChallengeUserId, userChallengeChallengeId, queryClient]);

    // Extract data from queries
    const peak = peakData?.success ? peakData.data?.peak : null;
    const peakChallenges = peakData?.success ? peakData.data?.challenges : null;
    const publicSummits = peakData?.success ? peakData.data?.publicSummits : null;
    const peakActivities = peakData?.success ? peakData.data?.activities : null;

    const challenge = challengeData?.success ? challengeData.data?.challenge : null;
    const challengePeaks = challengeData?.success ? challengeData.data?.peaks : null;
    const challengeProgress = challengeData?.success ? challengeData.data?.progress : null;
    const nextPeakSuggestion = nextPeakData?.success ? nextPeakData.data : null;
    const communityActivity = challengeActivityData?.success ? challengeActivityData.data : null;
    const isFavorited = challenge?.is_favorited ?? false;

    const activity = activityData?.activity ?? null;
    const activitySummits = activityData?.summits ?? [];
    const isActivityOwner = activityData?.isOwner ?? false;
    const activityPeakSummits = useMemo(() => convertSummitsToPeaks(activitySummits), [activitySummits]);

    const profileResult = profileData?.success ? profileData.data : null;
    const profileUser = profileResult?.user ?? null;
    const profileStats = profileResult?.stats ?? null;
    const profilePeaksForMap = profileResult?.peaksForMap ?? [];

    // User challenge data
    const userChallengeResult = userChallengeData?.success ? userChallengeData.data : null;
    const userChallengeChallenge = userChallengeResult?.challenge ?? null;
    const userChallengeProgress = userChallengeResult?.progress ?? null;
    const userChallengePeaks = userChallengeResult?.peaks ?? [];
    const userChallengeUser = userChallengeResult?.user ?? null;

    const isLoading = (peakId && peakLoading)
        || (challengeId && challengeLoading)
        || (activityId && activityLoading)
        || (userId && profileLoading)
        || (userChallengeUserId && userChallengeLoading);

    const invalidateChallengeDetails = useCallback((id: number) => {
        queryClient.invalidateQueries({ queryKey: ["challengeDetails", id] });
    }, [queryClient]);

    const invalidateFavoriteChallenges = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ["favoriteChallenges"] });
    }, [queryClient]);

    return {
        isLoading: Boolean(isLoading),

        peak,
        peakChallenges,
        publicSummits,
        peakActivities,

        challenge,
        challengePeaks,
        challengeProgress,
        nextPeakSuggestion,
        communityActivity,
        isFavorited,

        activity,
        activitySummits,
        isActivityOwner,
        activityPeakSummits,

        profileUser,
        profileStats,
        profilePeaksForMap,

        userChallengeChallenge,
        userChallengeProgress,
        userChallengePeaks,
        userChallengeUser,

        invalidateChallengeDetails,
        invalidateFavoriteChallenges,
    };
}


