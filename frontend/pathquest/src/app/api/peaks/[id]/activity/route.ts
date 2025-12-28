import { authOptions } from "@/auth/authOptions";
import getGoogleIdToken from "@/auth/getGoogleIdToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import { createApiClient } from "@pathquest/shared/api";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) => {
    const { id } = await params;
    const backendUrl = getBackendUrl();

    // Get session to pass user identity to backend (even though this is a public route)
    const session = await getServerSession(authOptions);
    // Always generate token for Google IAM authentication (required at infrastructure level)
    const token = await getGoogleIdToken().catch((err) => {
        console.error("[peaks/[id]/activity] Failed to get Google ID token:", err);
        return null;
    });

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
        const data = await client.fetchJson(`/peaks/${id}/activity`);
        return NextResponse.json(data, { status: 200 });
    } catch (err: any) {
        console.error("Error fetching peak activity:", err?.bodyText ?? err);
        return NextResponse.json(
            { message: err?.message ?? "Upstream error" },
            { status: err?.statusCode ?? 502 }
        );
    }
};

