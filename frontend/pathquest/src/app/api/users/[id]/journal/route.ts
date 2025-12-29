import { authOptions } from "@/auth/authOptions";
import getSessionToken from "@/auth/getSessionToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import { createApiClient } from "@pathquest/shared/api";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) => {
    const { id: userId } = await params;
    
    // Get session using getServerSession (optional auth for public profiles)
    const session = await getServerSession(authOptions);

    const backendUrl = getBackendUrl();
    
    // Generate token for Google IAM authentication
    const token = await getSessionToken().catch((err) => {
        console.error("[user-journal] Failed to get Google ID token:", err);
        return null;
    });

    // Forward query params to backend
    const searchParams = req.nextUrl.searchParams;
    const queryString = searchParams.toString();

    const client = createApiClient({
        baseUrl: backendUrl,
        getAuthHeaders: async () => {
            const headers: Record<string, string> = {};
            if (token) headers.Authorization = `Bearer ${token}`;
            return headers;
        },
    });

    try {
        const data = await client.fetchJson(`/users/${userId}/journal${queryString ? `?${queryString}` : ""}`);
        return NextResponse.json(data, { status: 200 });
    } catch (err: any) {
        console.error("Error fetching user journal:", err?.bodyText ?? err);
        return NextResponse.json(
            { message: err?.message ?? "Upstream error" },
            { status: err?.statusCode ?? 502 }
        );
    }
};

