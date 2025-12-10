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

    const token = await getGoogleIdToken().catch(() => null);
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
            ...(process.env.NODE_ENV === "development" && userId
                ? { "x-user-id": userId }
                : {}),
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
