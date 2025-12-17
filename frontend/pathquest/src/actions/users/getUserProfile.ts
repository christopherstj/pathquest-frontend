"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import User from "@/typeDefs/User";
import ProfileStats from "@/typeDefs/ProfileStats";
import ChallengeProgress from "@/typeDefs/ChallengeProgress";
import Peak from "@/typeDefs/Peak";
import ServerActionResult from "@/typeDefs/ServerActionResult";

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
    const token = session ? await getGoogleIdToken() : null;

    const apiRes = await fetch(`${backendUrl}/users/${userId}/profile`, {
        method: "GET",
        cache: "no-cache",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    if (!apiRes.ok) {
        const errorText = await apiRes.text();
        console.error("Error fetching profile:", errorText);
        return {
            success: false,
            error: apiRes.status === 404 ? "Profile not found" : "Error fetching profile",
        };
    }

    const data: ProfileData = await apiRes.json();

    return {
        success: true,
        data,
    };
};

export default getUserProfile;

