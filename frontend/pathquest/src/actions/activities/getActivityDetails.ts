"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import { useAuth } from "@/auth/useAuth";
import { createApiClient, endpoints } from "@pathquest/shared/api";
import type { Activity, SummitWithPeak } from "@pathquest/shared/types";

const backendUrl = getBackendUrl();

const getActivityDetails = async (
    activityId: string
): Promise<{
    activity: Activity;
    summits: SummitWithPeak[];
    isOwner: boolean;
} | null> => {
    const session = await useAuth();
    // Always generate token for Google IAM authentication (required at infrastructure level)
    const token = await getGoogleIdToken().catch(() => null);
    const userId = session?.user?.id;

    const client = createApiClient({
        baseUrl: backendUrl,
        getAuthHeaders: async () => {
            const headers: Record<string, string> = {};
            if (token) headers.Authorization = `Bearer ${token}`;
            if (userId) headers["x-user-id"] = userId;
            if (session?.user?.email) headers["x-user-email"] = session.user.email;
            if (session?.user?.name) headers["x-user-name"] = encodeURIComponent(session.user.name);
            return headers;
        },
    });

    let data: any;
    try {
        data = await endpoints.getActivityDetails(client, activityId);
    } catch (err: any) {
        console.error(err?.bodyText ?? err);
        return null;
    }

    // Determine if current user is the owner of this activity
    // Convert both to strings for reliable comparison
    const isOwner = Boolean(
        userId && 
        data.activity?.user_id && 
        String(data.activity.user_id) === String(userId)
    );

    return {
        ...data,
        isOwner,
    };
};

export default getActivityDetails;
