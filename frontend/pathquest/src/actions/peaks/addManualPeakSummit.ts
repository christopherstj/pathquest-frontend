"use server";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import ManualPeakSummit from "@/typeDefs/ManualPeakSummit";
import { Difficulty, ExperienceRating } from "@/typeDefs/Summit";

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

    const url = `${backendUrl}/peaks/summits/manual`;

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

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            // Pass user identity via headers for backend auth (works in both dev and prod)
            ...(userId ? { "x-user-id": userId } : {}),
            ...(session?.user?.email ? { "x-user-email": session.user.email } : {}),
            ...(session?.user?.name ? { "x-user-name": encodeURIComponent(session.user.name) } : {}),
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(errorText);
        return { success: false, error: errorText };
    }

    return { success: true };
};

export default addManualPeakSummit;
