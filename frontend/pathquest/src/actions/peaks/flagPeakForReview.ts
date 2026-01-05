"use server";

import getSessionToken from "@/auth/getSessionToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";

/**
 * Flag a peak for coordinate review.
 * This sets needs_review = true on the peak, so it shows up in the review tool.
 */
const flagPeakForReview = async (peakId: string): Promise<boolean> => {
    const session = await useAuth();

    if (!session) {
        return false;
    }

    const backendUrl = getBackendUrl();

    const token = await getSessionToken().catch((err) => {
        console.error("[flagPeakForReview] Failed to get token:", err);
        return null;
    });

    if (!token && process.env.NODE_ENV !== "development") {
        console.error("[flagPeakForReview] No token available");
        return false;
    }

    try {
        const res = await fetch(`${backendUrl}/peaks/${peakId}/flag-for-review`, {
            method: "POST",
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });

        if (!res.ok) {
            console.error("[flagPeakForReview] Failed:", res.status, await res.text());
            return false;
        }

        return true;
    } catch (err) {
        console.error("[flagPeakForReview] Error:", err);
        return false;
    }
};

export default flagPeakForReview;

