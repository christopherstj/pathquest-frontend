import getSessionToken from "@/auth/getSessionToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import { createApiClient } from "@pathquest/shared/api";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
    const backendUrl = getBackendUrl();

    const token = await getSessionToken().catch((err) => {
        console.error("[landing/popular-challenges] Failed to get Google ID token:", err);
        return null;
    });

    const url = new URL(req.url);
    const limit = url.searchParams.get("limit") ?? "5";

    const client = createApiClient({
        baseUrl: backendUrl,
        getAuthHeaders: async () => {
            const headers: Record<string, string> = {};
            if (token) headers.Authorization = `Bearer ${token}`;
            return headers;
        },
    });

    try {
        const data = await client.fetchJson(`/challenges/popular?limit=${encodeURIComponent(limit)}`);
        return NextResponse.json(data, { status: 200 });
    } catch (err: any) {
        console.error("Error fetching popular challenges:", err?.bodyText ?? err);
        return NextResponse.json(
            { message: err?.message ?? "Upstream error" },
            { status: err?.statusCode ?? 502 }
        );
    }
};


