import { authOptions } from "@/auth/authOptions";
import getSessionToken from "@/auth/getSessionToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import { createApiClient, endpoints } from "@pathquest/shared/api";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
    const backendUrl = getBackendUrl();
    
    // Get session to pass user identity to backend
    // This works the same as dashboard routes - getServerSession reads cookies automatically
    const session = await getServerSession(authOptions);
    
    // Always generate token for Google IAM authentication (required at infrastructure level)
    const token = await getSessionToken().catch((err) => {
        console.error("[challenges/search] Failed to get Google ID token:", err);
        return null;
    });

    const client = createApiClient({
        baseUrl: backendUrl,
        getAuthHeaders: async () => {
            const headers: Record<string, string> = {};
            if (token) headers.Authorization = `Bearer ${token}`;
            return headers;
        },
    });

    try {
        const params: any = {};
        req.nextUrl.searchParams.forEach((value, key) => {
            params[key] = value;
        });
        const data = await endpoints.searchChallenges(client, params);
        return NextResponse.json(data, { status: 200 });
    } catch (err: any) {
        console.error("[challenges/search]", err?.bodyText ?? err);
        return NextResponse.json(
            { message: err?.message ?? "Upstream error" },
            { status: err?.statusCode ?? 502 }
        );
    }
};

