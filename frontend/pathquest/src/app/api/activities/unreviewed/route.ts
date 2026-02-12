import { authOptions } from "@/auth/authOptions";
import getSessionToken from "@/auth/getSessionToken";
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
    const { searchParams } = new URL(req.url);
    const limit = searchParams.get("limit");
    
    // Always generate token for Google IAM authentication (required at infrastructure level)
    const token = await getSessionToken().catch((err) => {
        console.error("[unreviewed-activities] Failed to get Google ID token:", err);
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
        const data = await endpoints.getUnreviewedActivities(
            client, 
            limit ? { limit: parseInt(limit) } : undefined
        );
        return NextResponse.json(data, { status: 200 });
    } catch (err: any) {
        console.error("Error fetching unreviewed activities:", err?.bodyText ?? err);
        return NextResponse.json(
            { message: err?.message ?? "Upstream error" },
            { status: err?.statusCode ?? 502 }
        );
    }
};
