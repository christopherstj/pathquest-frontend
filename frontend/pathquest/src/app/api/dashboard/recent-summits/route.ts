import { authOptions } from "@/auth/authOptions";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import { createApiClient, endpoints } from "@pathquest/shared/api";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
    // Get session using getServerSession with authOptions
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json(
            { message: "Unauthorized" },
            { status: 401 }
        );
    }

    const backendUrl = getBackendUrl();
    
    // Always generate token for Google IAM authentication (required at infrastructure level)
    // Returns empty string in development, valid token in production
    const token = await getGoogleIdToken().catch((err) => {
        console.error("[recent-summits] Failed to get Google ID token:", err);
        return null;
    });

    const client = createApiClient({
        baseUrl: backendUrl,
        getAuthHeaders: async () => {
            const headers: Record<string, string> = {};
            if (token) headers.Authorization = `Bearer ${token}`;
            if (session.user.id) headers["x-user-id"] = session.user.id;
            if (session.user.email) headers["x-user-email"] = session.user.email;
            if (session.user.name) headers["x-user-name"] = encodeURIComponent(session.user.name);
            return headers;
        },
    });

    try {
        const data = await endpoints.getRecentSummits(client);
        return NextResponse.json(data, { status: 200 });
    } catch (err: any) {
        console.error("Error fetching recent summits:", err?.bodyText ?? err);
        return NextResponse.json(
            { message: err?.message ?? "Upstream error" },
            { status: err?.statusCode ?? 502 }
        );
    }
};

