"use server";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import ManualPeakSummit from "@/typeDefs/ManualPeakSummit";

const backendUrl = getBackendUrl();

const addManualPeakSummit = async (
    peakId: string,
    summitDate: string,
    notes: string,
    timezone: string,
    isPublic: boolean,
    activityId?: string
) => {
    const session = await useAuth();

    if (!session) {
        return;
    }

    const token = await getGoogleIdToken();

    const userId = session.user?.id;

    const url = `${backendUrl}/peaks/summits/manual`;

    const data: ManualPeakSummit = {
        id: `${userId}-${peakId}-${summitDate}`,
        user_id: userId,
        peak_id: peakId,
        activity_id: activityId,
        notes: notes,
        is_public: isPublic,
        timestamp: summitDate,
        timezone: timezone,
    };

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        console.error(await response.text());
    } else {
        return await response.json();
    }
};

export default addManualPeakSummit;
