import getSessionToken from "@/auth/getSessionToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import { createApiClient } from "@pathquest/shared/api";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) => {
    const { id: peakId } = await params;
    const backendUrl = getBackendUrl();

    const token = await getSessionToken().catch((err) => {
        console.error("[peaks/public-summits] Failed to get Google ID token:", err);
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
        const data = await client.fetchJson(`/peaks/${peakId}/public-summits${queryString ? `?${queryString}` : ""}`);
        return NextResponse.json(data, { status: 200 });
    } catch (err: any) {
        console.error("Error fetching public summits:", err?.bodyText ?? err);
        return NextResponse.json(
            { message: err?.message ?? "Upstream error" },
            { status: err?.statusCode ?? 502 }
        );
    }
};

