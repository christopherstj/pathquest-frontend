"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import AscentDetail from "@/typeDefs/AscentDetail";
import Peak from "@/typeDefs/Peak";

const backendUrl = getBackendUrl();

const getAscentDetails = async (
    ascentId: string
): Promise<{
    ascent: AscentDetail;
    peak: Peak;
} | null> => {
    const session = await useAuth();

    if (!session) {
        return null;
    }

    const token = await getGoogleIdToken();

    if (!token && process.env.NODE_ENV !== "development") {
        console.error("[getAscentDetails] No token available - cannot make authenticated request");
        return null;
    }

    const url = `${backendUrl}/peaks/ascent/${ascentId}`;

    const response = await fetch(url, {
        method: "GET",
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    if (!response.ok) {
        console.error("[getAscentDetails]", response.status, await response.text());
        return null;
    }

    return await response.json();
};

export default getAscentDetails;
