"use server";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import { useAuth } from "@/auth/useAuth";
import getBackendUrl from "@/helpers/getBackendUrl";
import SummitWithPeak from "@/typeDefs/SummitWithPeak";
import ServerActionResult  from "@/typeDefs/ServerActionResult";

const backendUrl = getBackendUrl();

export interface SearchUserSummitsResult {
    summits: SummitWithPeak[];
    totalCount: number;
}

const searchUserSummits = async (
    userId: string,
    search?: string,
    page: number = 1,
    pageSize: number = 50
): Promise<ServerActionResult<SearchUserSummitsResult>> => {
    const session = await useAuth();
    // Always generate token for Google IAM authentication (required at infrastructure level)
    const token = await getGoogleIdToken().catch(() => null);

    const params = new URLSearchParams();
    if (search) params.set("search", search);
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));

    const apiRes = await fetch(
        `${backendUrl}/users/${userId}/summits?${params.toString()}`,
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
        console.error("Error searching user summits:", errorText);
        return {
            success: false,
            error: "Error searching summits",
        };
    }

    const data: SearchUserSummitsResult = await apiRes.json();

    return {
        success: true,
        data,
    };
};

export default searchUserSummits;

