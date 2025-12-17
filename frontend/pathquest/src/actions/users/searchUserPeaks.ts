"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import UserPeakWithSummitCount from "@/typeDefs/UserPeakWithSummitCount";
import ServerActionResult  from "@/typeDefs/ServerActionResult";

const backendUrl = getBackendUrl();

export interface SearchUserPeaksResult {
    peaks: UserPeakWithSummitCount[];
    totalCount: number;
}

const searchUserPeaks = async (
    userId: string,
    search?: string,
    page: number = 1,
    pageSize: number = 50
): Promise<ServerActionResult<SearchUserPeaksResult>> => {
    const session = await useAuth();
    // Always generate token for Google IAM authentication (required at infrastructure level)
    const token = await getGoogleIdToken().catch(() => null);

    const params = new URLSearchParams();
    if (search) params.set("search", search);
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));

    const apiRes = await fetch(
        `${backendUrl}/users/${userId}/peaks?${params.toString()}`,
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
        console.error("Error searching user peaks:", errorText);
        return {
            success: false,
            error: "Error searching peaks",
        };
    }

    const data: SearchUserPeaksResult = await apiRes.json();

    return {
        success: true,
        data,
    };
};

export default searchUserPeaks;

