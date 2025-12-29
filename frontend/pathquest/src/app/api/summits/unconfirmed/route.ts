import { authOptions } from "@/auth/authOptions";
import getSessionToken from "@/auth/getSessionToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import { createApiClient } from "@pathquest/shared/api";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        return NextResponse.json(
            { message: "Unauthorized" },
            { status: 401 }
        );
    }

    const backendUrl = getBackendUrl();
    const token = await getSessionToken().catch((err) => {
        console.error("[unconfirmed-summits] Failed to get Google ID token:", err);
        return null;
    });

    const { searchParams } = new URL(req.url);
    const limit = searchParams.get("limit");
    const queryString = limit ? `?limit=${limit}` : "";

    const client = createApiClient({
        baseUrl: backendUrl,
        getAuthHeaders: async () => {
            const headers: Record<string, string> = {};
            if (token) headers.Authorization = `Bearer ${token}`;
            return headers;
        },
    });

    try {
        const data = await client.fetchJson(`/peaks/summits/unconfirmed${queryString}`);
        return NextResponse.json(data, { status: 200 });
    } catch (err: any) {
        console.error("Error fetching unconfirmed summits:", err?.bodyText ?? err);
        return NextResponse.json(
            { message: err?.message ?? "Upstream error" },
            { status: err?.statusCode ?? 502 }
        );
    }
};

