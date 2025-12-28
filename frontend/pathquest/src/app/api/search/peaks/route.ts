import { authOptions } from "@/auth/authOptions";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import { createApiClient, endpoints } from "@pathquest/shared/api";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
    const backendUrl = getBackendUrl();
    
    // Get session to pass user identity to backend
    const session = await getServerSession(authOptions);
    // Always generate token for Google IAM authentication (required at infrastructure level)
    // User identity is passed via x-user-* headers for application-level auth
    const token = await getGoogleIdToken().catch((err) => {
        console.error("[peaks/search] Failed to get Google ID token:", err);
        return null;
    });
    
    if (!token) {
        console.warn("[peaks/search] No token available - request may fail Google IAM auth");
    }

    const client = createApiClient({
        baseUrl: backendUrl,
        getAuthHeaders: async () => {
            const headers: Record<string, string> = {};
            if (token) headers.Authorization = `Bearer ${token}`;
            if (session?.user?.id) headers["x-user-id"] = session.user.id;
            if (session?.user?.email) headers["x-user-email"] = session.user.email;
            if (session?.user?.name) headers["x-user-name"] = encodeURIComponent(session.user.name);
            return headers;
        },
    });

    try {
        const params: any = {};
        req.nextUrl.searchParams.forEach((value, key) => {
            params[key] = value;
        });
        const data = await endpoints.searchPeaks(client, params);
        return NextResponse.json(data, { status: 200 });
    } catch (err: any) {
        console.error("[peaks/search]", err?.bodyText ?? err);
        return NextResponse.json(
            { message: err?.message ?? "Upstream error" },
            { status: err?.statusCode ?? 502 }
        );
    }
};

