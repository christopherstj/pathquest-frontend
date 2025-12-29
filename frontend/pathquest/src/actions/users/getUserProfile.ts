"use server";
import getSessionToken from "@/auth/getSessionToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import { createApiClient, endpoints } from "@pathquest/shared/api";
import type { ChallengeProgress, Peak, ProfileStats, ServerActionResult, User } from "@pathquest/shared/types";

const backendUrl = getBackendUrl();

export interface ProfileData {
    user: User;
    stats: ProfileStats;
    acceptedChallenges: ChallengeProgress[];
    peaksForMap: Peak[];
    isOwner: boolean;
}

const getUserProfile = async (
    userId: string
): Promise<ServerActionResult<ProfileData>> => {
    const session = await useAuth();
    // Always generate token for Google IAM authentication (required at infrastructure level)
    const token = await getSessionToken().catch(() => null);
    const currentUserId = session?.user?.id;

    const client = createApiClient({
        baseUrl: backendUrl,
        getAuthHeaders: async () => {
            const headers: Record<string, string> = {};
            if (token) headers.Authorization = `Bearer ${token}`;
            return headers;
        },
    });

    let data: any;
    try {
        data = await endpoints.getUserProfile(client, userId, { cache: "no-cache" } as any);
    } catch (err: any) {
        console.error("Error fetching profile:", err?.bodyText ?? err);
        return {
            success: false,
            error: err?.status === 404 ? "Profile not found" : "Error fetching profile",
        };
    }
    
    // Determine if current user is the owner of this profile
    // Convert both to strings to handle potential type mismatch (session user.id may be number, URL userId is string)
    const isOwner = Boolean(currentUserId && String(currentUserId) === String(userId));

    return {
        success: true,
        data: {
            ...data,
            isOwner,
        },
    };
};

export default getUserProfile;

