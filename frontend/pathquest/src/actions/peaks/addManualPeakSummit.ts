"use server";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { createApiClient, endpoints } from "@pathquest/shared/api";
import type { Difficulty, ExperienceRating, ManualPeakSummit } from "@pathquest/shared/types";

const backendUrl = getBackendUrl();

type AddManualPeakSummitParams = {
    peakId: string;
    summitDate: string;
    notes?: string;
    timezone: string;
    isPublic: boolean;
    activityId?: string;
    difficulty?: Difficulty;
    experienceRating?: ExperienceRating;
};

const addManualPeakSummit = async ({
    peakId,
    summitDate,
    notes,
    timezone,
    isPublic,
    activityId,
    difficulty,
    experienceRating,
}: AddManualPeakSummitParams): Promise<{ success: boolean; error?: string }> => {
    const session = await useAuth();

    if (!session) {
        return { success: false, error: "Unauthorized" };
    }

    // Always generate token for Google IAM authentication (required at infrastructure level)
    const token = await getGoogleIdToken().catch((err) => {
        console.error("[addManualPeakSummit] Failed to get Google ID token:", err);
        return null;
    });
    const userId = session.user?.id;

    const data: ManualPeakSummit = {
        id: `${userId}-${peakId}-${summitDate}`,
        user_id: userId,
        peak_id: peakId,
        activity_id: activityId,
        notes: notes || "",
        is_public: isPublic,
        timestamp: summitDate,
        timezone: timezone,
        difficulty,
        experience_rating: experienceRating,
    };

    const client = createApiClient({
        baseUrl: backendUrl,
        getAuthHeaders: async () => {
            const headers: Record<string, string> = {};
            if (token) headers.Authorization = `Bearer ${token}`;
            // Pass user identity via headers for backend auth (works in both dev and prod)
            if (userId) headers["x-user-id"] = userId;
            if (session?.user?.email) headers["x-user-email"] = session.user.email;
            if (session?.user?.name) headers["x-user-name"] = encodeURIComponent(session.user.name);
            return headers;
        },
    });

    try {
        await endpoints.addManualPeakSummit(client, data);
    } catch (err: any) {
        const bodyText = err?.bodyText ? String(err.bodyText) : undefined;
        console.error(bodyText ?? err);
        return { success: false, error: bodyText ?? "Failed to add summit" };
    }

    return { success: true };
};

export default addManualPeakSummit;
