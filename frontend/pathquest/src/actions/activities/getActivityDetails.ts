"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import { useAuth } from "@/auth/useAuth";
import Activity from "@/typeDefs/Activity";
import SummitWithPeak from "@/typeDefs/SummitWithPeak";

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

    const url = `${backendUrl}/activities/${activityId}`;

    const res = await fetch(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            // Pass user identity via headers for backend auth (works in both dev and prod)
            ...(userId ? { "x-user-id": userId } : {}),
            ...(session?.user?.email ? { "x-user-email": session.user.email } : {}),
            ...(session?.user?.name ? { "x-user-name": encodeURIComponent(session.user.name) } : {}),
        },
    });

    if (!res.ok) {
        console.error(await res.text());
        return null;
    }

    const data = await res.json();

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
