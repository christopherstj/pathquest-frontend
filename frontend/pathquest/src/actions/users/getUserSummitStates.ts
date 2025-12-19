"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import ServerActionResult from "@/typeDefs/ServerActionResult";

const backendUrl = getBackendUrl();

export interface GetUserSummitStatesResult {
    states: string[];
}

/**
 * Gets the list of states where a user has summited peaks
 * Used to populate the state filter dropdown
 */
const getUserSummitStates = async (
    userId: string
): Promise<ServerActionResult<GetUserSummitStatesResult>> => {
    const session = await useAuth();
    // Always generate token for Google IAM authentication (required at infrastructure level)
    const token = await getGoogleIdToken().catch(() => null);

    const apiRes = await fetch(
        `${backendUrl}/users/${userId}/peaks/states`,
        {
            method: "GET",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        }
    );

    if (!apiRes.ok) {
        const errorText = await apiRes.text();
        console.error("Error getting user summit states:", errorText);
        return {
            success: false,
            error: "Error getting states",
        };
    }

    const data: GetUserSummitStatesResult = await apiRes.json();

    return {
        success: true,
        data,
    };
};

export default getUserSummitStates;

