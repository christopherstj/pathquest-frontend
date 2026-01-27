import { authOptions } from "@/auth/authOptions";
import getSessionToken from "@/auth/getSessionToken";
import getBackendUrl from "@/helpers/getBackendUrl";
import { createApiClient, endpoints } from "@pathquest/shared/api";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
    const backendUrl = getBackendUrl();
    
    // Get session to pass user identity to backend
    const session = await getServerSession(authOptions);
    // Always generate token for Google IAM authentication (required at infrastructure level)
    const token = await getSessionToken().catch((err) => {
        console.error("[search] Failed to get Google ID token:", err);
        return null;
    });
    
    if (!token) {
        console.warn("[search] No token available - request may fail Google IAM auth");
    }

    const client = createApiClient({
        baseUrl: backendUrl,
        getAuthHeaders: async () => {
            const headers: Record<string, string> = {};
            if (token) headers.Authorization = `Bearer ${token}`;
            return headers;
        },
    });

    try {
        // Extract query params
        const q = req.nextUrl.searchParams.get("q");
        if (!q) {
            return NextResponse.json(
                { message: "Query parameter 'q' is required" },
                { status: 400 }
            );
        }

        const params: Parameters<typeof endpoints.unifiedSearch>[1] = {
            query: q,
        };

        // Optional params
        const lat = req.nextUrl.searchParams.get("lat");
        const lng = req.nextUrl.searchParams.get("lng");
        if (lat && lng) {
            params.lat = parseFloat(lat);
            params.lng = parseFloat(lng);
        }

        const bounds = req.nextUrl.searchParams.get("bounds");
        if (bounds) {
            const boundsArr = bounds.split(",").map(parseFloat);
            if (boundsArr.length === 4 && boundsArr.every(n => !isNaN(n))) {
                params.bounds = boundsArr as [number, number, number, number];
            }
        }

        const limit = req.nextUrl.searchParams.get("limit");
        if (limit) {
            params.limit = parseInt(limit, 10);
        }

        const includePeaks = req.nextUrl.searchParams.get("includePeaks");
        if (includePeaks !== null) {
            params.includePeaks = includePeaks === "true";
        }

        const includeChallenges = req.nextUrl.searchParams.get("includeChallenges");
        if (includeChallenges !== null) {
            params.includeChallenges = includeChallenges === "true";
        }

        const data = await endpoints.unifiedSearch(client, params);
        return NextResponse.json(data, { status: 200 });
    } catch (err: any) {
        console.error("[search]", err?.bodyText ?? err);
        return NextResponse.json(
            { message: err?.message ?? "Upstream error" },
            { status: err?.statusCode ?? 502 }
        );
    }
};
